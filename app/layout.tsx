// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ai-interviewer.app"),
  title: "AI Technical Interviewer | Adaptive Multi-Language Engineering Evaluations",
  description:
    "Conduct realistic, adaptive technical interviews in HTML, CSS, JavaScript, Python, Java, C, C++, C#, and SQL with real-time evaluation, sandbox code execution, and comprehensive hiring scorecards.",
  keywords: [
    "AI Interviewer",
    "Technical Interview",
    "Coding Interview",
    "OpenRouter Fallback",
    "Python Interview",
    "JavaScript Interview",
    "System Design",
    "Hiring Scorecard",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#fffafa] text-[#1b1b1b] antialiased flex flex-col font-sans selection:bg-neutral-900 selection:text-[#fffafa]">
        {children}
      </body>
    </html>
  );
}
