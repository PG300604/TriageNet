import React from 'react'
import {
  Inbox,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  LucideIcon,
  Plus,
  RefreshCw,
} from 'lucide-react'

export type EmptyStateType =
  | 'no_patients'
  | 'no_shortages'
  | 'no_transfers'
  | 'no_alerts'
  | 'no_search_results'
  | 'generic'

interface EmptyStateProps {
  type?: EmptyStateType
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  icon?: LucideIcon
  className?: string
}

const PRESETS: Record<
  EmptyStateType,
  { icon: LucideIcon; title: string; description: string; color: string; badge: string }
> = {
  no_patients: {
    icon: UserCheck,
    title: 'No Waiting Patients in Queue',
    description: 'All inbound triage casualties have been stabilized or assigned to hospital bays.',
    color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    badge: 'WARD NOMINAL',
  },
  no_shortages: {
    icon: CheckCircle2,
    title: 'All Clinical Resources Balanced',
    description: 'General beds, ICU capacity, and oxygen flow rates are within safe statutory thresholds.',
    color: 'text-sky-400 bg-sky-950/40 border-sky-800/40',
    badge: 'ZERO BOTTLENECKS',
  },
  no_transfers: {
    icon: ShieldCheck,
    title: 'No Active Inter-District Referrals',
    description: 'No ambulances are currently requesting cross-district trauma transfers.',
    color: 'text-amber-400 bg-amber-950/40 border-amber-800/40',
    badge: 'CORRIDOR CLEAR',
  },
  no_alerts: {
    icon: CheckCircle2,
    title: 'Zero Critical Telemetry Alerts',
    description: 'PSA oxygen purity is >93% and municipal traffic corridor locks are operating normally.',
    color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40',
    badge: 'ALL SYSTEMS GREEN',
  },
  no_search_results: {
    icon: AlertCircle,
    title: 'No Matching Facilities or Personnel',
    description: 'No records match the active search filter. Try adjusting your query or district selector.',
    color: 'text-stone-400 bg-stone-900 border-stone-800',
    badge: 'FILTER APPLIED',
  },
  generic: {
    icon: Inbox,
    title: 'No Operational Data Available',
    description: 'There are no active records registered under this telemetry category.',
    color: 'text-stone-400 bg-stone-900 border-stone-800',
    badge: 'EMPTY REGISTRY',
  },
}

export function EmptyState({
  type = 'generic',
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = '',
}: EmptyStateProps) {
  const preset = PRESETS[type]
  const IconComponent = icon || preset.icon

  return (
    <div
      className={`rounded-2xl border border-dashed border-stone-800/80 bg-stone-950/40 p-8 text-center flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      <div className="relative">
        <div
          className={`size-14 rounded-2xl flex items-center justify-center border shadow-lg ${preset.color}`}
        >
          <IconComponent className="size-7" />
        </div>
      </div>

      <div className="space-y-1.5 max-w-sm">
        <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2.5 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400">
          {preset.badge}
        </span>
        <h4 className="text-sm font-bold text-stone-200 pt-1">{title || preset.title}</h4>
        <p className="text-xs text-stone-400 leading-relaxed">
          {description || preset.description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center gap-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-200 hover:text-white px-3.5 py-2 text-xs font-semibold border border-stone-700 transition-all active:scale-95 cursor-pointer shadow-sm"
        >
          <Plus className="size-3.5 text-stone-400" />
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  )
}
