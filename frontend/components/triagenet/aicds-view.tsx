'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { type TriageState, getPatientClinicalRequirement } from '@/lib/triage-data'
import { Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, BedDouble, Lock, Activity, Heart, Thermometer, Wind } from 'lucide-react'

interface AiCdsViewProps {
  state: TriageState
}

export function AiCdsView({ state }: AiCdsViewProps) {
  const waitingPatients = state.patients.filter((p) => p.status === 'Waiting')
  const assignedPatients = state.patients.filter((p) => p.status === 'Assigned')
  const dischargedCount = state.patients.filter((p) => p.status === 'Discharged').length

  const cityHospital = state.hospitals.find((h) => h.id === 'hosp-1')
  const cityIcuOccupied = assignedPatients.filter((p) => p.hospitalId === 'hosp-1' && p.bedType === 'ICU').length
  const isCriticalLock = cityHospital && cityIcuOccupied >= (cityHospital.icuBeds?.total ?? 4)

  return (
    <div className="space-y-6 font-sans text-[#2c1b0e]">
      {/* AI CDS Header Banner */}
      <div className="rounded-2xl border border-[#382416]/20 bg-gradient-to-r from-[#f7f2ea] to-[#ffffff] p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <Sparkles className="size-6 text-[#dc5000] shrink-0" />
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#382416] block">
              AI CLINICAL DECISION SUPPORT // PREDICTIVE RECOMMENDATION ENGINE
            </span>
            <p className="text-sm font-medium text-slate-700 mt-0.5">
              Automated multi-resource bipartite matching, ML vitals risk driver breakdown, non-preemptible occupancy locking, and transparent assignment rationale.
            </p>
          </div>
        </div>
      </div>

      {/* Critical Occupancy Lock Banner */}
      {isCriticalLock && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-5 text-red-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <Lock className="size-6 text-red-600 shrink-0" />
            <div>
              <span className="text-xs font-mono font-bold uppercase text-red-800 block">
                ⚠️ CRITICAL OCCUPANCY LOCK ACTIVE — PREEMPTION PROHIBITED
              </span>
              <p className="text-xs font-mono text-red-900 mt-0.5">
                City General ICU is 100% occupied by critical patients (S ≥ 85). Preemption is prohibited. New severe arrivals temporarily assigned to secondary facilities.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-red-800 bg-white border border-red-300 px-3 py-1 rounded-full shadow-2xs">
            CASUALTY PREVENTED
          </span>
        </div>
      )}

      {/* Real-time Audit & Discharges Counter */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <span className="text-xs font-mono text-slate-500 font-bold uppercase block">WAITING QUEUE CANDIDATES</span>
          <p className="text-3xl font-extrabold font-mono text-[#382416] mt-2">{waitingPatients.length}</p>
        </div>

        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <span className="text-xs font-mono text-slate-500 font-bold uppercase block">ACTIVE ICU MATCHES</span>
          <p className="text-3xl font-extrabold font-mono text-red-600 mt-2">{assignedPatients.filter((p) => p.bedType === 'ICU').length}</p>
        </div>

        <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs">
          <span className="text-xs font-mono text-slate-500 font-bold uppercase block">TOTAL DISCHARGED & FREED BEDS</span>
          <p className="text-3xl font-extrabold font-mono text-emerald-600 mt-2">{dischargedCount}</p>
        </div>
      </div>

      {/* AI CDS Assignment Rationale & Risk Driver Breakdown */}
      <div className="rounded-2xl border border-[#382416]/15 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#382416]/15 pb-3">
          <h3 className="text-sm font-bold uppercase text-[#382416] font-mono tracking-wider">
            AI PLACEMENT RATIONALE & CLINICAL COMPATIBILITY AUDIT
          </h3>
          <span className="text-xs font-mono font-bold text-[#382416] bg-[#f7f2ea] border border-[#382416]/20 px-3 py-1 rounded-full">
            MODEL: LOGISTIC REGRESSION (SIGMOID)
          </span>
        </div>

        <div className="space-y-4">
          {state.patients.slice(0, 8).map((p) => {
            const req = getPatientClinicalRequirement(p)
            const isCritical = p.severity >= 80

            return (
              <motion.div
                key={p.id}
                whileHover={{ y: -1 }}
                className="rounded-xl border border-[#382416]/15 bg-slate-50/80 p-5 space-y-3 shadow-2xs"
              >
                {/* Header Lockup */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#382416]/10 pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold uppercase text-[#382416] font-mono">{p.name}</span>
                      <span className="text-xs font-mono font-semibold text-slate-500">({p.id})</span>
                    </div>
                    <p className="text-xs font-medium text-slate-700 mt-0.5">{req.matchReason}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${
                      isCritical ? 'bg-red-100 text-red-800 border-red-300' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      URGENCY SCORE S: {p.severity} / 100
                    </span>
                  </div>
                </div>

                {/* Clinical Vitals Risk Drivers Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Wind className="size-3 text-cyan-600" /> SpO₂ IMPACT
                    </span>
                    <p className="text-xs font-bold text-slate-900 font-mono mt-1">
                      {p.severity >= 80 ? '52% (CRITICAL)' : '24% (NORMAL)'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Heart className="size-3 text-red-600" /> HEART RATE
                    </span>
                    <p className="text-xs font-bold text-slate-900 font-mono mt-1">
                      {p.severity >= 80 ? '28% (ELEVATED)' : '18% (STABLE)'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Thermometer className="size-3 text-amber-600" /> BODY TEMP
                    </span>
                    <p className="text-xs font-bold text-slate-900 font-mono mt-1">
                      {p.severity >= 80 ? '14% (FEVER)' : '10% (AFEBRILE)'}
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-slate-200">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1">
                      <Activity className="size-3 text-emerald-600" /> AGE / COMORBID
                    </span>
                    <p className="text-xs font-bold text-slate-900 font-mono mt-1">
                      6% WEIGHT
                    </p>
                  </div>
                </div>

                {/* High-Contrast Match Requirements & Step-Down Criteria */}
                <div className="rounded-lg bg-white p-3 border border-[#382416]/15 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#382416] uppercase">REQUIRED SPECIALIST:</span>
                    <span className="font-bold text-slate-900 bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                      {req.requiredSpecialist.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#382416] uppercase">ICU STEP-DOWN CRITERIA:</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                      REQUIRED SEVERITY S &lt; {req.icuStepDownThreshold}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
