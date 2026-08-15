// components/blog/RelatedPosts.tsx
import Link from "next/link";
import type { BlogMeta } from "@/lib/blog";
import { formatDate, languageName } from "@/lib/blog";
import { ArrowRight } from "lucide-react";

export default function RelatedPosts({ posts }: { posts: BlogMeta[] }) {
  if (posts.length === 0) return null;

  return (
    <section className="mt-14 pt-10 border-t border-[#e8e5e0]">
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-[#71717a] mb-6">
        Continue reading
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {posts.map((post) => {
          const lang = languageName(post.language);
          return (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-3 rounded-xl border border-[#e8e5e0] bg-[#ffffff] p-5 transition-all hover:border-[#b4b0a8]"
            >
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#71717a]">
                {formatDate(post.date)}
                {lang ? ` · ${lang}` : ""}
              </span>
              <span className="text-sm font-bold text-[#1b1b1b] leading-snug text-balance group-hover:underline decoration-[#059669] decoration-2 underline-offset-4">
                {post.title}
              </span>
              <span className="mt-auto flex items-center gap-1 text-[11px] font-bold text-[#059669]">
                <span>Read</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}