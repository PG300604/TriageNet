'use client'

import React, { useState } from 'react'
import { computeMLSeverity, type VitalsInput } from '@/lib/ml-severity-scorer'
import { type Patient, type TriageState } from '@/lib/triage-data'
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

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Patient Directory & Clinical Records</h2>
          <p className="text-xs text-slate-500">
            Real-time patient telemetry, ML severity scoring, and EHR records across regional hospitals.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-2xs">
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
        {/* Left Column: Filtered Patient Directory List */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Users className="size-4 text-emerald-600" />
              Active Patient Records ({filteredPatients.length})
            </h3>
            <span className="text-xs font-mono font-semibold text-slate-500">ML Model Active</span>
          </div>

          <div className="space-y-3">
            {filteredPatients.map((p, idx) => {
              const isSelected = selectedPatient?.id === p.id
              const isHighRisk = p.severity >= 80
              const isModRisk = p.severity >= 50 && p.severity < 80

              return (
                <div
                  key={`${p.id}-${idx}`}
                  onClick={() => setSelectedPatient(p)}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-9 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                        isHighRisk
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : isModRisk
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {p.severity}
                    </span>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{p.name}</span>
                      <span className="text-xs text-slate-500 font-mono">
                        {p.id} · Wait: {p.waitMinutes}m · {p.topFactor}
                      </span>
                    </div>
                  </div>

                  <span className={`text-xs px-2.5 py-1 rounded-full ${getPatientStatusBadgeClass(p.status)}`}>
                    {p.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Live ML Vitals Severity Calculator */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Sparkles className="size-4 text-emerald-600" />
                Live ML Severity Scorer Test
              </h3>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                Sigmoid(W·X + b)
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Adjust patient vitals to observe dynamic score evaluation powered by offline logistic regression.
            </p>

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
                  className="w-full accent-emerald-600"
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
                  className="w-full accent-emerald-600"
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
                  className="w-full accent-emerald-600"
                />
              </div>
            </div>

            {/* Computed ML Result Box */}
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-600">Calculated Severity</span>
                <span
                  className={`text-2xl font-extrabold font-mono ${
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

              <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                <span>Risk Tier: <strong className="text-slate-900">{prediction.riskTier}</strong></span>
                <span>Confidence: <strong className="text-emerald-700">{prediction.modelConfidence}%</strong></span>
              </div>

              {/* Explainable Top Factors */}
              <div className="mt-3 border-t border-slate-200/80 pt-2 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 block">Top Risk Drivers:</span>
                {prediction.topFactors.map((tf) => (
                  <div key={tf.factor} className="flex justify-between text-xs text-slate-700 font-mono">
                    <span>• {tf.factor}</span>
                    <span className="font-bold text-slate-900">{tf.impactPct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
