"use client";

import { useState, useEffect } from "react";
import { Phone, Loader2, Calendar, Package, MessageCircle } from "lucide-react";
import { TriggerCallForm } from "@/components/TriggerCallForm";
import { CallList } from "@/components/CallList";
import type { Call } from "@/types";
import ProtectedLayout from "./(protected)/layout";

export default function DashboardPage() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/calls")
      .then((r) => r.json())
      .then(setCalls)
      .finally(() => setLoading(false));
  }, []);

  const onCallScheduled = (newCall: Call) => {
    setCalls((prev) => [newCall, ...prev]);
  };

  return (
    <ProtectedLayout>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="mt-1 text-slate-400">
            Trigger demo calls and view recent activity
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="card p-6">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                <Phone className="h-5 w-5 text-accent" />
                Trigger a call
              </h2>
              <TriggerCallForm onSuccess={onCallScheduled} />
            </div>
            <div className="mt-6 rounded-xl border border-white/5 bg-surface-800/60 p-4">
              <p className="text-sm text-slate-400">
                <strong className="text-slate-300">Scenarios:</strong>
                <br />
                <span className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Appointment – schedule a demo
                </span>
                <span className="flex items-center gap-2">
                  <Package className="h-4 w-4" /> Product – explain 3 packages
                </span>
                <span className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" /> Feedback – satisfaction
                  (1–3)
                </span>
              </p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="mb-4 rounded-lg border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">
              <strong>Calls are placed immediately.</strong> When you trigger a
              call, VAPI rings the customer within a few seconds. Status
              updates to "Ringing" and "Completed" when the call progresses (or
              use the call detail page to refresh).
            </div>
            <div className="card p-6">
              <h2 className="mb-4 text-lg font-semibold text-white">
                Recent calls
              </h2>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-accent" />
                </div>
              ) : (
                <CallList calls={calls} compact />
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  );
}