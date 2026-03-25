"use client";

import { useState } from "react";
import { dictionaries } from "@/lib/i18n";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

interface ResultDetail {
  question_id: number;
  correct: boolean;
  your_answer: number;
  right_answer: number;
  explanation: string;
}

interface SubmitResult {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  attempts_remaining: number;
  results: ResultDetail[];
}

interface QuizResultProps {
  result: SubmitResult;
  questions: QuizQuestion[];
  quizId: string;
  attempts: number;
  maxAttempts: number;
  locale: "en" | "fr";
}

export default function QuizResult({
  result,
  questions,
  quizId,
  attempts,
  maxAttempts,
  locale,
}: QuizResultProps) {
  const t = dictionaries[locale];
  const [regenerating, setRegenerating] = useState(false);

  const scoreColor = result.passed ? "text-green-400" : "text-red-400";
  const ringColor = result.passed ? "stroke-green-500" : "stroke-red-500";
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (result.score / 100) * circumference;

  async function handleRetry() {
    setRegenerating(true);
    try {
      const res = await fetch(`/api/quiz/${quizId}/regenerate`);
      if (res.ok) {
        window.location.reload();
      }
    } catch {
      setRegenerating(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Score circle */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#374151"
              strokeWidth="6"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              className={ringColor}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${scoreColor}`}>
              {result.score}%
            </span>
          </div>
        </div>

        <h2 className={`text-2xl font-bold mb-2 ${scoreColor}`}>
          {result.passed
            ? t.result.passed
            : result.attempts_remaining > 0
            ? t.result.notYet
            : t.result.failed}
        </h2>

        <p className="text-gray-400">
          {result.correct}/{result.total} {t.result.correct}
        </p>

        {result.passed && (
          <p className="text-green-300 text-sm mt-2">
            {t.result.mergeUnlocked}
          </p>
        )}

        {!result.passed && result.attempts_remaining > 0 && (
          <div className="text-center mt-4">
            <p className="text-yellow-300 text-sm mb-3">
              {result.attempts_remaining} {t.result.retryLeft}
            </p>
            <button
              onClick={handleRetry}
              disabled={regenerating}
              className="px-5 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {regenerating ? t.result.generating : t.result.retry}
            </button>
          </div>
        )}

        {!result.passed && result.attempts_remaining === 0 && (
          <p className="text-red-300 text-sm mt-2">
            {t.result.allUsed}
          </p>
        )}
      </div>

      {/* Detailed results */}
      <h3 className="text-lg font-semibold text-white mb-4">
        {t.result.details}
      </h3>
      <div className="space-y-4">
        {result.results.map((r, i) => {
          const q = questions[i];
          return (
            <div
              key={r.question_id}
              className={`border rounded-lg p-4 ${
                r.correct
                  ? "border-green-800 bg-green-900/20"
                  : "border-red-800 bg-red-900/20"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`text-lg ${
                    r.correct ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {r.correct ? "✓" : "✗"}
                </span>
                <div className="flex-1">
                  <p className="text-white text-sm mb-2">{q.question}</p>
                  {!r.correct && (
                    <p className="text-sm text-gray-400 mb-1">
                      {t.result.yourAnswer}{" "}
                      <span className="text-red-300">
                        {q.options[r.your_answer]}
                      </span>
                    </p>
                  )}
                  <p className="text-sm text-gray-400 mb-2">
                    {t.result.correctAnswer}{" "}
                    <span className="text-green-300">
                      {q.options[r.right_answer]}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 italic">
                    {r.explanation}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
