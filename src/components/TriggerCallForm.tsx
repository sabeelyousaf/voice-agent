"use client";

import { useState, useEffect } from "react";
import { Phone, Loader2 } from "lucide-react";
import { CallingAnimation } from "./CallingAnimation";
import type { Call, AgentScript } from "@/types";

const SCENARIOS = [
  { value: "appointment", label: "Appointment booking" },
  { value: "product_info", label: "Product information" },
  { value: "feedback", label: "Customer feedback" },
] as const;

type Props = { onSuccess?: (call: Call) => void };

export function TriggerCallForm({ onSuccess }: Props) {
  const [phone, setPhone] = useState("");
  const [scenario, setScenario] = useState<"appointment" | "product_info" | "feedback">("appointment");
  const [scriptId, setScriptId] = useState<string>("");
  const [scripts, setScripts] = useState<AgentScript[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [callingNumber, setCallingNumber] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/scripts")
      .then((r) => r.json())
      .then(setScripts);
  }, []);

  const scenarioScripts = scripts.filter((s) => s.scenarioType === scenario && s.isActive);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/calls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerNumber: phone.trim(),
          scenario,
          scriptId: scriptId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create call");
      setSuccess(true);
      setCallingNumber(phone.trim());
      setPhone("");
      if (data.call) onSuccess?.(data.call);
      setTimeout(() => setCallingNumber(null), 8000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {(loading || callingNumber) && (
        <div className="mb-6">
          <CallingAnimation
            number={callingNumber ?? (loading ? phone.trim() || undefined : undefined)}
            status={loading ? "connecting" : "calling"}
          />
        </div>
      )}
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Customer number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1234567890"
            className="input-dark"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-300">
            Scenario
          </label>
          <select
            value={scenario}
            onChange={(e) => {
              setScenario(e.target.value as typeof scenario);
              setScriptId("");
            }}
            className="input-dark"
            disabled={loading}
          >
            {SCENARIOS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        {scenarioScripts.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">
              Script (optional)
            </label>
            <select
              value={scriptId}
              onChange={(e) => setScriptId(e.target.value)}
              className="input-dark"
              disabled={loading}
            >
              <option value="">Default script</option>
              {scenarioScripts.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
        {success && !callingNumber && (
          <p className="text-sm text-green-400">
            Call placed. The customer&apos;s phone should ring within a few seconds.
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="btn-primary flex w-full items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Phone className="h-4 w-4" />
          )}
          {loading ? "Initiating…" : "Trigger call"}
        </button>
      </form>
    </div>
  );
}
