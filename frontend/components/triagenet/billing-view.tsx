'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Boxes,
  TrendingUp,
  IndianRupee,
  FileText,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Building2,
  Download,
  Zap,
  Layers,
  Activity,
  ArrowUpRight,
  PieChart,
  Bot,
  Terminal,
  LineChart,
} from 'lucide-react'
import { AiFinancialTerminalModal } from './ai-financial-terminal-modal'

interface EquipmentCategory {
  id: string
  name: string
  unitCostRupees: number
  totalUnits: number
  maintenanceMonthlyRupees: number
  recoveredRevenueRupees: number
}

interface HospitalBudgetSummary {
  id: string
  name: string
  short: string
  assignedBudgetRupees: number
  equipmentCostRupees: number
  recoveredRevenueRupees: number
  healthStatus: '[BUDGET SURPLUS RECOVERED]' | '[BALANCED RECOVERY]'
}

export function BillingView() {
  const [terminalOpen, setTerminalOpen] = useState(false)

  const [categories, setCategories] = useState<EquipmentCategory[]>([
    {
      id: 'EQ-01',
      name: 'Emergency Ventilators',
      unitCostRupees: 1520000,
      totalUnits: 23,
      maintenanceMonthlyRupees: 3496000,
      recoveredRevenueRupees: 18450000,
    },
    {
      id: 'EQ-02',
      name: 'ICU Bed Units',
      unitCostRupees: 480000,
      totalUnits: 24,
      maintenanceMonthlyRupees: 1152000,
      recoveredRevenueRupees: 11520000,
    },
    {
      id: 'EQ-03',
      name: 'General Patient Bed Units',
      unitCostRupees: 110000,
      totalUnits: 92,
      maintenanceMonthlyRupees: 1012000,
      recoveredRevenueRupees: 12880000,
    },
    {
      id: 'EQ-04',
      name: 'Portable O₂ Generators & Oxygen Canisters',
      unitCostRupees: 245000,
      totalUnits: 18,
      maintenanceMonthlyRupees: 441000,
      recoveredRevenueRupees: 3820000,
    },
    {
      id: 'EQ-05',
      name: 'Trauma & Surgical Care Intervention Kits',
      unitCostRupees: 65000,
      totalUnits: 45,
      maintenanceMonthlyRupees: 292500,
      recoveredRevenueRupees: 2130000,
    },
  ])

  const [hospitals, setHospitals] = useState<HospitalBudgetSummary[]>([
    {
      id: 'hosp-1',
      name: 'City General Hospital',
      short: 'CG',
      assignedBudgetRupees: 35000000, // ₹3.5 Cr
      equipmentCostRupees: 12400000,
      recoveredRevenueRupees: 17800000,
      healthStatus: '[BUDGET SURPLUS RECOVERED]',
    },
    {
      id: 'hosp-2',
      name: "St. Mary's Trauma Center",
      short: 'SM',
      assignedBudgetRupees: 24000000, // ₹2.4 Cr
      equipmentCostRupees: 8200000,
      recoveredRevenueRupees: 11200000,
      healthStatus: '[BUDGET SURPLUS RECOVERED]',
    },
    {
      id: 'hosp-3',
      name: 'Riverside Medical Center',
      short: 'RM',
      assignedBudgetRupees: 41000000, // ₹4.1 Cr
      equipmentCostRupees: 14800000,
      recoveredRevenueRupees: 20100000,
      healthStatus: '[BUDGET SURPLUS RECOVERED]',
    },
    {
      id: 'hosp-4',
      name: 'North District Hospital',
      short: 'ND',
      assignedBudgetRupees: 28000000, // ₹2.8 Cr
      equipmentCostRupees: 8800000,
      recoveredRevenueRupees: 9700000,
      healthStatus: '[BALANCED RECOVERY]',
    },
  ])

  const [auditLogs, setAuditLogs] = useState<string[]>([
    '[FINANCIAL AGENT] Initialized autonomous budget recovery monitoring across 4 regional facilities.',
    '[AUTOMATED REALLOCATION] Net recovery surplus (+₹1.46 Cr) reinvested into hospital operating reserves.',
  ])
  const [lastAction, setLastAction] = useState<string | null>(null)

  // Combined Regional Financial Calculations
  const totalAssignedBudget = hospitals.reduce((acc, h) => acc + h.assignedBudgetRupees, 0)
  const totalEquipmentCost = categories.reduce((acc, c) => acc + c.maintenanceMonthlyRupees, 0) * 12
  const totalGrossRecovered = categories.reduce((acc, c) => acc + c.recoveredRevenueRupees, 0)
  const netSurplus = totalGrossRecovered - totalEquipmentCost
  const recoveryRatioPct = Math.round((totalGrossRecovered / (totalEquipmentCost || 1)) * 100)

  const formatRupees = (amount: number) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2)} Lakh`
    }
    return `₹${amount.toLocaleString('en-IN')}`
  }

  const handleReallocateSurplus = () => {
    const msg = `[REALLOCATION EXECUTED] AI Financial Agent auto-credited +${formatRupees(netSurplus)} Net Surplus into Regional Operating Budgets.`
    setLastAction(msg)
    setAuditLogs((prev) => [msg, ...prev])
    setHospitals((prev) =>
      prev.map((h) => ({
        ...h,
        assignedBudgetRupees: h.assignedBudgetRupees + Math.round(netSurplus / 4),
      }))
    )
  }

  const handleExportReport = () => {
    const reportText = `===========================================================
TRIAGENET — REGIONAL EQUIPMENT COST & BUDGET RECOVERY REPORT
Generated: ${new Date().toLocaleString()}
===========================================================

1. EXECUTIVE REGIONAL FINANCIAL SUMMARY (DENOMINATED IN RUPEES ₹)
- Total Assigned Regional Operating Budget: ${formatRupees(totalAssignedBudget)}
- Annual Equipment Operational & Maintenance Cost: ${formatRupees(totalEquipmentCost)}
- Gross Triage Revenue Recovered from Patient Care: ${formatRupees(totalGrossRecovered)}
- Net Cost Recovery Surplus: +${formatRupees(netSurplus)}
- Equipment Cost Recovery Ratio: ${recoveryRatioPct}% (100% Budget Maintained)

2. EQUIPMENT ASSET & COST RECOVERY LEDGER
${categories
  .map(
    (c) =>
      `• ${c.name} (${c.id}):
   - Total Fleet Units: ${c.totalUnits} Units @ ${formatRupees(c.unitCostRupees)} / Unit
   - Monthly Maintenance Cost: ${formatRupees(c.maintenanceMonthlyRupees)}
   - Triage Care Revenue Recovered: ${formatRupees(c.recoveredRevenueRupees)}
   - Net Asset Recovery Surplus: +${formatRupees(c.recoveredRevenueRupees - c.maintenanceMonthlyRupees * 12)}`
  )
  .join('\n')}

3. REGIONAL HOSPITAL BUDGET BALANCE MATRIX
${hospitals
  .map(
    (h) =>
      `• ${h.name} (${h.short}):
   - Assigned Operating Budget: ${formatRupees(h.assignedBudgetRupees)}
   - Equipment Maintenance Cost: ${formatRupees(h.equipmentCostRupees)}
   - Care Revenue Recovered: ${formatRupees(h.recoveredRevenueRupees)}
   - Net Balance: +${formatRupees(h.recoveredRevenueRupees - h.equipmentCostRupees)} (${h.healthStatus})`
  )
  .join('\n')}

===========================================================
Report produced by TriageNet Operational Cost & Budget Console
===========================================================`

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `TriageNet_Budget_Cost_Recovery_Report_${Date.now()}.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      {/* FINANCIAL AGENT TERMINAL MODAL */}
      <AiFinancialTerminalModal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        totalBudgetRupees={totalAssignedBudget}
        totalCostRupees={totalEquipmentCost}
        totalRevenueRupees={totalGrossRecovered}
        netSurplusRupees={netSurplus}
        recoveryRatioPct={recoveryRatioPct}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#382416] flex items-center gap-2 uppercase font-mono">
            <IndianRupee className="size-5 text-emerald-600" />
            Inventory & Equipment Operational Cost Management
          </h2>
          <p className="text-xs text-slate-600 mt-0.5 font-sans">
            Autonomous 24/7 financial agent tracking equipment maintenance costs, assigned budgets, and care revenue recovery in Indian Rupees (₹).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300 flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping"></span>
            [24/7 FINANCIAL AGENT ACTIVE]
          </span>

          <button
            type="button"
            onClick={handleExportReport}
            className="flex items-center gap-2 rounded-xl bg-[#382416] hover:bg-[#2c1b0e] px-4 py-2 text-xs font-mono font-bold text-[#ffedd7] shadow-2xs cursor-pointer"
          >
            <Download className="size-4 text-[#dc5000]" />
            <span>EXPORT BUDGET REPORT (.TXT)</span>
          </button>
        </div>
      </div>

      {/* AI FINANCIAL AGENT CONTROL & TELEMETRY BANNER */}
      <div className="rounded-2xl border border-[#382416]/20 bg-gradient-to-r from-[#f7f2ea] to-[#ffffff] p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bot className="size-6 text-emerald-700 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#382416] uppercase">
                AI FINANCIAL & EQUIPMENT COST MANAGEMENT AGENT
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                [AUTONOMOUS COST RECOVERY ENGINE]
              </span>
            </div>
            <p className="text-xs text-slate-600 font-sans mt-0.5">
              Continuously monitors equipment maintenance expenses, tracks care revenue recovered, auto-reallocates net surpluses, and updates real-time financial graphs.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setTerminalOpen(true)}
          className="rounded-xl bg-[#382416] hover:bg-[#2c1b0e] px-4 py-2.5 font-mono text-xs font-bold text-white shadow-2xs cursor-pointer flex items-center gap-2"
        >
          <Terminal className="size-4 text-emerald-400" />
          <span>OPEN AI FINANCIAL TERMINAL</span>
        </button>
      </div>

      {/* Operational Banner */}
      {lastAction && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-mono font-bold text-emerald-900 flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-emerald-600 animate-pulse shrink-0" />
            <span>{lastAction}</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">[SYNCED LIVE]</span>
        </motion.div>
      )}

      {/* UPPER METRIC CARDS GRID (5 COLUMNS DENOMINATED IN RUPEES ₹) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>ASSIGNED REGIONAL BUDGET</span>
            <Building2 className="size-4 text-slate-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#382416] font-mono">{formatRupees(totalAssignedBudget)}</p>
          <span className="mt-1 text-xs font-medium text-slate-600 block font-mono">4 REGIONAL HOSPITALS</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>EQUIPMENT MAINT. COST</span>
            <Boxes className="size-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-amber-700 font-mono">{formatRupees(totalEquipmentCost)}</p>
          <span className="mt-1 text-xs font-medium text-slate-600 block font-mono">ANNUAL FLEET MAINT.</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>TRIAGE REVENUE RECOVERED</span>
            <TrendingUp className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600 font-mono">{formatRupees(totalGrossRecovered)}</p>
          <span className="mt-1 text-xs font-bold text-emerald-700 block font-mono">GROSS CARE RECOVERY</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>NET RECOVERY SURPLUS</span>
            <ShieldCheck className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-700 font-mono">+{formatRupees(netSurplus)}</p>
          <span className="mt-1 text-xs font-bold text-emerald-800 block font-mono">REINVESTED IN BUDGETS</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>COST RECOVERY RATIO</span>
            <Activity className="size-4 text-blue-600" />
          </div>
          <p className="mt-2 text-3xl font-extrabold text-[#382416] font-mono">{recoveryRatioPct}%</p>
          <span className="mt-1 text-xs font-bold text-emerald-700 block font-mono">[100% BUDGET MAINTAINED]</span>
        </div>
      </div>

      {/* REAL-TIME SVG FINANCIAL GRAPH: MAINTENANCE COST VS RECOVERY REVENUE */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-[#382416] font-mono uppercase flex items-center gap-2">
              <LineChart className="size-5 text-emerald-600" />
              Realtime Financial Cost vs Care Revenue Recovery Graph
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">Facility maintenance cost vs recovered triage care revenue in Indian Rupees (₹)</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full">
            REALTIME GRAPH UPDATES
          </span>
        </div>

        <div className="space-y-4 font-mono text-xs pt-1">
          {hospitals.map((h) => {
            const costCr = (h.equipmentCostRupees / 10000000).toFixed(2)
            const revCr = (h.recoveredRevenueRupees / 10000000).toFixed(2)
            const maxVal = 2.5
            const costPct = Math.min(100, Math.round(((h.equipmentCostRupees / 10000000) / maxVal) * 100))
            const revPct = Math.min(100, Math.round(((h.recoveredRevenueRupees / 10000000) / maxVal) * 100))

            return (
              <div key={h.id} className="space-y-1.5 border-b border-slate-100 pb-3 last:border-0">
                <div className="flex justify-between font-bold text-[#382416]">
                  <span>{h.name} ({h.short})</span>
                  <span className="text-emerald-700">Surplus: +{formatRupees(h.recoveredRevenueRupees - h.equipmentCostRupees)}</span>
                </div>

                {/* Maintenance Cost Bar (Amber) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Equipment Maint. Expense: ₹{costCr} Cr</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    <div style={{ width: `${costPct}%` }} className="bg-amber-500 h-full" />
                  </div>
                </div>

                {/* Care Revenue Recovered Bar (Emerald) */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>Triage Care Revenue Recovered: ₹{revCr} Cr</span>
                  </div>
                  <div className="h-3.5 w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    <div style={{ width: `${revPct}%` }} className="bg-emerald-600 h-full" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Interactive Equipment Category Cost & Revenue Recovery Ledger */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-[#382416] font-mono uppercase flex items-center gap-2">
                <Boxes className="size-5 text-[#dc5000]" />
                Equipment Inventory Asset & Maintenance Ledger
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Asset acquisition costs, maintenance expenses & care revenue recovered</p>
            </div>
            <button
              type="button"
              onClick={handleReallocateSurplus}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 font-mono text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <IndianRupee className="size-4" />
              <span>Reallocate Surplus</span>
            </button>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {categories.map((c) => {
              const annualMaint = c.maintenanceMonthlyRupees * 12
              const netBalance = c.recoveredRevenueRupees - annualMaint

              return (
                <div key={c.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                  <div className="flex flex-wrap justify-between items-center border-b border-slate-200 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-[#382416]">{c.name}</span>
                      <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        ({c.id}) · {c.totalUnits} Units
                      </span>
                    </div>
                    <span className="font-bold text-emerald-700">
                      Net Surplus: +{formatRupees(netBalance)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-700 pt-1">
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">UNIT ASSET COST</span>
                      <strong>{formatRupees(c.unitCostRupees)} / unit</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">ANNUAL MAINTENANCE</span>
                      <strong className="text-amber-700">{formatRupees(annualMaint)} / yr</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block uppercase text-[10px]">REVENUE RECOVERED</span>
                      <strong className="text-emerald-700">{formatRupees(c.recoveredRevenueRupees)}</strong>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Hospital Budget & Cost Recovery Balance Matrix */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-5 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#382416] uppercase flex items-center gap-2">
              <Building2 className="size-5 text-[#dc5000]" />
              Hospital Budget Recovery Matrix
            </h3>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded">
              [₹12.8 CR BUDGET]
            </span>
          </div>

          <div className="space-y-4">
            {hospitals.map((h) => {
              const netBalance = h.recoveredRevenueRupees - h.equipmentCostRupees
              const recoveryPct = Math.round((h.recoveredRevenueRupees / (h.equipmentCostRupees || 1)) * 100)

              return (
                <div key={h.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-[#382416]">{h.name} ({h.short})</span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                      {h.healthStatus}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-700 pt-1">
                    <div className="flex justify-between">
                      <span>Assigned Operating Budget:</span>
                      <strong>{formatRupees(h.assignedBudgetRupees)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Equipment Maintenance Cost:</span>
                      <strong className="text-amber-700">{formatRupees(h.equipmentCostRupees)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Care Revenue Recovered:</span>
                      <strong className="text-emerald-700">{formatRupees(h.recoveredRevenueRupees)}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-1 font-bold">
                      <span>Net Recovery Balance:</span>
                      <span className="text-emerald-700">+{formatRupees(netBalance)} ({recoveryPct}%)</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* AI Financial Agent Audit Log Stream */}
          <div className="pt-2 space-y-2">
            <h4 className="text-xs font-bold text-[#382416] uppercase border-t border-slate-200 pt-3">
              AI Financial Agent Audit Log Stream
            </h4>
            <div className="space-y-2 max-h-36 overflow-y-auto">
              {auditLogs.map((log, index) => (
                <div key={index} className="p-2 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-800">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
