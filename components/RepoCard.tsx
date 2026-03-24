"use client";

import { useState } from "react";

interface RepoCardProps {
  repoFullName: string;
  repoName: string;
  isPrivate: boolean;
  language: string | null;
  description: string | null;
  configured: boolean;
  apiKey?: string;
  teamId?: string;
}

const selectClass =
  "w-full px-3 py-2 rounded-lg text-sm text-white border border-gray-600 bg-gray-900 focus:border-[#c9a84c] focus:outline-none";
const inputClass = selectClass;
const labelClass = "block text-xs text-gray-400 mb-1";

export default function RepoCard({
  repoFullName,
  repoName,
  isPrivate,
  language,
  description,
  configured: initialConfigured,
  apiKey: initialApiKey,
  teamId: initialTeamId,
}: RepoCardProps) {
  const [configured, setConfigured] = useState(initialConfigured);
  const [apiKey, setApiKey] = useState(initialApiKey || "");
  const [teamId, setTeamId] = useState(initialTeamId || "");
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [anthropicKey, setAnthropicKey] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [passingScore, setPassingScore] = useState(70);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [quizLanguage, setQuizLanguage] = useState<"fr" | "en">("fr");
  const [keyword, setKeyword] = useState("/sphinx");

  async function handleConfigure() {
    if (!anthropicKey.trim()) {
      setError("La cle Anthropic API est obligatoire.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo: repoFullName,
          anthropicApiKey: anthropicKey,
          config: {
            numQuestions,
            passingScore,
            maxAttempts,
            language: quizLanguage,
            keyword,
          },
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setApiKey(data.apiKey);
        setTeamId(data.id);
        setConfigured(true);
        setShowKey(true);
        setShowForm(false);
      } else if (res.status === 409) {
        setApiKey(data.apiKey);
        setConfigured(true);
        setShowForm(false);
      } else {
        setError(data.error || "Erreur lors de la configuration.");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    if (
      !confirm(
        `Revoquer la cle API pour ${repoFullName} ? Les quiz existants seront supprimes.`
      )
    )
      return;
    setLoading(true);
    try {
      const res = await fetch(`/api/keys/${teamId}`, { method: "DELETE" });
      if (res.ok) {
        setConfigured(false);
        setApiKey("");
        setTeamId("");
        setShowKey(false);
        setAnthropicKey("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetKey() {
    if (!confirm(`Generer une nouvelle cle API pour ${repoFullName} ? L'ancienne cle ne fonctionnera plus.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/keys/${teamId}`, { method: "PATCH" });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.apiKey);
        setShowKey(true);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div
      className="rounded-lg p-4 border"
      style={{ background: "#1a1628", borderColor: "#252036" }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-medium truncate">{repoFullName}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                isPrivate
                  ? "text-yellow-400 bg-yellow-400/10"
                  : "text-gray-400 bg-gray-400/10"
              }`}
            >
              {isPrivate ? "prive" : "public"}
            </span>
          </div>
          {description && (
            <p className="text-sm text-gray-500 truncate">{description}</p>
          )}
          {language && (
            <p className="text-xs text-gray-600 mt-1">{language}</p>
          )}
        </div>

        <div className="ml-4 flex-shrink-0">
          {!configured && !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={{ background: "#c9a84c", color: "#0f0c1a" }}
            >
              Configurer
            </button>
          ) : configured ? (
            <span
              className="px-3 py-1 text-xs font-medium rounded"
              style={{ color: "#c9a84c", background: "rgba(201,168,76,0.1)" }}
            >
              Configure
            </span>
          ) : null}
        </div>
      </div>

      {/* Configuration form */}
      {showForm && !configured && (
        <div className="mt-4 pt-4 border-t" style={{ borderColor: "#252036" }}>
          <div className="space-y-3">
            {/* Anthropic API Key */}
            <div>
              <label className={labelClass}>
                Cle Anthropic API *
              </label>
              <input
                type="password"
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className={inputClass}
              />
            </div>

            {/* Settings grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className={labelClass}>Questions</label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className={selectClass}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Score min</label>
                <select
                  value={passingScore}
                  onChange={(e) => setPassingScore(Number(e.target.value))}
                  className={selectClass}
                >
                  <option value={50}>50%</option>
                  <option value={60}>60%</option>
                  <option value={70}>70%</option>
                  <option value={80}>80%</option>
                  <option value={90}>90%</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Tentatives</label>
                <select
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  className={selectClass}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Langue</label>
                <select
                  value={quizLanguage}
                  onChange={(e) =>
                    setQuizLanguage(e.target.value as "fr" | "en")
                  }
                  className={selectClass}
                >
                  <option value="fr">Francais</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            {/* Keyword */}
            <div>
              <label className={labelClass}>
                Keyword declencheur (dans un commentaire PR)
              </label>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="/sphinx"
                className={inputClass}
              />
            </div>

            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleConfigure}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                style={{ background: "#c9a84c", color: "#0f0c1a" }}
              >
                {loading ? "..." : "Generer la cle API"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Key section */}
      {configured && apiKey && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: "#252036" }}>
          <div className="flex items-center gap-2">
            <code
              className="flex-1 text-xs text-gray-400 px-3 py-2 rounded font-mono truncate"
              style={{ background: "#0f0c1a" }}
            >
              {showKey
                ? apiKey
                : `${apiKey.slice(0, 12)}...${apiKey.slice(-6)}`}
            </code>
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-xs text-gray-500 hover:text-gray-300 px-2 py-2"
            >
              {showKey ? "Masquer" : "Voir"}
            </button>
            <button
              onClick={handleCopy}
              className="text-xs px-2 py-2"
              style={{ color: "#c9a84c" }}
            >
              {copied ? "Copie !" : "Copier"}
            </button>
            <button
              onClick={handleResetKey}
              disabled={loading}
              className="text-xs text-orange-400 hover:text-orange-300 px-2 py-2"
            >
              Reset cle
            </button>
            <button
              onClick={handleRevoke}
              disabled={loading}
              className="text-xs text-red-400 hover:text-red-300 px-2 py-2"
            >
              Revoquer
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2">
            Ajoute cette cle comme secret{" "}
            <code className="text-gray-500">PR_QUIZ_API_KEY</code> dans Settings
            &gt; Secrets and variables &gt; Actions de ton repo.
          </p>
        </div>
      )}
    </div>
  );
}
