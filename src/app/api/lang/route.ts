import { cookies } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const lang = body?.lang === "ar" ? "ar" : "en";
  const cookieStore = await cookies();
  cookieStore.set("ecotech_lang", lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return Response.json({ lang });
}
