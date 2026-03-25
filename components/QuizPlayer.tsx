"use client";

import { useState } from "react";
import QuizResult from "./QuizResult";
import { dictionaries } from "@/lib/i18n";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

interface SubmitResult {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  attempts_remaining: number;
  results: {
    question_id: number;
    correct: boolean;
    your_answer: number;
    right_answer: number;
    explanation: string;
  }[];
}

interface QuizPlayerProps {
  quizId: string;
  questions: QuizQuestion[];
  prTitle: string;
  repo: string;
  attempts: number;
  maxAttempts: number;
  locale: "en" | "fr";
}

export default function QuizPlayer({
  quizId,
  questions,
  prTitle,
  repo,
  attempts,
  maxAttempts,
  locale,
}: QuizPlayerProps) {
  const t = dictionaries[locale];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const answeredCount = answers.filter((a) => a !== null).length;
  const allAnswered = answeredCount === questions.length;

  function selectOption(index: number) {
    if (confirmed) return;
    setSelectedOption(index);
  }

  function confirmAnswer() {
    if (selectedOption === null) return;
    const newAnswers = [...answers];
    newAnswers[currentIndex] = selectedOption;
    setAnswers(newAnswers);
    setConfirmed(true);
  }

  function goToNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(answers[currentIndex + 1]);
      setConfirmed(answers[currentIndex + 1] !== null);
    }
  }

  function goToPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(answers[currentIndex - 1]);
      setConfirmed(answers[currentIndex - 1] !== null);
    }
  }

  async function submitQuiz() {
    if (!allAnswered) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/quiz/${quizId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      const data: SubmitResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <QuizResult
        result={result}
        questions={questions}
        quizId={quizId}
        attempts={attempts + 1}
        maxAttempts={maxAttempts}
        locale={locale}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-400 mb-1">{repo}</p>
        <h1 className="text-xl font-bold text-white mb-2">{prTitle}</h1>
        <p className="text-sm text-gray-400">
          {t.player.attempt} {attempts + 1}/{maxAttempts}
        </p>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1 mb-8">
        {questions.map((_, i) => (
          <div
            key={i}
            className="h-2 flex-1 rounded-full transition-colors cursor-pointer"
            style={{
              background: i === currentIndex
                ? "#c9a84c"
                : answers[i] !== null
                ? "rgba(201,168,76,0.4)"
                : "#252036",
            }}
            onClick={() => {
              setCurrentIndex(i);
              setSelectedOption(answers[i]);
              setConfirmed(answers[i] !== null);
            }}
          />
        ))}
      </div>

      {/* Question */}
      <div className="rounded-lg p-6 mb-6 border" style={{ background: "#1a1628", borderColor: "#252036" }} role="region" aria-label={`${t.player.question} ${currentIndex + 1}`}>
        <p className="text-sm mb-3" style={{ color: "#b0a8c4" }} aria-live="polite">
          {t.player.question} {currentIndex + 1}/{questions.length}
        </p>
        <p className="text-lg text-white mb-6" id={`question-${currentIndex}`}>{currentQuestion.question}</p>

        <div className="space-y-3" role="radiogroup" aria-labelledby={`question-${currentIndex}`}>
          {currentQuestion.options.map((option, i) => (
            <button
              key={i}
              onClick={() => selectOption(i)}
              disabled={confirmed}
              role="radio"
              aria-checked={selectedOption === i}
              className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                confirmed && selectedOption === i
                  ? "text-white"
                  : selectedOption === i
                  ? "text-white"
                  : "text-gray-300"
              } ${confirmed ? "cursor-default" : "cursor-pointer"}`}
              style={{
                borderColor: confirmed && selectedOption === i
                  ? "#c9a84c"
                  : selectedOption === i
                  ? "rgba(201,168,76,0.5)"
                  : "#252036",
                background: confirmed && selectedOption === i
                  ? "rgba(201,168,76,0.15)"
                  : selectedOption === i
                  ? "rgba(201,168,76,0.05)"
                  : "#0f0c1a",
              }}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrev}
          disabled={currentIndex === 0}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {t.player.prev}
        </button>

        <div className="flex gap-3">
          {!confirmed && selectedOption !== null && (
            <button
              onClick={confirmAnswer}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "#c9a84c", color: "#0f0c1a" }}
            >
              {t.player.confirm}
            </button>
          )}

          {confirmed && currentIndex < questions.length - 1 && (
            <button
              onClick={goToNext}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "#c9a84c", color: "#0f0c1a" }}
            >
              {t.player.next}
            </button>
          )}

          {allAnswered && (
            <button
              onClick={submitQuiz}
              disabled={submitting}
              className="px-5 py-2 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
              style={{ background: "#c9a84c", color: "#0f0c1a" }}
            >
              {submitting ? t.player.submitting : t.player.submit}
            </button>
          )}
        </div>

        <button
          onClick={goToNext}
          disabled={currentIndex === questions.length - 1}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {t.player.next}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
          {error}
        </div>
      )}

      <p className="text-center text-sm text-gray-400 mt-6">
        {answeredCount}/{questions.length} {t.player.confirmed}
      </p>
    </div>
  );
}
