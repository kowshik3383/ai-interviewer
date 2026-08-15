// app/blog/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogCard from "@/components/blog/BlogCard";
import { getAllPosts } from "@/lib/blog";
import { SUPPORTED_LANGUAGES } from "@/lib/prompts/question-banks";
import { ArrowRight } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://ai-interviewer-ten-delta.vercel.app";

export const metadata: Metadata = {
  title: "Interview Prep Guides & Tech Deep-Dives | AI Technical Interviewer",
  description:
    "30+ guides on JavaScript, Python, Java, C, C++, C#, SQL, HTML, and CSS interview questions, plus scoring rubrics and career advice for technical interviews.",
  keywords: [
    "technical interview questions",
    "coding interview prep",
    "JavaScript interview",
    "Python interview",
    "SQL interview",
    "interview scorecard",
  ],
  alternates: {
    canonical: "/blog",
  },
  openGraph: {
    title: "Interview Prep Guides & Tech Deep-Dives | AI Technical Interviewer",
    description:
      "30+ guides on technical interview questions, scoring rubrics, and career advice.",
    type: "website",
    url: `${SITE_URL}/blog`,
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const featured = posts.filter((p) => p.featured);
  const latest = featured.length > 0 ? posts : posts.slice(0, 6);
  const rest = posts.filter((p) => !featured.some((f) => f.slug === p.slug));

  const languageGroups = SUPPORTED_LANGUAGES.map((lang) => ({
    lang,
    posts: posts.filter((p) => p.language === lang.id),
  })).filter((g) => g.posts.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#fffafa] text-[#1b1b1b]">
      <Header />

      <main className="flex-1">
        {/* Intro band — Ecosystem Index voice: named surfaces, dated, counted */}
        <section className="border-b border-[#e8e5e0] bg-[#fffafa] px-4 sm:px-6 lg:px-8 pt-14 pb-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#059669] mb-4">
              Field notes for engineers
            </p>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#1b1b1b] leading-[1.1] max-w-3xl text-balance">
              Interview prep, question banks, and the rubrics interviewers actually use.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-[#52525b] max-w-2xl leading-relaxed">
              {posts.length} guides across JavaScript, Python, Java, C, C++, C#, SQL,
              HTML, and CSS — written from real interview evaluation data, not recycled
              from listicles.
            </p>
          </div>
        </section>

        {/* Latest rail */}
        <section className="px-4 sm:px-6 lg:px-8 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#71717a]">
                Latest
              </h2>
              <span className="text-[11px] font-mono text-[#71717a]">
                {latest.length} posts
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {latest.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>

        {/* By language rail */}
        <section className="px-4 sm:px-6 lg:px-8 py-14 bg-[#f7f5f2] border-y border-[#e8e5e0]">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#71717a]">
                By language
              </h2>
              <span className="text-[11px] font-mono text-[#71717a]">
                {languageGroups.length} stacks
              </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {languageGroups.map(({ lang, posts: group }) => (
                <Link
                  key={lang.id}
                  href={`/interview/setup?lang=${lang.id}`}
                  className="group flex flex-col gap-2 rounded-xl border border-[#e8e5e0] bg-[#ffffff] p-5 transition-all hover:border-[#b4b0a8]"
                >
                  <span className="text-xl">{lang.icon}</span>
                  <span className="text-sm font-bold text-[#1b1b1b]">{lang.name}</span>
                  <span className="text-[11px] text-[#71717a]">
                    {group.length} guide{group.length === 1 ? "" : "s"} · practice live
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#059669]">
                    <span>Explore</span>
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Whole catalogue rail */}
        <section className="px-4 sm:px-6 lg:px-8 py-14">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-end justify-between mb-8">
              <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#71717a]">
                The whole catalogue
              </h2>
              <span className="text-[11px] font-mono text-[#71717a]">
                {rest.length} more
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {rest.map((post) => (
                <BlogCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}