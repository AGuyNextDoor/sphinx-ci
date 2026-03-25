"use client";

import { useState } from "react";
import { dictionaries } from "@/lib/i18n";

interface RepoCardProps {
  repoFullName: string;
  repoName: string;
  isPrivate: boolean;
  language: string | null;
  description: string | null;
  configured: boolean;
  apiKey?: string;
  teamId?: string;
  initialConfig?: {
    numQuestions?: number;
    passingScore?: number;
    maxAttempts?: number;
    language?: "fr" | "en";
    keyword?: string;
  };
  locale: "en" | "fr";
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
  initialConfig,
  locale,
}: RepoCardProps) {
  const t = dictionaries[locale];
  const [configured, setConfigured] = useState(initialConfigured);
  const [apiKey, setApiKey] = useState(initialApiKey || "");
  const [teamId, setTeamId] = useState(initialTeamId || "");
  const [loading, setLoading] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");

  // Form state
  const [numQuestions, setNumQuestions] = useState(initialConfig?.numQuestions ?? 10);
  const [passingScore, setPassingScore] = useState(initialConfig?.passingScore ?? 70);
  const [maxAttempts, setMaxAttempts] = useState(initialConfig?.maxAttempts ?? 3);
  const [quizLanguage, setQuizLanguage] = useState<"fr" | "en">(initialConfig?.language ?? "fr");
  const [keyword, setKeyword] = useState(initialConfig?.keyword ?? "@sphinx-ci");

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  function openEditForm() {
    setEditing(true);
    setShowForm(true);
    setError("");
  }

  async function handleConfigure() {
    setError("");
    setLoading(true);
    try {
      if (editing && teamId) {
        const res = await fetch(`/api/keys/${teamId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            config: { numQuestions, passingScore, maxAttempts, language: quizLanguage, keyword },
          }),
        });
        if (res.ok) {
          setShowForm(false);
          setEditing(false);
          showToast("✓ Saved");
        } else {
          const data = await res.json();
          setError(data.error || t.repoCard.errorUpdate);
        }
      } else {
        const res = await fetch("/api/keys", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            repo: repoFullName,
            config: { numQuestions, passingScore, maxAttempts, language: quizLanguage, keyword },
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setApiKey(data.apiKey);
          setTeamId(data.id);
          setConfigured(true);
          setShowKey(true);
          setShowForm(false);
          showToast("✓ API key generated");
        } else if (res.status === 409) {
          setApiKey(data.apiKey);
          setConfigured(true);
          setShowForm(false);
        } else {
          setError(data.error || t.repoCard.errorConfig);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    if (!confirm(t.repoCard.revokeConfirm.replace("{repo}", repoFullName))) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/keys/${teamId}`, { method: "DELETE" });
      if (res.ok) {
        setConfigured(false);
        setApiKey("");
        setTeamId("");
        setShowKey(false);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResetKey() {
    if (!confirm(t.repoCard.resetConfirm.replace("{repo}", repoFullName))) return;
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

  const configForm = (
    <div className="mt-4 pt-4 border-t" style={{ borderColor: "#252036" }}>
      <div className="space-y-3">
        {/* Settings grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className={labelClass}>{t.repoCard.questions}</label>
            <select value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} className={selectClass}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t.repoCard.scoreMin}</label>
            <select value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} className={selectClass}>
              <option value={50}>50%</option>
              <option value={60}>60%</option>
              <option value={70}>70%</option>
              <option value={80}>80%</option>
              <option value={90}>90%</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t.repoCard.attempts}</label>
            <select value={maxAttempts} onChange={(e) => setMaxAttempts(Number(e.target.value))} className={selectClass}>
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
              <option value={4}>4</option>
              <option value={5}>5</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t.repoCard.language}</label>
            <select value={quizLanguage} onChange={(e) => setQuizLanguage(e.target.value as "fr" | "en")} className={selectClass}>
              <option value="fr">{t.repoCard.french}</option>
              <option value="en">{t.repoCard.english}</option>
            </select>
          </div>
        </div>

        {/* Keyword */}
        <div>
          <label className={labelClass}>{t.repoCard.keyword}</label>
          <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="@sphinx-ci" className={inputClass} />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <div className="flex gap-2">
          <button
            onClick={handleConfigure}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50"
            style={{ background: "#c9a84c", color: "#0f0c1a" }}
          >
            {loading ? "..." : editing ? t.repoCard.save : t.repoCard.generate}
          </button>
          <button
            onClick={() => { setShowForm(false); setEditing(false); setError(""); }}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {t.repoCard.cancel}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-lg p-4 border" style={{ background: "#1a1628", borderColor: "#252036" }}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-medium truncate">{repoFullName}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded ${
                isPrivate ? "text-yellow-400 bg-yellow-400/10" : "text-gray-400 bg-gray-400/10"
              }`}
            >
              {isPrivate ? t.repos.private : t.repos.public}
            </span>
          </div>
          {description && <p className="text-sm text-gray-400 truncate">{description}</p>}
          {language && <p className="text-xs text-gray-400 mt-1">{language}</p>}
        </div>

        <div className="ml-4 flex-shrink-0 flex items-center gap-2">
          {!configured && !showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg transition-all"
              style={{ background: "#c9a84c", color: "#0f0c1a" }}
            >
              {t.repoCard.configure}
            </button>
          ) : configured && !showForm ? (
            <>
              <button
                onClick={openEditForm}
                className="px-3 py-1 text-xs font-medium rounded border transition-colors"
                style={{ borderColor: "#c9a84c", color: "#c9a84c" }}
              >
                {t.repoCard.edit}
              </button>
              <span
                className="px-3 py-1 text-xs font-medium rounded"
                style={{ color: "#c9a84c", background: "rgba(201,168,76,0.1)" }}
              >
                {t.repoCard.configured}
              </span>
            </>
          ) : null}
        </div>
      </div>

      {/* Configuration form (create or edit) */}
      {showForm && configForm}

      {/* API Key section */}
      {configured && apiKey && !showForm && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: "#252036" }}>
          <div className="flex items-center gap-2">
            <div
              className="flex-1 relative px-3 py-2 rounded overflow-hidden cursor-pointer"
              style={{ background: "#0f0c1a" }}
              onClick={() => setShowKey(!showKey)}
            >
              <code className={`text-xs font-mono ${showKey ? "text-gray-400" : "api-key-hidden text-gray-400"}`}>
                {apiKey}
              </code>
              {!showKey && (
                <span className="absolute inset-0 flex items-center justify-center text-xs" style={{ color: "#8b85a0" }}>
                  {t.repoCard.reveal}
                </span>
              )}
            </div>
            <button onClick={handleCopy} className="text-xs px-2 py-2" style={{ color: "#c9a84c" }}>
              {copied ? t.repoCard.copied : t.repoCard.copy}
            </button>
            <button onClick={handleResetKey} disabled={loading} className="text-xs text-orange-400 hover:text-orange-300 px-2 py-2">
              {t.repoCard.resetKey}
            </button>
            <button onClick={handleRevoke} disabled={loading} className="text-xs text-red-400 hover:text-red-300 px-2 py-2">
              {t.repoCard.revoke}
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: "#8b85a0" }}>
            {t.repoCard.secretHint}
          </p>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className="mt-3 px-3 py-2 rounded text-xs font-medium text-center transition-all"
          style={{ background: "rgba(201,168,76,0.15)", color: "#c9a84c" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
