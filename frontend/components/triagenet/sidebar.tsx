'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useAuth, UserRole } from '@/lib/auth-context'
import { motion } from 'framer-motion'
import {
  LayoutGrid,
  ListOrdered,
  Network,
  Users,
  Sparkles,
  Stethoscope,
  BarChart3,
  FileText,
  Boxes,
  MessageSquare,
  BadgePercent,
  Shield,
  Building2,
  User,
  Hospital,
  Truck,
  Search,
  LogOut,
  Radio,
} from 'lucide-react'

export type ViewKey =
  | 'capacity'
  | 'queue'
  | 'network'
  | 'patients'
  | 'aicds'
  | 'doctors'
  | 'clinical'
  | 'billing'
  | 'docs'
  | 'supplies'
  | 'reports'
  | 'comms'

interface NavItem {
  key: ViewKey
  label: string
  icon: typeof LayoutGrid
  hint: string
  group: 'clinical' | 'analytics'
}

const TRIAGENET_NAV: NavItem[] = [
  // Clinical & Emergency Command
  { key: 'capacity', label: 'Dashboard', icon: LayoutGrid, hint: 'Capacity & Metrics', group: 'clinical' },
  { key: 'patients', label: 'Patients', icon: Users, hint: 'Records & ML Scorer', group: 'clinical' },
  { key: 'queue', label: 'Triage Queue', icon: ListOrdered, hint: 'Priority Heap', group: 'clinical' },
  { key: 'network', label: 'Regional Network', icon: Network, hint: '108 Dispatch & Map', group: 'clinical' },
  { key: 'doctors', label: 'Doctor Availability', icon: Stethoscope, hint: 'On-Duty Specialist Roster', group: 'clinical' },
  { key: 'clinical', label: 'Clinical Ops', icon: Building2, hint: 'Bed & Ward Operations', group: 'clinical' },

  // Analytics, Inventory & Governance
  { key: 'aicds', label: 'AI Decision Support', icon: Sparkles, hint: 'Predictive CDS', group: 'analytics' },
  { key: 'supplies', label: 'Inventory & Supplies', icon: Boxes, hint: 'Ventilators & Beds', group: 'analytics' },
  { key: 'reports', label: 'Reports & Analytics', icon: BarChart3, hint: 'Risk Telemetry', group: 'analytics' },
  { key: 'billing', label: 'Billing & Ayushman', icon: BadgePercent, hint: 'Financial Triage', group: 'analytics' },
  { key: 'docs', label: 'EHR Records', icon: FileText, hint: 'Medical Documents', group: 'analytics' },
  { key: 'comms', label: 'Communications', icon: MessageSquare, hint: 'Emergency Channel', group: 'analytics' },
]

export const ROLE_ALLOWED_VIEWS: Record<UserRole, ViewKey[]> = {
  SUPER_ADMIN: [
    'capacity', 'patients', 'queue', 'network', 'doctors', 'clinical',
    'aicds', 'supplies', 'reports', 'billing', 'docs', 'comms'
  ],
  STATE_HEALTH_DEPT: [
    'capacity', 'network', 'doctors', 'supplies', 'reports', 'comms'
  ],
  DISTRICT_CMO: [
    'capacity', 'patients', 'queue', 'network', 'doctors', 'clinical', 'supplies', 'reports', 'comms'
  ],
  HOSPITAL_ADMIN: [
    'capacity', 'patients', 'queue', 'doctors', 'clinical', 'billing', 'supplies', 'docs'
  ],
  TRIAGE_NURSE: [
    'queue', 'patients', 'doctors', 'aicds'
  ],
  AMBULANCE_DISPATCH: [
    'network', 'queue', 'comms'
  ],
}

export const ROLE_CONFIGS: Record<UserRole, { title: string; badge: string; color: string; icon: typeof Shield }> = {
  SUPER_ADMIN: { title: 'State Health Command', badge: 'SUPER ADMIN', color: 'bg-stone-900 text-stone-100 border-stone-700', icon: Shield },
  STATE_HEALTH_DEPT: { title: 'State Health Dept', badge: 'GOVERNANCE', color: 'bg-emerald-900 text-emerald-100 border-emerald-700', icon: Building2 },
  DISTRICT_CMO: { title: 'District CMO', badge: 'CMO COMMAND', color: 'bg-[#382416] text-[#ffedd7] border-[#ea580c]/40', icon: User },
  HOSPITAL_ADMIN: { title: 'Medical Superintendent', badge: 'HOSPITAL ADMIN', color: 'bg-stone-800 text-stone-100 border-stone-600', icon: Hospital },
  TRIAGE_NURSE: { title: 'Emergency Triage Nurse', badge: 'TRIAGE LEAD', color: 'bg-rose-900 text-rose-100 border-rose-700', icon: Stethoscope },
  AMBULANCE_DISPATCH: { title: '108 Dispatch Control', badge: 'DISPATCH CONTROL', color: 'bg-amber-900 text-amber-100 border-amber-700', icon: Truck },
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
  const { user, logout } = useAuth()
  const [navSearch, setNavSearch] = useState('')
  const currentRole: UserRole = user?.role || 'SUPER_ADMIN'
  const allowedViews = ROLE_ALLOWED_VIEWS[currentRole] || ROLE_ALLOWED_VIEWS.SUPER_ADMIN
  const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.SUPER_ADMIN
  const RoleIcon = roleConfig.icon

  const filteredNav = TRIAGENET_NAV.filter(
    (item) => allowedViews.includes(item.key) &&
      (item.label.toLowerCase().includes(navSearch.toLowerCase()) ||
       item.hint.toLowerCase().includes(navSearch.toLowerCase()))
  )

  const clinicalItems = filteredNav.filter(item => item.group === 'clinical')
  const analyticsItems = filteredNav.filter(item => item.group === 'analytics')

  return (
    <aside className="relative z-30 flex w-16 shrink-0 flex-col border-r border-stone-200/80 bg-white text-[#2c1b0e] md:w-64 font-sans shadow-xs transition-all">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-stone-100 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative size-10 overflow-hidden rounded-xl shadow-xs border border-[#382416]/10 bg-[#382416] shrink-0 flex items-center justify-center">
            <Image
              src="/triagenet-logo.png"
              alt="TriageNet"
              width={40}
              height={40}
              className="object-cover size-full"
              priority
            />
          </div>
          <div className="hidden min-w-0 md:block">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-extrabold tracking-tight text-[#382416]">
                TriageNet
              </span>
              <span className="rounded-md bg-[#ea580c]/10 px-1.5 py-0.5 text-[10px] font-bold text-[#ea580c]">
                v4.0
              </span>
            </div>
            <p className="text-[11px] font-medium text-stone-400 truncate">
              Jharkhand Health Network
            </p>
          </div>
        </div>
      </div>

      {/* Quick Search Input (Inspired by Bright Leads) */}
      <div className="hidden px-3 pt-3 pb-1 md:block">
        <div className="relative flex items-center">
          <Search className="pointer-events-none absolute left-2.5 size-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Quick search..."
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            className="w-full rounded-xl border border-stone-200 bg-stone-50/60 py-1.5 pl-8 pr-8 text-xs font-medium text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-[#ea580c] focus:bg-white focus:ring-1 focus:ring-[#ea580c]/30"
          />
          <kbd className="pointer-events-none absolute right-2 rounded bg-stone-200/70 px-1.5 py-0.5 text-[9px] font-semibold text-stone-500">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Clinical Command Group */}
        {clinicalItems.length > 0 && (
          <div className="space-y-1">
            <div className="hidden px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 md:block">
              Clinical Command
            </div>
            {clinicalItems.map((item) => {
              const Icon = item.icon
              const isActive = active === item.key

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onChange(item.key)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer text-left',
                    isActive
                      ? 'bg-[#382416] text-[#ffedd7] shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100/80 hover:text-stone-900',
                  )}
                >
                  <div className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-[#ea580c] text-white shadow-2xs' : 'text-stone-400 group-hover:text-[#ea580c]'
                  )}>
                    <Icon className="size-3.5" />
                  </div>
                  <div className="hidden min-w-0 flex-1 md:block">
                    <p className="truncate text-xs font-semibold">{item.label}</p>
                    <p className={cn('text-[10px] truncate', isActive ? 'text-stone-300' : 'text-stone-400')}>
                      {item.hint}
                    </p>
                  </div>
                  {item.key === 'queue' && criticalCount > 0 && (
                    <span className="ml-auto hidden rounded-full bg-[#ea580c] px-2 py-0.5 text-[10px] font-bold text-white md:inline-block shadow-2xs">
                      {criticalCount}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}

        {/* Analytics & Governance Group */}
        {analyticsItems.length > 0 && (
          <div className="space-y-1">
            <div className="hidden px-2.5 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 md:block">
              Analytics & Ops
            </div>
            {analyticsItems.map((item) => {
              const Icon = item.icon
              const isActive = active === item.key

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onChange(item.key)}
                  className={cn(
                    'group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-xs font-semibold transition-all cursor-pointer text-left',
                    isActive
                      ? 'bg-[#382416] text-[#ffedd7] shadow-xs'
                      : 'text-stone-600 hover:bg-stone-100/80 hover:text-stone-900',
                  )}
                >
                  <div className={cn(
                    'flex size-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                    isActive ? 'bg-[#ea580c] text-white shadow-2xs' : 'text-stone-400 group-hover:text-[#ea580c]'
                  )}>
                    <Icon className="size-3.5" />
                  </div>
                  <div className="hidden min-w-0 flex-1 md:block">
                    <p className="truncate text-xs font-semibold">{item.label}</p>
                    <p className={cn('text-[10px] truncate', isActive ? 'text-stone-300' : 'text-stone-400')}>
                      {item.hint}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Modern User Profile Card (Bright Leads & Boltshift pattern) */}
      <div className="border-t border-stone-100 p-3">
        <div className="hidden md:flex items-center gap-2.5 rounded-xl border border-stone-200/80 bg-stone-50/70 p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#382416] text-xs font-bold text-[#ffedd7] shadow-2xs">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'PG'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-xs font-bold text-stone-800">
                {user?.name || 'Dr. Prabhat Kumar'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={cn('rounded px-1.5 py-0.2 text-[9px] font-bold border', roleConfig.color)}>
                {roleConfig.badge}
              </span>
              <span className="truncate text-[10px] text-stone-400">
                {user?.districtName || 'Ranchi'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            title="Lock shift / Logout"
            className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200 hover:text-stone-700 transition-colors"
          >
            <LogOut className="size-3.5" />
          </button>
        </div>

        {/* Mobile icon-only user circle */}
        <div className="flex justify-center md:hidden">
          <div className="flex size-9 items-center justify-center rounded-full bg-[#382416] text-xs font-bold text-[#ffedd7]">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'TN'}
          </div>
        </div>
      </div>
    </aside>
  )
}
