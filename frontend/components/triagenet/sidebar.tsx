'use client'

import { cn } from '@/lib/utils'
import {
  Activity,
  LayoutGrid,
  ListOrdered,
  Network,
  Users,
  Sparkles,
  CalendarDays,
  Stethoscope,
  BarChart3,
  FileText,
  Boxes,
  MessageSquare,
  BadgePercent,
  ShieldPlus,
} from 'lucide-react'

export type ViewKey =
  | 'capacity'
  | 'queue'
  | 'network'
  | 'patients'
  | 'aicds'
  | 'appointments'
  | 'clinical'
  | 'billing'
  | 'docs'
  | 'supplies'
  | 'reports'
  | 'comms'

const PANACEA_NAV: { key: ViewKey; label: string; icon: typeof LayoutGrid; hint: string }[] = [
  { key: 'capacity', label: 'Dashboard', icon: LayoutGrid, hint: 'Command & Analytics' },
  { key: 'patients', label: 'Patients', icon: Users, hint: 'Patient Records & ML Scorer' },
  { key: 'queue', label: 'Triage Queue', icon: ListOrdered, hint: 'Priority Heap' },
  { key: 'network', label: 'Regional Network', icon: Network, hint: 'Dijkstra Routing' },
  { key: 'aicds', label: 'AI CDS', icon: Sparkles, hint: 'Predictive Insights' },
  { key: 'appointments', label: 'Appointments', icon: CalendarDays, hint: 'Schedule & Triage' },
  { key: 'clinical', label: 'Clinical Operations', icon: Stethoscope, hint: 'Room & Bed Ops' },
  { key: 'billing', label: 'Billing & Revenue', icon: BadgePercent, hint: 'Financial Tracking' },
  { key: 'docs', label: 'MR & Docs', icon: FileText, hint: 'Patient Records' },
  { key: 'supplies', label: 'Inventory & Supplies', icon: Boxes, hint: 'Ventilators & Beds' },
  { key: 'reports', label: 'Reports & Analytics', icon: BarChart3, hint: 'Risk Telemetry' },
  { key: 'comms', label: 'Communications', icon: MessageSquare, hint: 'Dispatches' },
]

interface SidebarProps {
  active: ViewKey
  onChange: (view: ViewKey) => void
  criticalCount: number
}

export function Sidebar({ active, onChange, criticalCount }: SidebarProps) {
  return (
    <aside className="relative z-20 flex w-16 shrink-0 flex-col border-r border-border bg-card text-foreground md:w-64">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4 md:px-5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
          <ShieldPlus className="size-5" />
        </div>
        <div className="hidden md:block">
          <p className="text-base font-extrabold tracking-tight text-slate-900 flex items-center gap-1">
            Triage<span className="text-emerald-600">Net</span>
            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">v2.0</span>
          </p>
          <p className="text-[11px] text-muted-foreground font-sans">Healthcare SaaS Platform</p>
        </div>
      </div>

      {/* Sidebar Nav Items */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2 md:p-3">
        {PANACEA_NAV.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 cursor-pointer',
                isActive
                  ? 'bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80 shadow-xs'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground',
              )}
            >
              <Icon
                className={cn(
                  'size-4 shrink-0 transition-colors',
                  isActive ? 'text-emerald-600' : 'text-muted-foreground group-hover:text-foreground',
                )}
              />
              <span className="hidden flex-1 md:block">
                <span className="block text-xs md:text-sm font-medium">{item.label}</span>
              </span>
            </button>
          )
        })}
      </nav>

      {/* Critical Alert Tile */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-xl bg-red-50 p-2.5 border border-red-200">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-500/20 text-red-600">
            <Activity className="size-4 shrink-0" />
          </span>
          <div className="hidden md:block">
            <p className="text-xs font-bold text-red-900">
              {criticalCount} Critical Cases
            </p>
            <p className="text-[11px] text-red-700">Regional Triage Active</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
