import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { ADMIN_ROUTES_ENABLED } from "@/lib/admin-guard";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: ReactNode }) {
  if (!ADMIN_ROUTES_ENABLED) {
    notFound();
  }

  return <>{children}</>;
}
