import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Configure Edge runtime and timeout
export const runtime = 'edge';
export const maxDuration = 300; // seconds

// Initialize Supabase client with Service Role
const supa = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { global: { fetch } }
);
const EBIRD = process.env.EBIRD_KEY!;

// Fetch average monthly checklist frequency histogram for a species in a region
async function avgHist(species: string, region: string): Promise<number> {
  const url = `https://api.ebird.org/v2/product/histogram/${region}?spp=${species}`;
  const res = await fetch(url, { headers: { 'X-eBirdApiToken': EBIRD } });
  if (!res.ok) throw new Error(`eBird ${res.status}: ${res.statusText}`);
  const { histogram } = (await res.json()) as { histogram: number[] };
  return histogram.reduce((sum, v) => sum + v, 0) / histogram.length;
}

export default async function handler(_: NextRequest) {
  // 1) Load county and species lists
  const { data: counties, error: cErr } = await supa.from('county').select();
  const { data: speciesList, error: sErr } = await supa.from('species').select('species_code');
  if (cErr || !counties) {
    return NextResponse.json({ error: 'Failed to fetch counties', details: cErr }, { status: 500 });
  }
  if (sErr || !speciesList) {
    return NextResponse.json({ error: 'Failed to fetch species', details: sErr }, { status: 500 });
  }

  // 2) Gather raw frequencies
  const rows: { species_code: string; county_fips: string; pct: number }[] = [];
  const batch: Promise<any>[] = [];
  const push = (p: Promise<any>) => {
    batch.push(p);
    if (batch.length >= 5) {
      return Promise.all(batch.splice(0));
    }
    return Promise.resolve();
  };
  for (const c of counties) {
    // Ensure 3-digit county code for eBird region
    const region = `US-CT-${c.county_fips.slice(2).padStart(3, '0')}`;
    for (const s of speciesList) {
      // Queue up to 5 concurrent requests (await to catch errors immediately)
      await push(
        avgHist(s.species_code, region).then((pct) => {
          rows.push({ species_code: s.species_code, county_fips: c.county_fips, pct });
        })
      );
    }
  }
  await Promise.all(batch);

  // 3) Compute percentiles by county
  const byCounty: Record<string, typeof rows> = {} as any;
  for (const r of rows) {
    (byCounty[r.county_fips] ||= []).push(r);
  }
  const upserts: { species_code: string; county_fips: string; pct_lists: number; percentile: number }[] = [];
  for (const [fips, arr] of Object.entries(byCounty)) {
    const sorted = arr.sort((a, b) => a.pct - b.pct);
    sorted.forEach((r, i) => {
      upserts.push({
        species_code: r.species_code,
        county_fips: fips,
        pct_lists: r.pct * 100,
        percentile: (i / (sorted.length - 1)) * 100,
      });
    });
  }

  // 4) Upsert frequency table
  const { error: upErr } = await supa.from('checklist_freq').upsert(upserts);
  if (upErr) {
    return NextResponse.json({ error: 'Upsert failed', details: upErr }, { status: 500 });
  }
  return NextResponse.json({ inserted: upserts.length });
}