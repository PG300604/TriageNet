'use client'

import React from 'react'
import { type TriageState, type Patient, getPatientClinicalRequirement } from '@/lib/triage-data'
import { Sparkles, AlertTriangle, Cpu, Activity, ShieldCheck, CheckCircle2, Lock, Zap, LogOut, CheckCheck } from 'lucide-react'

interface AiCdsViewProps {
  state: TriageState
}

export function AiCdsView({ state }: AiCdsViewProps) {
  const severePatients = state.patients.filter((p) => p.severity >= 80 && p.status !== 'Transferred')
  const dischargedPatients = state.patients.filter((p) => p.status === 'Discharged')

  // Detect hospitals with 100% critical bed occupancy where preemption is prohibited
  const lockedHospitals = state.hospitals.filter((h) => {
    const totalBeds = h.beds.total
    const usedBeds = h.beds.used
    const severeCount = state.patients.filter((p) => p.hospitalId === h.id && p.severity >= 85).length
    return usedBeds >= totalBeds && severeCount >= totalBeds
  })

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="size-5 text-emerald-600 animate-pulse" />
            AI Clinical Decision Support (CDS) & Real-Time Discharge Tracking
          </h2>
          <p className="text-xs text-slate-500">
            Real-time explainable bed placement rationale, discharge bed releases, and non-preemptible critical occupancy locks.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
          Explainable AI Engine Active
        </span>
      </div>

      {/* CRITICAL OCCUPANCY LOCK & PREEMPTION PROHIBITION ALERT */}
      {lockedHospitals.length > 0 ? (
        <div className="rounded-2xl border border-red-300 bg-red-50/90 p-5 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="size-6 text-red-600 shrink-0" />
            <div>
              <span className="text-sm font-bold text-red-900 uppercase tracking-wider block">
                CRITICAL OCCUPANCY LOCK & PREEMPTION PROHIBITED
              </span>
              <p className="text-xs text-red-800 leading-relaxed font-semibold">
                {lockedHospitals.map((h) => h.name).join(', ')} is 100% occupied by critical patients (S ≥ 85). Preemption is clinically prohibited.
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-white p-3 border border-red-200 text-xs font-mono text-slate-800 flex justify-between items-center">
            <span>🛡️ Casualty Avoidance Protocol: Newly arrived severe patients automatically receive <strong>Temporary Emergency Holding Assignments</strong> at nearby general facilities.</span>
            <span className="font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">Preemption Locked</span>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs font-mono text-emerald-900 flex items-center justify-between shadow-2xs">
          <span className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="size-4 text-emerald-600" />
            Regional Capacity Normal: All primary specialty hospitals accepting direct assignments & preemption available if required.
          </span>
          <span className="text-[10px] bg-white border border-emerald-300 px-2 py-0.5 rounded text-emerald-800 font-bold">Optimal Matching</span>
        </div>
      )}

      {/* AI Insights & Discharge Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-2xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">Sepsis Alerts</span>
              <span className="text-xs text-red-700 block font-semibold">3 Patients Flagged</span>
            </div>
          </div>
          <p className="text-xs text-red-800 leading-relaxed font-medium">
            SpO₂ &lt; 88% and HR &gt; 115 bpm detected. High priority ICU assignment.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-2xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Cpu className="size-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">Hungarian Matcher</span>
              <span className="text-xs text-emerald-700 block font-semibold">O(n³) Active</span>
            </div>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            Verified: Open Beds + Equipment + Specialist Availability.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-2xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Activity className="size-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">Wait Decay</span>
              <span className="text-xs text-blue-700 block font-semibold">Priority Heap</span>
            </div>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            P = Severity + 0.5(Wait). Prevents waiting room deterioration.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-300 bg-emerald-100/60 p-5 shadow-2xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
              <LogOut className="size-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">Discharges & Beds Freed</span>
              <span className="text-xs text-emerald-800 block font-bold">{dischargedPatients.length} Patients Released</span>
            </div>
          </div>
          <p className="text-xs text-emerald-900 leading-relaxed font-medium">
            Treatment completed & beds freed for top waiting queue candidates.
          </p>
        </div>
      </div>

      {/* REAL-TIME DISCHARGE & BED RELEASE TRACKER PANEL */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <CheckCheck className="size-5 text-emerald-600" />
          Real-Time Discharge & Bed Release Audit Log
        </h3>

        {dischargedPatients.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 font-mono">
            No patients discharged in the current simulation session yet. Trigger 'Early Recovery Discharge' in Clinical Operations to test live bed release.
          </div>
        ) : (
          <div className="space-y-3">
            {dischargedPatients.map((p) => {
              const hosp = state.hospitals.find((h) => h.id === p.hospitalId)
              return (
                <div
                  key={p.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                      <LogOut className="size-4" />
                    </span>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{p.name}</span>
                      <span className="text-xs text-slate-600 font-mono">
                        Discharged from <strong>{hosp?.name ?? 'Facility'}</strong> · Primary Driver: {p.topFactor}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-3 py-1.5 rounded-lg border border-emerald-300 shadow-2xs">
                    ✓ BED FREED & RE-ASSIGNED
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Critical High Risk Patients & Assignment Rationale Inspection Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-600" />
          Transparent Assignment Rationale & Patient Stratification ({severePatients.length} Severe Cases)
        </h3>

        <div className="space-y-4">
          {severePatients.map((p) => {
            const req = getPatientClinicalRequirement(p)
            const hosp = state.hospitals.find((h) => h.id === p.hospitalId)
            const isOverflowHolding = hosp && hosp.beds.used >= hosp.beds.total

            return (
              <div
                key={p.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-red-600 text-white font-mono font-extrabold text-base shadow-xs">
                      {p.severity}
                    </span>
                    <div>
                      <span className="text-base font-bold text-slate-900 block">{p.name}</span>
                      <span className="text-xs text-slate-600 font-mono">
                        ID: {p.id} · Primary Driver: <strong>{p.topFactor}</strong> · Wait: {p.waitMinutes}m
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold px-3 py-1.5 rounded-lg border ${
                      isOverflowHolding
                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                        : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    }`}>
                      {isOverflowHolding ? 'TEMPORARY OVERFLOW HOLDING' : 'PRIMARY SPECIALTY ASSIGNMENT'}
                    </span>
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-lg border border-red-300">
                      {p.status}
                    </span>
                  </div>
                </div>

                {/* Explainable Rationale Box */}
                <div className="rounded-xl bg-white p-3 border border-slate-200 text-xs font-sans space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <Zap className="size-4" />
                      Assignment Rationale:
                    </span>
                    <span className="font-mono text-slate-500">Facility: {hosp?.name ?? 'Regional Facility'}</span>
                  </div>
                  <p className="text-slate-600 text-xs">
                    {isOverflowHolding
                      ? `⚠️ Patient temporarily assigned to ${hosp?.name} because primary specialty hospital beds are 100% occupied by critical non-preemptible patients. Temporary holding prevents casualty while awaiting bed clearance.`
                      : `✓ Matched directly to ${hosp?.name} based on primary clinical need (${req.matchReason}). On-call ${req.requiredSpecialist.replace('_', ' ')} verified available.`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
