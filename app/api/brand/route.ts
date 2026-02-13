import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description, features } = body;

    if (!description) {
      return NextResponse.json({ error: "Missing description" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const featureContext = Array.isArray(features) && features.length > 0
      ? `\n\nKey features: ${features.join(", ")}`
      : "";

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: `You generate brand identity options for Viberr, an AI site builder.

Given a business description, generate 3 distinct brand directions. Each should feel different in personality but all should be professional and modern.

RESPOND WITH VALID JSON ONLY — no markdown, no code fences:
{"options":[
  {
    "name":"Direction name (2-3 words)",
    "vibe":"One sentence describing the feel",
    "colors":{
      "primary":"hex",
      "secondary":"hex",
      "accent":"hex",
      "background":"hex",
      "text":"hex"
    },
    "font":{"heading":"Font name","body":"Font name"},
    "domains":["domain1.com","domain2.com","domain3.com"]
  }
]}

Rules:
- Colors must be valid 6-digit hex codes with # prefix
- Primary color carries the brand identity
- Background should be light (near-white) or dark (near-black) — not medium gray
- Text color must have strong contrast against background
- Accent is used sparingly for interactive elements
- Font choices: use only widely available Google Fonts (Inter, DM Sans, Space Grotesk, Outfit, Sora, Manrope, Plus Jakarta Sans, Instrument Sans, Geist, etc.)
- Heading font can differ from body font but they must pair well
- Domain suggestions should be .com, realistic, brandable, and related to the business
- Keep domain names short (under 15 chars before .com)
- Each option should have a genuinely different personality: one warm/friendly, one sleek/professional, one bold/energetic — or similar contrast`,
        messages: [
          {
            role: "user",
            content: `Generate brand options for: ${description}${featureContext}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Brand API error:", response.status, errorText);
      return NextResponse.json(
        { error: "AI request failed" },
        { status: 502 }
      );
    }

    const data = await response.json();
    let raw = data.content?.[0]?.text || '{"options":[]}';

    // Strip markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    try {
      const parsed = JSON.parse(raw);
      return NextResponse.json({ options: parsed.options || [] });
    } catch {
      return NextResponse.json({ options: [] });
    }
  } catch (err) {
    console.error("Brand error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
