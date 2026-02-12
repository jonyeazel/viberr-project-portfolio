import { NextRequest, NextResponse } from "next/server";

// POST: send notification when a project is submitted
// Ready for Resend, SendGrid, or any email API — just add NOTIFY_EMAIL + RESEND_API_KEY env vars
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { slug, projectName, completedSteps, notes } = body;

    if (!slug || !projectName) {
      return NextResponse.json(
        { error: "Missing slug or projectName" },
        { status: 400 }
      );
    }

    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL;

    // If Resend is configured, send a real email
    if (resendKey && notifyEmail) {
      const stepsText = completedSteps
        ?.map(
          (s: { label: string; value?: string; fileName?: string; choice?: string }) =>
            `- ${s.label}: ${s.value || s.fileName || s.choice || "Done"}`
        )
        .join("\n");

      const emailBody = `New submission for ${projectName} (${slug})

Steps completed:
${stepsText || "None"}

${notes ? `Notes: ${notes}` : "No additional notes."}

Submitted at: ${new Date().toISOString()}`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: "Viberr <notifications@viberr.dev>",
          to: [notifyEmail],
          subject: `[Viberr] ${projectName} — Go Live Submission`,
          text: emailBody,
        }),
      });

      return NextResponse.json({ success: true, method: "email" });
    }

    // Fallback: log to console (you'll see this in Vercel logs)
    console.log(
      `[SUBMISSION] ${projectName} (${slug}) — ${completedSteps?.length || 0} steps completed. Notes: ${notes || "none"}`
    );

    return NextResponse.json({ success: true, method: "log" });
  } catch (err) {
    console.error("Notification error:", err);
    return NextResponse.json(
      { error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
