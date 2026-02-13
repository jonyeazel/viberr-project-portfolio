'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, X, Check, AlertCircle, ChevronRight, Clock, User, Car, FileText } from 'lucide-react';
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
  ReferenceLine,
} from 'recharts';

// Types
type TicketStatus = 'ingested' | 'parsed' | 'matched' | 'dispatched' | 'exception';
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
  vehicleYear: number;
  fleetAssignment: string;
  renterName: string | null;
  renterEmail: string | null;
  renterConfidence: number | null;
  bookingId: string | null;
  bookingStart: Date | null;
  bookingEnd: Date | null;
  status: TicketStatus;
  deadline: Date;
  processingTimeMs: number;
  fineAmount: number;
  location: string;
  streetAddress: string;
  exceptionReason: ExceptionReason | null;
  processingSteps: ProcessingStep[];
}

// German cities with realistic street addresses
const germanCities = [
  'Berlin', 'Hamburg', 'Munchen', 'Koln', 'Frankfurt am Main', 'Stuttgart', 'Dusseldorf',
  'Leipzig', 'Dortmund', 'Essen', 'Bremen', 'Dresden', 'Hannover', 'Nurnberg',
  'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Munster',
];

const streetNames = [
  'Hauptstrasse', 'Bahnhofstrasse', 'Schillerstrasse', 'Goethestrasse', 'Mozartstrasse',
  'Friedrichstrasse', 'Berliner Strasse', 'Gartenstrasse', 'Parkstrasse', 'Ringstrasse',
  'Bismarckstrasse', 'Kaiserstrasse', 'Lindenstrasse', 'Rosenstrasse', 'Bergstrasse',
];

// German license plate prefixes by city
const platePrefixes: Record<string, string[]> = {
  'Berlin': ['B'],
  'Hamburg': ['HH'],
  'Munchen': ['M'],
  'Koln': ['K'],
  'Frankfurt am Main': ['F'],
  'Stuttgart': ['S'],
  'Dusseldorf': ['D'],
  'Leipzig': ['L'],
  'Dortmund': ['DO'],
  'Essen': ['E'],
  'Bremen': ['HB'],
  'Dresden': ['DD'],
  'Hannover': ['H'],
  'Nurnberg': ['N'],
  'Duisburg': ['DU'],
  'Bochum': ['BO'],
  'Wuppertal': ['W'],
  'Bielefeld': ['BI'],
  'Bonn': ['BN'],
  'Munster': ['MS'],
};

const firstNames = [
  'Anna', 'Thomas', 'Maria', 'Stefan', 'Julia', 'Michael', 'Laura', 'Andreas',
  'Sarah', 'Christian', 'Lisa', 'Markus', 'Nina', 'Daniel', 'Katharina', 'Florian',
  'Sophie', 'Tobias', 'Hannah', 'Sebastian', 'Lena', 'Philipp', 'Emma', 'Lukas',
  'Johanna', 'Felix', 'Clara', 'Maximilian', 'Marie', 'David', 'Charlotte', 'Jan',
  'Amelie', 'Tim', 'Lea', 'Jonas', 'Mia', 'Leon', 'Emily', 'Paul',
];

const lastNames = [
  'Mueller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker',
  'Schulz', 'Hoffmann', 'Schaefer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf',
  'Schroeder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krueger', 'Hofmann', 'Hartmann',
  'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier', 'Lehmann', 'Huber',
];

const vehicleMakes = ['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Opel', 'Ford', 'Skoda', 'Seat', 'Porsche'];
const vehicleModels: Record<string, string[]> = {
  'BMW': ['320i', '520d', 'X3 xDrive', 'X5 M50i', '118i', '330e', 'iX3'],
  'Mercedes-Benz': ['C 200', 'E 300', 'A 180', 'GLA 250', 'CLA 200', 'S 500', 'EQC'],
  'Audi': ['A3 Sportback', 'A4 Avant', 'A6 Limousine', 'Q3', 'Q5', 'e-tron', 'RS6'],
  'Volkswagen': ['Golf 8', 'Passat Variant', 'Tiguan', 'Polo', 'T-Roc', 'ID.4', 'Arteon'],
  'Opel': ['Astra', 'Corsa-e', 'Insignia', 'Mokka', 'Crossland', 'Grandland'],
  'Ford': ['Focus', 'Fiesta ST', 'Kuga', 'Puma', 'Mondeo', 'Mustang Mach-E'],
  'Skoda': ['Octavia RS', 'Fabia', 'Superb', 'Kodiaq', 'Kamiq', 'Enyaq'],
  'Seat': ['Leon', 'Ibiza', 'Ateca', 'Arona', 'Tarraco', 'Cupra Formentor'],
  'Porsche': ['Cayenne', 'Macan', 'Panamera', 'Taycan'],
};

const fleetAssignments = [
  'Corporate Fleet A', 'Corporate Fleet B', 'Corporate Fleet C',
  'Berlin Station', 'Hamburg Station', 'Munich Station', 'Frankfurt Station',
  'Long-Term Leasing', 'Premium Fleet', 'Executive Pool',
];

const violationLabels: Record<ViolationType, string> = {
  speeding: 'Speeding',
  parking: 'Parking',
  red_light: 'Red Light',
  toll_evasion: 'Toll Evasion',
};

const statusLabels: Record<TicketStatus, string> = {
  ingested: 'Ingested',
  parsed: 'Parsed',
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

const exceptionDescriptions: Record<ExceptionReason, string> = {
  unmatched_vehicle: 'License plate not found in fleet database. Manual verification required.',
  ambiguous_renter: 'Multiple overlapping bookings detected. Please select the correct renter.',
  missing_data: 'Ticket image OCR failed to extract required fields. Manual entry needed.',
  deadline_risk: 'Response deadline in less than 48 hours. Requires immediate attention.',
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

function generateEmail(firstName: string, lastName: string, random: () => number): string {
  const domains = ['gmail.com', 'web.de', 'gmx.de', 't-online.de', 'outlook.de'];
  const domain = domains[Math.floor(random() * domains.length)];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
}

const REFERENCE_DATE = new Date('2026-02-11T12:00:00Z');

function generateTickets(): Ticket[] {
  const random = seededRandom(2024);
  const tickets: Ticket[] = [];
  const now = REFERENCE_DATE;

  // Generate 80 tickets with realistic distribution
  // Target: ~75% dispatched (60), ~10% in intermediate states (8), ~5% exceptions (4), ~10% recently received (8)
  for (let i = 0; i < 80; i++) {
    const city = germanCities[Math.floor(random() * germanCities.length)];
    const street = streetNames[Math.floor(random() * streetNames.length)];
    const streetNumber = Math.floor(random() * 200) + 1;
    const streetAddress = `${street} ${streetNumber}`;
    
    const violationTypes: ViolationType[] = ['speeding', 'parking', 'red_light', 'toll_evasion'];
    // Weight speeding higher (more common)
    const violationWeights = [0.45, 0.30, 0.15, 0.10];
    const violationRoll = random();
    let cumulative = 0;
    let violationType: ViolationType = 'speeding';
    for (let j = 0; j < violationTypes.length; j++) {
      cumulative += violationWeights[j];
      if (violationRoll < cumulative) {
        violationType = violationTypes[j];
        break;
      }
    }
    
    const make = vehicleMakes[Math.floor(random() * vehicleMakes.length)];
    const model = vehicleModels[make][Math.floor(random() * vehicleModels[make].length)];
    const vehicleYear = 2019 + Math.floor(random() * 6); // 2019-2024
    
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

    // Status distribution: ~75% dispatched, ~10% intermediate (ingested/parsed/matched), ~5% exception, ~10% ingested (new)
    // This gives more tickets in the Incoming tab while still showing high automation rate
    const statusRandom = random();
    let status: TicketStatus;
    let exceptionReason: ExceptionReason | null = null;
    
    if (statusRandom < 0.75) {
      status = 'dispatched';
    } else if (statusRandom < 0.80) {
      status = 'exception';
      const exceptionTypes: ExceptionReason[] = ['unmatched_vehicle', 'ambiguous_renter', 'missing_data', 'deadline_risk'];
      exceptionReason = exceptionTypes[Math.floor(random() * exceptionTypes.length)];
    } else if (statusRandom < 0.85) {
      status = 'matched';
    } else if (statusRandom < 0.92) {
      status = 'parsed';
    } else {
      status = 'ingested';
    }

    // Renter info (for matched or dispatched tickets)
    let renterName: string | null = null;
    let renterEmail: string | null = null;
    let renterConfidence: number | null = null;
    let bookingId: string | null = null;
    let bookingStart: Date | null = null;
    let bookingEnd: Date | null = null;

    if (status === 'matched' || status === 'dispatched') {
      const firstName = firstNames[Math.floor(random() * firstNames.length)];
      const lastName = lastNames[Math.floor(random() * lastNames.length)];
      renterName = `${firstName} ${lastName}`;
      renterEmail = generateEmail(firstName, lastName, random);
      renterConfidence = 92 + Math.floor(random() * 8); // 92-99%
      bookingId = `BK-${Math.floor(100000 + random() * 900000)}`;
      
      // Booking overlaps with violation date
      const violationDate = new Date(dateReceived.getTime() - random() * 2 * 24 * 60 * 60 * 1000);
      bookingStart = new Date(violationDate.getTime() - random() * 3 * 24 * 60 * 60 * 1000);
      bookingEnd = new Date(violationDate.getTime() + random() * 5 * 24 * 60 * 60 * 1000);
    } else if (status === 'exception' && exceptionReason === 'ambiguous_renter') {
      const firstName = firstNames[Math.floor(random() * firstNames.length)];
      const lastName = lastNames[Math.floor(random() * lastNames.length)];
      renterName = `${firstName} ${lastName}`;
      renterEmail = generateEmail(firstName, lastName, random);
      renterConfidence = 45 + Math.floor(random() * 30); // 45-74% (ambiguous)
      bookingId = `BK-${Math.floor(100000 + random() * 900000)}`;
    }

    // Processing time (faster for automated, slower for exceptions)
    const processingTimes: Record<TicketStatus, [number, number]> = {
      ingested: [500, 1500],
      parsed: [1500, 3000],
      matched: [3000, 6000],
      dispatched: [4000, 8000],
      exception: [8000, 25000],
    };
    const [minTime, maxTime] = processingTimes[status];
    const processingTimeMs = Math.round(minTime + random() * (maxTime - minTime));

    // Processing steps with realistic timestamps
    const baseTime = dateReceived.getTime();
    const processingSteps: ProcessingStep[] = [
      {
        name: 'Ingested',
        timestamp: new Date(baseTime),
        completed: true,
      },
      {
        name: 'Parsed',
        timestamp: status !== 'ingested' ? new Date(baseTime + 800 + random() * 700) : null,
        completed: status !== 'ingested',
      },
      {
        name: 'Matched',
        timestamp: (status === 'matched' || status === 'dispatched') ? new Date(baseTime + 2000 + random() * 1500) : null,
        completed: status === 'matched' || status === 'dispatched',
      },
      {
        name: 'Dispatched',
        timestamp: status === 'dispatched' ? new Date(baseTime + 4000 + random() * 2000) : null,
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
      vehicleYear,
      fleetAssignment: fleetAssignments[Math.floor(random() * fleetAssignments.length)],
      renterName,
      renterEmail,
      renterConfidence,
      bookingId,
      bookingStart,
      bookingEnd,
      status,
      deadline,
      processingTimeMs,
      fineAmount,
      location: city,
      streetAddress,
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
    year: 'numeric',
  });
}

function formatDateTime(date: Date): string {
  return date.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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
  return `${(ms / 1000).toFixed(1)}s`;
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - REFERENCE_DATE.getTime()) / (24 * 60 * 60 * 1000));
}

export default function TrafficTicketsPage() {

  const initialTickets = useMemo(() => generateTickets(), []);
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('incoming');
  const [isMobile, setIsMobile] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);
  
  const handleSelectTicket = (ticketId: string) => {
    setSelectedTicketId(ticketId);
    if (isMobile) setShowDetail(true);
  };

  const handleBackToList = () => {
    setShowDetail(false);
  };

  // Calculate KPIs
  const kpis = useMemo(() => {
    const today = new Date(REFERENCE_DATE);
    today.setHours(0, 0, 0, 0);
    
    const todayTickets = tickets.filter(t => t.dateReceived >= today);
    const dispatchedTotal = tickets.filter(t => t.status === 'dispatched').length;
    const autoProcessedRate = tickets.length > 0 
      ? (dispatchedTotal / tickets.length) * 100 
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

  // Pipeline counts (4-phase: Ingested -> Parsed -> Matched -> Dispatched)
  const pipelineCounts = useMemo(() => {
    return {
      ingested: tickets.filter(t => t.status === 'ingested').length,
      parsed: tickets.filter(t => t.status === 'parsed').length,
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
    const now = REFERENCE_DATE;
    const dailyData: { name: string; count: number; date: Date }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);
      
      const dayTickets = tickets.filter(t => 
        t.dateReceived >= dateStart && t.dateReceived <= dateEnd
      );
      
      dailyData.push({
        name: date.toLocaleDateString('de-DE', { weekday: 'short' }),
        count: dayTickets.length,
        date,
      });
    }

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
      // High auto-processing rate (90-98% range)
      // Use deterministic fallback based on day index to avoid hydration errors
      const rate = dayTickets.length > 0 
        ? (dispatched.length / dayTickets.length) * 100 
        : 90 + (i % 8);
      
      rateData.push({
        name: date.toLocaleDateString('de-DE', { weekday: 'short' }),
        rate: Math.round(rate),
      });
    }

    return { violationData, volumeData: dailyData, rateData };
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
          i === 3 ? { ...step, timestamp: now, completed: true } : step
        ),
      };
    }));
  };

  const reassignTicket = (ticketId: string) => {
    const random = seededRandom(Date.now());
    const firstName = firstNames[Math.floor(random() * firstNames.length)];
    const lastName = lastNames[Math.floor(random() * lastNames.length)];
    const email = generateEmail(firstName, lastName, random);
    const confidence = 95 + Math.floor(random() * 5);
    const booking = `BK-${Math.floor(100000 + random() * 900000)}`;
    
    setTickets(prev => prev.map(ticket => {
      if (ticket.id !== ticketId) return ticket;
      return {
        ...ticket,
        renterName: `${firstName} ${lastName}`,
        renterEmail: email,
        renterConfidence: confidence,
        bookingId: booking,
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
      const now = new Date();
      return {
        ...ticket,
        status: 'matched' as TicketStatus,
        exceptionReason: null,
        renterConfidence: ticket.renterConfidence ? Math.min(99, ticket.renterConfidence + 30) : 95,
        processingSteps: ticket.processingSteps.map((step, i) => 
          i === 2 && !step.completed ? { ...step, timestamp: now, completed: true } : step
        ),
      };
    }));
  };

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: 'incoming', label: 'Incoming', count: tickets.filter(t => t.status !== 'dispatched' && t.status !== 'exception').length },
    { id: 'exceptions', label: 'Exceptions', count: pipelineCounts.exception },
    { id: 'completed', label: 'Completed', count: pipelineCounts.dispatched },
    { id: 'analytics', label: 'Analytics' },
  ];

  const CHART_COLORS = ['var(--primary)', 'var(--success)', 'var(--warning)', 'var(--destructive)'];

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={(e) => { try { if (window.self !== window.top) { e.preventDefault(); window.parent.postMessage('close-preview', '*'); } } catch { e.preventDefault(); } }}
            className="flex items-center gap-2 text-[13px] transition-opacity duration-150 ease-out hover:opacity-70"
            style={{ color: 'var(--muted)' }}
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Back
          </Link>
          <div className="w-px h-4" style={{ backgroundColor: 'var(--border)' }} />
          <span className="text-[15px] font-medium" style={{ color: 'var(--foreground)' }}>
            Traffic Ticket Processing
          </span>
        </div>
      </header>

      {/* KPI Bar */}
      <div className="flex-shrink-0 border-b" style={{ borderColor: 'var(--border)', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}>
        <div className="flex px-6" style={{ minWidth: 'min-content' }}>
          {[
            { label: 'Tickets Today', value: kpis.ticketsToday, color: 'var(--foreground)' },
            { label: 'Auto-Processed', value: `${kpis.autoProcessedRate.toFixed(0)}%`, color: kpis.autoProcessedRate >= 90 ? 'var(--success)' : 'var(--warning)' },
            { label: 'Avg Processing', value: formatProcessingTime(kpis.avgProcessingTime), color: 'var(--foreground)' },
            { label: 'Pending Review', value: kpis.pendingReview, color: kpis.pendingReview > 0 ? 'var(--warning)' : 'var(--foreground)' },
            { label: 'Deadline Alerts', value: kpis.deadlineAlerts, color: kpis.deadlineAlerts > 0 ? 'var(--destructive)' : 'var(--foreground)' },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              className="flex-shrink-0"
              style={{
                padding: '20px 24px 20px 0',
                paddingLeft: i > 0 ? 24 : 0,
                scrollSnapAlign: 'start',
                borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
              }}
            >
              <div className="text-[24px] font-medium tabular-nums" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-[11px] uppercase tracking-wider mt-1.5 whitespace-nowrap" style={{ color: 'var(--muted)', letterSpacing: '0.05em' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline Visualization */}
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: 'var(--border)', overflowX: 'auto', scrollbarWidth: 'none' }}>
        <div className="flex items-center" style={{ minWidth: 'max-content' }}>
          {(['ingested', 'parsed', 'matched', 'dispatched'] as const).map((status, index) => (
            <div key={status} className="flex items-center" style={{ whiteSpace: 'nowrap' }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium"
                  style={{
                    backgroundColor: status === 'dispatched' ? 'var(--success)' : 'var(--surface-2)',
                    color: status === 'dispatched' ? '#fff' : 'var(--foreground)',
                  }}
                >
                  {pipelineCounts[status]}
                </div>
                <span className="text-[13px]" style={{ color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                  {statusLabels[status]}
                </span>
              </div>
              {index < 3 && (
                <ChevronRight size={16} strokeWidth={1.5} className="mx-4" style={{ color: 'var(--muted)' }} />
              )}
            </div>
          ))}
          {pipelineCounts.exception > 0 && (
            <>
              <div className="mx-4 w-px h-6" style={{ backgroundColor: 'var(--border)' }} />
              <div className="flex items-center gap-3" style={{ whiteSpace: 'nowrap' }}>
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium"
                  style={{ backgroundColor: 'var(--destructive)', color: '#fff' }}
                >
                  {pipelineCounts.exception}
                </div>
                <span className="text-[13px]" style={{ color: 'var(--destructive)', whiteSpace: 'nowrap' }}>
                  Exceptions
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 px-6 border-b flex overflow-x-auto" style={{ borderColor: 'var(--border)', scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3 py-3 text-[13px] transition-colors duration-150 ease-out relative whitespace-nowrap shrink-0"
            style={{
              color: activeTab === tab.id ? 'var(--foreground)' : 'var(--muted)',
            }}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className="ml-2 px-1.5 py-0.5 rounded text-[11px] tabular-nums"
                style={{ backgroundColor: 'var(--surface-2)', color: 'var(--muted)' }}
              >
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: 'var(--foreground)' }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {activeTab === 'analytics' ? (
          <div className="flex-1 p-6 overflow-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1200px]">
              {/* Violation Types Pie Chart */}
              <div className="p-5" style={{ backgroundColor: 'var(--secondary)', borderRadius: '4px' }}>
                <div className="text-[11px] uppercase tracking-wider mb-4" style={{ color: 'var(--muted)', letterSpacing: '0.05em' }}>
                  Violation Types
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analyticsData.violationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {analyticsData.violationData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--foreground)',
                          fontSize: '13px',
                          boxShadow: 'none',
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
                        <span style={{ color: 'var(--muted)' }}>{item.name}</span>
                      </div>
                      <span className="tabular-nums" style={{ color: 'var(--foreground)' }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Volume Bar Chart */}
              <div className="p-5" style={{ backgroundColor: 'var(--secondary)', borderRadius: '4px' }}>
                <div className="text-[11px] uppercase tracking-wider mb-4" style={{ color: 'var(--muted)', letterSpacing: '0.05em' }}>
                  Daily Volume
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData.volumeData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted)', fontSize: 11 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted)', fontSize: 11 }}
                        width={24}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--foreground)',
                          fontSize: '13px',
                          boxShadow: 'none',
                        }}
                        formatter={(value: number) => [value, 'Tickets']}
                      />
                      <Bar dataKey="count" fill="var(--primary)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Auto-Processing Rate Line Chart */}
              <div className="p-5" style={{ backgroundColor: 'var(--secondary)', borderRadius: '4px' }}>
                <div className="text-[11px] uppercase tracking-wider mb-4" style={{ color: 'var(--muted)', letterSpacing: '0.05em' }}>
                  Auto-Processing Rate
                </div>
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData.rateData} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted)', fontSize: 11 }}
                      />
                      <YAxis
                        domain={[80, 100]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: 'var(--muted)', fontSize: 11 }}
                        width={28}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <ReferenceLine y={95} stroke="var(--success)" strokeDasharray="4 4" strokeOpacity={0.5} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'var(--background)',
                          border: '1px solid var(--border)',
                          borderRadius: '4px',
                          color: 'var(--foreground)',
                          fontSize: '13px',
                          boxShadow: 'none',
                        }}
                        formatter={(value: number) => [`${value}%`, 'Rate']}
                      />
                      <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="var(--success)"
                        strokeWidth={2}
                        dot={{ fill: 'var(--success)', r: 3, strokeWidth: 0 }}
                        activeDot={{ fill: 'var(--success)', r: 5, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: 'var(--muted)' }}>
                  <div className="w-4 border-t border-dashed" style={{ borderColor: 'var(--success)' }} />
                  <span>95% Target</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 flex flex-col min-w-0" style={{ display: isMobile && showDetail ? 'none' : 'flex' }}>
              {/* Table */}
              <div className="flex-1" style={{ overflow: 'auto' }}>
                <table className="w-full" style={{ minWidth: 900 }}>
                  <thead className="sticky top-0" style={{ backgroundColor: 'var(--background)' }}>
                    <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-normal" style={{ color: 'var(--muted)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>ID</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-normal" style={{ color: 'var(--muted)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Received</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-normal" style={{ color: 'var(--muted)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Violation</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-normal" style={{ color: 'var(--muted)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Vehicle</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-normal" style={{ color: 'var(--muted)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Renter</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-normal" style={{ color: 'var(--muted)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Status</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-normal" style={{ color: 'var(--muted)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Deadline</th>
                      <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-normal" style={{ color: 'var(--muted)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Time</th>
                      {activeTab === 'exceptions' && (
                        <th className="text-left px-6 py-3 text-[11px] uppercase tracking-wider font-normal" style={{ color: 'var(--muted)', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Reason</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map(ticket => {
                      const deadlineDays = daysUntil(ticket.deadline);
                      const isUrgent = deadlineDays <= 3 && ticket.status !== 'dispatched';
                      const isSelected = selectedTicketId === ticket.id;
                      
                      return (
                        <tr
                          key={ticket.id}
                          onClick={() => handleSelectTicket(ticket.id)}
                          className="border-b cursor-pointer transition-colors duration-150 ease-out"
                          style={{
                            borderColor: 'var(--border)',
                            backgroundColor: isSelected ? 'var(--surface-2)' : 'transparent',
                          }}
                          onMouseEnter={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--secondary)';
                          }}
                          onMouseLeave={(e) => {
                            if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          <td className="px-6 py-3 text-[13px] font-medium tabular-nums" style={{ color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                            {ticket.id}
                          </td>
                          <td className="px-6 py-3 text-[13px] tabular-nums" style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                            {formatDate(ticket.dateReceived)}
                          </td>
                          <td className="px-6 py-3 text-[13px]" style={{ color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                            {violationLabels[ticket.violationType]}
                          </td>
                          <td className="px-6 py-3 text-[13px] font-medium" style={{ color: 'var(--foreground)', whiteSpace: 'nowrap' }}>
                            {ticket.licensePlate}
                          </td>
                          <td className="px-6 py-3 text-[13px]" style={{ color: ticket.renterName ? 'var(--foreground)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
                            {ticket.renterName || '—'}
                          </td>
                          <td className="px-6 py-3" style={{ whiteSpace: 'nowrap' }}>
                            <span
                              className="inline-block px-2 py-0.5 rounded text-[11px] font-medium"
                              style={{
                                backgroundColor: ticket.status === 'dispatched' ? 'rgba(22, 163, 74, 0.1)' :
                                  ticket.status === 'exception' ? 'rgba(220, 38, 38, 0.1)' : 'var(--surface-2)',
                                color: ticket.status === 'dispatched' ? 'var(--success)' :
                                  ticket.status === 'exception' ? 'var(--destructive)' : 'var(--muted)',
                              }}
                            >
                              {statusLabels[ticket.status]}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-[13px] tabular-nums" style={{ color: isUrgent ? 'var(--destructive)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
                            {formatDate(ticket.deadline)}
                            {isUrgent && (
                              <span className="ml-1 font-medium">({deadlineDays}d)</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-[13px] tabular-nums" style={{ color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                            {formatProcessingTime(ticket.processingTimeMs)}
                          </td>
                          {activeTab === 'exceptions' && (
                            <td className="px-6 py-3 text-[13px]" style={{ color: 'var(--warning)', whiteSpace: 'nowrap' }}>
                              {ticket.exceptionReason ? exceptionLabels[ticket.exceptionReason] : '—'}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredTickets.length === 0 && (
                  <div className="flex-1 flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="text-[15px]" style={{ color: 'var(--muted)' }}>
                        {activeTab === 'incoming' && 'All tickets have been processed'}
                        {activeTab === 'exceptions' && 'No exceptions to review'}
                        {activeTab === 'completed' && 'No completed tickets'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Detail panel */}
            {selectedTicket && (!isMobile || showDetail) && (
              <div
                className="w-full md:w-[420px] flex-shrink-0 border-l flex flex-col"
                style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', minWidth: isMobile ? '100%' : 'auto' }}
              >
                {/* Panel header */}
                <div className="flex-shrink-0 px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--secondary)' }}>
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <button
                        onClick={handleBackToList}
                        className="p-1.5 rounded transition-opacity duration-150 ease-out hover:opacity-70"
                        style={{ color: 'var(--muted)' }}
                      >
                        <ArrowLeft size={18} strokeWidth={1.5} />
                      </button>
                    )}
                    <div>
                      <div className="text-[15px] font-medium" style={{ color: 'var(--foreground)' }}>
                        {selectedTicket.id}
                      </div>
                      <div className="text-[13px] mt-0.5" style={{ color: 'var(--muted)' }}>
                        {violationLabels[selectedTicket.violationType]} in {selectedTicket.location}
                      </div>
                    </div>
                  </div>
                  {!isMobile && (
                    <button
                      onClick={() => setSelectedTicketId(null)}
                      className="p-1.5 rounded transition-opacity duration-150 ease-out hover:opacity-70"
                      style={{ color: 'var(--muted)' }}
                    >
                      <X size={18} strokeWidth={1.5} />
                    </button>
                  )}
                </div>

                {/* Panel content */}
                <div className="flex-1 overflow-y-auto">
                  {/* Exception alert */}
                  {selectedTicket.exceptionReason && (
                    <div
                      className="mx-5 mt-5 p-4 rounded flex items-start gap-3"
                      style={{ backgroundColor: 'rgba(220, 38, 38, 0.05)', border: '1px solid rgba(220, 38, 38, 0.2)' }}
                    >
                      <AlertCircle size={18} strokeWidth={1.5} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--destructive)' }} />
                      <div>
                        <div className="text-[13px] font-medium" style={{ color: 'var(--destructive)' }}>
                          {exceptionLabels[selectedTicket.exceptionReason]}
                        </div>
                        <div className="text-[13px] mt-1" style={{ color: 'var(--muted)' }}>
                          {exceptionDescriptions[selectedTicket.exceptionReason]}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Ticket info */}
                  <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <FileText size={16} strokeWidth={1.5} style={{ color: 'var(--muted)' }} />
                      <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)', letterSpacing: '0.05em' }}>
                        Ticket Details
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: 'var(--muted)' }}>Date</span>
                        <span className="tabular-nums" style={{ color: 'var(--foreground)' }}>{formatDateTime(selectedTicket.dateReceived)}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: 'var(--muted)' }}>Location</span>
                        <span className="text-right" style={{ color: 'var(--foreground)' }}>{selectedTicket.streetAddress}, {selectedTicket.location}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: 'var(--muted)' }}>Fine</span>
                        <span className="font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>{formatCurrency(selectedTicket.fineAmount)}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: 'var(--muted)' }}>Deadline</span>
                        <span
                          className="tabular-nums"
                          style={{ color: daysUntil(selectedTicket.deadline) <= 3 && selectedTicket.status !== 'dispatched' ? 'var(--destructive)' : 'var(--foreground)' }}
                        >
                          {formatDate(selectedTicket.deadline)}
                          {daysUntil(selectedTicket.deadline) <= 7 && selectedTicket.status !== 'dispatched' && (
                            <span className="ml-1">({daysUntil(selectedTicket.deadline)}d)</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle info */}
                  <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <Car size={16} strokeWidth={1.5} style={{ color: 'var(--muted)' }} />
                      <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)', letterSpacing: '0.05em' }}>
                        Vehicle
                      </span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: 'var(--muted)' }}>Plate</span>
                        <span className="font-medium" style={{ color: 'var(--foreground)' }}>{selectedTicket.licensePlate}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: 'var(--muted)' }}>Vehicle</span>
                        <span style={{ color: 'var(--foreground)' }}>{selectedTicket.vehicleYear} {selectedTicket.vehicleMake} {selectedTicket.vehicleModel}</span>
                      </div>
                      <div className="flex justify-between text-[13px]">
                        <span style={{ color: 'var(--muted)' }}>Fleet</span>
                        <span style={{ color: 'var(--foreground)' }}>{selectedTicket.fleetAssignment}</span>
                      </div>
                    </div>
                  </div>

                  {/* Renter match */}
                  <div className="px-5 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2 mb-4">
                      <User size={16} strokeWidth={1.5} style={{ color: 'var(--muted)' }} />
                      <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)', letterSpacing: '0.05em' }}>
                        Renter Match
                      </span>
                    </div>
                    {selectedTicket.renterName ? (
                      <div className="space-y-3">
                        <div className="flex justify-between text-[13px]">
                          <span style={{ color: 'var(--muted)' }}>Name</span>
                          <span className="font-medium" style={{ color: 'var(--foreground)' }}>{selectedTicket.renterName}</span>
                        </div>
                        {selectedTicket.renterEmail && (
                          <div className="flex justify-between text-[13px]">
                            <span style={{ color: 'var(--muted)' }}>Email</span>
                            <span style={{ color: 'var(--foreground)' }}>{selectedTicket.renterEmail}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[13px] items-center">
                          <span style={{ color: 'var(--muted)' }}>Confidence</span>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--surface-2)' }}>
                              <div
                                className="h-full rounded-full transition-all duration-150"
                                style={{
                                  width: `${selectedTicket.renterConfidence}%`,
                                  backgroundColor: selectedTicket.renterConfidence && selectedTicket.renterConfidence >= 85 ? 'var(--success)' :
                                    selectedTicket.renterConfidence && selectedTicket.renterConfidence >= 60 ? 'var(--warning)' : 'var(--destructive)',
                                }}
                              />
                            </div>
                            <span
                              className="tabular-nums font-medium"
                              style={{
                                color: selectedTicket.renterConfidence && selectedTicket.renterConfidence >= 85 ? 'var(--success)' :
                                  selectedTicket.renterConfidence && selectedTicket.renterConfidence >= 60 ? 'var(--warning)' : 'var(--destructive)',
                              }}
                            >
                              {selectedTicket.renterConfidence}%
                            </span>
                          </div>
                        </div>
                        {selectedTicket.bookingId && (
                          <div className="flex justify-between text-[13px]">
                            <span style={{ color: 'var(--muted)' }}>Booking</span>
                            <span className="tabular-nums" style={{ color: 'var(--foreground)' }}>{selectedTicket.bookingId}</span>
                          </div>
                        )}
                        {selectedTicket.bookingStart && selectedTicket.bookingEnd && (
                          <div className="flex justify-between text-[13px]">
                            <span style={{ color: 'var(--muted)' }}>Period</span>
                            <span className="tabular-nums" style={{ color: 'var(--foreground)' }}>
                              {formatDate(selectedTicket.bookingStart)} - {formatDate(selectedTicket.bookingEnd)}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-[13px]" style={{ color: 'var(--muted)' }}>
                        No renter matched yet
                      </div>
                    )}
                  </div>

                  {/* Processing timeline */}
                  <div className="px-5 py-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock size={16} strokeWidth={1.5} style={{ color: 'var(--muted)' }} />
                      <span className="text-[11px] uppercase tracking-wider" style={{ color: 'var(--muted)', letterSpacing: '0.05em' }}>
                        Processing Timeline
                      </span>
                    </div>
                    <div className="space-y-0">
                      {selectedTicket.processingSteps.map((step, index) => {
                        const isLast = index === selectedTicket.processingSteps.length - 1;
                        return (
                          <div key={step.name} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: step.completed ? 'var(--success)' : step.timestamp ? 'var(--primary)' : 'var(--surface-2)',
                                }}
                              >
                                {step.completed && <Check size={12} strokeWidth={2.5} style={{ color: '#fff' }} />}
                              </div>
                              {!isLast && (
                                <div
                                  className="w-px flex-1 my-1"
                                  style={{ backgroundColor: step.completed ? 'var(--success)' : 'var(--surface-2)', minHeight: '24px' }}
                                />
                              )}
                            </div>
                            <div className="pb-4">
                              <div
                                className="text-[13px]"
                                style={{ color: step.timestamp ? 'var(--foreground)' : 'var(--muted)' }}
                              >
                                {step.name}
                              </div>
                              {step.timestamp && (
                                <div className="text-[11px] mt-0.5 tabular-nums" style={{ color: 'var(--muted)' }}>
                                  {formatTime(step.timestamp)}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Panel actions */}
                <div className="flex-shrink-0 p-5 border-t space-y-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--secondary)' }}>
                  {selectedTicket.status === 'exception' ? (
                    <>
                      <button
                        onClick={() => resolveException(selectedTicket.id)}
                        className="w-full px-4 py-2.5 rounded text-[13px] font-medium transition-opacity duration-150 ease-out hover:opacity-90"
                        style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
                      >
                        Resolve Exception
                      </button>
                      <button
                        onClick={() => reassignTicket(selectedTicket.id)}
                        className="w-full px-4 py-2.5 rounded text-[13px] font-medium transition-opacity duration-150 ease-out hover:opacity-90"
                        style={{ backgroundColor: 'var(--surface-2)', color: 'var(--foreground)' }}
                      >
                        Reassign Renter
                      </button>
                      <button
                        onClick={() => dismissTicket(selectedTicket.id)}
                        className="w-full px-4 py-2.5 rounded text-[13px] transition-opacity duration-150 ease-out hover:opacity-90"
                        style={{ backgroundColor: 'transparent', color: 'var(--muted)' }}
                      >
                        Dismiss
                      </button>
                    </>
                  ) : selectedTicket.status !== 'dispatched' ? (
                    <>
                      <button
                        onClick={() => confirmAndDispatch(selectedTicket.id)}
                        className="w-full px-4 py-2.5 rounded text-[13px] font-medium transition-opacity duration-150 ease-out hover:opacity-90"
                        style={{ backgroundColor: 'var(--success)', color: '#fff' }}
                      >
                        Confirm & Dispatch
                      </button>
                      <button
                        onClick={() => reassignTicket(selectedTicket.id)}
                        className="w-full px-4 py-2.5 rounded text-[13px] font-medium transition-opacity duration-150 ease-out hover:opacity-90"
                        style={{ backgroundColor: 'var(--surface-2)', color: 'var(--foreground)' }}
                      >
                        Reassign Renter
                      </button>
                      <div className="flex gap-2">
                        <button
                          onClick={() => flagForReview(selectedTicket.id)}
                          className="flex-1 px-4 py-2.5 rounded text-[13px] transition-opacity duration-150 ease-out hover:opacity-90"
                          style={{ backgroundColor: 'transparent', color: 'var(--warning)', border: '1px solid var(--warning)' }}
                        >
                          Flag for Review
                        </button>
                        <button
                          onClick={() => dismissTicket(selectedTicket.id)}
                          className="flex-1 px-4 py-2.5 rounded text-[13px] transition-opacity duration-150 ease-out hover:opacity-90"
                          style={{ backgroundColor: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}
                        >
                          Dismiss
                        </button>
                      </div>
                    </>
                  ) : (
                    <button
                      onClick={() => dismissTicket(selectedTicket.id)}
                      className="w-full px-4 py-2.5 rounded text-[13px] transition-opacity duration-150 ease-out hover:opacity-90"
                      style={{ backgroundColor: 'transparent', color: 'var(--muted)', border: '1px solid var(--border)' }}
                    >
                      Remove from List
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
