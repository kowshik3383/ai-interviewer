"use client";

// components/editor/CodeEditor.tsx
import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  Send,
  RotateCcw,
  Terminal,
  Lightbulb,
  Volume2,
  Sparkles,
  X,
} from "lucide-react";
import OutputConsole from "./OutputConsole";
import { SandboxExecutionResponse } from "@/lib/sandbox";
import { SUPPORTED_LANGUAGES } from "@/lib/prompts/question-banks";
import { LiveHint } from "@/hooks/useInterviewWebSocket";

interface CodeEditorProps {
  language: string;
  initialCode: string;
  onRunCode: (code: string, stdin?: string) => Promise<SandboxExecutionResponse | null>;
  onSubmitSolution: (code: string, execution: SandboxExecutionResponse | null) => Promise<void>;
  onCodeChange?: (code: string) => void;
  onRequestHint?: (code: string) => void;
  activeHint?: LiveHint | null;
  onDismissHint?: () => void;
  onReplayHintAudio?: (hintText: string, audioBase64?: string | null) => void;
  isAudioPlaying?: boolean;
  isWsConnected?: boolean;
  isRunning?: boolean;
  isSubmitting?: boolean;
  testCriteria?: string[];
  challengeTitle?: string;
}

export default function CodeEditor({
  language,
  initialCode,
  onRunCode,
  onSubmitSolution,
  onCodeChange,
  onRequestHint,
  activeHint,
  onDismissHint,
  onReplayHintAudio,
  isAudioPlaying = false,
  isWsConnected = false,
  isRunning = false,
  isSubmitting = false,
  testCriteria = [],
  challengeTitle,
}: CodeEditorProps) {
  const [code, setCode] = useState(initialCode);
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [executionResult, setExecutionResult] = useState<SandboxExecutionResponse | null>(null);
  const [fontSize, setFontSize] = useState(14);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const startHeightRef = useRef(200);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync initialCode if changed
  useEffect(() => {
    if (initialCode && initialCode !== code && code === "") {
      setCode(initialCode);
    }
  }, [initialCode, code]);

  // Draggable resize handler for terminal height
  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    startYRef.current = e.clientY;
    startHeightRef.current = terminalHeight;
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaY = startYRef.current - e.clientY;
      const containerHeight = containerRef.current?.clientHeight || 600;
      const minHeight = 44; // Allow collapsing down to header
      const maxHeight = Math.max(minHeight, containerHeight - 120);

      const newHeight = Math.min(Math.max(startHeightRef.current + deltaY, minHeight), maxHeight);
      setTerminalHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // Handle live code changes with debouncing
  const handleEditorChange = (newVal: string | undefined) => {
    const updated = newVal || "";
    setCode(updated);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      onCodeChange?.(updated);
    }, 400);
  };

  const langConfig = SUPPORTED_LANGUAGES.find(
    (l) => l.id === language.toLowerCase()
  ) || { monacoLang: "javascript", name: language };

  const handleRun = async () => {
    if (isRunning) return;
    const res = await onRunCode(code, stdin);
    if (res) {
      setExecutionResult(res);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    let res = executionResult;
    if (!res) {
      res = await onRunCode(code, stdin);
      if (res) setExecutionResult(res);
    }
    await onSubmitSolution(code, res);
  };

  const handleReset = () => {
    if (confirm("Reset code to default starter stub? Any unsaved edits will be lost.")) {
      setCode(initialCode);
      onCodeChange?.(initialCode);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col h-full min-h-0 bg-[#ffffff] rounded-2xl border border-[#e8e5e0] shadow-sm overflow-hidden relative ${
        isDragging ? "select-none" : ""
      }`}
    >
      {/* Dragging Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 cursor-row-resize select-none" />
      )}
      {/* Editor Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#f7f5f2] border-b border-[#e8e5e0]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ffffff] border border-[#e8e5e0] text-xs font-bold text-[#1b1b1b] shadow-2xs">
            <span>{langConfig.name}</span>
          </div>

          {/* Live AI Observer Status Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffffff] border border-[#e8e5e0] text-[11px] shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-[#1b1b1b] font-semibold hidden sm:inline">AI Observing Live</span>
          </div>

          <button
            onClick={() => setShowStdin(!showStdin)}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
              showStdin
                ? "bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe]"
                : "text-[#71717a] hover:text-[#1b1b1b] hover:bg-[#ffffff]"
            }`}
            title="Toggle standard input (stdin) panel"
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Stdin</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#71717a] hover:text-[#1b1b1b] hover:bg-[#ffffff] rounded-lg transition-colors"
            title="Reset to starter stub"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {onRequestHint && (
            <button
              onClick={() => onRequestHint(code)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-[#fffbeb] hover:bg-[#fef3c7] text-[#b45309] border border-[#fde68a] transition-all active:scale-[0.98]"
              title="Ask AI for a gentle hint based on your current code"
            >
              <Lightbulb className="h-3.5 w-3.5 text-[#d97706]" />
              <span>Hint</span>
            </button>
          )}

          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl bg-[#ffffff] hover:bg-[#f7f5f2] text-[#1b1b1b] border border-[#e8e5e0] shadow-2xs transition-all active:scale-[0.98] disabled:opacity-50"
            title="Execute code in sandbox (Ctrl+Enter)"
          >
            <Play className={`h-3.5 w-3.5 text-[#059669] fill-[#059669] ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-[#1b1b1b] hover:bg-[#333333] text-[#fffafa] shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
            title="Submit this solution to the AI interviewer for evaluation"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Submitting..." : "Submit to AI"}</span>
          </button>
        </div>
      </div>

      {/* Proactive Floating AI Hint Notification Toast */}
      {activeHint && (
        <div className="absolute top-14 left-4 right-4 z-30 bg-[#fffbeb] border-2 border-[#fde68a] rounded-2xl p-4 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#fef3c7] border border-[#fde68a] text-[#b45309]">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#b45309]">
                    AI Interviewer Hint
                  </span>
                  {activeHint.suggestedFocus && (
                    <span className="text-[10px] bg-[#ffffff] text-[#1b1b1b] px-2 py-0.5 rounded font-mono border border-[#e8e5e0]">
                      {activeHint.suggestedFocus}
                    </span>
                  )}
                  {isAudioPlaying && (
                    <span className="flex items-center gap-1 text-[10px] text-[#2563eb] bg-[#eff6ff] px-2 py-0.5 rounded border border-[#bfdbfe] animate-pulse">
                      <Volume2 className="h-3 w-3" />
                      <span>Shunya Labs Voice</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#92400e] leading-relaxed font-sans font-medium">
                  {activeHint.hintText}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {onReplayHintAudio && (
                <button
                  onClick={() => onReplayHintAudio(activeHint.hintText, activeHint.audioBase64)}
                  className="p-1.5 text-[#71717a] hover:text-[#1b1b1b] hover:bg-[#fef3c7] rounded-lg transition-colors"
                  title="Replay Shunya Labs voice audio"
                >
                  <Volume2 className="h-4 w-4 text-[#2563eb]" />
                </button>
              )}
              {onDismissHint && (
                <button
                  onClick={onDismissHint}
                  className="p-1.5 text-[#71717a] hover:text-[#e11d48] hover:bg-[#fee2e2] rounded-lg transition-colors"
                  title="Dismiss hint"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Optional Stdin Drawer */}
      {showStdin && (
        <div className="p-3 bg-[#f7f5f2] border-b border-[#e8e5e0]">
          <label className="text-[11px] font-bold text-[#52525b] block mb-1">
            Custom Standard Input (stdin):
          </label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Type input text to feed into stdin..."
            rows={2}
            className="w-full bg-[#ffffff] text-xs font-mono text-[#1b1b1b] p-2 rounded-lg border border-[#e8e5e0] focus:outline-none focus:border-[#1b1b1b]"
          />
        </div>
      )}

      {/* Monaco Editor Pane */}
      <div className="flex-1 min-h-0 relative w-full">
        <Editor
          height="100%"
          language={langConfig.monacoLang || "javascript"}
          value={code}
          theme="vs"
          onChange={handleEditorChange}
          options={{
            fontSize,
            minimap: { enabled: false },
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            suggestOnTriggerCharacters: true,
            padding: { top: 10, bottom: 10 },
          }}
        />
      </div>

      {/* Draggable Resize Handle between Monaco Editor and Terminal Output */}
      <div
        onMouseDown={handleMouseDownResize}
        className={`group relative h-2 -my-1 z-30 cursor-row-resize flex items-center justify-center select-none transition-colors ${
          isDragging ? "bg-[#2563eb]" : "hover:bg-[#2563eb]/20"
        }`}
        title="Drag up or down to resize Terminal Output"
      >
        <div
          className={`h-1 w-12 rounded-full transition-all ${
            isDragging
              ? "bg-[#2563eb] scale-x-125"
              : "bg-[#cbd5e1] group-hover:bg-[#2563eb]"
          }`}
        />
      </div>

      {/* Output Console (Resizable Bottom Section) */}
      <div
        style={{ height: `${terminalHeight}px` }}
        className="shrink-0 min-h-0 flex flex-col"
      >
        <OutputConsole
          executionResult={executionResult}
          isRunning={isRunning}
          testCriteria={testCriteria}
          challengeTitle={challengeTitle}
        />
      </div>
    </div>
  );
}
