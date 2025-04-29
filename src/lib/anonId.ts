// src/lib/anonId.ts
import { cookies } from "next/headers";

export function getAnonId(): string {
  const NAME   = "anon_id";
  const jar    = cookies();
  const exist  = jar.get(NAME)?.value;
  if (exist) return exist;

  // first visit → mint ID, keep for one year
  const id = crypto.randomUUID();                  // built-in
  jar.set(NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return id;
}
