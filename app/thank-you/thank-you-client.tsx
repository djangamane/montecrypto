"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ThankYouInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const DEFAULT_ONBOARDING_TARGET = process.env.NEXT_PUBLIC_SCAM_SHOOTER_ONBOARDING_URL || "/game?start=menu&paid=true";
  const [emailInput, setEmailInput] = useState(() => {
    const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
    return params.get("email") || "";
  });
  const [nextPath, setNextPath] = useState(DEFAULT_ONBOARDING_TARGET);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const email = searchParams?.get("email");
    const next = searchParams?.get("next");
    const sessionId = searchParams?.get("session_id");
    const paidFlag = searchParams?.get("paid");
    const token = searchParams?.get("token");
    const expectedToken = process.env.NEXT_PUBLIC_THANK_YOU_TOKEN || "";

    const isAuthorized = !!sessionId || paidFlag === "true" || (expectedToken && token === expectedToken);

    if (!isAuthorized) {
      router.replace("/scam-shooter");
      return;
    }

    setAuthorized(true);
    localStorage.setItem("minerverse_paid", "true");
    if (email) localStorage.setItem("minerverse_email", email);
    if (next) setNextPath(next);
  }, [router, searchParams]);

  const handleConfirm = () => {
    localStorage.setItem("minerverse_paid", "true");
    if (emailInput) localStorage.setItem("minerverse_email", emailInput);
  };

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center p-6 text-center text-white">
      <div className="max-w-lg w-full space-y-6 bg-gray-900/80 border border-arcade-cyan/40 p-6 rounded-lg shadow-lg">
        <h1 className="text-3xl font-heading text-arcade-cyan">Payment Confirmed</h1>
        <p className="text-gray-300 font-mono text-sm">
          Thanks for your purchase. Your access to Scam Shooter is unlocked.
        </p>
        <p className="text-gray-400 text-xs font-mono">
          (Stored client-side; add backend verification/webhook for production.)
        </p>
        <div className="space-y-2 text-left">
          <label className="text-sm font-mono text-gray-300">Confirm your email</label>
          <input
            type="email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder="you@example.com"
            className="w-full bg-black/60 border border-arcade-cyan/50 text-white px-3 py-2 rounded outline-none"
          />
          <button
            onClick={handleConfirm}
            className="w-full mt-1 px-4 py-2 bg-arcade-cyan text-black font-heading rounded shadow hover:scale-105 transition-transform"
          >
            Confirm Access
          </button>
        </div>
        <a
          href={nextPath}
          className="inline-flex items-center justify-center px-4 py-3 bg-arcade-cyan text-black font-heading rounded shadow hover:scale-105 transition-transform"
        >
          Continue to Scam Shooter
        </a>
        <div className="pt-4 border-t border-gray-700 mt-4">
          <a
            href="/"
            className="text-sm text-gray-400 hover:text-white"
          >
            &larr; Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}
