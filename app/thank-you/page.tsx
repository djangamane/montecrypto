"use client";

import { Suspense } from "react";
import ThankYouInner from "./thank-you-client";

export default function ThankYouPage() {
  return (
    <Suspense fallback={null}>
      <ThankYouInner />
    </Suspense>
  );
}
