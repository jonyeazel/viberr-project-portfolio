'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowLeft, Shield, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Design tokens
const colors = {
  bg: '#fafaf9',
  surface: '#f5f5f4',
  surface2: '#eeeeec',
  border: '#e5e5e3',
  text: '#191919',
  muted: '#737373',
  blue: '#2563eb',
  green: '#16a34a',
  amber: '#d97706',
  red: '#dc2626',
};

// Generate deterministic pseudo-random number
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate patient data
function generatePatients() {
  const initials = ['J.D.', 'M.K.', 'A.S.', 'R.T.', 'C.W.', 'L.B.', 'N.P.', 'E.H.'];
  const risks: Array<'Low' | 'Medium' | 'High' | 'Critical'> = ['Low', 'Medium', 'High', 'Critical'];
  const trends: Array<'improving' | 'stable' | 'declining'> = ['improving', 'stable', 'declining'];

  return initials.map((initial, i) => {
    const seed = i * 1000;
    const riskIndex = Math.floor(seededRandom(seed + 1) * 4);
    const trendIndex = Math.floor(seededRandom(seed + 2) * 3);
    const daysAgo = Math.floor(seededRandom(seed + 3) * 7);

    return {
      id: `PT-${1000 + i}`,
      initials: initial,
      risk: risks[riskIndex],
      trend: trends[trendIndex],
      lastCheckIn: daysAgo,
      engagementScore: Math.floor(seededRandom(seed + 4) * 40 + 60),
    };
  });
}

// Generate 30 days of mood data for a patient
function generateMoodData(patientIndex: number) {
  const data = [];
  const today = new Date();
  let baseMood = 5 + seededRandom(patientIndex * 100) * 3;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const variation = (seededRandom(patientIndex * 100 + i) - 0.5) * 3;
    const mood = Math.min(10, Math.max(1, Math.round((baseMood + variation) * 10) / 10));
    baseMood += (seededRandom(patientIndex * 100 + i + 50) - 0.5) * 0.5;

    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      mood,
    });
  }
  return data;
}

// Generate behavioral patterns
function generatePatterns(patientIndex: number) {
  const statuses = ['Good', 'Fair', 'Poor'];
  const trends: Array<'up' | 'down' | 'stable'> = ['up', 'down', 'stable'];

  return [
    {
      name: 'Sleep Regularity',
      status: statuses[Math.floor(seededRandom(patientIndex * 10 + 1) * 3)],
      trend: trends[Math.floor(seededRandom(patientIndex * 10 + 2) * 3)],
      value: Math.floor(seededRandom(patientIndex * 10 + 3) * 40 + 60),
    },
    {
      name: 'Social Engagement',
      status: statuses[Math.floor(seededRandom(patientIndex * 10 + 4) * 3)],
      trend: trends[Math.floor(seededRandom(patientIndex * 10 + 5) * 3)],
      value: Math.floor(seededRandom(patientIndex * 10 + 6) * 40 + 60),
    },
    {
      name: 'Activity Level',
      status: statuses[Math.floor(seededRandom(patientIndex * 10 + 7) * 3)],
      trend: trends[Math.floor(seededRandom(patientIndex * 10 + 8) * 3)],
      value: Math.floor(seededRandom(patientIndex * 10 + 9) * 40 + 60),
    },
    {
      name: 'Communication',
      status: statuses[Math.floor(seededRandom(patientIndex * 10 + 10) * 3)],
      trend: trends[Math.floor(seededRandom(patientIndex * 10 + 11) * 3)],
      value: Math.floor(seededRandom(patientIndex * 10 + 12) * 40 + 60),
    },
  ];
}

// Generate resources
function generateResources(patientIndex: number) {
  const allResources = [
    { name: 'CBT Session - Anxiety Management', type: 'Therapy' },
    { name: 'Crisis Support Line', type: 'Hotline' },
    { name: 'Guided Breathing Exercise', type: 'Exercise' },
    { name: 'Sleep Hygiene Guide', type: 'Reading' },
    { name: 'Mindfulness Meditation', type: 'Exercise' },
    { name: 'DBT Skills Workshop', type: 'Therapy' },
    { name: 'Peer Support Group', type: 'Community' },
    { name: 'Stress Management Workbook', type: 'Reading' },
    { name: 'Physical Activity Plan', type: 'Exercise' },
    { name: 'Journaling Prompts', type: 'Exercise' },
    { name: 'Family Therapy Session', type: 'Therapy' },
    { name: 'Nutrition and Mood Guide', type: 'Reading' },
  ];

  const statuses: Array<'Viewed' | 'Recommended' | 'Dismissed'> = ['Viewed', 'Recommended', 'Dismissed'];

  return allResources.map((resource, i) => ({
    ...resource,
    relevance: Math.floor(seededRandom(patientIndex * 20 + i) * 30 + 70),
    status: statuses[Math.floor(seededRandom(patientIndex * 20 + i + 100) * 3)],
  }));
}

// Generate timeline events
function generateTimeline(patientIndex: number) {
  const eventTypes = ['check-in', 'mood', 'resource', 'alert'] as const;
  const events = [];
  const today = new Date();

  for (let i = 0; i < 15; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - Math.floor(seededRandom(patientIndex * 30 + i) * 14));
    date.setHours(Math.floor(seededRandom(patientIndex * 30 + i + 50) * 12 + 8));

    const type = eventTypes[Math.floor(seededRandom(patientIndex * 30 + i + 100) * 4)];
    let description = '';

    switch (type) {
      case 'check-in':
        description = 'Completed daily check-in';
        break;
      case 'mood':
        const mood = Math.floor(seededRandom(patientIndex * 30 + i + 150) * 10 + 1);
        description = `Logged mood score: ${mood}/10`;
        break;
      case 'resource':
        description = 'Accessed recommended resource';
        break;
      case 'alert':
        description = 'System flagged pattern change';
        break;
    }

    events.push({
      id: i,
      type,
      description,
      timestamp: date,
    });
  }

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

const patients = generatePatients();

function getRiskColor(risk: string) {
  switch (risk) {
    case 'Critical':
      return colors.red;
    case 'High':
      return colors.amber;
    case 'Medium':
      return colors.blue;
    default:
      return colors.green;
  }
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'improving' || trend === 'up') {
    return <TrendingUp size={14} style={{ color: colors.green }} />;
  }
  if (trend === 'declining' || trend === 'down') {
    return <TrendingDown size={14} style={{ color: colors.red }} />;
  }
  return <Minus size={14} style={{ color: colors.muted }} />;
}

export default function MentalHealthDashboard() {
  const [selectedPatientIndex, setSelectedPatientIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'patterns' | 'resources' | 'timeline'>('overview');

  const selectedPatient = patients[selectedPatientIndex];
  const moodData = generateMoodData(selectedPatientIndex);
  const patterns = generatePatterns(selectedPatientIndex);
  const resources = generateResources(selectedPatientIndex);
  const timeline = generateTimeline(selectedPatientIndex);

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
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Alert Bar */}
      <div
        style={{
          backgroundColor: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link
            href="/"
            style={{
              color: colors.muted,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
              transition: 'color 150ms ease-out',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.muted)}
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          {needsAttention > 0 && (
            <span style={{ fontSize: 13, color: colors.muted }}>
              <span style={{ color: colors.amber }}>{needsAttention}</span> patients need attention
              {criticalCount > 0 && (
                <span style={{ marginLeft: 8 }}>
                  (<span style={{ color: colors.red }}>{criticalCount} critical</span>)
                </span>
              )}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Shield size={14} style={{ color: colors.green }} />
            <span style={{ fontSize: 11, color: colors.muted }}>HIPAA Compliant</span>
          </div>
          <span style={{ fontSize: 11, color: colors.muted }}>AES-256 Encrypted</span>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <div
          style={{
            width: 280,
            backgroundColor: colors.surface,
            borderRight: `1px solid ${colors.border}`,
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '16px 16px 8px', fontSize: 11, color: colors.muted, fontWeight: 500 }}>
            PATIENT LIST
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
                backgroundColor: selectedPatientIndex === index ? colors.surface2 : 'transparent',
                border: 'none',
                borderLeft: selectedPatientIndex === index ? `2px solid ${colors.blue}` : '2px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 150ms ease-out',
              }}
              onMouseEnter={(e) => {
                if (selectedPatientIndex !== index) {
                  e.currentTarget.style.backgroundColor = colors.surface2;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedPatientIndex !== index) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ color: colors.text, fontSize: 14 }}>
                  {patient.initials} <span style={{ color: colors.muted, fontSize: 12 }}>{patient.id}</span>
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
                  {patient.lastCheckIn === 0 ? 'Today' : `${patient.lastCheckIn}d ago`}
                </span>
                <TrendIcon trend={patient.trend} />
              </div>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Patient Header */}
          <div
            style={{
              padding: '20px 32px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 400, margin: 0 }}>
                {selectedPatient.initials} <span style={{ color: colors.muted }}>{selectedPatient.id}</span>
              </h1>
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

          {/* Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 0,
              borderBottom: `1px solid ${colors.border}`,
              padding: '0 32px',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 16px',
                  fontSize: 13,
                  color: activeTab === tab.id ? colors.text : colors.muted,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? `2px solid ${colors.blue}` : '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'color 150ms ease-out',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== tab.id) e.currentTarget.style.color = colors.text;
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== tab.id) e.currentTarget.style.color = colors.muted;
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 32 }}>
            {activeTab === 'overview' && (
              <div>
                {/* Mood Chart */}
                <div
                  style={{
                    backgroundColor: colors.surface,
                    borderRadius: 8,
                    padding: 24,
                    marginBottom: 24,
                  }}
                >
                  <h2 style={{ fontSize: 15, fontWeight: 500, margin: '0 0 20px 0' }}>Mood Trend (30 Days)</h2>
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={moodData}>
                        <XAxis
                          dataKey="date"
                          stroke={colors.muted}
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: colors.border }}
                        />
                        <YAxis
                          domain={[0, 10]}
                          stroke={colors.muted}
                          fontSize={11}
                          tickLine={false}
                          axisLine={{ stroke: colors.border }}
                          ticks={[0, 2, 4, 6, 8, 10]}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: colors.surface2,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 4,
                            fontSize: 13,
                          }}
                          labelStyle={{ color: colors.muted }}
                          itemStyle={{ color: colors.text }}
                        />
                        <Line
                          type="monotone"
                          dataKey="mood"
                          stroke={colors.blue}
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 4, fill: colors.blue }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                      padding: 20,
                    }}
                  >
                    <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>RISK ASSESSMENT</div>
                    <div style={{ fontSize: 24, color: getRiskColor(selectedPatient.risk), fontWeight: 500 }}>
                      {selectedPatient.risk}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                      padding: 20,
                    }}
                  >
                    <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>LAST CHECK-IN</div>
                    <div style={{ fontSize: 24, fontWeight: 500 }}>
                      {selectedPatient.lastCheckIn === 0 ? 'Today' : `${selectedPatient.lastCheckIn} days`}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                      padding: 20,
                    }}
                  >
                    <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>ENGAGEMENT SCORE</div>
                    <div style={{ fontSize: 24, fontWeight: 500 }}>{selectedPatient.engagementScore}%</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'patterns' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {patterns.map((pattern) => (
                  <div
                    key={pattern.name}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 12,
                      }}
                    >
                      <span style={{ fontSize: 13, color: colors.muted }}>{pattern.name}</span>
                      <TrendIcon trend={pattern.trend} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <span
                        style={{
                          fontSize: 24,
                          fontWeight: 500,
                          color:
                            pattern.status === 'Good'
                              ? colors.green
                              : pattern.status === 'Poor'
                                ? colors.red
                                : colors.amber,
                        }}
                      >
                        {pattern.status}
                      </span>
                      <span style={{ fontSize: 13, color: colors.muted }}>{pattern.value}%</span>
                    </div>
                    <div
                      style={{
                        marginTop: 12,
                        height: 4,
                        backgroundColor: colors.surface2,
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pattern.value}%`,
                          backgroundColor:
                            pattern.status === 'Good'
                              ? colors.green
                              : pattern.status === 'Poor'
                                ? colors.red
                                : colors.amber,
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'resources' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {resources.map((resource, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: colors.surface,
                      borderRadius: 8,
                      padding: '16px 20px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, marginBottom: 4 }}>{resource.name}</div>
                      <div style={{ fontSize: 11, color: colors.muted }}>{resource.type}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: 11, color: colors.muted }}>{resource.relevance}% match</span>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '4px 8px',
                          borderRadius: 4,
                          backgroundColor: colors.surface2,
                          color:
                            resource.status === 'Viewed'
                              ? colors.green
                              : resource.status === 'Dismissed'
                                ? colors.muted
                                : colors.blue,
                        }}
                      >
                        {resource.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'timeline' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {timeline.map((event, i) => (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex',
                      gap: 16,
                      padding: '16px 0',
                      borderBottom: i < timeline.length - 1 ? `1px solid ${colors.border}` : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor:
                          event.type === 'alert'
                            ? colors.amber
                            : event.type === 'check-in'
                              ? colors.green
                              : colors.muted,
                        marginTop: 6,
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, marginBottom: 4 }}>{event.description}</div>
                      <div style={{ fontSize: 11, color: colors.muted }}>
                        {event.timestamp.toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
