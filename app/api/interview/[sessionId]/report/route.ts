// app/api/interview/[sessionId]/report/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { generateFinalReport, EvaluationReport, RadarMetric } from "@/lib/scoring";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const { sessionId } = await params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        turns: {
          orderBy: { createdAt: "asc" },
        },
        user: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Check if report already exists and is stored
    if (session.summary && session.recommendation && session.categoryScores) {
      try {
        const categoryScores = JSON.parse(session.categoryScores);
        const strengths = session.strengths ? JSON.parse(session.strengths) : [];
        const weaknesses = session.weaknesses ? JSON.parse(session.weaknesses) : [];
        const scoredTurns = session.turns.filter((t) => t.role === "candidate");

        const radarMetrics: RadarMetric[] = [
          { category: "Correctness", score: categoryScores.correctness || 80, fullMark: 100 },
          { category: "Depth & Internals", score: categoryScores.depth || 75, fullMark: 100 },
          { category: "Communication", score: categoryScores.communication || 85, fullMark: 100 },
          { category: "Problem Solving", score: categoryScores.problemSolving || 80, fullMark: 100 },
          { category: "Code Quality", score: categoryScores.codeQuality || 78, fullMark: 100 },
        ];

        const report: EvaluationReport = {
          candidateName: session.candidateName || "Candidate",
          language: session.language,
          difficulty: session.difficulty,
          finalScore: session.finalScore ?? 80,
          overallScore: session.finalScore ?? 80,
          recommendation: session.recommendation,
          executiveSummary: session.summary,
          summary: session.summary,
          strengths,
          growthAreas: weaknesses,
          weaknesses,
          nextStudyTopics: [
            `${session.language} Advanced Patterns`,
            "Concurrency & Memory Allocations",
            "Performance Profiling",
          ],
          radarMetrics,
          categoryScores,
          questionAudit: scoredTurns.map((t, idx) => ({
            questionNumber: idx + 1,
            topic: `Question ${idx + 1}`,
            question: t.content.slice(0, 100) + "...",
            score: t.score ?? 7,
            evaluatorNotes: t.evalNotes || "Candidate provided a clear and structured technical answer.",
          })),
          turnBreakdown: scoredTurns.map((t, idx) => ({
            turnIndex: idx + 1,
            score: t.score ?? 7,
            topic: `Question ${idx + 1}`,
            notes: t.evalNotes || "Candidate provided a clear and structured technical answer.",
          })),
          generatedAt: session.completedAt ? session.completedAt.toISOString() : new Date().toISOString(),
        };

        return NextResponse.json({ session, report });
      } catch {
        // If parsing fails, fall through to regenerate below
      }
    }

    // Generate fresh report
    const candidateTurns = session.turns.map((t, idx) => ({
      turnIndex: idx + 1,
      role: t.role,
      questionText: t.role === "ai" ? t.content : undefined,
      candidateAnswer: t.content,
      score: t.score,
      notes: t.evalNotes,
      codeSnapshot: t.codeSnapshot,
    }));

    const report = await generateFinalReport({
      candidateName: session.candidateName || "Candidate",
      language: session.language,
      difficulty: session.difficulty,
      turns: candidateTurns,
    });

    // Persist report in database
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        state: "REPORT_GENERATED",
        status: "completed",
        finalScore: report.finalScore,
        recommendation: report.recommendation,
        summary: report.executiveSummary,
        strengths: JSON.stringify(report.strengths),
        weaknesses: JSON.stringify(report.growthAreas),
        categoryScores: JSON.stringify(report.categoryScores),
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ session, report });
  } catch (err: any) {
    console.error("[Report API Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const { sessionId } = await params;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        turns: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const candidateTurns = session.turns.map((t, idx) => ({
      turnIndex: idx + 1,
      role: t.role,
      questionText: t.role === "ai" ? t.content : undefined,
      candidateAnswer: t.content,
      score: t.score,
      notes: t.evalNotes,
      codeSnapshot: t.codeSnapshot,
    }));

    const report = await generateFinalReport({
      candidateName: session.candidateName || "Candidate",
      language: session.language,
      difficulty: session.difficulty,
      turns: candidateTurns,
    });

    await prisma.session.update({
      where: { id: sessionId },
      data: {
        state: "REPORT_GENERATED",
        status: "completed",
        finalScore: report.finalScore,
        recommendation: report.recommendation,
        summary: report.executiveSummary,
        strengths: JSON.stringify(report.strengths),
        weaknesses: JSON.stringify(report.growthAreas),
        categoryScores: JSON.stringify(report.categoryScores),
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    console.error("[Report POST Error]:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
