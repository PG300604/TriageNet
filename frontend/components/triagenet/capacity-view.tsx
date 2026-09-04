'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { type TriageState, getAverageWaitTillAssigned } from '@/lib/triage-data'
import {
  Building2,
  BedDouble,
  AlertTriangle,
  TrendingUp,
  Play,
  Pause,
  FastForward,
  Activity,
  Clock,
  Wind,
  ShieldCheck,
  Stethoscope,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface CapacityViewProps {
  state: TriageState
  selectedHospitalId: string
  onSelectHospital: (id: string) => void
  onNavigateView?: (view: string) => void
  isPlaying?: boolean
  onTogglePlay?: () => void
  onFastForward?: (stepMinutes: number) => void
}

export function CapacityView({
  state,
  selectedHospitalId,
  onSelectHospital,
  onNavigateView,
  isPlaying = false,
  onTogglePlay,
  onFastForward,
}: CapacityViewProps) {
  const selectedHospital = state.hospitals.find((h) => h.id === selectedHospitalId) ?? state.hospitals[0]
  const totalBeds = state.hospitals.reduce((acc, h) => acc + (h.beds?.total ?? 30), 0)
  const totalOccupied = state.hospitals.reduce((acc, h) => acc + (h.beds?.used ?? 0), 0)
  const availableBeds = Math.max(0, totalBeds - totalOccupied)
  const occupancyPercent = Math.round((totalOccupied / (totalBeds || 1)) * 100)

  const totalIcuBeds = state.hospitals.reduce((acc, h) => acc + (h.icuBeds?.total ?? 4), 0)
  const usedIcuBeds = state.hospitals.reduce((acc, h) => acc + (h.icuBeds?.used ?? 0), 0)
  const availableIcu = Math.max(0, totalIcuBeds - usedIcuBeds)
  const icuOccupancyPercent = Math.round((usedIcuBeds / (totalIcuBeds || 1)) * 100)

  const totalVents = state.hospitals.reduce((acc, h) => acc + (h.ventilators?.total ?? 4), 0)
  const usedVents = state.hospitals.reduce((acc, h) => acc + (h.ventilators?.used ?? 0), 0)
  const availableVents = Math.max(0, totalVents - usedVents)

  const waitingPatientsCount = state.patients.filter((p) => p.status === 'Waiting').length
  const avgWaitTillAssigned = getAverageWaitTillAssigned(state.patients)

  // Boltshift Segmented Arc Radial Gauge calculations
  // Arc of 24 segments (180 degree semi-circle)
  const numSegments = 24
  const activeSegments = Math.round((occupancyPercent / 100) * numSegments)

  return (
    <div className="space-y-6 font-sans text-[#2c1b0e]">
      {/* 4-Card Top Metric Grid (Inspired by Boltshift & Starline) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Hero Primary Brand Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-xs">
              TOTAL CAPACITY
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-white/15">
              <BedDouble className="size-4 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold tracking-tight">{availableBeds}</p>
              <span className="text-xs font-semibold text-white/80">/ {totalBeds} Free</span>
            </div>
            <p className="mt-1 text-xs font-medium text-white/85">
              Emergency & Inpatient Beds Available
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-white/90">
            <span>Occupancy Rate</span>
            <span className="rounded-full bg-white/25 px-2 py-0.2">{occupancyPercent}% Active</span>
          </div>
        </div>

        {/* Card 2: ICU Critical Reserve */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              CRITICAL ICU RESERVE
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <Activity className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold tracking-tight text-[#382416]">{availableIcu}</p>
              <span className="text-xs font-semibold text-stone-400">/ {totalIcuBeds} Free</span>
            </div>
            <p className="mt-1 text-xs font-medium text-stone-500">
              {usedIcuBeds} Acute ICU Beds Occupied
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  icuOccupancyPercent >= 80 ? 'bg-rose-500' : 'bg-amber-500'
                )}
                style={{ width: `${icuOccupancyPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-bold text-stone-600">{icuOccupancyPercent}%</span>
          </div>
        </div>

        {/* Card 3: Ventilator Pool */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              VENTILATOR POOL
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-sky-50 text-sky-600">
              <Wind className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold tracking-tight text-[#382416]">{availableVents}</p>
              <span className="text-xs font-semibold text-stone-400">/ {totalVents} Free</span>
            </div>
            <p className="mt-1 text-xs font-medium text-stone-500">
              {usedVents} Units In Clinical Use
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            ↑ Adequate Regional Buffer
          </div>
        </div>

        {/* Card 4: Triage Queue Latency */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              TRIAGE QUEUE WAIT
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold tracking-tight text-[#382416]">
                {avgWaitTillAssigned} <span className="text-base font-semibold text-stone-400">min</span>
              </p>
            </div>
            <p className="mt-1 text-xs font-medium text-stone-500">
              {waitingPatientsCount} Patients Waiting in Queue
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            Hungarian Auto-Assign Active
          </div>
        </div>
      </div>

      {/* Middle Section: Radial Gauge + Simulation Controller (Boltshift & Starline pattern) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Boltshift-Style Radial Arc Capacity Gauge */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#382416]">District Capacity Load</h3>
              <p className="text-[11px] text-stone-400">Real-time aggregate resource strain</p>
            </div>
            <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[11px] font-semibold text-stone-600">
              Live Gauge
            </span>
          </div>

          {/* Segmented Arc SVG */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-48 h-28 overflow-visible" viewBox="0 0 200 110">
                {Array.from({ length: numSegments }).map((_, i) => {
                  const angle = Math.PI - (i * Math.PI) / (numSegments - 1)
                  const r = 80
                  const cx = 100, cy = 95
                  const x1 = cx + (r - 12) * Math.cos(angle)
                  const y1 = cy - (r - 12) * Math.sin(angle)
                  const x2 = cx + r * Math.cos(angle)
                  const y2 = cy - r * Math.sin(angle)
                  const isFilled = i < activeSegments

                  return (
                    <line
                      key={i}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isFilled ? (occupancyPercent >= 80 ? '#e11d48' : occupancyPercent >= 65 ? '#ea580c' : '#059669') : '#e7e5e4'}
                      strokeWidth={5}
                      strokeLinecap="round"
                    />
                  )
                })}
              </svg>
              <div className="absolute top-10 flex flex-col items-center">
                <span className="text-3xl font-extrabold tracking-tight text-[#382416]">
                  {occupancyPercent}%
                </span>
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                  Occupied
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 w-full text-center">
              <div className="rounded-xl bg-stone-50 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-stone-400">Total In Use</span>
                <p className="text-base font-bold text-stone-900">{totalOccupied} Beds</p>
              </div>
              <div className="rounded-xl bg-stone-50 p-2.5">
                <span className="text-[10px] uppercase font-semibold text-stone-400">Remaining</span>
                <p className="text-base font-bold text-emerald-700">{availableBeds} Beds</p>
              </div>
            </div>
          </div>
        </div>

        {/* Continuous Simulation Engine Control Bar */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-xl bg-[#382416] text-[#ffedd7]">
                <Activity className="size-4 text-[#ea580c]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#382416]">Continuous Simulation Engine</h3>
                <p className="text-[11px] text-stone-400">
                  Automated time forward step & Hungarian hospital rebalancing
                </p>
              </div>
            </div>
            {isPlaying && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Live Continuous Mode
              </span>
            )}
          </div>

          <div className="my-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-stone-100 bg-stone-50/70 p-4">
            <div className="space-y-1">
              <p className="text-xs font-semibold text-stone-800">
                Simulation Step Interval: <span className="font-bold text-[#ea580c]">7 Minutes</span>
              </p>
              <p className="text-[11px] text-stone-500">
                Advances vitals decay, Hungarian bed reassignment, and step-down discharge.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              {onTogglePlay && (
                <button
                  type="button"
                  onClick={onTogglePlay}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-xs',
                    isPlaying
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-[#382416] hover:bg-[#28180d] text-[#ffedd7]'
                  )}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="size-3.5 fill-white" />
                      <span>Pause Auto-Play</span>
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5 fill-[#ffedd7]" />
                      <span>Start Auto-Play</span>
                    </>
                  )}
                </button>
              )}

              {onFastForward && (
                <button
                  type="button"
                  onClick={() => onFastForward(15)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer shadow-2xs transition-colors"
                >
                  <FastForward className="size-3.5 text-[#ea580c]" />
                  <span>+15m Step</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-stone-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-emerald-600" />
              Real-time Dijkstra shortest-path rerouting enabled
            </span>
            <span className="font-semibold text-stone-600">
              Active Connected Nodes: {state.hospitals.length} Facilities
            </span>
          </div>
        </div>
      </div>

      {/* Connected Regional Facilities Matrix (Boltshift & Bright Table Cards) */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#382416]">
              Connected District Healthcare Facilities
            </h3>
            <p className="text-[11px] text-stone-400">
              Click facility node to scope clinical queue and Hungarian allocation
            </p>
          </div>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-700">
            {state.hospitals.length} Facilities Active
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 md:grid-cols-2 lg:grid-cols-3">
          {state.hospitals.map((h) => {
            const isSelected = h.id === selectedHospitalId
            const used = h.beds?.used ?? 0
            const total = h.beds?.total ?? 30
            const percent = Math.round((used / (total || 1)) * 100)

            return (
              <motion.div
                key={h.id}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectHospital(h.id)}
                className={cn(
                  'rounded-2xl border p-4.5 transition-all cursor-pointer',
                  isSelected
                    ? 'border-[#382416] bg-stone-50/80 shadow-xs ring-1 ring-[#382416]'
                    : 'border-stone-200/80 bg-white hover:border-stone-300 hover:shadow-xs'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-stone-900 line-clamp-1">
                      {h.name}
                    </span>
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                      {h.short} · {h.district || 'District Facility'}
                    </span>
                  </div>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0',
                      percent >= 85
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : percent >= 70
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    )}
                  >
                    {percent}% Load
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3.5 h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-500',
                      percent >= 85 ? 'bg-rose-500' : percent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                {/* Details Breakdown */}
                <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 font-medium">
                  <span>General: <strong>{h.generalBeds?.used ?? 0}/{h.generalBeds?.total ?? 20}</strong></span>
                  <span>ICU: <strong>{h.icuBeds?.used ?? 0}/{h.icuBeds?.total ?? 4}</strong></span>
                  <span>Vents: <strong>{h.ventilators?.used ?? 0}/{h.ventilators?.total ?? 4}</strong></span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
