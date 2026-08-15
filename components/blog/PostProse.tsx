// components/blog/PostProse.tsx
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import InterviewCTA from "./InterviewCTA";

const prettyCodeOptions = {
  theme: "github-light",
  keepBackground: false,
  defaultLang: "text",
};

export default function PostProse({
  content,
  language,
}: {
  content: string;
  language?: string | null;
}) {
  const components = {
    InterviewCTA,
    CTA: (props: { language?: string; label?: string }) => (
      <InterviewCTA language={props.language ?? language} label={props.label} />
    ),
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
      <pre {...props} />
    ),
  };

  return (
    <div className="blog-prose">
      <MDXRemote
        source={content}
        components={components}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
          },
        }}
      />
    </div>
  );
}