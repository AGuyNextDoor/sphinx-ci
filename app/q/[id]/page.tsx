import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import QuizPlayer from "@/components/QuizPlayer";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getLocale, getDictionary } from "@/lib/i18n-server";

export const dynamic = "force-dynamic";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

function sanitizeQuestions(questions: QuizQuestion[]) {
  return questions.map(({ id, question, options }) => ({
    id,
    question,
    options,
  }));
}

function QuizNav({ repo, prNumber, locale }: { repo: string; prNumber: number; locale: "en" | "fr" }) {
  return (
    <nav
      className="flex items-center justify-between px-6 py-4 border-b"
      style={{ borderColor: "#252036" }}
    >
      <Link href="/" className="flex items-center gap-2">
        <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
          <path d="M50 8L90 35V65L50 92L10 65V35L50 8Z" stroke="#c9a84c" strokeWidth="4" fill="#c9a84c" fillOpacity="0.1" />
          <circle cx="38" cy="45" r="5" fill="#c9a84c" />
          <circle cx="62" cy="45" r="5" fill="#c9a84c" />
          <path d="M35 62C35 62 42 70 50 70C58 70 65 62 65 62" stroke="#c9a84c" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <span className="text-lg font-bold" style={{ color: "#c9a84c" }}>
          sphinx-ci
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <div className="text-sm" style={{ color: "#b0a8c4" }}>
          {repo} <span style={{ color: "#8b85a0" }}>#{prNumber}</span>
        </div>
        <LanguageSwitcher locale={locale} />
      </div>
    </nav>
  );
}

export default async function QuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();
  const t = getDictionary(locale);
  const quiz = await prisma.quiz.findUnique({ where: { id } });

  if (!quiz) {
    notFound();
  }

  const questions = quiz.questions as unknown as QuizQuestion[];
  const isExpired = quiz.expiresAt < new Date();

  // Expired
  if (isExpired || quiz.status === "EXPIRED") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#0f0c1a" }}>
        <QuizNav repo={quiz.repo} prNumber={quiz.prNumber} locale={locale} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-6">&#x23F3;</div>
            <h1 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Georgia, serif" }}>
              {t.quiz.expired}
            </h1>
            <p style={{ color: "#b0a8c4" }}>
              {t.quiz.expiredDesc}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Already passed
  if (quiz.status === "PASSED") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#0f0c1a" }}>
        <QuizNav repo={quiz.repo} prNumber={quiz.prNumber} locale={locale} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-6">&#x1F3DB;</div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: "#c9a84c", fontFamily: "Georgia, serif" }}>
              {t.quiz.passed} — {t.quiz.passedScore} {quiz.score}/100
            </h1>
            <p style={{ color: "#b0a8c4" }}>
              {t.quiz.passedDesc}
            </p>
            <p className="text-sm mt-4" style={{ color: "#8b85a0" }}>
              {quiz.repo} — PR #{quiz.prNumber}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Failed definitively
  if (quiz.status === "FAILED") {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: "#0f0c1a" }}>
        <QuizNav repo={quiz.repo} prNumber={quiz.prNumber} locale={locale} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <div className="text-6xl mb-6">&#x1F480;</div>
            <h1 className="text-2xl font-bold text-red-400 mb-2" style={{ fontFamily: "Georgia, serif" }}>
              {t.quiz.failed} — {quiz.score}/100
            </h1>
            <p style={{ color: "#b0a8c4" }}>
              {t.quiz.failedDesc}
            </p>
            <p className="text-sm mt-4" style={{ color: "#8b85a0" }}>
              {quiz.repo} — PR #{quiz.prNumber}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Pending — show interactive quiz
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0f0c1a" }}>
      <QuizNav repo={quiz.repo} prNumber={quiz.prNumber} locale={locale} />
      <div className="flex-1 p-4 md:p-8">
        <QuizPlayer
          quizId={quiz.id}
          questions={sanitizeQuestions(questions)}
          prTitle={quiz.prTitle}
          repo={quiz.repo}
          attempts={quiz.attempts}
          maxAttempts={quiz.maxAttempts}
          locale={locale}
        />
      </div>
    </div>
  );
}
