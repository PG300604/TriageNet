'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { type TriageState, triggerBedRelease, getPatientClinicalRequirement } from '@/lib/triage-data'
import { Stethoscope, CheckCircle2, BedDouble, Clock } from 'lucide-react'

interface ClinicalViewProps {
  state: TriageState
  onStateChange?: (next: TriageState) => void
}

export function ClinicalView({ state, onStateChange }: ClinicalViewProps) {
  const [selectedHospitalId, setSelectedHospitalId] = useState(state.hospitals[0]?.id ?? 'hosp-1')
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

  return (
    <div className="space-y-6 font-sans text-[#2c1b0e]">
      {/* Header Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#382416]/15 pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#382416] uppercase font-mono">
            CLINICAL OPERATIONS — {hospital?.name.toUpperCase()}
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            BED STRATIFICATION (ICU VS GENERAL WARD) & ON-CALL SPECIALIST ROSTER
          </p>
        </div>

        {/* Hospital Switcher */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {state.hospitals.map((h) => (
            <button
              key={h.id}
              type="button"
              onClick={() => setSelectedHospitalId(h.id)}
              className={`px-3 py-1.5 rounded-xl border transition-all cursor-pointer font-bold ${
                selectedHospitalId === h.id
                  ? 'bg-[#382416] text-[#ffedd7] border-[#382416] shadow-xs'
                  : 'bg-white text-slate-700 border-[#382416]/20 hover:bg-[#f7f2ea]'
              }`}
            >
              {h.name}
            </button>
          ))}
        </div>
      </div>

      {/* Bed Stratification KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>ICU BEDS OCCUPIED</span>
            <BedDouble className="size-4 text-red-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold font-mono text-[#382416]">
            {icuPatients.length} <span className="text-xs font-normal text-slate-500">/ {hospital?.icuBeds?.total ?? 4}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>GENERAL WARD OCCUPIED</span>
            <BedDouble className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold font-mono text-[#382416]">
            {generalPatients.length} <span className="text-xs font-normal text-slate-500">/ {hospital?.generalBeds?.total ?? 20}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>ON-CALL SPECIALISTS</span>
            <Stethoscope className="size-4 text-blue-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold font-mono text-[#382416]">
            {hospital?.specialists?.total ?? 8} <span className="text-xs font-normal text-slate-500">ROSTERED</span>
          </p>
        </div>
      </div>

      {/* Main Clinical Task Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ongoing Admissions & Countdown Timelines */}
        <div className="lg:col-span-7 rounded-2xl border border-[#382416]/15 bg-white p-6 shadow-xs space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase text-[#382416] border-b border-[#382416]/15 pb-3">
            ONGOING ICU & WARD ADMISSIONS ({assignedPatients.length})
          </h3>

          <div className="space-y-3 font-mono">
            {assignedPatients.map((p) => {
              const req = getPatientClinicalRequirement(p)
              const bed = p.bedType ?? 'General'

              return (
                <div
                  key={p.id}
                  className="rounded-xl border border-[#382416]/15 bg-[#f7f2ea]/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold uppercase text-[#382416]">{p.name}</p>
                      <p className="text-xs text-slate-500">ID: {p.id} · {p.topFactor}</p>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                      bed === 'ICU' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {bed} BED
                    </span>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-[#382416]/15 text-xs flex flex-wrap items-center justify-between gap-2 text-slate-700">
                    <span className="flex items-center gap-1.5 font-sans">
                      <Clock className="size-3.5 text-emerald-600" />
                      Est. Recovery: <strong>{p.estRecoveryMinutes ?? 30}m remaining</strong>
                    </span>
                    {bed === 'ICU' && (
                      <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Step-Down: S &lt; {req.icuStepDownThreshold} ({req.requiredSpecialist})
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Doctor Roster & Bed Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Doctor Roster */}
          <div className="rounded-2xl border border-[#382416]/15 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-[#382416] border-b border-[#382416]/15 pb-3">
              ON-CALL SPECIALIST PHYSICIANS
            </h3>

            <div className="space-y-2 font-mono text-xs">
              {specialistList.map((spec) => (
                <div key={spec.name} className="flex items-center justify-between rounded-xl border border-[#382416]/15 bg-[#f7f2ea]/50 p-3">
                  <span className="font-bold text-[#382416] uppercase">{spec.name}</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                    {spec.count} ON DUTY
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Bed Release Triggers */}
          <div className="rounded-2xl border border-[#382416]/15 bg-white p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase text-[#382416] border-b border-[#382416]/15 pb-3">
              TRIGGER CLINICAL DISCHARGE
            </h3>

            <div className="space-y-3">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleBedReleaseAction('recovery')}
                className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-xs flex items-center justify-center gap-2 cursor-pointer font-mono"
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
