"use client";

import { useState, useCallback, useRef, useEffect } from "react";

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
  const [showTiltHint, setShowTiltHint] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState<Record<string, boolean>>({});
  const [keyNav, setKeyNav] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const prevFocusRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  const focusedProject = projects[focusedIndex];
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

    // First-visit hint
    if (!localStorage.getItem("viberr-visited")) {
      setShowHint(true);
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

  // AI chat
  const sendChat = useCallback(
    async (messageOverride?: string) => {
      const msg = (messageOverride || chatValue).trim();
      if (!msg || chatLoading) return;
      const focused = projects[focusedIndex];
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
              sendChat(data.text);
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
          setPreviewSlug(null);
          setPreviewMode(null);
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
  }, [scrollBy, previewSlug, previewMode]);

  // Listen for close-preview messages from iframes
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data === "close-preview") {
        setPreviewSlug(null);
        setPreviewMode(null);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

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

  // Context card — persistent left panel (same size as project cards)
  const leftSpace = windowW / 2 - cardW / 2;
  const showContextCard = !isMobile && leftSpace >= cardW + 48;
  const contextCardLeft = leftSpace - cardW - 40;
  const focusedCompleted = state[focusedProject?.slug ?? '']?.filter(s => s.completed).length ?? 0;
  const focusedTotal = focusedProject?.steps.length ?? 0;
  const focusedSubmitted = submitted[focusedProject?.slug ?? ''];
  const FocusedTypeIcon = focusedProject ? typeConfig[focusedProject.type].icon : Workflow;

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
  const desktopH = Math.min(Math.round(desktopW * 0.45), maxCardH, windowH - 180);

  const SPRING = "cubic-bezier(0.32, 0.72, 0, 1)";
  const T = `width 300ms ${SPRING}, height 300ms ${SPRING}, border-radius 300ms ${SPRING}, transform 150ms ease-out, opacity 150ms ease-out`;

  // Calculate card dimensions based on preview mode for the active card
  const getCardStyle = (
    isPreviewing: boolean,
    isFocused: boolean,
    hasActiveChat: boolean
  ): React.CSSProperties => {
    if (isPreviewing && previewMode === "mobile") {
      return {
        width: isMobile ? cardW : MOBILE_FRAME_W,
        height: isMobile ? cardH : mobileH,
        borderRadius: 36,
        transform: "scale(1)",
        opacity: 1,
        transition: T,
        border: "1px solid #d6d3d1",
        boxShadow:
          "0 0 0 1px rgba(99,91,255,0.06), 0 20px 60px rgba(0,0,0,0.12)",
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
        className="flex-1 flex items-center overflow-x-auto snap-x snap-mandatory"
        onPointerDown={() => setKeyNav(false)}
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: 'touch' as never,
          gap: isMobile ? 32 : 40,
          paddingLeft: `calc(50vw - ${cardW / 2}px)`,
          paddingRight: `calc(50vw - ${cardW / 2}px)`,
          transform: chatActive ? (isMobile ? 'scale(0.98) translateY(-4px)' : 'scale(0.94) translateY(-12px)') : 'scale(1) translateY(0)',
          transformOrigin: 'center center',
          transition: 'transform 400ms cubic-bezier(0.32, 0.72, 0, 1)',
          ...(previewSlug
            ? { overflow: "hidden", touchAction: "none" }
            : {}),
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
          const isPreviewing = previewSlug === project.slug;

          const cardStyle = getCardStyle(isPreviewing, isFocused, (chatBySlug[project.slug]?.length ?? 0) > 0);
          return (
            <div
              key={project.slug}
              className="flex-shrink-0 relative snap-center"
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
              {/* Drawer glow — alive whisper, bleeds outside card bounds */}
              <div
                className="absolute pointer-events-none"
                style={{
                  inset: -32,
                  borderRadius: ((cardStyle.borderRadius as number) || 16) + 32,
                  opacity: isDrawerOpen ? 1 : 0,
                  transition: 'opacity 600ms ease-out',
                  background: 'radial-gradient(ellipse 140% 80% at 50% 15%, rgba(79,70,229,0.38) 0%, rgba(79,70,229,0.14) 35%, transparent 68%)',
                  animation: isDrawerOpen ? 'drawerGlow 5s ease-in-out infinite' : 'none',
                  transformOrigin: 'top center',
                }}
              />
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
                    ? "opacity 100ms ease-out"
                    : "opacity 200ms ease-out 150ms",
                }}
              >
                {/* Type badge + code + activity dot */}
                <div className="flex items-center gap-2">
                  <TypeIcon
                    size={isMobile ? 14 : 12}
                    strokeWidth={1.5}
                    className="text-muted"
                  />
                  <span className={`${isMobile ? 'text-[13px]' : 'text-[11px]'} text-muted tracking-[0.05em] uppercase`}>
                    {project.type}
                  </span>
                  <span className={`${isMobile ? 'text-[13px]' : 'text-[11px]'} text-muted tabular-nums ml-auto`}>
                    {project.code}
                  </span>
                  {(chatBySlug[project.slug]?.length ?? 0) > 0 && (
                    <div
                      className="w-[5px] h-[5px] rounded-full"
                      style={{ background: '#4f46e5' }}
                    />
                  )}
                </div>

                {/* Title + description */}
                <h2 className={`${isMobile ? 'text-[22px]' : 'text-[20px]'} font-medium text-foreground mt-4 leading-[1.25] tracking-[-0.01em]`}>
                  {project.name}
                </h2>
                <p className={`${isMobile ? 'text-[15px]' : 'text-[13px]'} text-secondary-foreground leading-[1.6] mt-1.5`}>
                  {project.description}
                </p>

                {/* Deliverables — clickable, sends prompt to control panel */}
                <ul className="mt-4 space-y-0.5">
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
                        className={`group/deliv flex items-start gap-2.5 ${isMobile ? 'text-[14px]' : 'text-[12px]'} leading-[1.5] text-muted text-left w-full py-1 rounded-[4px] transition-colors duration-150`}
                        onMouseEnter={(e) => { if (isFocused) e.currentTarget.style.color = '#1a1a1a'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
                        style={{ cursor: isFocused && !chatLoading ? 'pointer' : 'default' }}
                      >
                        <span className="w-1 h-1 rounded-full bg-primary mt-[7px] flex-shrink-0" />
                        <span className="flex-1">{d}</span>
                        <Zap size={10} strokeWidth={2} className="flex-shrink-0 mt-[5px] opacity-0 group-hover/deliv:opacity-40 transition-opacity duration-150" style={{ color: '#4f46e5' }} />
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
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className={`${isMobile ? 'text-[20px]' : 'text-[18px]'} font-medium tabular-nums text-foreground leading-none tracking-[-0.02em]`}>
                      ${(project.estimate / 2).toLocaleString()}
                    </span>
                    <span className={`${isMobile ? 'text-[13px]' : 'text-[11px]'} text-muted`}>
                      / ${project.estimate.toLocaleString()}
                    </span>
                  </div>

                  {/* Step dots + progress track */}
                  <div className="mt-3 flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {project.steps.map((_step, stepIdx) => {
                          const isDone = state[project.slug]?.[stepIdx]?.completed;
                          return (
                            <div
                              key={stepIdx}
                              className="w-[5px] h-[5px] rounded-full transition-all duration-150"
                              style={{
                                background: isDone ? '#059669' : 'transparent',
                                border: isDone ? 'none' : '1px solid #c4c0bc',
                              }}
                            />
                          );
                        })}
                      </div>
                      <span className={`${isMobile ? 'text-[12px]' : 'text-[10px]'} tabular-nums text-muted`}>
                        {completedCount}/{project.steps.length}
                      </span>
                    </div>
                    <div className="w-full h-[2px] rounded-full overflow-hidden" style={{ background: '#e7e5e4' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${(completedCount / project.steps.length) * 100}%`,
                          background: completedCount === project.steps.length ? '#059669' : '#4f46e5',
                        }}
                      />
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex items-center gap-2 mt-3" style={isMobile ? undefined : { paddingLeft: 12, paddingRight: 12 }}>
                    <button
                      onClick={() => {
                        setPreviewSlug(project.slug);
                        setPreviewMode(isMobile ? "fullscreen" : "desktop");
                      }}
                      className={`flex-1 ${isMobile ? 'h-11' : 'h-9'} flex items-center justify-center rounded-[8px] bg-primary text-white ${isMobile ? 'text-[14px]' : 'text-[12px]'} font-medium hover:brightness-110 transition-all duration-150`}
                    >
                      View project
                    </button>
                    {isSubmitted ? (
                      <div className={`${isMobile ? 'h-11' : 'h-9'} px-3.5 flex items-center justify-center gap-1.5 rounded-[8px] bg-[#059669]/10`}>
                        <Check
                          size={isMobile ? 14 : 12}
                          strokeWidth={2}
                          className="text-[#059669]"
                        />
                        <span className={`${isMobile ? 'text-[14px]' : 'text-[12px]'} text-[#059669] font-medium`}>
                          Submitted
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setOpenDrawer(project.slug)}
                        className={`${isMobile ? 'h-11' : 'h-9'} px-3.5 flex items-center justify-center rounded-[8px] border border-border ${isMobile ? 'text-[14px]' : 'text-[12px]'} text-muted hover:text-foreground hover:border-muted transition-colors duration-150`}
                      >
                        Next steps
                      </button>
                    )}
                    <a
                      href={`${REPO_BASE}/${project.slug}/page.tsx`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center justify-center ${isMobile ? 'w-11 h-11' : 'w-9 h-9'} rounded-[8px] border border-border text-muted hover:text-foreground hover:border-muted transition-colors duration-150`}
                    >
                      <Github size={14} strokeWidth={1.5} />
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
                    ? "opacity 200ms ease-out 100ms"
                    : "opacity 100ms ease-out",
                }}
              >
                {/* Browser chrome — address bar at top */}
                <div
                  className="flex items-center gap-2 px-3 flex-shrink-0"
                  style={{
                    height: 32,
                    background: '#f5f5f4',
                    borderBottom: '1px solid #e7e5e4',
                    borderRadius: previewMode === "mobile"
                      ? '35px 35px 0 0'
                      : previewMode === "desktop"
                        ? '11px 11px 0 0'
                        : '0',
                    transition: 'border-radius 300ms cubic-bezier(0.32, 0.72, 0, 1)',
                  }}
                >
                  {/* Close dot */}
                  <button
                    onClick={() => { setPreviewSlug(null); setPreviewMode(null); }}
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
                      {/* Mobile iframe — 640px scaled to fit */}
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          overflow: "hidden",
                          opacity: previewMode === "mobile" && iframeLoaded[project.slug] ? 1 : 0,
                          pointerEvents:
                            previewMode === "mobile" ? "auto" : "none",
                          transition: "opacity 150ms ease-out",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: MOBILE_IFRAME_W,
                            height: MOBILE_IFRAME_H,
                            transform: `scale(${MOBILE_FRAME_W / MOBILE_IFRAME_W})`,
                            transformOrigin: "top left",
                          }}
                        >
                          <iframe
                            src={`/${project.slug}`}
                            className="w-full h-full border-none"
                            style={{ background: "#fff" }}
                            title={`${project.name} — mobile`}
                            onLoad={() => setIframeLoaded(prev => ({ ...prev, [project.slug]: true }))}
                          />
                        </div>
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
                          src={`/${project.slug}`}
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

      {/* Context card — persistent left panel, same size as project cards */}
      {showContextCard && (
        <div
          className="fixed z-10 pointer-events-none"
          style={{
            left: Math.max(contextCardLeft, 16),
            top: '50%',
            transform: 'translateY(-50%)',
            width: cardW,
            height: cardH,
          }}
        >
          <div
            className="absolute inset-0 overflow-hidden bg-card flex flex-col"
            style={{
              borderRadius: 16,
              border: '1px solid #d6d3d1',
              boxShadow: '0 0 0 1px rgba(99,91,255,0.06), 0 8px 40px rgba(0,0,0,0.06)',
            }}
          >
            {showHint ? (
              /* Welcome / onboarding state */
              <div key="welcome" className="flex flex-col justify-between h-full p-6" style={{ animation: 'coachFadeIn 500ms ease-out both', animationDelay: '200ms' }}>
                <div>
                  <div className="text-[24px] font-medium tracking-[-0.03em] leading-[1.15]" style={{ color: '#1a1a1a' }}>
                    Viberr
                  </div>
                  <p className="text-[13px] leading-[1.6] mt-3" style={{ color: '#78716c' }}>
                    12 projects built and ready to ship. Browse, preview live demos, and configure each one.
                  </p>
                </div>

                <div>
                  <div style={{ height: 1, background: '#e7e5e4' }} />
                  <div className="mt-5 flex flex-col gap-5">
                    {[
                      { num: '01', label: 'Browse', desc: 'Scroll or use arrow keys to move between projects' },
                      { num: '02', label: 'Preview', desc: 'View live interactive demos of each project' },
                      { num: '03', label: 'Customize', desc: 'Configure settings and submit your preferences' },
                      { num: '04', label: 'Ask', desc: '\u2318K to get AI assistance about any project' },
                    ].map((step, i) => (
                      <div
                        key={step.num}
                        className="flex items-start gap-3"
                        style={{ animation: 'coachFadeIn 400ms ease-out both', animationDelay: `${400 + i * 120}ms` }}
                      >
                        <span className="text-[11px] tabular-nums leading-none flex-shrink-0 mt-[2px]" style={{ color: '#d6d3d1' }}>
                          {step.num}
                        </span>
                        <div>
                          <span className="text-[13px] font-medium leading-none" style={{ color: '#1a1a1a' }}>{step.label}</span>
                          <p className="text-[11px] leading-[1.5] mt-1" style={{ color: '#a8a29e' }}>{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : focusedProject ? (
              /* Per-project context state */
              <div key={focusedProject.slug} className="flex flex-col justify-between h-full p-6" style={{ animation: 'coachFadeIn 250ms ease-out both' }}>
                <div>
                  {/* Type + code */}
                  <div className="flex items-center gap-2">
                    <FocusedTypeIcon size={13} strokeWidth={1.5} style={{ color: '#a8a29e' }} />
                    <span className="text-[10px] tracking-[0.05em] uppercase" style={{ color: '#a8a29e' }}>
                      {focusedProject.type}
                    </span>
                    <span className="text-[10px] tabular-nums ml-auto" style={{ color: '#d6d3d1' }}>
                      {focusedProject.code}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-[13px] leading-[1.6] mt-3" style={{ color: '#78716c' }}>
                    {focusedProject.description}
                  </p>

                  {/* Deliverables */}
                  <ul className="mt-4 space-y-1.5">
                    {focusedProject.deliverables.slice(0, 4).map((d, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="flex-shrink-0 mt-[7px]" style={{ width: 3, height: 3, borderRadius: '50%', background: '#4f46e5' }} />
                        <span className="text-[12px] leading-[1.5]" style={{ color: '#525252' }}>{d}</span>
                      </li>
                    ))}
                    {focusedProject.deliverables.length > 4 && (
                      <li className="text-[11px] pl-[11px]" style={{ color: '#a8a29e' }}>
                        +{focusedProject.deliverables.length - 4} more
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  {/* Divider */}
                  <div className="mb-4" style={{ height: 1, background: '#e7e5e4' }} />

                  {/* Progress bar */}
                  <div className="w-full h-[2px] rounded-full overflow-hidden mb-3" style={{ background: '#e7e5e4' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(focusedCompleted / focusedTotal) * 100}%`,
                        background: focusedCompleted === focusedTotal ? '#059669' : '#4f46e5',
                        transition: 'width 300ms ease-out',
                      }}
                    />
                  </div>

                  {/* Status + estimate */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px]" style={{ color: focusedSubmitted ? '#059669' : focusedCompleted === focusedTotal ? '#4f46e5' : '#a8a29e' }}>
                      {focusedSubmitted
                        ? 'Submitted'
                        : focusedCompleted === focusedTotal
                          ? 'Ready to submit'
                          : `${focusedCompleted}/${focusedTotal} configured`}
                    </span>
                    <span className="text-[11px] tabular-nums" style={{ color: '#d6d3d1' }}>
                      ${focusedProject.estimate.toLocaleString()}
                    </span>
                  </div>

                  {/* Chat thread indicator */}
                  {(chatBySlug[focusedProject.slug]?.length ?? 0) > 0 && (
                    <div className="flex items-center gap-1.5 mt-3">
                      <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#4f46e5' }} />
                      <span className="text-[11px]" style={{ color: '#a8a29e' }}>
                        {chatBySlug[focusedProject.slug].filter(m => !isStatusMsg(m.text)).length} messages
                      </span>
                    </div>
                  )}

                  {/* Action */}
                  {!focusedSubmitted && (
                    <button
                      onClick={() => setOpenDrawer(focusedProject.slug)}
                      className="mt-4 w-full h-9 rounded-[8px] flex items-center justify-center text-[12px] font-medium pointer-events-auto"
                      style={{
                        color: focusedCompleted === focusedTotal ? '#ffffff' : '#78716c',
                        background: focusedCompleted === focusedTotal ? '#4f46e5' : 'transparent',
                        border: focusedCompleted === focusedTotal ? 'none' : '1px solid #e7e5e4',
                        transition: 'border-color 150ms ease-out, color 150ms ease-out',
                      }}
                      onMouseEnter={(e) => {
                        if (focusedCompleted !== focusedTotal) {
                          e.currentTarget.style.borderColor = '#a8a29e';
                          e.currentTarget.style.color = '#525252';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (focusedCompleted !== focusedTotal) {
                          e.currentTarget.style.borderColor = '#e7e5e4';
                          e.currentTarget.style.color = '#78716c';
                        }
                      }}
                    >
                      {focusedCompleted === focusedTotal ? 'Submit' : focusedCompleted > 0 ? 'Continue' : 'Start'}
                    </button>
                  )}
                </div>
              </div>
            ) : null}
          </div>
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
                <div style={{ position: 'absolute', bottom: -1, right: -1, width: 6, height: 6, borderRadius: '50%', background: '#059669', border: '1.5px solid #ffffff', transition: 'right 280ms cubic-bezier(0.175, 0.885, 0.32, 1.275)' }} />
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
              <div className="flex items-center gap-0.5 flex-shrink-0 ml-2">
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
                  {focusedIndex + 1}/{projects.length}
                </span>
                {!isMobile && (
                  <button
                    onClick={() => chatInputRef.current?.focus()}
                    className="text-[9px] px-1 py-px rounded select-none transition-all duration-150 ml-1.5"
                    style={{ color: '#c4c0bc', border: '1px solid #ddd8d4' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#78716c'; e.currentTarget.style.borderColor = '#c4c0bc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#c4c0bc'; e.currentTarget.style.borderColor = '#ddd8d4'; }}
                  >
                    ⌘K
                  </button>
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
                if (isMobile) { setPreviewSlug(null); setPreviewMode(null); }
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
              src={`/${previewSlug}`}
              className="w-full h-full border-none"
              style={{ background: "#fff" }}
              title={
                projects.find((p) => p.slug === previewSlug)?.name ?? ""
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
