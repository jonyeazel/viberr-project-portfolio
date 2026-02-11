'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, X, AlertTriangle, Check, Clock, Mail, User } from 'lucide-react';

// Fixed reference date to prevent SSR hydration mismatches
const REFERENCE_DATE = new Date('2026-02-11T12:00:00Z');

// Types
type FulfillmentStage =
  | 'order_received'
  | 'invoice_created'
  | 'codes_generated'
  | 'pdfs_created'
  | 'delivered';

interface VoucherItem {
  type: string;
  value: number;
  quantity: number;
}

interface VoucherCode {
  code: string;
  value: number;
  type: string;
  generated: boolean;
}

interface StageTimestamp {
  stage: FulfillmentStage;
  timestamp: Date;
  completed: boolean;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  items: VoucherItem[];
  voucherCodes: VoucherCode[];
  currentStage: FulfillmentStage;
  stageHistory: StageTimestamp[];
  createdAt: Date;
  flagged: boolean;
  flagReason?: string;
}

// Stage configuration
const STAGES: { key: FulfillmentStage; label: string }[] = [
  { key: 'order_received', label: 'Received' },
  { key: 'invoice_created', label: 'Invoiced' },
  { key: 'codes_generated', label: 'Generated' },
  { key: 'pdfs_created', label: 'PDFs Ready' },
  { key: 'delivered', label: 'Delivered' },
];

const STAGE_INDEX: Record<FulfillmentStage, number> = {
  order_received: 0,
  invoice_created: 1,
  codes_generated: 2,
  pdfs_created: 3,
  delivered: 4,
};

// German names for realistic data
const firstNames = [
  'Anna', 'Thomas', 'Maria', 'Stefan', 'Julia', 'Michael', 'Laura', 'Andreas',
  'Sarah', 'Christian', 'Lisa', 'Markus', 'Nina', 'Daniel', 'Katharina', 'Florian',
  'Sophie', 'Tobias', 'Hannah', 'Sebastian', 'Lena', 'Philipp', 'Emma', 'Lukas',
  'Johanna', 'Felix', 'Clara', 'Maximilian', 'Marie', 'David', 'Charlotte', 'Jan',
  'Amelie', 'Moritz', 'Lea'
];

const lastNames = [
  'Mueller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker',
  'Schulz', 'Hoffmann', 'Schaefer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf',
  'Schroeder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krueger', 'Hofmann', 'Hartmann',
  'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier', 'Lehmann', 'Schulze'
];

const voucherTypes = ['Nachhaltig Shoppen', 'Bio Genuss', 'Oeko Lifestyle', 'Gruener Konsum'];
const voucherValues = [25, 50, 100];

function seededRandom(seed: number): () => number {
  return function () {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
}

function generateVoucherCode(random: () => number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'GUD-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(random() * chars.length)];
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(random() * chars.length)];
  }
  return code;
}

function generateOrders(): Order[] {
  const random = seededRandom(42);
  const orders: Order[] = [];
  const now = REFERENCE_DATE;

  for (let i = 0; i < 32; i++) {
    const firstName = firstNames[Math.floor(random() * firstNames.length)];
    const lastName = lastNames[Math.floor(random() * lastNames.length)];
    const customerName = `${firstName} ${lastName}`;
    const customerEmail = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mail.de`;

    // Generate 1-3 voucher items
    const itemCount = Math.floor(random() * 3) + 1;
    const items: VoucherItem[] = [];
    const voucherCodes: VoucherCode[] = [];

    for (let j = 0; j < itemCount; j++) {
      const type = voucherTypes[Math.floor(random() * voucherTypes.length)];
      const value = voucherValues[Math.floor(random() * voucherValues.length)];
      const quantity = Math.floor(random() * 3) + 1;
      items.push({ type, value, quantity });

      // Generate codes for this item
      for (let k = 0; k < quantity; k++) {
        voucherCodes.push({
          code: generateVoucherCode(random),
          value,
          type,
          generated: false,
        });
      }
    }

    // Distribute orders across stages: more in middle stages for realism
    const stageWeights = [0.12, 0.18, 0.22, 0.18, 0.30];
    let stageRandom = random();
    let cumulativeWeight = 0;
    let stageIndex = 0;
    for (let s = 0; s < stageWeights.length; s++) {
      cumulativeWeight += stageWeights[s];
      if (stageRandom < cumulativeWeight) {
        stageIndex = s;
        break;
      }
    }

    const currentStage = STAGES[stageIndex].key;

    // Generate stage history with realistic timestamps
    const createdAt = new Date(now.getTime() - random() * 48 * 60 * 60 * 1000);
    const stageHistory: StageTimestamp[] = [];
    let currentTime = createdAt;

    for (let s = 0; s <= stageIndex; s++) {
      stageHistory.push({
        stage: STAGES[s].key,
        timestamp: new Date(currentTime),
        completed: s < stageIndex || currentStage === 'delivered',
      });
      currentTime = new Date(currentTime.getTime() + (random() * 45 + 10) * 60 * 1000);
    }

    // Mark codes as generated if past that stage
    if (stageIndex >= 2) {
      voucherCodes.forEach((code) => (code.generated = true));
    }

    // Flag some orders for review
    const flagged = random() < 0.1;

    const year = now.getFullYear();
    const orderNum = String(1000 + i).padStart(4, '0');

    orders.push({
      id: `ORD-${year}-${orderNum}`,
      customerName,
      customerEmail,
      items,
      voucherCodes,
      currentStage,
      stageHistory,
      createdAt,
      flagged,
      flagReason: flagged ? 'Payment verification required' : undefined,
    });
  }

  return orders;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
}

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
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function getRelativeTime(date: Date): string {
  const diffMs = REFERENCE_DATE.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return formatDate(date);
  }
}

export default function VoucherFulfillmentPage() {
  const initialOrders = useMemo(() => generateOrders(), []);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date(REFERENCE_DATE);
    today.setHours(0, 0, 0, 0);

    const todayOrders = orders.filter((o) => o.createdAt >= today);
    const pendingOrders = orders.filter((o) => o.currentStage !== 'delivered');
    const completedOrders = orders.filter((o) => o.currentStage === 'delivered');

    const totalRevenue = orders.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.value * item.quantity, 0),
      0
    );

    return {
      ordersToday: todayOrders.length,
      pending: pendingOrders.length,
      completed: completedOrders.length,
      revenue: totalRevenue,
    };
  }, [orders]);

  // Group orders by stage
  const ordersByStage = useMemo(() => {
    const grouped: Record<FulfillmentStage, Order[]> = {
      order_received: [],
      invoice_created: [],
      codes_generated: [],
      pdfs_created: [],
      delivered: [],
    };

    orders.forEach((order) => {
      grouped[order.currentStage].push(order);
    });

    // Sort each stage by createdAt (newest first)
    Object.keys(grouped).forEach((stage) => {
      grouped[stage as FulfillmentStage].sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    });

    return grouped;
  }, [orders]);

  const advanceOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        const currentIndex = STAGE_INDEX[order.currentStage];
        if (currentIndex >= STAGES.length - 1) return order;

        const nextStage = STAGES[currentIndex + 1].key;
        const now = new Date();

        // Mark codes as generated when advancing to or past that stage
        const updatedCodes =
          nextStage === 'codes_generated' || STAGE_INDEX[nextStage] > 2
            ? order.voucherCodes.map((code) => ({ ...code, generated: true }))
            : order.voucherCodes;

        return {
          ...order,
          currentStage: nextStage,
          voucherCodes: updatedCodes,
          stageHistory: [
            ...order.stageHistory.map((s) =>
              s.stage === order.currentStage ? { ...s, completed: true } : s
            ),
            { stage: nextStage, timestamp: now, completed: nextStage === 'delivered' },
          ],
        };
      })
    );
  };

  const toggleFlag = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          flagged: !order.flagged,
          flagReason: !order.flagged ? 'Manually flagged for review' : undefined,
        };
      })
    );
  };

  const getOrderTotal = (order: Order): number => {
    return order.items.reduce((sum, item) => sum + item.value * item.quantity, 0);
  };

  const getTotalQuantity = (order: Order): number => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: '#fafaf9' }}>
      {/* Header */}
      <header
        className="flex-shrink-0 px-6 py-4 border-b flex items-center justify-between"
        style={{ borderColor: '#e5e5e3' }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-[13px] transition-opacity duration-150 hover:opacity-60"
            style={{ color: '#737373' }}
          >
            <ArrowLeft size={16} strokeWidth={1.5} />
            Back
          </Link>
          <div className="w-px h-4" style={{ backgroundColor: '#e5e5e3' }} />
          <span className="text-[15px] font-medium" style={{ color: '#191919' }}>
            Voucher Fulfillment
          </span>
        </div>

        {/* Stats inline */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="text-[13px]" style={{ color: '#737373' }}>
              Today
            </span>
            <span className="text-[15px] font-medium" style={{ color: '#191919' }}>
              {stats.ordersToday}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px]" style={{ color: '#737373' }}>
              Pending
            </span>
            <span className="text-[15px] font-medium" style={{ color: '#191919' }}>
              {stats.pending}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px]" style={{ color: '#737373' }}>
              Completed
            </span>
            <span className="text-[15px] font-medium" style={{ color: '#191919' }}>
              {stats.completed}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[13px]" style={{ color: '#737373' }}>
              Revenue
            </span>
            <span className="text-[15px] font-medium" style={{ color: '#191919' }}>
              {formatCurrency(stats.revenue)}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Pipeline columns */}
        <div className="flex-1 flex overflow-x-auto">
          {STAGES.map((stage) => (
            <div
              key={stage.key}
              className="flex-1 min-w-[220px] flex flex-col border-r last:border-r-0"
              style={{ borderColor: '#e5e5e3' }}
            >
              {/* Column header */}
              <div
                className="flex-shrink-0 px-3 py-3 border-b"
                style={{ borderColor: '#e5e5e3', backgroundColor: '#f5f5f4' }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium" style={{ color: '#191919' }}>
                    {stage.label}
                  </span>
                  <span
                    className="text-[11px] px-1.5 py-0.5 rounded"
                    style={{ color: '#737373', backgroundColor: '#eeeeec' }}
                  >
                    {ordersByStage[stage.key].length}
                  </span>
                </div>
              </div>

              {/* Orders in column */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {ordersByStage[stage.key].map((order) => {
                  const isSelected = selectedOrderId === order.id;
                  return (
                    <button
                      key={order.id}
                      onClick={() => setSelectedOrderId(order.id)}
                      className="w-full text-left p-3 rounded transition-all duration-150"
                      style={{
                        backgroundColor: isSelected ? '#f5f5f4' : '#ffffff',
                        border: `1px solid ${isSelected ? 'var(--primary)' : '#e5e5e3'}`,
                      }}
                    >
                      {/* Order ID and flag */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className="text-[12px] font-medium"
                          style={{ color: '#737373' }}
                        >
                          {order.id}
                        </span>
                        {order.flagged && (
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: 'var(--warning)' }}
                          />
                        )}
                      </div>

                      {/* Customer name */}
                      <div
                        className="text-[14px] font-medium mb-1 truncate"
                        style={{ color: '#191919' }}
                      >
                        {order.customerName}
                      </div>

                      {/* Voucher count and value */}
                      <div
                        className="flex items-center justify-between text-[12px]"
                        style={{ color: '#737373' }}
                      >
                        <span>
                          {getTotalQuantity(order)} voucher
                          {getTotalQuantity(order) !== 1 ? 's' : ''}
                        </span>
                        <span>{formatCurrency(getOrderTotal(order))}</span>
                      </div>

                      {/* Time */}
                      <div className="text-[11px] mt-2" style={{ color: '#a3a3a3' }}>
                        {getRelativeTime(order.createdAt)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selectedOrder && (
          <div
            className="w-[420px] flex-shrink-0 border-l flex flex-col overflow-hidden"
            style={{ borderColor: '#e5e5e3', backgroundColor: '#ffffff' }}
          >
            {/* Panel header */}
            <div
              className="flex-shrink-0 px-5 py-4 border-b flex items-center justify-between"
              style={{ borderColor: '#e5e5e3' }}
            >
              <div>
                <div className="text-[15px] font-medium" style={{ color: '#191919' }}>
                  {selectedOrder.id}
                </div>
                <div className="text-[12px] mt-0.5" style={{ color: '#737373' }}>
                  {formatDate(selectedOrder.createdAt)} at {formatTime(selectedOrder.createdAt)}
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="p-1.5 rounded transition-colors duration-150 hover:bg-[#f5f5f4]"
                style={{ color: '#737373' }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto">
              {/* Customer section */}
              <div className="px-5 py-4 border-b" style={{ borderColor: '#e5e5e3' }}>
                <div
                  className="text-[11px] uppercase tracking-wider mb-3"
                  style={{ color: '#a3a3a3', letterSpacing: '0.05em' }}
                >
                  Customer
                </div>
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#f5f5f4' }}
                  >
                    <User size={18} strokeWidth={1.5} style={{ color: '#737373' }} />
                  </div>
                  <div>
                    <div className="text-[14px] font-medium" style={{ color: '#191919' }}>
                      {selectedOrder.customerName}
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-[13px] mt-1"
                      style={{ color: '#737373' }}
                    >
                      <Mail size={13} strokeWidth={1.5} />
                      {selectedOrder.customerEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order items section */}
              <div className="px-5 py-4 border-b" style={{ borderColor: '#e5e5e3' }}>
                <div
                  className="text-[11px] uppercase tracking-wider mb-3"
                  style={{ color: '#a3a3a3', letterSpacing: '0.05em' }}
                >
                  Order Items
                </div>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 px-3 rounded"
                      style={{ backgroundColor: '#fafaf9' }}
                    >
                      <div>
                        <div className="text-[13px]" style={{ color: '#191919' }}>
                          {item.type}
                        </div>
                        <div className="text-[12px]" style={{ color: '#737373' }}>
                          {formatCurrency(item.value)} x {item.quantity}
                        </div>
                      </div>
                      <div className="text-[13px] font-medium" style={{ color: '#191919' }}>
                        {formatCurrency(item.value * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="flex items-center justify-between mt-3 pt-3 border-t"
                  style={{ borderColor: '#e5e5e3' }}
                >
                  <span className="text-[13px]" style={{ color: '#737373' }}>
                    Total
                  </span>
                  <span className="text-[15px] font-medium" style={{ color: '#191919' }}>
                    {formatCurrency(getOrderTotal(selectedOrder))}
                  </span>
                </div>
              </div>

              {/* Voucher codes section */}
              <div className="px-5 py-4 border-b" style={{ borderColor: '#e5e5e3' }}>
                <div
                  className="text-[11px] uppercase tracking-wider mb-3"
                  style={{ color: '#a3a3a3', letterSpacing: '0.05em' }}
                >
                  Voucher Codes ({selectedOrder.voucherCodes.length})
                </div>
                <div className="space-y-1.5">
                  {selectedOrder.voucherCodes.map((code, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 px-3 rounded"
                      style={{ backgroundColor: '#fafaf9' }}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="text-[13px]"
                          style={{
                            color: code.generated ? '#191919' : '#a3a3a3',
                            fontFamily:
                              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {code.generated ? code.code : '------------'}
                        </span>
                      </div>
                      <span className="text-[12px]" style={{ color: '#737373' }}>
                        {formatCurrency(code.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fulfillment progress section */}
              <div className="px-5 py-4 border-b" style={{ borderColor: '#e5e5e3' }}>
                <div
                  className="text-[11px] uppercase tracking-wider mb-3"
                  style={{ color: '#a3a3a3', letterSpacing: '0.05em' }}
                >
                  Fulfillment Progress
                </div>
                <div className="space-y-0">
                  {STAGES.map((stage, index) => {
                    const historyEntry = selectedOrder.stageHistory.find(
                      (h) => h.stage === stage.key
                    );
                    const isActive = selectedOrder.currentStage === stage.key;
                    const isCompleted = historyEntry?.completed;
                    const isPending = !historyEntry;
                    const isLast = index === STAGES.length - 1;

                    return (
                      <div key={stage.key} className="flex items-stretch">
                        {/* Timeline indicator */}
                        <div className="flex flex-col items-center mr-3">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{
                              backgroundColor: isCompleted
                                ? 'var(--success)'
                                : isActive
                                  ? 'var(--primary)'
                                  : '#e5e5e3',
                            }}
                          >
                            {isCompleted ? (
                              <Check size={12} strokeWidth={2} style={{ color: '#ffffff' }} />
                            ) : isActive ? (
                              <Clock size={10} strokeWidth={2} style={{ color: '#ffffff' }} />
                            ) : null}
                          </div>
                          {!isLast && (
                            <div
                              className="w-px flex-1 min-h-[24px]"
                              style={{
                                backgroundColor: isCompleted ? 'var(--success)' : '#e5e5e3',
                              }}
                            />
                          )}
                        </div>

                        {/* Stage content */}
                        <div className="pb-4 flex-1">
                          <div
                            className="text-[13px]"
                            style={{
                              color: isPending ? '#a3a3a3' : '#191919',
                              fontWeight: isActive ? 500 : 400,
                            }}
                          >
                            {stage.label}
                          </div>
                          {historyEntry && (
                            <div className="text-[11px] mt-0.5" style={{ color: '#737373' }}>
                              {formatDateTime(historyEntry.timestamp)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Flag warning */}
              {selectedOrder.flagged && (
                <div className="px-5 py-4 border-b" style={{ borderColor: '#e5e5e3' }}>
                  <div
                    className="flex items-start gap-3 p-3 rounded"
                    style={{ backgroundColor: 'rgba(217, 119, 6, 0.08)' }}
                  >
                    <AlertTriangle
                      size={16}
                      strokeWidth={1.5}
                      style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }}
                    />
                    <div>
                      <div className="text-[13px] font-medium" style={{ color: 'var(--warning)' }}>
                        Flagged for Review
                      </div>
                      <div className="text-[12px] mt-0.5" style={{ color: '#b45309' }}>
                        {selectedOrder.flagReason}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Panel actions */}
            <div
              className="flex-shrink-0 p-4 border-t space-y-2"
              style={{ borderColor: '#e5e5e3', backgroundColor: '#fafaf9' }}
            >
              {selectedOrder.currentStage !== 'delivered' && (
                <button
                  onClick={() => advanceOrder(selectedOrder.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded text-[13px] font-medium transition-opacity duration-150 hover:opacity-90"
                  style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}
                >
                  Advance to {STAGES[STAGE_INDEX[selectedOrder.currentStage] + 1]?.label}
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              )}
              <button
                onClick={() => toggleFlag(selectedOrder.id)}
                className="w-full px-4 py-2.5 rounded text-[13px] transition-opacity duration-150 hover:opacity-80"
                style={{
                  backgroundColor: selectedOrder.flagged ? 'transparent' : '#f5f5f4',
                  color: selectedOrder.flagged ? 'var(--warning)' : '#737373',
                  border: selectedOrder.flagged ? '1px solid var(--warning)' : '1px solid transparent',
                }}
              >
                {selectedOrder.flagged ? 'Remove Flag' : 'Flag for Review'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
