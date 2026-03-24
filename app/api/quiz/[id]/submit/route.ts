import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateCommitStatus } from "@/lib/github";

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

  const quiz = await prisma.quiz.findUnique({ where: { id } });
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

  let body: { answers: number[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { answers } = body;
  if (!Array.isArray(answers) || answers.length !== 10) {
    return NextResponse.json(
      { error: "answers must be an array of 10 numbers" },
      { status: 400 }
    );
  }

  const questions = quiz.questions as unknown as QuizQuestion[];
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

  const score = Math.round((correctCount / 10) * 100);
  const newAttempts = quiz.attempts + 1;

  let newStatus: "PENDING" | "PASSED" | "FAILED" = "PENDING";
  if (score >= 70) {
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

  // Update GitHub status
  try {
    if (newStatus === "PASSED") {
      await updateCommitStatus(
        quiz.repo,
        quiz.headSha,
        quiz.callbackToken,
        "success",
        `Quiz réussi — score ${score}/100`
      );
    } else if (newStatus === "FAILED") {
      await updateCommitStatus(
        quiz.repo,
        quiz.headSha,
        quiz.callbackToken,
        "failure",
        `Quiz échoué — score ${score}/100 (max tentatives atteint)`
      );
    }
  } catch (error) {
    console.error("Failed to update GitHub status:", error);
  }

  return NextResponse.json({
    score,
    passed: newStatus === "PASSED",
    correct: correctCount,
    total: 10,
    attempts_remaining:
      newStatus === "PENDING" ? quiz.maxAttempts - newAttempts : 0,
    results,
  });
}
