# AI Technical Interviewer

**An adaptive, AI-driven technical interview simulator that interviews, scores, and coaches you like a real senior hiring manager.**

Practices you across **9 programming languages** and **3 difficulty levels** — from warm-up to live coding to a full hiring scorecard — powered by a deterministic interview state machine and a multi-model AI fallback chain.

[![Next.js 16](https://img.shields.io/badge/Next.js-16.x-black)](https://nextjs.org) [![React 19](https://img.shields.io/badge/React-19.2-blue)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org) [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind%20CSS-v4-38bdf8)](https://tailwindcss.com) [![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748)](https://www.prisma.io) [![License](https://img.shields.io/badge/License-Private-red)]() [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen)]()

---

## ⚡ Highlights

- 🧠 **Human-like adaptive interviewer** — natural tone, name usage, and six follow-up strategies (`CLARIFY`, `PROBE_DEEPER`, `CHALLENGE`, `REDIRECT`, `AFFIRM_AND_ADVANCE`, `CONNECT`).
- 🔁 **Deterministic interview FSM** — `INTRO → WARMUP → CORE_QUESTIONS → CODING_CHALLENGE → FOLLOW_UPS → WRAP_UP → REPORT_GENERATED`, with difficulty-based question counts and struggle-triggered deep dives.
- 📚 **9 curated question banks** — JavaScript, Python, HTML, CSS, Java, C, C++, C#, and SQL, each with topic lists plus junior/mid/senior coding challenges.
- 🛟 **Multi-model resilience** — an 11-model OpenRouter fallback chain (Claude → GPT-4o → Gemini → DeepSeek → Llama → Qwen) with a deterministic offline emergency fallback, so interviews never die mid-question.
- 💻 **Live coding in Monaco** — real-time editor with stdin/stdout/stderr execution via a remote sandbox (Shuya Labs) and a resilient local fallback engine.
- 🎙️ **Live voice hints** — a WebSocket server watches your code as you type; idle too long and the interviewer gently nudges you (max 3 hints), spoken via AI TTS.
- 📊 **Hiring scorecard** — per-turn 0–10 rubric (correctness + depth + communication), five-axis radar (Correctness, Depth, Communication, Problem Solving, Code Quality), and a `STRONG_HIRE`→`NO_HIRE` recommendation.
- ✍️ **30+ SEO-ready blog posts** — MDX content with syntax highlighting, table of contents, related posts, OG images, and sitemap/robots.

---

## 🏗️ System Architecture

flowchart LR
    subgraph Client["Next.js 16 Client (React 19 + Tailwind v4)"]
        UI["App Router Pages<br/>/interview/setup · /interview/[id] · /report · /dashboard"]
        Editor["Monaco Editor<br/>live code buffer"]
        WS["WebSocket Hook<br/>useInterviewWebSocket"]
    end

    subgraph API["Next.js API Layer"]
        Start["POST /api/interview/start"]
        Turn["POST /api/interview/[id]/turn"]
        Exec["POST /api/execute"]
        Report["POST /api/interview/[id]/report"]
        Hint["GET /api/interview/[id]/live-hint"]
        TTS["POST /api/tts"]
    end

    subgraph Engine["Interview Engine"]
        FSM["Finite State Machine<br/>lib/fsm.ts"]
        Prompts["Interviewer Prompt Builder<br/>lib/prompts/interviewer.ts"]
        Banks["9 Question Banks<br/>lib/prompts/question-banks/"]
        Scoring["Scoring & Report<br/>lib/scoring.ts"]
    end

    subgraph AI["AI Layer"]
        OR["OpenRouter<br/>multi-model fallback chain"]
        HintEngine["Hint Engine<br/>lib/hint-engine.ts"]
    end

    subgraph Data["Persistence"]
        Prisma["Prisma ORM"]
        SQLite[("SQLite<br/>User · Session · Turn")]
    end

    subgraph Sandbox["Execution"]
        Remote[("Shuya Labs Sandbox<br/>remote execution")]
        Local[("Local Fallback Engine<br/>JS/Python/SQL/HTML/CSS")]
    end

    UI --> Start
    UI --> Turn
    Editor --> Exec
    UI --> Report
    UI --> WS

    Start --> Prompts
    Turn --> FSM
    Turn --> Prompts
    Report --> Scoring
    Hint --> HintEngine

    Prompts --> Banks
    Prompts --> OR
    FSM --> OR
    HintEngine --> OR
    Scoring --> OR

    Exec --> Remote
    Exec --> Local

    WS --> HintEngine
    HintEngine --> TTS

    Start --> Prisma
    Turn --> Prisma
    Report --> Prisma
    Prisma --> SQLite

---

## 🔄 Interview Turn Flow

flowchart TD
    A["Candidate answers + code snapshot"] --> B["POST /api/interview/[id]/turn"]
    B --> C["Load Session + last 10 turns (Prisma)"]
    C --> D["Rebuild FSM context from turn history"]
    D --> E["Build interviewer prompt<br/>(grounded in question bank)"]
    E --> F["Call OpenRouter<br/>fallback chain"]
    F --> G["Parse JSON: message + internal_evaluation"]
    G --> H["Execute FSM transition<br/>getNextSessionState(action, score)"]
    H --> I["Persist candidate + AI turns"]
    I --> J["Update session state / finalScore"]
    J --> K["Return score, notes, action, next state"]

---

## 📊 FSM State Machine

stateDiagram-v2
    [*] --> INTRO
    INTRO --> WARMUP_QUESTION
    WARMUP_QUESTION --> CORE_QUESTIONS
    CORE_QUESTIONS --> CODING_CHALLENGE: max questions reached
    CODING_CHALLENGE --> FOLLOW_UPS: avg < 7.0 & some score <= 5
    CODING_CHALLENGE --> WRAP_UP: scored well
    FOLLOW_UPS --> WRAP_UP
    WRAP_UP --> REPORT_GENERATED
    REPORT_GENERATED --> [*]

---

## 📦 Core Modules

| Module | Path | Responsibility |
| --- | --- | --- |
| **Interview Engine** | `lib/fsm.ts` | Deterministic state machine: states, transitions, difficulty-based caps, follow-up limits |
| **Prompt Builder** | `lib/prompts/interviewer.ts` | Builds grounded interviewer system prompts from question banks |
| **Question Banks** | `lib/prompts/question-banks/` | 9 languages × topics + junior/mid/senior coding challenges |
| **AI Gateway** | `lib/openrouter.ts` | Multi-model fallback chain + emergency offline fallback |
| **Model Chain** | `lib/models.ts` | 11-model primary chain + 4-model light chain (hints) |
| **Scoring** | `lib/scoring.ts` | Per-turn rubric, 0–100 scorecard, radar metrics, recommendation |
| **Code Sandbox** | `lib/sandbox.ts` | Remote execution + local fallback for JS/Python/SQL/HTML/CSS/compiled langs |
| **Live Hints** | `lib/hint-engine.ts` | Non-spoiler hint generation from live code buffer |
| **Voice TTS** | `lib/shunya-tts.ts` | AI speech synthesis with browser-speech fallback |
| **WS Server** | `lib/ws-server.ts` | Real-time code streaming, struggle detection, proactive hints |
| **Blog Content** | `lib/blog.ts` + `content/blog/` | MDX posts, related posts, reading time, SEO metadata |

---

## 🧩 Scoring Rubric

flowchart LR
    subgraph Turn["Per-Turn Score (0–10)"]
        C["Correctness & Accuracy (0–4)"]
        D["Depth of Understanding (0–3)"]
        M["Communication & Structure (0–3)"]
    end
    subgraph Report["Final Scorecard (0–100)"]
        R["Radar: Correctness · Depth ·<br/>Communication · Problem Solving · Code Quality"]
        N["Recommendation: STRONG_HIRE ≥ 85<br/>HIRE ≥ 70 · LEAN_HIRE ≥ 55<br/>LEAN_NO_HIRE ≥ 45 · else NO_HIRE"]
    end
    Turn --> Report

---

## 🛠️ Tech Stack

| Layer | Technology |
| --- | --- |
| **Framework** | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5 |
| **Styling** | Tailwind CSS v4 |
| **Database** | Prisma 6 · SQLite |
| **Auth** | NextAuth v5 (Google OAuth + guest candidate mode) |
| **AI** | OpenRouter (Claude, GPT-4o, Gemini, DeepSeek, Llama, Qwen) |
| **Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Charts** | Recharts (radar) · jspdf + html2canvas (report export) |
| **Realtime** | `ws` WebSocket server (port 3001) |
| **Code Execution** | Shuya Labs sandbox + local fallback engine |
| **Voice** | Shunya Labs TTS + browser speech synthesis |
| **Blog** | MDX (`next-mdx-remote`) · `rehype-pretty-code` + Shiki · `remark-gfm` · gray-matter |

---

## 📁 Project Structure

```
ai-interviewer/
├── app/
│   ├── (auth)/login/            # Google OAuth + guest login
│   ├── api/
│   │   ├── auth/                # NextAuth handler
│   │   ├── execute/             # Code execution proxy
│   │   ├── interview/
│   │   │   ├── start/           # Create session + first AI turn
│   │   │   └── [sessionId]/
│   │   │       ├── turn/        # Evaluate answer, run FSM
│   │   │       ├── live-hint/   # On-demand hint
│   │   │       └── report/      # Final scorecard synthesis
│   │   ├── sessions/            # User session history
│   │   └── tts/                 # Voice synthesis
│   ├── blog/                    # SEO blog index + MDX posts (+ OG images)
│   ├── dashboard/               # Past interviews
│   ├── interview/               # Live interview + report pages
│   ├── layout.tsx / globals.css
│   ├── robots.ts / sitemap.ts
│   └── page.tsx                 # Landing
├── components/
│   ├── blog/                    # BlogCard, PostProse, TOC, RelatedPosts, CTA
│   ├── chat/                    # Interview chat UI
│   ├── editor/                  # Monaco + output console
│   └── report/                  # ScoreRadar, Scorecard
├── content/blog/                # 33 MDX blog posts
├── hooks/                       # useInterviewWebSocket
├── lib/
│   ├── prompts/question-banks/  # 9 language banks
│   ├── auth.ts · blog.ts · db.ts · fsm.ts
│   ├── hint-engine.ts · models.ts · openrouter.ts
│   ├── sandbox.ts · scoring.ts · shunya-tts.ts · ws-server.ts
├── prisma/schema.prisma         # User · Session · Turn models
├── scripts/ws-server.ts         # Standalone WS server
└── design.md                    # Locked design system (Hallmark)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** `20.x`+ (Next.js 16)
- **npm** (or your preferred package manager)
- **OpenRouter API key** (AI interviews) — optional, offline fallback kicks in without it

### Installation

```bash
# Clone the repository
git clone https://github.com/kowshik3383/ai-interviewer.git
cd ai-interviewer

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# → fill in OPENROUTER_API_KEY, DATABASE_URL, AUTH_* etc.

# Initialize the database
npx prisma db push
```

### Development

```bash
# Terminal 1 — Next.js dev server
npm run dev

# Terminal 2 — live hint WebSocket server
npm run ws
```

Then open **http://localhost:3000**, sign in with Google or as a guest, pick a language + difficulty, and start your interview.

### Production

```bash
npm run build
npm start
```

---

## 🔐 Environment Variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | SQLite connection string |
| `OPENROUTER_API_KEY` | ⚠️ | AI model gateway (falls back offline) |
| `OPENROUTER_MODEL` | ❌ | Default model override |
| `NEXT_PUBLIC_APP_URL` | ❌ | App base URL |
| `SHUNYALABS_API_KEY` | ❌ | Remote code sandbox + TTS |
| `SHUYA_LABS_EXEC_URL` | ❌ | Sandbox endpoint |
| `SHUNYA_TTS_VOICE` / `SHUNYA_ASR_MODEL` | ❌ | Voice / ASR config |
| `AUTH_SECRET` / `NEXTAUTH_SECRET` | ⚠️ | Session signing |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth |
| `STITCH_API_KEY` | ❌ | Stitch SDK integration |

---

## 🗺️ Roadmap

- **v0.1 (Current)** — Adaptive interviews, 9 language banks, FSM flow, live hints, hiring scorecard.
- **v0.2** — More languages (Go, Rust, Kotlin), system-design interview mode.
- **v0.3** — Team mock-loops (multiple AI interviewers), company-specific question packs.
- **v0.4** — Performance analytics across sessions and targeted study plans.

---

## 🤝 Contributing

Bug reports, feature requests, and PRs are welcome. Please open an issue before making large changes.

---

## 📄 License

Private project. All rights reserved.
