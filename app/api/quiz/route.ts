import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { generateQuizQuestions, DEFAULT_QUIZ_CONFIG } from "@/lib/claude";
import type { QuizConfig } from "@/lib/claude";
import { updateCommitStatus, postPRComment, getGitHubToken } from "@/lib/github";
import { prisma } from "@/lib/db";
import { encrypt, decrypt } from "@/lib/encryption";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  // Auth
  const apiKey = request.headers.get("X-API-Key");
  const team = await validateApiKey(apiKey);
  if (!team) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // Rate limiting: 10 requests/hour per API key (Redis if available, DB fallback)
  const { allowed, remaining } = await checkRateLimit(team.apiKey, 10, 3600);
  if (!allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 10 quizzes per hour." },
      { status: 429, headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  }

  // Parse body
  let body: {
    repo: string;
    pr_number: number;
    head_sha: string;
    pr_title: string;
    diff: string;
    files_changed: string[];
    callback_token: string;
    anthropic_api_key?: string;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { repo, pr_number, head_sha, pr_title, diff, files_changed, callback_token, anthropic_api_key } = body;

  if (!repo || !pr_number || !head_sha || !pr_title || !callback_token) {
    return NextResponse.json(
      { error: "Missing required fields: repo, pr_number, head_sha, pr_title, callback_token" },
      { status: 400 }
    );
  }

  // Anthropic key: from request body (Action secret) or fallback to team's stored key (decrypt)
  const storedKey = team.anthropicApiKey ? decrypt(team.anthropicApiKey) : null;
  const anthropicKey = anthropic_api_key || storedKey;
  if (!anthropicKey) {
    return NextResponse.json(
      { error: "No Anthropic API key provided. Add ANTHROPIC_API_KEY as a secret in your repo." },
      { status: 400 }
    );
  }

  // Store/update the key on the team for regeneration later (encrypted)
  if (anthropic_api_key && anthropic_api_key !== storedKey) {
    await prisma.team.update({
      where: { id: team.id },
      data: { anthropicApiKey: encrypt(anthropic_api_key) },
    }).catch(() => {});
  }

  // Skip if no meaningful diff — post comment from admin account
  if (!diff || diff.length < 50) {
    const ghToken = await getGitHubToken(team.id, callback_token);
    try {
      await postPRComment(
        repo,
        pr_number,
        ghToken,
        "## sphinx-ci — No quiz needed\n\nThis PR doesn't contain enough code changes to generate a quiz.\n\n✅ No quiz required — merge is not blocked."
      );
      await updateCommitStatus(repo, head_sha, ghToken, "success", "No code changes — quiz skipped");
    } catch (e) {
      console.error("Failed to post skip comment:", e);
    }
    return NextResponse.json({ quiz_url: null, skipped: true });
  }

  // Load team config
  const config: QuizConfig = {
    ...DEFAULT_QUIZ_CONFIG,
    ...(team.quizConfig as Partial<QuizConfig> || {}),
  };

  // Generate questions via Claude
  let questions;
  try {
    questions = await generateQuizQuestions(
      pr_title,
      files_changed || [],
      diff.slice(0, 12000),
      anthropicKey,
      config
    );
  } catch (error) {
    console.error("Claude generation failed:", error);
    const ghToken = await getGitHubToken(team.id, callback_token);
    try {
      await postPRComment(
        repo,
        pr_number,
        ghToken,
        "## ⚠️ sphinx-ci — Quiz generation failed\n\nClaude could not generate the quiz. This is temporary — try again by commenting `@sphinx-ci`.\n\nYour PR is **not blocked**."
      );
      await updateCommitStatus(repo, head_sha, ghToken, "success", "Quiz generation failed — not blocking");
    } catch (e) {
      console.error("Failed to post error comment:", e);
    }
    return NextResponse.json(
      { error: "Quiz generation failed. PR is not blocked." },
      { status: 503 }
    );
  }

  // Save quiz
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const quiz = await prisma.quiz.create({
    data: {
      teamId: team.id,
      repo,
      prNumber: pr_number,
      headSha: head_sha,
      prTitle: pr_title,
      diff: diff.slice(0, 12000),
      questions: JSON.parse(JSON.stringify(questions)),
      callbackToken: callback_token,
      maxAttempts: config.maxAttempts,
      expiresAt,
    },
  });

  // Post pending status on GitHub (use OAuth token for durability)
  const ghToken = await getGitHubToken(team.id, callback_token);
  try {
    await updateCommitStatus(
      repo,
      head_sha,
      ghToken,
      "pending",
      config.language === "en"
        ? "Quiz pending — complete it to unlock merge"
        : "Quiz en attente — completez-le pour debloquer le merge"
    );
  } catch (error) {
    console.error("Failed to post GitHub status:", error);
  }

  // Post quiz link as PR comment (from admin's account, not github-actions)
  const quizUrl = `${process.env.NEXT_PUBLIC_APP_URL}/q/${quiz.id}`;
  try {
    await postPRComment(
      repo,
      pr_number,
      ghToken,
      config.language === "en"
        ? `## Code comprehension quiz required\n\nComplete the quiz to unlock the merge.\n\n[${quizUrl}](${quizUrl})\n\n*The Sphinx awaits your answer.*`
        : `## Quiz de compréhension requis\n\nComplète le quiz pour débloquer le merge.\n\n[${quizUrl}](${quizUrl})\n\n*Le Sphinx attend ta réponse.*`
    );
  } catch (error) {
    console.error("Failed to post quiz comment:", error);
  }

  return NextResponse.json(
    {
      quiz_id: quiz.id,
      quiz_url: quizUrl,
      expires_at: expiresAt.toISOString(),
    },
    { status: 201 }
  );
}
