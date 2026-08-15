// app/robots.ts
import type { MetadataRoute } from "next";

const SITE_URL = "https://ai-interviewer.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/interview/[sessionId]"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}