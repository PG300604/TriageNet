'use client'

import { cn } from '@/lib/utils'
import type { Hospital, Patient, ScenarioKey } from '@/lib/triage-data'
import {
  Building2,
  Check,
  ChevronDown,
  Play,
  Pause,
  ShieldAlert,
  Siren,
  TrendingUp,
  FastForward,
  Search,
  Bell,
  User,
  X,
  AlertTriangle,
  Sparkles,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface TopBarProps {
  hospitals: Hospital[]
  patients?: Patient[]
  selectedHospitalId: string
  onSelectHospital: (id: string) => void
  scenario: ScenarioKey
  onRunScenario: (scenario: ScenarioKey) => void
  onFastForward?: (stepMinutes: number) => void
  isPlaying?: boolean
  onTogglePlay?: () => void
  onNavigateView?: (view: string) => void
}

const SCENARIOS: {
  key: ScenarioKey
  label: string
  desc: string
  icon: typeof Play
}[] = [
  { key: 'steady', label: 'Steady State', desc: 'Baseline regional load', icon: Play },
  {
    key: 'mass-casualty',
    label: 'Mass Casualty Event',
    desc: 'Surge & overflow at City General',
    icon: Siren,
  },
  {
    key: 'regional-surge',
    label: 'Regional Surge',
    desc: 'Elevated load network-wide',
    icon: TrendingUp,
  },
]

function useClickOutside(onClose: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [onClose])
  return ref
}

export function TopBar({
  hospitals,
  patients = [],
  selectedHospitalId,
  onSelectHospital,
  scenario,
  onRunScenario,
  onFastForward,
  isPlaying,
  onTogglePlay,
  onNavigateView,
}: TopBarProps) {
  const [hospitalOpen, setHospitalOpen] = useState(false)
  const [scenarioOpen, setScenarioOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const hospitalRef = useClickOutside(() => setHospitalOpen(false))
  const scenarioRef = useClickOutside(() => setScenarioOpen(false))
  const notifRef = useClickOutside(() => setNotifOpen(false))
  const searchRef = useClickOutside(() => setSearchTerm(''))

  const selected = hospitals.find((h) => h.id === selectedHospitalId) ?? hospitals[0]
  const activeScenario = SCENARIOS.find((s) => s.key === scenario) ?? SCENARIOS[0]

  const searchResults = searchTerm.trim()
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.topFactor.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : []

  const notifications = [
    { title: 'Sepsis Risk Flagged', desc: 'SpO₂ 84% & HR 118 bpm detected for Alan Whitfield', time: '2m ago', type: 'critical' },
    { title: 'Dijkstra Referral Executed', desc: 'Patient Sofia Márquez routed ➔ Riverside Medical', time: '12m ago', type: 'info' },
    { title: 'Early Bed Release', desc: 'ICU Bed #03 freed at City General', time: '24m ago', type: 'success' },
  ]

  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-white px-4 md:px-6 shadow-2xs font-sans">
      {/* Facility Selector */}
      <div className="flex items-center gap-3">
        <div className="relative" ref={hospitalRef}>
          <button
            type="button"
            onClick={() => setHospitalOpen((v) => !v)}
            aria-expanded={hospitalOpen}
            aria-haspopup="listbox"
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-left transition-all hover:bg-slate-100 cursor-pointer"
          >
            <Building2 className="size-4 text-slate-500" />
            <span className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400">Selected Facility</span>
              <span className="text-xs md:text-sm font-bold text-slate-900 leading-tight">{selected.name}</span>
            </span>
            <ChevronDown
              className={cn(
                'size-4 text-slate-500 transition-transform',
                hospitalOpen && 'rotate-180',
              )}
            />
          </button>
          {hospitalOpen && (
            <ul
              role="listbox"
              className="absolute left-0 top-[calc(100%+6px)] z-40 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
            >
              {hospitals.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={h.id === selected.id}
                    onClick={() => {
                      onSelectHospital(h.id)
                      setHospitalOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-slate-50 cursor-pointer',
                      h.id === selected.id && 'bg-emerald-50 text-emerald-800 font-bold',
                    )}
                  >
                    <span>{h.name}</span>
                    {h.id === selected.id && <Check className="size-4 text-emerald-600" />}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Global Search Bar */}
        <div className="relative hidden md:block" ref={searchRef}>
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20">
            <Search className="size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search patients, vitals, beds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchTerm && (
              <button type="button" onClick={() => setSearchTerm('')}>
                <X className="size-3.5 text-slate-400 hover:text-slate-600" />
              </button>
            )}
          </div>

          {/* Real-time Search Dropdown */}
          {searchTerm.trim() !== '' && (
            <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
              <p className="px-2 py-1 text-[10px] font-bold uppercase text-slate-400">Search Results ({searchResults.length})</p>
              {searchResults.length === 0 ? (
                <p className="p-3 text-center text-xs text-slate-500 font-sans">No matching records found.</p>
              ) : (
                <div className="space-y-1">
                  {searchResults.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (onNavigateView) onNavigateView('patients')
                        setSearchTerm('')
                      }}
                      className="flex w-full items-center justify-between rounded-lg p-2 text-left text-xs hover:bg-slate-50 cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{p.name}</span>
                        <span className="text-[11px] text-slate-500">{p.topFactor}</span>
                      </div>
                      <span className="font-mono text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        S: {p.severity}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FAST FORWARD SIMULATION CONTROLS */}
      <div className="hidden items-center gap-2 lg:flex">
        {onFastForward && (
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => onFastForward(7)}
              className="rounded-lg px-2.5 py-1 font-mono text-xs font-bold text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer"
            >
              +7m Step
            </button>

            <button
              type="button"
              onClick={() => onFastForward(35)}
              className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1 font-mono text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
            >
              <FastForward className="size-3.5" />
              <span>5x (+35m)</span>
            </button>

            {onTogglePlay && (
              <button
                type="button"
                onClick={onTogglePlay}
                className={cn(
                  'flex items-center gap-1 rounded-lg px-3 py-1 font-mono text-xs font-bold transition-all cursor-pointer',
                  isPlaying
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50',
                )}
              >
                {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 text-emerald-600" />}
                <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Role badge */}
        <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 sm:flex">
          <ShieldAlert className="size-4 text-emerald-600" />
          <span className="text-xs font-bold text-emerald-800">
            Regional Coordinator
          </span>
        </div>

        {/* Interactive Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <Bell className="size-4" />
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-red-600 font-mono text-[10px] font-bold text-white">
              3
            </span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-40 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-xl font-sans">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-900">Telemetry Notifications</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">Live</span>
              </div>
              <div className="space-y-2">
                {notifications.map((n, idx) => (
                  <div key={idx} className="rounded-lg bg-slate-50 p-2.5 border border-slate-200/80">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-900">{n.title}</span>
                      <span className="text-[10px] font-mono text-slate-400">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-tight">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Run Scenario Button */}
        <div className="relative" ref={scenarioRef}>
          <button
            type="button"
            onClick={() => setScenarioOpen((v) => !v)}
            aria-expanded={scenarioOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-red-700 cursor-pointer"
          >
            <activeScenario.icon className="size-4" />
            <span className="hidden sm:inline">Run Scenario</span>
            <ChevronDown
              className={cn('size-4 transition-transform', scenarioOpen && 'rotate-180')}
            />
          </button>
          {scenarioOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+6px)] z-40 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xl"
            >
              <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Simulate Scenario
              </p>
              {SCENARIOS.map((s) => {
                const Icon = s.icon
                const isActive = s.key === scenario
                return (
                  <button
                    key={s.key}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      onRunScenario(s.key)
                      setScenarioOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs transition-colors hover:bg-slate-50 cursor-pointer',
                      isActive && 'bg-slate-100 font-bold',
                    )}
                  >
                    <Icon
                      className={cn(
                        'mt-0.5 size-4 shrink-0',
                        s.key === 'steady' ? 'text-slate-500' : 'text-red-600',
                      )}
                    />
                    <span className="flex flex-1 flex-col">
                      <span className="text-xs font-bold text-slate-900">{s.label}</span>
                      <span className="text-[11px] text-slate-500">{s.desc}</span>
                    </span>
                    {isActive && <Check className="mt-0.5 size-4 text-emerald-600" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
