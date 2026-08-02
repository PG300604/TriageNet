'use client'

import React from 'react'
import { BarChart3, TrendingUp, Cpu, Activity, Download } from 'lucide-react'

export function ReportsView() {
  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="size-5 text-emerald-600" />
            Reports & Risk Telemetry Analytics
          </h2>
          <p className="text-xs text-slate-500">Comprehensive triage performance metrics, wait time reduction statistics, and ML logs.</p>
        </div>

        <button type="button" className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700">
          <Download className="size-4" /> Export Analytics Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Average Wait Time</span>
          <span className="text-3xl font-extrabold font-mono text-emerald-600">14.2 min</span>
          <span className="text-xs text-emerald-700 font-bold block mt-1">▼ -48% Reduction vs Static Triage</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Dijkstra Overflow Transfers</span>
          <span className="text-3xl font-extrabold font-mono text-slate-900">12 Transfers</span>
          <span className="text-xs text-slate-500 font-medium block mt-1">Zero Facility Overcrowding Deaths</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Hungarian Bed Match Rate</span>
          <span className="text-3xl font-extrabold font-mono text-emerald-600">100%</span>
          <span className="text-xs text-emerald-700 font-bold block mt-1">Optimal Resource Compatibility</span>
        </div>
      </div>
    </div>
  )
}
