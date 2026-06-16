"use client";

import { useEffect, useState } from "react";

interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({
  message = "Generating your design...",
}: LoadingIndicatorProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, []);

  const progress = Math.min(
    95,
    Math.max(3, Math.round((elapsedSeconds / 30) * 95)),
  );
  const status =
    elapsedSeconds < 10
      ? "Preparing request"
      : elapsedSeconds < 25
        ? "Generating image"
        : "Waiting for final response";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-7 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#6b7b68]">
              {status}
            </p>
            <p className="mt-2 text-lg font-semibold text-[#17202a]">
              {message}
            </p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[#d7b56d]/40 bg-[#f6f3ee] text-sm font-semibold text-[#17202a]">
            {progress}%
          </div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#d7b56d] transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <span>{elapsedSeconds}s elapsed</span>
          <span>Usually 10-30s</span>
        </div>
      </div>
    </div>
  );
}
