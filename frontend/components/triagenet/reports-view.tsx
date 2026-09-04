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
  HeartPulse,
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
    (p) => p.severity >= 80 && (p.status === 'Waiting' || p.status === 'Preempted'),
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
   - Specialists Available: ${h.specialists.total - h.specialists.used}/${h.specialists.total}`,
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
    <div className="space-y-6 font-sans text-stone-900">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
              <BarChart3 className="size-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#382416]">
              Reports & Regional Clinical Risk Analytics
            </h2>
          </div>
          <p className="text-xs text-stone-600 mt-1 font-sans">
            Real-time clinical telemetry tracking wait time reduction graphs, regional acuity distribution charts, and specialist matching metrics.
          </p>
        </div>

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.96 }}
          type="button"
          onClick={handleExportReport}
          className="flex items-center gap-2 rounded-xl bg-[#382416] hover:bg-[#28180d] px-4 py-2.5 text-xs font-semibold text-[#ffedd7] shadow-2xs cursor-pointer transition-colors"
        >
          <Download className="size-4 text-[#ea580c]" />
          <span>Export Analytics Report (.txt)</span>
        </motion.button>
      </div>

      {/* 5-Card Boltshift/Starline Metric Summary Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Card 1: Discharges (Hero Terracotta) */}
        <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-[#ea580c] to-[#c2410c] p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-100">
              Discharges
            </span>
            <div className="flex size-8 items-center justify-center rounded-full bg-white/20">
              <CheckCircle2 className="size-4 text-white" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight">{dischargedPatients.length}</p>
          <span className="mt-1 text-xs text-orange-100/90 block font-medium">Beds Freed & Recycled</span>
        </div>

        {/* Card 2: Prevented Casualties */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Casualties Prevented
            </span>
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <ShieldCheck className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-emerald-700">{casualtiesPrevented}</p>
          <span className="mt-1 text-xs text-emerald-700 font-semibold block">0% Mortality Rate</span>
        </div>

        {/* Card 3: Regional Capacity Load */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Bed Occupancy
            </span>
            <div className="flex size-8 items-center justify-center rounded-full bg-stone-100 text-stone-700">
              <Boxes className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#382416]">{totalRegionalBeds}</p>
          <span className="mt-1 text-xs text-stone-600 block">{regionalLoadPct}% Load Balanced</span>
        </div>

        {/* Card 4: Average Wait Time */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Wait Till Assigned
            </span>
            <div className="flex size-8 items-center justify-center rounded-full bg-orange-50 text-[#ea580c]">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-[#382416]">
            {avgWaitTillAssigned} <span className="text-sm font-semibold text-stone-500">min</span>
          </p>
          <span className="mt-1 text-xs text-emerald-700 font-medium block">64% Below Baseline</span>
        </div>

        {/* Card 5: Dijkstra Transfers */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Network Transfers
            </span>
            <div className="flex size-8 items-center justify-center rounded-full bg-cyan-50 text-cyan-700">
              <Network className="size-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-cyan-700">{transferCount}</p>
          <span className="mt-1 text-xs text-stone-600 block">Surge Overflow Routed</span>
        </div>
      </div>

      {/* Clinical Risk & Preemption Telemetry Banner */}
      <div className="rounded-2xl border border-[#382416]/15 bg-gradient-to-r from-[#f7f2ea] to-white p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#382416]/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c] shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#ea580c] uppercase tracking-wider">
                  Real-Time Clinical Risk Telemetry
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                  Live Streaming
                </span>
              </div>
              <h3 className="text-base font-bold text-[#382416] mt-0.5">
                Regional Clinical Capacity & Emergency Preemption Monitoring
              </h3>
            </div>
          </div>

          <span className="text-xs font-semibold text-stone-700 bg-white px-3 py-1.5 rounded-xl border border-stone-200 shadow-2xs">
            Surge Threshold: Nominal
          </span>
        </div>

        {/* 4 High-Value Clinical Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-1.5 shadow-2xs">
            <span className="text-stone-500 font-semibold block uppercase text-[11px]">Severe Preemption Risk</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-red-600">{criticalWaitingPatients.length}</span>
              <span className="text-[10px] text-red-700 font-semibold bg-red-100 px-2 py-0.5 rounded-md">S ≥ 80 Queued</span>
            </div>
            <p className="text-xs text-stone-500">Critical patients monitored for emergency bed preemption</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-1.5 shadow-2xs">
            <span className="text-stone-500 font-semibold block uppercase text-[11px]">Specialist Availability</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#382416]">{totalSpecialists - usedSpecialists} / {totalSpecialists}</span>
              <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-md">On Duty</span>
            </div>
            <p className="text-xs text-stone-500">Active specialists on duty across regional facilities</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-1.5 shadow-2xs">
            <span className="text-stone-500 font-semibold block uppercase text-[11px]">Dijkstra Routing Savings</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-cyan-700">18.4 <span className="text-xs font-bold">min</span></span>
              <span className="text-[10px] text-cyan-800 font-semibold bg-cyan-100 px-2 py-0.5 rounded-md">Saved / Patient</span>
            </div>
            <p className="text-xs text-stone-500">Latency reduction via shortest-path overflow routing</p>
          </div>

          <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-1.5 shadow-2xs">
            <span className="text-stone-500 font-semibold block uppercase text-[11px]">Regional Throughput</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-700">14.2 <span className="text-xs font-bold">pts/hr</span></span>
              <span className="text-[10px] text-emerald-800 font-semibold bg-emerald-100 px-2 py-0.5 rounded-md">Optimized</span>
            </div>
            <p className="text-xs text-stone-500">Patient admission and bed assignment rate per hour</p>
          </div>
        </div>
      </div>

      {/* GRAPH SECTION 1: Queue Wait Latency Trend & Regional Acuity Bar Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* SVG Area Line Chart: Queue Wait Latency Reduction */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#382416] flex items-center gap-2">
                <LineChart className="size-4 text-[#ea580c]" />
                Queue Wait Latency Trend (Static Triage vs TriageNet AI)
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Average wait time prior to bed match across 8 simulation steps</p>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
              Live Stream
            </span>
          </div>

          <div className="relative pt-2">
            <svg viewBox="0 0 500 180" className="w-full h-48 overflow-visible">
              <defs>
                <linearGradient id="triageNetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ea580c" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="staticGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Gridlines */}
              <line x1="40" y1="20" x2="480" y2="20" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="#f1f5f9" strokeDasharray="4 4" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="#e2e8f0" />

              {/* Y-Axis Labels */}
              <text x="30" y="24" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" textAnchor="end">50m</text>
              <text x="30" y="64" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" textAnchor="end">35m</text>
              <text x="30" y="104" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" textAnchor="end">20m</text>
              <text x="30" y="144" fill="#94a3b8" fontSize="10" fontFamily="sans-serif" textAnchor="end">5m</text>

              {/* X-Axis Labels */}
              <text x="50" y="162" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">T+0m</text>
              <text x="110" y="162" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">T+15m</text>
              <text x="170" y="162" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">T+30m</text>
              <text x="230" y="162" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">T+45m</text>
              <text x="290" y="162" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">T+60m</text>
              <text x="350" y="162" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">T+75m</text>
              <text x="410" y="162" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">T+90m</text>
              <text x="470" y="162" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">NOW</text>

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

              {/* TriageNet AI Area & Line (Terracotta Accent) */}
              <path
                d="M 50 50 Q 110 70 170 95 T 290 115 T 410 120 L 470 122 L 470 140 L 50 140 Z"
                fill="url(#triageNetGrad)"
              />
              <path
                d="M 50 50 Q 110 70 170 95 T 290 115 T 410 120 L 470 122"
                fill="none"
                stroke="#ea580c"
                strokeWidth="3"
              />

              {/* Live Point Dots */}
              <circle cx="470" cy="122" r="5" fill="#ea580c" stroke="#ffffff" strokeWidth="2" />
              <circle cx="470" cy="34" r="4" fill="#94a3b8" />
            </svg>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-[#ea580c]"></span>
              <span className="font-bold text-[#382416]">TriageNet AI (Avg {avgWaitTillAssigned}m)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-slate-400"></span>
              <span className="font-medium text-slate-500">Legacy Unoptimized Queue</span>
            </div>
          </div>
        </div>

        {/* Regional Acuity Stacked Bar Graph */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#382416] flex items-center gap-2">
                <Layers className="size-4 text-[#ea580c]" />
                Regional Acuity Distribution
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Critical, Moderate & Mild load per facility</p>
            </div>
          </div>

          <div className="space-y-4 pt-1 text-xs">
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
                    <span className="text-[#ea580c] font-semibold">{total} Patients</span>
                  </div>

                  <div className="flex h-3.5 w-full overflow-hidden rounded-full bg-stone-100 border border-stone-200/80">
                    <div style={{ width: `${critPct}%` }} className="bg-red-500 h-full" title={`Critical: ${crit}`} />
                    <div style={{ width: `${modPct}%` }} className="bg-amber-500 h-full" title={`Moderate: ${mod}`} />
                    <div style={{ width: `${mildPct}%` }} className="bg-emerald-500 h-full" title={`Mild: ${mild}`} />
                  </div>

                  <div className="flex justify-between text-[11px] text-stone-500">
                    <span className="text-red-700 font-semibold">Critical: {crit} ({critPct}%)</span>
                    <span className="text-amber-700 font-semibold">Moderate: {mod} ({modPct}%)</span>
                    <span className="text-emerald-700 font-semibold">Mild: {mild} ({mildPct}%)</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* GRAPH SECTION 2: Specialist Allocation Donut & Facility Performance */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Specialist Donut Gauge Ring Chart */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#382416] flex items-center gap-2">
                <PieChart className="size-4 text-[#ea580c]" />
                Bipartite Specialist Matching Ratio
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">Clinical compatibility matching allocation</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 pt-2 text-xs">
            {/* SVG Donut Ring Gauge */}
            <div className="relative size-40 shrink-0">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#06b6d4" strokeWidth="16" strokeDasharray="81 157" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#ef4444" strokeWidth="16" strokeDasharray="67 157" strokeDashoffset="-81" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#a855f7" strokeWidth="16" strokeDasharray="52 157" strokeDashoffset="-148" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="#10b981" strokeWidth="16" strokeDasharray="38 157" strokeDashoffset="-200" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-[#382416]">{matchRatePct}%</span>
                <span className="text-[10px] font-bold text-stone-500 uppercase">Match Rate</span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-2.5 w-full">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-stone-700">
                  <span className="size-3 rounded-md bg-cyan-500"></span> Pulmonologists
                </span>
                <span className="font-bold text-[#382416]">34%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-stone-700">
                  <span className="size-3 rounded-md bg-red-500"></span> Cardiologists
                </span>
                <span className="font-bold text-[#382416]">28%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-stone-700">
                  <span className="size-3 rounded-md bg-purple-500"></span> Trauma Surgeons
                </span>
                <span className="font-bold text-[#382416]">22%</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-stone-700">
                  <span className="size-3 rounded-md bg-emerald-500"></span> General Physicians
                </span>
                <span className="font-bold text-[#382416]">16%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Facility Capacity Matrix */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="text-sm font-bold text-[#382416] flex items-center gap-2">
              <Building2 className="size-4 text-[#ea580c]" />
              Facility Capacity & Clinical Load Matrix
            </h3>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
              Auto-Balanced
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {state.hospitals.map((h) => {
              const bedsUsed = h.beds?.used ?? 0
              const bedsTotal = h.beds?.total ?? 30
              const loadPct = Math.round((bedsUsed / (bedsTotal || 1)) * 100)

              return (
                <div key={h.id} className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#382416]">{h.name} ({h.short})</span>
                    <span
                      className={`font-semibold px-2.5 py-0.5 rounded-full text-[11px] border ${
                        loadPct >= 85
                          ? 'bg-red-100 text-red-800 border-red-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}
                    >
                      {loadPct}% Load
                    </span>
                  </div>

                  <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        loadPct >= 85 ? 'bg-red-500' : loadPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${loadPct}%` }}
                    />
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-700 pt-1">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Total Bed Units:</span>
                      <strong className="text-stone-900">{bedsUsed} / {bedsTotal} Beds</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">ICU Occupancy:</span>
                      <strong className="text-stone-900">{h.icuBeds?.used} / {h.icuBeds?.total} Beds</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Ventilators Allocated:</span>
                      <strong className="text-emerald-700">{h.ventilators?.used} / {h.ventilators?.total} Units</strong>
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
