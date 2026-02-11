import Link from "next/link";
import { Github } from "lucide-react";

const REPO_BASE =
  "https://github.com/jonyeazel/viberr-project-portfolio/blob/main/app";

const projects = [
  {
    slug: "outbound-email",
    name: "Outbound Email Automation",
    type: "Workflow Automation",
    description: "AI-assisted email drafts from CRM context with human review",
    estimate: 1200,
    steps: [
      "Provide CRM access (HubSpot, Salesforce, or Pipedrive)",
      "Verify your sending domain for outbound emails",
      "List team members who will review and approve drafts",
    ],
  },
  {
    slug: "collectables",
    name: "Collectables Marketplace",
    type: "Platform",
    description: "Track, buy, sell, and trade collectible assets",
    estimate: 1400,
    steps: [
      "Create a Stripe account for payment processing",
      "Provide initial product catalog with photos",
      "Decide on commission structure and listing fees",
    ],
  },
  {
    slug: "compliance",
    name: "Compliance Automation",
    type: "Platform",
    description:
      "Policy-driven redaction and audit logging for sensitive data",
    estimate: 1350,
    steps: [
      "Document your redaction rules and data policies",
      "Provide sample sensitive documents for testing",
      "List authorized team members and their access levels",
    ],
  },
  {
    slug: "voucher-fulfillment",
    name: "Voucher Fulfillment",
    type: "Workflow Automation",
    description: "Digital voucher generation, invoicing, and delivery",
    estimate: 1100,
    steps: [
      "Create a Stripe account for invoicing",
      "Provide brand assets (logo, colors, fonts)",
      "Supply voucher template designs or approve defaults",
    ],
  },
  {
    slug: "donation-workflow",
    name: "Donation Workflow",
    type: "Workflow Automation",
    description:
      "Automated receipt generation and accounting for donations",
    estimate: 1050,
    steps: [
      "Create a Stripe account for donation processing",
      "Provide organization details for tax receipts (EIN, address)",
      "Share accounting software credentials (QuickBooks, Xero)",
    ],
  },
  {
    slug: "time-tracking",
    name: "Time Tracking & HR",
    type: "Platform",
    description: "Employee hours import, CSV workflows, biometric tracking",
    estimate: 1250,
    steps: [
      "Export current employee roster as CSV",
      "Define pay period schedule and overtime rules",
      "Provide biometric device model and connection details",
    ],
  },
  {
    slug: "lead-intelligence",
    name: "Lead Intelligence",
    type: "Platform",
    description: "Automated lead scoring and growth signal detection",
    estimate: 1300,
    steps: [
      "Provide data enrichment API keys (Clearbit, Apollo, etc.)",
      "Define your lead scoring criteria and thresholds",
      "Share CRM connection details for two-way sync",
    ],
  },
  {
    slug: "mental-health",
    name: "Mental Health",
    type: "Platform",
    description:
      "Crisis detection, resource provisioning, and wellness tracking",
    estimate: 1450,
    steps: [
      "Compile local crisis resource directory and hotline numbers",
      "Review and approve the platform privacy policy",
      "List care team members and their notification preferences",
    ],
  },
  {
    slug: "billing-workflow",
    name: "Billing Workflow",
    type: "Workflow Automation",
    description: "Monthly invoicing and financial plan automation",
    estimate: 950,
    steps: [
      "Create a Stripe account for recurring billing",
      "Provide invoice branding (logo, payment terms, late fees)",
      "Export existing client list with billing details",
    ],
  },
  {
    slug: "seed-data",
    name: "Seed Data Extraction",
    type: "Platform",
    description: "User-owned behavioral data economy platform",
    estimate: 1350,
    steps: [
      "Define your data taxonomy and categories",
      "Decide on export formats (CSV, JSON, API)",
      "Provide an initial seed dataset for onboarding",
    ],
  },
  {
    slug: "sustainability-review",
    name: "Sustainability Review",
    type: "Workflow Automation",
    description:
      "Automated shop evaluation against sustainability criteria",
    estimate: 1150,
    steps: [
      "Set evaluation criteria and scoring weights",
      "List reviewer team email addresses",
      "Decide on notification preferences and review cadence",
    ],
  },
  {
    slug: "traffic-tickets",
    name: "Traffic Ticket Processing",
    type: "Platform",
    description: "Automated ticket triage, assignment, and dispatch",
    estimate: 1400,
    steps: [
      "Export vehicle fleet registry (plates, models, assignments)",
      "Provide driver contact database",
      "Share municipality ticket feed API credentials",
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen px-6 py-16 max-w-[1200px] mx-auto">
      <header className="mb-16">
        <p className="text-[13px] text-muted tracking-[0.05em] uppercase mb-3">
          Viberr Engineering
        </p>
        <h1 className="text-[32px] font-semibold tracking-tight text-foreground">
          Project Portfolio
        </h1>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map((project) => (
          <div
            key={project.slug}
            className="border border-border hover:border-foreground/15 rounded-lg p-6 flex flex-col bg-card transition-colors duration-150"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted tracking-[0.05em] uppercase">
                {project.type}
              </p>
              <div className="text-right tabular-nums">
                <p className="text-[15px] font-semibold text-foreground">
                  ${project.estimate.toLocaleString()}
                </p>
                <p className="text-[11px] text-muted">
                  You earn ${(project.estimate / 2).toLocaleString()}
                </p>
              </div>
            </div>

            <h2 className="text-[18px] font-semibold text-foreground mt-4">
              {project.name}
            </h2>

            <p className="text-[13px] text-muted leading-[1.6] mt-2">
              {project.description}
            </p>

            <div className="flex-1 mt-4">
              <p className="text-[11px] text-muted tracking-[0.05em] uppercase mb-2">
                To go live
              </p>
              <ol className="space-y-1">
                {project.steps.map((step, i) => (
                  <li key={i} className="flex gap-2 text-[13px] leading-[1.5]">
                    <span className="text-muted/60 flex-shrink-0 tabular-nums">{i + 1}.</span>
                    <span className="text-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
              <Link
                href={`/${project.slug}`}
                className="text-[13px] font-medium text-primary hover:opacity-70 transition-opacity duration-150"
              >
                View prototype
              </Link>
              <a
                href={`${REPO_BASE}/${project.slug}/page.tsx`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors duration-150"
              >
                <Github size={14} strokeWidth={1.5} />
                GitHub
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
