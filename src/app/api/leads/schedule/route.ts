import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createVapiPhoneCall, type ScenarioType } from "@/lib/vapi";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 3;
const DEFAULT_SCENARIO: ScenarioType = "appointment";

function computeNextCallAt(attempt: number, from: Date) {
  if (attempt >= MAX_ATTEMPTS) return null;
  const next = new Date(from);
  if (attempt === 1) next.setHours(next.getHours() + 4); // 4h later
  else if (attempt === 2) next.setHours(next.getHours() + 8); // 8h later
  else next.setDate(next.getDate() + 1); // next day fallback
  return next;
}

export async function POST(request: NextRequest) {
  const now = new Date();

  try {
    let scenario: ScenarioType = DEFAULT_SCENARIO;
    let scriptId: string | null = null;

    try {
      const body = await request.json().catch(() => null as any);
      if (body && typeof body === "object") {
        if (body.scenario === "appointment" || body.scenario === "product_info" || body.scenario === "feedback") {
          scenario = body.scenario;
        }
        if (typeof body.scriptId === "string") {
          scriptId = body.scriptId;
        }
      }
    } catch {
      // ignore body parse errors, fall back to defaults
    }

    const script = scriptId
      ? await prisma.agentScript.findUnique({
          where: { id: scriptId, isActive: true },
        })
      : null;

    const assistantOverrides = script
      ? {
          firstMessage: script.firstMessage,
          systemPrompt: script.systemPrompt,
        }
      : undefined;

    const leads = await prisma.lead.findMany({
      where: {
        // must have a phone number
        phone: { not: null },
      },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    if (leads.length === 0) {
      return NextResponse.json({ ok: true, message: "No leads need calling right now." });
    }

    const results: Array<{ leadId: string; ok: boolean; error?: string }> = [];

    for (const lead of leads) {
      const phone = lead.phone?.trim();
      if (!phone) continue;

      const normalizedNumber = phone.replace(/\D/g, "").replace(/^(\d)/, "+$1");

      const meta = (lead.metadata as any) || {};
      const previousAttempts = typeof meta.callAttempts === "number" ? meta.callAttempts : 0;
      const attemptNumber = previousAttempts + 1;
      if (attemptNumber > MAX_ATTEMPTS) {
        continue;
      }

      try {
        const result = await createVapiPhoneCall({
          customerNumber: normalizedNumber,
          scenario,
          scriptId: script?.id ?? null,
          assistantOverrides,
        });

        const success = !result.error && !!result.callId;

        const nextCallAt = computeNextCallAt(attemptNumber, now);

        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            metadata: {
              ...meta,
              callAttempts: attemptNumber,
              lastCallAt: now.toISOString(),
              nextCallAt: nextCallAt ? nextCallAt.toISOString() : null,
              lastCall: {
                vapiCallId: result.callId ?? null,
                at: now.toISOString(),
                success,
                error: result.error ?? null,
              },
            },
          },
        });

        results.push({ leadId: lead.id, ok: success, error: result.error });
      } catch (e) {
        const error = e instanceof Error ? e.message : "Unknown error";
        await prisma.lead.update({
          where: { id: lead.id },
          data: {
            metadata: {
              ...meta,
              callAttempts: attemptNumber,
              lastCallAt: now.toISOString(),
              nextCallAt: computeNextCallAt(attemptNumber, now)?.toISOString() ?? null,
            },
          },
        });
        results.push({ leadId: lead.id, ok: false, error });
      }
    }

    return NextResponse.json({ ok: true, processed: results.length, results });
  } catch (e) {
    console.error("Lead scheduler error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Scheduler failed" },
      { status: 500 }
    );
  }
}

