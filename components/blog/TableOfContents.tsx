// components/blog/TableOfContents.tsx
interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function extractHeadings(markdown: string): TocItem[] {
  const items: TocItem[] = [];
  const lines = markdown.split("\n");
  for (const line of lines) {
    const match = line.match(/^(##|###)\s+(.*)$/);
    if (!match) continue;
    const text = match[2].trim();
    items.push({ id: slugifyHeading(text), text, level: match[1] === "##" ? 2 : 3 });
  }
  return items;
}

export default function TableOfContents({ markdown }: { markdown: string }) {
  const items = extractHeadings(markdown);
  if (items.length === 0) return null;

  return (
    <nav className="mb-10 rounded-xl border border-[#e8e5e0] bg-[#f7f5f2] p-5">
      <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-[#71717a] mb-3">
        On this page
      </span>
      <ol className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className={item.level === 3 ? "pl-4" : ""}>
            <a
              href={`#${item.id}`}
              className="text-sm font-medium text-[#52525b] hover:text-[#1b1b1b] hover:underline decoration-[#059669] decoration-2 underline-offset-4"
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}