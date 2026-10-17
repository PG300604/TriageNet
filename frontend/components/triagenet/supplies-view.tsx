'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  type TriageState,
  type Hospital,
  occupancyRatio,
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
  Landmark,
  PlusCircle,
  FileCheck2,
  SlidersHorizontal,
  Bot,
  Sparkles,
  Clock,
  TrendingUp,
  RefreshCw,
  Info,
  X,
  Coins,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import {
  SupplyApprovalPillModal,
  type SupplyRequisition,
} from './supply-approval-pill-modal'
import {
  DistrictOverviewModal,
  type DistrictBudgetRecord,
} from './district-overview-modal'
import { HospitalOverviewModal } from './hospital-overview-modal'
import { LogShortageModal } from './log-shortage-modal'
import {
  type ShortageIncidentReport,
  type PredictiveInventoryRecommendation,
  INITIAL_SHORTAGE_INCIDENTS,
  INITIAL_PREDICTIVE_RECOMMENDATIONS,
} from '@/lib/predictive-supply-engine'

interface SuppliesViewProps {
  state: TriageState
  onStateChange?: (next: TriageState) => void
  onRunAiSupplyDispatch?: () => void
}

type SupplyTier = 'STATE_HEALTH' | 'DISTRICT_CMO' | 'HOSPITAL_DEPT'

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

  // Strictly bind view to user's assigned role — no multi-tier leakage
  const userRole: UserRole = user?.role || 'SUPER_ADMIN'
  const activeTier: SupplyTier =
    userRole === 'HOSPITAL_ADMIN' || userRole === 'TRIAGE_NURSE' || userRole === 'AMBULANCE_DISPATCH'
      ? 'HOSPITAL_DEPT'
      : userRole === 'DISTRICT_CMO'
      ? 'DISTRICT_CMO'
      : 'STATE_HEALTH'

  const userDistrict = user?.districtName && user.districtName !== 'Statewide' ? user.districtName : 'Ranchi'
  const userHospitalId = user?.hospitalId || hospitals[0]?.id || 'jh-rims-ranchi'

  // Modal States
  const [approvalModalOpen, setApprovalModalOpen] = useState(false)
  const [activeRequisition, setActiveRequisition] = useState<SupplyRequisition | null>(null)
  const [inspectDistrict, setInspectDistrict] = useState<DistrictBudgetRecord | null>(null)
  const [inspectHospital, setInspectHospital] = useState<Hospital | null>(null)
  const [logShortageModalOpen, setLogShortageModalOpen] = useState(false)
  const [lastEventToast, setLastEventToast] = useState<string | null>(null)

  // Role-Based Manual Data Entry Modal States
  // 1. Super Admin: New GeM Contract Deal
  const [newGeMModalOpen, setNewGeMModalOpen] = useState(false)
  const [gemItemName, setGemItemName] = useState('Philips Respironics V60 Ventilators')
  const [gemSpec, setGemSpec] = useState('Non-invasive ICU & High Flow BiPAP Resuscitation')
  const [gemContractRate, setGemContractRate] = useState('₹8.40 L')
  const [gemMarketRate, setGemMarketRate] = useState('₹11.90 L')
  const [gemQuantity, setGemQuantity] = useState(60)
  const [gemSupplier, setGemSupplier] = useState('Philips Medical Systems India (GeM-L1)')

  // 2. District CMO: Emergency District Requisition
  const [cmoRequisitionModalOpen, setCmoRequisitionModalOpen] = useState(false)
  const [cmoTargetHospId, setCmoTargetHospId] = useState(hospitals[0]?.id || '')
  const [cmoResourceType, setCmoResourceType] = useState('Intensive Care Ventilator Units')
  const [cmoQuantity, setCmoQuantity] = useState(4)
  const [cmoPriority, setCmoPriority] = useState<'P1_CRITICAL' | 'P2_URGENT' | 'P3_ROUTINE'>('P1_CRITICAL')
  const [cmoJustification, setCmoJustification] = useState('Surge in acute hypoxemic respiratory cases exceeding active ICU buffer')

  // 3. Hospital Superintendent: Add/Reconfigure Ward Care Bays
  const [wardModalOpen, setWardModalOpen] = useState(false)
  const [wardDeptName, setWardDeptName] = useState('Trauma Resuscitation Bay 2')
  const [wardCategory, setWardCategory] = useState<'Critical Care' | 'Emergency' | 'Inpatient' | 'Pediatric'>('Critical Care')
  const [wardBeds, setWardBeds] = useState(12)
  const [wardVents, setWardVents] = useState(4)
  const [wardBudgetLakhs, setWardBudgetLakhs] = useState(35)

  // AI Predictive Telemetry State
  const [shortageReports, setShortageReports] = useState<ShortageIncidentReport[]>(INITIAL_SHORTAGE_INCIDENTS)
  const [predictiveRecs, setPredictiveRecs] = useState<PredictiveInventoryRecommendation[]>(INITIAL_PREDICTIVE_RECOMMENDATIONS)

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

  // Statewide Districts Data (Tier 1)
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

  // Intra-Hospital Departments Data for Selected Facility (Tier 3)
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
    if (!userDistrict || userDistrict === 'ALL' || userDistrict === 'Statewide') return hospitals
    const filtered = hospitals.filter(
      (h) =>
        (h.district && h.district.toLowerCase().includes(userDistrict.toLowerCase())) ||
        h.name.toLowerCase().includes(userDistrict.toLowerCase())
    )
    return filtered.length > 0 ? filtered : hospitals
  }, [hospitals, userDistrict])

  // Strained hospitals in current district
  const strainedHospitals = useMemo(() => {
    return districtHospitals
      .filter((h) => {
        const load = occupancyRatio(h.beds)
        const icuLoad = h.icuBeds.used / (h.icuBeds.total || 1)
        return load >= 0.7 || icuLoad >= 0.8
      })
      .sort((a, b) => occupancyRatio(b.beds) - occupancyRatio(a.beds))
  }, [districtHospitals])

  // Dynamic State Health Budget Pool
  const [totalFiscalPoolCr, setTotalFiscalPoolCr] = useState<number>(28.5)
  const [contingencyReserveCr, setContingencyReserveCr] = useState<number>(6.4)
  const [disbursedBudgetCr, setDisbursedBudgetCr] = useState<number>(22.1)
  const [inflowModalOpen, setInflowModalOpen] = useState<boolean>(false)

  // Aggregate metrics
  const totalStateBudgetCr = totalFiscalPoolCr
  const releasedStateBudgetCr = disbursedBudgetCr
  const stateReserveCr = contingencyReserveCr
  const totalBeds = hospitals.reduce((acc, h) => acc + h.beds.total, 0)
  const totalBedsUsed = hospitals.reduce((acc, h) => acc + h.beds.used, 0)
  const totalIcuBeds = hospitals.reduce((acc, h) => acc + h.icuBeds.total, 0)
  const totalIcuUsed = hospitals.reduce((acc, h) => acc + h.icuBeds.used, 0)

  // Current active hospital object for Tier 3
  const activeHospital = useMemo(() => {
    return hospitals.find((h) => h.id === userHospitalId) || hospitals[0]
  }, [hospitals, userHospitalId])

  // --- REQUISITION & TELEMETRY ACTIONS ---

  // Refetch and replenish budget from Ayushman Bharat recoveries and GeM savings
  const handleReplenishBudget = () => {
    const inflow = 2.5
    setContingencyReserveCr((prev) => Math.round((prev + inflow) * 100) / 100)
    setTotalFiscalPoolCr((prev) => Math.round((prev + inflow) * 100) / 100)
    const toast = `[TREASURY REPLENISHED] Refetched +₹2.50 Cr into State Health Contingency Reserve from Ayushman Bharat PMJAY claim recoveries and GeM bulk procurement savings!`
    setLastEventToast(toast)
    setAuditLogs((prev) => [
      { id: `AUD-${Math.floor(100 + Math.random() * 900)}`, time: new Date().toLocaleTimeString(), text: toast, tier: 'State Treasury' },
      ...prev,
    ])
  }

  // Inject a specific statutory treasury inflow tranche
  const handleInjectSpecificInflow = (streamName: string, amountCr: number, statutoryCode: string) => {
    setContingencyReserveCr((prev) => Math.round((prev + amountCr) * 100) / 100)
    setTotalFiscalPoolCr((prev) => Math.round((prev + amountCr) * 100) / 100)
    const toast = `[STATUTORY INFLOW] +₹${amountCr.toFixed(2)} Cr credited from ${streamName} (${statutoryCode}). Contingency Reserve updated to ₹${Math.round((contingencyReserveCr + amountCr) * 100) / 100} Cr.`
    setLastEventToast(toast)
    setAuditLogs((prev) => [
      { id: `AUD-${Math.floor(100 + Math.random() * 900)}`, time: new Date().toLocaleTimeString(), text: toast, tier: 'Treasury Escrow' },
      ...prev,
    ])
  }

  // Handle procurement deal with strict State Health Budget deduction
  const handleProcureDeal = (deal: BulkProcurementDeal) => {
    const dealBatches: Record<string, { batch: number; costCr: number }> = {
      'DEAL-VENTILATORS': { batch: 5, costCr: 0.62 }, // 5 units @ 12.5L = 62.5L = 0.62 Cr
      'DEAL-ICU-BEDS': { batch: 10, costCr: 0.28 }, // 10 beds @ 2.85L = 28.5L = 0.28 Cr
      'DEAL-PSA-O2': { batch: 1, costCr: 0.18 }, // 1 plant @ 18L = 18L = 0.18 Cr
      'DEAL-TRAUMA-KITS': { batch: 250, costCr: 0.05 }, // 250 kits @ 4,500 = 11.25L = 0.05 Cr
    }

    const config = dealBatches[deal.id] || { batch: 10, costCr: 0.25 }

    if (contingencyReserveCr < config.costCr) {
      const errorToast = `[BUDGET DEFICIT] Insufficient Contingency Reserve (₹${contingencyReserveCr.toFixed(2)} Cr remaining). Procuring ${config.batch} ${deal.unit} of ${deal.itemName} requires ₹${config.costCr.toFixed(2)} Cr. Refetch Treasury Inflow first!`
      setLastEventToast(errorToast)
      return
    }

    const nextReserve = Math.max(0, Math.round((contingencyReserveCr - config.costCr) * 100) / 100)
    const nextDisbursed = Math.round((disbursedBudgetCr + config.costCr) * 100) / 100

    setContingencyReserveCr(nextReserve)
    setDisbursedBudgetCr(nextDisbursed)
    setBulkDeals((prev) =>
      prev.map((d) =>
        d.id === deal.id
          ? {
              ...d,
              availableStock: d.availableStock + config.batch,
              totalProcured: d.totalProcured + config.batch,
            }
          : d
      )
    )

    const successToast = `[GeM PROCUREMENT] Purchase Order PO-${Math.floor(1000 + Math.random() * 9000)} executed. +${config.batch} ${deal.unit} ${deal.itemName} delivered to State Reserve. ₹${config.costCr.toFixed(2)} Cr deducted from State Health Contingency Reserve. Reserve remaining: ₹${nextReserve.toFixed(2)} Cr.`
    setLastEventToast(successToast)
    setAuditLogs((prev) => [
      { id: `AUD-${Math.floor(100 + Math.random() * 900)}`, time: new Date().toLocaleTimeString(), text: successToast, tier: 'State Directorate' },
      ...prev,
    ])
  }

  // Handle logging a bottom-up shortage incident by a frontline clinical officer
  const handleLogShortageSubmit = (report: ShortageIncidentReport) => {
    setShortageReports((prev) => [report, ...prev])

    // Synthesize an instant AI predictive pre-fetch recommendation based on the shortage report
    const newRec: PredictiveInventoryRecommendation = {
      id: `PRED-REC-${Math.floor(100 + Math.random() * 900)}`,
      generatedAt: new Date().toTimeString().split(' ')[0],
      targetFacilityId: report.facilityId,
      targetFacilityName: report.facilityName,
      district: report.district,
      department: report.department,
      resourceType: report.resourceType,
      recommendedItem:
        report.resourceType === 'VENTILATORS'
          ? 'Mindray SV300 Portable ICU Ventilators'
          : report.resourceType === 'ICU_BEDS'
          ? '5-Function Motorized Critical Beds'
          : report.resourceType === 'HIGH_FLOW_O2'
          ? 'High-Flow O₂ Humidifiers & Cannulas'
          : 'Emergency Multipara Cardiac Monitors',
      recommendedQuantity: report.quantityDeficit,
      sourceFacilityOrStore: `${report.district} District Emergency Medical Depot`,
      preFetchWindowHours: 1.5,
      confidenceScore: 93,
      clinicalDriver: `Ingested frontline report from ${report.reportingOfficerName} (${report.reportingOfficerRole}): ${report.clinicalNotes}`,
      status: 'PENDING_PRE_FETCH',
    }
    setPredictiveRecs((prev) => [newRec, ...prev])

    const toastMsg = `[AI PREDICTIVE INGESTION] Recorded shortage incident ${report.id}. AI recommended pre-fetching ${newRec.recommendedQuantity}x ${newRec.recommendedItem} for ${report.department}.`
    setLastEventToast(toastMsg)
    setAuditLogs((prev) => [
      { id: `AUD-${Math.floor(100 + Math.random() * 900)}`, time: report.timestamp, text: toastMsg, tier: 'AI Predictive Engine' },
      ...prev,
    ])
  }

  // Handle authorizing a proactive pre-fetch recommendation
  const handleAuthorizePreFetch = (rec: PredictiveInventoryRecommendation) => {
    setActiveRequisition({
      id: `REQ-PREFETCH-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Proactive Pre-Surge Inventory Pre-Fetch`,
      tier: 'DISTRICT_TRANSFER',
      source: rec.sourceFacilityOrStore,
      destination: `${rec.targetFacilityName} (${rec.department})`,
      urgency: 'High P2',
      sourceRecId: rec.id,
      items: [
        { label: 'Pre-Fetch Resource', value: `${rec.recommendedQuantity}x ${rec.recommendedItem}`, highlight: true },
        { label: 'Window', value: `< ${rec.preFetchWindowHours} Hours`, icon: 'box' },
        { label: 'Confidence', value: `${rec.confidenceScore}% AI Match`, icon: 'icu' },
      ],
      clinicalJustification: `Proactive deployment prior to predicted bottleneck. ${rec.clinicalDriver}`,
    })
    setApprovalModalOpen(true)
  }

  // Tier 1 Action: Super Admin releases district healthcare grant
  const handleOpenDistrictGrantModal = (district: DistrictBudgetRecord) => {
    const grantAmountCr = district.status === 'CRITICAL_SURGE' ? 1.5 : 0.8
    const projReserve = Math.round((contingencyReserveCr - grantAmountCr) * 100) / 100

    setActiveRequisition({
      id: `REQ-JH-${Math.floor(1000 + Math.random() * 9000)}`,
      title: `Emergency District Healthcare Grant Allocation`,
      tier: 'STATE_GRANT',
      source: 'Jharkhand State Health Directorate (Contingency Reserve)',
      destination: `${district.districtName} District Healthcare Pool`,
      urgency: district.status === 'CRITICAL_SURGE' ? 'Critical P1' : 'High P2',
      grantAmountCr: grantAmountCr,
      currentReserveCr: contingencyReserveCr,
      projectedReserveCr: projReserve,
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
      const grantAmount = req.grantAmountCr || (req.urgency === 'Critical P1' ? 1.5 : 0.8)
      setContingencyReserveCr((prev) => Math.max(0, Math.round((prev - grantAmount) * 100) / 100))
      setDisbursedBudgetCr((prev) => Math.round((prev + grantAmount) * 100) / 100)
      setDistrictRecords((prev) =>
        prev.map((d) => {
          if (req.destination.includes(d.districtName)) {
            const nextReleased = Math.round((d.releasedBudgetCr + grantAmount) * 100) / 100
            const nextTotal = Math.max(d.totalBudgetCr, nextReleased)
            return {
              ...d,
              totalBudgetCr: nextTotal,
              releasedBudgetCr: nextReleased,
              capacityLoadPct: Math.max(50, d.capacityLoadPct - 14),
              status: 'NOMINAL',
              pendingRequisitions: Math.max(0, d.pendingRequisitions - 1),
            }
          }
          return d
        })
      )
      const toast = `[STATE CLEARANCE] Requisition ${req.id} authorized. ₹${grantAmount.toFixed(2)} Cr released to ${req.destination}. Remaining contingency pool: ₹${Math.max(0, Math.round((contingencyReserveCr - grantAmount) * 100) / 100).toFixed(2)} Cr.`
      setLastEventToast(toast)
      setAuditLogs((prev) => [
        { id: `AUD-${Math.floor(100 + Math.random() * 900)}`, time: nowStr, text: toast, tier: 'State Directorate' },
        ...prev,
      ])
    } else if (req.tier === 'DISTRICT_TRANSFER') {
      // Remove authorized proposal from predictive recommendations
      if (req.sourceRecId) {
        setPredictiveRecs((prev) => prev.filter((r) => r.id !== req.sourceRecId))
      } else if (req.id.startsWith('REQ-PREFETCH-')) {
        setPredictiveRecs((prev) =>
          prev.filter((r) => !req.destination.includes(r.targetFacilityName))
        )
      }
      if (onRunAiSupplyDispatch) {
        onRunAiSupplyDispatch()
      }
      const toast = `[PRE-FETCH DISPATCHED] Requisition ${req.id} executed. Supplies authorized and dispatched to ${req.destination}. Capacity relief: -${req.reliefPct || 12}%.`
      setLastEventToast(toast)
      setAuditLogs((prev) => [
        { id: `AUD-${Math.floor(100 + Math.random() * 900)}`, time: nowStr, text: toast, tier: 'District CMO' },
        ...prev,
      ])
    } else if (req.tier === 'DEPARTMENT_ALLOCATION') {
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
      {/* QUICK APPROVAL PILL MODAL (Portaled to document.body with full-screen blur) */}
      <SupplyApprovalPillModal
        isOpen={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false)
          setActiveRequisition(null)
        }}
        requisition={activeRequisition}
        onConfirm={handleConfirmRequisition}
      />

      {/* DISTRICT BASIC OVERVIEW MODAL (Portaled to document.body) */}
      <DistrictOverviewModal
        isOpen={!!inspectDistrict}
        onClose={() => setInspectDistrict(null)}
        district={inspectDistrict}
        onReleaseGrant={handleOpenDistrictGrantModal}
        hospitals={hospitals}
      />

      {/* HOSPITAL BASIC OVERVIEW MODAL (Portaled to document.body) */}
      <HospitalOverviewModal
        isOpen={!!inspectHospital}
        onClose={() => setInspectHospital(null)}
        hospital={inspectHospital}
        onAuthorizeReallocation={handleOpenInterHospitalTransferModal}
      />

      {/* FRONTLINE LOG SHORTAGE MODAL (Portaled to document.body) */}
      <LogShortageModal
        isOpen={logShortageModalOpen}
        onClose={() => setLogShortageModalOpen(false)}
        facilityName={activeHospital.name}
        facilityId={activeHospital.id}
        district={userDistrict}
        officerName={user?.name || 'Logistics Officer'}
        officerRole={user?.roleTitle || 'Clinical Triage Officer'}
        onSubmitShortage={handleLogShortageSubmit}
      />

      {/* STATUTORY TREASURY INFLOW SOURCES MODAL */}
      <AnimatePresence>
        {inflowModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-2xl rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                    <Landmark className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#382416] flex items-center gap-2">
                      State Health Budget & Statutory Inflow Streams
                    </h3>
                    <p className="text-xs text-stone-500">
                      State Health Infrastructure Directorate (Modeled for Jharkhand) · Escrow Tranche Telemetry
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInflowModalOpen(false)}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Pool Overview Bar */}
              <div className="grid grid-cols-3 gap-3 rounded-xl border border-orange-200 bg-orange-50/60 p-3.5 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-stone-500 uppercase block font-semibold">Total Fiscal Pool</span>
                  <span className="text-base font-extrabold text-[#382416]">₹{totalFiscalPoolCr.toFixed(2)} Cr</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-500 uppercase block font-semibold">Disbursed To Date</span>
                  <span className="text-base font-extrabold text-stone-700">₹{disbursedBudgetCr.toFixed(2)} Cr</span>
                </div>
                <div>
                  <span className="text-[10px] text-orange-800 uppercase block font-semibold">Remaining Contingency</span>
                  <span className="text-base font-extrabold text-orange-700">₹{contingencyReserveCr.toFixed(2)} Cr</span>
                </div>
              </div>

              {/* Inflow Streams Explanations & Tranche Triggers */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">
                    Statutory Revenue & Central Fund Inflow Channels
                  </span>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    3 Active Channels
                  </span>
                </div>

                {/* Channel 1: National Health Mission (NHM) */}
                <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-2 hover:border-indigo-300 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#382416]">1. National Health Mission (NHM) Flexible Tranche</span>
                        <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded">
                          Central Grant (60:40)
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Ministry of Health &amp; Family Welfare (MoHFW) quarterly programmatic release for 24 high-burden aspirational districts. Funds hospital surge beds, oxygen infrastructure &amp; maternal critical care.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInjectSpecificInflow('National Health Mission Tranche', 2.0, 'MoHFW-JH-NHM-2026')}
                      className="rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 text-xs font-bold shadow-2xs cursor-pointer transition-colors shrink-0 flex items-center gap-1"
                    >
                      <PlusCircle className="size-3.5" />
                      <span>Credit NHM Tranche (+₹2.00 Cr)</span>
                    </button>
                  </div>
                </div>

                {/* Channel 2: Ayushman Bharat PM-JAY Tertiary Hospital Claims */}
                <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-2 hover:border-emerald-300 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#382416]">2. Ayushman Bharat PM-JAY Claims Recovery</span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                          NHA Escrow Settlement
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        National Health Authority (NHA) &amp; State Health Agency (SHA) adjudicated claims. Critical care procedures performed at RIMS, MGM, and SNMMCH reimburse care costs into the state emergency pool.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInjectSpecificInflow('Ayushman Bharat PM-JAY Recoveries', 1.5, 'NHA-SHA-JH-PMJAY')}
                      className="rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 text-xs font-bold shadow-2xs cursor-pointer transition-colors shrink-0 flex items-center gap-1"
                    >
                      <PlusCircle className="size-3.5" />
                      <span>Credit Ayushman Escrow (+₹1.50 Cr)</span>
                    </button>
                  </div>
                </div>

                {/* Channel 3: GeM Bulk Tender Savings & Supplier Liquidated Damages */}
                <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4 space-y-2 hover:border-amber-300 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#382416]">3. GeM Bulk Procurement Rebates &amp; SLA Recoveries</span>
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                          GeM Master Rate Contracts
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        Jharkhand Medical Services Procurement Corp (JMSCL) 25%–34% pre-negotiated volume discount rebates and supplier SLA default liquidated damages returned to the contingency reserve.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleInjectSpecificInflow('GeM Volume Rebate & SLA Penalty', 0.8, 'GeM-JMSCL-SAVINGS-JH')}
                      className="rounded-lg bg-amber-600 hover:bg-amber-500 text-white px-3 py-1.5 text-xs font-bold shadow-2xs cursor-pointer transition-colors shrink-0 flex items-center gap-1"
                    >
                      <PlusCircle className="size-3.5" />
                      <span>Credit GeM Rebate (+₹0.80 Cr)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-stone-200 pt-3">
                <span className="text-[11px] text-stone-500 flex items-center gap-1">
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  All inflows audited under Jharkhand Public Financial Management System (JPFMS)
                </span>
                <button
                  type="button"
                  onClick={() => setInflowModalOpen(false)}
                  className="rounded-xl bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 text-xs font-bold cursor-pointer transition-colors"
                >
                  Close Telemetry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 1. SUPER ADMIN: NEW GeM BULK PROCUREMENT RATE CONTRACT MODAL */}
      <AnimatePresence>
        {newGeMModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#382416]">
                      Register New GeM Bulk Procurement Rate Contract
                    </h3>
                    <p className="text-xs text-stone-500">
                      Super Admin Authority · State Master Rate Contract Tender
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNewGeMModalOpen(false)}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const rateNum = parseFloat(gemContractRate.replace(/[^0-9.]/g, '')) || 8.4
                  const marketNum = parseFloat(gemMarketRate.replace(/[^0-9.]/g, '')) || 11.9
                  const savings = Math.max(10, Math.round(((marketNum - rateNum) / marketNum) * 100))
                  const newDeal: BulkProcurementDeal = {
                    id: `DEAL-GEM-${Math.floor(100 + Math.random() * 900)}`,
                    itemName: gemItemName,
                    specification: gemSpec,
                    contractRate: gemContractRate,
                    openMarketRate: gemMarketRate,
                    savingsPct: savings,
                    totalProcured: gemQuantity,
                    availableStock: gemQuantity,
                    unit: 'Units',
                    supplier: gemSupplier,
                  }
                  setBulkDeals((prev) => [newDeal, ...prev])
                  setNewGeMModalOpen(false)
                  const msg = `[GeM CONTRACT REGISTERED] Super Admin registered tender for ${gemQuantity}x ${gemItemName} via ${gemSupplier} (Tender: ${gemContractRate}).`
                  setLastEventToast(msg)
                  setAuditLogs((prev) => [
                    { id: `AUD-${Math.floor(100 + Math.random() * 900)}`, time: new Date().toLocaleTimeString(), text: msg, tier: 'State Directorate' },
                    ...prev,
                  ])
                }}
                className="space-y-3.5 text-xs font-mono"
              >
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Equipment / Medical Supply Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={gemItemName}
                    onChange={(e) => setGemItemName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Technical Specifications:
                  </label>
                  <input
                    type="text"
                    required
                    value={gemSpec}
                    onChange={(e) => setGemSpec(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      GeM Contract Rate:
                    </label>
                    <input
                      type="text"
                      required
                      value={gemContractRate}
                      onChange={(e) => setGemContractRate(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Open Market Rate:
                    </label>
                    <input
                      type="text"
                      required
                      value={gemMarketRate}
                      onChange={(e) => setGemMarketRate(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Total Batch Units:
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={gemQuantity}
                      onChange={(e) => setGemQuantity(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Authorized GeM Supplier:
                    </label>
                    <input
                      type="text"
                      required
                      value={gemSupplier}
                      onChange={(e) => setGemSupplier(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setNewGeMModalOpen(false)}
                    className="rounded-xl border border-stone-300 bg-white hover:bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#ea580c] hover:bg-[#d94e08] text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <PlusCircle className="size-3.5" />
                    <span>Authorize GeM Contract</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. DISTRICT CMO: EMERGENCY DISTRICT REQUISITION MODAL */}
      <AnimatePresence>
        {cmoRequisitionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                    <FileCheck2 className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#382416]">
                      Submit District Emergency Supply Requisition
                    </h3>
                    <p className="text-xs text-stone-500">
                      Chief Medical Officer ({userDistrict} District) · State Directorate Escalation
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCmoRequisitionModalOpen(false)}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const targetH = hospitals.find((h) => h.id === cmoTargetHospId) || hospitals[0]
                  setDistrictRecords((prev) =>
                    prev.map((d) =>
                      d.districtName.toLowerCase().includes(userDistrict.toLowerCase())
                        ? { ...d, pendingRequisitions: d.pendingRequisitions + 1, status: 'CRITICAL_SURGE' }
                        : d
                    )
                  )
                  setCmoRequisitionModalOpen(false)
                  const msg = `[CMO REQUISITION FILED] Requisition #REQ-JH-2026-${Math.floor(100 + Math.random() * 900)} submitted by CMO ${userDistrict} for ${cmoQuantity}x ${cmoResourceType} at ${targetH.name}.`
                  setLastEventToast(msg)
                  setAuditLogs((prev) => [
                    { id: `AUD-${Math.floor(100 + Math.random() * 900)}`, time: new Date().toLocaleTimeString(), text: msg, tier: 'District CMO' },
                    ...prev,
                  ])
                }}
                className="space-y-3.5 text-xs font-mono"
              >
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Target District Hospital:
                  </label>
                  <select
                    value={cmoTargetHospId}
                    onChange={(e) => setCmoTargetHospId(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-indigo-600 focus:outline-hidden"
                  >
                    {districtHospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} (Load: {Math.round(occupancyRatio(h.beds) * 100)}%)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Resource Category:
                    </label>
                    <select
                      value={cmoResourceType}
                      onChange={(e) => setCmoResourceType(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-indigo-600 focus:outline-hidden"
                    >
                      <option value="Intensive Care Ventilator Units">Intensive Care Ventilators</option>
                      <option value="Motorized Acute ICU Beds">Motorized Acute ICU Beds</option>
                      <option value="Liquid Oxygen Cryogenic Cylinders">Liquid O2 Cylinders (D-Type)</option>
                      <option value="Trauma Surgical Intervention Kits">Trauma Surgical Intervention Kits</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Requisition Quantity:
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="50"
                      value={cmoQuantity}
                      onChange={(e) => setCmoQuantity(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-indigo-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Triage Urgency Level:
                  </label>
                  <select
                    value={cmoPriority}
                    onChange={(e) => setCmoPriority(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-indigo-600 focus:outline-hidden"
                  >
                    <option value="P1_CRITICAL">P1 Critical (Immediate Release &lt; 4 Hours)</option>
                    <option value="P2_URGENT">P2 Urgent (&lt; 12 Hours Escalation)</option>
                    <option value="P3_ROUTINE">P3 Buffer Maintenance (&lt; 48 Hours)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Clinical Justification:
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={cmoJustification}
                    onChange={(e) => setCmoJustification(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-indigo-600 focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setCmoRequisitionModalOpen(false)}
                    className="rounded-xl border border-stone-300 bg-white hover:bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <FileCheck2 className="size-3.5" />
                    <span>Submit CMO Requisition</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. MEDICAL SUPERINTENDENT: ADD / RECONFIGURE WARD CARE BAYS MODAL */}
      <AnimatePresence>
        {wardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl text-stone-900 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                    <BedDouble className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#382416]">
                      Add / Reconfigure Hospital Care Ward Bay
                    </h3>
                    <p className="text-xs text-stone-500">
                      Medical Superintendent Authority · {activeHospital.name}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setWardModalOpen(false)}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const newDept: DepartmentAllocation = {
                    id: `dept-${Date.now()}`,
                    name: wardDeptName,
                    short: wardDeptName.split(' ').map((w) => w[0]).join('').substring(0, 4).toUpperCase(),
                    category: wardCategory,
                    allocatedBeds: wardBeds,
                    usedBeds: Math.round(wardBeds * 0.4),
                    allocatedVents: wardVents,
                    usedVents: Math.round(wardVents * 0.3),
                    allocatedBudgetLakhs: wardBudgetLakhs,
                    status: 'NOMINAL',
                  }
                  setDepartments((prev) => [newDept, ...prev])
                  setWardModalOpen(false)
                  const msg = `[WARD RECONFIGURED] Medical Superintendent registered ${wardDeptName} with ${wardBeds} beds and ${wardVents} ventilators at ${activeHospital.name}.`
                  setLastEventToast(msg)
                  setAuditLogs((prev) => [
                    { id: `AUD-${Math.floor(100 + Math.random() * 900)}`, time: new Date().toLocaleTimeString(), text: msg, tier: 'Facility Supt' },
                    ...prev,
                  ])
                }}
                className="space-y-3.5 text-xs font-mono"
              >
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Department / Ward Bay Name:
                  </label>
                  <input
                    type="text"
                    required
                    value={wardDeptName}
                    onChange={(e) => setWardDeptName(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-teal-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Clinical Category:
                    </label>
                    <select
                      value={wardCategory}
                      onChange={(e) => setWardCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-teal-600 focus:outline-hidden"
                    >
                      <option value="Critical Care">Critical Care / ICU</option>
                      <option value="Emergency">Emergency Trauma</option>
                      <option value="Inpatient">General Inpatient</option>
                      <option value="Pediatric">Pediatric / PICU</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Bed Capacity:
                    </label>
                    <input
                      type="number"
                      required
                      min="2"
                      value={wardBeds}
                      onChange={(e) => setWardBeds(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-teal-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Dedicated Ventilators:
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={wardVents}
                      onChange={(e) => setWardVents(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-teal-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Allocated Budget (₹ Lakhs):
                    </label>
                    <input
                      type="number"
                      required
                      min="5"
                      value={wardBudgetLakhs}
                      onChange={(e) => setWardBudgetLakhs(Number(e.target.value))}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-teal-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setWardModalOpen(false)}
                    className="rounded-xl border border-stone-300 bg-white hover:bg-stone-100 px-3.5 py-2 text-xs font-bold text-stone-700 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-700 hover:bg-teal-600 text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <BedDouble className="size-3.5" />
                    <span>Deploy Care Ward Bay</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
              <Boxes className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#382416]">
                {activeTier === 'STATE_HEALTH'
                  ? 'Statewide Healthcare Grants & Bulk Procurement Deals'
                  : activeTier === 'DISTRICT_CMO'
                  ? `District CMO Supply & Inter-Hospital Distribution (${userDistrict})`
                  : `Hospital Department & Ward Resource Allocation (${activeHospital.name})`}
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {activeTier === 'STATE_HEALTH'
                  ? 'State Health Directorate Command: Macro district budgets, surge strain reports, and master bulk rate deals.'
                  : activeTier === 'DISTRICT_CMO'
                  ? 'District Chief Medical Officer: Equitable resource balancing and equipment transfers across district facilities.'
                  : 'Medical Superintendent: Clinical department equipment, beds, and funds mobilization.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action to log shortage incident (Available to frontline officers and facility command) */}
          <button
            type="button"
            onClick={() => setLogShortageModalOpen(true)}
            className="rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-800 px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <AlertTriangle className="size-3.5 text-rose-600" />
            <span>Log Shortage Incident</span>
          </button>

          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping"></span>
            Live Telemetry Active
          </span>
        </div>
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
      {/* AI PREDICTIVE SHORTAGE & PROACTIVE PRE-FETCH INTELLIGENCE PANEL           */}
      {/* ========================================================================= */}
      <div className="rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-stone-50/50 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Sparkles className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#382416]">
                  AI Predictive Shortage Telemetry & Pre-Surge Fetch Engine
                </h3>
                <span className="text-[10px] font-bold text-indigo-800 bg-indigo-100 border border-indigo-300 px-2 py-0.5 rounded-full">
                  Just-In-Time Pipeline
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                AI software continuously correlates frontline nurse shortage incident reports with incoming 108 ambulance dispatches to recommend which inventory to pre-fetch <em>before</em> bottlenecks occur.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setLogShortageModalOpen(true)}
            className="rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <PlusCircle className="size-3.5" />
            <span>Log Local Shortage</span>
          </button>
        </div>

        {/* 2-Column Section: Active AI Pre-Fetch Recommendations & Recent Frontline Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Column 1: AI Proactive Pre-Fetch Recommendations */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <Bot className="size-3.5 text-indigo-600" />
                Active Pre-Fetch Recommendations
              </span>
              <span className="text-[11px] font-semibold text-indigo-700">
                {predictiveRecs.length} Actionable Proposals
              </span>
            </div>

            {predictiveRecs.length === 0 ? (
              <div className="p-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-2xs text-center space-y-3">
                <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto">
                  <CheckCircle2 className="size-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">All AI Pre-Fetch Proposals Executed</h4>
                  <p className="text-xs text-stone-600 mt-1 max-w-sm mx-auto">
                    Active surge inventory has been authorized and dispatched to facility emergency stores.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPredictiveRecs(INITIAL_PREDICTIVE_RECOMMENDATIONS)}
                  className="rounded-lg bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-3 py-1.5 text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <Sparkles className="size-3.5" />
                  <span>Synthesize Fresh Proposals</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {predictiveRecs.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl border border-indigo-200 bg-white shadow-2xs space-y-2 hover:border-indigo-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-sm text-[#382416] flex items-center gap-1.5">
                          <span>{rec.recommendedQuantity}x {rec.recommendedItem}</span>
                        </div>
                        <div className="text-[11px] text-stone-500">
                          Target: <strong>{rec.targetFacilityName}</strong> ({rec.department})
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
                          {rec.confidenceScore}% AI Match
                        </span>
                        <span className="text-[10px] font-bold text-orange-800 bg-orange-100 border border-orange-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Clock className="size-3" />
                          &lt; {rec.preFetchWindowHours}h
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100 leading-relaxed">
                      <span className="font-semibold text-stone-800">AI Deducement: </span>
                      {rec.clinicalDriver}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] text-stone-500">
                        Source: <strong>{rec.sourceFacilityOrStore}</strong>
                      </span>

                      <button
                        type="button"
                        onClick={() => handleAuthorizePreFetch(rec)}
                        className="rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 text-xs font-bold shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>Authorize Pre-Fetch</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Frontline Shortage Telemetry Log Feed (Bottom-up recordings) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 text-rose-600" />
                Frontline Clinician Shortage Incident Telemetry
              </span>
              <span className="text-[11px] font-semibold text-stone-500">
                {shortageReports.length} Records Logged
              </span>
            </div>

            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {shortageReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-xl border border-stone-200 bg-white shadow-2xs space-y-2 text-xs text-stone-700 hover:border-stone-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-stone-600 bg-stone-100 border border-stone-200 px-1.5 py-0.5 rounded">
                        {report.id}
                      </span>
                      <span className="font-bold text-stone-900">{report.facilityName}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                        -{report.quantityDeficit} {report.resourceType}
                      </span>
                      <span className="font-mono text-[10px] text-stone-400">{report.timestamp}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-stone-600">
                    <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md font-medium">
                      Dept: {report.department}
                    </span>
                    <span className="bg-stone-50 border border-stone-200 px-2 py-0.5 rounded-md font-medium">
                      Impact: {report.patientImpactCount} Queued Patients
                    </span>
                  </div>

                  <p className="text-stone-700 text-xs italic bg-stone-50/80 p-2.5 rounded-lg border border-stone-200/60 leading-relaxed">
                    &quot;{report.clinicalNotes}&quot;
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-100">
                    <span>
                      Reported by: <strong className="text-stone-700">{report.reportingOfficerName}</strong> ({report.reportingOfficerRole})
                    </span>
                    <span className="font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[10px]">
                      [ANALYZED BY AI]
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TIER 1: STATE HEALTH DIRECTORATE (SUPER ADMIN ONLY)                      */}
      {/* ========================================================================= */}
      {activeTier === 'STATE_HEALTH' && (
        <div className="space-y-6">
          {/* Statewide Macro Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Available Unallocated Contingency Pool */}
            <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-[#ea580c] to-[#c2410c] p-5 text-white shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-orange-100 flex items-center gap-1.5">
                  <Landmark className="size-3.5" />
                  State Health Budget
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setInflowModalOpen(true)}
                    title="Inspect statutory funding sources & breakdown"
                    className="px-2 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-[10px] font-bold text-white flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Info className="size-3" />
                    <span>Inflow Sources</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleReplenishBudget}
                    title="Refetch and replenish funds from Ayushman recoveries & GeM savings"
                    className="px-2 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-[10px] font-bold text-white flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="size-3" />
                    <span>+₹2.50 Cr</span>
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">₹{contingencyReserveCr.toFixed(2)} Cr</span>
                <span className="text-xs font-medium text-orange-100">Remaining Contingency</span>
              </div>
              <p className="mt-2 text-xs text-orange-100/90 flex items-center justify-between">
                <span>₹{disbursedBudgetCr.toFixed(2)} Cr Disbursed</span>
                <span>Pool: ₹{totalFiscalPoolCr.toFixed(2)} Cr</span>
              </p>
              {/* Dynamic utilization progress meter */}
              <div className="mt-2.5 h-1.5 w-full rounded-full bg-black/20 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (disbursedBudgetCr / totalFiscalPoolCr) * 100)}%` }}
                />
              </div>
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
                Ranchi & Dhanbad reporting acute surge admissions
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
                  Super Admin high-level oversight: Inspect basic district summaries and disburse state emergency grants.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInflowModalOpen(true)}
                  className="rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 px-3 py-1 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Info className="size-3 text-indigo-600" />
                  <span>Funding Sources</span>
                </button>
                <button
                  type="button"
                  onClick={handleReplenishBudget}
                  className="rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <RefreshCw className="size-3 text-emerald-600" />
                  <span>Refetch Inflow (+₹2.50 Cr)</span>
                </button>
                <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                  Jharkhand Health Directorate (24 Districts)
                </span>
              </div>
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
                          {/* INSPECT BUTTON: Shows basic district overview modal without switching tiers */}
                          <button
                            type="button"
                            onClick={() => setInspectDistrict(dist)}
                            className="rounded-lg border border-stone-300 bg-white hover:bg-stone-100 px-3 py-1 text-[11px] font-semibold text-stone-700 transition-colors cursor-pointer"
                          >
                            Inspect Overview
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setNewGeMModalOpen(true)}
                  className="rounded-xl bg-[#ea580c] hover:bg-[#d94e08] text-white px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="size-3.5" />
                  <span>Register GeM Contract Deal</span>
                </button>
                <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                  State Rate Contracts Active
                </span>
              </div>
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
                      onClick={() => handleProcureDeal(deal)}
                      className="text-xs font-bold text-[#ea580c] hover:underline cursor-pointer flex items-center gap-1 bg-orange-50 border border-orange-200 hover:bg-orange-100 px-2.5 py-1 rounded-lg transition-colors shadow-2xs"
                    >
                      <PlusCircle className="size-3.5" />
                      <span>Procure Batch</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TIER 2: DISTRICT CMO COMMAND (DISTRICT CMO ONLY)                         */}
      {/* ========================================================================= */}
      {activeTier === 'DISTRICT_CMO' && (
        <div className="space-y-6">
          {/* District Header */}
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
                    {userDistrict} District
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-0.5">
                  Ensure equitable healthcare share distribution across all district facilities. Relieve strained public hospitals by authorizing transfers from surplus facilities.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCmoRequisitionModalOpen(true)}
              className="rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white px-3.5 py-2 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors self-start sm:self-auto"
            >
              <FileCheck2 className="size-3.5" />
              <span>Submit District Emergency Requisition</span>
            </button>
          </div>

          {/* District Fiscal Pool Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
                District Budget Received
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-[#382416]">
                  ₹{districtRecords.find((d) => d.districtName.toLowerCase().includes(userDistrict.toLowerCase()))?.releasedBudgetCr.toFixed(2) || '5.10'} Cr
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
                        {/* INSPECT BUTTON: Shows basic hospital overview modal without switching tiers */}
                        <button
                          type="button"
                          onClick={() => setInspectHospital(hosp)}
                          className="rounded-xl border border-stone-300 bg-white hover:bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700 transition-colors cursor-pointer"
                        >
                          Inspect Overview
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
                        All {districtHospitals.length} hospitals in {userDistrict} are operating below 70% load.
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
                  District Hospital Resource Inventory Matrix ({userDistrict})
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
                        <span className="text-[11px] text-stone-500">{h.district || userDistrict}</span>
                      </div>
                      <div className="flex items-center gap-2">
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
                        <button
                          type="button"
                          onClick={() => setInspectHospital(h)}
                          className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 underline cursor-pointer"
                        >
                          Details
                        </button>
                      </div>
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
      {/* TIER 3: FACILITY COMMAND (HOSPITAL IN-CHARGE ONLY)                       */}
      {/* ========================================================================= */}
      {activeTier === 'HOSPITAL_DEPT' && (
        <div className="space-y-6">
          {/* Hospital Header */}
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

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWardModalOpen(true)}
                  className="rounded-xl bg-teal-700 hover:bg-teal-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <PlusCircle className="size-3.5" />
                  <span>Add / Reconfigure Ward Bay</span>
                </button>
                <span className="text-xs font-semibold text-teal-800 bg-teal-100 px-3 py-1 rounded-full border border-teal-300">
                  Facility Total: ₹2.40 Cr Disbursed
                </span>
              </div>
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
