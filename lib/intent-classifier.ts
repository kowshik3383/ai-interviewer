// lib/intent-classifier.ts
import { callWithFallback } from "./openrouter";

export const INTENT_LABELS = [
  "REPEAT_REQUEST",
  "CLARIFY_REQUEST",
  "REPHRASE_REQUEST",
  "SIMPLIFY_REQUEST",
  "HINT_REQUEST",
  "SKIP_REQUEST",
  "CODE_REFERENCE",
  "THINKING_TIME",
  "CONFIRMATION_CHECK",
  "TECHNICAL_ISSUE",
  "META_QUESTION",
  "BREAK_REQUEST",
  "SMALL_TALK",
  "PARTIAL_ANSWER_CONTINUATION",
  "ACTUAL_ANSWER",
] as const;

export type IntentLabel = (typeof INTENT_LABELS)[number];

const RULES: { label: IntentLabel; patterns: RegExp[] }[] = [
  {
    label: "TECHNICAL_ISSUE",
    patterns: [
      /can you hear me/i,
      /mic (cut|not working|off)/i,
      /connection (dropped|lost|cut)/i,
      /i didn'?t hear (you|that)/i,
      /audio (issue|problem|broken|cut)/i,
      /sound (broke|cut|not working)/i,
      /call dropped/i,
    ],
  },
  {
    label: "BREAK_REQUEST",
    patterns: [
      /take a (short )?break/i,
      /give me (a |two |2 )?minute/i,
      /step away/i,
      /pause (the )?(interview|session)?/i,
      /i need a moment/i,
      /be right back/i,
    ],
  },
  {
    label: "THINKING_TIME",
    patterns: [
      /give me a (second|minute|moment|sec)/i,
      /let me think/i,
      /one (second|minute|moment|sec)/i,
      /hold on/i,
      /just a (second|minute|moment|sec)/i,
      /thinking/i,
      /let me (collect|gather) my thoughts/i,
    ],
  },
  {
    label: "META_QUESTION",
    patterns: [
      /how (much|long) (time|more) is (left|remaining)/i,
      /how many (more )?(questions|turns)/i,
      /what (level|difficulty)/i,
      /can i (switch|change) (the )?(language|topic)/i,
      /am i being (evaluated|graded|assessed)/i,
      /is this (a )?(junior|mid|senior|interview)/i,
      /how long will (this|the interview)/i,
    ],
  },
  {
    label: "REPEAT_REQUEST",
    patterns: [
      /repeat (the |that )?question/i,
      /say (that |it )?(again|once more|one more time)/i,
      /what was the question/i,
      /could you (please )?repeat/i,
      /didn'?t (hear|catch|get) (the )?question/i,
      /missed (the )?question/i,
      /ask (me )?(that|it) again/i,
      /once more please/i,
    ],
  },
  {
    label: "CLARIFY_REQUEST",
    patterns: [
      /what do you mean by/i,
      /can you (please )?clarif/i,
      /are you asking (about|me)/i,
      /can you explain (the question|what you mean|that)/i,
      /i'?m not sure what you (mean|are asking)/i,
      /i don'?t understand the question/i,
      /could you (re|ex)phrase/i,
    ],
  },
  {
    label: "REPHRASE_REQUEST",
    patterns: [
      /ask (me )?(that|it) (in )?a different way/i,
      /word (it|that) (in )?a different way/i,
      /can you (please )?rephrase/i,
      /say (it|that) differently/i,
      /i don'?t understand (it|that) (question|phrase)?/i,
      /can you word (it|that) differently/i,
    ],
  },
  {
    label: "SIMPLIFY_REQUEST",
    patterns: [
      /give me (a |an |something )?(more |much )?(simpler|easier)( one| question)?/i,
      /something (more |much )?simpler/i,
      /something easier/i,
      /can we (start|go) (more )?(basic|simpler|easier)/i,
      /do you have an easier (one|question)/i,
      /(this|it) is (too )?(hard|difficult|tough)/i,
      /a (little |bit )?(easier|simpler)( one| question)?/i,
    ],
  },
  {
    label: "HINT_REQUEST",
    patterns: [
      /can i (get|have|take) a hint/i,
      /i'?m stuck/i,
      /i am stuck/i,
      /not sure where to start/i,
      /any (pointers|hints|clues|tips)/i,
      /give me a (hint|nudge|clue)/i,
      /little (hint|help|nudge)/i,
      /need a (hint|pointer|clue)/i,
      /give me a start/i,
    ],
  },
  {
    label: "SKIP_REQUEST",
    patterns: [
      /can (we|i) skip (this|that|this one)/i,
      /let'?s skip/i,
      /next question please/i,
      /pass (on )?this/i,
      /i (don'?t|do not) know (this|that|the answer)/i,
      /(move on|go to) (the )?next (question|topic)/i,
      /i'?ll (skip|pass) (this|that)/i,
      /i want (to move|the next)/i,
    ],
  },
  {
    label: "CODE_REFERENCE",
    patterns: [
      /check (out )?(the |my )?(change|code|solution)/i,
      /look at my code/i,
      /did you (see|look at) (the |my )?(change|code|solution)/i,
      /i (just |have )?(fixed|updated|changed|modified) (the |my )?code/i,
      /review (the |my )?(change|code|solution)/i,
      /have a look at (the |my )?code/i,
      /my code is (wrong|failing|broken|not working)/i,
      /the (code|change) i (made|did|wrote)/i,
    ],
  },
  {
    label: "CONFIRMATION_CHECK",
    patterns: [
      /is that (right|correct|ok)/i,
      /does that (make sense|sound right)/i,
      /am i on the right track/i,
      /on the right path/i,
      /am i correct/i,
      /is my (approach|understanding|logic) (right|correct|ok)/i,
      /did i get (it|that) right/i,
    ],
  },
  {
    label: "PARTIAL_ANSWER_CONTINUATION",
    patterns: [
      /wait, let me (add|reconsider|continue|expand)/i,
      /actually, let me (reconsider|add|expand)/i,
      /one (more|other) thing/i,
      /let me (add|expand|continue|elaborate) (on )?that/i,
      /hold on, (i|let me).*(more|add)/i,
      /i want to (add|expand|continue)/i,
      /let me finish/i,
    ],
  },
  {
    label: "SMALL_TALK",
    patterns: [
      /^(hi|hello|hey|yo)\b/i,
      /how (are|r) you/i,
      /good (morning|afternoon|evening)/i,
      /(nice|good|great) to (meet|talk to) you/i,
      /thanks? (a lot|very much|so much)?/i,
      /thank you/i,
      /have a (good|great) day/i,
      /^what'?s up$/i,
    ],
  },
];

/**
 * Classifies a candidate message into one of the 15 intent labels.
 * Uses a cheap rule-based fast path first (regex), then falls back to a
 * lightweight LLM classification call for anything that doesn't match.
 *
 * The bias is toward ACTUAL_ANSWER on ambiguity: the failure mode we must
 * avoid is routing a real (even weak) attempt at answering into a procedural
 * bucket so it never gets scored.
 */
export async function classifyIntent(
  candidateMessage: string,
  lastAiQuestion?: string
): Promise<IntentLabel> {
  const message = (candidateMessage || "").trim();
  const lower = message.toLowerCase();

  // 1) Empty / near-empty transcripts → treat as needing a repeat/clarification.
  if (!lower || lower.length < 3) {
    return "REPEAT_REQUEST";
  }

  // 2) Rule-based fast path (option B from the spec).
  for (const rule of RULES) {
    if (rule.patterns.some((re) => re.test(message))) {
      return rule.label;
    }
  }

  // 3) LLM classification fallback (option A).
  try {
    const { content } = await callWithFallback({
      messages: [
        {
          role: "system",
          content: `Classify the candidate's message into exactly one label: ${INTENT_LABELS.join(", ")}.
Context: the interviewer just asked: "${lastAiQuestion || "(start of interview)"}".
Respond with ONLY the label, nothing else. If genuinely ambiguous between
a procedural request and a real (even if weak/partial) attempt at answering,
prefer ACTUAL_ANSWER or PARTIAL_ANSWER_CONTINUATION — do not over-trigger
procedural intents on a candidate who is actually trying to answer.`,
        },
        { role: "user", content: message },
      ],
      temperature: 0,
      maxTokens: 20,
      useLightChain: true,
    });

    const label = content.trim().toUpperCase();
    if ((INTENT_LABELS as readonly string[]).includes(label)) {
      return label as IntentLabel;
    }
  } catch (err) {
    console.warn("Intent classifier LLM call failed; defaulting to ACTUAL_ANSWER:", err);
  }

  return "ACTUAL_ANSWER";
}
