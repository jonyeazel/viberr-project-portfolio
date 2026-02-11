'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Design system colors
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

// Programmatic data generation
const generateUsers = (count: number) => {
  const consentStatuses = ['Full', 'Partial', 'Paused'] as const;
  const now = Date.now();
  
  return Array.from({ length: count }, (_, i) => {
    const dataPoints = Math.floor(Math.random() * 500000) + 50000;
    const streams = Math.floor(Math.random() * 5) + 1;
    const dividend = (dataPoints / 10000) * (0.8 + Math.random() * 0.4);
    const lastActiveHours = Math.floor(Math.random() * 72);
    
    return {
      id: `USR-${(10000 + i).toString(36).toUpperCase()}`,
      dataPoints,
      activeStreams: streams,
      monthlyDividend: Math.round(dividend * 100) / 100,
      consentStatus: consentStatuses[Math.floor(Math.random() * 3)],
      lastActive: new Date(now - lastActiveHours * 3600000).toISOString(),
      dataQualityScore: Math.floor(Math.random() * 20) + 80,
      earningsHistory: Array.from({ length: 6 }, (_, j) => ({
        month: new Date(now - (5 - j) * 30 * 24 * 3600000).toLocaleDateString('en-US', { month: 'short' }),
        amount: Math.round((dividend * (0.7 + Math.random() * 0.6)) * 100) / 100,
      })),
      streamBreakdown: [
        { name: 'Browsing', points: Math.floor(dataPoints * 0.35), active: Math.random() > 0.2 },
        { name: 'App Usage', points: Math.floor(dataPoints * 0.25), active: Math.random() > 0.3 },
        { name: 'Purchase Signals', points: Math.floor(dataPoints * 0.15), active: Math.random() > 0.4 },
        { name: 'Location', points: Math.floor(dataPoints * 0.12), active: Math.random() > 0.5 },
        { name: 'Content Prefs', points: Math.floor(dataPoints * 0.08), active: Math.random() > 0.3 },
        { name: 'Social', points: Math.floor(dataPoints * 0.05), active: Math.random() > 0.6 },
      ],
    };
  });
};

const generateDataStreams = () => {
  const streams = [
    { name: 'Browsing Behavior', basePoints: 45000000, demand: 'High' as const },
    { name: 'App Usage Patterns', basePoints: 32000000, demand: 'High' as const },
    { name: 'Purchase Signals', basePoints: 18000000, demand: 'High' as const },
    { name: 'Location Patterns', basePoints: 12000000, demand: 'Medium' as const },
    { name: 'Content Preferences', basePoints: 8500000, demand: 'Medium' as const },
    { name: 'Social Interactions', basePoints: 4200000, demand: 'Low' as const },
  ];
  
  return streams.map((s, i) => ({
    id: i + 1,
    name: s.name,
    totalDataPoints: s.basePoints + Math.floor(Math.random() * s.basePoints * 0.2),
    activeUsers: Math.floor(Math.random() * 5000) + 8000,
    buyerDemand: s.demand,
    pricePerThousand: s.demand === 'High' ? 2.4 + Math.random() * 0.8 : s.demand === 'Medium' ? 1.2 + Math.random() * 0.6 : 0.4 + Math.random() * 0.4,
  }));
};

const generateBuyers = (count: number) => {
  const companies = [
    'Meridian Media', 'Apex Analytics', 'DataForge Inc', 'Pinnacle Ads', 'Quantum Reach',
    'Signal Labs', 'Nexus Marketing', 'Vertex Digital', 'Prism Insights', 'Catalyst Data',
    'Echo Networks', 'Fusion Analytics', 'Orbit Media', 'Spark Intelligence', 'Nova Advertising',
    'Atlas Marketing', 'Zenith Data', 'Pulse Analytics', 'Horizon Ads', 'Summit Digital',
    'Core Insights', 'Vector Media', 'Ascend Analytics', 'Crest Marketing', 'Peak Data',
  ];
  const statuses = ['Active', 'Trial', 'Pending'] as const;
  const streamOptions = ['Browsing', 'App Usage', 'Purchase', 'Location', 'Content', 'Social'];
  
  return Array.from({ length: count }, (_, i) => {
    const streamCount = Math.floor(Math.random() * 4) + 1;
    const selectedStreams = [...streamOptions].sort(() => Math.random() - 0.5).slice(0, streamCount);
    const spend = Math.floor(Math.random() * 45000) + 5000;
    
    return {
      id: i + 1,
      name: companies[i % companies.length],
      streams: selectedStreams,
      monthlySpend: spend,
      recordsConsumed: Math.floor(spend / 0.002),
      status: statuses[Math.floor(Math.random() * 3)],
    };
  });
};

const generateTimeSeriesData = (days: number) => {
  const now = Date.now();
  let baseValue = 3500000;
  
  return Array.from({ length: days }, (_, i) => {
    baseValue = baseValue * (0.97 + Math.random() * 0.08);
    return {
      date: new Date(now - (days - 1 - i) * 24 * 3600000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: Math.floor(baseValue),
    };
  });
};

const generateRevenueByStream = () => {
  return [
    { stream: 'Browsing', revenue: 128000 + Math.floor(Math.random() * 20000) },
    { stream: 'App Usage', revenue: 94000 + Math.floor(Math.random() * 15000) },
    { stream: 'Purchase', revenue: 76000 + Math.floor(Math.random() * 12000) },
    { stream: 'Location', revenue: 42000 + Math.floor(Math.random() * 8000) },
    { stream: 'Content', revenue: 28000 + Math.floor(Math.random() * 5000) },
    { stream: 'Social', revenue: 12000 + Math.floor(Math.random() * 3000) },
  ];
};

type Tab = 'users' | 'streams' | 'buyers' | 'analytics';

export default function SeedDataPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  
  const users = useMemo(() => generateUsers(25), []);
  const dataStreams = useMemo(() => generateDataStreams(), []);
  const buyers = useMemo(() => generateBuyers(20), []);
  const timeSeriesData = useMemo(() => generateTimeSeriesData(30), []);
  const revenueByStream = useMemo(() => generateRevenueByStream(), []);
  
  const selectedUser = users.find(u => u.id === selectedUserId);
  
  const stats = useMemo(() => {
    const totalDataPoints = users.reduce((sum, u) => sum + u.dataPoints, 0);
    const totalRevenue = buyers.reduce((sum, b) => sum + b.monthlySpend, 0);
    const avgDividend = users.reduce((sum, u) => sum + u.monthlyDividend, 0) / users.length;
    
    return {
      activeUsers: users.filter(u => u.consentStatus !== 'Paused').length,
      totalDataPoints,
      activeBuyers: buyers.filter(b => b.status === 'Active').length,
      monthlyRevenue: totalRevenue,
      avgDividend: Math.round(avgDividend * 100) / 100,
    };
  }, [users, buyers]);

  const formatNumber = (n: number) => {
    if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
    return n.toString();
  };

  const formatCurrency = (n: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(n);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Full':
      case 'Active':
        return colors.green;
      case 'Partial':
      case 'Trial':
        return colors.amber;
      case 'Paused':
      case 'Pending':
        return colors.muted;
      default:
        return colors.muted;
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'High':
        return colors.green;
      case 'Medium':
        return colors.amber;
      case 'Low':
        return colors.muted;
      default:
        return colors.muted;
    }
  };

  const getTimeAgo = (isoString: string) => {
    const hours = Math.floor((Date.now() - new Date(isoString).getTime()) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <Link href="/" style={{ color: colors.muted, display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', fontSize: 13, transition: 'color 150ms ease-out' }}>
          <ArrowLeft size={16} />
          Back
        </Link>
        <div style={{ width: 1, height: 20, backgroundColor: colors.border }} />
        <span style={{ fontSize: 15, fontWeight: 500 }}>Ownet</span>
        <span style={{ fontSize: 13, color: colors.muted }}>Seed Data Platform</span>
      </header>

      {/* Stats Row */}
      <div style={{ padding: '24px', borderBottom: `1px solid ${colors.border}`, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 24 }}>
        {[
          { label: 'Active Users', value: stats.activeUsers.toLocaleString() },
          { label: 'Data Points Collected', value: formatNumber(stats.totalDataPoints) },
          { label: 'Active Buyers', value: stats.activeBuyers.toString() },
          { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue) },
          { label: 'Avg User Dividend', value: `$${stats.avgDividend.toFixed(2)}` },
        ].map((stat) => (
          <div key={stat.label}>
            <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 500 }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Left Panel */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Tabs */}
          <div style={{ padding: '0 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', gap: 32 }}>
            {(['users', 'streams', 'buyers', 'analytics'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedUserId(null); }}
                style={{
                  padding: '16px 0',
                  fontSize: 13,
                  color: activeTab === tab ? colors.text : colors.muted,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab ? colors.text : 'transparent'}`,
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  transition: 'color 150ms ease-out',
                }}
              >
                {tab === 'streams' ? 'Data Streams' : tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
            {activeTab === 'users' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    {['User ID', 'Data Points', 'Streams', 'Monthly Dividend', 'Consent', 'Last Active'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: colors.muted, fontWeight: 400, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUserId(user.id)}
                      style={{
                        borderBottom: `1px solid ${colors.border}`,
                        cursor: 'pointer',
                        backgroundColor: selectedUserId === user.id ? colors.surface : 'transparent',
                        transition: 'background-color 150ms ease-out',
                      }}
                    >
                      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: 12 }}>{user.id}</td>
                      <td style={{ padding: '12px 16px' }}>{formatNumber(user.dataPoints)}</td>
                      <td style={{ padding: '12px 16px' }}>{user.activeStreams}</td>
                      <td style={{ padding: '12px 16px' }}>${user.monthlyDividend.toFixed(2)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: getStatusColor(user.consentStatus) }}>{user.consentStatus}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: colors.muted }}>{getTimeAgo(user.lastActive)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'streams' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dataStreams.map((stream) => (
                  <div
                    key={stream.id}
                    style={{
                      padding: 16,
                      backgroundColor: colors.surface,
                      borderRadius: 4,
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                      alignItems: 'center',
                      gap: 16,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 15, marginBottom: 4 }}>{stream.name}</div>
                      <div style={{ fontSize: 11, color: colors.muted }}>{formatNumber(stream.totalDataPoints)} total data points</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>Active Users</div>
                      <div>{stream.activeUsers.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>Buyer Demand</div>
                      <div style={{ color: getDemandColor(stream.buyerDemand) }}>{stream.buyerDemand}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 2 }}>Price / 1K Records</div>
                      <div>${stream.pricePerThousand.toFixed(2)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <ChevronRight size={16} color={colors.muted} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'buyers' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    {['Company', 'Data Streams', 'Monthly Spend', 'Records Consumed', 'Status'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: colors.muted, fontWeight: 400, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((buyer) => (
                    <tr key={buyer.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '12px 16px' }}>{buyer.name}</td>
                      <td style={{ padding: '12px 16px', color: colors.muted }}>{buyer.streams.join(', ')}</td>
                      <td style={{ padding: '12px 16px' }}>{formatCurrency(buyer.monthlySpend)}</td>
                      <td style={{ padding: '12px 16px' }}>{formatNumber(buyer.recordsConsumed)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ color: getStatusColor(buyer.status) }}>{buyer.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {/* Collection Volume Chart */}
                <div>
                  <div style={{ fontSize: 13, color: colors.muted, marginBottom: 16 }}>Data Collection Volume (30 days)</div>
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                        <XAxis dataKey="date" tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} />
                        <YAxis tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} tickFormatter={(v) => formatNumber(v)} />
                        <Tooltip
                          contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 13 }}
                          labelStyle={{ color: colors.muted }}
                          formatter={(value: number) => [formatNumber(value), 'Data Points']}
                        />
                        <Line type="monotone" dataKey="volume" stroke={colors.blue} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Revenue by Stream Chart */}
                <div>
                  <div style={{ fontSize: 13, color: colors.muted, marginBottom: 16 }}>Revenue by Data Stream</div>
                  <div style={{ height: 240 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByStream} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} />
                        <XAxis type="number" tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} tickFormatter={(v) => formatCurrency(v)} />
                        <YAxis type="category" dataKey="stream" tick={{ fill: colors.muted, fontSize: 11 }} stroke={colors.border} width={80} />
                        <Tooltip
                          contentStyle={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 13 }}
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill={colors.green} radius={[0, 2, 2, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Summary Metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <div style={{ padding: 16, backgroundColor: colors.surface, borderRadius: 4 }}>
                    <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>Total Records Delivered</div>
                    <div style={{ fontSize: 24, fontWeight: 500 }}>{formatNumber(buyers.reduce((sum, b) => sum + b.recordsConsumed, 0))}</div>
                  </div>
                  <div style={{ padding: 16, backgroundColor: colors.surface, borderRadius: 4 }}>
                    <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>Avg Price per Record</div>
                    <div style={{ fontSize: 24, fontWeight: 500 }}>$0.0024</div>
                  </div>
                  <div style={{ padding: 16, backgroundColor: colors.surface, borderRadius: 4 }}>
                    <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8 }}>User Payout Rate</div>
                    <div style={{ fontSize: 24, fontWeight: 500 }}>72%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Detail Panel */}
        {selectedUser && activeTab === 'users' && (
          <div style={{ width: 360, borderLeft: `1px solid ${colors.border}`, overflow: 'auto', backgroundColor: colors.surface }}>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>User Detail</div>
              <div style={{ fontSize: 18, fontFamily: 'monospace', marginBottom: 24 }}>{selectedUser.id}</div>

              {/* Quality Score */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: colors.muted }}>Data Quality Score</span>
                  <span style={{ fontSize: 15, color: selectedUser.dataQualityScore >= 90 ? colors.green : colors.amber }}>{selectedUser.dataQualityScore}%</span>
                </div>
                <div style={{ height: 4, backgroundColor: colors.surface2, borderRadius: 2 }}>
                  <div style={{ width: `${selectedUser.dataQualityScore}%`, height: '100%', backgroundColor: selectedUser.dataQualityScore >= 90 ? colors.green : colors.amber, borderRadius: 2 }} />
                </div>
              </div>

              {/* Consent Settings */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: colors.muted, marginBottom: 12 }}>Consent Settings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedUser.streamBreakdown.map((stream) => (
                    <div key={stream.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span>{stream.name}</span>
                      <span style={{ color: stream.active ? colors.green : colors.muted }}>{stream.active ? 'Active' : 'Paused'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Data Breakdown */}
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: colors.muted, marginBottom: 12 }}>Data Points by Stream</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {selectedUser.streamBreakdown.map((stream) => (
                    <div key={stream.name} style={{ fontSize: 13 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: colors.muted }}>{stream.name}</span>
                        <span>{formatNumber(stream.points)}</span>
                      </div>
                      <div style={{ height: 2, backgroundColor: colors.surface2, borderRadius: 1 }}>
                        <div style={{ width: `${(stream.points / selectedUser.dataPoints) * 100}%`, height: '100%', backgroundColor: colors.blue, borderRadius: 1 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Earnings History */}
              <div>
                <div style={{ fontSize: 11, color: colors.muted, marginBottom: 12 }}>Earnings History</div>
                <div style={{ height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedUser.earningsHistory}>
                      <XAxis dataKey="month" tick={{ fill: colors.muted, fontSize: 10 }} stroke={colors.border} />
                      <YAxis tick={{ fill: colors.muted, fontSize: 10 }} stroke={colors.border} tickFormatter={(v) => `$${v}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 12 }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Earned']}
                      />
                      <Bar dataKey="amount" fill={colors.green} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: 12, fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: colors.muted }}>Total Earned</span>
                  <span>${selectedUser.earningsHistory.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
