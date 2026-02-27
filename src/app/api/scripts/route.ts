import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const scripts = await prisma.agentScript.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(scripts);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, scenarioType, systemPrompt, firstMessage, options, isActive } = body as {
      name: string;
      scenarioType: string;
      systemPrompt: string;
      firstMessage: string;
      options?: object;
      isActive?: boolean;
    };
    if (!name || !scenarioType || !systemPrompt || !firstMessage) {
      return NextResponse.json(
        { error: "name, scenarioType, systemPrompt, firstMessage required" },
        { status: 400 }
      );
    }
    const script = await prisma.agentScript.create({
      data: {
        name,
        scenarioType,
        systemPrompt,
        firstMessage,
        options: options ?? undefined,
        isActive: isActive ?? true,
      },
    });
    return NextResponse.json(script);
  } catch (e) {
    console.error("Create script error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create script" },
      { status: 500 }
    );
  }
}
