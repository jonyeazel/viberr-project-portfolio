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

// Types
type GrowthSignal = {
  type: 'Funding' | 'Hiring' | 'Expansion' | 'Revenue Growth';
  description: string;
  source: string;
  date: string;
};

type Company = {
  id: number;
  name: string;
  industry: 'Production' | 'Logistics' | 'Research' | 'Office' | 'Technology';
  location: 'Berlin' | 'Brandenburg' | 'Potsdam';
  employees: number;
  founded: number;
  address: string;
  growthScore: number;
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
  lastUpdated: string;
};

// Data generation
const germanFirstNames = ['Thomas', 'Michael', 'Stefan', 'Andreas', 'Christian', 'Markus', 'Sebastian', 'Daniel', 'Julia', 'Anna', 'Sarah', 'Laura', 'Lisa', 'Katharina', 'Maria'];
const germanLastNames = ['Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Koch', 'Richter', 'Klein', 'Wolf', 'Neumann'];
const roles = ['CEO', 'Managing Director', 'Head of Operations', 'Business Development', 'CFO', 'COO'];

const companyPrefixes = ['Berlin', 'Brandenburg', 'Spree', 'Havel', 'Oder', 'Nord', 'Ost', 'West', 'Zentral', 'Metro'];
const companySuffixes = ['Tech', 'Systems', 'Solutions', 'Industries', 'Manufacturing', 'Logistics', 'Labs', 'Dynamics', 'Group', 'Werke', 'Fabrik'];
const internationalNames = ['Nexus', 'Vertex', 'Horizon', 'Quantum', 'Atlas', 'Apex', 'Fusion', 'Nova', 'Pulse', 'Vector'];

const berlinStreets = ['Alexanderplatz', 'Potsdamer Platz', 'Friedrichstraße', 'Kurfürstendamm', 'Prenzlauer Allee', 'Schönhauser Allee', 'Torstraße', 'Oranienstraße', 'Karl-Marx-Allee', 'Unter den Linden'];
const brandenburgStreets = ['Hauptstraße', 'Bahnhofstraße', 'Industriestraße', 'Gewerbepark', 'Am Kanal', 'Fabrikstraße'];
const potsdamStreets = ['Friedrich-Ebert-Straße', 'Breite Straße', 'Berliner Straße', 'Am Neuen Palais', 'Zeppelinstraße'];

const fundingSources = ['TechCrunch', 'Handelsblatt', 'Gründerszene', 'Finance Forward', 'Bloomberg', 'Reuters'];
const hiringSources = ['LinkedIn', 'StepStone', 'Indeed', 'XING', 'Company Website'];
const expansionSources = ['Press Release', 'Local News', 'IHK Berlin', 'Wirtschaftsförderung Brandenburg'];
const revenueSources = ['Bundesanzeiger', 'Annual Report', 'Industry Analysis', 'Market Research'];

const industries: Company['industry'][] = ['Production', 'Logistics', 'Research', 'Office', 'Technology'];
const locations: Company['location'][] = ['Berlin', 'Brandenburg', 'Potsdam'];
const signalTypes: GrowthSignal['type'][] = ['Funding', 'Hiring', 'Expansion', 'Revenue Growth'];

function generateCompanyName(index: number): string {
  if (index % 3 === 0) {
    return `${companyPrefixes[index % companyPrefixes.length]} ${companySuffixes[index % companySuffixes.length]} GmbH`;
  } else if (index % 3 === 1) {
    return `${internationalNames[index % internationalNames.length]} ${companySuffixes[(index + 3) % companySuffixes.length]} AG`;
  }
  return `${germanLastNames[index % germanLastNames.length]} & Partner ${companySuffixes[(index + 5) % companySuffixes.length]}`;
}

function generateAddress(location: Company['location'], index: number): string {
  const num = ((index * 7 + 13) % 150) + 1;
  if (location === 'Berlin') return `${berlinStreets[index % berlinStreets.length]} ${num}, 10${115 + (index % 85)} Berlin`;
  if (location === 'Potsdam') return `${potsdamStreets[index % potsdamStreets.length]} ${num}, 14467 Potsdam`;
  return `${brandenburgStreets[index % brandenburgStreets.length]} ${num}, 14${400 + (index % 100)} Brandenburg`;
}

function generateSignals(index: number, score: number): GrowthSignal[] {
  const signals: GrowthSignal[] = [];
  const numSignals = Math.floor(score / 25) + 1;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 0; i < numSignals && i < 4; i++) {
    const type = signalTypes[(index + i) % signalTypes.length];
    const month = months[(12 - i - (index % 3)) % 12];
    const year = i === 0 ? '2026' : '2025';
    
    if (type === 'Funding') {
      const amounts = ['€2.5M', '€5M', '€8M', '€12M', '€18M', '€25M', '€40M'];
      const rounds = ['Seed', 'Series A', 'Series B', 'Growth Round'];
      signals.push({
        type,
        description: `${rounds[(index + i) % rounds.length]} - ${amounts[(index + i) % amounts.length]}`,
        source: fundingSources[(index + i) % fundingSources.length],
        date: `${month} ${year}`,
      });
    } else if (type === 'Hiring') {
      const positions = ['Engineering Team', 'Sales Team', 'Operations', 'Management', 'Production Staff'];
      const counts = ['+15', '+25', '+40', '+60', '+100'];
      signals.push({
        type,
        description: `${positions[(index + i) % positions.length]} expansion ${counts[(index + i) % counts.length]} positions`,
        source: hiringSources[(index + i) % hiringSources.length],
        date: `${month} ${year}`,
      });
    } else if (type === 'Expansion') {
      const expansions = ['New facility planned', 'Production capacity doubling', 'Opening second location', 'Warehouse expansion', 'R&D center construction'];
      signals.push({
        type,
        description: expansions[(index + i) % expansions.length],
        source: expansionSources[(index + i) % expansionSources.length],
        date: `${month} ${year}`,
      });
    } else {
      const growths = ['+35% YoY', '+52% YoY', '+28% YoY', '+45% YoY', '+67% YoY'];
      signals.push({
        type,
        description: `Revenue growth ${growths[(index + i) % growths.length]}`,
        source: revenueSources[(index + i) % revenueSources.length],
        date: `${month} ${year}`,
      });
    }
  }
  
  return signals;
}

function generateCompanies(count: number): Company[] {
  return Array.from({ length: count }, (_, i) => {
    const location = locations[i % locations.length];
    const baseScore = 40 + Math.floor((Math.sin(i * 0.7) + 1) * 30);
    const growthScore = Math.min(98, Math.max(25, baseScore + (i % 15)));
    
    const funding = Math.floor(growthScore * (0.6 + (i % 5) * 0.1));
    const hiring = Math.floor(growthScore * (0.7 + ((i + 2) % 5) * 0.08));
    const revenue = Math.floor(growthScore * (0.5 + ((i + 1) % 5) * 0.12));
    const market = Math.floor(growthScore * (0.65 + ((i + 3) % 5) * 0.09));
    
    const firstName = germanFirstNames[i % germanFirstNames.length];
    const lastName = germanLastNames[(i + 5) % germanLastNames.length];
    
    return {
      id: i + 1,
      name: generateCompanyName(i),
      industry: industries[i % industries.length],
      location,
      employees: 20 + (i * 17 + 50) % 480,
      founded: 2008 + (i % 15),
      address: generateAddress(location, i),
      growthScore,
      signals: generateSignals(i, growthScore),
      subScores: {
        funding: Math.min(100, funding),
        hiring: Math.min(100, hiring),
        revenue: Math.min(100, revenue),
        market: Math.min(100, market),
      },
      contact: {
        name: `${firstName} ${lastName}`,
        role: roles[i % roles.length],
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${generateCompanyName(i).split(' ')[0].toLowerCase()}.de`,
        phone: `+49 30 ${String(2000000 + i * 12345).slice(0, 4)} ${String(1000 + i * 111).slice(0, 4)}`,
      },
      lastUpdated: `${((i % 7) + 1)} day${(i % 7) === 0 ? '' : 's'} ago`,
    };
  });
}

const companies = generateCompanies(28);

type SortKey = 'name' | 'industry' | 'location' | 'employees' | 'growthScore' | 'lastUpdated';
type SortDir = 'asc' | 'desc';

function generateOutreachMessage(company: Company): string {
  const primarySignal = company.signals[0];
  let opener = '';
  
  if (primarySignal?.type === 'Funding') {
    opener = `Congratulations on your recent ${primarySignal.description.split(' - ')[0]}. This positions ${company.name} well for your next phase of growth.`;
  } else if (primarySignal?.type === 'Expansion') {
    opener = `I noticed ${company.name} is planning significant expansion. This is an exciting time for your organization.`;
  } else if (primarySignal?.type === 'Hiring') {
    opener = `Your team growth at ${company.name} signals strong momentum. Scaling operations often requires expanded facilities.`;
  } else {
    opener = `${company.name}'s recent performance has caught our attention. Your growth trajectory is impressive.`;
  }
  
  return `${opener}

We specialize in identifying prime industrial and commercial properties in the Berlin-Brandenburg region. Given your current trajectory, I'd welcome the opportunity to discuss how we might support your facility requirements.

Would you have 15 minutes this week for a brief call?`;
}

export default function LeadIntelligencePage() {
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [industryFilter, setIndustryFilter] = useState<string[]>([]);
  const [signalFilter, setSignalFilter] = useState<string[]>([]);
  const [scoreThreshold, setScoreThreshold] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('growthScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const filteredCompanies = useMemo(() => {
    return companies.filter((company) => {
      if (locationFilter.length > 0 && !locationFilter.includes(company.location)) return false;
      if (industryFilter.length > 0 && !industryFilter.includes(company.industry)) return false;
      if (signalFilter.length > 0) {
        const companySignalTypes = company.signals.map((s) => s.type);
        if (!signalFilter.some((sf) => companySignalTypes.includes(sf as GrowthSignal['type']))) return false;
      }
      if (company.growthScore < scoreThreshold) return false;
      return true;
    });
  }, [locationFilter, industryFilter, signalFilter, scoreThreshold]);

  const sortedCompanies = useMemo(() => {
    return [...filteredCompanies].sort((a, b) => {
      let aVal: string | number = a[sortKey];
      let bVal: string | number = b[sortKey];
      
      if (sortKey === 'lastUpdated') {
        aVal = parseInt(a.lastUpdated);
        bVal = parseInt(b.lastUpdated);
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [filteredCompanies, sortKey, sortDir]);

  const topLeads = useMemo(() => {
    return [...companies].sort((a, b) => b.growthScore - a.growthScore).slice(0, 5);
  }, []);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const toggleFilter = (value: string, current: string[], setter: (v: string[]) => void) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return colors.green;
    if (score >= 60) return colors.blue;
    if (score >= 40) return colors.amber;
    return colors.muted;
  };

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return null;
    return sortDir === 'asc' ? (
      <ChevronUp size={14} style={{ marginLeft: 4 }} />
    ) : (
      <ChevronDown size={14} style={{ marginLeft: 4 }} />
    );
  };

  const FilterButton = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        fontSize: 13,
        background: active ? colors.surface2 : 'transparent',
        border: `1px solid ${active ? colors.blue : colors.border}`,
        borderRadius: 4,
        color: active ? colors.text : colors.muted,
        cursor: 'pointer',
        transition: 'all 150ms ease-out',
      }}
    >
      {label}
    </button>
  );

  const chartData = selectedCompany
    ? [
        { name: 'Funding', value: selectedCompany.subScores.funding },
        { name: 'Hiring', value: selectedCompany.subScores.hiring },
        { name: 'Revenue', value: selectedCompany.subScores.revenue },
        { name: 'Market', value: selectedCompany.subScores.market },
      ]
    : [];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '16px 24px',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: colors.muted,
              textDecoration: 'none',
              fontSize: 13,
              transition: 'color 150ms ease-out',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.text)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.muted)}
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <span style={{ color: colors.border }}>|</span>
          <h1 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>Hybrick Lead Scout</h1>
        </div>
        <div style={{ fontSize: 13, color: colors.muted }}>
          {filteredCompanies.length} companies
        </div>
      </header>

      <div style={{ display: 'flex', height: 'calc(100vh - 57px)' }}>
        {/* Main content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Filter bar */}
          <div
            style={{
              padding: '16px 24px',
              borderBottom: `1px solid ${colors.border}`,
              display: 'flex',
              gap: 24,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {/* Location */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: colors.muted }}>Location</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {locations.map((loc) => (
                  <FilterButton
                    key={loc}
                    label={loc}
                    active={locationFilter.includes(loc)}
                    onClick={() => toggleFilter(loc, locationFilter, setLocationFilter)}
                  />
                ))}
              </div>
            </div>

            {/* Industry */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: colors.muted }}>Industry</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {industries.map((ind) => (
                  <FilterButton
                    key={ind}
                    label={ind}
                    active={industryFilter.includes(ind)}
                    onClick={() => toggleFilter(ind, industryFilter, setIndustryFilter)}
                  />
                ))}
              </div>
            </div>

            {/* Signals */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: colors.muted }}>Signal</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {signalTypes.map((sig) => (
                  <FilterButton
                    key={sig}
                    label={sig}
                    active={signalFilter.includes(sig)}
                    onClick={() => toggleFilter(sig, signalFilter, setSignalFilter)}
                  />
                ))}
              </div>
            </div>

            {/* Score threshold */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: colors.muted }}>Min Score</span>
              <input
                type="range"
                min={0}
                max={90}
                step={10}
                value={scoreThreshold}
                onChange={(e) => setScoreThreshold(Number(e.target.value))}
                style={{ width: 100, accentColor: colors.blue }}
              />
              <span style={{ fontSize: 13, color: colors.text, minWidth: 24 }}>{scoreThreshold}</span>
            </div>
          </div>

          {/* Table */}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                  {[
                    { key: 'name', label: 'Company' },
                    { key: 'industry', label: 'Industry' },
                    { key: 'location', label: 'Location' },
                    { key: 'employees', label: 'Employees' },
                    { key: 'growthScore', label: 'Score' },
                    { key: 'signals', label: 'Signals', sortable: false },
                    { key: 'lastUpdated', label: 'Updated' },
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
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {col.label}
                        {col.sortable !== false && <SortIcon column={col.key as SortKey} />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedCompanies.map((company) => (
                  <tr
                    key={company.id}
                    onClick={() => setSelectedCompany(company)}
                    style={{
                      borderBottom: `1px solid ${colors.border}`,
                      background:
                        selectedCompany?.id === company.id
                          ? colors.surface2
                          : company.growthScore >= 80
                          ? `${colors.green}08`
                          : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 150ms ease-out',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedCompany?.id !== company.id) {
                        e.currentTarget.style.background = colors.surface;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedCompany?.id !== company.id) {
                        e.currentTarget.style.background =
                          company.growthScore >= 80 ? `${colors.green}08` : 'transparent';
                      }
                    }}
                  >
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{company.name}</td>
                    <td style={{ padding: '12px 16px', color: colors.muted }}>{company.industry}</td>
                    <td style={{ padding: '12px 16px', color: colors.muted }}>{company.location}</td>
                    <td style={{ padding: '12px 16px', color: colors.muted }}>{company.employees}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span
                        style={{
                          color: getScoreColor(company.growthScore),
                          fontWeight: 500,
                        }}
                      >
                        {company.growthScore}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {company.signals.slice(0, 2).map((signal, i) => (
                          <span
                            key={i}
                            style={{
                              padding: '2px 8px',
                              fontSize: 11,
                              background: colors.surface2,
                              borderRadius: 4,
                              color: colors.muted,
                            }}
                          >
                            {signal.type}
                          </span>
                        ))}
                        {company.signals.length > 2 && (
                          <span style={{ fontSize: 11, color: colors.muted }}>
                            +{company.signals.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: colors.muted }}>{company.lastUpdated}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Weekly Report Summary */}
          <div
            style={{
              padding: '16px 24px',
              borderTop: `1px solid ${colors.border}`,
              background: colors.surface,
            }}
          >
            <div style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>
              This Week&apos;s Top Leads
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {topLeads.map((lead, i) => (
                <div
                  key={lead.id}
                  onClick={() => setSelectedCompany(lead)}
                  style={{
                    flex: 1,
                    padding: 12,
                    background: colors.surface2,
                    borderRadius: 4,
                    cursor: 'pointer',
                    transition: 'background 150ms ease-out',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = colors.border)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = colors.surface2)}
                >
                  <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4 }}>#{i + 1}</div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>{lead.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: colors.muted }}>{lead.industry}</span>
                    <span style={{ fontSize: 13, fontWeight: 500, color: getScoreColor(lead.growthScore) }}>
                      {lead.growthScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detail Panel */}
        {selectedCompany && (
          <div
            style={{
              width: 420,
              borderLeft: `1px solid ${colors.border}`,
              background: colors.surface,
              overflow: 'auto',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                padding: '16px 20px',
                borderBottom: `1px solid ${colors.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>{selectedCompany.name}</h2>
                <div style={{ fontSize: 13, color: colors.muted, marginTop: 4 }}>
                  {selectedCompany.industry} · {selectedCompany.location}
                </div>
              </div>
              <button
                onClick={() => setSelectedCompany(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: colors.muted,
                  cursor: 'pointer',
                  padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Overview */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 16,
                  fontSize: 13,
                }}
              >
                <div>
                  <div style={{ color: colors.muted, marginBottom: 4 }}>Founded</div>
                  <div>{selectedCompany.founded}</div>
                </div>
                <div>
                  <div style={{ color: colors.muted, marginBottom: 4 }}>Employees</div>
                  <div>{selectedCompany.employees}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ color: colors.muted, marginBottom: 4 }}>Address</div>
                  <div>{selectedCompany.address}</div>
                </div>
              </div>
            </div>

            {/* Growth Score */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: colors.muted }}>Growth Score</span>
                <span
                  style={{
                    fontSize: 24,
                    fontWeight: 500,
                    color: getScoreColor(selectedCompany.growthScore),
                  }}
                >
                  {selectedCompany.growthScore}
                </span>
              </div>
              <div style={{ height: 120 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: colors.muted, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={60}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getScoreColor(entry.value)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Signals */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>Growth Signals</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selectedCompany.signals.map((signal, i) => (
                  <div key={i} style={{ fontSize: 13 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontWeight: 500 }}>{signal.type}</span>
                      <span style={{ color: colors.muted }}>{signal.date}</span>
                    </div>
                    <div style={{ color: colors.muted }}>{signal.description}</div>
                    <div style={{ fontSize: 11, color: colors.muted, marginTop: 2 }}>via {signal.source}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${colors.border}` }}>
              <div style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>Contact</div>
              <div style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 500 }}>{selectedCompany.contact.name}</div>
                <div style={{ color: colors.muted, marginBottom: 8 }}>{selectedCompany.contact.role}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <Mail size={14} style={{ color: colors.muted }} />
                  <a
                    href={`mailto:${selectedCompany.contact.email}`}
                    style={{ color: colors.blue, textDecoration: 'none' }}
                  >
                    {selectedCompany.contact.email}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone size={14} style={{ color: colors.muted }} />
                  <span>{selectedCompany.contact.phone}</span>
                </div>
              </div>
            </div>

            {/* Outreach */}
            <div style={{ padding: '16px 20px' }}>
              <div style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>Suggested Outreach</div>
              <div
                style={{
                  padding: 12,
                  background: colors.surface2,
                  borderRadius: 4,
                  fontSize: 13,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {generateOutreachMessage(selectedCompany)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
