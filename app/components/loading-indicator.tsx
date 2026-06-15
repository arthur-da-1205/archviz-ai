"use client";

interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({
  message = "Generating your design...",
}: LoadingIndicatorProps) {
  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 shadow-xl text-center max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-500 animate-spin"></div>
        </div>
        <p className="text-gray-700 font-medium">{message}</p>
        <p className="text-gray-500 text-sm mt-2">
          This usually takes 10-30 seconds
        </p>
      </div>
    </div>
  );
}
