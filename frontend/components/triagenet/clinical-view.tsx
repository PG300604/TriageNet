'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { type TriageState, type Hospital, triggerBedRelease, getPatientClinicalRequirement } from '@/lib/triage-data'
import {
  Stethoscope,
  CheckCircle2,
  BedDouble,
  Clock,
  Search,
  Building2,
  SlidersHorizontal,
  ChevronDown,
  X,
  MapPin,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ClinicalViewProps {
  state: TriageState
  onStateChange?: (next: TriageState) => void
}

function getFacilityTier(h: { name: string; short?: string }): 'TERTIARY' | 'DISTRICT' | 'SUB_DIVISIONAL' | 'CHC' {
  const n = (h.name + ' ' + (h.short || '')).toLowerCase()
  if (
    n.includes('medical college') ||
    n.includes('rims') ||
    n.includes('aiims') ||
    n.includes('snmmch') ||
    n.includes('mgm')
  ) {
    return 'TERTIARY'
  }
  if (n.includes('sadar') || n.includes('district hospital') || n.includes('dh ')) {
    return 'DISTRICT'
  }
  if (n.includes('sub-divisional') || n.includes('sdh') || n.includes('referral')) {
    return 'SUB_DIVISIONAL'
  }
  return 'CHC'
}

export function ClinicalView({ state, onStateChange }: ClinicalViewProps) {
  const [selectedHospitalId, setSelectedHospitalId] = useState(state.hospitals[0]?.id ?? 'hosp-1')
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL')
  const [selectedTier, setSelectedTier] = useState<string>('ALL')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false)

  // Extract unique sorted districts
  const districts = useMemo(() => {
    return Array.from(
      new Set(
        state.hospitals
          .map((h) => h.district || '')
          .filter((d) => Boolean(d) && d.trim().length > 0)
      )
    ).sort()
  }, [state.hospitals])

  // Filtered hospitals based on user filters
  const filteredHospitals = useMemo(() => {
    return state.hospitals.filter((h) => {
      const matchesDistrict = selectedDistrict === 'ALL' || h.district === selectedDistrict
      const tier = getFacilityTier(h)
      const matchesTier = selectedTier === 'ALL' || tier === selectedTier
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.short.toLowerCase().includes(q) ||
        (h.district && h.district.toLowerCase().includes(q))
      return matchesDistrict && matchesTier && matchesSearch
    })
  }, [state.hospitals, selectedDistrict, selectedTier, searchQuery])

  const hospital = state.hospitals.find((h) => h.id === selectedHospitalId) ?? state.hospitals[0]
  const hospitalPatients = state.patients.filter((p) => p.hospitalId === selectedHospitalId)
  const assignedPatients = hospitalPatients.filter((p) => p.status === 'Assigned')
  const icuPatients = assignedPatients.filter((p) => p.bedType === 'ICU')
  const generalPatients = assignedPatients.filter((p) => p.bedType !== 'ICU')

  const handleBedReleaseAction = (reason: 'recovery' | 'family_ama') => {
    if (!onStateChange) return
    const { state: nextState } = triggerBedRelease(state, selectedHospitalId, reason)
    onStateChange(nextState)
  }

  const specialistList = [
    { name: 'Pulmonology (Respiratory ICU)', count: hospital?.specialistRoster?.pulmonologists?.available ?? 2 },
    { name: 'Cardiology (Cardiac ICU)', count: hospital?.specialistRoster?.cardiologists?.available ?? 2 },
    { name: 'Trauma Surgery (OR ICU)', count: hospital?.specialistRoster?.traumaSurgeons?.available ?? 1 },
    { name: 'General Physician (Step-Down)', count: hospital?.specialistRoster?.generalPhysicians?.available ?? 4 },
  ]

  const activeTier = hospital ? getFacilityTier(hospital) : 'TERTIARY'

  return (
    <div className="space-y-6 font-sans text-stone-100">
      {/* Header Scope Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-white uppercase font-mono">
              CLINICAL OPERATIONS & BED STRATIFICATION
            </h2>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
              Live State Sync
            </span>
          </div>
          <p className="text-xs font-semibold text-stone-400 mt-0.5">
            ICU VS GENERAL WARD BED LOAD BALANCING, REAL-TIME DISCHARGE & ON-CALL SPECIALIST ROSTER
          </p>
        </div>
      </div>

      {/* Categorized Facility Selection & Filter Command Bar */}
      <div className="rounded-2xl border border-stone-800 bg-[#181512] p-4 shadow-md space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* District & Tier Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* District Dropdown Selector */}
            <div className="relative">
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value)
                  // If current hospital not in new district, auto switch to first one
                  const matches = state.hospitals.filter(
                    (h) => e.target.value === 'ALL' || h.district === e.target.value
                  )
                  if (matches.length > 0 && !matches.some((h) => h.id === selectedHospitalId)) {
                    setSelectedHospitalId(matches[0].id)
                  }
                }}
                className="rounded-xl border border-stone-700 bg-[#12100e] px-3 py-1.5 text-xs font-semibold text-stone-200 cursor-pointer focus:border-[#ea580c] focus:outline-hidden shadow-2xs"
              >
                <option value="ALL">All 24 Districts ({state.hospitals.length} Facilities)</option>
                {districts.map((d) => {
                  const count = state.hospitals.filter((h) => h.district === d).length
                  return (
                    <option key={d} value={d}>
                      {d} ({count} facilities)
                    </option>
                  )
                })}
              </select>
            </div>

            {/* Facility Tier Filter Pills */}
            <div className="flex items-center gap-1 bg-[#12100e] p-0.5 rounded-xl border border-stone-800 text-[11px] font-semibold">
              {(['ALL', 'TERTIARY', 'DISTRICT', 'SUB_DIVISIONAL', 'CHC'] as const).map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg transition-colors cursor-pointer',
                    selectedTier === tier
                      ? 'bg-[#382416] text-[#ffedd7] border border-[#ea580c]/40 font-bold shadow-2xs'
                      : 'text-stone-400 hover:text-white hover:bg-stone-800'
                  )}
                >
                  {tier === 'ALL'
                    ? 'All Tiers'
                    : tier === 'TERTIARY'
                    ? 'Tertiary'
                    : tier === 'DISTRICT'
                    ? 'District DH'
                    : tier === 'SUB_DIVISIONAL'
                    ? 'SDH'
                    : 'CHC'}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Search Input */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search facility name, code, district..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-700 bg-[#12100e] pl-8 pr-7 py-1.5 text-xs font-medium text-white placeholder:text-stone-500 focus:border-[#ea580c] focus:outline-hidden shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Active Facility Profile & Quick Picker Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#ea580c] text-white shadow-md">
              <Building2 className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-extrabold uppercase font-mono text-white tracking-tight truncate">
                  {hospital?.name}
                </span>
                <span className="rounded-md bg-stone-800 px-1.5 py-0.5 text-[10px] font-mono font-bold text-stone-300 border border-stone-700">
                  {hospital?.short}
                </span>
                <span className="rounded-md bg-orange-950/60 border border-orange-800 text-orange-300 px-2 py-0.5 text-[10px] font-bold">
                  {hospital?.district || 'Ranchi'}
                </span>
                <span className="rounded-md bg-emerald-950/60 border border-emerald-800 text-emerald-300 px-2 py-0.5 text-[10px] font-mono font-bold">
                  {activeTier}
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                ICU: <strong className="text-white">{icuPatients.length}/{hospital?.icuBeds?.total ?? 4}</strong> occupied · Ward: <strong className="text-white">{generalPatients.length}/{hospital?.generalBeds?.total ?? 20}</strong> occupied · {filteredHospitals.length} matching facilities
              </p>
            </div>
          </div>

          {/* Change Facility Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border border-[#382416] bg-[#382416] hover:bg-[#28180d] px-3.5 py-2 text-xs font-bold text-[#ffedd7] shadow-xs cursor-pointer transition-colors"
            >
              <SlidersHorizontal className="size-3.5 text-[#ea580c]" />
              <span>Switch Facility ({filteredHospitals.length})</span>
              <ChevronDown className={cn('size-3.5 transition-transform', isDropdownOpen && 'rotate-180')} />
            </button>

            {/* Popover Dropdown for Selecting Filtered Facilities */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 z-50 w-80 max-h-80 overflow-y-auto rounded-2xl border border-stone-700 bg-[#1c1917] p-2 shadow-2xl space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Select Facility ({filteredHospitals.length} filtered results)
                </div>
                {filteredHospitals.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-400">
                    No facilities match current filters.
                  </div>
                ) : (
                  filteredHospitals.map((h) => {
                    const tier = getFacilityTier(h)
                    const isSelected = h.id === selectedHospitalId
                    return (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => {
                          setSelectedHospitalId(h.id)
                          setIsDropdownOpen(false)
                        }}
                        className={cn(
                          'flex w-full items-start justify-between rounded-xl px-3 py-2 text-left text-xs transition-colors cursor-pointer',
                          isSelected
                            ? 'bg-[#382416] text-[#ffedd7] border border-[#ea580c]/40 font-bold'
                            : 'hover:bg-stone-800 text-stone-200'
                        )}
                      >
                        <div className="min-w-0 pr-2">
                          <p className="font-bold truncate text-white">{h.name}</p>
                          <p className={cn('text-[10px]', isSelected ? 'text-[#ffedd7]/70' : 'text-stone-400')}>
                            {h.district || 'Jharkhand'} · <span className="font-mono">{tier}</span>
                          </p>
                        </div>
                        <span
                          className={cn(
                            'text-[10px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0',
                            isSelected
                              ? 'bg-[#ea580c] text-white'
                              : 'bg-stone-800 text-stone-300 border border-stone-700'
                          )}
                        >
                          {h.beds.used}/{h.beds.total}
                        </span>
                      </button>
                    )
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* Quick Access Hospital Chips (up to 6 matching) */}
        {filteredHospitals.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs font-mono">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 mr-1">
              Quick Switch:
            </span>
            {filteredHospitals.slice(0, 6).map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setSelectedHospitalId(h.id)}
                className={cn(
                  'px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer truncate max-w-[190px]',
                  selectedHospitalId === h.id
                    ? 'bg-[#382416] text-[#ffedd7] border-[#ea580c]/50 shadow-2xs'
                    : 'bg-[#12100e] text-stone-300 border-stone-800 hover:bg-stone-800 hover:text-white'
                )}
                title={h.name}
              >
                {h.short || h.name}
              </button>
            ))}
            {filteredHospitals.length > 6 && (
              <button
                type="button"
                onClick={() => setIsDropdownOpen(true)}
                className="px-2 py-1 text-[11px] text-[#ea580c] font-bold hover:underline cursor-pointer"
              >
                +{filteredHospitals.length - 6} more in list
              </button>
            )}
          </div>
        )}
      </div>

      {/* Bed Stratification KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-stone-800 bg-[#181512] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-stone-400 uppercase">
            <span>ICU BEDS OCCUPIED</span>
            <BedDouble className="size-4 text-red-500" />
          </div>
          <p className="mt-2 text-3xl font-extrabold font-mono text-white">
            {icuPatients.length} <span className="text-xs font-normal text-stone-400">/ {hospital?.icuBeds?.total ?? 4}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-[#181512] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-stone-400 uppercase">
            <span>GENERAL WARD OCCUPIED</span>
            <BedDouble className="size-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-3xl font-extrabold font-mono text-white">
            {generalPatients.length} <span className="text-xs font-normal text-stone-400">/ {hospital?.generalBeds?.total ?? 20}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-stone-800 bg-[#181512] p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-stone-400 uppercase">
            <span>ON-CALL SPECIALISTS</span>
            <Stethoscope className="size-4 text-sky-400" />
          </div>
          <p className="mt-2 text-3xl font-extrabold font-mono text-white">
            {hospital?.specialists?.total ?? 8} <span className="text-xs font-normal text-stone-400">ROSTERED</span>
          </p>
        </div>
      </div>

      {/* Main Clinical Task Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ongoing Admissions & Countdown Timelines */}
        <div className="lg:col-span-7 rounded-2xl border border-stone-800 bg-[#181512] p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-white border-b border-stone-800 pb-3 flex items-center justify-between">
            <span>ONGOING ICU & WARD ADMISSIONS ({assignedPatients.length})</span>
            <span className="text-[10px] text-stone-400 font-sans font-normal">Active Inpatient Beds</span>
          </h3>

          <div className="space-y-3 font-mono">
            {assignedPatients.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400 font-sans">
                No active inpatient admissions currently assigned to {hospital?.name}.
              </div>
            ) : (
              assignedPatients.map((p) => {
                const req = getPatientClinicalRequirement(p)
                const bed = p.bedType ?? 'General'

                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-stone-800 bg-[#1e1a16] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-bold uppercase text-white">{p.name}</p>
                        <p className="text-xs text-stone-400">ID: {p.id} · {p.topFactor}</p>
                      </div>
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                          bed === 'ICU'
                            ? 'bg-red-950/60 text-red-300 border-red-800'
                            : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                        }`}
                      >
                        {bed} BED
                      </span>
                    </div>

                    <div className="rounded-lg bg-[#141210] p-2.5 border border-stone-800 text-xs flex flex-wrap items-center justify-between gap-2 text-stone-300">
                      <span className="flex items-center gap-1.5 font-sans">
                        <Clock className="size-3.5 text-emerald-400" />
                        Est. Recovery: <strong className="text-white">{p.estRecoveryMinutes ?? 30}m remaining</strong>
                      </span>
                      {bed === 'ICU' && (
                        <span className="text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                          Step-Down: S &lt; {req.icuStepDownThreshold} ({req.requiredSpecialist})
                        </span>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Right Column: Doctor Roster & Bed Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Doctor Roster */}
          <div className="rounded-2xl border border-stone-800 bg-[#181512] p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-white border-b border-stone-800 pb-3 flex items-center justify-between">
              <span>ON-CALL SPECIALIST PHYSICIANS</span>
              <span className="text-[10px] text-stone-400 font-sans font-normal">Active Ward Rotation</span>
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {specialistList.map((spec) => (
                <div
                  key={spec.name}
                  className="flex items-center justify-between rounded-xl border border-stone-800 bg-[#1e1a16] p-3"
                >
                  <span className="font-bold text-stone-200 uppercase">{spec.name}</span>
                  <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-800 px-2 py-0.5 rounded-full">
                    {spec.count} ON DUTY
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Bed Release Triggers */}
          <div className="rounded-2xl border border-stone-800 bg-[#181512] p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-white border-b border-stone-800 pb-3">
              TRIGGER CLINICAL DISCHARGE
            </h3>

            <div className="space-y-3">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleBedReleaseAction('recovery')}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer font-mono transition-colors"
              >
                <CheckCircle2 className="size-4" />
                <span>EARLY RECOVERY DISCHARGE</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
