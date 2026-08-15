"use client";

// components/report/Scorecard.tsx
import { useState } from "react";
import {
  Award,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Sparkles,
} from "lucide-react";
import ScoreRadar from "./ScoreRadar";
import { EvaluationReport } from "@/lib/scoring";

interface ScorecardProps {
  report: EvaluationReport;
  sessionId: string;
}

export default function Scorecard({ report, sessionId }: ScorecardProps) {
  const [showAuditLogs, setShowAuditLogs] = useState(false);

  const getRecommendationBadge = (rec: string) => {
    switch (rec) {
      case "STRONG_HIRE":
        return {
          bg: "bg-[#ecfdf5]",
          border: "border-[#a7f3d0]",
          text: "text-[#065f46]",
          label: "Strong Hire",
        };
      case "HIRE":
        return {
          bg: "bg-[#eff6ff]",
          border: "border-[#bfdbfe]",
          text: "text-[#1e40af]",
          label: "Hire",
        };
      case "LEAN_HIRE":
        return {
          bg: "bg-[#fefce8]",
          border: "border-[#fef08a]",
          text: "text-[#854d0e]",
          label: "Lean Hire",
        };
      case "LEAN_NO_HIRE":
        return {
          bg: "bg-[#fff7ed]",
          border: "border-[#fed7aa]",
          text: "text-[#9a3412]",
          label: "Lean No Hire",
        };
      case "NO_HIRE":
      default:
        return {
          bg: "bg-[#fff1f2]",
          border: "border-[#fecdd3]",
          text: "text-[#9f1239]",
          label: "No Hire",
        };
    }
  };

  const badge = getRecommendationBadge(report.recommendation);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-8 print:space-y-4">
      {/* Top Action Ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#ffffff] border border-[#e8e5e0] shadow-sm print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1b1b1b] text-[#fffafa]">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1b1b1b]">
              Candidate Technical Evaluation
            </h3>
            <p className="text-xs text-[#71717a]">
              ID: {sessionId.slice(0, 16)}... • {report.language.toUpperCase()} ({report.difficulty})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#ffffff] hover:bg-[#f7f5f2] text-[#1b1b1b] border border-[#e8e5e0] shadow-2xs transition-all active:scale-[0.98]"
          >
            <Download className="h-3.5 w-3.5 text-[#52525b]" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Main Scorecard Header Card */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-[#e8e5e0]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">
                Hiring Committee Decision
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#f4f2ee] text-[#1b1b1b] border border-[#e8e5e0]">
                {report.difficulty}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b1b1b]">
              {report.candidateName}
            </h1>
            <p className="text-xs text-[#71717a]">
              Evaluated in {report.language.toUpperCase()} • Generated on {new Date(report.generatedAt).toLocaleDateString("en-US", { dateStyle: "long" })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-3xl sm:text-4xl font-black text-[#1b1b1b] font-mono">
                {report.finalScore}
                <span className="text-sm font-semibold text-[#71717a]">/100</span>
              </div>
              <span className="text-xs text-[#71717a] font-medium">Overall Score</span>
            </div>

            <div className={`px-4 py-3 rounded-2xl border ${badge.bg} ${badge.border} text-center min-w-[120px]`}>
              <span className={`text-sm font-extrabold block ${badge.text}`}>
                {badge.label}
              </span>
              <span className="text-[10px] uppercase font-bold text-[#71717a]">Status</span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717a]">
            Executive Evaluation Summary
          </h4>
          <p className="text-sm text-[#1b1b1b] leading-relaxed bg-[#f7f5f2] p-4 rounded-xl border border-[#e8e5e0]">
            {report.executiveSummary}
          </p>
        </div>

        {/* Radar & Skill Matrix */}
        <div className="pt-2">
          <ScoreRadar metrics={report.radarMetrics} />
        </div>
      </div>

      {/* Strengths & Growth Areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#059669]">
            <CheckCircle2 className="h-4 w-4" />
            <span>Key Demonstrated Strengths</span>
          </div>
          <ul className="space-y-2.5">
            {report.strengths.map((s, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-[#1b1b1b] leading-relaxed bg-[#ecfdf5] p-3 rounded-xl border border-[#a7f3d0]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#059669] mt-1.5 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Growth Areas */}
        <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#d97706]">
            <AlertTriangle className="h-4 w-4" />
            <span>Identified Growth & Revision Areas</span>
          </div>
          <ul className="space-y-2.5">
            {report.growthAreas.map((g, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-[#1b1b1b] leading-relaxed bg-[#fffbeb] p-3 rounded-xl border border-[#fde68a]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#d97706] mt-1.5 shrink-0" />
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Follow-Up Study Topics */}
      <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717a] flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#2563eb]" />
          <span>Recommended Next Study Topics</span>
        </h4>
        <div className="flex flex-wrap gap-2">
          {report.nextStudyTopics.map((topic, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-xl bg-[#f7f5f2] border border-[#e8e5e0] text-xs font-semibold text-[#1b1b1b]"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      {/* Turn-by-Turn Transcript Audit Logs */}
      {report.questionAudit && report.questionAudit.length > 0 && (
        <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 shadow-sm space-y-4">
          <button
            onClick={() => setShowAuditLogs(!showAuditLogs)}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold text-[#1b1b1b] flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#2563eb]" />
                <span>Turn-by-Turn Question Rubric Audit</span>
                <span className="text-xs font-normal text-[#71717a]">
                  ({report.questionAudit.length} questions evaluated)
                </span>
              </h4>
              <p className="text-xs text-[#71717a]">
                Review the rubric breakdowns and evaluator scores for each question
              </p>
            </div>
            {showAuditLogs ? (
              <ChevronUp className="h-5 w-5 text-[#71717a]" />
            ) : (
              <ChevronDown className="h-5 w-5 text-[#71717a]" />
            )}
          </button>

          {showAuditLogs && (
            <div className="space-y-4 pt-4 border-t border-[#e8e5e0]">
              {report.questionAudit.map((q, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#f7f5f2] border border-[#e8e5e0] space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#1b1b1b]">
                      Question {idx + 1}: {q.topic}
                    </span>
                    <span className="font-bold text-[#d97706] bg-[#fffbeb] px-2 py-0.5 rounded border border-[#fde68a]">
                      Score: {q.score}/10
                    </span>
                  </div>
                  <p className="text-[#52525b] italic">{q.question}</p>
                  <div className="bg-[#ffffff] p-2.5 rounded-lg border border-[#e8e5e0] text-[#1b1b1b]">
                    <strong className="text-[#71717a] uppercase text-[10px] block">Evaluator Notes:</strong>
                    {q.evaluatorNotes}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
