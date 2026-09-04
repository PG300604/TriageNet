'use client'

import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import React, { useState } from 'react'
import {
  type Hospital,
  type Patient,
  type PatientStatus,
  type ReferralRecommendation,
  effectivePriority,
  severityStatus,
  sortByPriority,
  getAverageWaitTillAssigned,
} from '@/lib/triage-data'
import {
  Activity,
  ArrowUpDown,
  Clock,
  FastForward,
  Play,
  Pause,
  AlertTriangle,
  UserPlus,
  Zap,
  CheckCircle2,
  LogOut,
  Network,
  ArrowRight,
  Archive,
  ChevronDown,
  ChevronUp,
  HeartPulse,
  BedDouble,
  Stethoscope,
  Send,
  X,
  Sliders,
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'

interface TriageQueueViewProps {
  hospital: Hospital
  patients: Patient[]
  updatedIds: Set<string>
  onSimulate: () => void
  onFastForward5x?: () => void
  onInjectArrival?: (severity: number, name: string, complaint: string) => void
  onTriggerBedRelease?: (reason: 'recovery' | 'family_ama') => void
  referralRecommendation?: ReferralRecommendation | null
  onExecuteReferral?: (referral: ReferralRecommendation) => void
  lastEventMessage?: string | null
  isPlaying?: boolean
  onTogglePlay?: () => void
}

const STATUS_STYLE: Record<PatientStatus, string> = {
  Waiting: 'bg-rose-50 text-rose-700 border border-rose-200 font-semibold',
  Assigned: 'bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold',
  Preempted: 'bg-purple-50 text-purple-700 border border-purple-200 font-semibold',
  Transferred: 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold',
  Discharged: 'bg-stone-100 text-stone-600 border border-stone-200 font-medium',
}

function SeverityBadge({ severity }: { severity: number }) {
  const status = severityStatus(severity)
  return (
    <span
      className={cn(
        'inline-flex min-w-9 items-center justify-center rounded-xl border px-2 py-0.5 text-xs font-bold shadow-2xs',
        status === 'red' && 'bg-rose-50 text-rose-700 border-rose-200',
        status === 'amber' && 'bg-amber-50 text-amber-700 border-amber-200',
        status === 'green' && 'bg-emerald-50 text-emerald-700 border-emerald-200',
      )}
    >
      {severity}
    </span>
  )
}

export function TriageQueueView({
  hospital,
  patients,
  updatedIds,
  onSimulate,
  onFastForward5x,
  onInjectArrival,
  onTriggerBedRelease,
  referralRecommendation,
  onExecuteReferral,
  lastEventMessage,
  isPlaying = false,
  onTogglePlay,
}: TriageQueueViewProps) {
  const { user } = useAuth()
  const [tab, setTab] = useState<'active' | 'discharged'>('active')
  const [intakeOpen, setIntakeOpen] = useState(false)
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null)

  // Rapid Intake Form State
  const [patientName, setPatientName] = useState('Ramesh Soren')
  const [patientAge, setPatientAge] = useState(45)
  const [complaint, setComplaint] = useState('Severe Chest Pain & Dyspnea')
  const [spo2, setSpo2] = useState(84)
  const [heartRate, setHeartRate] = useState(132)
  const [systolicBp, setSystolicBp] = useState(90)
  const [temperature, setTemperature] = useState(38.4)
  const [liveScore, setLiveScore] = useState<{ score: number; riskTier: string; sepsisWarning: boolean } | null>(null)
  const [scoringLoading, setScoringLoading] = useState(false)

  // Live Score Calculator
  const handleScoreVitals = async () => {
    setScoringLoading(true)
    try {
      const res = await apiClient.scoreVitals({
        spo2,
        heartRate,
        systolicBp,
        temperature,
        age: patientAge,
      })
      setLiveScore(res)
    } catch {
      // Client calculation fallback
      const base = Math.min(100, Math.max(10, (100 - spo2) * 2.5 + (heartRate > 100 ? 25 : 0) + (systolicBp < 95 ? 20 : 0)))
      setLiveScore({
        score: Math.round(base),
        riskTier: base >= 80 ? 'HIGH_RISK' : base >= 50 ? 'MODERATE_RISK' : 'LOW_RISK',
        sepsisWarning: spo2 < 90 && heartRate > 110,
      })
    } finally {
      setScoringLoading(false)
    }
  }

  const loadPreset = (preset: 'trauma' | 'cardiac' | 'sepsis' | 'minor') => {
    if (preset === 'trauma') {
      setPatientName('Vikram Mahto (Blast Trauma)')
      setComplaint('Airway Obstruction & Severe Blast Injury')
      setSpo2(76)
      setHeartRate(145)
      setSystolicBp(85)
      setTemperature(37.0)
    } else if (preset === 'cardiac') {
      setPatientName('Anita Kumari (Acute STEMI)')
      setComplaint('Crushing Substernal Chest Pain · Diaphoresis')
      setSpo2(91)
      setHeartRate(138)
      setSystolicBp(175)
      setTemperature(36.8)
    } else if (preset === 'sepsis') {
      setPatientName('Babloo Munda (Septic Shock)')
      setComplaint('High Fever · Hypotension · Altered Sensorium')
      setSpo2(87)
      setHeartRate(126)
      setSystolicBp(82)
      setTemperature(39.8)
    } else {
      setPatientName('Sanjay Gope (Minor Laceration)')
      setComplaint('Superficial Hand Wound · Stable Vitals')
      setSpo2(99)
      setHeartRate(72)
      setSystolicBp(120)
      setTemperature(36.6)
    }
  }

  const handleAdmitPatient = () => {
    if (onInjectArrival) {
      const score = liveScore ? liveScore.score : 85
      onInjectArrival(score, patientName, complaint)
      setIntakeOpen(false)
    }
  }

  const activePatients = patients.filter((p) => p.status !== 'Discharged')
  const dischargedPatients = patients.filter((p) => p.status === 'Discharged')
  const waitingCount = patients.filter((p) => p.status === 'Waiting').length
  const assignedCount = patients.filter((p) => p.status === 'Assigned').length
  const preemptedCount = patients.filter((p) => p.status === 'Preempted').length
  const avgWaitTillAssigned = getAverageWaitTillAssigned(patients)

  const displayedList = sortByPriority(tab === 'active' ? activePatients : dischargedPatients)

  const toggleRow = (id: string) => {
    setExpandedPatientId(expandedPatientId === id ? null : id)
  }

  return (
    <div className="space-y-6 font-sans text-[#2c1b0e]">
      {/* 4-Card Queue Summary Grid (Boltshift & Starline pattern) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Hero Brand Card: Waiting in Queue */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-xs">
              TRIAGE QUEUE HEAP
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-white/15">
              <Clock className="size-4 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight">{waitingCount}</p>
            <p className="mt-1 text-xs font-medium text-white/85">
              Patients Awaiting Bed Allocation
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
            <span className="inline-block size-1.5 rounded-full bg-amber-300 animate-pulse" />
            Hungarian Match Engine Running
          </div>
        </div>

        {/* Card 2: Bed Assigned */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              ACTIVE BED ASSIGNMENTS
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <BedDouble className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[#382416]">{assignedCount}</p>
            <p className="mt-1 text-xs font-medium text-stone-500">
              Patients receiving inpatient care
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            Optimal Care Ratio
          </div>
        </div>

        {/* Card 3: Preempted / Step-Down */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              PREEMPTED STEP-DOWN
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-purple-50 text-purple-600">
              <Activity className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[#382416]">{preemptedCount}</p>
            <p className="mt-1 text-xs font-medium text-stone-500">
              Stable patients stepped down for critical arrivals
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
            0 Mortality Protocol Active
          </div>
        </div>

        {/* Card 4: Average Wait Time */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              AVG TIME TILL ASSIGNED
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[#382416]">
              {avgWaitTillAssigned} <span className="text-base font-semibold text-stone-400">min</span>
            </p>
            <p className="mt-1 text-xs font-medium text-stone-500">
              Real-time calculated queue latency
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            Target: &lt; 20 Mins
          </div>
        </div>
      </div>

      {/* Operational Events & Referral Alerts */}
      {lastEventMessage && (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800 shadow-xs">
          <div className="flex items-center gap-3">
            <Zap className="size-4 text-rose-600 shrink-0 animate-pulse" />
            <span>{lastEventMessage}</span>
          </div>
        </div>
      )}

      {referralRecommendation && onExecuteReferral && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sky-200 bg-sky-50/80 p-4 text-sky-900 shadow-xs">
          <div className="flex items-center gap-3">
            <Network className="size-5 text-sky-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
                  DIJKSTRA REGIONAL REFERRAL RECOMMENDATION
                </span>
                <span className="rounded-full bg-white border border-sky-300 px-2 py-0.2 text-[10px] font-bold text-sky-800">
                  {referralRecommendation.matchReason}
                </span>
              </div>
              <p className="text-xs text-sky-800 mt-0.5">{referralRecommendation.reason}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onExecuteReferral(referralRecommendation)}
            className="rounded-xl bg-sky-700 hover:bg-sky-800 px-4 py-2 text-xs font-bold text-white shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <span>Refer to {referralRecommendation.toHospitalName}</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>
      )}

      {/* Toolbar: Tabs, Intake Trigger & Step Simulation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
        {/* Tab Selection */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer',
              tab === 'active'
                ? 'bg-[#382416] text-[#ffedd7] shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            )}
          >
            Active Queue ({activePatients.length})
          </button>

          <button
            type="button"
            onClick={() => setTab('discharged')}
            className={cn(
              'rounded-xl px-4 py-2 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              tab === 'discharged'
                ? 'bg-[#382416] text-[#ffedd7] shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            )}
          >
            <Archive className="size-3.5 text-emerald-600" />
            <span>Discharged Log ({dischargedPatients.length})</span>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIntakeOpen((v) => !v)
              handleScoreVitals()
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#ea580c] px-3.5 py-2 text-white shadow-xs hover:bg-[#c2410c] cursor-pointer transition-colors"
          >
            <UserPlus className="size-3.5" />
            <span>{intakeOpen ? 'Close Intake Form' : '+ Rapid ED Intake'}</span>
          </button>

          {onTriggerBedRelease && (
            <>
              <button
                type="button"
                onClick={() => onTriggerBedRelease('recovery')}
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-800 hover:bg-emerald-100 cursor-pointer transition-colors"
              >
                Step-Down Discharge
              </button>
              <button
                type="button"
                onClick={() => onTriggerBedRelease('family_ama')}
                className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-700 hover:bg-stone-50 cursor-pointer transition-colors"
              >
                Transfer / AMA
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onSimulate}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#382416] px-3.5 py-2 font-bold text-[#ffedd7] hover:bg-[#28180d] cursor-pointer shadow-xs transition-colors"
          >
            <Play className="size-3 fill-[#ffedd7]" />
            <span>+7m Step</span>
          </button>

          {onFastForward5x && (
            <button
              type="button"
              onClick={onFastForward5x}
              className="inline-flex items-center gap-1 rounded-xl border border-stone-200 bg-white px-3 py-2 text-stone-700 hover:bg-stone-50 cursor-pointer transition-colors"
            >
              <FastForward className="size-3.5 text-[#ea580c]" />
              <span>+35m</span>
            </button>
          )}
        </div>
      </div>

      {/* Rapid Clinical Intake Console */}
      <AnimatePresence>
        {intakeOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-md space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#382416]">
                  Rapid ED Clinical Intake & ML Vitals Scorer
                </h3>
                <p className="text-xs text-stone-500">
                  Instant Logistic Regression acuity calculation & automated Hungarian bed allocation
                </p>
              </div>

              {/* Presets */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-stone-400 font-semibold text-[10px] uppercase mr-1">Presets:</span>
                <button
                  type="button"
                  onClick={() => { loadPreset('trauma'); handleScoreVitals(); }}
                  className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 text-rose-700 font-semibold hover:bg-rose-100"
                >
                  Trauma / Hypoxia
                </button>
                <button
                  type="button"
                  onClick={() => { loadPreset('cardiac'); handleScoreVitals(); }}
                  className="rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-amber-700 font-semibold hover:bg-amber-100"
                >
                  Acute STEMI
                </button>
                <button
                  type="button"
                  onClick={() => { loadPreset('sepsis'); handleScoreVitals(); }}
                  className="rounded-lg bg-purple-50 border border-purple-200 px-2.5 py-1 text-purple-700 font-semibold hover:bg-purple-100"
                >
                  Septic Shock
                </button>
                <button
                  type="button"
                  onClick={() => { loadPreset('minor'); handleScoreVitals(); }}
                  className="rounded-lg bg-stone-100 border border-stone-200 px-2.5 py-1 text-stone-700 font-semibold hover:bg-stone-200"
                >
                  Routine
                </button>
              </div>
            </div>

            {/* Input Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <label className="block text-stone-500 font-semibold text-[10px] uppercase mb-1">
                  Patient Full Name
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2 font-semibold text-stone-800 outline-none focus:border-[#ea580c] focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-500 font-semibold text-[10px] uppercase mb-1">
                  Chief Complaint
                </label>
                <input
                  type="text"
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 p-2 text-stone-800 outline-none focus:border-[#ea580c] focus:bg-white"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-semibold text-stone-500">
                  <span>SpO₂: {spo2}%</span>
                  <span className={spo2 < 90 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                    {spo2 < 90 ? 'HYPOXIC' : 'NORMAL'}
                  </span>
                </div>
                <input
                  type="range"
                  min="65"
                  max="100"
                  value={spo2}
                  onChange={(e) => { setSpo2(Number(e.target.value)); handleScoreVitals(); }}
                  className="w-full accent-[#ea580c] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 text-[10px] font-semibold text-stone-500">
                  <span>Heart Rate: {heartRate} BPM</span>
                  <span className={heartRate > 110 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                    {heartRate > 110 ? 'TACHYCARDIA' : 'NORMAL'}
                  </span>
                </div>
                <input
                  type="range"
                  min="45"
                  max="180"
                  value={heartRate}
                  onChange={(e) => { setHeartRate(Number(e.target.value)); handleScoreVitals(); }}
                  className="w-full accent-[#ea580c] cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100">
              <div className="flex items-center gap-3">
                {liveScore && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-stone-500">Calculated Acuity:</span>
                    <span className={cn(
                      'rounded-full px-3 py-1 text-xs font-bold border',
                      liveScore.score >= 80 ? 'bg-rose-50 text-rose-800 border-rose-200' :
                      liveScore.score >= 50 ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      'bg-emerald-50 text-emerald-800 border-emerald-200'
                    )}>
                      Score {liveScore.score} · {liveScore.riskTier.replace(/_/g, ' ')}
                    </span>
                    {liveScore.sepsisWarning && (
                      <span className="rounded-full bg-rose-100 border border-rose-200 px-2 py-0.5 text-[10px] font-bold text-rose-800 animate-pulse">
                        ⚠️ Sepsis Alert
                      </span>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAdmitPatient}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#382416] px-5 py-2 text-xs font-bold text-[#ffedd7] hover:bg-[#28180d] shadow-sm transition-colors cursor-pointer"
              >
                <Zap className="size-3.5 text-[#ea580c]" />
                <span>Admit & Match Bed</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expandable Queue Table (Inspired by Transaction History Image 3) */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs">
        <div className="grid grid-cols-[2.5rem_1.8fr_5.5rem_5.5rem_1fr_7rem_2rem] items-center gap-3 border-b border-stone-100 bg-stone-50/80 px-4 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
          <span>#</span>
          <span>Patient</span>
          <span className="hidden sm:block">Acuity</span>
          <span className="hidden sm:block">Wait</span>
          <span className="hidden md:block">Primary Complaint</span>
          <span className="text-right">Status</span>
          <span className="text-right"></span>
        </div>

        {displayedList.length === 0 ? (
          <div className="p-10 text-center text-xs font-medium text-stone-400">
            No {tab} patients currently in queue for this facility.
          </div>
        ) : (
          <ul className="divide-y divide-stone-100">
            {displayedList.map((patient, index) => {
              const isExpanded = expandedPatientId === patient.id
              const flash = updatedIds.has(patient.id)
              const isPreempted = patient.status === 'Preempted'

              return (
                <li key={patient.id} className="transition-colors">
                  {/* Row Header (Clickable) */}
                  <div
                    onClick={() => toggleRow(patient.id)}
                    className={cn(
                      'grid grid-cols-[2.5rem_1.8fr_5.5rem_5.5rem_1fr_7rem_2rem] items-center gap-3 px-4 py-3.5 cursor-pointer transition-colors',
                      isExpanded ? 'bg-amber-50/40 border-l-4 border-l-[#ea580c]' : 'hover:bg-stone-50/60',
                      flash && 'bg-amber-50',
                      isPreempted && !isExpanded && 'bg-purple-50/50 border-l-4 border-l-purple-500'
                    )}
                  >
                    <span className="flex size-7 items-center justify-center rounded-full bg-stone-100 text-xs font-bold text-[#382416]">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {patient.name}
                        </span>
                        {isPreempted && (
                          <span className="rounded bg-purple-100 px-1.5 py-0.2 text-[10px] font-bold text-purple-800">
                            Step-Down
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[11px] text-stone-400">
                        {patient.id} · Priority P{Math.round(effectivePriority(patient))}
                      </span>
                    </div>

                    <div className="hidden sm:block">
                      <SeverityBadge severity={patient.severity} />
                    </div>

                    <div className="hidden sm:flex items-center gap-1 text-xs font-semibold text-stone-700">
                      <Clock className="size-3 text-stone-400" />
                      <span>{patient.waitMinutes}m</span>
                    </div>

                    <div className="hidden md:flex items-center gap-1.5 text-xs text-stone-600 truncate">
                      <Activity className="size-3.5 shrink-0 text-[#ea580c]" />
                      <span className="truncate">{patient.topFactor}</span>
                    </div>

                    <div className="text-right">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-[11px]', STATUS_STYLE[patient.status])}>
                        {patient.status}
                      </span>
                    </div>

                    <div className="flex justify-end text-stone-400">
                      {isExpanded ? (
                        <ChevronUp className="size-4 text-[#ea580c]" />
                      ) : (
                        <ChevronDown className="size-4" />
                      )}
                    </div>
                  </div>

                  {/* Expandable 3-Column Clinical Drawer (Inspired by Transaction History Image 3) */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border-t border-amber-100 bg-gradient-to-b from-amber-50/30 to-white px-6 py-5"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                          {/* Column 1: Vitals & Acuity Telemetry */}
                          <div className="space-y-2 border-r-0 md:border-r border-stone-200/80 pr-0 md:pr-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              1. Presenting Vitals & Clinical Acuity
                            </span>
                            <div className="rounded-xl border border-stone-200/80 bg-white p-3 space-y-1.5 shadow-2xs">
                              <div className="flex justify-between">
                                <span className="text-stone-500 font-medium">Chief Complaint:</span>
                                <span className="font-bold text-stone-900">{patient.topFactor}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500 font-medium">Clinical Severity:</span>
                                <span className="font-bold text-[#ea580c]">{patient.severity} / 100 Acuity</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500 font-medium">Wait Duration:</span>
                                <span className="font-semibold text-stone-800">{patient.waitMinutes} minutes in queue</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500 font-medium">Est. Recovery:</span>
                                <span className="font-semibold text-stone-800">{patient.estRecoveryMinutes || 35} mins</span>
                              </div>
                            </div>
                          </div>

                          {/* Column 2: Hungarian Matching Rationale */}
                          <div className="space-y-2 border-r-0 md:border-r border-stone-200/80 pr-0 md:pr-4">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              2. Hungarian Algorithm Allocation
                            </span>
                            <div className="rounded-xl border border-stone-200/80 bg-white p-3 space-y-1.5 shadow-2xs">
                              <div className="flex justify-between">
                                <span className="text-stone-500 font-medium">Bed Requirement:</span>
                                <span className="font-bold text-stone-900">{patient.bedType || 'General Bed'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500 font-medium">Facility Node:</span>
                                <span className="font-semibold text-stone-800 truncate max-w-[150px]">{hospital.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500 font-medium">Hungarian Cost Matrix:</span>
                                <span className="font-mono text-emerald-700 font-bold">Optimal Match</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-stone-500 font-medium">Step-Down Countdown:</span>
                                <span className="font-semibold text-purple-700">{patient.stepDownCountdown || 15} mins remaining</span>
                              </div>
                            </div>
                          </div>

                          {/* Column 3: Immediate Actions */}
                          <div className="space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                              3. Emergency Clinical Actions
                            </span>
                            <div className="flex flex-col gap-2">
                              {patient.status === 'Waiting' && (
                                <button
                                  type="button"
                                  onClick={() => onTriggerBedRelease?.('recovery')}
                                  className="w-full rounded-xl bg-[#ea580c] py-2 px-3 text-xs font-bold text-white shadow-2xs hover:bg-[#c2410c] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <BedDouble className="size-3.5" />
                                  <span>Assign Bed Immediately</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => onTriggerBedRelease?.('recovery')}
                                className="w-full rounded-xl border border-emerald-200 bg-emerald-50 py-2 px-3 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <CheckCircle2 className="size-3.5" />
                                <span>Discharge & Free Bed</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onTriggerBedRelease?.('family_ama')}
                                className="w-full rounded-xl border border-stone-200 bg-white py-2 px-3 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <LogOut className="size-3.5 text-stone-400" />
                                <span>Discharge Against Medical Advice</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
