// lib/models.ts

export interface ModelConfig {
  id: string;
  label: string;
  maxTokens?: number;
  temperature?: number;
}

export const MODEL_CHAIN: ModelConfig[] = [
  { id: "anthropic/claude-3.5-sonnet", label: "primary-claude-3.5" },
  { id: "google/gemini-3.7-flash", label: "primary-gemini-3.7" },
  { id: "openai/gpt-4o", label: "fallback-gpt4o" },
  { id: "google/gemini-3.5-flash", label: "fallback-gemini-3.5-flash" },
  { id: "deepseek/deepseek-chat", label: "fallback-deepseek" },
  { id: "openai/gpt-4o-mini", label: "fallback-gpt4o-mini" },
  { id: "google/gemini-3.5-flash-lite", label: "fallback-gemini-3.5-lite" },
  // High quality free / zero-credit OpenRouter models
  { id: "google/gemma-4-31b-it:free", label: "free-gemma-31b" },
  { id: "google/gemma-4-26b-a4b-it:free", label: "free-gemma-26b" },
  { id: "nvidia/nemotron-3-nano-30b-a3b:free", label: "free-nemotron-nano" },
  { id: "openai/gpt-oss-20b:free", label: "free-gpt-oss" },
  { id: "liquid/lfm-2.5-2.6b:free", label: "free-liquid-lfm" },
];

export const MODEL_CHAIN_LIGHT: ModelConfig[] = [
  { id: "google/gemini-3.7-flash", label: "fast-gemini-3.7" },
  { id: "google/gemini-3.5-flash-lite", label: "fast-gemini-lite" },
  { id: "openai/gpt-4o-mini", label: "fast-gpt4o-mini" },
  { id: "google/gemma-4-31b-it:free", label: "fast-gemma-free" },
  { id: "nvidia/nemotron-3-nano-30b-a3b:free", label: "fast-nemotron-free" },
];
