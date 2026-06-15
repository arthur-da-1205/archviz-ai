"use client";

import { useState } from "react";

interface PromptFormProps {
  onSubmit: (prompt: string, style: string) => Promise<void>;
  isLoading: boolean;
  initialPrompt?: string;
  initialStyle?: string;
}

const STYLES = [
  { value: "modern", label: "Modern" },
  { value: "minimalist", label: "Minimalist" },
  { value: "industrial", label: "Industrial" },
  { value: "traditional", label: "Traditional" },
  { value: "contemporary", label: "Contemporary" },
];

export default function PromptForm({
  onSubmit,
  isLoading,
  initialPrompt = "",
  initialStyle = "",
}: PromptFormProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [style, setStyle] = useState(initialStyle || "modern");
  const [lastInitialPrompt, setLastInitialPrompt] = useState(initialPrompt);
  const [lastInitialStyle, setLastInitialStyle] = useState(initialStyle);

  // Sync when parent changes initialPrompt/initialStyle (from re-generation)
  if (initialPrompt !== lastInitialPrompt) {
    setPrompt(initialPrompt);
    setLastInitialPrompt(initialPrompt);
  }
  if (initialStyle !== lastInitialStyle) {
    setStyle(initialStyle || "modern");
    setLastInitialStyle(initialStyle);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      await onSubmit(prompt.trim(), style);
      setPrompt("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-gray-700"
        >
          Describe your design
        </label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A modern kitchen with white marble countertops, brass fixtures, and natural light"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#d7b56d] resize-none"
          rows={3}
          disabled={isLoading}
          maxLength={500}
        />
        <p className="text-xs text-gray-500">
          {prompt.length}/500 characters
        </p>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Design style
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setStyle(s.value)}
              disabled={isLoading}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                style === s.value
                  ? "bg-[#1f2933] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={!prompt.trim() || isLoading}
        className="w-full rounded-lg bg-[#d7b56d] px-4 py-3 font-medium text-[#111827] transition-colors hover:bg-[#e6c77f] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            Generating...
          </span>
        ) : (
          "Generate Design"
        )}
      </button>
    </form>
  );
}
