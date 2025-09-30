import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient.js";
import OnboardingModal from "../OnboardingModal.jsx";

export function AuthPanel({ session: initialSession }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("signin");
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [session, setSession] = useState(initialSession);
  const [newUser, setNewUser] = useState(null);

  useEffect(() => {
    setSession(initialSession);
  }, [initialSession]);

  const handleAuth = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          setNewUser(data.user);
          setShowOnboarding(true);
          setMessage("Check your inbox to confirm your email.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
  };

  if (showOnboarding && newUser) {
    return <OnboardingModal user={newUser} onClose={handleOnboardingClose} />;
  }

  if (session) {
    return (
      <div className="rounded-2xl border border-brand-muted/30 bg-white/85 p-6 text-sm text-brand-muted">
        <p className="text-brand-text">Signed in as {session.user.email}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-4 inline-flex items-center justify-center rounded-xl border border-brand-link px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-brand-link transition hover:bg-brand-link hover:text-brand-bg"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleAuth}
      className="space-y-4 rounded-2xl border border-brand-muted/30 bg-white/85 p-6 text-sm"
    >
      <div>
        <h3 className="text-lg font-semibold text-brand-text">
          {mode === "signup" ? "Create an account" : "Sign in"}
        </h3>
        <p className="mt-1 text-brand-muted">
          Use the same credentials across all MonteCrypto tools.
        </p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-brand-text">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-brand-muted/40 bg-white px-3 py-2 text-sm text-brand-text shadow-sm focus:border-brand-link focus:outline-none focus:ring-2 focus:ring-brand-link/30"
          />
        </label>

        <label className="block text-sm text-brand-text">
          Password
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            className="mt-1 w-full rounded-xl border border-brand-muted/40 bg-white px-3 py-2 text-sm text-brand-text shadow-sm focus:border-brand-link focus:outline-none focus:ring-2 focus:ring-brand-link/30"
          />
        </label>
      </div>

      {message ? <p className="text-xs text-brand-link">{message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-brand-link px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-text disabled:cursor-not-allowed disabled:bg-brand-muted/40"
      >
        {isSubmitting ? "Working…" : mode === "signup" ? "Sign up" : "Sign in"}
      </button>

      <div className="text-center text-xs text-brand-muted">
        {mode === "signup" ? (
          <button
            type="button"
            onClick={() => setMode("signin")}
            className="underline decoration-dotted"
          >
            Already have an account?
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMode("signup")}
            className="underline decoration-dotted"
          >
            Need an account?
          </button>
        )}
      </div>
    </form>
  );
}
