"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  ArrowLeft,
  Globe,
  Key,
  Rocket,
  Server,
  Shield,
} from "lucide-react";

const REPO_URL = "https://github.com/jonyeazel/viberr-project-portfolio";
const DEPLOY_URL = `https://vercel.com/new/clone?repository-url=${encodeURIComponent(REPO_URL)}&env=ANTHROPIC_API_KEY,OPENAI_API_KEY&envDescription=${encodeURIComponent("API keys required for AI chat features. Get your Anthropic key at console.anthropic.com and OpenAI key at platform.openai.com")}&envLink=${encodeURIComponent("https://console.anthropic.com/settings/keys")}&project-name=viberr-platform&framework=nextjs`;

type StepStatus = "pending" | "active" | "done";

interface HandoffStep {
  id: string;
  title: string;
  description: string;
  icon: typeof Rocket;
  content: React.ReactNode;
}

function CopyBlock({ value, label }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <button
      onClick={copy}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-[6px] text-left transition-colors duration-150 group/copy"
      style={{ background: "#1a1a1a" }}
    >
      <code className="flex-1 text-[12px] leading-[1.5] text-[#e7e5e4] truncate">
        {label || value}
      </code>
      {copied ? (
        <Check size={12} strokeWidth={2} className="text-[#059669] flex-shrink-0" />
      ) : (
        <Copy
          size={12}
          strokeWidth={1.5}
          className="text-[#78716c] group-hover/copy:text-[#e7e5e4] flex-shrink-0 transition-colors duration-150"
        />
      )}
    </button>
  );
}

function EnvRow({ name, description, link }: { name: string; description: string; link: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <code
          className="text-[12px] px-1.5 py-0.5 rounded-[4px]"
          style={{ background: "#1a1a1a", color: "#e7e5e4" }}
        >
          {name}
        </code>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] flex items-center gap-1 transition-colors duration-150"
          style={{ color: "#4f46e5" }}
        >
          Get key <ExternalLink size={9} strokeWidth={1.5} />
        </a>
      </div>
      <p className="text-[12px] leading-[1.5]" style={{ color: "#78716c" }}>
        {description}
      </p>
    </div>
  );
}

export default function Handoff() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string>("deploy");
  const [health, setHealth] = useState<null | { status: string; checks: Record<string, boolean> }>(null);
  const [checking, setChecking] = useState(false);

  const toggle = (id: string) => {
    setExpanded((prev) => (prev === id ? "" : id));
  };

  const complete = useCallback((id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const runHealthCheck = useCallback(async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      }
    } catch {
      setHealth({ status: "error", checks: { server: false } });
    }
    setChecking(false);
  }, []);

  // Auto-expand next incomplete step when one is completed
  useEffect(() => {
    const order = ["deploy", "keys", "domain", "verify"];
    for (const id of order) {
      if (!completed.has(id)) {
        setExpanded(id);
        break;
      }
    }
  }, [completed]);

  const getStatus = (id: string): StepStatus => {
    if (completed.has(id)) return "done";
    if (expanded === id) return "active";
    return "pending";
  };

  const steps: HandoffStep[] = [
    {
      id: "deploy",
      title: "Deploy to your account",
      description: "One click. Forks the repo, creates the project, deploys it.",
      icon: Rocket,
      content: (
        <div className="space-y-4">
          <a
            href={DEPLOY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full h-10 rounded-[8px] text-[13px] font-medium text-white transition-all duration-150 hover:brightness-110"
            style={{ background: "#1a1a1a" }}
            onClick={() => complete("deploy")}
          >
            <svg width="16" height="14" viewBox="0 0 76 65" fill="white">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            Deploy with Vercel
          </a>
          <div className="space-y-2">
            <p className="text-[12px] leading-[1.6]" style={{ color: "#78716c" }}>
              This will open Vercel and walk you through creating your own copy of the platform.
              You&apos;ll need a free Vercel account and a GitHub account.
            </p>
            <p className="text-[12px] leading-[1.6]" style={{ color: "#78716c" }}>
              During setup, Vercel will ask for your API keys. If you don&apos;t have them yet,
              you can skip and add them in the next step.
            </p>
          </div>
          <button
            onClick={() => complete("deploy")}
            className="text-[12px] transition-colors duration-150"
            style={{ color: "#a8a29e" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#4f46e5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#a8a29e"; }}
          >
            I&apos;ve deployed it &rarr;
          </button>
        </div>
      ),
    },
    {
      id: "keys",
      title: "Configure API keys",
      description: "Two keys. AI chat and voice transcription.",
      icon: Key,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <EnvRow
              name="ANTHROPIC_API_KEY"
              description="Powers the AI chat on every card. Claude Opus 4.6. This is the only required key."
              link="https://console.anthropic.com/settings/keys"
            />
            <div className="w-full h-px" style={{ background: "#e7e5e4" }} />
            <EnvRow
              name="OPENAI_API_KEY"
              description="Powers voice-to-text transcription (Whisper). Optional — the mic button won't work without it, but everything else will."
              link="https://platform.openai.com/api-keys"
            />
          </div>
          <div
            className="rounded-[8px] px-3.5 py-3 space-y-2"
            style={{ background: "#f5f5f4" }}
          >
            <p className="text-[12px] font-medium" style={{ color: "#1a1a1a" }}>
              Adding keys to Vercel
            </p>
            <ol className="space-y-1.5">
              {[
                "Open your Vercel project dashboard",
                "Go to Settings → Environment Variables",
                "Add each key with the exact name above",
                "Redeploy (Deployments → three dots → Redeploy)",
              ].map((step, i) => (
                <li
                  key={i}
                  className="text-[12px] leading-[1.5] flex items-start gap-2"
                  style={{ color: "#78716c" }}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-medium"
                    style={{ background: "#e7e5e4", color: "#78716c" }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
          <button
            onClick={() => complete("keys")}
            className="text-[12px] transition-colors duration-150"
            style={{ color: "#a8a29e" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#4f46e5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#a8a29e"; }}
          >
            Keys are set &rarr;
          </button>
        </div>
      ),
    },
    {
      id: "domain",
      title: "Get your domain",
      description: "Buy a new domain or connect one you already own.",
      icon: Globe,
      content: (
        <div className="space-y-4">
          {/* Primary: Buy through Vercel */}
          <div>
            <a
              href="https://vercel.com/domains"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full h-10 rounded-[8px] text-[13px] font-medium text-white transition-all duration-150 hover:brightness-110"
              style={{ background: "#1a1a1a" }}
            >
              <Globe size={14} strokeWidth={1.5} />
              Buy a domain on Vercel
            </a>
            <p className="text-[12px] leading-[1.6] mt-2" style={{ color: "#78716c" }}>
              Search, purchase, and connect in one place. Vercel handles DNS, SSL, and renewals automatically. No configuration needed.
            </p>
          </div>

          <div
            className="rounded-[8px] px-3.5 py-3 space-y-2"
            style={{ background: "#f5f5f4" }}
          >
            <p className="text-[12px] font-medium" style={{ color: "#1a1a1a" }}>
              After purchasing
            </p>
            <ol className="space-y-1.5">
              {[
                "Go to your Vercel project → Settings → Domains",
                "Type the domain you just bought",
                "It connects instantly — no DNS setup required",
              ].map((step, i) => (
                <li
                  key={i}
                  className="text-[12px] leading-[1.5] flex items-start gap-2"
                  style={{ color: "#78716c" }}
                >
                  <span
                    className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-medium"
                    style={{ background: "#e7e5e4", color: "#78716c" }}
                  >
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Secondary: Connect existing domain */}
          <div className="pt-2" style={{ borderTop: "1px solid #e7e5e4" }}>
            <p className="text-[12px] font-medium mb-2" style={{ color: "#a8a29e" }}>
              Already own a domain?
            </p>
            <div
              className="rounded-[8px] px-3.5 py-3 space-y-2"
              style={{ background: "#f5f5f4" }}
            >
              <ol className="space-y-1.5">
                {[
                  "Open your project → Settings → Domains",
                  "Type your domain and click Add",
                  "Add the DNS records Vercel shows you at your registrar",
                ].map((step, i) => (
                  <li
                    key={i}
                    className="text-[12px] leading-[1.5] flex items-start gap-2"
                    style={{ color: "#78716c" }}
                  >
                    <span
                      className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px] font-medium"
                      style={{ background: "#e7e5e4", color: "#78716c" }}
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
              <div className="space-y-1 mt-2">
                <CopyBlock value="A record → 76.76.21.21" />
                <CopyBlock value="CNAME → cname.vercel-dns.com" />
              </div>
            </div>
          </div>

          <button
            onClick={() => complete("domain")}
            className="text-[12px] transition-colors duration-150"
            style={{ color: "#a8a29e" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#4f46e5"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#a8a29e"; }}
          >
            Domain is connected &rarr;
          </button>
        </div>
      ),
    },
    {
      id: "verify",
      title: "Verify everything works",
      description: "Run a health check to confirm your setup.",
      icon: Shield,
      content: (
        <div className="space-y-4">
          <button
            onClick={runHealthCheck}
            disabled={checking}
            className="w-full h-10 rounded-[8px] flex items-center justify-center gap-2 text-[13px] font-medium transition-all duration-150"
            style={{
              background: "#4f46e5",
              color: "#ffffff",
              opacity: checking ? 0.6 : 1,
            }}
          >
            <Server size={14} strokeWidth={1.5} />
            {checking ? "Checking..." : "Run health check"}
          </button>
          {health && (
            <div className="space-y-2">
              {Object.entries(health.checks).map(([key, ok]) => (
                <div key={key} className="flex items-center gap-2.5 px-1">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: ok ? "#059669" : "#dc2626" }}
                  />
                  <span className="text-[12px]" style={{ color: ok ? "#1a1a1a" : "#dc2626" }}>
                    {key === "server" && (ok ? "Server is running" : "Server unreachable")}
                    {key === "anthropic" && (ok ? "Anthropic API key configured" : "Missing ANTHROPIC_API_KEY")}
                    {key === "openai" && (ok ? "OpenAI API key configured" : "Missing OPENAI_API_KEY (optional)")}
                    {key === "resend" && (ok ? "Resend email key configured" : "Missing RESEND_API_KEY (optional)")}
                  </span>
                </div>
              ))}
              {health.checks.server && health.checks.anthropic && (
                <div
                  className="mt-3 rounded-[8px] px-3.5 py-3 flex items-center gap-2"
                  style={{ background: "rgba(5,150,105,0.06)" }}
                >
                  <Check size={14} strokeWidth={2} className="text-[#059669] flex-shrink-0" />
                  <p className="text-[13px] font-medium" style={{ color: "#059669" }}>
                    Your platform is live and ready.
                  </p>
                </div>
              )}
            </div>
          )}
          {health?.checks.server && health?.checks.anthropic && (
            <button
              onClick={() => complete("verify")}
              className="text-[12px] transition-colors duration-150"
              style={{ color: "#a8a29e" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "#4f46e5"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#a8a29e"; }}
            >
              All good &rarr;
            </button>
          )}
        </div>
      ),
    },
  ];

  const allDone = steps.every((s) => completed.has(s.id));

  return (
    <div className="min-h-screen" style={{ background: "#fafaf9" }}>
      <div className="max-w-[560px] mx-auto px-6 py-12">
        {/* Back link */}
        <a
          href="/"
          className="inline-flex items-center gap-1.5 text-[12px] mb-8 transition-colors duration-150"
          style={{ color: "#a8a29e" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#1a1a1a"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "#a8a29e"; }}
        >
          <ArrowLeft size={12} strokeWidth={1.5} />
          Back to platform
        </a>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: "#4f46e5" }}
            >
              <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
                <path d="M3 3L8 13L13 3" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-[11px] tracking-[0.05em] uppercase" style={{ color: "#a8a29e" }}>
              Handoff
            </span>
          </div>
          <h1 className="text-[24px] font-medium leading-[1.2] tracking-[-0.02em]" style={{ color: "#1a1a1a" }}>
            Take your platform live
          </h1>
          <p className="text-[14px] leading-[1.6] mt-2" style={{ color: "#78716c" }}>
            Four steps to go from this demo to your own production deployment.
            No terminal required.
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, idx) => {
            const status = getStatus(step.id);
            const Icon = step.icon;
            const isExpanded = expanded === step.id;

            return (
              <div
                key={step.id}
                className="rounded-[8px] transition-all duration-150"
                style={{
                  background: status === "done" ? "rgba(5,150,105,0.04)" : "#ffffff",
                  border: `1px solid ${status === "active" ? "#d6d3d1" : "#e7e5e4"}`,
                  boxShadow: status === "active" ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
                }}
              >
                {/* Step header */}
                <button
                  onClick={() => toggle(step.id)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150"
                    style={
                      status === "done"
                        ? { background: "#059669" }
                        : status === "active"
                          ? { background: "#4f46e5" }
                          : { background: "#f5f5f4" }
                    }
                  >
                    {status === "done" ? (
                      <Check size={12} strokeWidth={2.5} className="text-white" />
                    ) : (
                      <Icon
                        size={13}
                        strokeWidth={1.5}
                        style={{ color: status === "active" ? "#ffffff" : "#a8a29e" }}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[13px] font-medium"
                      style={{
                        color: status === "done" ? "#059669" : "#1a1a1a",
                        textDecoration: status === "done" ? "line-through" : "none",
                      }}
                    >
                      {step.title}
                    </p>
                    <p className="text-[11px] mt-0.5" style={{ color: "#a8a29e" }}>
                      {step.description}
                    </p>
                  </div>
                  <ChevronDown
                    size={14}
                    strokeWidth={1.5}
                    className="flex-shrink-0 transition-transform duration-150"
                    style={{
                      color: "#a8a29e",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {/* Step content */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0.5">
                    <div className="ml-10">{step.content}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Completion state */}
        {allDone && (
          <div
            className="mt-8 rounded-[8px] px-5 py-5 text-center"
            style={{ background: "rgba(5,150,105,0.06)", border: "1px solid rgba(5,150,105,0.15)" }}
          >
            <p className="text-[18px] font-medium" style={{ color: "#059669" }}>
              You&apos;re live.
            </p>
            <p className="text-[13px] mt-1.5" style={{ color: "#78716c" }}>
              Your platform is deployed, configured, and ready for customers.
            </p>
          </div>
        )}

        {/* Footer — repo link */}
        <div className="mt-10 pt-6 flex items-center justify-between" style={{ borderTop: "1px solid #e7e5e4" }}>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] flex items-center gap-1.5 transition-colors duration-150"
            style={{ color: "#a8a29e" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = "#1a1a1a"; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = "#a8a29e"; }}
          >
            Source code
            <ExternalLink size={10} strokeWidth={1.5} />
          </a>
          <span className="text-[11px]" style={{ color: "#d6d3d1" }}>
            Viberr
          </span>
        </div>
      </div>
    </div>
  );
}
