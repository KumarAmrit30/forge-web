import { GroqProvider } from "@/lib/coach/providers/groq-provider";
import {
  ProviderConfigurationError,
  type LLMProvider,
  type LLMProviderName,
} from "@/lib/coach/providers/base-provider";
import { VertexProvider } from "@/lib/coach/providers/vertex-provider";

const SUPPORTED_PROVIDERS: LLMProviderName[] = ["groq", "vertex"];

function readProviderName(): LLMProviderName {
  const value = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (!value) {
    return "groq";
  }
  if (value === "groq" || value === "vertex") {
    return value;
  }
  throw new ProviderConfigurationError(
    `Unsupported LLM_PROVIDER "${value}". Supported values: ${SUPPORTED_PROVIDERS.join(", ")}.`
  );
}

/** Instantiate the configured LLM provider. Never silently falls back. */
export function createLLMProvider(): LLMProvider {
  const name = readProviderName();
  switch (name) {
    case "groq":
      return new GroqProvider();
    case "vertex":
      return new VertexProvider();
    default:
      throw new ProviderConfigurationError(
        `Unsupported LLM_PROVIDER "${name}". Supported values: ${SUPPORTED_PROVIDERS.join(", ")}.`
      );
  }
}

export { SUPPORTED_PROVIDERS };
