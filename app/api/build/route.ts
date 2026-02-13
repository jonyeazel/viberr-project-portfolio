import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spec, brand, features, total } = body;

    if (!spec || !brand) {
      return new Response(JSON.stringify({ error: "Missing data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Build steps from spec sections + standard infra steps
    const sectionNames = spec.sections?.map((s: { title: string }) => s.title) || [];
    const techList = spec.tech?.join(", ") || "Next.js, Tailwind CSS";

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
        system: `You generate realistic build step sequences for Viberr, an AI site builder. Given a project spec, produce a sequence of build steps that represent what actually happens when building this site.

RESPOND WITH VALID JSON ONLY:
{"steps":[{"id":"step-1","label":"Short label (3-5 words)","detail":"One sentence describing what's being generated","duration":2000}]}

Rules:
- Generate 8-14 steps that feel like a real build process
- Start with scaffolding/setup steps, then core features, then styling/polish
- Duration is in milliseconds (1500-4000ms per step, faster for simple steps)
- Labels should be concise action phrases: "Scaffolding project", "Building product catalog", "Connecting Stripe", etc.
- Details should describe the specific thing being generated
- Order matters — dependencies should come first (DB schema before CRUD, layout before components)
- Include at least one step for: project setup, database, core feature, styling/brand, and deployment prep
- The last step should always be deployment-related
- Total duration across all steps should be 25-40 seconds`,
        messages: [
          {
            role: "user",
            content: `Generate build steps for:
Sections: ${sectionNames.join(", ")}
Tech: ${techList}
Brand: ${brand.name} (${brand.colors?.primary || "#4f46e5"})
Domain: ${brand.domain || "TBD"}
Budget: $${total || 0}
Summary: ${spec.summary || "Web application"}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Build API error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI request failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let raw = data.content?.[0]?.text || '{"steps":[]}';

    // Strip markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    try {
      const parsed = JSON.parse(raw);
      return new Response(JSON.stringify({ steps: parsed.steps || [] }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      console.error("Build parse error, raw:", raw.substring(0, 200));
      return new Response(JSON.stringify({ steps: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (err) {
    console.error("Build error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
