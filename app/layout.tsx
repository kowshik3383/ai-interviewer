// app/layout.tsx
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ai-interviewer-ten-delta.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "AI Technical Interviewer | Adaptive Multi-Language Engineering Evaluations",
    description:
      "Conduct realistic, adaptive technical interviews in HTML, CSS, JavaScript, Python, Java, C, C++, C#, and SQL with real-time evaluation, sandbox code execution, and comprehensive hiring scorecards.",
    url: SITE_URL,
    siteName: "AI Technical Interviewer",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Technical Interviewer | Adaptive Multi-Language Engineering Evaluations",
    description:
      "Conduct realistic, adaptive technical interviews in HTML, CSS, JavaScript, Python, Java, C, C++, C#, and SQL with real-time evaluation, sandbox code execution, and comprehensive hiring scorecards.",
  },
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
