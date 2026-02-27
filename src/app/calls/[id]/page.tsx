"use client";

import ProtectedLayout from "../../(protected)/layout";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Phone, Play, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import type { Call } from "@/types";

const statusLabels: Record<string, string> = {
  scheduled: "Calling now…",
  initiated: "Calling now…",
  ringing: "Ringing",
  "in-progress": "In progress",
  completed: "Completed",
  failed: "Failed",
  "no-answer": "No answer",
};

export default function CallDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [call, setCall] = useState<Call | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const load = () => {
    fetch(`/api/calls/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then(setCall)
      .catch(() => setCall(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [id]);

  const refreshStatus = async () => {
    if (!call || syncing) return;
    setSyncing(true);
    try {
      const r = await fetch(`/api/calls/${id}/sync`);
      if (r.ok) {
        const updated = await r.json();
        setCall(updated);
      }
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <div className="flex min-h-[40vh] items-center justify-center p-8">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      </ProtectedLayout>
    );
  }

  if (!call) {
    return (
      <ProtectedLayout>
        <div className="p-8">
          <p className="text-red-400">Call not found.</p>
          <Link href="/calls" className="mt-4 inline-block text-accent hover:underline">
            ← Back to call logs
          </Link>
        </div>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
    <div className="p-8">
      <Link
        href="/calls"
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Back to call logs
      </Link>

      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Call details</h1>
          <p className="mt-1 flex items-center gap-2 text-slate-400">
            <Phone className="h-4 w-4" />
            {call.customerNumber}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-surface-600 px-3 py-1 text-sm text-slate-300">
            {statusLabels[call.status] ?? call.status}
          </span>
          {call.vapiCallId && (
            <button
              type="button"
              onClick={refreshStatus}
              disabled={syncing}
              className="btn-ghost flex items-center gap-1.5 text-sm"
            >
              <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Refreshing…" : "Refresh status"}
            </button>
          )}
          {call.scenarioType && (
            <span className="rounded-full bg-accent/20 px-3 py-1 text-sm text-accent">
              {call.scenarioType.replace("_", " ")}
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Info
          </h2>
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-slate-500">Started</dt>
              <dd className="text-white">
                {call.startedAt
                  ? format(new Date(call.startedAt), "PPp")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Ended</dt>
              <dd className="text-white">
                {call.endedAt
                  ? format(new Date(call.endedAt), "PPp")
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Duration</dt>
              <dd className="text-white">
                {call.durationSeconds != null
                  ? `${call.durationSeconds} sec`
                  : "—"}
              </dd>
            </div>
            {call.recordingUrl && (
              <div>
                <dt className="text-slate-500">Recording</dt>
                <dd>
                  <a
                    href={call.recordingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-accent hover:underline"
                  >
                    <Play className="h-4 w-4" /> Play
                  </a>
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Transcript
          </h2>
          {call.transcript ? (
            <div className="whitespace-pre-wrap rounded-lg bg-surface-700/50 p-4 font-mono text-sm text-slate-300">
              {call.transcript}
            </div>
          ) : (
            <p className="text-slate-500">
              Transcript will appear here after the call ends (via webhook or when available from VAPI).
            </p>
          )}
        </div>
      </div>
    </div>
    </ProtectedLayout>
  );
}
