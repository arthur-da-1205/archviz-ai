import { NextRequest, NextResponse } from "next/server";
import { deleteImage, getImageById } from "@/libs/db";
import { getOwnerName } from "@/libs/identity";
import { deleteImageFile } from "@/libs/pollinations";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const ownerName = getOwnerName(_request);
    if (!ownerName) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 401 },
      );
    }

    const image = getImageById(id, ownerName);
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Delete file from disk
    deleteImageFile(image.filename);

    // Delete record from database
    deleteImage(id, ownerName);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 },
    );
  }
}
