import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getMatches } from "@/lib/matching";
import { type Profile } from "@/lib/data";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { query } = await req.json();

  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const systemPrompt = `You are a travel personality analyst. A user will describe what they want from a trip in their own words.

Your job is to:
1. Read their description and infer their travel personality across 7 dimensions, each scored 0–100.
2. Assign them to exactly one of these traveler archetypes: "Slow Wanderer", "City Nomad", "Culture Hunter", "Backpacker Spirit"

Dimension definitions (score 0–100):
- pace: 0 = very slow, relaxed, stays in one place | 100 = fast-paced, always moving, many cities
- environment: 0 = nature, outdoors, rural | 100 = city, urban, nightlife
- culture: 0 = avoiding tourist traps, off the beaten path | 100 = museums, history, art, local traditions
- adventure: 0 = comfort, luxury, relaxation | 100 = extreme sports, backpacking, roughing it
- food: 0 = not a priority | 100 = central to the experience, foodie travel
- budget: 0 = budget traveler, hostels, cheap eats | 100 = luxury, high-end hotels, fine dining
- climate: 0 = cold, mountains, northern climates | 100 = hot, tropical, beach

Archetype guide:
- "Slow Wanderer": low pace, mix of nature/city, high culture, low-medium adventure, high food, medium budget
- "City Nomad": high pace, high urban, medium culture, medium adventure, medium food, medium-high budget
- "Culture Hunter": medium pace, medium environment, very high culture, low-medium adventure, high food, medium budget
- "Backpacker Spirit": medium-high pace, nature-leaning, medium culture, very high adventure, medium food, very low budget

Respond ONLY with valid JSON in this exact shape, no markdown, no explanation:
{
  "archetype": "Slow Wanderer",
  "profile": {
    "pace": 25,
    "environment": 45,
    "culture": 80,
    "adventure": 30,
    "food": 75,
    "budget": 50,
    "climate": 60
  }
}`;

  const message = await client.messages.create({
    model: "claude-opus-4-5",
    max_tokens: 300,
    system: systemPrompt,
    messages: [{ role: "user", content: query }],
  });

  const raw = (message.content[0] as { type: string; text: string }).text.trim();

  let parsed: { archetype: string; profile: Profile };
  try {
    parsed = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
  }

  const matches = getMatches(parsed.profile);

  return NextResponse.json({
    archetype: parsed.archetype,
    profile: parsed.profile,
    matches,
  });
}
