import { NextRequest, NextResponse } from "next/server";
import { validateApiKey } from "@/lib/auth";
import { generateQuizQuestions, DEFAULT_QUIZ_CONFIG } from "@/lib/claude";
import type { QuizConfig } from "@/lib/claude";
import { updateCommitStatus, getGitHubToken } from "@/lib/github";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  // Auth
  const apiKey = request.headers.get("X-API-Key");
  const team = await validateApiKey(apiKey);
  if (!team) {
    return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
  }

  // Rate limiting: 10 requests/hour per API key
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentQuizCount = await prisma.quiz.count({
    where: {
      teamId: team.id,
      createdAt: { gte: oneHourAgo },
    },
  });
  if (recentQuizCount >= 10) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 10 quizzes per hour." },
      { status: 429 }
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

  // Anthropic key: from request body (Action secret) or fallback to team's stored key
  const anthropicKey = anthropic_api_key || team.anthropicApiKey;
  if (!anthropicKey) {
    return NextResponse.json(
      { error: "No Anthropic API key provided. Add ANTHROPIC_API_KEY as a secret in your repo." },
      { status: 400 }
    );
  }

  // Store/update the key on the team for regeneration later
  if (anthropic_api_key && anthropic_api_key !== team.anthropicApiKey) {
    await prisma.team.update({
      where: { id: team.id },
      data: { anthropicApiKey: anthropic_api_key },
    }).catch(() => {});
  }

  // Skip if no meaningful diff
  if (!diff || diff.length < 50) {
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

  return NextResponse.json(
    {
      quiz_id: quiz.id,
      quiz_url: `${process.env.NEXT_PUBLIC_APP_URL}/q/${quiz.id}`,
      expires_at: expiresAt.toISOString(),
    },
    { status: 201 }
  );
}
