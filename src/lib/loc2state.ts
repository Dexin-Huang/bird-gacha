// src/lib/loc2state.ts
import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';
import states from "@/data/na_states.geo.json";
import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";

// Define the exact type of your GeoJSON
type StateProps = { name: string };
type StateFC = FeatureCollection<Polygon | MultiPolygon, StateProps>;

// Assert the import to that type (via unknown to avoid direct any)
const stateGeo = states as unknown as StateFC;

export function loc2state(lat: number, lon: number): string | null {
  const pt = point([lon, lat]);
  for (const f of stateGeo.features) {
    if (booleanPointInPolygon(pt, f)) {
      return f.properties.name;   // safe, name is typed
    }
  }
  return null; // over ocean or unsupported region
}
