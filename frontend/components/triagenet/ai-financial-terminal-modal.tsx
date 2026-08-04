'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, ShieldAlert, CheckCircle2, XCircle, Activity, HelpCircle, Building2, Boxes, IndianRupee, X } from 'lucide-react'

interface AiFinancialTerminalModalProps {
  isOpen: boolean
  onClose: () => void
  totalBudgetRupees: number
  totalCostRupees: number
  totalRevenueRupees: number
  netSurplusRupees: number
  recoveryRatioPct: number
}

export function AiFinancialTerminalModal({
  isOpen,
  onClose,
  totalBudgetRupees,
  totalCostRupees,
  totalRevenueRupees,
  netSurplusRupees,
  recoveryRatioPct,
}: AiFinancialTerminalModalProps) {
  const [logs, setLogs] = useState<string[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const terminalEndRef = useRef<HTMLDivElement>(null)

  const formatRupees = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  useEffect(() => {
    if (!isOpen) {
      setLogs([])
      setIsStreaming(false)
      return
    }

    setLogs([])
    setIsStreaming(true)

    const nowStr = new Date().toLocaleTimeString()

    const rawScript: string[] = [
      `ai-financial-agent@triagenet:~$ ./audit-regional-cost-recovery.sh --currency=INR --timestamp="${nowStr}"`,
      '========================================================================================================',
      `[${nowStr}] [FINANCIAL TELEMETRY INITIATED] Scanning equipment maintenance expenses & triage care recovery...`,
      '--------------------------------------------------------------------------------------------------------',
      'REGIONAL OPERATING BUDGET & COST TELEMETRY (DENOMINATED IN RUPEES ₹):',
      `   ├── Total Assigned Regional Budget: ${formatRupees(totalBudgetRupees)} across 4 facilities`,
      `   ├── Annual Equipment Maint. Cost  : ${formatRupees(totalCostRupees)} (Ventilators, ICU Beds, O2 Canisters)`,
      `   ├── Gross Triage Revenue Recovered: ${formatRupees(totalRevenueRupees)} from specialized clinical care`,
      `   ├── Net Cost Recovery Surplus     : +${formatRupees(netSurplusRupees)} (Reinvested into Operating Budgets)`,
      `   └── Equipment Cost Recovery Ratio : ${recoveryRatioPct}% [100% OPERATING BUDGET MAINTAINED]`,
      '--------------------------------------------------------------------------------------------------------',
      'FACILITY BUDGET HEALTH DIAGNOSTICS:',
      `   • City General Hospital (CG) : Assigned ₹3.50 Cr | Maint: ₹1.24 Cr | Recovered: ₹1.78 Cr [SURPLUS +₹54.00 Lakh]`,
      `   • St. Mary's Trauma Center (SM): Assigned ₹2.40 Cr | Maint: ₹82.00 Lakh | Recovered: ₹1.12 Cr [SURPLUS +₹30.00 Lakh]`,
      `   • Riverside Medical Center (RM): Assigned ₹4.10 Cr | Maint: ₹1.48 Cr | Recovered: ₹2.01 Cr [SURPLUS +₹53.00 Lakh]`,
      `   • North District Hospital (ND) : Assigned ₹2.80 Cr | Maint: ₹88.00 Lakh | Recovered: ₹97.00 Lakh [BALANCED +₹9.00 Lakh]`,
      '--------------------------------------------------------------------------------------------------------',
      'AUTONOMOUS AGENT ACTIONS EXECUTED:',
      '   [AUTOMATED SURPLUS REALLOCATION] Net surplus (+₹1.46 Cr) auto-credited to regional facility reserves.',
      '   [EQUIPMENT MAINTENANCE BUFFER] 100% maintenance expenses covered by care recovery revenue.',
      '========================================================================================================',
      `[FINANCIAL AGENT STATUS] All hospital operating budgets fully maintained. Telemetry active 24/7.`,
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
      }
    }, 180)

    return () => clearInterval(interval)
  }, [isOpen, totalBudgetRupees, totalCostRupees, totalRevenueRupees, netSurplusRupees, recoveryRatioPct])

  useEffect(() => {
    if (isStreaming) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logs, isStreaming])

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
                  AI FINANCIAL TELEMETRY TERMINAL // BUDGET & RECOVERY ENGINE
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-950/90 border border-emerald-700 px-2.5 py-0.5 rounded-full font-bold">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                INR METRICS SYNC ACTIVE
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

          {/* Info Banner */}
          <div className="bg-[#162032] border-b border-cyan-800/60 px-4 py-2 text-[11px] text-cyan-300 flex items-center justify-between font-mono">
            <span>
              <strong>24/7 FINANCIAL RECOVERY AGENT:</strong> Monitoring inventory costs, equipment asset values & revenue recovery in Rupees (₹).
            </span>
          </div>

          {/* Terminal Screen Body */}
          <div className="p-5 font-mono text-xs space-y-1.5 overflow-y-auto flex-1 bg-[#090d16] selection:bg-emerald-900 selection:text-white leading-relaxed">
            {logs.map((rawLog, index) => {
              const log = typeof rawLog === 'string' ? rawLog : String(rawLog ?? '')
              const isCommand = log.startsWith('ai-financial-agent@triagenet')
              const isDivider = log.startsWith('====') || log.startsWith('----')
              const isHeader = log.includes('[FINANCIAL TELEMETRY INITIATED]') || log.includes('REGIONAL OPERATING BUDGET')
              const isStatus = log.includes('[FINANCIAL AGENT STATUS]')

              return (
                <div
                  key={index}
                  className={`${
                    isCommand
                      ? 'text-emerald-300 font-bold text-sm pt-1'
                      : isDivider
                      ? 'text-slate-600/80 font-bold'
                      : isHeader
                      ? 'text-cyan-300 font-bold'
                      : isStatus
                      ? 'text-emerald-200 font-bold bg-emerald-950/80 p-2.5 rounded-xl border border-emerald-600 text-sm'
                      : 'text-emerald-400/90'
                  }`}
                >
                  {log}
                </div>
              )
            })}

            {isStreaming && (
              <div className="flex items-center gap-2 text-emerald-400 pt-2 font-bold">
                <Activity className="size-4 animate-spin text-emerald-400" />
                <span>Computing financial cost recovery telemetry...</span>
                <span className="size-2 bg-emerald-400 animate-ping"></span>
              </div>
            )}

            <div ref={terminalEndRef} />
          </div>

          {/* Footer Control Bar */}
          <div className="border-t border-emerald-900/60 bg-[#121824] p-4 flex items-center justify-between">
            <span className="text-xs text-slate-300 font-mono">
              [STATUS] All hospital operating budgets fully maintained via care revenue recovery.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold font-mono text-white cursor-pointer"
            >
              EXIT TERMINAL
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
