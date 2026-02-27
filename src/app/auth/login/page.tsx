"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");
  const nextUrl = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }
      router.push(nextUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-800">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-800/90 p-8 shadow-2xl">
        <h1 className="mb-2 text-2xl font-semibold text-white">Welcome back</h1>
        <p className="mb-6 text-sm text-slate-400">
          Log in to access your voice agent dashboard.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Mail className="h-4 w-4" />
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dark"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Lock className="h-4 w-4" />
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-dark"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex w-full items-center justify-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/register")}
            className="text-accent hover:underline"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-surface-800">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}

