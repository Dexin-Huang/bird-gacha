"use server";

import OpenAI               from "openai";
import { Buffer }           from "buffer";
import { createClient }     from "@supabase/supabase-js";
import { getAnonId }        from "@/lib/anonId";
import { toTier }           from "@/lib/tier";

const supa = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false }, global: { fetch } }
);

const MODEL  = "gpt-4o";
const DETAIL = "auto";

/* ---------- helper RPC wrappers ------------------------------- */
async function burnTicket(anon: string) {
  const { data, error } = await supa.rpc("at_consume", { _anon: anon, _n: 1 }).single();
  if (error || !data) throw new Error(error?.message ?? "No tickets left.");
}

async function rateLimit(anon: string, route = "analyze") {
  const { error } = await supa.rpc("at_rate", { _anon: anon, _route: route }).single();
  if (error) throw new Error("Slow down – too many pulls.");
}

async function fuzzyToCode(name: string) {
  const { data, error } = await supa
    .rpc("fuzzy_name_to_code", { _name: name })
    .single<string>();                     // 👈 row is simple TEXT
  if (error) throw new Error(error.message);
  return data ?? null;
}

async function getLocalTier(code: string, state: string) {
  const { data, error } = await supa
    .rpc("local_tier", { _code: code, _state: state })
    .single<string>();                     // 👈 row is simple TEXT
  if (error) throw new Error(error.message);
  return data ?? "X";
}

/* -------------------- identify via OpenAI --------------------- */
async function identify(base64: string, state: string) {
  // get_shortlist_csv returns one TEXT column named csv
  const { data, error } = await supa
    .rpc("get_shortlist_csv", { _state: state })
    .single<{ csv: string }>();            // 👈 row shape
  if (error || !data) throw new Error(error?.message ?? "Failed to fetch shortlist.");
  const { csv } = data;

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const rsp = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: 40,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          'Return {"species_code":"code","common_name":"name","confidence":0-1}. ' +
          "Use a code from the list or NOT_BIRD.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: `Allowed species codes:\n${csv}` },
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64}`, detail: DETAIL },
          },
        ],
      },
    ],
  });

  return JSON.parse(rsp.choices[0].message.content!);
}

/* =================== PUBLIC ACTION ============================ */
export async function analyze(file: File, state: string) {
  const anon = await getAnonId();     // now awaited

  await rateLimit(anon);
  await burnTicket(anon);

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const { species_code, common_name, confidence } = await identify(base64, state);

  /* ---------- NOT A BIRD ---------- */
  if (species_code === "NOT_BIRD") {
    return { species: "Not a bird", tier: "X", confidence };
  }

  /* ----------  happy path ---------- */
  let code = species_code;
  let name = common_name;
  let tier: string;

  // verify code exists; else fuzzy-match
  const { count } = await supa
    .from("species")
    .select("species_code", { head: true, count: "exact" })
    .eq("species_code", code);

  if ((count ?? 0) === 0) {
    const resolved = await fuzzyToCode(common_name);
    if (!resolved) {
      return { species: common_name ?? "Unknown", tier: "X", confidence };
    }
    code = resolved;
  }

  /* tier – local first, else global absolute */
  tier = await getLocalTier(code, state);
  if (tier === "X") {
    const { data, error } = await supa
      .from("species")
      .select("n_records")
      .eq("species_code", code)
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to fetch records.");
    tier = toTier(data.n_records ?? 0);
  }

  /* friendly name */
  if (!name) {
    const { data, error } = await supa
      .from("species")
      .select("com_name")
      .eq("species_code", code)
      .single();
    if (error || !data) throw new Error(error?.message ?? "Failed to fetch name.");
    name = data.com_name ?? code;
  }

  return { species: name, tier, confidence };
}
