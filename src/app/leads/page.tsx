"use client";

import ProtectedLayout from "../(protected)/layout";
import { useEffect, useState } from "react";
import { Users, Mail, Phone as PhoneIcon, Tag, Loader2, PhoneCall } from "lucide-react";
import type { Lead, AgentScript } from "@/types";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  new: "bg-emerald-500/15 text-emerald-300",
  contacted: "bg-blue-500/15 text-blue-300",
  qualified: "bg-purple-500/20 text-purple-200",
  won: "bg-emerald-600/20 text-emerald-300",
  lost: "bg-red-500/20 text-red-300",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [callingLeadId, setCallingLeadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scripts, setScripts] = useState<AgentScript[]>([]);
  const [scenario, setScenario] = useState<"appointment" | "product_info" | "feedback">("appointment");
  const [scriptId, setScriptId] = useState<string>("");

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then(setLeads)
      .finally(() => setLoading(false));

    fetch("/api/scripts")
      .then((r) => r.json())
      .then((data: AgentScript[]) => setScripts(data.filter((s) => s.isActive)));
  }, []);

  const refresh = () => {
    setLoading(true);
    fetch("/api/leads")
      .then((r) => r.json())
      .then(setLeads)
      .finally(() => setLoading(false));
  };

  const runScheduler = async () => {
    setScheduling(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/leads/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          scriptId: scriptId || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Scheduler failed");
      }
      const processed = typeof data.processed === "number" ? data.processed : 0;
      const msg =
        data.message ||
        (processed > 0
          ? `Scheduler ran – ${processed} lead${processed === 1 ? "" : "s"} processed.`
          : "Scheduler ran – no leads needed calling.");
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 5000);
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scheduler failed");
    } finally {
      setScheduling(false);
    }
  };

  const callLead = async (lead: Lead) => {
    if (!lead.phone) {
      setError("This lead does not have a phone number.");
      return;
    }
    setCallingLeadId(lead.id);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerNumber: String(lead.phone).trim(),
          scenario,
          scriptId: scriptId || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Failed to create call");
      }
      const label = lead.name || lead.phone || "lead";
      const msg =
        data.message ||
        `Calling ${label}. Their phone should ring in a few seconds.`;
      setSuccess(msg);
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to place call to lead"
      );
    } finally {
      setCallingLeadId(null);
    }
  };

  return (
    <ProtectedLayout>
    <div className="p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-accent" />
            Leads
          </h1>
          <p className="mt-1 text-slate-400">
            All leads captured from your website, funnels, and integrations.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-medium text-slate-300 whitespace-nowrap">
              Lead calling agent
            </span>
            <select
              className="input-dark h-9 w-40 text-xs"
              value={scenario}
              onChange={(e) => setScenario(e.target.value as typeof scenario)}
              disabled={scheduling}
            >
              <option value="appointment">Appointment</option>
              <option value="product_info">Product info</option>
              <option value="feedback">Feedback survey</option>
            </select>
            <select
              className="input-dark h-9 w-48 text-xs"
              value={scriptId}
              onChange={(e) => setScriptId(e.target.value)}
              disabled={scheduling}
            >
              <option value="">Default script</option>
              {scripts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col items-stretch gap-1 sm:items-end">
            <button
              type="button"
              onClick={runScheduler}
              disabled={scheduling}
              className="btn-primary flex h-9 items-center gap-2"
            >
              <PhoneCall className="h-4 w-4" />
              {scheduling ? "Scheduling calls…" : "Run AI scheduler"}
            </button>
            {success && !error && (
              <span className="text-xs text-emerald-400 max-w-xs truncate text-right sm:text-left">
                {success}
              </span>
            )}
            {error && (
              <span className="text-xs text-red-400 max-w-xs truncate text-right sm:text-left">
                {error}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>No leads yet.</p>
            <p className="mt-1 text-sm">
              Once you plug the integration API into your website or funnels, new leads will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {leads.map((lead) => {
              const statusClass = statusColors[lead.status] ?? "bg-surface-600 text-slate-200";
              return (
                <li key={lead.id} className="p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-white truncate max-w-xs sm:max-w-md">
                          {lead.name || lead.email || lead.phone || "Unnamed lead"}
                        </p>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass}`}>
                          {lead.status}
                        </span>
                        {lead.source && (
                          <span className="rounded-full bg-surface-600 px-2 py-0.5 text-xs text-slate-400">
                            {lead.source}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                        <span>
                          {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                        </span>
                        {lead.email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {lead.email}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="inline-flex items-center gap-1">
                            <PhoneIcon className="h-3 w-3" />
                            {lead.phone}
                          </span>
                        )}
                        {lead.tags && (
                          <span className="inline-flex items-center gap-1">
                            <Tag className="h-3 w-3" />
                            {lead.tags}
                          </span>
                        )}
                      </div>
                      {(lead.callStatus || lead.callAttempts) && (
                        <p className="mt-1 text-xs text-slate-400">
                          Call status:{" "}
                          <span className="text-slate-200">
                            {lead.callStatus ?? "pending"}
                          </span>{" "}
                          · Attempts:{" "}
                          <span className="text-slate-200">
                            {lead.callAttempts ?? 0}/3
                          </span>
                          {lead.nextCallAt && (
                            <>
                              {" "}
                              · next at{" "}
                              {new Date(lead.nextCallAt).toLocaleString()}
                            </>
                          )}
                        </p>
                      )}
                      {lead.message && (
                        <p className="mt-2 text-sm text-slate-300 line-clamp-2">
                          {lead.message}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={
                          scheduling ||
                          callingLeadId === lead.id ||
                          !lead.phone
                        }
                        onClick={() => callLead(lead)}
                        className="btn-primary inline-flex items-center gap-2 px-3 py-1 text-xs"
                      >
                        {callingLeadId === lead.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <PhoneCall className="h-3.5 w-3.5" />
                        )}
                        {callingLeadId === lead.id ? "Calling…" : "Call lead"}
                      </button>
                    </div>
                  </div>
                </li>
            );
            })}
          </ul>
        )}
      </div>
    </div>
    </ProtectedLayout>
  );
}

