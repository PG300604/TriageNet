'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { type TriageState, getAverageWaitTillAssigned } from '@/lib/triage-data'
import { Building2, BedDouble, AlertTriangle, TrendingUp, Play, Pause, FastForward, Activity, Clock } from 'lucide-react'

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
  const occupancyPercent = Math.round((totalOccupied / (totalBeds || 1)) * 100)

  const avgWaitTillAssigned = getAverageWaitTillAssigned(state.patients)

  return (
    <div className="space-y-6 font-sans text-[#2c1b0e]">
      {/* Feature Card: Continuous Auto-Play Simulation Engine */}
      <div className="rounded-2xl border border-[#382416]/20 bg-gradient-to-r from-[#f7f2ea] to-[#ffffff] p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-[#382416] text-[#ffedd7] font-bold shadow-xs">
              <Activity className="size-6 text-[#dc5000]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#dc5000]">
                  AUTOMATED SIMULATION ENGINE
                </span>
                {isPlaying && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full animate-pulse">
                    <span className="size-1.5 rounded-full bg-emerald-600"></span>
                    SIMULATION RUNNING LIVE
                  </span>
                )}
              </div>
              <h2 className="text-lg font-bold uppercase text-[#382416] font-mono mt-0.5">
                CONTINUOUS AUTO-PLAY TRIAGE ENGINE
              </h2>
              <p className="text-xs text-slate-600 max-w-xl">
                Automatically steps time forward, processes incoming patient vitals, triggers Hungarian bed matching, and re-routes regional overflow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onTogglePlay && (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={onTogglePlay}
                className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                  isPlaying
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-[#382416] hover:bg-[#2c1b0e] text-[#ffedd7]'
                }`}
              >
                {isPlaying ? (
                  <>
                    <Pause className="size-4 fill-white" />
                    <span>PAUSE AUTO-PLAY</span>
                  </>
                ) : (
                  <>
                    <Play className="size-4 fill-[#ffedd7]" />
                    <span>START AUTO-PLAY SIMULATION</span>
                  </>
                )}
              </motion.button>
            )}

            {onFastForward && (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.96 }}
                type="button"
                onClick={() => onFastForward(15)}
                className="px-4 py-2.5 rounded-xl border border-[#382416]/20 bg-white hover:bg-slate-100 text-[#382416] font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FastForward className="size-4" />
                <span>+15M STEP</span>
              </motion.button>
            )}
          </div>
        </div>
      </div>

      {/* Upper KPI Stat Band — 5 Column Metric Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>REGIONAL OCCUPANCY</span>
            <TrendingUp className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#382416] font-mono">{occupancyPercent}%</p>
          <span className="mt-1 text-xs font-medium text-slate-600 block font-mono">
            {totalOccupied} / {totalBeds} BEDS IN USE
          </span>
        </div>

        {/* NEW METRIC: WAIT TIME TILL ASSIGNED */}
        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>WAIT TILL ASSIGNED</span>
            <Clock className="size-4 text-[#dc5000]" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#382416] font-mono">
            {avgWaitTillAssigned} <span className="text-sm font-bold text-slate-500">MIN</span>
          </p>
          <span className="mt-1 text-xs font-medium text-emerald-700 block font-mono">
            REAL-TIME COMPUTED QUEUE LATENCY
          </span>
        </div>

        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>REGIONAL HOSPITALS</span>
            <Building2 className="size-4 text-blue-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#382416] font-mono">{state.hospitals.length}</p>
          <span className="mt-1 text-xs font-medium text-slate-600 block font-mono">CONNECTED GRAPH NODES</span>
        </div>

        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>CRITICAL ICU OCCUPANCY</span>
            <BedDouble className="size-4 text-red-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-red-600 font-mono">
            {state.patients.filter((p) => p.status === 'Assigned' && p.bedType === 'ICU').length}
          </p>
          <span className="mt-1 text-xs font-medium text-slate-600 block font-mono">ACTIVE ICU PATIENTS</span>
        </div>

        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>WAITING IN QUEUE</span>
            <AlertTriangle className="size-4 text-amber-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-amber-600 font-mono">
            {state.patients.filter((p) => p.status === 'Waiting').length}
          </p>
          <span className="mt-1 text-xs font-medium text-slate-600 block font-mono">DYNAMIC HEAP CANDIDATES</span>
        </div>
      </div>

      {/* Hospital Capacity Matrix */}
      <div className="rounded-2xl border border-[#382416]/15 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#382416]/15 pb-3">
          <h3 className="text-sm font-bold uppercase text-[#382416] tracking-wider font-mono">
            REGIONAL HOSPITAL CAPACITY MATRIX
          </h3>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-mono">
            REAL-TIME TELEMETRY ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                className={`rounded-xl border p-5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#382416] bg-[#f7f2ea]/60 shadow-sm ring-1 ring-[#382416]'
                    : 'border-[#382416]/15 bg-slate-50/80 hover:border-[#382416]/30'
                }`}
              >
                <div className="flex items-center justify-between font-mono">
                  <span className="text-sm font-bold uppercase text-[#382416]">{h.name}</span>
                  <span className={`text-xs font-bold ${percent >= 85 ? 'text-red-600' : 'text-emerald-700'}`}>
                    {percent}% LOAD
                  </span>
                </div>
                <div className="mt-3 w-full h-2.5 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                  <div
                    className={`h-full transition-all duration-500 ${
                      percent >= 85 ? 'bg-red-500' : percent >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-xs font-mono text-slate-600">
                  <span>BEDS: <strong>{used} / {total}</strong></span>
                  <span>ICU: <strong>{h.icuBeds?.used ?? 0}/{h.icuBeds?.total ?? 4}</strong> | GENERAL: <strong>{h.generalBeds?.used ?? 0}/{h.generalBeds?.total ?? 20}</strong></span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
