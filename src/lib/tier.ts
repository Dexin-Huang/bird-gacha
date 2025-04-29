// src/lib/tier.ts
import { supabase } from "@/lib/supabase";

const cache = new Map<string, string>();

/* new curve based on absolute counts */
function toTier(n: number): string {
  if (n === 0) return "X"; // extinct / unknown
  if (n <= 30) return "S";
  if (n <= 300) return "A";
  if (n <= 3_000) return "B";
  if (n <= 30_000) return "C";
  return "D";
}

export async function getTier(species: string): Promise<string> {
  // simple LRU-ish guard
  if (cache.size > 5_000) cache.clear();

  const name = species
    .replace(/^(male|female|immature)\s+/i, "")
    .toLowerCase();

  if (cache.has(name)) return cache.get(name)!;

  try {
    /* map common name → species_code */
    const { data: sp, error: spError } = await supabase
      .from("species")
      .select("species_code")
      .ilike("com_name", name)
      .single();

    if (spError) {
      console.error(`Error fetching species code for ${name}:`, spError);
      return "X"; // Return unknown tier on error
    }

    const code = sp?.species_code ?? "unknown";

    /* look up record count */
    const { data: freq, error: freqError } = await supabase
      .from("species_freq")
      .select("n_records")
      .eq("species_code", code)
      .single();

    if (freqError) {
      console.error(`Error fetching record count for code ${code}:`, freqError);
      return "X"; // Return unknown tier on error
    }

    const n = freq?.n_records ?? 0;
    const tier = toTier(n);
    
    cache.set(name, tier);
    return tier;
  } catch (error) {
    console.error(`Unexpected error in getTier for ${name}:`, error);
    return "X"; // Return unknown tier on any error
  }
}