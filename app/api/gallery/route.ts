import { NextRequest, NextResponse } from "next/server";
import { getImages } from "@/libs/db";
import { GenerateImageResponse } from "@/libs/types";

export async function GET(request: NextRequest) {
  try {
    const images = getImages();

    console.log(`📷 Fetched ${images.length} images from gallery`);

    return NextResponse.json(images as GenerateImageResponse[]);
  } catch (error) {
    console.error("❌ Error in /api/gallery:", error);

    return NextResponse.json(
      { error: "Failed to fetch gallery" },
      { status: 500 },
    );
  }
}
