/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { GenerateImageResponse } from "@/libs/types";
import { useEffect, useState } from "react";

interface UseGalleryOptions {
  userEmail: string;
  onError: (message: string) => void;
}

export function useGallery({ userEmail, onError }: UseGalleryOptions) {
  const [images, setImages] = useState<GenerateImageResponse[]>([]);
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);

  useEffect(() => {
    if (!userEmail) {
      setImages([]);
      setIsGalleryLoading(false);
      return;
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

  const prependImage = (image: GenerateImageResponse) => {
    setImages((prev) => [image, ...prev]);
  };

  const clearImages = () => {
    setImages([]);
  };

  const deleteImage = async (id: string) => {
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
      onError(message);
    }
  };

  return {
    images,
    isGalleryLoading,
    prependImage,
    clearImages,
    deleteImage,
  };
}
