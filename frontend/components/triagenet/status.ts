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
