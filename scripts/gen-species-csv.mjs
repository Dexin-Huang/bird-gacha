// scripts/gen-species-csv.mjs  (robust & fast)
// -------------------------------------------------------
import fs        from 'fs';
import https     from 'https';
import fetch     from 'node-fetch';
import { parse } from 'csv-parse';
import pThrottle from 'p-throttle';
import pLimit    from 'p-limit';          // NEW – concurrency cap
// ─── config ────────────────────────────────────────────
const inFile   = 'Clements-v2023-October-2023.csv';
const outFile  = 'species_seed.csv';
const QPS      = 40;          // per-second ceiling
const CONCUR   = 80;          // max simultaneous fetches
const maxTry   = 3;           // fetch + 2 retries
// ─── agent factory ─────────────────────────────────────
const makeAgent = () =>
  new https.Agent({ keepAlive: true, maxSockets: CONCUR, maxFreeSockets: 20 });
let AGENT = makeAgent();
// ─── helpers ───────────────────────────────────────────
const delay = ms => new Promise(r => setTimeout(r, ms));

async function retryFetch (url, tries = maxTry) {
  for (let i = 0; i < tries; i++) {
    try {
      return await fetch(url, { agent: AGENT, timeout: 20_000 });
    } catch (err) {
      // if the pool got poisoned, drop it and start fresh
      if (err.code === 'ECONNRESET') {
        AGENT.destroy();
        AGENT = makeAgent();
      }
      if (i === tries - 1) throw err;
      await delay(250 * 2 ** i);          // 250 ms, 500 ms, …
    }
  }
}
// ─── throttlers ───────────────────────────────────────
const throttledMatch = pThrottle({ limit: QPS, interval: 1000 })(
  async name => {
    const url = 'https://api.gbif.org/v1/species/match?strict=true&name=' +
                encodeURIComponent(name);
    return (await retryFetch(url)).json();
  }
);
const limit = pLimit(CONCUR);             // cap live promises
// ─── I/O setup ────────────────────────────────────────
const out = fs.createWriteStream(outFile, { encoding: 'utf8' });
out.write('species_code,com_name,gbif_key\n');
// ─── pipeline ─────────────────────────────────────────
let processed = 0, matched = 0, errors = 0;
const pending = [];
const parser  = fs.createReadStream(inFile).pipe(parse({ columns: true, trim: true }));

for await (const row of parser) {
  if (row.category?.toLowerCase() !== 'species') continue;

  pending.push(limit(async () => {
    try {
      const json = await throttledMatch(row['scientific name']);
      if (json.usageKey) {
        out.write(
          `${row.species_code},` +
          `${row['English name'].replace(/,/g, '')},` +
          `${json.usageKey}\n`
        );
        matched++;
      }
    } catch (e) {
      errors++;
      console.error(`• ${row['scientific name']}: ${e.message}`);
    } finally {
      if (++processed % 500 === 0)
        console.log(`… ${processed} processed | ${matched} matched | ${errors} errors`);
    }
  }));
}

await Promise.all(pending);
out.end(() => {
  AGENT.destroy();
  console.log(`🎉  Finished ${processed} rows — ${matched} matched, ${errors} errors`);
});
