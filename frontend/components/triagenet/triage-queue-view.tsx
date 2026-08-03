'use client'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  type Hospital,
  type Patient,
  type PatientStatus,
  type ReferralRecommendation,
  effectivePriority,
  severityStatus,
  sortByPriority,
} from '@/lib/triage-data'
import { STATUS_CLASSES, getPatientStatusBadgeClass } from './status'
import {
  Activity,
  ArrowUpDown,
  Clock,
  FastForward,
  Play,
  AlertTriangle,
  UserPlus,
  Zap,
  CheckCircle2,
  LogOut,
  Network,
  ArrowRight,
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
}

const STATUS_STYLE: Record<PatientStatus, string> = {
  Waiting: 'bg-red-100 text-red-800 border border-red-300 font-bold',
  Assigned: 'bg-slate-100 text-slate-800 border border-slate-300 font-bold',
  Preempted: 'bg-purple-800 text-white border border-purple-900 font-extrabold shadow-2xs',
  Transferred: 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold',
}

function SeverityBadge({ severity }: { severity: number }) {
  const status = severityStatus(severity)
  return (
    <span
      className={cn(
        'skeu-chip inline-flex min-w-11 items-center justify-center rounded-md px-2 py-1 font-mono text-sm font-bold shadow-2xs',
        STATUS_CLASSES[status].badge,
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
}: TriageQueueViewProps) {
  const ordered = sortByPriority(patients)

  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Live Operational Notification Alert - High Contrast Slate-900 & Blue Banner */}
      {lastEventMessage && (
        <div className="flex items-center justify-between rounded-2xl border-2 border-blue-500 bg-slate-900 p-4 text-white shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <Zap className="size-6 text-blue-400 shrink-0" />
            <div>
              <span className="font-mono text-xs font-extrabold text-blue-400 uppercase tracking-wider block">
                OPERATIONAL TRIAGE SYSTEM EVENT
              </span>
              <p className="text-sm font-bold text-white">{lastEventMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Regional Referral Load-Balancing Banner */}
      {referralRecommendation && onExecuteReferral && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-cyan-400 bg-slate-900 p-4 text-white shadow-md">
          <div className="flex items-center gap-3">
            <Network className="size-6 text-cyan-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-extrabold text-cyan-400 uppercase tracking-wider block">
                  REGIONAL LOAD-BALANCING REFERRAL AVAILABLE
                </span>
                <span className="text-[10px] font-mono font-extrabold text-emerald-900 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                  {referralRecommendation.matchReason}
                </span>
              </div>
              <p className="text-sm font-bold text-slate-100 mt-0.5">{referralRecommendation.reason}</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => onExecuteReferral(referralRecommendation)}
            className="bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-extrabold shadow-sm px-4 py-2 rounded-xl"
            size="sm"
          >
            <span>Execute Referral to {referralRecommendation.toHospitalName}</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold tracking-tight text-slate-900">
            Triage Queue — {hospital.name}
          </h2>
          <p className="text-xs text-slate-500">
            {ordered.length} patients · sorted by effective priority (acuity + wait)
          </p>
        </div>

        {/* High Contrast Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Real-World Bed Release Triggers */}
          {onTriggerBedRelease && (
            <>
              <button
                type="button"
                onClick={() => onTriggerBedRelease('recovery')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 cursor-pointer"
                title="Simulate patient early recovery discharge, immediately freeing a bed"
              >
                <CheckCircle2 className="size-4" />
                <span>Early Recovery Discharge</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerBedRelease('family_ama')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white shadow-2xs hover:bg-amber-700 cursor-pointer"
                title="Simulate family taking patient to another facility (AMA relocation)"
              >
                <LogOut className="size-4" />
                <span>Family AMA Relocation</span>
              </button>
            </>
          )}

          {/* Simulated Patient Arrival Injections */}
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white shadow-2xs hover:bg-red-700 cursor-pointer"
              >
                <AlertTriangle className="size-4" />
                <span>Critical Arrival (Preempt)</span>
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
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-3 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-900 cursor-pointer"
              >
                <UserPlus className="size-4" />
                <span>Routine Arrival (Hold)</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onSimulate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 cursor-pointer"
          >
            <Play className="size-4 fill-white" />
            <span>+7m Step</span>
          </button>

          {onFastForward5x && (
            <button
              type="button"
              onClick={onFastForward5x}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-700 px-4 py-2 text-xs font-extrabold text-white shadow-md hover:bg-indigo-800 cursor-pointer"
            >
              <FastForward className="size-4" />
              <span>Fast Forward 5x (+35m)</span>
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="grid grid-cols-[2.5rem_1fr] items-center gap-3 border-b border-slate-200/80 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 sm:grid-cols-[2.5rem_1.6fr_5rem_6rem_1fr_7rem]">
          <span className="flex items-center gap-1">
            <ArrowUpDown className="size-3.5" />#
          </span>
          <span>Patient</span>
          <span className="hidden sm:block">Severity</span>
          <span className="hidden sm:block">Wait</span>
          <span className="hidden sm:block">Top factor</span>
          <span className="hidden text-right sm:block">Status</span>
        </div>

        <ul className="divide-y divide-slate-200/80">
          {ordered.map((patient, index) => {
            const flash = updatedIds.has(patient.id)
            const isPreempted = patient.status === 'Preempted'

            return (
              <li
                key={patient.id}
                className={cn(
                  'grid grid-cols-[2.5rem_1fr] items-center gap-3 px-4 py-3.5 transition-colors sm:grid-cols-[2.5rem_1.6fr_5rem_6rem_1fr_7rem]',
                  flash && 'bg-amber-50',
                  isPreempted && 'bg-purple-100/90 border-l-4 border-l-purple-600',
                )}
              >
                <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 font-mono text-xs font-extrabold text-slate-800 border border-slate-200">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{patient.name}</span>
                    {isPreempted && (
                      <span className="text-[10px] font-mono font-extrabold text-white bg-purple-800 px-2 py-0.5 rounded shadow-2xs">
                        PREEMPTED ➔ STEP-DOWN
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-xs font-bold text-slate-700">
                    {patient.id} · P{Math.round(effectivePriority(patient))}
                  </p>
                  {/* Mobile-only detail row */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:hidden">
                    <SeverityBadge severity={patient.severity} />
                    <span className="flex items-center gap-1 text-xs text-slate-600 font-mono font-semibold">
                      <Clock className="size-3.5 text-slate-500" />
                      {patient.waitMinutes}m
                    </span>
                    <span
                      className={cn(
                        'rounded-lg px-2.5 py-1 text-xs font-bold shadow-2xs',
                        STATUS_STYLE[patient.status],
                      )}
                    >
                      {patient.status}
                    </span>
                  </div>
                </div>

                <div className="hidden sm:block">
                  <SeverityBadge severity={patient.severity} />
                </div>
                <span className="hidden items-center gap-1.5 font-mono text-xs font-extrabold text-slate-800 sm:flex">
                  <Clock className="size-3.5 text-slate-500" />
                  {patient.waitMinutes}m
                </span>
                <span className="hidden items-center gap-1.5 text-xs font-semibold text-slate-700 sm:flex">
                  <Activity className="size-3.5 shrink-0 text-emerald-600" />
                  <span className="truncate">{patient.topFactor}</span>
                </span>
                <span className="hidden justify-end sm:flex">
                  {patient.topFactor.startsWith('Referral from') ? (
                    <span className="rounded-lg bg-cyan-100 text-cyan-900 border border-cyan-300 px-3 py-1 text-xs font-extrabold flex items-center gap-1 shadow-2xs">
                      <CheckCircle2 className="size-3.5 text-cyan-700" />
                      Assigned (Referral)
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'rounded-lg px-3 py-1 text-xs font-extrabold shadow-2xs',
                        STATUS_STYLE[patient.status],
                      )}
                    >
                      {patient.status}
                    </span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
