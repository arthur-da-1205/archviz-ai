"use client";

import AppHeader from "./components/app-header";
import IdentityModal from "./components/identity-modal";
import { useIdentity } from "./hooks/use-identity";

export default function HomePage() {
  const identity = useIdentity("home");

  const handleSwitchUser = () => {
    identity.clearIdentity();
    identity.router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#f6f3ee] text-[#1f2933]">
      <AppHeader
        activeView="home"
        userEmail={identity.userEmail}
        onNavigate={identity.requestView}
        onSwitchUser={handleSwitchUser}
      />

      <main>
        <section
          className="relative min-h-[calc(100vh-73px)] overflow-hidden bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(13, 18, 23, 0.82), rgba(13, 18, 23, 0.46), rgba(13, 18, 23, 0.2)), url('https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85')",
          }}
        >
          <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
            <div className="max-w-2xl text-white">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.28em] text-[#c7d2bd]">
                AI Architectural Visualization
              </p>
              <h1 className="text-5xl font-semibold leading-tight sm:text-6xl">
                ArchViz AI
              </h1>
              <p className="mt-5 text-xl font-medium text-[#f4efe6]">
                Turn design ideas into polished architectural concepts.
              </p>
              <p className="mt-5 max-w-xl text-base leading-7 text-[#e4ded5]">
                Describe an interior, facade, room mood, or spatial concept.
                ArchViz AI generates visual references you can review, refine,
                and save into a persistent project gallery.
              </p>
              <button
                type="button"
                onClick={() => identity.requestView("playground")}
                className="mt-8 rounded-md bg-[#d7b56d] px-6 py-3 text-sm font-semibold text-[#111827] shadow-lg transition-colors hover:bg-[#e6c77f]"
              >
                Let&apos;s Try
              </button>
            </div>
          </div>
        </section>
      </main>

      <IdentityModal
        pendingView={identity.pendingView}
        userEmail={identity.userEmail}
        emailInput={identity.emailInput}
        setEmailInput={identity.setEmailInput}
        onSubmit={identity.submitIdentity}
        onCancel={identity.cancelIdentity}
      />
    </div>
  );
}
