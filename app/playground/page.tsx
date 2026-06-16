/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { GenerateImageResponse } from "@/libs/types";
import { useEffect, useState } from "react";
import AppHeader from "../components/app-header";
import ErrorMessage from "../components/error-message";
import Gallery from "../components/gallery";
import IdentityModal from "../components/identity-modal";
import LoadingIndicator from "../components/loading-indicator";
import PromptForm from "../components/forms/prompt";
import SuccessMessage from "../components/success-message";
import { useGallery } from "../hooks/use-gallery";
import {
  getFailedGenerationTimeLabel,
  useGeneration,
} from "../hooks/use-generation";
import type { FailedGeneration } from "../hooks/use-generation";
import { useIdentity } from "../hooks/use-identity";

const REGENERATE_DRAFT_KEY = "archviz_regenerate_draft";

export default function PlaygroundPage() {
  const identity = useIdentity("playground");
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<string | null>(null);
  const [editingStyle, setEditingStyle] = useState<string | null>(null);
  const [editingWidth, setEditingWidth] = useState<number | null>(null);
  const [editingHeight, setEditingHeight] = useState<number | null>(null);

  const gallery = useGallery({
    userEmail: identity.userEmail,
    onError: setGalleryError,
  });

  const generation = useGeneration({
    userEmail: identity.userEmail,
    onGenerated: gallery.prependImage,
    onMissingIdentity: () => identity.requestView("playground"),
    onAfterSuccess: () => {
      setEditingPrompt(null);
      setEditingStyle(null);
      setEditingWidth(null);
      setEditingHeight(null);
    },
  });

  useEffect(() => {
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
  }, []);

  const handleSwitchUser = () => {
    identity.clearIdentity();
    setGalleryError(null);
    gallery.clearImages();
    generation.clearState();
    setEditingPrompt(null);
    setEditingStyle(null);
    setEditingWidth(null);
    setEditingHeight(null);
    identity.router.push("/");
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
    identity.router.push("/playground");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visibleError = generation.error || galleryError;

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#1f2933]">
      <AppHeader
        activeView="playground"
        userEmail={identity.userEmail}
        onNavigate={identity.requestView}
        onSwitchUser={handleSwitchUser}
      />

      <main>
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
                onSubmit={generation.generate}
                isLoading={generation.isLoading}
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
                  onClick={() => identity.requestView("gallery")}
                  className="rounded-md border border-black/10 px-4 py-2 text-sm font-medium text-[#17202a] hover:bg-[#f6f3ee]"
                >
                  View Gallery
                </button>
              </div>

              {generation.failedGenerations.length > 0 && (
                <FailedHistory
                  failedGenerations={generation.failedGenerations}
                  isLoading={generation.isLoading}
                  onRetry={generation.retryFailedGeneration}
                  onClear={generation.clearFailedGenerations}
                />
              )}

              <Gallery
                images={gallery.images.slice(0, 6)}
                isLoading={generation.isLoading}
                isGalleryLoading={gallery.isGalleryLoading}
                onRegenerate={handleRegenerate}
                onDelete={gallery.deleteImage}
                title="Latest Concepts"
              />
            </div>
          </div>
        </section>
      </main>

      <IdentityModal
        pendingView={identity.pendingView}
        userEmail={identity.userEmail}
        emailInput={identity.emailInput}
        setEmailInput={identity.setEmailInput}
        onSubmit={identity.submitIdentity}
        onCancel={identity.cancelIdentity}
      />

      {generation.isLoading && <LoadingIndicator />}

      {visibleError && (
        <ErrorMessage
          message={visibleError}
          onDismiss={() => {
            generation.setError(null);
            setGalleryError(null);
          }}
        />
      )}

      {generation.successMessage && (
        <SuccessMessage
          message={generation.successMessage}
          onDismiss={() => generation.setSuccessMessage(null)}
        />
      )}
    </div>
  );
}

interface FailedHistoryProps {
  failedGenerations: FailedGeneration[];
  isLoading: boolean;
  onRetry: (failedGeneration: FailedGeneration) => void;
  onClear: () => void;
}

function FailedHistory({
  failedGenerations,
  isLoading,
  onRetry,
  onClear,
}: FailedHistoryProps) {
  return (
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
          onClick={onClear}
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
                  {failedGeneration.style} style - {failedGeneration.width}x
                  {failedGeneration.height} -{" "}
                  {failedGeneration.durationSeconds}s -{" "}
                  {getFailedGenerationTimeLabel(failedGeneration.createdAt)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onRetry(failedGeneration)}
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
  );
}
