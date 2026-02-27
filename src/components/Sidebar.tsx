"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Phone,
  ListOrdered,
  FileText,
  Settings,
  Mic,
  Users,
  LogOut,
} from "lucide-react";
import clsx from "clsx";

const nav = [
  { href: "/", label: "Dashboard", icon: Phone },
  { href: "/calls", label: "Call Logs", icon: ListOrdered },
  { href: "/transcripts", label: "Transcripts", icon: FileText },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/admin", label: "Admin & Scripts", icon: Settings },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-white/5 bg-surface-800/95 backdrop-blur-sm overflow-y-auto">
      <div className="flex h-16 items-center gap-2 border-b border-white/5 px-4">
        <Mic className="h-6 w-6 text-accent" />
        <span className="font-semibold text-white">Voice Agent</span>
      </div>
      <div className="flex flex-1 flex-col">
        <nav className="flex flex-1 flex-col gap-0.5 p-3">
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                pathname === href
                  ? "bg-accent/15 text-accent"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          onClick={async () => {
            try {
              await fetch("/api/auth/logout", { method: "POST" });
            } catch {
              // ignore network/logout errors for now
            } finally {
              window.location.href = "/auth/login";
            }
          }}
          className="m-3 mt-0 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );
}
