"use client";

// app/interview/setup/page.tsx
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Code2,
  Sparkles,
  Check,
  User,
  Layers,
} from "lucide-react";
import { SUPPORTED_LANGUAGES, getQuestionBank } from "@/lib/prompts/question-banks";

function InterviewSetupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const initialLang = searchParams.get("lang") || "javascript";

  const [selectedLang, setSelectedLang] = useState(initialLang);
  const [difficulty, setDifficulty] = useState<"junior" | "mid" | "senior">("mid");
  const [candidateName, setCandidateName] = useState("Candidate");
  const [isStarting, setIsStarting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
    if (session?.user?.name) {
      setCandidateName(session.user.name);
    }
  }, [status, session?.user?.name, router]);

  const bank = getQuestionBank(selectedLang);

  const handleStart = async () => {
    if (!candidateName.trim() || isStarting) return;
    setIsStarting(true);

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: selectedLang,
          difficulty,
          candidateName: candidateName.trim(),
        }),
      });

      if (res.status === 401) {
        router.replace("/login");
        return;
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error ${res.status}`);
      }

      const data = await res.json();
      router.push(`/interview/${data.sessionId}`);
    } catch (err: any) {
      console.error("Failed to start session:", err);
      alert(`Failed to start interview: ${err.message}`);
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffafa] text-[#1b1b1b]">
      <Header candidateName={candidateName} />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-10 space-y-8">
        {/* Title */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f4f2ee] border border-[#e5e2dc] text-xs font-bold text-[#1b1b1b]">
            <Sparkles className="h-3 w-3 text-[#2563eb]" />
            <span>Interview Setup & Stacks</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1b1b1b]">
            Configure Technical Interview
          </h1>
          <p className="text-xs sm:text-sm text-[#52525b]">
            Select your language stack, target seniority level, and candidate profile.
          </p>
        </div>

        {/* Setup Form Card */}
        <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 sm:p-8 shadow-sm space-y-8">
          {/* Step 1: Candidate Name */}
          <div className="space-y-2.5">
            <label className="text-xs font-bold uppercase tracking-wider text-[#71717a] flex items-center gap-2">
              <User className="h-4 w-4 text-[#2563eb]" />
              <span>1. Candidate Profile</span>
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g. Kowshik"
              className="w-full rounded-xl bg-[#f7f5f2] border border-[#e8e5e0] px-4 py-3 text-sm text-[#1b1b1b] placeholder-[#8c8a82] focus:border-[#1b1b1b] focus:bg-[#ffffff] focus:outline-none"
            />
            <p className="text-[11px] text-[#71717a]">
              The AI interviewer will greet you naturally by name and personalize your session.
            </p>
          </div>

          {/* Step 2: Choose Language */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#71717a] flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[#7c3aed]" />
              <span>2. Choose Technical Language</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = selectedLang.toLowerCase() === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    onClick={() => setSelectedLang(lang.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-[#1b1b1b] border-[#1b1b1b] text-[#fffafa] shadow-sm"
                        : "bg-[#f7f5f2] hover:bg-[#f2efe9] border-[#e8e5e0] text-[#1b1b1b]"
                    }`}
                  >
                    <span className="text-2xl">{lang.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{lang.name}</div>
                      <div className={`text-[10px] uppercase font-mono ${isSelected ? "text-[#a1a1aa]" : "text-[#71717a]"}`}>
                        .{lang.extension}
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-[#fffafa] shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Choose Seniority / Difficulty Level */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-[#71717a] flex items-center gap-2">
              <Layers className="h-4 w-4 text-[#059669]" />
              <span>3. Select Seniority Level</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Junior */}
              <button
                type="button"
                onClick={() => setDifficulty("junior")}
                className={`p-4 rounded-xl border text-left transition-all space-y-1.5 ${
                  difficulty === "junior"
                    ? "bg-[#1b1b1b] border-[#1b1b1b] text-[#fffafa] shadow-sm"
                    : "bg-[#f7f5f2] hover:bg-[#f2efe9] border-[#e8e5e0] text-[#1b1b1b]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Junior Level</span>
                  {difficulty === "junior" && <Check className="h-4 w-4 text-[#fffafa]" />}
                </div>
                <p className={`text-[11px] leading-relaxed ${difficulty === "junior" ? "text-[#a1a1aa]" : "text-[#52525b]"}`}>
                  Core syntax, language fundamentals, standard library, and basic algorithms.
                </p>
              </button>

              {/* Mid-Level */}
              <button
                type="button"
                onClick={() => setDifficulty("mid")}
                className={`p-4 rounded-xl border text-left transition-all space-y-1.5 ${
                  difficulty === "mid"
                    ? "bg-[#1b1b1b] border-[#1b1b1b] text-[#fffafa] shadow-sm"
                    : "bg-[#f7f5f2] hover:bg-[#f2efe9] border-[#e8e5e0] text-[#1b1b1b]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Mid-Level Engineer</span>
                  {difficulty === "mid" && <Check className="h-4 w-4 text-[#fffafa]" />}
                </div>
                <p className={`text-[11px] leading-relaxed ${difficulty === "mid" ? "text-[#a1a1aa]" : "text-[#52525b]"}`}>
                  Async patterns, concurrency, memory nuances, optimization, and real-world design.
                </p>
              </button>

              {/* Senior */}
              <button
                type="button"
                onClick={() => setDifficulty("senior")}
                className={`p-4 rounded-xl border text-left transition-all space-y-1.5 ${
                  difficulty === "senior"
                    ? "bg-[#1b1b1b] border-[#1b1b1b] text-[#fffafa] shadow-sm"
                    : "bg-[#f7f5f2] hover:bg-[#f2efe9] border-[#e8e5e0] text-[#1b1b1b]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Senior / Lead</span>
                  {difficulty === "senior" && <Check className="h-4 w-4 text-[#fffafa]" />}
                </div>
                <p className={`text-[11px] leading-relaxed ${difficulty === "senior" ? "text-[#a1a1aa]" : "text-[#52525b]"}`}>
                  Deep runtime internals, lock-free/low-level mechanics, edge case resilience.
                </p>
              </button>
            </div>
          </div>

          {/* Topics Preview */}
          <div className="p-4 rounded-xl bg-[#f7f5f2] border border-[#e8e5e0] space-y-2 text-xs">
            <span className="text-[11px] uppercase font-bold text-[#71717a]">
              Grounding Topics for {bank.displayName}:
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {bank.topics.map((topic, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-[#ffffff] border border-[#e8e5e0] text-[#1b1b1b] text-[11px] font-medium shadow-2xs"
                >
                  {topic.split("(")[0].trim()}
                </span>
              ))}
            </div>
          </div>

          {/* Launch Action */}
          <div className="pt-4 border-t border-[#e8e5e0] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-[#71717a]">
              Session runs on OpenRouter priority chain + Shunya Labs AI Voice.
            </div>

            <button
              onClick={handleStart}
              disabled={isStarting || !candidateName.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[#1b1b1b] hover:bg-[#333333] text-[#fffafa] font-semibold text-sm shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <span>{isStarting ? "Initializing Interview..." : "Launch Technical Interview"}</span>
              <ArrowRight className={`h-4 w-4 ${isStarting ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function InterviewSetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#fffafa] text-[#1b1b1b]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 rounded-full border-2 border-[#1b1b1b] border-t-transparent animate-spin" />
            <p className="text-xs text-[#71717a] font-mono">Loading setup parameters...</p>
          </div>
        </div>
      }
    >
      <InterviewSetupContent />
    </Suspense>
  );
}
