// src/lib/tier.ts
import { supabase } from "@/lib/supabase"; // Assuming this points to your Supabase client

// Cache keyed by species_code
const cache = new Map<string, string>();

/* Curve based on absolute counts (from species_freq.n_records) */
// **EXPORT THIS FUNCTION** so actions.ts can use it directly for the global fallback
export function toTier(n: number | null | undefined): string {
  const count = n ?? 0; // Treat null/undefined counts as 0
  if (count === 0) return "X"; // Default for 0 or null counts (actions.ts handles n=0 global as 'S')
  if (count <= 30) return "S"; // Very few records
  if (count <= 300) return "A"; // Few records
  if (count <= 3_000) return "B"; // Moderate records
  if (count <= 30_000) return "C"; // Many records
  return "D"; // Very many records (Most common)
}

// Modified to accept species_code and look up n_records
// It now returns an object including the calculated tier and the raw count
export async function getTier(species_code: string): Promise<{ tier: string, nRecords: number | null }> {
  // Simple LRU-ish guard
  if (cache.size > 5_000) {
    console.log("[getTier] Cache cleared.");
    cache.clear();
  }

  // Handle NOT_BIRD specifically
  if (species_code === "NOT_BIRD") return { tier: "X", nRecords: null };

  // Check cache first (Cache stores just the tier string)
  // Cache is temporarily less effective because analyze needs nRecords
  // A better cache would store { tier: string, nRecords: number | null }
  // For now, we'll skip cache check if we strictly need nRecords
  // if (cache.has(species_code)) return { tier: cache.get(species_code)!, nRecords: null /* Can't get count from simple cache */ };


  console.log(`[getTier] Fetching n_records for code: ${species_code}`);

  try {
    /* look up record count by species_code in species_freq table */
    // Assuming species_freq table has species_code and n_records (total/global count)
    const { data: freq, error: freqError } = await supabase
      .from("species_freq") // Use the table with overall/global frequency counts
      .select("n_records")
      .eq("species_code", species_code)
      .single();

    if (freqError && freqError.code !== 'PGRST116') { // PGRST116 is "No rows found"
      console.error(`[getTier] Error fetching record count for code ${species_code}:`, freqError);
      // Don't cache transient errors
      return { tier: "X", nRecords: null }; // Return unknown tier and null count on fetch error
    }

    // n will be null if no row was found for the species_code in species_freq
    const nRecords = freq?.n_records ?? null; // Store as null if not found

    const calculatedTier = toTier(nRecords); // Calculate tier using toTier

    console.log(`[getTier] Fetched count for ${species_code}: ${nRecords ?? 'null'}, calculated Tier (via toTier): ${calculatedTier}`);

    // Cache the result if desired, storing only the tier string
    // cache.set(species_code, calculatedTier);

    return { tier: calculatedTier, nRecords: nRecords }; // **Return both tier and count**
  } catch (error) {
    console.error(`[getTier] Unexpected error for code ${species_code}:`, error);
    return { tier: "X", nRecords: null }; // Return unknown tier and null count on error
  }
}