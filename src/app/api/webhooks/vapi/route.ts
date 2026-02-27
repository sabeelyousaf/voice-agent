import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

type VapiMessage = {
  message?: { type?: string };
  call?: {
    id?: string;
    status?: string;
    startedAt?: string;
    endedAt?: string;
    transcript?: string;
    recordingUrl?: string;
    metadata?: Record<string, unknown>;
  };
};

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as VapiMessage;
    const type = payload.message?.type;

    if (type === "end-of-call-report" && payload.call) {
      const call = payload.call;
      const vapiId = call.id;
      if (!vapiId) return NextResponse.json({ ok: true });

      const startedAt = call.startedAt ? new Date(call.startedAt) : null;
      const endedAt = call.endedAt ? new Date(call.endedAt) : null;
      let durationSeconds: number | null = null;
      if (startedAt && endedAt) {
        durationSeconds = Math.round((endedAt.getTime() - startedAt.getTime()) / 1000);
      }

      await prisma.call.upsert({
        where: { vapiCallId: vapiId },
        create: {
          vapiCallId: vapiId,
          customerNumber: (call.metadata as { customerNumber?: string })?.customerNumber ?? "unknown",
          status: call.status ?? "completed",
          transcript: call.transcript ?? undefined,
          recordingUrl: call.recordingUrl ?? undefined,
          startedAt,
          endedAt,
          durationSeconds,
          metadata: (call.metadata ?? call) as object,
        },
        update: {
          status: call.status ?? "completed",
          transcript: call.transcript ?? undefined,
          recordingUrl: call.recordingUrl ?? undefined,
          endedAt,
          durationSeconds,
          metadata: (call.metadata ?? call) as object,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("VAPI webhook error:", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
