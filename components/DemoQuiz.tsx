"use client";

import { useState } from "react";
import { dictionaries } from "@/lib/i18n";

const demoQuestions = {
  en: [
    {
      question: "In this PR, the new handlePayment() function catches errors but doesn't re-throw them. What's the impact?",
      options: [
        "A) The error is automatically logged by the runtime",
        "B) The transaction is rolled back automatically",
        "C) Payment failures are silently swallowed — the caller never knows it failed",
        "D) The function works correctly in all cases",
      ],
      correct: 2,
      explanation: "The catch block logs the error but doesn't re-throw or return a failure status, so the calling code assumes success.",
    },
    {
      question: "The diff adds a new API endpoint without any authentication middleware. What's the risk?",
      options: [
        "A) The middleware is inherited from the parent router",
        "B) No risk — internal APIs don't need auth",
        "C) The endpoint will return 500 errors",
        "D) Unauthorized users can access the endpoint and its data",
      ],
      correct: 3,
      explanation: "Unlike other endpoints in this file, the new route doesn't use the authMiddleware — anyone can call it.",
    },
    {
      question: "The PR changes the default value of maxRetries from 3 to 0. What happens to existing users?",
      options: [
        "A) All existing users lose retry behavior immediately",
        "B) Only new users are affected",
        "C) The migration handles the transition",
        "D) Nothing — existing configs override the default",
      ],
      correct: 0,
      explanation: "Users who relied on the default (never explicitly set maxRetries) will now have 0 retries after deployment.",
    },
  ],
  fr: [
    {
      question: "Dans cette PR, la nouvelle fonction handlePayment() attrape les erreurs sans les relancer. Quel est l'impact ?",
      options: [
        "A) L'erreur est automatiquement loggée par le runtime",
        "B) La transaction est rollback automatiquement",
        "C) Les échecs de paiement sont ignorés silencieusement — l'appelant ne sait jamais que ça a échoué",
        "D) La fonction marche correctement dans tous les cas",
      ],
      correct: 2,
      explanation: "Le catch log l'erreur mais ne la relance pas et ne retourne pas de statut d'échec, donc le code appelant croit que tout s'est bien passé.",
    },
    {
      question: "Le diff ajoute un nouvel endpoint API sans middleware d'authentification. Quel est le risque ?",
      options: [
        "A) Le middleware est hérité du routeur parent",
        "B) Aucun risque — les APIs internes n'ont pas besoin d'auth",
        "C) L'endpoint retournera des erreurs 500",
        "D) Des utilisateurs non autorisés peuvent accéder à l'endpoint et ses données",
      ],
      correct: 3,
      explanation: "Contrairement aux autres endpoints du fichier, la nouvelle route n'utilise pas authMiddleware — n'importe qui peut l'appeler.",
    },
    {
      question: "La PR change la valeur par défaut de maxRetries de 3 à 0. Que se passe-t-il pour les utilisateurs existants ?",
      options: [
        "A) Tous les utilisateurs existants perdent le comportement de retry immédiatement",
        "B) Seuls les nouveaux utilisateurs sont affectés",
        "C) La migration gère la transition",
        "D) Rien — les configs existantes écrasent la valeur par défaut",
      ],
      correct: 0,
      explanation: "Les utilisateurs qui se reposaient sur le défaut (n'ont jamais explicitement défini maxRetries) auront 0 retries après le déploiement.",
    },
  ],
};

export default function DemoQuiz({ locale }: { locale: "en" | "fr" }) {
  const t = dictionaries[locale];
  const questions = demoQuestions[locale];
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );

  function handleSelect(questionIndex: number, optionIndex: number) {
    if (answers[questionIndex] !== null) return;
    const newAnswers = [...answers];
    newAnswers[questionIndex] = optionIndex;
    setAnswers(newAnswers);
  }

  const answeredCount = answers.filter((a) => a !== null).length;
  const correctCount = answers.filter(
    (a, i) => a === questions[i].correct
  ).length;

  return (
    <div>
      <div className="space-y-4">
        {questions.map((q, qi) => {
          const selected = answers[qi];
          const answered = selected !== null;

          return (
            <div
              key={qi}
              className="rounded-xl p-5 border"
              style={{ background: "#0f0c1a", borderColor: "#252036" }}
              role="region"
              aria-label={`Question ${qi + 1}`}
            >
              <p className="text-xs mb-2" style={{ color: "#8b85a0" }}>
                Question {qi + 1}/{questions.length}
              </p>
              <p className="text-white mb-4" id={`demo-q-${qi}`}>{q.question}</p>
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
                        <span className="ml-2 text-xs" style={{ color: "#c9a84c" }}>✓</span>
                      )}
                      {isWrong && (
                        <span className="ml-2 text-xs" style={{ color: "#f87171" }}>✗</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {answered && (
                <p className="text-xs mt-3 italic" style={{ color: "#8b85a0" }}>
                  {q.explanation}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {answeredCount === questions.length && (
        <div
          className="mt-6 rounded-xl p-5 border text-center"
          style={{ background: "#0f0c1a", borderColor: "rgba(201,168,76,0.3)" }}
        >
          <p className="text-lg font-semibold text-white">
            {correctCount}/{questions.length} {t.landing.demoCorrect}
          </p>
          <p className="text-sm mt-1" style={{ color: "#b0a8c4" }}>
            {t.landing.demoNote}
          </p>
        </div>
      )}

      {answeredCount < questions.length && (
        <p className="text-center text-sm mt-6" style={{ color: "#8b85a0" }}>
          {t.landing.demoClick} — {answeredCount}/{questions.length} {t.landing.demoAnswered}
        </p>
      )}
    </div>
  );
}
