// app/api/interview/[sessionId]/turn/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { buildInterviewerPrompt } from "@/lib/prompts/interviewer";
import { callWithFallback, parseInterviewerResponse, ChatMessage } from "@/lib/openrouter";
import { getNextSessionState, SessionContext } from "@/lib/fsm";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const body = await req.json().catch(() => ({}));
    const {
      answer = "",
      codeSnapshot,
      stdin,
      stdout,
      stderr,
      exitCode,
      actionOverride,
    } = body;

    // Load session with previous turns
    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        turns: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Interview session not found" }, { status: 404 });
    }

    // Determine current counts from past turns
    const candidateTurns = session.turns.filter((t) => t.role === "candidate");
    const candidateScores = candidateTurns
      .map((t) => t.score)
      .filter((s): s is number => typeof s === "number");

    const coreQuestionsCount = session.turns.filter(
      (t) => t.role === "ai" && !t.content.toLowerCase().includes("wrap") && !t.content.toLowerCase().includes("coding challenge")
    ).length;

    const followUpsInCurrentState = session.turns.filter(
      (t) => t.role === "candidate" && t.actionTaken === "follow_up"
    ).length;

    const currentFsmContext: SessionContext = {
      state: session.state as any,
      language: session.language,
      difficulty: session.difficulty as any,
      coreQuestionCount: Math.max(1, coreQuestionsCount),
      maxCoreQuestions: session.difficulty === "senior" ? 5 : 4,
      followUpCount: followUpsInCurrentState % 2,
      maxFollowUpsPerQuestion: 2,
      codingChallengeCount: session.state === "CODING_CHALLENGE" ? 1 : 0,
      maxCodingChallenges: session.difficulty === "senior" ? 2 : 1,
      totalTurns: session.turns.length,
      runningScores: candidateScores,
      averageScore:
        candidateScores.length > 0
          ? parseFloat((candidateScores.reduce((a, b) => a + b, 0) / candidateScores.length).toFixed(1))
          : 7.5,
    };

    // Construct prompt with current state & candidate code context
    const systemPrompt = buildInterviewerPrompt({
      candidateName: session.candidateName || "Candidate",
      language: session.language,
      difficulty: session.difficulty,
      currentState: session.state,
      questionCount: currentFsmContext.coreQuestionCount,
      followUpCount: currentFsmContext.followUpCount,
      lastCodeRun: codeSnapshot
        ? {
            code: codeSnapshot,
            stdin,
            stdout,
            stderr,
            exitCode,
          }
        : undefined,
    });

    // Build chat history for OpenRouter
    const chatMessages: ChatMessage[] = [{ role: "system", content: systemPrompt }];

    // Add recent turn history (last 10 turns to stay optimal with context)
    const recentTurns = session.turns.slice(-10);
    for (const t of recentTurns) {
      chatMessages.push({
        role: t.role === "ai" ? "assistant" : "user",
        content: t.content,
      });
    }

    // Format candidate's current turn content
    let candidateTurnContent = answer.trim();
    if (codeSnapshot) {
      candidateTurnContent += `\n\n[Candidate Submitted Code Execution]:\n\`\`\`${session.language}\n${codeSnapshot}\n\`\`\`\nStdout: ${stdout || "(none)"}\nStderr: ${stderr || "(none)"}\nExit Code: ${exitCode ?? 0}`;
    }

    if (!candidateTurnContent) {
      candidateTurnContent = "I'm ready for the next question.";
    }

    chatMessages.push({
      role: "user",
      content: candidateTurnContent,
    });

    // If candidate explicitly asked to finish early / wrap up
    if (actionOverride === "wrap_up" || answer.toLowerCase().includes("end interview") || answer.toLowerCase().includes("wrap up now")) {
      chatMessages.push({
        role: "user",
        content: "Please wrap up the interview now with concluding remarks.",
      });
    }

    // Call OpenRouter with fallback
    const aiResult = await callWithFallback({
      messages: chatMessages,
      temperature: 0.4,
      maxTokens: 900,
    });

    const parsed = parseInterviewerResponse(aiResult.content);
    const hasEval = !!parsed.internal_evaluation;
    const score = hasEval && parsed.internal_evaluation?.score != null ? parsed.internal_evaluation.score : null;
    const suggestedAction = actionOverride || (hasEval ? parsed.internal_evaluation?.action : "follow_up") || "advance";
    const followUpType = hasEval ? parsed.internal_evaluation?.follow_up_type || "AFFIRM_AND_ADVANCE" : "REDIRECT";
    const evalNotes = hasEval
      ? parsed.internal_evaluation?.notes || "Candidate answer evaluated."
      : "Model response could not be structurally evaluated; treated as a clarification turn.";

    // Execute state machine transition (null score = not scored; don't add to running scores)
    const fsmResult = getNextSessionState(currentFsmContext, suggestedAction, score ?? undefined);

    // Save Candidate Turn in DB
    const savedCandidateTurn = await prisma.turn.create({
      data: {
        sessionId: session.id,
        role: "candidate",
        content: answer.trim() || "(Code execution submitted)",
        score,
        evalNotes,
        actionTaken: fsmResult.actionExecuted,
        followUpType,
        codeSnapshot: codeSnapshot || null,
        stdinSnapshot: stdin || null,
        stdoutSnapshot: stdout || null,
        stderrSnapshot: stderr || null,
        exitCodeSnapshot: typeof exitCode === "number" ? exitCode : null,
      },
    });

    // Save AI Turn in DB
    const savedAiTurn = await prisma.turn.create({
      data: {
        sessionId: session.id,
        role: "ai",
        content: parsed.message_to_candidate,
        modelUsed: aiResult.modelUsed,
        actionTaken: fsmResult.actionExecuted,
        followUpType,
      },
    });

    // Update Session state
    const updatedSession = await prisma.session.update({
      where: { id: sessionId },
      data: {
        state: fsmResult.nextState,
        finalScore: fsmResult.updatedContext.averageScore,
        status: fsmResult.nextState === "REPORT_GENERATED" || fsmResult.nextState === "WRAP_UP" ? "completed" : "in_progress",
      },
    });

    return NextResponse.json({
      session: updatedSession,
      candidateTurn: savedCandidateTurn,
      aiTurn: savedAiTurn,
      internalEvaluation: {
        score,
        notes: evalNotes,
        action: fsmResult.actionExecuted,
        followUpType,
        nextState: fsmResult.nextState,
      },
      modelUsed: aiResult.modelUsed,
      fallbacksTriggered: aiResult.fallbacksTriggered,
    });
  } catch (err: any) {
    console.error("[API Turn Error]:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process interview turn" },
      { status: 500 }
    );
  }
}
