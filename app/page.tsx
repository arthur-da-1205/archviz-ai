"use client";

import { GenerateImageResponse } from "@/libs/types";
import { useState, useEffect, useRef } from "react";
import PromptForm from "./components/forms/prompt";
import Gallery from "./components/gallery";
import LoadingIndicator from "./components/loading-indicator";
import ErrorMessage from "./components/error-message";

export default function Home() {
  const [images, setImages] = useState<GenerateImageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editingStyle, setEditingStyle] = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const loadGallery = async () => {
      try {
        const response = await fetch("/api/gallery");
        if (response.ok) {
          const data = await response.json();
          setImages(data);
        }
      } catch (err) {
        console.error("Failed to load gallery:", err);
      } finally {
        setIsGalleryLoading(false);
      }
    };

    loadGallery();
  }, []);

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
        let errorMessage = "Failed to generate image";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          errorMessage = `Server returned an unexpected response (status ${response.status}). Please try again.`;
        }
        throw new Error(errorMessage);
      }

      let newImage: GenerateImageResponse;
      try {
        newImage = await response.json();
      } catch {
        throw new Error(
          "Received an invalid response from the server. Please try again.",
        );
      }

      setImages((prev) => [newImage, ...prev]);
      setEditingPrompt(null);
      setEditingStyle(null);
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
    setEditingStyle(image.style);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }

      setImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete image";
      setError(message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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

      <main className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Create New Design
              </h2>
              <PromptForm
                onSubmit={handleGenerate}
                isLoading={isLoading}
                initialPrompt={editingPrompt || ""}
                initialStyle={editingStyle || ""}
              />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <Gallery
                images={images}
                isLoading={isLoading}
                isGalleryLoading={isGalleryLoading}
                onRegenerate={handleRegenerate}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </main>

      {isLoading && <LoadingIndicator />}

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}
    </div>
  );
}
