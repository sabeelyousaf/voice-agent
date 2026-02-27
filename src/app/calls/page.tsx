 "use client";

import ProtectedLayout from "../(protected)/layout";
import { useState, useEffect } from "react";
import { CallList } from "@/components/CallList";
import type { Call } from "@/types";

export default function CallsPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calls")
      .then((r) => r.json())
      .then(setCalls)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ProtectedLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Call logs</h1>
          <p className="mt-1 text-slate-400">
            All scheduled and completed calls with duration and status
          </p>
        </div>
        <div className="card p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : (
            <CallList calls={calls} />
          )}
        </div>
      </div>
    </ProtectedLayout>
  );
}
