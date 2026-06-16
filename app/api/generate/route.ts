import { NextRequest, NextResponse } from "next/server";
import { saveImage } from "@/libs/db";
import { getOwnerName } from "@/libs/identity";
import { generateImageFromPrompt } from "@/libs/pollinations";
import { GenerateImageRequest, GenerateImageResponse } from "@/libs/types";

const MIN_IMAGE_SIZE = 512;
const MAX_IMAGE_SIZE = 1536;

function normalizeImageSize(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) return null;
  if (value < MIN_IMAGE_SIZE || value > MAX_IMAGE_SIZE) return null;
  return value;
}

export async function POST(request: NextRequest) {
  try {
    console.log("📨 POST /api/generate received");

    const ownerName = getOwnerName(request);
    if (!ownerName) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 401 },
      );
    }

    const body = await request.json();
    console.log("📦 Body:", body);

    const { prompt, style } = body as GenerateImageRequest;
    const width = normalizeImageSize(body.width) || 1024;
    const height = normalizeImageSize(body.height) || 1024;

    // Validate input
    if (!prompt || !prompt.trim()) {
      console.log("❌ Prompt empty");
      return NextResponse.json(
        { error: "Prompt cannot be empty" },
        { status: 400 },
      );
    }

    if (prompt.length > 500) {
      console.log("❌ Prompt too long");
      return NextResponse.json(
        { error: "Prompt too long (max 500 characters)" },
        { status: 400 },
      );
    }

    if (body.width !== undefined && !normalizeImageSize(body.width)) {
      return NextResponse.json(
        { error: "Width must be an integer between 512 and 1536" },
        { status: 400 },
      );
    }

    if (body.height !== undefined && !normalizeImageSize(body.height)) {
      return NextResponse.json(
        { error: "Height must be an integer between 512 and 1536" },
        { status: 400 },
      );
    }

    console.log(`🎨 Generating image for: ${prompt}`);

    // Generate image
    const result = await generateImageFromPrompt(prompt, style, width, height);
    console.log(`✅ Image generated: ${result.filename}`);

    // Save to database
    console.log("💾 Saving to database...");
    const savedImage = saveImage({
      ownerName,
      prompt,
      style,
      filename: result.filename,
      width,
      height,
    });
    console.log(`✅ Saved: ${savedImage.id}`);

    // Return response with imageUrl
    const response: GenerateImageResponse = {
      id: savedImage.id,
      prompt: savedImage.prompt,
      style: savedImage.style || "",
      filename: savedImage.filename,
      width: savedImage.width,
      height: savedImage.height,
      createdAt: savedImage.createdAt,
      imageUrl: `/api/images/${result.filename}`,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error("❌ Error in /api/generate:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate image",
      },
      { status: 500 },
    );
  }
}
