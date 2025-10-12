"use client";

import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabaseClient.js";
import OnboardingModal from "../OnboardingModal.jsx";

const INPUT_CLASSES =
  "w-full rounded-lg border border-brand-muted/40 bg-white px-3 py-2 text-sm text-brand-text shadow-sm focus:border-brand-link focus:outline-none focus:ring-2 focus:ring-brand-link/30";

export function HeaderAuthBar({ session, isLoading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signup");
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [newUser, setNewUser] = useState(null);

  useEffect(() => {
    if (session) {
      setShowOnboarding(false);
      setNewUser(null);
    }
  }, [session]);

  if (!supabase) {
    return null;
  }

  if (showOnboarding && newUser) {
    return <OnboardingModal user={newUser} onClose={() => setShowOnboarding(false)} />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    setMessage(null);
    setIsSubmitting(true);

    try {
      if (mode === "signup") {
        const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
        });
        if (error) throw error;
        if (data.user) {
          setNewUser(data.user);
          setShowOnboarding(true);
          setMessage("Check your inbox to confirm your email.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      setEmail("");
      setPassword("");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="border-t border-brand-muted/15 bg-brand-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-3 md:flex-row md:items-center md:justify-between">
        <div className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-muted">
          {mode === "signup" ? "Create a free account" : "Sign in to continue"}
        </div>

        {isLoading ? (
          <p className="text-xs text-brand-muted">Checking account…</p>
        ) : session ? (
          <div className="flex w-full flex-col items-start gap-2 text-sm text-brand-text md:flex-row md:items-center md:justify-end md:gap-3">
            <span className="truncate text-brand-muted">Signed in as {session.user.email}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-lg border border-brand-link px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-brand-link transition hover:bg-brand-link hover:text-brand-bg"
            >
              Sign out
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 text-sm md:flex-row md:items-center">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className={`${INPUT_CLASSES} md:max-w-xs`}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className={`${INPUT_CLASSES} md:max-w-xs`}
            />
            <div className="flex items-center gap-2 md:gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-lg bg-brand-link px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-brand-text disabled:cursor-not-allowed disabled:bg-brand-muted/40"
              >
                {isSubmitting ? "Working…" : mode === "signup" ? "Sign up" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => setMode((prev) => (prev === "signup" ? "signin" : "signup"))}
                className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-muted underline decoration-dotted"
              >
                {mode === "signup" ? "Sign in" : "Create account"}
              </button>
            </div>
            {message ? <p className="text-xs text-brand-link md:ml-3">{message}</p> : null}
          </form>
        )}
      </div>
    </div>
  );
}
