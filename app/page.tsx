"use client";

import { GenerateImageResponse } from "@/libs/types";
import { useState, useEffect } from "react";
import PromptForm from "./components/forms/prompt";
import Gallery from "./components/gallery";
import LoadingIndicator from "./components/loading-indicator";
import ErrorMessage from "./components/error-message";

// Initialize from localStorage
function getInitialImages(): GenerateImageResponse[] {
  if (typeof window === "undefined") return [];

  const savedGallery = localStorage.getItem("gallery");
  if (savedGallery) {
    try {
      return JSON.parse(savedGallery);
    } catch (e) {
      console.error("Failed to load gallery:", e);
      return [];
    }
  }
  return [];
}

export default function Home() {
  const [images, setImages] = useState<GenerateImageResponse[]>(() =>
    getInitialImages(),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);

  const handleGenerate = async (prompt: string, style: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to generate image");
      }

      const newImage: GenerateImageResponse = await response.json();

      // Update state and localStorage
      const updatedGallery = [newImage, ...images];
      setImages(updatedGallery);
      localStorage.setItem("gallery", JSON.stringify(updatedGallery));

      setEditingPrompt(null);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
      console.error("Generate error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerate = (image: GenerateImageResponse) => {
    setEditingPrompt(image.prompt);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">ArchViz</h1>
            <p className="text-gray-600 mt-2">
              AI-powered architectural and interior design visualization
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form (Left) */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Create New Design
              </h2>
              <PromptForm
                onSubmit={handleGenerate}
                isLoading={isLoading}
                initialPrompt={editingPrompt || ""}
              />
            </div>
          </div>

          {/* Gallery (Right) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <Gallery
                images={images}
                onRegenerate={handleRegenerate}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Loading Indicator */}
      {isLoading && <LoadingIndicator />}

      {/* Error Message */}
      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}
    </div>
  );
}
