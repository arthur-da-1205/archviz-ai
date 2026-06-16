/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { GenerateImageResponse } from "@/libs/types";

interface GalleryProps {
  images: GenerateImageResponse[];
  isLoading: boolean;
  isGalleryLoading: boolean;
  onRegenerate: (image: GenerateImageResponse) => void;
  onDelete: (id: string) => void;
  title?: string;
}

export default function Gallery({
  images,
  isLoading,
  isGalleryLoading,
  onRegenerate,
  onDelete,
  title = "Your Designs",
}: GalleryProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] =
    useState<GenerateImageResponse | null>(null);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set(prev).add(id));
  };

  const handleDelete = (id: string) => {
    if (deleteConfirmId === id) {
      onDelete(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      // Auto-cancel after 3 seconds
      setTimeout(() => setDeleteConfirmId(null), 3000);
    }
  };

  if (isGalleryLoading) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center mb-4">
          <div className="h-8 w-8 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
        </div>
        <p className="text-gray-500">Loading gallery...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No designs yet. Create one above to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <div
            key={image.id}
            role="button"
            tabIndex={0}
            onClick={() => {
              if (!imageErrors.has(image.id)) setPreviewImage(image);
            }}
            onKeyDown={(event) => {
              if (
                (event.key === "Enter" || event.key === " ") &&
                !imageErrors.has(image.id)
              ) {
                event.preventDefault();
                setPreviewImage(image);
              }
            }}
            className="group relative overflow-hidden rounded-lg border border-gray-200 text-left transition-shadow hover:shadow-lg"
          >
            {/* Image */}
            <div className="relative bg-gray-100 aspect-square">
              {imageErrors.has(image.id) ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <span className="mb-2 h-10 w-10 rounded-md border border-gray-300 bg-white"></span>
                  <p className="text-sm">Image unavailable</p>
                </div>
              ) : (
                <img
                  src={image.imageUrl}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(image.id)}
                />
              )}
            </div>

            {/* Overlay (shows on hover) */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4">
              {/* Prompt */}
              <div>
                <p className="text-white text-sm line-clamp-3">
                  {image.prompt}
                </p>
                <span className="inline-block mt-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                  {image.style}
                </span>
                <span className="ml-2 inline-block rounded bg-white/20 px-2 py-1 text-xs text-white">
                  {image.width}x{image.height}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRegenerate(image);
                  }}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 disabled:bg-gray-500 transition-colors"
                >
                  Edit & Regenerate
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleDelete(image.id);
                  }}
                  disabled={isLoading}
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                    deleteConfirmId === image.id
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-white/20 text-white hover:bg-white/30"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {deleteConfirmId === image.id ? "Confirm" : "Delete"}
                </button>
              </div>
            </div>

            {/* Date */}
            <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {new Date(image.createdAt).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>

      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 px-4 py-6"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative grid max-h-[92vh] w-full max-w-6xl grid-cols-1 overflow-hidden rounded-lg bg-white shadow-2xl lg:grid-cols-[1fr_360px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex min-h-[320px] items-center justify-center bg-[#111827]">
              <img
                src={previewImage.imageUrl}
                alt={previewImage.prompt}
                className="max-h-[72vh] w-full object-contain"
              />
            </div>

            <aside className="flex flex-col gap-5 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6b7b68]">
                    Preview
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-[#17202a]">
                    Generated Concept
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="rounded-md border border-black/10 px-3 py-2 text-sm font-medium text-[#17202a] hover:bg-[#f6f3ee]"
                >
                  Close
                </button>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                  Prompt
                </p>
                <p className="text-sm leading-6 text-gray-700">
                  {previewImage.prompt}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-[#f6f3ee] p-3">
                  <p className="text-xs uppercase text-gray-500">Style</p>
                  <p className="mt-1 font-medium text-[#17202a]">
                    {previewImage.style}
                  </p>
                </div>
                <div className="rounded-md bg-[#f6f3ee] p-3">
                  <p className="text-xs uppercase text-gray-500">Size</p>
                  <p className="mt-1 font-medium text-[#17202a]">
                    {previewImage.width}x{previewImage.height}
                  </p>
                </div>
                <div className="col-span-2 rounded-md bg-[#f6f3ee] p-3">
                  <p className="text-xs uppercase text-gray-500">Created</p>
                  <p className="mt-1 font-medium text-[#17202a]">
                    {new Date(previewImage.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mt-auto flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewImage(null);
                    onRegenerate(previewImage);
                  }}
                  disabled={isLoading}
                  className="flex-1 rounded-md bg-[#1f2933] px-4 py-3 text-sm font-semibold text-white hover:bg-[#111827] disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  Edit & Regenerate
                </button>
                <a
                  href={previewImage.imageUrl}
                  download={previewImage.filename}
                  className="rounded-md border border-black/10 px-4 py-3 text-sm font-semibold text-[#17202a] hover:bg-[#f6f3ee]"
                >
                  Download
                </a>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
