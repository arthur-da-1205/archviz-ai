"use client";

import { useState } from "react";

interface PromptFormProps {
  onSubmit: (prompt: string, style: string) => Promise<void>;
  isLoading: boolean;
  initialPrompt?: string;
}

const STYLES = [
  { value: "modern", label: "✨ Modern" },
  { value: "minimalist", label: "◾ Minimalist" },
  { value: "industrial", label: "⚙️ Industrial" },
  { value: "traditional", label: "🏛️ Traditional" },
  { value: "contemporary", label: "🎨 Contemporary" },
];

export default function PromptForm({
  onSubmit,
  isLoading,
  initialPrompt = "",
}: PromptFormProps) {
  // Use initialPrompt as default value
  const [prompt, setPrompt] = useState(initialPrompt);
  const [style, setStyle] = useState("modern");

  // When initialPrompt changes, update local state
  // (but NOT in useEffect - just control it via form)
  const displayPrompt = initialPrompt || prompt;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (displayPrompt.trim()) {
      await onSubmit(displayPrompt, style);
      setPrompt("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Prompt Input */}
      <div className="space-y-2">
        <label
          htmlFor="prompt"
          className="block text-sm font-medium text-gray-700"
        >
          Describe your design
        </label>
        <textarea
          id="prompt"
          value={displayPrompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A modern kitchen with white marble countertops, brass fixtures, and natural light"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
          disabled={isLoading}
          maxLength={500}
        />
        <p className="text-xs text-gray-500">
          {displayPrompt.length}/500 characters
        </p>
      </div>

      {/* Style Selection */}
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
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!displayPrompt.trim() || isLoading}
        className="w-full px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
