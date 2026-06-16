/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { GenerateImageResponse } from "@/libs/types";
import { useEffect, useRef, useState } from "react";

const FAILED_GENERATIONS_KEY_PREFIX = "archviz_failed_generations";
const MAX_FAILED_GENERATIONS = 8;

export interface FailedGeneration {
  id: string;
  prompt: string;
  style: string;
  width: number;
  height: number;
  error: string;
  durationSeconds: number;
  createdAt: string;
}

interface UseGenerationOptions {
  userEmail: string;
  onGenerated: (image: GenerateImageResponse) => void;
  onMissingIdentity: () => void;
  onAfterSuccess?: () => void;
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

export function getFailedGenerationTimeLabel(value: string) {
  return value.includes("T") ? "Previous attempt" : value;
}

export function useGeneration({
  userEmail,
  onGenerated,
  onMissingIdentity,
  onAfterSuccess,
}: UseGenerationOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [failedGenerations, setFailedGenerations] = useState<
    FailedGeneration[]
  >([]);
  const failedGenerationCounter = useRef(0);

  useEffect(() => {
    if (!successMessage) return;

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage(null);
    }, 3500);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  useEffect(() => {
    if (!userEmail) {
      setFailedGenerations([]);
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
  }, [userEmail]);

  const generate = async (
    prompt: string,
    style: string,
    width: number,
    height: number,
  ) => {
    if (!userEmail) {
      onMissingIdentity();
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

      onGenerated(newImage);
      onAfterSuccess?.();
      setSuccessMessage("Image generated successfully and saved to gallery.");
      sessionStorage.removeItem("archviz_regenerate_draft");
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

  const retryFailedGeneration = (failedGeneration: FailedGeneration) => {
    void generate(
      failedGeneration.prompt,
      failedGeneration.style,
      failedGeneration.width,
      failedGeneration.height,
    );
  };

  const clearFailedGenerations = () => {
    if (userEmail) {
      localStorage.removeItem(getFailedGenerationsKey(userEmail));
    }
    setFailedGenerations([]);
    failedGenerationCounter.current = 0;
  };

  const clearState = () => {
    setError(null);
    setSuccessMessage(null);
    setFailedGenerations([]);
    failedGenerationCounter.current = 0;
  };

  return {
    isLoading,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    failedGenerations,
    generate,
    retryFailedGeneration,
    clearFailedGenerations,
    clearState,
  };
}
