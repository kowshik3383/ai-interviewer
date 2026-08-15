"use client";

// app/interview/[sessionId]/report/page.tsx
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Scorecard from "@/components/report/Scorecard";
import { EvaluationReport } from "@/lib/scoring";
import { ArrowLeft, RefreshCw, AlertCircle, Sparkles } from "lucide-react";

interface PageParams {
  params: Promise<{ sessionId: string }>;
}

export default function ReportPage({ params }: PageParams) {
  const { sessionId } = use(params);
  const router = useRouter();
  const [report, setReport] = useState<EvaluationReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrGenerateReport() {
      try {
        const res = await fetch(`/api/interview/${sessionId}/report`);
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) {
          throw new Error("Report not ready or session missing");
        }
        const data = await res.json();
        setReport(data.report);
      } catch (err: any) {
        console.error("Report fetch error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadOrGenerateReport();
  }, [sessionId]);

  const handleRegenerate = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/interview/${sessionId}/report`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Regeneration failed");
      const data = await res.json();
      setReport(data.report);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading || isGenerating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffafa] text-[#1b1b1b]">
        <div className="flex flex-col items-center gap-3 text-center p-6">
          <div className="h-9 w-9 rounded-full border-2 border-[#1b1b1b] border-t-transparent animate-spin" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#1b1b1b]">
              Synthesizing Hiring Decision & Scorecard
            </h3>
            <p className="text-xs text-[#71717a] font-mono max-w-sm">
              Evaluating code efficiency, algorithmic rigor, communication, and rubric weights...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffafa] text-[#1b1b1b] p-4 space-y-4">
        <AlertCircle className="h-10 w-10 text-[#e11d48]" />
        <div className="text-center space-y-1">
          <h2 className="text-lg font-bold">Could not load evaluation report</h2>
          <p className="text-xs text-[#71717a]">{error || "Please try generating the report again."}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/interview/${sessionId}`}
            className="px-4 py-2 rounded-xl bg-[#ffffff] border border-[#e8e5e0] text-xs font-semibold text-[#1b1b1b]"
          >
            Back to Interview
          </Link>
          <button
            onClick={handleRegenerate}
            className="px-4 py-2 rounded-xl bg-[#1b1b1b] text-xs font-semibold text-[#fffafa]"
          >
            Generate Scorecard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#fffafa] text-[#1b1b1b]">
      <Header
        candidateName={report.candidateName}
        language={report.language}
        sessionState="REPORT_GENERATED"
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#71717a] hover:text-[#1b1b1b] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Dashboard</span>
          </Link>

          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#71717a] hover:text-[#1b1b1b] px-3 py-1.5 rounded-xl border border-[#e8e5e0] hover:bg-[#ffffff] transition-all"
          >
            <RefreshCw className={`h-3 w-3 ${isGenerating ? "animate-spin" : ""}`} />
            <span>Recalculate Scorecard</span>
          </button>
        </div>

        {/* The Scorecard */}
        <Scorecard report={report} sessionId={sessionId} />
      </main>

      <Footer />
    </div>
  );
}
