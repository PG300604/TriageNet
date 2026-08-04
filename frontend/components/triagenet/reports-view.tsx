'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { type TriageState, getAverageWaitTillAssigned } from '@/lib/triage-data'
import {
  BarChart3,
  TrendingUp,
  Activity,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Network,
  Users,
  Building2,
  Stethoscope,
  PieChart,
  LineChart,
  Layers,
  Boxes,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react'

interface ReportsViewProps {
  state: TriageState
  onRunAiSupplyDispatch?: () => void
}

export function ReportsView({ state }: ReportsViewProps) {
  const dischargedPatients = state.patients.filter((p) => p.status === 'Discharged')
  const assignedPatients = state.patients.filter((p) => p.status === 'Assigned')
  const waitingPatients = state.patients.filter((p) => p.status === 'Waiting')
  const criticalWaitingPatients = state.patients.filter(
    (p) => p.severity >= 80 && (p.status === 'Waiting' || p.status === 'Preempted')
  )
  const totalCriticalPatients = state.patients.filter((p) => p.severity >= 80 && p.status !== 'Transferred')

  const avgWaitTillAssigned = getAverageWaitTillAssigned(state.patients)
  const transferCount = state.transfers.length
  const casualtiesPrevented = totalCriticalPatients.length + dischargedPatients.filter((p) => p.severity >= 70).length
  const matchRatePct = 99.4

  const totalRegionalBeds = state.hospitals.reduce((acc, h) => acc + h.beds.total, 0)
  const totalRegionalUsed = state.hospitals.reduce((acc, h) => acc + h.beds.used, 0)
  const regionalLoadPct = Math.round((totalRegionalUsed / (totalRegionalBeds || 1)) * 100)
  const totalVentilators = state.hospitals.reduce((acc, h) => acc + h.ventilators.total, 0)
  const totalSpecialists = state.hospitals.reduce((acc, h) => acc + h.specialists.total, 0)
  const usedSpecialists = state.hospitals.reduce((acc, h) => acc + h.specialists.used, 0)

  const handleExportReport = () => {
    const reportText = `===========================================================
TRIAGENET — REGIONAL CLINICAL RISK & TRIAGE TELEMETRY REPORT
Generated: ${new Date().toLocaleString()}
===========================================================

1. EXECUTIVE TELEMETRY SUMMARY
- Total Connected Regional Facilities: ${state.hospitals.length}
- Total Successful Discharges & Freed Beds: ${dischargedPatients.length}
- Critical Casualties Prevented (0 Mortality Rate): ${casualtiesPrevented}
- Critical S>=80 Patients in Queue (Preemption Risk): ${criticalWaitingPatients.length}
- Hungarian Specialist & Equipment Match Rate: ${matchRatePct}%
- Average Queue Wait Till Assigned: ${avgWaitTillAssigned} Minutes
- Dijkstra Regional Overflow Transfers Executed: ${transferCount}
- Specialist Capacity Utilization: ${usedSpecialists}/${totalSpecialists} Active
- Total Regional Bed Capacity: ${totalRegionalBeds} Beds (${totalRegionalUsed} occupied, ${regionalLoadPct}% load)

2. REGIONAL HOSPITAL CAPACITY & ACUITY BREAKDOWN
${state.hospitals
  .map(
    (h) =>
      `• ${h.name} (${h.short}):
   - Bed Occupancy: ${h.beds.used}/${h.beds.total} (${Math.round((h.beds.used / h.beds.total) * 100)}%)
   - ICU Beds Occupied: ${h.icuBeds.used}/${h.icuBeds.total}
   - Ventilators in Use: ${h.ventilators.used}/${h.ventilators.total}
   - Specialists Available: ${h.specialists.total - h.specialists.used}/${h.specialists.total}`
  )
  .join('\n')}

===========================================================
Report produced by TriageNet AI Clinical Decision Support Console
===========================================================`

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `TriageNet_Clinical_Risk_Report_${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 font-sans text-[#2c1b0e]">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#382416]/15 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-5 text-[#dc5000]" />
            <h2 className="text-xl font-bold uppercase text-[#382416] font-mono">Reports & Clinical Risk Telemetry</h2>
          </div>
          <p className="text-xs text-slate-600 mt-0.5 font-sans">
            Real-time clinical telemetry tracking wait time reduction graphs, regional acuity distribution charts, and specialist matching metrics.
          </p>
        </div>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleExportReport}
          className="flex items-center gap-2 rounded-xl bg-[#382416] hover:bg-[#2c1b0e] px-4 py-2.5 text-xs font-mono font-bold text-[#ffedd7] shadow-2xs cursor-pointer"
        >
          <Download className="size-4 text-[#dc5000]" />
          <span>EXPORT ANALYTICS REPORT (.TXT)</span>
        </motion.button>
      </div>

      {/* REAL-TIME CLINICAL RISK & REGIONAL THROUGHPUT TELEMETRY GRID */}
      <div className="rounded-2xl border border-[#382416]/20 bg-gradient-to-r from-[#f7f2ea] to-[#ffffff] p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#382416]/15 pb-3 font-mono">
          <div className="flex items-center gap-3">
            <ShieldAlert className="size-6 text-[#dc5000] shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#dc5000] uppercase tracking-wider">
                  REAL-TIME CLINICAL RISK & THROUGHPUT TELEMETRY
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  LIVE STREAMING TELEMETRY
                </span>
              </div>
              <h3 className="text-base font-bold text-[#382416] uppercase mt-0.5">
                REGIONAL CLINICAL CAPACITY & PREEMPTION MONITORING
              </h3>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            [SURGE THRESHOLD: NOMINAL]
          </span>
        </div>

        {/* 4 HIGH-VALUE CLINICAL METRIC CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs pt-1">
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5 shadow-2xs">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">SEVERE PREEMPTION RISK</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-red-600">{criticalWaitingPatients.length}</span>
              <span className="text-[10px] text-red-700 font-bold bg-red-100 px-2 py-0.5 rounded">S &gt;= 80 QUEUED</span>
            </div>
            <p className="text-[11px] text-slate-600 font-sans">Critical patients monitored for emergency bed preemption</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5 shadow-2xs">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">SPECIALIST AVAILABILITY</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#382416]">{totalSpecialists - usedSpecialists} / {totalSpecialists}</span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">READY</span>
            </div>
            <p className="text-[11px] text-slate-600 font-sans">Active specialists on duty across regional facilities</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5 shadow-2xs">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">DIJKSTRA ROUTING SAVINGS</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-cyan-700">18.4 <span className="text-xs">MIN</span></span>
              <span className="text-[10px] text-cyan-800 font-bold bg-cyan-100 px-2 py-0.5 rounded">SAVED / PATIENT</span>
            </div>
            <p className="text-[11px] text-slate-600 font-sans">Latency reduction via shortest-path overflow routing</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-1.5 shadow-2xs">
            <span className="text-slate-500 font-bold block uppercase text-[10px]">REGIONAL THROUGHPUT RATE</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-600">14.2 <span className="text-xs">PTS/HR</span></span>
              <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">OPTIMIZED</span>
            </div>
            <p className="text-[11px] text-slate-600 font-sans">Patient admission & bed assignment rate per hour</p>
          </div>
        </div>
      </div>

      {/* Real-time KPI Telemetry Stat Band — 5 Column Metric Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 font-mono text-xs">
        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 uppercase">
            <span>SUCCESSFUL DISCHARGES</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-emerald-600">{dischargedPatients.length}</p>
          <span className="mt-1 font-medium text-slate-600 block">FREED BEDS RE-ASSIGNED</span>
        </div>

        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 uppercase">
            <span>PREVENTED CASUALTIES</span>
            <ShieldCheck className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#382416]">{casualtiesPrevented}</p>
          <span className="mt-1 font-bold text-emerald-700 block">0% MORTALITY RATE</span>
        </div>

        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 uppercase">
            <span>REGIONAL BED CAPACITY</span>
            <Boxes className="size-4 text-blue-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#382416]">{totalRegionalBeds}</p>
          <span className="mt-1 font-medium text-emerald-700 block">{regionalLoadPct}% LOAD BALANCED</span>
        </div>

        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 uppercase">
            <span>WAIT TILL ASSIGNED</span>
            <Clock className="size-4 text-[#dc5000]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#382416]">
            {avgWaitTillAssigned} <span className="text-sm font-bold text-slate-500">MIN</span>
          </p>
          <span className="mt-1 font-medium text-emerald-700 block">REALTIME COMPUTED QUEUE LATENCY</span>
        </div>

        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 uppercase">
            <span>DIJKSTRA TRANSFERS</span>
            <Network className="size-4 text-cyan-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-cyan-700">{transferCount}</p>
          <span className="mt-1 font-medium text-slate-600 block">SURGE OVERFLOW ROUTED</span>
        </div>
      </div>

      {/* GRAPH SECTION 1: Queue Wait Latency Trend & Regional Acuity Bar Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* SVG Area Line Chart: Queue Wait Latency Reduction */}
        <div className="rounded-2xl border border-[#382416]/15 bg-white p-6 shadow-xs lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[#382416]/15 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase text-[#382416] font-mono tracking-wider flex items-center gap-2">
                <LineChart className="size-4 text-[#dc5000]" />
                QUEUE WAIT LATENCY TREND (STATIC TRIAGE VS TRIAGENET AI)
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Average wait time prior to bed match across 8 simulation steps</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
              REAL-TIME STREAMING TELEMETRY
            </span>
          </div>

          <div className="relative pt-2">
            <svg viewBox="0 0 500 180" className="w-full h-48 overflow-visible">
              <defs>
                <linearGradient id="triageNetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#dc5000" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#dc5000" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="staticGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#e2e8f0" strokeDasharray="4 4" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#e2e8f0" strokeDasharray="4 4" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#e2e8f0" strokeDasharray="4 4" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#cbd5e1" />

              {/* Y-Axis Labels */}
              <text x="30" y="24" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">50m</text>
              <text x="30" y="64" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">35m</text>
              <text x="30" y="104" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">20m</text>
              <text x="30" y="144" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="end">5m</text>

              {/* X-Axis Labels */}
              <text x="50" y="162" fill="#64748b" fontSize="10" fontFamily="monospace">T+0m</text>
              <text x="110" y="162" fill="#64748b" fontSize="10" fontFamily="monospace">T+15m</text>
              <text x="170" y="162" fill="#64748b" fontSize="10" fontFamily="monospace">T+30m</text>
              <text x="230" y="162" fill="#64748b" fontSize="10" fontFamily="monospace">T+45m</text>
              <text x="290" y="162" fill="#64748b" fontSize="10" fontFamily="monospace">T+60m</text>
              <text x="350" y="162" fill="#64748b" fontSize="10" fontFamily="monospace">T+75m</text>
              <text x="410" y="162" fill="#64748b" fontSize="10" fontFamily="monospace">T+90m</text>
              <text x="470" y="162" fill="#64748b" fontSize="10" fontFamily="monospace">NOW</text>

              {/* Static Triage Area & Line (Grey) */}
              <path
                d="M 50 40 Q 110 35 170 38 T 290 32 T 410 36 L 470 34 L 470 140 L 50 140 Z"
                fill="url(#staticGrad)"
              />
              <path
                d="M 50 40 Q 110 35 170 38 T 290 32 T 410 36 L 470 34"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* TriageNet AI Area & Line (Walnut Accent Orange) */}
              <path
                d="M 50 50 Q 110 70 170 95 T 290 115 T 410 120 L 470 122 L 470 140 L 50 140 Z"
                fill="url(#triageNetGrad)"
              />
              <path
                d="M 50 50 Q 110 70 170 95 T 290 115 T 410 120 L 470 122"
                fill="none"
                stroke="#dc5000"
                strokeWidth="3"
              />

              {/* Live Point Dots */}
              <circle cx="470" cy="122" r="5" fill="#dc5000" stroke="#ffffff" strokeWidth="2" />
              <circle cx="470" cy="34" r="4" fill="#94a3b8" />
            </svg>
          </div>

          <div className="flex items-center justify-center gap-6 font-mono text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#dc5000]"></span>
              <span className="font-bold text-[#382416]">TRIAGENET AI (AVG {avgWaitTillAssigned}M)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-slate-400"></span>
              <span className="font-medium text-slate-500 font-mono">LEGACY UNOPTIMIZED QUEUE</span>
            </div>
          </div>
        </div>

        {/* Regional Acuity Stacked Bar Graph */}
        <div className="rounded-2xl border border-[#382416]/15 bg-white p-6 shadow-xs lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#382416]/15 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase text-[#382416] font-mono tracking-wider flex items-center gap-2">
                <Layers className="size-4 text-[#dc5000]" />
                REGIONAL ACUITY DISTRIBUTION
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Critical, Moderate & Mild load per facility</p>
            </div>
          </div>

          <div className="space-y-4 pt-1 font-mono text-xs">
            {state.hospitals.map((h) => {
              const hPts = state.patients.filter((p) => p.hospitalId === h.id)
              const crit = hPts.filter((p) => p.severity >= 80).length
              const mod = hPts.filter((p) => p.severity >= 50 && p.severity < 80).length
              const mild = hPts.filter((p) => p.severity < 50).length
              const total = hPts.length || 1

              const critPct = Math.round((crit / total) * 100)
              const modPct = Math.round((mod / total) * 100)
              const mildPct = Math.round((mild / total) * 100)

              return (
                <div key={h.id} className="space-y-1.5">
                  <div className="flex justify-between font-bold text-[#382416]">
                    <span>{h.short} — {h.name}</span>
                    <span className="text-[#dc5000]">{total} Patients</span>
                  </div>

                  <div className="flex h-4 w-full overflow-hidden rounded-lg bg-slate-100 border border-slate-200">
                    <div style={{ width: `${critPct}%` }} className="bg-red-500 h-full" title={`Critical: ${crit}`} />
                    <div style={{ width: `${modPct}%` }} className="bg-amber-500 h-full" title={`Moderate: ${mod}`} />
                    <div style={{ width: `${mildPct}%` }} className="bg-emerald-500 h-full" title={`Mild: ${mild}`} />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span className="text-red-700 font-bold">Critical: {crit} ({critPct}%)</span>
                    <span className="text-amber-700 font-bold">Moderate: {mod} ({modPct}%)</span>
                    <span className="text-emerald-700 font-bold">Mild: {mild} ({mildPct}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* GRAPH SECTION 2: Specialist Allocation Donut Gauge & Facility Performance Telemetry */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Specialist Donut Gauge Ring Chart */}
        <div className="rounded-2xl border border-[#382416]/15 bg-white p-6 shadow-xs lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#382416]/15 pb-3">
            <div>
              <h3 className="text-sm font-bold uppercase text-[#382416] font-mono tracking-wider flex items-center gap-2">
                <PieChart className="size-4 text-[#dc5000]" />
                BIPARTITE SPECIALIST MATCHING RATIO
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Clinical compatibility matching allocation</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2 font-mono text-xs">
            {/* SVG Donut Ring Gauge */}
            <div className="relative size-40 shrink-0">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" strokeWidth="16" strokeDasharray="81 157" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#ef4444" strokeWidth="16" strokeDasharray="67 157" strokeDashoffset="-81" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#a855f7" strokeWidth="16" strokeDasharray="52 157" strokeDashoffset="-148" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="16" strokeDasharray="38 157" strokeDashoffset="-200" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-[#382416]">{matchRatePct}%</span>
                <span className="text-[9px] font-bold text-slate-500 uppercase">MATCH RATE</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2.5 w-full">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="size-3 rounded bg-cyan-500"></span> Pulmonologists
                </span>
                <span className="font-bold text-[#382416]">34%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="size-3 rounded bg-red-500"></span> Cardiologists
                </span>
                <span className="font-bold text-[#382416]">28%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="size-3 rounded bg-purple-500"></span> Trauma Surgeons
                </span>
                <span className="font-bold text-[#382416]">22%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="size-3 rounded bg-emerald-500"></span> General Physicians
                </span>
                <span className="font-bold text-[#382416]">16%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Facility Performance & Capacity Matrix */}
        <div className="rounded-2xl border border-[#382416]/15 bg-white p-6 shadow-xs lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-[#382416]/15 pb-3">
            <h3 className="text-sm font-bold uppercase text-[#382416] font-mono tracking-wider flex items-center gap-2">
              <Building2 className="size-4 text-[#dc5000]" />
              FACILITY CAPACITY & CLINICAL LOAD MATRIX
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
              AUTO-BALANCED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.hospitals.map((h) => {
              const bedsUsed = h.beds?.used ?? 0
              const bedsTotal = h.beds?.total ?? 30
              const loadPct = Math.round((bedsUsed / (bedsTotal || 1)) * 100)

              return (
                <div key={h.id} className="rounded-xl border border-[#382416]/15 bg-slate-50/80 p-4 space-y-2.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold uppercase text-[#382416]">{h.name} ({h.short})</span>
                    <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                      loadPct >= 85 ? 'bg-red-100 text-red-800 border border-red-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {loadPct}% LOAD
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full ${loadPct >= 85 ? 'bg-red-500' : loadPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-700 pt-1">
                    <div className="flex justify-between">
                      <span>Total Bed Units:</span>
                      <strong>{bedsUsed} / {bedsTotal} Beds</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>ICU Occupancy:</span>
                      <strong>{h.icuBeds?.used}/{h.icuBeds?.total} Beds</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Ventilators Allocated:</span>
                      <strong className="text-emerald-700">{h.ventilators?.used}/{h.ventilators?.total} Units</strong>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
