"use client";

// app/(auth)/login/page.tsx
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Terminal } from "lucide-react";
import Link from "next/link";

function LoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    await signIn("google", { callbackUrl });
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
          <h2 className="text-lg font-extrabold text-[#1b1b1b]">Sign In</h2>
          <p className="text-xs text-[#52525b]">Sign in with Google to run and save your technical interviews</p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl bg-[#1b1b1b] hover:bg-[#333333] text-[#fffafa] font-semibold text-sm shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#fff" d="M21.35 11.1H12v3.85h5.45c-.55 2.66-2.75 4.25-5.45 4.25-3.3 0-6-2.7-6-6s2.7-6 6-6c1.5 0 2.85.55 3.9 1.45l2.9-2.9C17.1 3.9 14.7 3 12 3 7.05 3 3 7.05 3 12s4.05 9 9 9c5.3 0 8.65-3.75 8.65-9.05 0-.65-.05-1.25-.15-1.85Z"/>
          </svg>
          <span>{isLoading ? "Redirecting to Google..." : "Continue with Google"}</span>
        </button>

        <div className="pt-4 border-t border-[#e8e5e0] text-center text-xs text-[#71717a]">
          <p>The AI interviewer will greet you naturally by your Google profile name.</p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
