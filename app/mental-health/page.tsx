'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import {
  ArrowLeft,
  ChevronLeft,
  Shield,
  TrendingUp,
  TrendingDown,
  Minus,
  Lock,
  Moon,
  Users,
  Activity,
  MessageCircle,
  Smartphone,
  Clock,
  Phone,
  Wind,
  BookOpen,
  Heart,
  UsersRound,
  Brain,
} from 'lucide-react';

// Fixed reference date to prevent SSR hydration mismatches
const REFERENCE_DATE = new Date('2026-02-11T12:00:00Z');

const colors = {
  bg: 'var(--background)',
  surface: 'var(--surface)',
  surface2: 'var(--surface-2)',
  border: 'var(--border)',
  text: 'var(--foreground)',
  muted: 'var(--muted)',
  blue: 'var(--primary)',
  green: 'var(--success)',
  amber: 'var(--warning)',
  red: 'var(--destructive)',
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
type Trend = 'improving' | 'stable' | 'declining';

interface Patient {
  id: string;
  initials: string;
  risk: RiskLevel;
  trend: Trend;
  lastCheckIn: number;
  engagementScore: number;
  avgMood: number;
}

function generatePatients(): Patient[] {
  const patientData = [
    { initials: 'J.D.', riskSeed: 0.1, trendSeed: 0.2 },
    { initials: 'M.K.', riskSeed: 0.9, trendSeed: 0.8 },
    { initials: 'A.S.', riskSeed: 0.3, trendSeed: 0.4 },
    { initials: 'R.T.', riskSeed: 0.95, trendSeed: 0.9 },
    { initials: 'C.W.', riskSeed: 0.5, trendSeed: 0.1 },
    { initials: 'L.B.', riskSeed: 0.2, trendSeed: 0.3 },
    { initials: 'N.P.', riskSeed: 0.7, trendSeed: 0.6 },
    { initials: 'E.H.', riskSeed: 0.4, trendSeed: 0.5 },
  ];

  return patientData.map((data, i) => {
    const seed = i * 1000;

    let risk: RiskLevel;
    if (data.riskSeed > 0.9) risk = 'Critical';
    else if (data.riskSeed > 0.7) risk = 'High';
    else if (data.riskSeed > 0.4) risk = 'Medium';
    else risk = 'Low';

    let trend: Trend;
    if (data.trendSeed > 0.7) trend = 'declining';
    else if (data.trendSeed > 0.3) trend = 'stable';
    else trend = 'improving';

    const daysAgo = Math.floor(seededRandom(seed + 3) * 6) + (risk === 'Critical' ? 2 : 0);

    return {
      id: `PT-${1000 + i}`,
      initials: data.initials,
      risk,
      trend,
      lastCheckIn: daysAgo,
      engagementScore: Math.floor(seededRandom(seed + 4) * 35 + (risk === 'Low' ? 65 : risk === 'Critical' ? 40 : 55)),
      avgMood: Math.round((seededRandom(seed + 5) * 4 + (risk === 'Low' ? 6 : risk === 'Critical' ? 2 : 4)) * 10) / 10,
    };
  });
}

interface MoodDataPoint {
  date: string;
  fullDate: string;
  mood: number;
}

function generateMoodData(patientIndex: number, patient: Patient): MoodDataPoint[] {
  const data: MoodDataPoint[] = [];
  const today = REFERENCE_DATE;
  let baseMood = patient.avgMood;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const variation = (seededRandom(patientIndex * 100 + i) - 0.5) * 2;
    const trendModifier = patient.trend === 'improving' ? (29 - i) * 0.03 : patient.trend === 'declining' ? -((29 - i) * 0.03) : 0;
    const mood = Math.min(10, Math.max(1, Math.round((baseMood + variation + trendModifier) * 10) / 10));

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      mood,
    });
  }
  return data;
}

type PatternStatus = 'Good' | 'Fair' | 'Poor';
type PatternTrend = 'Improving' | 'Stable' | 'Declining';

interface BehavioralPattern {
  name: string;
  icon: React.ReactNode;
  status: PatternStatus;
  trend: PatternTrend;
  score: number;
  weekData: number[];
  description: string;
}

function generatePatterns(patientIndex: number, patient: Patient): BehavioralPattern[] {
  const baseScore = patient.risk === 'Low' ? 75 : patient.risk === 'Critical' ? 45 : 60;

  const patterns: BehavioralPattern[] = [
    {
      name: 'Sleep Quality',
      icon: <Moon size={18} />,
      status: 'Good',
      trend: 'Stable',
      score: 0,
      weekData: [],
      description: 'Average 7.2 hours per night, consistent bedtime',
    },
    {
      name: 'Social Engagement',
      icon: <Users size={18} />,
      status: 'Fair',
      trend: 'Improving',
      score: 0,
      weekData: [],
      description: '3 social interactions this week, up from 2',
    },
    {
      name: 'Physical Activity',
      icon: <Activity size={18} />,
      status: 'Good',
      trend: 'Stable',
      score: 0,
      weekData: [],
      description: '4,500 avg daily steps, regular walking routine',
    },
    {
      name: 'Communication',
      icon: <MessageCircle size={18} />,
      status: 'Fair',
      trend: 'Stable',
      score: 0,
      weekData: [],
      description: 'Responds to check-ins within 4 hours on average',
    },
    {
      name: 'App Usage',
      icon: <Smartphone size={18} />,
      status: 'Good',
      trend: 'Improving',
      score: 0,
      weekData: [],
      description: 'Daily active user, completes 85% of prompts',
    },
    {
      name: 'Routine Consistency',
      icon: <Clock size={18} />,
      status: 'Fair',
      trend: 'Declining',
      score: 0,
      weekData: [],
      description: 'Wake time variance increased to 1.5 hours',
    },
  ];

  return patterns.map((pattern, i) => {
    const seed = patientIndex * 50 + i * 10;
    const variance = seededRandom(seed) * 30 - 15;
    const score = Math.max(30, Math.min(95, Math.round(baseScore + variance)));

    let status: PatternStatus;
    if (score >= 70) status = 'Good';
    else if (score >= 50) status = 'Fair';
    else status = 'Poor';

    const trendRand = seededRandom(seed + 1);
    let trend: PatternTrend;
    if (trendRand > 0.6) trend = 'Improving';
    else if (trendRand > 0.3) trend = 'Stable';
    else trend = 'Declining';

    const weekData = Array.from({ length: 7 }, (_, j) => {
      const dayVariance = seededRandom(seed + j + 100) * 20 - 10;
      return Math.max(20, Math.min(100, Math.round(score + dayVariance)));
    });

    const descriptions: Record<string, Record<PatternStatus, string>> = {
      'Sleep Quality': {
        Good: 'Average 7.5 hours, consistent schedule maintained',
        Fair: 'Average 6.2 hours, some irregularity in bedtime',
        Poor: 'Average 4.8 hours, significant sleep disturbance',
      },
      'Social Engagement': {
        Good: '5+ meaningful interactions this week',
        Fair: '2-3 social contacts, mostly digital',
        Poor: 'Limited social contact, isolation patterns',
      },
      'Physical Activity': {
        Good: '6,000+ daily steps, regular exercise',
        Fair: '3,500 daily steps, moderate activity',
        Poor: 'Under 2,000 steps, sedentary patterns',
      },
      'Communication': {
        Good: 'Responsive within 2 hours, proactive sharing',
        Fair: 'Responds within 8 hours when prompted',
        Poor: 'Delayed responses, minimal engagement',
      },
      'App Usage': {
        Good: 'Daily active, completes 90% of check-ins',
        Fair: 'Active 4-5 days, 60% completion rate',
        Poor: 'Sporadic usage, declining engagement',
      },
      'Routine Consistency': {
        Good: 'Stable daily routine, less than 30min variance',
        Fair: 'Moderate variance, 1-2 hour shifts',
        Poor: 'Irregular patterns, significant disruption',
      },
    };

    return {
      ...pattern,
      status,
      trend,
      score,
      weekData,
      description: descriptions[pattern.name][status],
    };
  });
}

type ResourceStatus = 'Viewed' | 'Recommended' | 'New';

interface Resource {
  name: string;
  type: string;
  icon: React.ReactNode;
  relevance: number;
  status: ResourceStatus;
  description: string;
}

function generateResources(patientIndex: number, patient: Patient): Resource[] {
  const baseResources = [
    {
      name: 'Therapy Session',
      type: 'Professional Support',
      icon: <Brain size={18} />,
      description: 'One-on-one cognitive behavioral therapy with licensed therapist',
    },
    {
      name: 'Crisis Hotline',
      type: 'Emergency',
      icon: <Phone size={18} />,
      description: '24/7 confidential support line for immediate assistance',
    },
    {
      name: 'Breathing Exercise',
      type: 'Self-Help',
      icon: <Wind size={18} />,
      description: '4-7-8 breathing technique for anxiety reduction',
    },
    {
      name: 'CBT Workbook',
      type: 'Educational',
      icon: <BookOpen size={18} />,
      description: 'Structured exercises for identifying thought patterns',
    },
    {
      name: 'Sleep Guide',
      type: 'Educational',
      icon: <Moon size={18} />,
      description: 'Evidence-based sleep hygiene practices',
    },
    {
      name: 'Support Group',
      type: 'Community',
      icon: <UsersRound size={18} />,
      description: 'Weekly peer support meeting, Thursdays 7pm',
    },
    {
      name: 'Meditation Series',
      type: 'Self-Help',
      icon: <Heart size={18} />,
      description: '10-minute guided mindfulness sessions',
    },
    {
      name: 'Activity Planner',
      type: 'Tools',
      icon: <Activity size={18} />,
      description: 'Behavioral activation scheduling tool',
    },
  ];

  return baseResources.map((resource, i) => {
    const seed = patientIndex * 80 + i * 7;
    const baseRelevance = patient.risk === 'Critical' ? 85 : patient.risk === 'High' ? 75 : 65;
    const variance = seededRandom(seed) * 25 - 10;
    const relevance = Math.max(45, Math.min(99, Math.round(baseRelevance + variance)));

    const statusRand = seededRandom(seed + 50);
    let status: ResourceStatus;
    if (statusRand > 0.6) status = 'Viewed';
    else if (statusRand > 0.25) status = 'Recommended';
    else status = 'New';

    return {
      ...resource,
      relevance,
      status,
    };
  }).sort((a, b) => b.relevance - a.relevance);
}

type EventType = 'check-in' | 'mood' | 'resource' | 'alert' | 'pattern' | 'milestone';

interface TimelineEvent {
  id: number;
  type: EventType;
  description: string;
  detail?: string;
  timestamp: Date;
}

function generateTimeline(patientIndex: number, patient: Patient): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const today = REFERENCE_DATE;

  const eventTemplates: Array<{ type: EventType; descriptions: string[]; details?: string[] }> = [
    {
      type: 'check-in',
      descriptions: [
        'Completed daily wellness check-in',
        'Morning check-in submitted',
        'Evening reflection completed',
        'Weekly progress check-in done',
      ],
    },
    {
      type: 'mood',
      descriptions: [
        'Mood logged',
        'Emotional state recorded',
        'Daily mood entry submitted',
      ],
    },
    {
      type: 'resource',
      descriptions: [
        'Accessed breathing exercise guide',
        'Viewed CBT workbook chapter 3',
        'Completed meditation session',
        'Downloaded sleep hygiene checklist',
        'Watched anxiety management video',
        'Opened crisis support information',
      ],
    },
    {
      type: 'alert',
      descriptions: [
        'Sleep pattern disruption detected',
        'Decreased engagement flagged',
        'Mood trend requires attention',
        'Social isolation indicator triggered',
      ],
    },
    {
      type: 'pattern',
      descriptions: [
        'Sleep quality improved this week',
        'Social engagement increased',
        'Exercise routine established',
        'Communication frequency normalized',
        'App usage consistency improved',
      ],
    },
    {
      type: 'milestone',
      descriptions: [
        '7-day check-in streak achieved',
        'Completed first therapy module',
        'Reached 30-day active status',
        '5 resources completed this month',
      ],
    },
  ];

  for (let i = 0; i < 18; i++) {
    const daysAgo = Math.floor(seededRandom(patientIndex * 30 + i) * 13);
    const hoursAgo = Math.floor(seededRandom(patientIndex * 30 + i + 50) * 14) + 7;
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    date.setHours(hoursAgo, Math.floor(seededRandom(patientIndex * 30 + i + 80) * 60));

    const templateIndex = Math.floor(seededRandom(patientIndex * 30 + i + 100) * eventTemplates.length);
    const template = eventTemplates[templateIndex];
    const descIndex = Math.floor(seededRandom(patientIndex * 30 + i + 150) * template.descriptions.length);
    let description = template.descriptions[descIndex];

    let detail: string | undefined;
    if (template.type === 'mood') {
      const moodScore = Math.floor(seededRandom(patientIndex * 30 + i + 200) * 6) + (patient.risk === 'Low' ? 4 : patient.risk === 'Critical' ? 1 : 3);
      description = `${description}: ${Math.min(10, moodScore)}/10`;
      if (moodScore <= 3) detail = 'Below baseline, follow-up recommended';
      else if (moodScore >= 7) detail = 'Above average, positive trend';
    }

    if (template.type === 'alert' && patient.risk !== 'Low') {
      detail = 'Provider notified';
    }

    events.push({
      id: i,
      type: template.type,
      description,
      detail,
      timestamp: date,
    });
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

const patients = generatePatients();

function getRiskColor(risk: RiskLevel): string {
  switch (risk) {
    case 'Critical': return colors.red;
    case 'High': return colors.amber;
    case 'Medium': return colors.blue;
    default: return colors.green;
  }
}

function TrendIcon({ trend, size = 14 }: { trend: string; size?: number }) {
  const normalizedTrend = trend.toLowerCase();
  if (normalizedTrend === 'improving' || normalizedTrend === 'up') {
    return <TrendingUp size={size} style={{ color: colors.green }} />;
  }
  if (normalizedTrend === 'declining' || normalizedTrend === 'down') {
    return <TrendingDown size={size} style={{ color: colors.red }} />;
  }
  return <Minus size={size} style={{ color: colors.muted }} />;
}

function formatCheckIn(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  return `${days} days ago`;
}

function formatCheckInShort(days: number): string {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day';
  return `${days} days`;
}

interface CustomTooltipProps extends TooltipProps<number, string> {}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload as MoodDataPoint;
  return (
    <div
      style={{
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        borderRadius: 4,
        padding: '10px 14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}
    >
      <div style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>{data.fullDate}</div>
      <div style={{ fontSize: 15, color: colors.text, fontWeight: 500 }}>
        Mood: {payload[0].value}/10
      </div>
    </div>
  );
}

function MiniChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div style={{ display: 'flex', alignItems: 'end', gap: 2, height: 24 }}>
      {data.map((value, i) => {
        const height = ((value - min) / range) * 16 + 8;
        return (
          <div
            key={i}
            style={{
              width: 4,
              height,
              backgroundColor: value >= 70 ? colors.green : value >= 50 ? colors.amber : colors.red,
              borderRadius: 1,
              opacity: 0.7 + (i / data.length) * 0.3,
            }}
          />
        );
      })}
    </div>
  );
}

function getEventColor(type: EventType): string {
  switch (type) {
    case 'alert': return colors.amber;
    case 'check-in': return colors.green;
    case 'mood': return colors.blue;
    case 'milestone': return colors.green;
    case 'pattern': return colors.blue;
    default: return colors.muted;
  }
}

export default function MentalHealthDashboard() {
  const [isEmbedded, setIsEmbedded] = useState(false);
  useEffect(() => { try { setIsEmbedded(window.self !== window.top); } catch { setIsEmbedded(true); } }, []);

  const [selectedPatientIndex, setSelectedPatientIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'resources' | 'timeline'>('overview');

  const effectiveIndex = selectedPatientIndex !== null ? selectedPatientIndex : 0;
  const selectedPatient = patients[effectiveIndex];
  const moodData = generateMoodData(effectiveIndex, selectedPatient);
  const patterns = generatePatterns(effectiveIndex, selectedPatient);
  const resources = generateResources(effectiveIndex, selectedPatient);
  const timeline = generateTimeline(effectiveIndex, selectedPatient);

  const criticalCount = patients.filter((p) => p.risk === 'Critical').length;
  const highCount = patients.filter((p) => p.risk === 'High').length;
  const needsAttention = criticalCount + highCount;

  const tabs = [
    { id: 'overview', label: 'Wellness Overview' },
    { id: 'patterns', label: 'Behavioral Patterns' },
    { id: 'resources', label: 'Resources' },
    { id: 'timeline', label: 'Timeline' },
  ] as const;

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {isEmbedded && <div style={{ height: 47, flexShrink: 0, background: colors.bg }} />}
      <div
        style={{
          backgroundColor: colors.bg,
          borderBottom: `1px solid ${colors.border}`,
          padding: '12px 16px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '8px 16px',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Link
            href="/"
            onClick={(e) => { try { if (window.self !== window.top) { e.preventDefault(); window.parent.postMessage('close-preview', '*'); } } catch { e.preventDefault(); } }}
            style={{
              color: colors.muted,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div style={{ width: 1, height: 16, backgroundColor: colors.border }} />
          <span style={{ fontSize: 15, fontWeight: 500 }}>Clinical Monitoring</span>
          {needsAttention > 0 && (
            <span style={{ fontSize: 13, color: colors.muted }}>
              <span style={{ color: colors.amber, fontWeight: 500 }}>{needsAttention}</span> need attention
              {criticalCount > 0 && (
                <span style={{ marginLeft: 8 }}>
                  (<span style={{ color: colors.red, fontWeight: 500 }}>{criticalCount}</span> critical)
                </span>
              )}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={14} style={{ color: colors.green }} />
            <span style={{ fontSize: 11, color: colors.muted, letterSpacing: '0.03em' }}>HIPAA COMPLIANT</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Lock size={14} style={{ color: colors.muted }} />
            <span style={{ fontSize: 11, color: colors.muted }}>AES-256</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div
          className={`${selectedPatientIndex !== null ? 'hidden md:block' : 'block'}`}
          style={{
            width: '100%',
            maxWidth: 260,
            backgroundColor: colors.surface,
            borderRight: `1px solid ${colors.border}`,
            overflowY: 'auto',
            flexShrink: 0,
          }}
        >
          <div style={{ padding: '14px 16px 10px', fontSize: 11, color: colors.muted, fontWeight: 500, letterSpacing: '0.05em' }}>
            PATIENTS
          </div>
          {patients.map((patient, index) => (
            <button
              key={patient.id}
              onClick={() => {
                setSelectedPatientIndex(index);
                setActiveTab('overview');
              }}
              style={{
                width: '100%',
                padding: '12px 16px',
                backgroundColor: effectiveIndex === index ? colors.surface2 : 'transparent',
                border: 'none',
                borderLeft: effectiveIndex === index ? `2px solid ${colors.blue}` : '2px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ color: colors.text, fontSize: 14, fontWeight: 500 }}>
                  {patient.initials}
                  <span style={{ color: colors.muted, fontSize: 12, fontWeight: 400, marginLeft: 6 }}>{patient.id}</span>
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: getRiskColor(patient.risk),
                    fontWeight: 500,
                  }}
                >
                  {patient.risk}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, color: colors.muted }}>
                  {formatCheckIn(patient.lastCheckIn)}
                </span>
                <TrendIcon trend={patient.trend} />
              </div>
            </button>
          ))}
        </div>

        <div className={`${selectedPatientIndex !== null ? 'flex' : 'hidden md:flex'}`} style={{ flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
          <div
            style={{
              padding: '16px 32px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <div>
              <button
                onClick={() => setSelectedPatientIndex(null)}
                className="md:hidden"
                style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', color: colors.muted, cursor: 'pointer', padding: 0, marginBottom: 8, fontSize: 13 }}
              >
                <ChevronLeft size={16} />
                Back to patients
              </button>
              <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 2 }}>
                {selectedPatient.initials}
                <span style={{ color: colors.muted, fontWeight: 400, marginLeft: 8 }}>{selectedPatient.id}</span>
              </div>
            </div>
            <div
              style={{
                padding: '6px 12px',
                backgroundColor: colors.surface2,
                borderRadius: 4,
                fontSize: 13,
              }}
            >
              Risk Level:{' '}
              <span style={{ color: getRiskColor(selectedPatient.risk), fontWeight: 500 }}>
                {selectedPatient.risk}
              </span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 0,
              borderBottom: `1px solid ${colors.border}`,
              padding: '0 24px',
              flexShrink: 0,
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 12px',
                  fontSize: 13,
                  color: activeTab === tab.id ? colors.text : colors.muted,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? `2px solid ${colors.blue}` : '2px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 32 }}>
            {activeTab === 'overview' && (
              <div>
                <div
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 6,
                    padding: 24,
                    marginBottom: 20,
                  }}
                >
                  <div style={{ fontSize: 13, color: colors.muted, marginBottom: 16 }}>Mood Trend (30 Days)</div>
                  <div style={{ height: 220 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                        <XAxis
                          dataKey="date"
                          stroke={colors.muted}
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: colors.border }}
                          interval={4}
                          dy={8}
                        />
                        <YAxis
                          domain={[0, 10]}
                          stroke={colors.muted}
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: colors.border }}
                          ticks={[0, 2, 4, 6, 8, 10]}
                          dx={-4}
                          tickFormatter={(value) => value.toString()}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          stroke={colors.blue}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: colors.blue, stroke: colors.bg, strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
                  <div
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 6,
                      padding: 20,
                    }}
                  >
                    <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, letterSpacing: '0.03em' }}>RISK ASSESSMENT</div>
                    <div style={{ fontSize: 24, color: getRiskColor(selectedPatient.risk), fontWeight: 500 }}>
                      {selectedPatient.risk}
                    </div>
                    <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                      {selectedPatient.risk === 'Critical' ? 'Immediate attention required' :
                       selectedPatient.risk === 'High' ? 'Close monitoring needed' :
                       selectedPatient.risk === 'Medium' ? 'Regular check-ins' : 'Stable condition'}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 6,
                      padding: 20,
                    }}
                  >
                    <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, letterSpacing: '0.03em' }}>LAST CHECK-IN</div>
                    <div style={{ fontSize: 24, fontWeight: 500 }}>
                      {formatCheckInShort(selectedPatient.lastCheckIn)}
                    </div>
                    <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                      {selectedPatient.lastCheckIn === 0 ? 'Completed today' :
                       selectedPatient.lastCheckIn === 1 ? 'Yesterday' :
                       selectedPatient.lastCheckIn <= 3 ? 'Recent activity' : 'Follow-up recommended'}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 6,
                      padding: 20,
                    }}
                  >
                    <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, letterSpacing: '0.03em' }}>ENGAGEMENT SCORE</div>
                    <div style={{ fontSize: 24, fontWeight: 500 }}>
                      {selectedPatient.engagementScore}%
                    </div>
                    <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>
                      {selectedPatient.engagementScore >= 80 ? 'Highly engaged' :
                       selectedPatient.engagementScore >= 60 ? 'Moderately active' : 'Needs encouragement'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'patterns' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {patterns.map((pattern) => (
                  <div
                    key={pattern.name}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 6,
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: 12,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ color: colors.muted }}>{pattern.icon}</span>
                        <span style={{ fontSize: 13, color: colors.text, fontWeight: 500 }}>{pattern.name}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                      <span
                        style={{
                          fontSize: 20,
                          fontWeight: 500,
                          color:
                            pattern.status === 'Good' ? colors.green :
                            pattern.status === 'Poor' ? colors.red : colors.amber,
                        }}
                      >
                        {pattern.status}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <TrendIcon trend={pattern.trend} size={12} />
                        <span style={{ fontSize: 11, color: colors.muted }}>{pattern.trend}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: 12, color: colors.muted, marginBottom: 12, lineHeight: 1.4 }}>
                      {pattern.description}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                      <MiniChart data={pattern.weekData} />
                      <span style={{ fontSize: 11, color: colors.muted }}>7 days</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'resources' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {resources.map((resource, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 6,
                      padding: 16,
                      display: 'flex',
                      gap: 14,
                    }}
                  >
                    <div style={{ color: colors.muted, flexShrink: 0, paddingTop: 2 }}>
                      {resource.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: colors.text }}>
                          {resource.name}
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 4,
                            backgroundColor: colors.surface2,
                            color:
                              resource.status === 'Viewed' ? colors.green :
                              resource.status === 'New' ? colors.blue : colors.muted,
                            flexShrink: 0,
                            marginLeft: 8,
                          }}
                        >
                          {resource.status}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 6 }}>
                        {resource.type}
                      </div>
                      <div style={{ fontSize: 12, color: colors.muted, marginBottom: 8, lineHeight: 1.4 }}>
                        {resource.description}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div
                          style={{
                            flex: 1,
                            height: 3,
                            backgroundColor: colors.surface2,
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${resource.relevance}%`,
                              backgroundColor: resource.relevance >= 80 ? colors.green : resource.relevance >= 60 ? colors.blue : colors.muted,
                              borderRadius: 2,
                            }}
                          />
                        </div>
                        <span style={{ fontSize: 11, color: colors.muted, flexShrink: 0 }}>
                          {resource.relevance}% match
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div style={{ maxWidth: 640 }}>
                {timeline.map((event, i) => (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: '14px 0',
                      borderBottom: i < timeline.length - 1 ? `1px solid ${colors.border}` : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getEventColor(event.type),
                        marginTop: 5,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                        <div>
                          <div style={{ fontSize: 14, color: colors.text, marginBottom: 2 }}>
                            {event.description}
                          </div>
                          {event.detail && (
                            <div style={{ fontSize: 12, color: colors.muted }}>
                              {event.detail}
                            </div>
                          )}
                        </div>
                        <div style={{ fontSize: 11, color: colors.muted, flexShrink: 0, textAlign: 'right' }}>
                          <div>
                            {event.timestamp.toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                          <div>
                            {event.timestamp.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {isEmbedded && <div style={{ height: 34, flexShrink: 0, background: colors.bg }} />}
    </div>
  );
}
