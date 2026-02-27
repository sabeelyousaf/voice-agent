import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setSessionCookie, verifyPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = (await request.json()) as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
    }

    setSessionCookie({ userId: user.id, onboardingDone: user.onboardingDone });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed to login" },
      { status: 500 }
    );
  }
}

