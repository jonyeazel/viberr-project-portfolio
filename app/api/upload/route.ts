import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), ".data", "uploads");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

// POST: handle file upload — stores the file and returns metadata
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const slug = formData.get("slug") as string | null;
    const stepLabel = formData.get("stepLabel") as string | null;

    if (!file || !slug) {
      return NextResponse.json(
        { error: "Missing file or slug" },
        { status: 400 }
      );
    }

    const projectDir = path.join(UPLOAD_DIR, slug);
    await ensureDir(projectDir);

    // Create safe filename with timestamp
    const ext = path.extname(file.name) || "";
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filename = `${Date.now()}-${safeName}`;
    const filePath = path.join(projectDir, filename);

    // Write file
    const bytes = await file.arrayBuffer();
    await fs.writeFile(filePath, Buffer.from(bytes));

    // Write metadata alongside
    const meta = {
      originalName: file.name,
      storedAs: filename,
      size: file.size,
      type: file.type,
      slug,
      stepLabel: stepLabel || "unknown",
      uploadedAt: new Date().toISOString(),
    };

    await fs.writeFile(
      path.join(projectDir, `${filename}.meta.json`),
      JSON.stringify(meta, null, 2)
    );

    return NextResponse.json({
      success: true,
      fileName: file.name,
      size: file.size,
      storedAs: filename,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// GET: list uploads for a project
export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get("slug");
    if (!slug) {
      return NextResponse.json(
        { error: "Missing slug parameter" },
        { status: 400 }
      );
    }

    const projectDir = path.join(UPLOAD_DIR, slug);
    await ensureDir(projectDir);

    const files = await fs.readdir(projectDir);
    const metaFiles = files.filter((f) => f.endsWith(".meta.json"));

    const uploads = await Promise.all(
      metaFiles.map(async (f) => {
        const content = await fs.readFile(path.join(projectDir, f), "utf-8");
        return JSON.parse(content);
      })
    );

    return NextResponse.json(uploads);
  } catch {
    return NextResponse.json([]);
  }
}
