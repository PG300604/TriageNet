'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type TriageState,
  type Hospital,
  occupancyRatio,
  calculateAiSupplyNeed,
} from '@/lib/triage-data'
import { useAuth, type UserRole } from '@/lib/auth-context'
import {
  Boxes,
  Wind,
  BedDouble,
  HeartPulse,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Activity,
  Zap,
  Building2,
  IndianRupee,
  Layers,
  Landmark,
  TrendingDown,
  Filter,
  PlusCircle,
  FileCheck2,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
  Info,
} from 'lucide-react'
import {
  SupplyApprovalPillModal,
  type SupplyRequisition,
} from './supply-approval-pill-modal'

interface SuppliesViewProps {
  state: TriageState
  onStateChange?: (next: TriageState) => void
  onRunAiSupplyDispatch?: () => void
}

type SupplyTier = 'STATE_HEALTH' | 'DISTRICT_CMO' | 'HOSPITAL_DEPT'

interface DistrictBudgetRecord {
  id: string
  districtName: string
  population: string
  hospitalCount: number
  totalBudgetCr: number
  releasedBudgetCr: number
  capacityLoadPct: number
  queuedPatients: number
  status: 'CRITICAL_SURGE' | 'MODERATE_STRAIN' | 'NOMINAL'
  pendingRequisitions: number
}

interface BulkProcurementDeal {
  id: string
  itemName: string
  specification: string
  contractRate: string
  openMarketRate: string
  savingsPct: number
  totalProcured: number
  availableStock: number
  unit: string
  supplier: string
}

interface DepartmentAllocation {
  id: string
  name: string
  short: string
  category: 'Critical Care' | 'Emergency' | 'Inpatient' | 'Pediatric'
  allocatedBeds: number
  usedBeds: number
  allocatedVents: number
  usedVents: number
  allocatedBudgetLakhs: number
  status: 'CRITICAL' | 'STRAINED' | 'NOMINAL'
}

export function SuppliesView({ state, onStateChange, onRunAiSupplyDispatch }: SuppliesViewProps) {
  const { user } = useAuth()
  const hospitals = state.hospitals

  // Derive initial tier based on user's clinical/administrative role
  const userRole: UserRole = user?.role || 'SUPER_ADMIN'
  const defaultTier: SupplyTier =
    userRole === 'HOSPITAL_ADMIN'
      ? 'HOSPITAL_DEPT'
      : userRole === 'DISTRICT_CMO'
      ? 'DISTRICT_CMO'
      : 'STATE_HEALTH'

  const [activeTier, setActiveTier] = useState<SupplyTier>(defaultTier)
  const [selectedDistrict, setSelectedDistrict] = useState<string>(
    user?.districtName && user.districtName !== 'Statewide' ? user.districtName : 'Ranchi'
  )
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(
    user?.hospitalId || hospitals[0]?.id || 'jh-rims-ranchi'
  )

  // Requisition Modal State
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [activeRequisition, setActiveRequisition] = useState<SupplyRequisition | null>(null)
  const [lastEventToast, setLastEventToast] = useState<string | null>(null)

  // Audit Log history
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; time: string; text: string; tier: string }>>([
    {
      id: 'AUD-001',
      time: '16:45:10',
      text: 'State Health Command released ₹1.25 Cr Emergency Surge Grant to Ranchi District Pool (Requisition #REQ-JH-2026-088 authorized).',
      tier: 'State Directorate',
    },
    {
      id: 'AUD-002',
      time: '16:20:04',
      text: 'District CMO Ranchi reallocated +8 Beds & +2 Ventilators from CHC Kanke to Sadar Hospital Ranchi.',
      tier: 'District CMO',
    },
    {
      id: 'AUD-003',
      time: '15:50:33',
      text: 'Medical Superintendent RIMS Ranchi transferred +4 ICU Beds & +2 Mindray Ventilators to Emergency Trauma Bay.',
      tier: 'Facility Supt',
    },
  ])

  // Statewide Districts Data
  const [districtRecords, setDistrictRecords] = useState<DistrictBudgetRecord[]>([
    {
      id: 'dist-ranchi',
      districtName: 'Ranchi',
      population: '3.2M',
      hospitalCount: 18,
      totalBudgetCr: 6.5,
      releasedBudgetCr: 5.1,
      capacityLoadPct: 86,
      queuedPatients: 24,
      status: 'CRITICAL_SURGE',
      pendingRequisitions: 2,
    },
    {
      id: 'dist-dhanbad',
      districtName: 'Dhanbad',
      population: '2.8M',
      hospitalCount: 14,
      totalBudgetCr: 4.2,
      releasedBudgetCr: 3.1,
      capacityLoadPct: 79,
      queuedPatients: 16,
      status: 'MODERATE_STRAIN',
      pendingRequisitions: 1,
    },
    {
      id: 'dist-singhbhum',
      districtName: 'East Singhbhum (Jamshedpur)',
      population: '2.4M',
      hospitalCount: 12,
      totalBudgetCr: 4.8,
      releasedBudgetCr: 3.8,
      capacityLoadPct: 74,
      queuedPatients: 11,
      status: 'MODERATE_STRAIN',
      pendingRequisitions: 1,
    },
    {
      id: 'dist-bokaro',
      districtName: 'Bokaro',
      population: '2.1M',
      hospitalCount: 10,
      totalBudgetCr: 3.4,
      releasedBudgetCr: 2.6,
      capacityLoadPct: 66,
      queuedPatients: 6,
      status: 'NOMINAL',
      pendingRequisitions: 0,
    },
    {
      id: 'dist-hazaribagh',
      districtName: 'Hazaribagh',
      population: '1.8M',
      hospitalCount: 9,
      totalBudgetCr: 2.8,
      releasedBudgetCr: 2.2,
      capacityLoadPct: 64,
      queuedPatients: 4,
      status: 'NOMINAL',
      pendingRequisitions: 0,
    },
    {
      id: 'dist-deoghar',
      districtName: 'Deoghar',
      population: '1.6M',
      hospitalCount: 8,
      totalBudgetCr: 2.6,
      releasedBudgetCr: 2.0,
      capacityLoadPct: 71,
      queuedPatients: 7,
      status: 'MODERATE_STRAIN',
      pendingRequisitions: 1,
    },
    {
      id: 'dist-palamu',
      districtName: 'Palamu',
      population: '1.9M',
      hospitalCount: 8,
      totalBudgetCr: 2.2,
      releasedBudgetCr: 1.7,
      capacityLoadPct: 62,
      queuedPatients: 3,
      status: 'NOMINAL',
      pendingRequisitions: 0,
    },
    {
      id: 'dist-dumka',
      districtName: 'Dumka',
      population: '1.4M',
      hospitalCount: 7,
      totalBudgetCr: 2.0,
      releasedBudgetCr: 1.6,
      capacityLoadPct: 58,
      queuedPatients: 2,
      status: 'NOMINAL',
      pendingRequisitions: 0,
    },
  ])

  // State-wide Bulk Procurement Deals (GeM Master Rate Contracts)
  const [bulkDeals, setBulkDeals] = useState<BulkProcurementDeal[]>([
    {
      id: 'DEAL-VENT-300',
      itemName: 'Mindray SV300 Invasive Ventilator Fleet',
      specification: 'Dual-mode Turbine ICU Ventilator with APRV & high-flow O₂',
      contractRate: '₹12.50 L',
      openMarketRate: '₹16.80 L',
      savingsPct: 26,
      totalProcured: 120,
      availableStock: 42,
      unit: 'Units',
      supplier: 'Mindray Medical India / GeM Tender',
    },
    {
      id: 'DEAL-ICU-BEDS',
      itemName: 'Paramount 5-Function Motorized ICU Beds',
      specification: 'Hydraulic multi-position cardiac chair with X-ray translucent back',
      contractRate: '₹2.85 L',
      openMarketRate: '₹4.20 L',
      savingsPct: 32,
      totalProcured: 500,
      availableStock: 185,
      unit: 'Beds',
      supplier: 'Paramount Bed India / NHM Rate Contract',
    },
    {
      id: 'DEAL-PSA-O2',
      itemName: '500-LPM Medical Oxygen PSA Generation Plants',
      specification: '93% ± 3% purity automated dual-tower pressure swing adsorption',
      contractRate: '₹18.00 L',
      openMarketRate: '₹24.00 L',
      savingsPct: 25,
      totalProcured: 14,
      availableStock: 5,
      unit: 'Plants',
      supplier: 'Inox Air Products / State EPC Contract',
    },
    {
      id: 'DEAL-TRAUMA-KITS',
      itemName: 'Emergency Dialysis & Resuscitation Kits',
      specification: 'Continuous Renal Replacement Therapy (CRRT) lines & trauma packs',
      contractRate: '₹4,500',
      openMarketRate: '₹6,800',
      savingsPct: 34,
      totalProcured: 2500,
      availableStock: 1120,
      unit: 'Kits',
      supplier: 'Hindustan Syringes & Medical Devices',
    },
  ])

  // Intra-Hospital Departments Data for Selected Facility
  const [departments, setDepartments] = useState<DepartmentAllocation[]>([
    {
      id: 'dept-trauma',
      name: 'Emergency Trauma Bay / Red Zone',
      short: 'Trauma Bay',
      category: 'Emergency',
      allocatedBeds: 20,
      usedBeds: 18,
      allocatedVents: 6,
      usedVents: 5,
      allocatedBudgetLakhs: 65,
      status: 'CRITICAL',
    },
    {
      id: 'dept-icu',
      name: 'Intensive Care Unit (ICU / CCU)',
      short: 'ICU / CCU',
      category: 'Critical Care',
      allocatedBeds: 40,
      usedBeds: 38,
      allocatedVents: 20,
      usedVents: 19,
      allocatedBudgetLakhs: 90,
      status: 'CRITICAL',
    },
    {
      id: 'dept-hdu',
      name: 'High Dependency Unit (HDU / Step-Down)',
      short: 'HDU',
      category: 'Critical Care',
      allocatedBeds: 35,
      usedBeds: 28,
      allocatedVents: 8,
      usedVents: 5,
      allocatedBudgetLakhs: 45,
      status: 'STRAINED',
    },
    {
      id: 'dept-ward',
      name: 'General Inpatient & Surgical Wards',
      short: 'General Wards',
      category: 'Inpatient',
      allocatedBeds: 220,
      usedBeds: 180,
      allocatedVents: 4,
      usedVents: 1,
      allocatedBudgetLakhs: 30,
      status: 'NOMINAL',
    },
    {
      id: 'dept-nicu',
      name: 'Pediatric & Neonatal ICU (NICU/PICU)',
      short: 'NICU / PICU',
      category: 'Pediatric',
      allocatedBeds: 16,
      usedBeds: 12,
      allocatedVents: 4,
      usedVents: 2,
      allocatedBudgetLakhs: 15,
      status: 'NOMINAL',
    },
  ])

  // Filter hospitals for current district in Tier 2
  const districtHospitals = useMemo(() => {
    if (!selectedDistrict || selectedDistrict === 'ALL') return hospitals
    const filtered = hospitals.filter(
      (h) =>
        (h.district && h.district.toLowerCase().includes(selectedDistrict.toLowerCase())) ||
        h.name.toLowerCase().includes(selectedDistrict.toLowerCase())
    )
    return filtered.length > 0 ? filtered : hospitals
  }, [hospitals, selectedDistrict])

  // Strained hospitals in current view
  const strainedHospitals = useMemo(() => {
    return districtHospitals
      .filter((h) => {
        const load = occupancyRatio(h.beds)
        const icuLoad = h.icuBeds.used / (h.icuBeds.total || 1)
        return load >= 0.7 || icuLoad >= 0.8
      })
      .sort((a, b) => occupancyRatio(b.beds) - occupancyRatio(a.beds))
  }, [districtHospitals])

  // Aggregate metrics
  const totalStateBudgetCr = 28.5
  const releasedStateBudgetCr = districtRecords.reduce((acc, d) => acc + d.releasedBudgetCr, 0)
  const stateReserveCr = Math.round((totalStateBudgetCr - releasedStateBudgetCr) * 100) / 100
  const totalBeds = hospitals.reduce((acc, h) => acc + h.beds.total, 0)
  const totalBedsUsed = hospitals.reduce((acc, h) => acc + h.beds.used, 0)
  const totalIcuBeds = hospitals.reduce((acc, h) => acc + h.icuBeds.total, 0)
  const totalIcuUsed = hospitals.reduce((acc, h) => acc + h.icuBeds.used, 0)

  // Current active hospital object for Tier 3
  const activeHospital = useMemo(() => {
    return hospitals.find((h) => h.id === selectedHospitalId) || hospitals[0]
  }, [hospitals, selectedHospitalId])

  // --- REQUISITION ACTIONS ---

  // Tier 1 Action: Super Admin releases district healthcare grant
  const handleOpenDistrictGrantModal = (district: DistrictBudgetRecord) => {
    const grantAmountCr = district.status === 'CRITICAL_SURGE' ? 1.5 : 0.8
    const newReleased = district.releasedBudgetCr + grantAmountCr

    setActiveRequisition({
      id: `REQ-JH-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Emergency District Healthcare Grant Allocation`,
      tier: 'STATE_GRANT',
      source: 'Jharkhand State Health Directorate (Contingency Reserve)',
      destination: `${district.districtName} District Healthcare Pool`,
      urgency: district.status === 'CRITICAL_SURGE' ? 'Critical P1' : 'High P2',
      items: [
        { label: 'Fiscal Grant', value: `₹${grantAmountCr.toFixed(2)} Cr`, icon: 'cash', highlight: true },
        { label: 'ICU Bed Quota', value: '+12 Beds', icon: 'icu' },
        { label: 'Ventilator Quota', value: '+4 Units', icon: 'vent' },
      ],
      currentLoad: district.capacityLoadPct,
      projectedLoad: Math.max(50, district.capacityLoadPct - 14),
      reliefPct: 14,
      clinicalJustification: `Surge alert triggered in ${district.districtName} District with ${district.queuedPatients} queued patients across ${district.hospitalCount} hospitals. Immediate funds allocated to expand ICU holding capacity.`,
    })
    setApprovalModalOpen(true)
  }

  // Tier 2 Action: District CMO initiates inter-hospital supply transfer
  const handleOpenInterHospitalTransferModal = (hosp: Hospital) => {
    const loadPct = Math.round(occupancyRatio(hosp.beds) * 100)
    const donorCandidate =
      districtHospitals.find((dh) => dh.id !== hosp.id && occupancyRatio(dh.beds) < 0.7) ??
      districtHospitals.find((dh) => dh.id !== hosp.id) ??
      (districtHospitals[1] || hosp)

    const genNeed = loadPct >= 85 ? 12 : 8
    const icuNeed = loadPct >= 85 ? 4 : 2
    const ventNeed = loadPct >= 85 ? 5 : 3
    const newTotal = hosp.beds.total + genNeed + icuNeed
    const newLoadPct = Math.round((hosp.beds.used / newTotal) * 100)
    const relief = loadPct - newLoadPct

    setActiveRequisition({
      id: `REQ-DISP-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `District CMO Equipment & Bed Reallocation`,
      tier: 'DISTRICT_TRANSFER',
      source: `${donorCandidate.name} (Surplus Reserve)`,
      destination: hosp.name,
      urgency: loadPct >= 85 ? 'Critical P1' : 'High P2',
      items: [
        { label: 'General Beds', value: `+${genNeed} Units`, icon: 'bed' },
        { label: 'ICU Beds', value: `+${icuNeed} Beds`, icon: 'icu', highlight: true },
        { label: 'Ventilators', value: `+${ventNeed} Units`, icon: 'vent', highlight: true },
        { label: 'Transport Speed', value: '108 Rapid Fleet', icon: 'box' },
      ],
      currentLoad: loadPct,
      projectedLoad: newLoadPct,
      reliefPct: relief,
      clinicalJustification: `${hosp.name} is operating at ${loadPct}% bed occupancy. Reallocating reserve assets from ${donorCandidate.name} to mitigate emergency wait times.`,
    })
    setApprovalModalOpen(true)
  }

  // Tier 3 Action: Hospital In-Charge allocates resources to specific department
  const handleOpenDepartmentAllocationModal = (dept: DepartmentAllocation) => {
    const currentDeptLoad = Math.round((dept.usedBeds / dept.allocatedBeds) * 100)
    const newBeds = dept.allocatedBeds + (dept.category === 'Critical Care' ? 4 : 8)
    const newVents = dept.allocatedVents + 2
    const projectedDeptLoad = Math.round((dept.usedBeds / newBeds) * 100)

    setActiveRequisition({
      id: `REQ-DEPT-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Intra-Hospital Department Resource Disbursement`,
      tier: 'DEPARTMENT_ALLOCATION',
      source: `${activeHospital.name} Central Reserve Store`,
      destination: `${dept.name} (${dept.short})`,
      urgency: dept.status === 'CRITICAL' ? 'Critical P1' : 'Moderate P3',
      items: [
        { label: 'Bed Capacity', value: `+${newBeds - dept.allocatedBeds} Beds`, icon: 'bed', highlight: true },
        { label: 'Ventilators', value: `+2 Units`, icon: 'vent' },
        { label: 'Internal Budget', value: '+₹15 Lakhs', icon: 'cash' },
      ],
      currentLoad: currentDeptLoad,
      projectedLoad: projectedDeptLoad,
      reliefPct: currentDeptLoad - projectedDeptLoad,
      clinicalJustification: `Internal triage bottleneck identified in ${dept.name}. Deploying unallocated facility reserve equipment directly to clinical bay.`,
    })
    setApprovalModalOpen(true)
  }

  // Handle instant modal confirmation (zero terminal lag!)
  const handleConfirmRequisition = (req: SupplyRequisition) => {
    const nowStr = new Date().toLocaleTimeString()

    if (req.tier === 'STATE_GRANT') {
      // Update district records
      setDistrictRecords((prev) =>
        prev.map((d) => {
          if (req.destination.includes(d.districtName)) {
            return {
              ...d,
              releasedBudgetCr: Math.min(d.totalBudgetCr, d.releasedBudgetCr + 1.5),
              capacityLoadPct: Math.max(50, d.capacityLoadPct - 14),
              status: 'NOMINAL',
              pendingRequisitions: Math.max(0, d.pendingRequisitions - 1),
            }
          }
          return d
        })
      )
      const toast = `[STATE CLEARANCE] Requisition ${req.id} authorized. ₹1.50 Cr released to ${req.destination}.`
      setLastEventToast(toast)
      setAuditLogs((prev) => [
        { id: `AUD-${Math.floor(100 + Math.random() * 900)}`, time: nowStr, text: toast, tier: 'State Directorate' },
        ...prev,
      ])
    } else if (req.tier === 'DISTRICT_TRANSFER') {
      // Execute inter-hospital transfer
      if (onRunAiSupplyDispatch) {
        onRunAiSupplyDispatch()
      }
      const toast = `[DISTRICT CMO CLEARANCE] Requisition ${req.id} executed. Supplies transferred to ${req.destination}. Capacity relief: -${req.reliefPct}%.`
      setLastEventToast(toast)
      setAuditLogs((prev) => [
        { id: `AUD-${Math.floor(100 + Math.random() * 900)}`, time: nowStr, text: toast, tier: 'District CMO' },
        ...prev,
      ])
    } else if (req.tier === 'DEPARTMENT_ALLOCATION') {
      // Update departmental allocation
      setDepartments((prev) =>
        prev.map((d) => {
          if (req.destination.includes(d.name) || req.destination.includes(d.short)) {
            const addedBeds = d.category === 'Critical Care' ? 4 : 8
            const addedVents = 2
            const updatedBeds = d.allocatedBeds + addedBeds
            return {
              ...d,
              allocatedBeds: updatedBeds,
              allocatedVents: d.allocatedVents + addedVents,
              allocatedBudgetLakhs: d.allocatedBudgetLakhs + 15,
              status: 'NOMINAL',
            }
          }
          return d
        })
      )
      const toast = `[HOSPITAL CLEARANCE] Requisition ${req.id} authorized by Medical Supt. Equipment mobilized to ${req.destination}.`
      setLastEventToast(toast)
      setAuditLogs((prev) => [
        { id: `AUD-${Math.floor(100 + Math.random() * 900)}`, time: nowStr, text: toast, tier: 'Facility Supt' },
        ...prev,
      ])
    }

    setTimeout(() => {
      setLastEventToast(null)
    }, 7000)
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-stone-900">
      {/* QUICK APPROVAL PILL MODAL */}
      <SupplyApprovalPillModal
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false)
          setActiveRequisition(null)
        }}
        requisition={activeRequisition}
        onConfirm={handleConfirmRequisition}
      />

      {/* Header & Hierarchy Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
              <Boxes className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#382416]">
                Healthcare Inventory & Fiscal Supply Governance
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                3-Tier State Health Administrative Allocation: Statewide District Grants ➔ District CMO Shares ➔ Facility Ward Allocation
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping"></span>
            Live Fiscal Telemetry Active
          </span>
        </div>
      </div>

      {/* 3-Tier Hierarchy Tab Switcher */}
      <div className="rounded-2xl border border-stone-200/80 bg-stone-100/70 p-1.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTier('STATE_HEALTH')}
          className={`flex-1 min-w-[220px] rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTier === 'STATE_HEALTH'
              ? 'bg-white text-[#382416] shadow-xs border border-stone-200/80'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          <Landmark className="size-4 text-orange-600" />
          <div className="text-left">
            <div className="leading-tight">Tier 1: State Health Directorate</div>
            <div className="text-[10px] font-normal text-stone-500">District Grants & Bulk Rate Deals</div>
          </div>
          {userRole === 'SUPER_ADMIN' && (
            <span className="ml-auto text-[9px] font-semibold bg-orange-100 text-[#ea580c] px-1.5 py-0.5 rounded-md">
              Your Role
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTier('DISTRICT_CMO')}
          className={`flex-1 min-w-[220px] rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTier === 'DISTRICT_CMO'
              ? 'bg-white text-[#382416] shadow-xs border border-stone-200/80'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          <Building2 className="size-4 text-indigo-600" />
          <div className="text-left">
            <div className="leading-tight">Tier 2: District CMO Command</div>
            <div className="text-[10px] font-normal text-stone-500">Inter-Hospital Share Balancing</div>
          </div>
          {userRole === 'DISTRICT_CMO' && (
            <span className="ml-auto text-[9px] font-semibold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded-md">
              Your Role
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTier('HOSPITAL_DEPT')}
          className={`flex-1 min-w-[220px] rounded-xl px-4 py-2.5 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeTier === 'HOSPITAL_DEPT'
              ? 'bg-white text-[#382416] shadow-xs border border-stone-200/80'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
          }`}
        >
          <BedDouble className="size-4 text-teal-600" />
          <div className="text-left">
            <div className="leading-tight">Tier 3: Facility Command</div>
            <div className="text-[10px] font-normal text-stone-500">Ward & Dept Internal Allocation</div>
          </div>
          {userRole === 'HOSPITAL_ADMIN' && (
            <span className="ml-auto text-[9px] font-semibold bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded-md">
              Your Role
            </span>
          )}
        </button>
      </div>

      {/* Operational Event Notification Banner */}
      {lastEventToast && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-2xs"
        >
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-emerald-600 animate-pulse shrink-0" />
            <span>{lastEventToast}</span>
          </div>
          <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-300">
            Updated Live
          </span>
        </motion.div>
      )}

      {/* ========================================================================= */}
      {/* TIER 1: STATE HEALTH DIRECTORATE (SUPER ADMIN)                           */}
      {/* ========================================================================= */}
      {activeTier === 'STATE_HEALTH' && (
        <div className="space-y-6">
          {/* Statewide Macro Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Healthcare Reserve */}
            <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-[#ea580c] to-[#c2410c] p-5 text-white shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-100">
                  State Health Budget
                </span>
                <div className="flex size-9 items-center justify-center rounded-full bg-white/20">
                  <IndianRupee className="size-4 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">₹{totalStateBudgetCr.toFixed(2)} Cr</span>
                <span className="text-xs font-medium text-orange-100">State Allocation</span>
              </div>
              <p className="mt-2 text-xs text-orange-100/80">
                ₹{releasedStateBudgetCr.toFixed(2)} Cr Disbursed · ₹{stateReserveCr.toFixed(2)} Cr Contingency Pool
              </p>
            </div>

            {/* Card 2: Acute Surge Deficit Districts */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  District Surge Deficits
                </span>
                <div className="flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-600">
                  <AlertTriangle className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-rose-700">
                  {districtRecords.filter((d) => d.status === 'CRITICAL_SURGE').length} Districts
                </span>
                <span className="text-xs font-medium text-stone-500">Critical Status</span>
              </div>
              <p className="mt-2 text-xs text-stone-600">
                Ranchi & Dhanbad reporting acute surge pressures
              </p>
            </div>

            {/* Card 3: Statewide Bed Infrastructure */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  Statewide Hospital Beds
                </span>
                <div className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <BedDouble className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight text-[#382416]">
                  {totalBeds - totalBedsUsed}
                </span>
                <span className="text-xs font-medium text-stone-500">/ {totalBeds} Available</span>
              </div>
              <p className="mt-2 text-xs text-stone-600">
                {totalIcuUsed} / {totalIcuBeds} ICU Critical Beds Occupied
              </p>
            </div>

            {/* Card 4: Bulk Master Rate Contracts */}
            <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  State Bulk Contracts
                </span>
                <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                  <ShieldCheck className="size-4" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold tracking-tight text-emerald-800">
                  4 Master Deals
                </span>
              </div>
              <p className="mt-2 text-xs text-stone-600">
                Avg 29% state savings negotiated under GeM rate contracts
              </p>
            </div>
          </div>

          {/* District-Wise Telemetry & Allocation Grid */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#382416] flex items-center gap-2">
                  <Landmark className="size-5 text-orange-600" />
                  District-Wise Healthcare Allocation & Strain Telemetry
                </h3>
                <p className="text-xs text-stone-500">
                  Super Admin high-level oversight: Allocate district budget shares and dispatch state emergency grants.
                </p>
              </div>

              <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                Jharkhand Health Directorate (24 Districts)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-700">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50/70 text-stone-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">District Name</th>
                    <th className="p-3">Population</th>
                    <th className="p-3">Facilities</th>
                    <th className="p-3">Total Allocated</th>
                    <th className="p-3">Released Funds</th>
                    <th className="p-3">Capacity Strain</th>
                    <th className="p-3">Surge Status</th>
                    <th className="p-3 text-right">Administrative Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {districtRecords.map((dist) => (
                    <tr key={dist.id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3 font-bold text-stone-900 flex items-center gap-2">
                        <Building2 className="size-4 text-stone-400" />
                        <span>{dist.districtName}</span>
                      </td>
                      <td className="p-3 text-stone-600">{dist.population}</td>
                      <td className="p-3 font-semibold">{dist.hospitalCount} Facilities</td>
                      <td className="p-3 font-bold text-stone-900">₹{dist.totalBudgetCr.toFixed(2)} Cr</td>
                      <td className="p-3 font-semibold text-emerald-800">₹{dist.releasedBudgetCr.toFixed(2)} Cr</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-stone-200 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                dist.capacityLoadPct >= 80
                                  ? 'bg-red-500'
                                  : dist.capacityLoadPct >= 70
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${dist.capacityLoadPct}%` }}
                            />
                          </div>
                          <span className="font-bold text-stone-900">{dist.capacityLoadPct}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            dist.status === 'CRITICAL_SURGE'
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : dist.status === 'MODERATE_STRAIN'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {dist.status === 'CRITICAL_SURGE'
                            ? 'Critical Surge'
                            : dist.status === 'MODERATE_STRAIN'
                            ? 'Moderate Strain'
                            : 'Nominal'}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedDistrict(dist.districtName)
                              setActiveTier('DISTRICT_CMO')
                            }}
                            className="rounded-lg border border-stone-200 bg-white hover:bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-700 transition-colors cursor-pointer"
                          >
                            Inspect ➔
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenDistrictGrantModal(dist)}
                            className="rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white px-3 py-1 text-[11px] font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <IndianRupee className="size-3" />
                            <span>Release Grant</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* State Bulk Procurement Deals (GeM Master Contracts) */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#382416] flex items-center gap-2">
                  <ShieldCheck className="size-5 text-emerald-600" />
                  State-Wide Bulk Procurement Deals & Rate Contracts
                </h3>
                <p className="text-xs text-stone-500">
                  State Health Department negotiates high-volume contracts on Government e-Marketplace (GeM) to supply all 24 districts at discounted tender rates.
                </p>
              </div>

              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                State Rate Contracts Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bulkDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="rounded-xl border border-stone-200/90 bg-stone-50/60 p-4 space-y-3 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-[#382416]">{deal.itemName}</div>
                      <div className="text-[11px] text-stone-500 mt-0.5">{deal.specification}</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                      Save {deal.savingsPct}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-lg border border-stone-200/80">
                    <div>
                      <span className="text-[10px] text-stone-500 font-semibold block uppercase">State Tender Rate</span>
                      <span className="font-extrabold text-stone-900 text-sm">{deal.contractRate}</span>
                      <span className="text-[10px] text-stone-400 line-through ml-1">{deal.openMarketRate}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-500 font-semibold block uppercase">Available in State Reserve</span>
                      <span className="font-extrabold text-[#ea580c] text-sm">
                        {deal.availableStock} / {deal.totalProcured} {deal.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span>Vendor: <strong>{deal.supplier}</strong></span>
                    <button
                      type="button"
                      onClick={() => {
                        setBulkDeals((prev) =>
                          prev.map((d) => (d.id === deal.id ? { ...d, availableStock: d.availableStock + 10 } : d))
                        )
                        setLastEventToast(`Procured +10 units to State Bulk Reserve: ${deal.itemName}`)
                      }}
                      className="text-xs font-bold text-[#ea580c] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <PlusCircle className="size-3.5" />
                      <span>Procure More</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TIER 2: DISTRICT CMO COMMAND (INTER-HOSPITAL DISTRIBUTION)              */}
      {/* ========================================================================= */}
      {activeTier === 'DISTRICT_CMO' && (
        <div className="space-y-6">
          {/* District Header & Scoping */}
          <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 to-white p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 shrink-0">
                <Building2 className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900">
                    District Chief Medical Officer (CMO) Command
                  </h3>
                  <span className="text-xs font-bold text-indigo-800 bg-indigo-100 border border-indigo-300 px-2.5 py-0.5 rounded-full">
                    {selectedDistrict} District
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Ensure equitable healthcare share distribution across all district facilities. Relieve strained public hospitals by authorizing transfers from surplus facilities.
                </p>
              </div>
            </div>

            {/* District Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">District Scope:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-[#382416] shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                {districtRecords.map((d) => (
                  <option key={d.id} value={d.districtName}>
                    {d.districtName} District
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* District Fiscal Pool Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
                District Budget Received
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#382416]">
                  ₹{districtRecords.find((d) => d.districtName === selectedDistrict)?.releasedBudgetCr.toFixed(2) || '5.10'} Cr
                </span>
                <span className="text-xs text-stone-500">State Quota</span>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
                District Facilities Under Command
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-indigo-700">
                  {districtHospitals.length} Hospitals
                </span>
                <span className="text-xs text-stone-500">Connected</span>
              </div>
            </div>

            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
                Surge Bottlenecks In District
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-rose-700">
                  {strainedHospitals.length} Facilities
                </span>
                <span className="text-xs text-stone-500">Strained</span>
              </div>
            </div>
          </div>

          {/* Dynamic Inter-Hospital Supply Flagging Panel */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#382416] flex items-center gap-2">
                  <AlertTriangle className="size-5 text-amber-600" />
                  Inter-Hospital Equitable Share Balancing & Reallocations
                </h3>
                <p className="text-xs text-stone-500">
                  The District CMO reallocates idle beds & respiratory units from low-occupancy CHCs to overloaded tertiary hospitals.
                </p>
              </div>
              <span className="text-xs font-semibold text-stone-500">CMO Direct Authority</span>
            </div>

            {/* Dynamic Transfer Cards */}
            <div className="space-y-3">
              {strainedHospitals.length > 0 ? (
                strainedHospitals.map((hosp) => {
                  const loadPct = Math.round(occupancyRatio(hosp.beds) * 100)
                  const donorCandidate =
                    districtHospitals.find((dh) => dh.id !== hosp.id && occupancyRatio(dh.beds) < 0.7) ??
                    districtHospitals.find((dh) => dh.id !== hosp.id) ??
                    (districtHospitals[1] || hosp)

                  const genNeed = loadPct >= 85 ? 12 : 8
                  const icuNeed = loadPct >= 85 ? 4 : 2
                  const ventNeed = loadPct >= 85 ? 5 : 3
                  const totalNeed = genNeed + icuNeed

                  return (
                    <div
                      key={hosp.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-amber-300/80 bg-amber-50/60 shadow-2xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-stone-900">{hosp.name}</span>
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                              loadPct >= 85
                                ? 'bg-red-100 text-red-800 border-red-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {loadPct >= 85 ? 'Critical Surge Deficit' : 'Moderate Deficit'} ({loadPct}% Load)
                          </span>
                          <span className="text-xs font-semibold text-[#ea580c] bg-orange-100 px-2 py-0.5 rounded-full border border-orange-300">
                            +{totalNeed} Beds (+{icuNeed} ICU) & +{ventNeed} Vents Required
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-stone-600 flex-wrap">
                          <span>Donor: <strong>{donorCandidate.name}</strong></span>
                          <ArrowRight className="size-3 text-stone-400" />
                          <span>Recipient: <strong>{hosp.name}</strong></span>
                          <span className="text-stone-300">|</span>
                          <span className="text-stone-500">
                            Occupancy: {hosp.beds.used}/{hosp.beds.total} Beds · ICU: {hosp.icuBeds.used}/{hosp.icuBeds.total}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedHospitalId(hosp.id)
                            setActiveTier('HOSPITAL_DEPT')
                          }}
                          className="rounded-xl border border-stone-300 bg-white hover:bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
                        >
                          Inspect Depts ➔
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenInterHospitalTransferModal(hosp)}
                          className="rounded-xl bg-emerald-700 hover:bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                        >
                          <CheckCircle2 className="size-4" />
                          <span>Authorize Live Reallocation</span>
                        </button>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="p-5 rounded-xl border border-emerald-300/80 bg-emerald-50/70 text-emerald-900 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="size-6 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-sm block text-emerald-950">
                        All District Facilities Operating Within Balanced Limits
                      </span>
                      <span className="text-xs text-emerald-800">
                        All {districtHospitals.length} hospitals in {selectedDistrict} are operating below 70% load.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-emerald-800 bg-white px-3 py-1 rounded-full border border-emerald-300">
                    Balanced Quota
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* District Hospitals Resource Matrix */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#382416]">
                  District Hospital Resource Inventory Matrix ({selectedDistrict})
                </h3>
                <p className="text-xs text-stone-500">
                  Equitable resource shares and current occupancy buffers across all facilities in this district.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {districtHospitals.map((h) => {
                const loadPct = Math.round(occupancyRatio(h.beds) * 100)

                return (
                  <div key={h.id} className="rounded-2xl border border-stone-200/80 bg-stone-50/50 p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-sm text-[#382416]">{h.name}</h4>
                        <span className="text-[11px] text-stone-500">{h.district || selectedDistrict}</span>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          loadPct >= 85
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : loadPct >= 70
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        }`}
                      >
                        {loadPct}% Capacity
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          loadPct >= 85 ? 'bg-red-500' : loadPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${loadPct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-xl bg-white p-2.5 border border-stone-200/80">
                        <span className="text-stone-500 font-semibold block uppercase text-[10px]">General Beds</span>
                        <span className="font-bold text-stone-900">{h.beds.used} / {h.beds.total}</span>
                      </div>

                      <div className="rounded-xl bg-white p-2.5 border border-stone-200/80">
                        <span className="text-stone-500 font-semibold block uppercase text-[10px]">ICU Beds</span>
                        <span className="font-bold text-stone-900">{h.icuBeds.used} / {h.icuBeds.total}</span>
                      </div>

                      <div className="rounded-xl bg-white p-2.5 border border-stone-200/80">
                        <span className="text-stone-500 font-semibold block uppercase text-[10px]">Ventilators</span>
                        <span className="font-bold text-stone-900">{h.ventilators.used} / {h.ventilators.total}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TIER 3: FACILITY IN-CHARGE / MEDICAL SUPERINTENDENT                      */}
      {/* ========================================================================= */}
      {activeTier === 'HOSPITAL_DEPT' && (
        <div className="space-y-6">
          {/* Hospital Header & Selector */}
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/80 to-white p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-teal-100 text-teal-700 shrink-0">
                <BedDouble className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900">
                    Hospital In-Charge / Medical Superintendent Command
                  </h3>
                  <span className="text-xs font-bold text-teal-800 bg-teal-100 border border-teal-300 px-2.5 py-0.5 rounded-full">
                    {activeHospital.name}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Internal hospital governance: When funds and equipment are received from the District CMO, allocate them directly across internal clinical departments.
                </p>
              </div>
            </div>

            {/* Hospital Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-stone-500">Facility:</span>
              <select
                value={selectedHospitalId}
                onChange={(e) => setSelectedHospitalId(e.target.value)}
                className="rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs font-bold text-[#382416] shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-teal-500"
              >
                {hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Departmental Allocation Matrix */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#382416] flex items-center gap-2">
                  <SlidersHorizontal className="size-5 text-teal-600" />
                  Intra-Hospital Department Resource & Fund Distribution
                </h3>
                <p className="text-xs text-stone-500">
                  Direct newly received beds, ventilators, and funds to where acute trauma and ICU bottlenecks occur.
                </p>
              </div>

              <span className="text-xs font-semibold text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-300">
                Facility Total: ₹2.40 Cr Disbursed
              </span>
            </div>

            <div className="space-y-3">
              {departments.map((dept) => {
                const deptLoadPct = Math.round((dept.usedBeds / dept.allocatedBeds) * 100)

                return (
                  <div
                    key={dept.id}
                    className="p-4 rounded-xl border border-stone-200/90 bg-stone-50/60 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900">{dept.name}</span>
                        <span className="text-xs text-stone-500 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                          {dept.category}
                        </span>
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                            deptLoadPct >= 90
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : deptLoadPct >= 75
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {deptLoadPct}% Occupancy
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-stone-900">
                          Budget: <strong className="text-emerald-800">₹{dept.allocatedBudgetLakhs} L</strong>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleOpenDepartmentAllocationModal(dept)}
                          className="rounded-lg bg-teal-700 hover:bg-teal-600 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <PlusCircle className="size-3.5" />
                          <span>Reallocate Quota</span>
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          deptLoadPct >= 90 ? 'bg-red-500' : deptLoadPct >= 75 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${deptLoadPct}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="rounded-lg bg-white p-2.5 border border-stone-200/80">
                        <span className="text-[10px] text-stone-500 font-semibold block uppercase">Allocated Beds</span>
                        <span className="font-extrabold text-stone-900">{dept.usedBeds} / {dept.allocatedBeds} Units</span>
                      </div>

                      <div className="rounded-lg bg-white p-2.5 border border-stone-200/80">
                        <span className="text-[10px] text-stone-500 font-semibold block uppercase">Assigned Ventilators</span>
                        <span className="font-extrabold text-stone-900">{dept.usedVents} / {dept.allocatedVents} Units</span>
                      </div>

                      <div className="rounded-lg bg-white p-2.5 border border-stone-200/80">
                        <span className="text-[10px] text-stone-500 font-semibold block uppercase">Vacant Buffer</span>
                        <span className="font-extrabold text-emerald-700">{dept.allocatedBeds - dept.usedBeds} Beds Open</span>
                      </div>

                      <div className="rounded-lg bg-white p-2.5 border border-stone-200/80">
                        <span className="text-[10px] text-stone-500 font-semibold block uppercase">Staffing Ratio</span>
                        <span className="font-extrabold text-stone-900">
                          {dept.category === 'Critical Care' ? '1:1 Nurse/Pt' : '1:4 Nurse/Pt'}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUDIT & EVENT LOG STREAM                                                 */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-stone-200/80 bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-stone-100 pb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#382416] flex items-center gap-2">
            <FileCheck2 className="size-4 text-stone-500" />
            Healthcare Supply & Fiscal Governance Audit Stream
          </h3>
          <span className="text-[11px] font-semibold text-stone-500">Real-time Timestamped Telemetry</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto font-sans text-xs">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-800 flex items-start justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-stone-400">{log.time}</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-stone-200 text-stone-700">
                    {log.tier}
                  </span>
                </div>
                <div className="text-stone-700">{log.text}</div>
              </div>

              <span className="font-mono text-[10px] text-stone-400 shrink-0">AUTH-OK</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
