"use server";

/* ------------------------------------------------------------------
   Photo → local-rarity tier
   • model only sees species *codes* valid in the user's state
   • no global counts anywhere
------------------------------------------------------------------- */

import OpenAI from "openai";
import { Buffer } from "buffer";
import { createClient } from "@supabase/supabase-js";

/* ── constants & tuning ────────────────────────────────────────── */
const MODEL = "gpt-4o" as const; // Updated to use GPT-4o model
const DETAIL = "auto" as const; // Simplified to use 'auto' detail setting
const TOKENS = 40;

/* ── Supabase client ───────────────────────────────────────────── */
const supa = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false }, global: { fetch } }
);

/* ── 1.  state → cached shortlist of species codes ─────────────── */
const shortlistCache = new Map<string, { csv: string; set: Set<string> }>();

async function getShortlist(state: string) {
  if (shortlistCache.has(state)) return shortlistCache.get(state)!;

  const { data, error } = await supa
    .from("species_freq_state")
    .select("species_code")
    .eq("state", state)
    .gt("n_local", 0);

  if (error || !data) throw new Error(`Cannot load species list for ${state}`);

  const codes = data.map((r) => r.species_code as string);
  const csv = codes.join(", ");
  const set = new Set(codes);

  shortlistCache.set(state, { csv, set });
  return { csv, set };
}

/* ── 2.  code → common name for display ───────────────────────── */
async function code2name(code: string): Promise<string> {
  const { data } = await supa
    .from("species")
    .select("com_name")
    .eq("species_code", code)
    .single();

  return data?.com_name ?? code;
}

/* ── 3. percentile‑to‑tier helper ─────────────────────────────── */
async function localTier(
  code: string,
  state: string,
  nLocal: number
): Promise<string> {
  if (nLocal === 0) return "X";

  const { data: all } = await supa
    .from("species_freq_state")
    .select("species_code,n_local")
    .eq("state", state)
    .gt("n_local", 0);

  const sorted = all!.sort((a, b) => a.n_local - b.n_local);
  const rank = sorted.findIndex((r) => r.species_code === code);
  const p = rank / (sorted.length - 1);

  return p < 0.05
    ? "S"
    : p < 0.2
    ? "A"
    : p < 0.52
    ? "B"
    : p < 0.81
    ? "C"
    : "D";
}

/* ── 4. identify the bird, constrained to shortlist ───────────── */
async function identify(
  detail: "auto",
  base64: string,
  state: string
): Promise<{ code: string; confidence: number }> {
  const { csv, set } = await getShortlist(state);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

  const rsp = await openai.chat.completions.create({
    model: MODEL,
    max_tokens: TOKENS,
    temperature: 0,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are an expert birder.\n" +
          'Return EXACTLY one JSON object: {"species_code":"code","confidence":0-1}.\n' +
          "The species_code **must** be chosen from the provided list. " +
          'If no living bird is visible return {"species_code":"NOT_BIRD","confidence":0-1}.',
      },
      {
        role: "user",
        content: [
          // ① text first
          {
            type: "text",
            text: `Allowed species codes:\n${csv}`,
          },
          // ② image second
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64}`,
              detail,
            },
          },
        ],
      },
    ],
  });

  try {
    const { species_code, confidence } = JSON.parse(
      rsp.choices[0].message.content!
    );
    if (!set.has(species_code)) throw new Error("model chose invalid code");
    return { code: species_code, confidence };
  } catch (err) {
    throw new Error("Identify failed: " + err);
  }
}

/* ── 5. Public action ------------------------------------------------ */
export async function analyze(file: File, state: string) {
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");

  const res = await identify(DETAIL, base64, state);

  const { data: row } = await supa
    .from("species_freq_state")
    .select("n_local")
    .eq("state", state)
    .eq("species_code", res.code)
    .single();

  const nLocal = row?.n_local ?? 0;
  const tier = await localTier(res.code, state, nLocal);
  const name = await code2name(res.code);

  return { species: name, tier };
}