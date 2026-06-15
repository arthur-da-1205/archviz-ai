"use client";

import Image from "next/image";
import { useState } from "react";
import { GenerateImageResponse } from "@/libs/types";

interface GalleryProps {
  images: GenerateImageResponse[];
  onRegenerate: (image: GenerateImageResponse) => void;
  isLoading: boolean;
}

export default function Gallery({
  images,
  onRegenerate,
  isLoading,
}: GalleryProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
      <h2 className="text-2xl font-bold text-gray-900">Your Designs</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
          >
            {/* Image */}
            <div className="relative bg-gray-100 aspect-square">
              <img
                src={image.imageUrl}
                alt={image.prompt}
                className="w-full h-full object-cover"
              />
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
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedId(image.id);
                    onRegenerate(image);
                  }}
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white text-sm font-medium rounded hover:bg-blue-600 disabled:bg-gray-500 transition-colors"
                >
                  {isLoading && selectedId === image.id
                    ? "Regenerating..."
                    : "Edit & Regenerate"}
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
    </div>
  );
}
