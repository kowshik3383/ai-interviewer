// lib/fsm.ts

export type InterviewState =
  | "INTRO"
  | "WARMUP_QUESTION"
  | "CORE_QUESTIONS"
  | "CODING_CHALLENGE"
  | "FOLLOW_UPS"
  | "WRAP_UP"
  | "REPORT_GENERATED";

export type FSMAction = "advance" | "follow_up" | "escalate_difficulty" | "wrap_up";

export interface SessionContext {
  state: InterviewState;
  language: string;
  difficulty: "junior" | "mid" | "senior";
  coreQuestionCount: number;
  maxCoreQuestions: number;
  followUpCount: number;
  maxFollowUpsPerQuestion: number;
  codingChallengeCount: number;
  maxCodingChallenges: number;
  totalTurns: number;
  runningScores: number[];
  averageScore: number;
}

export function createInitialSessionContext(
  language: string,
  difficulty: "junior" | "mid" | "senior" = "mid"
): SessionContext {
  const maxCore = difficulty === "senior" ? 5 : difficulty === "mid" ? 4 : 3;
  const maxCoding = difficulty === "senior" ? 2 : 1;

  return {
    state: "INTRO",
    language,
    difficulty,
    coreQuestionCount: 0,
    maxCoreQuestions: maxCore,
    followUpCount: 0,
    maxFollowUpsPerQuestion: 2,
    codingChallengeCount: 0,
    maxCodingChallenges: maxCoding,
    totalTurns: 0,
    runningScores: [],
    averageScore: 0,
  };
}

export interface TransitionResult {
  nextState: InterviewState;
  updatedContext: SessionContext;
  stateChanged: boolean;
  actionExecuted: FSMAction;
}

/**
 * Deterministic State Machine Transition Function
 */
export function getNextSessionState(
  current: SessionContext,
  suggestedAction: FSMAction = "advance",
  turnScore?: number
): TransitionResult {
  const ctx: SessionContext = {
    ...current,
    totalTurns: current.totalTurns + 1,
    runningScores:
      turnScore !== undefined && turnScore >= 0
        ? [...current.runningScores, turnScore]
        : current.runningScores,
  };

  if (ctx.runningScores.length > 0) {
    const sum = ctx.runningScores.reduce((a, b) => a + b, 0);
    ctx.averageScore = parseFloat((sum / ctx.runningScores.length).toFixed(1));
  }

  let finalAction: FSMAction = suggestedAction;

  // Handle explicit wrap_up action
  if (suggestedAction === "wrap_up") {
    ctx.state = "WRAP_UP";
    return {
      nextState: "WRAP_UP",
      updatedContext: ctx,
      stateChanged: current.state !== "WRAP_UP",
      actionExecuted: "wrap_up",
    };
  }

  // Handle follow_up request
  if (suggestedAction === "follow_up") {
    if (ctx.followUpCount < ctx.maxFollowUpsPerQuestion) {
      ctx.followUpCount += 1;
      return {
        nextState: ctx.state,
        updatedContext: ctx,
        stateChanged: false,
        actionExecuted: "follow_up",
      };
    } else {
      // Force advance if follow-up limit exceeded
      finalAction = "advance";
      ctx.followUpCount = 0;
    }
  }

  // State transitions based on current state
  switch (ctx.state) {
    case "INTRO": {
      ctx.state = "WARMUP_QUESTION";
      ctx.followUpCount = 0;
      break;
    }

    case "WARMUP_QUESTION": {
      ctx.state = "CORE_QUESTIONS";
      ctx.coreQuestionCount = 1;
      ctx.followUpCount = 0;
      break;
    }

    case "CORE_QUESTIONS": {
      ctx.followUpCount = 0;
      if (ctx.coreQuestionCount < ctx.maxCoreQuestions) {
        ctx.coreQuestionCount += 1;
      } else {
        // Transition to Coding Challenge
        ctx.state = "CODING_CHALLENGE";
        ctx.codingChallengeCount = 1;
      }
      break;
    }

    case "CODING_CHALLENGE": {
      ctx.followUpCount = 0;
      if (ctx.codingChallengeCount < ctx.maxCodingChallenges) {
        ctx.codingChallengeCount += 1;
      } else {
        // If candidate had low scores on any core question, provide 1 dynamic follow-up, else wrap up
        if (ctx.averageScore < 7.0 && ctx.runningScores.some((s) => s <= 5)) {
          ctx.state = "FOLLOW_UPS";
        } else {
          ctx.state = "WRAP_UP";
        }
      }
      break;
    }

    case "FOLLOW_UPS": {
      ctx.state = "WRAP_UP";
      ctx.followUpCount = 0;
      break;
    }

    case "WRAP_UP": {
      ctx.state = "REPORT_GENERATED";
      break;
    }

    case "REPORT_GENERATED":
    default: {
      ctx.state = "REPORT_GENERATED";
      break;
    }
  }

  return {
    nextState: ctx.state,
    updatedContext: ctx,
    stateChanged: current.state !== ctx.state,
    actionExecuted: finalAction,
  };
}
