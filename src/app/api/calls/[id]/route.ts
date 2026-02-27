import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
  return NextResponse.json(call);
}
