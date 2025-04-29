// scripts/gen-species-freq.mjs
// -----------------------------------------------------------
//  npm i node-fetch@3 csv-parse@5 p-limit p-throttle
//  node scripts/gen-species-freq.mjs
// -----------------------------------------------------------
import fs           from "fs";
import https        from "https";
import fetch        from "node-fetch";
import { parse }    from "csv-parse";
import pThrottle    from "p-throttle";
import pLimit       from "p-limit";

/* ── tweakables ─────────────────────────────────────────── */
const SEED_IN   = "species_seed.csv";          // input list
const FREQ_OUT  = "species_freq_seed.csv";     // output
const YEAR_FROM = 2019;                        // 6-year window
const YEAR_TO   = 2024;
const QPS       = 40;                          // GBIF polite rate
const CONCUR    = 80;                          // in-flight fetches
const maxTry    = 3;                           // retry attempts

/* ── robust agent / retry boilerplate ───────────────────── */
const makeAgent = () =>
  new https.Agent({ keepAlive: true, maxSockets: CONCUR, maxFreeSockets: 20 });
let AGENT = makeAgent();
const delay = ms => new Promise(r => setTimeout(r, ms));
async function retryFetch(url, tries = maxTry) {
  for (let i = 0; i < tries; i++) {
    try { return await fetch(url, { agent: AGENT, timeout: 20_000 }); }
    catch (err) {
      if (err.code === "ECONNRESET") { AGENT.destroy(); AGENT = makeAgent(); }
      if (i === tries - 1) throw err;
      await delay(250 * 2 ** i);
    }
  }
}

/* ── throttled GBIF counter ─────────────────────────────── */
const throttleCount = pThrottle({ limit: QPS, interval: 1000 })(async key => {
  if (!key) return 0;
  const url =
    `https://api.gbif.org/v1/occurrence/count?taxonKey=${key}` +
    `&year=${YEAR_FROM},${YEAR_TO}`;  // (optional licence filter removed)
  try {
    const num = await retryFetch(url).then(r => r.json());
    return typeof num === "number" ? num : 0;
  } catch {
    return 0;
  }
});
const limit = pLimit(CONCUR);

/* ── read species_seed.csv ──────────────────────────────── */
console.log("📖 Reading species_seed.csv …");
const rows = [];
const parser = fs.createReadStream(SEED_IN).pipe(parse({ columns: true, trim: true }));
for await (const row of parser) rows.push({ code: row.species_code, key: row.gbif_key });

/* ── fetch counts ───────────────────────────────────────── */
console.time("GBIF");
const results = [];
let processed = 0;

await Promise.all(
  rows.map(r => limit(async () => {
    const n = await throttleCount(r.key);
    results.push({ species_code: r.code, n_records: n });

    // ── per-species logging (comment out if too noisy) ──
    if (n > 0) console.log(`[${r.code}] ${n}`);

    if (++processed % 500 === 0)
      console.log(`… ${processed} / ${rows.length}`);
  }))
);
console.timeEnd("GBIF");

/* ── percentile math ───────────────────────────────────── */
results.sort((a, b) => a.n_records - b.n_records);
const denom = Math.max(results.length - 1, 1);
const now   = new Date().toISOString();

results.forEach((r, i) => {
  r.percentile = (i / denom) * 100;
  r.last_sync  = now;
});

/* ── write species_freq_seed.csv ────────────────────────── */
const out = fs.createWriteStream(FREQ_OUT, { encoding: "utf8" });
out.write("species_code,n_records,percentile,last_sync\n");
for (const r of results)
  out.write(`${r.species_code},${r.n_records},${r.percentile.toFixed(4)},${r.last_sync}\n`);
out.end(() => {
  AGENT.destroy();
  console.log(`✅  Wrote ${FREQ_OUT} with ${results.length} rows (years ${YEAR_FROM}-${YEAR_TO})`);
});
