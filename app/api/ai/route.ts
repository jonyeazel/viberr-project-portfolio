import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

// Simple in-memory rate limiter (resets on cold start, good enough for demo protection)
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20; // requests per window
const RATE_WINDOW = 60_000; // 1 minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limit by IP
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in a minute." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { slug, message, projectName, history: clientHistory } = body;

    if (!slug || !message) {
      return NextResponse.json(
        { error: "Missing slug or message" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    // Build message history from client-provided context
    const messages: ChatMessage[] = [];
    if (Array.isArray(clientHistory)) {
      for (const msg of clientHistory) {
        if (msg.role && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }
    messages.push({ role: "user", content: message });

    // Cap history to last 20 messages to control token usage
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
        system: `You are the AI assistant for Viberr, a self-serve SaaS platform. You help customers customize and finish building their projects. The customer is currently viewing "${projectName || slug}". 

Be concise, direct, and helpful. Keep responses under 3 sentences unless the customer asks for detail. You know the project inside and out — answer questions about features, suggest improvements, and help them get to launch. Never be generic. Always reference the specific project context.

If they ask to modify something, describe exactly what would change. If they ask about status, give a clear answer. If they have a question about a feature, explain it in plain language.`,
        messages: trimmed,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return NextResponse.json(
        { error: "AI request failed" },
        { status: 502 }
      );
    }

    const data = await response.json();
    const assistantMessage =
      data.content?.[0]?.text || "I couldn't generate a response.";

    return NextResponse.json({
      response: assistantMessage,
    });
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
