#!/usr/bin/env node
// -----------------------------------------------------------
//  npm i fast-csv yauzl ngeohash @supabase/supabase-js p-limit
//  node scripts/gen-cell-counts.mjs <gbif_zip>
// -----------------------------------------------------------
import fs from "fs";
import path from "path";
import yauzl from "yauzl";
import csv  from "fast-csv";
import ngeohash from "ngeohash";
import { createClient } from "@supabase/supabase-js";
import pLimit from "p-limit";

/* ---------- config ----------------------------------------------------- */
const ZIP_PATH   = process.argv[2] || "";
const OUT_CSV    = "bird_cell_counts.csv";
const GH_PREC    = 4;                 // geohash-4  (≈ 40 km)
const CONCUR     = 20;                // Supabase fetch concurrency

/* ---------- helper: load species map ----------------------------------- */
const supa = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { global: { fetch } }
);

async function loadSpeciesMap() {
  console.time("fetch-species");
  const { data, error } = await supa
    .from("species")
    .select("gbif_key, species_code");
  if (error) throw error;
  console.timeEnd("fetch-species");
  return new Map(data.map(r => [Number(r.gbif_key), r.species_code]));
}

/* ---------- main ------------------------------------------------------- */
(async () => {
  if (!fs.existsSync(ZIP_PATH)) {
    console.error("Usage: node gen-cell-counts.mjs <gbif_zip>");
    process.exit(1);
  }

  const gbif2code = await loadSpeciesMap();
  const counts = new Map();           // key = geohash|species_code  value = n

  console.time("stream-zip");
  await new Promise((resolve, reject) => {
    yauzl.open(ZIP_PATH, { lazyEntries: true }, (err, zip) => {
      if (err) return reject(err);
      zip.readEntry();
      zip.on("entry", entry => {
        if (!entry.fileName.endsWith("occurrence.txt")) return zip.readEntry();
        zip.openReadStream(entry, (err, stream) => {
          if (err) return reject(err);
          csv
            .parse({ headers: true })
            .on("error", reject)
            .on("data", row => {
              /* quick DarwinCore columns we need */
              const lat  = parseFloat(row.decimalLatitude);
              const lon  = parseFloat(row.decimalLongitude);
              const key  = Number(row.taxonKey);
              if (!Number.isFinite(lat) || !Number.isFinite(lon)) return; // skip
              const species = gbif2code.get(key);
              if (!species) return; // taxa outside your list

              const cell = ngeohash.encode(lat, lon, GH_PREC);
              const id   = `${cell}|${species}`;
              counts.set(id, (counts.get(id) || 0) + 1);
            })
            .on("end", resolve)
            .pipe(stream);
        });
      });
    });
  });
  console.timeEnd("stream-zip");

  /* ---------- write CSV ------------------------------------------------ */
  console.time("write-csv");
  const ws = fs.createWriteStream(OUT_CSV);
  ws.write("geohash4,species_code,n\n");
  for (const [id, n] of counts) {
    const [cell, sp] = id.split("|");
    ws.write(`${cell},${sp},${n}\n`);
  }
  ws.end(() => {
    console.timeEnd("write-csv");
    console.log(`✔ Wrote ${counts.size.toLocaleString()} rows → ${OUT_CSV}`);
  });
})();
