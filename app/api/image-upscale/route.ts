import * as fal from "@fal-ai/serverless-client";
import { NextResponse } from "next/server";

interface FalResult {
  image: {
    url: string;
  };
}

export async function POST(request: Request) {
  try {
    console.log("Received POST request for image upscaling");
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      console.error("No image file received");
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    if (image.size > 10 * 1024 * 1024) { // 10MB limit
      console.error("Image file too large");
      return NextResponse.json({ error: "Image file too large. Please upload an image smaller than 10MB." }, { status: 400 });
    }

    console.log("Image received:", image.name, image.type, image.size);

    // Convert the file to base64
    const arrayBuffer = await image.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const dataUrl = `data:${image.type};base64,${base64Image}`;

    console.log("Image converted to base64");

    if (!process.env.FAL_KEY) {
      console.error("FAL_KEY is not set in environment variables");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    fal.config({
      credentials: process.env.FAL_KEY,
    });

    console.log("Fal.ai config set, sending request to API");

    const result = await fal.subscribe("fal-ai/aura-sr", {
      input: {
        image_url: dataUrl,
        upscaling_factor: 4,
        overlapping_tiles: true,
        checkpoint: "v2"
      },
      logs: true,
      onQueueUpdate: (update) => {
        if (update.status === "IN_PROGRESS") {
          update.logs.map((log) => log.message).forEach(console.log);
        }
      },
    }) as FalResult;

    console.log("Fal.ai API call successful, result:", result);

    if (!result.image) {
      console.error("No image URL in API response");
      return NextResponse.json({ error: "Failed to get upscaled image URL from API" }, { status: 500 });
    }

    return NextResponse.json({ image: result.image });
  } catch (error) {
    console.error("Error upscaling image:", error);
    return NextResponse.json({ 
      error: "Failed to upscale image", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
}