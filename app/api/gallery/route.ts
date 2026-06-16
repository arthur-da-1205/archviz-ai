import { NextRequest, NextResponse } from "next/server";
import { getImages } from "@/libs/db";
import { getOwnerName } from "@/libs/identity";
import { GenerateImageResponse } from "@/libs/types";

export async function GET(request: NextRequest) {
  try {
    const ownerName = getOwnerName(request);
    if (!ownerName) {
      return NextResponse.json(
        { error: "User name is required" },
        { status: 401 },
      );
    }

    const images = getImages(ownerName);

    const response: GenerateImageResponse[] = images.map((img) => ({
      id: img.id,
      prompt: img.prompt,
      style: img.style || "",
      filename: img.filename,
      imageUrl: `/api/images/${img.filename}`,
      width: img.width,
      height: img.height,
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
