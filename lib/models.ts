// lib/models.ts

export interface ModelConfig {
  id: string;
  label: string;
  maxTokens?: number;
  temperature?: number;
}

export const MODEL_CHAIN: ModelConfig[] = [
  { id: "anthropic/claude-3.5-sonnet", label: "primary-claude-3.5" },
  { id: "anthropic/claude-sonnet-4.5", label: "primary-claude-4.5" },
  { id: "openai/gpt-4o", label: "fallback-gpt4o" },
  { id: "openai/gpt-4.1", label: "fallback-gpt4.1" },
  { id: "google/gemini-2.5-pro", label: "fallback-gemini-pro" },
  { id: "deepseek/deepseek-chat", label: "fallback-deepseek" },
  { id: "meta-llama/llama-3.3-70b-instruct", label: "fallback-llama-3.3" },
  // High quality free / zero-credit OpenRouter models
  { id: "google/gemini-2.0-flash-lite:free", label: "free-gemini-flash" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "free-llama-3.3" },
  { id: "deepseek/deepseek-r1:free", label: "free-deepseek-r1" },
  { id: "qwen/qwen-2.5-coder-32b-instruct:free", label: "free-qwen-coder" },
];

export const MODEL_CHAIN_LIGHT: ModelConfig[] = [
  { id: "google/gemini-2.0-flash-lite:free", label: "fast-gemini-free" },
  { id: "deepseek/deepseek-chat", label: "fast-deepseek" },
  { id: "openai/gpt-4o-mini", label: "fast-gpt4o-mini" },
  { id: "meta-llama/llama-3.3-70b-instruct:free", label: "fast-llama-free" },
];
