import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { name, scenarioType, systemPrompt, firstMessage, options, isActive } = body;
  const script = await prisma.agentScript.update({
    where: { id },
    data: {
      ...(name != null && { name }),
      ...(scenarioType != null && { scenarioType }),
      ...(systemPrompt != null && { systemPrompt }),
      ...(firstMessage != null && { firstMessage }),
      ...(options != null && { options }),
      ...(isActive != null && { isActive }),
    },
  });
  return NextResponse.json(script);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.agentScript.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
