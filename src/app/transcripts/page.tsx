 "use client";

import ProtectedLayout from "../(protected)/layout";
import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FileText } from "lucide-react";
import type { Call } from "@/types";

export default function TranscriptsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "with-transcript">("all");

  useEffect(() => {
    fetch("/api/calls")
      .then((r) => r.json())
      .then(setCalls)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "with-transcript"
    ? calls.filter((c) => c.transcript && c.transcript.trim().length > 0)
    : calls;

  return (
    <ProtectedLayout>
    <div className="p-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transcripts</h1>
          <p className="mt-1 text-slate-400">
            View and search conversation transcripts
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="input-dark w-48"
        >
          <option value="all">All calls</option>
          <option value="with-transcript">With transcript</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <FileText className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p>No transcripts yet.</p>
            <p className="mt-1 text-sm">Completed calls with transcripts will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {filtered.map((call) => (
              <li key={call.id}>
                <Link
                  href={`/calls/${call.id}`}
                  className="block p-6 transition hover:bg-white/5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-white">{call.customerNumber}</p>
                      <p className="mt-0.5 text-sm text-slate-400">
                        {formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}
                        {call.scenarioType && ` · ${call.scenarioType.replace("_", " ")}`}
                      </p>
                      {call.transcript && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                          {call.transcript.slice(0, 200)}
                          {call.transcript.length > 200 ? "…" : ""}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm text-accent">View →</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
    </ProtectedLayout>
  );
}
