import { supabase } from '@/lib/supabase';
// ‼ Simple in-memory cache for getTier (avoid N+1 queries within a request)
const tierCache = new Map<string, string>();

/**
 * Given a bird species name and optional location, returns its rarity tier.
 */
export async function getTier(
  species: string,
  loc?: { latitude: number; longitude: number }
): Promise<string> {
  // Clean descriptors (e.g., "male", "female", "immature") from GPT output
  const cleanName = species.replace(/^(male|female|immature)\s+/i, '');
  // Determine county FIPS (default to New Haven '09009')
  let county = '09009';
  if (loc) {
    const { data: counties, error: ctErr } = await supabase
      .from('county')
      .select('county_fips, lat, lon');
    if (counties && counties.length > 0) {
      let nearest = counties[0];
      let minDist = Infinity;
      for (const c of counties) {
        const d2 = (c.lat - loc.latitude) ** 2 + (c.lon - loc.longitude) ** 2;
        if (d2 < minDist) {
          minDist = d2;
          nearest = c;
        }
      }
      county = nearest.county_fips;
    }
  }
  // Cache key to memoize within a request
  const cacheKey = `${cleanName.toLowerCase()}|${county}`;
  if (tierCache.has(cacheKey)) {
    return tierCache.get(cacheKey)!;
  }
  // Map species common name to species_code
  const { data: sp, error: spErr } = await supabase
    .from('species')
    .select('species_code')
    .ilike('com_name', cleanName)
    .limit(1)
    .single();
  const code = sp?.species_code ?? 'unknown';
  // Lookup frequency percentile
  const { data: freq, error: freqErr } = await supabase
    .from('checklist_freq')
    .select('percentile')
    .eq('species_code', code)
    .eq('county_fips', county)
    .single();
  const p = freq?.percentile ?? 100;
  // Map percentile to rarity tier
  let tier: string;
  if (p < 0.1) tier = 'S';
  else if (p < 1) tier = 'A';
  else if (p < 5) tier = 'B';
  else if (p < 20) tier = 'C';
  else tier = 'D';
  tierCache.set(cacheKey, tier);
  return tier;
}