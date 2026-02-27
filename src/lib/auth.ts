import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { prisma } from "./db";

const SESSION_COOKIE = "va_session";
const JWT_SECRET = process.env.AUTH_SECRET || "dev-secret-change-me";

export type SessionPayload = {
  userId: string;
  onboardingDone: boolean;
};

export function setSessionCookie(payload: SessionPayload) {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getCurrentUser() {
  const cookie = cookies().get(SESSION_COOKIE);
  if (!cookie?.value) return null;
  try {
    const decoded = jwt.verify(cookie.value, JWT_SECRET) as SessionPayload;
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    return user;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

