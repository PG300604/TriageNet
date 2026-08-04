'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
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
    <aside className="relative z-20 flex w-16 shrink-0 flex-col border-r border-[#382416]/15 bg-[#fdfbf7] text-[#2c1b0e] md:w-64 font-sans shadow-2xs">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-[#382416]/15 px-4 md:px-5">
        <div className="flex size-9 items-center justify-center rounded-xl bg-[#382416] text-[#ffedd7] font-bold shadow-xs">
          <ShieldPlus className="size-5 text-[#dc5000]" />
        </div>
        <div className="hidden flex-col md:flex">
          <span className="font-mono text-sm font-bold uppercase tracking-wider text-[#382416]">
            TRIAGENET
          </span>
          <span className="text-[10px] font-mono text-[#6c5f51] uppercase">
            OPERATIONAL CONSOLE
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {PANACEA_NAV.map((item) => {
          const Icon = item.icon
          const isActive = active === item.key

          return (
            <motion.button
              key={item.key}
              type="button"
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange(item.key)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all cursor-pointer',
                isActive
                  ? 'bg-[#382416] text-[#ffedd7] shadow-xs'
                  : 'text-[#382416]/80 hover:bg-[#f7f2ea] hover:text-[#382416]',
              )}
            >
              <Icon className={cn('size-4 shrink-0', isActive ? 'text-[#dc5000]' : 'text-slate-400')} />
              <div className="hidden min-w-0 text-left md:block">
                <p className="truncate uppercase font-mono">{item.label}</p>
              </div>
              {item.key === 'queue' && criticalCount > 0 && (
                <span className="ml-auto hidden rounded-full bg-[#dc5000] px-2 py-0.5 font-mono text-[10px] font-bold text-white md:inline-block shadow-2xs">
                  {criticalCount}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </aside>
  )
}
