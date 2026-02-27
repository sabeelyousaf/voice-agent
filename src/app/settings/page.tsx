/** @jsxImportSource react */
"use client";

import ProtectedLayout from "../(protected)/layout";
import { useEffect, useMemo, useState } from "react";
import { Loader2, Globe, Phone as PhoneIcon, Mail, Building2, Link as LinkIcon, Key, PhoneCall } from "lucide-react";
import type { WorkspaceSettings } from "@/types";

export default function SettingsPage() {
  const [settings, setSettings] = useState<WorkspaceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingVapi, setSavingVapi] = useState(false);
  const [rotating, setRotating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "integrations">("info");
  const [showVapiModal, setShowVapiModal] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then(async (r) => {
        if (!r.ok) {
          const text = await r.text();
          throw new Error(text || `Failed to load settings (${r.status})`);
        }
        return r.json();
      })
      .then(setSettings)
      .catch((err) => {
        console.error("Load settings error:", err);
        setError(err instanceof Error ? err.message : "Failed to load settings");
      })
      .finally(() => setLoading(false));
  }, []);

  const apiBaseUrl = useMemo(() => {
    if (typeof window !== "undefined") return window.location.origin;
    return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  }, []);

  const onChange = (field: keyof WorkspaceSettings, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, [field]: value });
    setSaved(false);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: settings.businessName,
          websiteUrl: settings.websiteUrl,
          logoUrl: settings.logoUrl,
          phoneNumber: settings.phoneNumber,
          email: settings.email,
          address: settings.address,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save settings");
      }
      const updated = (await res.json()) as WorkspaceSettings;
      setSettings(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const saveVapi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingVapi(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vapiApiKey: settings.vapiApiKey ?? null,
          vapiPublicKey: settings.vapiPublicKey ?? null,
          vapiBaseUrl: settings.vapiBaseUrl ?? null,
          vapiPhoneNumberId: settings.vapiPhoneNumberId ?? null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save VAPI settings");
      }
      const updated = (await res.json()) as WorkspaceSettings;
      setSettings(updated);
      setSaved(true);
      setShowVapiModal(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save VAPI settings"
      );
    } finally {
      setSavingVapi(false);
    }
  };

  const rotateKey = async () => {
    setRotating(true);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rotateKey: true }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to rotate key");
      }
      const updated = (await res.json()) as WorkspaceSettings;
      setSettings(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to rotate key");
    } finally {
      setRotating(false);
    }
  };

  const leadsEndpoint = `${apiBaseUrl}/api/leads`;

  const vapiConnected =
    Boolean(settings?.vapiApiKey) && Boolean(settings?.vapiPhoneNumberId);

  return (
    <ProtectedLayout>
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Settings & Integrations</h1>
        <p className="mt-1 text-slate-400">
          Configure your business profile and copy the lead capture API for your website or funnels.
        </p>
      </div>

      {loading || !settings ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : (
        <>
        <div className="mb-6 border-b border-surface-700/80">
          <nav className="flex gap-4 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`border-b-2 pb-2 transition-colors ${
                activeTab === "info"
                  ? "border-accent text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Information
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("integrations")}
              className={`border-b-2 pb-2 transition-colors ${
                activeTab === "integrations"
                  ? "border-accent text-white"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              Integrations
            </button>
          </nav>
        </div>

        {activeTab === "info" && (
        <div className="grid gap-8 lg:grid-cols-2">
          <form onSubmit={save} className="card space-y-4 p-6">
            <h2 className="text-lg font-semibold text-white">Business profile</h2>
            <p className="text-sm text-slate-400">
              These details can be used inside your agent prompts and outbound call scripts.
            </p>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Building2 className="h-4 w-4" />
                Business name
              </label>
              <input
                className="input-dark"
                value={settings.businessName ?? ""}
                onChange={(e) => onChange("businessName", e.target.value)}
                placeholder="Acme Corp"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                <Globe className="h-4 w-4" />
                Website URL
              </label>
              <input
                className="input-dark"
                value={settings.websiteUrl ?? ""}
                onChange={(e) => onChange("websiteUrl", e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                <LinkIcon className="h-4 w-4" />
                Logo URL
              </label>
              <input
                className="input-dark"
                value={settings.logoUrl ?? ""}
                onChange={(e) => onChange("logoUrl", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <PhoneIcon className="h-4 w-4" />
                  Phone number
                </label>
                <input
                  className="input-dark"
                  value={settings.phoneNumber ?? ""}
                  onChange={(e) => onChange("phoneNumber", e.target.value)}
                  placeholder="+1 234 567 890"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
                  <Mail className="h-4 w-4" />
                  Email
                </label>
                <input
                  className="input-dark"
                  value={settings.email ?? ""}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="support@example.com"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 text-sm font-medium text-slate-300">
                Address
              </label>
              <textarea
                className="input-dark min-h-[80px] resize-y"
                value={settings.address ?? ""}
                onChange={(e) => onChange("address", e.target.value)}
                placeholder="Street, City, Country"
              />
            </div>

            {error && <p className="text-sm text-red-400">{error}</p>}
            {saved && !error && (
              <p className="text-sm text-emerald-400">Saved.</p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>

          <div className="space-y-4">
            <div className="card p-6">
              <h2 className="mb-2 text-lg font-semibold text-white">
                Lead capture API
              </h2>
              <p className="mb-3 text-sm text-slate-400">
                Use this endpoint in your website, forms, or funnels to send leads directly into this dashboard.
              </p>

              <div className="mb-3 rounded-lg border border-white/10 bg-surface-700/60 p-3 text-xs text-slate-200 font-mono break-all">
                <span className="text-slate-400">POST</span> {leadsEndpoint}
              </div>

              <div className="mb-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Key className="h-3.5 w-3.5 text-accent" />
                  <span>Integration API key</span>
                </div>
                <button
                  type="button"
                  onClick={rotateKey}
                  disabled={rotating}
                  className="btn-ghost px-2 py-1 text-xs"
                >
                  {rotating ? "Rotating…" : "Rotate key"}
                </button>
              </div>

              <div className="mb-4 rounded-lg border border-white/10 bg-surface-800/80 p-3 text-xs font-mono text-slate-200 break-all">
                {settings.integrationApiKey}
              </div>

              <p className="mb-2 text-xs text-slate-400">
                Send JSON with <code className="font-mono text-slate-200">name</code>,{" "}
                <code className="font-mono text-slate-200">email</code>,{" "}
                <code className="font-mono text-slate-200">phone</code>,{" "}
                <code className="font-mono text-slate-200">message</code>,{" "}
                <code className="font-mono text-slate-200">source</code>.
              </p>

              <div className="mt-3 space-y-2 rounded-lg bg-surface-900/60 p-3 text-xs font-mono text-slate-200">
                <div className="text-slate-400">// Example cURL</div>
                <pre className="whitespace-pre-wrap break-all">
{`curl -X POST '${leadsEndpoint}' \\
  -H 'Content-Type: application/json' \\
  -H 'x-api-key: ${settings.integrationApiKey}' \\
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+12025550123",
    "message": "Interested in a demo",
    "source": "website-homepage"
  }'`}
                </pre>
              </div>
            </div>
          </div>
        </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-4">
            <div className="card flex flex-col justify-between gap-4 p-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="mb-1 text-lg font-semibold text-white">
                  Telephony / VAPI
                </h2>
                <p className="text-sm text-slate-400">
                  Connect your VAPI account so the voice agent can place and receive calls.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                    vapiConnected
                      ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40"
                      : "bg-red-500/10 text-red-300 ring-1 ring-red-500/40"
                  }`}
                >
                  <span
                    className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                      vapiConnected ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />
                  {vapiConnected ? "Connected" : "Not connected"}
                </span>
                <button
                  type="button"
                  className="btn-primary whitespace-nowrap text-xs"
                  onClick={() => setShowVapiModal(true)}
                >
                  {vapiConnected ? "Update keys" : "Connect VAPI"}
                </button>
              </div>
            </div>
          </div>
        )}

        {showVapiModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <form
              onSubmit={saveVapi}
              className="card max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto p-6"
            >
              <h2 className="text-lg font-semibold text-white">
                {vapiConnected ? "Update VAPI connection" : "Connect VAPI"}
              </h2>
              <p className="text-sm text-slate-400">
                Paste your VAPI API key, public key, base URL, and phone number ID from your VAPI dashboard.
              </p>

              <div className="space-y-3 text-sm">
                <div>
                  <label className="mb-1.5 block font-medium text-slate-300">
                    VAPI API key
                  </label>
                  <input
                    className="input-dark"
                    value={settings.vapiApiKey ?? ""}
                    onChange={(e) => onChange("vapiApiKey", e.target.value)}
                    placeholder="sk_live_..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-slate-300">
                    VAPI public key
                  </label>
                  <input
                    className="input-dark"
                    value={settings.vapiPublicKey ?? ""}
                    onChange={(e) => onChange("vapiPublicKey", e.target.value)}
                    placeholder="pk_live_..."
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-medium text-slate-300">
                    VAPI base URL
                  </label>
                  <input
                    className="input-dark"
                    value={settings.vapiBaseUrl ?? "https://api.vapi.ai"}
                    onChange={(e) => onChange("vapiBaseUrl", e.target.value)}
                    placeholder="https://api.vapi.ai"
                  />
                </div>
                <div>
                  <label className="mb-1.5 flex items-center gap-2 font-medium text-slate-300">
                    <PhoneCall className="h-4 w-4" />
                    VAPI phone number ID
                  </label>
                  <input
                    className="input-dark"
                    value={settings.vapiPhoneNumberId ?? ""}
                    onChange={(e) => onChange("vapiPhoneNumberId", e.target.value)}
                    placeholder="e.g. 601c9eb6-65ac-45be-923d-..."
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  className="btn-ghost text-sm"
                  onClick={() => setShowVapiModal(false)}
                  disabled={savingVapi}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingVapi}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  {savingVapi && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {savingVapi ? "Saving…" : "Save connection"}
                </button>
              </div>
            </form>
          </div>
        )}

        </>
      )}
    </div>
    </ProtectedLayout>
  );
}

