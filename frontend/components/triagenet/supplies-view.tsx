'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { type TriageState, type Hospital, occupancyRatio, calculateAiSupplyNeed } from '@/lib/triage-data'
import { Boxes, Wind, BedDouble, Stethoscope, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, Activity, Droplets, Bot, Zap, ShieldAlert } from 'lucide-react'
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
  const strainedHospitals = hospitals.filter((h) => {
    const load = occupancyRatio(h.beds)
    const icuLoad = h.icuBeds.used / (h.icuBeds.total || 1)
    return load >= 0.70 || icuLoad >= 0.80
  }).sort((a, b) => occupancyRatio(b.beds) - occupancyRatio(a.beds))

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
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      {/* AI AGENT TERMINAL MODAL */}
      <AiSupplyTerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        state={state}
        onConfirmDispatch={handleConfirmDispatch}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#382416] flex items-center gap-2 uppercase font-mono">
            <Boxes className="size-5 text-[#dc5000]" />
            Regional Supply Inventory & Dynamic Resource Reallocation
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-sans">
            Autonomous 24/7 regional equipment monitoring across all hospitals with dynamic need-based supply flagging and operator authorization.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 flex items-center gap-2">
          <span className="size-2 rounded-full bg-emerald-500 animate-ping"></span>
          [AUTONOMOUS 24/7 MONITORING ACTIVE]
        </span>
      </div>

      {/* AI SUPPLY DISPATCH ENGINE STATUS BANNER */}
      <div className="rounded-2xl border border-[#382416]/20 bg-gradient-to-r from-[#f7f2ea] to-[#ffffff] p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bot className="size-6 text-[#dc5000] shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#382416] uppercase">
                AUTONOMOUS AI SUPPLY ENGINE
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                [CONTINUOUS BACKGROUND TELEMETRY]
              </span>
            </div>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              Continuously evaluates hospital capacities in real time. Automatically raises dynamic supply flags when capacity pressure is detected—zero manual intervention or predefined actions required.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-2xs font-mono text-xs font-bold text-[#382416]">
          <Activity className="size-4 text-emerald-600 animate-pulse" />
          <span>{strainedHospitals.length > 0 ? `${strainedHospitals.length} SURGE FLAGS ACTIVE` : 'ALL HOSPITALS NOMINAL'}</span>
        </div>
      </div>

      {/* Operational Event Message Banner */}
      {lastEvent && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-mono font-bold text-emerald-900 flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-emerald-600 animate-pulse shrink-0" />
            <span>{lastEvent}</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">[UPDATED LIVE]</span>
        </motion.div>
      )}

      {/* DYNAMIC HOSPITAL SUPPLY NEED FLAGGING PANEL — NO PREDEFINED ACTIONS */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#382416] font-mono uppercase flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            Hospital Supply Need Flagging & Operator Approval Panel
          </h3>
          <span className="text-xs font-mono text-slate-500">[DYNAMIC LIVE MONITORING]</span>
        </div>

        {/* 100% REALTIME DYNAMIC FLAGGING LIST */}
        <div className="space-y-3 font-mono">
          {strainedHospitals.length > 0 ? (
            strainedHospitals.map((hosp) => {
              const loadPct = Math.round(occupancyRatio(hosp.beds) * 100)
              const donorCandidate = hospitals.find((dh) => dh.id !== hosp.id && occupancyRatio(dh.beds) < 0.70) ?? hospitals.find((dh) => dh.id !== hosp.id) ?? hospitals[1]
              
              // Calculate dynamic need for this specific strained hospital
              const hospPts = state.patients.filter((p) => p.hospitalId === hosp.id)
              const waitingCount = hospPts.filter((p) => p.status === 'Waiting' || p.status === 'Preempted').length
              const severeCount = hospPts.filter((p) => p.severity >= 80 && p.status !== 'Transferred').length

              let genNeed = loadPct >= 85 ? 12 : 8
              let icuNeed = loadPct >= 85 ? 4 : 2
              let ventNeed = loadPct >= 85 ? 5 : 3
              let totalNeed = genNeed + icuNeed
              let tag = loadPct >= 85 ? '[CRITICAL SURGE DEFICIT]' : '[MODERATE SURGE DEFICIT]'

              return (
                <div key={hosp.id} className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-amber-300 bg-amber-50/70 shadow-2xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{hosp.name} Flagged Surge Need</span>
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                        {tag}
                      </span>
                      <span className="text-xs font-bold text-[#dc5000] bg-orange-100 px-2 py-0.5 rounded border border-orange-300">
                        +{totalNeed} Beds (+{icuNeed} ICU) & +{ventNeed} Ventilators Needed
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-600 font-sans">
                      <span>Donor Facility: <strong>{donorCandidate.name}</strong></span>
                      <ArrowRight className="size-3 text-slate-400" />
                      <span>Recipient: <strong>{hosp.name}</strong></span>
                      <span className="text-slate-400">|</span>
                      <span className="text-slate-500 font-mono text-[11px]">Reason: {loadPct}% Capacity Load, {waitingCount} Waiting Patients ({severeCount} Severe S&gt;=80)</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleApproveFlaggedNeed(hosp)}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 font-mono text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-2 border border-emerald-400"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Approve & Transfer Supply Live</span>
                  </button>
                </div>
              )
            })
          ) : (
            <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/80 text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-6 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-sm font-mono block text-emerald-950">[NOMINAL CAPACITY SYNC]</span>
                  <span className="text-xs text-emerald-800 font-sans">
                    All {hospitals.length} regional facilities operating within safe capacity thresholds (&lt; 70% load). No critical supply flags active.
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-800 bg-white px-3 py-1 rounded border border-emerald-300">
                100% NOMINAL
              </span>
            </div>
          )}
        </div>
      </div>

      {/* REGIONAL HOSPITAL RESOURCE INVENTORY MATRIX */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 font-mono text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-[#382416] uppercase">
            REGIONAL HOSPITAL RESOURCE INVENTORY BREAKDOWN (LIVE CAPACITIES)
          </h3>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-300">
            [{hospitals.reduce((acc, h) => acc + h.beds.total, 0)} TOTAL BEDS ALLOCATED]
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {hospitals.map((h) => {
            const loadPct = Math.round(occupancyRatio(h.beds) * 100)

            return (
              <div key={h.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-[#382416]">{h.name}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                    loadPct >= 85 ? 'bg-red-100 text-red-800 border-red-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}>
                    [{loadPct}% CAPACITY LOAD]
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full ${loadPct >= 85 ? 'bg-red-500' : loadPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                    style={{ width: `${loadPct}%` }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <span className="text-slate-500 font-bold block uppercase text-[10px]">TOTAL BEDS</span>
                    <span className="font-bold text-slate-900">{h.beds.used} / {h.beds.total} Units</span>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <span className="text-slate-500 font-bold block uppercase text-[10px]">ICU BEDS</span>
                    <span className="font-bold text-slate-900">{h.icuBeds.used} / {h.icuBeds.total} Beds</span>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <span className="text-slate-500 font-bold block uppercase text-[10px]">VENTILATORS</span>
                    <span className="font-bold text-slate-900">{h.ventilators.used} / {h.ventilators.total} Units</span>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <span className="text-slate-500 font-bold block uppercase text-[10px]">SPECIALISTS AVAILABLE</span>
                    <span className="font-bold text-emerald-700">{h.specialists.total - h.specialists.used} / {h.specialists.total}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* AI SUPPLY DISPATCH LOG HISTORY STREAM */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3 font-mono text-xs">
        <h3 className="text-sm font-bold uppercase text-[#382416] border-b border-slate-100 pb-2">
          AI SUPPLY AGENT DISPATCH AUDIT LOG STREAM
        </h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {dispatchLogs.map((log, i) => (
            <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
