import Link from "next/link";

const REPO_BASE =
  "https://github.com/jonyeazel/viberr-project-portfolio/blob/main/app";

const projects = [
  {
    slug: "outbound-email",
    name: "Outbound Email Automation",
    type: "Workflow Automation",
    description: "AI-assisted email drafts from CRM context with human review",
    estimate: 1200,
  },
  {
    slug: "collectables",
    name: "Collectables Marketplace",
    type: "Platform",
    description: "Track, buy, sell, and trade collectible assets",
    estimate: 1400,
  },
  {
    slug: "compliance",
    name: "Compliance Automation",
    type: "Platform",
    description:
      "Policy-driven redaction and audit logging for sensitive data",
    estimate: 1350,
  },
  {
    slug: "voucher-fulfillment",
    name: "Voucher Fulfillment",
    type: "Workflow Automation",
    description: "Digital voucher generation, invoicing, and delivery",
    estimate: 1100,
  },
  {
    slug: "donation-workflow",
    name: "Donation Workflow",
    type: "Workflow Automation",
    description:
      "Automated receipt generation and accounting for donations",
    estimate: 1050,
  },
  {
    slug: "time-tracking",
    name: "Time Tracking & HR",
    type: "Platform",
    description: "Employee hours import, CSV workflows, biometric tracking",
    estimate: 1250,
  },
  {
    slug: "lead-intelligence",
    name: "Lead Intelligence",
    type: "Platform",
    description: "Automated lead scoring and growth signal detection",
    estimate: 1300,
  },
  {
    slug: "mental-health",
    name: "Mental Health",
    type: "Platform",
    description:
      "Crisis detection, resource provisioning, and wellness tracking",
    estimate: 1450,
  },
  {
    slug: "billing-workflow",
    name: "Billing Workflow",
    type: "Workflow Automation",
    description: "Monthly invoicing and financial plan automation",
    estimate: 950,
  },
  {
    slug: "seed-data",
    name: "Seed Data Extraction",
    type: "Platform",
    description: "User-owned behavioral data economy platform",
    estimate: 1350,
  },
  {
    slug: "sustainability-review",
    name: "Sustainability Review",
    type: "Workflow Automation",
    description:
      "Automated shop evaluation against sustainability criteria",
    estimate: 1150,
  },
  {
    slug: "traffic-tickets",
    name: "Traffic Ticket Processing",
    type: "Platform",
    description: "Automated ticket triage, assignment, and dispatch",
    estimate: 1400,
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((project) => (
          <div
            key={project.slug}
            className="border border-border rounded-lg p-6 flex flex-col gap-4 bg-card"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted tracking-[0.05em] uppercase">
                {project.type}
              </p>
              <p className="text-[13px] font-semibold text-foreground tabular-nums">
                ${project.estimate.toLocaleString()}
              </p>
            </div>

            <h2 className="text-[18px] font-semibold text-foreground">
              {project.name}
            </h2>

            <p className="text-[13px] text-muted leading-[1.6] flex-1">
              {project.description}
            </p>

            <div className="flex items-center gap-3 pt-2 border-t border-border">
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
                className="text-[13px] text-muted hover:text-foreground transition-colors duration-150"
              >
                Source
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
