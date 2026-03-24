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

  async function handleConfigure() {
    setLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: repoFullName }),
      });
      const data = await res.json();
      if (res.ok) {
        setApiKey(data.apiKey);
        setTeamId(data.id);
        setConfigured(true);
        setShowKey(true);
      } else if (res.status === 409) {
        setApiKey(data.apiKey);
        setConfigured(true);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    if (!confirm(`Revoquer la cle API pour ${repoFullName} ? Les quiz existants seront supprimes.`)) return;
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

  function handleCopy() {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
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
          {!configured ? (
            <button
              onClick={handleConfigure}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm rounded-lg transition-colors"
            >
              {loading ? "..." : "Configurer"}
            </button>
          ) : (
            <span className="px-3 py-1 text-xs font-medium text-green-400 bg-green-400/10 rounded">
              Configure
            </span>
          )}
        </div>
      </div>

      {/* API Key section */}
      {configured && apiKey && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-gray-400 bg-gray-900 px-3 py-2 rounded font-mono truncate">
              {showKey ? apiKey : `${apiKey.slice(0, 12)}...${ apiKey.slice(-6)}`}
            </code>
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-xs text-gray-500 hover:text-gray-300 px-2 py-2"
            >
              {showKey ? "Masquer" : "Voir"}
            </button>
            <button
              onClick={handleCopy}
              className="text-xs text-blue-400 hover:text-blue-300 px-2 py-2"
            >
              {copied ? "Copie !" : "Copier"}
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
            Ajoute cette cle comme secret <code className="text-gray-500">PR_QUIZ_API_KEY</code> dans
            Settings &gt; Secrets and variables &gt; Actions de ton repo.
          </p>
        </div>
      )}
    </div>
  );
}
