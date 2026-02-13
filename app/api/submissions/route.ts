import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "submissions")
  : path.join(process.cwd(), ".data", "submissions");

async function ensureDir() {
  await fs.mkdir(DATA_DIR, { recursive: true });
}

// POST: save a project intake submission
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, steps, notes } = body;

    if (!slug || !steps) {
      return NextResponse.json(
        { error: "Missing slug or steps" },
        { status: 400 }
      );
    }

    await ensureDir();

    const submission = {
      slug,
      steps,
      notes: notes || "",
      submittedAt: new Date().toISOString(),
      ip: req.headers.get("x-forwarded-for") || "unknown",
      userAgent: req.headers.get("user-agent") || "unknown",
    };

    const filename = `${slug}-${Date.now()}.json`;
    await fs.writeFile(
      path.join(DATA_DIR, filename),
      JSON.stringify(submission, null, 2)
    );

    return NextResponse.json({ success: true, id: filename });
  } catch (err) {
    console.error("Submission error:", err);
    return NextResponse.json(
      { error: "Failed to save submission" },
      { status: 500 }
    );
  }
}

// GET: list all submissions (for you to review)
export async function GET() {
  try {
    await ensureDir();
    const files = await fs.readdir(DATA_DIR);
    const submissions = await Promise.all(
      files
        .filter((f) => f.endsWith(".json"))
        .sort()
        .reverse()
        .map(async (f) => {
          const content = await fs.readFile(path.join(DATA_DIR, f), "utf-8");
          return { id: f, ...JSON.parse(content) };
        })
    );
    return NextResponse.json(submissions);
  } catch {
    return NextResponse.json([]);
  }
}
