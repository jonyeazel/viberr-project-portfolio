"use client";

import { useState, useCallback, useRef, useEffect, useLayoutEffect } from "react";

import {
  Github,
  Workflow,
  Layers,
  Upload,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  SendHorizontal,
  Monitor,
  Smartphone,
  Maximize2,
  Mic,
  Square,
  Zap,
  Lock,
  ArrowRight,
  Minus,
  Plus,
  MessageCircle,
  RotateCcw,
  ExternalLink,
  Globe,
  Copy,
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

const SITE_DOMAIN = "swift-bear-260.vercel.app";

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
        label: "Connect Stripe account",
        type: "confirm",
        placeholder: "stripe-credentials",
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

// Preview modes: null = card view, "mobile" = phone frame, "desktop" = expanded, "fullscreen" = overlay
type PreviewMode = null | "mobile" | "desktop" | "fullscreen";

// Card dimensions per mode
const CARD_W = 380;
const CARD_H = Math.round(CARD_W * (4 / 3)); // 507
const MOBILE_FRAME_W = 323;
const MOBILE_FRAME_H = 612; // iPhone proportions, 85% of 380×720
const MOBILE_IFRAME_W = 375;
const MOBILE_IFRAME_H = 812;
const DESKTOP_IFRAME_W = 1920;
const DESKTOP_IFRAME_H = 3000;

// Simple inline markdown → React nodes (bold, italic, inline code)
function renderMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  // Split by markdown patterns: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
  let lastIndex = 0;
  let match;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    // Push text before match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2]) {
      // **bold**
      parts.push(
        <span key={key++} className="font-semibold text-foreground">
          {match[2]}
        </span>
      );
    } else if (match[3]) {
      // *italic*
      parts.push(
        <em key={key++}>{match[3]}</em>
      );
    } else if (match[4]) {
      // `code`
      parts.push(
        <code
          key={key++}
          className="px-1 py-0.5 rounded bg-surface-2 text-[12px] font-mono"
        >
          {match[4]}
        </code>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

// localStorage helpers
const STORAGE_KEY = "viberr-state";
function loadPersistedState(): { state?: ProjectState; submitted?: Record<string, boolean> } {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function persistState(state: ProjectState, submitted: Record<string, boolean>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, submitted })); } catch {}
}

export default function Home() {
  const [state, setState] = useState<ProjectState>(initProjectState);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
  const [openDrawer, setOpenDrawer] = useState<string | null>(null);
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [chatValue, setChatValue] = useState("");
  const [chatBySlug, setChatBySlug] = useState<
    Record<string, Array<{ from: "user" | "assistant"; text: string }>>
  >({});
  const [chatLoading, setChatLoading] = useState(false);
  const [previewSlug, setPreviewSlug] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<PreviewMode>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [logoExpanded, setLogoExpanded] = useState(false);
  const [windowH, setWindowH] = useState(800);
  const [windowW, setWindowW] = useState(1280);
  const [showHint, setShowHint] = useState(false);
  const [tourStep, setTourStep] = useState(-1); // -1 = tour not active
  const [tourCompleted, setTourCompleted] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showTiltHint, setShowTiltHint] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState<Record<string, boolean>>({});
  const [keyNav, setKeyNav] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [phase, setPhase] = useState<"intake" | "decompose" | "brand" | "spec" | "building" | "review" | "finalReview" | "launch" | "domain" | "browse">("intake");
  const [builtProject, setBuiltProject] = useState<typeof projects[0] | null>(null);
  const [intakeMessages, setIntakeMessages] = useState<Array<{ from: "user" | "ai"; text: string }>>([
    { from: "ai", text: "What are you building?" },
  ]);
  const [intakePoints, setIntakePoints] = useState<Array<{ text: string; confirmed: boolean }> | null>(null);
  const [intakeLoading, setIntakeLoading] = useState(false);
  const [intakeValue, setIntakeValue] = useState("");
  // Phase 2: Decompose state
  const [decomposeItems, setDecomposeItems] = useState<Array<{
    feature: string;
    tasks: Array<{ name: string; description: string; price: number; included: boolean }>;
  }>>([]);
  const [decomposeLoading, setDecomposeLoading] = useState(false);
  // Phase 3: Brand state
  const [brandOptions, setBrandOptions] = useState<Array<{
    name: string;
    vibe: string;
    colors: { primary: string; secondary: string; accent: string; background: string; text: string };
    font: { heading: string; body: string };
    domains: string[];
  }>>([]);
  const [brandSelected, setBrandSelected] = useState<number | null>(null);
  const [brandLoading, setBrandLoading] = useState(false);
  // Phase 4: Spec state
  const [specData, setSpecData] = useState<{
    summary: string;
    sections: Array<{ title: string; items: string[] }>;
    tech: string[];
    timeline: string;
    notes: string;
  } | null>(null);
  const [specLoading, setSpecLoading] = useState(false);
  // Phase 5: Build state
  const [buildSteps, setBuildSteps] = useState<Array<{
    id: string;
    label: string;
    detail: string;
    duration: number;
    status: "pending" | "building" | "done";
  }>>([]);
  const [buildComplete, setBuildComplete] = useState(false);
  const buildTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const closingTimerRef = useRef<ReturnType<typeof setTimeout>>();
  // Phase 6: Review state
  const [reviewMessages, setReviewMessages] = useState<Array<{ from: "user" | "ai"; text: string }>>([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewValue, setReviewValue] = useState("");
  const [reviewApplying, setReviewApplying] = useState(false);
  const [reviewChanges, setReviewChanges] = useState<string[] | null>(null);
  const [reviewChatOpen, setReviewChatOpen] = useState(false);
  const [reviewRevisionCount, setReviewRevisionCount] = useState(0);
  const reviewScrollRef = useRef<HTMLDivElement>(null);
  // Phase 7: Final Review state
  const [finalReviewViewport, setFinalReviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [finalReviewPageIndex, setFinalReviewPageIndex] = useState(0);
  // Phase 8: Launch state
  const [launchSteps, setLaunchSteps] = useState<Array<{
    label: string;
    status: "pending" | "active" | "done";
  }>>([]);
  const [launchComplete, setLaunchComplete] = useState(false);
  const [launchCopied, setLaunchCopied] = useState(false);
  const [launchLive, setLaunchLive] = useState(false);
  const launchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  // Phase 9: Domain state
  const [domainSelected, setDomainSelected] = useState<number | null>(null);
  const [domainCustom, setDomainCustom] = useState("");
  const [domainCustomMode, setDomainCustomMode] = useState(false);
  const [domainChecking, setDomainChecking] = useState(false);
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  const [domainPurchasing, setDomainPurchasing] = useState(false);
  const [domainConnecting, setDomainConnecting] = useState(false);
  const [domainProgress, setDomainProgress] = useState(0);
  const [domainConnected, setDomainConnected] = useState(false);
  const domainTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const phaseRef = useRef<"intake" | "decompose" | "brand" | "spec" | "building" | "review" | "finalReview" | "launch" | "domain" | "browse">("intake");
  const intakeScrollRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const prevFocusRef = useRef(0);
  const previewSlugRef = useRef<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const displayProjects = builtProject ? [builtProject, ...projects] : projects;
  const focusedProject = displayProjects[focusedIndex];
  const chatMessagesAll = chatBySlug[focusedProject?.slug ?? ""] || [];
  const isStatusMsg = (t: string) => t.startsWith("Step completed") || /^All \d+ steps complete/.test(t);
  const statusMessages = chatMessagesAll.filter((m) => m.from === "assistant" && isStatusMsg(m.text));
  const chatMessages = chatMessagesAll.filter((m) => !(m.from === "assistant" && isStatusMsg(m.text)));
  const chatActive = chatMessages.length > 0 || chatLoading;

  // Restore persisted state + handle URL deep links
  useEffect(() => {
    const persisted = loadPersistedState();
    if (persisted.state) setState(persisted.state);
    if (persisted.submitted) setSubmitted(persisted.submitted);

    // Deep link: ?project=slug
    const params = new URLSearchParams(window.location.search);
    const target = params.get("project");
    if (target) {
      const idx = projects.findIndex((p) => p.slug === target);
      if (idx >= 0) {
        setFocusedIndex(idx);
        requestAnimationFrame(() => {
          const el = scrollRef.current;
          if (el?.children[idx]) {
            (el.children[idx] as HTMLElement).scrollIntoView({ behavior: "smooth", inline: "center" });
          }
        });
      }
    }

    // Restore tour completion
    if (localStorage.getItem('viberr-tour-done')) {
      setTourCompleted(true);
    }

    // First visit
    if (!localStorage.getItem("viberr-visited")) {
      if (window.innerWidth >= 640) {
        // Desktop: auto-start spotlight tour after brief delay
        setTimeout(() => setTourStep(0), 800);
      } else {
        setShowHint(true);
      }
      localStorage.setItem("viberr-visited", "1");
    }
  }, []);

  // Persist state changes
  useEffect(() => {
    persistState(state, submitted);
  }, [state, submitted]);

  // Dismiss hint on scroll or click
  useEffect(() => {
    if (!showHint) return;
    const dismiss = () => setShowHint(false);
    window.addEventListener("scroll", dismiss, { once: true, capture: true });
    window.addEventListener("click", dismiss, { once: true });
    return () => { window.removeEventListener("scroll", dismiss, true); window.removeEventListener("click", dismiss); };
  }, [showHint]);

  // Measure viewport
  useEffect(() => {
    const update = () => {
      setWindowH(window.innerHeight);
      setWindowW(window.innerWidth);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Keep preview ref in sync
  useEffect(() => { previewSlugRef.current = previewSlug; }, [previewSlug]);

  // Track which card is closest to center
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      if (previewSlugRef.current) return;
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
        if (prev[slug]?.[stepIndex]?.completed) return prev;
        const steps = [...prev[slug]];
        steps[stepIndex] = { ...steps[stepIndex], ...update, completed: true };
        return { ...prev, [slug]: steps };
      });
      // Signal completion to gut (outside setState to avoid strict-mode double-fire)
      const project = projects.find(p => p.slug === slug);
      if (project) {
        const label = project.steps[stepIndex]?.label ?? "Step";
        const detail = update.fileName || update.value || update.choice || "";
        const summary = detail ? `${label}: ${detail}` : label;
        setChatBySlug((prev) => {
          const existing = prev[slug] || [];
          const steps = state[slug] || [];
          const completedNow = steps.filter((s, i) => s.completed || i === stepIndex).length;
          const total = project.steps.length;
          return {
            ...prev,
            [slug]: [...existing, {
              from: "assistant" as const,
              text: completedNow === total
                ? `All ${total} steps complete for ${project.name}. Ready to submit.`
                : `Step completed — ${summary} (${completedNow}/${total})`,
            }],
          };
        });
      }
    },
    [state]
  );

  /* Confetti micro-burst — fires from a DOM element's position */
  const fireConfetti = useCallback((target: HTMLElement, big = false) => {
    const rect = target.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const container = document.createElement("div");
    container.style.cssText = "position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:9999;overflow:hidden";
    document.body.appendChild(container);
    const colors = big
      ? ["#059669", "#4f46e5", "#f59e0b", "#059669", "#4f46e5"]
      : ["#059669", "#4f46e5", "#a8a29e"];
    const count = big ? 24 : 12;
    const radius = big ? 36 : 22;
    const dur = big ? 500 : 380;
    for (let p = 0; p < count; p++) {
      const dot = document.createElement("div");
      const angle = (Math.PI * 2 * p) / count + (Math.random() - 0.5) * 0.4;
      const upBias = -0.3 - Math.random() * 0.3;
      const dist = radius * (0.7 + Math.random() * 0.6);
      const size = big ? (2.5 + Math.random() * 2) : (2 + Math.random() * 1.5);
      dot.style.cssText = `position:absolute;left:${cx}px;top:${cy}px;width:${size}px;height:${size}px;border-radius:50%;background:${colors[p % colors.length]};opacity:1;transition:all ${dur}ms cubic-bezier(0.16,1,0.3,1);transform:translate(-50%,-50%) scale(1)`;
      container.appendChild(dot);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          dot.style.left = `${cx + Math.cos(angle) * dist}px`;
          dot.style.top = `${cy + Math.sin(angle) * dist + upBias * dist}px`;
          dot.style.opacity = "0";
          dot.style.transform = `translate(-50%,-50%) scale(0.2)`;
        });
      });
    }
    setTimeout(() => container.remove(), dur + 150);
  }, []);

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

  const centerFocused = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (!el) return;
      const child = el.children[focusedIndex] as HTMLElement | undefined;
      if (child) {
        child.scrollIntoView({ behavior: "smooth", inline: "center" });
      }
    });
  }, [focusedIndex]);

  // Close preview with smooth re-centering
  const closePreview = useCallback(() => {
    clearTimeout(closingTimerRef.current);
    setPreviewSlug(null);
    setPreviewMode(null);
    setIsClosing(true);
    // Track the card's center on every frame during contraction
    const startTime = performance.now();
    const duration = 450;
    const track = () => {
      const el = scrollRef.current;
      if (!el) return;
      const child = el.children[focusedIndex] as HTMLElement;
      if (!child) return;
      el.scrollLeft = child.offsetLeft + child.offsetWidth / 2 - el.clientWidth / 2;
      if (performance.now() - startTime < duration) {
        requestAnimationFrame(track);
      }
    };
    requestAnimationFrame(track);
    // Re-enable snap after contraction animation settles
    closingTimerRef.current = setTimeout(() => {
      setIsClosing(false);
    }, 500);
  }, [focusedIndex]);

  // Keep phaseRef in sync
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  // Intake conversation
  const sendIntake = useCallback(async (textOverride?: string) => {
    const text = (textOverride || intakeValue).trim();
    if (!text || intakeLoading) return;
    setIntakeMessages(prev => [...prev, { from: "user", text }]);
    setIntakeValue("");
    setIntakeLoading(true);
    try {
      const history = intakeMessages.map(m => ({
        role: m.from === "user" ? "user" as const : "assistant" as const,
        content: m.text,
      }));
      const res = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      if (data.error) {
        setIntakeMessages(prev => [...prev, { from: "ai", text: "Something went wrong. Try again." }]);
      } else {
        setIntakeMessages(prev => [...prev, { from: "ai", text: data.message }]);
        if (data.points) {
          setIntakePoints(data.points.map((p: string) => ({ text: p, confirmed: true })));
        }
      }
    } catch {
      setIntakeMessages(prev => [...prev, { from: "ai", text: "Something went wrong. Try again." }]);
    } finally {
      setIntakeLoading(false);
    }
  }, [intakeValue, intakeMessages, intakeLoading]);

  const sendIntakeRef = useRef(sendIntake);
  useEffect(() => { sendIntakeRef.current = sendIntake; }, [sendIntake]);

  // Auto-scroll intake conversation
  useEffect(() => {
    const el = intakeScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [intakeMessages, intakeLoading, intakePoints]);

  // Auto-scroll review chat
  useEffect(() => {
    const el = reviewScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [reviewMessages, reviewLoading]);

  const toggleIntakePoint = useCallback((index: number) => {
    setIntakePoints(prev => {
      if (!prev) return prev;
      const next = [...prev];
      next[index] = { ...next[index], confirmed: !next[index].confirmed };
      return next;
    });
  }, []);

  const confirmIntake = useCallback(async () => {
    if (!intakePoints) return;
    const confirmed = intakePoints.filter(p => p.confirmed).map(p => p.text);
    if (confirmed.length === 0) return;
    setPhase("decompose");
    setDecomposeLoading(true);
    try {
      const res = await fetch("/api/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ features: confirmed }),
      });
      const data = await res.json();
      if (data.items?.length) {
        setDecomposeItems(
          data.items.map((item: { feature: string; tasks: Array<{ name: string; description: string; price: number }> }) => ({
            feature: item.feature,
            tasks: item.tasks.map((t: { name: string; description: string; price: number }) => ({ ...t, included: true })),
          }))
        );
      }
    } catch {
      // fallback — stay on decompose with empty state
    } finally {
      setDecomposeLoading(false);
    }
  }, [intakePoints]);

  const toggleDecomposeTask = useCallback((featureIdx: number, taskIdx: number) => {
    setDecomposeItems(prev => {
      const next = [...prev];
      const feature = { ...next[featureIdx] };
      const tasks = [...feature.tasks];
      tasks[taskIdx] = { ...tasks[taskIdx], included: !tasks[taskIdx].included };
      feature.tasks = tasks;
      next[featureIdx] = feature;
      return next;
    });
  }, []);

  const decomposeTotal = decomposeItems.reduce(
    (sum, item) => sum + item.tasks.reduce((s, t) => s + (t.included ? t.price : 0), 0),
    0
  );

  const confirmDecompose = useCallback(async () => {
    setPhase("brand");
    setBrandLoading(true);
    try {
      // Build description from intake messages
      const userMessages = intakeMessages.filter(m => m.from === "user").map(m => m.text);
      const description = userMessages.join(" ");
      const features = intakePoints?.filter(p => p.confirmed).map(p => p.text) || [];
      const res = await fetch("/api/brand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, features }),
      });
      const data = await res.json();
      if (data.options?.length) {
        setBrandOptions(data.options);
        setBrandSelected(0);
      }
    } catch {
      // stay on brand with empty state
    } finally {
      setBrandLoading(false);
    }
  }, [intakeMessages, intakePoints]);

  const confirmBrand = useCallback(async () => {
    if (brandSelected === null || !brandOptions[brandSelected]) return;
    const selectedBrand = brandOptions[brandSelected];
    setPhase("spec");
    setSpecLoading(true);
    try {
      const userMessages = intakeMessages.filter(m => m.from === "user").map(m => m.text);
      const description = userMessages.join(" ");
      const includedFeatures = decomposeItems
        .map(item => ({
          feature: item.feature,
          tasks: item.tasks.filter(t => t.included).map(t => ({
            name: t.name,
            description: t.description,
            price: t.price,
          })),
        }))
        .filter(item => item.tasks.length > 0);
      const res = await fetch("/api/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          features: includedFeatures,
          brand: {
            name: selectedBrand.name,
            colors: selectedBrand.colors,
            font: selectedBrand.font,
            domain: selectedBrand.domains[0],
          },
          total: decomposeTotal,
        }),
      });
      const data = await res.json();
      if (data.spec) {
        setSpecData(data.spec);
      }
    } catch {
      // stay on spec with empty state
    } finally {
      setSpecLoading(false);
    }
  }, [brandSelected, brandOptions, intakeMessages, decomposeItems, decomposeTotal]);

  const runBuildStep = useCallback((steps: Array<{ id: string; label: string; detail: string; duration: number; status: "pending" | "building" | "done" }>, index: number) => {
    if (index >= steps.length) {
      setBuildComplete(true);
      return;
    }
    // Mark current step as building
    setBuildSteps(prev => prev.map((s, i) =>
      i === index ? { ...s, status: "building" } : s
    ));
    // After duration, mark done and start next
    buildTimerRef.current = setTimeout(() => {
      setBuildSteps(prev => prev.map((s, i) =>
        i === index ? { ...s, status: "done" } : s
      ));
      runBuildStep(steps, index + 1);
    }, steps[index].duration);
  }, []);

  const confirmSpec = useCallback(async () => {
    if (!specData) return;
    const selectedBrand = brandSelected !== null ? brandOptions[brandSelected] : null;
    setPhase("building");
    setBuildComplete(false);
    try {
      const includedFeatures = decomposeItems
        .map(item => ({
          feature: item.feature,
          tasks: item.tasks.filter(t => t.included).map(t => ({
            name: t.name,
            description: t.description,
            price: t.price,
          })),
        }))
        .filter(item => item.tasks.length > 0);
      const res = await fetch("/api/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spec: specData,
          brand: selectedBrand ? {
            name: selectedBrand.name,
            colors: selectedBrand.colors,
            font: selectedBrand.font,
            domain: selectedBrand.domains[0],
          } : null,
          features: includedFeatures,
          total: decomposeTotal,
        }),
      });
      const data = await res.json();
      if (data.steps?.length) {
        const steps = data.steps.map((s: { id: string; label: string; detail: string; duration: number }) => ({
          ...s,
          status: "pending" as const,
        }));
        setBuildSteps(steps);
        // Start the build sequence after a brief pause
        setTimeout(() => runBuildStep(steps, 0), 600);
      }
    } catch {
      // stay on building with empty state
    }
  }, [specData, brandSelected, brandOptions, decomposeItems, decomposeTotal, runBuildStep]);

  const confirmBuild = useCallback(() => {
    setPhase("review");
    setReviewMessages([{ from: "ai", text: "Your site is live. Take a look around — if anything needs adjusting, let me know." }]);
    setReviewChatOpen(false);
    setReviewRevisionCount(0);
  }, []);

  const sendReviewMessage = useCallback(async (text: string) => {
    if (!text.trim() || reviewLoading) return;
    const selectedBrand = brandSelected !== null ? brandOptions[brandSelected] : null;
    setReviewMessages(prev => [...prev, { from: "user", text }]);
    setReviewValue("");
    setReviewLoading(true);
    try {
      const history = reviewMessages.map(m => ({
        role: m.from === "user" ? "user" as const : "assistant" as const,
        content: m.text,
      }));
      const res = await fetch("/api/revise", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          history,
          spec: specData,
          brand: selectedBrand ? {
            name: selectedBrand.name,
            colors: selectedBrand.colors,
          } : null,
        }),
      });
      const data = await res.json();
      if (data.applying && data.changes) {
        setReviewApplying(true);
        setReviewChanges(data.changes);
        setReviewMessages(prev => [...prev, { from: "ai", text: data.message }]);
        // Simulate applying changes
        setTimeout(() => {
          setReviewApplying(false);
          setReviewChanges(null);
          setReviewRevisionCount(prev => prev + 1);
          setReviewMessages(prev => [...prev, { from: "ai", text: "Done — changes applied. Take another look." }]);
        }, 2500 + (data.changes.length * 800));
      } else {
        setReviewMessages(prev => [...prev, { from: "ai", text: data.message || "I couldn't process that." }]);
      }
    } catch {
      setReviewMessages(prev => [...prev, { from: "ai", text: "Something went wrong. Try again." }]);
    }
    setReviewLoading(false);
  }, [reviewMessages, reviewLoading, brandSelected, brandOptions, specData]);

  const runLaunchStep = useCallback((steps: Array<{ label: string; status: "pending" | "active" | "done" }>, index: number) => {
    if (index >= steps.length) {
      setLaunchComplete(true);
      return;
    }
    setLaunchSteps(prev => prev.map((s, i) =>
      i === index ? { ...s, status: "active" } : s
    ));
    launchTimerRef.current = setTimeout(() => {
      setLaunchSteps(prev => prev.map((s, i) =>
        i === index ? { ...s, status: "done" } : s
      ));
      runLaunchStep(steps, index + 1);
    }, 1800 + Math.random() * 1200);
  }, []);

  const confirmReview = useCallback(() => {
    setPhase("finalReview");
    setFinalReviewViewport("desktop");
    setFinalReviewPageIndex(0);
  }, []);

  const confirmFinalReview = useCallback(() => {
    setPhase("launch");
    setLaunchComplete(false);
    setLaunchCopied(false);
    setLaunchLive(false);
    const steps = [
      { label: "Creating GitHub repository", status: "pending" as const },
      { label: "Pushing codebase to repo", status: "pending" as const },
      { label: "Connecting to Vercel", status: "pending" as const },
      { label: "Building production bundle", status: "pending" as const },
      { label: "Deploying to edge network", status: "pending" as const },
      { label: "Provisioning SSL certificate", status: "pending" as const },
      { label: "Running final checks", status: "pending" as const },
    ];
    setLaunchSteps(steps);
    setTimeout(() => runLaunchStep(steps, 0), 400);
  }, [runLaunchStep]);

  const confirmLaunch = useCallback(() => {
    setPhase("domain");
    setDomainSelected(null);
    setDomainCustom("");
    setDomainCustomMode(false);
    setDomainChecking(false);
    setDomainAvailable(null);
    setDomainPurchasing(false);
    setDomainConnecting(false);
    setDomainProgress(0);
    setDomainConnected(false);
  }, []);

  const checkDomainAvailability = useCallback(() => {
    setDomainChecking(true);
    setDomainAvailable(null);
    setTimeout(() => {
      setDomainChecking(false);
      setDomainAvailable(true);
    }, 1200 + Math.random() * 800);
  }, []);

  const purchaseDomain = useCallback(() => {
    setDomainPurchasing(true);
    setTimeout(() => {
      setDomainPurchasing(false);
      setDomainConnecting(true);
      setDomainProgress(0);
      // Simulate DNS propagation
      let progress = 0;
      const tick = () => {
        progress += Math.random() * 15 + 5;
        if (progress >= 100) {
          setDomainProgress(100);
          setTimeout(() => {
            setDomainConnecting(false);
            setDomainConnected(true);
          }, 400);
          return;
        }
        setDomainProgress(Math.round(progress));
        domainTimerRef.current = setTimeout(tick, 300 + Math.random() * 400);
      };
      domainTimerRef.current = setTimeout(tick, 500);
    }, 2000);
  }, []);

  const confirmDomain = useCallback(() => {
    // Build a project card from the accumulated build data
    const selectedBrand = brandSelected !== null ? brandOptions[brandSelected] : null;
    const totalCost = decomposeItems.reduce((sum, item) => sum + item.tasks.filter(t => t.included).reduce((s, t) => s + t.price, 0), 0);
    const allDeliverables = specData?.sections?.flatMap(s => s.items) || [];

    const newProject: typeof projects[0] = {
      slug: projects[0]?.slug || "outbound-email", // reuse existing page for preview
      name: selectedBrand?.name || "Your Project",
      type: "Platform",
      code: `VBR-${Math.floor(1000 + Math.random() * 9000)}`,
      description: specData?.summary || "Custom-built application",
      estimate: totalCost || 2000,
      deliverables: allDeliverables.slice(0, 5),
      steps: [],
    };

    setBuiltProject(newProject);
    setFocusedIndex(0);
    setPreviewSlug(null);
    setPreviewMode(null);
    setPhase("browse");
  }, [brandSelected, brandOptions, decomposeItems, specData]);

  // Center expanded card in scroll container
  useLayoutEffect(() => {
    if (!previewSlug) return;
    const center = () => {
      const el = scrollRef.current;
      if (!el) return;
      const idx = displayProjects.findIndex(p => p.slug === previewSlug);
      if (idx < 0) return;
      const child = el.children[idx] as HTMLElement;
      if (!child) return;
      el.scrollLeft = child.offsetLeft + child.offsetWidth / 2 - el.clientWidth / 2;
    };
    // Center immediately (before paint, uses target layout values)
    center();
    // Also re-center after CSS transition completes (350ms safety net)
    const timer = setTimeout(center, 400);
    return () => clearTimeout(timer);
  }, [previewSlug, previewMode]);

  // AI chat
  const sendChat = useCallback(
    async (messageOverride?: string) => {
      const msg = (messageOverride || chatValue).trim();
      if (!msg || chatLoading) return;
      const focused = displayProjects[focusedIndex];
      const slug = focused.slug;
      setChatBySlug((prev) => ({
        ...prev,
        [slug]: [...(prev[slug] || []), { from: "user" as const, text: msg }],
      }));
      setChatValue("");
      setChatLoading(true);

      try {
        // Build conversation history for server context
        const existing = chatBySlug[slug] || [];
        const history = existing
          .filter((m) => !isStatusMsg(m.text))
          .map((m) => ({ role: m.from === "user" ? "user" : "assistant", content: m.text }));

        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug,
            message: msg,
            projectName: focused.name,
            history,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setChatBySlug((prev) => ({
            ...prev,
            [slug]: [...(prev[slug] || []), { from: "assistant" as const, text: data.response }],
          }));
        } else {
          setChatBySlug((prev) => ({
            ...prev,
            [slug]: [...(prev[slug] || []), { from: "assistant" as const, text: "Something went wrong. Try again." }],
          }));
        }
      } catch {
        setChatBySlug((prev) => ({
          ...prev,
          [slug]: [...(prev[slug] || []), { from: "assistant" as const, text: "Connection failed. Try again." }],
        }));
      }

      setChatLoading(false);
    },
    [chatValue, focusedIndex, chatLoading, chatBySlug]
  );

  // Voice recording
  const toggleRecording = useCallback(async () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm;codecs=opus",
      });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Transcribe
        const fd = new FormData();
        fd.append("audio", audioBlob);

        try {
          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: fd,
          });
          if (res.ok) {
            const data = await res.json();
            if (data.text) {
              if (phaseRef.current === "intake") {
                sendIntakeRef.current?.(data.text);
              } else {
                sendChat(data.text);
              }
            }
          }
        } catch {
          // Silently fail transcription
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      // Microphone access denied
    }
  }, [isRecording, sendChat]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Keyboard handlers
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ⌘K / Ctrl+K to focus chat input
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        chatInputRef.current?.focus();
        return;
      }
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        if (previewMode === "fullscreen") {
          setPreviewMode("desktop");
          return;
        }
        if (previewSlug) {
          closePreview();
          return;
        }
        setOpenDrawer(null);
        return;
      }
      if (!previewSlug) {
        if (e.key === "ArrowRight") { setKeyNav(true); scrollBy(1); }
        if (e.key === "ArrowLeft") { setKeyNav(true); scrollBy(-1); }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollBy, closePreview, previewSlug, previewMode]);

  // Listen for close-preview messages from iframes
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data === "close-preview") {
        closePreview();
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [closePreview]);

  // Visual viewport offset for mobile keyboard
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const onResize = () => {
      const offset = window.innerHeight - vv.height;
      setKeyboardOffset(offset > 50 ? offset : 0);
    };
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  // Responsive layout
  const isMobile = windowW < 640;
  const cardW = isMobile ? Math.round(windowW * 0.8) : CARD_W;
  const cardH = isMobile ? Math.min(Math.round(cardW * (4 / 3)), windowH - 200) : CARD_H;

  // ─── Spotlight Tour ───────────────────────────────────────────
  const tourSteps = [
    {
      target: '[data-tour="card"]',
      title: 'These are real',
      body: 'Not mockups. Not wireframes. Each card is a finished, running product you can take live today. Finish this tour for something good.',
      position: 'right' as const,
    },
    {
      target: '[data-tour="deliverables"]',
      title: 'These talk back',
      body: 'Click any line item and the AI breaks it down in real time. Scope, effort, integrations — answered instantly.',
      position: 'right' as const,
    },
    {
      target: '[data-tour="pricing"]',
      title: 'No mystery pricing',
      body: 'Half upfront, half on delivery. The number doesn\'t change. What you see is what it costs.',
      position: 'right' as const,
    },
    {
      target: '[data-tour="view-project"]',
      title: 'Try it right now',
      body: 'Hit this and the actual working demo loads inside the card. No signup. No new tab. Just the product.',
      position: 'top' as const,
    },
    {
      target: '[data-tour="next-steps"]',
      title: 'Your turn',
      body: 'Upload your files, pick your options, submit your preferences. The project adapts to you.',
      position: 'top' as const,
    },
    {
      target: '[data-tour="chat"]',
      title: 'It knows things',
      body: 'Ask the AI anything about this project. Features, timelines, tech stack. It answers in seconds.',
      position: 'top' as const,
    },
    {
      target: '[data-tour="nav"]',
      title: 'There are 12 of these',
      body: 'Arrow keys, scroll, or these buttons. Each one different. Each one finished. One more step...',
      position: 'top' as const,
    },
  ];
  const tourActive = tourStep >= 0 && tourStep < tourSteps.length;
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!tourActive) { setSpotlightRect(null); return; }
    const step = tourSteps[tourStep];
    const measure = () => {
      const el = document.querySelector(step.target);
      if (el) setSpotlightRect(el.getBoundingClientRect());
    };
    measure();
    const id = setInterval(measure, 200);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourStep, tourActive]);

  const advanceTour = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1);
    } else {
      setTourStep(-1);
      if (!tourCompleted) {
        setTourCompleted(true);
        localStorage.setItem('viberr-tour-done', '1');
        setShowReward(true);
      }
    }
  };
  const dismissTour = () => setTourStep(-1);

  // Haptic feedback on card snap (mobile)
  useEffect(() => {
    if (!isMobile) return;
    if (focusedIndex !== prevFocusRef.current) {
      prevFocusRef.current = focusedIndex;
      try { navigator.vibrate(6); } catch {}
    }
  }, [focusedIndex, isMobile]);

  // Tilt-to-browse — gyroscope-driven card navigation (mobile only)
  useEffect(() => {
    if (!isMobile || openDrawer || previewSlug) return;
    if (!('DeviceOrientationEvent' in window)) return;

    let lastNav = 0;

    const handler = (e: DeviceOrientationEvent) => {
      const gamma = e.gamma;
      if (gamma === null || Math.abs(gamma) < 22) return;
      const now = Date.now();
      if (now - lastNav < 600) return;
      lastNav = now;
      scrollBy(gamma > 0 ? 1 : -1);
      try { navigator.vibrate(8); } catch {}
      if (!localStorage.getItem('viberr-tilt-seen')) {
        localStorage.setItem('viberr-tilt-seen', '1');
        setShowTiltHint(true);
        setTimeout(() => setShowTiltHint(false), 2500);
      }
    };

    const start = () => window.addEventListener('deviceorientation', handler);

    // iOS 13+ needs permission from user gesture
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DOE.requestPermission === 'function') {
      const onTouch = async () => {
        try {
          const p = await DOE.requestPermission!();
          if (p === 'granted') start();
        } catch {}
      };
      window.addEventListener('touchstart', onTouch, { once: true });
      return () => {
        window.removeEventListener('touchstart', onTouch);
        window.removeEventListener('deviceorientation', handler);
      };
    }

    start();
    return () => window.removeEventListener('deviceorientation', handler);
  }, [isMobile, scrollBy, openDrawer, previewSlug]);

  // Gravitational dot field — canvas replaces CSS dot grid
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SPACING = 18;
    const BASE_R = 0.5;
    const INFLUENCE = 260;
    const MAX_PULL = 16;
    const LERP = 0.12;

    let dpr = window.devicePixelRatio || 1;
    let w = 0, h = 0;
    let cols = 0, rows = 0;
    let posX: Float32Array = new Float32Array(0);
    let posY: Float32Array = new Float32Array(0);

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / SPACING) + 1;
      rows = Math.ceil(h / SPACING) + 1;
      const n = cols * rows;
      posX = new Float32Array(n);
      posY = new Float32Array(n);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          posX[i] = c * SPACING;
          posY[i] = r * SPACING;
        }
      }
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    const onLeave = () => {
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseleave', onLeave);

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const gx = c * SPACING;
          const gy = r * SPACING;

          let tx = gx;
          let ty = gy;
          let proximity = 0;

          const dx = mx - gx;
          const dy = my - gy;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < INFLUENCE && dist > 0.5) {
            const t = 1 - dist / INFLUENCE;
            const ease = t * t * t;
            proximity = ease;
            const pull = MAX_PULL * ease;
            tx = gx + (dx / dist) * pull;
            ty = gy + (dy / dist) * pull;
          }

          posX[i] += (tx - posX[i]) * LERP;
          posY[i] += (ty - posY[i]) * LERP;

          const sz = BASE_R + proximity * 0.6;
          const alpha = 0.08 + proximity * 0.7;
          ctx.globalAlpha = alpha;
          // Interpolate gray → indigo based on proximity
          const cr = Math.round(168 + (79 - 168) * proximity);
          const cg = Math.round(162 + (70 - 162) * proximity);
          const cb = Math.round(158 + (229 - 158) * proximity);
          ctx.fillStyle = `rgb(${cr},${cg},${cb})`;
          ctx.fillRect(posX[i] - sz, posY[i] - sz, sz * 2, sz * 2);
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  // Max card height that fits the viewport (bottom bar ~140px, padding 40px)
  const maxCardH = Math.max(400, windowH - 218);
  const mobileH = Math.min(MOBILE_FRAME_H, maxCardH);
  const desktopW = isMobile ? windowW - 24 : Math.min(Math.round(windowW * 0.8), 1200);
  const desktopH = Math.min(Math.round(desktopW * 0.5625), windowH - 160);

  // Mobile preview card: sized to fit phone frame with padding
  const mobileAvailH = desktopH - 44;
  const mobilePhoneH = Math.min(mobileH - 32, mobileAvailH - 12);
  const mobilePhoneW = Math.round(mobilePhoneH * (MOBILE_FRAME_W / (MOBILE_FRAME_H - 32)));
  const mobilePreviewW = isMobile ? cardW : Math.max(mobilePhoneW + 80, cardW);

  const SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";
  const T = `width 350ms ${SPRING}, height 350ms ${SPRING}, border-radius 350ms ${SPRING}, transform 150ms ease-out, opacity 150ms ease-out`;

  // Calculate card dimensions based on preview mode for the active card
  const getCardStyle = (
    isPreviewing: boolean,
    isFocused: boolean,
    hasActiveChat: boolean
  ): React.CSSProperties => {
    if (isPreviewing && previewMode === "mobile") {
      return {
        width: mobilePreviewW,
        height: isMobile ? cardH : desktopH,
        borderRadius: isMobile ? 36 : 12,
        transform: "scale(1)",
        opacity: 1,
        transition: T,
        border: "1px solid #d6d3d1",
        boxShadow:
          "0 0 0 1px rgba(99,91,255,0.04), 0 2px 12px rgba(0,0,0,0.04)",
      };
    }
    if (isPreviewing && previewMode === "desktop") {
      return {
        width: desktopW,
        height: desktopH,
        borderRadius: 12,
        transform: "scale(1)",
        opacity: 1,
        transition: T,
        border: "1px solid #d6d3d1",
        boxShadow:
          "0 0 0 1px rgba(99,91,255,0.04), 0 2px 12px rgba(0,0,0,0.04)",
      };
    }
    // Default card
    const isConnected = isFocused && hasActiveChat;
    return {
      width: cardW,
      height: cardH,
      borderRadius: 16,
      transform: isFocused ? "scale(1)" : isMobile ? "scale(0.92)" : "scale(0.95)",
      opacity: isFocused ? 1 : isMobile ? 0.4 : 0.6,
      transition: T,
      border: isConnected
        ? "1px solid rgba(79,70,229,0.3)"
        : isFocused
          ? "1px solid #d6d3d1"
          : "1px solid #e7e5e4",
      boxShadow: isConnected
        ? "0 0 0 1px rgba(79,70,229,0.08), 0 8px 40px rgba(79,70,229,0.06)"
        : isFocused
          ? "0 0 0 1px rgba(99,91,255,0.06), 0 8px 40px rgba(0,0,0,0.06)"
          : "none",
    };
  };

  // ── INTAKE PHASE ──────────────────────────────────────────────────
  if (phase === "intake") {
    return (
      <div className="flex flex-col" style={{ height: "100dvh", background: "#fafaf9" }}>
        {/* Minimal top bar */}
        <div className="flex items-center justify-center flex-shrink-0" style={{ height: 48 }}>
          <span
            className="text-[12px] font-medium tracking-[0.08em] uppercase"
            style={{ color: "#a8a29e" }}
          >
            Viberr
          </span>
        </div>

        {/* Conversation */}
        <div ref={intakeScrollRef} className="flex-1 overflow-y-auto px-6">
          <div className="max-w-[600px] mx-auto flex flex-col gap-5 py-8">
            {intakeMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={
                    msg.from === "user"
                      ? "px-4 py-2.5 rounded-[16px] rounded-br-[4px] text-[15px] leading-[1.5]"
                      : "text-[15px] leading-[1.5]"
                  }
                  style={
                    msg.from === "user"
                      ? { background: "#4f46e5", color: "#fff", maxWidth: "85%" }
                      : { color: "#1a1a1a", maxWidth: "85%" }
                  }
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Extracted points as chips */}
            {intakePoints && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {intakePoints.map((point, i) => (
                    <button
                      key={i}
                      onClick={() => toggleIntakePoint(i)}
                      className="px-3.5 py-2 rounded-full text-[13px] font-medium transition-all duration-150"
                      style={{
                        background: point.confirmed ? "#4f46e5" : "transparent",
                        color: point.confirmed ? "#fff" : "#78716c",
                        border: point.confirmed ? "1px solid #4f46e5" : "1px solid #d6d3d1",
                      }}
                    >
                      {point.text}
                    </button>
                  ))}
                </div>
                {intakePoints.some(p => p.confirmed) && (
                  <button
                    onClick={confirmIntake}
                    className="self-start px-5 py-2.5 rounded-[8px] text-[14px] font-medium text-white transition-all duration-150 hover:brightness-110"
                    style={{ background: "#4f46e5" }}
                  >
                    That covers it
                  </button>
                )}
              </div>
            )}

            {/* Loading dots */}
            {intakeLoading && (
              <div className="flex gap-1.5 py-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a8a29e", animation: "pulse 1.5s ease-in-out infinite" }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a8a29e", animation: "pulse 1.5s ease-in-out 0.2s infinite" }} />
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a8a29e", animation: "pulse 1.5s ease-in-out 0.4s infinite" }} />
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="px-6 pb-6 flex-shrink-0">
          <div className="max-w-[600px] mx-auto">
            <div
              className="flex items-end gap-2 px-4 py-3 rounded-[12px]"
              style={{ background: "#fff", border: "1px solid #d6d3d1" }}
            >
              <textarea
                value={intakeValue}
                onChange={(e) => setIntakeValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendIntake();
                  }
                }}
                placeholder="Describe what you need built..."
                className="flex-1 resize-none bg-transparent text-[15px] outline-none leading-[1.5]"
                style={{ color: "#1a1a1a", minHeight: 24, maxHeight: 120 }}
                rows={1}
                disabled={intakeLoading}
              />
              <button
                onClick={toggleRecording}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150"
                style={{
                  background: isRecording ? "#dc2626" : "#f5f5f4",
                  color: isRecording ? "#fff" : "#78716c",
                }}
              >
                {isRecording ? <Square size={12} fill="currentColor" /> : <Mic size={16} strokeWidth={1.5} />}
              </button>
              <button
                onClick={() => sendIntake()}
                disabled={!intakeValue.trim() || intakeLoading}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150"
                style={{
                  background: intakeValue.trim() ? "#4f46e5" : "#f5f5f4",
                  color: intakeValue.trim() ? "#fff" : "#a8a29e",
                }}
              >
                <SendHorizontal size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── DECOMPOSE PHASE ──────────────────────────────────────────────
  if (phase === "decompose") {
    const includedCount = decomposeItems.reduce(
      (sum, item) => sum + item.tasks.filter(t => t.included).length, 0
    );
    const totalCount = decomposeItems.reduce(
      (sum, item) => sum + item.tasks.length, 0
    );

    return (
      <div className="flex flex-col" style={{ height: "100dvh", background: "#fafaf9" }}>
        {/* Top bar */}
        <div className="flex items-center justify-center flex-shrink-0" style={{ height: 48 }}>
          <span
            className="text-[12px] font-medium tracking-[0.08em] uppercase"
            style={{ color: "#a8a29e" }}
          >
            Viberr
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="max-w-[600px] mx-auto py-8">
            {decomposeLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-24">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a8a29e", animation: "pulse 1.5s ease-in-out infinite" }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a8a29e", animation: "pulse 1.5s ease-in-out 0.2s infinite" }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a8a29e", animation: "pulse 1.5s ease-in-out 0.4s infinite" }} />
                </div>
                <p className="text-[14px]" style={{ color: "#78716c" }}>
                  Breaking down your project...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {decomposeItems.map((item, fi) => (
                  <div key={fi} className="flex flex-col gap-1">
                    <p className="text-[13px] font-medium uppercase tracking-[0.05em] mb-2" style={{ color: "#a8a29e" }}>
                      {item.feature}
                    </p>
                    {item.tasks.map((task, ti) => (
                      <button
                        key={ti}
                        onClick={() => toggleDecomposeTask(fi, ti)}
                        className="flex items-center gap-3 px-4 py-3 rounded-[8px] text-left transition-all duration-150 group"
                        style={{
                          background: task.included ? "#fff" : "transparent",
                          border: task.included ? "1px solid #e7e5e4" : "1px solid transparent",
                        }}
                      >
                        <div
                          className="w-5 h-5 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-all duration-150"
                          style={{
                            background: task.included ? "#4f46e5" : "transparent",
                            border: task.included ? "1px solid #4f46e5" : "1px solid #d6d3d1",
                          }}
                        >
                          {task.included && <Check size={12} strokeWidth={2.5} color="#fff" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-[14px] font-medium leading-[1.4] transition-colors duration-150"
                            style={{ color: task.included ? "#1a1a1a" : "#a8a29e" }}
                          >
                            {task.name}
                          </p>
                          <p
                            className="text-[12px] leading-[1.5] mt-0.5 transition-colors duration-150"
                            style={{ color: task.included ? "#78716c" : "#c4c0bc" }}
                          >
                            {task.description}
                          </p>
                        </div>
                        <span
                          className="text-[14px] tabular-nums font-medium flex-shrink-0 transition-colors duration-150"
                          style={{ color: task.included ? "#1a1a1a" : "#c4c0bc" }}
                        >
                          ${task.price}
                        </span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar — running total + confirm */}
        {!decomposeLoading && decomposeItems.length > 0 && (
          <div className="flex-shrink-0 px-6 pb-6">
            <div className="max-w-[600px] mx-auto">
              <div
                className="flex items-center justify-between px-5 py-4 rounded-[12px]"
                style={{ background: "#fff", border: "1px solid #e7e5e4" }}
              >
                <div className="flex flex-col">
                  <span className="text-[24px] font-medium tabular-nums tracking-[-0.02em]" style={{ color: "#1a1a1a" }}>
                    ${decomposeTotal.toLocaleString()}
                  </span>
                  <span className="text-[12px]" style={{ color: "#a8a29e" }}>
                    {includedCount} of {totalCount} tasks selected
                  </span>
                </div>
                <button
                  onClick={confirmDecompose}
                  disabled={includedCount === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[14px] font-medium text-white transition-all duration-150"
                  style={{
                    background: includedCount > 0 ? "#4f46e5" : "#d6d3d1",
                    cursor: includedCount > 0 ? "pointer" : "default",
                  }}
                  onMouseEnter={(e) => { if (includedCount > 0) e.currentTarget.style.filter = "brightness(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
                >
                  Looks good
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── BRAND PHASE ──────────────────────────────────────────────────
  if (phase === "brand") {
    const selected = brandSelected !== null ? brandOptions[brandSelected] : null;

    return (
      <div className="flex flex-col" style={{ height: "100dvh", background: "#fafaf9" }}>
        {/* Top bar */}
        <div className="flex items-center justify-center flex-shrink-0" style={{ height: 48 }}>
          <span
            className="text-[12px] font-medium tracking-[0.08em] uppercase"
            style={{ color: "#a8a29e" }}
          >
            Viberr
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="max-w-[600px] mx-auto py-8">
            {brandLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-24">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a8a29e", animation: "pulse 1.5s ease-in-out infinite" }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a8a29e", animation: "pulse 1.5s ease-in-out 0.2s infinite" }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a8a29e", animation: "pulse 1.5s ease-in-out 0.4s infinite" }} />
                </div>
                <p className="text-[14px]" style={{ color: "#78716c" }}>
                  Generating brand directions...
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Brand option cards */}
                {brandOptions.map((opt, i) => {
                  const isSelected = brandSelected === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setBrandSelected(i)}
                      className="w-full text-left rounded-[12px] overflow-hidden transition-all duration-150"
                      style={{
                        border: isSelected ? `2px solid ${opt.colors.primary}` : "1px solid #e7e5e4",
                        padding: isSelected ? 0 : 1,
                      }}
                    >
                      {/* Color preview strip */}
                      <div className="flex" style={{ height: 48 }}>
                        <div className="flex-1" style={{ background: opt.colors.primary }} />
                        <div className="flex-1" style={{ background: opt.colors.secondary }} />
                        <div className="flex-1" style={{ background: opt.colors.accent }} />
                        <div className="flex-1" style={{ background: opt.colors.background }} />
                        <div className="flex-1" style={{ background: opt.colors.text }} />
                      </div>

                      {/* Info */}
                      <div className="px-5 py-4" style={{ background: "#fff" }}>
                        <div className="flex items-center gap-3">
                          <p
                            className="text-[16px] font-medium leading-[1.3]"
                            style={{ color: "#1a1a1a" }}
                          >
                            {opt.name}
                          </p>
                          {isSelected && (
                            <div
                              className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ background: opt.colors.primary }}
                            >
                              <Check size={12} strokeWidth={2.5} color="#fff" />
                            </div>
                          )}
                        </div>
                        <p
                          className="text-[13px] leading-[1.5] mt-1"
                          style={{ color: "#78716c" }}
                        >
                          {opt.vibe}
                        </p>

                        {/* Typography */}
                        <div className="flex gap-4 mt-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.05em]" style={{ color: "#a8a29e" }}>
                              Heading
                            </p>
                            <p className="text-[13px] font-medium" style={{ color: "#1a1a1a" }}>
                              {opt.font.heading}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] uppercase tracking-[0.05em]" style={{ color: "#a8a29e" }}>
                              Body
                            </p>
                            <p className="text-[13px] font-medium" style={{ color: "#1a1a1a" }}>
                              {opt.font.body}
                            </p>
                          </div>
                        </div>

                        {/* Domains */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {opt.domains.map((d, di) => (
                            <span
                              key={di}
                              className="px-2.5 py-1 rounded-[6px] text-[12px]"
                              style={{
                                background: isSelected ? `${opt.colors.primary}10` : "#f5f5f4",
                                color: isSelected ? opt.colors.primary : "#78716c",
                              }}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Live preview of selected brand */}
                {selected && (
                  <div
                    className="rounded-[12px] overflow-hidden"
                    style={{ border: "1px solid #e7e5e4" }}
                  >
                    <div className="px-5 py-6" style={{ background: selected.colors.background }}>
                      <p
                        className="text-[24px] font-semibold leading-[1.2]"
                        style={{ color: selected.colors.text, fontFamily: `"${selected.font.heading}", system-ui` }}
                      >
                        {selected.domains[0]?.replace('.com', '') || 'Your Brand'}
                      </p>
                      <p
                        className="text-[14px] leading-[1.6] mt-2"
                        style={{ color: `${selected.colors.text}99`, fontFamily: `"${selected.font.body}", system-ui` }}
                      >
                        Built for your business. Powered by modern technology.
                      </p>
                      <div className="flex gap-2 mt-4">
                        <div
                          className="px-4 py-2 rounded-[6px] text-[13px] font-medium"
                          style={{
                            background: selected.colors.primary,
                            color: "#fff",
                          }}
                        >
                          Get started
                        </div>
                        <div
                          className="px-4 py-2 rounded-[6px] text-[13px] font-medium"
                          style={{
                            background: "transparent",
                            color: selected.colors.text,
                            border: `1px solid ${selected.colors.text}33`,
                          }}
                        >
                          Learn more
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        {!brandLoading && brandOptions.length > 0 && brandSelected !== null && (
          <div className="flex-shrink-0 px-6 pb-6">
            <div className="max-w-[600px] mx-auto">
              <div
                className="flex items-center justify-between px-5 py-4 rounded-[12px]"
                style={{ background: "#fff", border: "1px solid #e7e5e4" }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {brandOptions.map((opt, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full cursor-pointer transition-all duration-150"
                        style={{
                          background: opt.colors.primary,
                          opacity: brandSelected === i ? 1 : 0.3,
                          transform: brandSelected === i ? "scale(1.2)" : "scale(1)",
                        }}
                        onClick={() => setBrandSelected(i)}
                      />
                    ))}
                  </div>
                  <span className="text-[13px]" style={{ color: "#78716c" }}>
                    {brandOptions[brandSelected].name}
                  </span>
                </div>
                <button
                  onClick={confirmBrand}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[14px] font-medium text-white transition-all duration-150"
                  style={{ background: brandOptions[brandSelected].colors.primary }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
                >
                  Use this brand
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── SPEC PHASE ───────────────────────────────────────────────────
  if (phase === "spec") {
    const selectedBrand = brandSelected !== null ? brandOptions[brandSelected] : null;

    return (
      <div className="flex flex-col" style={{ height: "100dvh", background: "#fafaf9" }}>
        {/* Top bar */}
        <div className="flex items-center justify-center flex-shrink-0" style={{ height: 48 }}>
          <span
            className="text-[12px] font-medium tracking-[0.08em] uppercase"
            style={{ color: "#a8a29e" }}
          >
            Viberr
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="max-w-[600px] mx-auto py-8">
            {specLoading ? (
              <div className="flex flex-col items-center justify-center gap-4 py-24">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a8a29e", animation: "pulse 1.5s ease-in-out infinite" }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a8a29e", animation: "pulse 1.5s ease-in-out 0.2s infinite" }} />
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#a8a29e", animation: "pulse 1.5s ease-in-out 0.4s infinite" }} />
                </div>
                <p className="text-[14px]" style={{ color: "#78716c" }}>
                  Writing your build spec...
                </p>
              </div>
            ) : specData ? (
              <div className="flex flex-col gap-8">
                {/* Summary */}
                <div>
                  <p className="text-[15px] leading-[1.6]" style={{ color: "#1a1a1a" }}>
                    {specData.summary}
                  </p>
                </div>

                {/* Sections */}
                {specData.sections.map((section, si) => (
                  <div key={si}>
                    <p className="text-[13px] font-medium uppercase tracking-[0.05em] mb-3" style={{ color: "#a8a29e" }}>
                      {section.title}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {section.items.map((item, ii) => (
                        <div
                          key={ii}
                          className="flex items-start gap-3 px-4 py-3 rounded-[8px]"
                          style={{ background: "#fff", border: "1px solid #e7e5e4" }}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{ background: selectedBrand?.colors.primary || "#4f46e5", opacity: 0.15 }}
                          >
                            <Check size={10} strokeWidth={2.5} style={{ color: selectedBrand?.colors.primary || "#4f46e5" }} />
                          </div>
                          <p className="text-[14px] leading-[1.5]" style={{ color: "#1a1a1a" }}>
                            {item}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Tech + Timeline */}
                <div className="flex gap-6">
                  <div className="flex-1">
                    <p className="text-[13px] font-medium uppercase tracking-[0.05em] mb-2" style={{ color: "#a8a29e" }}>
                      Stack
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {specData.tech.map((t, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-[6px] text-[12px] font-medium"
                          style={{ background: "#f5f5f4", color: "#57534e" }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[13px] font-medium uppercase tracking-[0.05em] mb-2" style={{ color: "#a8a29e" }}>
                      Timeline
                    </p>
                    <p className="text-[14px] font-medium" style={{ color: "#1a1a1a" }}>
                      {specData.timeline}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {specData.notes && (
                  <div
                    className="px-4 py-3 rounded-[8px] text-[13px] leading-[1.6]"
                    style={{ background: "#f5f5f4", color: "#78716c" }}
                  >
                    {specData.notes}
                  </div>
                )}

                {/* Brand reminder */}
                {selectedBrand && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-[8px]" style={{ background: "#fff", border: "1px solid #e7e5e4" }}>
                    <div className="flex gap-0.5">
                      <div className="w-4 h-4 rounded-[2px]" style={{ background: selectedBrand.colors.primary }} />
                      <div className="w-4 h-4 rounded-[2px]" style={{ background: selectedBrand.colors.secondary }} />
                      <div className="w-4 h-4 rounded-[2px]" style={{ background: selectedBrand.colors.accent }} />
                    </div>
                    <span className="text-[13px]" style={{ color: "#78716c" }}>
                      {selectedBrand.name} &middot; {selectedBrand.font.heading} / {selectedBrand.font.body} &middot; {selectedBrand.domains[0]}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 py-24">
                <p className="text-[14px]" style={{ color: "#78716c" }}>
                  Something went wrong generating the spec.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        {!specLoading && specData && (
          <div className="flex-shrink-0 px-6 pb-6">
            <div className="max-w-[600px] mx-auto">
              <div
                className="flex items-center justify-between px-5 py-4 rounded-[12px]"
                style={{ background: "#fff", border: "1px solid #e7e5e4" }}
              >
                <div className="flex flex-col">
                  <span className="text-[24px] font-medium tabular-nums tracking-[-0.02em]" style={{ color: "#1a1a1a" }}>
                    ${decomposeTotal.toLocaleString()}
                  </span>
                  <span className="text-[12px]" style={{ color: "#a8a29e" }}>
                    {specData.sections.reduce((sum, s) => sum + s.items.length, 0)} deliverables &middot; {specData.timeline}
                  </span>
                </div>
                <button
                  onClick={confirmSpec}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[14px] font-medium text-white transition-all duration-150"
                  style={{ background: selectedBrand?.colors.primary || "#4f46e5" }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
                >
                  Approve &amp; build
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── BUILDING PHASE ───────────────────────────────────────────────
  if (phase === "building") {
    const selectedBrand = brandSelected !== null ? brandOptions[brandSelected] : null;
    const brandPrimary = selectedBrand?.colors.primary || "#4f46e5";
    const doneCount = buildSteps.filter(s => s.status === "done").length;
    const progress = buildSteps.length > 0 ? Math.round((doneCount / buildSteps.length) * 100) : 0;
    const currentStep = buildSteps.find(s => s.status === "building");

    return (
      <div className="flex flex-col" style={{ height: "100dvh", background: "#fafaf9" }}>
        {/* Top bar */}
        <div className="flex items-center justify-center flex-shrink-0" style={{ height: 48 }}>
          <span
            className="text-[12px] font-medium tracking-[0.08em] uppercase"
            style={{ color: "#a8a29e" }}
          >
            Viberr
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6">
          <div className="max-w-[600px] mx-auto py-8 pb-24">
            {/* Progress bar */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium" style={{ color: "#1a1a1a" }}>
                  {buildComplete ? "Build complete" : currentStep ? currentStep.label : "Preparing build..."}
                </span>
                <span className="text-[12px] tabular-nums" style={{ color: "#a8a29e" }}>
                  {progress}%
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden" style={{ background: "#e7e5e4" }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: brandPrimary,
                    transition: "width 300ms ease-out",
                  }}
                />
              </div>
            </div>

            {/* Step list */}
            <div className="flex flex-col gap-0.5">
              {buildSteps.map((step, i) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 px-4 py-3 rounded-[8px] transition-all duration-150"
                  style={{
                    background: step.status === "building" ? "#fff" : "transparent",
                    border: step.status === "building" ? "1px solid #e7e5e4" : "1px solid transparent",
                    opacity: step.status === "pending" ? 0.4 : 1,
                  }}
                >
                  {/* Status indicator */}
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {step.status === "done" ? (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: brandPrimary }}
                      >
                        <Check size={11} strokeWidth={2.5} color="#fff" />
                      </div>
                    ) : step.status === "building" ? (
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{
                          border: `2px solid ${brandPrimary}`,
                          borderTopColor: "transparent",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                    ) : (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: "#d6d3d1" }}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[14px] font-medium leading-[1.4]"
                      style={{
                        color: step.status === "pending" ? "#a8a29e" : "#1a1a1a",
                      }}
                    >
                      {step.label}
                    </p>
                    <p
                      className="text-[12px] leading-[1.5] mt-0.5"
                      style={{
                        color: step.status === "pending" ? "#c4c0bc" : "#78716c",
                      }}
                    >
                      {step.detail}
                    </p>
                  </div>

                  {/* Step number */}
                  <span
                    className="text-[11px] tabular-nums flex-shrink-0 mt-1"
                    style={{ color: step.status === "done" ? "#a8a29e" : "#d6d3d1" }}
                  >
                    {i + 1}/{buildSteps.length}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar — only shows when complete */}
        {buildComplete && (
          <div className="flex-shrink-0 px-6 pb-6">
            <div className="max-w-[600px] mx-auto">
              <div
                className="flex items-center justify-between px-5 py-4 rounded-[12px]"
                style={{ background: "#fff", border: "1px solid #e7e5e4" }}
              >
                <div className="flex flex-col">
                  <span className="text-[15px] font-medium" style={{ color: "#1a1a1a" }}>
                    Your site is ready
                  </span>
                  <span className="text-[12px]" style={{ color: "#a8a29e" }}>
                    {selectedBrand?.domains[0] || "Preview available"}
                  </span>
                </div>
                <button
                  onClick={confirmBuild}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[8px] text-[14px] font-medium text-white transition-all duration-150"
                  style={{ background: brandPrimary }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
                >
                  View site
                  <ArrowRight size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── REVIEW PHASE ────────────────────────────────────────────────
  if (phase === "review") {
    const selectedBrand = brandSelected !== null ? brandOptions[brandSelected] : null;
    const brandPrimary = selectedBrand?.colors.primary || "#4f46e5";
    const brandBg = selectedBrand?.colors.background || "#fafaf9";
    const brandText = selectedBrand?.colors.text || "#1a1a1a";
    const siteDomain = selectedBrand?.domains[0] || "yoursite.com";
    // Pick a project page to show as the "built" preview
    const previewUrl = `/${projects[0]?.slug || "outbound-email"}?embed=1`;

    return (
      <div className="flex flex-col" style={{ height: "100dvh", background: "#fafaf9" }}>
        {/* Top bar */}
        <div
          className="flex items-center justify-between flex-shrink-0 px-4"
          style={{ height: 48, borderBottom: "1px solid #e7e5e4" }}
        >
          <span
            className="text-[12px] font-medium tracking-[0.08em] uppercase"
            style={{ color: "#a8a29e" }}
          >
            Viberr
          </span>
          <div className="flex items-center gap-2">
            {reviewRevisionCount > 0 && (
              <span className="text-[11px] tabular-nums" style={{ color: "#a8a29e" }}>
                {reviewRevisionCount} revision{reviewRevisionCount !== 1 ? "s" : ""} applied
              </span>
            )}
            <button
              onClick={() => setReviewChatOpen(!reviewChatOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all duration-150"
              style={{
                background: reviewChatOpen ? brandPrimary : "transparent",
                color: reviewChatOpen ? "#fff" : "#78716c",
                border: reviewChatOpen ? "none" : "1px solid #e7e5e4",
              }}
            >
              <MessageCircle size={13} strokeWidth={2} />
              Revise
            </button>
            <button
              onClick={confirmReview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-white transition-all duration-150"
              style={{ background: brandPrimary }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
            >
              Approve & launch
              <ArrowRight size={12} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Site preview */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ background: "#e7e5e4" }}>
            {/* Browser chrome */}
            <div
              className="flex items-center gap-2 px-4 flex-shrink-0"
              style={{ height: 36, background: "#fff", borderBottom: "1px solid #e7e5e4" }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#e7e5e4" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#e7e5e4" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#e7e5e4" }} />
              </div>
              <div
                className="flex-1 mx-8 px-3 py-1 rounded-[4px] text-[11px] text-center"
                style={{ background: "#f5f5f4", color: "#a8a29e" }}
              >
                {siteDomain}
              </div>
            </div>

            {/* Iframe preview */}
            <div className="flex-1 relative">
              {reviewApplying && (
                <div
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4"
                  style={{ background: "rgba(250, 250, 249, 0.92)", backdropFilter: "blur(2px)" }}
                >
                  <div
                    className="w-5 h-5 rounded-full"
                    style={{
                      border: `2px solid ${brandPrimary}`,
                      borderTopColor: "transparent",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                  <div className="flex flex-col items-center gap-2">
                    {reviewChanges?.map((change, i) => (
                      <span
                        key={i}
                        className="text-[12px]"
                        style={{
                          color: "#78716c",
                          animation: `statusFadeIn 300ms ease-out ${i * 200}ms both`,
                        }}
                      >
                        {change}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                style={{ background: brandBg }}
              />
            </div>
          </div>

          {/* Revision chat panel */}
          {reviewChatOpen && (
            <div
              className="flex flex-col flex-shrink-0"
              style={{ width: 340, borderLeft: "1px solid #e7e5e4", background: "#fff" }}
            >
              {/* Chat header */}
              <div
                className="flex items-center justify-between px-4 flex-shrink-0"
                style={{ height: 48, borderBottom: "1px solid #f5f5f4" }}
              >
                <span className="text-[13px] font-medium" style={{ color: "#1a1a1a" }}>
                  Revisions
                </span>
                <button
                  onClick={() => setReviewChatOpen(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-[4px] transition-colors duration-150"
                  style={{ color: "#a8a29e" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f5f5f4"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>

              {/* Chat messages */}
              <div
                ref={reviewScrollRef}
                className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
              >
                {reviewMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[260px] px-3 py-2 rounded-[8px] text-[13px] leading-[1.5]"
                      style={
                        msg.from === "user"
                          ? { background: brandPrimary, color: "#fff" }
                          : { background: "#f5f5f4", color: "#1a1a1a" }
                      }
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {reviewLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-1 px-3 py-2">
                      {[0, 1, 2].map(j => (
                        <div
                          key={j}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: "#d6d3d1",
                            animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Chat input */}
              <div className="flex-shrink-0 px-3 pb-3">
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-[8px]"
                  style={{ border: "1px solid #e7e5e4" }}
                >
                  <input
                    type="text"
                    value={reviewValue}
                    onChange={(e) => setReviewValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        sendReviewMessage(reviewValue);
                      }
                    }}
                    placeholder="Describe a change..."
                    className="flex-1 text-[13px] bg-transparent outline-none"
                    style={{ color: "#1a1a1a" }}
                    disabled={reviewApplying}
                  />
                  <button
                    onClick={() => sendReviewMessage(reviewValue)}
                    disabled={!reviewValue.trim() || reviewLoading || reviewApplying}
                    className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-150"
                    style={{
                      background: reviewValue.trim() ? brandPrimary : "#e7e5e4",
                      opacity: reviewValue.trim() ? 1 : 0.5,
                    }}
                  >
                    <SendHorizontal size={12} strokeWidth={2} color="#fff" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── FINAL REVIEW PHASE ──────────────────────────────────────────
  if (phase === "finalReview") {
    const selectedBrand = brandSelected !== null ? brandOptions[brandSelected] : null;
    const brandPrimary = selectedBrand?.colors.primary || "#4f46e5";
    const brandBg = selectedBrand?.colors.background || "#fafaf9";
    const siteDomain = selectedBrand?.domains[0] || "yoursite.com";

    // Build page list from spec sections, mapped to available project slugs
    const pageList = (specData?.sections || []).map((section, i) => ({
      label: section.title,
      slug: projects[i % projects.length]?.slug || "outbound-email",
    }));
    // Always have at least a "Home" page
    if (pageList.length === 0) {
      pageList.push({ label: "Home", slug: projects[0]?.slug || "outbound-email" });
    }
    const currentPage = pageList[finalReviewPageIndex] || pageList[0];
    const previewUrl = `/${currentPage.slug}?embed=1`;
    const isMobile = finalReviewViewport === "mobile";

    return (
      <div className="flex flex-col" style={{ height: "100dvh", background: "#1a1a1a" }}>
        {/* Top bar */}
        <div
          className="flex items-center justify-between flex-shrink-0 px-4"
          style={{ height: 48, borderBottom: "1px solid #2a2a2a" }}
        >
          <div className="flex items-center gap-3">
            <span
              className="text-[12px] font-medium tracking-[0.08em] uppercase"
              style={{ color: "#78716c" }}
            >
              Viberr
            </span>
            <div className="w-px h-4" style={{ background: "#2a2a2a" }} />
            <span className="text-[12px]" style={{ color: "#a8a29e" }}>
              Final review
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Viewport toggle */}
            <div
              className="flex items-center rounded-[6px] p-0.5"
              style={{ background: "#2a2a2a" }}
            >
              <button
                onClick={() => setFinalReviewViewport("desktop")}
                className="flex items-center justify-center w-7 h-7 rounded-[4px] transition-all duration-150"
                style={{
                  background: !isMobile ? "#3a3a3a" : "transparent",
                  color: !isMobile ? "#fff" : "#78716c",
                }}
              >
                <Monitor size={14} strokeWidth={1.5} />
              </button>
              <button
                onClick={() => setFinalReviewViewport("mobile")}
                className="flex items-center justify-center w-7 h-7 rounded-[4px] transition-all duration-150"
                style={{
                  background: isMobile ? "#3a3a3a" : "transparent",
                  color: isMobile ? "#fff" : "#78716c",
                }}
              >
                <Smartphone size={14} strokeWidth={1.5} />
              </button>
            </div>

            <button
              onClick={() => {
                setPhase("review");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium transition-all duration-150"
              style={{ color: "#a8a29e", border: "1px solid #2a2a2a" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#2a2a2a"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <RotateCcw size={12} strokeWidth={2} />
              Back to revisions
            </button>

            <button
              onClick={confirmFinalReview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-white transition-all duration-150"
              style={{ background: brandPrimary }}
              onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
            >
              Approve & launch
              <ArrowRight size={12} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Page tabs */}
        {pageList.length > 1 && (
          <div
            className="flex items-center gap-0.5 px-4 flex-shrink-0 overflow-x-auto"
            style={{ height: 36, borderBottom: "1px solid #2a2a2a" }}
          >
            {pageList.map((page, i) => (
              <button
                key={i}
                onClick={() => setFinalReviewPageIndex(i)}
                className="flex items-center px-3 py-1 rounded-[4px] text-[11px] font-medium whitespace-nowrap transition-all duration-150"
                style={{
                  color: i === finalReviewPageIndex ? "#fff" : "#78716c",
                  background: i === finalReviewPageIndex ? "#2a2a2a" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (i !== finalReviewPageIndex) e.currentTarget.style.color = "#a8a29e";
                }}
                onMouseLeave={(e) => {
                  if (i !== finalReviewPageIndex) e.currentTarget.style.color = "#78716c";
                }}
              >
                {page.label}
              </button>
            ))}
          </div>
        )}

        {/* Preview area */}
        <div className="flex-1 flex items-start justify-center overflow-hidden p-6">
          <div
            className="flex flex-col h-full transition-all duration-150"
            style={{
              width: isMobile ? 375 : "100%",
              maxWidth: isMobile ? 375 : "100%",
            }}
          >
            {/* Browser chrome */}
            <div
              className="flex items-center gap-2 px-4 flex-shrink-0 rounded-t-[8px]"
              style={{ height: 36, background: "#fff" }}
            >
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#e7e5e4" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#e7e5e4" }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#e7e5e4" }} />
              </div>
              <div
                className="flex-1 mx-4 px-3 py-1 rounded-[4px] text-[11px] text-center"
                style={{ background: "#f5f5f4", color: "#a8a29e" }}
              >
                {siteDomain}{pageList.length > 1 ? `/${currentPage.slug}` : ""}
              </div>
            </div>

            {/* Iframe */}
            <div
              className="flex-1 relative overflow-hidden"
              style={{ background: brandBg, borderRadius: "0 0 8px 8px" }}
            >
              <iframe
                key={`${currentPage.slug}-${finalReviewViewport}`}
                src={previewUrl}
                className="border-0 absolute inset-0"
                style={{
                  width: isMobile ? 375 : "100%",
                  height: "100%",
                  background: brandBg,
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom status bar */}
        <div
          className="flex items-center justify-between px-4 flex-shrink-0"
          style={{ height: 32, borderTop: "1px solid #2a2a2a" }}
        >
          <div className="flex items-center gap-3">
            <span className="text-[11px]" style={{ color: "#78716c" }}>
              {pageList.length} page{pageList.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[11px]" style={{ color: "#525252" }}>
              {finalReviewPageIndex + 1} of {pageList.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFinalReviewPageIndex(Math.max(0, finalReviewPageIndex - 1))}
              disabled={finalReviewPageIndex === 0}
              className="w-5 h-5 flex items-center justify-center rounded-[3px] transition-all duration-150"
              style={{
                color: finalReviewPageIndex === 0 ? "#3a3a3a" : "#78716c",
              }}
              onMouseEnter={(e) => {
                if (finalReviewPageIndex > 0) e.currentTarget.style.background = "#2a2a2a";
              }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <ChevronLeft size={14} strokeWidth={2} />
            </button>
            <button
              onClick={() => setFinalReviewPageIndex(Math.min(pageList.length - 1, finalReviewPageIndex + 1))}
              disabled={finalReviewPageIndex >= pageList.length - 1}
              className="w-5 h-5 flex items-center justify-center rounded-[3px] transition-all duration-150"
              style={{
                color: finalReviewPageIndex >= pageList.length - 1 ? "#3a3a3a" : "#78716c",
              }}
              onMouseEnter={(e) => {
                if (finalReviewPageIndex < pageList.length - 1) e.currentTarget.style.background = "#2a2a2a";
              }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── LAUNCH PHASE ────────────────────────────────────────────────
  if (phase === "launch") {
    const selectedBrand = brandSelected !== null ? brandOptions[brandSelected] : null;
    const brandPrimary = selectedBrand?.colors.primary || "#4f46e5";
    const brandBg = selectedBrand?.colors.background || "#fafaf9";
    const siteDomain = selectedBrand?.domains[0] || "yoursite.com";
    const siteUrl = `https://${siteDomain}`;
    const repoName = siteDomain.replace(/\.com|\.co|\.io|\.app/g, "").replace(/\./g, "-");
    const repoUrl = `https://github.com/${repoName}/${repoName}`;
    const vercelUrl = `https://vercel.com/${repoName}`;
    const previewDomain = `${repoName}.vercel.app`;
    const previewUrl = `/${projects[0]?.slug || "outbound-email"}?embed=1`;
    const doneCount = launchSteps.filter(s => s.status === "done").length;
    const progress = launchSteps.length > 0 ? Math.round((doneCount / launchSteps.length) * 100) : 0;

    // Show live site after deployment completes (with brief delay)
    if (launchComplete && !launchLive) {
      setTimeout(() => setLaunchLive(true), 600);
    }

    return (
      <div className="flex flex-col" style={{ height: "100dvh", background: "#fafaf9" }}>
        {!launchComplete ? (
          /* ── Deploying state ── */
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-full max-w-[400px] px-6">
              <div className="flex flex-col items-center">
                {/* Spinner */}
                <div
                  className="w-10 h-10 rounded-full mb-8"
                  style={{
                    border: `2.5px solid #e7e5e4`,
                    borderTopColor: brandPrimary,
                    animation: "spin 0.8s linear infinite",
                  }}
                />

                {/* Steps */}
                <div className="w-full flex flex-col gap-3 mb-8">
                  {launchSteps.map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                        {step.status === "done" ? (
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: brandPrimary }}
                          >
                            <Check size={11} strokeWidth={2.5} color="#fff" />
                          </div>
                        ) : step.status === "active" ? (
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{
                              border: `2px solid ${brandPrimary}`,
                              borderTopColor: "transparent",
                              animation: "spin 0.8s linear infinite",
                            }}
                          />
                        ) : (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: "#d6d3d1" }}
                          />
                        )}
                      </div>
                      <span
                        className="text-[13px]"
                        style={{
                          color: step.status === "done" ? "#1a1a1a" : step.status === "active" ? "#1a1a1a" : "#a8a29e",
                          fontWeight: step.status === "active" ? 500 : 400,
                        }}
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "#e7e5e4" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${progress}%`,
                      background: brandPrimary,
                      transition: "width 300ms ease-out",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : !launchLive ? (
          /* ── Brief success moment ── */
          <div className="flex-1 flex flex-col items-center justify-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: brandPrimary }}
            >
              <Check size={20} strokeWidth={2.5} color="#fff" />
            </div>
          </div>
        ) : (
          /* ── Live site view ── */
          <>
            {/* Top bar */}
            <div
              className="flex items-center justify-between flex-shrink-0 px-4"
              style={{ height: 48, borderBottom: "1px solid #e7e5e4" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-[4px] flex items-center justify-center"
                  style={{ background: brandPrimary }}
                >
                  <span className="text-[10px] font-semibold text-white">
                    {(selectedBrand?.name || "S").charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-[13px] font-medium" style={{ color: "#1a1a1a" }}>
                  Your site is live
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-[3px] font-medium"
                  style={{ background: "#ecfdf5", color: "#059669" }}
                >
                  Deployed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={confirmLaunch}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-medium text-white transition-all duration-150"
                  style={{ background: brandPrimary }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
                >
                  Connect domain
                  <ArrowRight size={12} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Main content */}
            <div className="flex-1 flex overflow-hidden" style={{ background: "#e7e5e4" }}>
              {/* Site preview */}
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Browser chrome */}
                <div
                  className="flex items-center gap-2 px-4 flex-shrink-0"
                  style={{ height: 36, background: "#fff", borderBottom: "1px solid #e7e5e4" }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#e7e5e4" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#e7e5e4" }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#e7e5e4" }} />
                  </div>
                  <div
                    className="flex-1 mx-8 px-3 py-1 rounded-[4px] text-[11px] text-center flex items-center justify-center gap-1.5"
                    style={{ background: "#f5f5f4", color: "#a8a29e" }}
                  >
                    <Lock size={9} strokeWidth={2} />
                    {previewDomain}
                  </div>
                </div>
                {/* Iframe */}
                <div className="flex-1 relative">
                  <iframe
                    src={previewUrl}
                    className="w-full h-full border-0"
                    style={{ background: brandBg }}
                  />
                </div>
              </div>

              {/* Right panel — deploy info */}
              <div
                className="flex flex-col flex-shrink-0"
                style={{ width: 280, borderLeft: "1px solid #e7e5e4", background: "#fff" }}
              >
                <div className="flex-1 overflow-y-auto px-4 py-5">
                  {/* Domain */}
                  <div className="mb-5">
                    <span className="text-[11px] font-medium block mb-2" style={{ color: "#a8a29e" }}>
                      LIVE URL
                    </span>
                    <div
                      className="flex items-center justify-between px-3 py-2 rounded-[6px]"
                      style={{ background: "#f5f5f4" }}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Globe size={13} strokeWidth={1.5} style={{ color: brandPrimary }} />
                        <span className="text-[12px] font-medium truncate" style={{ color: "#1a1a1a" }}>
                          {previewDomain}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://${previewDomain}`).catch(() => {});
                          setLaunchCopied(true);
                          setTimeout(() => setLaunchCopied(false), 2000);
                        }}
                        className="flex-shrink-0 ml-2"
                        style={{ color: launchCopied ? brandPrimary : "#a8a29e" }}
                      >
                        {launchCopied ? <Check size={12} strokeWidth={2} /> : <Copy size={12} strokeWidth={2} />}
                      </button>
                    </div>
                  </div>

                  {/* GitHub */}
                  <div className="mb-5">
                    <span className="text-[11px] font-medium block mb-2" style={{ color: "#a8a29e" }}>
                      GITHUB REPOSITORY
                    </span>
                    <button
                      onClick={() => window.open(repoUrl, "_blank")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-left transition-all duration-150"
                      style={{ background: "#f5f5f4" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#eeeceb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#f5f5f4"; }}
                    >
                      <Github size={14} strokeWidth={1.5} style={{ color: "#1a1a1a" }} />
                      <span className="text-[12px] truncate" style={{ color: "#1a1a1a" }}>
                        {repoName}/{repoName}
                      </span>
                      <ExternalLink size={10} strokeWidth={2} className="ml-auto flex-shrink-0" style={{ color: "#a8a29e" }} />
                    </button>
                  </div>

                  {/* Vercel */}
                  <div className="mb-5">
                    <span className="text-[11px] font-medium block mb-2" style={{ color: "#a8a29e" }}>
                      VERCEL PROJECT
                    </span>
                    <button
                      onClick={() => window.open(vercelUrl, "_blank")}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-left transition-all duration-150"
                      style={{ background: "#f5f5f4" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#eeeceb"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#f5f5f4"; }}
                    >
                      <Zap size={14} strokeWidth={1.5} style={{ color: "#1a1a1a" }} />
                      <span className="text-[12px] truncate" style={{ color: "#1a1a1a" }}>
                        {repoName}
                      </span>
                      <ExternalLink size={10} strokeWidth={2} className="ml-auto flex-shrink-0" style={{ color: "#a8a29e" }} />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px mb-5" style={{ background: "#e7e5e4" }} />

                  {/* Project summary */}
                  <div className="flex flex-col gap-3">
                    {[
                      { label: "Deliverables", value: `${specData?.sections?.reduce((sum, s) => sum + s.items.length, 0) || 0}` },
                      { label: "Timeline", value: specData?.timeline || "—" },
                      { label: "Investment", value: `$${decomposeItems.reduce((sum, item) => sum + item.tasks.filter(t => t.included).reduce((s, t) => s + t.price, 0), 0).toLocaleString()}` },
                      { label: "Domain", value: siteDomain },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-[11px]" style={{ color: "#a8a29e" }}>{item.label}</span>
                        <span className="text-[12px] font-medium" style={{ color: "#1a1a1a" }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom bar with ownership message */}
                <div
                  className="flex-shrink-0 px-4 py-3"
                  style={{ borderTop: "1px solid #e7e5e4" }}
                >
                  <p className="text-[11px] text-center" style={{ color: "#a8a29e" }}>
                    You own everything — code, domain, and hosting.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  // ── DOMAIN PHASE ───────────────────────────────────────────────
  if (phase === "domain") {
    const selectedBrand = brandSelected !== null ? brandOptions[brandSelected] : null;
    const brandPrimary = selectedBrand?.colors.primary || "#4f46e5";
    const brandDomains = selectedBrand?.domains || ["yoursite.com"];
    const repoName = brandDomains[0].replace(/\.com|\.co|\.io|\.app/g, "").replace(/\./g, "-");
    const vercelDomain = `${repoName}.vercel.app`;
    const activeDomain = domainCustomMode
      ? domainCustom.trim()
      : domainSelected !== null
        ? brandDomains[domainSelected]
        : null;
    const hasDomain = activeDomain && activeDomain.length > 0;

    return (
      <div className="flex flex-col items-center" style={{ height: "100dvh", background: "#fafaf9" }}>
        {/* Top bar */}
        <div
          className="w-full flex items-center justify-between flex-shrink-0 px-6"
          style={{ height: 52, borderBottom: "1px solid #e7e5e4" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-6 h-6 rounded-[4px] flex items-center justify-center"
              style={{ background: brandPrimary }}
            >
              <span className="text-[10px] font-semibold text-white">
                {(selectedBrand?.name || "S").charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-[13px] font-medium" style={{ color: "#1a1a1a" }}>
              Connect domain
            </span>
          </div>
          <button
            onClick={confirmDomain}
            className="text-[12px] font-medium transition-all duration-150"
            style={{ color: "#a8a29e" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#78716c"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#a8a29e"; }}
          >
            Skip for now
          </button>
        </div>

        {/* Center content */}
        <div className="flex-1 flex items-center justify-center w-full px-6">
          <div className="w-full max-w-[440px]">
            {!domainConnected ? (
              <>
                {/* Current deployment info */}
                <div className="mb-8">
                  <div
                    className="flex items-center gap-2 px-3 py-2 rounded-[6px]"
                    style={{ background: "#f5f5f4" }}
                  >
                    <Lock size={11} strokeWidth={2} style={{ color: "#a8a29e" }} />
                    <span className="text-[12px]" style={{ color: "#78716c" }}>{vercelDomain}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-[3px] ml-auto"
                      style={{ background: "#ecfdf5", color: "#059669" }}
                    >
                      Active
                    </span>
                  </div>
                </div>

                {/* Domain selection */}
                {!domainConnecting && !domainPurchasing && (
                  <>
                    <div className="flex flex-col gap-2 mb-4">
                      {brandDomains.map((domain, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setDomainSelected(i);
                            setDomainCustomMode(false);
                            setDomainAvailable(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-[6px] text-left transition-all duration-150"
                          style={{
                            background: !domainCustomMode && domainSelected === i ? `${brandPrimary}0a` : "#fff",
                            border: `1.5px solid ${!domainCustomMode && domainSelected === i ? brandPrimary : "#e7e5e4"}`,
                          }}
                          onMouseEnter={(e) => {
                            if (domainCustomMode || domainSelected !== i) e.currentTarget.style.borderColor = "#d6d3d1";
                          }}
                          onMouseLeave={(e) => {
                            if (domainCustomMode || domainSelected !== i) e.currentTarget.style.borderColor = "#e7e5e4";
                          }}
                        >
                          <Globe size={14} strokeWidth={1.5} style={{ color: !domainCustomMode && domainSelected === i ? brandPrimary : "#a8a29e" }} />
                          <span className="text-[13px] font-medium" style={{ color: "#1a1a1a" }}>{domain}</span>
                          <span className="text-[11px] ml-auto" style={{ color: "#a8a29e" }}>$12/yr</span>
                        </button>
                      ))}
                    </div>

                    {/* Custom domain option */}
                    <div className="mb-6">
                      {!domainCustomMode ? (
                        <button
                          onClick={() => {
                            setDomainCustomMode(true);
                            setDomainSelected(null);
                            setDomainAvailable(null);
                          }}
                          className="text-[12px] font-medium transition-all duration-150"
                          style={{ color: "#a8a29e" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#78716c"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#a8a29e"; }}
                        >
                          Use a different domain
                        </button>
                      ) : (
                        <div
                          className="flex items-center gap-2 px-3 py-2 rounded-[6px]"
                          style={{ border: `1.5px solid ${brandPrimary}`, background: `${brandPrimary}0a` }}
                        >
                          <Globe size={14} strokeWidth={1.5} style={{ color: brandPrimary }} />
                          <input
                            type="text"
                            value={domainCustom}
                            onChange={(e) => {
                              setDomainCustom(e.target.value);
                              setDomainAvailable(null);
                            }}
                            placeholder="yourdomain.com"
                            className="flex-1 bg-transparent text-[13px] font-medium outline-none"
                            style={{ color: "#1a1a1a" }}
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              setDomainCustomMode(false);
                              setDomainCustom("");
                              setDomainAvailable(null);
                            }}
                            className="flex-shrink-0"
                            style={{ color: "#a8a29e" }}
                          >
                            <X size={12} strokeWidth={2} />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Availability check result */}
                    {domainAvailable !== null && !domainChecking && (
                      <div className="mb-4">
                        {domainAvailable ? (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-[6px]" style={{ background: "#ecfdf5" }}>
                            <Check size={13} strokeWidth={2} style={{ color: "#059669" }} />
                            <span className="text-[12px] font-medium" style={{ color: "#059669" }}>
                              {activeDomain} is available
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-[6px]" style={{ background: "#fef2f2" }}>
                            <X size={13} strokeWidth={2} style={{ color: "#dc2626" }} />
                            <span className="text-[12px] font-medium" style={{ color: "#dc2626" }}>
                              {activeDomain} is not available
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex flex-col gap-2">
                      {!domainAvailable ? (
                        <button
                          onClick={checkDomainAvailability}
                          disabled={!hasDomain || domainChecking}
                          className="w-full py-2.5 rounded-[6px] text-[13px] font-medium text-white transition-all duration-150 disabled:opacity-40"
                          style={{ background: brandPrimary }}
                          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = "brightness(1.1)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
                        >
                          {domainChecking ? (
                            <span className="flex items-center justify-center gap-2">
                              <span
                                className="w-3.5 h-3.5 rounded-full"
                                style={{
                                  border: "2px solid rgba(255,255,255,0.3)",
                                  borderTopColor: "#fff",
                                  animation: "spin 0.8s linear infinite",
                                  display: "inline-block",
                                }}
                              />
                              Checking availability
                            </span>
                          ) : (
                            "Check availability"
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={purchaseDomain}
                          className="w-full py-2.5 rounded-[6px] text-[13px] font-medium text-white transition-all duration-150"
                          style={{ background: brandPrimary }}
                          onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
                        >
                          Purchase {activeDomain} — $12/yr
                        </button>
                      )}
                    </div>
                  </>
                )}

                {/* Purchasing state */}
                {domainPurchasing && (
                  <div className="flex flex-col items-center py-8">
                    <div
                      className="w-8 h-8 rounded-full mb-4"
                      style={{
                        border: "2.5px solid #e7e5e4",
                        borderTopColor: brandPrimary,
                        animation: "spin 0.8s linear infinite",
                      }}
                    />
                    <span className="text-[13px]" style={{ color: "#78716c" }}>Processing payment</span>
                  </div>
                )}

                {/* DNS propagation state */}
                {domainConnecting && (
                  <div className="flex flex-col py-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[13px] font-medium" style={{ color: "#1a1a1a" }}>Connecting {activeDomain}</span>
                      <span className="text-[11px]" style={{ color: "#a8a29e" }}>{domainProgress}%</span>
                    </div>
                    <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: "#e7e5e4" }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${domainProgress}%`,
                          background: brandPrimary,
                          transition: "width 300ms ease-out",
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-2 mt-5">
                      {[
                        { label: "DNS records configured", done: domainProgress > 20 },
                        { label: "SSL certificate issued", done: domainProgress > 50 },
                        { label: "Propagation complete", done: domainProgress >= 100 },
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                            {step.done ? (
                              <div
                                className="w-4 h-4 rounded-full flex items-center justify-center"
                                style={{ background: brandPrimary }}
                              >
                                <Check size={9} strokeWidth={2.5} color="#fff" />
                              </div>
                            ) : (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{
                                  border: `2px solid ${brandPrimary}`,
                                  borderTopColor: "transparent",
                                  animation: "spin 0.8s linear infinite",
                                }}
                              />
                            )}
                          </div>
                          <span
                            className="text-[12px]"
                            style={{ color: step.done ? "#1a1a1a" : "#a8a29e" }}
                          >
                            {step.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* ── Domain connected success ── */
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                  style={{ background: brandPrimary }}
                >
                  <Check size={16} strokeWidth={2.5} color="#fff" />
                </div>
                <span className="text-[15px] font-medium mb-1" style={{ color: "#1a1a1a" }}>
                  {activeDomain}
                </span>
                <span className="text-[12px] mb-8" style={{ color: "#a8a29e" }}>
                  Connected and live
                </span>
                <button
                  onClick={confirmDomain}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-[6px] text-[13px] font-medium text-white transition-all duration-150"
                  style={{ background: brandPrimary }}
                  onMouseEnter={(e) => { e.currentTarget.style.filter = "brightness(1.1)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.filter = "none"; }}
                >
                  View project
                  <ArrowRight size={12} strokeWidth={2} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── BROWSE PHASE (existing carousel) ────────────────────────────
  return (
    <div className="flex flex-col overflow-hidden relative isolate" style={{ height: '100dvh' }}>
      {/* Background atmosphere */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Dot grid — gravitational field */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ width: '100%', height: '100%' }}
        />
        {/* Grain texture */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.04 }}>
          <filter id="bg-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#bg-grain)" />
        </svg>
      </div>

      {/* Card slideshow */}
      <div
        ref={scrollRef}
        className={`flex-1 flex items-center overflow-x-auto ${(previewSlug || isClosing) ? '' : 'snap-x snap-mandatory'}`}
        onPointerDown={() => setKeyNav(false)}
        onWheel={(e) => { if (previewSlug) e.preventDefault(); }}
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: 'touch' as never,
          gap: isMobile ? 32 : 40,
          paddingLeft: `calc(50vw - ${cardW / 2}px)`,
          paddingRight: `calc(50vw - ${cardW / 2}px)`,
          transform: chatActive ? (isMobile ? 'scale(0.98) translateY(-4px)' : 'scale(0.94) translateY(-12px)') : 'scale(1) translateY(0)',
          transformOrigin: 'center center',
          transition: 'transform 400ms cubic-bezier(0.32, 0.72, 0, 1)',
          ...((previewSlug || isClosing)
            ? { touchAction: "none" }
            : {}),
        }}
      >
        {displayProjects.map((project, idx) => {
          const isBuiltCard = builtProject !== null && idx === 0;
          const TypeIcon = typeConfig[project.type].icon;
          const progress = getProgress(project.slug);
          const isSubmitted = submitted[project.slug];
          const isDrawerOpen = openDrawer === project.slug;
          const isFocused = idx === focusedIndex;
          const isPreviewing = previewSlug === project.slug;
          const cardAccent = isBuiltCard ? (brandOptions[brandSelected ?? 0]?.colors.primary || "#4f46e5") : "#4f46e5";

          const cardStyle = getCardStyle(isPreviewing, isFocused, (chatBySlug[project.slug]?.length ?? 0) > 0);
          return (
            <div
              key={project.slug}
              className="flex-shrink-0 relative snap-center"
              {...(isFocused ? { 'data-tour': 'card' } : {})}
              style={{
                width: cardStyle.width,
                height: cardStyle.height,
                transform: cardStyle.transform,
                opacity: cardStyle.opacity,
                transition: cardStyle.transition,
                transitionDelay: `${Math.abs(idx - focusedIndex) * 30}ms`,
                willChange: 'transform, opacity',
                outline: keyNav && isFocused ? '2px solid #4f46e5' : 'none',
                outlineOffset: 4,
              }}
            >
              <div
                className="absolute inset-0 overflow-hidden bg-card"
                style={{
                  borderRadius: cardStyle.borderRadius,
                  border: cardStyle.border,
                  boxShadow: cardStyle.boxShadow,
                  transition: cardStyle.transition,
                }}
              >
              {/* Card face — static content */}
              <div
                className="absolute inset-0 flex flex-col p-6"
                style={{
                  opacity: isPreviewing ? 0 : 1,
                  pointerEvents: isPreviewing ? "none" : "auto",
                  transition: isPreviewing
                    ? "opacity 80ms ease-out"
                    : "opacity 250ms ease-out 200ms",
                }}
              >
                {/* Type badge + code + activity dot */}
                <div className="flex items-center gap-2">
                  <TypeIcon
                    size={isMobile ? 14 : 12}
                    strokeWidth={1.5}
                    className="text-muted"
                  />
                  <span className={`${isMobile ? 'text-[13px]' : 'text-[12px]'} text-muted tracking-[0.05em] uppercase`}>
                    {project.type}
                  </span>
                  <span className={`${isMobile ? 'text-[13px]' : 'text-[12px]'} text-muted tabular-nums ml-auto`}>
                    {project.code}
                  </span>
                  {(chatBySlug[project.slug]?.length ?? 0) > 0 && (
                    <div
                      className="w-[5px] h-[5px] rounded-full"
                      style={{ background: cardAccent }}
                    />
                  )}
                </div>

                {/* Title + description */}
                <h2 className={`${isMobile ? 'text-[24px]' : 'text-[22px]'} font-medium text-foreground mt-3 leading-[1.25] tracking-[-0.02em]`}>
                  {project.name}
                </h2>
                <p className={`${isMobile ? 'text-[15px]' : 'text-[14px]'} text-secondary-foreground leading-[1.6] mt-1`} style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as const, overflow: 'hidden' }}>
                  {project.description}
                </p>

                {/* Deliverables — clickable, sends prompt to control panel */}
                <ul className="mt-3 space-y-0" {...(isFocused ? { 'data-tour': 'deliverables' } : {})}>
                  {project.deliverables.map((d, i) => (
                    <li key={i}>
                      <button
                        onClick={() => {
                          if (isFocused && !chatLoading) {
                            const prompt = project.type === "Workflow"
                              ? `How would we implement "${d}" in the ${project.name} workflow? What systems and integrations does it touch?`
                              : `What's the user experience for "${d}" in ${project.name}? How should it work end-to-end?`;
                            sendChat(prompt);
                          }
                        }}
                        disabled={!isFocused || chatLoading}
                        className={`group/deliv flex items-start gap-2 ${isMobile ? 'text-[14px]' : 'text-[13px]'} leading-[1.5] text-muted text-left w-full py-0.5 rounded-[4px] transition-colors duration-150`}
                        onMouseEnter={(e) => { if (isFocused) e.currentTarget.style.color = '#1a1a1a'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                        style={{ cursor: isFocused && !chatLoading ? 'pointer' : 'default' }}
                      >
                        <span className="w-[3px] h-[3px] rounded-full mt-[8px] flex-shrink-0" style={{ background: '#c4c0bc' }} />
                        <span className="flex-1">{d}</span>
                        <Zap size={10} strokeWidth={2} className="flex-shrink-0 mt-[5px] opacity-0 group-hover/deliv:opacity-40 transition-opacity duration-150" style={{ color: cardAccent }} />
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Activity — last AI response preview */}
                <div className="flex-1 flex flex-col justify-end pb-2">
                  {(() => {
                    const projectMessages = chatBySlug[project.slug] || [];
                    const lastAssistant = [...projectMessages].reverse().find(m => m.from === 'assistant');
                    if (!lastAssistant) return null;
                    const clean = lastAssistant.text.replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/^#+\s*/gm, '').replace(/^-\s*/gm, '');
                    return (
                      <p
                        className={`${isMobile ? 'text-[13px]' : 'text-[11px]'} leading-[1.5] text-muted`}
                        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', opacity: isFocused ? 0.7 : 0.4, transition: 'opacity 150ms ease-out' }}
                      >
                        {clean.slice(0, 140)}
                      </p>
                    );
                  })()}
                </div>

                {/* Price + progress */}
                <div className="border-t border-border pt-3 mt-3" {...(isFocused ? { 'data-tour': 'pricing' } : {})}>
                  <div className="flex items-baseline gap-1.5">
                    {tourCompleted ? (
                      <>
                        <span className={`${isMobile ? 'text-[22px]' : 'text-[20px]'} font-medium tabular-nums leading-none tracking-[-0.02em]`} style={{ color: cardAccent }}>
                          ${Math.round(project.estimate * 0.3).toLocaleString()}
                        </span>
                        <span className={`${isMobile ? 'text-[14px]' : 'text-[13px]'} line-through`} style={{ color: '#d6d3d1' }}>
                          ${(project.estimate / 2).toLocaleString()}
                        </span>
                        <span className={`${isMobile ? 'text-[14px]' : 'text-[13px]'} text-muted`}>
                          / ${Math.round(project.estimate * 0.6).toLocaleString()}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`${isMobile ? 'text-[22px]' : 'text-[20px]'} font-medium tabular-nums text-foreground leading-none tracking-[-0.02em]`}>
                          ${(project.estimate / 2).toLocaleString()}
                        </span>
                        <span className={`${isMobile ? 'text-[14px]' : 'text-[13px]'} text-muted`}>
                          / ${project.estimate.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action row */}
                  <div className="flex items-center gap-1.5 mt-3">
                    <button
                      onClick={() => {
                        setPreviewSlug(project.slug);
                        setPreviewMode(isMobile ? "fullscreen" : "desktop");
                      }}
                      className={`flex-1 h-10 flex items-center justify-center rounded-[6px] ${isMobile ? 'text-[14px]' : 'text-[12px]'} font-medium text-white transition-all duration-150`}
                      style={{ background: cardAccent }}
                      onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.filter = 'none'; }}
                      {...(isFocused ? { 'data-tour': 'view-project' } : {})}
                    >
                      View project
                    </button>
                    {isSubmitted ? (
                      <div className="h-10 px-3 flex items-center justify-center gap-1.5 rounded-[6px]" style={{ background: 'rgba(5,150,105,0.08)' }}>
                        <Check
                          size={isMobile ? 13 : 11}
                          strokeWidth={2}
                          style={{ color: '#059669' }}
                        />
                        <span className={`${isMobile ? 'text-[13px]' : 'text-[11px]'} font-medium`} style={{ color: '#059669' }}>
                          Submitted
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setOpenDrawer(project.slug)}
                        className={`h-10 px-3 flex items-center justify-center rounded-[6px] ${isMobile ? 'text-[13px]' : 'text-[11px]'} transition-colors duration-150`}
                        style={{ color: '#78716c', border: '1px solid #e7e5e4' }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#a8a29e'; e.currentTarget.style.color = '#1a1a1a'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e7e5e4'; e.currentTarget.style.color = '#78716c'; }}
                        {...(isFocused ? { 'data-tour': 'next-steps' } : {})}
                      >
                        Next steps
                      </button>
                    )}
                    <a
                      href={`${REPO_BASE}/${project.slug}/page.tsx`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-10 h-10 rounded-[6px] transition-colors duration-150"
                      style={{ color: '#a8a29e', border: '1px solid #e7e5e4' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#1a1a1a'; e.currentTarget.style.borderColor = '#a8a29e'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#a8a29e'; e.currentTarget.style.borderColor = '#e7e5e4'; }}
                    >
                      <Github size={13} strokeWidth={1.5} />
                    </a>
                  </div>
                </div>
              </div>

              {/* Live preview — iframe layer */}
              <div
                className="absolute inset-0 flex flex-col"
                style={{
                  opacity: isPreviewing ? 1 : 0,
                  pointerEvents: isPreviewing ? "auto" : "none",
                  transition: isPreviewing
                    ? "opacity 200ms ease-out 150ms"
                    : "opacity 80ms ease-out",
                }}
              >
                {/* Browser chrome — address bar at top */}
                <div
                  className="flex items-center gap-2 px-2.5 flex-shrink-0"
                  style={{
                    height: 44,
                    background: '#f5f5f4',
                    borderBottom: '1px solid #e7e5e4',
                    borderRadius: previewMode === "mobile" && isMobile
                      ? '35px 35px 0 0'
                      : previewMode === "desktop" || previewMode === "mobile"
                        ? '11px 11px 0 0'
                        : '0',
                    transition: 'border-radius 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                >
                  {/* Close dot */}
                  <button
                    onClick={closePreview}
                    className="w-3 h-3 rounded-full flex-shrink-0 transition-opacity duration-150 hover:opacity-80"
                    style={{ background: '#dc2626' }}
                  />

                  {/* Address bar */}
                  <a
                    href={`https://${SITE_DOMAIN}/${project.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 h-[22px] rounded-[4px] min-w-0 transition-colors duration-150 hover:bg-[#e7e5e4]"
                    style={{ background: '#eceae9' }}
                  >
                    <Lock size={9} strokeWidth={2} style={{ color: '#a8a29e', flexShrink: 0 }} />
                    <span className="text-[11px] truncate" style={{ color: '#78716c' }}>
                      {SITE_DOMAIN}/{project.slug}
                    </span>
                  </a>

                  {/* Mode toggle */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => setPreviewMode("mobile")}
                      className={`w-6 h-6 rounded-[4px] flex items-center justify-center transition-all duration-150 ${
                        previewMode === "mobile"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      <Smartphone size={11} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => setPreviewMode("desktop")}
                      className={`w-6 h-6 rounded-[4px] flex items-center justify-center transition-all duration-150 ${
                        previewMode === "desktop"
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted hover:text-foreground"
                      }`}
                    >
                      <Monitor size={11} strokeWidth={1.5} />
                    </button>
                  </div>

                  {/* Fullscreen */}
                  <button
                    onClick={() => setPreviewMode("fullscreen")}
                    className="w-6 h-6 rounded-[4px] flex items-center justify-center text-muted hover:text-foreground transition-all duration-150 flex-shrink-0"
                  >
                    <Maximize2 size={11} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Iframe viewport */}
                <div
                  className="flex-1 relative overflow-hidden"
                >
                  {isPreviewing && (
                    <>
                      {/* Loading skeleton */}
                      {!iframeLoaded[project.slug] && (
                        <div className="absolute inset-0 flex flex-col gap-3 p-5" style={{ background: '#ffffff' }}>
                          <div className="h-3 rounded" style={{ width: '60%', background: '#e7e5e4', animation: 'pulse 1.5s ease-in-out infinite' }} />
                          <div className="h-3 rounded" style={{ width: '80%', background: '#e7e5e4', animation: 'pulse 1.5s ease-in-out 0.1s infinite' }} />
                          <div className="h-3 rounded" style={{ width: '45%', background: '#e7e5e4', animation: 'pulse 1.5s ease-in-out 0.2s infinite' }} />
                          <div className="h-24 rounded mt-2" style={{ background: '#f5f5f4', animation: 'pulse 1.5s ease-in-out 0.3s infinite' }} />
                          <div className="h-3 rounded" style={{ width: '70%', background: '#e7e5e4', animation: 'pulse 1.5s ease-in-out 0.4s infinite' }} />
                        </div>
                      )}
                      {/* Mobile iframe — 375px scaled to fit, centered */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          opacity: previewMode === "mobile" && iframeLoaded[project.slug] ? 1 : 0,
                          pointerEvents:
                            previewMode === "mobile" ? "auto" : "none",
                          transition: "opacity 150ms ease-out",
                          background: isMobile ? 'transparent' : '#f5f5f4',
                        }}
                      >
                        {(() => {
                          const availH = (isMobile ? cardH : desktopH) - 44;
                          const phoneH = Math.min(mobileH - 32, availH - 12);
                          const phoneW = Math.round(phoneH * (MOBILE_FRAME_W / (MOBILE_FRAME_H - 32)));
                          const iframeScale = phoneW / MOBILE_IFRAME_W;
                          return (
                            <div
                              style={{
                                width: phoneW,
                                height: phoneH,
                                borderRadius: isMobile ? 0 : 20,
                                overflow: "hidden",
                                position: "relative",
                                flexShrink: 0,
                                boxShadow: isMobile ? 'none' : '0 8px 40px rgba(0,0,0,0.1)',
                                border: isMobile ? 'none' : '1px solid #e7e5e4',
                                background: '#ffffff',
                              }}
                            >
                              <div
                                style={{
                                  position: "absolute",
                                  top: 0,
                                  left: 0,
                                  width: MOBILE_IFRAME_W,
                                  height: MOBILE_IFRAME_H,
                                  transform: `scale(${iframeScale})`,
                                  transformOrigin: "top left",
                                }}
                              >
                                <iframe
                                  src={`/${project.slug}?embed=1`}
                                  className="w-full h-full border-none"
                                  style={{ background: "#fff" }}
                                  title={`${project.name} — mobile`}
                                  onLoad={() => setIframeLoaded(prev => ({ ...prev, [project.slug]: true }))}
                                />
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                      {/* Desktop iframe — rendered at actual card size */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          opacity: previewMode === "desktop" && iframeLoaded[project.slug] ? 1 : 0,
                          pointerEvents:
                            previewMode === "desktop" ? "auto" : "none",
                          transition: "opacity 150ms ease-out",
                        }}
                      >
                        <iframe
                          src={`/${project.slug}?embed=1`}
                          style={{ width: "100%", height: "100%", border: "none", background: "#fff" }}
                          title={`${project.name} — desktop`}
                          onLoad={() => setIframeLoaded(prev => ({ ...prev, [project.slug]: true }))}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Drawer backdrop — click outside to close */}
              {isDrawerOpen && (
                <div
                  className="absolute inset-0 z-10"
                  onClick={() => setOpenDrawer(null)}
                />
              )}

              {/* Drawer glow — contained within card */}
              <div
                className="absolute inset-0 pointer-events-none z-[15]"
                style={{
                  opacity: isDrawerOpen ? 1 : 0,
                  transition: 'opacity 600ms ease-out',
                  background: 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(79,70,229,0.12) 0%, transparent 70%)',
                }}
              />

              {/* Inset drawer */}
              <div
                className="absolute bg-card flex flex-col z-20"
                style={{
                  left: 3,
                  right: 3,
                  bottom: 3,
                  maxHeight: cardH - 54,
                  borderRadius: 13,
                  transform: isDrawerOpen
                    ? "translateY(0)"
                    : "translateY(105%)",
                  transition: "transform 150ms ease-out, border-color 150ms ease-out, box-shadow 150ms ease-out",
                  boxShadow: isDrawerOpen
                    ? (chatBySlug[project.slug]?.length ?? 0) > 0
                      ? "0 0 0 1px rgba(79,70,229,0.08), 0 -4px 32px rgba(0,0,0,0.06)"
                      : "0 -4px 32px rgba(0,0,0,0.08)"
                    : "none",
                  pointerEvents: isDrawerOpen ? "auto" : "none",
                  border: isDrawerOpen && (chatBySlug[project.slug]?.length ?? 0) > 0
                    ? "1px solid rgba(79,70,229,0.25)"
                    : "1px solid #d6d3d1",
                }}
              >
                {/* Drawer header */}
                <div className="px-4 pt-4 pb-3 flex items-center justify-between flex-shrink-0">
                  <div className="min-w-0 flex-1 flex items-center gap-2.5">
                    <span className={`${isMobile ? 'text-[15px]' : 'text-[13px]'} font-medium text-foreground truncate`}>
                      {project.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {project.steps.map((_s, si) => {
                        const done = state[project.slug]?.[si]?.completed;
                        return (
                          <div
                            key={si}
                            className="w-1.5 h-1.5 rounded-full transition-all duration-150"
                            style={{
                              background: done ? '#059669' : 'transparent',
                              border: done ? 'none' : '1px solid #c4c0bc',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => setOpenDrawer(null)}
                    className="w-6 h-6 rounded-full flex items-center justify-center text-muted hover:text-foreground transition-colors duration-150 flex-shrink-0 ml-3"
                  >
                    <X size={14} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Drawer content */}
                <div className="flex flex-col px-4 pt-0.5 pb-4 overflow-y-auto min-h-0" style={{ scrollbarWidth: 'none', maskImage: 'linear-gradient(to bottom, transparent 0px, black 8px, black calc(100% - 16px), transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0px, black 8px, black calc(100% - 16px), transparent 100%)' }}>
                  <div className="flex flex-col space-y-2.5">
                    {project.steps.map((step, i) => {
                      const stepState = state[project.slug]?.[i];
                      const done = stepState?.completed;
                      const isStripeConnect = step.type === "confirm" && step.placeholder === "stripe-credentials";

                      /* Contextual question for Zap */
                      const askQ = step.type === "upload"
                        ? `What file format and content should I provide for "${step.label}" in ${project.name}?`
                        : step.type === "choice"
                        ? `Help me decide — what are the tradeoffs for each option in "${step.label}" for ${project.name}?`
                        : step.type === "input"
                        ? `What should I enter for "${step.label}" in ${project.name}? What format or details are expected?`
                        : `What does "${step.label}" involve for ${project.name}?`;

                      /* Radio circle — shared between complete and incomplete states */
                      const radioCircle = (
                        <div
                          className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150"
                          data-radio={`${project.slug}-${i}`}
                          style={done
                            ? { background: '#059669' }
                            : { border: '1.5px solid #d6d3d1' }
                          }
                        >
                          {done && <Check size={9} strokeWidth={2.5} className="text-white" />}
                        </div>
                      );

                      /* Shared label row with radio on right */
                      const labelRow = (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className={`${isMobile ? 'text-[13px]' : 'text-[11px]'} text-muted truncate`}>{step.label}</span>
                            <button
                              onClick={() => { if (!chatLoading) sendChat(askQ); }}
                              disabled={chatLoading}
                              className="w-4 h-4 rounded flex items-center justify-center transition-all duration-150 flex-shrink-0 opacity-0 group-hover/step:opacity-100"
                              style={{ color: '#a8a29e' }}
                              onMouseEnter={(e) => { e.currentTarget.style.color = '#4f46e5'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.color = '#a8a29e'; }}
                            >
                              <Zap size={9} strokeWidth={2} />
                            </button>
                          </div>
                          {radioCircle}
                        </div>
                      );

                      /* Complete a step + fire confetti from the radio */
                      const completeWithConfetti = (slug: string, idx: number, update: Partial<typeof stepState & Record<string, unknown>>) => {
                        updateStep(slug, idx, update);
                        const radio = document.querySelector(`[data-radio="${slug}-${idx}"]`);
                        if (radio) {
                          requestAnimationFrame(() => fireConfetti(radio as HTMLElement));
                        }
                      };

                      return (
                        <div
                          key={i}
                          className="group/step rounded-[8px] transition-all duration-150"
                          style={{
                            background: done ? 'rgba(5,150,105,0.04)' : '#f5f5f4',
                          }}
                          onMouseEnter={(e) => { if (!done) e.currentTarget.style.background = '#efedec'; }}
                          onMouseLeave={(e) => { if (!done) e.currentTarget.style.background = '#f5f5f4'; }}
                        >
                          {/* Completed state */}
                          {done ? (
                            <div className="flex items-center justify-between px-3.5 py-3">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <span className={`${isMobile ? 'text-[13px]' : 'text-[11px]'} text-muted line-through truncate`}>
                                  {step.label}
                                </span>
                                {(stepState?.value || stepState?.choice || stepState?.fileName || isStripeConnect) && (
                                  <span className="text-[10px]" style={{ color: '#c4c0bc' }}>&middot;</span>
                                )}
                                {stepState?.value && !isStripeConnect && <span className={`${isMobile ? 'text-[13px]' : 'text-[11px]'} truncate max-w-[100px]`} style={{ color: '#78716c' }}>{stepState.value}</span>}
                                {stepState?.choice && <span className={`${isMobile ? 'text-[13px]' : 'text-[11px]'}`} style={{ color: '#78716c' }}>{stepState.choice}</span>}
                                {stepState?.fileName && <span className={`${isMobile ? 'text-[13px]' : 'text-[11px]'} truncate max-w-[100px]`} style={{ color: '#78716c' }}>{stepState.fileName}</span>}
                                {isStripeConnect && <span className={`${isMobile ? 'text-[13px]' : 'text-[11px]'}`} style={{ color: '#78716c' }}>Connected</span>}
                              </div>
                              {radioCircle}
                            </div>
                          ) : (
                            <div className="px-3.5 py-3">
                              {/* Stripe credentials — inline connect */}
                              {isStripeConnect && (
                                <>
                                  {labelRow}
                                  <div className="mt-2.5 space-y-1.5">
                                    <input
                                      type="text"
                                      placeholder="Email or API key"
                                      className={`w-full ${isMobile ? 'h-10' : 'h-8'} px-3 rounded-[6px] ${isMobile ? 'text-[14px]' : 'text-[12px]'} text-foreground placeholder:text-muted focus:outline-none transition-colors duration-150`}
                                      style={{ background: '#ffffff', border: '1px solid #e7e5e4' }}
                                      onFocus={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; }}
                                      onBlur={(e) => { e.currentTarget.style.borderColor = '#e7e5e4'; }}
                                    />
                                    <div className="relative">
                                      <input
                                        type="password"
                                        placeholder="Secret key"
                                        className={`w-full ${isMobile ? 'h-10' : 'h-8'} px-3 pr-8 rounded-[6px] ${isMobile ? 'text-[14px]' : 'text-[12px]'} text-foreground placeholder:text-muted focus:outline-none transition-colors duration-150`}
                                        style={{ background: '#ffffff', border: '1px solid #e7e5e4' }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; }}
                                        onBlur={(e) => { e.currentTarget.style.borderColor = '#e7e5e4'; }}
                                      />
                                      <Lock size={12} strokeWidth={1.5} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                                    </div>
                                    <button
                                      onClick={() => completeWithConfetti(project.slug, i, { value: "Connected" })}
                                      className={`w-full ${isMobile ? 'h-10' : 'h-8'} rounded-[6px] flex items-center justify-center ${isMobile ? 'text-[14px]' : 'text-[12px]'} text-foreground transition-colors duration-150`}
                                      style={{ background: '#ffffff', border: '1px solid #e7e5e4' }}
                                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e7e5e4'; e.currentTarget.style.color = '#1a1a1a'; }}
                                    >
                                      Connect
                                    </button>
                                  </div>
                                  <p className={`mt-1.5 ${isMobile ? 'text-[12px]' : 'text-[10px]'} leading-[1.4] flex items-center gap-1`} style={{ color: '#a8a29e' }}>
                                    <Lock size={9} strokeWidth={1.5} className="flex-shrink-0" />
                                    Encrypted end-to-end
                                  </p>
                                </>
                              )}

                              {/* Confirm — generic (non-Stripe) */}
                              {step.type === "confirm" && !isStripeConnect && (
                                <>
                                  {labelRow}
                                  <button
                                    onClick={() => completeWithConfetti(project.slug, i, {})}
                                    className={`mt-2 w-full ${isMobile ? 'h-10' : 'h-8'} rounded-[6px] flex items-center justify-center ${isMobile ? 'text-[14px]' : 'text-[12px]'} text-foreground transition-colors duration-150`}
                                    style={{ background: '#ffffff', border: '1px solid #e7e5e4' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e7e5e4'; e.currentTarget.style.color = '#1a1a1a'; }}
                                  >
                                    Mark as done
                                  </button>
                                </>
                              )}

                              {/* Input — label + text field */}
                              {step.type === "input" && (
                                <>
                                  {labelRow}
                                  <input
                                    type="text"
                                    placeholder={step.placeholder}
                                    className={`mt-2 w-full ${isMobile ? 'h-10' : 'h-8'} px-3 rounded-[6px] ${isMobile ? 'text-[14px]' : 'text-[12px]'} text-foreground placeholder:text-muted focus:outline-none transition-colors duration-150`}
                                    style={{ background: '#ffffff', border: '1px solid #e7e5e4' }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; }}
                                    onBlur={(e) => {
                                      e.currentTarget.style.borderColor = '#e7e5e4';
                                      if (e.currentTarget.value.trim()) {
                                        completeWithConfetti(project.slug, i, { value: e.currentTarget.value.trim() });
                                      }
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter" && e.currentTarget.value.trim()) {
                                        completeWithConfetti(project.slug, i, { value: e.currentTarget.value.trim() });
                                      }
                                    }}
                                  />
                                </>
                              )}

                              {/* Upload — label + drop zone */}
                              {step.type === "upload" && (
                                <>
                                  {labelRow}
                                  <label
                                    className={`mt-2 flex items-center gap-2 px-3 ${isMobile ? 'h-10' : 'h-8'} rounded-[6px] cursor-pointer transition-colors duration-150`}
                                    style={{ border: '1px dashed #d6d3d1' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#d6d3d1'; }}
                                  >
                                    <Upload size={12} strokeWidth={1.5} className="text-muted flex-shrink-0" />
                                    <span className={`${isMobile ? 'text-[13px]' : 'text-[11px]'} text-muted truncate`}>{step.placeholder}</span>
                                    <input
                                      type="file"
                                      accept={step.accept}
                                      className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          completeWithConfetti(project.slug, i, { fileName: file.name });
                                          const fd = new FormData();
                                          fd.append("file", file);
                                          fd.append("slug", project.slug);
                                          fd.append("stepLabel", step.label);
                                          fetch("/api/upload", { method: "POST", body: fd }).catch(() => {});
                                        }
                                      }}
                                    />
                                  </label>
                                </>
                              )}

                              {/* Choice — label + pill group */}
                              {step.type === "choice" && step.options && (
                                <>
                                  {labelRow}
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {step.options.map((option) => (
                                      <button
                                        key={option}
                                        onClick={() => completeWithConfetti(project.slug, i, { choice: option })}
                                        className={`${isMobile ? 'h-10' : 'h-8'} px-3.5 rounded-[6px] ${isMobile ? 'text-[14px]' : 'text-[12px]'} text-foreground transition-colors duration-150`}
                                        style={{ background: '#ffffff', border: '1px solid #e7e5e4' }}
                                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.color = '#4f46e5'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e7e5e4'; e.currentTarget.style.color = '#1a1a1a'; }}
                                      >
                                        {option}
                                      </button>
                                    ))}
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Notes field */}
                  {!isSubmitted && (
                    <div className="mt-2">
                      <textarea
                        placeholder="Add notes (optional)"
                        value={notes[project.slug] || ''}
                        onChange={(e) => setNotes(prev => ({ ...prev, [project.slug]: e.target.value }))}
                        rows={2}
                        className={`w-full px-3 py-2 rounded-[6px] ${isMobile ? 'text-[14px]' : 'text-[12px]'} text-foreground placeholder:text-muted resize-none focus:outline-none transition-colors duration-150`}
                        style={{ background: '#f5f5f4', border: '1px solid transparent', scrollbarWidth: 'none' }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = '#4f46e5'; e.currentTarget.style.background = '#ffffff'; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = '#f5f5f4'; }}
                      />
                    </div>
                  )}

                  {/* Submit — only when actionable */}
                  {isSubmitted ? (
                    <div className="flex items-center gap-1.5 justify-center py-2 flex-shrink-0">
                      <Check
                        size={12}
                        strokeWidth={2.5}
                        className="text-[#059669]"
                      />
                      <span className={`${isMobile ? 'text-[14px]' : 'text-[12px]'} text-[#059669] font-medium`}>
                        Submitted
                      </span>
                    </div>
                  ) : allDone(project.slug) ? (
                    <button
                      onClick={async (e) => {
                        if (submitting[project.slug]) return;
                        fireConfetti(e.currentTarget, true);
                        setSubmitting((prev) => ({
                          ...prev,
                          [project.slug]: true,
                        }));

                        const stepData = state[project.slug].map(
                          (s, sidx) => ({
                            label: project.steps[sidx].label,
                            type: project.steps[sidx].type,
                            ...s,
                          })
                        );

                        try {
                          await Promise.all([
                            fetch("/api/submissions", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                slug: project.slug,
                                steps: stepData,
                                notes: notes[project.slug] || "",
                              }),
                            }),
                            fetch("/api/notify", {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify({
                                slug: project.slug,
                                projectName: project.name,
                                completedSteps: stepData.filter(
                                  (s) => s.completed
                                ),
                                notes: notes[project.slug] || "",
                              }),
                            }),
                          ]);
                        } catch {
                          // Silently continue
                        }

                        setSubmitting((prev) => ({
                          ...prev,
                          [project.slug]: false,
                        }));
                        setSubmitted((prev) => ({
                          ...prev,
                          [project.slug]: true,
                        }));
                      }}
                      disabled={submitting[project.slug]}
                      className={`mt-3 w-full ${isMobile ? 'h-11' : 'h-9'} rounded-[8px] ${isMobile ? 'text-[14px]' : 'text-[12px]'} font-medium transition-all duration-150 bg-primary text-white hover:brightness-110 flex-shrink-0`}
                    >
                      {submitting[project.slug] ? "Submitting..." : "Submit"}
                    </button>
                  ) : null}
                </div>
              </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating status layer — step completions float between cards and control panel */}
      <div className="flex-shrink-0 relative" style={{ height: 0 }}>
        <div
          className="absolute bottom-1 left-0 right-0 flex flex-col items-center gap-0.5 pointer-events-none"
          style={{ transition: 'opacity 150ms ease-out', opacity: statusMessages.length > 0 ? 1 : 0 }}
        >
          {statusMessages.slice(-3).map((msg, i) => (
            <div
              key={`${focusedProject?.slug}-${i}`}
              className="flex items-center gap-1.5"
              style={{
                animation: 'statusFadeIn 300ms ease-out both',
                animationDelay: `${i * 50}ms`,
              }}
            >
              <Check size={10} strokeWidth={2} style={{ color: 'rgba(5,150,105,0.45)' }} />
              <span className="text-[11px] leading-[1.6]" style={{ color: 'rgba(120,113,108,0.45)' }}>
                {msg.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* First-visit hint — mobile bottom text */}
      {showHint && isMobile && (
        <div
          className="flex-shrink-0 flex justify-center pointer-events-none"
          style={{
            animation: 'statusFadeIn 400ms ease-out both',
            opacity: 0.5,
            transition: 'opacity 300ms ease-out',
          }}
        >
          <span className="text-[11px]" style={{ color: '#a8a29e' }}>
            Swipe to browse {'\u00b7'} Tap to explore
          </span>
        </div>
      )}



      {/* Tilt-to-browse discovery toast */}
      {showTiltHint && (
        <div
          className="fixed top-12 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-[8px]"
          style={{
            background: 'rgba(25,25,25,0.85)',
            animation: 'statusFadeIn 300ms ease-out both',
          }}
        >
          <span className="text-[12px] text-white/90 whitespace-nowrap">Tilt to browse</span>
        </div>
      )}

      {/* Bottom — Viberr control panel */}
      <div className="flex-shrink-0 pt-2" style={{ padding: isMobile ? '8px 12px calc(12px + env(safe-area-inset-bottom, 0px))' : '8px 16px 16px', transform: keyboardOffset > 0 ? `translateY(-${keyboardOffset}px)` : 'none', transition: 'transform 150ms ease-out' }}>
        <div style={isMobile ? { width: '100%' } : { width: '50vw', minWidth: 360, maxWidth: 800, margin: '0 auto' }}>
          <div className="rounded-[8px] overflow-hidden" style={{ border: '1px solid #e7e5e4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

            {/* Chat messages — expands above when active */}
            {(chatMessages.length > 0 || chatLoading) && (
              <div style={{ background: '#ffffff', borderBottom: '1px solid #e7e5e4' }}>
                <div
                  ref={chatScrollRef}
                  className="overflow-y-auto px-4 pt-3 pb-2.5 space-y-2.5"
                  style={{ maxHeight: 'min(200px, 30vh)', scrollbarWidth: 'none' }}
                >
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="flex gap-2.5">
                      <div
                        className={`flex-shrink-0 ${isMobile ? 'w-[20px] h-[20px]' : 'w-[18px] h-[18px]'} rounded-full flex items-center justify-center mt-0.5`}
                        style={{ background: msg.from === "user" ? "#4f46e5" : "#e7e5e4" }}
                      >
                        {msg.from === "user" ? (
                          <span className={`${isMobile ? 'text-[10px]' : 'text-[8px]'} font-semibold text-white`}>Y</span>
                        ) : (
                          <span className={`${isMobile ? 'text-[10px]' : 'text-[8px]'} font-semibold`} style={{ color: '#78716c' }}>V</span>
                        )}
                      </div>
                      <div
                        className={`flex-1 ${isMobile ? 'text-[15px]' : 'text-[13px]'} leading-[1.55] min-w-0 ${
                          msg.from === "user" ? "text-foreground" : "text-secondary-foreground"
                        }`}
                      >
                        {msg.from === "user"
                          ? msg.text
                          : msg.text.split("\n").map((line, li) => (
                              <span key={li}>
                                {renderMarkdown(line)}
                                {li < msg.text.split("\n").length - 1 && <br />}
                              </span>
                            ))}
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-2.5">
                      <div
                        className={`flex-shrink-0 ${isMobile ? 'w-[20px] h-[20px]' : 'w-[18px] h-[18px]'} rounded-full flex items-center justify-center`}
                        style={{ background: "#e7e5e4" }}
                      >
                        <span className={`${isMobile ? 'text-[10px]' : 'text-[8px]'} font-semibold`} style={{ color: '#78716c' }}>V</span>
                      </div>
                      <div className="flex items-center gap-[3px] pt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#c4c0bc', animation: "pulse 1s ease-in-out infinite" }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#c4c0bc', animation: "pulse 1s ease-in-out 0.15s infinite" }} />
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#c4c0bc', animation: "pulse 1s ease-in-out 0.3s infinite" }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Input row — logo + textarea + actions */}
            <div
              className="flex items-center gap-2 px-3"
              style={{ background: '#ffffff', minHeight: 50 }}
              data-tour="chat"
            >
              {/* Living brand mark */}
              <div
                className="flex-shrink-0 relative cursor-pointer"
                onMouseEnter={() => setLogoExpanded(true)}
                onMouseLeave={() => setLogoExpanded(false)}
                onClick={() => setLogoExpanded((p) => !p)}
              >
                <div
                  className="flex items-center overflow-hidden"
                  style={{
                    height: 24,
                    width: logoExpanded ? 64 : 24,
                    borderRadius: 12,
                    background: '#4f46e5',
                    paddingRight: logoExpanded ? 8 : 0,
                    transition: 'width 280ms cubic-bezier(0.175, 0.885, 0.32, 1.275), padding 280ms cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    animation: 'logoBreath 4s ease-in-out infinite',
                  }}
                >
                  <div className="flex items-center justify-center flex-shrink-0" style={{ width: 24, height: 24 }}>
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                      <path d="M3 3L8 13L13 3" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.9)',
                      letterSpacing: '0.02em',
                      whiteSpace: 'nowrap',
                      opacity: logoExpanded ? 1 : 0,
                      transition: 'opacity 180ms ease-out',
                      marginLeft: -2,
                    }}
                  >
                    viberr
                  </span>
                </div>

              </div>

              {/* Divider */}
              <div className="w-px self-stretch my-2.5" style={{ background: '#e7e5e4' }} />

              {/* Textarea */}
              <textarea
                ref={chatInputRef}
                value={chatValue}
                onChange={(e) => {
                  setChatValue(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendChat();
                  }
                }}
                placeholder={`Ask about ${focusedProject?.name ?? "this project"}...`}
                rows={1}
                className={`flex-1 ${isMobile ? 'text-[15px]' : 'text-[13px]'} resize-none leading-[1.5] min-w-0 py-3`}
                style={{
                  minHeight: 20,
                  maxHeight: 120,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#1a1a1a',
                }}
              />

              {/* Mic */}
              <button
                onClick={toggleRecording}
                className="w-7 h-7 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all duration-150"
                style={{
                  color: isRecording ? '#ffffff' : '#c4c0bc',
                  background: isRecording ? '#dc2626' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!isRecording) e.currentTarget.style.color = '#1a1a1a'; }}
                onMouseLeave={(e) => { if (!isRecording) e.currentTarget.style.color = '#c4c0bc'; }}
              >
                {isRecording ? (
                  <Square size={10} strokeWidth={2} />
                ) : (
                  <Mic size={14} strokeWidth={1.5} />
                )}
              </button>

              {/* Send */}
              <button
                onClick={() => sendChat()}
                disabled={!chatValue.trim() || chatLoading}
                className="w-7 h-7 rounded-[5px] flex items-center justify-center text-white flex-shrink-0 transition-all duration-150"
                style={{
                  background: '#4f46e5',
                  opacity: (!chatValue.trim() || chatLoading) ? 0.15 : 1,
                }}
              >
                <SendHorizontal size={13} strokeWidth={2} />
              </button>
            </div>

            {/* Chrome — chips/meta + nav + shortcut */}
            <div
              className="flex items-center justify-between px-3"
              style={{ background: '#f0efee', height: 37, borderTop: '1px solid #e7e5e4' }}
            >
              {/* Left — smart chips or project meta */}
              <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                {chatMessages.length === 0 && !chatLoading ? (
                  <>
                    {(focusedProject?.type === "Workflow"
                      ? [
                          { label: "Summarize", prompt: `Give me a concise summary of the ${focusedProject.name} workflow — what it does, who it's for, and the key automation steps.` },
                          { label: "Integrations", prompt: `What third-party integrations and APIs would ${focusedProject.name} need? List each with its purpose.` },
                          { label: "Scope", prompt: `Break down the $${focusedProject.estimate.toLocaleString()} estimate for ${focusedProject.name} into line items with rough cost allocation.` },
                        ]
                      : [
                          { label: "Features", prompt: `List the core features of ${focusedProject.name} and explain what each one does for the end user.` },
                          { label: "UX", prompt: `Describe the ideal user experience for ${focusedProject.name} — from first visit to key actions.` },
                          { label: "Scope", prompt: `Break down the $${focusedProject.estimate.toLocaleString()} estimate for ${focusedProject.name} into line items with rough cost allocation.` },
                        ]
                    ).map((action) => (
                      <button
                        key={action.label}
                        onClick={() => sendChat(action.prompt)}
                        className={`${isMobile ? 'text-[12px]' : 'text-[10px]'} px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0 transition-all duration-150`}
                        style={{ color: '#78716c', background: 'transparent' }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#e7e5e4'; e.currentTarget.style.color = '#1a1a1a'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#78716c'; }}
                      >
                        <Zap size={9} strokeWidth={1.5} />
                        {action.label}
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className={`${isMobile ? 'text-[12px]' : 'text-[10px]'} truncate`} style={{ color: '#a8a29e' }}>
                      {focusedProject?.type} · ${focusedProject?.estimate.toLocaleString()} · {focusedProject?.name}
                    </span>
                    <button
                      onClick={() => {
                        if (focusedProject) {
                          setChatBySlug(prev => ({ ...prev, [focusedProject.slug]: [] }));
                        }
                      }}
                      className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors duration-150"
                      style={{ color: '#c4c0bc' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#1a1a1a'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#c4c0bc'; }}
                    >
                      <X size={10} strokeWidth={2} />
                    </button>
                  </div>
                )}
              </div>

              {/* Right — nav + shortcut */}
              <div className="flex items-center gap-0.5 flex-shrink-0 ml-2" data-tour="nav">
                {!isMobile && (
                  <>
                    <button
                      onClick={() => scrollBy(-1)}
                      className="w-6 h-6 rounded flex items-center justify-center transition-all duration-150"
                      style={{ color: '#a8a29e' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#1a1a1a')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#a8a29e')}
                    >
                      <ChevronLeft size={13} strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() => scrollBy(1)}
                      className="w-6 h-6 rounded flex items-center justify-center transition-all duration-150"
                      style={{ color: '#a8a29e' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#1a1a1a')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#a8a29e')}
                    >
                      <ChevronRight size={13} strokeWidth={1.5} />
                    </button>
                  </>
                )}
                <span className={`${isMobile ? 'text-[12px]' : 'text-[10px]'} tabular-nums select-none ml-0.5`} style={{ color: '#c4c0bc' }}>
                  {focusedIndex + 1}/{displayProjects.length}
                </span>
                {!isMobile && (
                  <>
                    <button
                      onClick={() => chatInputRef.current?.focus()}
                      className="text-[9px] px-1 py-px rounded select-none transition-all duration-150 ml-1.5"
                      style={{ color: '#c4c0bc', border: '1px solid #ddd8d4' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#78716c'; e.currentTarget.style.borderColor = '#c4c0bc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#c4c0bc'; e.currentTarget.style.borderColor = '#ddd8d4'; }}
                    >
                      ⌘K
                    </button>
                    <button
                      onClick={() => setTourStep(0)}
                      className="text-[9px] px-1 py-px rounded select-none transition-all duration-150 ml-0.5"
                      style={{ color: '#c4c0bc', border: '1px solid #ddd8d4' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = '#78716c'; e.currentTarget.style.borderColor = '#c4c0bc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = '#c4c0bc'; e.currentTarget.style.borderColor = '#ddd8d4'; }}
                    >
                      ?
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen overlay */}
      {previewSlug && previewMode === "fullscreen" && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: "rgba(25, 25, 25, 0.96)" }}
        >
          {/* Fullscreen browser chrome */}
          <div className="flex items-center gap-2 px-4 flex-shrink-0" style={{ height: 40, background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <button
              onClick={() => {
                if (isMobile) { closePreview(); }
                else setPreviewMode("desktop");
              }}
              className="w-3 h-3 rounded-full flex-shrink-0 transition-opacity duration-150 hover:opacity-80"
              style={{ background: '#dc2626' }}
            />
            <a
              href={`https://${SITE_DOMAIN}/${previewSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 h-[24px] rounded-[4px] min-w-0 transition-colors duration-150 hover:bg-white/10"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
              <Lock size={9} strokeWidth={2} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
              <span className="text-[11px] truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {SITE_DOMAIN}/{previewSlug}
              </span>
            </a>
            <a
              href={`/${previewSlug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] flex-shrink-0 transition-colors duration-150"
              style={{ color: 'rgba(255,255,255,0.4)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}
            >
              Open
            </a>
          </div>

          {/* Fullscreen iframe */}
          <div className="flex-1 overflow-hidden" style={isMobile ? { borderRadius: 0 } : { margin: '0 24px 24px', borderRadius: 8 }}>
            <iframe
              src={`/${previewSlug}?embed=1`}
              className="w-full h-full border-none"
              style={{ background: "#fff" }}
              title={
                displayProjects.find((p) => p.slug === previewSlug)?.name ?? ""
              }
            />
          </div>
        </div>
      )}

      {/* ─── Spotlight Tour Overlay ─── */}
      {tourActive && spotlightRect && (
        <div className="fixed inset-0 z-[100]" onClick={advanceTour}>
          {/* Dark mask with cutout */}
          <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
            <defs>
              <mask id="spotlight-mask">
                <rect width="100%" height="100%" fill="white" />
                <rect
                  x={spotlightRect.left - 8}
                  y={spotlightRect.top - 8}
                  width={spotlightRect.width + 16}
                  height={spotlightRect.height + 16}
                  rx="12"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="rgba(10, 10, 10, 0.6)"
              mask="url(#spotlight-mask)"
              style={{ transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)' }}
            />
          </svg>

          {/* Spotlight ring */}
          <div
            className="absolute pointer-events-none"
            style={{
              left: spotlightRect.left - 8,
              top: spotlightRect.top - 8,
              width: spotlightRect.width + 16,
              height: spotlightRect.height + 16,
              borderRadius: 12,
              boxShadow: '0 0 0 2px rgba(79, 70, 229, 0.4), 0 0 24px rgba(79, 70, 229, 0.15)',
              transition: 'all 300ms cubic-bezier(0.32, 0.72, 0, 1)',
            }}
          />

          {/* Tooltip */}
          <div
            className="absolute pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
            style={{
              ...(tourSteps[tourStep].position === 'top' ? {
                left: spotlightRect.left + spotlightRect.width / 2 - 140,
                bottom: windowH - spotlightRect.top + 20,
              } : tourSteps[tourStep].position === 'right' ? {
                left: spotlightRect.right + 20,
                top: spotlightRect.top + spotlightRect.height / 2 - 60,
              } : {
                left: spotlightRect.left + spotlightRect.width / 2 - 140,
                top: spotlightRect.bottom + 20,
              }),
              width: 280,
              animation: 'coachFadeIn 250ms ease-out both',
            }}
            key={tourStep}
          >
            <div
              className="rounded-[8px] overflow-hidden"
              style={{
                background: '#ffffff',
                border: '1px solid #e7e5e4',
                boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
              }}
            >
              {/* Progress bar */}
              <div className="w-full h-[2px]" style={{ background: '#e7e5e4' }}>
                <div className="h-full" style={{
                  width: `${((tourStep + 1) / tourSteps.length) * 100}%`,
                  background: '#4f46e5',
                  transition: 'width 300ms ease-out',
                }} />
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[13px] font-medium" style={{ color: '#1a1a1a' }}>
                    {tourSteps[tourStep].title}
                  </span>
                  <span className="text-[10px] tabular-nums" style={{ color: '#d6d3d1' }}>
                    {tourStep + 1}/{tourSteps.length}
                  </span>
                </div>
                <p className="text-[12px] leading-[1.6]" style={{ color: '#78716c' }}>
                  {tourSteps[tourStep].body}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <button
                    onClick={dismissTour}
                    className="text-[11px] transition-colors duration-150"
                    style={{ color: '#a8a29e' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#525252')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#a8a29e')}
                  >
                    Skip
                  </button>
                  <button
                    onClick={advanceTour}
                    className="h-7 px-3 rounded-[6px] text-[11px] font-medium text-white flex items-center justify-center transition-all duration-150"
                    style={{ background: '#4f46e5' }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
                  >
                    {tourStep === tourSteps.length - 1 ? 'Claim reward' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Tour Completion Reward ─── */}
      {showReward && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center"
          style={{ background: 'rgba(10, 10, 10, 0.6)' }}
          onClick={() => setShowReward(false)}
        >
          <div
            className="rounded-[8px] text-center"
            style={{
              width: 340,
              background: '#ffffff',
              border: '1px solid #e7e5e4',
              boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
              animation: 'coachFadeIn 300ms ease-out both',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Full indigo progress bar — 100% */}
            <div className="w-full h-[2px]" style={{ background: '#4f46e5' }} />
            <div className="p-8">
              <div className="text-[20px] font-medium tracking-[-0.02em]" style={{ color: '#1a1a1a' }}>
                You actually finished
              </div>
              <p className="text-[13px] leading-[1.6] mt-2" style={{ color: '#78716c' }}>
                Most people skip these. You didn{'\u2019'}t. Every project is now 40% off.
              </p>

              <div className="mt-6 rounded-[6px] py-4 px-4" style={{ background: '#f5f5f4', border: '1px solid #e7e5e4' }}>
                <div className="text-[10px] tracking-[0.08em] uppercase mb-2" style={{ color: '#a8a29e' }}>
                  Your code
                </div>
                <div className="text-[20px] font-medium tracking-[0.06em] select-all" style={{ color: '#4f46e5' }}>
                  TOURED
                </div>
              </div>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText('TOURED').catch(() => {});
                  setShowReward(false);
                }}
                className="mt-5 w-full h-9 rounded-[8px] flex items-center justify-center text-[12px] font-medium text-white transition-all duration-150"
                style={{ background: '#4f46e5' }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
              >
                Copy code & start browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
