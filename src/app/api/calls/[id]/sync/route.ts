import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getVapiCall } from "@/lib/vapi";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const call = await prisma.call.findFirst({
    where: { OR: [{ id }, { vapiCallId: id }] },
    include: { script: true },
  });
  if (!call) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const vapiId = call.vapiCallId;
  if (!vapiId) return NextResponse.json(call);

  const vapi = await getVapiCall(vapiId);
  if (!vapi) return NextResponse.json(call);

  const updates: {
    status?: string;
    transcript?: string | null;
    recordingUrl?: string | null;
    endedAt?: Date | null;
    durationSeconds?: number | null;
  } = {};
  if (vapi.status) updates.status = vapi.status;
  if (vapi.transcript != null) updates.transcript = vapi.transcript;
  if (vapi.recordingUrl != null) updates.recordingUrl = vapi.recordingUrl;

  const updated = await prisma.call.update({
    where: { id: call.id },
    data: updates,
    include: { script: true },
  });
  return NextResponse.json(updated);
}
