/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { GenerateImageResponse } from "@/libs/types";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PromptForm from "./forms/prompt";
import Gallery from "./gallery";
import LoadingIndicator from "./loading-indicator";
import ErrorMessage from "./error-message";
import SuccessMessage from "./success-message";

type ActiveView = "home" | "playground" | "gallery";
const REGENERATE_DRAFT_KEY = "archviz_regenerate_draft";
const ROUTES: Record<ActiveView, string> = {
  home: "/",
  playground: "/playground",
  gallery: "/gallery",
};
const USER_EMAIL_KEY = "archviz_user_email";
const LEGACY_USER_NAME_KEY = "archviz_user_name";
const FAILED_GENERATIONS_KEY_PREFIX = "archviz_failed_generations";
const MAX_FAILED_GENERATIONS = 8;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

function getFailedGenerationsKey(email: string) {
  return `${FAILED_GENERATIONS_KEY_PREFIX}:${email}`;
}

function normalizeGenerateError(error: unknown) {
  if (!(error instanceof Error)) return "Something went wrong";

  if (error.message.trim().toLowerCase() === "fetch failed") {
    return "Failed to fetch";
  }

  return error.message;
}

function getFailedGenerationTimeLabel(value: string) {
  return value.includes("T") ? "Previous attempt" : value;
}

interface ArchvizAppProps {
  view: ActiveView;
}

interface FailedGeneration {
  id: string;
  prompt: string;
  style: string;
  width: number;
  height: number;
  error: string;
  durationSeconds: number;
  createdAt: string;
}

export default function ArchvizApp({ view }: ArchvizAppProps) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [pendingView, setPendingView] = useState<ActiveView | null>(null);
  const [images, setImages] = useState<GenerateImageResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editingStyle, setEditingStyle] = useState<string | null>(null);
  const [editingWidth, setEditingWidth] = useState<number | null>(null);
  const [editingHeight, setEditingHeight] = useState<number | null>(null);
  const [failedGenerations, setFailedGenerations] = useState<
    FailedGeneration[]
  >([]);
  const failedGenerationCounter = useRef(0);

  useEffect(() => {
    const storedEmail = localStorage.getItem(USER_EMAIL_KEY) || "";
    if (isValidEmail(storedEmail)) {
      setUserEmail(normalizeEmail(storedEmail));
      setEmailInput(normalizeEmail(storedEmail));
    }

    if (view === "playground") {
      const draft = sessionStorage.getItem(REGENERATE_DRAFT_KEY);
      if (!draft) return;

      try {
        const parsedDraft = JSON.parse(draft) as {
          prompt?: string;
          style?: string;
          width?: number;
          height?: number;
        };

        setEditingPrompt(parsedDraft.prompt || null);
        setEditingStyle(parsedDraft.style || null);
        setEditingWidth(parsedDraft.width || null);
        setEditingHeight(parsedDraft.height || null);
      } catch {
        console.warn("Failed to restore regenerate draft");
      } finally {
        sessionStorage.removeItem(REGENERATE_DRAFT_KEY);
      }
    }
  }, [view]);

  useEffect(() => {
    if (view !== "home" && !userEmail) {
      setPendingView(view);
    }
  }, [view, userEmail]);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  useEffect(() => {
    if (!userEmail) {
      setImages([]);
      setFailedGenerations([]);
      setIsGalleryLoading(false);
      return;
    }

    try {
      const storedFailures = localStorage.getItem(
        getFailedGenerationsKey(userEmail),
      );
      const parsedFailures = storedFailures
        ? (JSON.parse(storedFailures) as FailedGeneration[])
        : [];
      setFailedGenerations(parsedFailures);
      failedGenerationCounter.current = parsedFailures.length;
    } catch {
      setFailedGenerations([]);
    }

    const loadGallery = async () => {
      setIsGalleryLoading(true);
      try {
        const response = await fetch("/api/gallery", {
          headers: { "x-archviz-user": userEmail },
        });
        if (response.ok) {
          const data = await response.json();
          setImages(data);
        } else {
          setImages([]);
        }
      } catch (err) {
        console.error("Failed to load gallery:", err);
      } finally {
        setIsGalleryLoading(false);
      }
    };

    loadGallery();
  }, [userEmail]);

  const requestView = (view: ActiveView) => {
    if (view === "home") {
      setPendingView(null);
      router.push(ROUTES.home);
      return;
    }

    if (!userEmail) {
      setPendingView(view);
      return;
    }

    router.push(ROUTES[view]);
  };

  const handleIdentitySubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const cleanEmail = normalizeEmail(emailInput);
    if (!isValidEmail(cleanEmail)) return;

    localStorage.setItem(USER_EMAIL_KEY, cleanEmail);
    localStorage.removeItem(LEGACY_USER_NAME_KEY);
    setUserEmail(cleanEmail);
    const nextView = pendingView || "playground";
    router.push(ROUTES[nextView]);
    setPendingView(null);
  };

  const handleSwitchUser = () => {
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(LEGACY_USER_NAME_KEY);
    setUserEmail("");
    setEmailInput("");
    setImages([]);
    setFailedGenerations([]);
    setEditingPrompt(null);
    setEditingStyle(null);
    setEditingWidth(null);
    setEditingHeight(null);
    router.push(ROUTES.home);
  };

  const handleGenerate = async (
    prompt: string,
    style: string,
    width: number,
    height: number,
  ) => {
    if (!userEmail) {
      setPendingView("playground");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    let elapsedSeconds = 0;
    const elapsedTimer = window.setInterval(() => {
      elapsedSeconds += 1;
    }, 1000);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-archviz-user": userEmail,
        },
        body: JSON.stringify({ prompt, style, width, height }),
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
      setEditingWidth(null);
      setEditingHeight(null);
      setSuccessMessage("Image generated successfully and saved to gallery.");
      sessionStorage.removeItem(REGENERATE_DRAFT_KEY);
    } catch (err) {
      const message = normalizeGenerateError(err);
      setError(message);
      failedGenerationCounter.current += 1;
      const failedGeneration: FailedGeneration = {
        id: `${userEmail}_${failedGenerationCounter.current}`,
        prompt,
        style,
        width,
        height,
        error: message,
        durationSeconds: Math.max(1, elapsedSeconds),
        createdAt: "Just now",
      };
      setFailedGenerations((prev) => {
        const next = [failedGeneration, ...prev].slice(
          0,
          MAX_FAILED_GENERATIONS,
        );
        localStorage.setItem(
          getFailedGenerationsKey(userEmail),
          JSON.stringify(next),
        );
        return next;
      });
      console.error("Generate error:", err);
    } finally {
      window.clearInterval(elapsedTimer);
      setIsLoading(false);
    }
  };

  const handleRetryFailedGeneration = (failedGeneration: FailedGeneration) => {
    void handleGenerate(
      failedGeneration.prompt,
      failedGeneration.style,
      failedGeneration.width,
      failedGeneration.height,
    );
  };

  const handleClearFailedGenerations = () => {
    if (userEmail) {
      localStorage.removeItem(getFailedGenerationsKey(userEmail));
    }
    setFailedGenerations([]);
    failedGenerationCounter.current = 0;
  };

  const handleRegenerate = (image: GenerateImageResponse) => {
    sessionStorage.setItem(
      REGENERATE_DRAFT_KEY,
      JSON.stringify({
        prompt: image.prompt,
        style: image.style,
        width: image.width,
        height: image.height,
      }),
    );
    setEditingPrompt(image.prompt);
    setEditingStyle(image.style);
    setEditingWidth(image.width);
    setEditingHeight(image.height);
    router.push(ROUTES.playground);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/gallery/${id}`, {
        method: "DELETE",
        headers: { "x-archviz-user": userEmail },
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
            onClick={() => requestView("home")}
            className="text-left"
          >
            <span className="block text-lg font-semibold tracking-wide text-[#17202a]">
              ArchViz AI
            </span>
            <span className="block text-xs font-medium uppercase text-[#6b7b68]">
              Design Generator
            </span>
          </button>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <nav className="flex w-full items-center gap-1 rounded-full border border-black/10 bg-[#f8f5ef] p-1 sm:w-auto">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => requestView(item.id)}
                  className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
                    view === item.id
                      ? "bg-[#1f2933] text-white"
                      : "text-[#46515f] hover:bg-white"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            {userEmail && (
              <div className="flex items-center justify-between gap-3 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-[#46515f] sm:justify-start">
                <span className="max-w-[160px] truncate font-semibold">
                  {userEmail}
                </span>
                <button
                  type="button"
                  onClick={handleSwitchUser}
                  className="font-medium text-rose-400 cursor-pointer hover:underline"
                >
                  Switch
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main>
        {view === "home" && (
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
                  onClick={() => requestView("playground")}
                  className="mt-8 rounded-md bg-[#d7b56d] px-6 py-3 text-sm font-semibold text-[#111827] shadow-lg transition-colors hover:bg-[#e6c77f]"
                >
                  Let&apos;s Try
                </button>
              </div>
            </div>
          </section>
        )}

        {view === "playground" && (
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
                  initialWidth={editingWidth || 1024}
                  initialHeight={editingHeight || 1024}
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
                    onClick={() => requestView("gallery")}
                    className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium text-[#17202a] hover:bg-[#f6f3ee]"
                  >
                    View Gallery
                  </button>
                </div>

                {failedGenerations.length > 0 && (
                  <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-4">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">
                          Failed History
                        </h3>
                        <p className="mt-1 text-sm text-rose-900">
                          Failed attempts are saved here for quick retry.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearFailedGenerations}
                        className="shrink-0 rounded-md border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="space-y-3">
                      {failedGenerations.map((failedGeneration) => (
                        <div
                          key={failedGeneration.id}
                          className="rounded-md border border-rose-200 bg-white p-3"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <p className="line-clamp-2 text-sm font-medium text-[#17202a]">
                                {failedGeneration.prompt}
                              </p>
                              <p className="mt-2 text-xs text-rose-700">
                                {failedGeneration.error}
                              </p>
                              <p className="mt-2 text-xs text-gray-500">
                                {failedGeneration.style} style -{" "}
                                {failedGeneration.width}x
                                {failedGeneration.height} -{" "}
                                {failedGeneration.durationSeconds}s -{" "}
                                {getFailedGenerationTimeLabel(
                                  failedGeneration.createdAt,
                                )}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                handleRetryFailedGeneration(failedGeneration)
                              }
                              disabled={isLoading}
                              className="rounded-md bg-[#1f2933] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111827] disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                              Retry
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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

        {view === "gallery" && (
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

      {pendingView && !userEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6b7b68]">
                Identify Workspace
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-[#17202a]">
                Enter your email
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#5f6b76]">
                This lightweight login keeps each reviewer&apos;s generated
                images separate by email without adding a full authentication
                system.
              </p>
            </div>

            <form onSubmit={handleIdentitySubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="identityEmail"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  id="identityEmail"
                  type="email"
                  value={emailInput}
                  onChange={(event) => setEmailInput(event.target.value)}
                  maxLength={254}
                  autoComplete="email"
                  autoFocus
                  placeholder="e.g., arthur@example.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#d7b56d]"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPendingView(null);
                    router.push(ROUTES.home);
                  }}
                  className="flex-1 rounded-md border border-black/10 px-4 py-3 text-sm font-medium text-[#17202a] hover:bg-[#f6f3ee]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!isValidEmail(emailInput)}
                  className="flex-1 rounded-md bg-[#1f2933] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#111827] disabled:cursor-not-allowed disabled:bg-gray-300"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading && <LoadingIndicator />}

      {error && (
        <ErrorMessage message={error} onDismiss={() => setError(null)} />
      )}

      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}
    </div>
  );
}
