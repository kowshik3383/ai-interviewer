"use client";

// components/editor/OutputConsole.tsx
import { useState } from "react";
import {
  Terminal,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SandboxExecutionResponse } from "@/lib/sandbox";

interface OutputConsoleProps {
  executionResult: SandboxExecutionResponse | null;
  isRunning?: boolean;
  testCriteria?: string[];
  challengeTitle?: string;
}

export default function OutputConsole({
  executionResult,
  isRunning = false,
  testCriteria = [],
  challengeTitle,
}: OutputConsoleProps) {
  const [activeTab, setActiveTab] = useState<"stdout" | "criteria">("stdout");

  const hasExecuted = executionResult !== null;
  const isSuccess = executionResult?.status === "success" && executionResult.exit_code === 0;
  const hasStderr = Boolean(executionResult?.stderr && executionResult.stderr.trim().length > 0);

  return (
    <div className="flex flex-col h-full bg-[#ffffff] border-t border-[#e8e5e0] text-xs font-mono">
      {/* Console Tab Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#f7f5f2] border-b border-[#e8e5e0]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("stdout")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "stdout"
                ? "bg-[#ffffff] text-[#1b1b1b] shadow-2xs border border-[#e8e5e0]"
                : "text-[#71717a] hover:text-[#1b1b1b]"
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Terminal Output</span>
            {hasExecuted && (
              <span
                className={`h-2 w-2 rounded-full ${
                  isSuccess ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
            )}
          </button>

          {testCriteria.length > 0 && (
            <button
              onClick={() => setActiveTab("criteria")}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeTab === "criteria"
                  ? "bg-[#ffffff] text-[#1b1b1b] shadow-2xs border border-[#e8e5e0]"
                  : "text-[#71717a] hover:text-[#1b1b1b]"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Test Criteria ({testCriteria.length})</span>
            </button>
          )}
        </div>

        {/* Execution Metadata Status */}
        {hasExecuted && !isRunning && (
          <div className="flex items-center gap-3 text-[11px]">
            {typeof executionResult.execution_time_ms === "number" && (
              <span className="flex items-center gap-1 text-[#71717a]">
                <Clock className="h-3 w-3" />
                <span>{executionResult.execution_time_ms}ms</span>
              </span>
            )}
            <span
              className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] border ${
                isSuccess
                  ? "bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]"
                  : "bg-[#fff1f2] text-[#be123c] border-[#fecdd3]"
              }`}
            >
              Exit Code: {executionResult.exit_code}
            </span>
          </div>
        )}
      </div>

      {/* Console Body */}
      <div className="flex-1 p-3 overflow-y-auto font-mono bg-[#fffafa]">
        {isRunning ? (
          <div className="flex items-center gap-2 text-[#71717a] py-4">
            <div className="h-3.5 w-3.5 border-2 border-[#1b1b1b] border-t-transparent rounded-full animate-spin" />
            <span>Compiling & executing code in isolated sandbox...</span>
          </div>
        ) : activeTab === "criteria" ? (
          <div className="space-y-2">
            <div className="font-bold text-[#1b1b1b] text-xs mb-2">
              Evaluation Acceptance Criteria:
            </div>
            {testCriteria.map((crit, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-[#52525b] bg-[#ffffff] p-2.5 rounded-lg border border-[#e8e5e0]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563eb] mt-1.5 shrink-0" />
                <span>{crit}</span>
              </div>
            ))}
          </div>
        ) : !hasExecuted ? (
          <div className="text-[#8c8a82] italic py-3 flex items-center gap-2">
            <Terminal className="h-3.5 w-3.5" />
            <span>Click &quot;Run&quot; (Ctrl+Enter) to execute your code or &quot;Submit to AI&quot; to conclude the challenge.</span>
          </div>
        ) : (
          <div className="space-y-2 text-xs">
            {executionResult.stdout && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#71717a]">stdout:</span>
                <pre className="text-[#1b1b1b] bg-[#ffffff] p-3 rounded-lg border border-[#e8e5e0] overflow-x-auto whitespace-pre-wrap">
                  {executionResult.stdout}
                </pre>
              </div>
            )}

            {hasStderr && (
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#e11d48]">stderr:</span>
                <pre className="text-[#be123c] bg-[#fff1f2] p-3 rounded-lg border border-[#fecdd3] overflow-x-auto whitespace-pre-wrap">
                  {executionResult.stderr}
                </pre>
              </div>
            )}

            {!executionResult.stdout && !hasStderr && (
              <div className="text-[#71717a] italic">
                (Process finished with no standard output)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
