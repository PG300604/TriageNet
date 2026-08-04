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
  Info,
} from 'lucide-react'
import { getPatientStatusBadgeClass } from './status'

interface PatientsViewProps {
  state: TriageState
}

export function PatientsView({ state }: PatientsViewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(state.patients[0] || null)

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

  const filteredPatients = state.patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.topFactor.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activePatient = selectedPatient || state.patients[0]
  const activeHospital = activePatient
    ? state.hospitals.find((h) => h.id === activePatient.hospitalId)
    : null
  const activeReq = activePatient ? getPatientClinicalRequirement(activePatient) : null

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#382416] uppercase font-mono">Patient Directory & Clinical Records</h2>
          <p className="text-xs text-slate-600">
            Real-time patient telemetry, locked queue wait latency before bed assignment, and ML risk scoring.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 shadow-2xs">
          <Search className="size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, or symptoms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-56 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Patient List with Locked WAIT TIME TILL ASSIGNED */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-[#382416] font-mono uppercase flex items-center gap-2">
              <Users className="size-4 text-[#dc5000]" />
              ACTIVE PATIENT DIRECTORY ({filteredPatients.length})
            </h3>
            <span className="text-xs font-mono font-bold text-[#382416] bg-[#f7f2ea] border border-[#382416]/20 px-2.5 py-1 rounded-full">
              LOCKED ASSIGNMENT LATENCY
            </span>
          </div>

          <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredPatients.map((p, idx) => {
              const isSelected = activePatient?.id === p.id
              const isHighRisk = p.severity >= 80
              const isModRisk = p.severity >= 50 && p.severity < 80
              const hospital = state.hospitals.find((h) => h.id === p.hospitalId)
              const waitDisplay = p.assignedWaitMinutes ?? p.waitMinutes

              return (
                <div
                  key={`${p.id}-${idx}`}
                  onClick={() => setSelectedPatient(p)}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#382416] bg-[#f7f2ea]/70 shadow-xs ring-1 ring-[#382416]'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-10 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                        isHighRisk
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : isModRisk
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      {p.severity}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#382416] uppercase">{p.name}</span>
                        <span className="text-[10px] font-mono font-semibold text-slate-500">({p.id})</span>
                      </div>
                      <p className="text-xs text-slate-600 font-mono mt-0.5">
                        {hospital?.short ?? 'CG'} · {p.topFactor}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* EXPLICIT LOCKED METRIC: WAIT TIME TILL ASSIGNED */}
                    <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-300 px-3 py-1 text-xs font-mono font-bold text-amber-900">
                      <Clock className="size-3.5 text-[#dc5000]" />
                      <span>WAIT TILL ASSIGNED: {waitDisplay}M</span>
                    </div>

                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${getPatientStatusBadgeClass(p.status)}`}>
                      {p.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Selected Patient Clinical Audit & ML Scorer */}
        <div className="space-y-6 lg:col-span-5">
          {/* Selected Patient Detailed Card */}
          {activePatient && (
            <div className="rounded-2xl border border-[#382416]/20 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#382416]/15 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#dc5000]">SELECTED CLINICAL RECORD</span>
                  <h3 className="text-base font-bold uppercase text-[#382416] font-mono">{activePatient.name}</h3>
                </div>
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${getPatientStatusBadgeClass(activePatient.status)}`}>
                  {activePatient.status}
                </span>
              </div>

              {/* HIGHLIGHTED LOCKED METRIC BOX: WAIT TIME TILL ASSIGNED */}
              <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 space-y-1">
                <span className="text-xs font-mono font-bold text-amber-900 uppercase flex items-center gap-1.5">
                  <Clock className="size-4 text-[#dc5000]" /> WAIT TIME TILL ASSIGNED
                </span>
                <p className="text-2xl font-extrabold font-mono text-[#382416]">
                  {activePatient.assignedWaitMinutes ?? activePatient.waitMinutes} <span className="text-sm font-bold text-slate-600">MINUTES QUEUE LATENCY</span>
                </p>
                <p className="text-xs text-slate-600">
                  {activePatient.status === 'Assigned' || activePatient.status === 'Discharged'
                    ? `Patient waited exactly ${activePatient.assignedWaitMinutes ?? activePatient.waitMinutes}m in queue before being matched to a bed (metric locked).`
                    : `Current queue wait duration is ${activePatient.waitMinutes}m awaiting open bed allocation.`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-slate-500 font-bold uppercase block">FACILITY</span>
                  <span className="font-bold text-[#382416]">{activeHospital?.name ?? 'City General'}</span>
                </div>

                <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                  <span className="text-slate-500 font-bold uppercase block">BED ALLOCATION</span>
                  <span className="font-bold text-emerald-800">{activePatient.bedType ?? 'General'} Bed</span>
                </div>
              </div>

              {activeReq && (
                <div className="rounded-lg bg-[#f7f2ea]/60 p-3 border border-[#382416]/15 text-xs font-mono space-y-1">
                  <span className="font-bold text-[#382416] uppercase block">MATCHING RATIONALE:</span>
                  <p className="text-slate-800">{activeReq.matchReason}</p>
                </div>
              )}
            </div>
          )}

          {/* Interactive ML Vitals Scorer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 font-mono uppercase">
                <Sparkles className="size-4 text-[#dc5000]" />
                LIVE ML SEVERITY CALCULATOR
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                MODEL: LOGISTIC REGRESSION
              </span>
            </div>

            {/* Vitals Sliders */}
            <div className="space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-700 font-semibold mb-1">
                  <span>Oxygen Saturation (SpO₂)</span>
                  <span className={testVitals.spo2 < 90 ? 'text-red-600 font-bold' : 'text-slate-900'}>
                    {testVitals.spo2}%
                  </span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="100"
                  value={testVitals.spo2}
                  onChange={(e) => setTestVitals({ ...testVitals, spo2: Number(e.target.value) })}
                  className="w-full accent-[#382416]"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-semibold mb-1">
                  <span>Heart Rate (HR)</span>
                  <span className={testVitals.hr > 110 ? 'text-red-600 font-bold' : 'text-slate-900'}>
                    {testVitals.hr} bpm
                  </span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="160"
                  value={testVitals.hr}
                  onChange={(e) => setTestVitals({ ...testVitals, hr: Number(e.target.value) })}
                  className="w-full accent-[#382416]"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 font-semibold mb-1">
                  <span>Body Temperature</span>
                  <span className={testVitals.temp > 38.5 ? 'text-red-600 font-bold' : 'text-slate-900'}>
                    {testVitals.temp.toFixed(1)} °C
                  </span>
                </div>
                <input
                  type="range"
                  min="35"
                  max="41"
                  step="0.1"
                  value={testVitals.temp}
                  onChange={(e) => setTestVitals({ ...testVitals, temp: Number(e.target.value) })}
                  className="w-full accent-[#382416]"
                />
              </div>
            </div>

            {/* Computed Result Box */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600 uppercase">Calculated Urgency Score</span>
                <span
                  className={`text-2xl font-extrabold ${
                    prediction.severityScore >= 80
                      ? 'text-red-600'
                      : prediction.severityScore >= 50
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {prediction.severityScore} / 100
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
