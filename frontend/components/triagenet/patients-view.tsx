'use client'

import React, { useState } from 'react'
import { computeMLSeverity, type VitalsInput } from '@/lib/ml-severity-scorer'
import { type Patient, type TriageState, getPatientClinicalRequirement } from '@/lib/triage-data'
import {
  Users,
  Search,
  Activity,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sliders,
  ShieldAlert,
  BedDouble,
  UserCheck,
  Building2,
  HeartPulse,
  Filter,
} from 'lucide-react'
import { getPatientStatusBadgeClass } from './status'
import { cn } from '@/lib/utils'

interface PatientsViewProps {
  state: TriageState
}

export function PatientsView({ state }: PatientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(state.patients[0] || null)
  const [filterRisk, setFilterRisk] = useState<'ALL' | 'CRITICAL' | 'MODERATE' | 'LOW'>('ALL')

  // Interactive Live Vitals Scorer Test State
  const [testVitals, setTestVitals] = useState<VitalsInput>({
    spo2: 86,
    hr: 118,
    sysBp: 145,
    diaBp: 92,
    temp: 38.8,
    respRate: 26,
    age: 64,
  })

  const prediction = computeMLSeverity(testVitals)

  const filteredPatients = state.patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.topFactor.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRisk =
      filterRisk === 'ALL' ||
      (filterRisk === 'CRITICAL' && p.severity >= 80) ||
      (filterRisk === 'MODERATE' && p.severity >= 50 && p.severity < 80) ||
      (filterRisk === 'LOW' && p.severity < 50)

    return matchesSearch && matchesRisk
  })

  const totalPatients = state.patients.length
  const criticalCount = state.patients.filter((p) => p.severity >= 80).length
  const assignedCount = state.patients.filter((p) => p.status === 'Assigned').length
  const waitingCount = state.patients.filter((p) => p.status === 'Waiting').length

  const activePatient = selectedPatient || state.patients[0]
  const activeHospital = activePatient
    ? state.hospitals.find((h) => h.id === activePatient.hospitalId)
    : null
  const activeReq = activePatient ? getPatientClinicalRequirement(activePatient) : null

  return (
    <div className="space-y-6 font-sans text-[#2c1b0e]">
      {/* 4-Card Summary Grid (Boltshift & Starline pattern) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Patients */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-xs">
              PATIENT DIRECTORY
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-white/15">
              <Users className="size-4 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight">{totalPatients}</p>
            <p className="mt-1 text-xs font-medium text-white/85">
              Enrolled Emergency & Inpatient Cases
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
            <span className="inline-block size-1.5 rounded-full bg-emerald-300 animate-pulse" />
            Active Clinical Tracking
          </div>
        </div>

        {/* Card 2: Critical Acuity */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              CRITICAL S≥80 CASES
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <ShieldAlert className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[#382416]">{criticalCount}</p>
            <p className="mt-1 text-xs font-medium text-stone-500">
              High risk triage tier
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
            Preemption Protected
          </div>
        </div>

        {/* Card 3: Bed Assigned */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              BED ALLOCATED
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <BedDouble className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[#382416]">{assignedCount}</p>
            <p className="mt-1 text-xs font-medium text-stone-500">
              Under active hospital care
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            Hungarian Engine Matched
          </div>
        </div>

        {/* Card 4: Waiting in Queue */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              WAITING FOR ADMISSION
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[#382416]">{waitingCount}</p>
            <p className="mt-1 text-xs font-medium text-stone-500">
              Priority heap candidates
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            Real-time Latency Monitored
          </div>
        </div>
      </div>

      {/* Main Content Layout: Directory + Clinical Scorer */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Patient Directory (Bright Leads Style) */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#382416]">
                Patient Intake Records
              </h3>
              <p className="text-[11px] text-stone-400">
                Click any patient to inspect telemetry & bed allocation
              </p>
            </div>

            {/* Risk filter pills */}
            <div className="flex items-center gap-1.5 text-xs">
              {(['ALL', 'CRITICAL', 'MODERATE', 'LOW'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setFilterRisk(r)}
                  className={cn(
                    'rounded-xl px-2.5 py-1 text-[11px] font-semibold transition-all cursor-pointer',
                    filterRisk === r
                      ? 'bg-[#382416] text-[#ffedd7] shadow-2xs'
                      : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70'
                  )}
                >
                  {r === 'ALL' ? 'All' : r === 'CRITICAL' ? 'Critical' : r === 'MODERATE' ? 'Moderate' : 'Low'}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
            <input
              type="text"
              placeholder="Filter by name, ID, or presenting symptoms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2 pl-9 pr-4 text-xs font-medium text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-[#ea580c] focus:bg-white focus:ring-1 focus:ring-[#ea580c]/30"
            />
          </div>

          {/* Patient Cards List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredPatients.map((p) => {
              const isSelected = activePatient?.id === p.id
              const isHighRisk = p.severity >= 80
              const isModRisk = p.severity >= 50 && p.severity < 80
              const hospital = state.hospitals.find((h) => h.id === p.hospitalId)
              const waitDisplay = p.assignedWaitMinutes ?? p.waitMinutes

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={cn(
                    'flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 cursor-pointer transition-all',
                    isSelected
                      ? 'border-[#382416] bg-stone-50/80 shadow-xs ring-1 ring-[#382416]'
                      : 'border-stone-200/80 bg-white hover:border-stone-300 hover:shadow-xs'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-xl text-xs font-bold shadow-2xs',
                        isHighRisk
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isModRisk
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      )}
                    >
                      {p.severity}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900">{p.name}</span>
                        <span className="font-mono text-[10px] text-stone-400">({p.id})</span>
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {hospital?.short ?? 'CG'} · {p.topFactor}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Locked Wait Metric */}
                    <div className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                      <Clock className="size-3 text-[#ea580c]" />
                      <span>{waitDisplay}m wait</span>
                    </div>

                    <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', getPatientStatusBadgeClass(p.status))}>
                      {p.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Selected Patient Audit & ML Diagnostic Scorer */}
        <div className="space-y-6 lg:col-span-5">
          {/* Selected Patient Record Card */}
          {activePatient && (
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400">
                    Selected Patient Audit
                  </span>
                  <h3 className="text-base font-bold text-[#382416]">{activePatient.name}</h3>
                </div>
                <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-semibold', getPatientStatusBadgeClass(activePatient.status))}>
                  {activePatient.status}
                </span>
              </div>

              {/* Locked Wait Time Box */}
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1">
                <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-[#ea580c]" />
                  Queue Wait Till Assigned
                </span>
                <p className="text-2xl font-extrabold text-[#382416]">
                  {activePatient.assignedWaitMinutes ?? activePatient.waitMinutes} <span className="text-xs font-semibold text-stone-500">minutes</span>
                </p>
                <p className="text-[11px] text-stone-500">
                  {activePatient.status === 'Assigned' || activePatient.status === 'Discharged'
                    ? `Patient waited ${activePatient.assignedWaitMinutes ?? activePatient.waitMinutes}m in queue before being matched to a bed.`
                    : `Active queue wait time is ${activePatient.waitMinutes}m awaiting bed release.`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-stone-50 p-3 border border-stone-100">
                  <span className="text-stone-400 text-[10px] font-semibold uppercase block">Facility</span>
                  <span className="font-bold text-stone-800">{activeHospital?.name ?? 'District Hospital'}</span>
                </div>
                <div className="rounded-xl bg-stone-50 p-3 border border-stone-100">
                  <span className="text-stone-400 text-[10px] font-semibold uppercase block">Bed Type</span>
                  <span className="font-bold text-emerald-700">{activePatient.bedType ?? 'General'} Bed</span>
                </div>
              </div>

              {activeReq && (
                <div className="rounded-xl bg-stone-50/70 p-3 border border-stone-200/60 text-xs space-y-1">
                  <span className="text-[10px] font-semibold uppercase text-stone-400 block">
                    Hungarian Matching Rationale
                  </span>
                  <p className="text-stone-700 font-medium">{activeReq.matchReason}</p>
                </div>
              )}
            </div>
          )}

          {/* Interactive ML Clinical Vitals Diagnostic Calculator */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#ea580c]/10 text-[#ea580c]">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#382416]">Interactive ML Acuity Simulator</h3>
                  <p className="text-[11px] text-stone-400">Real-time Logistic Regression scoring</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1 text-[11px] font-medium text-stone-600">
                  <span>Oxygen Saturation (SpO₂): {testVitals.spo2}%</span>
                  <span className={testVitals.spo2 < 90 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>
                    {testVitals.spo2 < 90 ? 'Hypoxia' : 'Normal'}
                  </span>
                </div>
                <input
                  type="range"
                  min="65"
                  max="100"
                  value={testVitals.spo2}
                  onChange={(e) => setTestVitals({ ...testVitals, spo2: Number(e.target.value) })}
                  className="w-full accent-[#ea580c] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-[11px] font-medium text-stone-600">
                  <span>Heart Rate: {testVitals.hr} BPM</span>
                  <span className={testVitals.hr > 110 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-semibold'}>
                    {testVitals.hr > 110 ? 'Tachycardia' : 'Normal'}
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={testVitals.hr}
                  onChange={(e) => setTestVitals({ ...testVitals, hr: Number(e.target.value) })}
                  className="w-full accent-[#ea580c] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-stone-400 text-[10px] font-semibold uppercase block mb-1">Sys BP (mmHg)</span>
                  <input
                    type="number"
                    value={testVitals.sysBp}
                    onChange={(e) => setTestVitals({ ...testVitals, sysBp: Number(e.target.value) })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2 font-semibold text-stone-800 outline-none focus:border-[#ea580c] focus:bg-white"
                  />
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] font-semibold uppercase block mb-1">Temp (°C)</span>
                  <input
                    type="number"
                    step="0.1"
                    value={testVitals.temp}
                    onChange={(e) => setTestVitals({ ...testVitals, temp: Number(e.target.value) })}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2 font-semibold text-stone-800 outline-none focus:border-[#ea580c] focus:bg-white"
                  />
                </div>
              </div>

              {/* Calculated Result */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-3.5 mt-2 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-stone-600">Predicted Acuity Score:</span>
                  <span className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-bold border',
                    prediction.score >= 80 ? 'bg-rose-50 text-rose-700 border-rose-200' :
                    prediction.score >= 50 ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-emerald-50 text-emerald-700 border-emerald-200'
                  )}>
                    {prediction.score} / 100
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Top Risk Driver: <strong className="text-stone-700">{prediction.topFactor}</strong>
                </p>
                {prediction.sepsisWarning && (
                  <div className="rounded-lg bg-rose-100/80 border border-rose-200 p-2 text-rose-800 text-[11px] font-bold flex items-center gap-1.5 animate-pulse">
                    <AlertTriangle className="size-3.5 text-rose-600" />
                    <span>Clinical Sepsis Early Warning Protocol Triggered</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
