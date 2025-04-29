import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supa = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false }, global: { fetch } }
);

async function getAnonId(): Promise<string> {
  const jar = await cookies();
  const NAME = "anon_id";

  let id = jar.get(NAME)?.value;
  if (id) return id;

  id = crypto.randomUUID();
  jar.set(NAME, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return id;
}

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

export async function POST() {
  const anon = await getAnonId();
  const { error: rpcError } = await supa.rpc("at_claim_daily", { _anon: anon });

  if (rpcError) {
    return NextResponse.json(
      { granted: false, message: rpcError.message },
      { status: 400 }
    );
  }

  // Fetch updated tickets after claiming
  const { data, error: selectError } = await supa
    .from("anon_tickets")
    .select("tickets,last_daily_reward")
    .eq("anon_id", anon)
    .single();

  if (selectError || !data) {
    return NextResponse.json(
      { granted: false, message: selectError?.message ?? "Tickets data not found." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    granted: true,
    tickets: data.tickets,
    lastRewardISO: data.last_daily_reward,
  });
}
