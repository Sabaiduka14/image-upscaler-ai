import * as fal from "@fal-ai/serverless-client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    fal.config({
      credentials: process.env.FAL_KEY,
    });

    const result = await fal.subscribe("fal-ai/luma-dream-machine", {
      input: {
        prompt: prompt,
      },
      logs: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error generating video:", error);
    return NextResponse.json({ error: "Failed to generate video" }, { status: 500 });
  }
}