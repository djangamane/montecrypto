"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { ApiKeysDashboard } from "@/src/components/api-keys/ApiKeysDashboard";
import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { supabase } from "@/src/lib/supabaseClient";

export default function ApiKeysPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsSessionLoading(false);
    });

    const { data: { subscription } } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    }) || { data: { subscription: null } };

    return () => subscription?.unsubscribe();
  }, []);

  return (
    <>
      <Header session={session} isSessionLoading={isSessionLoading} onBookNowClick={() => {}} />
      <main className="min-h-screen pt-20">
        <ApiKeysDashboard />
      </main>
      <Footer />
    </>
  );
}
