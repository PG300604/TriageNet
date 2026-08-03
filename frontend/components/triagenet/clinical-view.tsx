'use client'

import React, { useState } from 'react'
import { type TriageState, triggerBedRelease, type Patient, getPatientClinicalRequirement } from '@/lib/triage-data'
import { Stethoscope, CheckCircle2, UserX, UserCheck, AlertTriangle, BedDouble, Clock, Users, ArrowDownRight, Activity } from 'lucide-react'

interface ClinicalViewProps {
  state: TriageState
  onStateChange?: (next: TriageState) => void
}

export function ClinicalView({ state, onStateChange }: ClinicalViewProps) {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(state.hospitals[0].id)
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null)
  const [lastAction, setLastAction] = useState<string | null>(null)

  const activeHospital = state.hospitals.find((h) => h.id === selectedHospitalId) ?? state.hospitals[0]
  const assignedPatients = state.patients.filter((p) => p.hospitalId === activeHospital.id && p.status === 'Assigned')

  const selectedPatient = assignedPatients.find((p) => p.id === selectedPatientId) ?? assignedPatients[0] ?? null

  const handleBedRelease = (reason: 'recovery' | 'family_ama') => {
    if (!selectedPatient) return
    const res = triggerBedRelease(state, activeHospital.id, reason, selectedPatient.id)
    if (onStateChange) onStateChange(res.state)
    setLastAction(res.message)
    setSelectedPatientId(null)
  }

  const roster = activeHospital.specialistRoster ?? {
    pulmonologists: { total: 3, available: 2 },
    cardiologists: { total: 3, available: 2 },
    traumaSurgeons: { total: 3, available: 3 },
    generalPhysicians: { total: 8, available: 5 },
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Stethoscope className="size-5 text-emerald-600" />
            Clinical Operations, Bed Stratification & Care Timelines
          </h2>
          <p className="text-xs text-slate-500">
            Real-time ICU vs General bed allocations, specialist physician availability, and estimated treatment timelines.
          </p>
        </div>

        {/* Hospital Selector Dropdown */}
        <select
          value={selectedHospitalId}
          onChange={(e) => {
            setSelectedHospitalId(e.target.value)
            setSelectedPatientId(null)
          }}
          className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-800 shadow-2xs focus:outline-none"
        >
          {state.hospitals.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name} ({h.beds.used}/{h.beds.total} Total Beds)
            </option>
          ))}
        </select>
      </div>

      {/* HOSPITAL BED STRATIFICATION & SPECIALIST ROSTER MATRIX */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Bed Stratification */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-1">Bed Stratification (ICU vs General)</span>
          <div className="grid grid-cols-2 gap-2 font-mono mt-2">
            <div className="rounded-xl bg-red-50 p-2.5 border border-red-200 text-center">
              <span className="text-[10px] text-red-700 font-sans block font-bold">ICU Beds</span>
              <span className="text-base font-extrabold text-red-900">
                {activeHospital.icuBeds?.used ?? 14}/{activeHospital.icuBeds?.total ?? 16}
              </span>
            </div>
            <div className="rounded-xl bg-emerald-50 p-2.5 border border-emerald-200 text-center">
              <span className="text-[10px] text-emerald-700 font-sans block font-bold">General Ward</span>
              <span className="text-base font-extrabold text-emerald-900">
                {activeHospital.generalBeds?.used ?? 20}/{activeHospital.generalBeds?.total ?? 32}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: On-Call Specialist Doctors Today */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block mb-2">Specialist Doctor Availability Today</span>
          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-600">Pulmonologists:</span>
              <span className="font-bold text-emerald-700">{roster.pulmonologists.available}/{roster.pulmonologists.total} On-Call</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Cardiologists:</span>
              <span className="font-bold text-emerald-700">{roster.cardiologists.available}/{roster.cardiologists.total} On-Call</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Trauma Surgeons:</span>
              <span className="font-bold text-emerald-700">{roster.traumaSurgeons.available}/{roster.traumaSurgeons.total} On-Call</span>
            </div>
          </div>
        </div>

        {/* Card 3: Dynamic Patient Step-Down Engine */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-900 flex items-center gap-1 mb-1">
              <ArrowDownRight className="size-4 text-emerald-700" />
              Dynamic Patient Step-Down Protocol
            </span>
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              When ICU patients recover below S &lt; 75, they are automatically shifted to General Ward beds to free critical ICU capacity.
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300 w-fit">
            Automatic Step-Down Active
          </span>
        </div>
      </div>

      {/* Event Message Banner */}
      {lastAction && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-mono font-bold text-emerald-900 flex items-center justify-between shadow-xs">
          <span>{lastAction}</span>
          <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">BED FREED & AUTO-ASSIGNED</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Ongoing Assigned Patients Selector & Care Timelines */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <UserCheck className="size-4 text-emerald-600" />
              Ongoing Assigned Patients & Treatment Timelines ({assignedPatients.length})
            </h3>
            <span className="text-xs font-mono text-slate-500">Care Countdown Active</span>
          </div>

          {assignedPatients.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500">
              No assigned patients currently in beds at {activeHospital.name}.
            </div>
          ) : (
            <div className="space-y-3">
              {assignedPatients.map((p, idx) => {
                const isSelected = selectedPatient?.id === p.id
                const bed = p.bedType ?? (p.severity >= 80 ? 'ICU' : 'General')
                const recTime = p.estRecoveryMinutes ?? 35
                const stepDownTime = p.stepDownCountdown ?? (p.severity >= 80 ? 18 : 0)

                return (
                  <div
                    key={`${p.id}-${idx}`}
                    onClick={() => setSelectedPatientId(p.id)}
                    className={`flex flex-col gap-2.5 p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 shadow-xs ring-2 ring-emerald-500/20'
                        : 'border-slate-200/80 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 font-mono text-xs font-bold text-emerald-800 border border-emerald-200">
                          {p.severity}
                        </span>
                        <div>
                          <span className="text-sm font-bold text-slate-900 block">{p.name}</span>
                          <span className="text-xs text-slate-500 font-mono">
                            ID: {p.id} · {p.topFactor}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                          bed === 'ICU'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}>
                          {bed} Bed
                        </span>
                      </div>
                    </div>

                    {/* Disease-Specific Treatment & Step-Down Timeline */}
                    {(() => {
                      const req = getPatientClinicalRequirement(p)
                      return (
                        <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-200/80 text-xs font-mono flex flex-wrap items-center justify-between gap-2 text-slate-700">
                          <span className="flex items-center gap-1.5 text-slate-600 font-sans">
                            <Clock className="size-3.5 text-emerald-600" />
                            Est. Treatment: <strong>{recTime}m remaining</strong>
                          </span>
                          {bed === 'ICU' && (
                            <span className="text-emerald-800 font-bold bg-white px-2 py-0.5 rounded border border-emerald-300">
                              Step-Down Threshold: S &lt; {req.icuStepDownThreshold} ({req.requiredSpecialist.replace('_', ' ')})
                            </span>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Selected Patient Clinical Task Controls */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Perform Clinical Action</h3>
            {selectedPatient ? (
              <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Patient:</span>
                  <span className="font-bold text-slate-900">{selectedPatient.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bed Assignment:</span>
                  <span className="font-bold text-red-700">{selectedPatient.bedType ?? 'General'} Bed</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Severity Score:</span>
                  <span className="font-bold text-emerald-600">{selectedPatient.severity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Facility:</span>
                  <span className="text-slate-800">{activeHospital.name}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mb-6">Select an assigned patient from the left panel to execute tasks.</p>
            )}

            <div className="space-y-4">
              {/* Task 1: Early Recovery Discharge */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <CheckCircle2 className="size-4 text-emerald-600" />
                  Early Recovery Discharge
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Discharge patient early, free bed, and auto-assign top waiting patient.
                </p>
                <button
                  type="button"
                  disabled={!selectedPatient}
                  onClick={() => handleBedRelease('recovery')}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 font-mono text-xs font-bold text-white shadow-xs hover:bg-emerald-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Discharge Selected Patient ({selectedPatient?.name ?? 'None Selected'})
                </button>
              </div>

              {/* Task 2: Family AMA Relocation */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                  <UserX className="size-4 text-amber-600" />
                  Family AMA / Private Relocation
                </h4>
                <p className="text-xs text-slate-500 mb-3">
                  Sign out patient Against Medical Advice (AMA), freeing bed for triage queue.
                </p>
                <button
                  type="button"
                  disabled={!selectedPatient}
                  onClick={() => handleBedRelease('family_ama')}
                  className="w-full rounded-xl bg-amber-600 px-4 py-2.5 font-mono text-xs font-bold text-white shadow-xs hover:bg-amber-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                >
                  Relocate Selected Patient ({selectedPatient?.name ?? 'None Selected'})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
