import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createVapiPhoneCall, type ScenarioType } from "@/lib/vapi";

export const dynamic = "force-dynamic";

export async function GET() {
  const calls = await prisma.call.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { script: true },
  });
  return NextResponse.json(calls);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerNumber, scenario, scriptId } = body as {
      customerNumber: string;
      scenario: ScenarioType;
      scriptId?: string | null;
    };

    if (!customerNumber || !scenario) {
      return NextResponse.json(
        { error: "customerNumber and scenario are required" },
        { status: 400 }
      );
    }

    let assistantOverrides: { firstMessage?: string; systemPrompt?: string } | undefined;
    if (scriptId) {
      const script = await prisma.agentScript.findUnique({
        where: { id: scriptId, isActive: true },
      });
      if (script) {
        assistantOverrides = {
          firstMessage: script.firstMessage,
          systemPrompt: script.systemPrompt,
        };
      }
    }

    const normalizedNumber = customerNumber.replace(/\D/g, "").replace(/^(\d)/, "+$1");
    const result = await createVapiPhoneCall({
      customerNumber: normalizedNumber,
      scenario: scenario as ScenarioType,
      scriptId: scriptId ?? null,
      assistantOverrides,
    });

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const call = await prisma.call.create({
      data: {
        vapiCallId: result.callId ?? undefined,
        customerNumber: normalizedNumber,
        status: "scheduled",
        scenarioType: scenario,
        scriptId: scriptId ?? undefined,
      },
    });

    return NextResponse.json({ callId: result.callId, status: "scheduled", call });
  } catch (e) {
    console.error("Create call error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create call" },
      { status: 500 }
    );
  }
}
