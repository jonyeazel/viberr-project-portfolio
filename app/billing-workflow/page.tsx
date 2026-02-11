'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, AlertTriangle, FileText, ChevronRight } from 'lucide-react';

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

// Generate German-sounding company names
const germanPrefixes = ['Nord', 'Süd', 'Ost', 'West', 'Alt', 'Neu', 'Groß', 'Klein', 'Ober', 'Unter'];
const germanRoots = ['berg', 'stein', 'feld', 'wald', 'bach', 'dorf', 'hausen', 'burg', 'thal', 'heim'];
const companySuffixes = ['GmbH', 'AG', 'KG', 'e.K.', 'GmbH & Co. KG'];
const businessTypes = ['Logistik', 'Technik', 'Handel', 'Bau', 'Consulting', 'Services', 'Solutions', 'Industrie'];

function generateCompanyName(seed: number): string {
  const prefix = germanPrefixes[seed % germanPrefixes.length];
  const root = germanRoots[(seed * 3) % germanRoots.length];
  const businessType = businessTypes[(seed * 7) % businessTypes.length];
  const suffix = companySuffixes[(seed * 11) % companySuffixes.length];
  return `${prefix}${root} ${businessType} ${suffix}`;
}

// Generate mock data
function generateCustomerData(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const seed = i + 1;
    const employees = 5 + Math.floor(Math.pow(seed * 17 % 100, 0.8));
    const cardLoads = employees + Math.floor((seed * 13 % 20) - 10);
    const hasAnomaly = cardLoads !== employees && Math.abs(cardLoads - employees) > 2;
    const missingData = seed % 17 === 0;
    const licenseType = ['Standard', 'Premium', 'Enterprise'][seed % 3];
    const licenseFee = licenseType === 'Standard' ? 9.90 : licenseType === 'Premium' ? 14.90 : 24.90;
    const transactionFee = cardLoads * 0.50;
    const total = employees * licenseFee + transactionFee;
    const invoiceStatus = ['Draft', 'Sent', 'Paid'][(seed * 7) % 3] as 'Draft' | 'Sent' | 'Paid';
    const dueDate = new Date(2025, 1, 15 + (seed % 10));
    
    return {
      id: `CUS-${String(seed).padStart(4, '0')}`,
      name: generateCompanyName(seed),
      employees,
      cardLoads,
      revenueHandle: total,
      status: missingData ? 'Missing' : hasAnomaly ? 'Anomaly' : 'Pending',
      verified: false,
      licenseType,
      licenseFee,
      transactionFee,
      total,
      invoiceStatus,
      dueDate,
      notes: '',
      lastMonth: total * (0.85 + (seed % 30) / 100),
    };
  });
}

type WorkflowStep = 'review' | 'invoicing' | 'financial';
type CustomerStatus = 'Pending' | 'Verified' | 'Anomaly' | 'Missing';
type InvoiceStatus = 'Draft' | 'Sent' | 'Paid';

interface Customer {
  id: string;
  name: string;
  employees: number;
  cardLoads: number;
  revenueHandle: number;
  status: CustomerStatus;
  verified: boolean;
  licenseType: string;
  licenseFee: number;
  transactionFee: number;
  total: number;
  invoiceStatus: InvoiceStatus;
  dueDate: Date;
  notes: string;
  lastMonth: number;
}

export default function BillingWorkflowPage() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('review');
  const [customers, setCustomers] = useState<Customer[]>(() => generateCustomerData(28));
  
  const billingPeriod = 'January 2025';
  
  const stats = useMemo(() => {
    const active = customers.length;
    const monthlyRevenue = customers.reduce((sum, c) => sum + c.total, 0);
    const pendingInvoices = customers.filter(c => c.invoiceStatus !== 'Paid').length;
    const anomalies = customers.filter(c => c.status === 'Anomaly' || c.status === 'Missing').length;
    const verified = customers.filter(c => c.verified).length;
    return { active, monthlyRevenue, pendingInvoices, anomalies, verified };
  }, [customers]);

  const toggleVerified = (id: string) => {
    setCustomers(prev => prev.map(c => 
      c.id === id ? { ...c, verified: !c.verified, status: !c.verified ? 'Verified' : 'Pending' } : c
    ));
  };

  const updateInvoiceStatus = (id: string, status: InvoiceStatus) => {
    setCustomers(prev => prev.map(c => 
      c.id === id ? { ...c, invoiceStatus: status } : c
    ));
  };

  const stepIndex = currentStep === 'review' ? 0 : currentStep === 'invoicing' ? 1 : 2;
  const stepLabels = ['Data Review', 'Invoicing', 'Financial Plan'];

  return (
    <div style={{ background: colors.bg, minHeight: '100vh', color: colors.text }}>
      {/* Header */}
      <header style={{ 
        borderBottom: `1px solid ${colors.border}`,
        background: colors.surface,
      }}>
        <div style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link 
              href="/" 
              style={{ 
                color: colors.muted, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8,
                textDecoration: 'none',
                fontSize: 13,
                transition: 'color 150ms ease-out',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.muted}
            >
              <ArrowLeft size={16} strokeWidth={1.5} />
              Back
            </Link>
            <div style={{ width: 1, height: 24, background: colors.border }} />
            <div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Monthly Billing Workflow</div>
              <div style={{ fontSize: 13, color: colors.muted }}>{billingPeriod}</div>
            </div>
          </div>
          
          {/* Progress Steps */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {stepLabels.map((label, i) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center' }}>
                <button
                  onClick={() => setCurrentStep(['review', 'invoicing', 'financial'][i] as WorkflowStep)}
                  style={{
                    padding: '8px 16px',
                    background: i === stepIndex ? colors.surface2 : 'transparent',
                    border: `1px solid ${i === stepIndex ? colors.border : 'transparent'}`,
                    borderRadius: 6,
                    color: i === stepIndex ? colors.text : colors.muted,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 150ms ease-out',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span style={{
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    background: i < stepIndex ? colors.green : i === stepIndex ? colors.blue : colors.surface2,
                    color: i <= stepIndex ? colors.bg : colors.muted,
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
                {i < 2 && <ChevronRight size={16} style={{ color: colors.border, margin: '0 4px' }} />}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div style={{ 
        padding: '16px 24px',
        display: 'flex',
        gap: 32,
        borderBottom: `1px solid ${colors.border}`,
      }}>
        <Stat label="Active Customers" value={stats.active} />
        <Stat label="Monthly Revenue" value={`€${stats.monthlyRevenue.toLocaleString('de-DE', { minimumFractionDigits: 2 })}`} />
        <Stat label="Pending Invoices" value={stats.pendingInvoices} highlight={stats.pendingInvoices > 0} />
        <Stat label="Anomalies" value={stats.anomalies} highlight={stats.anomalies > 0} highlightColor={colors.amber} />
        {currentStep === 'review' && <Stat label="Verified" value={`${stats.verified}/${stats.active}`} />}
      </div>

      {/* Main Content */}
      <main style={{ padding: 24, height: 'calc(100vh - 140px)', overflow: 'auto' }}>
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
  highlightColor = colors.blue 
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
      <div style={{ fontSize: 18, fontWeight: 500, color: highlight ? highlightColor : colors.text }}>
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
    <div style={{ background: colors.surface, borderRadius: 8, border: `1px solid ${colors.border}` }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
            <Th style={{ width: 40 }} />
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
              style={{ 
                borderBottom: `1px solid ${colors.border}`,
                transition: 'background 150ms ease-out',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = colors.surface2}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Td>
                <button
                  onClick={() => onToggleVerified(customer.id)}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: 4,
                    border: `1px solid ${customer.verified ? colors.green : colors.border}`,
                    background: customer.verified ? colors.green : 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 150ms ease-out',
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
              <Td align="right" style={{ 
                fontVariantNumeric: 'tabular-nums',
                color: customer.cardLoads !== customer.employees ? colors.amber : colors.text,
              }}>
                {customer.cardLoads}
                {customer.cardLoads !== customer.employees && (
                  <span style={{ marginLeft: 8, color: colors.amber }}>
                    ({customer.cardLoads > customer.employees ? '+' : ''}{customer.cardLoads - customer.employees})
                  </span>
                )}
              </Td>
              <Td align="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                €{customer.revenueHandle.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </Td>
              <Td>
                <StatusBadge status={customer.verified ? 'Verified' : customer.status} />
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
    const draft = customers.filter(c => c.invoiceStatus === 'Draft').reduce((sum, c) => sum + c.total, 0);
    const sent = customers.filter(c => c.invoiceStatus === 'Sent').reduce((sum, c) => sum + c.total, 0);
    const paid = customers.filter(c => c.invoiceStatus === 'Paid').reduce((sum, c) => sum + c.total, 0);
    return { total, draft, sent, paid };
  }, [customers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Summary */}
      <div style={{ display: 'flex', gap: 16 }}>
        <SummaryCard label="Total" value={totals.total} />
        <SummaryCard label="Draft" value={totals.draft} />
        <SummaryCard label="Sent" value={totals.sent} color={colors.blue} />
        <SummaryCard label="Paid" value={totals.paid} color={colors.green} />
      </div>

      {/* Table */}
      <div style={{ background: colors.surface, borderRadius: 8, border: `1px solid ${colors.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              <Th>Customer</Th>
              <Th>License Type</Th>
              <Th align="right">License Fee</Th>
              <Th align="right">Transaction Fee</Th>
              <Th align="right">Total</Th>
              <Th>Due Date</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr 
                key={customer.id} 
                style={{ 
                  borderBottom: `1px solid ${colors.border}`,
                  transition: 'background 150ms ease-out',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.surface2}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Td>
                  <div style={{ fontSize: 13 }}>{customer.name}</div>
                </Td>
                <Td style={{ color: colors.muted, fontSize: 13 }}>{customer.licenseType}</Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  €{(customer.employees * customer.licenseFee).toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', color: colors.muted }}>
                  €{customer.transactionFee.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                  €{customer.total.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </Td>
                <Td style={{ color: colors.muted, fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>
                  {customer.dueDate.toLocaleDateString('de-DE')}
                </Td>
                <Td>
                  <select
                    value={customer.invoiceStatus}
                    onChange={(e) => onUpdateStatus(customer.id, e.target.value as InvoiceStatus)}
                    style={{
                      background: colors.surface2,
                      border: `1px solid ${colors.border}`,
                      borderRadius: 4,
                      color: customer.invoiceStatus === 'Paid' ? colors.green : 
                             customer.invoiceStatus === 'Sent' ? colors.blue : colors.text,
                      padding: '4px 8px',
                      fontSize: 13,
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Paid">Paid</option>
                  </select>
                </Td>
              </tr>
            ))}
          </tbody>
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
      const change = ((c.total - c.lastMonth) / c.lastMonth) * 100;
      return { ...c, cumulative, change };
    });
  }, [customers]);

  const totalThisMonth = data.reduce((sum, c) => sum + c.total, 0);
  const totalLastMonth = customers.reduce((sum, c) => sum + c.lastMonth, 0);
  const overallChange = ((totalThisMonth - totalLastMonth) / totalLastMonth) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Period Comparison */}
      <div style={{ 
        background: colors.surface, 
        borderRadius: 8, 
        border: `1px solid ${colors.border}`,
        padding: 24,
        display: 'flex',
        gap: 48,
      }}>
        <div>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            This Period
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
            €{totalThisMonth.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Last Period
          </div>
          <div style={{ fontSize: 24, fontWeight: 500, color: colors.muted, fontVariantNumeric: 'tabular-nums' }}>
            €{totalLastMonth.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Change
          </div>
          <div style={{ 
            fontSize: 24, 
            fontWeight: 500, 
            color: overallChange >= 0 ? colors.green : colors.red,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {overallChange >= 0 ? '+' : ''}{overallChange.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Ledger */}
      <div style={{ background: colors.surface, borderRadius: 8, border: `1px solid ${colors.border}` }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
              <Th>Customer</Th>
              <Th>License Type</Th>
              <Th align="right">Monthly Amount</Th>
              <Th align="right">vs Last Month</Th>
              <Th align="right">Cumulative</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((customer) => (
              <tr 
                key={customer.id} 
                style={{ 
                  borderBottom: `1px solid ${colors.border}`,
                  transition: 'background 150ms ease-out',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = colors.surface2}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Td>
                  <div style={{ fontSize: 13 }}>{customer.name}</div>
                </Td>
                <Td style={{ color: colors.muted, fontSize: 13 }}>{customer.licenseType}</Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  €{customer.total.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </Td>
                <Td align="right" style={{ 
                  fontVariantNumeric: 'tabular-nums',
                  color: customer.change >= 0 ? colors.green : colors.red,
                  fontSize: 13,
                }}>
                  {customer.change >= 0 ? '+' : ''}{customer.change.toFixed(1)}%
                </Td>
                <Td align="right" style={{ fontVariantNumeric: 'tabular-nums', color: colors.muted }}>
                  €{customer.cumulative.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </Td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: colors.surface2 }}>
              <Td colSpan={2} style={{ fontWeight: 500 }}>Total</Td>
              <Td align="right" style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                €{totalThisMonth.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
              </Td>
              <Td align="right" style={{ 
                fontWeight: 500, 
                fontVariantNumeric: 'tabular-nums',
                color: overallChange >= 0 ? colors.green : colors.red,
              }}>
                {overallChange >= 0 ? '+' : ''}{overallChange.toFixed(1)}%
              </Td>
              <Td />
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
      flex: 1,
    }}>
      <div style={{ fontSize: 11, color: colors.muted, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 500, color: color || colors.text, fontVariantNumeric: 'tabular-nums' }}>
        €{value.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CustomerStatus }) {
  const config = {
    Verified: { color: colors.green, bg: `${colors.green}15` },
    Pending: { color: colors.muted, bg: colors.surface2 },
    Anomaly: { color: colors.amber, bg: `${colors.amber}15` },
    Missing: { color: colors.red, bg: `${colors.red}15` },
  };
  
  const { color, bg } = config[status];
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '4px 8px',
      borderRadius: 4,
      background: bg,
      color,
      fontSize: 11,
      fontWeight: 500,
    }}>
      {(status === 'Anomaly' || status === 'Missing') && (
        <AlertTriangle size={12} strokeWidth={2} />
      )}
      {status === 'Verified' && (
        <Check size={12} strokeWidth={2} />
      )}
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
