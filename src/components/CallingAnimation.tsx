"use client";

import { Phone } from "lucide-react";

type Props = {
  /** Phone number or label to show under "Calling" */
  number?: string;
  /** Compact mode for list items */
  compact?: boolean;
  /** Optional status line: "Ringing", "Connecting", etc. */
  status?: "calling" | "ringing" | "connecting" | "in-progress";
};

const statusText: Record<NonNullable<Props["status"]>, string> = {
  calling: "Calling",
  ringing: "Ringing",
  connecting: "Connecting",
  "in-progress": "On call",
};

export function CallingAnimation({ number, compact, status = "calling" }: Props) {
  const text = statusText[status];

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative flex h-8 w-8 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-accent/30" style={{ animationDuration: "1.5s" }} />
          <Phone className="relative h-4 w-4 animate-phone-ring text-accent" />
        </div>
        <span className="animate-calling-dots flex text-sm font-medium text-accent">
          {text}
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-accent/30 bg-accent/5 py-8 px-6">
      {/* Ripple rings */}
      <div className="relative flex h-24 w-24 items-center justify-center">
        <div className="absolute h-20 w-20 rounded-full border-2 border-accent/40 animate-ripple" />
        <div className="absolute h-20 w-20 rounded-full border-2 border-accent/30 animate-ripple" style={{ animationDelay: "0.5s" }} />
        <div className="absolute h-20 w-20 rounded-full border-2 border-accent/20 animate-ripple" style={{ animationDelay: "1s" }} />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
          <Phone className="h-8 w-8 animate-phone-ring text-accent" />
        </div>
      </div>

      {/* "Calling..." text with animated dots */}
      <p className="mt-6 flex items-center gap-0.5 text-lg font-semibold text-white">
        <span>{text}</span>
        <span className="animate-calling-dots inline-flex">
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </span>
      </p>

      {/* Sound bars */}
      <div className="mt-4 flex items-end justify-center gap-1 h-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="calling-sound-bar"
            style={{ animationDelay: `${i * 0.12}s` }}
          />
        ))}
      </div>

      {number && (
        <p className="mt-4 text-sm text-slate-400 font-mono">{number}</p>
      )}
    </div>
  );
}
