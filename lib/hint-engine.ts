// lib/hint-engine.ts
import { callWithFallback } from "./openrouter";
import { generateShunyaSpeech } from "./shunya-tts";

export interface LiveHintParams {
  language: string;
  currentCode: string;
  lastQuestion?: string;
  difficulty?: string;
  idleDurationSeconds?: number;
  candidateName?: string;
}

export interface LiveHintResult {
  hintText: string;
  suggestedFocus?: string;
  audioBase64?: string | null;
  generatedAt: number;
}

/**
 * Analyzes candidate's real-time in-progress code buffer and generates a gentle, non-spoiler hint
 */
export async function analyzeLiveCodeAndGenerateHint(
  params: LiveHintParams
): Promise<LiveHintResult> {
  const language = params.language || "javascript";
  const name = params.candidateName || "Candidate";
  const code = params.currentCode?.trim() || "";
  const questionContext = params.lastQuestion || `Coding problem in ${language}`;

  const prompt = `You are an attentive senior technical interviewer watching the candidate write code live in ${language}.
The candidate (${name}) has paused or been working on their code for ${params.idleDurationSeconds || 40} seconds.

CURRENT CODING CHALLENGE / QUESTION:
${questionContext}

CANDIDATE'S CURRENT IN-PROGRESS CODE BUFFER:
\`\`\`${language}
${code || "(Editor is currently empty or minimal starter code)"}
\`\`\`

YOUR TASK:
Provide ONE short, supportive hint or thought-starter (1-2 sentences maximum).
Rules:
- DO NOT write or reveal the full solution.
- Give a gentle nudge regarding algorithm structure, edge cases (empty input, null, negative numbers), or standard library data structures.
- Sound natural and encouraging, like a supportive real interviewer observing over their shoulder.
- Address them naturally (e.g. "Take a look at..." or "Think about how you might store...").

Respond ONLY with a JSON object:
{
  "hint_text": "Your spoken 1-2 sentence hint to the candidate",
  "suggested_focus": "Brief focus area (e.g., 'Array Edge Cases' or 'Hash Map lookup')"
}`;

  try {
    const aiResult = await callWithFallback({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      maxTokens: 300,
      useLightChain: true,
    });

    let cleaned = aiResult.content.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "");
      cleaned = cleaned.replace(/\s*```$/, "");
    }

    let parsed: any = {};
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) parsed = JSON.parse(match[0]);
    }

    const hintText =
      parsed.hint_text ||
      `I see you're working through the solution in ${language}. Consider starting with the base case or how you might track seen elements as you iterate.`;
    const suggestedFocus = parsed.suggested_focus || "Algorithm Structure";

    // Generate Shunya Labs AI Voice audio for the live hint
    const speechResult = await generateShunyaSpeech({
      text: hintText,
      voice: process.env.SHUNYA_TTS_VOICE || "Varun",
    });

    return {
      hintText,
      suggestedFocus,
      audioBase64: speechResult.audioBase64,
      generatedAt: Date.now(),
    };
  } catch (err: any) {
    console.warn("Live code hint generation fallback:", err.message);
    const fallbackHint = code.length < 50
      ? `Take your time to outline your approach first. Think about what data structure in ${language} gives you fast lookups.`
      : `You're on the right track with your implementation. Make sure to consider edge cases like empty inputs or boundary values.`;

    const speechResult = await generateShunyaSpeech({
      text: fallbackHint,
      voice: process.env.SHUNYA_TTS_VOICE || "Varun",
    }).catch(() => ({ audioBase64: null, voiceUsed: "Varun", provider: "browser-fallback" }));

    return {
      hintText: fallbackHint,
      suggestedFocus: "Edge Cases & Data Structures",
      audioBase64: speechResult.audioBase64,
      generatedAt: Date.now(),
    };
  }
}
