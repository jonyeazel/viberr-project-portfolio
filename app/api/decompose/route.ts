import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { features } = body;

    if (!features || !Array.isArray(features) || features.length === 0) {
      return NextResponse.json({ error: "Missing features" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const featureList = features.map((f: string, i: number) => `${i + 1}. ${f}`).join("\n");

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
        system: `You decompose software features into priced implementation line items for Viberr, an AI site builder.

Given a list of features the customer wants, break each one into 2-4 concrete implementation tasks. Price each task realistically (USD).

Pricing guidelines:
- Simple UI component or page: $80-150
- Form with validation: $100-200
- API integration: $150-300
- Database schema + CRUD: $120-250
- Authentication/auth flow: $200-350
- Payment integration: $250-400
- Real-time features: $200-350
- Dashboard/analytics: $150-300
- Email/notification system: $100-200
- File upload/processing: $100-200

RESPOND WITH VALID JSON ONLY — no markdown, no code fences:
{"items":[{"feature":"Original feature name","tasks":[{"name":"Task name","description":"One sentence what this involves","price":150}]}]}

Rules:
- Keep task names under 6 words
- Keep descriptions under 15 words
- Price realistically — don't inflate or deflate
- Total should feel fair for a solo developer building this in days, not weeks
- Include infrastructure tasks only if genuinely needed (hosting, domain, SSL are free/included)`,
        messages: [
          {
            role: "user",
            content: `Decompose these features into priced tasks:\n\n${featureList}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Decompose API error:", response.status, errorText);
      return NextResponse.json(
        { error: "AI request failed" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const raw =
      data.content?.[0]?.text || '{"items":[]}';

    try {
      const parsed = JSON.parse(raw);
      return NextResponse.json({ items: parsed.items || [] });
    } catch {
      return NextResponse.json({ items: [] });
    }
  } catch (err) {
    console.error("Decompose error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
