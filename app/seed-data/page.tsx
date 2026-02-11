'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Circle } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

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

const generateUsers = (count: number) => {
  const consentStatuses = ['Full', 'Partial', 'Paused'] as const;
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const dataPoints = Math.floor(Math.random() * 450000) + 50000;
    const streams = Math.floor(Math.random() * 5) + 1;
    const dividend = (dataPoints / 10000) * (0.8 + Math.random() * 0.4);
    const lastActiveHours = Math.floor(Math.random() * 72);

    return {
      id: `USR-${String(i + 1).padStart(4, '0')}`,
      dataPoints,
      activeStreams: streams,
      monthlyDividend: Math.round(dividend * 100) / 100,
      consentStatus: consentStatuses[Math.floor(Math.random() * 3)],
      lastActive: new Date(now - lastActiveHours * 3600000).toISOString(),
      dataQualityScore: Math.floor(Math.random() * 15) + 85,
      earningsHistory: Array.from({ length: 6 }, (_, j) => ({
        month: new Date(now - (5 - j) * 30 * 24 * 3600000).toLocaleDateString('en-US', { month: 'short' }),
        amount: Math.round((dividend * (0.7 + Math.random() * 0.6)) * 100) / 100,
      })),
      streamBreakdown: [
        { name: 'Browsing', points: Math.floor(dataPoints * 0.32), active: Math.random() > 0.15 },
        { name: 'App Usage', points: Math.floor(dataPoints * 0.26), active: Math.random() > 0.2 },
        { name: 'Purchase Signals', points: Math.floor(dataPoints * 0.18), active: Math.random() > 0.35 },
        { name: 'Location', points: Math.floor(dataPoints * 0.11), active: Math.random() > 0.5 },
        { name: 'Content Prefs', points: Math.floor(dataPoints * 0.08), active: Math.random() > 0.25 },
        { name: 'Social', points: Math.floor(dataPoints * 0.05), active: Math.random() > 0.55 },
      ],
    };
  });
};

const generateDataStreams = () => {
  return [
    { name: 'Browsing Behavior', basePoints: 48200000, demand: 'High' as const, priceBase: 2.85 },
    { name: 'App Usage Patterns', basePoints: 35600000, demand: 'High' as const, priceBase: 2.42 },
    { name: 'Purchase Signals', basePoints: 21400000, demand: 'High' as const, priceBase: 3.18 },
    { name: 'Location Patterns', basePoints: 14800000, demand: 'Medium' as const, priceBase: 1.65 },
    { name: 'Content Preferences', basePoints: 9200000, demand: 'Medium' as const, priceBase: 1.28 },
    { name: 'Social Interactions', basePoints: 5100000, demand: 'Low' as const, priceBase: 0.72 },
  ].map((s, i) => ({
    id: i + 1,
    name: s.name,
    totalDataPoints: s.basePoints + Math.floor(Math.random() * s.basePoints * 0.08),
    activeUsers: Math.floor(12000 + Math.random() * 3000 - i * 800),
    buyerDemand: s.demand,
    pricePerThousand: Math.round(s.priceBase * 100) / 100,
    weeklyGrowth: Math.round((Math.random() * 8 - 2) * 10) / 10,
  }));
};

const buyerCompanies = [
  'Meridian Media Group',
  'Apex Analytics',
  'DataForge Solutions',
  'Pinnacle Advertising',
  'Quantum Reach',
  'Signal Labs',
  'Nexus Marketing',
  'Vertex Digital',
];

const generateBuyers = () => {
  const statuses = ['Active', 'Trial', 'Pending'] as const;
  const streamOptions = ['Browsing', 'App Usage', 'Purchase', 'Location', 'Content', 'Social'];

  return buyerCompanies.map((company, i) => {
    const streamCount = Math.floor(Math.random() * 3) + 2;
    const selectedStreams = [...streamOptions].sort(() => Math.random() - 0.5).slice(0, streamCount);
    const spend = Math.floor(18000 + Math.random() * 32000);

    return {
      id: i + 1,
      name: company,
      streams: selectedStreams,
      monthlySpend: spend,
      recordsConsumed: Math.floor(spend / 0.0024),
      status: i < 6 ? 'Active' : statuses[Math.floor(Math.random() * 3)] as typeof statuses[number],
      contractEnd: new Date(Date.now() + (90 + Math.floor(Math.random() * 270)) * 24 * 3600000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    };
  });
};

const generateTimeSeriesData = (days: number) => {
  const now = Date.now();
  let baseValue = 3200000;

  return Array.from({ length: days }, (_, i) => {
    const dayOfWeek = new Date(now - (days - 1 - i) * 24 * 3600000).getDay();
    const weekendFactor = dayOfWeek === 0 || dayOfWeek === 6 ? 0.85 : 1;
    baseValue = baseValue * (0.98 + Math.random() * 0.06) * weekendFactor + 50000;
    return {
      date: new Date(now - (days - 1 - i) * 24 * 3600000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      volume: Math.floor(baseValue),
    };
  });
};

const generateRevenueByStream = () => {
  return [
    { stream: 'Browsing', revenue: 142000 },
    { stream: 'App Usage', revenue: 98000 },
    { stream: 'Purchase', revenue: 84000 },
    { stream: 'Location', revenue: 38000 },
    { stream: 'Content', revenue: 24000 },
    { stream: 'Social', revenue: 9000 },
  ];
};

type Tab = 'users' | 'streams' | 'buyers' | 'analytics';

export default function SeedDataPage() {
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const users = useMemo(() => generateUsers(20), []);
  const dataStreams = useMemo(() => generateDataStreams(), []);
  const buyers = useMemo(() => generateBuyers(), []);
  const timeSeriesData = useMemo(() => generateTimeSeriesData(30), []);
  const revenueByStream = useMemo(() => generateRevenueByStream(), []);

  const selectedUser = users.find(u => u.id === selectedUserId);

  const stats = useMemo(() => {
    const totalDataPoints = dataStreams.reduce((sum, s) => sum + s.totalDataPoints, 0);
    const totalRevenue = buyers.reduce((sum, b) => sum + b.monthlySpend, 0);
    const avgDividend = users.reduce((sum, u) => sum + u.monthlyDividend, 0) / users.length;

    return {
      activeUsers: users.filter(u => u.consentStatus !== 'Paused').length,
      totalDataPoints,
      activeBuyers: buyers.filter(b => b.status === 'Active').length,
      monthlyRevenue: totalRevenue,
      avgDividend: Math.round(avgDividend * 100) / 100,
    };
  }, [users, buyers, dataStreams]);

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
      default:
        return colors.muted;
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'High': return colors.green;
      case 'Medium': return colors.amber;
      default: return colors.muted;
    }
  };

  const getTimeAgo = (isoString: string) => {
    const hours = Math.floor((Date.now() - new Date(isoString).getTime()) / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div style={{ backgroundColor: colors.bg, color: colors.text, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{ padding: '12px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
        <Link href="/" style={{ color: colors.muted, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none', fontSize: 13 }}>
          <ArrowLeft size={14} strokeWidth={1.5} />
          Back
        </Link>
        <div style={{ width: 1, height: 16, backgroundColor: colors.border }} />
        <span style={{ fontSize: 15, fontWeight: 500 }}>Ownet Platform</span>
      </header>

      <div style={{ padding: '20px 24px', borderBottom: `1px solid ${colors.border}`, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 32, flexShrink: 0 }}>
        {[
          { label: 'Active Users', value: stats.activeUsers.toLocaleString() },
          { label: 'Data Points Collected', value: formatNumber(stats.totalDataPoints) },
          { label: 'Active Buyers', value: stats.activeBuyers.toString() },
          { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue) },
          { label: 'Avg User Dividend', value: `$${stats.avgDividend.toFixed(2)}` },
        ].map((stat) => (
          <div key={stat.label}>
            <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em' }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <div style={{ padding: '0 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', gap: 32, flexShrink: 0 }}>
            {(['users', 'streams', 'buyers', 'analytics'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSelectedUserId(null); }}
                style={{
                  padding: '14px 0',
                  fontSize: 13,
                  color: activeTab === tab ? colors.text : colors.muted,
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: `2px solid ${activeTab === tab ? colors.text : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'color 150ms ease-out',
                }}
              >
                {tab === 'streams' ? 'Data Streams' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflow: 'auto', padding: 24 }}>
            {activeTab === 'users' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    {['User ID', 'Data Points', 'Streams', 'Monthly Dividend', 'Consent', 'Last Active'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: colors.muted, fontWeight: 400, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
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
                        transition: 'background-color 100ms ease-out',
                      }}
                      onMouseEnter={(e) => { if (selectedUserId !== user.id) e.currentTarget.style.backgroundColor = colors.surface; }}
                      onMouseLeave={(e) => { if (selectedUserId !== user.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <td style={{ padding: '10px 16px', fontFamily: 'system-ui', fontSize: 13, fontWeight: 500, color: colors.text }}>{user.id}</td>
                      <td style={{ padding: '10px 16px' }}>{formatNumber(user.dataPoints)}</td>
                      <td style={{ padding: '10px 16px' }}>{user.activeStreams}</td>
                      <td style={{ padding: '10px 16px' }}>${user.monthlyDividend.toFixed(2)}</td>
                      <td style={{ padding: '10px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Circle size={6} fill={getStatusColor(user.consentStatus)} stroke="none" />
                          {user.consentStatus}
                        </span>
                      </td>
                      <td style={{ padding: '10px 16px', color: colors.muted }}>{getTimeAgo(user.lastActive)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'streams' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 16, padding: '10px 16px', fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: `1px solid ${colors.border}` }}>
                  <span>Stream</span>
                  <span>Data Points</span>
                  <span>Active Users</span>
                  <span>Buyer Demand</span>
                  <span>Price / 1K</span>
                </div>
                {dataStreams.map((stream) => (
                  <div
                    key={stream.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr',
                      gap: 16,
                      padding: '14px 16px',
                      alignItems: 'center',
                      borderBottom: `1px solid ${colors.border}`,
                      fontSize: 13,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 500 }}>{stream.name}</div>
                      <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>
                        {stream.weeklyGrowth >= 0 ? '+' : ''}{stream.weeklyGrowth}% this week
                      </div>
                    </div>
                    <div>{formatNumber(stream.totalDataPoints)}</div>
                    <div>{stream.activeUsers.toLocaleString()}</div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <Circle size={6} fill={getDemandColor(stream.buyerDemand)} stroke="none" />
                      {stream.buyerDemand}
                    </div>
                    <div>${stream.pricePerThousand.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'buyers' && (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                    {['Company', 'Streams Purchased', 'Monthly Spend', 'Records Consumed', 'Contract Status'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: '10px 16px', color: colors.muted, fontWeight: 400, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {buyers.map((buyer) => (
                    <tr key={buyer.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                      <td style={{ padding: '12px 16px', fontWeight: 500 }}>{buyer.name}</td>
                      <td style={{ padding: '12px 16px', color: colors.muted }}>{buyer.streams.join(', ')}</td>
                      <td style={{ padding: '12px 16px' }}>{formatCurrency(buyer.monthlySpend)}</td>
                      <td style={{ padding: '12px 16px' }}>{formatNumber(buyer.recordsConsumed)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                          <Circle size={6} fill={getStatusColor(buyer.status)} stroke="none" />
                          {buyer.status}
                          <span style={{ color: colors.muted, marginLeft: 8 }}>until {buyer.contractEnd}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
                <div>
                  <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Data Collection Volume (30 days)</div>
                  <div style={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData}>
                        <defs>
                          <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.blue} stopOpacity={0.12} />
                            <stop offset="100%" stopColor={colors.blue} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                        <XAxis
                          dataKey="date"
                          tick={{ fill: colors.muted, fontSize: 11 }}
                          stroke={colors.border}
                          tickLine={false}
                          axisLine={false}
                          interval={4}
                        />
                        <YAxis
                          tick={{ fill: colors.muted, fontSize: 11 }}
                          stroke={colors.border}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => formatNumber(v)}
                          width={48}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 13, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                          labelStyle={{ color: colors.muted, marginBottom: 4 }}
                          formatter={(value: number) => [formatNumber(value) + ' records', '']}
                        />
                        <Area
                          type="monotone"
                          dataKey="volume"
                          stroke={colors.blue}
                          strokeWidth={1.5}
                          fill="url(#volumeGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 20 }}>Revenue by Data Stream</div>
                  <div style={{ height: 260 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueByStream} layout="vertical" barCategoryGap={8}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} horizontal={false} />
                        <XAxis
                          type="number"
                          tick={{ fill: colors.muted, fontSize: 11 }}
                          stroke={colors.border}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(v) => formatCurrency(v)}
                        />
                        <YAxis
                          type="category"
                          dataKey="stream"
                          tick={{ fill: colors.muted, fontSize: 12 }}
                          stroke={colors.border}
                          tickLine={false}
                          axisLine={false}
                          width={72}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 13, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                          formatter={(value: number) => [formatCurrency(value), '']}
                          cursor={{ fill: colors.surface }}
                        />
                        <Bar dataKey="revenue" radius={[0, 2, 2, 0]}>
                          {revenueByStream.map((entry, index) => (
                            <Cell key={index} fill={index < 3 ? colors.green : colors.muted} fillOpacity={index < 3 ? 1 : 0.5} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                  {[
                    { label: 'Total Records Delivered', value: formatNumber(buyers.reduce((sum, b) => sum + b.recordsConsumed, 0)) },
                    { label: 'Avg Price per Record', value: '$0.0024' },
                    { label: 'User Payout Rate', value: '72%' },
                    { label: 'Data Quality Avg', value: '91%' },
                  ].map((metric) => (
                    <div key={metric.label} style={{ padding: 16, backgroundColor: colors.surface, borderRadius: 4 }}>
                      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{metric.label}</div>
                      <div style={{ fontSize: 24, fontWeight: 500, letterSpacing: '-0.02em' }}>{metric.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {selectedUser && activeTab === 'users' && (
          <div style={{ width: 340, borderLeft: `1px solid ${colors.border}`, overflow: 'auto', backgroundColor: colors.surface, flexShrink: 0 }}>
            <div style={{ padding: 24 }}>
              <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>User</div>
              <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 24 }}>{selectedUser.id}</div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Data Quality</span>
                  <span style={{ fontSize: 15, fontWeight: 500, color: selectedUser.dataQualityScore >= 90 ? colors.green : colors.amber }}>{selectedUser.dataQualityScore}%</span>
                </div>
                <div style={{ height: 4, backgroundColor: colors.surface2, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${selectedUser.dataQualityScore}%`, height: '100%', backgroundColor: selectedUser.dataQualityScore >= 90 ? colors.green : colors.amber, borderRadius: 2 }} />
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Consent Settings</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {selectedUser.streamBreakdown.map((stream) => (
                    <div key={stream.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
                      <span>{stream.name}</span>
                      <button
                        style={{
                          padding: '4px 10px',
                          fontSize: 11,
                          backgroundColor: stream.active ? colors.green : colors.surface2,
                          color: stream.active ? '#fff' : colors.muted,
                          border: 'none',
                          borderRadius: 2,
                          cursor: 'pointer',
                        }}
                      >
                        {stream.active ? 'Active' : 'Paused'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Data Points by Stream</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedUser.streamBreakdown.map((stream) => (
                    <div key={stream.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                        <span style={{ color: colors.muted }}>{stream.name}</span>
                        <span>{formatNumber(stream.points)}</span>
                      </div>
                      <div style={{ height: 3, backgroundColor: colors.surface2, borderRadius: 1, overflow: 'hidden' }}>
                        <div style={{ width: `${(stream.points / selectedUser.dataPoints) * 100}%`, height: '100%', backgroundColor: colors.blue, borderRadius: 1 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>Earnings</div>
                <div style={{ height: 100 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedUser.earningsHistory}>
                      <XAxis dataKey="month" tick={{ fill: colors.muted, fontSize: 10 }} stroke="transparent" tickLine={false} />
                      <YAxis tick={{ fill: colors.muted, fontSize: 10 }} stroke="transparent" tickLine={false} tickFormatter={(v) => `$${v}`} width={32} />
                      <Tooltip
                        contentStyle={{ backgroundColor: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 12 }}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
                      />
                      <Line type="monotone" dataKey="amount" stroke={colors.green} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ marginTop: 16, padding: 12, backgroundColor: colors.surface2, borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Earned</span>
                  <span style={{ fontSize: 18, fontWeight: 500 }}>${selectedUser.earningsHistory.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
