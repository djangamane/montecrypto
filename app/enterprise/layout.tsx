import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Enterprise API | AI Crypto Risk",
  description:
    "Integrate institutional-grade token risk scoring into your exchange, wallet, or compliance workflow. REST API, MCP server, and webhooks.",
};

export default function EnterpriseLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
