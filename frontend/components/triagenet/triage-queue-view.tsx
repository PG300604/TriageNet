'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
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
} from 'lucide-react'

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
  Waiting: 'bg-red-100 text-red-800 border border-red-300 font-bold',
  Assigned: 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold',
  Preempted: 'bg-purple-100 text-purple-800 border border-purple-300 font-extrabold shadow-2xs',
  Transferred: 'bg-cyan-100 text-cyan-800 border border-cyan-300 font-bold',
  Discharged: 'bg-slate-100 text-slate-700 border border-slate-300 font-bold',
}

function SeverityBadge({ severity }: { severity: number }) {
  const status = severityStatus(severity)
  return (
    <span
      className={cn(
        'inline-flex min-w-10 items-center justify-center rounded-lg border px-2 py-1 font-mono text-xs font-bold shadow-2xs',
        status === 'red' && 'bg-red-100 text-red-800 border-red-300',
        status === 'amber' && 'bg-amber-100 text-amber-800 border-amber-300',
        status === 'green' && 'bg-emerald-100 text-emerald-800 border-emerald-300',
      )}
    >
      {severity}
    </span>
  )
}

import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'

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
    } catch (e) {
      // Fallback client calculation
      const base = Math.min(100, Math.max(10, (100 - spo2) * 2.5 + (heartRate > 100 ? 25 : 0) + (systolicBp < 95 ? 20 : 0)))
      setLiveScore({
        score: Math.round(base),
        riskTier: base >= 80 ? 'HIGH_RISK' : (base >= 50 ? 'MODERATE_RISK' : 'LOW_RISK'),
        sepsisWarning: spo2 < 90 && heartRate > 110,
      })
    } finally {
      setScoringLoading(false)
    }
  }

  // Load Preset Emergency
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
  const avgWaitTillAssigned = getAverageWaitTillAssigned(patients)

  const displayedList = sortByPriority(tab === 'active' ? activePatients : dischargedPatients)


  return (
    <div className="flex flex-col gap-5 font-sans text-[#2c1b0e]">
      {/* Auto-Play Control & Simulation Feature Bar */}
      {onTogglePlay && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#382416]/20 bg-gradient-to-r from-[#f7f2ea] to-[#ffffff] p-4 text-[#382416] shadow-2xs">
          <div className="flex items-center gap-3">
            <Activity className="size-5 text-[#dc5000] shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#382416]">
                  CONTINUOUS SIMULATION ENGINE
                </span>
                {isPlaying && (
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full animate-pulse">
                    LIVE AUTO-PLAYING
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">
                Automated continuous patient scoring & Hungarian bed allocation.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={onTogglePlay}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-2xs ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-[#382416] hover:bg-[#2c1b0e] text-[#ffedd7]'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="size-3.5 fill-white" />
                <span>PAUSE AUTO-PLAY</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-[#ffedd7]" />
                <span>AUTO-PLAY SIMULATION</span>
              </>
            )}
          </motion.button>
        </div>
      )}

      {/* Live Operational Notification Alert */}
      {lastEventMessage && (
        <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <Zap className="size-5 text-red-600 shrink-0 animate-pulse" />
            <div>
              <span className="font-mono text-xs font-bold text-red-700 uppercase tracking-wider block">
                OPERATIONAL TRIAGE SYSTEM EVENT
              </span>
              <p className="text-sm font-medium">{lastEventMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Regional Referral Load-Balancing Banner */}
      {referralRecommendation && onExecuteReferral && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-cyan-900 shadow-2xs">
          <div className="flex items-center gap-3">
            <Network className="size-5 text-cyan-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-cyan-800 uppercase tracking-wider block">
                  REGIONAL REFERRAL RECOMMENDATION
                </span>
                <span className="text-[10px] font-mono font-bold text-cyan-800 bg-white border border-cyan-300 px-2 py-0.5 rounded-full">
                  {referralRecommendation.matchReason}
                </span>
              </div>
              <p className="text-sm font-medium text-cyan-900 mt-0.5">{referralRecommendation.reason}</p>
            </div>
          </div>
          <motion.button
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onExecuteReferral(referralRecommendation)}
            className="rounded-xl bg-cyan-700 hover:bg-cyan-800 px-4 py-2 text-xs font-bold text-white shadow-2xs flex items-center gap-2 cursor-pointer"
          >
            <span>REFER TO {referralRecommendation.toHospitalName.toUpperCase()}</span>
            <ArrowRight className="size-4" />
          </motion.button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#382416]/15 pb-3">
        {/* Tab Selection Lockup & Wait Time Metric */}
        <div className="flex items-center gap-4 font-mono">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('active')}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                tab === 'active'
                  ? 'bg-[#382416] text-[#ffedd7] border-[#382416] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              ACTIVE QUEUE ({activePatients.length})
            </button>

            <button
              type="button"
              onClick={() => setTab('discharged')}
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                tab === 'discharged'
                  ? 'bg-[#382416] text-[#ffedd7] border-[#382416] shadow-xs'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              <Archive className="size-3.5 text-emerald-600" />
              <span>DISCHARGED LOG ({dischargedPatients.length})</span>
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#382416] bg-[#f7f2ea] border border-[#382416]/20 px-3 py-1 rounded-xl font-bold">
            <Clock className="size-3.5 text-[#dc5000]" />
            <span>AVG WAIT TILL ASSIGNED: {avgWaitTillAssigned}M</span>
          </div>
        </div>

        {/* High Contrast Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {/* Rapid Clinical Intake Button */}
          <button
            type="button"
            onClick={() => {
              setIntakeOpen((v) => !v)
              handleScoreVitals()
            }}
            className="rounded-xl border border-blue-600 bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 font-bold text-white cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <UserPlus className="size-3.5 text-white" />
            <span>{intakeOpen ? 'CLOSE INTAKE FORM' : '+ RAPID ED INTAKE'}</span>
          </button>

          {/* Bed Release Triggers */}
          {onTriggerBedRelease && (
            <>
              <button
                type="button"
                onClick={() => onTriggerBedRelease('recovery')}
                className="rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 font-bold text-emerald-800 hover:bg-emerald-100 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <CheckCircle2 className="size-3.5" />
                <span>STEP-DOWN DISCHARGE</span>
              </button>

              <button
                type="button"
                onClick={() => onTriggerBedRelease('family_ama')}
                className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <LogOut className="size-3.5" />
                <span>TRANSFER / AMA</span>
              </button>
            </>
          )}

          {/* Arrival Injections */}
          {onInjectArrival && (
            <>
              <button
                type="button"
                onClick={() =>
                  onInjectArrival(
                    94,
                    'Ambulance Arrival (Cardiac Arrest)',
                    'Ventricular Fibrillation (SpO₂ 76%)',
                  )
                }
                className="rounded-xl border border-red-300 bg-red-50 px-3 py-1.5 font-bold text-red-800 hover:bg-red-100 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <AlertTriangle className="size-3.5" />
                <span>CRITICAL ARRIVAL</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  onInjectArrival(
                    45,
                    'Walk-in Patient (Sprain)',
                    'Ankle Laceration / Mild Swelling',
                  )
                }
                className="rounded-xl border border-slate-300 bg-slate-100 px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-200 cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <UserPlus className="size-3.5" />
                <span>ROUTINE ARRIVAL</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={onSimulate}
            className="rounded-xl bg-[#382416] hover:bg-[#2c1b0e] px-3 py-1.5 font-bold text-[#ffedd7] cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Play className="size-3.5 fill-[#ffedd7]" />
            <span>+7M STEP</span>
          </button>

          {onFastForward5x && (
            <button
              type="button"
              onClick={onFastForward5x}
              className="rounded-xl bg-[#382416] hover:bg-[#2c1b0e] px-3 py-1.5 font-bold text-[#ffedd7] cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <FastForward className="size-3.5" />
              <span>+35M STEP</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Rapid Clinical Intake Panel */}
      {intakeOpen && (
        <div className="rounded-2xl border-2 border-blue-600/30 bg-gradient-to-br from-blue-50/60 to-white p-5 shadow-lg space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-blue-600 text-white font-mono text-xs font-bold">
                ED
              </span>
              <div>
                <h3 className="font-mono text-sm font-bold text-[#382416] uppercase">
                  RAPID ED CLINICAL INTAKE & ML SCORING CONSOLE
                </h3>
                <p className="text-xs text-slate-500">
                  Real-time Logistic Regression vitals evaluation with Sepsis early warning
                </p>
              </div>
            </div>

            {/* Quick Emergency Presets */}
            <div className="flex items-center gap-1.5 flex-wrap font-mono text-[10px]">
              <span className="text-slate-400 font-bold uppercase mr-1">PRESETS:</span>
              <button
                type="button"
                onClick={() => {
                  loadPreset('trauma')
                  handleScoreVitals()
                }}
                className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-bold hover:bg-red-200 border border-red-300 cursor-pointer"
              >
                TRAUMA / HYPOXIA (76%)
              </button>
              <button
                type="button"
                onClick={() => {
                  loadPreset('cardiac')
                  handleScoreVitals()
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold hover:bg-amber-200 border border-amber-300 cursor-pointer"
              >
                ACUTE STEMI (HR 138)
              </button>
              <button
                type="button"
                onClick={() => {
                  loadPreset('sepsis')
                  handleScoreVitals()
                }}
                className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-bold hover:bg-purple-200 border border-purple-300 cursor-pointer"
              >
                SEPSIS SHOCK (39.8°C)
              </button>
              <button
                type="button"
                onClick={() => {
                  loadPreset('minor')
                  handleScoreVitals()
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 border border-slate-300 cursor-pointer"
              >
                ROUTINE / MINOR
              </button>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono text-xs">
            <div>
              <label className="text-slate-500 uppercase font-bold text-[10px] block mb-1">PATIENT FULL NAME</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-white border border-[#382416]/20 rounded-xl p-2 font-sans font-bold text-[#382416]"
              />
            </div>

            <div>
              <label className="text-slate-500 uppercase font-bold text-[10px] block mb-1">AGE & CHIEF COMPLAINT</label>
              <input
                type="text"
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                className="w-full bg-white border border-[#382416]/20 rounded-xl p-2 font-sans text-xs text-[#382416]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-500 uppercase font-bold text-[10px]">SpO₂ LEVEL: {spo2}%</label>
                <span className={cn('text-[9px] font-bold px-1.5 py-0.2 rounded', spo2 < 90 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800')}>
                  {spo2 < 90 ? 'HYPOXIC' : 'NORMAL'}
                </span>
              </div>
              <input
                type="range"
                min="65"
                max="100"
                value={spo2}
                onChange={(e) => {
                  setSpo2(Number(e.target.value))
                  handleScoreVitals()
                }}
                className="w-full cursor-pointer accent-blue-600"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-500 uppercase font-bold text-[10px]">HEART RATE: {heartRate} BPM</label>
                <span className={cn('text-[9px] font-bold px-1.5 py-0.2 rounded', heartRate > 110 ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800')}>
                  {heartRate > 110 ? 'TACHYCARDIA' : 'NORMAL'}
                </span>
              </div>
              <input
                type="range"
                min="45"
                max="180"
                value={heartRate}
                onChange={(e) => {
                  setHeartRate(Number(e.target.value))
                  handleScoreVitals()
                }}
                className="w-full cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* Vitals Row 2 & Score Attribution */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-blue-100">
            <div className="flex items-center gap-4 flex-wrap font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold text-[10px]">SYS BP:</span>
                <input
                  type="number"
                  value={systolicBp}
                  onChange={(e) => {
                    setSystolicBp(Number(e.target.value))
                    handleScoreVitals()
                  }}
                  className="w-20 bg-white border border-[#382416]/20 rounded-lg p-1 text-center font-bold"
                />
                <span className="text-slate-400 text-[10px]">mmHg</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-bold text-[10px]">TEMP:</span>
                <input
                  type="number"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => {
                    setTemperature(Number(e.target.value))
                    handleScoreVitals()
                  }}
                  className="w-20 bg-white border border-[#382416]/20 rounded-lg p-1 text-center font-bold"
                />
                <span className="text-slate-400 text-[10px]">°C</span>
              </div>

              {liveScore && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-bold">ML PREDICTED SCORE:</span>
                  <span className={cn(
                    'font-mono text-xs font-extrabold px-3 py-1 rounded-xl border',
                    liveScore.score >= 80 ? 'bg-red-100 text-red-900 border-red-300' :
                    liveScore.score >= 50 ? 'bg-amber-100 text-amber-900 border-amber-300' :
                    'bg-emerald-100 text-emerald-900 border-emerald-300'
                  )}>
                    SCORE {liveScore.score} · [{liveScore.riskTier.replace(/_/g, ' ')}]
                  </span>
                  {liveScore.sepsisWarning && (
                    <span className="text-[9px] font-bold text-red-700 bg-red-100 border border-red-300 px-2 py-0.5 rounded animate-pulse">
                      ⚠️ SEPSIS ALERT
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleAdmitPatient}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2 text-xs font-mono font-bold text-white shadow-md flex items-center gap-2 cursor-pointer transition-all"
            >
              <Zap className="size-3.5 fill-white" />
              <span>ADMIT PATIENT & MATCH BED</span>
            </button>
          </div>
        </div>
      )}

      {/* Queue Table */}
      <div className="rounded-2xl border border-[#382416]/15 bg-white shadow-xs overflow-hidden">
        <div className="grid grid-cols-[2.5rem_1fr] items-center gap-3 border-b border-[#382416]/15 bg-[#f7f2ea]/60 px-4 py-3 text-xs font-mono font-bold uppercase tracking-wider text-[#382416] sm:grid-cols-[2.5rem_1.6fr_5rem_6rem_1fr_7rem]">
          <span className="flex items-center gap-1">
            <ArrowUpDown className="size-3.5" />#
          </span>
          <span>PATIENT</span>
          <span className="hidden sm:block">SEVERITY</span>
          <span className="hidden sm:block">WAIT</span>
          <span className="hidden sm:block font-mono">TOP FACTOR</span>
          <span className="hidden text-right sm:block font-mono">STATUS</span>
        </div>

        {displayedList.length === 0 ? (
          <div className="p-8 text-center font-mono text-xs text-slate-500 uppercase">
            NO {tab.toUpperCase()} PATIENTS IN QUEUE
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {displayedList.map((patient, index) => {
              const flash = updatedIds.has(patient.id)
              const isPreempted = patient.status === 'Preempted'

              return (
                <motion.li
                  key={patient.id}
                  whileHover={{ x: 2 }}
                  className={cn(
                    'grid grid-cols-[2.5rem_1fr] items-center gap-3 px-4 py-3.5 transition-colors sm:grid-cols-[2.5rem_1.6fr_5rem_6rem_1fr_7rem]',
                    flash && 'bg-amber-50/80',
                    isPreempted && 'bg-purple-50/80 border-l-4 border-l-purple-600',
                  )}
                >
                  <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 font-mono text-xs font-bold text-[#382416] border border-slate-300">
                    {index + 1}
                  </span>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#382416] flex items-center gap-2 uppercase">
                      <span>{patient.name}</span>
                      {isPreempted && (
                        <span className="text-[10px] font-mono font-extrabold text-purple-900 bg-purple-100 px-2 py-0.5 rounded border border-purple-300">
                          PREEMPTED ➔ STEP-DOWN
                        </span>
                      )}
                    </p>
                    <p className="font-mono text-xs text-slate-500">
                      {patient.id} · P{Math.round(effectivePriority(patient))}
                    </p>
                  </div>

                  <div className="hidden sm:block">
                    <SeverityBadge severity={patient.severity} />
                  </div>
                  <span className="hidden items-center gap-1.5 font-mono text-xs font-bold text-slate-700 sm:flex">
                    <Clock className="size-3.5 text-slate-400" />
                    {patient.waitMinutes}M
                  </span>
                  <span className="hidden items-center gap-1.5 text-xs text-slate-600 font-mono sm:flex">
                    <Activity className="size-3.5 shrink-0 text-red-500" />
                    <span className="truncate uppercase">{patient.topFactor}</span>
                  </span>
                  <span className="hidden justify-end sm:flex">
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-xs font-mono uppercase shadow-2xs',
                        STATUS_STYLE[patient.status],
                      )}
                    >
                      {patient.status}
                    </span>
                  </span>
                </motion.li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
