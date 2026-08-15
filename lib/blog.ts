// lib/blog.ts
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { SUPPORTED_LANGUAGES } from "@/lib/prompts/question-banks";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string;
  language: string | null;
  level: string | null;
  tags: string[];
  excerpt: string;
  featured?: boolean;
  content: string;
  readingTime: number;
}

export interface BlogMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated: string;
  language: string | null;
  level: string | null;
  tags: string[];
  excerpt: string;
  featured?: boolean;
  readingTime: number;
}

function slugify(filename: string): string {
  return filename.replace(/\.mdx?$/, "");
}

function readingTimeOf(body: string): number {
  const words = body.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

export function getPost(slug: string): BlogPost | null {
  const candidates = [`.mdx`, `.md`]
    .map((ext) => path.join(BLOG_DIR, `${slug}${ext}`))
    .filter((p) => fs.existsSync(p));

  if (candidates.length === 0) return null;

  const raw = fs.readFileSync(candidates[0], "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title || slug,
    description: data.description || "",
    date: data.date || "",
    updated: data.updated || data.date || "",
    language: data.language ?? null,
    level: data.level ?? null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    excerpt: data.excerpt || "",
    featured: Boolean(data.featured),
    content,
    readingTime: readingTimeOf(content),
  };
}

export function getAllPosts(): BlogMeta[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const files = fs.readdirSync(BLOG_DIR).filter((f) => /\.mdx?$/.test(f));
  return files
    .map((f) => {
      const post = getPost(slugify(f));
      return post ? toMeta(post) : null;
    })
    .filter((p): p is BlogMeta => p !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function toMeta(post: BlogPost): BlogMeta {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    updated: post.updated,
    language: post.language,
    level: post.level,
    tags: post.tags,
    excerpt: post.excerpt,
    featured: post.featured,
    readingTime: post.readingTime,
  };
}

export function getRelatedPosts(post: BlogPost, limit = 3): BlogMeta[] {
  const all = getAllPosts().filter((p) => p.slug !== post.slug);
  const score = (p: BlogMeta): number => {
    let s = 0;
    if (post.language && p.language === post.language) s += 3;
    if (post.level && p.level === post.level) s += 2;
    post.tags.forEach((t) => {
      if (p.tags.includes(t)) s += 1;
    });
    return s;
  };
  return all.sort((a, b) => score(b) - score(a)).slice(0, limit);
}

export function languageName(lang: string | null): string | null {
  if (!lang) return null;
  const found = SUPPORTED_LANGUAGES.find((l) => l.id === lang);
  return found ? found.name : lang;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}