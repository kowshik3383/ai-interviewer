// app/api/interview/[sessionId]/live-hint/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { analyzeLiveCodeAndGenerateHint } from "@/lib/hint-engine";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const body = await req.json().catch(() => ({}));
    const { currentCode = "", idleDurationSeconds = 35 } = body;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        turns: {
          orderBy: { createdAt: "desc" },
          take: 3,
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const lastAiQuestion = session.turns.find((t) => t.role === "ai")?.content || "";

    const hint = await analyzeLiveCodeAndGenerateHint({
      language: session.language,
      currentCode,
      lastQuestion: lastAiQuestion,
      difficulty: session.difficulty,
      idleDurationSeconds,
      candidateName: session.candidateName || "Candidate",
    });

    return NextResponse.json(hint);
  } catch (err: any) {
    console.error("[API Live Hint Error]:", err);
    return NextResponse.json(
      {
        hintText: "Consider structuring your logic with base cases first and double-checking potential null or empty input values.",
        suggestedFocus: "Base Cases & Boundaries",
        audioBase64: null,
      },
      { status: 200 }
    );
  }
}
