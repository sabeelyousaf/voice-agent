"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Mail, User } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-800">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface-800/90 p-8 shadow-2xl">
        <h1 className="mb-2 text-2xl font-semibold text-white">Create your account</h1>
        <p className="mb-6 text-sm text-slate-400">
          Set up your login to start using the voice agent CRM.
        </p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-slate-300">
              <User className="h-4 w-4" />
              Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-dark"
              placeholder="Your name"
            />
          </div>
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
          <div>
            <label className="mb-1.5 text-sm font-medium text-slate-300">
              Confirm password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
            {loading ? "Creating account…" : "Sign up"}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/auth/login")}
            className="text-accent hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}

