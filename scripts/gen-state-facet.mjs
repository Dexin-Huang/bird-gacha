#!/usr/bin/env node
// scripts/gen-state-bounty.mjs
// --------------------------------------------------------
//  Generates bounty_state.csv (~100 k rows, ≈5 MB)
//  Uses GBIF facet API — no Supabase calls.
// --------------------------------------------------------
import fs          from "fs";
import fetch       from "node-fetch";
import { parse }   from "csv-parse";
import pLimit      from "p-limit";
import pThrottle   from "p-throttle";

/* ---------- region list -------------------------------- */
const STATES = [
  // — US —
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","District of Columbia","Florida","Georgia","Hawaii","Idaho",
  "Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland",
  "Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana",
  "Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York",
  "North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania",
  "Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah",
  "Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming",
  // — Canada —
  "Alberta","British Columbia","Manitoba","New Brunswick",
  "Newfoundland and Labrador","Nova Scotia","Ontario",
  "Prince Edward Island","Quebec","Saskatchewan",
  "Northwest Territories","Nunavut","Yukon",
  // — Mexico —
  "Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas",
  "Chihuahua","Coahuila","Colima","Durango","Guanajuato","Guerrero","Hidalgo",
  "Jalisco","México","Mexico City","Michoacán","Morelos","Nayarit","Nuevo León",
  "Oaxaca","Puebla","Querétaro","Quintana Roo","San Luis Potosí","Sinaloa",
  "Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatán","Zacatecas"
];

/* ---------- constants ---------------------------------- */
const YEARS = "2019,2024";
const LIC   = "&license=CC0_1_0&license=CC_BY_4_0";   // commercial-safe
const LIMIT = pLimit(5);                     // 5 concurrent fetches
const throttle = pThrottle({ limit: 30, interval: 1000 }); // 30 QPS

/* ---------- 0. load species_seed.csv ------------------- */
const seed = "species_seed.csv";
if (!fs.existsSync(seed)) {
  console.error(`❌ ${seed} not found`);
  process.exit(1);
}

const gbif2code = new Map();
for await (const row of fs.createReadStream(seed).pipe(parse({ columns: true, trim: true }))) {
  gbif2code.set(Number(row.gbif_key), row.species_code);
}
console.log(`Loaded ${gbif2code.size} gbif_key mappings from ${seed}`);

/* ---------- 1. fetch facet counts ---------------------- */
const rows = [];

function makeUrl(state) {
  return "https://api.gbif.org/v1/occurrence/search?" +
         "taxonKey=212" +                       // Aves
         "&country=US&country=CA&country=MX" +
         "&stateProvince=" + encodeURIComponent(state) +
         `&year=${YEARS}&basisOfRecord=HUMAN_OBSERVATION` +
         LIC +
         "&facet=speciesKey&facetLimit=100000&limit=0";
}

await Promise.all(
  STATES.map(state =>
    LIMIT(
      throttle(async () => {
        const url = makeUrl(state);
        const { facets } = await fetch(url).then(r => r.json());
        for (const { name, count } of facets?.[0]?.counts ?? []) {
          const code = gbif2code.get(Number(name));
          if (code) rows.push({ state, species_code: code, n_local: count });
        }
        console.log(`${state.padEnd(20)} — ${rows.length} rows`);
      })
    )
  )
);

/* ---------- 2. write CSV ------------------------------- */
const csv =
  "state,species_code,n_local\n" +
  rows.map(r => `${r.state},${r.species_code},${r.n_local}`).join("\n");

fs.writeFileSync("bounty_state.csv", csv);
console.log(`✔ wrote bounty_state.csv  (${rows.length.toLocaleString()} rows)`);

