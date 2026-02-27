 "use client";

import { Sidebar } from "@/components/Sidebar";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type MinimalSettings = {
  vapiApiKey?: string | null;
  vapiPhoneNumberId?: string | null;
};

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [needsVapi, setNeedsVapi] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => {
        if (r.status === 401) {
          const next = encodeURIComponent(pathname);
          window.location.href = `/auth/login?next=${next}`;
          return null;
        }
        return r.ok ? r.json() : null;
      })
      .then((settings: MinimalSettings | null) => {
        if (settings === null && pathname) return;
        const missing = !settings?.vapiApiKey || !settings?.vapiPhoneNumberId;
        setNeedsVapi(missing);
      })
      .catch(() => {
        setNeedsVapi(true);
      })
      .finally(() => setLoading(false));
  }, [pathname]);

  let content: ReactNode = children;

  if (loading) {
    content = (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
          <span>Checking voice agent configuration…</span>
        </div>
      </div>
    );
  } else if (needsVapi && pathname !== "/settings") {
    content = (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="max-w-lg rounded-2xl border border-amber-500/40 bg-amber-500/10 p-6 text-sm text-amber-100">
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <h2 className="text-base font-semibold text-amber-100">
              Connect VAPI to start calling leads
            </h2>
          </div>
          <p className="mb-3 text-amber-50/90">
            Before using the dashboard, please add your VAPI API key and phone number ID in Settings.
          </p>
          <Link
            href="/settings"
            className="btn-primary inline-flex items-center gap-2 text-xs"
          >
            Open Settings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-800">
      <Sidebar />
      <main className="ml-56 min-h-screen overflow-auto">{content}</main>
    </div>
  );
}

