'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, AlertTriangle, ChevronRight, ChevronDown } from 'lucide-react';

const colors = {
  bg: 'var(--background)',
  surface: 'var(--surface)',
  surface2: 'var(--surface-2)',
  border: 'var(--border)',
  text: 'var(--foreground)',
  muted: 'var(--muted)',
  primary: 'var(--primary)',
  success: 'var(--success)',
  warning: 'var(--warning)',
  destructive: 'var(--destructive)',
};

// Realistic German company names
const germanCompanies = [
  'Müller Logistik GmbH',
  'Schmidt Automotive AG',
  'Weber Maschinenbau GmbH',
  'Becker Elektrotechnik KG',
  'Hoffmann Consulting GmbH',
  'Fischer Transport GmbH & Co. KG',
  'Schneider Bauunternehmen AG',
  'Krüger Industrieservice GmbH',
  'Braun Verpackungen e.K.',
  'Neumann Software Solutions GmbH',
  'Zimmermann Metallbau KG',
  'Richter Pharma GmbH',
  'Wagner Lebensmittel AG',
  'Köhler Engineering GmbH',
  'Herrmann Textilhandel GmbH & Co. KG',
  'Lange Drucktechnik GmbH',
  'Hartmann Gebäudetechnik KG',
  'Werner Spedition GmbH',
  'Maier Medizintechnik AG',
  'König Facility Management GmbH',
  'Schwarz Energietechnik GmbH & Co. KG',
  'Baumann IT Services GmbH',
  'Vogt Handelsgesellschaft KG',
  'Keller Umwelttechnik GmbH',
  'Schreiber Personaldienstleistungen AG',
];

type WorkflowStep = 'review' | 'invoicing' | 'financial';
type CustomerStatus = 'Pending' | 'Verified' | 'Anomaly';
type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

interface Customer {
  id: string;
  name: string;
  employees: number;
  cardLoads: number;
  cardDelta: number;
  revenueHandle: number;
  status: CustomerStatus;
  verified: boolean;
  licenseType: 'Standard' | 'Premium' | 'Enterprise';
  licenseFee: number;
  transactionFee: number;
  total: number;
  invoiceStatus: InvoiceStatus;
  dueDate: Date;
  lastMonth: number;
}

function generateCustomerData(): Customer[] {
  const licenseFees = { Standard: 9.90, Premium: 14.90, Enterprise: 24.90 };
  
  // Deterministic but varied distribution
  // 15 Verified, 5 Pending, 5 Anomaly
  const statusPattern: CustomerStatus[] = [
    'Verified', 'Verified', 'Verified', 'Pending', 'Verified',
    'Verified', 'Anomaly', 'Verified', 'Verified', 'Pending',
    'Verified', 'Verified', 'Anomaly', 'Verified', 'Pending',
    'Verified', 'Verified', 'Anomaly', 'Verified', 'Verified',
    'Pending', 'Verified', 'Anomaly', 'Verified', 'Pending',
  ];
  
  // Invoice status pattern: 8 Paid, 10 Sent, 7 Draft
  const invoicePattern: InvoiceStatus[] = [
    'Paid', 'Sent', 'Draft', 'Sent', 'Paid',
    'Sent', 'Draft', 'Paid', 'Sent', 'Sent',
    'Paid', 'Draft', 'Sent', 'Paid', 'Sent',
    'Draft', 'Paid', 'Sent', 'Sent', 'Draft',
    'Paid', 'Sent', 'Draft', 'Paid', 'Draft',
  ];
  
  // License type pattern for variety
  const licensePattern: Array<'Standard' | 'Premium' | 'Enterprise'> = [
    'Premium', 'Enterprise', 'Standard', 'Premium', 'Enterprise',
    'Standard', 'Premium', 'Enterprise', 'Standard', 'Standard',
    'Premium', 'Enterprise', 'Premium', 'Standard', 'Enterprise',
    'Standard', 'Premium', 'Standard', 'Enterprise', 'Premium',
    'Standard', 'Enterprise', 'Premium', 'Standard', 'Premium',
  ];
  
  // Realistic employee counts (small to medium businesses)
  const employeeCounts = [
    12, 45, 8, 23, 156, 34, 67, 19, 28, 42,
    15, 89, 31, 11, 54, 26, 73, 17, 38, 95,
    22, 48, 14, 61, 33,
  ];
  
  return germanCompanies.map((name, i) => {
    const employees = employeeCounts[i];
    const status = statusPattern[i];
    const licenseType = licensePattern[i];
    const invoiceStatus = invoicePattern[i];
    
    // Only anomalies have card load differences (realistic: +/- 1 to 3)
    let cardDelta = 0;
    if (status === 'Anomaly') {
      const deltas = [2, -1, 3, -2, 1];
      cardDelta = deltas[Math.floor(i / 5) % 5];
    }
    const cardLoads = employees + cardDelta;
    
    const licenseFee = licenseFees[licenseType];
    const transactionFee = cardLoads * 0.50;
    const total = employees * licenseFee + transactionFee;
    
    // Last month: subtle variation (+/- 0-8%)
    const changeFactors = [1.02, 0.98, 1.05, 0.97, 1.03, 0.99, 1.01, 0.96, 1.04, 1.00];
    const lastMonth = total / changeFactors[i % 10];
    
    // Due dates spread across February 2026
    const dueDays = [5, 10, 15, 20, 25];
    const dueDate = new Date(2026, 1, dueDays[i % 5]);
    
    return {
      id: `CUS-${String(i + 1).padStart(4, '0')}`,
      name,
      employees,
      cardLoads,
      cardDelta,
      revenueHandle: total,
      status,
      verified: status === 'Verified',
      licenseType,
      licenseFee,
      transactionFee,
      total,
      invoiceStatus,
      dueDate,
      lastMonth,
    };
  });
}

export default function BillingWorkflowPage() {
  const [isEmbedded, setIsEmbedded] = useState(false);
  useEffect(() => { try { setIsEmbedded(window.self !== window.top); } catch { setIsEmbedded(true); } }, []);

  const [currentStep, setCurrentStep] = useState<WorkflowStep>('review');
  const [customers, setCustomers] = useState<Customer[]>(() => generateCustomerData());
  
  const stats = useMemo(() => {
    const active = customers.length;
    const monthlyRevenue = customers.reduce((sum, c) => sum + c.total, 0);
    const pendingInvoices = customers.filter(c => c.invoiceStatus !== 'Paid').length;
    const anomalies = customers.filter(c => c.status === 'Anomaly').length;
    const verified = customers.filter(c => c.verified).length;
    return { active, monthlyRevenue, pendingInvoices, anomalies, verified };
  }, [customers]);

  const toggleVerified = (id: string) => {
    setCustomers(prev => prev.map(c => {
      if (c.id !== id) return c;
      const newVerified = !c.verified;
      // Can only toggle between Pending and Verified (not Anomaly)
      if (c.status === 'Anomaly' && !newVerified) return c;
      return { 
        ...c, 
        verified: newVerified, 
        status: newVerified ? 'Verified' : 'Pending' 
      };
    }));
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setCustomers(prev => prev.map(c => 
      c.id === id ? { ...c, invoiceStatus: status } : c
    ));
  };

  const stepIndex = currentStep === 'review' ? 0 : currentStep === 'invoicing' ? 1 : 2;
  const stepLabels = ['Data Review', 'Invoicing', 'Financial Plan'];
  const stepKeys: WorkflowStep[] = ['review', 'invoicing', 'financial'];

  return (
    <div style={{ 
      background: colors.bg, 
      minHeight: '100vh', 
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      color: colors.text,
    }}>
      {isEmbedded && <div style={{ height: 47, flexShrink: 0, background: colors.bg }} />}
      {/* Header */}
      <header style={{ 
        borderBottom: `1px solid ${colors.border}`,
        background: colors.surface,
        flexShrink: 0,
      }}>
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link 
              href="/" 
              onClick={(e) => { try { if (window.self !== window.top) { e.preventDefault(); window.parent.postMessage('close-preview', '*'); } } catch { e.preventDefault(); } }}
              style={{ 
                color: colors.muted, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                textDecoration: 'none',
                fontSize: 13,
              }}
            >
              <ArrowLeft size={16} strokeWidth={1.5} />
              Back
            </Link>
            <div style={{ width: 1, height: 16, background: colors.border }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Monthly Billing</div>
              <div style={{ fontSize: 13, color: colors.muted }}>January 2026</div>
            </div>
          </div>
          
          {/* Pipeline Steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflowX: 'auto', scrollbarWidth: 'none', flex: '1 1 320px', justifyContent: 'flex-end' }}>
            {stepLabels.map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentStep(stepKeys[i])}
                  style={{
                    padding: '8px 12px',
                    background: i === stepIndex ? colors.text : 'transparent',
                    border: 'none',
                    borderRadius: 6,
                    color: i === stepIndex ? colors.bg : colors.muted,
                    fontSize: 13,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                  }}
                >
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    background: i < stepIndex ? colors.success : i === stepIndex ? colors.bg : colors.surface2,
                    color: i < stepIndex ? colors.bg : i === stepIndex ? colors.text : colors.muted,
                    fontSize: 11,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 500,
                  }}>
                    {i < stepIndex ? <Check size={12} strokeWidth={2} /> : i + 1}
                  </span>
                  {label}
                </button>
                {i < 2 && <ChevronRight size={14} style={{ color: colors.border, margin: '0 2px' }} />}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{ 
        borderBottom: `1px solid ${colors.border}`,
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        scrollSnapType: 'x mandatory',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', padding: '0 24px', minWidth: 'min-content' }}>
          {[
            { label: 'Active Customers', value: stats.active },
            { label: 'Monthly Revenue', value: `${stats.monthlyRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR` },
            { label: 'Pending Invoices', value: stats.pendingInvoices },
            { label: 'Anomalies', value: stats.anomalies, highlight: stats.anomalies > 0, highlightColor: colors.warning },
            ...(currentStep === 'review' ? [{ label: 'Verified', value: `${stats.verified}/${stats.active}`, highlight: stats.verified === stats.active, highlightColor: colors.success }] : []),
          ].map((stat, i, arr) => (
            <div key={stat.label} style={{
              padding: '16px 24px 16px 0',
              paddingLeft: i > 0 ? 24 : 0,
              scrollSnapAlign: 'start',
              flexShrink: 0,
              borderRight: i < arr.length - 1 ? `1px solid ${colors.border}` : 'none',
            }}>
              <div style={{ fontSize: 24, fontWeight: 500, color: stat.highlight ? stat.highlightColor : colors.text, fontVariantNumeric: 'tabular-nums' }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
        {currentStep === 'review' && (
          <DataReviewTab customers={customers} onToggleVerified={toggleVerified} />
        )}
        {currentStep === 'invoicing' && (
          <InvoicingTab customers={customers} onUpdateStatus={updateInvoiceStatus} />
        )}
        {currentStep === 'financial' && (
          <FinancialPlanTab customers={customers} />
        )}
      </main>
    </div>
  );
}

function Stat({ 
  label, 
  value, 
  highlight = false, 
  highlightColor = colors.primary 
}: { 
  label: string; 
  value: string | number; 
  highlight?: boolean;
  highlightColor?: string;
}) {
  return (
    <div>
      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 500, color: highlight ? highlightColor : colors.text, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}

function DataReviewTab({ 
  customers, 
  onToggleVerified 
}: { 
  customers: Customer[]; 
  onToggleVerified: (id: string) => void;
}) {
  return (
    <div style={{ background: colors.surface, borderRadius: 8, border: `1px solid ${colors.border}`, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
            <Th style={{ width: 48 }} />
            <Th>Customer</Th>
            <Th align="right">Employees</Th>
            <Th align="right">Card Loads</Th>
            <Th align="right">Revenue Handle</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr 
              key={customer.id} 
              style={{ borderBottom: `1px solid ${colors.border}` }}
            >
              <Td>
                <button
                  onClick={() => onToggleVerified(customer.id)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: `1px solid ${customer.verified ? colors.success : colors.border}`,
                    background: customer.verified ? colors.success : 'transparent',
                    cursor: customer.status === 'Anomaly' && !customer.verified ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: customer.status === 'Anomaly' && !customer.verified ? 0.5 : 1,
                  }}
                >
                  {customer.verified && <Check size={12} style={{ color: colors.bg }} strokeWidth={2} />}
                </button>
              </Td>
              <Td>
                <div style={{ fontSize: 13 }}>{customer.name}</div>
                <div style={{ fontSize: 11, color: colors.muted }}>{customer.id}</div>
              </Td>
              <Td align="right" style={{ fontVariantNumeric: 'tabular-nums' }}>{customer.employees}</Td>
              <Td align="right">
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{customer.cardLoads}</span>
                {customer.cardDelta !== 0 && (
                  <span style={{ 
                    marginLeft: 8, 
                    color: colors.warning,
                    fontSize: 12,
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {customer.cardDelta > 0 ? '+' : ''}{customer.cardDelta}
                  </span>
                )}
              </Td>
              <Td align="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {customer.revenueHandle.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
              </Td>
              <Td>
                <StatusBadge status={customer.status} />
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InvoicingTab({ 
  customers, 
  onUpdateStatus 
}: { 
  customers: Customer[]; 
  onUpdateStatus: (id: string, status: InvoiceStatus) => void;
}) {
  const totals = useMemo(() => {
    const total = customers.reduce((sum, c) => sum + c.total, 0);
    const licenseFees = customers.reduce((sum, c) => sum + (c.employees * c.licenseFee), 0);
    const transactionFees = customers.reduce((sum, c) => sum + c.transactionFee, 0);
    const draft = customers.filter(c => c.invoiceStatus === 'Draft').reduce((sum, c) => sum + c.total, 0);
    const sent = customers.filter(c => c.invoiceStatus === 'Sent').reduce((sum, c) => sum + c.total, 0);
    const paid = customers.filter(c => c.invoiceStatus === 'Paid').reduce((sum, c) => sum + c.total, 0);
    return { total, licenseFees, transactionFees, draft, sent, paid };
  }, [customers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary Cards */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <SummaryCard label="Total" value={totals.total} />
        <SummaryCard label="Draft" value={totals.draft} color={colors.muted} />
        <SummaryCard label="Sent" value={totals.sent} color={colors.primary} />
        <SummaryCard label="Paid" value={totals.paid} color={colors.success} />
      </div>

      {/* Invoice Table */}
      <div style={{ background: colors.surface, borderRadius: 8, border: `1px solid ${colors.border}`, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              <Th>Customer</Th>
              <Th align="right">License Fee</Th>
              <Th align="right">Transaction Fee</Th>
              <Th align="right">Total</Th>
              <Th>Status</Th>
              <Th>Due Date</Th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr 
                key={customer.id} 
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <Td>
                  <div style={{ fontSize: 13 }}>{customer.name}</div>
                  <div style={{ fontSize: 11, color: colors.muted }}>{customer.licenseType}</div>
                </Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {(customer.employees * customer.licenseFee).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                </Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', color: colors.muted }}>
                  {customer.transactionFee.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                </Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                  {customer.total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                </Td>
                <Td>
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    <select
                      value={customer.invoiceStatus}
                      onChange={(e) => onUpdateStatus(customer.id, e.target.value as InvoiceStatus)}
                      style={{
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        background: colors.surface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: 6,
                        color: customer.invoiceStatus === 'Paid' ? colors.success : 
                               customer.invoiceStatus === 'Sent' ? colors.primary : colors.text,
                        padding: '7px 36px 7px 12px',
                        fontSize: 13,
                        cursor: 'pointer',
                        fontWeight: 500,
                        outline: 'none',
                      }}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Paid">Paid</option>
                    </select>
                    <ChevronDown size={14} strokeWidth={1.5} style={{ position: 'absolute', right: '12px', pointerEvents: 'none', color: colors.muted }} />
                  </div>
                </Td>
                <Td style={{ color: colors.muted, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                  {customer.dueDate.toLocaleDateString('de-DE')}
                </Td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: colors.surface2 }}>
              <Td style={{ fontWeight: 500 }}>Total ({customers.length} invoices)</Td>
              <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                {totals.licenseFees.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
              </Td>
              <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500, color: colors.muted }}>
                {totals.transactionFees.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
              </Td>
              <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                {totals.total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
              </Td>
              <Td />
              <Td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function FinancialPlanTab({ customers }: { customers: Customer[] }) {
  const data = useMemo(() => {
    let cumulative = 0;
    return customers.map(c => {
      cumulative += c.total;
      const delta = c.total - c.lastMonth;
      const changePercent = (delta / c.lastMonth) * 100;
      return { ...c, cumulative, delta, changePercent };
    });
  }, [customers]);

  const totalThisMonth = data.reduce((sum, c) => sum + c.total, 0);
  const totalLastMonth = customers.reduce((sum, c) => sum + c.lastMonth, 0);
  const overallDelta = totalThisMonth - totalLastMonth;
  const overallChangePercent = (overallDelta / totalLastMonth) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Period Summary */}
      <div style={{ 
        background: colors.surface, 
        borderRadius: 8, 
        border: `1px solid ${colors.border}`,
        padding: 24,
        display: 'flex',
        flexWrap: 'wrap',
        gap: '24px 48px',
      }}>
        <div>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            January 2026
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            {totalThisMonth.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            December 2024
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, color: colors.muted, fontVariantNumeric: 'tabular-nums' }}>
            {totalLastMonth.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Change
          </div>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 500, 
            color: overallChangePercent >= 0 ? colors.success : colors.destructive,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {overallChangePercent >= 0 ? '+' : ''}{overallChangePercent.toFixed(1)}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Net Difference
          </div>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 500, 
            color: overallDelta >= 0 ? colors.success : colors.destructive,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {overallDelta >= 0 ? '+' : ''}{overallDelta.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
          </div>
        </div>
      </div>

      {/* Ledger Table */}
      <div style={{ background: colors.surface, borderRadius: 8, border: `1px solid ${colors.border}`, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              <Th>Customer</Th>
              <Th>License Type</Th>
              <Th align="right">Monthly Amount</Th>
              <Th align="right">Cumulative YTD</Th>
              <Th align="right">vs Last Month</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((customer) => (
              <tr 
                key={customer.id} 
                style={{ borderBottom: `1px solid ${colors.border}` }}
              >
                <Td>
                  <div style={{ fontSize: 13 }}>{customer.name}</div>
                  <div style={{ fontSize: 11, color: colors.muted }}>{customer.id}</div>
                </Td>
                <Td style={{ color: colors.muted, fontSize: 13 }}>{customer.licenseType}</Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {customer.total.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                </Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', color: colors.muted }}>
                  {customer.cumulative.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                </Td>
                <Td align="right">
                  <span style={{ 
                    fontVariantNumeric: 'tabular-nums',
                    color: customer.delta >= 0 ? colors.success : colors.destructive,
                    fontSize: 13,
                  }}>
                    {customer.delta >= 0 ? '+' : ''}{customer.delta.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
                  </span>
                </Td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: colors.surface2 }}>
              <Td colSpan={2} style={{ fontWeight: 500 }}>Period Total</Td>
              <Td align="right" style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                {totalThisMonth.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
              </Td>
              <Td />
              <Td align="right" style={{ 
                fontWeight: 500, 
                fontVariantNumeric: 'tabular-nums',
                color: overallDelta >= 0 ? colors.success : colors.destructive,
              }}>
                {overallDelta >= 0 ? '+' : ''}{overallDelta.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
              </Td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function SummaryCard({ 
  label, 
  value, 
  color 
}: { 
  label: string; 
  value: number; 
  color?: string;
}) {
  return (
    <div style={{ 
      background: colors.surface, 
      borderRadius: 8, 
      border: `1px solid ${colors.border}`,
      padding: 16,
      flex: '1 1 140px',
      minWidth: 140,
    }}>
      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 500, color: color || colors.text, fontVariantNumeric: 'tabular-nums' }}>
        {value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CustomerStatus }) {
  const config = {
    Verified: { color: colors.success, bg: 'rgba(22, 163, 74, 0.08)' },
    Pending: { color: colors.muted, bg: colors.surface2 },
    Anomaly: { color: colors.warning, bg: 'rgba(217, 119, 6, 0.08)' },
  };
  
  const { color, bg } = config[status];
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 10px',
      borderRadius: 4,
      background: bg,
      color,
      fontSize: 12,
      fontWeight: 500,
    }}>
      {status === 'Anomaly' && <AlertTriangle size={12} strokeWidth={2} />}
      {status === 'Verified' && <Check size={12} strokeWidth={2} />}
      {status}
    </span>
  );
}

function Th({ 
  children, 
  align = 'left', 
  style = {} 
}: { 
  children?: React.ReactNode; 
  align?: 'left' | 'right'; 
  style?: React.CSSProperties;
}) {
  return (
    <th style={{
      padding: '12px 16px',
      textAlign: align,
      fontSize: 11,
      fontWeight: 500,
      color: colors.muted,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      ...style,
    }}>
      {children}
    </th>
  );
}

function Td({ 
  children, 
  align = 'left', 
  style = {},
  colSpan,
}: { 
  children?: React.ReactNode; 
  align?: 'left' | 'right'; 
  style?: React.CSSProperties;
  colSpan?: number;
}) {
  return (
    <td 
      colSpan={colSpan}
      style={{
        padding: '12px 16px',
        textAlign: align,
        fontSize: 13,
        ...style,
      }}
    >
      {children}
    </td>
  );
}
