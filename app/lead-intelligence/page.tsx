'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronDown, ChevronUp, X, Mail, Phone } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
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

type SignalType = 'Funding' | 'Hiring' | 'Expansion' | 'Revenue';

type GrowthSignal = {
  type: SignalType;
  description: string;
  source: string;
  date: string;
};

type Industry = 'Manufacturing' | 'Logistics' | 'Biotech' | 'Software' | 'Energy';
type Location = 'Berlin' | 'Brandenburg' | 'Potsdam';

type Company = {
  id: number;
  name: string;
  industry: Industry;
  location: Location;
  employees: number;
  founded: number;
  address: string;
  score: number;
  signals: GrowthSignal[];
  subScores: {
    funding: number;
    hiring: number;
    revenue: number;
    market: number;
  };
  contact: {
    name: string;
    role: string;
    email: string;
    phone: string;
  };
  updated: string;
};

const companyData: Array<{
  name: string;
  industry: Industry;
  location: Location;
  score: number;
  employees: number;
  founded: number;
}> = [
  { name: 'Infarm GmbH', industry: 'Biotech', location: 'Berlin', score: 94, employees: 420, founded: 2013 },
  { name: 'GetYourGuide AG', industry: 'Software', location: 'Berlin', score: 91, employees: 850, founded: 2009 },
  { name: 'Zalando Logistics SE', industry: 'Logistics', location: 'Brandenburg', score: 88, employees: 1200, founded: 2008 },
  { name: 'N26 GmbH', industry: 'Software', location: 'Berlin', score: 85, employees: 1500, founded: 2013 },
  { name: 'Lilium GmbH', industry: 'Manufacturing', location: 'Brandenburg', score: 82, employees: 950, founded: 2015 },
  { name: 'Enpal GmbH', industry: 'Energy', location: 'Berlin', score: 79, employees: 680, founded: 2017 },
  { name: 'Trade Republic Bank', industry: 'Software', location: 'Berlin', score: 76, employees: 520, founded: 2015 },
  { name: 'Forto Logistics GmbH', industry: 'Logistics', location: 'Berlin', score: 73, employees: 340, founded: 2016 },
  { name: 'BioNTech Manufacturing', industry: 'Biotech', location: 'Brandenburg', score: 89, employees: 280, founded: 2018 },
  { name: 'Personio SE', industry: 'Software', location: 'Berlin', score: 71, employees: 1800, founded: 2015 },
  { name: 'Sunfire GmbH', industry: 'Energy', location: 'Potsdam', score: 68, employees: 220, founded: 2010 },
  { name: 'Sennder Technologies', industry: 'Logistics', location: 'Berlin', score: 65, employees: 890, founded: 2015 },
  { name: 'Agile Robots AG', industry: 'Manufacturing', location: 'Berlin', score: 62, employees: 180, founded: 2018 },
  { name: 'Celonis SE', industry: 'Software', location: 'Berlin', score: 92, employees: 2100, founded: 2011 },
  { name: 'Northvolt Drei GmbH', industry: 'Manufacturing', location: 'Brandenburg', score: 78, employees: 450, founded: 2021 },
  { name: 'Tier Mobility SE', industry: 'Logistics', location: 'Berlin', score: 59, employees: 950, founded: 2018 },
  { name: 'Curevac AG', industry: 'Biotech', location: 'Potsdam', score: 56, employees: 620, founded: 2000 },
  { name: 'Wefox Holding AG', industry: 'Software', location: 'Berlin', score: 67, employees: 1200, founded: 2015 },
  { name: 'BASF Schwarzheide', industry: 'Manufacturing', location: 'Brandenburg', score: 64, employees: 2200, founded: 1990 },
  { name: 'Gorillas Technologies', industry: 'Logistics', location: 'Berlin', score: 55, employees: 380, founded: 2020 },
  { name: 'EcoG GmbH', industry: 'Energy', location: 'Potsdam', score: 72, employees: 85, founded: 2019 },
  { name: 'Cheplapharm Arzneimittel', industry: 'Biotech', location: 'Brandenburg', score: 61, employees: 950, founded: 1998 },
  { name: 'Volocopter GmbH', industry: 'Manufacturing', location: 'Berlin', score: 75, employees: 650, founded: 2011 },
  { name: 'Mambu GmbH', industry: 'Software', location: 'Berlin', score: 84, employees: 780, founded: 2011 },
  { name: 'Electrochaea GmbH', industry: 'Energy', location: 'Brandenburg', score: 58, employees: 45, founded: 2014 },
  { name: 'Fraunhofer IZM', industry: 'Biotech', location: 'Berlin', score: 70, employees: 350, founded: 1993 },
  { name: 'DB Cargo AG', industry: 'Logistics', location: 'Potsdam', score: 63, employees: 3400, founded: 1999 },
  { name: 'LEAG Energy', industry: 'Energy', location: 'Brandenburg', score: 57, employees: 7800, founded: 2016 },
];

const germanFirstNames = ['Thomas', 'Michael', 'Stefan', 'Andreas', 'Christian', 'Markus', 'Sebastian', 'Daniel', 'Julia', 'Anna', 'Sarah', 'Laura', 'Lisa', 'Katharina', 'Maria', 'Felix', 'Tobias', 'Jan', 'Florian', 'Martin', 'Nina', 'Sophie', 'Claudia', 'Eva', 'Petra', 'Frank', 'Jens', 'Sven'];
const germanLastNames = ['Muller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Hofmann', 'Kruger', 'Hartmann', 'Lange', 'Schmitt', 'Werner', 'Krause', 'Meier', 'Lehmann', 'Schmid'];
const roles = ['CEO', 'Managing Director', 'Head of Operations', 'Business Development', 'CFO', 'COO', 'VP Sales', 'General Manager'];

const berlinStreets = ['Alexanderplatz', 'Potsdamer Platz', 'Friedrichstrasse', 'Kurfurstendamm', 'Prenzlauer Allee', 'Schonhauser Allee', 'Torstrasse', 'Oranienstrasse', 'Karl-Marx-Allee', 'Unter den Linden'];
const brandenburgStreets = ['Hauptstrasse', 'Bahnhofstrasse', 'Industriestrasse', 'Gewerbepark', 'Am Kanal', 'Fabrikstrasse'];
const potsdamStreets = ['Friedrich-Ebert-Strasse', 'Breite Strasse', 'Berliner Strasse', 'Am Neuen Palais', 'Zeppelinstrasse'];

const fundingSources = ['TechCrunch', 'Handelsblatt', 'Grunderszene', 'Finance Forward', 'Bloomberg', 'Reuters'];
const hiringSources = ['LinkedIn', 'StepStone', 'Indeed', 'XING', 'Company Website'];
const expansionSources = ['Press Release', 'Local News', 'IHK Berlin', 'Wirtschaftsforderung'];
const revenueSources = ['Bundesanzeiger', 'Annual Report', 'Industry Analysis', 'Market Research'];

const industries: Industry[] = ['Manufacturing', 'Logistics', 'Biotech', 'Software', 'Energy'];
const locations: Location[] = ['Berlin', 'Brandenburg', 'Potsdam'];
const signalTypes: SignalType[] = ['Funding', 'Hiring', 'Expansion', 'Revenue'];

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function generateAddress(location: Location, index: number): string {
  const num = Math.floor(seededRandom(index * 17) * 150) + 1;
  if (location === 'Berlin') {
    const postal = 10115 + Math.floor(seededRandom(index * 31) * 85);
    return `${berlinStreets[index % berlinStreets.length]} ${num}, ${postal} Berlin`;
  }
  if (location === 'Potsdam') {
    return `${potsdamStreets[index % potsdamStreets.length]} ${num}, 14467 Potsdam`;
  }
  const postal = 14400 + Math.floor(seededRandom(index * 23) * 100);
  return `${brandenburgStreets[index % brandenburgStreets.length]} ${num}, ${postal} Brandenburg`;
}

function generateSignals(index: number, score: number): GrowthSignal[] {
  const signals: GrowthSignal[] = [];
  const numSignals = score >= 80 ? 4 : score >= 65 ? 3 : score >= 50 ? 2 : 1;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Rotate signal priority based on company index for variety
  const allTypes: SignalType[] = ['Funding', 'Hiring', 'Expansion', 'Revenue'];
  const rotation = index % allTypes.length;
  const rotatedTypes = [...allTypes.slice(rotation), ...allTypes.slice(0, rotation)];
  const orderedTypes = rotatedTypes.slice(0, numSignals);
  
  for (let i = 0; i < orderedTypes.length; i++) {
    const type = orderedTypes[i];
    const monthIdx = (11 - i - (index % 3)) % 12;
    const month = months[monthIdx >= 0 ? monthIdx : monthIdx + 12];
    const year = i === 0 ? '2026' : '2025';
    
    if (type === 'Funding') {
      const amounts = ['2.5M', '5M', '8M', '12M', '18M', '25M', '40M', '65M'];
      const rounds = ['Seed', 'Series A', 'Series B', 'Series C', 'Growth'];
      const roundIdx = Math.min(Math.floor(score / 20), rounds.length - 1);
      const amountIdx = Math.min(Math.floor((score - 50) / 7), amounts.length - 1);
      signals.push({
        type,
        description: `${rounds[roundIdx]} - €${amounts[Math.max(0, amountIdx)]}`,
        source: fundingSources[(index + i) % fundingSources.length],
        date: `${month} ${year}`,
      });
    } else if (type === 'Hiring') {
      const positions = ['Engineering', 'Sales', 'Operations', 'Management', 'Production'];
      const counts = ['+12', '+25', '+40', '+65', '+100', '+150'];
      const countIdx = Math.min(Math.floor((score - 40) / 10), counts.length - 1);
      signals.push({
        type,
        description: `${positions[(index + i) % positions.length]} ${counts[Math.max(0, countIdx)]} roles`,
        source: hiringSources[(index + i) % hiringSources.length],
        date: `${month} ${year}`,
      });
    } else if (type === 'Expansion') {
      const expansions = ['New facility planned', 'Capacity doubling', 'Second location', 'Warehouse expansion', 'R&D center'];
      signals.push({
        type,
        description: expansions[(index + i) % expansions.length],
        source: expansionSources[(index + i) % expansionSources.length],
        date: `${month} ${year}`,
      });
    } else {
      const growths = ['+18%', '+24%', '+32%', '+45%', '+58%', '+72%'];
      const growthIdx = Math.min(Math.floor((score - 40) / 10), growths.length - 1);
      signals.push({
        type,
        description: `${growths[Math.max(0, growthIdx)]} YoY`,
        source: revenueSources[(index + i) % revenueSources.length],
        date: `${month} ${year}`,
      });
    }
  }
  
  return signals;
}

function generateSubScores(score: number, index: number): Company['subScores'] {
  const variance = (i: number) => Math.floor(seededRandom(index * 100 + i) * 20) - 10;
  const base = score;
  return {
    funding: Math.max(0, Math.min(100, base + variance(1) + (score >= 80 ? 5 : -5))),
    hiring: Math.max(0, Math.min(100, base + variance(2))),
    revenue: Math.max(0, Math.min(100, base + variance(3) - 3)),
    market: Math.max(0, Math.min(100, base + variance(4) + 2)),
  };
}

function generateCompanies(): Company[] {
  return companyData.map((data, i) => {
    const firstName = germanFirstNames[i % germanFirstNames.length];
    const lastName = germanLastNames[i % germanLastNames.length];
    const companySlug = data.name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    const daysAgo = Math.floor(seededRandom(i * 7) * 14) + 1;
    
    return {
      id: i + 1,
      name: data.name,
      industry: data.industry,
      location: data.location,
      employees: data.employees,
      founded: data.founded,
      address: generateAddress(data.location, i),
      score: data.score,
      signals: generateSignals(i, data.score),
      subScores: generateSubScores(data.score, i),
      contact: {
        name: `${firstName} ${lastName}`,
        role: roles[i % roles.length],
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${companySlug}.de`,
        phone: `+49 30 ${String(2000000 + i * 12345).slice(0, 4)} ${String(1000 + i * 111).slice(0, 4)}`,
      },
      updated: daysAgo === 1 ? '1 day ago' : `${daysAgo} days ago`,
    };
  });
}

const companies = generateCompanies();

type SortKey = 'name' | 'industry' | 'location' | 'employees' | 'score' | 'updated';
type SortDir = 'asc' | 'desc';

function generateOutreach(company: Company): string {
  const primary = company.signals[0];
  let opener = '';
  
  if (primary?.type === 'Funding') {
    opener = `Congratulations on your recent ${primary.description.split(' - ')[0]}. This positions ${company.name} well for the next growth phase.`;
  } else if (primary?.type === 'Expansion') {
    opener = `I noticed ${company.name} is planning significant expansion. This is an exciting time for your organization.`;
  } else if (primary?.type === 'Hiring') {
    opener = `Your team growth at ${company.name} signals strong momentum. Scaling operations often requires expanded facilities.`;
  } else {
    opener = `${company.name}'s recent performance has caught our attention. Your growth trajectory is impressive.`;
  }
  
  return `${opener}

We specialize in identifying prime industrial and commercial properties in Berlin-Brandenburg. Given your current trajectory, I'd welcome the opportunity to discuss how we might support your facility requirements.

Would you have 15 minutes this week for a brief call?`;
}

function getScoreColor(score: number): string {
  if (score >= 80) return colors.green;
  if (score >= 60) return colors.amber;
  return colors.red;
}

function getSignalColor(type: SignalType): string {
  switch (type) {
    case 'Funding': return colors.green;
    case 'Hiring': return colors.blue;
    case 'Expansion': return colors.amber;
    case 'Revenue': return '#8b5cf6';
  }
}

export default function LeadIntelligencePage() {
  const [locationFilter, setLocationFilter] = useState<Location[]>([]);
  const [industryFilter, setIndustryFilter] = useState<Industry[]>([]);
  const [signalFilter, setSignalFilter] = useState<SignalType[]>([]);
  const [minScore, setMinScore] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selected, setSelected] = useState<Company | null>(null);

  const filtered = useMemo(() => {
    return companies.filter((c) => {
      if (locationFilter.length > 0 && !locationFilter.includes(c.location)) return false;
      if (industryFilter.length > 0 && !industryFilter.includes(c.industry)) return false;
      if (signalFilter.length > 0) {
        const types = c.signals.map((s) => s.type);
        if (!signalFilter.some((f) => types.includes(f))) return false;
      }
      if (c.score < minScore) return false;
      return true;
    });
  }, [locationFilter, industryFilter, signalFilter, minScore]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal: string | number = a[sortKey];
      let bVal: string | number = b[sortKey];
      
      if (sortKey === 'updated') {
        aVal = parseInt(a.updated);
        bVal = parseInt(b.updated);
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [filtered, sortKey, sortDir]);

  const topLeads = useMemo(() => {
    return [...companies].sort((a, b) => b.score - a.score).slice(0, 5);
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  function toggleFilter<T>(value: T, current: T[], setter: (v: T[]) => void) {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  }

  const chartData = selected
    ? [
        { label: 'Funding', value: selected.subScores.funding, max: 25 },
        { label: 'Hiring', value: selected.subScores.hiring, max: 25 },
        { label: 'Revenue', value: selected.subScores.revenue, max: 25 },
        { label: 'Market', value: selected.subScores.market, max: 25 },
      ].map((d) => ({ ...d, scaled: Math.round(d.value / 4) }))
    : [];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: colors.bg, color: colors.text, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <header style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: colors.muted, textDecoration: 'none', fontSize: 13 }}>
            <ArrowLeft size={16} />
            Back
          </Link>
          <span style={{ color: colors.border }}>|</span>
          <span style={{ fontSize: 18, fontWeight: 500 }}>Lead Scout</span>
        </div>
        <span style={{ fontSize: 13, color: colors.muted }}>{filtered.length} companies</span>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${colors.border}`, display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {locations.map((loc) => {
                  const active = locationFilter.includes(loc);
                  return (
                    <button
                      key={loc}
                      onClick={() => toggleFilter(loc, locationFilter, setLocationFilter)}
                      style={{
                        padding: '6px 12px',
                        fontSize: 13,
                        background: active ? colors.text : 'transparent',
                        border: `1px solid ${active ? colors.text : colors.border}`,
                        borderRadius: 4,
                        color: active ? colors.bg : colors.muted,
                        cursor: 'pointer',
                        transition: 'all 100ms ease-out',
                      }}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Industry</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {industries.map((ind) => {
                  const active = industryFilter.includes(ind);
                  return (
                    <button
                      key={ind}
                      onClick={() => toggleFilter(ind, industryFilter, setIndustryFilter)}
                      style={{
                        padding: '6px 12px',
                        fontSize: 13,
                        background: active ? colors.text : 'transparent',
                        border: `1px solid ${active ? colors.text : colors.border}`,
                        borderRadius: 4,
                        color: active ? colors.bg : colors.muted,
                        cursor: 'pointer',
                        transition: 'all 100ms ease-out',
                      }}
                    >
                      {ind}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Signal</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {signalTypes.map((sig) => {
                  const active = signalFilter.includes(sig);
                  return (
                    <button
                      key={sig}
                      onClick={() => toggleFilter(sig, signalFilter, setSignalFilter)}
                      style={{
                        padding: '6px 12px',
                        fontSize: 13,
                        background: active ? colors.text : 'transparent',
                        border: `1px solid ${active ? colors.text : colors.border}`,
                        borderRadius: 4,
                        color: active ? colors.bg : colors.muted,
                        cursor: 'pointer',
                        transition: 'all 100ms ease-out',
                      }}
                    >
                      {sig}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
              <span style={{ fontSize: 12, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Min Score</span>
              <input
                type="range"
                min={0}
                max={90}
                step={10}
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                style={{ width: 80, accentColor: colors.text }}
              />
              <span style={{ fontSize: 13, color: colors.text, minWidth: 20, textAlign: 'right' }}>{minScore}</span>
            </div>
          </div>

          <div style={{ flex: 1, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {[
                    { key: 'name', label: 'Company', width: undefined },
                    { key: 'industry', label: 'Industry', width: 110 },
                    { key: 'location', label: 'Location', width: 110 },
                    { key: 'employees', label: 'Employees', width: 90 },
                    { key: 'score', label: 'Score', width: 70 },
                    { key: 'signals', label: 'Signals', width: 180, sortable: false },
                    { key: 'updated', label: 'Updated', width: 100 },
                  ].map((col) => (
                    <th
                      key={col.key}
                      onClick={() => col.sortable !== false && toggleSort(col.key as SortKey)}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 500,
                        color: colors.muted,
                        cursor: col.sortable !== false ? 'pointer' : 'default',
                        userSelect: 'none',
                        position: 'sticky',
                        top: 0,
                        background: colors.bg,
                        width: col.width,
                        fontSize: 12,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {col.label}
                        {sortKey === col.key && (
                          sortDir === 'asc' ? <ChevronUp size={14} style={{ marginLeft: 4 }} /> : <ChevronDown size={14} style={{ marginLeft: 4 }} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.map((company) => (
                  <tr
                    key={company.id}
                    onClick={() => setSelected(company)}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      background: selected?.id === company.id ? colors.surface2 : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 100ms ease-out',
                    }}
                    onMouseEnter={(e) => {
                      if (selected?.id !== company.id) e.currentTarget.style.background = colors.surface;
                    }}
                    onMouseLeave={(e) => {
                      if (selected?.id !== company.id) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{company.name}</td>
                    <td style={{ padding: '12px 16px', color: colors.muted }}>{company.industry}</td>
                    <td style={{ padding: '12px 16px', color: colors.muted }}>{company.location}</td>
                    <td style={{ padding: '12px 16px', color: colors.muted }}>{company.employees.toLocaleString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ color: getScoreColor(company.score), fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                        {company.score}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {company.signals.slice(0, 3).map((signal, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '3px 8px',
                              fontSize: 11,
                              background: `${getSignalColor(signal.type)}12`,
                              borderRadius: 4,
                              color: getSignalColor(signal.type),
                              fontWeight: 500,
                            }}
                          >
                            {signal.type}
                          </span>
                        ))}
                        {company.signals.length > 3 && (
                          <span style={{ fontSize: 11, color: colors.muted, padding: '3px 0' }}>+{company.signals.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.muted }}>{company.updated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ padding: '16px 24px', borderTop: `1px solid ${colors.border}`, background: colors.surface, flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: colors.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>This Week&apos;s Top Leads</div>
            <div style={{ display: 'flex', gap: 12 }}>
              {topLeads.map((lead, i) => (
                <div
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'border-color 100ms ease-out',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = colors.muted)}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = colors.border)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: colors.muted }}>#{i + 1}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: getScoreColor(lead.score), fontVariantNumeric: 'tabular-nums' }}>{lead.score}</span>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lead.name}</div>
                  <div style={{ fontSize: 11, color: colors.muted }}>{lead.industry}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selected && (
          <div style={{ width: 400, borderLeft: `1px solid ${colors.border}`, background: colors.surface, overflow: 'auto', flexShrink: 0 }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0, marginBottom: 4 }}>{selected.name}</h2>
                <div style={{ fontSize: 13, color: colors.muted }}>{selected.industry} · {selected.location}</div>
              </div>
              <button
                onClick={() => setSelected(null)}
                style={{ background: 'transparent', border: 'none', color: colors.muted, cursor: 'pointer', padding: 4, marginLeft: 8, flexShrink: 0 }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 13 }}>
                <div>
                  <div style={{ color: colors.muted, marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Founded</div>
                  <div>{selected.founded}</div>
                </div>
                <div>
                  <div style={{ color: colors.muted, marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Employees</div>
                  <div>{selected.employees.toLocaleString()}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: colors.muted, marginBottom: 4, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Address</div>
                  <div>{selected.address}</div>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <span style={{ fontSize: 11, color: colors.muted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Growth Score</span>
                <span style={{ fontSize: 32, fontWeight: 600, color: getScoreColor(selected.score), fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {selected.score}
                </span>
              </div>
              <div style={{ height: 140 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 25]} hide />
                    <YAxis
                      type="category"
                      dataKey="label"
                      tick={{ fill: colors.muted, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                    />
                    <Bar dataKey="scaled" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: colors.surface2, radius: [0, 4, 4, 0] }}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getScoreColor(entry.value)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: colors.muted, marginTop: 8 }}>
                <span>0</span>
                <span>25 pts each</span>
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Growth Signals</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {selected.signals.map((signal, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: getSignalColor(signal.type) }}>{signal.type}</span>
                      <span style={{ fontSize: 11, color: colors.muted }}>{signal.date}</span>
                    </div>
                    <div style={{ fontSize: 13, color: colors.text, marginBottom: 2 }}>{signal.description}</div>
                    <div style={{ fontSize: 11, color: colors.muted }}>via {signal.source}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact</div>
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 500, marginBottom: 2 }}>{selected.contact.name}</div>
                <div style={{ color: colors.muted, marginBottom: 12 }}>{selected.contact.role}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <Mail size={14} style={{ color: colors.muted, flexShrink: 0 }} />
                  <a href={`mailto:${selected.contact.email}`} style={{ color: colors.blue, textDecoration: 'none' }}>
                    {selected.contact.email}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={14} style={{ color: colors.muted, flexShrink: 0 }} />
                  <span>{selected.contact.phone}</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 11, color: colors.muted, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suggested Outreach</div>
              <div style={{ padding: 16, background: colors.bg, border: `1px solid ${colors.border}`, borderRadius: 4, fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {generateOutreach(selected)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
