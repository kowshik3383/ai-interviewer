// components/blog/InterviewCTA.tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface InterviewCTAProps {
  language?: string | null;
  label?: string;
}

export default function InterviewCTA({ language, label }: InterviewCTAProps) {
  const href = language ? `/interview/setup?lang=${language}` : "/interview/setup";
  const text = label ?? (language ? "Practice this in a live AI interview" : "Practice with the AI interviewer");

  return (
    <aside className="my-10 rounded-2xl border border-[#e8e5e0] bg-[#ffffff] p-6 sm:p-8 space-y-4">
      <p className="text-sm text-[#52525b] leading-relaxed max-w-[52ch]">
        Reading about interview questions is the easy part — answering them under
        pressure is where you actually learn. Our AI interviewer asks real
        questions, watches your code live, and scores you like a hiring manager.
      </p>
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-xl bg-[#1b1b1b] px-6 py-3 text-sm font-bold text-[#fffafa] shadow-sm transition-all hover:bg-[#333333] active:scale-[0.98]"
      >
        <span>{text}</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </aside>
  );
}