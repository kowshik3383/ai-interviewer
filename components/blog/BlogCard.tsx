// components/blog/BlogCard.tsx
import Link from "next/link";
import type { BlogMeta } from "@/lib/blog";
import { formatDate, languageName } from "@/lib/blog";
import { ArrowRight } from "lucide-react";

export default function BlogCard({ post }: { post: BlogMeta }) {
  const lang = languageName(post.language);

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col gap-4 rounded-2xl border border-[#e8e5e0] bg-[#ffffff] p-6 transition-all hover:border-[#b4b0a8] hover:bg-[#f7f5f2]"
    >
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#71717a]">
        <span>{formatDate(post.date)}</span>
        {lang && (
          <>
            <span className="text-[#d4d0c8]">•</span>
            <span className="rounded-md bg-[#f7f5f2] border border-[#e8e5e0] px-2 py-0.5 text-[10px] font-bold text-[#1b1b1b]">
              {lang}
            </span>
          </>
        )}
        <span className="text-[#d4d0c8]">•</span>
        <span>{post.readingTime} min read</span>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-bold text-[#1b1b1b] leading-snug tracking-tight text-balance group-hover:underline decoration-[#059669] decoration-2 underline-offset-4">
          {post.title}
        </h3>
        <p className="text-sm text-[#52525b] leading-relaxed line-clamp-3">
          {post.excerpt || post.description}
        </p>
      </div>

      <div className="flex items-center gap-1.5 mt-auto pt-1 text-xs font-bold text-[#059669]">
        <span>Read post</span>
        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}