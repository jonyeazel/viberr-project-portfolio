import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data", "chat");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, message, projectName } = body;

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

    // Load conversation history
    await ensureDir();
    const filePath = path.join(DATA_DIR, `${slug}-ai.json`);
    let history: ChatMessage[] = [];

    try {
      const existing = await fs.readFile(filePath, "utf-8");
      history = JSON.parse(existing);
    } catch {
      // No history yet
    }

    // Add user message
    history.push({ role: "user", content: message });

    // Call Claude Opus 4.6
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
        messages: history,
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

    // Add assistant response to history
    history.push({ role: "assistant", content: assistantMessage });

    // Persist conversation
    await fs.writeFile(filePath, JSON.stringify(history, null, 2));

    return NextResponse.json({
      response: assistantMessage,
      messageCount: history.length,
    });
  } catch (err) {
    console.error("AI chat error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
