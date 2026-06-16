"use client";

interface SuccessMessageProps {
  message: string;
  onDismiss: () => void;
}

export default function SuccessMessage({
  message,
  onDismiss,
}: SuccessMessageProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md rounded-lg border border-emerald-200 bg-emerald-50 p-4 shadow-lg animate-slide-in">
      <div className="flex gap-3">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-sm font-semibold text-white">
          OK
        </div>
        <div className="flex-1">
          <p className="text-sm text-emerald-900">{message}</p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="font-semibold text-emerald-700 hover:text-emerald-800"
        >
          Close
        </button>
      </div>
    </div>
  );
}
