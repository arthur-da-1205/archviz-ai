/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

export type ActiveView = "home" | "playground" | "gallery";

const ROUTES: Record<ActiveView, string> = {
  home: "/",
  playground: "/playground",
  gallery: "/gallery",
};
const USER_EMAIL_KEY = "archviz_user_email";
const LEGACY_USER_NAME_KEY = "archviz_user_name";

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(value));
}

export function useIdentity(currentView: ActiveView) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [pendingView, setPendingView] = useState<ActiveView | null>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem(USER_EMAIL_KEY) || "";
    if (isValidEmail(storedEmail)) {
      const cleanEmail = normalizeEmail(storedEmail);
      setUserEmail(cleanEmail);
      setEmailInput(cleanEmail);
    }
  }, []);

  useEffect(() => {
    if (currentView !== "home" && !userEmail) {
      setPendingView(currentView);
    }
  }, [currentView, userEmail]);

  const requestView = (nextView: ActiveView) => {
    if (nextView === "home") {
      setPendingView(null);
      router.push(ROUTES.home);
      return;
    }

    if (!userEmail) {
      setPendingView(nextView);
      return;
    }

    router.push(ROUTES[nextView]);
  };

  const submitIdentity = (event: FormEvent) => {
    event.preventDefault();
    const cleanEmail = normalizeEmail(emailInput);
    if (!isValidEmail(cleanEmail)) return;

    localStorage.setItem(USER_EMAIL_KEY, cleanEmail);
    localStorage.removeItem(LEGACY_USER_NAME_KEY);
    setUserEmail(cleanEmail);
    const nextView = pendingView || "playground";
    router.push(ROUTES[nextView]);
    setPendingView(null);
  };

  const clearIdentity = () => {
    localStorage.removeItem(USER_EMAIL_KEY);
    localStorage.removeItem(LEGACY_USER_NAME_KEY);
    setUserEmail("");
    setEmailInput("");
    setPendingView(null);
  };

  const cancelIdentity = () => {
    setPendingView(null);
    router.push(ROUTES.home);
  };

  return {
    userEmail,
    emailInput,
    setEmailInput,
    pendingView,
    requestView,
    submitIdentity,
    clearIdentity,
    cancelIdentity,
    router,
  };
}
