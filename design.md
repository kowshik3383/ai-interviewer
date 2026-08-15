# Design — AI Technical Interviewer Blog

Locked design system. Future Hallmark runs read this file first; pages defer
to it. Amend intentionally — the file is the rule.

## System
- Genre · editorial (technical long-form)
- Macrostructure (index) · Ecosystem Index
- Macrostructure (post) · Long Document
- Theme · catalog-free: brand tokens preserved (paper `#fffafa`, ink `#1b1b1b`)
- Axes · light paper / geometric-sans display (Plus Jakarta Sans) / neutral accent + emerald CTA

## Tokens (canonical · `app/globals.css` is the source of truth)
```css
:root {
  --color-paper:      #fffafa;
  --color-paper-2:    #f7f5f2;
  --color-ink:        #1b1b1b;
  --color-ink-2:      #52525b;
  --color-ink-3:      #71717a;
  --color-rule:       #e8e5e0;
  --color-rule-soft:  #f0ede8;
  --color-accent:     #059669;
  --color-accent-ink: #ecfdf5;
  --color-focus:      #059669;

  --font-display: "Plus Jakarta Sans", system-ui, sans-serif;
  --font-body:    "Plus Jakarta Sans", system-ui, sans-serif;
  --font-mono:    "JetBrains Mono", monospace;

  /* 4-pt spacing scale via Tailwind default; prose uses em-based rhythm. */
  /* Type scale 1.25 (major third), 16px body. */
}
```

## CTA voice
- Primary (InterviewCTA) · solid ink `#1b1b1b` fill, `#fffafa` text, rounded-xl, 44px+ hit target
- Accent inline link · emerald `#059669`, underline on hover only
- Secondary nav · text + hairline border, never pill+gradient

## Motion stance
- motion-cut (no animation library). Single permitted primitive: `animate-pulse` on the live-session dot in the site Header (pre-existing, untouched).
- `prefers-reduced-motion` respected via no scroll-linked animation.
- All interactive transitions ≤ 150ms via the app's existing cubic-bezier rule.

## Prose rules
- Measure 60–65ch, line-height 1.65, body 16px+, `text-balance` on headings.
- H1 roman, never italic. Emphasis in headings via weight or accent, not italics.
- H2 = inline small-caps phrase emerging from the flow (Long Document voice).
- Code = real syntax-highlighted blocks, light theme matched to paper, JetBrains Mono.
- No fake IDE chrome, no fake browser bars, no card-in-card, no glassmorphism.
- Answers the query in the first 2–3 sentences. No invented metrics, testimonials, or logos.

## Honesty rule
All claims about evaluation, scoring, and interview structure come from the actual
schema (`prisma/schema.prisma`), the FSM (`lib/fsm.ts`), and the question banks
(`lib/prompts/question-banks/`). Never invent scores, counts, or quotes.

## Exports
`app/globals.css` (in this project) is the source of truth.