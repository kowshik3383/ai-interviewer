// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from "next/og";
import { getPost } from "@/lib/blog";

export const alt = "AI Technical Interviewer blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  const title = post?.title ?? "AI Technical Interviewer";
  const tag = post?.language ? post.language.toUpperCase() : "BLOG";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#fffafa",
          color: "#1b1b1b",
          padding: 64,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              backgroundColor: "#1b1b1b",
            }}
          />
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em" }}>
            AI Technical Interviewer
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 900 }}>
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.12em",
              color: "#059669",
            }}
          >
            {tag}
          </span>
          <div
            style={{
              fontSize: 52,
              fontWeight: 800,
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              textWrap: "balance",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 16,
            color: "#71717a",
            borderTop: "1px solid #e8e5e0",
            paddingTop: 20,
          }}
        >
          <span>Interview prep · question banks · scoring rubrics</span>
          <span>AI Technical Interviewer</span>
        </div>
      </div>
    ),
    size
  );
}