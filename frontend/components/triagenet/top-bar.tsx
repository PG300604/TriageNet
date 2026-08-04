'use client'

import { cn } from '@/lib/utils'
import type { Hospital, Patient, ScenarioKey } from '@/lib/triage-data'
import {
  Building2,
  Check,
  ChevronDown,
  Play,
  Pause,
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
  isPlaying = false,
  onTogglePlay,
  onNavigateView,
}: TopBarProps) {
  const [hospOpen, setHospOpen] = useState(false)
  const [scenOpen, setScenOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) ?? hospitals[0]

  const hospRef = useClickOutside(() => setHospOpen(false))
  const scenRef = useClickOutside(() => setScenOpen(false))
  const searchRef = useClickOutside(() => setSearchOpen(false))

  const searchResults = searchQuery.trim()
    ? patients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.topFactor.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : []

  return (
    <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#382416]/15 bg-[#fdfbf7]/95 px-4 md:px-6 font-sans text-[#2c1b0e] shadow-2xs backdrop-blur-md">
      {/* Left: Hospital Switcher & Search */}
      <div className="flex items-center gap-3">
        {/* Hospital Dropdown */}
        <div ref={hospRef} className="relative z-50">
          <button
            type="button"
            onClick={() => setHospOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#382416]/20 bg-white px-3.5 py-2 font-mono text-xs font-bold text-[#382416] hover:bg-[#f7f2ea] cursor-pointer shadow-2xs"
          >
            <Building2 className="size-4 text-[#dc5000]" />
            <span>{selectedHospital?.name ?? 'Select Hospital'}</span>
            <ChevronDown className="size-3.5 text-slate-400" />
          </button>

          {hospOpen && (
            <div className="absolute left-0 top-full mt-2 z-[100] w-64 rounded-xl border border-[#382416]/20 bg-white p-2 shadow-2xl space-y-1">
              {hospitals.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    onSelectHospital(h.id)
                    setHospOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-mono text-left cursor-pointer',
                    h.id === selectedHospitalId
                      ? 'bg-[#382416] text-[#ffedd7] font-bold'
                      : 'text-slate-700 hover:bg-[#f7f2ea]',
                  )}
                >
                  <span>{h.name}</span>
                  {h.id === selectedHospitalId && <Check className="size-3.5 text-[#dc5000]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Global Search Bar */}
        <div ref={searchRef} className="relative z-50 hidden sm:block">
          <div className="relative flex items-center">
            <Search className="absolute left-3 size-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search patient, ID, vitals..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              className="w-48 md:w-64 rounded-xl border border-[#382416]/20 bg-white py-1.5 pl-8 pr-3 font-sans text-xs text-[#2c1b0e] placeholder:text-slate-400 focus:border-[#382416] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-slate-400 hover:text-slate-700"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {searchOpen && searchResults.length > 0 && (
            <div className="absolute left-0 top-full mt-2 z-[100] w-80 rounded-xl border border-[#382416]/20 bg-white p-2 shadow-2xl space-y-1">
              {searchResults.slice(0, 5).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    if (onNavigateView) onNavigateView('patients')
                    setSearchOpen(false)
                  }}
                  className="flex w-full items-center justify-between rounded-lg p-2 text-xs font-mono text-left hover:bg-[#f7f2ea] cursor-pointer"
                >
                  <div>
                    <p className="font-bold text-[#382416]">{p.name}</p>
                    <p className="text-[10px] text-slate-500">{p.id} · {p.topFactor}</p>
                  </div>
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">
                    S: {p.severity}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Simulation Controls & User Lockup */}
      <div className="flex items-center gap-3">
        {/* Scenario Selector Dropdown */}
        <div ref={scenRef} className="relative z-50">
          <button
            type="button"
            onClick={() => setScenOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#382416]/20 bg-white px-3.5 py-1.5 text-xs font-bold text-[#382416] hover:bg-[#f7f2ea] cursor-pointer shadow-2xs"
          >
            <Sparkles className="size-3.5 text-[#dc5000]" />
            <span className="hidden md:inline">{SCENARIOS.find((s) => s.key === scenario)?.label}</span>
            <ChevronDown className="size-3 text-slate-400" />
          </button>

          {scenOpen && (
            <div className="absolute right-0 top-full mt-2 z-[100] w-72 rounded-xl border border-[#382416]/20 bg-white p-2 shadow-2xl space-y-1">
              {SCENARIOS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => {
                    onRunScenario(s.key)
                    setScenOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg p-2 text-xs font-mono text-left cursor-pointer',
                    s.key === scenario ? 'bg-[#382416] text-[#ffedd7]' : 'hover:bg-[#f7f2ea] text-slate-800',
                  )}
                >
                  <s.icon className="size-4 shrink-0 text-[#dc5000] mt-0.5" />
                  <div>
                    <p className="font-bold">{s.label}</p>
                    <p className="text-[10px] text-slate-400">{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fast-Forward Simulation Button */}
        {onFastForward && (
          <button
            type="button"
            onClick={() => onFastForward(15)}
            className="rounded-xl bg-[#382416] hover:bg-[#2c1b0e] px-3.5 py-1.5 text-xs font-bold text-[#ffedd7] shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <FastForward className="size-3.5" />
            <span>+15M STEP</span>
          </button>
        )}

        {/* Operator Profile */}
        <div className="flex size-9 items-center justify-center rounded-full bg-[#382416] text-[#ffedd7] font-mono text-xs font-bold shadow-2xs">
          PG
        </div>
      </div>
    </header>
  )
}
