'use client'

import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
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
  MapPin,
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
  const { user } = useAuth()
  const [hospOpen, setHospOpen] = useState(false)
  const [distOpen, setDistOpen] = useState(false)
  const [scenOpen, setScenOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  // District & Tier Filters
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL')
  const [selectedTier, setSelectedTier] = useState<string>('ALL')

  // Auto-lock district selector if user is District CMO or Hospital Staff
  useEffect(() => {
    if (user?.role === 'DISTRICT_CMO' && user.districtName) {
      setSelectedDistrict(user.districtName)
    }
  }, [user])

  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) ?? hospitals[0]

  const hospRef = useClickOutside(() => setHospOpen(false))
  const distRef = useClickOutside(() => setDistOpen(false))
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

  const canSwitchDistrict = user?.role === 'SUPER_ADMIN' || user?.role === 'STATE_HEALTH_DEPT'

  return (
    <header className="relative z-50 flex h-16 shrink-0 items-center justify-between border-b border-[#382416]/15 bg-[#fdfbf7]/95 px-4 md:px-6 font-sans text-[#2c1b0e] shadow-2xs backdrop-blur-md">
      {/* Left: District Scope & Hospital Selector */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* District & State Selector Dropdown */}
        <div ref={distRef} className="relative z-50">
          <button
            type="button"
            onClick={() => canSwitchDistrict && setDistOpen((v) => !v)}
            disabled={!canSwitchDistrict}
            className={cn(
              'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 font-mono text-xs font-bold transition-all shadow-2xs',
              canSwitchDistrict
                ? 'border-[#382416]/20 bg-[#382416] text-[#ffedd7] hover:bg-[#28180d] cursor-pointer'
                : 'border-slate-200 bg-slate-100 text-slate-700 cursor-not-allowed opacity-90',
            )}
          >
            <MapPin className="size-3.5 text-[#dc5000]" />
            <span className="truncate max-w-[150px] md:max-w-[200px]">
              {selectedDistrict === 'ALL'
                ? '🌟 ALL 24 DISTRICTS (JHARKHAND)'
                : `${selectedDistrict.toUpperCase()} DISTRICT`}
            </span>
            {canSwitchDistrict && <ChevronDown className="size-3 text-[#ffedd7]" />}
          </button>

          {distOpen && canSwitchDistrict && (
            <div className="absolute left-0 top-full mt-2 z-[100] w-72 max-h-96 overflow-y-auto rounded-xl border border-[#382416]/20 bg-white p-2 shadow-2xl space-y-1">
              <div className="px-2 py-1 text-[9px] font-mono font-bold text-slate-400 uppercase">
                STATEWIDE OVERVIEW
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedDistrict('ALL')
                  setDistOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-mono font-bold text-left cursor-pointer',
                  selectedDistrict === 'ALL' ? 'bg-[#382416] text-[#ffedd7]' : 'hover:bg-[#f7f2ea] text-slate-800',
                )}
              >
                <span>🌟 ALL 24 DISTRICTS (STATEWIDE)</span>
                {selectedDistrict === 'ALL' && <Check className="size-3.5 text-[#dc5000]" />}
              </button>

              <div className="px-2 pt-2 pb-1 text-[9px] font-mono font-bold text-slate-400 uppercase border-t border-slate-100">
                24 JHARKHAND DISTRICTS
              </div>
              {[
                'Ranchi', 'East Singhbhum (Jamshedpur)', 'Dhanbad', 'Bokaro', 'Hazaribagh',
                'Deoghar', 'Palamu (Daltonganj)', 'Dumka', 'Giridih', 'West Singhbhum (Chaibasa)',
                'Ramgarh', 'Koderma', 'Chatra', 'Jamtara', 'Godda', 'Pakur', 'Sahibganj',
                'Latehar', 'Garhwa', 'Khunti', 'Gumla', 'Simdega', 'Lohardaga', 'Seraikela Kharsawan'
              ].map((dName) => (
                <button
                  key={dName}
                  type="button"
                  onClick={() => {
                    setSelectedDistrict(dName)
                    setDistOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs font-mono text-left cursor-pointer',
                    selectedDistrict === dName ? 'bg-[#382416] text-[#ffedd7] font-bold' : 'hover:bg-[#f7f2ea] text-slate-700',
                  )}
                >
                  <span>{dName}</span>
                  {selectedDistrict === dName && <Check className="size-3.5 text-[#dc5000]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hospital Dropdown */}
        <div ref={hospRef} className="relative z-50 hidden md:block">
          <button
            type="button"
            onClick={() => setHospOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-[#382416]/20 bg-white px-3.5 py-1.5 font-mono text-xs font-bold text-[#382416] hover:bg-[#f7f2ea] cursor-pointer shadow-2xs"
          >
            <Building2 className="size-3.5 text-[#dc5000]" />
            <span className="truncate max-w-[160px]">{selectedHospital?.name ?? 'Select Hospital'}</span>
            <ChevronDown className="size-3 text-slate-400" />
          </button>

          {hospOpen && (
            <div className="absolute left-0 top-full mt-2 z-[100] w-72 rounded-xl border border-[#382416]/20 bg-white p-2 shadow-2xl space-y-1">
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

        {/* Operator Profile & Role Badge */}
        <div className="flex items-center gap-2">
          <a
            href="/login"
            className="hidden sm:flex flex-col items-end text-right hover:opacity-80 transition-opacity"
          >
            <span className="text-xs font-bold text-[#382416]">
              {user ? user.name : 'Dr. Priyanshu Ghosh'}
            </span>
            <span className="font-mono text-[9px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded uppercase">
              [{user ? user.role.replace(/_/g, ' ') : 'SUPER ADMIN'}]
            </span>
          </a>
          <a
            href="/login"
            title="Switch User Role / Logout"
            className="flex size-9 items-center justify-center rounded-full bg-[#382416] text-[#ffedd7] font-mono text-xs font-bold shadow-2xs hover:bg-blue-950 cursor-pointer transition-colors"
          >
            {user ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'PG'}
          </a>
        </div>
      </div>
    </header>
  )
}

