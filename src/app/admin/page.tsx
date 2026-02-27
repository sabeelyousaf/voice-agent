 "use client";

import ProtectedLayout from "../(protected)/layout";
import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  MessageSquare,
  Check,
} from "lucide-react";
import type { AgentScript } from "@/types";

const SCENARIO_OPTIONS = [
  { value: "appointment", label: "Appointment booking" },
  { value: "product_info", label: "Product information" },
  { value: "feedback", label: "Customer feedback" },
];

export default function AdminPage() {
  const [scripts, setScripts] = useState<AgentScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    scenarioType: "appointment",
    systemPrompt: "",
    firstMessage: "",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadScripts = () => {
    fetch("/api/scripts")
      .then((r) => r.json())
      .then(setScripts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadScripts();
  }, []);

  const openNew = () => {
    setEditingId(null);
    setForm({
      name: "",
      scenarioType: "appointment",
      systemPrompt: "",
      firstMessage: "",
      isActive: true,
    });
    setShowForm(true);
    setError(null);
  };

  const openEdit = (s: AgentScript) => {
    setEditingId(s.id);
    setForm({
      name: s.name,
      scenarioType: s.scenarioType,
      systemPrompt: s.systemPrompt,
      firstMessage: s.firstMessage,
      isActive: s.isActive,
    });
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setError(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId) {
        const res = await fetch(`/api/scripts/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      } else {
        const res = await fetch("/api/scripts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error((await res.json()).error);
      }
      loadScripts();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this script?")) return;
    await fetch(`/api/scripts/${id}`, { method: "DELETE" });
    loadScripts();
  };

  const toggleActive = async (s: AgentScript) => {
    await fetch(`/api/scripts/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    loadScripts();
  };

  return (
    <ProtectedLayout>
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin & Scripts</h1>
          <p className="mt-1 text-slate-400">
            Add and edit agent scripts and questions in real time
          </p>
        </div>
        <button onClick={openNew} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New script
        </button>
      </div>

      {showForm && (
        <div className="card fixed inset-4 z-50 m-auto flex max-h-[90vh] max-w-2xl flex-col overflow-hidden border-accent/30 bg-surface-800 shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/5 p-4">
            <h2 className="text-lg font-semibold text-white">
              {editingId ? "Edit script" : "New script"}
            </h2>
            <button onClick={closeForm} className="btn-ghost p-1">
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={save} className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="input-dark"
                  placeholder="e.g. Demo appointment script"
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  Scenario
                </label>
                <select
                  value={form.scenarioType}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scenarioType: e.target.value }))
                  }
                  className="input-dark"
                >
                  {SCENARIO_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  First message (what the agent says first)
                </label>
                <textarea
                  value={form.firstMessage}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firstMessage: e.target.value }))
                  }
                  className="input-dark min-h-[80px] resize-y"
                  placeholder="Hi, this is Acme Corp..."
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">
                  System prompt (agent behavior)
                </label>
                <textarea
                  value={form.systemPrompt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, systemPrompt: e.target.value }))
                  }
                  className="input-dark min-h-[120px] resize-y font-mono text-sm"
                  placeholder="You are a friendly assistant..."
                  required
                />
              </div>
              {editingId && (
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="rounded border-white/20 bg-surface-600 text-accent"
                  />
                  <span className="text-sm text-slate-300">Active</span>
                </label>
              )}
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t border-white/5 p-4">
              <button type="button" onClick={closeForm} className="btn-ghost">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                <Save className="h-4 w-4" />
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : scripts.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <MessageSquare className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>No custom scripts yet.</p>
            <p className="mt-1 text-sm">
              Create one to override the default agent messages for each scenario.
            </p>
            <button onClick={openNew} className="btn-primary mt-4">
              Add script
            </button>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {scripts.map((s) => (
              <li key={s.id} className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white">{s.name}</h3>
                      <span className="rounded bg-surface-600 px-2 py-0.5 text-xs text-slate-400">
                        {s.scenarioType.replace("_", " ")}
                      </span>
                      {!s.isActive && (
                        <span className="text-xs text-amber-400">Inactive</span>
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {s.firstMessage}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(s)}
                      className="btn-ghost flex items-center gap-1 text-sm"
                      title={s.isActive ? "Deactivate" : "Activate"}
                    >
                      <Check
                        className={`h-4 w-4 ${s.isActive ? "text-green-400" : "text-slate-500"}`}
                      />
                      {s.isActive ? "On" : "Off"}
                    </button>
                    <button
                      onClick={() => openEdit(s)}
                      className="btn-ghost flex items-center gap-1 text-sm"
                    >
                      <Pencil className="h-4 w-4" /> Edit
                    </button>
                    <button
                      onClick={() => remove(s.id)}
                      className="btn-ghost flex items-center gap-1 text-sm text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    </ProtectedLayout>
  );
}
