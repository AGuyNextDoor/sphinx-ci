import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateCommitStatus, postPRComment, getGitHubToken } from "@/lib/github";
import { auth } from "@/lib/auth-options";
import { DEFAULT_QUIZ_CONFIG } from "@/lib/claude";
import type { QuizConfig } from "@/lib/claude";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const quiz = await prisma.quiz.findUnique({
    where: { id },
    include: { team: { select: { id: true, quizConfig: true } } },
  });
  if (!quiz) {
    return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  }

  if (quiz.expiresAt < new Date()) {
    await prisma.quiz.update({
      where: { id },
      data: { status: "EXPIRED" },
    });
    return NextResponse.json({ error: "Quiz has expired" }, { status: 410 });
  }

  if (quiz.status === "PASSED") {
    return NextResponse.json(
      { error: "Quiz already passed", score: quiz.score },
      { status: 400 }
    );
  }

  if (quiz.status === "FAILED") {
    return NextResponse.json(
      { error: "Quiz failed — max attempts reached", score: quiz.score },
      { status: 400 }
    );
  }

  const config: QuizConfig = {
    ...DEFAULT_QUIZ_CONFIG,
    ...(quiz.team.quizConfig as Partial<QuizConfig> || {}),
  };

  const questions = quiz.questions as unknown as QuizQuestion[];
  const numQuestions = questions.length;

  let body: { answers: number[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { answers } = body;
  if (!Array.isArray(answers) || answers.length !== numQuestions) {
    return NextResponse.json(
      { error: `answers must be an array of ${numQuestions} numbers` },
      { status: 400 }
    );
  }

  let correctCount = 0;
  const results = questions.map((q, i) => {
    const isCorrect = answers[i] === q.correct;
    if (isCorrect) correctCount++;
    return {
      question_id: q.id,
      correct: isCorrect,
      your_answer: answers[i],
      right_answer: q.correct,
      explanation: q.explanation,
    };
  });

  const score = Math.round((correctCount / numQuestions) * 100);
  const newAttempts = quiz.attempts + 1;

  let newStatus: "PENDING" | "PASSED" | "FAILED" = "PENDING";
  if (score >= config.passingScore) {
    newStatus = "PASSED";
  } else if (newAttempts >= quiz.maxAttempts) {
    newStatus = "FAILED";
  }

  await prisma.quiz.update({
    where: { id },
    data: {
      score,
      attempts: newAttempts,
      status: newStatus,
      submittedAt: new Date(),
    },
  });

  // Use the admin's token for status checks (needs repo write access)
  const adminToken = await getGitHubToken(quiz.team.id, quiz.callbackToken);

  // Use the quiz taker's token for PR comments (shows their profile)
  let commentToken = adminToken;
  const session = await auth();
  if (session?.user?.id) {
    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" },
      select: { access_token: true },
    });
    if (account?.access_token) {
      commentToken = account.access_token;
    }
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  const quizUrl = `${appUrl}/q/${quiz.id}`;

  // Update GitHub status (admin token) + post comment (quiz taker's token)
  try {
    if (newStatus === "PASSED") {
      await updateCommitStatus(
        quiz.repo,
        quiz.headSha,
        adminToken,
        "success",
        config.language === "en"
          ? `Quiz passed — score ${score}/100`
          : `Quiz réussi — score ${score}/100`,
        quizUrl
      );
      await postPRComment(
        quiz.repo,
        quiz.prNumber,
        commentToken,
        config.language === "en"
          ? `## Quiz passed ✅\n\nScore: **${score}/100** (${correctCount}/${numQuestions})\n\nMerge is unlocked.`
          : `## Quiz réussi ✅\n\nScore : **${score}/100** (${correctCount}/${numQuestions})\n\nLe merge est débloqué.`
      );
    } else if (newStatus === "FAILED") {
      await updateCommitStatus(
        quiz.repo,
        quiz.headSha,
        adminToken,
        "failure",
        config.language === "en"
          ? `Quiz failed — score ${score}/100 (max attempts reached)`
          : `Quiz échoué — score ${score}/100 (max tentatives atteint)`,
        quizUrl
      );
      await postPRComment(
        quiz.repo,
        quiz.prNumber,
        commentToken,
        config.language === "en"
          ? `## Quiz failed ❌\n\nScore: **${score}/100** (${correctCount}/${numQuestions})\n\nAll attempts used. Merge remains blocked.`
          : `## Quiz échoué ❌\n\nScore : **${score}/100** (${correctCount}/${numQuestions})\n\nToutes les tentatives épuisées. Le merge reste bloqué.`
      );
    } else {
      // Still pending — post comment about retry
      const remaining = quiz.maxAttempts - newAttempts;
      await postPRComment(
        quiz.repo,
        quiz.prNumber,
        commentToken,
        config.language === "en"
          ? `## Quiz not passed yet\n\nScore: **${score}/100** (${correctCount}/${numQuestions})\n\n${remaining} attempt${remaining > 1 ? "s" : ""} remaining. [Retry →](${quizUrl})`
          : `## Quiz pas encore réussi\n\nScore : **${score}/100** (${correctCount}/${numQuestions})\n\n${remaining} tentative${remaining > 1 ? "s" : ""} restante${remaining > 1 ? "s" : ""}. [Réessayer →](${quizUrl})`
      );
    }
  } catch (error) {
    console.error("Failed to update GitHub:", error);
  }

  return NextResponse.json({
    score,
    passed: newStatus === "PASSED",
    correct: correctCount,
    total: numQuestions,
    attempts_remaining:
      newStatus === "PENDING" ? quiz.maxAttempts - newAttempts : 0,
    results,
  });
}
