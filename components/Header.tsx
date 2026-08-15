"use client";

// components/Header.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, LayoutDashboard, PlusCircle, FileText } from "lucide-react";

interface HeaderProps {
  sessionState?: string;
  language?: string;
  candidateName?: string;
}

export default function Header({ sessionState, language, candidateName }: HeaderProps) {
  const pathname = usePathname();
  const isLiveInterview = pathname?.includes("/interview/") && !pathname.endsWith("/setup") && !pathname.endsWith("/report");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#e8e5e0] bg-[#fffafa]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1b1b1b] text-[#fffafa] shadow-sm group-hover:scale-105 transition-all">
              <Terminal className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-[#1b1b1b] flex items-center gap-1.5">
                AI Technical Interviewer
                <span className="inline-flex items-center rounded-md bg-[#f2efe9] px-1.5 py-0.5 text-[10px] font-semibold text-[#52525b] border border-[#e2ded6]">
                  Adaptive
                </span>
              </span>
              <span className="text-[11px] text-[#71717a]">Engineering Evaluation Platform</span>
            </div>
          </Link>
        </div>

        {/* Center: Live Session Indicators */}
        {isLiveInterview && sessionState && (
          <div className="hidden md:flex items-center gap-2.5 rounded-full bg-[#f7f5f0] border border-[#e5e2dc] px-4 py-1.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="text-xs font-semibold text-[#1b1b1b]">Live Session:</span>
            </div>
            {language && (
              <span className="rounded bg-[#ebe8e1] px-2 py-0.5 text-xs font-semibold text-[#1b1b1b] uppercase border border-[#dedad2]">
                {language}
              </span>
            )}
            <span className="text-xs text-[#52525b] font-medium">
              Live Technical Interview
            </span>
          </div>
        )}

        {/* Right Navigation Controls */}
        <div className="flex items-center gap-3">
          <Link
            href="/blog"
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              pathname === "/blog" || pathname.startsWith("/blog/")
                ? "bg-[#1b1b1b] text-[#fffafa]"
                : "text-[#52525b] hover:text-[#1b1b1b] hover:bg-[#f2efe9]"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Blog</span>
          </Link>

          <Link
            href="/dashboard"
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
              pathname === "/dashboard"
                ? "bg-[#1b1b1b] text-[#fffafa]"
                : "text-[#52525b] hover:text-[#1b1b1b] hover:bg-[#f2efe9]"
            }`}
          >
            <LayoutDashboard className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>

          <Link
            href="/interview/setup"
            className="flex items-center gap-1.5 rounded-xl bg-[#1b1b1b] px-4 py-2 text-xs font-semibold text-[#fffafa] shadow-sm hover:bg-[#333333] transition-all active:scale-[0.98]"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            <span>New Interview</span>
          </Link>

          {candidateName && (
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-[#e8e5e0]">
              <div className="h-7 w-7 rounded-full bg-[#f2efe9] border border-[#dedad2] flex items-center justify-center text-xs font-bold text-[#1b1b1b]">
                {candidateName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-[#1b1b1b] max-w-[100px] truncate">
                {candidateName}
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
