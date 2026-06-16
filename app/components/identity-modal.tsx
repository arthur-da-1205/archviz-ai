"use client";

import type { Dispatch, FormEvent, SetStateAction } from "react";
import { isValidEmail } from "../hooks/use-identity";
import type { ActiveView } from "../hooks/use-identity";

interface IdentityModalProps {
  pendingView: ActiveView | null;
  userEmail: string;
  emailInput: string;
  setEmailInput: Dispatch<SetStateAction<string>>;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
}

export default function IdentityModal({
  pendingView,
  userEmail,
  emailInput,
  setEmailInput,
  onSubmit,
  onCancel,
}: IdentityModalProps) {
  if (!pendingView || userEmail) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-2xl">
        <div className="mb-5">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#6b7b68]">
            Identify Workspace
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-[#17202a]">
            Enter your email
          </h2>
          <p className="mt-3 text-sm leading-6 text-[#5f6b76]">
            This lightweight login keeps each reviewer&apos;s generated images
            separate by email without adding a full authentication system.
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="identityEmail"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="identityEmail"
              type="email"
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              maxLength={254}
              autoComplete="email"
              autoFocus
              placeholder="e.g., arthur@example.com"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#d7b56d]"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-md border border-black/10 px-4 py-3 text-sm font-medium text-[#17202a] hover:bg-[#f6f3ee]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValidEmail(emailInput)}
              className="flex-1 rounded-md bg-[#1f2933] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#111827] disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
