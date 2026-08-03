import type { CapacityStatus } from '@/lib/triage-data'

interface StatusClasses {
  /** solid bar / dot fill */
  bar: string
  /** soft badge background + text */
  badge: string
  /** hex-ish token used for SVG fills/strokes */
  token: string
  dot: string
}

export const STATUS_CLASSES: Record<CapacityStatus, StatusClasses> = {
  green: {
    bar: 'bg-status-green',
    badge: 'bg-status-green-soft text-status-green',
    token: 'var(--status-green)',
    dot: 'bg-status-green',
  },
  amber: {
    bar: 'bg-status-amber',
    badge: 'bg-status-amber-soft text-status-amber-foreground',
    token: 'var(--status-amber)',
    dot: 'bg-status-amber',
  },
  red: {
    bar: 'bg-status-red',
    badge: 'bg-status-red-soft text-status-red',
    token: 'var(--status-red)',
    dot: 'bg-status-red',
  },
}

export function getPatientStatusBadgeClass(status: string): string {
  switch (status) {
    case 'Discharged':
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
    case 'Assigned':
      return 'bg-slate-100 text-slate-700 border border-slate-300 font-medium'
    case 'Preempted':
      return 'bg-amber-100 text-amber-800 border border-amber-300 font-semibold'
    case 'Transferred':
      return 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-semibold'
    case 'Waiting':
    default:
      return 'bg-red-100 text-red-800 border border-red-300 font-semibold'
  }
}
