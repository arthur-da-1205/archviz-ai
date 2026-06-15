import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "storage");

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";
  return "image/png";
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  try {
    const { filename } = await params;

    // Security: prevent directory traversal
    if (filename.includes("..") || filename.includes("/")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const filePath = path.join(STORAGE_DIR, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${filename}`);
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }

    // Read file
    const fileBuffer = fs.readFileSync(filePath);

    // Return with correct headers
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": getContentType(filename),
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000", // 1 year
      },
    });
  } catch (error) {
    console.error("❌ Error serving image:", error);
    return NextResponse.json(
      { error: "Failed to serve image" },
      { status: 500 },
    );
  }
}
