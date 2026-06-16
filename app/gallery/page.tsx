"use client";

import { GenerateImageResponse } from "@/libs/types";
import { useState } from "react";
import AppHeader from "../components/app-header";
import ErrorMessage from "../components/error-message";
import Gallery from "../components/gallery";
import IdentityModal from "../components/identity-modal";
import LoadingIndicator from "../components/loading-indicator";
import SuccessMessage from "../components/success-message";
import { useGallery } from "../hooks/use-gallery";
import { useGeneration } from "../hooks/use-generation";
import { useIdentity } from "../hooks/use-identity";

const REGENERATE_DRAFT_KEY = "archviz_regenerate_draft";

export default function GalleryPage() {
  const identity = useIdentity("gallery");
  const [galleryError, setGalleryError] = useState<string | null>(null);

  const gallery = useGallery({
    userEmail: identity.userEmail,
    onError: setGalleryError,
  });

  const generation = useGeneration({
    userEmail: identity.userEmail,
    onGenerated: gallery.prependImage,
    onMissingIdentity: () => identity.requestView("playground"),
  });

  const handleSwitchUser = () => {
    identity.clearIdentity();
    setGalleryError(null);
    gallery.clearImages();
    generation.clearState();
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
    identity.router.push("/playground");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const visibleError = generation.error || galleryError;

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#1f2933]">
      <AppHeader
        activeView="gallery"
        userEmail={identity.userEmail}
        onNavigate={identity.requestView}
        onSwitchUser={handleSwitchUser}
      />

      <main>
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6b7b68]">
              Gallery
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-[#17202a]">
              Saved design explorations
            </h1>
            <p className="mt-3 max-w-2xl text-[#5f6b76]">
              Review generated concepts, regenerate from an existing prompt, or
              remove images that no longer fit your direction.
            </p>
          </div>

          <div className="rounded-lg border border-black/10 bg-white p-6 shadow-sm">
            <Gallery
              images={gallery.images}
              isLoading={generation.isLoading}
              isGalleryLoading={gallery.isGalleryLoading}
              onRegenerate={handleRegenerate}
              onDelete={gallery.deleteImage}
              title="All Designs"
            />
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
