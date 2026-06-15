// This is just for testing, we'll delete later
import { saveImage, getImages } from "./db";

console.log("Testing database...");

try {
  // Test save
  const image = saveImage({
    prompt: "modern living room",
    style: "minimalist",
    imageUrl: "https://example.com/image.jpg",
  });

  console.log("✅ Save successful:", image);

  // Test get
  const images = getImages();
  console.log("✅ Get successful:", images);

  console.log("Database is working!");
} catch (error) {
  console.error("❌ Database error:", error);
}
