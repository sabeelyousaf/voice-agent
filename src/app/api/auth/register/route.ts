import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = (await request.json()) as {
      email?: string;
      password?: string;
      name?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name ?? null,
      },
    });

    setSessionCookie({ userId: user.id, onboardingDone: user.onboardingDone });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Register error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to register" },
      { status: 500 }
    );
  }
}

