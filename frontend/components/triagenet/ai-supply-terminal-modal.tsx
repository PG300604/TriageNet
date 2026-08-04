'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type Hospital, type Patient, occupancyRatio, getAverageWaitTillAssigned, calculateAiSupplyNeed, type TriageState } from '@/lib/triage-data'
import { Terminal, ShieldAlert, CheckCircle2, XCircle, Activity, HelpCircle, Building2, Boxes } from 'lucide-react'

interface AiSupplyTerminalModalProps {
  isOpen: boolean
  onClose: () => void
  state: TriageState
  onConfirmDispatch: () => void
}

export function AiSupplyTerminalModal({
  isOpen,
  onClose,
  state,
  onConfirmDispatch,
}: AiSupplyTerminalModalProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [awaitingPermission, setAwaitingPermission] = useState(false)
  const [executionState, setExecutionState] = useState<'idle' | 'executing' | 'confirmed' | 'aborted'>('idle')

  const [targetHospName, setTargetHospName] = useState<string>('')
  const [targetShortName, setTargetShortName] = useState<string>('')
  const [neededTotalBeds, setNeededTotalBeds] = useState<number>(8)
  const [neededIcuBeds, setNeededIcuBeds] = useState<number>(2)
  const [neededVents, setNeededVents] = useState<number>(4)
  const [projectedLoad, setProjectedLoad] = useState<number>(0)
  const [oldLoad, setOldLoad] = useState<number>(0)

  const terminalEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setLogs([])
      setIsStreaming(false)
      setAwaitingPermission(false)
      setExecutionState('idle')
      return
    }

    // Dynamic Need-Based Calculation from state
    const need = calculateAiSupplyNeed(state)
    const targetHosp = need.targetHosp
    const donorHosp = need.donorHosp

    const oldUsedBeds = targetHosp.beds?.used ?? 26
    const oldTotalBeds = targetHosp.beds?.total ?? 30
    const oldLoadPct = Math.round(occupancyRatio(targetHosp.beds) * 100)
    const availableBeds = Math.max(0, oldTotalBeds - oldUsedBeds)

    const icuUsed = targetHosp.icuBeds?.used ?? 4
    const icuTotal = targetHosp.icuBeds?.total ?? 4
    const icuLoadPct = Math.round((icuUsed / (icuTotal || 1)) * 100)

    const ventsUsed = targetHosp.ventilators?.used ?? 4
    const ventsTotal = targetHosp.ventilators?.total ?? 5

    const safePatients = Array.isArray(state.patients) ? state.patients : []
    const hospPatients = safePatients.filter((p) => p.hospitalId === targetHosp.id)
    const waitingPts = hospPatients.filter((p) => p.status === 'Waiting' || p.status === 'Preempted')
    const severePts = hospPatients.filter((p) => p.severity >= 80 && p.status !== 'Transferred')
    const avgWait = getAverageWaitTillAssigned(safePatients)

    const newTotalBeds = oldTotalBeds + need.neededTotalBeds
    const newLoadPct = Math.round((oldUsedBeds / newTotalBeds) * 100)
    const loadRelief = oldLoadPct - newLoadPct

    setTargetHospName(targetHosp.name)
    setTargetShortName(targetHosp.short)
    setNeededTotalBeds(need.neededTotalBeds)
    setNeededIcuBeds(need.neededIcuBeds)
    setNeededVents(need.neededVents)
    setProjectedLoad(newLoadPct)
    setOldLoad(oldLoadPct)

    setLogs([])
    setIsStreaming(true)
    setAwaitingPermission(false)
    setExecutionState('idle')

    const nowStr = new Date().toLocaleTimeString()

    // SERIOUS PROFESSIONAL CLINICAL TERMINAL LOG SCRIPT — EMOJIS PURGED
    const rawScript: string[] = [
      `ai-agent@triagenet:~$ ./analyze-regional-supply-demands.sh --mode=realtime --timestamp="${nowStr}"`,
      '========================================================================================================',
      `[${nowStr}] [TELEMETRY INITIATED] Scanning live capacity & resource metrics across ${state.hospitals.length} regional facilities...`,
      '--------------------------------------------------------------------------------------------------------',
      'REALTIME REGIONAL HOSPITAL CAPACITY SCAN:',
      ...state.hospitals.map((h) => {
        const load = Math.round(occupancyRatio(h.beds) * 100)
        const statusTag = load >= 85 ? '[CRITICAL SURGE]' : load >= 70 ? '[STRAINED]' : '[NOMINAL]'
        const barLength = Math.round(load / 10)
        const bar = '█'.repeat(barLength) + '░'.repeat(10 - barLength)
        const shortName = (h.short || 'HOSP').padEnd(4)
        return `   • ${shortName} [${bar}] ${h.beds?.used ?? 0}/${h.beds?.total ?? 30} Beds (${load}%) ${statusTag}`
      }),
      '--------------------------------------------------------------------------------------------------------',
      `[SURGE BOTTLENECK IDENTIFIED] Facility: ${targetHosp.name} (${targetHosp.short})`,
      `[URGENCY LEVEL] ${need.urgencyLevel}`,
      `[CLINICAL REASON] ${need.reason}`,
      '--------------------------------------------------------------------------------------------------------',
      'EXACT BOTTLENECK METRICS:',
      `   ├── Current Capacity Load : ${oldUsedBeds}/${oldTotalBeds} Beds (${oldLoadPct}% Occupied)` + (oldLoadPct >= 85 ? ' [OVERBURDENED]' : ''),
      `   ├── Remaining Open Beds   : ${availableBeds} Bed Units Available`,
      `   ├── ICU Bed Utilization   : ${icuUsed}/${icuTotal} Beds Occupied (${icuLoadPct}% ICU Load)` + (icuLoadPct >= 90 ? ' [ICU AT CAPACITY]' : ''),
      `   ├── Ventilator Utilization: ${ventsUsed}/${ventsTotal} Units in Active Use`,
      `   ├── Active Queue Load     : ${waitingPts.length} Patients Waiting (${severePts.length} Critical S>=80)`,
      `   └── Regional Queue Latency: ${avgWait} Minutes Avg Wait Time`,
      '--------------------------------------------------------------------------------------------------------',
      'DYNAMIC NEED-BASED SUPPLY DISPATCH SOLUTION:',
      `   ├── Recipient Facility    : ${targetHosp.name} (${targetHosp.short})`,
      `   ├── Donor Facility        : ${donorHosp.name} (${donorHosp.short}) / Regional Reserve`,
      `   ├── Dynamic Supply Need   : +${need.neededTotalBeds} Total Beds (+${need.neededGenBeds} General, +${need.neededIcuBeds} ICU) & +${need.neededVents} Ventilators`,
      '   └── Allocation Type       : Situation-Based Dynamic Demand Dispatch',
      '--------------------------------------------------------------------------------------------------------',
      'PROJECTED METRIC & PERFORMANCE IMPACT:',
      `   ├── Bed Capacity Expansion: ${oldTotalBeds} Beds ➔ ${newTotalBeds} Beds (+${need.neededTotalBeds} Units)`,
      `   ├── Projected Occupancy   : ${oldLoadPct}% ➔ ${newLoadPct}% (-${loadRelief}% Net Capacity Relief)`,
      `   └── Queue Latency Impact  : Relieves Queue Bottleneck & Accelerates Patient Bed Allocation`,
      '========================================================================================================',
      `[ACTION REQUIRED] Awaiting Operator Authorization to Execute Supply Dispatch to ${targetHosp.name}.`,
    ]

    const script = rawScript.filter((s): s is string => typeof s === 'string' && s.length > 0)

    let currentStep = 0
    const interval = setInterval(() => {
      if (currentStep < script.length) {
        const nextLine = script[currentStep]
        if (typeof nextLine === 'string') {
          setLogs((prev) => [...prev, nextLine])
        }
        currentStep++
      } else {
        clearInterval(interval)
        setIsStreaming(false)
        setAwaitingPermission(true)
      }
    }, 180)

    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (isStreaming) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, isStreaming])

  const handleConfirm = () => {
    setAwaitingPermission(false)
    setExecutionState('confirmed')
    const nowStr = new Date().toLocaleTimeString()
    setLogs((prev) => [
      ...prev,
      '========================================================================================================',
      `[${nowStr}] [AUTHORIZATION GRANTED] Operator approved supply dispatch.`,
      `[${nowStr}] [DISPATCH COMPLETED] ${targetHospName} bed capacity expanded (+${neededTotalBeds} Beds). Occupancy reduced to ${projectedLoad}%.`,
      'ai-agent@triagenet:~$ _',
    ])
    onConfirmDispatch()
  }

  const handleAbort = () => {
    setAwaitingPermission(false)
    setExecutionState('aborted')
    const nowStr = new Date().toLocaleTimeString()
    setLogs((prev) => [
      ...prev,
      '========================================================================================================',
      `[${nowStr}] [AUTHORIZATION DENIED] Operator rejected supply dispatch.`,
      `[${nowStr}] [DISPATCH CANCELLED] Retaining current allocation (${oldLoad}% load at ${targetShortName}).`,
      'ai-agent@triagenet:~$ _',
    ])
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md font-mono">
        <motion.div
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.96, opacity: 0 }}
          className="w-full max-w-4xl rounded-2xl border border-emerald-500/40 bg-[#090d16] text-emerald-400 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* macOS Terminal Titlebar */}
          <div className="flex items-center justify-between border-b border-emerald-900/60 bg-[#121824] px-4 py-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="size-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors inline-block cursor-pointer" onClick={onClose} title="Close Terminal"></span>
                <span className="size-3 rounded-full bg-amber-500 hover:bg-amber-600 transition-colors inline-block"></span>
                <span className="size-3 rounded-full bg-emerald-500 hover:bg-emerald-600 transition-colors inline-block"></span>
              </div>
              <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
                <Terminal className="size-4 text-emerald-400" />
                <span className="font-bold tracking-wider text-emerald-400 uppercase font-mono">
                  TRIAGENET AI TELEMETRY TERMINAL // DYNAMIC DEMAND ENGINE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/90 border border-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                REALTIME METRICS SYNC
              </span>
              <button
                type="button"
                onClick={onClose}
                className="text-slate-400 hover:text-white cursor-pointer px-2 py-1 bg-slate-800 rounded text-[11px]"
              >
                CLOSE [ESC]
              </button>
            </div>
          </div>

          {/* User Instruction Info Banner */}
          <div className="bg-[#162032] border-b border-cyan-800/60 px-4 py-2 text-[11px] text-cyan-300 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono">
              <HelpCircle className="size-4 text-cyan-400 shrink-0" />
              <span>
                <strong>OPERATOR AUTHORIZATION REQUIRED:</strong> Review live telemetry above. Authorize or reject using the buttons embedded below.
              </span>
            </div>
          </div>

          {/* Terminal Screen Body — Realtime Terminal Stream */}
          <div className="p-5 font-mono text-xs space-y-1.5 overflow-y-auto flex-1 bg-[#090d16] selection:bg-emerald-900 selection:text-white leading-relaxed">
            {logs.map((rawLog, index) => {
              const log = typeof rawLog === 'string' ? rawLog : String(rawLog ?? '')
              const isCommand = log.startsWith('ai-agent@triagenet')
              const isDivider = log.startsWith('====') || log.startsWith('----')
              const isBottleneck = log.includes('[SURGE BOTTLENECK') || log.includes('EXACT BOTTLENECK')
              const isProposed = log.includes('DYNAMIC NEED-BASED') || log.includes('PROJECTED METRIC')
              const isPermission = log.includes('[ACTION REQUIRED]')
              const isSuccess = log.includes('[AUTHORIZATION GRANTED]') || log.includes('[DISPATCH COMPLETED]')
              const isAborted = log.includes('[AUTHORIZATION DENIED]')

              return (
                <div
                  key={index}
                  className={`${
                    isCommand
                      ? 'text-emerald-300 font-bold text-sm pt-1'
                      : isDivider
                      ? 'text-slate-600/80 font-bold'
                      : isBottleneck
                      ? 'text-amber-300 font-bold bg-amber-950/30 p-1.5 rounded border border-amber-900/60'
                      : isProposed
                      ? 'text-cyan-300 font-bold'
                      : isPermission
                      ? 'text-amber-200 font-bold bg-amber-900/40 p-2.5 rounded-xl border border-amber-700 text-sm'
                      : isSuccess
                      ? 'text-emerald-200 font-bold bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-600 text-sm'
                      : isAborted
                      ? 'text-red-300 font-bold bg-red-950/80 p-2.5 rounded-xl border border-red-700 text-sm'
                      : 'text-emerald-400/90'
                  }`}
                >
                  {log}
                </div>
              )
            })}

            {/* EMBEDDED IN-TERMINAL PERMISSION AUTHORIZATION BLOCK */}
            {awaitingPermission && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="my-4 rounded-xl border-2 border-emerald-500 bg-[#0d1624] p-4 text-white shadow-2xl space-y-3"
              >
                <div className="flex items-center gap-2 border-b border-emerald-800 pb-2">
                  <ShieldAlert className="size-5 text-amber-400 shrink-0" />
                  <span className="text-sm font-bold text-amber-300 font-mono uppercase">
                    HUMAN COORDINATOR PERMISSION AUTHORIZATION
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-mono">
                  Do you authorize the AI Agent to execute dynamic supply dispatch of <strong>+{neededTotalBeds} Total Beds (+{neededIcuBeds} ICU Beds) & +{neededVents} Emergency Ventilators</strong> to <strong>{targetHospName}</strong>?
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-extrabold px-5 py-3 shadow-lg cursor-pointer flex items-center justify-center gap-2 border border-emerald-400 animate-pulse"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>[y] CONFIRM & DISPATCH SUPPLIES LIVE</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAbort}
                    className="flex-1 rounded-xl bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 font-mono text-xs font-bold px-5 py-3 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <XCircle className="size-4" />
                    <span>[n] REJECT & CANCEL DISPATCH</span>
                  </button>
                </div>
              </motion.div>
            )}

            {isStreaming && (
              <div className="flex items-center gap-2 text-emerald-400 pt-2 font-bold">
                <Activity className="size-4 animate-spin text-emerald-400" />
                <span>Computing realtime regional telemetry metrics...</span>
                <span className="size-2 bg-emerald-400 animate-ping"></span>
              </div>
            )}

            <div ref={terminalEndRef} />
          </div>

          {/* Footer Control Bar */}
          <div className="border-t border-emerald-900/60 bg-[#121824] p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-200 font-mono">
              <ShieldAlert className="size-4 text-amber-400 shrink-0" />
              <span>
                {awaitingPermission
                  ? 'GIVE PERMISSION: Use the green [CONFIRM] or red [REJECT] buttons above.'
                  : executionState === 'confirmed'
                  ? 'Dispatch authorized! Capacities & metrics updated live.'
                  : executionState === 'aborted'
                  ? 'Dispatch aborted. Regional state unmodified.'
                  : 'Streaming live telemetry scan...'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {awaitingPermission ? (
                <>
                  <button
                    type="button"
                    onClick={handleAbort}
                    className="rounded-xl border border-red-800 bg-red-950 hover:bg-red-900 px-4 py-2 text-xs font-bold font-mono text-red-200 cursor-pointer flex items-center gap-1.5"
                  >
                    <XCircle className="size-4" />
                    <span>[n] REJECT</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 text-xs font-bold font-mono text-white shadow-lg cursor-pointer flex items-center gap-2"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>[y] CONFIRM & DISPATCH</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold font-mono text-white cursor-pointer"
                >
                  EXIT TERMINAL
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
