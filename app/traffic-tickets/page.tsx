'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, X, Check, AlertCircle, ChevronRight } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// Types
type TicketStatus = 'ingested' | 'matched' | 'dispatched' | 'exception';
type ViolationType = 'speeding' | 'parking' | 'red_light' | 'toll_evasion';
type ExceptionReason = 'unmatched_vehicle' | 'ambiguous_renter' | 'missing_data' | 'deadline_risk';
type TabId = 'incoming' | 'exceptions' | 'completed' | 'analytics';

interface ProcessingStep {
  name: string;
  timestamp: Date | null;
  completed: boolean;
}

interface Ticket {
  id: string;
  dateReceived: Date;
  violationType: ViolationType;
  licensePlate: string;
  vehicleMake: string;
  vehicleModel: string;
  fleetAssignment: string;
  renterName: string | null;
  renterConfidence: number | null;
  bookingStart: Date | null;
  bookingEnd: Date | null;
  status: TicketStatus;
  deadline: Date;
  processingTimeMs: number;
  fineAmount: number;
  location: string;
  exceptionReason: ExceptionReason | null;
  processingSteps: ProcessingStep[];
}

// German cities
const germanCities = [
  'Berlin', 'Hamburg', 'München', 'Köln', 'Frankfurt', 'Stuttgart', 'Düsseldorf',
  'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hannover', 'Nürnberg',
  'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster',
];

// German license plate prefixes by city
const platePrefixes: Record<string, string[]> = {
  'Berlin': ['B'],
  'Hamburg': ['HH'],
  'München': ['M'],
  'Köln': ['K'],
  'Frankfurt': ['F'],
  'Stuttgart': ['S'],
  'Düsseldorf': ['D'],
  'Leipzig': ['L'],
  'Dortmund': ['DO'],
  'Essen': ['E'],
  'Bremen': ['HB'],
  'Dresden': ['DD'],
  'Hannover': ['H'],
  'Nürnberg': ['N'],
  'Duisburg': ['DU'],
  'Bochum': ['BO'],
  'Wuppertal': ['W'],
  'Bielefeld': ['BI'],
  'Bonn': ['BN'],
  'Münster': ['MS'],
};

const firstNames = [
  'Anna', 'Thomas', 'Maria', 'Stefan', 'Julia', 'Michael', 'Laura', 'Andreas',
  'Sarah', 'Christian', 'Lisa', 'Markus', 'Nina', 'Daniel', 'Katharina', 'Florian',
  'Sophie', 'Tobias', 'Hannah', 'Sebastian', 'Lena', 'Philipp', 'Emma', 'Lukas',
  'Johanna', 'Felix', 'Clara', 'Maximilian', 'Marie', 'David',
];

const lastNames = [
  'Mueller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker',
  'Schulz', 'Hoffmann', 'Schaefer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf',
  'Schroeder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krueger', 'Hofmann', 'Hartmann',
  'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier',
];

const vehicleMakes = ['BMW', 'Mercedes', 'Audi', 'VW', 'Opel', 'Ford', 'Skoda', 'Seat'];
const vehicleModels: Record<string, string[]> = {
  'BMW': ['320i', '520d', 'X3', 'X5', '118i'],
  'Mercedes': ['C200', 'E300', 'A180', 'GLA', 'CLA'],
  'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5'],
  'VW': ['Golf', 'Passat', 'Tiguan', 'Polo', 'T-Roc'],
  'Opel': ['Astra', 'Corsa', 'Insignia', 'Mokka', 'Crossland'],
  'Ford': ['Focus', 'Fiesta', 'Kuga', 'Puma', 'Mondeo'],
  'Skoda': ['Octavia', 'Fabia', 'Superb', 'Kodiaq', 'Kamiq'],
  'Seat': ['Leon', 'Ibiza', 'Ateca', 'Arona', 'Tarraco'],
};

const fleetAssignments = [
  'Corporate Fleet A', 'Corporate Fleet B', 'Rental Pool Berlin', 'Rental Pool Hamburg',
  'Rental Pool München', 'Long-Term Leasing', 'Short-Term Rental', 'Executive Fleet',
];

const violationLabels: Record<ViolationType, string> = {
  speeding: 'Speeding',
  parking: 'Parking',
  red_light: 'Red Light',
  toll_evasion: 'Toll Evasion',
};

const statusLabels: Record<TicketStatus, string> = {
  ingested: 'Ingested',
  matched: 'Matched',
  dispatched: 'Dispatched',
  exception: 'Exception',
};

const exceptionLabels: Record<ExceptionReason, string> = {
  unmatched_vehicle: 'Unmatched Vehicle',
  ambiguous_renter: 'Ambiguous Renter',
  missing_data: 'Missing Data',
  deadline_risk: 'Deadline Risk',
};

// Seeded random for consistent data
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function generateLicensePlate(random: () => number, city: string): string {
  const prefixes = platePrefixes[city] || ['XX'];
  const prefix = prefixes[Math.floor(random() * prefixes.length)];
  const letters = 'ABCDEFGHJKLMNPRSTUVWXYZ';
  const letter1 = letters[Math.floor(random() * letters.length)];
  const letter2 = letters[Math.floor(random() * letters.length)];
  const numbers = Math.floor(random() * 9000) + 1000;
  return `${prefix}-${letter1}${letter2} ${numbers}`;
}

function generateTickets(): Ticket[] {
  const random = seededRandom(2024);
  const tickets: Ticket[] = [];
  const now = new Date();

  for (let i = 0; i < 42; i++) {
    const city = germanCities[Math.floor(random() * germanCities.length)];
    const violationTypes: ViolationType[] = ['speeding', 'parking', 'red_light', 'toll_evasion'];
    const violationType = violationTypes[Math.floor(random() * violationTypes.length)];
    
    const make = vehicleMakes[Math.floor(random() * vehicleMakes.length)];
    const model = vehicleModels[make][Math.floor(random() * vehicleModels[make].length)];
    
    // Fine amounts based on violation type (in EUR)
    const fineAmounts: Record<ViolationType, [number, number]> = {
      speeding: [15, 680],
      parking: [10, 55],
      red_light: [90, 360],
      toll_evasion: [20, 130],
    };
    const [minFine, maxFine] = fineAmounts[violationType];
    const fineAmount = Math.round(minFine + random() * (maxFine - minFine));

    // Date received: within last 7 days
    const daysAgo = random() * 7;
    const dateReceived = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Deadline: 14-30 days from date received
    const deadlineDays = 14 + Math.floor(random() * 16);
    const deadline = new Date(dateReceived.getTime() + deadlineDays * 24 * 60 * 60 * 1000);

    // Status distribution: 15% ingested, 25% matched, 45% dispatched, 15% exception
    const statusRandom = random();
    let status: TicketStatus;
    let exceptionReason: ExceptionReason | null = null;
    
    if (statusRandom < 0.15) {
      status = 'ingested';
    } else if (statusRandom < 0.40) {
      status = 'matched';
    } else if (statusRandom < 0.85) {
      status = 'dispatched';
    } else {
      status = 'exception';
      const exceptionTypes: ExceptionReason[] = ['unmatched_vehicle', 'ambiguous_renter', 'missing_data', 'deadline_risk'];
      exceptionReason = exceptionTypes[Math.floor(random() * exceptionTypes.length)];
    }

    // Renter info (only if matched or dispatched)
    let renterName: string | null = null;
    let renterConfidence: number | null = null;
    let bookingStart: Date | null = null;
    let bookingEnd: Date | null = null;

    if (status === 'matched' || status === 'dispatched') {
      const firstName = firstNames[Math.floor(random() * firstNames.length)];
      const lastName = lastNames[Math.floor(random() * lastNames.length)];
      renterName = `${firstName} ${lastName}`;
      renterConfidence = 85 + Math.floor(random() * 15);
      
      // Booking overlaps with violation date
      const violationDate = new Date(dateReceived.getTime() - random() * 2 * 24 * 60 * 60 * 1000);
      bookingStart = new Date(violationDate.getTime() - random() * 3 * 24 * 60 * 60 * 1000);
      bookingEnd = new Date(violationDate.getTime() + random() * 5 * 24 * 60 * 60 * 1000);
    } else if (status === 'exception' && exceptionReason === 'ambiguous_renter') {
      const firstName = firstNames[Math.floor(random() * firstNames.length)];
      const lastName = lastNames[Math.floor(random() * lastNames.length)];
      renterName = `${firstName} ${lastName}`;
      renterConfidence = 45 + Math.floor(random() * 30);
    }

    // Processing time (faster for more automated statuses)
    const processingTimes: Record<TicketStatus, [number, number]> = {
      ingested: [500, 2000],
      matched: [1500, 5000],
      dispatched: [3000, 8000],
      exception: [8000, 30000],
    };
    const [minTime, maxTime] = processingTimes[status];
    const processingTimeMs = Math.round(minTime + random() * (maxTime - minTime));

    // Processing steps
    const baseTime = dateReceived.getTime();
    const processingSteps: ProcessingStep[] = [
      {
        name: 'Ingested',
        timestamp: new Date(baseTime),
        completed: true,
      },
      {
        name: 'Parsed',
        timestamp: status !== 'ingested' ? new Date(baseTime + 500 + random() * 1000) : null,
        completed: status !== 'ingested',
      },
      {
        name: 'Vehicle Matched',
        timestamp: (status === 'matched' || status === 'dispatched') ? new Date(baseTime + 2000 + random() * 2000) : null,
        completed: status === 'matched' || status === 'dispatched',
      },
      {
        name: 'Renter Identified',
        timestamp: (status === 'matched' || status === 'dispatched') ? new Date(baseTime + 4000 + random() * 2000) : null,
        completed: status === 'matched' || status === 'dispatched',
      },
      {
        name: 'Dispatched',
        timestamp: status === 'dispatched' ? new Date(baseTime + 6000 + random() * 2000) : null,
        completed: status === 'dispatched',
      },
    ];

    tickets.push({
      id: `TKT-${String(100000 + i).slice(1)}`,
      dateReceived,
      violationType,
      licensePlate: generateLicensePlate(random, city),
      vehicleMake: make,
      vehicleModel: model,
      fleetAssignment: fleetAssignments[Math.floor(random() * fleetAssignments.length)],
      renterName,
      renterConfidence,
      bookingStart,
      bookingEnd,
      status,
      deadline,
      processingTimeMs,
      fineAmount,
      location: city,
      exceptionReason,
      processingSteps,
    });
  }

  return tickets.sort((a, b) => b.dateReceived.getTime() - a.dateReceived.getTime());
}

// Helper functions
function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function formatProcessingTime(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function daysUntil(date: Date): number {
  const now = new Date();
  return Math.ceil((date.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
}

export default function TrafficTicketsPage() {
  const initialTickets = useMemo(() => generateTickets(), []);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('incoming');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayTickets = tickets.filter(t => t.dateReceived >= today);
    const processedToday = todayTickets.filter(t => t.status === 'dispatched');
    const autoProcessedRate = todayTickets.length > 0 
      ? (processedToday.length / todayTickets.length) * 100 
      : 0;
    
    const avgProcessingTime = tickets.length > 0
      ? tickets.reduce((sum, t) => sum + t.processingTimeMs, 0) / tickets.length
      : 0;
    
    const pendingReview = tickets.filter(t => t.status === 'exception').length;
    
    const deadlineAlerts = tickets.filter(t => {
      const days = daysUntil(t.deadline);
      return days <= 3 && t.status !== 'dispatched';
    }).length;

    return {
      ticketsToday: todayTickets.length,
      autoProcessedRate,
      avgProcessingTime,
      pendingReview,
      deadlineAlerts,
    };
  }, [tickets]);

  // Pipeline counts
  const pipelineCounts = useMemo(() => {
    return {
      ingested: tickets.filter(t => t.status === 'ingested').length,
      matched: tickets.filter(t => t.status === 'matched').length,
      dispatched: tickets.filter(t => t.status === 'dispatched').length,
      exception: tickets.filter(t => t.status === 'exception').length,
    };
  }, [tickets]);

  // Analytics data
  const analyticsData = useMemo(() => {
    // Violation type distribution
    const violationCounts: Record<ViolationType, number> = {
      speeding: 0,
      parking: 0,
      red_light: 0,
      toll_evasion: 0,
    };
    tickets.forEach(t => violationCounts[t.violationType]++);
    const violationData = Object.entries(violationCounts).map(([key, value]) => ({
      name: violationLabels[key as ViolationType],
      value,
    }));

    // Daily volume (last 7 days)
    const dailyVolume: Record<string, number> = {};
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toLocaleDateString('de-DE', { weekday: 'short' });
      dailyVolume[dateStr] = 0;
    }
    tickets.forEach(t => {
      const dateStr = t.dateReceived.toLocaleDateString('de-DE', { weekday: 'short' });
      if (dailyVolume[dateStr] !== undefined) {
        dailyVolume[dateStr]++;
      }
    });
    const volumeData = Object.entries(dailyVolume).map(([name, count]) => ({
      name,
      count,
    }));

    // Auto-processing rate over time (last 7 days)
    const rateData: { name: string; rate: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      
      const dayTickets = tickets.filter(t => 
        t.dateReceived >= dateStart && t.dateReceived <= dateEnd
      );
      const dispatched = dayTickets.filter(t => t.status === 'dispatched');
      const rate = dayTickets.length > 0 
        ? (dispatched.length / dayTickets.length) * 100 
        : 0;
      
      rateData.push({
        name: date.toLocaleDateString('de-DE', { weekday: 'short' }),
        rate: Math.round(rate),
      });
    }

    return { violationData, volumeData, rateData };
  }, [tickets]);

  // Filtered tickets based on active tab
  const filteredTickets = useMemo(() => {
    switch (activeTab) {
      case 'incoming':
        return tickets.filter(t => t.status !== 'dispatched' && t.status !== 'exception');
      case 'exceptions':
        return tickets.filter(t => t.status === 'exception');
      case 'completed':
        return tickets.filter(t => t.status === 'dispatched');
      default:
        return tickets;
    }
  }, [tickets, activeTab]);

  // Actions
  const confirmAndDispatch = (ticketId: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id !== ticketId) return ticket;
      const now = new Date();
      return {
        ...ticket,
        status: 'dispatched' as TicketStatus,
        processingSteps: ticket.processingSteps.map((step, i) => 
          i === 4 ? { ...step, timestamp: now, completed: true } : step
        ),
      };
    }));
  };

  const reassignTicket = (ticketId: string) => {
    const random = seededRandom(Date.now());
    const firstName = firstNames[Math.floor(random() * firstNames.length)];
    const lastName = lastNames[Math.floor(random() * lastNames.length)];
    
    setTickets(prev => prev.map(ticket => {
      if (ticket.id !== ticketId) return ticket;
      return {
        ...ticket,
        renterName: `${firstName} ${lastName}`,
        renterConfidence: 95 + Math.floor(random() * 5),
        status: 'matched' as TicketStatus,
        exceptionReason: null,
      };
    }));
  };

  const flagForReview = (ticketId: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id !== ticketId) return ticket;
      return {
        ...ticket,
        status: 'exception' as TicketStatus,
        exceptionReason: 'missing_data' as ExceptionReason,
      };
    }));
  };

  const dismissTicket = (ticketId: string) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    if (selectedTicketId === ticketId) {
      setSelectedTicketId(null);
    }
  };

  const resolveException = (ticketId: string) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id !== ticketId) return ticket;
      return {
        ...ticket,
        status: 'matched' as TicketStatus,
        exceptionReason: null,
        renterConfidence: ticket.renterConfidence ? Math.min(99, ticket.renterConfidence + 30) : 95,
      };
    }));
  };

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'incoming', label: 'Incoming', count: tickets.filter(t => t.status !== 'dispatched' && t.status !== 'exception').length },
    { id: 'exceptions', label: 'Exceptions', count: pipelineCounts.exception },
    { id: 'completed', label: 'Completed', count: pipelineCounts.dispatched },
    { id: 'analytics', label: 'Analytics' },
  ];

  const CHART_COLORS = ['#2563eb', '#16a34a', '#d97706', '#dc2626'];

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#fafaf9' }}>
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: '#e5e5e3' }}>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] transition-opacity duration-150 ease-out hover:opacity-70"
            style={{ color: '#737373' }}
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Back
          </Link>
          <div className="w-px h-4" style={{ backgroundColor: '#e5e5e3' }} />
          <span className="text-[15px]" style={{ color: '#191919' }}>
            Traffic Ticket Processing
          </span>
        </div>
      </header>

      {/* KPI Bar */}
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: '#e5e5e3' }}>
        <div className="flex gap-8">
          <div>
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: '#737373' }}>
              Tickets Today
            </div>
            <div className="text-[24px] font-medium" style={{ color: '#191919' }}>
              {kpis.ticketsToday}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: '#737373' }}>
              Auto-Processed
            </div>
            <div className="text-[24px] font-medium" style={{ color: kpis.autoProcessedRate >= 95 ? '#16a34a' : '#191919' }}>
              {kpis.autoProcessedRate.toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: '#737373' }}>
              Avg Processing
            </div>
            <div className="text-[24px] font-medium" style={{ color: '#191919' }}>
              {formatProcessingTime(kpis.avgProcessingTime)}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: '#737373' }}>
              Pending Review
            </div>
            <div className="text-[24px] font-medium" style={{ color: kpis.pendingReview > 0 ? '#d97706' : '#191919' }}>
              {kpis.pendingReview}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: '#737373' }}>
              Deadline Alerts
            </div>
            <div className="text-[24px] font-medium" style={{ color: kpis.deadlineAlerts > 0 ? '#dc2626' : '#191919' }}>
              {kpis.deadlineAlerts}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 px-6 border-b flex gap-1" style={{ borderColor: '#e5e5e3' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-3 text-[13px] transition-colors duration-150 ease-out relative"
            style={{
              color: activeTab === tab.id ? '#191919' : '#737373',
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className="ml-2 px-1.5 py-0.5 rounded text-[11px]"
                style={{ backgroundColor: '#eeeeec' }}
              >
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{ backgroundColor: '#2563eb' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {activeTab === 'analytics' ? (
          // Analytics view
          <div className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-3 gap-6 max-w-[1200px]">
              {/* Violation Types Pie Chart */}
              <div className="p-4 rounded" style={{ backgroundColor: '#fafaf9', border: '1px solid #e5e5e3' }}>
                <div className="text-[11px] uppercase tracking-wide mb-4" style={{ color: '#737373' }}>
                  Violation Types
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.violationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {analyticsData.violationData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fafaf9',
                          border: '1px solid #e5e5e3',
                          borderRadius: '4px',
                          color: '#191919',
                          fontSize: '13px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {analyticsData.violationData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-[13px]">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                        />
                        <span style={{ color: '#737373' }}>{item.name}</span>
                      </div>
                      <span style={{ color: '#191919' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Volume Bar Chart */}
              <div className="p-4 rounded" style={{ backgroundColor: '#fafaf9', border: '1px solid #e5e5e3' }}>
                <div className="text-[11px] uppercase tracking-wide mb-4" style={{ color: '#737373' }}>
                  Daily Volume (7 Days)
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.volumeData}>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#737373', fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#737373', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fafaf9',
                          border: '1px solid #e5e5e3',
                          borderRadius: '4px',
                          color: '#191919',
                          fontSize: '13px',
                        }}
                      />
                      <Bar dataKey="count" fill="#2563eb" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Auto-Processing Rate Line Chart */}
              <div className="p-4 rounded" style={{ backgroundColor: '#fafaf9', border: '1px solid #e5e5e3' }}>
                <div className="text-[11px] uppercase tracking-wide mb-4" style={{ color: '#737373' }}>
                  Auto-Processing Rate (%)
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.rateData}>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#737373', fontSize: 11 }}
                      />
                      <YAxis
                        domain={[0, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#737373', fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fafaf9',
                          border: '1px solid #e5e5e3',
                          borderRadius: '4px',
                          color: '#191919',
                          fontSize: '13px',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Rate']}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#16a34a"
                        strokeWidth={2}
                        dot={{ fill: '#16a34a', r: 3 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Table view
          <>
            <div className="flex-1 flex flex-col min-w-0">
              {/* Pipeline visualization (only for incoming tab) */}
              {activeTab === 'incoming' && (
                <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: '#e5e5e3' }}>
                  <div className="flex items-center gap-2">
                    {(['ingested', 'matched', 'dispatched'] as const).map((status, index) => (
                      <div key={status} className="flex items-center">
                        <div
                          className="px-4 py-2 rounded text-[13px] flex items-center gap-2"
                          style={{ backgroundColor: '#fafaf9', border: '1px solid #e5e5e3' }}
                        >
                          <span style={{ color: '#191919' }}>{statusLabels[status]}</span>
                          <span
                            className="px-1.5 py-0.5 rounded text-[11px]"
                            style={{ 
                              backgroundColor: status === 'dispatched' ? '#16a34a' : '#eeeeec',
                              color: status === 'dispatched' ? '#191919' : '#737373',
                            }}
                          >
                            {pipelineCounts[status]}
                          </span>
                        </div>
                        {index < 2 && (
                          <ChevronRight size={16} strokeWidth={1.5} style={{ color: '#737373', margin: '0 4px' }} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="flex-1 overflow-auto">
                <table className="w-full">
                  <thead className="sticky top-0" style={{ backgroundColor: '#fafaf9' }}>
                    <tr className="border-b" style={{ borderColor: '#e5e5e3' }}>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wide font-normal" style={{ color: '#737373' }}>ID</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wide font-normal" style={{ color: '#737373' }}>Received</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wide font-normal" style={{ color: '#737373' }}>Violation</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wide font-normal" style={{ color: '#737373' }}>Vehicle</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wide font-normal" style={{ color: '#737373' }}>Renter</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wide font-normal" style={{ color: '#737373' }}>Status</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wide font-normal" style={{ color: '#737373' }}>Deadline</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wide font-normal" style={{ color: '#737373' }}>Processing</th>
                      {activeTab === 'exceptions' && (
                        <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wide font-normal" style={{ color: '#737373' }}>Reason</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(ticket => {
                      const deadlineDays = daysUntil(ticket.deadline);
                      const isUrgent = deadlineDays <= 3 && ticket.status !== 'dispatched';
                      
                      return (
                        <tr
                          key={ticket.id}
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className="border-b cursor-pointer transition-colors duration-150 ease-out"
                          style={{
                            borderColor: '#e5e5e3',
                            backgroundColor: selectedTicketId === ticket.id ? '#191919' : 'transparent',
                          }}
                        >
                          <td className="px-6 py-3 text-[13px]" style={{ color: '#191919' }}>
                            {ticket.id}
                          </td>
                          <td className="px-6 py-3 text-[13px]" style={{ color: '#737373' }}>
                            {formatDate(ticket.dateReceived)}
                          </td>
                          <td className="px-6 py-3 text-[13px]" style={{ color: '#191919' }}>
                            {violationLabels[ticket.violationType]}
                          </td>
                          <td className="px-6 py-3 text-[13px]" style={{ color: '#191919' }}>
                            {ticket.licensePlate}
                          </td>
                          <td className="px-6 py-3 text-[13px]" style={{ color: ticket.renterName ? '#191919' : '#737373' }}>
                            {ticket.renterName || '—'}
                          </td>
                          <td className="px-6 py-3">
                            <span
                              className="inline-block px-2 py-0.5 rounded text-[11px]"
                              style={{
                                backgroundColor: ticket.status === 'dispatched' ? 'rgba(52, 211, 153, 0.15)' :
                                  ticket.status === 'exception' ? 'rgba(248, 113, 113, 0.15)' : '#eeeeec',
                                color: ticket.status === 'dispatched' ? '#16a34a' :
                                  ticket.status === 'exception' ? '#dc2626' : '#737373',
                              }}
                            >
                              {statusLabels[ticket.status]}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-[13px]" style={{ color: isUrgent ? '#dc2626' : '#737373' }}>
                            {formatDate(ticket.deadline)}
                            {isUrgent && ` (${deadlineDays}d)`}
                          </td>
                          <td className="px-6 py-3 text-[13px]" style={{ color: '#737373' }}>
                            {formatProcessingTime(ticket.processingTimeMs)}
                          </td>
                          {activeTab === 'exceptions' && (
                            <td className="px-6 py-3 text-[13px]" style={{ color: '#d97706' }}>
                              {ticket.exceptionReason ? exceptionLabels[ticket.exceptionReason] : '—'}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detail panel */}
            {selectedTicket && (
              <div
                className="w-[400px] flex-shrink-0 border-l flex flex-col"
                style={{ borderColor: '#e5e5e3', backgroundColor: '#fafaf9' }}
              >
                {/* Panel header */}
                <div className="flex-shrink-0 px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#e5e5e3' }}>
                  <span className="text-[15px] font-medium" style={{ color: '#191919' }}>
                    {selectedTicket.id}
                  </span>
                  <button
                    onClick={() => setSelectedTicketId(null)}
                    className="p-1 rounded transition-opacity duration-150 ease-out hover:opacity-70"
                    style={{ color: '#737373' }}
                  >
                    <X size={18} strokeWidth={1.5} />
                  </button>
                </div>

                {/* Panel content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Ticket info */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wide mb-3" style={{ color: '#737373' }}>
                      Ticket Information
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: '#737373' }}>Violation</span>
                        <span style={{ color: '#191919' }}>{violationLabels[selectedTicket.violationType]}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: '#737373' }}>Date</span>
                        <span style={{ color: '#191919' }}>{formatDateTime(selectedTicket.dateReceived)}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: '#737373' }}>Location</span>
                        <span style={{ color: '#191919' }}>{selectedTicket.location}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: '#737373' }}>Fine Amount</span>
                        <span style={{ color: '#191919' }}>{formatCurrency(selectedTicket.fineAmount)}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: '#737373' }}>Deadline</span>
                        <span style={{ color: daysUntil(selectedTicket.deadline) <= 3 ? '#dc2626' : '#191919' }}>
                          {formatDate(selectedTicket.deadline)}
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Vehicle info */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wide mb-3" style={{ color: '#737373' }}>
                      Vehicle Information
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: '#737373' }}>License Plate</span>
                        <span style={{ color: '#191919' }}>{selectedTicket.licensePlate}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: '#737373' }}>Make / Model</span>
                        <span style={{ color: '#191919' }}>{selectedTicket.vehicleMake} {selectedTicket.vehicleModel}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: '#737373' }}>Fleet</span>
                        <span style={{ color: '#191919' }}>{selectedTicket.fleetAssignment}</span>
                      </div>
                    </div>
                  </section>

                  {/* Renter match */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wide mb-3" style={{ color: '#737373' }}>
                      Renter Match
                    </div>
                    {selectedTicket.renterName ? (
                      <div className="space-y-2">
                        <div className="flex justify-between text-[13px]">
                          <span style={{ color: '#737373' }}>Name</span>
                          <span style={{ color: '#191919' }}>{selectedTicket.renterName}</span>
                        </div>
                        <div className="flex justify-between text-[13px]">
                          <span style={{ color: '#737373' }}>Confidence</span>
                          <span style={{ 
                            color: selectedTicket.renterConfidence && selectedTicket.renterConfidence >= 85 ? '#16a34a' : 
                              selectedTicket.renterConfidence && selectedTicket.renterConfidence >= 60 ? '#d97706' : '#dc2626' 
                          }}>
                            {selectedTicket.renterConfidence}%
                          </span>
                        </div>
                        {selectedTicket.bookingStart && selectedTicket.bookingEnd && (
                          <div className="flex justify-between text-[13px]">
                            <span style={{ color: '#737373' }}>Booking</span>
                            <span style={{ color: '#191919' }}>
                              {formatDate(selectedTicket.bookingStart)} — {formatDate(selectedTicket.bookingEnd)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[13px]" style={{ color: '#737373' }}>
                        No renter matched yet
                      </div>
                    )}
                  </section>

                  {/* Processing steps */}
                  <section>
                    <div className="text-[11px] uppercase tracking-wide mb-3" style={{ color: '#737373' }}>
                      Processing Steps
                    </div>
                    <div className="space-y-2">
                      {selectedTicket.processingSteps.map((step, index) => (
                        <div
                          key={step.name}
                          className="flex items-center gap-3 p-2 rounded"
                          style={{ backgroundColor: step.completed ? 'transparent' : step.timestamp ? '#eeeeec' : 'transparent' }}
                        >
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: step.completed ? '#16a34a' : step.timestamp ? '#2563eb' : '#e5e5e3',
                            }}
                          >
                            {step.completed && <Check size={12} strokeWidth={2} style={{ color: '#191919' }} />}
                          </div>
                          <div className="flex-1">
                            <div
                              className="text-[13px]"
                              style={{ color: step.timestamp ? '#191919' : '#737373' }}
                            >
                              {step.name}
                            </div>
                            {step.timestamp && (
                              <div className="text-[11px]" style={{ color: '#737373' }}>
                                {formatTime(step.timestamp)}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Exception reason */}
                  {selectedTicket.exceptionReason && (
                    <section>
                      <div
                        className="p-3 rounded flex items-start gap-2"
                        style={{ backgroundColor: 'rgba(248, 113, 113, 0.1)' }}
                      >
                        <AlertCircle size={16} strokeWidth={1.5} style={{ color: '#dc2626', marginTop: '1px', flexShrink: 0 }} />
                        <div>
                          <div className="text-[13px] font-medium" style={{ color: '#dc2626' }}>
                            {exceptionLabels[selectedTicket.exceptionReason]}
                          </div>
                          <div className="text-[13px] mt-1" style={{ color: '#737373' }}>
                            {selectedTicket.exceptionReason === 'unmatched_vehicle' && 'Vehicle not found in fleet database'}
                            {selectedTicket.exceptionReason === 'ambiguous_renter' && 'Multiple possible renters identified'}
                            {selectedTicket.exceptionReason === 'missing_data' && 'Required information missing from ticket'}
                            {selectedTicket.exceptionReason === 'deadline_risk' && 'Processing deadline approaching'}
                          </div>
                        </div>
                      </div>
                    </section>
                  )}
                </div>

                {/* Panel actions */}
                <div className="flex-shrink-0 p-4 border-t space-y-2" style={{ borderColor: '#e5e5e3' }}>
                  {selectedTicket.status === 'exception' ? (
                    <>
                      <button
                        onClick={() => resolveException(selectedTicket.id)}
                        className="w-full px-4 py-2 rounded text-[13px] font-medium transition-opacity duration-150 ease-out hover:opacity-80"
                        style={{ backgroundColor: '#2563eb', color: '#191919' }}
                      >
                        Resolve Exception
                      </button>
                      <button
                        onClick={() => reassignTicket(selectedTicket.id)}
                        className="w-full px-4 py-2 rounded text-[13px] transition-opacity duration-150 ease-out hover:opacity-80"
                        style={{ backgroundColor: '#eeeeec', color: '#191919' }}
                      >
                        Reassign Renter
                      </button>
                    </>
                  ) : selectedTicket.status !== 'dispatched' ? (
                    <>
                      <button
                        onClick={() => confirmAndDispatch(selectedTicket.id)}
                        className="w-full px-4 py-2 rounded text-[13px] font-medium transition-opacity duration-150 ease-out hover:opacity-80"
                        style={{ backgroundColor: '#16a34a', color: '#191919' }}
                      >
                        Confirm & Dispatch
                      </button>
                      <button
                        onClick={() => reassignTicket(selectedTicket.id)}
                        className="w-full px-4 py-2 rounded text-[13px] transition-opacity duration-150 ease-out hover:opacity-80"
                        style={{ backgroundColor: '#eeeeec', color: '#191919' }}
                      >
                        Reassign
                      </button>
                      <button
                        onClick={() => flagForReview(selectedTicket.id)}
                        className="w-full px-4 py-2 rounded text-[13px] transition-opacity duration-150 ease-out hover:opacity-80"
                        style={{ backgroundColor: 'transparent', color: '#d97706', border: '1px solid #d97706' }}
                      >
                        Flag for Review
                      </button>
                    </>
                  ) : null}
                  <button
                    onClick={() => dismissTicket(selectedTicket.id)}
                    className="w-full px-4 py-2 rounded text-[13px] transition-opacity duration-150 ease-out hover:opacity-80"
                    style={{ backgroundColor: 'transparent', color: '#737373', border: '1px solid #e5e5e3' }}
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
