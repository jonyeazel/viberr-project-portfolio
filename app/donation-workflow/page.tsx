'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Clock,
  AlertCircle,
  ChevronDown,
  X,
  RefreshCw,
  FileText,
  Flag,
} from 'lucide-react';

// Fixed reference date to prevent SSR hydration mismatches
const REFERENCE_DATE = new Date('2026-02-11T12:00:00Z');

// Types
type ReceiptStatus = 'sent' | 'pending' | 'failed';
type AccountingStatus = 'logged' | 'pending';
type WorkflowStepStatus = 'completed' | 'pending' | 'failed';

interface WorkflowStep {
  name: string;
  status: WorkflowStepStatus;
  timestamp: Date | null;
}

interface Donation {
  id: string;
  date: Date;
  donorName: string;
  email: string;
  address: string;
  amount: number;
  paymentMethod: 'PayPal' | 'Stripe';
  transactionId: string;
  receiptStatus: ReceiptStatus;
  accountingStatus: AccountingStatus;
  workflow: WorkflowStep[];
}

interface ActivityEvent {
  id: string;
  timestamp: Date;
  donorName: string;
  action: string;
  type: 'receipt' | 'payment' | 'accounting' | 'error';
}

// Seeded random for consistent data
function seededRandom(seed: number) {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

// Data generation
const firstNames = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker',
  'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
];

const streets = [
  'Oak St', 'Maple Ave', 'Cedar Ln', 'Pine Dr', 'Elm Way', 'Birch Rd', 'Walnut Ct',
  'Cherry Blvd', 'Spruce Pl', 'Willow Ter', 'Ash Ln', 'Poplar St', 'Hickory Ave',
];

const cities = [
  'San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX',
  'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX',
  'Austin, TX', 'Seattle, WA', 'Denver, CO', 'Boston, MA', 'Portland, OR',
];

const emailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com', 'proton.me'];

function generateTransactionId(random: () => number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 17; i++) {
    result += chars.charAt(Math.floor(random() * chars.length));
  }
  return result;
}

function generateDonations(count: number): Donation[] {
  const random = seededRandom(42);
  const donations: Donation[] = [];
  const now = REFERENCE_DATE;

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(random() * firstNames.length)];
    const lastName = lastNames[Math.floor(random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const domain = emailDomains[Math.floor(random() * emailDomains.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    const streetNum = Math.floor(random() * 9999) + 1;
    const street = streets[Math.floor(random() * streets.length)];
    const city = cities[Math.floor(random() * cities.length)];
    const zip = String(Math.floor(random() * 90000) + 10000);

    const daysAgo = Math.floor(random() * 30);
    const hoursAgo = Math.floor(random() * 24);
    const minutesAgo = Math.floor(random() * 60);
    const date = new Date(
      now.getTime() -
        daysAgo * 24 * 60 * 60 * 1000 -
        hoursAgo * 60 * 60 * 1000 -
        minutesAgo * 60 * 1000
    );

    // Realistic donation amounts with weighted distribution
    const amountRoll = random();
    let amount: number;
    if (amountRoll < 0.4) {
      // 40% small donations $10-$50
      amount = [10, 15, 20, 25, 30, 35, 40, 50][Math.floor(random() * 8)];
    } else if (amountRoll < 0.7) {
      // 30% medium donations $75-$250
      amount = [75, 100, 125, 150, 175, 200, 250][Math.floor(random() * 7)];
    } else if (amountRoll < 0.9) {
      // 20% larger donations $500-$1000
      amount = [500, 750, 1000][Math.floor(random() * 3)];
    } else {
      // 10% major donations $2500-$5000
      amount = [2500, 3000, 5000][Math.floor(random() * 3)];
    }

    const receiptRoll = random();
    const receiptStatus: ReceiptStatus =
      receiptRoll < 0.72 ? 'sent' : receiptRoll < 0.88 ? 'pending' : 'failed';
    const accountingStatus: AccountingStatus =
      receiptStatus === 'sent' && random() < 0.82 ? 'logged' : 'pending';

    const paymentMethod: 'PayPal' | 'Stripe' = random() < 0.65 ? 'PayPal' : 'Stripe';

    const workflowSteps: WorkflowStep[] = [
      {
        name: 'Payment Captured',
        status: 'completed',
        timestamp: date,
      },
      {
        name: 'Data Logged',
        status: 'completed',
        timestamp: new Date(date.getTime() + 1500 + random() * 1000),
      },
      {
        name: 'Receipt Generated',
        status: receiptStatus === 'failed' ? 'failed' : 'completed',
        timestamp:
          receiptStatus === 'failed' ? null : new Date(date.getTime() + 4000 + random() * 2000),
      },
      {
        name: 'Receipt Sent',
        status:
          receiptStatus === 'sent'
            ? 'completed'
            : receiptStatus === 'pending'
              ? 'pending'
              : 'failed',
        timestamp:
          receiptStatus === 'sent' ? new Date(date.getTime() + 7000 + random() * 3000) : null,
      },
      {
        name: 'Accounting Entry',
        status: accountingStatus === 'logged' ? 'completed' : 'pending',
        timestamp:
          accountingStatus === 'logged'
            ? new Date(date.getTime() + 12000 + random() * 5000)
            : null,
      },
    ];

    donations.push({
      id: `DON-${String(i + 1).padStart(5, '0')}`,
      date,
      donorName: name,
      email,
      address: `${streetNum} ${street}, ${city} ${zip}`,
      amount,
      paymentMethod,
      transactionId: generateTransactionId(random),
      receiptStatus,
      accountingStatus,
      workflow: workflowSteps,
    });
  }

  return donations.sort((a, b) => b.date.getTime() - a.date.getTime());
}

function generateActivityEvents(donations: Donation[]): ActivityEvent[] {
  const events: ActivityEvent[] = [];
  let eventId = 0;

  donations.slice(0, 25).forEach((donation) => {
    events.push({
      id: String(eventId++),
      timestamp: donation.date,
      donorName: donation.donorName,
      action: `$${donation.amount.toLocaleString()} via ${donation.paymentMethod}`,
      type: 'payment',
    });

    if (donation.receiptStatus === 'sent') {
      events.push({
        id: String(eventId++),
        timestamp: donation.workflow[3].timestamp!,
        donorName: donation.donorName,
        action: 'Receipt delivered',
        type: 'receipt',
      });
    }

    if (donation.accountingStatus === 'logged') {
      events.push({
        id: String(eventId++),
        timestamp: donation.workflow[4].timestamp!,
        donorName: donation.donorName,
        action: 'Logged to accounting',
        type: 'accounting',
      });
    }

    if (donation.receiptStatus === 'failed') {
      events.push({
        id: String(eventId++),
        timestamp: new Date(donation.date.getTime() + 5000),
        donorName: donation.donorName,
        action: 'Receipt failed',
        type: 'error',
      });
    }
  });

  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 40);
}

const donations = generateDonations(45);
const activityEvents = generateActivityEvents(donations);

// Formatters
function formatDate(date: Date): string {
  const now = REFERENCE_DATE;
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));

  if (days === 0) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours === 0) {
      const mins = Math.floor(diff / (60 * 1000));
      return mins <= 1 ? 'Just now' : `${mins}m ago`;
    }
    return `${hours}h ago`;
  }
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString()}`;
}

// Components
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string }> = {
    sent: { color: 'var(--success)', bg: 'color-mix(in srgb, var(--success) 8%, transparent)' },
    logged: { color: 'var(--success)', bg: 'color-mix(in srgb, var(--success) 8%, transparent)' },
    pending: { color: 'var(--warning)', bg: 'color-mix(in srgb, var(--warning) 8%, transparent)' },
    failed: { color: 'var(--destructive)', bg: 'color-mix(in srgb, var(--destructive) 8%, transparent)' },
  };

  const { color, bg } = config[status] || { color: 'var(--muted)', bg: 'transparent' };

  return (
    <span
      className="inline-flex px-2 py-0.5 text-[12px] rounded"
      style={{ color, backgroundColor: bg }}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function WorkflowVisualization({ steps }: { steps: WorkflowStep[] }) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        const statusColors = {
          completed: 'var(--success)',
          pending: 'var(--warning)',
          failed: 'var(--destructive)',
        };
        const color = statusColors[step.status];

        return (
          <div key={i} className="flex">
            {/* Timeline */}
            <div className="flex flex-col items-center mr-3">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              {!isLast && (
                <div
                  className="w-px flex-1 min-h-[32px]"
                  style={{
                    backgroundColor: steps[i + 1].status === 'completed' ? 'var(--success)' : 'var(--border)',
                  }}
                />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-3'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-foreground">{step.name}</span>
                {step.status === 'completed' && (
                  <Check size={14} strokeWidth={2} style={{ color }} />
                )}
                {step.status === 'pending' && (
                  <Clock size={14} strokeWidth={1.5} style={{ color }} />
                )}
                {step.status === 'failed' && (
                  <AlertCircle size={14} strokeWidth={1.5} style={{ color }} />
                )}
              </div>
              <span className="text-[11px] text-muted">
                {step.timestamp
                  ? formatTimestamp(step.timestamp)
                  : step.status === 'pending'
                    ? 'Waiting'
                    : 'Failed'}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivityItem({ event }: { event: ActivityEvent }) {
  const typeColors: Record<string, string> = {
    payment: 'var(--primary)',
    receipt: 'var(--success)',
    accounting: 'var(--muted)',
    error: 'var(--destructive)',
  };

  return (
    <div className="px-4 py-3 border-b border-border last:border-b-0">
      <div className="flex items-start gap-3">
        <div
          className="w-1.5 h-1.5 rounded-full mt-[7px] flex-shrink-0"
          style={{ backgroundColor: typeColors[event.type] }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] text-foreground truncate">{event.donorName}</p>
          <p className="text-[12px] text-muted">{event.action}</p>
          <p className="text-[11px] text-muted mt-0.5">{formatDate(event.timestamp)}</p>
        </div>
      </div>
    </div>
  );
}

export default function DonationWorkflowPage() {

  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [receiptFilter, setReceiptFilter] = useState<'all' | ReceiptStatus>('all');
  const [accountingFilter, setAccountingFilter] = useState<'all' | AccountingStatus>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [receiptDropdownOpen, setReceiptDropdownOpen] = useState(false);
  const [accountingDropdownOpen, setAccountingDropdownOpen] = useState(false);

  const filteredDonations = useMemo(() => {
    let result = [...donations];

    if (receiptFilter !== 'all') {
      result = result.filter((d) => d.receiptStatus === receiptFilter);
    }

    if (accountingFilter !== 'all') {
      result = result.filter((d) => d.accountingStatus === accountingFilter);
    }

    result.sort((a, b) => {
      const multiplier = sortDir === 'desc' ? -1 : 1;
      if (sortField === 'date') {
        return (a.date.getTime() - b.date.getTime()) * multiplier;
      }
      return (a.amount - b.amount) * multiplier;
    });

    return result;
  }, [receiptFilter, accountingFilter, sortField, sortDir]);

  const stats = useMemo(() => {
    const total = donations.length;
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const receiptsSent = donations.filter((d) => d.receiptStatus === 'sent').length;
    const pending = donations.filter(
      (d) => d.receiptStatus === 'pending' || d.accountingStatus === 'pending'
    ).length;
    return { total, totalAmount, receiptsSent, pending };
  }, []);

  const handleSort = (field: 'date' | 'amount') => {
    if (sortField === field) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border px-6 h-14 flex items-center gap-4">
        <Link
          href="/"
          onClick={(e) => { try { if (window.self !== window.top) { e.preventDefault(); window.parent.postMessage('close-preview', '*'); } } catch { e.preventDefault(); } }}
          className="flex items-center gap-2 text-[13px] text-muted hover:text-foreground transition-colors duration-150"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back
        </Link>
        <div className="w-px h-4 bg-border" />
        <span className="text-[15px] font-medium">Donation Workflow</span>
      </header>

      {/* Stats Row */}
      <div className="flex-shrink-0 border-b border-border" style={{ overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch', scrollSnapType: 'x mandatory' }}>
        <div className="flex px-6" style={{ minWidth: 'min-content' }}>
          {[
            { label: 'Total Donations', value: stats.total },
            { label: 'Total Amount', value: formatCurrency(stats.totalAmount) },
            { label: 'Receipts Sent', value: stats.receiptsSent },
            { label: 'Pending Actions', value: stats.pending, warning: true },
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
              <p className={`text-[24px] font-semibold tracking-tight ${stat.warning ? 'text-warning' : ''}`}>{stat.value}</p>
              <p className="text-[11px] text-muted uppercase tracking-wider mt-1.5 whitespace-nowrap">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Donations Table */}
        <div className={`flex-1 flex flex-col overflow-hidden ${selectedDonation ? 'hidden md:flex' : 'flex'}`}>
          {/* Filter Bar */}
          <div className="flex-shrink-0 px-6 py-3 border-b border-border flex items-center gap-6">
            {/* Receipt Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setReceiptDropdownOpen(!receiptDropdownOpen);
                  setAccountingDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors duration-150"
              >
                <span>Receipt:</span>
                <span className="text-foreground">
                  {receiptFilter === 'all'
                    ? 'All'
                    : receiptFilter.charAt(0).toUpperCase() + receiptFilter.slice(1)}
                </span>
                <ChevronDown size={14} strokeWidth={1.5} />
              </button>
              {receiptDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded py-1 z-20 min-w-[100px] shadow-sm">
                  {(['all', 'sent', 'pending', 'failed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setReceiptFilter(status);
                        setReceiptDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-[13px] hover:bg-surface-2 transition-colors duration-150 ${
                        receiptFilter === status ? 'text-foreground' : 'text-muted'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Accounting Filter */}
            <div className="relative">
              <button
                onClick={() => {
                  setAccountingDropdownOpen(!accountingDropdownOpen);
                  setReceiptDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 text-[13px] text-muted hover:text-foreground transition-colors duration-150"
              >
                <span>Accounting:</span>
                <span className="text-foreground">
                  {accountingFilter === 'all'
                    ? 'All'
                    : accountingFilter.charAt(0).toUpperCase() + accountingFilter.slice(1)}
                </span>
                <ChevronDown size={14} strokeWidth={1.5} />
              </button>
              {accountingDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 bg-background border border-border rounded py-1 z-20 min-w-[100px] shadow-sm">
                  {(['all', 'logged', 'pending'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setAccountingFilter(status);
                        setAccountingDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-3 py-1.5 text-[13px] hover:bg-surface-2 transition-colors duration-150 ${
                        accountingFilter === status ? 'text-foreground' : 'text-muted'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1" />
            <span className="text-[13px] text-muted">
              {filteredDonations.length} donation{filteredDonations.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Table Header */}
          <div className="flex-shrink-0 px-6 py-2.5 border-b border-border bg-secondary" style={{ overflowX: 'auto' }}>
            <div className="grid grid-cols-[90px_1fr_1.2fr_100px_80px_80px_90px] gap-4 text-[11px] text-muted uppercase tracking-wider" style={{ minWidth: 700 }}>
              <button
                onClick={() => handleSort('date')}
                className="text-left hover:text-foreground transition-colors duration-150 flex items-center gap-1"
                style={{ whiteSpace: 'nowrap' }}
              >
                Date
                {sortField === 'date' && (
                  <span className="text-foreground">{sortDir === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
              <span style={{ whiteSpace: 'nowrap' }}>Donor</span>
              <span style={{ whiteSpace: 'nowrap' }}>Email</span>
              <button
                onClick={() => handleSort('amount')}
                className="text-right hover:text-foreground transition-colors duration-150 flex items-center justify-end gap-1"
                style={{ whiteSpace: 'nowrap' }}
              >
                Amount
                {sortField === 'amount' && (
                  <span className="text-foreground">{sortDir === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
              <span style={{ whiteSpace: 'nowrap' }}>Method</span>
              <span style={{ whiteSpace: 'nowrap' }}>Receipt</span>
              <span style={{ whiteSpace: 'nowrap' }}>Accounting</span>
            </div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto" style={{ overflowX: 'auto' }}>
            {filteredDonations.map((donation) => (
              <button
                key={donation.id}
                onClick={() => setSelectedDonation(donation)}
                className={`w-full px-6 py-3 border-b border-border text-left transition-colors duration-150 ${
                  selectedDonation?.id === donation.id
                    ? 'bg-surface-2'
                    : 'hover:bg-secondary'
                }`}
              >
                <div className="grid grid-cols-[90px_1fr_1.2fr_100px_80px_80px_90px] gap-4 text-[13px] items-center" style={{ minWidth: 700 }}>
                  <span className="text-muted" style={{ whiteSpace: 'nowrap' }}>{formatDate(donation.date)}</span>
                  <span className="truncate font-medium">{donation.donorName}</span>
                  <span className="truncate text-muted">{donation.email}</span>
                  <span className="text-right tabular-nums" style={{ whiteSpace: 'nowrap' }}>{formatCurrency(donation.amount)}</span>
                  <span className="text-muted" style={{ whiteSpace: 'nowrap' }}>{donation.paymentMethod}</span>
                  <StatusBadge status={donation.receiptStatus} />
                  <StatusBadge status={donation.accountingStatus} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className={`w-full md:w-[380px] flex-shrink-0 md:border-l border-border flex flex-col overflow-hidden bg-secondary ${selectedDonation ? 'flex' : 'hidden md:flex'}`}>
          {selectedDonation ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Panel Header */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-border flex items-center justify-between bg-background">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedDonation(null)}
                    className="md:hidden p-1 -ml-1 text-muted hover:text-foreground transition-colors duration-150"
                  >
                    <ArrowLeft size={18} strokeWidth={1.5} />
                  </button>
                  <span className="text-[13px] font-medium">{selectedDonation.id}</span>
                </div>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="hidden md:block text-muted hover:text-foreground transition-colors duration-150 p-1"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Donor Info */}
                <div className="p-4 border-b border-border bg-background">
                  <p className="text-[11px] text-muted uppercase tracking-wider mb-2">Donor</p>
                  <p className="text-[15px] font-medium mb-1">{selectedDonation.donorName}</p>
                  <p className="text-[13px] text-muted mb-0.5">{selectedDonation.email}</p>
                  <p className="text-[13px] text-muted">{selectedDonation.address}</p>
                </div>

                {/* Payment Details */}
                <div className="p-4 border-b border-border bg-background">
                  <p className="text-[11px] text-muted uppercase tracking-wider mb-3">
                    Payment Details
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-muted">Amount</span>
                      <span className="font-medium">{formatCurrency(selectedDonation.amount)}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-muted">Method</span>
                      <span>{selectedDonation.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-muted">Transaction ID</span>
                      <span className="text-[12px] text-muted">
                        {selectedDonation.transactionId}
                      </span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-muted">Timestamp</span>
                      <span>{formatTimestamp(selectedDonation.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Workflow */}
                <div className="p-4 border-b border-border bg-background">
                  <p className="text-[11px] text-muted uppercase tracking-wider mb-4">
                    Workflow Status
                  </p>
                  <WorkflowVisualization steps={selectedDonation.workflow} />
                </div>

                {/* Actions */}
                <div className="p-4 bg-background">
                  <p className="text-[11px] text-muted uppercase tracking-wider mb-3">
                    Actions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-3 text-[13px] bg-surface-2 hover:bg-border rounded transition-colors duration-150">
                      <RefreshCw size={14} strokeWidth={1.5} />
                      Resend Receipt
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 text-[13px] bg-surface-2 hover:bg-border rounded transition-colors duration-150">
                      <FileText size={14} strokeWidth={1.5} />
                      Manual Log
                    </button>
                  </div>
                  <button className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-3 text-[13px] text-destructive bg-surface-2 hover:bg-border rounded transition-colors duration-150">
                    <Flag size={14} strokeWidth={1.5} />
                    Flag Issue
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Activity Header */}
              <div className="flex-shrink-0 px-4 py-3 border-b border-border bg-background">
                <p className="text-[11px] text-muted uppercase tracking-wider">
                  Recent Activity
                </p>
              </div>

              {/* Activity Feed */}
              <div className="flex-1 overflow-y-auto bg-background">
                {activityEvents.map((event) => (
                  <ActivityItem key={event.id} event={event} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
