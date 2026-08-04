'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import React, { useState } from 'react'
import {
  type Hospital,
  type Patient,
  type PatientStatus,
  type ReferralRecommendation,
  effectivePriority,
  severityStatus,
  sortByPriority,
  getAverageWaitTillAssigned,
} from '@/lib/triage-data'
import {
  Activity,
  ArrowUpDown,
  Clock,
  FastForward,
  Play,
  Pause,
  AlertTriangle,
  UserPlus,
  Zap,
  CheckCircle2,
  LogOut,
  Network,
  ArrowRight,
  Archive,
} from 'lucide-react'

interface TriageQueueViewProps {
  hospital: Hospital
  patients: Patient[]
  updatedIds: Set<string>
  onSimulate: () => void
  onFastForward5x?: () => void
  onInjectArrival?: (severity: number, name: string, complaint: string) => void
  onTriggerBedRelease?: (reason: 'recovery' | 'family_ama') => void
  referralRecommendation?: ReferralRecommendation | null
  onExecuteReferral?: (referral: ReferralRecommendation) => void
  lastEventMessage?: string | null
  isPlaying?: boolean
  onTogglePlay?: () => void
}

const STATUS_STYLE: Record<PatientStatus, string> = {
  Waiting: 'bg-red-100 text-red-800 border border-red-300 font-bold',
  Assigned: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold',
  Preempted: 'bg-purple-100 text-purple-800 border border-purple-300 font-extrabold shadow-2xs',
  Transferred: 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold',
  Discharged: 'bg-slate-100 text-slate-700 border border-slate-300 font-bold',
}

function SeverityBadge({ severity }: { severity: number }) {
  const status = severityStatus(severity)
  return (
    <span
      className={cn(
        'inline-flex min-w-10 items-center justify-center rounded-lg border px-2 py-1 font-mono text-xs font-bold shadow-2xs',
        status === 'red' && 'bg-red-100 text-red-800 border-red-300',
        status === 'amber' && 'bg-amber-100 text-amber-800 border-amber-300',
        status === 'green' && 'bg-emerald-100 text-emerald-800 border-emerald-300',
      )}
    >
      {severity}
    </span>
  )
}

export function TriageQueueView({
  hospital,
  patients,
  updatedIds,
  onSimulate,
  onFastForward5x,
  onInjectArrival,
  onTriggerBedRelease,
  referralRecommendation,
  onExecuteReferral,
  lastEventMessage,
  isPlaying = false,
  onTogglePlay,
}: TriageQueueViewProps) {
  const [tab, setTab] = useState<'active' | 'discharged'>('active')

  const activePatients = patients.filter((p) => p.status !== 'Discharged')
  const dischargedPatients = patients.filter((p) => p.status === 'Discharged')
  const avgWaitTillAssigned = getAverageWaitTillAssigned(patients)

  const displayedList = sortByPriority(tab === 'active' ? activePatients : dischargedPatients)

  return (
    <div className="flex flex-col gap-5 font-sans text-[#2c1b0e]">
      {/* Auto-Play Control & Simulation Feature Bar */}
      {onTogglePlay && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#382416]/20 bg-gradient-to-r from-[#f7f2ea] to-[#ffffff] p-4 text-[#382416] shadow-2xs">
          <div className="flex items-center gap-3">
            <Activity className="size-5 text-[#dc5000] shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#382416]">
                  CONTINUOUS SIMULATION ENGINE
                </span>
                {isPlaying && (
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full animate-pulse">
                    LIVE AUTO-PLAYING
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Automated continuous patient scoring & Hungarian bed allocation.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[#382416] hover:bg-[#2c1b0e] text-[#ffedd7]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="size-3.5 fill-white" />
                <span>PAUSE AUTO-PLAY</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-[#ffedd7]" />
                <span>AUTO-PLAY SIMULATION</span>
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Live Operational Notification Alert */}
      {lastEventMessage && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <Zap className="size-5 text-red-600 shrink-0 animate-pulse" />
            <div>
              <span className="font-mono text-xs font-bold text-red-700 uppercase tracking-wider block">
                OPERATIONAL TRIAGE SYSTEM EVENT
              </span>
              <p className="text-sm font-medium">{lastEventMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Regional Referral Load-Balancing Banner */}
      {referralRecommendation && onExecuteReferral && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <Network className="size-5 text-cyan-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-800 uppercase tracking-wider block">
                  REGIONAL REFERRAL RECOMMENDATION
                </span>
                <span className="text-[10px] font-mono font-bold text-cyan-800 bg-white border border-cyan-300 px-2 py-0.5 rounded-full">
                  {referralRecommendation.matchReason}
                </span>
              </div>
              <p className="text-sm font-medium text-cyan-900 mt-0.5">{referralRecommendation.reason}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onExecuteReferral(referralRecommendation)}
            className="rounded-xl bg-cyan-700 hover:bg-cyan-800 px-4 py-2 text-xs font-bold text-white shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <span>REFER TO {referralRecommendation.toHospitalName.toUpperCase()}</span>
            <ArrowRight className="size-4" />
          </motion.button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#382416]/15 pb-3">
        {/* Tab Selection Lockup & Wait Time Metric */}
        <div className="flex items-center gap-4 font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('active')}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                tab === 'active'
                  ? 'bg-[#382416] text-[#ffedd7] border-[#382416] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              ACTIVE QUEUE ({activePatients.length})
            </button>

            <button
              type="button"
              onClick={() => setTab('discharged')}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                tab === 'discharged'
                  ? 'bg-[#382416] text-[#ffedd7] border-[#382416] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Archive className="size-3.5 text-emerald-600" />
              <span>DISCHARGED LOG ({dischargedPatients.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#382416] bg-[#f7f2ea] border border-[#382416]/20 px-3 py-1 rounded-xl font-bold">
            <Clock className="size-3.5 text-[#dc5000]" />
            <span>AVG WAIT TILL ASSIGNED: {avgWaitTillAssigned}M</span>
          </div>
        </div>

        {/* High Contrast Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Bed Release Triggers */}
          {onTriggerBedRelease && (
            <>
              <button
                type="button"
                onClick={() => onTriggerBedRelease('recovery')}
                className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="size-3.5" />
                <span>EARLY RECOVERY</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerBedRelease('family_ama')}
                className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <LogOut className="size-3.5" />
                <span>AMA RELOCATION</span>
              </button>
            </>
          )}

          {/* Arrival Injections */}
          {onInjectArrival && (
            <>
              <button
                type="button"
                onClick={() =>
                  onInjectArrival(
                    94,
                    'Ambulance Arrival (Cardiac Arrest)',
                    'Ventricular Fibrillation (SpO₂ 76%)',
                  )
                }
                className="rounded-xl border border-red-300 bg-red-50 px-3 py-1.5 font-bold text-red-800 hover:bg-red-100 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <AlertTriangle className="size-3.5" />
                <span>CRITICAL ARRIVAL</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onInjectArrival(
                    45,
                    'Walk-in Patient (Sprain)',
                    'Ankle Laceration / Mild Swelling',
                  )
                }
                className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <UserPlus className="size-3.5" />
                <span>ROUTINE ARRIVAL</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onSimulate}
            className="rounded-xl bg-[#382416] hover:bg-[#2c1b0e] px-3 py-1.5 font-bold text-[#ffedd7] cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Play className="size-3.5 fill-[#ffedd7]" />
            <span>+7M STEP</span>
          </button>

          {onFastForward5x && (
            <button
              type="button"
              onClick={onFastForward5x}
              className="rounded-xl bg-[#382416] hover:bg-[#2c1b0e] px-3 py-1.5 font-bold text-[#ffedd7] cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <FastForward className="size-3.5" />
              <span>+35M STEP</span>
            </button>
          )}
        </div>
      </div>

      {/* Queue Table */}
      <div className="rounded-2xl border border-[#382416]/15 bg-white shadow-xs overflow-hidden">
        <div className="grid grid-cols-[2.5rem_1fr] items-center gap-3 border-b border-[#382416]/15 bg-[#f7f2ea]/60 px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider text-[#382416] sm:grid-cols-[2.5rem_1.6fr_5rem_6rem_1fr_7rem]">
          <span className="flex items-center gap-1">
            <ArrowUpDown className="size-3.5" />#
          </span>
          <span>PATIENT</span>
          <span className="hidden sm:block">SEVERITY</span>
          <span className="hidden sm:block">WAIT</span>
          <span className="hidden sm:block font-mono">TOP FACTOR</span>
          <span className="hidden text-right sm:block font-mono">STATUS</span>
        </div>

        {displayedList.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-slate-500 uppercase">
            NO {tab.toUpperCase()} PATIENTS IN QUEUE
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {displayedList.map((patient, index) => {
              const flash = updatedIds.has(patient.id)
              const isPreempted = patient.status === 'Preempted'

              return (
                <motion.li
                  key={patient.id}
                  whileHover={{ x: 2 }}
                  className={cn(
                    'grid grid-cols-[2.5rem_1fr] items-center gap-3 px-4 py-3.5 transition-colors sm:grid-cols-[2.5rem_1.6fr_5rem_6rem_1fr_7rem]',
                    flash && 'bg-amber-50/80',
                    isPreempted && 'bg-purple-50/80 border-l-4 border-l-purple-600',
                  )}
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 font-mono text-xs font-bold text-[#382416] border border-slate-300">
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#382416] flex items-center gap-2 uppercase">
                      <span>{patient.name}</span>
                      {isPreempted && (
                        <span className="text-[10px] font-mono font-extrabold text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                          PREEMPTED ➔ STEP-DOWN
                        </span>
                      )}
                    </p>
                    <p className="font-mono text-xs text-slate-500">
                      {patient.id} · P{Math.round(effectivePriority(patient))}
                    </p>
                  </div>

                  <div className="hidden sm:block">
                    <SeverityBadge severity={patient.severity} />
                  </div>
                  <span className="hidden items-center gap-1.5 font-mono text-xs font-bold text-slate-700 sm:flex">
                    <Clock className="size-3.5 text-slate-400" />
                    {patient.waitMinutes}M
                  </span>
                  <span className="hidden items-center gap-1.5 text-xs text-slate-600 font-mono sm:flex">
                    <Activity className="size-3.5 shrink-0 text-red-500" />
                    <span className="truncate uppercase">{patient.topFactor}</span>
                  </span>
                  <span className="hidden justify-end sm:flex">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-mono uppercase shadow-2xs',
                        STATUS_STYLE[patient.status],
                      )}
                    >
                      {patient.status}
                    </span>
                  </span>
                </motion.li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
