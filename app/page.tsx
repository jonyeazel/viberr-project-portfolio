import Link from "next/link";

const projects = [
  {
    slug: "outbound-email",
    name: "Outbound Email Automation",
    type: "Workflow Automation",
    description: "AI-assisted email drafts from CRM context with human review",
  },
  {
    slug: "collectables",
    name: "Collectables Marketplace",
    type: "Platform",
    description: "Track, buy, sell, and trade collectible assets",
  },
  {
    slug: "compliance",
    name: "Compliance Automation",
    type: "Platform",
    description: "Policy-driven redaction and audit logging for sensitive data",
  },
  {
    slug: "voucher-fulfillment",
    name: "Voucher Fulfillment",
    type: "Workflow Automation",
    description: "Digital voucher generation, invoicing, and delivery",
  },
  {
    slug: "donation-workflow",
    name: "Donation Workflow",
    type: "Workflow Automation",
    description: "Automated receipt generation and accounting for donations",
  },
  {
    slug: "time-tracking",
    name: "Time Tracking & HR",
    type: "Platform",
    description: "Employee hours import, CSV workflows, biometric tracking",
  },
  {
    slug: "lead-intelligence",
    name: "Lead Intelligence",
    type: "Platform",
    description: "Automated lead scoring and growth signal detection",
  },
  {
    slug: "mental-health",
    name: "Mental Health",
    type: "Platform",
    description: "Crisis detection, resource provisioning, and wellness tracking",
  },
  {
    slug: "billing-workflow",
    name: "Billing Workflow",
    type: "Workflow Automation",
    description: "Monthly invoicing and financial plan automation",
  },
  {
    slug: "seed-data",
    name: "Seed Data Extraction",
    type: "Platform",
    description: "User-owned behavioral data economy platform",
  },
  {
    slug: "sustainability-review",
    name: "Sustainability Review",
    type: "Workflow Automation",
    description: "Automated shop evaluation against sustainability criteria",
  },
  {
    slug: "traffic-tickets",
    name: "Traffic Ticket Processing",
    type: "Platform",
    description: "Automated ticket triage, assignment, and dispatch",
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/${project.slug}`}
            className="bg-background p-8 flex flex-col gap-4 hover:bg-surface transition-colors duration-150"
          >
            <p className="text-[11px] text-muted tracking-[0.05em] uppercase">
              {project.type}
            </p>
            <h2 className="text-[18px] font-semibold text-foreground">
              {project.name}
            </h2>
            <p className="text-[13px] text-muted leading-[1.6]">
              {project.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
