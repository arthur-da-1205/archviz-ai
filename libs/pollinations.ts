/**
 * Pollinations.ai API client
 * Generates images from prompts
 */

const POLLINATIONS_API_URL = "https://pollinations.ai/p";

export async function generateImageFromPrompt(
  prompt: string,
  style: string,
  timeout: number = 35000, // 35 seconds
): Promise<string> {
  try {
    // Skip if no API key in production, but still try
    const apiKey = process.env.POLLINATIONS_API_KEY;

    // Enhance prompt with style
    const enhancedPrompt = `${prompt}, ${style} style, high quality architectural visualization`;

    // Construct Pollinations URL
    // Format: /p/{prompt}?seed={seed}&nologo
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    const seed = Math.floor(Math.random() * 10000);
    const imageUrl = `${POLLINATIONS_API_URL}/${encodedPrompt}?seed=${seed}&nologo`;

    // Verify image can be fetched with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(imageUrl, {
        method: "HEAD",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Pollinations API returned ${response.status}`);
      }

      return imageUrl;
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error(
          "Image generation timeout - took longer than 35 seconds",
        );
      }

      throw fetchError;
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

/**
 * Mock image generator for development without API
 */
export function generateMockImage(prompt: string): string {
  // Return placeholder with prompt text
  return `https://via.placeholder.com/512x512?text=${encodeURIComponent(prompt.substring(0, 30))}`;
}
