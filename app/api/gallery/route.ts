import { NextResponse } from "next/server";
import { getImages } from "@/libs/db";
import { GenerateImageResponse } from "@/libs/types";

export async function GET() {
  try {
    const images = getImages();

    const response: GenerateImageResponse[] = images.map((img) => ({
      id: img.id,
      prompt: img.prompt,
      style: img.style || "",
      imageUrl: `/api/images/${img.filename}`,
      createdAt: img.createdAt,
    }));

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in /api/gallery:", error);

    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 },
    );
  }
}
