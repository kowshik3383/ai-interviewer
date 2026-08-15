// app/page.tsx
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  ArrowRight,
  Code2,
  PhoneCall,
  Sparkles,
  Layers,
  Cpu,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Terminal,
  Play,
  Lightbulb,
  Award,
  Radio,
  FileText,
  Volume2,
  Eye,
  Check,
} from "lucide-react";
import { SUPPORTED_LANGUAGES, QUESTION_BANKS } from "@/lib/prompts/question-banks";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fffafa] text-[#1b1b1b]">
      <Header />

      <main className="flex-1">
        {/* ========================================================================= */}
        {/* HERO SECTION                                                              */}
        {/* ========================================================================= */}
        <section className="pt-16 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Top Concept Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f4f2ee] border border-[#e5e2dc] text-xs font-bold text-[#1b1b1b]">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>Voice-First AI Technical Interviewer • Real-Time Code Visibility</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[#1b1b1b] leading-[1.12]">
              Realistic Coding Interviews That Hear, Watch, & Coach You
            </h1>

            {/* Subheading / Concept Explanation */}
            <p className="text-base sm:text-lg text-[#52525b] max-w-2xl mx-auto leading-relaxed">
              Experience an authentic technical evaluation powered by conversational AI voice. The interviewer <strong className="text-[#1b1b1b]">speaks out loud</strong>, <strong className="text-[#1b1b1b]">observes your keystrokes live</strong> via WebSockets, provides <strong className="text-[#1b1b1b]">gentle coaching hints</strong> when you get stuck, and outputs a rigorous hiring scorecard.
            </p>

            {/* Hero CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <Link
                href="/interview/setup"
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#1b1b1b] hover:bg-[#333333] text-[#fffafa] font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                <span>Launch Technical Interview</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#ffffff] hover:bg-[#f7f5f2] text-[#1b1b1b] font-bold text-sm border border-[#e8e5e0] shadow-sm transition-all active:scale-[0.98]"
              >
                <span>Candidate Dashboard</span>
              </Link>
            </div>
          </div>

          {/* Interactive Workspace Vector Simulation Preview */}
          <div className="mt-14 max-w-5xl mx-auto bg-[#ffffff] rounded-2xl border border-[#e8e5e0] shadow-xl overflow-hidden">
            {/* Mock Top Title Bar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#f7f5f2] border-b border-[#e8e5e0] text-xs">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#fca5a5]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#fde047]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#86efac]" />
                </div>
                <span className="font-bold text-[#1b1b1b] ml-2">Live Interview Workspace Simulation</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[#059669] font-bold text-[11px] bg-[#ecfdf5] px-2.5 py-0.5 rounded-full border border-[#a7f3d0]">
                  <Radio className="h-3 w-3 animate-pulse" />
                  <span>Voice Call Active (Varun)</span>
                </span>
                <span className="flex items-center gap-1 text-[#2563eb] font-bold text-[11px] bg-[#eff6ff] px-2.5 py-0.5 rounded-full border border-[#bfdbfe]">
                  <Eye className="h-3 w-3" />
                  <span>WebSocket Streaming Live</span>
                </span>
              </div>
            </div>

            {/* Split Screen Layout Representation */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[340px]">
              {/* Left Column: Voice Call Dialogue */}
              <div className="md:col-span-5 p-5 bg-[#fffafa] border-r border-[#e8e5e0] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  {/* AI Interviewer Turn */}
                  <div className="flex items-start gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-[#1b1b1b] text-[#fffafa] flex items-center justify-center text-xs font-bold shrink-0">
                      <PhoneCall className="h-3.5 w-3.5 text-emerald-400" />
                    </div>
                    <div className="bg-[#ffffff] border border-[#e8e5e0] p-3 rounded-2xl rounded-tl-xs text-xs space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between text-[10px] text-[#71717a] font-bold">
                        <span>Lead Technical Interviewer</span>
                        <span className="text-[#2563eb] flex items-center gap-1">
                          <Volume2 className="h-3 w-3" />
                          <span>Speaking aloud</span>
                        </span>
                      </div>
                      <p className="text-[#1b1b1b] leading-relaxed">
                        &ldquo;Welcome! Let&apos;s start with a coding challenge in Python. How would you group anagrams from a list of strings in O(N × K) time?&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Candidate Voice Turn */}
                  <div className="flex items-start justify-end gap-2.5">
                    <div className="bg-[#1b1b1b] text-[#fffafa] p-3 rounded-2xl rounded-tr-xs text-xs space-y-1 max-w-[85%] shadow-sm">
                      <span className="text-[10px] text-[#a1a1aa] block font-medium">Candidate (Spoken Live)</span>
                      <p className="leading-relaxed">
                        &ldquo;We can iterate through each word, sort its characters or build a character count tuple as a hash map key, and append the original word.&rdquo;
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Mic State */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#f7f5f2] border border-[#e8e5e0] text-xs">
                  <span className="text-[#71717a] font-medium flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span>Microphone Ready</span>
                  </span>
                  <span className="px-3 py-1 bg-[#1b1b1b] text-[#fffafa] rounded-full text-[10px] font-bold">
                    Tap to Speak
                  </span>
                </div>
              </div>

              {/* Right Column: Monaco Code Editor with Live Hint */}
              <div className="md:col-span-7 p-5 bg-[#ffffff] space-y-3 flex flex-col justify-between">
                {/* Proactive Coaching Hint Banner */}
                <div className="bg-[#fffbeb] border border-[#fde68a] p-3 rounded-xl flex items-start gap-2.5 text-xs text-[#92400e]">
                  <Lightbulb className="h-4 w-4 text-[#d97706] shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold uppercase tracking-wider text-[10px]">
                      Proactive Inactivity Hint (Spoken Out Loud)
                    </span>
                    <p className="leading-relaxed font-sans">
                      &ldquo;I see you started setting up the hash table. Remember that in Python, tuples are hashable and can be used directly as dictionary keys.&rdquo;
                    </p>
                  </div>
                </div>

                {/* Code Buffer Preview */}
                <div className="bg-[#f7f5f2] border border-[#e8e5e0] rounded-xl p-3 font-mono text-xs text-[#1b1b1b] space-y-1 overflow-hidden">
                  <div className="flex items-center justify-between text-[10px] text-[#71717a] pb-1 border-b border-[#e8e5e0]">
                    <span>solution.py</span>
                    <span className="text-[#059669] font-bold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#059669]" />
                      <span>AI Observing Code Live</span>
                    </span>
                  </div>
                  <pre className="text-[11px] leading-snug text-[#1b1b1b] pt-1">
{`from collections import defaultdict

def group_anagrams(words: list[str]) -> list[list[str]]:
    anagram_map = defaultdict(list)
    for word in words:
        # Group by character frequency tuple
        key = tuple(sorted(word))
        anagram_map[key].append(word)
    return list(anagram_map.values())`}
                  </pre>
                </div>

                {/* Editor Action Controls */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="text-[#71717a] font-mono text-[11px]">Sandbox: Isolated Runner</span>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-lg bg-[#ffffff] border border-[#e8e5e0] font-bold text-[#1b1b1b] flex items-center gap-1 shadow-2xs">
                      <Play className="h-3 w-3 text-[#059669] fill-[#059669]" />
                      <span>Run Code</span>
                    </span>
                    <span className="px-3.5 py-1 rounded-lg bg-[#1b1b1b] text-[#fffafa] font-bold shadow-sm">
                      Submit Solution
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* HOW IT WORKS - 4-STEP INTERACTIVE ARCHITECTURE PIPELINE                   */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[#f7f5f2] border-y border-[#e8e5e0] px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-14">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2563eb]">
                End-to-End Evaluation Workflow
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#1b1b1b]">
                How the AI Technical Interview Works
              </h2>
              <p className="text-xs sm:text-sm text-[#52525b]">
                From voice greeting to sandbox execution and final hiring scorecard.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Step 1 */}
              <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f2ee] text-[#1b1b1b] font-bold">
                      <Code2 className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#71717a]">01</span>
                  </div>
                  <h3 className="text-base font-bold text-[#1b1b1b]">
                    1. Stack & Difficulty Setup
                  </h3>
                  <p className="text-xs text-[#52525b] leading-relaxed">
                    Choose from <strong className="text-[#1b1b1b]">9 specialized language banks</strong> (JavaScript, Python, Java, C++, C, C#, SQL, HTML, CSS) and select your target seniority level (Junior, Mid, Senior).
                  </p>
                </div>
                <div className="pt-3 border-t border-[#f0ede8] text-[11px] text-[#71717a] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />
                  <span>Grounding question banks loaded</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f2ee] text-[#2563eb] font-bold">
                      <PhoneCall className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#71717a]">02</span>
                  </div>
                  <h3 className="text-base font-bold text-[#1b1b1b]">
                    2. Conversational Phone Call
                  </h3>
                  <p className="text-xs text-[#52525b] leading-relaxed">
                    The interviewer conducts dialogue naturally using <strong className="text-[#1b1b1b]">Shunya Labs Voice AI</strong>. You speak into your microphone, with automatic silence detection for natural turn-taking.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#f0ede8] text-[11px] text-[#71717a] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />
                  <span>Neural voice speech synthesis</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f2ee] text-[#d97706] font-bold">
                      <Zap className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#71717a]">03</span>
                  </div>
                  <h3 className="text-base font-bold text-[#1b1b1b]">
                    3. Live Code & Proactive Hints
                  </h3>
                  <p className="text-xs text-[#52525b] leading-relaxed">
                    Monaco Editor streams your keystrokes over WebSockets. When you pause or struggle for &gt;35s, the AI inspects your uncommitted buffer and <strong className="text-[#1b1b1b]">speaks a targeted micro-hint</strong>.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#f0ede8] text-[11px] text-[#71717a] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />
                  <span>WebSocket keystroke streaming</span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 space-y-4 shadow-sm flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f2ee] text-[#059669] font-bold">
                      <Award className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-[#71717a]">04</span>
                  </div>
                  <h3 className="text-base font-bold text-[#1b1b1b]">
                    4. Evaluation & Scorecard
                  </h3>
                  <p className="text-xs text-[#52525b] leading-relaxed">
                    Your code executes in an isolated sandbox. The FSM scores correctness, communication, and depth to generate a <strong className="text-[#1b1b1b]">Hiring Decision Scorecard</strong> with radar charts and rubric audit logs.
                  </p>
                </div>
                <div className="pt-3 border-t border-[#f0ede8] text-[11px] text-[#71717a] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#059669]" />
                  <span>Competency radar & PDF export</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* SUPPORTED STACKS GRID                                                     */}
        {/* ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#71717a]">
              Comprehensive Engineering Coverage
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#1b1b1b]">
              Specialized Question Banks for 9 Stacks
            </h2>
            <p className="text-xs sm:text-sm text-[#52525b]">
              Every language stack is pre-loaded with junior, mid-level, and senior challenges, theory questions, and starter code stubs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const bank = QUESTION_BANKS[lang.id];
              return (
                <div
                  key={lang.id}
                  className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 space-y-4 shadow-sm hover:border-[#b4b0a8] transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{lang.icon}</span>
                        <div>
                          <h4 className="text-base font-bold text-[#1b1b1b]">
                            {lang.name}
                          </h4>
                          <span className="text-[10px] font-mono text-[#71717a] uppercase">
                            .{lang.extension} • Monaco IDE
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Topics Chips */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] uppercase font-bold text-[#71717a]">
                        Evaluated Topics:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {bank?.topics.slice(0, 3).map((topic, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-[#f7f5f2] border border-[#e8e5e0] text-[10px] font-medium text-[#1b1b1b]"
                          >
                            {topic.split("(")[0].trim()}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Challenge Title */}
                    <div className="text-xs text-[#52525b] bg-[#f7f5f2] p-2.5 rounded-xl border border-[#e8e5e0]">
                      <strong className="text-[#1b1b1b] block text-[11px]">
                        Challenge Preview:
                      </strong>
                      <span className="line-clamp-1">{bank?.codingChallenges.mid.title}</span>
                    </div>
                  </div>

                  <Link
                    href={`/interview/setup?lang=${lang.id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#1b1b1b] hover:bg-[#333333] text-[#fffafa] font-semibold text-xs transition-all active:scale-[0.98]"
                  >
                    <span>Start {lang.name} Interview</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* ARCHITECTURAL RIGOR / KEY PILLARS                                         */}
        {/* ========================================================================= */}
        <section className="py-20 bg-[#f7f5f2] border-t border-[#e8e5e0] px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">
                System Architecture
              </span>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#1b1b1b]">
                Reliable Infrastructure Under the Hood
              </h2>
              <p className="text-xs sm:text-sm text-[#52525b]">
                Engineered with multi-model fallback resiliency, isolated compilation, and automated audio synthesis.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1: Multi-Model Priority Chain */}
              <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 space-y-3.5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f2ee] text-[#2563eb]">
                  <Cpu className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#1b1b1b]">
                  OpenRouter Multi-Model Fallback Chain
                </h3>
                <p className="text-xs text-[#52525b] leading-relaxed">
                  Automatic silent failover across Claude 3.5 Sonnet, GPT-4o, Gemini 2.5 Pro, DeepSeek, and LLaMA 3.3. If an upstream model is rate-limited, the interview proceeds without interruption.
                </p>
                <div className="space-y-1 pt-2 text-[11px] text-[#71717a]">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#059669]" />
                    <span>Zero rate-limit aborts</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#059669]" />
                    <span>Emergency structured rubric synthesis</span>
                  </div>
                </div>
              </div>

              {/* Feature 2: Shunya Labs Voice Platform */}
              <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 space-y-3.5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f2ee] text-[#059669]">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#1b1b1b]">
                  Shunya Labs Neural Voice AI
                </h3>
                <p className="text-xs text-[#52525b] leading-relaxed">
                  High-fidelity audio generation using Shunya Labs Zero-TTS with the <code>Varun</code> voice profile and <code>zero-indic</code> model for natural dialogue cadence.
                </p>
                <div className="space-y-1 pt-2 text-[11px] text-[#71717a]">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#059669]" />
                    <span>Live speech turn-taking</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#059669]" />
                    <span>Instant spoken coaching hints</span>
                  </div>
                </div>
              </div>

              {/* Feature 3: Standardized FSM & Sandboxing */}
              <div className="bg-[#ffffff] rounded-2xl border border-[#e8e5e0] p-6 space-y-3.5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f4f2ee] text-[#7c3aed]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-[#1b1b1b]">
                  Deterministic FSM & Sandboxing
                </h3>
                <p className="text-xs text-[#52525b] leading-relaxed">
                  Finite state transitions maintain interview structure without hallucinated phases. Sandboxed compiler executions measure runtime, stderr, and memory safely.
                </p>
                <div className="space-y-1 pt-2 text-[11px] text-[#71717a]">
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#059669]" />
                    <span>Deterministic rubric scoring</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="h-3 w-3 text-[#059669]" />
                    <span>Competency radar matrix generation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* FINAL CALL TO ACTION BANNER                                              */}
        {/* ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
          <div className="bg-[#ffffff] rounded-3xl border border-[#e8e5e0] p-8 sm:p-12 shadow-md space-y-6">
            <div className="space-y-2 max-w-xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1b1b1b]">
                Ready to Test Your Technical Acumen?
              </h2>
              <p className="text-xs sm:text-sm text-[#52525b]">
                Launch an interview in Python, JavaScript, Java, C++, or SQL. Experience real-time spoken feedback and receive your comprehensive scorecard.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/interview/setup"
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#1b1b1b] hover:bg-[#333333] text-[#fffafa] font-bold text-sm shadow-md transition-all active:scale-[0.98]"
              >
                <span>Start Technical Interview</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
