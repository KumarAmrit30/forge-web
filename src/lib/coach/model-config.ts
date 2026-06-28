/** Provider-independent LLM generation configuration. */
export const LLM_MODEL_CONFIG = {
  model: process.env.LLM_MODEL ?? "llama-3.3-70b-versatile",
  temperature: 0.3,
  maxOutputTokens: 4096,
  topP: 0.9,
  streaming: true,
  jsonMode: true,
} as const;

export type LLMModelConfig = typeof LLM_MODEL_CONFIG;

/** @deprecated Use LLM_MODEL_CONFIG */
export const VERTEX_MODEL_CONFIG = LLM_MODEL_CONFIG;

/** @deprecated Use LLMModelConfig */
export type VertexModelConfig = LLMModelConfig;
