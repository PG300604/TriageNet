'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

import { useAuth, UserRole } from '@/lib/auth-context'
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
  Shield,
  Building2,
  User,
  Hospital,
  Truck,
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

export const ROLE_ALLOWED_VIEWS: Record<UserRole, ViewKey[]> = {
  SUPER_ADMIN: [
    'capacity', 'patients', 'queue', 'network', 'aicds',
    'appointments', 'clinical', 'billing', 'docs', 'supplies', 'reports', 'comms'
  ],
  STATE_HEALTH_DEPT: [
    'capacity', 'network', 'supplies', 'reports', 'comms'
  ],
  DISTRICT_CMO: [
    'capacity', 'queue', 'network', 'clinical', 'reports', 'comms'
  ],
  HOSPITAL_ADMIN: [
    'capacity', 'clinical', 'appointments', 'billing', 'supplies', 'docs'
  ],
  TRIAGE_NURSE: [
    'queue', 'patients', 'aicds'
  ],
  AMBULANCE_DISPATCH: [
    'network', 'queue', 'comms'
  ]
}

export const ROLE_CONFIGS: Record<UserRole, { title: string; badge: string; color: string; icon: typeof Shield }> = {
  SUPER_ADMIN: { title: 'System Super Admin', badge: 'GLOBAL ADMIN', color: 'bg-purple-900/90 text-purple-200 border-purple-500/30', icon: Shield },
  STATE_HEALTH_DEPT: { title: 'State Health Dept', badge: 'GOVERNANCE', color: 'bg-emerald-900/90 text-emerald-200 border-emerald-500/30', icon: Building2 },
  DISTRICT_CMO: { title: 'District CMO (Ranchi)', badge: 'CMO COMMAND', color: 'bg-amber-900/90 text-amber-200 border-amber-500/30', icon: User },
  HOSPITAL_ADMIN: { title: 'Medical Supt. (RIMS)', badge: 'HOSPITAL ADMIN', color: 'bg-blue-900/90 text-blue-200 border-blue-500/30', icon: Hospital },
  TRIAGE_NURSE: { title: 'Emergency Triage Nurse', badge: 'ED INTAKE', color: 'bg-red-900/90 text-red-200 border-red-500/30', icon: Stethoscope },
  AMBULANCE_DISPATCH: { title: '108 Ambulance Dispatch', badge: 'DISPATCH CONTROL', color: 'bg-orange-900/90 text-orange-200 border-orange-500/30', icon: Truck },
}

export function Sidebar({
  active,
  onChange,
  criticalCount = 0,
}: {
  active: ViewKey
  onChange: (view: ViewKey) => void
  criticalCount?: number
}) {
  const { user } = useAuth()
  const currentRole: UserRole = user?.role || 'SUPER_ADMIN'
  const allowedViews = ROLE_ALLOWED_VIEWS[currentRole] || ROLE_ALLOWED_VIEWS.SUPER_ADMIN
  const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.SUPER_ADMIN
  const RoleIcon = roleConfig.icon

  const filteredNav = PANACEA_NAV.filter((item) => allowedViews.includes(item.key))

  return (
    <aside className="relative z-20 flex w-16 shrink-0 flex-col border-r border-[#382416]/15 bg-[#fdfbf7] text-[#2c1b0e] md:w-64 font-sans shadow-2xs">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-[#382416]/15 px-3 md:px-4">
        <div className="relative size-10 overflow-hidden rounded-xl shadow-xs shrink-0 border border-[#382416]/20 bg-[#382416]">
          <Image
            src="/triagenet-logo.png"
            alt="TriageNet Official Logo"
            width={40}
            height={40}
            className="object-cover"
            priority
          />
        </div>
        <div className="hidden flex-col md:flex min-w-0">
          <span className="font-mono text-sm font-bold uppercase tracking-wider text-[#382416] truncate">
            TRIAGENET
          </span>
          <span className="text-[9px] font-mono text-[#6c5f51] uppercase truncate">
            JHARKHAND HEALTH NETWORK
          </span>
        </div>
      </div>

      {/* RBAC Role Context Banner in Sidebar */}
      <div className="hidden md:block p-3 mx-3 mt-3 rounded-xl border bg-white/60 backdrop-blur-xs shadow-2xs">
        <div className="flex items-center gap-2 mb-1">
          <RoleIcon className="size-3.5 text-[#382416]" />
          <span className="text-[11px] font-bold text-[#382416] truncate">{user?.name || 'Dr. Priyanshu Ghosh'}</span>
        </div>
        <div className={cn('inline-block font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase', roleConfig.color)}>
          [{roleConfig.badge}]
        </div>
        <p className="text-[10px] text-slate-500 mt-1 truncate">{user?.districtName || 'Ranchi District'}</p>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="hidden md:block px-2 pb-1.5 text-[9px] font-mono font-bold uppercase text-slate-400 tracking-wider">
          AUTHORIZATION PERMITTED VIEWS ({filteredNav.length})
        </div>

        {filteredNav.map((item) => {
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
