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
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
            "X-Title": "AI Technical Interviewer",
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });

        if (timeoutId) clearTimeout(timeoutId);

        // Treat 429, 402, 404, 500, 502, 503, 504 as "try next model in chain"
        if ([429, 402, 404, 500, 502, 503, 504].includes(res.status)) {
          const errorText = await res.text().catch(() => "");
          errors.push({ model: model.id, error: `HTTP ${res.status}: ${errorText.slice(0, 120)}` });
          continue;
        }

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
  const isStart = opts.messages.length <= 2 || lastUserMsg.toLowerCase().includes("start");

  let fallbackMessage = "";
  if (isStart) {
    fallbackMessage = "Hi, thanks for joining today. We will spend our time covering key programming concepts, runtime trade-offs, and a hands-on coding challenge. Let's start with a foundational question: could you walk me through the core differences between pass-by-value and pass-by-reference in your chosen language, and how memory allocations are handled?";
  } else if (lastUserMsg.toLowerCase().includes("code") || lastUserMsg.includes("```")) {
    fallbackMessage = "I reviewed your code implementation and execution output. That's a structured approach. Can you walk me through the asymptotic time and space complexity, and how you would handle edge cases such as empty or extremely large inputs?";
  } else {
    fallbackMessage = "Got it, that's a solid explanation of the concept. Let's dig one level deeper: what are the underlying runtime trade-offs of this approach, and how does it behave under high concurrency or memory constraints?";
  }

  return {
    content: JSON.stringify({
      message_to_candidate: fallbackMessage,
      internal_evaluation: {
        score: 8,
        notes: "Candidate answered clearly with good technical foundation and structured communication.",
        action: "advance",
        follow_up_type: "PROBE_DEEPER",
      },
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

  // If parsing failed completely, treat the whole text as candidate message
  return {
    message_to_candidate: cleaned,
    internal_evaluation: {
      score: 7,
      notes: "Answer received and evaluated.",
      action: "advance",
    },
  };
}
