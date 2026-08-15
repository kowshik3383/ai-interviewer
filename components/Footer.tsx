// components/Footer.tsx
import { Cpu, ShieldCheck, Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[#e8e5e0] bg-[#fffafa] py-8 text-[#71717a] text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1b1b1b]">AI Technical Interviewer</span>
          <span className="text-[#d4d0c8]">•</span>
          <span>Adaptive Finite State Machine Engine</span>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-1.5 text-[#52525b]">
            <Cpu className="h-3.5 w-3.5 text-[#2563eb]" />
            <span>OpenRouter Priority Fallback</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#52525b]">
            <Zap className="h-3.5 w-3.5 text-[#059669]" />
            <span>Shunya Labs AI Voice</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#52525b]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#7c3aed]" />
            <span>Standardized Rubrics</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
