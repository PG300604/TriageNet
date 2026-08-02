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
import { STATUS_CLASSES } from './status'
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
  Waiting: 'bg-status-amber-soft text-status-amber-foreground',
  Assigned: 'bg-secondary text-secondary-foreground font-medium',
  Preempted: 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold',
  Transferred: 'bg-status-green-soft text-status-green',
}

function SeverityBadge({ severity }: { severity: number }) {
  const status = severityStatus(severity)
  return (
    <span
      className={cn(
        'skeu-chip inline-flex min-w-11 items-center justify-center rounded-md px-2 py-1 font-mono text-sm font-semibold',
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
    <div className="flex flex-col gap-4">
      {/* Live Operational Notification Alert */}
      {lastEventMessage && (
        <div className="skeu-raised flex items-center justify-between rounded-xl border border-primary/50 bg-primary/10 p-4 text-foreground backdrop-blur-md animate-pulse">
          <div className="flex items-center gap-3">
            <Zap className="size-5 text-primary shrink-0" />
            <div>
              <span className="font-mono text-xs font-bold text-primary uppercase tracking-wider block">
                OPERATIONAL TRIAGE SYSTEM EVENT
              </span>
              <p className="text-sm font-medium">{lastEventMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Regional Referral Load-Balancing Banner */}
      {referralRecommendation && onExecuteReferral && (
        <div className="skeu-raised flex flex-wrap items-center justify-between gap-3 rounded-xl border border-cyan-500/50 bg-cyan-950/30 p-4 text-cyan-200">
          <div className="flex items-center gap-3">
            <Network className="size-5 text-cyan-400 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  REGIONAL LOAD-BALANCING REFERRAL AVAILABLE
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded">
                  {referralRecommendation.matchReason}
                </span>
              </div>
              <p className="text-sm font-medium text-cyan-100 mt-0.5">{referralRecommendation.reason}</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => onExecuteReferral(referralRecommendation)}
            className="skeu-chip skeu-pressable bg-cyan-500 text-slate-950 hover:bg-cyan-400 font-bold"
            size="sm"
          >
            <span>Execute Referral to {referralRecommendation.toHospitalName}</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            Triage Queue — {hospital.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {ordered.length} patients · sorted by effective priority (acuity + wait)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Real-World Bed Release Triggers */}
          {onTriggerBedRelease && (
            <>
              <Button
                type="button"
                onClick={() => onTriggerBedRelease('recovery')}
                variant="outline"
                className="skeu-chip skeu-pressable border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs"
                size="sm"
                title="Simulate patient early recovery discharge, immediately freeing a bed"
              >
                <CheckCircle2 className="size-3.5 text-emerald-400" />
                <span>Early Recovery Discharge</span>
              </Button>

              <Button
                type="button"
                onClick={() => onTriggerBedRelease('family_ama')}
                variant="outline"
                className="skeu-chip skeu-pressable border-amber-500/40 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs"
                size="sm"
                title="Simulate family taking patient to another facility (AMA relocation)"
              >
                <LogOut className="size-3.5 text-amber-400" />
                <span>Family AMA Relocation</span>
              </Button>
            </>
          )}

          {/* Simulated Patient Arrival Injections */}
          {onInjectArrival && (
            <>
              <Button
                type="button"
                onClick={() =>
                  onInjectArrival(
                    94,
                    'Ambulance Arrival (Cardiac Arrest)',
                    'Ventricular Fibrillation (SpO₂ 76%)',
                  )
                }
                variant="destructive"
                className="skeu-chip skeu-pressable font-bold text-xs"
                size="sm"
              >
                <AlertTriangle className="size-3.5" />
                <span>Critical Arrival (Preempt)</span>
              </Button>

              <Button
                type="button"
                onClick={() =>
                  onInjectArrival(
                    45,
                    'Walk-in Patient (Sprain)',
                    'Ankle Laceration / Mild Swelling',
                  )
                }
                variant="outline"
                className="skeu-chip skeu-pressable border-border bg-background hover:bg-muted text-xs"
                size="sm"
              >
                <UserPlus className="size-3.5 text-primary" />
                <span>Routine Arrival (Hold)</span>
              </Button>
            </>
          )}

          <Button
            type="button"
            onClick={onSimulate}
            variant="outline"
            className="skeu-chip skeu-pressable border-border bg-background hover:bg-muted text-xs"
            size="sm"
          >
            <Play className="size-3.5 text-primary" />
            <span>+7m Step</span>
          </Button>

          {onFastForward5x && (
            <Button
              type="button"
              onClick={onFastForward5x}
              className="skeu-chip skeu-pressable bg-primary text-primary-foreground hover:bg-primary/90 font-bold text-xs"
              size="sm"
            >
              <FastForward className="size-4" />
              <span>Fast Forward 5x (+35m)</span>
            </Button>
          )}
        </div>
      </div>

      <div className="skeu-raised overflow-hidden rounded-xl border border-border bg-card">
        <div className="skeu-inset grid grid-cols-[2.5rem_1fr] items-center gap-3 border-b border-border bg-muted/60 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid-cols-[2.5rem_1.6fr_5rem_6rem_1fr_7rem]">
          <span className="flex items-center gap-1">
            <ArrowUpDown className="size-3" />#
          </span>
          <span>Patient</span>
          <span className="hidden sm:block">Severity</span>
          <span className="hidden sm:block">Wait</span>
          <span className="hidden sm:block">Top factor</span>
          <span className="hidden text-right sm:block">Status</span>
        </div>

        <ul>
          {ordered.map((patient, index) => {
            const flash = updatedIds.has(patient.id)
            const isPreempted = patient.status === 'Preempted'

            return (
              <li
                key={patient.id}
                className={cn(
                  'grid grid-cols-[2.5rem_1fr] items-center gap-3 border-b border-border px-4 py-3 last:border-b-0 transition-colors sm:grid-cols-[2.5rem_1.6fr_5rem_6rem_1fr_7rem]',
                  flash && 'triage-row-flash',
                  isPreempted && 'bg-purple-950/20 border-purple-500/30',
                )}
              >
                <span className="skeu-chip flex size-7 items-center justify-center rounded-full bg-secondary font-mono text-sm font-semibold text-secondary-foreground">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground flex items-center gap-2">
                    <span>{patient.name}</span>
                    {isPreempted && (
                      <span className="text-[10px] font-mono font-bold text-purple-400 bg-purple-500/20 px-1.5 py-0.5 rounded border border-purple-500/40">
                        PREEMPTED ➔ STEP-DOWN
                      </span>
                    )}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {patient.id} · P{Math.round(effectivePriority(patient))}
                  </p>
                  {/* Mobile-only detail row */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:hidden">
                    <SeverityBadge severity={patient.severity} />
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {patient.waitMinutes}m
                    </span>
                    <span
                      className={cn(
                        'skeu-chip rounded-full px-2 py-0.5 text-xs font-medium',
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
                <span className="hidden items-center gap-1 font-mono text-sm text-foreground sm:flex">
                  <Clock className="size-3.5 text-muted-foreground" />
                  {patient.waitMinutes}m
                </span>
                <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
                  <Activity className="size-3.5 shrink-0 text-primary" />
                  <span className="truncate">{patient.topFactor}</span>
                </span>
                <span className="hidden justify-end sm:flex">
                  {patient.topFactor.startsWith('Referral from') ? (
                    <span className="skeu-chip rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 className="size-3 text-cyan-400" />
                      Assigned (Referral)
                    </span>
                  ) : (
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-medium',
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
