import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import QuizPlayer from "@/components/QuizPlayer";

export const dynamic = "force-dynamic";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

// Strip `correct` and `explanation` before sending to client
function sanitizeQuestions(questions: QuizQuestion[]) {
  return questions.map(({ id, question, options }) => ({
    id,
    question,
    options,
  }));
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const quiz = await prisma.quiz.findUnique({ where: { id } });

  if (!quiz) {
    notFound();
  }

  const questions = quiz.questions as unknown as QuizQuestion[];
  const isExpired = quiz.expiresAt < new Date();

  // Expired
  if (isExpired || quiz.status === "EXPIRED") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-white mb-2">Quiz expiré</h1>
          <p className="text-gray-400">
            Ce quiz a expiré. Poussez un nouveau commit pour en générer un
            nouveau.
          </p>
        </div>
      </div>
    );
  }

  // Already passed
  if (quiz.status === "PASSED") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-400 mb-2">
            Quiz réussi — {quiz.score}/100
          </h1>
          <p className="text-gray-400">
            Le merge de cette PR est débloqué.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {quiz.repo} — PR #{quiz.prNumber}
          </p>
        </div>
      </div>
    );
  }

  // Failed definitively
  if (quiz.status === "FAILED") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">
            Quiz échoué — {quiz.score}/100
          </h1>
          <p className="text-gray-400">
            Toutes les tentatives ont été utilisées. Le merge reste bloqué.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {quiz.repo} — PR #{quiz.prNumber}
          </p>
        </div>
      </div>
    );
  }

  // Pending — show interactive quiz
  return (
    <div className="min-h-screen bg-gray-950 p-4 md:p-8">
      <QuizPlayer
        quizId={quiz.id}
        questions={sanitizeQuestions(questions)}
        prTitle={quiz.prTitle}
        repo={quiz.repo}
        attempts={quiz.attempts}
        maxAttempts={quiz.maxAttempts}
      />
    </div>
  );
}
