"use client";

import { useEffect, useMemo, useState } from "react";
import SidebarLayout from "@/components/dashboard/SidebarLayout";
import DataTable from "@/components/DataTable";
import CodeBlock from "@/components/CodeBlock";

type ApiKey = {
  id: string;
  name: string | null;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
};

const CURL_EXAMPLE = `curl -X POST https://api.rendivia.com/api/v1/render \\\n  -H "X-API-Key: rnd_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{"template":"weekly-summary-v1","data":{"title":"Weekly Summary","metrics":[{"label":"Revenue","value":12450}]}}'`;

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [name, setName] = useState("Default");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    fetch("/api/keys")
      .then((res) => res.json())
      .then((data) => {
        if (!mounted) return;
        setKeys(Array.isArray(data.keys) ? data.keys : []);
      })
      .catch(() => setError("Failed to load API keys"))
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setCreatedKey(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create key");
      setCreatedKey(data.key as string);
      setKeys((prev) => [
        { id: data.id, name: data.name ?? name, key_prefix: data.key.slice(0, 12), last_used_at: null, created_at: new Date().toISOString() },
        ...prev,
      ]);
      setName("Default");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRevoke(id: string) {
    const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      setKeys((prev) => prev.filter((key) => key.id !== id));
    }
  }

  const rows = useMemo(
    () =>
      keys.map((key) => ({
        name: key.name ?? "Untitled",
        prefix: key.key_prefix,
        lastUsed: key.last_used_at ? new Date(key.last_used_at).toLocaleString() : "Never",
        created: new Date(key.created_at).toLocaleDateString(),
        actions: (
          <button
            className="text-xs font-semibold text-rose-600 hover:underline"
            onClick={() => handleRevoke(key.id)}
          >
            Revoke
          </button>
        ),
      })),
    [keys]
  );

  return (
    <SidebarLayout title="API Keys" subtitle="Create and manage API keys for programmatic rendering.">
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Create API key</h2>
          <p className="mt-2 text-xs text-zinc-500">Use keys for server-to-server requests only.</p>

          {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

          <form onSubmit={handleCreate} className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-600">Key name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
                placeholder="Production"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="touch-target inline-flex min-h-[44px] items-center justify-center rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create API key"}
            </button>
          </form>

          {createdKey && (
            <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
              <p className="font-semibold">Save this key. It will not be shown again.</p>
              <p className="mt-2 break-all font-mono text-sm text-amber-800">{createdKey}</p>
              <button
                className="mt-3 text-xs font-semibold text-amber-700 hover:underline"
                onClick={() => navigator.clipboard.writeText(createdKey)}
              >
                Copy key
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">Example request</h2>
          <div className="mt-4">
            <CodeBlock code={CURL_EXAMPLE} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Active keys</h2>
          {loading && <span className="text-xs text-zinc-500">Loading...</span>}
        </div>
        <div className="mt-4">
          <DataTable
            columns={[
              { key: "name", label: "Name" },
              { key: "prefix", label: "Prefix" },
              { key: "lastUsed", label: "Last used" },
              { key: "created", label: "Created" },
              { key: "actions", label: "Actions" },
            ]}
            rows={rows}
            empty="No API keys yet."
          />
        </div>
      </div>
    </SidebarLayout>
  );
}
