import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, boolean> = {
    server: true,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    resend: !!process.env.RESEND_API_KEY,
  };

  const allGood = checks.anthropic && checks.openai;

  return NextResponse.json({
    status: allGood ? "ready" : "missing_keys",
    checks,
  });
}
