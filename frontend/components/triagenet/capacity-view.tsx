'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  type Hospital,
  type ResourcePool,
  type TriageState,
  getHospitalOpenBeds,
  getSeverePatientCount,
  hospitalStatus,
  occupancyRatio,
  poolStatus,
  STATUS_LABEL,
} from '@/lib/triage-data'
import { STATUS_CLASSES } from './status'
import {
  Calendar,
  Users,
  Grid,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  BedDouble,
  Wind,
  Stethoscope,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react'

interface CapacityViewProps {
  state: TriageState
  selectedHospitalId: string
  onSelectHospital: (id: string) => void
  onNavigateView?: (view: string) => void
}

function OccupancyBar({
  label,
  icon: Icon,
  pool,
}: {
  label: string
  icon: typeof BedDouble
  pool: ResourcePool
}) {
  const ratio = occupancyRatio(pool)
  const status = poolStatus(pool)
  const pct = Math.round(ratio * 100)
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 text-muted-foreground font-sans">
          <Icon className="size-3.5" />
          {label}
        </span>
        <span className="font-mono text-xs font-semibold text-foreground">
          {pool.used}/{pool.total} ({pct}%)
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 border border-slate-200/80">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            STATUS_CLASSES[status].bar,
          )}
          style={{ width: `${Math.max(pct, 4)}%` }}
        />
      </div>
    </div>
  )
}

function HospitalCard({
  hospital,
  state,
  selected,
  onSelect,
}: {
  hospital: Hospital
  state: TriageState
  selected: boolean
  onSelect: () => void
}) {
  const status = hospitalStatus(hospital)
  const severeCount = getSeverePatientCount(state.patients, hospital.id)
  const openBeds = getHospitalOpenBeds(hospital)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex flex-col gap-4 rounded-2xl border bg-white p-5 text-left transition-all duration-200 shadow-xs hover:shadow-md cursor-pointer',
        selected ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10' : 'border-slate-200/80',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-bold tracking-tight text-slate-900 font-sans">
            {hospital.name}
          </h3>
          <p className="text-xs text-slate-500 font-sans">Facility Code: {hospital.short}</p>
        </div>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold font-mono',
            STATUS_CLASSES[status].badge,
          )}
        >
          {STATUS_LABEL[status]}
        </span>
      </div>

      {/* Severe Cases vs Open Beds */}
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-200/80 bg-slate-50 p-2.5 text-center font-mono">
        <div className="rounded-lg bg-white p-2 border border-slate-200/60 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-sans font-medium">Severe Cases (S≥80)</span>
          <span className={cn('text-base font-bold', severeCount > 0 ? 'text-red-600' : 'text-slate-800')}>
            {severeCount}
          </span>
        </div>
        <div className="rounded-lg bg-white p-2 border border-slate-200/60 shadow-2xs">
          <span className="text-[10px] text-slate-500 block font-sans font-medium">Available Beds</span>
          <span className={cn('text-base font-bold', openBeds <= 2 ? 'text-amber-600' : 'text-emerald-600')}>
            {openBeds}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <OccupancyBar label="Beds" icon={BedDouble} pool={hospital.beds} />
        <OccupancyBar label="Ventilators" icon={Wind} pool={hospital.ventilators} />
        <OccupancyBar label="Specialists" icon={Stethoscope} pool={hospital.specialists} />
      </div>
    </button>
  )
}

export function CapacityView({
  state,
  selectedHospitalId,
  onSelectHospital,
  onNavigateView,
}: CapacityViewProps) {
  const { hospitals, patients } = state

  const highRiskCount = patients.filter((p) => p.severity >= 80 && p.status !== 'Transferred').length
  const moderateRiskCount = patients.filter((p) => p.severity >= 50 && p.severity < 80 && p.status !== 'Transferred').length
  const lowRiskCount = patients.filter((p) => p.severity < 50 && p.status !== 'Transferred').length

  const nav = (v: string) => {
    if (onNavigateView) onNavigateView(v)
  }

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Panacea Sub-Header Breadcrumb Tab Strip */}
      <div className="flex items-center gap-6 border-b border-slate-200/80 pb-3 text-xs font-semibold text-slate-600 overflow-x-auto">
        <button
          type="button"
          onClick={() => nav('patients')}
          className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          ✓ / Patient Directory
        </button>
        <button
          type="button"
          onClick={() => nav('docs')}
          className="hover:text-slate-900 cursor-pointer font-medium"
        >
          Detailed Patient Record
        </button>
        <button
          type="button"
          onClick={() => nav('clinical')}
          className="hover:text-slate-900 cursor-pointer font-medium"
        >
          Clinical Operations
        </button>
        <button
          type="button"
          onClick={() => nav('comms')}
          className="hover:text-slate-900 cursor-pointer font-medium"
        >
          Communications
        </button>
      </div>

      {/* TOP METRIC CARDS GRID (3 Cards with Rounded Icon Badges & Arrow ↗) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Card 1: Appointments Today */}
        <div
          onClick={() => nav('appointments')}
          className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                <Calendar className="size-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Appointments</h3>
                <p className="text-xs text-slate-400">Today</p>
              </div>
            </div>
            <ArrowUpRight className="size-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">98</span>
            <div className="text-right text-xs text-slate-500 font-medium">
              <span>New: 34</span> · <span className="text-emerald-600 font-bold">Annual Change: 65%</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Patients Today */}
        <div
          onClick={() => nav('patients')}
          className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 border border-blue-200">
                <Users className="size-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Total Patients</h3>
                <p className="text-xs text-slate-400">Today</p>
              </div>
            </div>
            <ArrowUpRight className="size-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{patients.length}</span>
            <div className="text-right text-xs text-slate-500 font-medium">
              <span>New: 29</span> · <span>Old Patients: 4</span>
            </div>
          </div>
        </div>

        {/* Card 3: Overall Rooms All Time */}
        <div
          onClick={() => nav('clinical')}
          className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
                <Grid className="size-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Overall Rooms</h3>
                <p className="text-xs text-slate-400">All Time</p>
              </div>
            </div>
            <ArrowUpRight className="size-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">112</span>
            <div className="text-right text-xs text-slate-500 font-medium">
              <span>General Rooms: 82</span> · <span>Private: 30</span>
            </div>
          </div>
        </div>
      </div>

      {/* PANACEA MAIN ANALYTICS WIDGETS GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* WIDGET 1: Patient Risk Analytics (Donut + Legend + AI Insights) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-6">
          <div>
            <h3 className="text-base font-bold text-slate-900">Patient Risk Analytics</h3>
            <p className="text-xs text-slate-500">Identifies high-risk patients based on predictive analytics</p>
          </div>

          <div className="my-6 grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
            {/* Risk Legend List */}
            <div className="space-y-4 sm:col-span-6">
              <div
                onClick={() => nav('patients')}
                className="flex items-center justify-between rounded-xl bg-red-50 p-3 border border-red-200 cursor-pointer hover:bg-red-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-red-500" />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{highRiskCount} Patients</span>
                    <span className="text-xs text-red-600 font-bold">High Risk</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-red-600 flex items-center gap-0.5">
                  <TrendingUp className="size-3" /> +3% This Week
                </span>
              </div>

              <div
                onClick={() => nav('patients')}
                className="flex items-center justify-between rounded-xl bg-blue-50 p-3 border border-blue-200 cursor-pointer hover:bg-blue-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-blue-500" />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{moderateRiskCount} Patients</span>
                    <span className="text-xs text-blue-600 font-bold">Moderate Risk</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-blue-600 flex items-center gap-0.5">
                  <TrendingDown className="size-3" /> -2% This Week
                </span>
              </div>

              <div
                onClick={() => nav('patients')}
                className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 border border-emerald-200 cursor-pointer hover:bg-emerald-100/70 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded-full bg-emerald-500" />
                  <div>
                    <span className="text-sm font-bold text-slate-900 block">{lowRiskCount} Patients</span>
                    <span className="text-xs text-emerald-600 font-bold">Low Risk</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                  <TrendingDown className="size-3" /> +87% Today
                </span>
              </div>
            </div>

            {/* Donut Chart SVG */}
            <div
              onClick={() => nav('aicds')}
              className="relative flex justify-center sm:col-span-6 cursor-pointer group"
            >
              <svg className="size-44 -rotate-90 group-hover:scale-105 transition-transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="38" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                {/* Green arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="12"
                  strokeDasharray="238"
                  strokeDashoffset="70"
                />
                {/* Blue arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray="238"
                  strokeDashoffset="170"
                />
                {/* Red arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeDasharray="238"
                  strokeDashoffset="215"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Sparkles className="size-5 text-emerald-600 mb-0.5 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">AI Insight</span>
              </div>
            </div>
          </div>

          {/* AI Insights Box */}
          <div
            onClick={() => nav('aicds')}
            className="rounded-xl bg-emerald-500/10 p-4 border border-emerald-500/20 text-xs text-emerald-900 font-semibold space-y-1 cursor-pointer hover:bg-emerald-500/20 transition-colors"
          >
            <p className="flex items-center gap-1.5">
              <span className="font-bold text-emerald-700">#</span> Sepsis Risk Detected in 3 Severe Patients
            </p>
            <p className="flex items-center gap-1.5">
              <span className="font-bold text-emerald-700">#</span> Dynamic Priority Decay Triggered for 7 Patients
            </p>
            <p className="flex items-center gap-1.5">
              <span className="font-bold text-emerald-700">#</span> ML Severity Model Confidence: 94.8%
            </p>
          </div>
        </div>

        {/* WIDGET 2: Patients Statistics (Bar Comparison) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">Patients Statistics</h3>
              <p className="text-xs text-slate-500">Figuring out stats for better health choices</p>
            </div>
            <button
              type="button"
              onClick={() => nav('reports')}
              className="text-xs font-mono font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              Weekly Analysis
            </button>
          </div>

          <div className="my-6 flex items-end justify-center gap-12 h-44">
            {/* Bar 1: Emergency Patient */}
            <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => nav('queue')}>
              <span className="text-xs font-extrabold text-pink-600 font-mono">56%</span>
              <div className="w-16 rounded-t-xl bg-pink-500 h-32 flex items-end justify-center pb-2 shadow-xs hover:bg-pink-600 transition-colors">
                <span className="text-[10px] font-bold text-white bg-pink-600/80 px-1 py-0.5 rounded">+37%</span>
              </div>
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span className="size-2 rounded-full bg-pink-500" />
                Emergency patient
              </span>
            </div>

            {/* Bar 2: Routine Patient */}
            <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => nav('queue')}>
              <span className="text-xs font-extrabold text-indigo-600 font-mono">45%</span>
              <div className="w-16 rounded-t-xl bg-indigo-500 h-24 flex items-end justify-center pb-2 shadow-xs hover:bg-indigo-600 transition-colors">
                <span className="text-[10px] font-bold text-white bg-indigo-600/80 px-1 py-0.5 rounded">+15%</span>
              </div>
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <span className="size-2 rounded-full bg-indigo-500" />
                Routine patient
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200/80 pt-3 text-xs text-slate-500">
            <span>Peak Emergency Surge: 1:00 PM - 4:00 PM</span>
            <span className="font-bold text-emerald-600">Capacity Optimized</span>
          </div>
        </div>
      </div>

      {/* WIDGET 3 & 4: Appointment Overview & Appointment Calendar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* WIDGET 3: Appointment Overview Timeline */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Appointment Overview</h3>
              <p className="text-xs text-slate-500">Smart health appointment schedule</p>
            </div>
            <ArrowUpRight className="size-5 text-slate-400 cursor-pointer hover:text-emerald-600" onClick={() => nav('appointments')} />
          </div>

          {/* Stat Counters Bar */}
          <div className="grid grid-cols-4 gap-2 border-y border-slate-200/80 py-3 text-center font-mono">
            <div className="cursor-pointer" onClick={() => nav('appointments')}>
              <span className="text-base font-extrabold text-slate-900 block">1025</span>
              <span className="text-[10px] text-slate-500 font-sans">Total Scheduled</span>
            </div>
            <div className="cursor-pointer" onClick={() => nav('appointments')}>
              <span className="text-base font-extrabold text-emerald-600 block">780</span>
              <span className="text-[10px] text-slate-500 font-sans">Completed</span>
            </div>
            <div className="cursor-pointer" onClick={() => nav('appointments')}>
              <span className="text-base font-extrabold text-amber-600 block">245</span>
              <span className="text-[10px] text-slate-500 font-sans">Missed</span>
            </div>
            <div className="cursor-pointer" onClick={() => nav('appointments')}>
              <span className="text-base font-extrabold text-red-600 block">17</span>
              <span className="text-[10px] text-slate-500 font-sans">Canceled</span>
            </div>
          </div>

          {/* Timeline Patient List */}
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/60 cursor-pointer hover:bg-slate-100" onClick={() => nav('appointments')}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-500">7:28 AM</span>
                <span className="size-2 rounded-full bg-emerald-500" />
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Jordan Rivers</span>
                  <span className="text-xs text-slate-500">Migraine · Triage Station 1</span>
                </div>
              </div>
              <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="size-4" />
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-red-50/50 p-3 border border-red-200/80 cursor-pointer hover:bg-red-100/60" onClick={() => nav('queue')}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-red-600">1:12 PM</span>
                <span className="size-2 rounded-full bg-red-500" />
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Taylor Green</span>
                  <span className="text-xs text-red-600 font-semibold">Emergency Patient · Throbbing Pain</span>
                </div>
              </div>
              <span className="flex size-7 items-center justify-center rounded-lg bg-red-100 text-red-700">
                <AlertTriangle className="size-4" />
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/60 cursor-pointer hover:bg-slate-100" onClick={() => nav('appointments')}>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs font-bold text-slate-500">6:11 PM</span>
                <span className="size-2 rounded-full bg-blue-500" />
                <div>
                  <span className="text-sm font-bold text-slate-900 block">Casey Blue</span>
                  <span className="text-xs text-slate-500">Pounding Sensation · Consultation</span>
                </div>
              </div>
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Clock className="size-4" />
              </span>
            </div>
          </div>
        </div>

        {/* WIDGET 4: Appointment Calendar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs lg:col-span-5 cursor-pointer" onClick={() => nav('appointments')}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Appointment Calendar</h3>
              <p className="text-xs text-slate-500">Schedule your health appointments with ease</p>
            </div>
            <div className="flex items-center gap-1 text-slate-500">
              <ChevronLeft className="size-4 cursor-pointer hover:text-slate-900" />
              <span className="font-mono text-xs font-bold text-slate-800">Feb 2026</span>
              <ChevronRight className="size-4 cursor-pointer hover:text-slate-900" />
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-slate-400 mb-2">
            <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono font-bold text-slate-800">
            <div className="p-2 rounded-lg bg-slate-50">1</div>
            <div className="p-2 rounded-lg bg-slate-50">2</div>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">3 •</div>
            <div className="p-2 rounded-lg bg-slate-50">4</div>
            <div className="p-2 rounded-lg bg-slate-50">5</div>
            <div className="p-2 rounded-lg bg-slate-50">6</div>
            <div className="p-2 rounded-lg bg-slate-50">7</div>
            <div className="p-2 rounded-lg bg-slate-50">8</div>
            <div className="p-2 rounded-lg bg-slate-50">9</div>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800 border border-blue-300">10 •</div>
            <div className="p-2 rounded-lg bg-slate-50">11</div>
            <div className="p-2 rounded-lg bg-slate-50">12</div>
            <div className="p-2 rounded-lg bg-slate-50">13</div>
            <div className="p-2 rounded-lg bg-slate-50">14</div>
            <div className="p-2 rounded-lg bg-slate-50">15</div>
            <div className="p-2 rounded-lg bg-slate-50">16</div>
            <div className="p-2 rounded-lg bg-red-100 text-red-800 border border-red-300 font-black">17 •</div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-200/80 flex items-center justify-between text-xs font-medium">
            <span className="text-slate-600">Selected: Feb 17 Surge Alert</span>
            <span className="font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">6 Emergency Patient Slots</span>
          </div>
        </div>
      </div>

      {/* FACILITY CAPACITY & SEVERE CASE MATRIX SECTION */}
      <section className="mt-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-500">
            Facility capacity & regional severe case matrix
          </h2>
          <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            4 Connected Regional Hospitals
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {hospitals.map((h) => (
            <HospitalCard
              key={h.id}
              hospital={h}
              state={state}
              selected={h.id === selectedHospitalId}
              onSelect={() => onSelectHospital(h.id)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
