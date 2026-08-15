"use client";

// components/report/ScoreRadar.tsx
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { RadarMetric } from "@/lib/scoring";

interface ScoreRadarProps {
  metrics: RadarMetric[];
}

export default function ScoreRadar({ metrics }: ScoreRadarProps) {
  const chartData = metrics.map((m) => ({
    subject: m.category,
    score: m.score,
    fullMark: m.fullMark || 100,
  }));

  const getBarColor = (score: number) => {
    if (score >= 80) return "#059669";
    if (score >= 65) return "#2563eb";
    if (score >= 50) return "#d97706";
    return "#e11d48";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
      {/* Radar Matrix Chart */}
      <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-[#f7f5f2] border border-[#e8e5e0]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717a] mb-2">
          Competency Radar Matrix
        </h4>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
              <PolarGrid stroke="#e2ded6" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#1b1b1b", fontSize: 11, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fill: "#71717a", fontSize: 9 }}
              />
              <Radar
                name="Candidate Score"
                dataKey="score"
                stroke="#1b1b1b"
                fill="#1b1b1b"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bar Chart Breakdown */}
      <div className="flex flex-col justify-center p-4 rounded-2xl bg-[#f7f5f2] border border-[#e8e5e0]">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#71717a] mb-4">
          Skill Dimension Breakdown
        </h4>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#71717a", fontSize: 10 }} />
              <YAxis
                type="category"
                dataKey="subject"
                tick={{ fill: "#1b1b1b", fontSize: 11, fontWeight: 600 }}
                width={120}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#ffffff",
                  borderColor: "#e8e5e0",
                  borderRadius: "12px",
                  fontSize: "12px",
                  color: "#1b1b1b",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              />
              <Bar dataKey="score" radius={[0, 6, 6, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
