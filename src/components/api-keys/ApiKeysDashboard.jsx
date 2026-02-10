"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import { Copy, Key, Plus, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";
import { RiskDisclaimer } from "../Disclaimer.jsx";

const TIER_COLORS = {
  free: "bg-gray-500",
  monthly: "bg-blue-500",
  yearly: "bg-green-500",
  lifetime: "bg-purple-500",
};

export function ApiKeysDashboard() {
  const [session, setSession] = useState(null);
  const [keys, setKeys] = useState([]);
  const [userTier, setUserTier] = useState("free");
  const [dailyLimit, setDailyLimit] = useState(10);
  const [maxKeys, setMaxKeys] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [showNewKey, setShowNewKey] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchKeys(session);
    });

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchKeys(session);
    }) || { data: { subscription: null } };

    return () => subscription?.unsubscribe();
  }, []);

  const fetchKeys = async (session) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/keys", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setKeys(data.keys || []);
        setUserTier(data.tier || "free");
        setDailyLimit(data.daily_limit || 10);
        setMaxKeys(data.max_keys || 2);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to fetch API keys");
    } finally {
      setIsLoading(false);
    }
  };

  const createKey = async () => {
    if (!session || isCreating) return;
    setIsCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ name: newKeyName || "Default" }),
      });
      const data = await res.json();
      if (res.ok) {
        setShowNewKey(data.key);
        setNewKeyName("");
        fetchKeys(session);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to create API key");
    } finally {
      setIsCreating(false);
    }
  };

  const revokeKey = async (keyId) => {
    if (!session || !confirm("Are you sure you want to revoke this key?")) return;

    try {
      const res = await fetch("/api/keys", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ keyId }),
      });
      if (res.ok) {
        fetchKeys(session);
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch (err) {
      setError("Failed to revoke API key");
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <Key className="mx-auto h-16 w-16 text-brand-muted/50" />
          <h2 className="mt-4 text-xl font-semibold text-brand-text">Sign in to manage API keys</h2>
          <p className="mt-2 text-brand-muted">Create API keys to use the MCP server with Claude</p>
          <a
            href="/"
            className="mt-4 inline-block rounded-lg bg-brand-link px-6 py-2 text-sm font-semibold text-white hover:bg-brand-text"
          >
            Go to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-brand-text">API Keys</h1>
        <p className="mt-1 text-brand-muted">
          Manage your API keys for the MCP server integration
        </p>
      </div>

      {/* Tier Info */}
      <div className="mb-6 flex items-center gap-3 rounded-lg border border-brand-muted/20 bg-brand-bg/50 p-4">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase text-white ${TIER_COLORS[userTier] || "bg-gray-500"}`}>
          {userTier}
        </span>
        <span className="text-sm text-brand-muted">
          {dailyLimit} calls/day per key | {maxKeys} keys max
        </span>
        {userTier === "free" && (
          <a
            href="/#pricing"
            className="ml-auto text-sm font-medium text-brand-link hover:underline"
          >
            Upgrade for more
          </a>
        )}
      </div>

      {/* New Key Alert */}
      {showNewKey && (
        <div className="mb-6 rounded-lg border border-green-500/30 bg-green-500/10 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-green-400">API Key Created!</h3>
              <p className="mt-1 text-sm text-brand-muted">
                Copy this key now. It will not be shown again.
              </p>
            </div>
            <button
              onClick={() => setShowNewKey(null)}
              className="text-brand-muted hover:text-brand-text"
            >
              &times;
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded bg-black/30 px-3 py-2 font-mono text-sm text-green-400">
              {showNewKey}
            </code>
            <button
              onClick={() => copyToClipboard(showNewKey, "new")}
              className="rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white hover:bg-green-600"
            >
              {copiedId === "new" ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Create Key */}
      <div className="mb-6 rounded-lg border border-brand-muted/20 bg-brand-bg/50 p-4">
        <h3 className="mb-3 font-semibold text-brand-text">Create New Key</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Key name (optional)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            className="flex-1 rounded-lg border border-brand-muted/40 bg-white px-3 py-2 text-sm text-brand-text focus:border-brand-link focus:outline-none focus:ring-2 focus:ring-brand-link/30"
          />
          <button
            onClick={createKey}
            disabled={isCreating}
            className="flex items-center gap-2 rounded-lg bg-brand-link px-4 py-2 text-sm font-semibold text-white hover:bg-brand-text disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {isCreating ? "Creating..." : "Create Key"}
          </button>
        </div>
      </div>

      {/* Keys List */}
      <div className="rounded-lg border border-brand-muted/20 bg-brand-bg/50">
        <div className="border-b border-brand-muted/20 px-4 py-3">
          <h3 className="font-semibold text-brand-text">Your API Keys</h3>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-brand-muted">Loading...</div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-brand-muted">
            No API keys yet. Create one to get started.
          </div>
        ) : (
          <div className="divide-y divide-brand-muted/20">
            {keys.map((key) => (
              <div key={key.id} className="flex items-center justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-brand-muted" />
                    <span className="font-medium text-brand-text">{key.name}</span>
                    <code className="rounded bg-black/20 px-2 py-0.5 font-mono text-xs text-brand-muted">
                      {key.key_prefix}
                    </code>
                    {!key.is_active && (
                      <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-400">
                        Revoked
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-brand-muted">
                    <span>
                      {key.calls_today || 0} / {key.daily_limit || "unlimited"} calls today
                    </span>
                    <span>{key.calls_total || 0} total calls</span>
                    {key.last_used_at && (
                      <span>Last used: {new Date(key.last_used_at).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                {key.is_active && (
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="ml-4 rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                    title="Revoke key"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="mt-8 rounded-lg border border-brand-muted/20 bg-brand-bg/50 p-6">
        <h3 className="mb-4 font-semibold text-brand-text">How to Use</h3>

        <div className="space-y-4 text-sm text-brand-muted">
          <div>
            <h4 className="font-medium text-brand-text">1. Install the MCP server</h4>
            <code className="mt-1 block rounded bg-black/30 px-3 py-2 font-mono text-brand-link">
              npm install -g @aicryptorisk/mcp-server
            </code>
          </div>

          <div>
            <h4 className="font-medium text-brand-text">2. Configure Claude Desktop</h4>
            <p className="mt-1">Add to your Claude Desktop config:</p>
            <pre className="mt-2 overflow-x-auto rounded bg-black/30 px-3 py-2 font-mono text-xs text-brand-muted">
{`{
  "mcpServers": {
    "aicryptorisk": {
      "command": "npx",
      "args": ["@aicryptorisk/mcp-server"],
      "env": {
        "AICRYPTORISK_API_KEY": "your-api-key-here"
      }
    }
  }
}`}
            </pre>
          </div>

          <div>
            <h4 className="font-medium text-brand-text">3. Start using it</h4>
            <p className="mt-1">
              Ask Claude: &quot;Analyze this token for scam risk: 0x...&quot;
            </p>
          </div>
        </div>

        <a
          href="https://www.npmjs.com/package/@aicryptorisk/mcp-server"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-brand-link hover:underline"
        >
          View on npm <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Risk Disclaimer */}
      <div className="mt-8">
        <RiskDisclaimer />
      </div>

      {/* Back to Home */}
      <div className="mt-8 text-center">
        <a
          href="/"
          className="text-sm text-brand-muted hover:text-brand-text"
        >
          &larr; Back to Home
        </a>
      </div>
    </div>
  );
}
