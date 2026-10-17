'use client'

import { cn } from '@/lib/utils'
import {
  HOSPITAL_IDS,
  type Hospital,
  type Patient,
  type ReferralRecommendation,
  type ScenarioKey,
  type TriageState,
  type DischargeResult,
  advanceTime,
  buildScenario,
  executeRegionalReferral,
  getRegionalReferralRecommendation,
  processNewArrival,
  runContinuousSimulationStep,
  runAiSupplyDispatch,
  severityStatus,
  triggerBedRelease,
} from '@/lib/triage-data'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  getHospitalsForDistrict,
  convertFacilityToHospital,
  generateInterconnectivityEdges,
  JHARKHAND_24_DISTRICTS,
  JHARKHAND_79_HOSPITALS,
} from '@/lib/jharkhand-data'
import { CapacityView } from './capacity-view'
import { RegionalNetworkView } from './regional-network-view'
import { Sidebar, type ViewKey, ROLE_ALLOWED_VIEWS, ROLE_CONFIGS } from './sidebar'
import { useAuth, UserRole } from '@/lib/auth-context'
import { TopBar } from './top-bar'
import { TriageQueueView } from './triage-queue-view'
import { PatientsView } from './patients-view'
import { AiCdsView } from './aicds-view'
import { DoctorsView } from './doctors-view'
import { ClinicalView } from './clinical-view'
import { BillingView } from './billing-view'
import { DocsView } from './docs-view'
import { SuppliesView } from './supplies-view'
import { ReportsView } from './reports-view'
import { CommsView } from './comms-view'
import { Siren, Wifi, WifiOff, Server, UserCheck, CheckCircle2, Activity, ArrowRight, BedDouble, Radio, Clock } from 'lucide-react'
import { ApiClient, type HospitalApiData, type StateOverviewData } from '@/lib/api-client'
import { StaffApprovalModal } from '@/components/staff-approval-modal'
import { directorBridge, type DirectorEvent } from '@/lib/director-bridge'

const VIEW_ALIASES: Record<string, ViewKey> = {
  capacity: 'capacity',
  dashboard: 'capacity',
  matrix: 'capacity',
  triage: 'queue',
  queue: 'queue',
  'triage-queue': 'queue',
  regional: 'network',
  network: 'network',
  'regional-network': 'network',
  map: 'network',
  patients: 'patients',
  patient: 'patients',
  census: 'patients',
  'ai-cds': 'aicds',
  aicds: 'aicds',
  cds: 'aicds',
  doctors: 'doctors',
  doctor: 'doctors',
  roster: 'doctors',
  clinical: 'clinical',
  ops: 'clinical',
  billing: 'billing',
  ayushman: 'billing',
  escrow: 'billing',
  docs: 'docs',
  ehr: 'docs',
  records: 'docs',
  supplies: 'supplies',
  oxygen: 'supplies',
  inventory: 'supplies',
  reports: 'reports',
  audit: 'reports',
  analytics: 'reports',
  comms: 'comms',
  relay: 'comms',
}

// ---------------------------------------------------------------------------
// Data Source Mode: 'live' = Spring Boot API, 'simulated' = in-memory engine
// ---------------------------------------------------------------------------
type DataSourceMode = 'live' | 'simulated'

/**
 * Converts backend HospitalApiData to frontend Hospital shape.
 * Maintains compatibility with the existing TriageState interface
 * so all downstream components work without modification.
 */
function mapApiHospitalToLocal(h: HospitalApiData, idx: number, total: number): Hospital {
  // Determine real geographic coordinates
  const matchedFacility = JHARKHAND_79_HOSPITALS.find(
    (f) =>
      f.id === h.id ||
      (h.shortCode && f.shortCode.toLowerCase() === h.shortCode.toLowerCase()) ||
      f.name.toLowerCase() === h.name.toLowerCase() ||
      h.name.toLowerCase().includes(f.name.toLowerCase()) ||
      f.name.toLowerCase().includes(h.name.toLowerCase())
  )

  const districtName = h.districtName || h.region || matchedFacility?.districtName || 'Ranchi'
  const matchedDistrict = JHARKHAND_24_DISTRICTS.find(
    (d) => d.name.toLowerCase().includes(districtName.toLowerCase()) || districtName.toLowerCase().includes(d.name.toLowerCase())
  )

  const lat = (h.lat && h.lat > 15) ? h.lat : (matchedFacility?.latitude ?? matchedDistrict?.lat ?? 23.3441)
  const lng = (h.lng && h.lng > 70) ? h.lng : (matchedFacility?.longitude ?? matchedDistrict?.lng ?? 85.3096)

  // Real GIS bounding box projection for 2D Canvas/SVG:
  // Jharkhand Lat bounds: 22.0 to 25.5 -> y from 90 to 10
  // Jharkhand Lng bounds: 83.3 to 88.0 -> x from 10 to 90
  const x = Math.min(92, Math.max(8, Math.round(((lng - 83.3) / 4.7) * 80 + 10)))
  const y = Math.min(92, Math.max(8, Math.round((1 - (lat - 22.0) / 3.5) * 80 + 10)))

  return {
    id: h.id,
    name: h.name,
    short: h.shortCode || matchedFacility?.shortCode || h.name.replace(/[^A-Z]/g, '').slice(0, 5) || h.name.slice(0, 8),
    district: districtName,
    lat,
    lng,
    x,
    y,
    beds: { used: h.usedBeds, total: h.totalBeds },
    icuBeds: {
      used: (h.totalIcuBeds ?? 10) - (h.availableIcuBeds ?? 2),
      total: h.totalIcuBeds ?? 10,
    },
    generalBeds: {
      used: (h.totalGeneralBeds ?? h.totalBeds) - (h.availableGeneralBeds ?? (h.totalBeds - h.usedBeds)),
      total: h.totalGeneralBeds ?? h.totalBeds,
    },
    ventilators: { used: h.usedVentilators, total: h.totalVentilators },
    specialists: { used: h.usedSpecialists, total: h.totalSpecialists },
    specialistRoster: {
      pulmonologists: { total: 2, available: Math.max(0, 2 - Math.floor(h.usedSpecialists * 0.3)) },
      cardiologists: { total: 2, available: Math.max(0, 2 - Math.floor(h.usedSpecialists * 0.2)) },
      traumaSurgeons: { total: 2, available: h.hasTraumaSurgery ? 1 : 0 },
      generalPhysicians: { total: 4, available: Math.max(0, 4 - Math.floor(h.usedSpecialists * 0.3)) },
    },
  }
}

/**
 * Hook that attempts to fetch live data from the Spring Boot backend.
 * Returns the data source mode and loading state. Non-blocking — if the
 * backend is unreachable, silently falls back to simulation mode.
 */
function useBackendConnection(): {
  mode: DataSourceMode
  isChecking: boolean
  stateOverview: StateOverviewData | null
  liveHospitals: Hospital[]
  retryConnection: () => void
} {
  const [mode, setMode] = useState<DataSourceMode>('simulated')
  const [isChecking, setIsChecking] = useState(true)
  const [stateOverview, setStateOverview] = useState<StateOverviewData | null>(null)
  const [liveHospitals, setLiveHospitals] = useState<Hospital[]>([])
  const retryRef = useRef(0)

  const checkConnection = useCallback(async () => {
    setIsChecking(true)
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 4000)

      const [overview, apiHospitals] = await Promise.all([
        ApiClient.getStateOverview(),
        ApiClient.getHospitals(),
      ])

      clearTimeout(timeout)

      const mapped = apiHospitals.map((h, i) => mapApiHospitalToLocal(h, i, apiHospitals.length))
      setStateOverview(overview)
      setLiveHospitals(mapped)
      setMode('live')
    } catch {
      // Backend unreachable — fall back silently to simulation
      setMode('simulated')
      setStateOverview(null)
      setLiveHospitals([])
    } finally {
      setIsChecking(false)
    }
  }, [])

  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  const retryConnection = useCallback(() => {
    retryRef.current += 1
    checkConnection()
  }, [checkConnection])

  return { mode, isChecking, stateOverview, liveHospitals, retryConnection }
}

const VIEW_TITLES: Record<string, string> = {
  capacity: 'Dashboard & Analytics',
  patients: 'Patient Directory & Clinical ML Scorer',
  queue: 'Triage Priority Heap Queue',
  network: 'Regional Network & Dijkstra Overflow',
  aicds: 'AI Clinical Decision Support (CDS)',
  doctors: 'Doctor & Specialist Availability',
  clinical: 'Clinical Operations & Bed Management',
  billing: 'Billing & Financial Revenue Triage',
  docs: 'Medical Records & EHR Documents',
  supplies: 'Inventory & Supplies',
  reports: 'Reports & Risk Telemetry Analytics',
  comms: 'Regional Emergency Communications',
}

function buildDistrictState(districtName: string, scenarioKey: ScenarioKey = 'steady'): TriageState {
  const facilities = getHospitalsForDistrict(districtName)
  const hospitals: Hospital[] = facilities.map((f, i) => convertFacilityToHospital(f, i, facilities.length))
  const edges = generateInterconnectivityEdges(hospitals)

  // Generate realistic clinical patients for the hospitals in this district
  const patients: Patient[] = []
  const factors = [
    'Low SpO₂ (82%) · Acute Hypoxia',
    'Tachycardia (136 bpm) · STEMI',
    'Hypotension (84/52) · Septic Shock',
    'High Fever (39.6°C) · Sepsis Alert',
    'Acute Respiratory Distress',
    'Trauma Laceration / Fracture',
    'Severe Abdominal Pain',
    'Head Injury / Altered Sensorium'
  ]
  const names = [
    'Ramesh Soren', 'Sunita Murmu', 'Babloo Munda', 'Anita Kumari', 'Deepak Mahto',
    'Pooja Devi', 'Manoj Oraon', 'Priyanka Singh', 'Vikram Hembrom', 'Anand Kumar',
    'Meena Gope', 'Sanjay Tirkey', 'Sunil Roy', 'Neha Choudhary', 'Rohit Bedia'
  ]

  let pCounter = 101
  hospitals.forEach((h, hIdx) => {
    const numPatients = scenarioKey === 'mass-casualty' && hIdx === 0 ? 8 : (scenarioKey === 'regional-surge' ? 5 : 3)
    for (let i = 0; i < numPatients; i++) {
      const severity = scenarioKey === 'mass-casualty' && hIdx === 0 && i < 3 
        ? Math.floor(84 + Math.random() * 14) 
        : Math.floor(35 + Math.random() * 55)
      const name = names[(pCounter + i) % names.length]
      const topFactor = factors[(pCounter + i) % factors.length]
      const bedType = severity >= 80 ? 'ICU' : 'General'
      const status = i < (bedType === 'ICU' ? 2 : 3) ? 'Assigned' : 'Waiting'

      patients.push({
        id: `P-${pCounter++}`,
        name,
        hospitalId: h.id,
        severity,
        waitMinutes: Math.floor(4 + Math.random() * 28),
        topFactor,
        status,
        bedType: status === 'Assigned' ? bedType : 'None',
        estRecoveryMinutes: Math.floor(18 + Math.random() * 45),
        stepDownCountdown: 15
      })
    }
  })

  return {
    hospitals,
    patients,
    transfers: [],
    edges,
  }
}

export function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard')
    }
  }, [mounted, isLoading, isAuthenticated, router])

  const currentRole: UserRole = user?.role || 'SUPER_ADMIN'
  const allowedViews = ROLE_ALLOWED_VIEWS[currentRole] || ROLE_ALLOWED_VIEWS.SUPER_ADMIN
  const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.SUPER_ADMIN

  // Live backend connection probe
  const { mode: dataSourceMode, isChecking: isCheckingBackend, stateOverview, liveHospitals, retryConnection } = useBackendConnection()

  const initialDistrict = user?.districtName || 'Ranchi'
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialDistrict)
  const [view, setView] = useState<ViewKey>(allowedViews[0] || 'capacity')
  const [scenario, setScenario] = useState<ScenarioKey>('steady')
  const [state, setState] = useState<TriageState>(() => buildDistrictState(initialDistrict, 'steady'))
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(() => state.hospitals[0]?.id || 'jh-rims-ranchi')
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const [lastEventMessage, setLastEventMessage] = useState<string | null>(null)

  // Remote director override refs (bypasses persona locks when controlled via /control)
  const directorDistrictOverrideRef = useRef(false)
  const directorViewOverrideRef = useRef(false)

  // Live operational banners for discharges and emergency clinical arrivals
  const [latestDischargeEvent, setLatestDischargeEvent] = useState<DischargeResult | null>(null)
  const [latestArrivalEvent, setLatestArrivalEvent] = useState<{
    id: string
    patientName: string
    severity: number
    hospitalName: string
    details: string
    waitMinutes: number
    assignedWaitMinutes?: number
    status: string
  } | null>(null)

  // Auto-lock district for DISTRICT_CMO or HOSPITAL_ADMIN (bypassed if director remotely overrides)
  useEffect(() => {
    if (directorDistrictOverrideRef.current) return
    if (user?.districtName && (user.role === 'DISTRICT_CMO' || user.role === 'HOSPITAL_ADMIN')) {
      if (selectedDistrict !== user.districtName) {
        setSelectedDistrict(user.districtName)
        const nextState = buildDistrictState(user.districtName, scenario)
        setState(nextState)
        if (nextState.hospitals.length > 0) {
          setSelectedHospitalId(nextState.hospitals[0].id)
        }
      }
    }
  }, [user?.districtName, user?.role, scenario, selectedDistrict])

  // When live backend becomes available, merge live hospital data into the state
  useEffect(() => {
    if (dataSourceMode === 'live' && liveHospitals.length > 0) {
      const isRestrictedRole = user?.role === 'DISTRICT_CMO' || user?.role === 'HOSPITAL_ADMIN'
      const targetDistrict = isRestrictedRole && user?.districtName ? user.districtName : selectedDistrict

      const filtered = targetDistrict !== 'ALL'
        ? liveHospitals.filter((h) =>
            (h.district && h.district.toLowerCase() === targetDistrict.toLowerCase()) ||
            h.name.toLowerCase().includes(targetDistrict.toLowerCase())
          )
        : liveHospitals

      const effectiveHospitals = filtered.length > 0 ? filtered : liveHospitals

      setState((prev) => ({
        ...prev,
        hospitals: effectiveHospitals,
      }))
      if (effectiveHospitals.length > 0 && !effectiveHospitals.find((h) => h.id === selectedHospitalId)) {
        setSelectedHospitalId(effectiveHospitals[0].id)
      }
    }
  }, [dataSourceMode, liveHospitals, selectedDistrict, user?.role, user?.districtName, selectedHospitalId])



  // Auto-redirect if current view is disallowed for the active role (bypassed if director overrides)
  useEffect(() => {
    if (directorViewOverrideRef.current) return
    if (!allowedViews.includes(view)) {
      setView(allowedViews[0])
    }
  }, [user, currentRole, allowedViews, view])

  // Dual-Control Hospital Staff Verification Queue
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false)
  const [pendingStaffCount, setPendingStaffCount] = useState<number>(0)

  const checkPendingStaff = useCallback(async () => {
    if (user && ['SUPER_ADMIN', 'DISTRICT_CMO', 'HOSPITAL_ADMIN'].includes(user.role)) {
      const hasBackendSession = typeof window !== 'undefined' ? localStorage.getItem('triagenet_session_active') === 'true' : false;
      if (!hasBackendSession) {
        setPendingStaffCount(2);
        return;
      }
      try {
        const pending = await ApiClient.getPendingStaff()
        setPendingStaffCount(pending?.length || 0)
      } catch {
        // Silently ignore if not authorized
      }
    }
  }, [user])

  useEffect(() => {
    checkPendingStaff()
    const interval = setInterval(checkPendingStaff, 25000)
    return () => clearInterval(interval)
  }, [checkPendingStaff])

  // Handle District Switch (supports force = true for remote Director override)
  const handleSelectDistrict = useCallback((newDistrict: string, force = false) => {
    // Prevent restricted roles from switching districts unless forced by remote Director
    if (!force && (user?.role === 'DISTRICT_CMO' || user?.role === 'HOSPITAL_ADMIN') && user?.districtName && newDistrict !== user.districtName) {
      return
    }

    if (force) {
      directorDistrictOverrideRef.current = true
    }

    setSelectedDistrict(newDistrict)
    const nextState = buildDistrictState(newDistrict, scenario)
    if (dataSourceMode === 'live' && liveHospitals.length > 0) {
      const filtered = newDistrict !== 'ALL'
        ? liveHospitals.filter((h) =>
            (h.district && h.district.toLowerCase() === newDistrict.toLowerCase()) ||
            h.name.toLowerCase().includes(newDistrict.toLowerCase())
          )
        : liveHospitals
      if (filtered.length > 0) {
        nextState.hospitals = filtered
      }
    }
    setState(nextState)
    if (nextState.hospitals.length > 0) {
      setSelectedHospitalId(nextState.hospitals[0].id)
    }
    setLastEventMessage(`Switched district view to ${newDistrict === 'ALL' ? 'Statewide Jharkhand (79 Facilities)' : `${newDistrict} District (${nextState.hospitals.length} Facilities)`}`)
    setTimeout(() => setLastEventMessage(null), 5000)
  }, [scenario, dataSourceMode, liveHospitals, user?.role, user?.districtName])

  const selectedHospital = useMemo(
    () => state.hospitals.find((h) => h.id === selectedHospitalId) ?? state.hospitals[0],
    [state.hospitals, selectedHospitalId],
  )

  const runScenario = useCallback((next: ScenarioKey) => {
    const built = buildDistrictState(selectedDistrict, next)
    setScenario(next)
    setState(built)
    setIsPlaying(false)
    setLastEventMessage(null)
    if (built.hospitals.length > 0) {
      setSelectedHospitalId(built.hospitals[0].id)
    }
    setUpdatedIds(new Set())
  }, [selectedDistrict])


  const simulateTime = useCallback((stepMinutes = 7) => {
    setState((prev) => {
      const nextPatients = advanceTime(prev.patients, stepMinutes)
      return { ...prev, patients: nextPatients }
    })
    setUpdatedIds(
      new Set(
        state.patients
          .filter((p) => p.hospitalId === selectedHospitalId && p.status !== 'Transferred')
          .map((p) => p.id),
      ),
    )
    window.setTimeout(() => setUpdatedIds(new Set()), 1200)
  }, [state.patients, selectedHospitalId])

  const handleAiSupplyDispatch = useCallback(() => {
    const { state: nextState, eventMsg } = runAiSupplyDispatch(state)
    setState(nextState)
    setLastEventMessage(eventMsg)
    setTimeout(() => setLastEventMessage(null), 8000)
  }, [state])

  const injectArrival = useCallback(
    (severity: number, name: string, complaint: string) => {
      // Collision-proof unique ID
      const newPtId = `P-${Date.now().toString().slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}`
      const initialWait = Math.floor(4 + Math.random() * 3)

      const newPt: Patient = {
        id: newPtId,
        name,
        hospitalId: selectedHospitalId,
        severity,
        waitMinutes: initialWait,
        topFactor: complaint,
        status: 'Waiting',
      }

      const { state: nextState, preemptedPatientName, arrivalStatus } = processNewArrival(state, newPt)
      setState(nextState)
      setUpdatedIds(new Set([newPt.id]))

      if (preemptedPatientName) {
        const msg = `🚨 Code Red Preemption: ${newPt.name} (Severity: ${severity}) assigned at ${selectedHospital.name}. Preempted ${preemptedPatientName} to step-down holding (Assigned in ${newPt.assignedWaitMinutes}m).`
        setLastEventMessage(msg)
        setLatestArrivalEvent({
          id: newPt.id,
          patientName: newPt.name,
          severity,
          hospitalName: selectedHospital.name,
          details: `Acuity ${severity}/100 · Preempted lower-acuity patient (${preemptedPatientName}) to step-down holding. Bed allocated at ${newPt.assignedWaitMinutes}m mark.`,
          waitMinutes: newPt.waitMinutes,
          assignedWaitMinutes: newPt.assignedWaitMinutes,
          status: 'Assigned',
        })
      } else if (arrivalStatus === 'assigned_overflow') {
        const msg = `🚨 Regional Transfer: ${newPt.name} (Severity: ${severity}) assigned to overflow facility with open ICU capacity.`
        setLastEventMessage(msg)
        setLatestArrivalEvent({
          id: newPt.id,
          patientName: newPt.name,
          severity,
          hospitalName: selectedHospital.name,
          details: `Acuity ${severity}/100 · Transferred to overflow facility. Initial intake wait: ${newPt.waitMinutes}m.`,
          waitMinutes: newPt.waitMinutes,
          assignedWaitMinutes: newPt.assignedWaitMinutes,
          status: 'Assigned',
        })
      } else {
        const msg = `🚨 Emergency Intake: ${newPt.name} (Severity: ${severity}) arrived at ${selectedHospital.name}. Triage wait: ${newPt.waitMinutes}m. Ranked #1 in queue heap.`
        setLastEventMessage(msg)
        setLatestArrivalEvent({
          id: newPt.id,
          patientName: newPt.name,
          severity,
          hospitalName: selectedHospital.name,
          details: `Acuity ${severity}/100 · Triage evaluation completed (${newPt.waitMinutes}m wait). Placed at Rank #1 awaiting bed assignment.`,
          waitMinutes: newPt.waitMinutes,
          status: 'Waiting',
        })
      }
      setTimeout(() => setLastEventMessage(null), 8000)
      setTimeout(() => setLatestArrivalEvent(null), 10000)
    },
    [state, selectedHospitalId, selectedHospital],
  )

  const handleBedRelease = useCallback(
    (reason: 'recovery' | 'family_ama', targetPatientId?: string) => {
      const result = triggerBedRelease(state, selectedHospitalId, reason, targetPatientId)
      setState(result.state)
      setLastEventMessage(result.message)
      setLatestDischargeEvent(result)
      setTimeout(() => setLastEventMessage(null), 8000)
      setTimeout(() => setLatestDischargeEvent(null), 10000)
    },
    [state, selectedHospitalId],
  )

  const referralRecommendation = useMemo(
    () => getRegionalReferralRecommendation(state),
    [state],
  )

  const handleExecuteReferral = useCallback(
    (referral: ReferralRecommendation) => {
      const { state: nextState, message } = executeRegionalReferral(state, referral)
      setState(nextState)
      setLastEventMessage(message)
      setTimeout(() => setLastEventMessage(null), 6000)
    },
    [state],
  )

  // Auto-play timer for continuous simulation
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setState((prev) => {
        const { state: nextState, eventMsg } = runContinuousSimulationStep(prev)
        setLastEventMessage(eventMsg)
        return nextState
      })
    }, 1600)
    return () => clearInterval(interval)
  }, [isPlaying])

  // Director Bridge: Remote Orchestration via /control (Cross-Tab BroadcastChannel)
  useEffect(() => {
    const unsubscribe = directorBridge.subscribe((ev: DirectorEvent) => {
      switch (ev.type) {
        case 'TRIGGER_SCENARIO':
          runScenario(ev.scenario)
          break
        case 'SET_PLAYING':
          setIsPlaying(ev.isPlaying)
          break
        case 'STEP_TIME':
          simulateTime(ev.minutes || 15)
          break
        case 'INJECT_PATIENT': {
          const ptMap: Record<string, { severity: number; name: string; complaint: string }> = {
            critical_trauma: { severity: 95, name: 'Rahul Verma', complaint: 'Severe Polytrauma (Chest & Pelvic Fracture)' },
            cardiac_arrest: { severity: 98, name: 'Anand Kumar', complaint: 'STEMI Acute Ventricular Fibrillation' },
            pediatric_respiratory: { severity: 88, name: 'Aarav Roy (Child 4y)', complaint: 'Acute Status Asthmaticus w/ Stridor' },
            sepsis_shock: { severity: 92, name: 'Pooja Kumari', complaint: 'Septic Shock w/ Refractory Hypotension' },
          }
          const pt = ptMap[ev.patientType] || ptMap.critical_trauma
          injectArrival(pt.severity, pt.name, pt.complaint)
          break
        }
        case 'TRIGGER_BED_RELEASE':
          handleBedRelease(ev.reason)
          break
        case 'RESET_SIMULATION':
          runScenario('steady')
          break
        case 'SET_VIEW': {
          if (ev.view) {
            const raw = ev.view.toLowerCase().trim()
            const targetView = VIEW_ALIASES[raw] || (ev.view as ViewKey)
            directorViewOverrideRef.current = true
            setView(targetView)
            setLastEventMessage(`Remote Director set display view to: ${VIEW_TITLES[targetView] || targetView}`)
            setTimeout(() => setLastEventMessage(null), 5000)
          }
          break
        }
        case 'SET_DISTRICT': {
          if (ev.district) {
            handleSelectDistrict(ev.district, true)
          }
          break
        }
        case 'TRIGGER_ACCIDENT_HOTSPOT': {
          directorViewOverrideRef.current = true
          setView('network')
          setLastEventMessage(`🚨 [AI BLACKSPOT SIMULATOR] Collision cluster at ${ev.name}! Req: ${ev.requiredSpecialistRole}. 108 ALS Dispatched.`)
          setTimeout(() => setLastEventMessage(null), 8000)
          break
        }
        case 'TOGGLE_GREEN_WAVE': {
          setLastEventMessage(ev.active ? '⚡ 108 GREEN WAVE PREEMPTION ENGAGED (Signals Synchronized to Green)' : 'Green Wave preemption released')
          setTimeout(() => setLastEventMessage(null), 5000)
          break
        }
        case 'TRAFFIC_SIGNAL_PREEMPTION_UPDATE': {
          if (ev.active) {
            setLastEventMessage(
              `🚦 [ITMS ROAD PREEMPTION] ${ev.ambulanceNumber} engaged Green Corridor! ${ev.signalsPreempted} Signals Overridden to Solid Green. VMS: "${ev.vmsAlert}". Delay Cleared: ${ev.trafficDelayClearedMin}m.`
            )
          } else {
            setLastEventMessage('🚦 [ITMS ROAD PREEMPTION] Highway corridor released to standard municipal traffic cycle.')
          }
          setTimeout(() => setLastEventMessage(null), 7000)
          break
        }
        case 'RETRY_BACKEND':
          retryConnection()
          break
        case 'PING':
          directorBridge.send({
            type: 'PONG',
            activeView: view,
            role: user?.role,
            dataSourceMode,
            hospitalCount: state.hospitals.length,
            scenario,
            isPlaying,
          })
          break
      }
    })
    return () => unsubscribe()
  }, [runScenario, simulateTime, injectArrival, handleBedRelease, setView, handleSelectDistrict, retryConnection, view, user?.role, dataSourceMode, state.hospitals.length, scenario, isPlaying])

  const hospitalPatients = useMemo(
    () => state.patients.filter((p) => p.hospitalId === selectedHospitalId),
    [state.patients, selectedHospitalId],
  )

  const criticalCount = useMemo(
    () =>
      state.patients.filter(
        (p) => p.status !== 'Transferred' && severityStatus(p.severity) === 'red',
      ).length,
    [state.patients],
  )

  if (!mounted || isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#181512] text-stone-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="size-10 rounded-full border-2 border-[#ea580c] border-t-transparent animate-spin" />
          <p className="text-xs font-mono font-semibold tracking-wider text-stone-400 uppercase">
            {!mounted || isLoading ? 'Initializing TriageNet Command Network...' : 'Redirecting to Clinical Staff Login...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-[#fdfbf7] via-[#f7f2ea]/80 to-[#ffffff] text-[#2c1b0e] font-sans">
      <Sidebar active={view} onChange={setView} criticalCount={criticalCount} />

      <div className="flex min-w-0 flex-1 flex-col relative z-20">
        <TopBar
          hospitals={state.hospitals}
          patients={state.patients}
          selectedHospitalId={selectedHospitalId}
          onSelectHospital={setSelectedHospitalId}
          selectedDistrict={selectedDistrict}
          onSelectDistrict={handleSelectDistrict}
          onNavigateView={(v) => setView(v as ViewKey)}
        />


        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-[#fdfbf7] via-[#f7f2ea]/70 to-[#ffffff] relative z-1">
          <div className="mx-auto max-w-7xl">
            {/* RBAC Role Context Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#382416]/15 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#382416] text-[#ffedd7] shrink-0">
                  <roleConfig.icon className="size-4 text-[#dc5000]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#382416] text-sm">{user?.name || 'Authorized Clinical Officer'}</span>
                    <span className={cn('font-mono text-[9px] font-bold px-2 py-0.5 rounded border uppercase', roleConfig.color)}>
                      [{roleConfig.badge}]
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {user?.roleTitle || 'System Super Admin'} · {user?.districtName || 'Statewide Command'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                {/* Admin Staff Verification Queue Trigger */}
                {user && ['SUPER_ADMIN', 'DISTRICT_CMO', 'HOSPITAL_ADMIN'].includes(user.role) && (
                  <button
                    onClick={() => setIsStaffModalOpen(true)}
                    className={cn(
                      'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold transition-all cursor-pointer',
                      pendingStaffCount > 0
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm animate-pulse'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    )}
                    title="Inspect pending clinician registration requests"
                  >
                    <UserCheck className="size-3" />
                    <span>STAFF QUEUE {pendingStaffCount > 0 ? `(${pendingStaffCount})` : ''}</span>
                  </button>
                )}

                <span className="bg-[#FAF6F0] px-2.5 py-1 rounded-lg border border-[#382416]/10 font-bold text-[#382416]">
                  ROLE PERMITTED VIEWS: {allowedViews.length} / 12
                </span>
              </div>
            </div>

            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-stone-400">
                  <span>TriageNet Command</span>
                  <span>/</span>
                  <span className="text-[#ea580c] font-bold">{selectedDistrict} District</span>
                </div>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#382416]">
                  {VIEW_TITLES[view] ?? 'Clinical Dashboard'}
                </h1>
              </div>

              {/* Active Emergency Status Alert (Triggered via remote Director Command) */}
              {scenario !== 'steady' && (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md animate-pulse">
                    <Siren className="size-4 animate-bounce text-white" />
                    <span>{scenario === 'mass-casualty' ? 'CRITICAL MASS CASUALTY PROTOCOL ACTIVE' : 'REGIONAL SURGE PROTOCOL ACTIVE'}</span>
                  </span>
                </div>
              )}
            </div>

            {/* Live Discharge Notification Banner */}
            {latestDischargeEvent && (
              <div className="mb-5 rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50 via-white to-emerald-50/70 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded uppercase">
                        BED FREED &amp; PATIENT DISCHARGED
                      </span>
                      <span className="text-xs font-bold text-emerald-950">
                        {latestDischargeEvent.dischargedName} discharged ({latestDischargeEvent.reason === 'recovery' ? 'Clinical Recovery' : 'Transfer/AMA'}) from {latestDischargeEvent.hospitalName}
                      </span>
                    </div>
                    {latestDischargeEvent.reassignedName ? (
                      <p className="text-xs text-stone-600 mt-1">
                        🎉 Freed bed immediately reallocated to waiting patient: <strong className="text-emerald-900">{latestDischargeEvent.reassignedName}</strong> (Queue wait: {latestDischargeEvent.reassignedWaitMinutes}m).
                      </p>
                    ) : (
                      <p className="text-xs text-stone-600 mt-1">
                        Bed successfully freed and restored to available facility capacity pool. 0 waiting patients.
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      directorViewOverrideRef.current = true
                      setView('queue')
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-xs font-bold text-emerald-800 shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>View Triage Queue</span>
                    <ArrowRight className="size-3.5 text-emerald-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLatestDischargeEvent(null)}
                    className="px-2.5 py-2 rounded-xl border border-stone-200 text-stone-400 hover:text-stone-600 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Live Clinical Arrival & Intake Banner */}
            {latestArrivalEvent && (
              <div className="mb-5 rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-50 via-white to-amber-50/70 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-[#ea580c] text-white shadow-xs shrink-0 animate-pulse">
                    <Activity className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded uppercase">
                        {latestArrivalEvent.status === 'Assigned' ? 'CODE RED PREEMPTION' : 'NEW EMERGENCY ARRIVAL'}
                      </span>
                      <span className="text-xs font-bold text-[#382416]">
                        {latestArrivalEvent.patientName} (Acuity: {latestArrivalEvent.severity}/100) arrived at {latestArrivalEvent.hospitalName}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 mt-1">
                      {latestArrivalEvent.details}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      directorViewOverrideRef.current = true
                      setView('queue')
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-orange-300 bg-white hover:bg-orange-50 text-xs font-bold text-[#ea580c] shadow-2xs transition-colors cursor-pointer"
                  >
                    <span>Inspect Triage Queue</span>
                    <ArrowRight className="size-3.5 text-orange-500" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLatestArrivalEvent(null)}
                    className="px-2.5 py-2 rounded-xl border border-stone-200 text-stone-400 hover:text-stone-600 text-xs font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {view === 'capacity' && (
              <CapacityView
                state={state}
                selectedHospitalId={selectedHospitalId}
                onSelectHospital={setSelectedHospitalId}
                onNavigateView={(v) => setView(v as ViewKey)}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((v) => !v)}
                onFastForward={simulateTime}
              />
            )}
            {view === 'queue' && (
              <TriageQueueView
                hospital={selectedHospital}
                patients={hospitalPatients}
                updatedIds={updatedIds}
                onSimulate={() => simulateTime(7)}
                onFastForward5x={() => simulateTime(35)}
                onInjectArrival={injectArrival}
                onTriggerBedRelease={handleBedRelease}
                referralRecommendation={referralRecommendation}
                onExecuteReferral={handleExecuteReferral}
                lastEventMessage={lastEventMessage}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((v) => !v)}
              />
            )}
            {view === 'network' && (
              <RegionalNetworkView
                state={state}
                selectedDistrict={selectedDistrict}
                onStateChange={setState}
                onInjectArrival={injectArrival}
              />
            )}


            {(view as string) === 'patients' && <PatientsView state={state} />}
            {(view as string) === 'aicds' && <AiCdsView state={state} />}
            {(view as string) === 'doctors' && <DoctorsView state={state} selectedHospitalId={selectedHospitalId} />}
            {(view as string) === 'clinical' && <ClinicalView state={state} onStateChange={setState} />}
            {(view as string) === 'billing' && <BillingView />}
            {(view as string) === 'docs' && <DocsView />}
            {(view as string) === 'supplies' && (
              <SuppliesView
                state={state}
                onStateChange={setState}
                onRunAiSupplyDispatch={handleAiSupplyDispatch}
              />
            )}
            {(view as string) === 'reports' && (
              <ReportsView
                state={state}
                onRunAiSupplyDispatch={handleAiSupplyDispatch}
              />
            )}
            {(view as string) === 'comms' && <CommsView />}
          </div>
        </main>
      </div>

      <StaffApprovalModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onApproved={checkPendingStaff}
      />
    </div>
  )
}
