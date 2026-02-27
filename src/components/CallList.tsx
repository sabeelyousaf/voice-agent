"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Phone, Clock, Calendar, Package, MessageCircle } from "lucide-react";
import { CallingAnimation } from "./CallingAnimation";
import type { Call } from "@/types";
import clsx from "clsx";

const scenarioIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  appointment: Calendar,
  product_info: Package,
  feedback: MessageCircle,
};

const statusColors: Record<string, string> = {
  scheduled: "bg-amber-500/20 text-amber-400",
  initiated: "bg-amber-500/20 text-amber-400",
  ringing: "bg-blue-500/20 text-blue-400 animate-pulse-soft",
  "in-progress": "bg-emerald-500/20 text-emerald-400",
  completed: "bg-slate-500/20 text-slate-300",
  failed: "bg-red-500/20 text-red-400",
  "no-answer": "bg-orange-500/20 text-orange-400",
};

const statusLabels: Record<string, string> = {
  scheduled: "Calling now…",
  initiated: "Calling now…",
  ringing: "Ringing",
  "in-progress": "In progress",
  completed: "Completed",
  failed: "Failed",
  "no-answer": "No answer",
};

type Props = { calls: Call[]; compact?: boolean };

export function CallList({ calls, compact }: Props) {
  if (calls.length === 0) {
    return (
      <p className="py-8 text-center text-slate-500">
        No calls yet. Trigger a demo call from the form.
      </p>
    );
  }

  return (
    <ul className={clsx("space-y-2", compact && "max-h-[420px] overflow-y-auto")}>
      {calls.map((call) => {
        const ScenarioIcon = scenarioIcons[call.scenarioType ?? ""] ?? Phone;
        const statusClass = statusColors[call.status] ?? "bg-surface-500 text-slate-400";
        const statusLabel = statusLabels[call.status] ?? call.status;
        const isLive = ["scheduled", "initiated", "ringing", "in-progress"].includes(call.status);
        return (
          <li key={call.id}>
            <Link
              href={`/calls/${call.id}`}
              className={clsx(
                "flex items-center gap-4 rounded-lg border p-4 transition",
                isLive
                  ? "border-accent/30 bg-accent/5 hover:border-accent/40 hover:bg-accent/10"
                  : "border-white/5 bg-surface-700/50 hover:border-white/10 hover:bg-surface-700"
              )}
            >
              <div className={clsx(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                isLive ? "bg-accent/20" : "bg-accent/20 text-accent"
              )}>
                <ScenarioIcon className={clsx("h-5 w-5 text-accent", isLive && "animate-phone-ring")} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">
                  {call.customerNumber}
                </p>
                <p className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="h-3.5 w-3.5 shrink-0" />
                  {formatDistanceToNow(new Date(call.createdAt), { addSuffix: true })}
                  {call.durationSeconds != null && (
                    <> · {call.durationSeconds}s</>
                  )}
                </p>
              </div>
              {isLive ? (
                <div className="shrink-0">
                  <CallingAnimation compact status={call.status === "in-progress" ? "in-progress" : call.status === "ringing" ? "ringing" : "calling"} />
                </div>
              ) : (
                <span
                  className={clsx(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                    statusClass
                  )}
                  title={call.status === "scheduled" || call.status === "initiated" ? "VAPI places the call immediately; phone should ring within seconds." : undefined}
                >
                  {statusLabel}
                </span>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
