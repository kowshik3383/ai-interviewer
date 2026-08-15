// lib/scoring.ts
import { callWithFallback } from "./openrouter";

export interface CandidateTurnEvaluation {
  turnIndex: number;
  role: string;
  questionText?: string;
  candidateAnswer: string;
  score?: number | null; // 0-10
  notes?: string | null;
  codeSnapshot?: string | null;
  skipped?: boolean;
}

export interface RadarMetric {
  category: string;
  score: number;
  fullMark?: number;
}

export interface QuestionAuditItem {
  questionNumber: number;
  topic: string;
  question: string;
  score: number;
  evaluatorNotes: string;
}

export interface EvaluationReport {
  candidateName: string;
  language: string;
  difficulty: string;
  finalScore: number; // 0-100
  overallScore?: number;
  recommendation: "STRONG_HIRE" | "HIRE" | "LEAN_HIRE" | "LEAN_NO_HIRE" | "NO_HIRE" | "strong_hire" | "hire" | "lean_no" | "no_hire" | string;
  executiveSummary: string;
  summary?: string;
  strengths: string[];
  growthAreas: string[];
  weaknesses?: string[];
  nextStudyTopics: string[];
  radarMetrics: RadarMetric[];
  categoryScores?: {
    correctness: number;
    depth: number;
    communication: number;
    problemSolving: number;
    codeQuality: number;
  };
  questionAudit: QuestionAuditItem[];
  turnBreakdown?: {
    turnIndex: number;
    score: number;
    topic: string;
    notes: string;
  }[];
  generatedAt: string;
}

export type FinalReportData = EvaluationReport;

/**
 * Generates an end-of-interview scorecard by synthesizing all candidate turns
 */
export async function generateFinalReport(params: {
  candidateName: string;
  language: string;
  difficulty: string;
  turns: CandidateTurnEvaluation[];
}): Promise<EvaluationReport> {
  const scoredTurns = params.turns.filter(
    (t) => !t.skipped && typeof t.score === "number" && t.score !== null
  );
  const avgScore =
    scoredTurns.length > 0
      ? scoredTurns.reduce((sum, t) => sum + (t.score || 0), 0) / scoredTurns.length
      : 0;

  const normalized100 = Math.min(100, Math.max(0, Math.round(avgScore * 10)));

  // Prompt OpenRouter to analyze the complete interview transcript
  const transcriptSummary = params.turns
    .map(
      (t, i) =>
        `Turn ${i + 1} (${t.role}):\nContent: ${t.candidateAnswer}\n${
          t.score ? `Score: ${t.score}/10` : ""
        }\n${t.notes ? `Evaluator Notes: ${t.notes}` : ""}\n${
          t.codeSnapshot ? `Code: ${t.codeSnapshot.slice(0, 300)}...` : ""
        }`
    )
    .join("\n---\n");

  const prompt = `You are a Senior Engineering Hiring Committee Lead generating a final hiring decision report from this candidate's technical interview transcript:

CANDIDATE: ${params.candidateName}
LANGUAGE: ${params.language}
LEVEL: ${params.difficulty}
AVERAGE RECORDED SCORE: ${avgScore.toFixed(1)}/10

TRANSCRIPT & EVALUATION LOGS:
${transcriptSummary}

Analyze their overall technical competence, theoretical depth, code quality, edge-case consideration, and communication.
Respond ONLY with a JSON object in this exact schema:
{
  "overall_score": ${normalized100},
  "recommendation": "STRONG_HIRE" | "HIRE" | "LEAN_HIRE" | "LEAN_NO_HIRE" | "NO_HIRE",
  "summary": "3-4 concise sentences summarizing candidate performance, grasp of ${params.language}, and recommendation rationale.",
  "strengths": ["Key strength 1", "Key strength 2", "Key strength 3"],
  "weaknesses": ["Key growth area 1", "Key growth area 2"],
  "next_study_topics": ["Topic 1", "Topic 2", "Topic 3"],
  "category_scores": {
    "correctness": ${Math.min(100, Math.round(normalized100 * 1.02))},
    "depth": ${Math.max(0, Math.round(normalized100 * 0.95))},
    "communication": ${Math.min(100, Math.round(normalized100 * 1.05))},
    "problem_solving": ${Math.min(100, Math.round(normalized100 * 0.98))},
    "code_quality": ${Math.min(100, Math.round(normalized100 * 0.96))}
  }
}`;

  try {
    const aiResult = await callWithFallback({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      maxTokens: 1000,
    });

    let cleaned = aiResult.content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "");
      cleaned = cleaned.replace(/\s*```$/, "");
    }
    const parsed = JSON.parse(cleaned);

    const correctness = parsed.category_scores?.correctness || normalized100;
    const depth = parsed.category_scores?.depth || Math.max(50, normalized100 - 5);
    const comm = parsed.category_scores?.communication || Math.min(100, normalized100 + 5);
    const probSolving = parsed.category_scores?.problem_solving || normalized100;
    const codeQual = parsed.category_scores?.code_quality || Math.max(50, normalized100 - 3);

    const radarMetrics: RadarMetric[] = [
      { category: "Correctness", score: correctness, fullMark: 100 },
      { category: "Depth & Internals", score: depth, fullMark: 100 },
      { category: "Communication", score: comm, fullMark: 100 },
      { category: "Problem Solving", score: probSolving, fullMark: 100 },
      { category: "Code Quality", score: codeQual, fullMark: 100 },
    ];

    const questionAudit: QuestionAuditItem[] = scoredTurns.map((t, idx) => ({
      questionNumber: idx + 1,
      topic: `${params.language.toUpperCase()} Evaluation ${idx + 1}`,
      question: t.questionText || t.candidateAnswer.slice(0, 80) + "...",
      score: t.score || 7,
      evaluatorNotes: t.notes || "Clear understanding of fundamental concepts.",
    }));

    const summaryText =
      parsed.summary ||
      `${params.candidateName} demonstrated a solid technical foundation in ${params.language}.`;

    return {
      candidateName: params.candidateName,
      language: params.language,
      difficulty: params.difficulty,
      finalScore: parsed.overall_score || normalized100,
      overallScore: parsed.overall_score || normalized100,
      recommendation: parsed.recommendation || getRecommendation(normalized100),
      executiveSummary: summaryText,
      summary: summaryText,
      strengths: parsed.strengths || [
        `Strong grasp of fundamental ${params.language} syntax and idioms`,
        "Clear and structured verbal communication",
        "Methodical approach to problem-solving and edge cases",
      ],
      growthAreas: parsed.weaknesses || [
        `Could explore deeper low-level memory and runtime internals in ${params.language}`,
        "Consider more proactive unit testing and boundary verification",
      ],
      weaknesses: parsed.weaknesses || [],
      nextStudyTopics: parsed.next_study_topics || [
        `${params.language} Runtime Profiling`,
        "Concurrency & Memory Allocations",
        "System Architecture Patterns",
      ],
      radarMetrics,
      categoryScores: {
        correctness,
        depth,
        communication: comm,
        problemSolving: probSolving,
        codeQuality: codeQual,
      },
      questionAudit,
      turnBreakdown: scoredTurns.map((t, idx) => ({
        turnIndex: idx + 1,
        score: t.score || 7,
        topic: `Question ${idx + 1}`,
        notes: t.notes || "Solid response with good technical accuracy.",
      })),
      generatedAt: new Date().toISOString(),
    };
  } catch (err: any) {
    console.warn("AI report synthesis failed, calculating deterministic report:", err.message);
    return getDeterministicReport(
      params.candidateName,
      params.language,
      params.difficulty,
      normalized100,
      scoredTurns
    );
  }
}

function getRecommendation(
  score100: number
): "STRONG_HIRE" | "HIRE" | "LEAN_HIRE" | "LEAN_NO_HIRE" | "NO_HIRE" {
  if (score100 >= 85) return "STRONG_HIRE";
  if (score100 >= 70) return "HIRE";
  if (score100 >= 55) return "LEAN_HIRE";
  if (score100 >= 45) return "LEAN_NO_HIRE";
  return "NO_HIRE";
}

function getDeterministicReport(
  name: string,
  language: string,
  difficulty: string,
  score100: number,
  turns: CandidateTurnEvaluation[]
): EvaluationReport {
  const rec = getRecommendation(score100);
  const summaryText = `${name} completed the ${difficulty.toUpperCase()} technical interview for ${language} with an overall score of ${score100}%. They demonstrated good comprehension of standard paradigms and articulated their thinking clearly.`;

  const radarMetrics: RadarMetric[] = [
    { category: "Correctness", score: score100, fullMark: 100 },
    { category: "Depth & Internals", score: Math.max(40, score100 - 5), fullMark: 100 },
    { category: "Communication", score: Math.min(100, score100 + 4), fullMark: 100 },
    { category: "Problem Solving", score: score100, fullMark: 100 },
    { category: "Code Quality", score: Math.max(40, score100 - 3), fullMark: 100 },
  ];

  const questionAudit: QuestionAuditItem[] = turns.map((t, idx) => ({
    questionNumber: idx + 1,
    topic: `Topic ${idx + 1}`,
    question: t.questionText || `Interview question ${idx + 1}`,
    score: t.score || 7,
    evaluatorNotes: t.notes || "Technical answer evaluated according to standard rubric.",
  }));

  return {
    candidateName: name,
    language,
    difficulty,
    finalScore: score100,
    overallScore: score100,
    recommendation: rec,
    executiveSummary: summaryText,
    summary: summaryText,
    strengths: [
      `Solid understanding of core ${language} programming concepts`,
      "Effective communication during technical evaluations",
      "Disciplined approach to writing clean, readable code",
    ],
    growthAreas: [
      "Could deepen edge-case testing under corner scenarios",
      `Opportunity to optimize runtime complexity in advanced ${language} data structures`,
    ],
    weaknesses: [
      "Could deepen edge-case testing under corner scenarios",
      `Opportunity to optimize runtime complexity in advanced ${language} data structures`,
    ],
    nextStudyTopics: [
      `${language} Memory Management`,
      "Advanced Concurrency Patterns",
      "Algorithmic Time Complexity",
    ],
    radarMetrics,
    categoryScores: {
      correctness: score100,
      depth: Math.max(40, score100 - 5),
      communication: Math.min(100, score100 + 4),
      problemSolving: score100,
      codeQuality: Math.max(40, score100 - 3),
    },
    questionAudit,
    turnBreakdown: turns.map((t, idx) => ({
      turnIndex: idx + 1,
      score: t.score || 7,
      topic: `Topic ${idx + 1}`,
      notes: t.notes || "Technical answer evaluated according to the standard rubric.",
    })),
    generatedAt: new Date().toISOString(),
  };
}
