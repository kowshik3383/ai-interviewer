"use client";

// app/interview/[sessionId]/page.tsx
import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ChatContainer, { MessageTurn } from "@/components/chat/ChatContainer";
import CodeEditor from "@/components/editor/CodeEditor";
import { getQuestionBank } from "@/lib/prompts/question-banks";
import { SandboxExecutionResponse } from "@/lib/sandbox";
import { useInterviewWebSocket, LiveHint } from "@/hooks/useInterviewWebSocket";
import {
  MessageSquare,
  Code2,
  ArrowRight,
  AlertCircle,
  Award,
} from "lucide-react";
import Link from "next/link";

interface PageParams {
  params: Promise<{ sessionId: string }>;
}

export default function InterviewWorkspacePage({ params }: PageParams) {
  const { sessionId } = use(params);
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [turns, setTurns] = useState<MessageTurn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isThinking, setIsThinking] = useState(false);
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "editor" | "split">("split");

  // Load session data
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/interview/${sessionId}`);
        if (!res.ok) throw new Error("Session not found");
        const data = await res.json();
        setSession(data.session);
        setTurns(data.session.turns || []);
      } catch (err: any) {
        console.error("Error loading session:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();
  }, [sessionId]);

  // Handle Proactive Live Hints from WebSocket
  const handleHintReceived = useCallback((hint: LiveHint) => {
    const hintTurn: MessageTurn = {
      role: "ai",
      content: `💡 [AI Coaching Observation]: ${hint.hintText}`,
      modelUsed: "shunya-voice-hint",
      createdAt: new Date().toISOString(),
    };
    setTurns((prev) => [...prev, hintTurn]);
  }, []);

  // Initialize Real-time WebSocket hook
  const {
    isConnected: isWsConnected,
    isAudioPlaying,
    activeHint,
    sendCodeStream,
    requestLiveHint,
    dismissHint,
    playSpeechAudio,
  } = useInterviewWebSocket({
    sessionId,
    candidateName: session?.candidateName || "Candidate",
    language: session?.language || "javascript",
    difficulty: session?.difficulty || "mid",
    onHintReceived: handleHintReceived,
  });

  const bank = session ? getQuestionBank(session.language) : null;
  const challenge =
    bank && session
      ? session.difficulty === "senior"
        ? bank.codingChallenges.senior
        : session.difficulty === "mid"
        ? bank.codingChallenges.mid
        : bank.codingChallenges.junior
      : null;

  // Handle Candidate text answer turn
  const handleSendMessage = async (text: string) => {
    if (isThinking || !session) return;
    setIsThinking(true);

    const optimisticTurn: MessageTurn = {
      role: "candidate",
      content: text,
      createdAt: new Date().toISOString(),
    };
    setTurns((prev) => [...prev, optimisticTurn]);

    try {
      const res = await fetch(`/api/interview/${sessionId}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: text }),
      });

      if (!res.ok) {
        throw new Error(`Turn failed with status ${res.status}`);
      }

      const data = await res.json();

      setSession(data.session);
      setTurns((prev) => [
        ...prev.slice(0, -1),
        data.candidateTurn || optimisticTurn,
        data.aiTurn,
      ]);

      // Play AI response audio with Shunya Labs Voice
      if (data.aiTurn?.content) {
        playSpeechAudio(data.aiTurn.content);
      }

      if (data.session?.state === "REPORT_GENERATED") {
        router.push(`/interview/${sessionId}/report`);
      }
    } catch (err: any) {
      console.error("Turn submission error:", err);
      alert(`Error processing response: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  // Handle Code Execution in Sandbox
  const handleRunCode = async (
    code: string,
    stdin: string = ""
  ): Promise<SandboxExecutionResponse | null> => {
    setIsRunningCode(true);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: session?.language || "javascript",
          code,
          stdin,
        }),
      });

      if (!res.ok) throw new Error("Sandbox run error");
      const data = await res.json();
      return data;
    } catch (err: any) {
      console.error("Sandbox execution error:", err);
      return {
        stdout: "",
        stderr: err.message || "Failed to execute code",
        exit_code: 1,
        status: "runtime_error",
      };
    } finally {
      setIsRunningCode(false);
    }
  };

  // Handle Code Solution Submission to Interviewer
  const handleSubmitSolution = async (
    code: string,
    execution: SandboxExecutionResponse | null
  ) => {
    if (isSubmittingCode || isThinking || !session) return;
    setIsSubmittingCode(true);
    setIsThinking(true);

    const submissionText = `I have written and tested my code solution for the coding challenge in ${session.language}. Here is my solution and execution output for evaluation.`;

    const optimisticTurn: MessageTurn = {
      role: "candidate",
      content: `${submissionText}\n\`\`\`${session.language}\n${code}\n\`\`\``,
      codeSnapshot: code,
      createdAt: new Date().toISOString(),
    };
    setTurns((prev) => [...prev, optimisticTurn]);

    try {
      const res = await fetch(`/api/interview/${sessionId}/turn`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: submissionText,
          codeSnapshot: code,
          stdout: execution?.stdout || "",
          stderr: execution?.stderr || "",
          exitCode: execution?.exit_code ?? 0,
        }),
      });

      if (!res.ok) throw new Error("Turn failed");
      const data = await res.json();

      setSession(data.session);
      setTurns((prev) => [
        ...prev.slice(0, -1),
        data.candidateTurn || optimisticTurn,
        data.aiTurn,
      ]);

      // Play AI evaluation audio
      if (data.aiTurn?.content) {
        playSpeechAudio(data.aiTurn.content);
      }

      if (data.session?.state === "REPORT_GENERATED") {
        router.push(`/interview/${sessionId}/report`);
      }
    } catch (err: any) {
      console.error("Solution submit error:", err);
      alert(`Error submitting code: ${err.message}`);
    } finally {
      setIsSubmittingCode(false);
      setIsThinking(false);
    }
  };

  // Handle Wrap Up Early
  const handleWrapUpEarly = async () => {
    if (confirm("Are you sure you want to conclude the interview early? A final hiring report will be generated now.")) {
      await handleSendMessage("Please wrap up our technical interview and produce the final scorecard.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffafa] text-[#1b1b1b]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-[#1b1b1b] border-t-transparent animate-spin" />
          <p className="text-xs text-[#71717a] font-mono">Loading interview workspace...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffafa] text-[#1b1b1b] p-4 space-y-4">
        <AlertCircle className="h-10 w-10 text-[#e11d48]" />
        <h2 className="text-xl font-bold">Interview Session Not Found</h2>
        <Link
          href="/interview/setup"
          className="px-4 py-2 rounded-xl bg-[#1b1b1b] text-xs font-semibold text-[#fffafa]"
        >
          Start New Interview
        </Link>
      </div>
    );
  }

  const isWrapUp = session.state === "WRAP_UP" || session.state === "REPORT_GENERATED";

  return (
    <div className="min-h-screen flex flex-col bg-[#fffafa] text-[#1b1b1b]">
      <Header
        sessionState={session.state}
        language={session.language}
        candidateName={session.candidateName || "Candidate"}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-4 flex flex-col gap-4">
        {/* Wrap Up Ready Banner */}
        {isWrapUp && (
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#ecfdf5] border border-[#a7f3d0] text-[#065f46]">
            <div className="flex items-center gap-2.5">
              <Award className="h-5 w-5 text-[#059669]" />
              <div>
                <h4 className="text-sm font-bold text-[#065f46]">Interview Concluded</h4>
                <p className="text-xs text-[#047857]">
                  Your responses and code evaluations have been recorded. You can view your full hiring report.
                </p>
              </div>
            </div>
            <Link
              href={`/interview/${sessionId}/report`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] hover:bg-[#047857] text-[#ffffff] font-semibold text-xs shadow-sm transition-all"
            >
              <span>View Scorecard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* View Mode Toggle (Mobile / Small Screens) */}
        <div className="flex lg:hidden items-center justify-center p-1 bg-[#f7f5f2] rounded-xl border border-[#e8e5e0] self-center">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "chat" ? "bg-[#1b1b1b] text-[#fffafa]" : "text-[#71717a]"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Interview Chat</span>
          </button>
          <button
            onClick={() => setActiveTab("editor")}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "editor" ? "bg-[#1b1b1b] text-[#fffafa]" : "text-[#71717a]"
            }`}
          >
            <Code2 className="h-3.5 w-3.5" />
            <span>Sandbox IDE</span>
          </button>
        </div>

        {/* Split Grid Layout (Chat on Left, Editor on Right) */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 h-[calc(100vh-140px)] min-h-[600px]">
          {/* Left: Chat Container */}
          <div
            className={`lg:col-span-5 h-full ${
              activeTab === "editor" ? "hidden lg:block" : "block"
            }`}
          >
            <ChatContainer
              turns={turns}
              isLoading={isThinking}
              onSendMessage={handleSendMessage}
              onWrapUpEarly={handleWrapUpEarly}
              onRequestHint={() => requestLiveHint("")}
              candidateName={session.candidateName || "Candidate"}
              currentStage={session.state}
              modelUsed={turns[turns.length - 1]?.modelUsed || undefined}
              isWsConnected={isWsConnected}
            />
          </div>

          {/* Right: Monaco Code Editor & Terminal */}
          <div
            className={`lg:col-span-7 h-full ${
              activeTab === "chat" ? "hidden lg:block" : "block"
            }`}
          >
            <CodeEditor
              language={session.language}
              initialCode={challenge?.starterCode || `// Write your ${session.language} solution here\n`}
              onRunCode={handleRunCode}
              onSubmitSolution={handleSubmitSolution}
              onCodeChange={sendCodeStream}
              onRequestHint={requestLiveHint}
              activeHint={activeHint}
              onDismissHint={dismissHint}
              onReplayHintAudio={playSpeechAudio}
              isAudioPlaying={isAudioPlaying}
              isWsConnected={isWsConnected}
              isRunning={isRunningCode}
              isSubmitting={isSubmittingCode}
              testCriteria={challenge?.testCriteria}
              challengeTitle={challenge?.title}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
