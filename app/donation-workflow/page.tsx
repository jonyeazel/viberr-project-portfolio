'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Clock, AlertCircle, ChevronDown, X } from 'lucide-react';

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
  paymentMethod: string;
  transactionId: string;
  receiptStatus: ReceiptStatus;
  accountingStatus: AccountingStatus;
  workflow: WorkflowStep[];
}

interface ActivityEvent {
  id: string;
  timestamp: Date;
  message: string;
  type: 'receipt' | 'payment' | 'accounting' | 'error';
}

// Data generation
const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Christopher', 'Karen', 'Charles', 'Lisa', 'Daniel', 'Nancy', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'];
const streets = ['Oak St', 'Maple Ave', 'Cedar Ln', 'Pine Dr', 'Elm Way', 'Birch Rd', 'Walnut Ct', 'Cherry Blvd', 'Spruce Pl', 'Willow Ter'];
const cities = ['San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ', 'Philadelphia, PA', 'San Antonio, TX', 'San Diego, CA', 'Dallas, TX'];

function generateTransactionId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 17; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateDonations(count: number): Donation[] {
  const donations: Donation[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${['gmail.com', 'yahoo.com', 'outlook.com', 'icloud.com'][Math.floor(Math.random() * 4)]}`;
    const streetNum = Math.floor(Math.random() * 9999) + 1;
    const street = streets[Math.floor(Math.random() * streets.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const zip = String(Math.floor(Math.random() * 90000) + 10000);
    
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursAgo * 60 * 60 * 1000);
    
    const amounts = [10, 25, 50, 75, 100, 150, 200, 250, 500, 750, 1000, 2500, 5000];
    const amount = amounts[Math.floor(Math.random() * amounts.length)] + (Math.random() < 0.3 ? Math.floor(Math.random() * 50) : 0);
    
    const receiptRoll = Math.random();
    const receiptStatus: ReceiptStatus = receiptRoll < 0.75 ? 'sent' : receiptRoll < 0.9 ? 'pending' : 'failed';
    const accountingStatus: AccountingStatus = receiptStatus === 'sent' && Math.random() < 0.85 ? 'logged' : 'pending';
    
    const workflowSteps: WorkflowStep[] = [
      { name: 'Payment Captured', status: 'completed', timestamp: date },
      { name: 'Data Logged', status: 'completed', timestamp: new Date(date.getTime() + 2000) },
      { name: 'Receipt Generated', status: receiptStatus === 'failed' ? 'failed' : 'completed', timestamp: receiptStatus === 'failed' ? null : new Date(date.getTime() + 5000) },
      { name: 'Receipt Sent', status: receiptStatus === 'sent' ? 'completed' : receiptStatus === 'pending' ? 'pending' : 'failed', timestamp: receiptStatus === 'sent' ? new Date(date.getTime() + 8000) : null },
      { name: 'Accounting Entry', status: accountingStatus === 'logged' ? 'completed' : 'pending', timestamp: accountingStatus === 'logged' ? new Date(date.getTime() + 15000) : null },
    ];
    
    donations.push({
      id: `DON-${String(i + 1).padStart(5, '0')}`,
      date,
      donorName: name,
      email,
      address: `${streetNum} ${street}, ${city} ${zip}`,
      amount,
      paymentMethod: Math.random() < 0.9 ? 'PayPal' : 'Stripe',
      transactionId: generateTransactionId(),
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
  
  donations.slice(0, 20).forEach((donation) => {
    events.push({
      id: String(eventId++),
      timestamp: donation.date,
      message: `Payment $${donation.amount.toLocaleString()} captured from ${donation.paymentMethod}`,
      type: 'payment',
    });
    
    if (donation.receiptStatus === 'sent') {
      events.push({
        id: String(eventId++),
        timestamp: new Date(donation.date.getTime() + 8000),
        message: `Receipt sent to ${donation.donorName}`,
        type: 'receipt',
      });
    }
    
    if (donation.accountingStatus === 'logged') {
      events.push({
        id: String(eventId++),
        timestamp: new Date(donation.date.getTime() + 15000),
        message: `Accounting entry created for ${donation.id}`,
        type: 'accounting',
      });
    }
    
    if (donation.receiptStatus === 'failed') {
      events.push({
        id: String(eventId++),
        timestamp: new Date(donation.date.getTime() + 5000),
        message: `Receipt generation failed for ${donation.donorName}`,
        type: 'error',
      });
    }
  });
  
  return events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 30);
}

const donations = generateDonations(45);
const activityEvents = generateActivityEvents(donations);

// Formatters
function formatDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (24 * 60 * 60 * 1000));
  
  if (days === 0) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours === 0) {
      const mins = Math.floor(diff / (60 * 1000));
      return `${mins}m ago`;
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
function StatusBadge({ status, type }: { status: string; type: 'receipt' | 'accounting' }) {
  const colors = {
    sent: 'text-[#16a34a]',
    logged: 'text-[#16a34a]',
    pending: 'text-[#d97706]',
    failed: 'text-[#dc2626]',
  };
  
  return (
    <span className={`text-[13px] ${colors[status as keyof typeof colors] || 'text-[#737373]'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function WorkflowStepIndicator({ step }: { step: WorkflowStep }) {
  const colors = {
    completed: 'bg-[#16a34a]',
    pending: 'bg-[#d97706]',
    failed: 'bg-[#dc2626]',
  };
  
  const icons = {
    completed: <Check size={12} strokeWidth={2.5} />,
    pending: <Clock size={12} strokeWidth={2} />,
    failed: <AlertCircle size={12} strokeWidth={2} />,
  };
  
  return (
    <div className="flex items-start gap-3">
      <div className={`w-5 h-5 rounded-full ${colors[step.status]} flex items-center justify-center flex-shrink-0 mt-0.5`}>
        <span className="text-[#191919]">{icons[step.status]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-[#191919]">{step.name}</p>
        <p className="text-[11px] text-[#737373]">
          {step.timestamp ? formatTimestamp(step.timestamp) : step.status === 'pending' ? 'Waiting...' : 'Failed'}
        </p>
      </div>
    </div>
  );
}

export default function DonationWorkflowPage() {
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | ReceiptStatus>('all');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [filterOpen, setFilterOpen] = useState(false);
  
  const filteredDonations = useMemo(() => {
    let result = [...donations];
    
    if (statusFilter !== 'all') {
      result = result.filter((d) => d.receiptStatus === statusFilter);
    }
    
    result.sort((a, b) => {
      const multiplier = sortDir === 'desc' ? -1 : 1;
      if (sortField === 'date') {
        return (a.date.getTime() - b.date.getTime()) * multiplier;
      }
      return (a.amount - b.amount) * multiplier;
    });
    
    return result;
  }, [statusFilter, sortField, sortDir]);
  
  const stats = useMemo(() => {
    const total = donations.length;
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const receiptsSent = donations.filter((d) => d.receiptStatus === 'sent').length;
    const pending = donations.filter((d) => d.receiptStatus === 'pending' || d.accountingStatus === 'pending').length;
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
    <div className="min-h-screen bg-[#fafaf9] text-[#191919] flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#e5e5e3] px-6 py-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-[#737373] hover:text-[#191919] transition-colors duration-150">
            <ArrowLeft size={20} strokeWidth={1.5} />
          </Link>
          <h1 className="text-[18px] font-medium">Donation Workflow</h1>
        </div>
      </header>
      
      {/* Summary Row */}
      <div className="flex-shrink-0 border-b border-[#e5e5e3] px-6 py-4">
        <div className="flex gap-12">
          <div>
            <p className="text-[11px] text-[#737373] uppercase tracking-wide mb-1">Total Donations</p>
            <p className="text-[24px] font-medium">{stats.total}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#737373] uppercase tracking-wide mb-1">Total Amount</p>
            <p className="text-[24px] font-medium">{formatCurrency(stats.totalAmount)}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#737373] uppercase tracking-wide mb-1">Receipts Sent</p>
            <p className="text-[24px] font-medium">{stats.receiptsSent}</p>
          </div>
          <div>
            <p className="text-[11px] text-[#737373] uppercase tracking-wide mb-1">Pending Actions</p>
            <p className="text-[24px] font-medium text-[#d97706]">{stats.pending}</p>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Donations Table */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Table Controls */}
          <div className="flex-shrink-0 px-6 py-3 border-b border-[#e5e5e3] flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 text-[13px] text-[#737373] hover:text-[#191919] transition-colors duration-150"
              >
                Status: {statusFilter === 'all' ? 'All' : statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                <ChevronDown size={14} strokeWidth={1.5} />
              </button>
              {filterOpen && (
                <div className="absolute top-full left-0 mt-1 bg-[#fafaf9] border border-[#e5e5e3] rounded py-1 z-10">
                  {(['all', 'sent', 'pending', 'failed'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setFilterOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-1.5 text-[13px] hover:bg-[#eeeeec] transition-colors duration-150 ${
                        statusFilter === status ? 'text-[#191919]' : 'text-[#737373]'
                      }`}
                    >
                      {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-[#e5e5e3]">|</span>
            <span className="text-[13px] text-[#737373]">{filteredDonations.length} donations</span>
          </div>
          
          {/* Table Header */}
          <div className="flex-shrink-0 px-6 py-2 border-b border-[#e5e5e3] bg-[#fafaf9]">
            <div className="grid grid-cols-[100px_1fr_1fr_100px_100px_100px_100px] gap-4 text-[11px] text-[#737373] uppercase tracking-wide">
              <button
                onClick={() => handleSort('date')}
                className="text-left hover:text-[#191919] transition-colors duration-150"
              >
                Date {sortField === 'date' && (sortDir === 'desc' ? '↓' : '↑')}
              </button>
              <span>Donor</span>
              <span>Email</span>
              <button
                onClick={() => handleSort('amount')}
                className="text-right hover:text-[#191919] transition-colors duration-150"
              >
                Amount {sortField === 'amount' && (sortDir === 'desc' ? '↓' : '↑')}
              </button>
              <span>Method</span>
              <span>Receipt</span>
              <span>Accounting</span>
            </div>
          </div>
          
          {/* Table Body */}
          <div className="flex-1 overflow-y-auto">
            {filteredDonations.map((donation) => (
              <button
                key={donation.id}
                onClick={() => setSelectedDonation(donation)}
                className={`w-full px-6 py-3 border-b border-[#e5e5e3] hover:bg-[#fafaf9] transition-colors duration-150 text-left ${
                  selectedDonation?.id === donation.id ? 'bg-[#fafaf9]' : ''
                }`}
              >
                <div className="grid grid-cols-[100px_1fr_1fr_100px_100px_100px_100px] gap-4 text-[13px]">
                  <span className="text-[#737373]">{formatDate(donation.date)}</span>
                  <span className="truncate">{donation.donorName}</span>
                  <span className="truncate text-[#737373]">{donation.email}</span>
                  <span className="text-right">{formatCurrency(donation.amount)}</span>
                  <span className="text-[#737373]">{donation.paymentMethod}</span>
                  <StatusBadge status={donation.receiptStatus} type="receipt" />
                  <StatusBadge status={donation.accountingStatus} type="accounting" />
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Right Panel: Detail or Activity */}
        <div className="w-[360px] flex-shrink-0 border-l border-[#e5e5e3] flex flex-col overflow-hidden">
          {selectedDonation ? (
            /* Donation Detail Panel */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-shrink-0 px-4 py-3 border-b border-[#e5e5e3] flex items-center justify-between">
                <span className="text-[13px] text-[#737373]">{selectedDonation.id}</span>
                <button
                  onClick={() => setSelectedDonation(null)}
                  className="text-[#737373] hover:text-[#191919] transition-colors duration-150"
                >
                  <X size={16} strokeWidth={1.5} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Donor Info */}
                <div>
                  <p className="text-[11px] text-[#737373] uppercase tracking-wide mb-2">Donor</p>
                  <p className="text-[15px] mb-1">{selectedDonation.donorName}</p>
                  <p className="text-[13px] text-[#737373] mb-1">{selectedDonation.email}</p>
                  <p className="text-[13px] text-[#737373]">{selectedDonation.address}</p>
                </div>
                
                {/* Payment Details */}
                <div>
                  <p className="text-[11px] text-[#737373] uppercase tracking-wide mb-2">Payment</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#737373]">Amount</span>
                      <span>{formatCurrency(selectedDonation.amount)}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#737373]">Method</span>
                      <span>{selectedDonation.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#737373]">Transaction ID</span>
                      <span className="font-mono text-[11px]">{selectedDonation.transactionId}</span>
                    </div>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-[#737373]">Date</span>
                      <span>{formatTimestamp(selectedDonation.date)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Workflow Status */}
                <div>
                  <p className="text-[11px] text-[#737373] uppercase tracking-wide mb-3">Workflow</p>
                  <div className="space-y-4">
                    {selectedDonation.workflow.map((step, i) => (
                      <div key={i} className="relative">
                        {i < selectedDonation.workflow.length - 1 && (
                          <div className="absolute left-2.5 top-6 bottom-0 w-px bg-[#e5e5e3] -mb-4" />
                        )}
                        <WorkflowStepIndicator step={step} />
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="pt-2">
                  <p className="text-[11px] text-[#737373] uppercase tracking-wide mb-3">Actions</p>
                  <div className="space-y-2">
                    <button className="w-full py-2 px-3 text-[13px] bg-[#eeeeec] hover:bg-[#e5e5e3] rounded transition-colors duration-150 text-left">
                      Resend Receipt
                    </button>
                    <button className="w-full py-2 px-3 text-[13px] bg-[#eeeeec] hover:bg-[#e5e5e3] rounded transition-colors duration-150 text-left">
                      Manual Log
                    </button>
                    <button className="w-full py-2 px-3 text-[13px] bg-[#eeeeec] hover:bg-[#e5e5e3] rounded transition-colors duration-150 text-left text-[#dc2626]">
                      Flag Issue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Activity Feed */
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-shrink-0 px-4 py-3 border-b border-[#e5e5e3]">
                <p className="text-[11px] text-[#737373] uppercase tracking-wide">Activity</p>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {activityEvents.map((event) => (
                  <div key={event.id} className="px-4 py-3 border-b border-[#e5e5e3]">
                    <p className="text-[13px] mb-1">{event.message}</p>
                    <p className="text-[11px] text-[#737373]">{formatTimestamp(event.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
