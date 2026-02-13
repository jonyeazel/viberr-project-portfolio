'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Check, AlertCircle, ChevronLeft } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// Fixed reference date to prevent SSR hydration mismatches
const REFERENCE_DATE = new Date('2026-02-11T12:00:00Z');

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

type DayType = 'workday' | 'weekend' | 'vacation' | 'sick' | 'comp' | 'holiday';

interface DayData {
  date: Date;
  hours: number;
  type: DayType;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  weeklyTarget: number;
  monthlyData: DayData[];
}

interface ImportRecord {
  id: string;
  date: Date;
  fileName: string;
  recordsImported: number;
  status: 'success' | 'partial' | 'failed';
  errors?: string[];
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateEmployees(): Employee[] {
  const employees = [
    { name: 'Markus Weber', role: 'Senior Developer' },
    { name: 'Anna Schmidt', role: 'Project Manager' },
    { name: 'Thomas Muller', role: 'Backend Developer' },
    { name: 'Sabine Fischer', role: 'UX Designer' },
    { name: 'Klaus Hoffmann', role: 'DevOps Engineer' },
    { name: 'Julia Becker', role: 'Frontend Developer' },
    { name: 'Stefan Wagner', role: 'QA Engineer' },
  ];

  return employees.map((emp, idx) => {
    const monthlyData: DayData[] = [];
    const today = REFERENCE_DATE;
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(today.getFullYear(), today.getMonth(), day);
      const dayOfWeek = date.getDay();
      const seed = idx * 1000 + day;
      const rand = seededRandom(seed);

      let type: DayType = 'workday';
      let hours = 0;

      if (dayOfWeek === 0 || dayOfWeek === 6) {
        type = 'weekend';
        if (rand > 0.92) {
          hours = Math.floor(rand * 3) + 2;
        }
      } else if (date > today) {
        type = 'workday';
        hours = 0;
      } else {
        const typeRand = seededRandom(seed + 500);
        if (typeRand > 0.96) {
          type = 'sick';
          hours = 0;
        } else if (typeRand > 0.91) {
          type = 'vacation';
          hours = 0;
        } else if (typeRand > 0.89) {
          type = 'comp';
          hours = 0;
        } else {
          type = 'workday';
          const baseHours = 8;
          const variation = (rand - 0.5) * 2.5;
          hours = Math.max(6.5, Math.min(9.5, baseHours + variation));
          hours = Math.round(hours * 2) / 2;
        }
      }

      monthlyData.push({ date, hours, type });
    }

    return {
      id: `emp-${idx}`,
      name: emp.name,
      role: emp.role,
      weeklyTarget: 40,
      monthlyData,
    };
  });
}

function generateImportHistory(): ImportRecord[] {
  const records: ImportRecord[] = [];
  const today = REFERENCE_DATE;

  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7 - Math.floor(seededRandom(i * 50) * 3));
    const seed = i * 100;
    const rand = seededRandom(seed);

    let status: 'success' | 'partial' | 'failed' = 'success';
    let errors: string[] | undefined;

    if (rand > 0.88) {
      status = 'failed';
      errors = ['Connection timeout to NGTeco device'];
    } else if (rand > 0.75) {
      status = 'partial';
      const skipCount = Math.floor(seededRandom(seed + 10) * 4) + 1;
      errors = [`${skipCount} records skipped: invalid badge ID`];
    }

    records.push({
      id: `import-${i}`,
      date,
      fileName: `ngteco_export_${date.toISOString().split('T')[0].replace(/-/g, '')}.csv`,
      recordsImported: status === 'failed' ? 0 : Math.floor(seededRandom(seed + 1) * 40) + 85,
      status,
      errors,
    });
  }

  return records;
}

function getCurrentWeekData(employee: Employee): DayData[] {
  const today = REFERENCE_DATE;
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return employee.monthlyData.filter((d) => {
    const date = new Date(d.date);
    date.setHours(0, 0, 0, 0);
    return date >= monday && date <= sunday;
  });
}

function getEmployeeStatus(employee: Employee): 'on-track' | 'behind' | 'over' {
  const weekData = getCurrentWeekData(employee);
  const today = REFERENCE_DATE;
  const dayOfWeek = today.getDay();
  const workdaysPassed = dayOfWeek === 0 ? 5 : Math.min(dayOfWeek, 5);
  const expectedHours = workdaysPassed * 8;
  const actualHours = weekData.reduce((sum, d) => sum + d.hours, 0);

  if (actualHours > expectedHours + 4) return 'over';
  if (actualHours < expectedHours - 4) return 'behind';
  return 'on-track';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
}

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const fullDayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getDayTypeColor = (type: DayType): string => {
  switch (type) {
    case 'vacation': return colors.primary;
    case 'sick': return colors.destructive;
    case 'comp': return colors.warning;
    case 'weekend': return colors.muted;
    default: return colors.success;
  }
};

const getDayTypeLabel = (type: DayType): string => {
  switch (type) {
    case 'vacation': return 'Vacation';
    case 'sick': return 'Sick';
    case 'comp': return 'Comp Time';
    case 'weekend': return 'Weekend';
    case 'holiday': return 'Holiday';
    default: return 'Workday';
  }
};

const getStatusColor = (status: 'on-track' | 'behind' | 'over'): string => {
  switch (status) {
    case 'over': return colors.warning;
    case 'behind': return colors.destructive;
    default: return colors.success;
  }
};

export default function TimeTrackingPage() {

  const employees = useMemo(() => generateEmployees(), []);
  const importHistory = useMemo(() => generateImportHistory(), []);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'imports'>('weekly');

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId) || employees[0];
  const weekData = getCurrentWeekData(selectedEmployee);

  const totalWeekHours = employees.reduce((sum, emp) => {
    const week = getCurrentWeekData(emp);
    return sum + week.reduce((s, d) => s + d.hours, 0);
  }, 0);

  const overtimeHours = employees.reduce((sum, emp) => {
    const week = getCurrentWeekData(emp);
    const weekTotal = week.reduce((s, d) => s + d.hours, 0);
    return sum + Math.max(0, weekTotal - 40);
  }, 0);

  const pendingImports = importHistory.filter((i) => i.status === 'partial').length;

  const weeklyChartData = weekData.map((d, idx) => ({
    day: dayNames[idx],
    hours: d.hours,
    type: d.type,
    target: idx < 5 ? 8 : 0,
  }));

  const weekActual = weekData.reduce((sum, d) => sum + d.hours, 0);
  const weekTarget = 40;
  const weekBalance = weekActual - weekTarget;

  const monthlyTotals = useMemo(() => {
    const data = selectedEmployee.monthlyData;
    return {
      totalHours: data.reduce((sum, d) => sum + d.hours, 0),
      workdays: data.filter((d) => d.type === 'workday' && d.hours > 0).length,
      vacation: data.filter((d) => d.type === 'vacation').length,
      sick: data.filter((d) => d.type === 'sick').length,
      comp: data.filter((d) => d.type === 'comp').length,
    };
  }, [selectedEmployee]);

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: colors.bg, color: colors.text }}>
      <header
        className="flex flex-wrap items-center justify-between gap-2 px-6 py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            onClick={(e) => { try { if (window.self !== window.top) { e.preventDefault(); window.parent.postMessage('close-preview', '*'); } } catch { e.preventDefault(); } }}
            className="flex items-center gap-2 text-[13px] transition-opacity hover:opacity-70"
            style={{ color: colors.muted }}
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <div className="w-px h-4" style={{ backgroundColor: colors.border }} />
          <span className="text-[15px] font-medium whitespace-nowrap">Time Tracking</span>
        </div>
        <div className="flex items-center gap-4 md:gap-8 text-sm flex-wrap">
          <div className="flex items-center gap-2">
            <span style={{ color: colors.muted }}>Employees</span>
            <span className="font-medium">{employees.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: colors.muted }}>Week Total</span>
            <span className="font-medium">{totalWeekHours.toFixed(1)}h</span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: colors.muted }}>Overtime</span>
            <span className="font-medium" style={{ color: overtimeHours > 0 ? colors.warning : colors.text }}>
              {overtimeHours.toFixed(1)}h
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ color: colors.muted }}>Pending</span>
            <span className="font-medium" style={{ color: pendingImports > 0 ? colors.warning : colors.text }}>
              {pendingImports}
            </span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={`w-full md:w-56 flex-shrink-0 overflow-y-auto ${selectedEmployeeId !== null ? 'hidden md:block' : 'block'}`}
          style={{ borderRight: `1px solid ${colors.border}`, backgroundColor: colors.surface }}
        >
          <div className="p-3">
            {employees.map((emp) => {
              const status = getEmployeeStatus(emp);
              const weekHours = getCurrentWeekData(emp).reduce((sum, d) => sum + d.hours, 0);
              const isSelected = emp.id === selectedEmployeeId;

              return (
                <button
                  key={emp.id}
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  className="w-full text-left px-3 py-2.5 rounded transition-colors"
                  style={{ backgroundColor: isSelected ? colors.surface2 : 'transparent' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{emp.name}</span>
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getStatusColor(status) }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs" style={{ color: colors.muted }}>{emp.role}</span>
                    <span className="text-xs tabular-nums" style={{ color: colors.muted }}>
                      {weekHours.toFixed(1)}h
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className={`flex-1 flex flex-col overflow-hidden ${selectedEmployeeId !== null ? 'block' : 'hidden md:block'}`}>
          <div className="flex gap-0 px-6 pt-3 flex-shrink-0 overflow-x-auto" style={{ borderBottom: `1px solid ${colors.border}`, scrollbarWidth: 'none' }}>
            {[
              { id: 'weekly', label: 'Weekly Overview' },
              { id: 'monthly', label: 'Monthly Report' },
              { id: 'imports', label: 'Import History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="pb-3 px-3 text-sm transition-colors relative whitespace-nowrap shrink-0"
                style={{ color: activeTab === tab.id ? colors.text : colors.muted }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: colors.text }} />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'weekly' && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setSelectedEmployeeId(null)}
                      className="md:hidden flex items-center gap-1 text-sm mb-2 transition-opacity hover:opacity-70"
                      style={{ color: colors.muted }}
                    >
                      <ChevronLeft size={16} />
                      Back to list
                    </button>
                    <div className="text-lg font-medium">{selectedEmployee.name}</div>
                    <div className="text-sm" style={{ color: colors.muted }}>{selectedEmployee.role}</div>
                  </div>
                  <div className="flex gap-8 text-right">
                    <div>
                      <div className="text-xl font-medium tabular-nums">{weekActual.toFixed(1)}h</div>
                      <div className="text-xs" style={{ color: colors.muted }}>Actual</div>
                    </div>
                    <div>
                      <div className="text-xl font-medium tabular-nums" style={{ color: colors.muted }}>{weekTarget}h</div>
                      <div className="text-xs" style={{ color: colors.muted }}>Target</div>
                    </div>
                    <div>
                      <div
                        className="text-xl font-medium tabular-nums"
                        style={{
                          color: weekBalance > 0 ? colors.warning : weekBalance < -4 ? colors.destructive : colors.success,
                        }}
                      >
                        {weekBalance >= 0 ? '+' : ''}{weekBalance.toFixed(1)}h
                      </div>
                      <div className="text-xs" style={{ color: colors.muted }}>Balance</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded" style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyChartData} barCategoryGap="25%">
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.border} vertical={false} />
                        <XAxis
                          dataKey="day"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: colors.muted, fontSize: 12 }}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: colors.muted, fontSize: 12 }}
                          domain={[0, 10]}
                          ticks={[0, 2, 4, 6, 8, 10]}
                          width={24}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: colors.surface2,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 4,
                            fontSize: 12,
                            padding: '8px 12px',
                          }}
                          labelStyle={{ color: colors.text, marginBottom: 4 }}
                          formatter={(value: number) => [`${value.toFixed(1)}h`, 'Hours']}
                        />
                        <Bar dataKey="hours" radius={[2, 2, 0, 0]}>
                          {weeklyChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getDayTypeColor(entry.type)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-5 mt-3 pt-3" style={{ borderTop: `1px solid ${colors.border}` }}>
                    {[
                      { type: 'workday' as DayType, label: 'Workday' },
                      { type: 'vacation' as DayType, label: 'Vacation' },
                      { type: 'sick' as DayType, label: 'Sick' },
                      { type: 'comp' as DayType, label: 'Comp' },
                    ].map((item) => (
                      <div key={item.type} className="flex items-center gap-2 text-xs">
                        <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: getDayTypeColor(item.type) }} />
                        <span style={{ color: colors.muted }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: colors.surface }}>
                        <th className="text-left p-3 font-medium text-xs" style={{ color: colors.muted }}>Day</th>
                        <th className="text-left p-3 font-medium text-xs" style={{ color: colors.muted }}>Date</th>
                        <th className="text-left p-3 font-medium text-xs" style={{ color: colors.muted }}>Type</th>
                        <th className="text-right p-3 font-medium text-xs" style={{ color: colors.muted }}>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {weekData.map((day, idx) => {
                        const today = REFERENCE_DATE;
                        const isToday = day.date.toDateString() === today.toDateString();
                        return (
                          <tr
                            key={idx}
                            style={{
                              borderTop: `1px solid ${colors.border}`,
                              backgroundColor: isToday ? colors.surface : colors.bg,
                            }}
                          >
                            <td className="p-3 font-medium">{dayNames[idx]}</td>
                            <td className="p-3 tabular-nums" style={{ color: colors.muted }}>{formatShortDate(day.date)}</td>
                            <td className="p-3">
                              <span style={{ color: getDayTypeColor(day.type) }}>{getDayTypeLabel(day.type)}</span>
                            </td>
                            <td className="p-3 text-right tabular-nums font-medium">
                              {day.hours > 0 ? `${day.hours.toFixed(1)}h` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'monthly' && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <button
                      onClick={() => setSelectedEmployeeId(null)}
                      className="md:hidden flex items-center gap-1 text-sm mb-2 transition-opacity hover:opacity-70"
                      style={{ color: colors.muted }}
                    >
                      <ChevronLeft size={16} />
                      Back to list
                    </button>
                    <div className="text-lg font-medium">{selectedEmployee.name}</div>
                    <div className="text-sm" style={{ color: colors.muted }}>
                      {REFERENCE_DATE.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-right">
                      <span style={{ color: colors.muted }}>Total </span>
                      <span className="font-medium tabular-nums">{monthlyTotals.totalHours.toFixed(1)}h</span>
                    </div>
                    <div className="text-right">
                      <span style={{ color: colors.muted }}>Workdays </span>
                      <span className="font-medium tabular-nums">{monthlyTotals.workdays}</span>
                    </div>
                    <div className="text-right">
                      <span style={{ color: colors.primary }}>Vacation </span>
                      <span className="font-medium tabular-nums">{monthlyTotals.vacation}</span>
                    </div>
                    <div className="text-right">
                      <span style={{ color: colors.destructive }}>Sick </span>
                      <span className="font-medium tabular-nums">{monthlyTotals.sick}</span>
                    </div>
                  </div>
                </div>

                <div className="rounded overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ backgroundColor: colors.surface }}>
                        <th className="text-left p-3 font-medium text-xs w-24" style={{ color: colors.muted }}>Date</th>
                        <th className="text-left p-3 font-medium text-xs w-28" style={{ color: colors.muted }}>Day</th>
                        <th className="text-left p-3 font-medium text-xs" style={{ color: colors.muted }}>Type</th>
                        <th className="text-right p-3 font-medium text-xs w-20" style={{ color: colors.muted }}>Hours</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedEmployee.monthlyData.map((day, idx) => {
                        const today = REFERENCE_DATE;
                        const isToday = day.date.toDateString() === today.toDateString();
                        const isFuture = day.date > today;
                        const dayOfWeek = day.date.getDay();

                        return (
                          <tr
                            key={idx}
                            style={{
                              borderTop: `1px solid ${colors.border}`,
                              backgroundColor: isToday ? colors.surface : colors.bg,
                              opacity: isFuture ? 0.5 : 1,
                            }}
                          >
                            <td className="p-3 tabular-nums" style={{ color: isToday ? colors.text : colors.muted }}>
                              {formatShortDate(day.date)}
                            </td>
                            <td className="p-3" style={{ color: day.type === 'weekend' ? colors.muted : colors.text }}>
                              {fullDayNames[dayOfWeek]}
                            </td>
                            <td className="p-3">
                              <span style={{ color: getDayTypeColor(day.type) }}>{getDayTypeLabel(day.type)}</span>
                            </td>
                            <td className="p-3 text-right tabular-nums font-medium">
                              {day.hours > 0 ? `${day.hours.toFixed(1)}h` : '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr style={{ borderTop: `1px solid ${colors.border}`, backgroundColor: colors.surface2 }}>
                        <td colSpan={3} className="p-3 font-medium">Total</td>
                        <td className="p-3 text-right tabular-nums font-medium">{monthlyTotals.totalHours.toFixed(1)}h</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'imports' && (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedEmployeeId(null)}
                  className="md:hidden flex items-center gap-1 text-sm mb-2 transition-opacity hover:opacity-70"
                  style={{ color: colors.muted }}
                >
                  <ChevronLeft size={16} />
                  Back to list
                </button>
                <div
                  className="p-4 rounded flex items-center justify-between"
                  style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
                >
                  <div>
                    <div className="text-sm font-medium">NGTeco CSV Import</div>
                    <div className="text-xs mt-1" style={{ color: colors.muted }}>
                      Last import: {formatDate(importHistory[0].date)} ({importHistory[0].recordsImported} records)
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ backgroundColor: colors.primary, color: 'var(--primary-foreground)' }}
                  >
                    <Upload size={16} />
                    Import
                  </button>
                </div>

                <div className="rounded overflow-x-auto" style={{ border: `1px solid ${colors.border}`, scrollbarWidth: 'none' }}>
                  <table className="w-full text-sm" style={{ minWidth: 520 }}>
                    <thead>
                      <tr style={{ backgroundColor: colors.surface }}>
                        <th className="text-left p-3 font-medium text-xs w-28" style={{ color: colors.muted }}>Date</th>
                        <th className="text-left p-3 font-medium text-xs" style={{ color: colors.muted }}>File</th>
                        <th className="text-left p-3 font-medium text-xs w-24" style={{ color: colors.muted }}>Records</th>
                        <th className="text-left p-3 font-medium text-xs w-24" style={{ color: colors.muted }}>Status</th>
                        <th className="text-left p-3 font-medium text-xs" style={{ color: colors.muted }}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importHistory.map((record, idx) => (
                        <tr key={record.id} style={{ borderTop: `1px solid ${colors.border}` }}>
                          <td className="p-3 tabular-nums" style={{ color: colors.muted }}>{formatDate(record.date)}</td>
                          <td className="p-3" style={{ color: colors.muted, fontFamily: 'ui-monospace, monospace', fontSize: 12 }}>
                            {record.fileName}
                          </td>
                          <td className="p-3 tabular-nums">{record.recordsImported}</td>
                          <td className="p-3">
                            <span
                              className="inline-flex items-center gap-1.5"
                              style={{
                                color:
                                  record.status === 'success'
                                    ? colors.success
                                    : record.status === 'partial'
                                      ? colors.warning
                                      : colors.destructive,
                              }}
                            >
                              {record.status === 'success' && <Check size={14} />}
                              {record.status !== 'success' && <AlertCircle size={14} />}
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-3" style={{ color: colors.muted }}>
                            {record.errors?.join(', ') || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
