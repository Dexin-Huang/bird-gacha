"use client";
import { useState } from "react";
import { analyze } from "./actions";

export default function CapturePage() {
  const [file, setFile] = useState<File>();
  const [res, setRes] = useState<{ species: string; tier: string } | null>(null);

  async function run() {
    if (!file) return;
    const pos = await new Promise<GeolocationPosition | undefined>((ok) =>
      navigator.geolocation.getCurrentPosition(ok, () => ok(undefined), {
        maximumAge: 6e5,
        timeout: 5e3,
      })
    );
    setRes(await analyze(file, pos));
  }

  return (
    <main className="flex flex-col gap-5 p-6">
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => setFile(e.target.files?.[0])}
        className="mb-4"
      />
      <button
        onClick={run}
        disabled={!file}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Identify!
      </button>

      {res && (
        <section className="bg-white dark:bg-gray-800 rounded shadow p-4 text-center mt-6">
          <h2 className="text-2xl font-semibold">{res.species}</h2>
          <p className="mt-1">
            Tier <span className="font-bold">{res.tier}</span>
          </p>
        </section>
      )}
    </main>
  );
}