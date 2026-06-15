"use client";

import { GenerateImageResponse } from "@/libs/types";
import { useState, useEffect, useRef } from "react";
import PromptForm from "./components/forms/prompt";
import Gallery from "./components/gallery";
import LoadingIndicator from "./components/loading-indicator";
import ErrorMessage from "./components/error-message";

type ActiveView = "home" | "playground" | "gallery";

export default function Home() {
  const [activeView, setActiveView] = useState<ActiveView>("home");
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
    setActiveView("playground");
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

  const navItems: Array<{ id: ActiveView; label: string }> = [
    { id: "home", label: "Home" },
    { id: "playground", label: "Playground" },
    { id: "gallery", label: "Gallery" },
  ];

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#1f2933]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setActiveView("home")}
            className="text-left"
          >
            <span className="block text-lg font-semibold tracking-wide text-[#17202a]">
              ArchViz AI
            </span>
            <span className="block text-xs font-medium uppercase text-[#6b7b68]">
              Design Generator
            </span>
          </button>

          <nav className="flex w-full items-center gap-1 rounded-full border border-black/10 bg-[#f8f5ef] p-1 sm:w-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
                  activeView === item.id
                    ? "bg-[#1f2933] text-white"
                    : "text-[#46515f] hover:bg-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main>
        {activeView === "home" && (
          <section
            className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(13, 18, 23, 0.82), rgba(13, 18, 23, 0.46), rgba(13, 18, 23, 0.2)), url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85')",
            }}
          >
            <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
              <div className="max-w-2xl text-white">
                <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#c7d2bd]">
                  AI Architectural Visualization
                </p>
                <h1 className="text-5xl font-semibold leading-tight sm:text-6xl">
                  ArchViz AI
                </h1>
                <p className="mt-5 text-xl font-medium text-[#f4efe6]">
                  Turn design ideas into polished architectural concepts.
                </p>
                <p className="mt-5 max-w-xl text-base leading-7 text-[#e4ded5]">
                  Describe an interior, facade, room mood, or spatial concept.
                  ArchViz AI generates visual references you can review, refine,
                  and save into a persistent project gallery.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveView("playground")}
                  className="mt-8 rounded-md bg-[#d7b56d] px-6 py-3 text-sm font-semibold text-[#111827] shadow-lg transition-colors hover:bg-[#e6c77f]"
                >
                  Let&apos;s Try
                </button>
              </div>
            </div>
          </section>
        )}

        {activeView === "playground" && (
          <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6b7b68]">
                Playground
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[#17202a]">
                Generate a design concept
              </h1>
              <p className="mt-3 max-w-2xl text-[#5f6b76]">
                Write a focused prompt, choose a design style, and generate a
                reference image for your architectural or interior concept.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[420px_1fr]">
              <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-[#17202a]">
                  Prompt Studio
                </h2>
                <PromptForm
                  onSubmit={handleGenerate}
                  isLoading={isLoading}
                  initialPrompt={editingPrompt || ""}
                  initialStyle={editingStyle || ""}
                />
              </div>

              <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold text-[#17202a]">
                      Recent Outputs
                    </h2>
                    <p className="mt-1 text-sm text-[#64707d]">
                      Your latest generated concepts appear here.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView("gallery")}
                    className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium text-[#17202a] hover:bg-[#f6f3ee]"
                  >
                    View Gallery
                  </button>
                </div>
                <Gallery
                  images={images.slice(0, 6)}
                  isLoading={isLoading}
                  isGalleryLoading={isGalleryLoading}
                  onRegenerate={handleRegenerate}
                  onDelete={handleDelete}
                  title="Latest Concepts"
                />
              </div>
            </div>
          </section>
        )}

        {activeView === "gallery" && (
          <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6b7b68]">
                Gallery
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-[#17202a]">
                Saved design explorations
              </h1>
              <p className="mt-3 max-w-2xl text-[#5f6b76]">
                Review generated concepts, regenerate from an existing prompt,
                or remove images that no longer fit your direction.
              </p>
            </div>

            <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
              <Gallery
                images={images}
                isLoading={isLoading}
                isGalleryLoading={isGalleryLoading}
                onRegenerate={handleRegenerate}
                onDelete={handleDelete}
                title="All Designs"
              />
            </div>
          </section>
        )}
      </main>

      {isLoading && <LoadingIndicator />}

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}
    </div>
  );
}
