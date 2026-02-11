'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, X, AlertTriangle } from 'lucide-react';

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
  { key: 'order_received', label: 'Order Received' },
  { key: 'invoice_created', label: 'Invoice Created' },
  { key: 'codes_generated', label: 'Codes Generated' },
  { key: 'pdfs_created', label: 'PDFs Created' },
  { key: 'delivered', label: 'Delivered' },
];

const STAGE_INDEX: Record<FulfillmentStage, number> = {
  order_received: 0,
  invoice_created: 1,
  codes_generated: 2,
  pdfs_created: 3,
  delivered: 4,
};

// Data generation utilities
const firstNames = [
  'Anna', 'Thomas', 'Maria', 'Stefan', 'Julia', 'Michael', 'Laura', 'Andreas',
  'Sarah', 'Christian', 'Lisa', 'Markus', 'Nina', 'Daniel', 'Katharina', 'Florian',
  'Sophie', 'Tobias', 'Hannah', 'Sebastian', 'Lena', 'Philipp', 'Emma', 'Lukas',
  'Johanna', 'Felix', 'Clara', 'Maximilian', 'Marie', 'David'
];

const lastNames = [
  'Mueller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker',
  'Schulz', 'Hoffmann', 'Schaefer', 'Koch', 'Bauer', 'Richter', 'Klein', 'Wolf',
  'Schroeder', 'Neumann', 'Schwarz', 'Zimmermann', 'Braun', 'Krueger', 'Hofmann', 'Hartmann',
  'Lange', 'Schmitt', 'Werner', 'Schmitz', 'Krause', 'Meier'
];

const voucherTypes = ['Nachhaltig Shoppen', 'Bio Genuss', 'Oeko Lifestyle', 'Gruener Konsum'];
const voucherValues = [25, 50, 100];

function seededRandom(seed: number): () => number {
  return function() {
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
  const now = new Date();
  
  for (let i = 0; i < 28; i++) {
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
          generated: false,
        });
      }
    }
    
    // Determine stage distribution (more orders in earlier stages for realism)
    const stageWeights = [0.15, 0.2, 0.2, 0.15, 0.3];
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
    
    // Generate stage history
    const createdAt = new Date(now.getTime() - random() * 24 * 60 * 60 * 1000);
    const stageHistory: StageTimestamp[] = [];
    let currentTime = createdAt;
    
    for (let s = 0; s <= stageIndex; s++) {
      stageHistory.push({
        stage: STAGES[s].key,
        timestamp: new Date(currentTime),
        completed: s < stageIndex || currentStage === 'delivered',
      });
      currentTime = new Date(currentTime.getTime() + (random() * 30 + 5) * 60 * 1000);
    }
    
    // Mark codes as generated if past that stage
    if (stageIndex >= 2) {
      voucherCodes.forEach(code => code.generated = true);
    }
    
    // Flag some orders randomly
    const flagged = random() < 0.08;
    
    orders.push({
      id: `ORD-${String(10000 + i).slice(1)}`,
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

export default function VoucherFulfillmentPage() {
  const initialOrders = useMemo(() => generateOrders(), []);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(o => o.createdAt >= today);
    const pendingOrders = orders.filter(o => o.currentStage !== 'delivered');
    const completedToday = orders.filter(o => 
      o.currentStage === 'delivered' && 
      o.stageHistory.some(s => s.stage === 'delivered' && s.timestamp >= today)
    );
    
    const revenueToday = todayOrders.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.value * item.quantity, 0), 0
    );

    return {
      ordersToday: todayOrders.length,
      pendingFulfillment: pendingOrders.length,
      completedToday: completedToday.length,
      revenueToday,
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
    
    orders.forEach(order => {
      grouped[order.currentStage].push(order);
    });
    
    // Sort each stage by createdAt
    Object.keys(grouped).forEach(stage => {
      grouped[stage as FulfillmentStage].sort((a, b) => 
        b.createdAt.getTime() - a.createdAt.getTime()
      );
    });
    
    return grouped;
  }, [orders]);

  const advanceOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      
      const currentIndex = STAGE_INDEX[order.currentStage];
      if (currentIndex >= STAGES.length - 1) return order;
      
      const nextStage = STAGES[currentIndex + 1].key;
      const now = new Date();
      
      // Mark codes as generated when advancing to that stage
      const updatedCodes = nextStage === 'codes_generated' || STAGE_INDEX[nextStage] > 2
        ? order.voucherCodes.map(code => ({ ...code, generated: true }))
        : order.voucherCodes;
      
      return {
        ...order,
        currentStage: nextStage,
        voucherCodes: updatedCodes,
        stageHistory: [
          ...order.stageHistory.map(s => 
            s.stage === order.currentStage ? { ...s, completed: true } : s
          ),
          { stage: nextStage, timestamp: now, completed: nextStage === 'delivered' },
        ],
      };
    }));
  };

  const toggleFlag = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order;
      return {
        ...order,
        flagged: !order.flagged,
        flagReason: !order.flagged ? 'Manually flagged for review' : undefined,
      };
    }));
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
      <header className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: '#e5e5e3' }}>
        <div className="flex items-center justify-between">
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
              Voucher Fulfillment
            </span>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="flex-shrink-0 px-6 py-4 border-b" style={{ borderColor: '#e5e5e3' }}>
        <div className="flex gap-8">
          <div>
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: '#737373' }}>
              Orders Today
            </div>
            <div className="text-[24px] font-medium" style={{ color: '#191919' }}>
              {stats.ordersToday}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: '#737373' }}>
              Pending
            </div>
            <div className="text-[24px] font-medium" style={{ color: '#191919' }}>
              {stats.pendingFulfillment}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: '#737373' }}>
              Completed Today
            </div>
            <div className="text-[24px] font-medium" style={{ color: '#191919' }}>
              {stats.completedToday}
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide mb-1" style={{ color: '#737373' }}>
              Revenue Today
            </div>
            <div className="text-[24px] font-medium" style={{ color: '#191919' }}>
              {formatCurrency(stats.revenueToday)}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* Pipeline */}
        <div className="flex-1 flex overflow-x-auto">
          {STAGES.map((stage, index) => (
            <div
              key={stage.key}
              className="flex-1 min-w-[240px] flex flex-col border-r last:border-r-0"
              style={{ borderColor: '#e5e5e3' }}
            >
              {/* Stage header */}
              <div className="flex-shrink-0 px-4 py-3 border-b" style={{ borderColor: '#e5e5e3', backgroundColor: '#fafaf9' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[13px]" style={{ color: '#191919' }}>
                    {stage.label}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded" style={{ color: '#737373', backgroundColor: '#eeeeec' }}>
                    {ordersByStage[stage.key].length}
                  </span>
                </div>
              </div>

              {/* Orders in stage */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {ordersByStage[stage.key].map(order => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className="w-full text-left p-3 rounded transition-colors duration-150 ease-out"
                    style={{
                      backgroundColor: selectedOrderId === order.id ? '#eeeeec' : '#191919',
                      border: `1px solid ${selectedOrderId === order.id ? '#2563eb' : '#e5e5e3'}`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-[13px] font-medium" style={{ color: '#191919' }}>
                        {order.id}
                      </span>
                      {order.flagged && (
                        <AlertTriangle size={14} strokeWidth={1.5} style={{ color: '#d97706' }} />
                      )}
                    </div>
                    <div className="text-[13px] mb-1" style={{ color: '#191919' }}>
                      {order.customerName}
                    </div>
                    <div className="flex items-center justify-between text-[11px]" style={{ color: '#737373' }}>
                      <span>{getTotalQuantity(order)} voucher{getTotalQuantity(order) !== 1 ? 's' : ''}</span>
                      <span>{formatCurrency(getOrderTotal(order))}</span>
                    </div>
                    <div className="text-[11px] mt-1" style={{ color: '#737373' }}>
                      {formatTime(order.createdAt)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        {selectedOrder && (
          <div
            className="w-[400px] flex-shrink-0 border-l flex flex-col"
            style={{ borderColor: '#e5e5e3', backgroundColor: '#fafaf9' }}
          >
            {/* Panel header */}
            <div className="flex-shrink-0 px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#e5e5e3' }}>
              <span className="text-[15px] font-medium" style={{ color: '#191919' }}>
                {selectedOrder.id}
              </span>
              <button
                onClick={() => setSelectedOrderId(null)}
                className="p-1 rounded transition-opacity duration-150 ease-out hover:opacity-70"
                style={{ color: '#737373' }}
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Panel content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Customer info */}
              <section>
                <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: '#737373' }}>
                  Customer
                </div>
                <div className="text-[15px] mb-1" style={{ color: '#191919' }}>
                  {selectedOrder.customerName}
                </div>
                <div className="text-[13px]" style={{ color: '#737373' }}>
                  {selectedOrder.customerEmail}
                </div>
              </section>

              {/* Order items */}
              <section>
                <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: '#737373' }}>
                  Items
                </div>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded"
                      style={{ backgroundColor: '#eeeeec' }}
                    >
                      <div>
                        <div className="text-[13px]" style={{ color: '#191919' }}>
                          {item.type}
                        </div>
                        <div className="text-[11px]" style={{ color: '#737373' }}>
                          {formatCurrency(item.value)} x {item.quantity}
                        </div>
                      </div>
                      <div className="text-[13px]" style={{ color: '#191919' }}>
                        {formatCurrency(item.value * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t" style={{ borderColor: '#e5e5e3' }}>
                  <span className="text-[13px]" style={{ color: '#737373' }}>Total</span>
                  <span className="text-[15px] font-medium" style={{ color: '#191919' }}>
                    {formatCurrency(getOrderTotal(selectedOrder))}
                  </span>
                </div>
              </section>

              {/* Voucher codes */}
              <section>
                <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: '#737373' }}>
                  Voucher Codes
                </div>
                <div className="space-y-1">
                  {selectedOrder.voucherCodes.map((code, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded text-[13px]"
                      style={{ backgroundColor: '#eeeeec' }}
                    >
                      <span
                        style={{
                          color: code.generated ? '#191919' : '#737373',
                          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                          letterSpacing: '0.02em',
                        }}
                      >
                        {code.generated ? code.code : '---'}
                      </span>
                      <span style={{ color: '#737373' }}>
                        {formatCurrency(code.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Fulfillment timeline */}
              <section>
                <div className="text-[11px] uppercase tracking-wide mb-2" style={{ color: '#737373' }}>
                  Fulfillment Progress
                </div>
                <div className="space-y-2">
                  {STAGES.map((stage, index) => {
                    const historyEntry = selectedOrder.stageHistory.find(h => h.stage === stage.key);
                    const isActive = selectedOrder.currentStage === stage.key;
                    const isCompleted = historyEntry?.completed;
                    const isPending = !historyEntry;
                    
                    return (
                      <div
                        key={stage.key}
                        className="flex items-center gap-3 p-2 rounded"
                        style={{ backgroundColor: isActive ? '#eeeeec' : 'transparent' }}
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: isCompleted ? '#16a34a' : isActive ? '#2563eb' : '#e5e5e3',
                          }}
                        />
                        <div className="flex-1">
                          <div
                            className="text-[13px]"
                            style={{ color: isPending ? '#737373' : '#191919' }}
                          >
                            {stage.label}
                          </div>
                          {historyEntry && (
                            <div className="text-[11px]" style={{ color: '#737373' }}>
                              {formatDateTime(historyEntry.timestamp)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* Flag status */}
              {selectedOrder.flagged && (
                <section>
                  <div
                    className="p-3 rounded text-[13px]"
                    style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#d97706' }}
                  >
                    {selectedOrder.flagReason}
                  </div>
                </section>
              )}
            </div>

            {/* Panel actions */}
            <div className="flex-shrink-0 p-4 border-t space-y-2" style={{ borderColor: '#e5e5e3' }}>
              {selectedOrder.currentStage !== 'delivered' && (
                <button
                  onClick={() => advanceOrder(selectedOrder.id)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded text-[13px] font-medium transition-opacity duration-150 ease-out hover:opacity-80"
                  style={{ backgroundColor: '#2563eb', color: '#191919' }}
                >
                  Advance to {STAGES[STAGE_INDEX[selectedOrder.currentStage] + 1]?.label}
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              )}
              <button
                onClick={() => toggleFlag(selectedOrder.id)}
                className="w-full px-4 py-2 rounded text-[13px] transition-opacity duration-150 ease-out hover:opacity-80"
                style={{
                  backgroundColor: selectedOrder.flagged ? 'transparent' : '#eeeeec',
                  color: selectedOrder.flagged ? '#d97706' : '#737373',
                  border: selectedOrder.flagged ? '1px solid #d97706' : '1px solid transparent',
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
