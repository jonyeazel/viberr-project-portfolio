import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data", "chat");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// POST: save a chat message
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, message } = body;

    if (!slug || !message) {
      return NextResponse.json(
        { error: "Missing slug or message" },
        { status: 400 }
      );
    }

    await ensureDir();

    const filePath = path.join(DATA_DIR, `${slug}.json`);
    let messages: Array<{ from: string; text: string; timestamp: string }> = [];

    try {
      const existing = await fs.readFile(filePath, "utf-8");
      messages = JSON.parse(existing);
    } catch {
      // File doesn't exist yet
    }

    messages.push({
      from: "user",
      text: message,
      timestamp: new Date().toISOString(),
    });

    await fs.writeFile(filePath, JSON.stringify(messages, null, 2));

    return NextResponse.json({ success: true, count: messages.length });
  } catch (err) {
    console.error("Chat error:", err);
    return NextResponse.json(
      { error: "Failed to save message" },
      { status: 500 }
    );
  }
}

// GET: retrieve chat messages for a project
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug parameter" },
        { status: 400 }
      );
    }

    await ensureDir();

    const filePath = path.join(DATA_DIR, `${slug}.json`);
    try {
      const content = await fs.readFile(filePath, "utf-8");
      return NextResponse.json(JSON.parse(content));
    } catch {
      return NextResponse.json([]);
    }
  } catch {
    return NextResponse.json([]);
  }
}
