'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { type TriageState, type Hospital, occupancyRatio, calculateAiSupplyNeed } from '@/lib/triage-data'
import {
  Boxes,
  Wind,
  BedDouble,
  Stethoscope,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Activity,
  Droplets,
  Bot,
  Zap,
  ShieldAlert,
  HeartPulse,
} from 'lucide-react'
import { AiSupplyTerminalModal } from './ai-supply-terminal-modal'

interface SuppliesViewProps {
  state: TriageState
  onStateChange?: (next: TriageState) => void
  onRunAiSupplyDispatch?: () => void
}

export function SuppliesView({ state, onStateChange, onRunAiSupplyDispatch }: SuppliesViewProps) {
  const hospitals = state.hospitals
  const [terminalOpen, setTerminalOpen] = useState(false)
  const [dispatchLogs, setDispatchLogs] = useState<string[]>([
    '[AI DISPATCH SYSTEM] Initialized autonomous 24/7 regional supply monitoring across connected facilities.',
  ])
  const [lastEvent, setLastEvent] = useState<string | null>(null)

  // Filter hospitals that actually have capacity strain (occupancy >= 70% or ICU >= 80%)
  const strainedHospitals = hospitals
    .filter((h) => {
      const load = occupancyRatio(h.beds)
      const icuLoad = h.icuBeds.used / (h.icuBeds.total || 1)
      return load >= 0.70 || icuLoad >= 0.80
    })
    .sort((a, b) => occupancyRatio(b.beds) - occupancyRatio(a.beds))

  // Aggregate regional inventory metrics
  const totalBeds = hospitals.reduce((acc, h) => acc + h.beds.total, 0)
  const totalBedsUsed = hospitals.reduce((acc, h) => acc + h.beds.used, 0)
  const totalIcuBeds = hospitals.reduce((acc, h) => acc + h.icuBeds.total, 0)
  const totalIcuUsed = hospitals.reduce((acc, h) => acc + h.icuBeds.used, 0)
  const totalVents = hospitals.reduce((acc, h) => acc + h.ventilators.total, 0)
  const totalVentsUsed = hospitals.reduce((acc, h) => acc + h.ventilators.used, 0)

  const handleConfirmDispatch = () => {
    if (onRunAiSupplyDispatch) {
      onRunAiSupplyDispatch()
    }
    const need = calculateAiSupplyNeed(state)
    const targetHosp = need.targetHosp
    const oldLoad = Math.round(occupancyRatio(targetHosp.beds) * 100)
    const newBedsTotal = targetHosp.beds.total + need.neededTotalBeds
    const newLoad = Math.round((targetHosp.beds.used / newBedsTotal) * 100)

    const msg = `[AI DISPATCH CONFIRMED] Transferred +${need.neededTotalBeds} Beds (+${need.neededIcuBeds} ICU) & +${need.neededVents} Ventilators to ${targetHosp.name}. Capacity load reduced: ${oldLoad}% ➔ ${newLoad}%.`
    setLastEvent(msg)
    setDispatchLogs((prev) => [msg, ...prev])
  }

  const handleApproveFlaggedNeed = (hosp: Hospital) => {
    setTerminalOpen(true)
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-stone-900">
      {/* AI AGENT TERMINAL MODAL */}
      <AiSupplyTerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        state={state}
        onConfirmDispatch={handleConfirmDispatch}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
              <Boxes className="size-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#382416]">
              Regional Supply Inventory & Dynamic Resource Allocation
            </h2>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Autonomous 24/7 regional equipment monitoring across all hospitals with dynamic need-based supply flagging and operator authorization.
          </p>
        </div>

        <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <span className="size-2 rounded-full bg-emerald-500 animate-ping"></span>
          24/7 Monitoring Active
        </span>
      </div>

      {/* 4-Card Boltshift/Starline Metric Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Beds (Hero Terracotta) */}
        <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-[#ea580c] to-[#c2410c] p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-100">
              Total Bed Reserve
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-white/20">
              <BedDouble className="size-4 text-white" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{totalBeds}</span>
            <span className="text-xs font-medium text-orange-100">Units Total</span>
          </div>
          <p className="mt-2 text-xs text-orange-100/80">
            {totalBeds - totalBedsUsed} currently vacant ({Math.round(((totalBeds - totalBedsUsed) / totalBeds) * 100)}% free buffer)
          </p>
        </div>

        {/* Card 2: ICU Reserve Pool */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              ICU Critical Beds
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-600">
              <HeartPulse className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-red-700">
              {totalIcuBeds - totalIcuUsed}
            </span>
            <span className="text-xs font-medium text-stone-500">/ {totalIcuBeds} Open</span>
          </div>
          <p className="mt-2 text-xs text-stone-600">
            {totalIcuUsed} ICU beds currently in critical care
          </p>
        </div>

        {/* Card 3: Ventilator Fleet */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Ventilator Pool
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <Wind className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-blue-700">
              {totalVents - totalVentsUsed}
            </span>
            <span className="text-xs font-medium text-stone-500">/ {totalVents} Available</span>
          </div>
          <p className="mt-2 text-xs text-stone-600">
            Regional respiratory support units ready
          </p>
        </div>

        {/* Card 4: Autonomous Surge Monitor */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              AI Autonomous Status
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Bot className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-[#382416]">
              {strainedHospitals.length > 0 ? `${strainedHospitals.length} Surge Flags` : 'Nominal Sync'}
            </span>
          </div>
          <p className="mt-2 text-xs text-stone-600">
            {strainedHospitals.length > 0 ? 'Surge re-allocation proposals ready' : 'All hospitals operating within safe margins'}
          </p>
        </div>
      </div>

      {/* Autonomous AI Supply Dispatch Engine Status Banner */}
      <div className="rounded-2xl border border-[#382416]/15 bg-gradient-to-r from-[#f7f2ea] to-white p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c] shrink-0">
            <Bot className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#382416] uppercase tracking-wider">
                Autonomous AI Supply Engine
              </span>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                Continuous Telemetry
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Continuously evaluates hospital capacities in real time. Automatically raises dynamic supply flags when capacity pressure is detected—zero manual intervention or predefined actions required.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-stone-200 shadow-2xs text-xs font-semibold text-[#382416]">
          <Activity className="size-4 text-emerald-600 animate-pulse" />
          <span>{strainedHospitals.length > 0 ? `${strainedHospitals.length} Surge Flags Active` : 'All Hospitals Operating Nominally'}</span>
        </div>
      </div>

      {/* Operational Event Notification Banner */}
      {lastEvent && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-emerald-600 animate-pulse shrink-0" />
            <span>{lastEvent}</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-300">Updated Live</span>
        </motion.div>
      )}

      {/* Dynamic Hospital Supply Need Flagging Panel */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <h3 className="text-base font-bold text-[#382416] flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            Hospital Supply Need Flagging & Operator Authorization
          </h3>
          <span className="text-xs font-semibold text-stone-500">Dynamic Monitoring</span>
        </div>

        {/* Dynamic Flagging List */}
        <div className="space-y-3">
          {strainedHospitals.length > 0 ? (
            strainedHospitals.map((hosp) => {
              const loadPct = Math.round(occupancyRatio(hosp.beds) * 100)
              const donorCandidate =
                hospitals.find((dh) => dh.id !== hosp.id && occupancyRatio(dh.beds) < 0.70) ??
                hospitals.find((dh) => dh.id !== hosp.id) ??
                hospitals[1]

              const hospPts = state.patients.filter((p) => p.hospitalId === hosp.id)
              const waitingCount = hospPts.filter((p) => p.status === 'Waiting' || p.status === 'Preempted').length
              const severeCount = hospPts.filter((p) => p.severity >= 80 && p.status !== 'Transferred').length

              const genNeed = loadPct >= 85 ? 12 : 8
              const icuNeed = loadPct >= 85 ? 4 : 2
              const ventNeed = loadPct >= 85 ? 5 : 3
              const totalNeed = genNeed + icuNeed
              const tag = loadPct >= 85 ? 'Critical Surge Deficit' : 'Moderate Surge Deficit'

              return (
                <div
                  key={hosp.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-amber-300/80 bg-amber-50/60 shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-stone-900">{hosp.name}</span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          loadPct >= 85
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {tag}
                      </span>
                      <span className="text-xs font-semibold text-[#ea580c] bg-orange-100 px-2 py-0.5 rounded-full border border-orange-300">
                        +{totalNeed} Beds (+{icuNeed} ICU) & +{ventNeed} Vents Needed
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-600 flex-wrap">
                      <span>Donor: <strong>{donorCandidate.name}</strong></span>
                      <ArrowRight className="size-3 text-stone-400" />
                      <span>Recipient: <strong>{hosp.name}</strong></span>
                      <span className="text-stone-300">|</span>
                      <span className="text-stone-500 text-xs">
                        Load: {loadPct}%, {waitingCount} Queued ({severeCount} Severe S≥80)
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApproveFlaggedNeed(hosp)}
                    className="rounded-xl bg-emerald-700 hover:bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-2 transition-colors"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Authorize Live Supply Transfer</span>
                  </button>
                </div>
              )
            })
          ) : (
            <div className="p-5 rounded-xl border border-emerald-300/80 bg-emerald-50/70 text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-6 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-sm block text-emerald-950">Nominal Regional Capacity Sync</span>
                  <span className="text-xs text-emerald-800">
                    All {hospitals.length} regional facilities operating within safe capacity thresholds (&lt; 70% load). No critical supply flags active.
                  </span>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-300">
                100% Nominal
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Regional Hospital Resource Inventory Matrix */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#382416]">
              Regional Hospital Resource Inventory Matrix
            </h3>
            <p className="text-xs text-stone-500">Live operational capacities and resource buffers across all connected facilities</p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
            {totalBeds} Total Beds Managed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map((h) => {
            const loadPct = Math.round(occupancyRatio(h.beds) * 100)

            return (
              <div key={h.id} className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-[#382416]">{h.name}</h4>
                    <span className="text-[11px] text-stone-500">{h.district || 'Jharkhand Central'}</span>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                      loadPct >= 85
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : loadPct >= 70
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {loadPct}% Capacity
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      loadPct >= 85 ? 'bg-red-500' : loadPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${loadPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-white p-2.5 border border-stone-200/80">
                    <span className="text-stone-500 font-semibold block uppercase text-[10px]">General Beds</span>
                    <span className="font-bold text-stone-900">{h.beds.used} / {h.beds.total} Units</span>
                  </div>

                  <div className="rounded-xl bg-white p-2.5 border border-stone-200/80">
                    <span className="text-stone-500 font-semibold block uppercase text-[10px]">ICU Beds</span>
                    <span className="font-bold text-stone-900">{h.icuBeds.used} / {h.icuBeds.total} Beds</span>
                  </div>

                  <div className="rounded-xl bg-white p-2.5 border border-stone-200/80">
                    <span className="text-stone-500 font-semibold block uppercase text-[10px]">Ventilators</span>
                    <span className="font-bold text-stone-900">{h.ventilators.used} / {h.ventilators.total} Units</span>
                  </div>

                  <div className="rounded-xl bg-white p-2.5 border border-stone-200/80">
                    <span className="text-stone-500 font-semibold block uppercase text-[10px]">Available Specialists</span>
                    <span className="font-bold text-emerald-700">{h.specialists.total - h.specialists.used} / {h.specialists.total} Ready</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI Supply Dispatch Log History Stream */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#382416] border-b border-stone-100 pb-2">
          AI Supply Agent Dispatch Audit Log Stream
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto font-mono text-xs">
          {dispatchLogs.map((log, i) => (
            <div key={i} className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-800">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
