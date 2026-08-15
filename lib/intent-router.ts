// lib/intent-router.ts
// Converts a classified intent into a concrete interviewer behavior.
// Only ACTUAL_ANSWER (and PARTIAL_ANSWER_CONTINUATION routed onward) falls
// through to the full evaluation/scoring pipeline in the turn route.
import { callWithFallback } from "./openrouter";
import type { IntentLabel } from "./intent-classifier";
import type { FSMAction } from "./fsm";

export interface IntentContext {
  candidateName: string;
  language: string;
  difficulty: string;
  currentState: string;
  lastAiQuestion?: string;
  lastAiMessage?: string;
  questionCount?: number;
  codeSnapshot?: string;
  turnsCount?: number;
  createdAt?: Date;
}

export interface IntentOutcome {
  handled: boolean;
  message: string;
  action: FSMAction;
  score: number | null;
  followUpType: string;
  notes: string;
  modelUsed?: string;
}

function baseOutcome(overrides: Partial<IntentOutcome> & { message: string }): IntentOutcome {
  return {
    handled: true,
    action: "follow_up",
    score: null,
    followUpType: "REDIRECT",
    notes: "Procedural intent; candidate answer not scored.",
    ...overrides,
  };
}

async function regenerateQuestion(ctx: IntentContext, mode: "simplify" | "rephrase"): Promise<IntentOutcome> {
  const lastQ = ctx.lastAiQuestion || `a ${ctx.difficulty}-level ${ctx.language} technical question`;
  const instruction =
    mode === "simplify"
      ? `The candidate found the current question too hard and asked for something simpler on the SAME topic. Rewrite it at an easier level (a clear, friendly, well-scoped version). Keep the same topic, do not change the language. Do not solve it. Output ONLY the reworded question — no JSON, no preamble.`
      : `The candidate did not understand the current question and asked to have it reworded. Rephrase it clearly at the SAME difficulty and SAME topic. Do not solve it. Output ONLY the reworded question — no JSON, no preamble.`;

  try {
    const { content, modelUsed } = await callWithFallback({
      messages: [
        { role: "system", content: `You are a senior technical interviewer for ${ctx.language}. ${instruction}\n\nCurrent question:\n${lastQ}` },
      ],
      temperature: 0.4,
      maxTokens: 300,
      useLightChain: true,
    });

    return baseOutcome({
      message: content.trim(),
      action: "follow_up",
      followUpType: "REDIRECT",
      notes:
        mode === "simplify"
          ? "Candidate requested a simpler question; regenerated same-topic question at lower difficulty. No score."
          : "Candidate requested a rephrased question; reworded at same difficulty. No score.",
      modelUsed,
    });
  } catch (err) {
    console.warn(`[Intent Router] ${mode} regeneration failed:`, err);
    return baseOutcome({
      message:
        mode === "simplify"
          ? `No problem — let's take it down a notch. Think about the very basics first: what are the core building blocks involved in ${lastQ.replace(/\s+/g, " ").slice(0, 90)}… and start there.`
          : `Of course — let me reword that. ${lastQ}`,
      action: "follow_up",
      notes: `Candidate requested ${mode}; fallback rewording used. No score.`,
    });
  }
}

function metaAnswer(ctx: IntentContext): IntentOutcome {
  const q = ctx.lastAiQuestion?.toLowerCase() || "";
  const minutesElapsed = ctx.createdAt
    ? Math.max(0, Math.round((Date.now() - ctx.createdAt.getTime()) / 60000))
    : 0;

  let message = "";
  let notes = "";

  if (q.includes("time") || /how (much|long) (time|more)/.test(q) || ctx.turnsCount === 0) {
    message = `We're about ${minutesElapsed} minute${minutesElapsed === 1 ? "" : "s"} in so far. We have roughly 25-30 minutes of content planned — we'll go at the pace that suits you.`;
    notes = "Candidate asked about time remaining; answered from session state.";
  } else if (q.includes("how many") || /how many (more )?questions/.test(q)) {
    message = `We're on question ${Math.max(1, ctx.questionCount || 1)} of the core set, then a coding challenge to wrap up. You're making good progress.`;
    notes = "Candidate asked about question count; answered from session state.";
  } else if (q.includes("level") || q.includes("difficulty")) {
    message = `This is a ${ctx.difficulty}-level ${ctx.language} interview. I adjust the difficulty up or down as we go based on how you're doing.`;
    notes = "Candidate asked about difficulty level; answered from session state.";
  } else if (q.includes("language")) {
    message = `We're currently interviewing in ${ctx.language}. I'd prefer to stay in this stack for today, but we can revisit after the main sections.`;
    notes = "Candidate asked about switching languages; answered from session state.";
  } else {
    message = `We're about ${minutesElapsed} minute${minutesElapsed === 1 ? "" : "s"} in, on question ${Math.max(1, ctx.questionCount || 1)} of the core set at ${ctx.difficulty} level. Anything specific you'd like to know?`;
    notes = "Candidate asked a meta question; answered from session state.";
  }

  return baseOutcome({ message, followUpType: "AFFIRM_AND_ADVANCE", notes });
}

async function smallTalkReply(ctx: IntentContext): Promise<IntentOutcome> {
  try {
    const { content } = await callWithFallback({
      messages: [
        {
          role: "system",
          content: `You are a senior technical interviewer mid-interview with ${ctx.candidateName} for ${ctx.language}. The candidate made small talk. Reply briefly and naturally in kind (ONE sentence max), then add a single line gently steering back to the interview. Do NOT be robotic or cold. Output ONLY the message.`,
        },
      ],
      temperature: 0.6,
      maxTokens: 120,
      useLightChain: true,
    });
    return baseOutcome({
      message: content.trim(),
      followUpType: "AFFIRM_AND_ADVANCE",
      notes: "Small talk; replied naturally and redirected back to the interview.",
    });
  } catch {
    return baseOutcome({
      message: `Fair enough! Anyway — back to it: ${ctx.lastAiQuestion ? "ready for the next one?" : "shall we continue?"}`,
      notes: "Small talk; brief reply and redirect.",
    });
  }
}

async function codeReferenceReply(ctx: IntentContext): Promise<IntentOutcome> {
  const code = ctx.codeSnapshot?.trim();
  if (!code) {
    return baseOutcome({
      message: `I'd love to look at your code — go ahead and run or submit it from the editor and I'll review exactly what you've got.`,
      followUpType: "CLARIFY",
      notes: "Candidate asked to check their code but no snapshot was submitted yet.",
    });
  }

  try {
    const { content, modelUsed } = await callWithFallback({
      messages: [
        {
          role: "system",
          content: `You are a senior technical interviewer for ${ctx.language} currently reviewing a candidate's submitted code. Last question asked:\n${ctx.lastAiQuestion || "(coding challenge)"}\n\nCandidate code:\n\`\`\`${ctx.language}\n${code}\n\`\`\`\n\nGive concrete, honest feedback on their current implementation: what looks right, any bugs/edge cases, and time/space complexity. Do NOT rewrite the whole solution. Keep it 2-4 sentences. Output ONLY the message to the candidate.`,
        },
      ],
      temperature: 0.4,
      maxTokens: 400,
      useLightChain: true,
    });
    return baseOutcome({
      message: content.trim(),
      action: "follow_up",
      followUpType: "PROBE_DEEPER",
      notes: "Candidate asked about their code; reviewed the submitted code snapshot. Not rubric-scored as a verbal answer.",
      modelUsed,
    });
  } catch {
    return baseOutcome({
      message: `I've taken a look at your code. Structure looks reasonable — double-check your edge cases (empty input, boundary values) and the complexity of the core loop before we move on.`,
      followUpType: "PROBE_DEEPER",
      notes: "Code review requested; fallback feedback given.",
    });
  }
}

export async function routeIntent(
  intent: IntentLabel,
  ctx: IntentContext
): Promise<IntentOutcome> {
  switch (intent) {
    case "REPEAT_REQUEST":
      return baseOutcome({
        message: ctx.lastAiMessage
          ? ctx.lastAiMessage
          : "Of course — here is the question again: " + (ctx.lastAiQuestion || "could you walk me through the core concepts here?"),
        followUpType: "REDIRECT",
        notes: "Candidate asked to repeat the question; last interviewer message resent verbatim. No LLM call, no score.",
      });

    case "CLARIFY_REQUEST":
      return baseOutcome({
        message: `Happy to clarify. Which part would you like me to expand on — the ${ctx.lastAiQuestion ? "question itself" : "topic"}? Feel free to tell me what's unclear and I'll zero in on it.`,
        followUpType: "CLARIFY",
        notes: "Candidate requested clarification; asked which part to expand. No score.",
      });

    case "REPHRASE_REQUEST":
      return regenerateQuestion(ctx, "rephrase");

    case "SIMPLIFY_REQUEST":
      return regenerateQuestion(ctx, "simplify");

    case "HINT_REQUEST": {
      return baseOutcome({
        message: `Sure — here's a nudge without giving it away: think about which data structure gives you the right trade-off here (lookup speed vs. ordering), and make sure to handle the empty/edge inputs first.`,
        followUpType: "REDIRECT",
        notes: "Candidate requested a hint; gentle nudge given. Not scored.",
      });
    }

    case "SKIP_REQUEST":
      return baseOutcome({
        message: `No problem at all — let's move on to the next topic.`,
        action: "advance",
        followUpType: "AFFIRM_AND_ADVANCE",
        notes: "Candidate asked to skip the question; logged as skipped (no score, not penalized), advancing.",
      });

    case "CODE_REFERENCE":
      return codeReferenceReply(ctx);

    case "THINKING_TIME":
      return baseOutcome({
        message: `Take your time — I'll wait.`,
        followUpType: "REDIRECT",
        notes: "Candidate asked for a moment to think; acknowledged, no new question.",
      });

    case "CONFIRMATION_CHECK":
      return baseOutcome({
        message: `You're on the right track — keep going.`,
        followUpType: "AFFIRM_AND_ADVANCE",
        notes: "Candidate asked if they were on track; light steer without scoring mid-answer.",
      });

    case "TECHNICAL_ISSUE":
      return baseOutcome({
        message: `No problem, I've got you — go ahead when you're ready. If your audio is acting up, feel free to type your answer instead.`,
        followUpType: "REDIRECT",
        notes: "Candidate reported a technical issue; reassured, no penalty, no state change.",
      });

    case "META_QUESTION":
      return metaAnswer(ctx);

    case "BREAK_REQUEST":
      return baseOutcome({
        message: `Sure, take a short break. Just type whenever you're back and we'll continue right where we left off.`,
        followUpType: "REDIRECT",
        notes: "Candidate asked for a break; acknowledged, session left in place to resume.",
      });

    case "SMALL_TALK":
      return smallTalkReply(ctx);

    case "PARTIAL_ANSWER_CONTINUATION":
      return baseOutcome({
        message: `Got it — go ahead, I'm listening.`,
        followUpType: "AFFIRM_AND_ADVANCE",
        notes: "Candidate indicated a continuation of a previous answer; acknowledged, awaiting the continuation before scoring.",
      });

    case "ACTUAL_ANSWER":
    default:
      return { handled: false, message: "", action: "advance", score: null, followUpType: "AFFIRM_AND_ADVANCE", notes: "" };
  }
}
