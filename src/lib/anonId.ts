import { cookies } from "next/headers";

/**
 * Retrieves or mints an anonymous ID stored in cookies.
 * @returns A Promise resolving to the anon_id string.
 */
export async function getAnonId(): Promise<string> {
  const NAME = "anon_id";
  const jar = await cookies();
  const existing = jar.get(NAME)?.value;
  if (existing) {
    return existing;
  }

  // First visit → mint ID, keep for one year
  const id = crypto.randomUUID();
  jar.set(NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return id;
}
