import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history } = body;

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
        model: "claude-opus-4-6",
        max_tokens: 1024,
        system: `You are the intake assistant for Viberr, an AI-powered site builder. Your job is to understand what the customer wants built.

Listen to their description. If clear enough, summarize what you'd build. If vague, ask ONE clarifying question.

ALWAYS respond with valid JSON only — no markdown, no code fences, no extra text:
{"message":"Your response","points":null}

Rules:
- "message": Your conversational response. Under 2 sentences. Direct, warm, not salesy.
- "points": null until you have at least 3 clear requirements from the customer. Then an array of concise strings (3-8 words each). Max 8 points.
- Each point should be a distinct feature or capability the customer needs.
- When you populate points, your message should introduce them naturally, like "Here's what I'd build for you:"
- If the customer's input is too vague (e.g., "I need a website"), ask what their business does and what specific problems they want solved.
- Never suggest points that the customer didn't mention or imply. Only extract what they actually said.`,
        messages: trimmed,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Intake API error:", response.status, errorText);
      return NextResponse.json(
        { error: "AI request failed" },
        { status: 502 }
      );
    }

    const data = await response.json();
    let raw =
      data.content?.[0]?.text ||
      '{"message":"Something went wrong.","points":null}';

    // Strip markdown code fences if present
    raw = raw.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    try {
      const parsed = JSON.parse(raw);
      return NextResponse.json({
        message: parsed.message || "I couldn't understand that.",
        points: parsed.points || null,
      });
    } catch {
      // Try to extract JSON from the raw string
      const jsonMatch = raw.match(/\{[\s\S]*"message"\s*:\s*"[\s\S]*?\}(?:\s*$)/);
      if (jsonMatch) {
        try {
          const extracted = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            message: extracted.message || raw,
            points: extracted.points || null,
          });
        } catch { /* fall through */ }
      }
      // Strip any JSON-like content from the raw text
      const cleaned = raw.replace(/\{[^{}]*"message"[^{}]*\}/g, '').trim();
      return NextResponse.json({
        message: cleaned || raw,
        points: null,
      });
    }
  } catch (err) {
    console.error("Intake error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
