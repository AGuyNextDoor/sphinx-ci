"use client";

import { useState } from "react";
import { dictionaries } from "@/lib/i18n";

const demoQuestions = [
  {
    question: "Que retourne la fonction truncate si maxLength vaut 2 et que la chaîne fait 10 caractères ?",
    options: [
      "A) Les 2 premiers caractères",
      "B) Une chaîne plus longue que maxLength",
      "C) Une chaîne vide",
      "D) Une erreur TypeError",
    ],
    correct: 1,
    explanation: "slice(0, 2-3) donne un index négatif, ce qui prend depuis la fin. Le résultat + \"...\" dépasse maxLength.",
  },
  {
    question: "Dans timeAgo, que se passe-t-il pour une date dans le futur ?",
    options: [
      "A) Elle lève une exception",
      "B) Elle retourne 'dans le futur'",
      "C) Elle retourne 'à l'instant'",
      "D) Elle retourne une valeur négative",
    ],
    correct: 2,
    explanation: "diffMs est négatif → diffMin < 1 est vrai → retourne \"à l'instant\".",
  },
  {
    question: "Combien de caractères retourne randomHex(16) ?",
    options: [
      "A) 16 caractères",
      "B) 32 caractères",
      "C) 64 caractères",
      "D) Variable selon les valeurs",
    ],
    correct: 1,
    explanation: "Chaque byte → 2 caractères hex (padStart). 16 bytes × 2 = 32 caractères.",
  },
];

export default function DemoQuiz({ locale }: { locale: "en" | "fr" }) {
  const t = dictionaries[locale];
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(demoQuestions.length).fill(null)
  );

  function handleSelect(questionIndex: number, optionIndex: number) {
    if (answers[questionIndex] !== null) return;
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  }

  const answeredCount = answers.filter((a) => a !== null).length;
  const correctCount = answers.filter(
    (a, i) => a === demoQuestions[i].correct
  ).length;

  return (
    <div>
      <div className="space-y-4">
        {demoQuestions.map((q, qi) => {
          const selected = answers[qi];
          const answered = selected !== null;

          return (
            <div
              key={qi}
              className="rounded-xl p-5 border"
              style={{ background: "#0f0c1a", borderColor: "#252036" }}
            >
              <p className="text-xs mb-2" style={{ color: "#8b85a0" }}>
                Question {qi + 1}/{demoQuestions.length}
              </p>
              <p className="text-white mb-4">{q.question}</p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isCorrect = oi === q.correct;
                  const isSelected = selected === oi;
                  const isWrong = answered && isSelected && !isCorrect;

                  let borderColor = "#252036";
                  let bgColor = "transparent";
                  let textColor = "#b0a8c4";

                  if (answered) {
                    if (isCorrect) {
                      borderColor = "rgba(201,168,76,0.5)";
                      bgColor = "rgba(201,168,76,0.08)";
                      textColor = "#c9a84c";
                    } else if (isWrong) {
                      borderColor = "rgba(239,68,68,0.4)";
                      bgColor = "rgba(239,68,68,0.08)";
                      textColor = "#f87171";
                    }
                  } else if (isSelected) {
                    borderColor = "rgba(201,168,76,0.3)";
                    bgColor = "rgba(201,168,76,0.05)";
                  }

                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(qi, oi)}
                      disabled={answered}
                      className="w-full text-left px-4 py-2.5 rounded-lg border text-sm transition-all"
                      style={{
                        borderColor,
                        background: bgColor,
                        color: textColor,
                        cursor: answered ? "default" : "pointer",
                      }}
                    >
                      {opt}
                      {answered && isCorrect && (
                        <span className="ml-2 text-xs" style={{ color: "#c9a84c" }}>
                          ✓
                        </span>
                      )}
                      {isWrong && (
                        <span className="ml-2 text-xs" style={{ color: "#f87171" }}>
                          ✗
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <p
                  className="text-xs mt-3 italic"
                  style={{ color: "#8b85a0" }}
                >
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {answeredCount === demoQuestions.length && (
        <div
          className="mt-6 rounded-xl p-5 border text-center"
          style={{ background: "#0f0c1a", borderColor: "rgba(201,168,76,0.3)" }}
        >
          <p className="text-lg font-semibold text-white">
            {correctCount}/{demoQuestions.length} {t.landing.demoCorrect}
          </p>
          <p className="text-sm mt-1" style={{ color: "#b0a8c4" }}>
            {t.landing.demoNote}
          </p>
        </div>
      )}

      {answeredCount < demoQuestions.length && (
        <p className="text-center text-sm mt-6" style={{ color: "#8b85a0" }}>
          {t.landing.demoClick} — {answeredCount}/{demoQuestions.length} {t.landing.demoAnswered}
        </p>
      )}
    </div>
  );
}
