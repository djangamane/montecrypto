import { NextResponse } from "next/server";

export const ADMIN_ROUTES_ENABLED = process.env.ENABLE_ADMIN_ROUTES === "true";

export function guardAdminApi() {
  if (!ADMIN_ROUTES_ENABLED) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
  return null;
}
