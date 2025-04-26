export default function Home() {
  return (
    <main className="prose mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">Bird Gacha</h1>
      <p>Upload a photo of a bird, get its species and rarity tier based on your location.</p>
      <h2 className="mt-6 text-2xl font-semibold">How it works</h2>
      <ol className="list-decimal list-inside mt-4 space-y-2">
        <li>Capture or upload a bird photo</li>
        <li>Identify the species using AI</li>
        <li>Lookup its rarity in your county</li>
        <li>Receive a tier: S (super rare) to D (common)</li>
      </ol>
      <div className="mt-6">
        <a href="/capture" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Start capturing &rarr;
        </a>
      </div>
    </main>
  );
}