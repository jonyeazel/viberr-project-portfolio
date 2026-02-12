import type { Metadata } from "next";

const projectMeta: Record<
  string,
  { name: string; description: string; type: string; estimate: number }
> = {
  "outbound-email": {
    name: "Outbound Email Automation",
    description:
      "AI-assisted email drafts from CRM context with human review. CRM integration, tone matching, and approval workflows.",
    type: "Workflow",
    estimate: 1200,
  },
  collectables: {
    name: "Collectables Marketplace",
    description:
      "Track, buy, sell, and trade collectible assets. Storefronts, bidding engine, photo galleries, and Stripe payouts.",
    type: "Platform",
    estimate: 1400,
  },
  compliance: {
    name: "Compliance Automation",
    description:
      "Policy-driven redaction and audit logging for sensitive data. PII detection, role-based access, and tamper-proof trails.",
    type: "Platform",
    estimate: 1350,
  },
  "voucher-fulfillment": {
    name: "Voucher Fulfillment",
    description:
      "Digital voucher generation, invoicing, and delivery. Branded templates, Stripe payments, and redemption tracking.",
    type: "Workflow",
    estimate: 1100,
  },
  "donation-workflow": {
    name: "Donation Workflow",
    description:
      "Automated receipt generation and accounting for donations. Tax-compliant receipts, recurring donations, and accounting sync.",
    type: "Workflow",
    estimate: 1050,
  },
  "time-tracking": {
    name: "Time Tracking & HR",
    description:
      "Employee hours import, CSV workflows, and biometric tracking. Overtime calculations, manager approvals, and device integration.",
    type: "Platform",
    estimate: 1250,
  },
  "lead-intelligence": {
    name: "Lead Intelligence",
    description:
      "Automated lead scoring and growth signal detection. Data enrichment, CRM sync, and prioritization dashboards.",
    type: "Platform",
    estimate: 1300,
  },
  "mental-health": {
    name: "Mental Health",
    description:
      "Crisis detection, resource provisioning, and wellness tracking. Privacy-first architecture with care team notifications.",
    type: "Platform",
    estimate: 1450,
  },
  "billing-workflow": {
    name: "Billing Workflow",
    description:
      "Monthly invoicing and financial plan automation. Recurring invoices, late payment reminders, and client billing portal.",
    type: "Workflow",
    estimate: 950,
  },
  "seed-data": {
    name: "Seed Data Extraction",
    description:
      "User-owned behavioral data economy platform. Data taxonomy builder, multi-format exports, and marketplace storefront.",
    type: "Platform",
    estimate: 1350,
  },
  "sustainability-review": {
    name: "Sustainability Review",
    description:
      "Automated shop evaluation against sustainability criteria. Weighted scoring, reviewer routing, and report generation.",
    type: "Workflow",
    estimate: 1150,
  },
  "traffic-tickets": {
    name: "Traffic Ticket Processing",
    description:
      "Automated ticket triage, assignment, and dispatch. Municipality feed ingestion, driver matching, and fleet compliance.",
    type: "Platform",
    estimate: 1400,
  },
};

export function getProjectMetadata(slug: string): Metadata {
  const project = projectMeta[slug];
  if (!project) {
    return { title: "Project Not Found" };
  }

  return {
    title: project.name,
    description: project.description,
    openGraph: {
      title: `${project.name} | Viberr`,
      description: project.description,
      url: `https://swift-bear-260.vercel.app/${slug}`,
      type: "article",
    },
    twitter: {
      card: "summary",
      title: `${project.name} | Viberr`,
      description: project.description,
    },
  };
}
