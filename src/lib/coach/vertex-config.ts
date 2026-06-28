export type VertexEnvironment = {
  project: string;
  location: string;
  model: string;
  credentialsPath: string | null;
};

export type VertexConfigValidation =
  | { valid: true; config: VertexEnvironment }
  | { valid: false; error: string; code: "configuration" };

/** Validate Vertex AI environment configuration before requests. */
export function validateVertexEnvironment(): VertexConfigValidation {
  const project = process.env.GOOGLE_CLOUD_PROJECT?.trim();
  const location = process.env.GOOGLE_CLOUD_LOCATION?.trim();
  const model = process.env.VERTEX_MODEL?.trim() ?? "gemini-2.0-flash";
  const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim() ?? null;

  if (!project) {
    return {
      valid: false,
      code: "configuration",
      error:
        "Vertex AI is not configured. Set GOOGLE_CLOUD_PROJECT in your environment.",
    };
  }

  if (!location) {
    return {
      valid: false,
      code: "configuration",
      error:
        "Vertex AI is not configured. Set GOOGLE_CLOUD_LOCATION in your environment.",
    };
  }

  return {
    valid: true,
    config: {
      project,
      location,
      model,
      credentialsPath,
    },
  };
}
