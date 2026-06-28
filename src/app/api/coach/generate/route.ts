import { NextResponse } from "next/server";
import { resolveCoachGenerateRequest } from "@/lib/coach/generate-request";
import {
  executeCoachGeneration,
  streamCoachGeneration,
} from "@/lib/coach/llm-service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: { code: "invalid_json", message: "Invalid request body." } },
      { status: 400 }
    );
  }

  const resolved = resolveCoachGenerateRequest(body);
  if (!resolved.ok) {
    return NextResponse.json(
      { error: { code: resolved.code, message: resolved.message } },
      { status: 400 }
    );
  }

  const { prompt, stream: useStream } = resolved;

  if (useStream) {
    const encoder = new TextEncoder();
    const responseStream = new ReadableStream({
      async start(controller) {
        for await (const event of streamCoachGeneration(prompt)) {
          controller.enqueue(
            encoder.encode(`${JSON.stringify(event)}\n`)
          );
        }
        controller.close();
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-store",
      },
    });
  }

  const result = await executeCoachGeneration(prompt);
  if (!result.ok) {
    return NextResponse.json({
      rawText: JSON.stringify(result.graceful),
      model: prompt.modelConfig.model,
      coachResponse: result.graceful,
      streamed: false,
      error: result.error,
    });
  }

  return NextResponse.json(result.result);
}
