import fs from "fs";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "storage");

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export interface GenerateImageResult {
  filename: string;
  localPath: string;
}

function getExtension(contentType: string): string {
  if (contentType.includes("image/png")) return "png";
  if (contentType.includes("image/webp")) return "webp";
  if (contentType.includes("image/gif")) return "gif";
  return "jpg";
}

export async function generateImageFromPrompt(
  prompt: string,
  style: string,
): Promise<GenerateImageResult> {
  const enhancedPrompt = [
    prompt,
    `${style} style`,
    "high quality architectural visualization",
    "professional interior or architectural render",
    "clean composition",
  ].join(", ");
  const apiKey = process.env.POLLINATIONS_API_KEY;

  const url = new URL(
    `https://gen.pollinations.ai/image/${encodeURIComponent(enhancedPrompt)}`,
  );
  url.searchParams.set("width", "1024");
  url.searchParams.set("height", "1024");
  url.searchParams.set("model", process.env.POLLINATIONS_MODEL || "flux");
  if (apiKey) {
    url.searchParams.set("key", apiKey);
  }

  console.log("🎨 Creating Pollinations image...");

  const response = await fetch(url, {
    headers: {
      Accept: "image/*",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(
      `Pollinations error: ${response.statusText} (${response.status})`,
    );
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.startsWith("image/")) {
    throw new Error(`Pollinations error: expected image, got ${contentType}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const id = `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const filename = `${id}.${getExtension(contentType)}`;
  const localPath = path.join(STORAGE_DIR, filename);

  fs.writeFileSync(localPath, buffer);
  console.log(`💾 Saved: ${filename}`);

  return { filename, localPath };
}

export function deleteImageFile(filename: string): boolean {
  const filePath = path.join(STORAGE_DIR, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    return true;
  }
  return false;
}
