"use client";

// app/dashboard/page.tsx
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  PlusCircle,
  Calendar,
  Code2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { SUPPORTED_LANGUAGES } from "@/lib/prompts/question-banks";

interface SessionSummary {
  id: string;
  candidateName?: string | null;
  language: string;
  difficulty: string;
  state: string;
  status: string;
  finalScore?: number | null;
  recommendation?: string | null;
  createdAt: string;
  completedAt?: string | null;
  _count?: { turns: number };
}

export default function DashboardPage() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [candidateName, setCandidateName] = useState("Kowshik");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedName = localStorage.getItem("ai_interviewer_candidate_name");
      if (storedName) setCandidateName(storedName);
    }

    async function loadSessions() {
      try {
        const res = await fetch("/api/sessions");
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error("Failed to load past sessions:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSessions();
  }, []);

  const completedSessions = sessions.filter((s) => s.status === "completed" || s.finalScore);
  const avgScore =
    completedSessions.length > 0
      ? Math.round(
          completedSessions.reduce((acc, s) => acc + (s.finalScore || 0), 0) / completedSessions.length
        )
      : 82;

  return (
    <div className="min-h-screen flex flex-col bg-[#fffafa] text-[#1b1b1b]">
      <Header candidateName={candidateName} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 sm:p-8 shadow-sm">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2563eb]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Candidate Technical Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b1b1b] tracking-tight">
              Welcome back, {candidateName}
            </h1>
            <p className="text-xs sm:text-sm text-[#52525b]">
              Track your interview scores, evaluate your progress across languages, and launch mock interviews.
            </p>
          </div>

          <Link
            href="/interview/setup"
            className="hidden items-center gap-2 px-5 py-3 rounded-xl bg-[#1b1b1b] hover:bg-[#333333] text-[#fffafa] text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-[0.98] self-start sm:self-center"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Start New Interview</span>
          </Link>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#71717a] font-bold uppercase tracking-wider">
              <span>Total Sessions</span>
              <Calendar className="h-4 w-4 text-[#2563eb]" />
            </div>
            <div className="text-3xl font-black text-[#1b1b1b] font-mono">
              {sessions.length}
            </div>
            <p className="text-[11px] text-[#71717a]">Recorded across all languages</p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#71717a] font-bold uppercase tracking-wider">
              <span>Average Score</span>
              <TrendingUp className="h-4 w-4 text-[#059669]" />
            </div>
            <div className="text-3xl font-black text-[#1b1b1b] font-mono flex items-baseline gap-1">
              <span>{avgScore}</span>
              <span className="text-sm font-semibold text-[#71717a]">/100</span>
            </div>
            <p className="text-[11px] text-[#71717a]">Aggregated performance benchmark</p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 space-y-2 shadow-sm">
            <div className="flex items-center justify-between text-xs text-[#71717a] font-bold uppercase tracking-wider">
              <span>Supported Stacks</span>
              <Code2 className="h-4 w-4 text-[#7c3aed]" />
            </div>
            <div className="text-3xl font-black text-[#1b1b1b] font-mono">
              9 Languages
            </div>
            <p className="text-[11px] text-[#71717a]">JS, Python, Java, C, C++, C#, SQL, HTML, CSS</p>
          </div>
        </div>

        {/* Past Sessions List */}
        <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-extrabold text-[#1b1b1b] tracking-tight">
              Interview Session History
            </h2>
            <p className="text-xs text-[#71717a]">
              Detailed transcripts, rubrics, and hiring committee evaluations
            </p>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-xs text-[#71717a] animate-pulse">
              Loading past interviews...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 space-y-4 border border-dashed border-[#e8e5e0] rounded-2xl bg-[#f7f5f2]">
              <Code2 className="h-10 w-10 text-[#8c8a82] mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-[#1b1b1b]">No interviews recorded yet</h3>
                <p className="text-xs text-[#52525b] max-w-sm mx-auto">
                  Pick any language from Python, JavaScript, Java, C++, SQL, and more to test your technical skills.
                </p>
              </div>
              <Link
                href="/interview/setup"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b1b1b] hover:bg-[#333333] text-[#fffafa] text-xs font-semibold shadow-sm transition-all"
              >
                <span>Launch Your First Interview</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((sess) => {
                const langConfig = SUPPORTED_LANGUAGES.find(
                  (l) => l.id === sess.language.toLowerCase()
                );
                const isComplete = sess.status === "completed" || sess.state === "REPORT_GENERATED" || sess.state === "WRAP_UP";
                const dateStr = new Date(sess.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                return (
                  <div
                    key={sess.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#f7f5f2] hover:bg-[#f2efe9] border border-[#e8e5e0] transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ffffff] border border-[#e8e5e0] text-lg shadow-2xs">
                        {langConfig?.icon || "💻"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#1b1b1b]">
                            {langConfig?.name || sess.language.toUpperCase()} Interview
                          </h4>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#ebe8e1] text-[#1b1b1b] border border-[#dedad2]">
                            {sess.difficulty}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[#71717a] mt-0.5">
                          <span>{dateStr}</span>
                          <span>•</span>
                          <span>Stage: {sess.state.replace(/_/g, " ")}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-center">
                      {isComplete ? (
                        <div className="text-right">
                          <div className="text-sm font-extrabold text-[#059669] font-mono">
                            {sess.finalScore ? `${Math.round(sess.finalScore)}%` : "Complete"}
                          </div>
                          <span className="text-[10px] uppercase font-bold text-[#71717a]">
                            {sess.recommendation?.replace(/_/g, " ") || "Scorecard Ready"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-[#d97706] font-bold bg-[#fef3c7] px-2.5 py-1 rounded-md border border-[#fde68a]">
                          In Progress
                        </span>
                      )}

                      <Link
                        href={isComplete ? `/interview/${sess.id}/report` : `/interview/${sess.id}`}
                        className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isComplete
                            ? "bg-[#1b1b1b] text-[#fffafa] hover:bg-[#333333]"
                            : "bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
                        }`}
                      >
                        <span>{isComplete ? "View Scorecard" : "Resume"}</span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
