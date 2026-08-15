"use client";

// app/(auth)/login/page.tsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Terminal, User, Mail, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [name, setName] = useState("Kowshik");
  const [email, setEmail] = useState("kowshik@example.com");
  const [isLoading, setIsLoading] = useState(false);

  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);

    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("ai_interviewer_candidate_name", name.trim());
        localStorage.setItem("ai_interviewer_candidate_email", email.trim());
      }
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-[#fffafa] text-[#1b1b1b]">
      {/* Brand */}
      <div className="mb-8 text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1b1b1b] text-[#fffafa] shadow-sm">
            <Terminal className="h-5 w-5" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-[#1b1b1b]">
            AI Technical Interviewer
          </span>
        </Link>
        <p className="text-xs text-[#71717a]">Candidate profile setup & technical evaluation workspace</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-8 shadow-sm space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold text-[#1b1b1b]">Candidate Sign In</h2>
          <p className="text-xs text-[#52525b]">Personalize your interviewer greeting and evaluation logs</p>
        </div>

        <form onSubmit={handleGuestLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1b1b1b] flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-[#2563eb]" />
              <span>Full Name</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Kowshik"
              className="w-full rounded-xl bg-[#f7f5f2] border border-[#e8e5e0] px-4 py-3 text-sm text-[#1b1b1b] placeholder-[#8c8a82] focus:border-[#1b1b1b] focus:outline-none focus:bg-[#ffffff]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1b1b1b] flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#2563eb]" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kowshik@example.com"
              className="w-full rounded-xl bg-[#f7f5f2] border border-[#e8e5e0] px-4 py-3 text-sm text-[#1b1b1b] placeholder-[#8c8a82] focus:border-[#1b1b1b] focus:outline-none focus:bg-[#ffffff]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#1b1b1b] hover:bg-[#333333] text-[#fffafa] font-semibold text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span>{isLoading ? "Signing in..." : "Continue to Dashboard"}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-[#e8e5e0] text-center text-xs text-[#71717a]">
          <p>The AI interviewer will greet you naturally by name.</p>
        </div>
      </div>
    </div>
  );
}
