// src/app/api/tickets/route.ts
import { cookies }          from "next/headers";
import { NextResponse }     from "next/server";
import { createClient }     from "@supabase/supabase-js";

export const dynamic = "force-dynamic";   // this route reads/writes cookies

const supa = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false }, global: { fetch } }
);

/* ------------------------------------------------------------------ */
/* helper – returns the anon-id for this browser, minting one if none */
/* ------------------------------------------------------------------ */
async function getAnonId(): Promise<string> {
  const jar  = await cookies();           // ← must await in App Router
  const NAME = "anon_id";

  let id = jar.get(NAME)?.value;
  if (id) return id;

  id = crypto.randomUUID();               // built-in, no dependency
  jar.set(NAME, id, {
    httpOnly : true,
    sameSite : "lax",
    secure   : process.env.NODE_ENV === "production",
    maxAge   : 60 * 60 * 24 * 365,        // 1 year
    path     : "/",
  });
  return id;
}

/* ------------------  GET /api/tickets  ------------------ */
export async function GET() {
  const anon = await getAnonId();

  const { data } = await supa
    .from("anon_tickets")
    .select("tickets,last_daily_reward")
    .eq("anon_id", anon)
    .maybeSingle();

  const balance = data?.tickets ?? 10;
  const lastISO = data?.last_daily_reward ?? null;

  if (!data) {
    await supa.from("anon_tickets").insert({
      anon_id: anon,
      tickets: balance,
      last_daily_reward: null,
    });
  }

  return NextResponse.json({ tickets: balance, lastRewardISO: lastISO });
}

/* ------------------  POST /api/tickets  ------------------ */
export async function POST() {
  const anon = await getAnonId();
  const { error } = await supa.rpc("at_claim_daily", { _anon: anon });

  if (error) {
    return NextResponse.json(
      { granted: false, message: error.message },
      { status: 400 },
    );
  }

  const { data } = await supa
    .from("anon_tickets")
    .select("tickets,last_daily_reward")
    .eq("anon_id", anon)
    .single();

  return NextResponse.json({
    granted      : true,
    tickets      : data.tickets,
    lastRewardISO: data.last_daily_reward,
  });
}
