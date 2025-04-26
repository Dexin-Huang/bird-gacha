"use server";
import OpenAI from "openai";
import { Buffer } from "buffer";
import { getTier } from "@/lib/tier";

export async function analyze(
  file: File,
  pos?: GeolocationPosition
): Promise<{ species: string; tier: string }> {
  // Convert image to base64
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  // Identify species via OpenAI Vision (single user message with image)
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: "Identify the bird species in the image." },
        { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64}` } }
      ]
    }
  ];
  // Note: casting to any to accommodate Vision chat message format
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 30,
    messages: messages as any,
  });
  const species = completion.choices[0].message?.content?.trim() ?? "Unknown";

  // Prepare location data
  const loc = pos?.coords
    ? { latitude: pos.coords.latitude, longitude: pos.coords.longitude }
    : undefined;

  // Lookup rarity tier
  const tier = await getTier(species, loc);

  return { species, tier };
}