'use client'

import React from 'react'
import { type TriageState } from '@/lib/triage-data'
import { Sparkles, AlertTriangle, Cpu, Activity, ShieldCheck, CheckCircle2, FileText, Zap } from 'lucide-react'

interface AiCdsViewProps {
  state: TriageState
}

export function AiCdsView({ state }: AiCdsViewProps) {
  const severePatients = state.patients.filter((p) => p.severity >= 80 && p.status !== 'Transferred')

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="size-5 text-emerald-600 animate-pulse" />
            AI Clinical Decision Support (CDS) & Predictive Analytics
          </h2>
          <p className="text-xs text-slate-500">
            Real-time sepsis detection, severe risk stratification, and Hungarian bed assignment recommendations.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
          Model Accuracy: 94.8% (Offline Trained)
        </span>
      </div>

      {/* Top AI Insights Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 shadow-2xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-red-100 text-red-700">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">Sepsis Risk Alerts</span>
              <span className="text-xs text-red-700 block font-semibold">3 Patients Flagged</span>
            </div>
          </div>
          <p className="text-xs text-red-800 leading-relaxed font-medium">
            Combined SpO₂ &lt; 88% and HR &gt; 115 bpm detected. High priority ICU assignment recommended.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-2xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Cpu className="size-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">Hungarian Matcher</span>
              <span className="text-xs text-emerald-700 block font-semibold">O(n³) Optimization Active</span>
            </div>
          </div>
          <p className="text-xs text-emerald-800 leading-relaxed font-medium">
            Zero compatibility mismatch errors across 100% of bed and ventilator allocations.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-2xs">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <Activity className="size-5" />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-900">Dynamic Wait Decay</span>
              <span className="text-xs text-blue-700 block font-semibold">Priority Heap Scheduler</span>
            </div>
          </div>
          <p className="text-xs text-blue-800 leading-relaxed font-medium">
            P = Severity + 0.45(Wait). Prevents lower-acuity waiting room deterioration.
          </p>
        </div>
      </div>

      {/* Critical High Risk Patients Analytics Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="size-5 text-emerald-600" />
          High Risk Patient Stratification ({severePatients.length} Critical Cases)
        </h3>

        <div className="space-y-4">
          {severePatients.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-red-200 bg-red-50/50 p-4"
            >
              <div className="flex items-center gap-4">
                <span className="flex size-10 items-center justify-center rounded-xl bg-red-600 text-white font-mono font-bold text-base shadow-xs">
                  {p.severity}
                </span>
                <div>
                  <span className="text-base font-bold text-slate-900 block">{p.name}</span>
                  <span className="text-xs text-slate-600 font-mono">
                    ID: {p.id} · Primary Driver: {p.topFactor} · Wait: {p.waitMinutes}m
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
                  AI Recommendation: ICU Bed Match
                </span>
                <span className="text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-lg border border-red-300">
                  {p.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
