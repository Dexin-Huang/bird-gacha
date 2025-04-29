// src/app/capture/actions.ts
"use server";

import OpenAI                       from "openai";
import { Buffer }                   from "buffer";
import { createClient }             from "@supabase/supabase-js";
import { getAnonId }                from "@/lib/anonId";
import { toTier }                   from "@/lib/tier";        // absolute-count helper

const supa = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false }, global: { fetch } }
);

const MODEL  = "gpt-4o";
const DETAIL = "auto";

/* ---------- thin helper wrappers around RPCs ------------------ */
async function burnTicket(anon: string) {
  const { data, error } = await supa.rpc("at_consume", { _anon: anon, _n: 1 });
  if (error || !data) throw new Error("No tickets left.");
}
async function rateLimit(anon: string, route = "analyze") {
  const { error } = await supa.rpc("at_rate", { _anon: anon, _route: route });
  if (error) throw new Error("Slow down – too many pulls.");
}
async function fuzzyToCode(name: string) {
  const { data } = await supa.rpc("fuzzy_name_to_code", { _name: name });
  return data as string | null;
}
async function getLocalTier(code: string, state: string) {
  const { data } = await supa.rpc("local_tier", { _code: code, _state: state });
  return (data ?? "X") as string;
}

/* -------------------- identify via OpenAI --------------------- */
async function identify(base64: string, state: string) {
  const { csv } = await supa
    .rpc("get_shortlist_csv", {     // **OPTIONAL** small SQL helper
      _state: state
    })
    .single();                      // returns csv of species_code allowed

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
          { type: "text",  text: `Allowed species codes:\n${csv}` },
          { type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64}`, detail: DETAIL } }
        ],
      },
    ],
  });

  return JSON.parse(rsp.choices[0].message.content!);
}

/* =================== PUBLIC ACTION ============================ */
export async function analyze(file: File, state: string) {
  const anon = getAnonId();

  await rateLimit(anon);
  await burnTicket(anon);

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const { species_code, common_name, confidence } = await identify(base64, state);

  /* ---------- NOT A BIRD ---------- */
  if (species_code === "NOT_BIRD") {
    return { species: "Not a bird", tier: "X", confidence };
  }

  /* ----------  happy path ---------- */
  // check if code exists; otherwise fall back to fuzzy match
  let code       = species_code;
  let name       = common_name;
  let tier       : string;

  const { count } = await supa
    .from("species")
    .select("species_code", { head: true, count: "exact" })
    .eq("species_code", code);

  if ((count ?? 0) === 0) {                         // hallucinated code
    const resolved = await fuzzyToCode(common_name);
    if (!resolved) {
      return { species: common_name ?? "Unknown", tier: "X", confidence };
    }
    code = resolved;
  }

  /* tier – local first, else global absolute */
  tier = await getLocalTier(code, state);
  if (tier === "X") {
    const { data } = await supa
      .from("species")
      .select("n_records")
      .eq("species_code", code)
      .single();
    tier = toTier(data?.n_records ?? 0);
  }

  /* friendly name */
  if (!name) {
    const { data } = await supa
      .from("species")
      .select("com_name")
      .eq("species_code", code)
      .single();
    name = data?.com_name ?? code;
  }

  return { species: name, tier, confidence };
}
