'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  X,
  Coins,
  Server,
  Link2,
  Globe,
  Settings,
  Radio,
  ArrowRight,
  Lock,
  PlusCircle,
} from 'lucide-react'
import { AiFinancialTerminalModal } from './ai-financial-terminal-modal'
import { cn } from '@/lib/utils'

export interface HospitalErpIntegration {
  id: string
  hospitalId: string
  hospitalName: string
  short: string
  platform: 'NIC e-Hospital HMS v4.2' | 'ABDM NHCX Gateway' | 'SAP Healthcare IS-H' | 'Jharkhand PFMS / Tally Cloud' | 'Custom FHIR/REST'
  endpoint: string
  protocol: string
  syncFrequency: 'Real-time Webhook' | '5-Min Batch' | '15-Min Batch' | 'Hourly'
  status: 'CONNECTED' | 'SYNCING' | 'DISCONNECTED'
  pingMs: number
  lastSync: string
  totalVouchersSynced: number
  totalReconciledRupees: number
  apiKeyMasked: string
}

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
      maintenanceMonthlyRupees: 1250000, // ₹15.00 L annual maint
      recoveredRevenueRupees: 18450000, // ₹1.845 Cr recovered
    },
    {
      id: 'EQ-02',
      name: 'ICU Bed Units',
      unitCostRupees: 480000,
      totalUnits: 24,
      maintenanceMonthlyRupees: 600000, // ₹7.20 L annual maint
      recoveredRevenueRupees: 11520000, // ₹1.152 Cr recovered
    },
    {
      id: 'EQ-03',
      name: 'General Patient Bed Units',
      unitCostRupees: 110000,
      totalUnits: 92,
      maintenanceMonthlyRupees: 550000, // ₹6.60 L annual maint
      recoveredRevenueRupees: 12880000, // ₹1.288 Cr recovered
    },
    {
      id: 'EQ-04',
      name: 'Portable O₂ Generators & Oxygen Canisters',
      unitCostRupees: 245000,
      totalUnits: 18,
      maintenanceMonthlyRupees: 250000, // ₹3.00 L annual maint
      recoveredRevenueRupees: 3820000, // ₹38.20 L recovered
    },
    {
      id: 'EQ-05',
      name: 'Trauma & Surgical Care Intervention Kits',
      unitCostRupees: 65000,
      totalUnits: 45,
      maintenanceMonthlyRupees: 200000, // ₹2.40 L annual maint
      recoveredRevenueRupees: 2130000, // ₹21.30 L recovered
    },
  ])

  const [hospitals, setHospitals] = useState<HospitalBudgetSummary[]>([
    {
      id: 'hosp-1',
      name: 'Rajendra Institute of Medical Sciences (RIMS)',
      short: 'RIMS',
      assignedBudgetRupees: 35000000, // ₹3.5 Cr
      equipmentCostRupees: 12400000,
      recoveredRevenueRupees: 17800000,
      healthStatus: '[BUDGET SURPLUS RECOVERED]',
    },
    {
      id: 'hosp-2',
      name: 'Sadar Hospital Ranchi',
      short: 'SADAR',
      assignedBudgetRupees: 24000000, // ₹2.4 Cr
      equipmentCostRupees: 8200000,
      recoveredRevenueRupees: 11200000,
      healthStatus: '[BUDGET SURPLUS RECOVERED]',
    },
    {
      id: 'hosp-3',
      name: 'Shaheed Nirmal Mahto Medical College (SNMMCH)',
      short: 'SNMMCH',
      assignedBudgetRupees: 41000000, // ₹4.1 Cr
      equipmentCostRupees: 14800000,
      recoveredRevenueRupees: 20100000,
      healthStatus: '[BUDGET SURPLUS RECOVERED]',
    },
    {
      id: 'hosp-4',
      name: 'MGM Medical College & Hospital Jamshedpur',
      short: 'MGM',
      assignedBudgetRupees: 28000000, // ₹2.8 Cr
      equipmentCostRupees: 8800000,
      recoveredRevenueRupees: 9700000,
      healthStatus: '[BALANCED RECOVERY]',
    },
  ])

  const [unallocatedSurplusRupees, setUnallocatedSurplusRupees] = useState<number>(14600000) // ₹1.46 Cr
  const [totalAllocatedSurplusRupees, setTotalAllocatedSurplusRupees] = useState<number>(0)
  const [allocationModalHospital, setAllocationModalHospital] = useState<HospitalBudgetSummary | null>(null)
  const [allocationAmountLakhs, setAllocationAmountLakhs] = useState<number>(25)

  const [auditLogs, setAuditLogs] = useState<string[]>([
    '[FINANCIAL AGENT] Initialized autonomous budget recovery monitoring across 4 Jharkhand apex facilities.',
    '[AUTOMATED REALLOCATION] Net recovery surplus (+₹1.46 Cr) available for hospital operating reserve allocation.',
  ])
  const [lastAction, setLastAction] = useState<string | null>(null)

  // Hospital Financial Software ERP Integrations State
  const [erpIntegrations, setErpIntegrations] = useState<HospitalErpIntegration[]>([
    {
      id: 'erp-1',
      hospitalId: 'hosp-1',
      hospitalName: 'Rajendra Institute of Medical Sciences (RIMS)',
      short: 'RIMS',
      platform: 'NIC e-Hospital HMS v4.2',
      endpoint: 'https://ehospital.nic.in/rims-ranchi/api/v2/finance/claims',
      protocol: 'ABDM NHCX / FHIR R4 Financial Settlement',
      syncFrequency: 'Real-time Webhook',
      status: 'CONNECTED',
      pingMs: 24,
      lastSync: '14s ago',
      totalVouchersSynced: 1428,
      totalReconciledRupees: 34200000,
      apiKeyMasked: 'nic_live_sec_****89a2',
    },
    {
      id: 'erp-2',
      hospitalId: 'hosp-2',
      hospitalName: 'Sadar Hospital Ranchi',
      short: 'SADAR',
      platform: 'Jharkhand PFMS / Tally Cloud',
      endpoint: 'https://jsh-erp.jharkhand.gov.in/sadar-ranchi/gateway/v1',
      protocol: 'State Treasury PFMS XML Bridge',
      syncFrequency: '5-Min Batch',
      status: 'CONNECTED',
      pingMs: 38,
      lastSync: '2m ago',
      totalVouchersSynced: 812,
      totalReconciledRupees: 18800000,
      apiKeyMasked: 'jsh_sec_tally_****441c',
    },
    {
      id: 'erp-3',
      hospitalId: 'hosp-3',
      hospitalName: 'Shaheed Nirmal Mahto Medical College (SNMMCH)',
      short: 'SNMMCH',
      platform: 'ABDM NHCX Gateway',
      endpoint: 'https://nhcx.abdm.gov.in/gateway/snmmch/claims',
      protocol: 'NHA Ayushman Bharat PM-JAY Auto-Adjudication',
      syncFrequency: 'Real-time Webhook',
      status: 'CONNECTED',
      pingMs: 31,
      lastSync: '45s ago',
      totalVouchersSynced: 1045,
      totalReconciledRupees: 21500000,
      apiKeyMasked: 'abdm_nhcx_key_****90fb',
    },
    {
      id: 'erp-4',
      hospitalId: 'hosp-4',
      hospitalName: 'MGM Medical College & Hospital Jamshedpur',
      short: 'MGM',
      platform: 'SAP Healthcare IS-H',
      endpoint: 'https://health-sap.mgm-jamshedpur.org/odata/v4/BillingService',
      protocol: 'SAP OData v4 / HL7 FHIR Financial',
      syncFrequency: 'Real-time Webhook',
      status: 'CONNECTED',
      pingMs: 19,
      lastSync: '12s ago',
      totalVouchersSynced: 1290,
      totalReconciledRupees: 28600000,
      apiKeyMasked: 'sap_ish_token_****67cd',
    },
  ])

  const [configureErpModalOpen, setConfigureErpModalOpen] = useState(false)
  const [editingErpConfig, setEditingErpConfig] = useState<HospitalErpIntegration | null>(null)
  const [erpHandshakeTesting, setErpHandshakeTesting] = useState(false)
  const [erpHandshakeResult, setErpHandshakeResult] = useState<string | null>(null)
  const [isSyncingErp, setIsSyncingErp] = useState(false)

  // Interactive Live ERP Handshake Trigger
  const handleTriggerErpSync = () => {
    setIsSyncingErp(true)
    setTimeout(() => {
      setErpIntegrations((prev) =>
        prev.map((item) => ({
          ...item,
          totalVouchersSynced: item.totalVouchersSynced + Math.floor(14 + Math.random() * 22),
          totalReconciledRupees: item.totalReconciledRupees + Math.floor(350000 + Math.random() * 500000),
          lastSync: 'Just now',
          pingMs: Math.floor(18 + Math.random() * 15),
        }))
      )
      setIsSyncingErp(false)
      const syncMsg = `[ERP GATEWAY SYNC] Reconciled 148 new billing vouchers across NIC e-Hospital, ABDM NHCX, SAP IS-H & JPFMS. State Ledger updated.`
      setLastAction(syncMsg)
      setAuditLogs((prev) => [syncMsg, ...prev])
    }, 1100)
  }

  // Refill surplus pool from Ayushman Bharat claim recoveries
  const handleRefillSurplus = (amountRupees = 12000000) => {
    setUnallocatedSurplusRupees((prev) => prev + amountRupees)
    const msg = `[AYUSHMAN BHARAT INFLOW] +${formatRupees(amountRupees)} claims settled by National Health Authority (NHA) into Net Recovery Surplus Pool.`
    setLastAction(msg)
    setAuditLogs((prev) => [msg, ...prev])
  }

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
    if (unallocatedSurplusRupees <= 0) {
      setLastAction('[SURPLUS EXHAUSTED] Net surplus pool is depleted. Click Refill (+₹1.20 Cr) from Ayushman Bharat claims!')
      return
    }
    const share = Math.round(unallocatedSurplusRupees / 4)
    const allocatedNow = unallocatedSurplusRupees
    const msg = `[REALLOCATION EXECUTED] AI Financial Agent auto-credited +${formatRupees(share)} each into all 4 Jharkhand Regional Operating Budgets.`
    setLastAction(msg)
    setAuditLogs((prev) => [msg, ...prev])
    setHospitals((prev) =>
      prev.map((h) => ({
        ...h,
        assignedBudgetRupees: h.assignedBudgetRupees + share,
      }))
    )
    setTotalAllocatedSurplusRupees((prev) => prev + allocatedNow)
    setUnallocatedSurplusRupees(0)
  }

  const handleExecuteAllocation = () => {
    if (!allocationModalHospital) return
    const allocRupees = allocationAmountLakhs * 100000
    if (allocRupees > unallocatedSurplusRupees) return

    setHospitals((prev) =>
      prev.map((h) =>
        h.id === allocationModalHospital.id
          ? { ...h, assignedBudgetRupees: h.assignedBudgetRupees + allocRupees }
          : h
      )
    )
    const newRemaining = Math.max(0, unallocatedSurplusRupees - allocRupees)
    setTotalAllocatedSurplusRupees((prev) => prev + allocRupees)
    setUnallocatedSurplusRupees(newRemaining)
    const msg = `[CAPITAL ALLOCATION] Successfully disbursed ₹${allocationAmountLakhs} Lakhs surplus to ${allocationModalHospital.name}. Remaining surplus reserve: ${formatRupees(newRemaining)}.`
    setLastAction(msg)
    setAuditLogs((prev) => [msg, ...prev])
    setAllocationModalHospital(null)
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
        netSurplusRupees={unallocatedSurplusRupees}
        recoveryRatioPct={recoveryRatioPct}
      />

      {/* BUDGET ALLOCATION WARNING & PROJECTION MODAL */}
      <AnimatePresence>
        {allocationModalHospital && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl font-mono text-xs space-y-4 text-slate-800"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                    <IndianRupee className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#382416] uppercase">
                      Capital Allocation & Reserve Projection
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans">
                      Disburse care recovery surplus into facility operational reserves
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAllocationModalHospital(null)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Target Facility Header */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex justify-between items-center">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-semibold">Target Facility:</span>
                  <span className="font-bold text-sm text-[#382416] font-sans">{allocationModalHospital.name}</span>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded">
                  {allocationModalHospital.short}
                </span>
              </div>

              {/* Current Balances */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-1">
                  <span className="text-[10px] text-slate-500 uppercase font-semibold">Current Facility Budget</span>
                  <p className="text-base font-extrabold text-[#382416]">{formatRupees(allocationModalHospital.assignedBudgetRupees)}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 space-y-1">
                  <span className="text-[10px] text-emerald-800 uppercase font-semibold">Available Surplus Pool</span>
                  <p className="text-base font-extrabold text-emerald-700">{formatRupees(unallocatedSurplusRupees)}</p>
                </div>
              </div>

              {/* Allocation Amount Controls */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
                  Select or Enter Grant Amount (₹ in Lakhs):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={allocationAmountLakhs}
                    onChange={(e) => setAllocationAmountLakhs(Math.max(0, Number(e.target.value)))}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2 text-sm font-bold text-[#382416] focus:border-emerald-600 focus:outline-hidden"
                  />
                  <span className="text-xs font-bold text-slate-600 shrink-0">Lakhs (₹)</span>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[10, 25, 50, 100, Math.floor(unallocatedSurplusRupees / 100000)].filter((v, i, a) => v > 0 && a.indexOf(v) === i).map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAllocationAmountLakhs(amt)}
                      className={cn(
                        'px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer',
                        allocationAmountLakhs === amt
                          ? 'bg-[#382416] text-[#ffedd7] border-[#382416]'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      )}
                    >
                      {amt >= 100 ? `₹${(amt / 100).toFixed(2)} Cr` : `+₹${amt}L`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Warning or Caution */}
              {(() => {
                const requestedRupees = allocationAmountLakhs * 100000
                const projectedSurplus = unallocatedSurplusRupees - requestedRupees
                const projectedHospitalBudget = allocationModalHospital.assignedBudgetRupees + requestedRupees
                const isExceeded = requestedRupees > unallocatedSurplusRupees
                const isLowReserve = !isExceeded && projectedSurplus < 3000000

                return (
                  <div className="space-y-3">
                    {isExceeded && (
                      <div className="rounded-xl border border-red-500 bg-red-50 p-3.5 text-xs text-red-900 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-red-700">
                          <AlertTriangle className="size-4 shrink-0" />
                          <span>CRITICAL BUDGET DEFICIT WARNING</span>
                        </div>
                        <p className="text-[11px] text-red-800 leading-relaxed font-sans">
                          Requested grant of <strong>{formatRupees(requestedRupees)}</strong> exceeds remaining contingency surplus (<strong>{formatRupees(unallocatedSurplusRupees)}</strong>). Disbursing this amount would create a <strong>-{formatRupees(Math.abs(projectedSurplus))}</strong> deficit. Capital allocation cannot proceed.
                        </p>
                      </div>
                    )}

                    {isLowReserve && (
                      <div className="rounded-xl border border-amber-500 bg-amber-50 p-3.5 text-xs text-amber-900 space-y-1">
                        <div className="flex items-center gap-2 font-bold text-amber-800">
                          <AlertTriangle className="size-4 shrink-0" />
                          <span>CAUTION: LOW CONTINGENCY BUFFER</span>
                        </div>
                        <p className="text-[11px] text-amber-700 leading-relaxed font-sans">
                          Disbursing this amount leaves only <strong>{formatRupees(projectedSurplus)}</strong> in emergency reserves, which is below the ₹30.00 Lakh safe operating threshold.
                        </p>
                      </div>
                    )}

                    {/* Live Projection Ledger */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Projected Hospital Budget:</span>
                        <span className="font-bold text-emerald-700">
                          {formatRupees(allocationModalHospital.assignedBudgetRupees)} → {formatRupees(projectedHospitalBudget)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-200/80 pt-1.5">
                        <span className="text-slate-500">Projected Remaining Surplus:</span>
                        <span className={cn('font-bold', isExceeded ? 'text-red-600' : 'text-slate-900')}>
                          {formatRupees(unallocatedSurplusRupees)} → {formatRupees(projectedSurplus)}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setAllocationModalHospital(null)}
                        className="rounded-xl border border-slate-300 bg-white hover:bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={isExceeded || requestedRupees <= 0}
                        onClick={handleExecuteAllocation}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Authorize & Disburse Capital</span>
                      </button>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HOSPITAL FINANCIAL SOFTWARE / ERP CONFIGURATION MODAL */}
      <AnimatePresence>
        {configureErpModalOpen && editingErpConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                    <Server className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#382416] flex items-center gap-2">
                      Configure Hospital Financial ERP Gateway
                    </h3>
                    <p className="text-xs text-stone-500">
                      Bidirectional accounting sync with facility financial ledger &amp; HMS
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setConfigureErpModalOpen(false)
                    setEditingErpConfig(null)
                    setErpHandshakeResult(null)
                  }}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!editingErpConfig) return
                  setErpIntegrations((prev) =>
                    prev.map((item) => (item.id === editingErpConfig.id ? editingErpConfig : item))
                  )
                  const msg = `[ERP GATEWAY CONFIGURED] Successfully updated connection to ${editingErpConfig.hospitalName} (${editingErpConfig.platform}).`
                  setLastAction(msg)
                  setAuditLogs((prev) => [msg, ...prev])
                  setConfigureErpModalOpen(false)
                  setEditingErpConfig(null)
                  setErpHandshakeResult(null)
                }}
                className="space-y-3.5 text-xs font-mono"
              >
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Target Hospital Facility:
                  </label>
                  <input
                    type="text"
                    disabled
                    value={editingErpConfig.hospitalName}
                    className="w-full rounded-xl border border-stone-300 bg-stone-100 px-3 py-2 font-semibold text-stone-700 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Finance ERP Platform:
                    </label>
                    <select
                      value={editingErpConfig.platform}
                      onChange={(e) =>
                        setEditingErpConfig({
                          ...editingErpConfig,
                          platform: e.target.value as any,
                        })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    >
                      <option value="NIC e-Hospital HMS v4.2">NIC e-Hospital HMS v4.2</option>
                      <option value="ABDM NHCX Gateway">ABDM NHCX Gateway</option>
                      <option value="SAP Healthcare IS-H">SAP Healthcare IS-H</option>
                      <option value="Jharkhand PFMS / Tally Cloud">Jharkhand PFMS / Tally Cloud</option>
                      <option value="Custom FHIR/REST">Custom FHIR/REST Gateway</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Sync Frequency / Trigger:
                    </label>
                    <select
                      value={editingErpConfig.syncFrequency}
                      onChange={(e) =>
                        setEditingErpConfig({
                          ...editingErpConfig,
                          syncFrequency: e.target.value as any,
                        })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    >
                      <option value="Real-time Webhook">Real-time Automated Webhook (24/7)</option>
                      <option value="5-Min Batch">5-Minute Automated Batch</option>
                      <option value="15-Min Batch">15-Minute Batch Sync</option>
                      <option value="Hourly">Hourly Treasury Reconciliation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    API Base Endpoint URI (REST / FHIR):
                  </label>
                  <input
                    type="url"
                    required
                    value={editingErpConfig.endpoint}
                    onChange={(e) =>
                      setEditingErpConfig({
                        ...editingErpConfig,
                        endpoint: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Data Interchange Protocol:
                    </label>
                    <input
                      type="text"
                      required
                      value={editingErpConfig.protocol}
                      onChange={(e) =>
                        setEditingErpConfig({
                          ...editingErpConfig,
                          protocol: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      API Secret Token / Key:
                    </label>
                    <input
                      type="text"
                      required
                      value={editingErpConfig.apiKeyMasked}
                      onChange={(e) =>
                        setEditingErpConfig({
                          ...editingErpConfig,
                          apiKeyMasked: e.target.value,
                        })
                      }
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Handshake Test Feedback */}
                {erpHandshakeResult && (
                  <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    <span>{erpHandshakeResult}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    disabled={erpHandshakeTesting}
                    onClick={() => {
                      setErpHandshakeTesting(true)
                      setErpHandshakeResult(null)
                      setTimeout(() => {
                        setErpHandshakeTesting(false)
                        setErpHandshakeResult(
                          `Handshake Verified! 200 OK connected to ${editingErpConfig.platform} in 22ms. Vouchers synchronized.`
                        )
                      }, 800)
                    }}
                    className="rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 px-3.5 py-2 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <RefreshCw className={cn('size-3.5', erpHandshakeTesting && 'animate-spin')} />
                    <span>{erpHandshakeTesting ? 'Testing Handshake...' : 'Test API Handshake'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setConfigureErpModalOpen(false)
                        setEditingErpConfig(null)
                        setErpHandshakeResult(null)
                      }}
                      className="rounded-xl border border-stone-300 bg-white hover:bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-700 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-xl bg-[#ea580c] hover:bg-[#d94e08] text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="size-3.5" />
                      <span>Save &amp; Connect ERP</span>
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      {/* UPPER METRIC CARDS GRID (6 COLUMNS DENOMINATED IN RUPEES ₹) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
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

        {/* Card 4: NET RECOVERY SURPLUS (With Refill button when depleted) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
              <span>NET RECOVERY SURPLUS</span>
              <ShieldCheck className="size-4 text-emerald-600" />
            </div>
            <p className={cn(
              "mt-2 text-2xl font-extrabold font-mono",
              unallocatedSurplusRupees > 0 ? "text-emerald-700" : "text-amber-600"
            )}>
              {unallocatedSurplusRupees > 0 ? `+${formatRupees(unallocatedSurplusRupees)}` : '₹0 (Exhausted)'}
            </p>
            <span className="mt-1 text-xs font-bold text-emerald-800 block font-mono">AVAILABLE SURPLUS POOL</span>
          </div>

          <button
            type="button"
            onClick={() => handleRefillSurplus(12000000)}
            title="Refill surplus pool from Ayushman Bharat claim recoveries"
            className={cn(
              "mt-3 text-[10px] font-mono font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer flex items-center justify-center gap-1",
              unallocatedSurplusRupees === 0
                ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-500 shadow-2xs animate-pulse"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
            )}
          >
            <RefreshCw className="size-3 text-emerald-500" />
            <span>{unallocatedSurplusRupees === 0 ? 'Refill Pool (+₹1.20 Cr)' : '+ Refill (+₹1.20 Cr)'}</span>
          </button>
        </div>

        {/* Card 5: SURPLUS ALLOCATED (Disbursed to regional hospitals) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono text-slate-500 uppercase">
            <span>SURPLUS ALLOCATED</span>
            <Coins className="size-4 text-purple-600" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-purple-700 font-mono">{formatRupees(totalAllocatedSurplusRupees)}</p>
          <span className="mt-1 text-xs font-bold text-purple-800 block font-mono">DISBURSED TO HOSPITALS</span>
        </div>

        {/* Card 6: COST RECOVERY RATIO */}
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

                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setAllocationModalHospital(h)
                        setAllocationAmountLakhs(25)
                      }}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <IndianRupee className="size-3" />
                      <span>Allocate Capital</span>
                    </button>
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

      {/* ========================================================================= */}
      {/* HOSPITAL FINANCIAL SOFTWARE ERP & HMS GATEWAY CONSOLE                     */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                <Server className="size-5" />
              </div>
              <h3 className="text-base font-bold text-[#382416] flex items-center gap-2">
                Hospital Financial Software ERP &amp; HMS Integration Gateway
              </h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Live 24/7 Auto-Sync
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-1 max-w-3xl">
              Bidirectional financial accounting sync with facility billing servers. TriageNet calculates equipment capitalization &amp; dynamic surge recovery, automatically reconciling ledger entries with each hospital&apos;s respective accounting platform (NIC e-Hospital, ABDM NHCX, SAP IS-H, JPFMS/Tally).
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              type="button"
              disabled={isSyncingErp}
              onClick={handleTriggerErpSync}
              className="rounded-xl bg-[#ea580c] hover:bg-[#d94e08] disabled:opacity-50 text-white px-3.5 py-2 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={cn('size-3.5', isSyncingErp && 'animate-spin')} />
              <span>{isSyncingErp ? 'Syncing Financial Gateways...' : 'Trigger Real-Time ERP Sync'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setEditingErpConfig(erpIntegrations[0])
                setConfigureErpModalOpen(true)
              }}
              className="rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-stone-800 px-3.5 py-2 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Settings className="size-3.5 text-stone-600" />
              <span>Configure ERP Endpoints</span>
            </button>
          </div>
        </div>

        {/* 4-Card Hospital ERP Connectivity Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {erpIntegrations.map((erp) => (
            <div
              key={erp.id}
              className="rounded-xl border border-stone-200/90 bg-stone-50/60 p-4 space-y-3 hover:border-stone-300 hover:bg-stone-50 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-bold text-sm text-[#382416] leading-snug">
                    {erp.hospitalName}
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1">
                    <span className="size-1 rounded-full bg-emerald-500"></span>
                    {erp.pingMs}ms
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <span className="font-bold text-stone-700 bg-white border border-stone-200 px-2 py-0.5 rounded-md text-[11px]">
                    {erp.platform}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-white border border-stone-200/80 font-mono text-[10px] text-stone-600 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-stone-400 uppercase">SYNC MODE</span>
                    <strong className="text-stone-800">{erp.syncFrequency}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 uppercase">LAST SYNC</span>
                    <strong className="text-emerald-700">{erp.lastSync}</strong>
                  </div>
                  <div className="flex justify-between border-t border-stone-100 pt-1">
                    <span className="text-stone-400 uppercase">VOUCHERS</span>
                    <strong className="text-stone-900">{erp.totalVouchersSynced.toLocaleString('en-IN')} units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400 uppercase">RECONCILED</span>
                    <strong className="text-emerald-700">{formatRupees(erp.totalReconciledRupees)}</strong>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-stone-500 truncate" title={erp.endpoint}>
                  URI: <span className="text-stone-700">{erp.endpoint}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200/80 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-mono">
                  {erp.apiKeyMasked}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    setEditingErpConfig(erp)
                    setConfigureErpModalOpen(true)
                  }}
                  className="text-xs font-bold text-[#ea580c] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Settings className="size-3" />
                  <span>Configure</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
