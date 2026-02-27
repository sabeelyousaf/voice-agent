import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureWorkspaceSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return NextResponse.json(leads);
}

export async function POST(request: NextRequest) {
  try {
    const settings = await ensureWorkspaceSettings();

    const apiKeyHeader = request.headers.get("x-api-key") ?? undefined;
    const { searchParams } = new URL(request.url);
    const apiKeyQuery = searchParams.get("apiKey") ?? undefined;
    const providedKey = apiKeyHeader || apiKeyQuery;

    if (!providedKey || providedKey !== settings.integrationApiKey) {
      return NextResponse.json(
        { error: "Unauthorized: invalid integration API key" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      email,
      phone,
      message,
      source,
      status,
      tags,
      metadata,
    } = body as {
      name?: string;
      email?: string;
      phone?: string;
      message?: string;
      source?: string;
      status?: string;
      tags?: string;
      metadata?: unknown;
    };

    const lead = await prisma.lead.create({
      data: {
        name: name ?? null,
        email: email ?? null,
        phone: phone ?? null,
        message: message ?? null,
        source: source ?? "integration",
        status: status ?? "new",
        tags: tags ?? null,
        metadata: metadata as object | undefined,
      },
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (e) {
    console.error("Create lead error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to create lead" },
      { status: 500 }
    );
  }
}

