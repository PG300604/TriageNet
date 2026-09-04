// ---------------------------------------------------------------------------
// TriageNet mock data + domain logic
// Structured as typed objects so it can be swapped for real API calls later.
// ---------------------------------------------------------------------------

export type ScenarioKey = 'steady' | 'mass-casualty' | 'regional-surge'

export type CapacityStatus = 'green' | 'amber' | 'red'

export type PatientStatus = 'Waiting' | 'Assigned' | 'Preempted' | 'Transferred' | 'Discharged'

export interface ResourcePool {
  used: number
  total: number
}

export interface SpecialistRoster {
  pulmonologists: { total: number; available: number }
  cardiologists: { total: number; available: number }
  traumaSurgeons: { total: number; available: number }
  generalPhysicians: { total: number; available: number }
}

export interface Hospital {
  id: string
  name: string
  short: string
  /** normalized map position, 0-100 on each axis */
  x: number
  y: number
  beds: ResourcePool
  icuBeds: ResourcePool
  generalBeds: ResourcePool
  ventilators: ResourcePool
  specialists: ResourcePool
  specialistRoster: SpecialistRoster
  district?: string
}

export interface Patient {
  id: string
  name: string
  hospitalId: string
  /** clinical acuity 0-100 */
  severity: number
  /** minutes since arrival while waiting in queue */
  waitMinutes: number
  /** locked queue wait duration (minutes) frozen upon bed assignment */
  assignedWaitMinutes?: number
  topFactor: string
  status: PatientStatus
  bedType?: 'ICU' | 'General' | 'None'
  estRecoveryMinutes?: number
  stepDownCountdown?: number
}

export interface Transfer {
  id: string
  patientId: string
  patientLabel: string
  fromId: string
  toId: string
  minutes: number
  algorithm: string
  active: boolean
}

export interface NetworkEdge {
  fromId: string
  toId: string
  minutes: number
}

export interface ReferralRecommendation {
  patientId: string
  patientName: string
  fromHospitalId: string
  fromHospitalName: string
  toHospitalId: string
  toHospitalName: string
  travelTimeMinutes: number
  matchReason: string
  reason: string
}

export const HOSPITAL_IDS = {
  city: 'hosp-1',
  stmary: 'hosp-2',
  riverside: 'hosp-3',
  north: 'hosp-4',
} as const

export const EDGES: NetworkEdge[] = [
  { fromId: HOSPITAL_IDS.city, toId: HOSPITAL_IDS.stmary, minutes: 12 },
  { fromId: HOSPITAL_IDS.city, toId: HOSPITAL_IDS.riverside, minutes: 14 },
  { fromId: HOSPITAL_IDS.city, toId: HOSPITAL_IDS.north, minutes: 22 },
  { fromId: HOSPITAL_IDS.stmary, toId: HOSPITAL_IDS.riverside, minutes: 8 },
  { fromId: HOSPITAL_IDS.riverside, toId: HOSPITAL_IDS.north, minutes: 10 },
]

function baseHospitals(): Hospital[] {
  return [
    {
      id: HOSPITAL_IDS.city,
      name: 'Rajendra Institute of Medical Sciences (RIMS), Ranchi',
      short: 'RIMS',
      x: 18,
      y: 28,
      beds: { used: 26, total: 30 },
      icuBeds: { used: 4, total: 4 },
      generalBeds: { used: 22, total: 26 },
      ventilators: { used: 4, total: 5 },
      specialists: { used: 5, total: 6 },
      specialistRoster: {
        pulmonologists: { total: 2, available: 1 },
        cardiologists: { total: 2, available: 0 },
        traumaSurgeons: { total: 2, available: 0 },
        generalPhysicians: { total: 6, available: 2 },
      },
    },
    {
      id: HOSPITAL_IDS.stmary,
      name: 'Sadar Hospital Ranchi',
      short: 'SHR',
      x: 78,
      y: 22,
      beds: { used: 14, total: 18 },
      icuBeds: { used: 3, total: 4 },
      generalBeds: { used: 11, total: 14 },
      ventilators: { used: 2, total: 4 },
      specialists: { used: 3, total: 4 },
      specialistRoster: {
        pulmonologists: { total: 1, available: 1 },
        cardiologists: { total: 1, available: 0 },
        traumaSurgeons: { total: 3, available: 1 },
        generalPhysicians: { total: 4, available: 2 },
      },
    },
    {
      id: HOSPITAL_IDS.riverside,
      name: 'MGM Medical College & Hospital, Jamshedpur',
      short: 'MGM',
      x: 52,
      y: 72,
      beds: { used: 12, total: 32 },
      icuBeds: { used: 2, total: 8 },
      generalBeds: { used: 10, total: 24 },
      ventilators: { used: 2, total: 6 },
      specialists: { used: 4, total: 8 },
      specialistRoster: {
        pulmonologists: { total: 2, available: 2 },
        cardiologists: { total: 3, available: 2 },
        traumaSurgeons: { total: 2, available: 1 },
        generalPhysicians: { total: 8, available: 5 },
      },
    },
    {
      id: HOSPITAL_IDS.north,
      name: 'SNMMCH Dhanbad',
      short: 'SNMMCH',
      x: 22,
      y: 78,
      beds: { used: 18, total: 20 },
      icuBeds: { used: 7, total: 8 },
      generalBeds: { used: 11, total: 12 },
      ventilators: { used: 6, total: 8 },
      specialists: { used: 4, total: 5 },
      specialistRoster: {
        pulmonologists: { total: 1, available: 0 },
        cardiologists: { total: 2, available: 1 },
        traumaSurgeons: { total: 2, available: 0 },
        generalPhysicians: { total: 5, available: 2 },
      },
    },
  ]
}


function basePatients(): Patient[] {
  return [
    // City General
    p('P-2041', 'Alan Whitfield', HOSPITAL_IDS.city, 88, 42, 'Low SpO₂ (86%)', 'Waiting', 'ICU', 45, 18),
    p('P-2044', 'Dana Cole', HOSPITAL_IDS.city, 72, 31, 'Chest pain', 'Waiting', 'General', 30, 0),
    p('P-2048', 'Marcus Reid', HOSPITAL_IDS.city, 54, 18, 'Elevated HR', 'Assigned', 'General', 25, 0, 18),
    p('P-2052', 'Priya Nadella', HOSPITAL_IDS.city, 41, 12, 'Laceration', 'Waiting', 'General', 20, 0),
    p('P-2055', 'Grace Lin', HOSPITAL_IDS.city, 63, 55, 'Fever + rigidity', 'Waiting', 'General', 35, 0),
    // St. Mary's
    p('P-3011', 'Owen Barrett', HOSPITAL_IDS.stmary, 81, 26, 'Severe bleeding', 'Waiting', 'ICU', 50, 22),
    p('P-3014', 'Helena Vos', HOSPITAL_IDS.stmary, 47, 39, 'Abdominal pain', 'Waiting', 'General', 15, 0),
    p('P-3018', 'Tomas Vega', HOSPITAL_IDS.stmary, 33, 9, 'Sprain', 'Assigned', 'General', 10, 0, 9),
    p('P-3021', 'Yuki Tanaka', HOSPITAL_IDS.stmary, 58, 21, 'Shortness of breath', 'Waiting', 'General', 28, 0),
    // Riverside Medical
    p('P-4007', 'Sofia Márquez', HOSPITAL_IDS.riverside, 76, 14, 'Head trauma', 'Waiting', 'General', 40, 12),
    p('P-4010', 'Ken Osei', HOSPITAL_IDS.riverside, 44, 33, 'Dehydration', 'Waiting', 'General', 15, 0),
    p('P-4013', 'Rita Sørensen', HOSPITAL_IDS.riverside, 29, 8, 'Migraine', 'Assigned', 'General', 10, 0, 8),
    p('P-4016', 'Leo Fontaine', HOSPITAL_IDS.riverside, 61, 47, 'Arrhythmia', 'Waiting', 'General', 32, 0),
    // North District
    p('P-5002', 'Amara Diallo', HOSPITAL_IDS.north, 84, 37, 'Low SpO₂ (88%)', 'Waiting', 'ICU', 48, 20),
    p('P-5005', 'Ivan Petrov', HOSPITAL_IDS.north, 69, 52, 'Elevated HR', 'Waiting', 'General', 30, 0),
    p('P-5008', 'Nina Kaur', HOSPITAL_IDS.north, 52, 19, 'Fracture', 'Assigned', 'General', 20, 0, 19),
    p('P-5011', 'Beatriz Alves', HOSPITAL_IDS.north, 38, 11, 'Allergic reaction', 'Waiting', 'General', 12, 0),
  ]
}

function baseTransfers(): Transfer[] {
  return [
    {
      id: 'T-214',
      patientId: 'P-2041',
      patientLabel: '#214',
      fromId: HOSPITAL_IDS.north,
      toId: HOSPITAL_IDS.riverside,
      minutes: 18,
      algorithm: 'Dijkstra',
      active: true,
    },
    {
      id: 'T-198',
      patientId: 'P-3011',
      patientLabel: '#198',
      fromId: HOSPITAL_IDS.stmary,
      toId: HOSPITAL_IDS.riverside,
      minutes: 8,
      algorithm: 'Dijkstra',
      active: true,
    },
  ]
}

function p(
  id: string,
  name: string,
  hospitalId: string,
  severity: number,
  waitMinutes: number,
  topFactor: string,
  status: PatientStatus,
  bedType: 'ICU' | 'General' = 'General',
  estRecoveryMinutes = 30,
  stepDownCountdown = 0,
  assignedWaitMinutes?: number,
): Patient {
  return { id, name, hospitalId, severity, waitMinutes, assignedWaitMinutes: assignedWaitMinutes ?? (status === 'Assigned' ? waitMinutes : undefined), topFactor, status, bedType, estRecoveryMinutes, stepDownCountdown }
}

// --- Scenario builder -------------------------------------------------------

export function buildScenario(scenario: ScenarioKey): TriageState {
  const hospitals = baseHospitals()
  const patients = basePatients()
  const transfers = baseTransfers()

  if (scenario === 'steady') {
    return { hospitals, patients, transfers }
  }

  if (scenario === 'mass-casualty') {
    const cg = hospitals.find((h) => h.id === HOSPITAL_IDS.city)!
    cg.beds.used = Math.min(cg.beds.total, cg.beds.used + 12)
    cg.ventilators.used = Math.min(cg.ventilators.total, cg.ventilators.used + 4)
    cg.specialists.used = Math.min(cg.specialists.total, cg.specialists.used + 3)

    for (const pt of patients) {
      if (pt.hospitalId === HOSPITAL_IDS.city) {
        pt.severity = Math.min(100, pt.severity + 14)
        pt.status = pt.status === 'Assigned' ? 'Assigned' : 'Waiting'
      }
    }

    patients.push(
      p('P-2101', 'John Doe (MCI)', HOSPITAL_IDS.city, 95, 6, 'Crush injury', 'Waiting', 'ICU', 60, 30),
      p('P-2102', 'Jane Doe (MCI)', HOSPITAL_IDS.city, 91, 4, 'Blast trauma', 'Waiting', 'ICU', 50, 25),
      p('P-2103', 'Unknown (MCI)', HOSPITAL_IDS.city, 87, 3, 'Airway compromise', 'Waiting', 'ICU', 40, 20),
      p('P-2104', 'Unknown (MCI)', HOSPITAL_IDS.city, 79, 2, 'Severe burns', 'Waiting', 'General', 35, 0),
    )

    transfers.push(
      {
        id: 'T-260',
        patientId: 'P-2103',
        patientLabel: '#260',
        fromId: HOSPITAL_IDS.city,
        toId: HOSPITAL_IDS.riverside,
        minutes: 12,
        algorithm: 'Dijkstra',
        active: true,
      },
      {
        id: 'T-261',
        patientId: 'P-2104',
        patientLabel: '#261',
        fromId: HOSPITAL_IDS.city,
        toId: HOSPITAL_IDS.north,
        minutes: 9,
        algorithm: 'Dijkstra',
        active: true,
      },
    )

    return { hospitals, patients, transfers }
  }

  for (const h of hospitals) {
    h.beds.used = Math.min(h.beds.total, Math.round(h.beds.used * 1.25) + 2)
    h.ventilators.used = Math.min(h.ventilators.total, h.ventilators.used + 2)
    h.specialists.used = Math.min(h.specialists.total, h.specialists.used + 1)
  }
  for (const pt of patients) {
    pt.severity = Math.min(100, pt.severity + 6)
    pt.waitMinutes += 8
  }
  transfers.push({
    id: 'T-233',
    patientId: 'P-5005',
    patientLabel: '#233',
    fromId: HOSPITAL_IDS.north,
    toId: HOSPITAL_IDS.city,
    minutes: 9,
    algorithm: 'Dijkstra',
    active: true,
  })

  return { hospitals, patients, transfers }
}

// --- Derived helpers --------------------------------------------------------

export function occupancyRatio(pool: ResourcePool): number {
  if (pool.total === 0) return 0
  return pool.used / pool.total
}

export function poolStatus(pool: ResourcePool): CapacityStatus {
  const r = occupancyRatio(pool)
  if (r > 0.9) return 'red'
  if (r >= 0.7) return 'amber'
  return 'green'
}

export function hospitalStatus(h: Hospital): CapacityStatus {
  const ratios = [
    occupancyRatio(h.beds),
    occupancyRatio(h.ventilators),
    occupancyRatio(h.specialists),
  ]
  const worst = Math.max(...ratios)
  if (worst > 0.9) return 'red'
  if (worst >= 0.7) return 'amber'
  return 'green'
}

export function severityStatus(severity: number): CapacityStatus {
  if (severity >= 80) return 'red'
  if (severity >= 50) return 'amber'
  return 'green'
}

export function effectivePriority(pt: Patient): number {
  return pt.severity + pt.waitMinutes * 0.45
}

export function sortByPriority(patients: Patient[]): Patient[] {
  return [...patients].sort((a, b) => effectivePriority(b) - effectivePriority(a))
}

export function getAverageWaitTillAssigned(patients: Patient[]): number {
  const assigned = patients.filter((p) => p.status === 'Assigned' || p.status === 'Discharged')
  if (assigned.length === 0) return 14
  const totalWait = assigned.reduce((acc, p) => acc + (p.assignedWaitMinutes ?? p.waitMinutes ?? 14), 0)
  return Math.round(totalWait / assigned.length)
}

export interface DynamicSupplyNeed {
  targetHosp: Hospital
  donorHosp: Hospital
  neededGenBeds: number
  neededIcuBeds: number
  neededVents: number
  neededTotalBeds: number
  urgencyLevel: '[CRITICAL SURGE DEFICIT]' | '[MODERATE SURGE DEFICIT]' | '[PREVENTATIVE BUFFER NEED]'
  reason: string
}

export function calculateAiSupplyNeed(state: TriageState): DynamicSupplyNeed {
  const sortedByLoad = [...state.hospitals].sort((a, b) => occupancyRatio(b.beds) - occupancyRatio(a.beds))
  const targetHosp = sortedByLoad[0] ?? state.hospitals[0]
  const donorHosp = sortedByLoad[sortedByLoad.length - 1] ?? state.hospitals[1]

  const loadRatio = occupancyRatio(targetHosp.beds)
  const hospPts = state.patients.filter((p) => p.hospitalId === targetHosp.id)
  const waitingCount = hospPts.filter((p) => p.status === 'Waiting' || p.status === 'Preempted').length
  const severeCount = hospPts.filter((p) => p.severity >= 80 && p.status !== 'Transferred').length
  const icuRatio = targetHosp.icuBeds.used / (targetHosp.icuBeds.total || 1)

  let neededGenBeds = 6
  let neededIcuBeds = 2
  let neededVents = 3
  let urgencyLevel: DynamicSupplyNeed['urgencyLevel'] = '[MODERATE SURGE DEFICIT]'
  let reason = `Hospital load at ${Math.round(loadRatio * 100)}% with ${waitingCount} waiting patients.`

  if (loadRatio >= 0.85 || severeCount >= 3 || icuRatio >= 0.9) {
    neededGenBeds = Math.max(12, Math.ceil(waitingCount * 1.5) + 4)
    neededIcuBeds = Math.max(4, Math.ceil(severeCount * 1.2) + 2)
    neededVents = Math.max(5, severeCount + 2)
    urgencyLevel = '[CRITICAL SURGE DEFICIT]'
    reason = `Mass casualty/critical surge detected: ${Math.round(loadRatio * 100)}% load, ${targetHosp.icuBeds.used}/${targetHosp.icuBeds.total} ICU occupied, ${severeCount} severe patients (S>=80).`
  } else if (loadRatio >= 0.70 || severeCount >= 1) {
    neededGenBeds = Math.max(8, waitingCount + 3)
    neededIcuBeds = Math.max(2, severeCount + 1)
    neededVents = Math.max(3, severeCount + 1)
    urgencyLevel = '[MODERATE SURGE DEFICIT]'
    reason = `Moderate capacity pressure: ${Math.round(loadRatio * 100)}% load with ${waitingCount} waiting patients.`
  } else {
    neededGenBeds = 4
    neededIcuBeds = 1
    neededVents = 2
    urgencyLevel = '[PREVENTATIVE BUFFER NEED]'
    reason = `Nominal operation: Allocating preventative buffer to maintain low queue latency.`
  }

  return {
    targetHosp,
    donorHosp,
    neededGenBeds,
    neededIcuBeds,
    neededVents,
    neededTotalBeds: neededGenBeds + neededIcuBeds,
    urgencyLevel,
    reason,
  }
}

export function runAiSupplyDispatch(state: TriageState): { state: TriageState; eventMsg: string } {
  const need = calculateAiSupplyNeed(state)
  const targetHosp = need.targetHosp
  const oldLoadPct = Math.round(occupancyRatio(targetHosp.beds) * 100)

  const updatedHospitals = state.hospitals.map((h) => {
    if (h.id === targetHosp.id) {
      return {
        ...h,
        beds: { ...h.beds, total: h.beds.total + need.neededTotalBeds },
        generalBeds: { ...h.generalBeds, total: h.generalBeds.total + need.neededGenBeds },
        icuBeds: { ...h.icuBeds, total: h.icuBeds.total + need.neededIcuBeds },
        ventilators: { ...h.ventilators, total: h.ventilators.total + need.neededVents },
      }
    }
    return h
  })

  const newTarget = updatedHospitals.find((h) => h.id === targetHosp.id)!
  const newLoadPct = Math.round(occupancyRatio(newTarget.beds) * 100)
  const loadDiff = oldLoadPct - newLoadPct

  const eventMsg = `[AI DISPATCH EXECUTED] ${targetHosp.name}: Dispatched +${need.neededTotalBeds} Beds (+${need.neededIcuBeds} ICU) & +${need.neededVents} Ventilators. Capacity load reduced from ${oldLoadPct}% to ${newLoadPct}% (-${loadDiff}% relief).`

  return {
    state: {
      ...state,
      hospitals: updatedHospitals,
    },
    eventMsg,
  }
}

export function getRegionalReferralRecommendation(state: TriageState): ReferralRecommendation | null {
  const city = state.hospitals.find((h) => h.id === HOSPITAL_IDS.city)
  if (!city || occupancyRatio(city.beds) < 0.85) return null

  const waitingAtCity = state.patients.filter((p) => p.hospitalId === HOSPITAL_IDS.city && p.status === 'Waiting')
  if (waitingAtCity.length === 0) return null

  const candidate = sortByPriority(waitingAtCity)[0]
  const target = state.hospitals.find((h) => h.id !== HOSPITAL_IDS.city && occupancyRatio(h.beds) < 0.7)
  if (!target) return null

  return {
    patientId: candidate.id,
    patientName: candidate.name,
    fromHospitalId: city.id,
    fromHospitalName: city.name,
    toHospitalId: target.id,
    toHospitalName: target.name,
    travelTimeMinutes: 14,
    matchReason: 'Dijkstra Overflow Referral',
    reason: `City General at ${Math.round(occupancyRatio(city.beds) * 100)}% load. Route ${candidate.name} to ${target.name} (${target.short}) to avoid surge delay.`,
  }
}

export function executeRegionalReferral(state: TriageState, referral: ReferralRecommendation): { state: TriageState; message: string } {
  const updatedPatients = state.patients.map((p) =>
    p.id === referral.patientId ? { ...p, status: 'Transferred' as const, hospitalId: referral.toHospitalId, waitMinutes: 0 } : p
  )
  const newTransfer: Transfer = {
    id: `T-${Math.floor(100 + Math.random() * 900)}`,
    patientId: referral.patientId,
    patientLabel: `#${referral.patientId}`,
    fromId: referral.fromHospitalId,
    toId: referral.toHospitalId,
    minutes: referral.travelTimeMinutes,
    algorithm: 'Dijkstra',
    active: true,
  }
  return {
    state: {
      ...state,
      patients: updatedPatients,
      transfers: [newTransfer, ...state.transfers],
    },
    message: `Dijkstra Overflow: Referred ${referral.patientName} from ${referral.fromHospitalName} ➔ ${referral.toHospitalName} (${referral.travelTimeMinutes} min transit).`,
  }
}

/** Advance simulated time: longer waits for waiting patients, treatment recovery countdown, and auto-step-down from ICU to General Bed. */
export function advanceTime(patients: Patient[], stepMinutes = 7): Patient[] {
  const updated = patients.map((pt) => {
    if (pt.status === 'Discharged') return pt

    // Transferred Patient Inter-Hospital Transit Completion & Intake
    if (pt.status === 'Transferred') {
      const nextWait = pt.waitMinutes + stepMinutes
      if (nextWait >= 14) {
        return {
          ...pt,
          waitMinutes: 14,
          assignedWaitMinutes: 14,
          status: 'Assigned' as const,
          bedType: pt.severity >= 80 ? ('ICU' as const) : ('General' as const),
          estRecoveryMinutes: 35,
          stepDownCountdown: 15,
        }
      }
      return {
        ...pt,
        waitMinutes: nextWait,
      }
    }

    const waiting = pt.status === 'Waiting'
    const nextWait = waiting ? pt.waitMinutes + stepMinutes : pt.waitMinutes
    const nextEstRecovery = Math.max(0, (pt.estRecoveryMinutes ?? 30) - stepMinutes)
    const nextStepDown = Math.max(0, (pt.stepDownCountdown ?? 0) - stepMinutes)

    let nextBedType = pt.bedType ?? 'General'
    let nextSeverity = pt.severity

    if (waiting) {
      nextSeverity = Math.min(100, pt.severity + (pt.severity >= 70 ? 3 : 1))
    } else {
      // Assigned patient recovering over time (gradual recovery under active treatment)
      nextSeverity = Math.max(15, pt.severity - 5)
      const req = getPatientClinicalRequirement(pt)
      if (nextBedType === 'ICU' && (nextSeverity < req.icuStepDownThreshold || nextStepDown === 0)) {
        nextBedType = 'General'
      }

      // Patient treatment completed: STRICT DISCHARGE CRITERIA (Severity <= 35 AND Recovery Timer === 0)
      if (nextSeverity <= 35 && nextEstRecovery === 0) {
        return {
          ...pt,
          waitMinutes: nextWait,
          assignedWaitMinutes: pt.assignedWaitMinutes ?? nextWait,
          severity: nextSeverity,
          status: 'Discharged' as const,
          bedType: 'None' as const,
          estRecoveryMinutes: 0,
        }
      }
    }

    return {
      ...pt,
      waitMinutes: nextWait,
      assignedWaitMinutes: pt.status === 'Assigned' ? (pt.assignedWaitMinutes ?? pt.waitMinutes) : undefined,
      severity: nextSeverity,
      bedType: nextBedType,
      estRecoveryMinutes: nextEstRecovery,
      stepDownCountdown: nextStepDown,
    }
  })

  // Auto-assign top effective-priority waiting patient when priority escalates (P >= 80 or Wait >= 30m)
  const waitingPatients = updated
    .filter((p) => p.status === 'Waiting')
    .sort((a, b) => effectivePriority(b) - effectivePriority(a))

  if (waitingPatients.length > 0) {
    const top = waitingPatients[0]
    if (effectivePriority(top) >= 80 || top.waitMinutes >= 30) {
      return updated.map((p) =>
        p.id === top.id
          ? {
              ...p,
              status: 'Assigned',
              assignedWaitMinutes: p.waitMinutes,
              bedType: top.severity >= 80 ? 'ICU' : 'General',
            }
          : p
      )
    }
  }

  return updated
}

export const STATUS_LABEL: Record<CapacityStatus, string> = {
  green: 'Nominal',
  amber: 'Strained',
  red: 'Critical',
}

export function processNewArrival(
  state: TriageState,
  newPt: Patient
): { state: TriageState; preemptedPatientName?: string } {
  let updatedPatients = [...state.patients]
  let preemptedName: string | undefined = undefined

  if (newPt.severity >= 88) {
    const candidates = updatedPatients.filter(
      (p) => p.hospitalId === newPt.hospitalId && p.status === 'Assigned' && p.severity <= 60
    )

    if (candidates.length > 0) {
      candidates.sort((a, b) => a.severity - b.severity)
      const toPreempt = candidates[0]
      preemptedName = toPreempt.name

      updatedPatients = updatedPatients.map((p) =>
        p.id === toPreempt.id ? { ...p, status: 'Preempted' as PatientStatus } : p
      )
      newPt.status = 'Assigned'
      newPt.assignedWaitMinutes = newPt.waitMinutes
    } else {
      const candidateOverflow = state.hospitals.find(
        (h) => h.id !== newPt.hospitalId && getHospitalOpenBeds(h) >= 2
      )
      if (candidateOverflow) {
        newPt.hospitalId = candidateOverflow.id
        newPt.status = 'Assigned'
        newPt.assignedWaitMinutes = newPt.waitMinutes
        newPt.topFactor += ` (Temp Holding at ${candidateOverflow.short})`
      } else {
        newPt.status = 'Waiting'
      }
    }
  } else {
    newPt.status = 'Waiting'
  }

  updatedPatients.unshift(newPt)

  return {
    state: {
      ...state,
      patients: updatedPatients,
    },
    preemptedPatientName: preemptedName,
  }
}

export function getSeverePatientCount(patients: Patient[], hospitalId: string): number {
  return patients.filter(
    (p) => p.hospitalId === hospitalId && p.severity >= 80 && p.status !== 'Transferred'
  ).length
}

export function getHospitalOpenBeds(hospital: Hospital): number {
  return Math.max(0, hospital.beds.total - hospital.beds.used)
}

export function triggerBedRelease(
  state: TriageState,
  hospitalId: string,
  reason: 'recovery' | 'family_ama',
  targetPatientId?: string
): { state: TriageState; message: string } {
  const hospital = state.hospitals.find((h) => h.id === hospitalId)
  if (!hospital) return { state, message: 'Hospital not found' }

  let updatedPatients = [...state.patients]
  let dischargedName = 'Patient'

  if (targetPatientId) {
    const pt = updatedPatients.find((p) => p.id === targetPatientId)
    if (pt) {
      dischargedName = pt.name
      updatedPatients = updatedPatients.map((p) => (p.id === targetPatientId ? { ...p, status: 'Discharged' as const, bedType: 'None' as const } : p))
    }
  } else {
    const assigned = updatedPatients.filter((p) => p.hospitalId === hospitalId && p.status === 'Assigned' && p.severity <= 50)
    if (assigned.length > 0) {
      dischargedName = assigned[0].name
      updatedPatients = updatedPatients.map((p) => (p.id === assigned[0].id ? { ...p, status: 'Discharged' as const, bedType: 'None' as const } : p))
    } else {
      const anyAssigned = updatedPatients.filter((p) => p.hospitalId === hospitalId && p.status === 'Assigned')
      if (anyAssigned.length > 0) {
        const lowest = anyAssigned.sort((a, b) => a.severity - b.severity)[0]
        dischargedName = lowest.name
        updatedPatients = updatedPatients.map((p) => (p.id === lowest.id ? { ...p, status: 'Discharged' as const, bedType: 'None' as const } : p))
      }
    }
  }

  const updatedHospitals = state.hospitals.map((h) =>
    h.id === hospitalId ? { ...h, beds: { ...h.beds, used: Math.max(0, h.beds.used - 1) } } : h
  )

  let reassignedName: string | null = null
  const preemptedList = updatedPatients.filter((p) => p.hospitalId === hospitalId && p.status === 'Preempted')
  if (preemptedList.length > 0) {
    const topPreempted = preemptedList.sort((a, b) => b.severity - a.severity)[0]
    reassignedName = topPreempted.name
    updatedPatients = updatedPatients.map((p) =>
      p.id === topPreempted.id ? { ...p, status: 'Assigned' as const, assignedWaitMinutes: p.assignedWaitMinutes ?? p.waitMinutes } : p
    )
  } else {
    const waitingList = updatedPatients.filter((p) => p.hospitalId === hospitalId && p.status === 'Waiting')
    if (waitingList.length > 0) {
      const topWaiting = sortByPriority(waitingList)[0]
      reassignedName = topWaiting.name
      updatedPatients = updatedPatients.map((p) =>
        p.id === topWaiting.id ? { ...p, status: 'Assigned' as const, assignedWaitMinutes: topWaiting.waitMinutes } : p
      )
    }
  }

  const reasonLabel = reason === 'recovery' ? 'Early Recovery Discharge' : 'Family AMA Relocation'
  const message = `${reasonLabel}: ${dischargedName} discharged from ${hospital.name}. Bed freed up! ${
    reassignedName ? `Auto-assigned freed bed to ${reassignedName}.` : 'No waiting patients in queue.'
  }`

  return {
    state: {
      ...state,
      hospitals: updatedHospitals,
      patients: updatedPatients,
    },
    message,
  }
}

export interface ClinicalRequirement {
  requiredEquipment: 'ventilator' | 'icu_bed' | 'monitor'
  requiredSpecialist: 'trauma_surgeon' | 'cardiologist' | 'pulmonologist' | 'general'
  matchReason: string
  icuStepDownThreshold: number
  icuMinMinutes: number
}

export function getPatientClinicalRequirement(patient: Patient): ClinicalRequirement {
  const f = patient.topFactor.toLowerCase()

  if (patient.severity >= 88 || f.includes('spo2') || f.includes('airway') || f.includes('breath') || f.includes('asthma')) {
    return {
      requiredEquipment: 'ventilator',
      requiredSpecialist: 'pulmonologist',
      matchReason: 'Severe Respiratory Support required (Ventilator + Pulmonologist)',
      icuStepDownThreshold: 65,
      icuMinMinutes: 35,
    }
  }

  if (f.includes('chest') || f.includes('arrhythmia') || f.includes('hr') || f.includes('cardiac') || f.includes('vfib')) {
    return {
      requiredEquipment: 'icu_bed',
      requiredSpecialist: 'cardiologist',
      matchReason: 'Cardiac Critical Care required (ECG Monitor + Cardiologist)',
      icuStepDownThreshold: 70,
      icuMinMinutes: 28,
    }
  }

  if (f.includes('trauma') || f.includes('bleed') || f.includes('blast') || f.includes('crush') || f.includes('laceration')) {
    return {
      requiredEquipment: 'icu_bed',
      requiredSpecialist: 'trauma_surgeon',
      matchReason: 'Trauma Intervention required (OR ICU Bed + Trauma Surgeon)',
      icuStepDownThreshold: 74,
      icuMinMinutes: 20,
    }
  }

  return {
    requiredEquipment: 'icu_bed',
    requiredSpecialist: 'general',
    matchReason: 'Standard ICU / Step-Down Bed matched',
    icuStepDownThreshold: 78,
    icuMinMinutes: 12,
  }
}

export function runContinuousSimulationStep(state: TriageState): { state: TriageState; eventMsg: string } {
  let updatedPatients = advanceTime(state.patients, 7)
  let updatedHospitals = [...state.hospitals]
  let eventMsg = 'Simulation step advanced (+7m).'

  if (!state.hospitals || state.hospitals.length === 0) {
    return {
      state: {
        ...state,
        patients: updatedPatients,
      },
      eventMsg,
    }
  }

  if (Math.random() < 0.6) {
    const targetHosp = state.hospitals[Math.floor(Math.random() * state.hospitals.length)]
    if (targetHosp && targetHosp.id) {
      const randomVitals = {
        spo2: Math.floor(76 + Math.random() * 24),
        hr: Math.floor(65 + Math.random() * 95),
        sysBp: Math.floor(90 + Math.random() * 85),
        diaBp: Math.floor(60 + Math.random() * 40),
        temp: 36.5 + Math.random() * 3.5,
        respRate: Math.floor(12 + Math.random() * 24),
        age: Math.floor(18 + Math.random() * 65),
      }

      const devSpo2 = (98 - randomVitals.spo2) * 1.5
      const devHr = Math.abs(randomVitals.hr - 75) * 0.8
      const devTemp = Math.abs(randomVitals.temp - 37.0) * 10
      const rawScore = Math.min(100, Math.max(10, Math.round((devSpo2 * 0.145 + devHr * 0.042 + devTemp * 0.35 + 2.5) * 10)))

      const RANDOM_NAMES = [
        'Ramesh Soren', 'Sunita Murmu', 'Babloo Munda', 'Anita Kumari', 'Deepak Mahto',
        'Pooja Devi', 'Manoj Oraon', 'Priyanka Singh', 'Vikram Hembrom', 'Anand Kumar',
        'Meena Gope', 'Sanjay Tirkey', 'Sunil Roy', 'Neha Choudhary', 'Rohit Bedia'
      ]
      const RANDOM_COMPLAINTS = [
        'Acute Chest Pain / STEMI',
        'Low SpO₂ (82%) · Acute Hypoxia',
        'Highway Fracture + Hemorrhage',
        'Severe Shortness of Breath',
        'Sepsis Shock & High Fever',
        'Severe Abdominal Rigidity'
      ]

      const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]
      const randomComplaint = RANDOM_COMPLAINTS[Math.floor(Math.random() * RANDOM_COMPLAINTS.length)]

      const newPt: Patient = {
        id: `P-${Date.now().toString().slice(-4)}-${Math.floor(100 + Math.random() * 900)}`,
        name: randomName,
        hospitalId: targetHosp.id,
        severity: rawScore,
        waitMinutes: 0,
        topFactor: randomComplaint,
        status: 'Waiting',
      }

      const res = processNewArrival({ ...state, hospitals: updatedHospitals, patients: updatedPatients }, newPt)
      updatedPatients = res.state.patients
      if (res.preemptedPatientName) {
        eventMsg = `⚡ AUTO-PREEMPTION at ${targetHosp.name}: New arrival ${newPt.name} (Severity: ${rawScore}) assigned! Preempted ${res.preemptedPatientName}.`
      } else {
        eventMsg = `🏥 AUTO-ARRIVAL: ${newPt.name} (ML Severity: ${rawScore}) registered at ${targetHosp.name}.`
      }
    }
  }


  // 2. STRICT CLINICAL DISCHARGE: Only patients who have recovered to low severity (Severity <= 35 AND estRecoveryMinutes === 0)
  if (Math.random() < 0.4) {
    const eligibleList = updatedPatients.filter(
      (p) => p.status === 'Assigned' && p.severity <= 35 && (p.estRecoveryMinutes === 0 || p.waitMinutes >= 25)
    )

    if (eligibleList.length > 0) {
      const discharged = eligibleList[0]
      updatedPatients = updatedPatients.map((p) => (p.id === discharged.id ? { ...p, status: 'Discharged' as const, bedType: 'None' as const } : p))

      updatedHospitals = updatedHospitals.map((h) =>
        h.id === discharged.hospitalId ? { ...h, beds: { ...h.beds, used: Math.max(0, h.beds.used - 1) } } : h
      )

      const waiting = updatedPatients
        .filter((p) => p.hospitalId === discharged.hospitalId && (p.status === 'Waiting' || p.status === 'Preempted'))
        .sort((a, b) => effectivePriority(b) - effectivePriority(a))

      if (waiting.length > 0) {
        const nextInLine = waiting[0]
        updatedPatients = updatedPatients.map((p) =>
          p.id === nextInLine.id ? { ...p, status: 'Assigned' as const, assignedWaitMinutes: nextInLine.waitMinutes } : p
        )
        eventMsg += ` 💊 DISCHARGE & RE-ASSIGNMENT: ${discharged.name} (Severity dropped to ${discharged.severity}) completed treatment. Auto-assigned freed bed to ${nextInLine.name}.`
      } else {
        eventMsg += ` 💊 DISCHARGE: ${discharged.name} (Severity dropped to ${discharged.severity}) completed treatment.`
      }
    }
  }

  return {
    state: {
      ...state,
      hospitals: updatedHospitals,
      patients: updatedPatients,
    },
    eventMsg,
  }
}
