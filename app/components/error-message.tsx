"use client";

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorMessage({
  message,
  onDismiss,
}: ErrorMessageProps) {
  return (
    <div className="fixed bottom-4 right-4 max-w-md bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg animate-slide-in">
      <div className="flex gap-3">
        <div className="shrink-0 text-red-600">
          <span className="text-xl">⚠️</span>
        </div>
        <div className="flex-1">
          <p className="text-sm text-red-800">{message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="text-red-600 hover:text-red-700 font-semibold"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
