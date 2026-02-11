'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Upload, Check, AlertCircle, Clock } from 'lucide-react';
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

// Design system colors
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

// Day types
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

// Seed-based random for consistent data
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// Generate employees with realistic German names
function generateEmployees(): Employee[] {
  const employees = [
    { name: 'Markus Weber', role: 'Senior Developer' },
    { name: 'Anna Schmidt', role: 'Project Manager' },
    { name: 'Thomas Müller', role: 'Backend Developer' },
    { name: 'Sabine Fischer', role: 'UX Designer' },
    { name: 'Klaus Hoffmann', role: 'DevOps Engineer' },
    { name: 'Julia Becker', role: 'Frontend Developer' },
    { name: 'Stefan Wagner', role: 'QA Engineer' },
  ];

  return employees.map((emp, idx) => {
    const monthlyData: DayData[] = [];
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
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
        // Occasional weekend work
        if (rand > 0.9) {
          hours = Math.floor(rand * 4) + 2;
        }
      } else if (date > today) {
        // Future days
        type = 'workday';
        hours = 0;
      } else {
        // Past workdays
        const typeRand = seededRandom(seed + 500);
        if (typeRand > 0.95) {
          type = 'sick';
          hours = 0;
        } else if (typeRand > 0.9) {
          type = 'vacation';
          hours = 0;
        } else if (typeRand > 0.88) {
          type = 'comp';
          hours = 0;
        } else {
          type = 'workday';
          // Normal work hours with some variation
          const baseHours = 8;
          const variation = (rand - 0.5) * 3;
          hours = Math.max(6, Math.min(10, baseHours + variation));
          hours = Math.round(hours * 2) / 2; // Round to half hours
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

// Generate import history
function generateImportHistory(): ImportRecord[] {
  const records: ImportRecord[] = [];
  const today = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i * 7);
    const seed = i * 100;
    const rand = seededRandom(seed);

    let status: 'success' | 'partial' | 'failed' = 'success';
    let errors: string[] | undefined;

    if (rand > 0.9) {
      status = 'failed';
      errors = ['Connection timeout to NGTeco device', 'Retry scheduled'];
    } else if (rand > 0.8) {
      status = 'partial';
      errors = ['2 records skipped: invalid badge ID'];
    }

    records.push({
      id: `import-${i}`,
      date,
      fileName: `ngteco_export_${date.toISOString().split('T')[0].replace(/-/g, '')}.csv`,
      recordsImported: status === 'failed' ? 0 : Math.floor(seededRandom(seed + 1) * 50) + 80,
      status,
      errors,
    });
  }

  return records;
}

// Get current week data for an employee
function getCurrentWeekData(employee: Employee): DayData[] {
  const today = new Date();
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

// Calculate employee status
function getEmployeeStatus(employee: Employee): 'on-track' | 'behind' | 'over' {
  const weekData = getCurrentWeekData(employee);
  const today = new Date();
  const dayOfWeek = today.getDay();
  const workdaysPassed = dayOfWeek === 0 ? 5 : Math.min(dayOfWeek, 5);
  const expectedHours = workdaysPassed * 8;
  const actualHours = weekData.reduce((sum, d) => sum + d.hours, 0);

  if (actualHours > expectedHours + 4) return 'over';
  if (actualHours < expectedHours - 4) return 'behind';
  return 'on-track';
}

// Format date
function formatDate(date: Date): string {
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// Day names
const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TimeTrackingPage() {
  const employees = useMemo(() => generateEmployees(), []);
  const importHistory = useMemo(() => generateImportHistory(), []);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(employees[0].id);
  const [activeTab, setActiveTab] = useState<'weekly' | 'monthly' | 'imports'>('weekly');

  const selectedEmployee = employees.find((e) => e.id === selectedEmployeeId)!;
  const weekData = getCurrentWeekData(selectedEmployee);

  // Summary stats
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

  // Weekly chart data
  const weeklyChartData = weekData.map((d, idx) => ({
    day: dayNames[idx],
    hours: d.hours,
    type: d.type,
    target: idx < 5 ? 8 : 0,
  }));

  const weekActual = weekData.reduce((sum, d) => sum + d.hours, 0);
  const weekTarget = 40;
  const weekBalance = weekActual - weekTarget;

  // Day type colors
  const getDayTypeColor = (type: DayType): string => {
    switch (type) {
      case 'vacation':
        return colors.blue;
      case 'sick':
        return colors.red;
      case 'comp':
        return colors.amber;
      case 'weekend':
        return colors.muted;
      default:
        return colors.green;
    }
  };

  // Status color
  const getStatusColor = (status: 'on-track' | 'behind' | 'over'): string => {
    switch (status) {
      case 'over':
        return colors.amber;
      case 'behind':
        return colors.red;
      default:
        return colors.green;
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
            style={{ color: colors.muted }}
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1 className="text-lg font-medium">Time Tracking</h1>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span style={{ color: colors.muted }}>Employees</span>
            <span className="ml-2 font-medium">{employees.length}</span>
          </div>
          <div>
            <span style={{ color: colors.muted }}>Week Total</span>
            <span className="ml-2 font-medium">{totalWeekHours.toFixed(1)}h</span>
          </div>
          <div>
            <span style={{ color: colors.muted }}>Overtime</span>
            <span className="ml-2 font-medium" style={{ color: overtimeHours > 0 ? colors.amber : colors.text }}>
              {overtimeHours.toFixed(1)}h
            </span>
          </div>
          <div>
            <span style={{ color: colors.muted }}>Pending</span>
            <span className="ml-2 font-medium" style={{ color: pendingImports > 0 ? colors.amber : colors.text }}>
              {pendingImports}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Employee list */}
        <aside
          className="w-64 flex-shrink-0 overflow-y-auto"
          style={{ borderRight: `1px solid ${colors.border}`, backgroundColor: colors.surface }}
        >
          <div className="p-4">
            <div className="text-xs uppercase tracking-wide mb-3" style={{ color: colors.muted }}>
              Employees
            </div>
            <div className="space-y-1">
              {employees.map((emp) => {
                const status = getEmployeeStatus(emp);
                const weekHours = getCurrentWeekData(emp).reduce((sum, d) => sum + d.hours, 0);
                const isSelected = emp.id === selectedEmployeeId;

                return (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployeeId(emp.id)}
                    className="w-full text-left p-3 rounded transition-colors"
                    style={{
                      backgroundColor: isSelected ? colors.surface2 : 'transparent',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{emp.name}</span>
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getStatusColor(status) }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs" style={{ color: colors.muted }}>
                        {emp.role}
                      </span>
                      <span className="text-xs" style={{ color: colors.muted }}>
                        {weekHours.toFixed(1)}h
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main area */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <div className="flex gap-6 px-6 pt-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
            {[
              { id: 'weekly', label: 'Weekly Overview' },
              { id: 'monthly', label: 'Monthly Report' },
              { id: 'imports', label: 'Import History' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="pb-3 text-sm transition-colors relative"
                style={{
                  color: activeTab === tab.id ? colors.text : colors.muted,
                }}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-px"
                    style={{ backgroundColor: colors.text }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'weekly' && (
              <div className="space-y-6">
                {/* Employee info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-medium">{selectedEmployee.name}</h2>
                    <p className="text-sm mt-1" style={{ color: colors.muted }}>
                      {selectedEmployee.role}
                    </p>
                  </div>
                  <div className="flex gap-8 text-right">
                    <div>
                      <div className="text-2xl font-medium">{weekActual.toFixed(1)}h</div>
                      <div className="text-xs" style={{ color: colors.muted }}>
                        Actual
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-medium" style={{ color: colors.muted }}>
                        {weekTarget}h
                      </div>
                      <div className="text-xs" style={{ color: colors.muted }}>
                        Target
                      </div>
                    </div>
                    <div>
                      <div
                        className="text-2xl font-medium"
                        style={{
                          color:
                            weekBalance > 0
                              ? colors.amber
                              : weekBalance < -4
                                ? colors.red
                                : colors.green,
                        }}
                      >
                        {weekBalance >= 0 ? '+' : ''}
                        {weekBalance.toFixed(1)}h
                      </div>
                      <div className="text-xs" style={{ color: colors.muted }}>
                        Balance
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart */}
                <div
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
                >
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={weeklyChartData} barCategoryGap="20%">
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={colors.border}
                          vertical={false}
                        />
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
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: colors.surface2,
                            border: `1px solid ${colors.border}`,
                            borderRadius: 4,
                            fontSize: 12,
                          }}
                          labelStyle={{ color: colors.text }}
                          itemStyle={{ color: colors.muted }}
                          formatter={(value: number, name: string) => [
                            `${value.toFixed(1)}h`,
                            name === 'hours' ? 'Hours' : 'Target',
                          ]}
                        />
                        <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                          {weeklyChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={getDayTypeColor(entry.type)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex gap-6 mt-4 pt-4" style={{ borderTop: `1px solid ${colors.border}` }}>
                    {[
                      { type: 'workday', label: 'Workday' },
                      { type: 'vacation', label: 'Vacation' },
                      { type: 'sick', label: 'Sick' },
                      { type: 'comp', label: 'Comp Time' },
                    ].map((item) => (
                      <div key={item.type} className="flex items-center gap-2 text-xs">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: getDayTypeColor(item.type as DayType) }}
                        />
                        <span style={{ color: colors.muted }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'monthly' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium">{selectedEmployee.name}</h2>
                  <div className="text-sm" style={{ color: colors.muted }}>
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* Calendar grid */}
                <div
                  className="rounded-lg overflow-hidden"
                  style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
                >
                  {/* Header */}
                  <div
                    className="grid grid-cols-7 text-xs"
                    style={{ borderBottom: `1px solid ${colors.border}` }}
                  >
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                      <div
                        key={day}
                        className="p-3 text-center"
                        style={{ color: colors.muted }}
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Days */}
                  <div className="grid grid-cols-7">
                    {(() => {
                      const today = new Date();
                      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                      const startOffset = (firstDay.getDay() + 6) % 7;
                      const cells: React.ReactNode[] = [];

                      // Empty cells before first day
                      for (let i = 0; i < startOffset; i++) {
                        cells.push(
                          <div
                            key={`empty-${i}`}
                            className="p-3 min-h-[72px]"
                            style={{ borderBottom: `1px solid ${colors.border}`, borderRight: `1px solid ${colors.border}` }}
                          />
                        );
                      }

                      // Day cells
                      selectedEmployee.monthlyData.forEach((dayData, idx) => {
                        const isToday =
                          dayData.date.toDateString() === today.toDateString();
                        const isFuture = dayData.date > today;

                        cells.push(
                          <div
                            key={idx}
                            className="p-3 min-h-[72px]"
                            style={{
                              borderBottom: `1px solid ${colors.border}`,
                              borderRight: `1px solid ${colors.border}`,
                              backgroundColor: isToday ? colors.surface2 : 'transparent',
                            }}
                          >
                            <div className="flex items-center justify-between">
                              <span
                                className="text-sm"
                                style={{ color: isFuture ? colors.muted : colors.text }}
                              >
                                {dayData.date.getDate()}
                              </span>
                              {dayData.type !== 'workday' && dayData.type !== 'weekend' && (
                                <span
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: getDayTypeColor(dayData.type) }}
                                />
                              )}
                            </div>
                            {dayData.hours > 0 && (
                              <div
                                className="text-xs mt-2"
                                style={{ color: getDayTypeColor(dayData.type) }}
                              >
                                {dayData.hours.toFixed(1)}h
                              </div>
                            )}
                            {dayData.type === 'vacation' && (
                              <div className="text-xs mt-2" style={{ color: colors.blue }}>
                                Vacation
                              </div>
                            )}
                            {dayData.type === 'sick' && (
                              <div className="text-xs mt-2" style={{ color: colors.red }}>
                                Sick
                              </div>
                            )}
                            {dayData.type === 'comp' && (
                              <div className="text-xs mt-2" style={{ color: colors.amber }}>
                                Comp
                              </div>
                            )}
                          </div>
                        );
                      });

                      return cells;
                    })()}
                  </div>

                  {/* Summary */}
                  <div
                    className="p-4 flex gap-8"
                    style={{ borderTop: `1px solid ${colors.border}`, backgroundColor: colors.surface2 }}
                  >
                    <div>
                      <span className="text-xs" style={{ color: colors.muted }}>
                        Total Hours
                      </span>
                      <span className="ml-2 font-medium">
                        {selectedEmployee.monthlyData.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h
                      </span>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: colors.muted }}>
                        Workdays
                      </span>
                      <span className="ml-2 font-medium">
                        {selectedEmployee.monthlyData.filter((d) => d.type === 'workday' && d.hours > 0).length}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: colors.muted }}>
                        Vacation
                      </span>
                      <span className="ml-2 font-medium">
                        {selectedEmployee.monthlyData.filter((d) => d.type === 'vacation').length}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs" style={{ color: colors.muted }}>
                        Sick Days
                      </span>
                      <span className="ml-2 font-medium">
                        {selectedEmployee.monthlyData.filter((d) => d.type === 'sick').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'imports' && (
              <div className="space-y-6">
                {/* Import action */}
                <div
                  className="p-4 rounded-lg flex items-center justify-between"
                  style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: colors.surface2 }}
                    >
                      <Clock size={20} style={{ color: colors.muted }} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">NGTeco CSV Import</div>
                      <div className="text-xs mt-1" style={{ color: colors.muted }}>
                        Last import: {formatDate(importHistory[0].date)} - {importHistory[0].recordsImported} records
                      </div>
                    </div>
                  </div>
                  <button
                    className="flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ backgroundColor: colors.blue, color: colors.bg }}
                  >
                    <Upload size={16} />
                    Process Import
                  </button>
                </div>

                {/* Import history table */}
                <div
                  className="rounded-lg overflow-hidden"
                  style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <th
                          className="text-left p-4 font-medium text-xs uppercase tracking-wide"
                          style={{ color: colors.muted }}
                        >
                          Date
                        </th>
                        <th
                          className="text-left p-4 font-medium text-xs uppercase tracking-wide"
                          style={{ color: colors.muted }}
                        >
                          File
                        </th>
                        <th
                          className="text-left p-4 font-medium text-xs uppercase tracking-wide"
                          style={{ color: colors.muted }}
                        >
                          Records
                        </th>
                        <th
                          className="text-left p-4 font-medium text-xs uppercase tracking-wide"
                          style={{ color: colors.muted }}
                        >
                          Status
                        </th>
                        <th
                          className="text-left p-4 font-medium text-xs uppercase tracking-wide"
                          style={{ color: colors.muted }}
                        >
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {importHistory.map((record, idx) => (
                        <tr
                          key={record.id}
                          style={{
                            borderBottom:
                              idx < importHistory.length - 1 ? `1px solid ${colors.border}` : undefined,
                          }}
                        >
                          <td className="p-4">{formatDate(record.date)}</td>
                          <td className="p-4" style={{ color: colors.muted }}>
                            {record.fileName}
                          </td>
                          <td className="p-4">{record.recordsImported}</td>
                          <td className="p-4">
                            <span
                              className="inline-flex items-center gap-1.5"
                              style={{
                                color:
                                  record.status === 'success'
                                    ? colors.green
                                    : record.status === 'partial'
                                      ? colors.amber
                                      : colors.red,
                              }}
                            >
                              {record.status === 'success' && <Check size={14} />}
                              {record.status === 'partial' && <AlertCircle size={14} />}
                              {record.status === 'failed' && <AlertCircle size={14} />}
                              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4" style={{ color: colors.muted }}>
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
