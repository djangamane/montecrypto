"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { Header } from "@/src/components/Header";
import { Footer } from "@/src/components/Footer";
import { Enterprise } from "@/src/components/Enterprise";
import { supabase } from "@/src/lib/supabaseClient";

export default function EnterprisePage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    supabase?.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setIsSessionLoading(false);
    });
    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange((_event, s) => setSession(s)) || {
      data: { subscription: null },
    };
    return () => subscription?.unsubscribe();
  }, []);

  return (
    <>
      <Header session={session} isSessionLoading={isSessionLoading} onBookNowClick={() => {}} />
      <Enterprise />
      <Footer />
    </>
  );
}
