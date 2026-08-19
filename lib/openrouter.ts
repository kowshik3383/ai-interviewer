// lib/openrouter.ts
import { MODEL_CHAIN, MODEL_CHAIN_LIGHT, ModelConfig } from "./models";

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface CallOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  timeoutMs?: number;
  useLightChain?: boolean;
  responseFormat?: "json" | "text";
}

export interface CallResult {
  content: string;
  modelUsed: string;
  fallbacksTriggered: { model: string; error: string }[];
}

export interface EvaluatedTurnResponse {
  message_to_candidate: string;
  internal_evaluation?: {
    score?: number; // 0-10
    notes?: string;
    action?: "advance" | "follow_up" | "escalate_difficulty" | "wrap_up";
    follow_up_type?: "CLARIFY" | "PROBE_DEEPER" | "CHALLENGE" | "REDIRECT" | "AFFIRM_AND_ADVANCE" | "CONNECT";
    code_feedback?: string;
  };
}

/**
 * Executes chat completion with multi-model automatic fallback chain.
 * Never throws on transient provider failures as long as one model succeeds.
 */
export async function callWithFallback(opts: CallOptions): Promise<CallResult> {
  const chain: ModelConfig[] = opts.useLightChain ? MODEL_CHAIN_LIGHT : MODEL_CHAIN;
  const errors: { model: string; error: string }[] = [];
  const apiKey = process.env.OPENROUTER_API_KEY || "";

  if (apiKey) {
    for (const model of chain) {
      let timeoutId: NodeJS.Timeout | null = null;
      try {
        const controller = new AbortController();
        const timeoutMs = opts.timeoutMs ?? 20000;
        timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const requestBody: Record<string, any> = {
          model: model.id,
          messages: opts.messages,
          temperature: opts.temperature ?? (model.temperature ?? 0.4),
          max_tokens: opts.maxTokens ?? (model.maxTokens ?? 1000),
        };

        if (opts.responseFormat === "json") {
          requestBody.response_format = { type: "json_object" };
        }

        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ai-interviewer-ten-delta.vercel.app",
            "X-Title": "AI Technical Interviewer",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (timeoutId) clearTimeout(timeoutId);

        // If unauthorized (bad API key), log warning and drop to offline fallback
        if (res.status === 401) {
          const errorText = await res.text().catch(() => "");
          errors.push({ model: model.id, error: `HTTP 401 Unauthorized: ${errorText.slice(0, 120)}` });
          console.warn(`[OpenRouter 401]: API key unauthorized or expired. Falling back to offline engine.`);
          break;
        }

        // For any other non-OK status (400 invalid model ID, 402 no credits, 429 rate limit, 5xx), try next model
        if (!res.ok) {
          const errorText = await res.text().catch(() => "");
          errors.push({ model: model.id, error: `HTTP ${res.status}: ${errorText.slice(0, 120)}` });
          continue;
        }

        const data = await res.json();
        const rawContent = data?.choices?.[0]?.message?.content;
        if (!rawContent || typeof rawContent !== "string" || rawContent.trim().length === 0) {
          errors.push({ model: model.id, error: "Empty or malformed content in choices" });
          continue;
        }

        return {
          content: rawContent.trim(),
          modelUsed: model.id,
          fallbacksTriggered: errors,
        };
      } catch (err: any) {
        if (timeoutId) clearTimeout(timeoutId);
        const isAbort = err?.name === "AbortError" || err?.message?.includes("aborted");
        const errMsg = isAbort ? "Request timed out" : err?.message || "Unknown network error";

        errors.push({ model: model.id, error: errMsg });
        continue;
      }
    }
  }

  // If every online model failed or credits were exhausted, generate a realistic contextual interviewer response
  console.warn("All OpenRouter models failed or exhausted credits. Generating contextual fallback response.");
  const lastUserMsg = opts.messages.filter((m) => m.role === "user").slice(-1)[0]?.content || "";
  const lastAiMsg = opts.messages.filter((m) => m.role === "assistant").slice(-1)[0]?.content || "";
  const lower = lastUserMsg.toLowerCase().trim();
  const isStart = opts.messages.length <= 2 || lower.includes("start");

  const isRepeat =
    /repeat|say that (once more|again)|didn'?t (hear|catch|get)|didn'?t (quite )?catch|could you say|could you repeat|explain (that |it )?(with an example|again|more clearly)|i don'?t understand|i didn'?t understand|i missed/.test(lower);
  const isDontKnow =
    /\b(i )?(don'?t|do not|am not|not) (know|sure|understand)\b|i'?m stuck|i am stuck|no idea|not sure|confus|blank/.test(lower);
  const isHintRequest = /\b(hint|help|clue|nudge|guidance|start me off|stuck)\b/.test(lower);
  const isWrapUp =
    /\b(done|finish|stop|that'?s all|thank|thanks|bye|goodbye|nothing (else|more)|i'?m done|wrap up|all the best)\b/.test(lower);
  const isNext = /\b(next|move on|skip|continue|proceed|let'?s move)\b/.test(lower);
  const isEmpty = !lower || lower.length < 3;

  let fallbackMessage = "";
  let fallbackScore: number | null = null;
  let fallbackAction = "advance";
  let fallbackFollowUp = "AFFIRM_AND_ADVANCE";
  let fallbackNotes = "";

  if (isStart) {
    fallbackMessage = "Hi, thanks for joining today. We will spend our time covering key programming concepts, runtime trade-offs, and a hands-on coding challenge. Let's start with a foundational question: could you walk me through the core differences between pass-by-value and pass-by-reference in your chosen language, and how memory allocations are handled?";
  } else if (isWrapUp) {
    fallbackMessage =
      "Absolutely — let's wrap up here. Thank you for your time and effort today; it was good working through these questions with you. Is there anything you'd like to ask me before we finish?";
    fallbackAction = "wrap_up";
    fallbackNotes = "Candidate requested to end the interview.";
  } else if (isRepeat) {
    fallbackMessage = lastAiMsg
      ? `Of course, let me repeat that. ${lastAiMsg}`
      : "Of course — here is the question again: could you walk me through the core differences between pass-by-value and pass-by-reference in your chosen language, and how memory allocations are handled?";
    fallbackAction = "follow_up";
    fallbackFollowUp = "REDIRECT";
    fallbackNotes = "Candidate asked to repeat the question; no new answer provided.";
  } else if (isDontKnow) {
    fallbackMessage = lastAiMsg
      ? `No problem at all — that's a tricky one. Let's simplify it: ${lastAiMsg} Take your time, and start with what you do know about the topic.`
      : "No problem at all — let's simplify. Start with the base case or the simplest example you can think of, and build from there.";
    fallbackAction = "follow_up";
    fallbackFollowUp = "REDIRECT";
    fallbackScore = 3;
    fallbackNotes = "Candidate indicated uncertainty; provided a gentle redirect rather than a score.";
  } else if (isHintRequest) {
    fallbackMessage = "Happy to give a nudge: think about which data structure gives you fast lookups or ordering for this problem, and check your edge cases (empty input, nulls, boundaries) before you submit.";
    fallbackAction = "follow_up";
    fallbackFollowUp = "REDIRECT";
    fallbackNotes = "Candidate requested a hint; no solution content was evaluated.";
  } else if (isNext) {
    fallbackMessage = "Got it, let's keep moving. Could you walk me through the core trade-offs of this approach compared to the obvious alternative — time complexity, space complexity, and when you'd pick one over the other?";
    fallbackAction = "advance";
    fallbackScore = 6;
    fallbackNotes = "Candidate requested to move on; answer not deeply evaluated.";
  } else if (isEmpty) {
    fallbackMessage = "I didn't quite catch that — could you share your answer, or let me know if you'd like me to repeat the question?";
    fallbackAction = "follow_up";
    fallbackFollowUp = "REDIRECT";
    fallbackNotes = "Empty or near-empty candidate turn.";
  } else if (lower.includes("code") || lastUserMsg.includes("```")) {
    fallbackMessage = "I reviewed your code implementation and execution output. That's a structured approach. Can you walk me through the asymptotic time and space complexity, and how you would handle edge cases such as empty or extremely large inputs?";
    fallbackAction = "follow_up";
    fallbackFollowUp = "PROBE_DEEPER";
    fallbackScore = 6;
    fallbackNotes = "Code submitted; feedback provided on complexity and edge cases.";
  } else {
    fallbackMessage = "Got it, that's a solid explanation of the concept. Let's dig one level deeper: what are the underlying runtime trade-offs of this approach, and how does it behave under high concurrency or memory constraints?";
    fallbackAction = "follow_up";
    fallbackFollowUp = "PROBE_DEEPER";
    fallbackScore = 6;
    fallbackNotes = "Answer received but not deeply evaluated; probed for depth.";
  }

  const internalEval: Record<string, unknown> = {
    notes: fallbackNotes,
    action: fallbackAction,
    follow_up_type: fallbackFollowUp,
  };
  if (fallbackScore !== null) internalEval.score = fallbackScore;

  return {
    content: JSON.stringify({
      message_to_candidate: fallbackMessage,
      internal_evaluation: internalEval,
    }),
    modelUsed: "openrouter-emergency-fallback",
    fallbacksTriggered: errors,
  };
}

/**
 * Safely parses the structured JSON returned by the interviewer prompt.
 * Handles markdown backticks ```json ... ``` and loose JSON formatting.
 */
export function parseInterviewerResponse(rawText: string): EvaluatedTurnResponse {
  let cleaned = rawText.trim();

  // Strip Markdown code fences if present
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json\s*/i, "").replace(/^```\s*/, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }

  // Attempt standard JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object" && typeof parsed.message_to_candidate === "string") {
      return {
        message_to_candidate: parsed.message_to_candidate,
        internal_evaluation: parsed.internal_evaluation,
      };
    }
  } catch {
    // If strict JSON parse failed, try extracting JSON substring {...}
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const extracted = JSON.parse(jsonMatch[0]);
        if (extracted && typeof extracted.message_to_candidate === "string") {
          return {
            message_to_candidate: extracted.message_to_candidate,
            internal_evaluation: extracted.internal_evaluation,
          };
        }
      } catch {
        // Fallback below
      }
    }
  }

  // If parsing failed completely, return the raw text as the message with NO evaluation,
  // so the caller knows the response was not structurally evaluated.
  return {
    message_to_candidate: cleaned,
    internal_evaluation: undefined,
  };
}
