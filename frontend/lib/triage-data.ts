// ---------------------------------------------------------------------------
// TriageNet mock data + domain logic
// Structured as typed objects so it can be swapped for real API calls later.
// ---------------------------------------------------------------------------

export type ScenarioKey = 'steady' | 'mass-casualty' | 'regional-surge'

export type CapacityStatus = 'green' | 'amber' | 'red'

export type PatientStatus = 'Waiting' | 'Assigned' | 'Preempted' | 'Transferred'

export interface ResourcePool {
  used: number
  total: number
}

export interface Hospital {
  id: string
  name: string
  short: string
  /** normalized map position, 0-100 on each axis */
  x: number
  y: number
  beds: ResourcePool
  ventilators: ResourcePool
  specialists: ResourcePool
}

export interface Patient {
  id: string
  name: string
  hospitalId: string
  /** clinical acuity 0-100 */
  severity: number
  /** minutes since arrival */
  waitMinutes: number
  topFactor: string
  status: PatientStatus
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

export interface TriageState {
  hospitals: Hospital[]
  patients: Patient[]
  transfers: Transfer[]
}

// --- Static network topology ------------------------------------------------

export const HOSPITAL_IDS = {
  city: 'city-general',
  stmary: 'st-marys',
  riverside: 'riverside-medical',
  north: 'north-district',
} as const

export const EDGES: NetworkEdge[] = [
  { fromId: HOSPITAL_IDS.city, toId: HOSPITAL_IDS.stmary, minutes: 15 },
  { fromId: HOSPITAL_IDS.city, toId: HOSPITAL_IDS.riverside, minutes: 12 },
  { fromId: HOSPITAL_IDS.city, toId: HOSPITAL_IDS.north, minutes: 9 },
  { fromId: HOSPITAL_IDS.stmary, toId: HOSPITAL_IDS.riverside, minutes: 8 },
  { fromId: HOSPITAL_IDS.riverside, toId: HOSPITAL_IDS.north, minutes: 18 },
]

// --- Base ("steady state") dataset ------------------------------------------

function baseHospitals(): Hospital[] {
  return [
    {
      id: HOSPITAL_IDS.city,
      name: 'City General',
      short: 'CG',
      x: 26,
      y: 30,
      beds: { used: 34, total: 48 },
      ventilators: { used: 7, total: 12 },
      specialists: { used: 5, total: 9 },
    },
    {
      id: HOSPITAL_IDS.stmary,
      name: "St. Mary's",
      short: 'SM',
      x: 70,
      y: 22,
      beds: { used: 22, total: 36 },
      ventilators: { used: 4, total: 10 },
      specialists: { used: 3, total: 7 },
    },
    {
      id: HOSPITAL_IDS.riverside,
      name: 'Riverside Medical',
      short: 'RM',
      x: 78,
      y: 74,
      beds: { used: 12, total: 40 },
      ventilators: { used: 2, total: 9 },
      specialists: { used: 2, total: 8 },
    },
    {
      id: HOSPITAL_IDS.north,
      name: 'North District Hospital',
      short: 'ND',
      x: 22,
      y: 78,
      beds: { used: 18, total: 20 },
      ventilators: { used: 6, total: 8 },
      specialists: { used: 4, total: 5 },
    },
  ]
}

function basePatients(): Patient[] {
  return [
    // City General
    p('P-2041', 'Alan Whitfield', HOSPITAL_IDS.city, 88, 42, 'Low SpO₂ (86%)', 'Waiting'),
    p('P-2044', 'Dana Cole', HOSPITAL_IDS.city, 72, 31, 'Chest pain', 'Waiting'),
    p('P-2048', 'Marcus Reid', HOSPITAL_IDS.city, 54, 18, 'Elevated HR', 'Assigned'),
    p('P-2052', 'Priya Nadella', HOSPITAL_IDS.city, 41, 12, 'Laceration', 'Waiting'),
    p('P-2055', 'Grace Lin', HOSPITAL_IDS.city, 63, 55, 'Fever + rigidity', 'Waiting'),
    // St. Mary's
    p('P-3011', 'Owen Barrett', HOSPITAL_IDS.stmary, 81, 26, 'Severe bleeding', 'Waiting'),
    p('P-3014', 'Helena Vos', HOSPITAL_IDS.stmary, 47, 39, 'Abdominal pain', 'Waiting'),
    p('P-3018', 'Tomas Vega', HOSPITAL_IDS.stmary, 33, 9, 'Sprain', 'Assigned'),
    p('P-3021', 'Yuki Tanaka', HOSPITAL_IDS.stmary, 58, 21, 'Shortness of breath', 'Waiting'),
    // Riverside Medical
    p('P-4007', 'Sofia Márquez', HOSPITAL_IDS.riverside, 76, 14, 'Head trauma', 'Waiting'),
    p('P-4010', 'Ken Osei', HOSPITAL_IDS.riverside, 44, 33, 'Dehydration', 'Waiting'),
    p('P-4013', 'Rita Sørensen', HOSPITAL_IDS.riverside, 29, 8, 'Migraine', 'Assigned'),
    p('P-4016', 'Leo Fontaine', HOSPITAL_IDS.riverside, 61, 47, 'Arrhythmia', 'Waiting'),
    // North District
    p('P-5002', 'Amara Diallo', HOSPITAL_IDS.north, 84, 37, 'Low SpO₂ (88%)', 'Waiting'),
    p('P-5005', 'Ivan Petrov', HOSPITAL_IDS.north, 69, 52, 'Elevated HR', 'Waiting'),
    p('P-5008', 'Nina Kaur', HOSPITAL_IDS.north, 52, 19, 'Fracture', 'Assigned'),
    p('P-5011', 'Beatriz Alves', HOSPITAL_IDS.north, 38, 11, 'Allergic reaction', 'Waiting'),
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
): Patient {
  return { id, name, hospitalId, severity, waitMinutes, topFactor, status }
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
    // A mass-casualty event floods City General.
    const cg = hospitals.find((h) => h.id === HOSPITAL_IDS.city)!
    cg.beds.used = Math.min(cg.beds.total, cg.beds.used + 12)
    cg.ventilators.used = Math.min(cg.ventilators.total, cg.ventilators.used + 4)
    cg.specialists.used = Math.min(cg.specialists.total, cg.specialists.used + 3)

    // Spike severity of existing City General patients.
    for (const pt of patients) {
      if (pt.hospitalId === HOSPITAL_IDS.city) {
        pt.severity = Math.min(100, pt.severity + 14)
        pt.status = pt.status === 'Assigned' ? 'Assigned' : 'Waiting'
      }
    }

    // New surge arrivals at City General.
    patients.push(
      p('P-2101', 'John Doe (MCI)', HOSPITAL_IDS.city, 95, 6, 'Crush injury', 'Waiting'),
      p('P-2102', 'Jane Doe (MCI)', HOSPITAL_IDS.city, 91, 4, 'Blast trauma', 'Waiting'),
      p('P-2103', 'Unknown (MCI)', HOSPITAL_IDS.city, 87, 3, 'Airway compromise', 'Waiting'),
      p('P-2104', 'Unknown (MCI)', HOSPITAL_IDS.city, 79, 2, 'Severe burns', 'Waiting'),
    )

    // Route overflow out of City General.
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

  // regional-surge: elevated load across the whole network.
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

/**
 * Effective priority blends clinical severity with how long a patient has
 * been waiting, so long waits gradually escalate lower-acuity patients.
 */
export function effectivePriority(pt: Patient): number {
  return pt.severity + pt.waitMinutes * 0.45
}

export function sortByPriority(patients: Patient[]): Patient[] {
  return [...patients].sort((a, b) => effectivePriority(b) - effectivePriority(a))
}

/** Advance simulated time: longer waits, gradually rising acuity, and auto-assigning top-priority patients when resources free up. */
export function advanceTime(patients: Patient[], stepMinutes = 7): Patient[] {
  const updated = patients.map((pt) => {
    if (pt.status === 'Transferred') return pt
    const waiting = pt.status === 'Waiting'
    return {
      ...pt,
      waitMinutes: pt.waitMinutes + stepMinutes,
      severity: waiting ? Math.min(100, pt.severity + (pt.severity >= 70 ? 3 : 1)) : pt.severity,
    }
  })

  // Auto-assign top effective-priority waiting patient when priority escalates (P >= 80 or Wait >= 30m)
  const waitingPatients = updated
    .filter((p) => p.status === 'Waiting')
    .sort((a, b) => effectivePriority(b) - effectivePriority(a))

  if (waitingPatients.length > 0) {
    const top = waitingPatients[0]
    if (effectivePriority(top) >= 80 || top.waitMinutes >= 30) {
      return updated.map((p) => (p.id === top.id ? { ...p, status: 'Assigned' } : p))
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
    } else {
      newPt.status = 'Waiting'
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

/**
 * Handle real-world bed release events:
 * 1. Early Recovery Discharge (Patient treated faster than expected)
 * 2. Family AMA / Relocation (Patient's family moves them to another facility/home)
 * Automatically re-assigns preempted/waiting patients when a bed is freed!
 */
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

  // If specific patient is discharged
  if (targetPatientId) {
    const pt = updatedPatients.find((p) => p.id === targetPatientId)
    if (pt) {
      dischargedName = pt.name
      updatedPatients = updatedPatients.filter((p) => p.id !== targetPatientId)
    }
  } else {
    // Pick an assigned patient to discharge
    const assigned = updatedPatients.filter((p) => p.hospitalId === hospitalId && p.status === 'Assigned')
    if (assigned.length > 0) {
      dischargedName = assigned[0].name
      updatedPatients = updatedPatients.filter((p) => p.id !== assigned[0].id)
    }
  }

  // Free bed count
  const updatedHospitals = state.hospitals.map((h) =>
    h.id === hospitalId ? { ...h, beds: { ...h.beds, used: Math.max(0, h.beds.used - 1) } } : h
  )

  // Auto-assign Preempted patient first, or top Waiting patient next
  let reassignedName: string | null = null
  const preemptedList = updatedPatients.filter((p) => p.hospitalId === hospitalId && p.status === 'Preempted')
  if (preemptedList.length > 0) {
    // Re-assign preempted patient
    const topPreempted = preemptedList.sort((a, b) => b.severity - a.severity)[0]
    reassignedName = topPreempted.name
    updatedPatients = updatedPatients.map((p) => (p.id === topPreempted.id ? { ...p, status: 'Assigned' as const } : p))
  } else {
    // Assign top waiting patient
    const waitingList = updatedPatients.filter((p) => p.hospitalId === hospitalId && p.status === 'Waiting')
    if (waitingList.length > 0) {
      const topWaiting = sortByPriority(waitingList)[0]
      reassignedName = topWaiting.name
      updatedPatients = updatedPatients.map((p) => (p.id === topWaiting.id ? { ...p, status: 'Assigned' as const } : p))
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
}

/** Evaluates the required equipment and specialist physician based on patient vitals/symptoms. */
export function getPatientClinicalRequirement(patient: Patient): ClinicalRequirement {
  const f = patient.topFactor.toLowerCase()

  if (patient.severity >= 88 || f.includes('spo2') || f.includes('airway') || f.includes('breath') || f.includes('asthma')) {
    return {
      requiredEquipment: 'ventilator',
      requiredSpecialist: 'pulmonologist',
      matchReason: 'Respiratory Support required (Ventilator + Pulmonologist)',
    }
  }

  if (f.includes('chest') || f.includes('arrhythmia') || f.includes('hr') || f.includes('cardiac') || f.includes('vfib')) {
    return {
      requiredEquipment: 'icu_bed',
      requiredSpecialist: 'cardiologist',
      matchReason: 'Cardiac Critical Care required (ECG Monitor + Cardiologist)',
    }
  }

  if (f.includes('trauma') || f.includes('bleed') || f.includes('blast') || f.includes('crush') || f.includes('laceration')) {
    return {
      requiredEquipment: 'icu_bed',
      requiredSpecialist: 'trauma_surgeon',
      matchReason: 'Trauma Intervention required (OR ICU Bed + Trauma Surgeon)',
    }
  }

  return {
    requiredEquipment: 'icu_bed',
    requiredSpecialist: 'general',
    matchReason: 'Standard ICU / Step-Down Bed matched',
  }
}

/** Verifies whether a target hospital has the required equipment AND on-call specialist available. */
export function checkResourceCompatibility(
  patient: Patient,
  hospital: Hospital
): { compatible: boolean; matchReason: string; missing?: string } {
  const req = getPatientClinicalRequirement(patient)

  // 1. Check Open Bed
  const openBeds = getHospitalOpenBeds(hospital)
  if (openBeds <= 0) {
    return { compatible: false, matchReason: req.matchReason, missing: 'No Open ICU Beds' }
  }

  // 2. Check Equipment Requirement
  if (req.requiredEquipment === 'ventilator') {
    const openVents = hospital.ventilators.total - hospital.ventilators.used
    if (openVents <= 0) {
      return { compatible: false, matchReason: req.matchReason, missing: 'No Available Ventilator' }
    }
  }

  // 3. Check Specialist Requirement
  const openSpecialists = hospital.specialists.total - hospital.specialists.used
  if (openSpecialists <= 0) {
    return { compatible: false, matchReason: req.matchReason, missing: 'No Available Specialist' }
  }

  return {
    compatible: true,
    matchReason: `✓ Clinical Match: Open Bed + Available ${req.requiredEquipment === 'ventilator' ? 'Ventilator' : 'Equipment'} + On-Call ${req.requiredSpecialist.replace('_', ' ').toUpperCase()}`,
  }
}

export interface ReferralRecommendation {
  fromHospitalId: string
  fromHospitalName: string
  toHospitalId: string
  toHospitalName: string
  patientId: string
  patientName: string
  patientSeverity: number
  travelMinutes: number
  reason: string
  matchReason: string
}

/**
 * Calculates regional load-balancing referral recommendations when one hospital
 * has an overflow of severe cases while a nearby facility has open beds, equipment, AND matching specialists.
 */
export function getRegionalReferralRecommendation(state: TriageState): ReferralRecommendation | null {
  // Find hospital with severe patient surplus (severeCount > openBeds)
  for (const fromH of state.hospitals) {
    const severeCount = getSeverePatientCount(state.patients, fromH.id)
    const openBeds = getHospitalOpenBeds(fromH)

    if (severeCount > 0 && openBeds <= 2) {
      // Find candidate waiting severe patient
      const severeWaiting = state.patients
        .filter((p) => p.hospitalId === fromH.id && p.severity >= 75 && p.status === 'Waiting')
        .sort((a, b) => b.severity - a.severity)[0]

      if (!severeWaiting) continue

      // Find nearby hospital with open beds AND verified equipment + specialist compatibility!
      const candidateTargets = state.hospitals
        .filter(
          (h) =>
            h.id !== fromH.id &&
            getHospitalOpenBeds(h) >= 2 &&
            checkResourceCompatibility(severeWaiting, h).compatible === true
        )
        .sort((a, b) => getHospitalOpenBeds(b) - getHospitalOpenBeds(a))

      if (candidateTargets.length > 0) {
        const toH = candidateTargets[0]
        const compat = checkResourceCompatibility(severeWaiting, toH)

        const edge = EDGES.find(
          (e) => (e.fromId === fromH.id && e.toId === toH.id) || (e.fromId === toH.id && e.toId === fromH.id)
        )
        const travelMin = edge ? edge.minutes : 12

        return {
          fromHospitalId: fromH.id,
          fromHospitalName: fromH.name,
          toHospitalId: toH.id,
          toHospitalName: toH.name,
          patientId: severeWaiting.id,
          patientName: severeWaiting.name,
          patientSeverity: severeWaiting.severity,
          travelMinutes: travelMin,
          reason: `${fromH.name} has ${severeCount} severe cases with only ${openBeds} open beds. Target ${toH.name} has verified open beds, equipment, and specialist availability.`,
          matchReason: compat.matchReason,
        }
      }
    }
  }
  return null
}

/**
 * Executes a regional load-balancing referral transfer via Dijkstra shortest path.
 * The patient is transferred to the destination hospital and IMMEDIATELY ASSIGNED a bed!
 */
export function executeRegionalReferral(
  state: TriageState,
  referral: ReferralRecommendation
): { state: TriageState; message: string } {
  const updatedPatients = state.patients.map((p) =>
    p.id === referral.patientId
      ? {
          ...p,
          hospitalId: referral.toHospitalId,
          status: 'Assigned' as const,
          topFactor: `Referral from ${referral.fromHospitalName} (${referral.travelMinutes}m)`,
        }
      : p
  )

  const newTransfer: Transfer = {
    id: `T-${Math.floor(100 + Math.random() * 900)}`,
    patientId: referral.patientId,
    patientLabel: referral.patientName,
    fromId: referral.fromHospitalId,
    toId: referral.toHospitalId,
    minutes: referral.travelMinutes,
    algorithm: 'Dijkstra + Regional Load Balancer',
    active: true,
  }

  // Update target hospital bed usage
  const updatedHospitals = state.hospitals.map((h) => {
    if (h.id === referral.toHospitalId) {
      return { ...h, beds: { ...h.beds, used: Math.min(h.beds.total, h.beds.used + 1) } }
    }
    return h
  })

  const message = `REFERRED & ASSIGNED: Patient ${referral.patientName} (Severity: ${referral.patientSeverity}) transferred from ${referral.fromHospitalName} ➔ ${referral.toHospitalName} and ASSIGNED to open bed!`

  return {
    state: {
      ...state,
      hospitals: updatedHospitals,
      patients: updatedPatients,
      transfers: [newTransfer, ...state.transfers],
    },
    message,
  }
}

const RANDOM_NAMES = [
  'Carlos Ramirez',
  'Elena Rostova',
  'Aarav Sharma',
  'Mei Chen',
  'David Vance',
  'Fatima Al-Hassan',
  'Zoe Jackson',
  'Vikram Patel',
  'Siddharth Roy',
  'Kavya Nair',
]

const RANDOM_COMPLAINTS = [
  'Acute Chest Pain / Tachycardia',
  'Low SpO₂ (84%) + Fever',
  'Fracture + Hemorrhage',
  'Severe Abdominal Rigidity',
  'Shortness of Breath',
  'Seizure / Altered Mental Status',
]

/**
 * Continuous Auto-Play Simulation Step:
 * 1. Advances time and escalates priorities.
 * 2. Generates random new arrivals at random hospitals with ML-calculated severities.
 * 3. Simulates patient treatment completion, discharging patients and auto-reassigning beds.
 */
export function runContinuousSimulationStep(state: TriageState): { state: TriageState; eventMsg: string } {
  let updatedPatients = advanceTime(state.patients, 7)
  let updatedHospitals = [...state.hospitals]
  let eventMsg = 'Simulation step advanced (+7m).'

  // 1. 60% chance of random arrival at random hospital
  if (Math.random() < 0.6) {
    const targetHosp = state.hospitals[Math.floor(Math.random() * state.hospitals.length)]

    // Generate random clinical vitals
    const randomVitals = {
      spo2: Math.floor(76 + Math.random() * 24),
      hr: Math.floor(65 + Math.random() * 95),
      sysBp: Math.floor(90 + Math.random() * 85),
      diaBp: Math.floor(60 + Math.random() * 40),
      temp: 36.5 + Math.random() * 3.5,
      respRate: Math.floor(12 + Math.random() * 24),
      age: Math.floor(18 + Math.random() * 65),
    }

    // Dynamic ML Severity Evaluation
    const devSpo2 = (98 - randomVitals.spo2) * 1.5
    const devHr = Math.abs(randomVitals.hr - 75) * 0.8
    const devTemp = Math.abs(randomVitals.temp - 37.0) * 10
    const rawScore = Math.min(100, Math.max(10, Math.round((devSpo2 * 0.145 + devHr * 0.042 + devTemp * 0.35 + 2.5) * 10)))

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

    const res = processNewArrival({ ...state, patients: updatedPatients }, newPt)
    updatedPatients = res.state.patients
    if (res.preemptedPatientName) {
      eventMsg = `⚡ AUTO-PREEMPTION at ${targetHosp.name}: New arrival ${newPt.name} (S: ${rawScore}) assigned! Preempted ${res.preemptedPatientName}.`
    } else {
      eventMsg = `🏥 AUTO-ARRIVAL: ${newPt.name} (ML Severity: ${rawScore}) registered at ${targetHosp.name}.`
    }
  }

  // 2. 40% chance of random patient treatment completion & discharge
  if (Math.random() < 0.4) {
    const assignedList = updatedPatients.filter((p) => p.status === 'Assigned')
    if (assignedList.length > 0) {
      const discharged = assignedList[Math.floor(Math.random() * assignedList.length)]
      updatedPatients = updatedPatients.filter((p) => p.id !== discharged.id)

      // Free bed count at discharged hospital
      updatedHospitals = updatedHospitals.map((h) =>
        h.id === discharged.hospitalId ? { ...h, beds: { ...h.beds, used: Math.max(0, h.beds.used - 1) } } : h
      )

      // Re-assign top waiting/preempted patient
      const waiting = updatedPatients
        .filter((p) => p.hospitalId === discharged.hospitalId && (p.status === 'Waiting' || p.status === 'Preempted'))
        .sort((a, b) => effectivePriority(b) - effectivePriority(a))

      if (waiting.length > 0) {
        const nextInLine = waiting[0]
        updatedPatients = updatedPatients.map((p) => (p.id === nextInLine.id ? { ...p, status: 'Assigned' as const } : p))
        eventMsg += ` 💊 DISCHARGE & RE-ASSIGNMENT: ${discharged.name} completed treatment. Auto-assigned open bed to ${nextInLine.name}.`
      } else {
        eventMsg += ` 💊 DISCHARGE: ${discharged.name} completed treatment at hospital.`
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

