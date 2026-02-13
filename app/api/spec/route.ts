import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { description, features, brand, total } = body;

    if (!description || !features?.length || !brand) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const featureBlock = features
      .map((f: { feature: string; tasks: Array<{ name: string; description: string; price: number }> }) => {
        const taskLines = f.tasks.map((t) => `  - ${t.name}: ${t.description} ($${t.price})`).join("\n");
        return `${f.feature}:\n${taskLines}`;
      })
      .join("\n\n");

    const brandBlock = `Brand: ${brand.name}
Colors: primary ${brand.colors.primary}, secondary ${brand.colors.secondary}, accent ${brand.colors.accent}, bg ${brand.colors.background}, text ${brand.colors.text}
Typography: ${brand.font.heading} (headings), ${brand.font.body} (body)
Domain: ${brand.domain || brand.domains?.[0] || "TBD"}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 3000,
        system: `You write build specifications for Viberr, an AI site builder. Given a customer's requirements, selected features with pricing, and brand choices, produce a clear, structured spec document.

RESPOND WITH VALID JSON ONLY — no markdown, no code fences:
{"spec":{"summary":"2-3 sentence project overview","sections":[{"title":"Section title","items":["Specific deliverable or requirement"]}],"tech":["Technology or framework"],"timeline":"Estimated timeline","notes":"Any important notes or assumptions"}}

Rules:
- Summary should be concise and describe the end product
- Sections should group related deliverables logically (not just repeat the feature list — synthesize them into coherent functional areas)
- Each item should be specific enough to build from, written as a requirement (e.g., "Calendar view showing 7-day grid with available time slots highlighted")
- Tech stack should be realistic for a modern web app (Next.js, Tailwind, Stripe, etc.)
- Timeline should reflect the scope honestly (days, not weeks for most projects)
- Notes should flag any ambiguities or assumptions made
- Keep section count between 3-6
- Keep items per section between 2-5`,
        messages: [
          {
            role: "user",
            content: `Write a build spec for this project:

Customer description: ${description}

Features and tasks:
${featureBlock}

${brandBlock}

Total budget: $${total}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Spec API error:", response.status, errorText);
      return NextResponse.json({ error: "AI request failed" }, { status: 502 });
    }

    const data = await response.json();
    let raw = data.content?.[0]?.text || '{"spec":{}}';

    // Strip markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    try {
      const parsed = JSON.parse(raw);
      return NextResponse.json({ spec: parsed.spec || {} });
    } catch {
      return NextResponse.json({ spec: {} });
    }
  } catch (err) {
    console.error("Spec error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
