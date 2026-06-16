"use client";

import type { ActiveView } from "../hooks/use-identity";

interface AppHeaderProps {
  activeView: ActiveView;
  userEmail: string;
  onNavigate: (view: ActiveView) => void;
  onSwitchUser: () => void;
}

const navItems: Array<{ id: ActiveView; label: string }> = [
  { id: "home", label: "Home" },
  { id: "playground", label: "Playground" },
  { id: "gallery", label: "Gallery" },
];

export default function AppHeader({
  activeView,
  userEmail,
  onNavigate,
  onSwitchUser,
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="text-left"
        >
          <span className="block text-lg font-semibold tracking-wide text-[#17202a]">
            ArchViz AI
          </span>
          <span className="block text-xs font-medium uppercase text-[#6b7b68]">
            Design Generator
          </span>
        </button>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          <nav className="flex w-full items-center gap-1 rounded-full border border-black/10 bg-[#f8f5ef] p-1 sm:w-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-4 ${
                  activeView === item.id
                    ? "bg-[#1f2933] text-white"
                    : "text-[#46515f] hover:bg-white"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {userEmail && (
            <div className="flex items-center justify-between gap-3 rounded-full border border-black/10 bg-white px-3 py-2 text-sm text-[#46515f] sm:justify-start">
              <span className="max-w-[160px] truncate font-semibold">
                {userEmail}
              </span>
              <button
                type="button"
                onClick={onSwitchUser}
                className="font-medium text-rose-400 cursor-pointer hover:underline"
              >
                Switch
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
