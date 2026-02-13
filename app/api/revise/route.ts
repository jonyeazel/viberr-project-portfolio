import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history, spec, brand } = body;

    if (!message) {
      return NextResponse.json({ error: "Missing message" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const messages: ChatMessage[] = [];
    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }
    messages.push({ role: "user", content: message });

    const trimmed = messages.length > 20 ? messages.slice(-20) : messages;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: `You are the revision assistant for Viberr, an AI site builder. The customer's site has been built and they're reviewing it. Help them refine it.

Context about the build:
- Brand: ${brand?.name || "Custom"} with primary color ${brand?.colors?.primary || "#4f46e5"}
- Spec summary: ${spec?.summary || "Web application"}

ALWAYS respond with valid JSON only — no markdown, no code fences, no extra text:
{"message":"Your response","applying":false,"changes":null}

Rules:
- "message": Your conversational response. 1-2 sentences. Specific and helpful.
- "applying": Set to true when you're acknowledging a change request that should trigger a visual "applying" state. Only true for actual change requests, not questions.
- "changes": null unless applying is true. When applying, provide a short array of 2-4 strings describing what's being changed (e.g., ["Updating header typography", "Adjusting color contrast", "Resizing hero image"]).
- If the customer asks a question about the site, answer it directly without applying changes.
- If the customer requests a change, acknowledge it warmly, set applying:true, and describe the changes.
- If the customer says something positive or approves, encourage them to click "Approve & launch".
- Keep responses brief and professional.`,
        messages: trimmed,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Revise API error:", response.status, errorText);
      return NextResponse.json(
        { error: "AI request failed" },
        { status: 502 }
      );
    }

    const data = await response.json();
    let raw =
      data.content?.[0]?.text ||
      '{"message":"Something went wrong.","applying":false,"changes":null}';

    // Strip markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    try {
      const parsed = JSON.parse(raw);
      return NextResponse.json({
        message: parsed.message || "I couldn't understand that.",
        applying: parsed.applying || false,
        changes: parsed.changes || null,
      });
    } catch {
      return NextResponse.json({
        message: raw,
        applying: false,
        changes: null,
      });
    }
  } catch (err) {
    console.error("Revise error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
