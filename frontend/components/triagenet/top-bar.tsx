'use client'

import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth-context'
import type { Hospital, Patient } from '@/lib/triage-data'
import {
  Building2,
  Check,
  ChevronDown,
  Search,
  X,
  MapPin,
  BadgeCheck,
  Volume2,
  VolumeX,
} from 'lucide-react'

import { useEffect, useRef, useState } from 'react'
import { soundBeacon } from '@/lib/sound-beacon'
import { ClinicianProfileModal } from './clinician-profile-modal'
import { StaffApprovalModal } from '@/components/staff-approval-modal'

interface TopBarProps {
  hospitals: Hospital[]
  patients?: Patient[]
  selectedHospitalId: string
  onSelectHospital: (id: string) => void
  selectedDistrict?: string
  onSelectDistrict?: (district: string) => void
  onNavigateView?: (view: string) => void
}

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
  selectedDistrict = 'ALL',
  onSelectDistrict,
  onNavigateView,
}: TopBarProps) {
  const { user, isGuest } = useAuth()
  const [hospOpen, setHospOpen] = useState(false)
  const [distOpen, setDistOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [staffApprovalModalOpen, setStaffApprovalModalOpen] = useState(false)
  const [soundMuted, setSoundMuted] = useState(false)

  useEffect(() => {
    setSoundMuted(soundBeacon.isMuted())
  }, [])

  const handleToggleSound = () => {
    const next = soundBeacon.toggleMute()
    setSoundMuted(next)
    if (!next) {
      soundBeacon.playRadioClick()
    }
  }

  // Auto-lock district selector if user is District CMO or Hospital Staff
  useEffect(() => {
    if (user?.role === 'DISTRICT_CMO' && user.districtName && onSelectDistrict) {
      onSelectDistrict(user.districtName)
    }
  }, [user, onSelectDistrict])


  const selectedHospital = hospitals.find((h) => h.id === selectedHospitalId) ?? hospitals[0]

  const hospRef = useClickOutside(() => setHospOpen(false))
  const distRef = useClickOutside(() => setDistOpen(false))
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
              'inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-all shadow-xs',
              canSwitchDistrict
                ? 'border-[#382416]/20 bg-[#382416] text-[#ffedd7] hover:bg-[#28180d] cursor-pointer'
                : 'border-stone-200 bg-stone-100 text-stone-700 cursor-not-allowed opacity-90',
            )}
          >
            <MapPin className="size-3.5 text-[#ea580c]" />
            <span className="truncate max-w-[150px] md:max-w-[210px] font-semibold">
              {selectedDistrict === 'ALL'
                ? '🌟 All 24 Districts (Statewide)'
                : `${selectedDistrict} District${user?.role === 'DISTRICT_CMO' ? ' (CMO Command)' : ''}`}
            </span>
            {canSwitchDistrict && <ChevronDown className="size-3 text-[#ffedd7]" />}
          </button>

          {distOpen && canSwitchDistrict && (
            <div className="absolute left-0 top-full mt-2 z-[100] w-72 max-h-96 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-xl space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Statewide Overview
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectDistrict?.('ALL')
                  setDistOpen(false)
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold text-left cursor-pointer transition-colors',
                  selectedDistrict === 'ALL' ? 'bg-[#382416] text-[#ffedd7]' : 'hover:bg-stone-50 text-stone-800',
                )}
              >
                <span>🌟 All 24 Districts (Statewide)</span>
                {selectedDistrict === 'ALL' && <Check className="size-3.5 text-[#ea580c]" />}
              </button>

              <div className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-t border-stone-100">
                24 Jharkhand Districts
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
                    onSelectDistrict?.(dName)
                    setDistOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs text-left cursor-pointer transition-colors',
                    selectedDistrict === dName ? 'bg-[#382416] text-[#ffedd7] font-bold' : 'hover:bg-stone-50 text-stone-700 font-medium',
                  )}
                >
                  <span>{dName}</span>
                  {selectedDistrict === dName && <Check className="size-3.5 text-[#ea580c]" />}
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
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#382416] hover:bg-stone-50 cursor-pointer shadow-xs transition-colors"
          >
            <Building2 className="size-3.5 text-[#ea580c]" />
            <span className="truncate max-w-[170px]">{selectedHospital?.name ?? 'Select Hospital'}</span>
            <ChevronDown className="size-3 text-stone-400" />
          </button>

          {hospOpen && (
            <div className="absolute left-0 top-full mt-2 z-[100] w-80 max-h-96 overflow-y-auto rounded-2xl border border-stone-200 bg-white p-2 shadow-xl space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Connected Facilities ({hospitals.length})
              </div>
              {hospitals.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => {
                    onSelectHospital(h.id)
                    setHospOpen(false)
                  }}
                  className={cn(
                    'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs text-left cursor-pointer transition-colors',
                    h.id === selectedHospitalId
                      ? 'bg-[#382416] text-[#ffedd7] font-bold'
                      : 'text-stone-700 hover:bg-stone-50 font-medium',
                  )}
                >
                  <span className="truncate">{h.name}</span>
                  {h.id === selectedHospitalId && <Check className="size-3.5 text-[#ea580c] shrink-0" />}
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

      {/* Right: Clean Live Network Sync Badge & Clinician Profile Trigger */}
      <div className="flex items-center gap-2.5">
        {isGuest ? (
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-mono font-medium text-amber-800">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span>Sandbox Simulation</span>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-stone-200/80 bg-stone-50/80 px-3 py-1 text-xs font-medium text-stone-600">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Network Synced</span>
          </div>
        )}

        {/* Phase 13: Acoustic Siren & Sound Beacon Toggle */}
        <button
          type="button"
          onClick={handleToggleSound}
          className={cn(
            'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold transition-all shadow-2xs cursor-pointer',
            soundMuted
              ? 'border-stone-300 bg-stone-100 text-stone-500 hover:bg-stone-200'
              : 'border-emerald-600/30 bg-emerald-500/10 text-emerald-800 hover:bg-emerald-500/20'
          )}
          title={
            soundMuted
              ? 'Acoustic Sound Beacon Muted (Click to Unmute)'
              : 'Acoustic Sound Beacon Active (Phase 13: 108 Sirens & Vitals Chimes)'
          }
        >
          {soundMuted ? (
            <VolumeX className="size-3.5 text-stone-400" />
          ) : (
            <Volume2 className="size-3.5 text-emerald-700 animate-pulse" />
          )}
          <span className="hidden xl:inline text-[11px]">
            {soundMuted ? 'Muted' : 'Acoustic Beacon'}
          </span>
        </button>

        {/* Physical Clinician Badge & Dual-Control Verification Desk */}
        {(user?.role === 'SUPER_ADMIN' ||
          user?.role === 'STATE_HEALTH_DEPT' ||
          user?.role === 'DISTRICT_CMO' ||
          user?.role === 'HOSPITAL_ADMIN') && (
          <button
            type="button"
            onClick={() => setStaffApprovalModalOpen(true)}
            className="flex items-center gap-1.5 rounded-full border border-amber-600/30 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 text-xs font-bold text-amber-900 transition-all shadow-2xs cursor-pointer"
            title="Open Physical Badge & Dual-Control Verification Desk"
          >
            <BadgeCheck className="size-3.5 text-amber-700" />
            <span className="hidden lg:inline text-[11px]">Badge Desk</span>
            <span className="size-1.5 rounded-full bg-amber-600 animate-pulse" />
          </button>
        )}

        {/* Clinician Profile Trigger Button */}
        <button
          type="button"
          onClick={() => setProfileModalOpen(true)}
          className="flex items-center gap-2 rounded-full border border-[#382416]/20 bg-white hover:bg-[#ffedd7]/50 px-2.5 py-1 text-xs font-semibold text-[#382416] transition-all shadow-2xs cursor-pointer"
          title="Open Clinician Profile Card"
        >
          <div className="flex size-6 items-center justify-center rounded-full bg-[#382416] text-[10px] font-bold text-[#ffedd7]">
            {user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'TN'}
          </div>
          <span className="hidden md:inline max-w-[120px] truncate text-[11px] font-bold text-[#382416]">
            {user?.name || 'My Profile'}
          </span>
        </button>

        <ClinicianProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          mode="self"
        />

        <StaffApprovalModal
          isOpen={staffApprovalModalOpen}
          onClose={() => setStaffApprovalModalOpen(false)}
        />
      </div>
    </header>
  )
}

