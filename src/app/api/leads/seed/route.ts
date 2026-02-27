import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Simple dev-only seeding endpoint. Call manually via POST /api/leads/seed
export async function POST(_req: NextRequest) {
  const now = new Date();

  const created = await prisma.lead.createMany({
    data: [
      {
        name: "John Demo",
        email: "john.demo@example.com",
        phone: "+12025550111",
        message: "Interested in a product demo next week.",
        source: "demo-seed",
        status: "new",
        tags: "demo,website",
        callStatus: "pending",
        callAttempts: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Sarah Funnel",
        email: "sarah@example.com",
        phone: "+12025550222",
        message: "Came from marketing funnel A.",
        source: "funnel-a",
        status: "new",
        tags: "funnel-a",
        callStatus: "pending",
        callAttempts: 0,
        createdAt: now,
        updatedAt: now,
      },
      {
        name: "Priya Retarget",
        email: "priya@example.com",
        phone: "+12025550333",
        message: "Wants pricing details.",
        source: "retargeting-ad",
        status: "contacted",
        tags: "retarget",
        callStatus: "pending",
        callAttempts: 1,
        createdAt: now,
        updatedAt: now,
      },
    ],
    skipDuplicates: true,
  });

  return NextResponse.json({ ok: true, created: created.count });
}

