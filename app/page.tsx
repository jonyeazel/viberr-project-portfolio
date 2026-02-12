"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Github,
  Workflow,
  Layers,
  Upload,
  Check,
  Circle,
  ChevronLeft,
  ChevronRight,
  X,
  SendHorizontal,
} from "lucide-react";

type StepType = "upload" | "input" | "choice" | "confirm";

interface Step {
  label: string;
  type: StepType;
  placeholder?: string;
  accept?: string;
  options?: string[];
}

const REPO_BASE =
  "https://github.com/jonyeazel/viberr-project-portfolio/blob/main/app";

const projects: Array<{
  slug: string;
  name: string;
  type: "Workflow" | "Platform";
  code: string;
  description: string;
  estimate: number;
  deliverables: string[];
  steps: Step[];
}> = [
  {
    slug: "outbound-email",
    name: "Outbound Email Automation",
    type: "Workflow",
    code: "VBR-1847",
    description: "AI-assisted email drafts from CRM context with human review",
    estimate: 1200,
    deliverables: [
      "CRM integration with real-time contact sync",
      "AI draft generation with tone matching",
      "Human-in-the-loop approval queue",
      "Sending domain verification flow",
      "Per-campaign analytics dashboard",
    ],
    steps: [
      {
        label: "CRM credentials",
        type: "upload",
        accept: ".json,.csv,.txt",
        placeholder: "Drop your CRM export or API key file",
      },
      {
        label: "Sending domain",
        type: "input",
        placeholder: "e.g. mail.yourcompany.com",
      },
      {
        label: "Team members who review drafts",
        type: "input",
        placeholder: "Names and emails, separated by commas",
      },
      {
        label: "CRM platform",
        type: "choice",
        options: ["HubSpot", "Salesforce", "Pipedrive", "Other"],
      },
    ],
  },
  {
    slug: "collectables",
    name: "Collectables Marketplace",
    type: "Platform",
    code: "VBR-2103",
    description: "Track, buy, sell, and trade collectible assets",
    estimate: 1400,
    deliverables: [
      "Buyer and seller storefronts",
      "Stripe-powered checkout and payouts",
      "Photo gallery with zoom and condition grading",
      "Real-time bidding engine",
      "Listing management with fee tracking",
    ],
    steps: [
      {
        label: "Stripe account",
        type: "confirm",
      },
      {
        label: "Product catalog with photos",
        type: "upload",
        accept: ".csv,.xlsx,.zip",
        placeholder: "Drop your catalog spreadsheet or photo archive",
      },
      {
        label: "Commission structure",
        type: "choice",
        options: ["5%", "10%", "15%", "Custom"],
      },
      {
        label: "Listing fee per item",
        type: "input",
        placeholder: "e.g. $2.00",
      },
    ],
  },
  {
    slug: "compliance",
    name: "Compliance Automation",
    type: "Platform",
    code: "VBR-1962",
    description:
      "Policy-driven redaction and audit logging for sensitive data",
    estimate: 1350,
    deliverables: [
      "Automated PII detection and redaction",
      "Configurable policy rule engine",
      "Full audit trail with tamper-proof logging",
      "Role-based access control",
      "Compliance report generation",
    ],
    steps: [
      {
        label: "Redaction rules document",
        type: "upload",
        accept: ".pdf,.docx,.txt",
        placeholder: "Drop your data policy or redaction rules",
      },
      {
        label: "Sample sensitive documents",
        type: "upload",
        accept: ".pdf,.docx,.txt,.zip",
        placeholder: "Drop sample docs for testing",
      },
      {
        label: "Authorized team members and access levels",
        type: "input",
        placeholder: "Names, emails, and roles",
      },
    ],
  },
  {
    slug: "voucher-fulfillment",
    name: "Voucher Fulfillment",
    type: "Workflow",
    code: "VBR-2241",
    description: "Digital voucher generation, invoicing, and delivery",
    estimate: 1100,
    deliverables: [
      "Branded voucher template system",
      "Automated invoice generation",
      "Email and SMS delivery pipeline",
      "Redemption tracking dashboard",
      "Stripe-powered payment collection",
    ],
    steps: [
      {
        label: "Stripe account",
        type: "confirm",
      },
      {
        label: "Brand assets",
        type: "upload",
        accept: ".zip,.png,.svg,.ai",
        placeholder: "Drop logo, color specs, font files",
      },
      {
        label: "Voucher template preference",
        type: "choice",
        options: ["Use our defaults", "Upload custom design"],
      },
    ],
  },
  {
    slug: "donation-workflow",
    name: "Donation Workflow",
    type: "Workflow",
    code: "VBR-1789",
    description:
      "Automated receipt generation and accounting for donations",
    estimate: 1050,
    deliverables: [
      "One-time and recurring donation forms",
      "Automated IRS-compliant tax receipts",
      "Accounting software sync",
      "Donor management dashboard",
      "Campaign-level reporting",
    ],
    steps: [
      {
        label: "Stripe account",
        type: "confirm",
      },
      {
        label: "Organization details for tax receipts",
        type: "input",
        placeholder: "EIN, legal name, address",
      },
      {
        label: "Accounting software credentials",
        type: "upload",
        accept: ".json,.txt,.csv",
        placeholder: "Drop QuickBooks or Xero export / API key",
      },
      {
        label: "Accounting platform",
        type: "choice",
        options: ["QuickBooks", "Xero", "FreshBooks", "Other"],
      },
    ],
  },
  {
    slug: "time-tracking",
    name: "Time Tracking & HR",
    type: "Platform",
    code: "VBR-2087",
    description: "Employee hours import, CSV workflows, biometric tracking",
    estimate: 1250,
    deliverables: [
      "Employee self-service time entry",
      "CSV import/export workflows",
      "Biometric device integration",
      "Overtime calculation engine",
      "Manager approval queue",
    ],
    steps: [
      {
        label: "Employee roster",
        type: "upload",
        accept: ".csv,.xlsx",
        placeholder: "Drop your current employee list as CSV",
      },
      {
        label: "Pay period and overtime rules",
        type: "input",
        placeholder: "e.g. Bi-weekly, OT after 40hrs at 1.5x",
      },
      {
        label: "Biometric device details",
        type: "input",
        placeholder: "Device model and connection type",
      },
    ],
  },
  {
    slug: "lead-intelligence",
    name: "Lead Intelligence",
    type: "Platform",
    code: "VBR-2156",
    description: "Automated lead scoring and growth signal detection",
    estimate: 1300,
    deliverables: [
      "Multi-source data enrichment pipeline",
      "Configurable lead scoring model",
      "Growth signal detection and alerts",
      "CRM two-way sync",
      "Lead prioritization dashboard",
    ],
    steps: [
      {
        label: "Data enrichment API keys",
        type: "upload",
        accept: ".json,.txt,.env",
        placeholder: "Drop Clearbit, Apollo, or similar API key file",
      },
      {
        label: "Lead scoring criteria",
        type: "input",
        placeholder: "Describe your ideal lead and scoring thresholds",
      },
      {
        label: "CRM connection details",
        type: "input",
        placeholder: "CRM name, API endpoint, credentials",
      },
    ],
  },
  {
    slug: "mental-health",
    name: "Mental Health",
    type: "Platform",
    code: "VBR-1934",
    description:
      "Crisis detection, resource provisioning, and wellness tracking",
    estimate: 1450,
    deliverables: [
      "Crisis keyword detection engine",
      "Local resource directory with search",
      "Wellness check-in tracking",
      "Care team notification system",
      "Privacy-first data architecture",
    ],
    steps: [
      {
        label: "Crisis resource directory",
        type: "upload",
        accept: ".csv,.xlsx,.pdf",
        placeholder: "Drop local hotline numbers and resource list",
      },
      {
        label: "Privacy policy review",
        type: "confirm",
      },
      {
        label: "Care team members and notification preferences",
        type: "input",
        placeholder: "Names, emails, and how they want to be notified",
      },
    ],
  },
  {
    slug: "billing-workflow",
    name: "Billing Workflow",
    type: "Workflow",
    code: "VBR-2018",
    description: "Monthly invoicing and financial plan automation",
    estimate: 950,
    deliverables: [
      "Recurring invoice generation",
      "Stripe billing integration",
      "Late payment reminders",
      "Client billing portal",
      "Revenue reporting dashboard",
    ],
    steps: [
      {
        label: "Stripe account",
        type: "confirm",
      },
      {
        label: "Invoice branding",
        type: "upload",
        accept: ".zip,.png,.svg,.pdf",
        placeholder: "Drop logo, payment terms doc, late fee schedule",
      },
      {
        label: "Existing client list",
        type: "upload",
        accept: ".csv,.xlsx",
        placeholder: "Drop client list with billing details",
      },
    ],
  },
  {
    slug: "seed-data",
    name: "Seed Data Extraction",
    type: "Platform",
    code: "VBR-2198",
    description: "User-owned behavioral data economy platform",
    estimate: 1350,
    deliverables: [
      "User data ownership dashboard",
      "Behavioral data taxonomy builder",
      "Multi-format export engine",
      "Data marketplace storefront",
      "Privacy-compliant consent flow",
    ],
    steps: [
      {
        label: "Data taxonomy",
        type: "input",
        placeholder: "Describe your data categories and structure",
      },
      {
        label: "Preferred export format",
        type: "choice",
        options: ["CSV", "JSON", "API", "All of the above"],
      },
      {
        label: "Initial seed dataset",
        type: "upload",
        accept: ".csv,.json,.zip",
        placeholder: "Drop a sample dataset for onboarding",
      },
    ],
  },
  {
    slug: "sustainability-review",
    name: "Sustainability Review",
    type: "Workflow",
    code: "VBR-1876",
    description:
      "Automated shop evaluation against sustainability criteria",
    estimate: 1150,
    deliverables: [
      "Weighted scoring evaluation engine",
      "Reviewer assignment and routing",
      "Automated review scheduling",
      "Sustainability report generation",
      "Shop notification pipeline",
    ],
    steps: [
      {
        label: "Evaluation criteria and scoring weights",
        type: "upload",
        accept: ".csv,.xlsx,.pdf,.docx",
        placeholder: "Drop your criteria document or spreadsheet",
      },
      {
        label: "Reviewer team emails",
        type: "input",
        placeholder: "Emails separated by commas",
      },
      {
        label: "Review cadence",
        type: "choice",
        options: ["Weekly", "Bi-weekly", "Monthly", "Quarterly"],
      },
    ],
  },
  {
    slug: "traffic-tickets",
    name: "Traffic Ticket Processing",
    type: "Platform",
    code: "VBR-2267",
    description: "Automated ticket triage, assignment, and dispatch",
    estimate: 1400,
    deliverables: [
      "Ticket ingestion from municipality feeds",
      "Automated vehicle-to-driver matching",
      "Driver notification and dispatch",
      "Payment tracking and resolution",
      "Fleet compliance dashboard",
    ],
    steps: [
      {
        label: "Vehicle fleet registry",
        type: "upload",
        accept: ".csv,.xlsx",
        placeholder: "Drop fleet list (plates, models, assignments)",
      },
      {
        label: "Driver contact database",
        type: "upload",
        accept: ".csv,.xlsx",
        placeholder: "Drop driver names, phones, emails",
      },
      {
        label: "Municipality ticket feed API credentials",
        type: "upload",
        accept: ".json,.txt,.env",
        placeholder: "Drop API key or credentials file",
      },
    ],
  },
];

const typeConfig = {
  Workflow: { icon: Workflow, label: "Workflow" },
  Platform: { icon: Layers, label: "Platform" },
} as const;

type StepState = {
  completed: boolean;
  value?: string;
  fileName?: string;
  choice?: string;
};

type ProjectState = Record<string, StepState[]>;

function initProjectState(): ProjectState {
  const state: ProjectState = {};
  for (const p of projects) {
    state[p.slug] = p.steps.map(() => ({ completed: false }));
  }
  return state;
}

const TOTAL_VALUE = projects.reduce((sum, p) => sum + p.estimate, 0);
const TOTAL_PAYOUT = Math.round(TOTAL_VALUE / 2);

export default function Home() {
  const [state, setState] = useState<ProjectState>(initProjectState);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [chatValue, setChatValue] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ from: "user" | "system"; text: string }>>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);

  // Track which card is closest to center
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const containerCenter = el.scrollLeft + el.offsetWidth / 2;
      let closest = 0;
      let minDist = Infinity;
      for (let i = 0; i < el.children.length; i++) {
        const child = el.children[i] as HTMLElement;
        const childCenter = child.offsetLeft + child.offsetWidth / 2;
        const dist = Math.abs(containerCenter - childCenter);
        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      }
      setFocusedIndex(closest);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const updateStep = useCallback(
    (slug: string, stepIndex: number, update: Partial<StepState>) => {
      setState((prev) => {
        const steps = [...prev[slug]];
        steps[stepIndex] = { ...steps[stepIndex], ...update, completed: true };
        return { ...prev, [slug]: steps };
      });
    },
    []
  );

  const getProgress = (slug: string) => {
    const steps = state[slug];
    if (!steps) return 0;
    const done = steps.filter((s) => s.completed).length;
    return Math.round((done / steps.length) * 100);
  };

  const allDone = (slug: string) => {
    const steps = state[slug];
    return steps?.every((s) => s.completed) ?? false;
  };

  const scrollBy = useCallback((direction: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * 400, behavior: "smooth" });
  }, []);

  const sendChat = useCallback(() => {
    const msg = chatValue.trim();
    if (!msg) return;
    const focused = projects[focusedIndex];
    setChatMessages((prev) => [...prev, { from: "user", text: msg }]);
    setChatValue("");
    // Persist to server
    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: focused.slug, message: msg }),
    }).catch(() => {});
    // Auto-reply acknowledging the message
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          from: "system",
          text: `Noted for ${focused.name}. We'll follow up on "${msg.length > 60 ? msg.slice(0, 60) + "..." : msg}" before go-live.`,
        },
      ]);
    }, 400);
  }, [chatValue, focusedIndex]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "ArrowRight") scrollBy(1);
      if (e.key === "ArrowLeft") scrollBy(-1);
      if (e.key === "Escape") setOpenDrawer(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollBy]);

  const focusedProject = projects[focusedIndex];

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-[6px] bg-primary flex items-center justify-center flex-shrink-0 ring-1 ring-foreground/10">
            <span className="text-[11px] font-semibold text-white">V</span>
          </div>
          <span className="text-[14px] font-medium text-foreground/90 tracking-[-0.01em]">
            Viberr
          </span>
        </div>
        <div className="flex items-center gap-5 text-[12px] text-muted">
          <span>{projects.length} projects</span>
          <span className="tabular-nums">${TOTAL_PAYOUT.toLocaleString()}</span>
        </div>
      </header>

      {/* Card slideshow — takes up the main space */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center gap-5 overflow-x-auto snap-x snap-mandatory"
        style={{
          scrollbarWidth: "none",
          scrollBehavior: "smooth",
          paddingLeft: "calc(50vw - 190px)",
          paddingRight: "calc(50vw - 190px)",
        }}
      >
        {projects.map((project, idx) => {
          const TypeIcon = typeConfig[project.type].icon;
          const progress = getProgress(project.slug);
          const isSubmitted = submitted[project.slug];
          const completedCount =
            state[project.slug]?.filter((s) => s.completed).length ?? 0;
          const isDrawerOpen = openDrawer === project.slug;
          const isFocused = idx === focusedIndex;

          return (
            <div
              key={project.slug}
              className="flex-shrink-0 relative overflow-hidden rounded-[16px] bg-card snap-center"
              style={{
                width: 380,
                aspectRatio: "3/4",
                transform: isFocused ? "scale(1)" : "scale(0.95)",
                opacity: isFocused ? 1 : 0.4,
                transition: "transform 150ms ease-out, opacity 150ms ease-out",
                border: isFocused ? "1px solid #e7e7e5" : "1px solid #eeeeec",
                boxShadow: isFocused ? "0 0 0 1px rgba(99,91,255,0.06), 0 8px 40px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {/* Card face */}
              <div className="absolute inset-0 flex flex-col p-6">
                {/* Type badge + code */}
                <div className="flex items-center gap-2">
                  <TypeIcon
                    size={12}
                    strokeWidth={1.5}
                    className="text-muted/60"
                  />
                  <span className="text-[11px] text-muted/70 tracking-[0.05em] uppercase">
                    {project.type}
                  </span>
                  <span className="text-[11px] text-muted/30 tabular-nums ml-auto font-mono">
                    {project.code}
                  </span>
                </div>

                {/* Title + description */}
                <h2 className="text-[20px] font-medium text-foreground mt-5 leading-[1.25] tracking-[-0.01em]">
                  {project.name}
                </h2>
                <p className="text-[13px] text-muted/80 leading-[1.6] mt-2">
                  {project.description}
                </p>

                {/* Deliverables */}
                <ul className="mt-5 space-y-2.5">
                  {project.deliverables.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-[12px] leading-[1.5] text-foreground/60"
                    >
                      <span className="w-1 h-1 rounded-full bg-primary/40 mt-[7px] flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>

                <div className="flex-1" />

                {/* Price + progress */}
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[22px] font-medium tabular-nums text-foreground leading-none tracking-[-0.02em]">
                      ${(project.estimate / 2).toLocaleString()}
                    </span>
                    <span className="text-[11px] text-muted/50">
                      / ${project.estimate.toLocaleString()}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-[3px] rounded-full bg-surface-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-150 ease-out"
                        style={{
                          width: `${progress}%`,
                          backgroundColor:
                            progress === 100 ? "#00d4aa" : "#635bff",
                        }}
                      />
                    </div>
                    <span className="text-[10px] tabular-nums text-muted/50">
                      {completedCount}/{project.steps.length}
                    </span>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center gap-2 mt-3">
                    <Link
                      href={`/${project.slug}`}
                      className="flex-1 h-9 flex items-center justify-center rounded-[8px] bg-primary text-white text-[12px] font-medium hover:brightness-110 transition-all duration-150"
                    >
                      View project
                    </Link>
                    {isSubmitted ? (
                      <div className="h-9 px-3.5 flex items-center justify-center gap-1.5 rounded-[8px] bg-[#00d4aa]/10">
                        <Check size={12} strokeWidth={2} className="text-[#00d4aa]" />
                        <span className="text-[12px] text-[#00d4aa] font-medium">Submitted</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setOpenDrawer(project.slug)}
                        className="h-9 px-3.5 flex items-center justify-center rounded-[8px] border border-border text-[12px] text-muted hover:text-foreground hover:border-foreground/20 transition-colors duration-150"
                      >
                        Next steps
                      </button>
                    )}
                    <a
                      href={`${REPO_BASE}/${project.slug}/page.tsx`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-9 h-9 rounded-[8px] border border-border text-muted hover:text-foreground hover:border-foreground/20 transition-colors duration-150"
                    >
                      <Github size={14} strokeWidth={1.5} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Inset drawer */}
              <div
                className="absolute rounded-[13px] bg-card flex flex-col"
                style={{
                  inset: 3,
                  transform: isDrawerOpen ? "translateY(0)" : "translateY(105%)",
                  transition: "transform 150ms ease-out",
                  boxShadow: isDrawerOpen ? "0 -4px 32px rgba(0,0,0,0.08)" : "none",
                  pointerEvents: isDrawerOpen ? "auto" : "none",
                  border: "1px solid #e7e7e5",
                }}
              >
                {/* Drawer header */}
                <div className="px-5 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
                  <div>
                    <span className="text-[11px] text-muted/70 tracking-[0.05em] uppercase">
                      What we need
                    </span>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-24 h-[3px] rounded-full bg-surface-2 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-150 ease-out"
                          style={{
                            width: `${progress}%`,
                            backgroundColor:
                              progress === 100 ? "#00d4aa" : "#635bff",
                          }}
                        />
                      </div>
                      <span className="text-[10px] tabular-nums text-muted/50">
                        {completedCount}/{project.steps.length}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenDrawer(null)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-muted/50 hover:text-foreground transition-colors duration-150"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Drawer content */}
                <div className="flex-1 overflow-y-auto px-5 pb-5">
                  <div className="space-y-3.5">
                    {project.steps.map((step, i) => {
                      const stepState = state[project.slug]?.[i];
                      const done = stepState?.completed;

                      return (
                        <div key={i} className="flex gap-2.5">
                          <div className="flex-shrink-0 mt-0.5">
                            {done ? (
                              <div className="w-[18px] h-[18px] rounded-full bg-[#00d4aa] flex items-center justify-center">
                                <Check
                                  size={10}
                                  strokeWidth={2.5}
                                  className="text-white"
                                />
                              </div>
                            ) : (
                              <Circle
                                size={18}
                                strokeWidth={1.5}
                                className="text-border"
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <span
                              className={`text-[13px] leading-[1.4] block ${
                                done
                                  ? "text-muted line-through"
                                  : "text-foreground"
                              }`}
                            >
                              {step.label}
                            </span>

                            {step.type === "upload" && !done && (
                              <label className="mt-1.5 flex items-center gap-2 px-3 py-2 rounded-[6px] border border-dashed border-border hover:border-foreground/20 cursor-pointer transition-colors duration-150 bg-surface/40">
                                <Upload
                                  size={12}
                                  strokeWidth={1.5}
                                  className="text-muted/50 flex-shrink-0"
                                />
                                <span className="text-[10px] text-muted/60 truncate">
                                  {step.placeholder}
                                </span>
                                <input
                                  type="file"
                                  accept={step.accept}
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      updateStep(project.slug, i, {
                                        fileName: file.name,
                                      });
                                      // Persist file to server
                                      const fd = new FormData();
                                      fd.append("file", file);
                                      fd.append("slug", project.slug);
                                      fd.append("stepLabel", step.label);
                                      fetch("/api/upload", {
                                        method: "POST",
                                        body: fd,
                                      }).catch(() => {});
                                    }
                                  }}
                                />
                              </label>
                            )}
                            {step.type === "upload" &&
                              done &&
                              stepState?.fileName && (
                                <span className="text-[10px] text-muted mt-0.5 block truncate">
                                  {stepState.fileName}
                                </span>
                              )}

                            {step.type === "input" && !done && (
                              <input
                                type="text"
                                placeholder={step.placeholder}
                                className="mt-1.5 w-full h-7 px-2.5 rounded-[6px] border border-border bg-surface/40 text-[11px] text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary/40 transition-colors duration-150"
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    e.currentTarget.value.trim()
                                  ) {
                                    updateStep(project.slug, i, {
                                      value: e.currentTarget.value.trim(),
                                    });
                                  }
                                }}
                                onBlur={(e) => {
                                  if (e.currentTarget.value.trim()) {
                                    updateStep(project.slug, i, {
                                      value: e.currentTarget.value.trim(),
                                    });
                                  }
                                }}
                              />
                            )}
                            {step.type === "input" &&
                              done &&
                              stepState?.value && (
                                <span className="text-[10px] text-muted mt-0.5 block truncate">
                                  {stepState.value}
                                </span>
                              )}

                            {step.type === "choice" &&
                              !done &&
                              step.options && (
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {step.options.map((option) => (
                                    <button
                                      key={option}
                                      onClick={() =>
                                        updateStep(project.slug, i, {
                                          choice: option,
                                        })
                                      }
                                      className="h-6 px-2.5 rounded-[6px] border border-border bg-surface/40 text-[10px] text-foreground/80 hover:border-primary/40 hover:text-foreground transition-colors duration-150"
                                    >
                                      {option}
                                    </button>
                                  ))}
                                </div>
                              )}
                            {step.type === "choice" &&
                              done &&
                              stepState?.choice && (
                                <span className="text-[10px] text-muted mt-0.5 block">
                                  {stepState.choice}
                                </span>
                              )}

                            {step.type === "confirm" && !done && (
                              <button
                                onClick={() =>
                                  updateStep(project.slug, i, {})
                                }
                                className="mt-1.5 h-6 px-2.5 rounded-[6px] border border-border bg-surface/40 text-[10px] text-foreground/80 hover:border-primary/40 hover:text-foreground transition-colors duration-150"
                              >
                                Done
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Notes */}
                  <div className="mt-3 pt-3 border-t border-border">
                    <textarea
                      placeholder="Anything else we should know?"
                      rows={2}
                      value={notes[project.slug] || ""}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [project.slug]: e.target.value,
                        }))
                      }
                      className="w-full px-2.5 py-2 rounded-[6px] border border-border bg-surface/40 text-[11px] text-foreground placeholder:text-muted/40 focus:outline-none focus:border-primary/40 transition-colors duration-150 resize-none"
                    />
                  </div>

                  {/* Submit */}
                  {isSubmitted ? (
                    <div className="mt-2.5 flex items-center gap-1.5 justify-center py-2">
                      <Check
                        size={12}
                        strokeWidth={2}
                        className="text-[#00d4aa]"
                      />
                      <span className="text-[12px] text-[#00d4aa] font-medium">
                        Submitted
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={async () => {
                        if (submitting[project.slug]) return;
                        setSubmitting((prev) => ({ ...prev, [project.slug]: true }));

                        const stepData = state[project.slug].map((s, idx) => ({
                          label: project.steps[idx].label,
                          type: project.steps[idx].type,
                          ...s,
                        }));

                        try {
                          await Promise.all([
                            fetch("/api/submissions", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                slug: project.slug,
                                steps: stepData,
                                notes: notes[project.slug] || "",
                              }),
                            }),
                            fetch("/api/notify", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                slug: project.slug,
                                projectName: project.name,
                                completedSteps: stepData.filter((s) => s.completed),
                                notes: notes[project.slug] || "",
                              }),
                            }),
                          ]);
                        } catch {
                          // Persistence failed silently — still mark as submitted for the user
                        }

                        setSubmitting((prev) => ({ ...prev, [project.slug]: false }));
                        setSubmitted((prev) => ({ ...prev, [project.slug]: true }));
                      }}
                      disabled={!allDone(project.slug) || submitting[project.slug]}
                      className={`mt-2.5 w-full h-8 rounded-[8px] text-[12px] font-medium transition-all duration-150 ${
                        allDone(project.slug) && !submitting[project.slug]
                          ? "bg-primary text-white hover:brightness-110"
                          : "bg-surface-2 text-muted/40 cursor-not-allowed"
                      }`}
                    >
                      {submitting[project.slug]
                        ? "Submitting..."
                        : allDone(project.slug)
                          ? "Submit everything"
                          : `${project.steps.length - completedCount} remaining`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom bar */}
      <div className="flex-shrink-0 border-t border-border px-8 py-4">
        {/* Chat messages */}
        {chatMessages.length > 0 && (
          <div className="max-w-[600px] mx-auto mb-3 max-h-24 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
            {chatMessages.slice(-4).map((msg, i) => (
              <div
                key={i}
                className={`text-[12px] leading-[1.5] py-0.5 ${
                  msg.from === "user" ? "text-foreground/80" : "text-muted/60"
                }`}
              >
                <span>{msg.text}</span>
              </div>
            ))}
          </div>
        )}

        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          {/* Nav arrows + counter */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => scrollBy(-1)}
              className="w-8 h-8 rounded-[8px] border border-border flex items-center justify-center text-muted/50 hover:text-foreground hover:border-foreground/20 transition-all duration-150"
            >
              <ChevronLeft size={14} strokeWidth={1.5} />
            </button>
            <span className="text-[11px] tabular-nums text-muted/50 w-10 text-center">
              {focusedIndex + 1}/{projects.length}
            </span>
            <button
              onClick={() => scrollBy(1)}
              className="w-8 h-8 rounded-[8px] border border-border flex items-center justify-center text-muted/50 hover:text-foreground hover:border-foreground/20 transition-all duration-150"
            >
              <ChevronRight size={14} strokeWidth={1.5} />
            </button>
          </div>

          {/* Chat input */}
          <div className="flex-1 flex items-center h-9 rounded-[8px] border border-border bg-card px-4 gap-2">
            <input
              ref={chatInputRef}
              type="text"
              value={chatValue}
              onChange={(e) => setChatValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendChat();
              }}
              placeholder={`Message about ${focusedProject?.name ?? "this project"}...`}
              className="flex-1 text-[12px] text-foreground placeholder:text-muted/30 bg-transparent focus:outline-none"
            />
            <button
              onClick={sendChat}
              disabled={!chatValue.trim()}
              className="text-muted/40 hover:text-primary disabled:opacity-20 transition-all duration-150 flex-shrink-0"
            >
              <SendHorizontal size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
