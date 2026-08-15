// app/blog/[slug]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostProse from "@/components/blog/PostProse";
import TableOfContents from "@/components/blog/TableOfContents";
import RelatedPosts from "@/components/blog/RelatedPosts";
import { getPost, getAllPosts, getRelatedPosts, formatDate, languageName } from "@/lib/blog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };

  const lang = languageName(post.language);
  return {
    title: post.title,
    description: post.description,
    keywords: [...post.tags, ...(lang ? [lang, `${lang} interview`] : [])],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post, 3);
  const lang = languageName(post.language);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.updated,
    inLanguage: "en",
    mainEntityOfPage: `https://ai-interviewer.app/blog/${post.slug}`,
    about: post.language ? `${lang} technical interview` : "technical interview",
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fffafa] text-[#1b1b1b]">
      <Header />

      <main className="flex-1">
        <article>
          {/* Post header — Long Document voice: no hero chrome */}
          <header className="px-4 sm:px-6 lg:px-8 pt-14 pb-8">
            <div className="mx-auto max-w-3xl space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
                <Link href="/blog" className="hover:text-[#1b1b1b] font-bold">
                  Blog
                </Link>
                <span className="text-[#d4d0c8]">/</span>
                <span>{formatDate(post.date)}</span>
                {lang && (
                  <>
                    <span className="text-[#d4d0c8]">/</span>
                    <span className="rounded-md bg-[#f7f5f2] border border-[#e8e5e0] px-2 py-0.5 text-[10px] font-bold text-[#1b1b1b]">
                      {lang}
                    </span>
                  </>
                )}
                {post.level && (
                  <>
                    <span className="text-[#d4d0c8]">/</span>
                    <span className="capitalize">{post.level}</span>
                  </>
                )}
                <span className="text-[#d4d0c8]">/</span>
                <span>{post.readingTime} min read</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1b1b1b] leading-[1.15] text-balance">
                {post.title}
              </h1>

              <p className="text-base sm:text-lg text-[#52525b] leading-relaxed max-w-2xl">
                {post.description}
              </p>

              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-[#f7f5f2] border border-[#e8e5e0] text-[11px] font-medium text-[#52525b]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Body — single column, measured */}
          <div className="px-4 sm:px-6 lg:px-8 pb-16">
            <div className="mx-auto max-w-3xl">
              <TableOfContents markdown={post.content} />
              <PostProse content={post.content} language={post.language} />
            </div>
          </div>

          {/* Related — hairline-separated */}
          <div className="px-4 sm:px-6 lg:px-8 pb-20">
            <div className="mx-auto max-w-3xl">
              <RelatedPosts posts={related} />
            </div>
          </div>
        </article>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </main>

      <Footer />
    </div>
  );
}