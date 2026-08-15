// app/api/interview/start/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { buildInterviewerPrompt } from "@/lib/prompts/interviewer";
import { callWithFallback, parseInterviewerResponse } from "@/lib/openrouter";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { language = "javascript", difficulty = "mid", candidateName: inputName } = body;

    const auth = await requireUser();
    if (auth.response) return auth.response;
    const user = auth.user;

    const candidateName = inputName?.trim() || user.name || "Candidate";

    // Ensure user exists in database
    let dbUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: candidateName,
          avatar: user.image || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(candidateName)}`,
        },
      });
    }

    // Create a new interview Session
    const session = await prisma.session.create({
      data: {
        userId: dbUser.id,
        candidateName,
        language: language.toLowerCase(),
        difficulty: difficulty.toLowerCase(),
        state: "WARMUP_QUESTION",
        status: "in_progress",
      },
    });

    // Build the system prompt
    const systemPrompt = buildInterviewerPrompt({
      candidateName,
      language,
      difficulty,
      currentState: "WARMUP_QUESTION",
      questionCount: 1,
      followUpCount: 0,
    });

    const userInitiator = `Start the interview now. Greet me naturally by name (${candidateName}), briefly set the tone, and ask your first warmup question about ${language}.`;

    // Invoke OpenRouter with fallback chain
    const aiResult = await callWithFallback({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userInitiator },
      ],
      temperature: 0.5,
      maxTokens: 600,
    });

    const parsed = parseInterviewerResponse(aiResult.content);

    // Save the AI's opening turn
    const firstTurn = await prisma.turn.create({
      data: {
        sessionId: session.id,
        role: "ai",
        content: parsed.message_to_candidate,
        modelUsed: aiResult.modelUsed,
        actionTaken: "advance",
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      session,
      firstTurn,
      message: parsed.message_to_candidate,
      fallbacksTriggered: aiResult.fallbacksTriggered,
      modelUsed: aiResult.modelUsed,
    });
  } catch (err: any) {
    console.error("[API Start Error]:", err);
    return NextResponse.json(
      {
        error: err.message || "Failed to initialize interview session",
      },
      { status: 500 }
    );
  }
}
