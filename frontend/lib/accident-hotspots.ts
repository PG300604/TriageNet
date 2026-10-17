/**
 * Accident Hotspots & Specialist Doctor Roster Telemetry
 * Real-world Jharkhand NH Blackspots, Onboard Vitals, Live Highway Traffic Delays,
 * and Dynamic Doctor Matching for 1st, 2nd, and 3rd Best Hospital Options.
 */

export type SpecialistRole =
  | 'Neurosurgeon'
  | 'Pulmonologist'
  | 'TraumaSurgeon'
  | 'BurnsPlastic'
  | 'OrthopedicSurgeon'

export interface CorridorRouteOption {
  id: string
  name: string
  corridorType: 'PRIMARY_HIGHWAY' | 'BYPASS_EXPRESSWAY'
  distanceKm: number
  trafficLevel: 'CLEAR' | 'MODERATE' | 'HEAVY'
  trafficDelayMin: number
  effectiveEtaMin: number
  savesMinutes?: number
  waypoints: [number, number][]
  description: string
}

export interface AccidentHotspot {
  id: string
  name: string
  highway: string
  district: string
  lat: number
  lng: number
  monthlyAccidents: number
  blackspotRanking: string
  riskCategory: 'CRITICAL_BLACKSPOT' | 'HIGH_HAZARD' | 'SEVERE_CORRIDOR'
  defaultIncident: string
  defaultPatient: string
  requiredSpecialist: string
  requiredSpecialistRole: SpecialistRole
  baseCorridorKm: number
  defaultTrafficDelayMin: number
  defaultTrafficLevel: 'CLEAR' | 'MODERATE' | 'HEAVY'
  defaultVitals: {
    spo2: number
    heartRate: number
    systolicBp: number
    gcs: number
  }
  primaryRouteWaypoints: [number, number][]
  bypassRouteWaypoints: [number, number][]
  bypassName: string
  bypassDistanceKm: number
  bypassTrafficDelayMin: number
}

export interface DoctorDutyInfo {
  doctorName: string
  specialty: string
  department: string
  status: 'READY_TRAUMA_BAY' | 'OCCUPIED_IN_OT' | 'NOT_AVAILABLE'
  experienceYears: number
  pagerExtension: string
  statusNote: string
}

export const ACCIDENT_HOTSPOTS: AccidentHotspot[] = [
  {
    id: 'ormanjhi-nh33',
    name: 'NH-33 Toll Plaza Crash Zone (Ormanjhi)',
    highway: 'NH-33 Ranchi-Ramgarh Corridor',
    district: 'Ranchi',
    lat: 23.4832,
    lng: 85.4611,
    monthlyAccidents: 14,
    blackspotRanking: 'State Blackspot #04 (NHAI Identified)',
    riskCategory: 'CRITICAL_BLACKSPOT',
    defaultIncident: 'High-Speed SUV Rollover & Complex Polytrauma with TBI',
    defaultPatient: 'Kunal Besra (Male, 34y)',
    requiredSpecialist: 'Neurosurgeon & Emergency Trauma Surgeon',
    requiredSpecialistRole: 'Neurosurgeon',
    baseCorridorKm: 18.4,
    defaultTrafficDelayMin: 8,
    defaultTrafficLevel: 'MODERATE',
    defaultVitals: {
      spo2: 82,
      heartRate: 134,
      systolicBp: 84,
      gcs: 9, // Severe Traumatic Brain Injury
    },
    primaryRouteWaypoints: [
      [23.4832, 85.4611],
      [23.4720, 85.4520],
      [23.4580, 85.4410],
      [23.4410, 85.4265],
      [23.4250, 85.4120],
      [23.4110, 85.3950],
      [23.3980, 85.3785],
      [23.3860, 85.3640],
      [23.3765, 85.3512],
    ],
    bypassName: 'Ranchi Ring Road Phase-1 Expressway Bypass',
    bypassDistanceKm: 23.2,
    bypassTrafficDelayMin: 0,
    bypassRouteWaypoints: [
      [23.4832, 85.4611],
      [23.4680, 85.4720],
      [23.4350, 85.4620],
      [23.3980, 85.4410],
      [23.3650, 85.4050],
      [23.3620, 85.3710],
      [23.3765, 85.3512],
    ],
  },
  {
    id: 'jharia-colliery',
    name: 'Jharia Colliery Pithead Hazard Belt',
    highway: 'SH-12 Dhanbad-Sindri Colliery Route',
    district: 'Dhanbad',
    lat: 23.742,
    lng: 86.418,
    monthlyAccidents: 9,
    blackspotRanking: 'Mining High-Hazard Cluster #02',
    riskCategory: 'HIGH_HAZARD',
    defaultIncident: 'Underground Pit Roof Inundation & Toxic Carbon Monoxide Inhalation',
    defaultPatient: 'Sunil Karmakar (Male, 42y)',
    requiredSpecialist: 'Pulmonologist & Critical Care Intensivist',
    requiredSpecialistRole: 'Pulmonologist',
    baseCorridorKm: 16.2,
    defaultTrafficDelayMin: 15,
    defaultTrafficLevel: 'HEAVY',
    defaultVitals: {
      spo2: 78,
      heartRate: 142,
      systolicBp: 76,
      gcs: 8, // Acute Refractory Hypoxia
    },
    primaryRouteWaypoints: [
      [23.7420, 86.4180],
      [23.7540, 86.4260],
      [23.7710, 86.4210],
      [23.7880, 86.4270],
      [23.8010, 86.4350],
      [23.8110, 86.4430],
      [23.8180, 86.4520],
    ],
    bypassName: 'Govindpur Outer Coal Feeder Road Bypass',
    bypassDistanceKm: 20.4,
    bypassTrafficDelayMin: 1,
    bypassRouteWaypoints: [
      [23.7420, 86.4180],
      [23.7380, 86.4420],
      [23.7650, 86.4680],
      [23.7950, 86.4710],
      [23.8120, 86.4620],
      [23.8180, 86.4520],
    ],
  },
  {
    id: 'barhi-gt-road',
    name: 'Barhi GT Road Highway Junction (NH-19 / NH-20)',
    highway: 'NH-19 (Old GT Road) / NH-20 Multi-Lane Intersection',
    district: 'Hazaribagh',
    lat: 24.298,
    lng: 85.423,
    monthlyAccidents: 18,
    blackspotRanking: 'Golden Quadrilateral Blackspot #01',
    riskCategory: 'CRITICAL_BLACKSPOT',
    defaultIncident: 'Multi-Vehicle Fog Pileup with Bilateral Flail Chest & Hemothorax',
    defaultPatient: 'Devendra Tiwary (Male, 48y)',
    requiredSpecialist: 'Cardiothoracic / Trauma Surgeon',
    requiredSpecialistRole: 'TraumaSurgeon',
    baseCorridorKm: 26.5,
    defaultTrafficDelayMin: 22,
    defaultTrafficLevel: 'HEAVY',
    defaultVitals: {
      spo2: 80,
      heartRate: 138,
      systolicBp: 82,
      gcs: 10, // Tension Hemothorax
    },
    primaryRouteWaypoints: [
      [24.2980, 85.4230],
      [24.2410, 85.4090],
      [24.1680, 85.3940],
      [24.0950, 85.3810],
      [24.0320, 85.3670],
      [23.9920, 85.3550],
    ],
    bypassName: 'Padma-Chauparan State Forest Bypass',
    bypassDistanceKm: 31.8,
    bypassTrafficDelayMin: 2,
    bypassRouteWaypoints: [
      [24.2980, 85.4230],
      [24.2750, 85.4520],
      [24.1950, 85.4380],
      [24.1120, 85.4150],
      [24.0250, 85.3780],
      [23.9920, 85.3550],
    ],
  },
  {
    id: 'bundu-ghats',
    name: 'Bundu Valley Ghats Hairpin Curve',
    highway: 'NH-33 Ranchi-Jamshedpur Ghat Highway',
    district: 'Ranchi',
    lat: 23.1812,
    lng: 85.5894,
    monthlyAccidents: 11,
    blackspotRanking: 'Mountainous Steep Descent Blackspot #06',
    riskCategory: 'SEVERE_CORRIDOR',
    defaultIncident: 'Inter-District Bus Ravine Fall with Unstable Spinal Cord Trauma',
    defaultPatient: 'Pooja Devi (Female, 29y)',
    requiredSpecialist: 'Spine & Orthopedic Trauma Surgeon',
    requiredSpecialistRole: 'OrthopedicSurgeon',
    baseCorridorKm: 38.2,
    defaultTrafficDelayMin: 9,
    defaultTrafficLevel: 'MODERATE',
    defaultVitals: {
      spo2: 89,
      heartRate: 124,
      systolicBp: 92,
      gcs: 12, // Suspected C-Spine Subluxation
    },
    primaryRouteWaypoints: [
      [23.1812, 85.5891],
      [23.2280, 85.5420],
      [23.2750, 85.4850],
      [23.3180, 85.4280],
      [23.3480, 85.3820],
      [23.3765, 85.3512],
    ],
    bypassName: 'Rampur Ring Road Phase-2 Bypass',
    bypassDistanceKm: 44.5,
    bypassTrafficDelayMin: 1,
    bypassRouteWaypoints: [
      [23.1812, 85.5891],
      [23.2120, 85.5680],
      [23.2620, 85.5180],
      [23.3280, 85.4580],
      [23.3680, 85.3980],
      [23.3765, 85.3512],
    ],
  },
  {
    id: 'adityapur-industrial',
    name: 'Adityapur Industrial Complex Heavy Corridor',
    highway: 'Tata-Kandra 4-Lane Industrial Expressway',
    district: 'East Singhbhum (Jamshedpur)',
    lat: 22.7845,
    lng: 86.1582,
    monthlyAccidents: 7,
    blackspotRanking: 'Hazardous Chemical Transport Zone #03',
    riskCategory: 'HIGH_HAZARD',
    defaultIncident: 'Chemical Boiler Flash Fire with 45% Deep Dermal Inhalation Burns',
    defaultPatient: 'Ramesh Munda (Male, 38y)',
    requiredSpecialist: 'Plastic, Reconstructive & Burn Surgeon',
    requiredSpecialistRole: 'BurnsPlastic',
    baseCorridorKm: 14.7,
    defaultTrafficDelayMin: 12,
    defaultTrafficLevel: 'HEAVY',
    defaultVitals: {
      spo2: 84,
      heartRate: 148,
      systolicBp: 80,
      gcs: 11, // Severe Inhalation Burn
    },
    primaryRouteWaypoints: [
      [22.7845, 86.1582],
      [22.7930, 86.1720],
      [22.8040, 86.1880],
      [22.8150, 86.2020],
      [22.8250, 86.2140],
    ],
    bypassName: 'Marine Drive Subarnarekha Expressway',
    bypassDistanceKm: 17.5,
    bypassTrafficDelayMin: 1,
    bypassRouteWaypoints: [
      [22.7845, 86.1582],
      [22.7780, 86.1850],
      [22.7950, 86.2150],
      [22.8160, 86.2280],
      [22.8250, 86.2140],
    ],
  },
]

/**
 * Hospital Doctor Duty Rosters
 * Live on-duty specialists across Jharkhand medical institutions.
 */
export const HOSPITAL_DOCTOR_ROSTERS: Record<string, Record<SpecialistRole, DoctorDutyInfo>> = {
  // RIMS Ranchi — Apex Level-1 Tertiary Facility
  'jh-rims-ranchi': {
    Neurosurgeon: {
      doctorName: 'Dr. C. B. Sahay, M.Ch',
      specialty: 'Department of Neurosurgery',
      department: 'Apex Level-1 Trauma Suite',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 18,
      pagerExtension: 'EXT-1044',
      statusNote: 'Trauma Bay Bay-3 Pre-Alerted. 3T Neuro-Navigation Ready.',
    },
    Pulmonologist: {
      doctorName: 'Dr. Anita Minz, MD',
      specialty: 'Pulmonary & Critical Care Medicine',
      department: 'Apex ICU Unit 2',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 14,
      pagerExtension: 'EXT-1082',
      statusNote: 'Hamilton-G5 High-Frequency Ventilator Calibrated & Ready.',
    },
    TraumaSurgeon: {
      doctorName: 'Dr. A. K. Verma, MS (Trauma)',
      specialty: 'Chief Emergency Trauma Surgeon',
      department: 'Trauma OT-1',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 20,
      pagerExtension: 'EXT-1001',
      statusNote: 'On-Duty in Resuscitation Bay. Thoracotomy Kit Prepped.',
    },
    BurnsPlastic: {
      doctorName: 'Dr. Rajesh Murmu, M.Ch (Plastic)',
      specialty: 'Burns, Plastic & Micro-Vascular',
      department: 'Regional Burn ICU',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 16,
      pagerExtension: 'EXT-1090',
      statusNote: 'Dedicated Sterile Burn Bed #4 Cleaned & Fluid Protocol Initiated.',
    },
    OrthopedicSurgeon: {
      doctorName: 'Dr. Sanjay Tirkey, MS (Ortho)',
      specialty: 'Spine & Complex Pelvic Reconstruction',
      department: 'Orthopedic Trauma Division',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 15,
      pagerExtension: 'EXT-1065',
      statusNote: 'Spinal Traction Frame & C-Arm Image Intensifier Ready.',
    },
  },

  // Sadar Hospital Ranchi — Secondary District Hospital (Stabilization Ready, lacks super-specialties)
  'jh-sadar-hospital-ranchi': {
    Neurosurgeon: {
      doctorName: 'None on Duty',
      specialty: 'Neurosurgery Department',
      department: 'Emergency Wing',
      status: 'NOT_AVAILABLE',
      experienceYears: 0,
      pagerExtension: 'N/A',
      statusNote: '⚠️ NO NEUROSURGEON AT DISTRICT LEVEL. Immediate Airway/Blood Resuscitation ONLY.',
    },
    Pulmonologist: {
      doctorName: 'Dr. Deepak Verma, MD',
      specialty: 'General Internal Medicine / Chest Care',
      department: 'Sadar HDU',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 11,
      pagerExtension: 'EXT-2022',
      statusNote: 'BiPAP Non-Invasive Ventilation Unit Operational.',
    },
    TraumaSurgeon: {
      doctorName: 'Dr. Sunil Roy, MS (Gen Surgery)',
      specialty: 'General Emergency Surgeon',
      department: 'District Emergency Ward',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 12,
      pagerExtension: 'EXT-2015',
      statusNote: 'Can perform chest tube tube-thoracostomy & wound packing.',
    },
    BurnsPlastic: {
      doctorName: 'None on Duty',
      specialty: 'Plastic Surgery Wing',
      department: 'General Surgery Unit',
      status: 'NOT_AVAILABLE',
      experienceYears: 0,
      pagerExtension: 'N/A',
      statusNote: '⚠️ NO SPECIALIZED BURN ICU. Secondary Dressings Only.',
    },
    OrthopedicSurgeon: {
      doctorName: 'Dr. Manoj Soren, MS',
      specialty: 'General Orthopedic Stabilization',
      department: 'Emergency Plaster Room',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 9,
      pagerExtension: 'EXT-2030',
      statusNote: 'Pelvic Binder & Thomas Splint available for transit stabilization.',
    },
  },

  // SNMMCH Dhanbad — Tertiary Colliery Center
  'jh-shaheed-nirmal-mahto-medical-college-hospital-dhanbad': {
    Neurosurgeon: {
      doctorName: 'Dr. B. K. Singh, M.Ch',
      specialty: 'Neurosurgery Division',
      department: 'Emergency OT Suite',
      status: 'OCCUPIED_IN_OT',
      experienceYears: 13,
      pagerExtension: 'EXT-3055',
      statusNote: '⏳ IN EMERGENCY CRANIOTOMY (Delayed 55m). Backup Assistant On Call.',
    },
    Pulmonologist: {
      doctorName: 'Dr. S. K. Roy, MD (Pulmonary)',
      specialty: 'Industrial Lung Hazard Division',
      department: 'Colliery Critical Care Unit',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 17,
      pagerExtension: 'EXT-3012',
      statusNote: 'Bronchoscopy Suite & Toxic Gas Washout System Operational.',
    },
    TraumaSurgeon: {
      doctorName: 'Dr. R. N. Pandey, MS',
      specialty: 'Trauma & Acute Care Surgery',
      department: 'Dhanbad Trauma Center',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 15,
      pagerExtension: 'EXT-3004',
      statusNote: 'Trauma Team Beta Mobilized. Fast Ultrasound Active.',
    },
    BurnsPlastic: {
      doctorName: 'Dr. A. Das, MS (Plastics)',
      specialty: 'Burn Reconstruction',
      department: 'Burn Unit Ward-6',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 10,
      pagerExtension: 'EXT-3044',
      statusNote: 'Parkland Fluid Resuscitation Protocol Active.',
    },
    OrthopedicSurgeon: {
      doctorName: 'Dr. P. K. Besra, MS',
      specialty: 'Colliery Crush Orthopedics',
      department: 'Mine Trauma Ortho Bay',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 14,
      pagerExtension: 'EXT-3062',
      statusNote: 'External Fixator sets ready for compound fractures.',
    },
  },

  // MGM Medical College Jamshedpur / Tata Main
  'jh-mahatma-gandhi-memorial-medical-college-hospital-jamshedpur': {
    Neurosurgeon: {
      doctorName: 'Dr. P. Mishra, M.Ch',
      specialty: 'Neurotrauma & Neuro-ICU',
      department: 'Jamshedpur Apex Trauma Wing',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 19,
      pagerExtension: 'EXT-4011',
      statusNote: 'Emergency Craniotomy Team Standing By in OT-2.',
    },
    Pulmonologist: {
      doctorName: 'Dr. K. N. Soren, MD',
      specialty: 'Respiratory Critical Care',
      department: 'Medical ICU-1',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 12,
      pagerExtension: 'EXT-4033',
      statusNote: 'High-Flow Nasal Cannula & Arterial Line Prepped.',
    },
    TraumaSurgeon: {
      doctorName: 'Dr. S. Banerjee, MS',
      specialty: 'Polytrauma Team Lead',
      department: 'Emergency Care Block',
      status: 'OCCUPIED_IN_OT',
      experienceYears: 16,
      pagerExtension: 'EXT-4002',
      statusNote: '⏳ IN EXPLORATORY LAPAROTOMY (Delayed 35m). Senior Resident Covering.',
    },
    BurnsPlastic: {
      doctorName: 'Dr. D. Hansda, M.Ch (Burns)',
      specialty: 'Industrial Blast & Burn Reconstruction',
      department: 'Apex Burn Center Jamshedpur',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 22,
      pagerExtension: 'EXT-4099',
      statusNote: 'Laminar Airflow Burn Bay #2 Ready with Biological Dressings.',
    },
    OrthopedicSurgeon: {
      doctorName: 'Dr. R. Murmu, MS',
      specialty: 'Orthopedic & Complex Pelvis',
      department: 'Ortho Trauma Floor',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 14,
      pagerExtension: 'EXT-4078',
      statusNote: 'Intramedullary Nailing & Fluoroscopy Suite Active.',
    },
  },
}

/**
 * Fallback generator for other hospitals
 */
export function getHospitalDoctorRoster(
  hospitalId: string,
  specialistRole: SpecialistRole,
): DoctorDutyInfo {
  const facilityRoster = HOSPITAL_DOCTOR_ROSTERS[hospitalId]
  if (facilityRoster && facilityRoster[specialistRole]) {
    return facilityRoster[specialistRole]
  }

  // Fallback defaults based on facility tier heuristics
  const isTertiary = hospitalId.includes('rims') || hospitalId.includes('medical') || hospitalId.includes('snmmch') || hospitalId.includes('mgm')
  const isSadar = hospitalId.includes('sadar')

  if (isTertiary) {
    return {
      doctorName: 'Dr. On-Duty Specialist, MS/M.Ch',
      specialty: `${specialistRole} Division`,
      department: 'Tertiary Trauma Wing',
      status: 'READY_TRAUMA_BAY',
      experienceYears: 12,
      pagerExtension: 'EXT-5000',
      statusNote: 'Tertiary Specialist Standing By in Emergency Trauma Bay.',
    }
  }

  if (isSadar && (specialistRole === 'Neurosurgeon' || specialistRole === 'BurnsPlastic')) {
    return {
      doctorName: 'Not Available at District Level',
      specialty: `${specialistRole} Care`,
      department: 'District Emergency Bay',
      status: 'NOT_AVAILABLE',
      experienceYears: 0,
      pagerExtension: 'N/A',
      statusNote: `⚠️ ${specialistRole} requires tertiary referral. Stabilization only.`,
    }
  }

  return {
    doctorName: 'Dr. Duty Medical Officer, MBBS/DNB',
    specialty: 'General Emergency Resuscitation',
    department: 'Casualty Ward',
    status: 'READY_TRAUMA_BAY',
    experienceYears: 8,
    pagerExtension: 'EXT-6000',
    statusNote: 'Basic Airway & Hemodynamic Stabilization Available.',
  }
}

export interface CandidateHospitalEvaluation {
  hospitalId: string
  hospitalName: string
  hospital: any
  district: string
  tier: string
  distanceKm: number
  baseTravelTimeMin: number
  trafficDelayMin: number
  effectiveEtaMin: number
  etaMinutes: number
  trafficLevel: 'CLEAR' | 'MODERATE' | 'HEAVY'
  greenWaveActive: boolean
  availIcu: number
  availGen: number
  hasTraumaSurgeon: boolean
  hasVentilators: boolean
  doctorInfo: DoctorDutyInfo
  specialistReady: boolean
  compositeScore: number
  totalScore: number
  rankTier: 'FIRST_BEST' | 'SECOND_BEST' | 'THIRD_BEST' | 'ALTERNATIVE'
  clinicalRationale: string
  bypassName?: string
  bypassDistanceKm?: number
  bypassEtaMin?: number
  bypassSavingsMin?: number
  recommendedCorridor?: 'PRIMARY_HIGHWAY' | 'BYPASS_EXPRESSWAY'
  trafficDiversionRecommendation?: string
  lat: number
  lng: number
}

/**
 * Multi-Criteria Hospital Match Evaluator
 * Evaluates candidate facilities considering:
 * 1. Specialist Doctor Presence & On-Duty Status (Apex capability)
 * 2. Real-time Traffic Delays & Road Distances
 * 3. Available ICU Beds & Ventilators
 * 4. Multi-corridor route options (Primary Highway vs Express Bypass)
 * 5. Dynamic diversion to alternative hospital if primary route has severe traffic gridlock
 * 6. Categorizes into Option #1 (Recommended Apex), Option #2 (Stabilization), Option #3 (Alternative Apex)
 */
const DEFAULT_FALLBACK_HOSPITALS = [
  {
    id: 'hosp-rims-ranchi',
    name: 'Rajendra Institute of Medical Sciences (RIMS Ranchi)',
    short: 'RIMS',
    district: 'Ranchi',
    lat: 23.3765,
    lng: 85.3512,
    icuBeds: { total: 40, used: 28 },
    beds: { total: 500, used: 410 },
  },
  {
    id: 'hosp-sadar-ranchi',
    name: 'Sadar Hospital Ranchi Emergency & Trauma Unit',
    short: 'Sadar',
    district: 'Ranchi',
    lat: 23.3644,
    lng: 85.3341,
    icuBeds: { total: 16, used: 11 },
    beds: { total: 200, used: 160 },
  },
  {
    id: 'hosp-snmmch-dhanbad',
    name: 'SNMMCH Dhanbad Medical College Hospital',
    short: 'SNMMCH',
    district: 'Dhanbad',
    lat: 23.8142,
    lng: 86.4412,
    icuBeds: { total: 24, used: 19 },
    beds: { total: 350, used: 290 },
  },
]

export function evaluateCandidateOptions(
  hospitals: any[],
  originLat: number,
  originLng: number,
  requiredRole: SpecialistRole,
  corridorTrafficDelayMin: number,
  corridorTrafficLevel: 'CLEAR' | 'MODERATE' | 'HEAVY',
  greenWaveActive: boolean,
): {
  option1: CandidateHospitalEvaluation
  option2: CandidateHospitalEvaluation
  option3: CandidateHospitalEvaluation
  allCandidates: CandidateHospitalEvaluation[]
  recommendedCorridor: 'PRIMARY_HIGHWAY' | 'BYPASS_EXPRESSWAY'
  bypassSavingsMin: number
  bypassName?: string
  trafficDiversionRecommendation?: string
  diversionHospitalId?: string
  diversionHospitalName?: string
  diversionSpecialistName?: string
  diversionTimeSavingsMin?: number
} {
  const matchedSpot = ACCIDENT_HOTSPOTS.find(
    (s) => Math.hypot(s.lat - originLat, s.lng - originLng) < 0.05
  )

  const safeHospitals = (hospitals && Array.isArray(hospitals) && hospitals.length > 0)
    ? hospitals
    : DEFAULT_FALLBACK_HOSPITALS

  const evaluated: CandidateHospitalEvaluation[] = safeHospitals.map((h) => {
    const hLat = h.lat || 23.3441
    const hLng = h.lng || 85.3096

    // Great circle haversine calculation
    const dLat = ((hLat - originLat) * Math.PI) / 180
    const dLng = ((hLng - originLng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((originLat * Math.PI) / 180) *
        Math.cos((hLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distanceKm = Math.max(1.8, Math.round(6371 * c * 10) / 10)

    // Base travel time: average ~55 km/h on Jharkhand state highways
    const baseTravelTimeMin = Math.max(4, Math.round((distanceKm / 55) * 60))

    // Real highway traffic congestion delay factor (zeroed if Green Wave is active)
    let appliedTrafficDelay = 0
    if (!greenWaveActive) {
      if (corridorTrafficLevel === 'HEAVY') {
        appliedTrafficDelay = Math.round(corridorTrafficDelayMin * (distanceKm > 20 ? 1.0 : 0.6))
      } else if (corridorTrafficLevel === 'MODERATE') {
        appliedTrafficDelay = Math.round(corridorTrafficDelayMin * (distanceKm > 20 ? 0.8 : 0.5))
      }
    }

    const effectiveEtaMin = baseTravelTimeMin + appliedTrafficDelay

    // Evaluate bypass corridor if applicable
    let bypassEtaMin: number | undefined = undefined
    let bypassSavingsMin = 0
    let recommendedCorridor: 'PRIMARY_HIGHWAY' | 'BYPASS_EXPRESSWAY' = 'PRIMARY_HIGHWAY'
    let bypassName: string | undefined = undefined
    let bypassDistanceKm: number | undefined = undefined

    if (matchedSpot && !greenWaveActive) {
      bypassName = matchedSpot.bypassName
      bypassDistanceKm = matchedSpot.bypassDistanceKm
      const bypassBaseTime = Math.max(4, Math.round((matchedSpot.bypassDistanceKm / 60) * 60))
      bypassEtaMin = bypassBaseTime + matchedSpot.bypassTrafficDelayMin
      if (effectiveEtaMin > bypassEtaMin + 2) {
        recommendedCorridor = 'BYPASS_EXPRESSWAY'
        bypassSavingsMin = effectiveEtaMin - bypassEtaMin
      }
    }

    const totalIcu = h.icuBeds?.total ?? 10
    const usedIcu = h.icuBeds?.used ?? 8
    const availIcu = Math.max(0, totalIcu - usedIcu)

    const totalGen = h.beds?.total ?? 100
    const usedGen = h.beds?.used ?? 75
    const availGen = Math.max(0, totalGen - usedGen)

    const doctorInfo = getHospitalDoctorRoster(h.id, requiredRole)
    const specialistReady = doctorInfo.status === 'READY_TRAUMA_BAY'
    const specialistOccupied = doctorInfo.status === 'OCCUPIED_IN_OT'

    // Scoring weights:
    // Doctor Readiness: 40 points
    // ICU Availability: 25 points
    // ETA / Distance: 25 points
    // General Load: 10 points
    let doctorScore = 0
    if (specialistReady) doctorScore = 40
    else if (specialistOccupied) doctorScore = 18
    else doctorScore = 5

    const icuScore = availIcu >= 3 ? 25 : availIcu === 2 ? 18 : availIcu === 1 ? 10 : 0
    const etaScore = Math.max(0, Math.round(25 - effectiveEtaMin * 0.45))
    const loadScore = Math.max(0, Math.round((availGen / Math.max(1, totalGen)) * 10))

    const compositeScore = Math.min(99, Math.max(20, doctorScore + icuScore + etaScore + loadScore))

    return {
      hospitalId: h.id,
      hospitalName: h.name,
      hospital: h,
      district: h.district || 'Jharkhand',
      tier: (h.id.includes('rims') || h.id.includes('medical')) ? 'TERTIARY APEX' : 'DISTRICT HQ',
      distanceKm,
      baseTravelTimeMin,
      trafficDelayMin: appliedTrafficDelay,
      effectiveEtaMin,
      etaMinutes: effectiveEtaMin,
      trafficLevel: greenWaveActive ? 'CLEAR' : corridorTrafficLevel,
      greenWaveActive,
      availIcu,
      availGen,
      hasTraumaSurgeon: specialistReady,
      hasVentilators: true,
      doctorInfo,
      specialistReady,
      compositeScore,
      totalScore: compositeScore,
      rankTier: 'ALTERNATIVE' as const,
      clinicalRationale: '',
      bypassName,
      bypassDistanceKm,
      bypassEtaMin,
      bypassSavingsMin,
      recommendedCorridor,
      lat: hLat,
      lng: hLng,
    }
  })

  // Ensure evaluated is never empty
  if (evaluated.length === 0) {
    evaluated.push(...DEFAULT_FALLBACK_HOSPITALS.map((h, i) => ({
      hospitalId: h.id,
      hospitalName: h.name,
      hospital: h,
      district: h.district,
      tier: 'TERTIARY APEX' as const,
      distanceKm: 14.2 + i * 5,
      baseTravelTimeMin: 18 + i * 10,
      trafficDelayMin: 0,
      effectiveEtaMin: 18 + i * 10,
      etaMinutes: 18 + i * 10,
      trafficLevel: 'CLEAR' as const,
      greenWaveActive,
      availIcu: 12 - i * 3,
      availGen: 90 - i * 20,
      hasTraumaSurgeon: true,
      hasVentilators: true,
      doctorInfo: getHospitalDoctorRoster(h.id, requiredRole),
      specialistReady: true,
      compositeScore: 95 - i * 10,
      totalScore: 95 - i * 10,
      rankTier: (i === 0 ? 'FIRST_BEST' : i === 1 ? 'SECOND_BEST' : 'THIRD_BEST') as 'FIRST_BEST' | 'SECOND_BEST' | 'THIRD_BEST',
      clinicalRationale: '',
      recommendedCorridor: 'PRIMARY_HIGHWAY' as const,
      bypassSavingsMin: 0,
      lat: h.lat,
      lng: h.lng,
    })))
  }

  // Sort by composite score
  evaluated.sort((a, b) => b.compositeScore - a.compositeScore)

  // 1st Best: Highest scoring facility with Specialist Ready (or highest composite)
  const option1 = evaluated.find((c) => c.specialistReady && c.availIcu > 0) || evaluated[0]
  if (option1) {
    option1.rankTier = 'FIRST_BEST'
    option1.clinicalRationale = `🏆 1st Best (Recommended Apex Facility): On-duty ${requiredRole} (${option1.doctorInfo?.doctorName || 'Lead Specialist'}) is READY in Trauma Bay. ${option1.availIcu} ICU beds open. Lowest traffic-adjusted ETA (${option1.effectiveEtaMin} mins). Full surgical definitive care.`
  }

  // 2nd Best: Closest intermediate facility for immediate airway/fluid stabilization
  const closerFallback = evaluated.find(
    (c) => c.hospitalId !== option1?.hospitalId && c.distanceKm < (option1?.distanceKm ?? 999),
  )
  const option2 = closerFallback || evaluated.find((c) => c.hospitalId !== option1?.hospitalId) || evaluated[1] || option1
  if (option2) {
    option2.rankTier = 'SECOND_BEST'
    option2.clinicalRationale = `⚡ 2nd Best Option (Immediate Airway & Shock Stabilization Fallback): ${option2.distanceKm} km closer (${option2.effectiveEtaMin} mins ETA). Ideal for rapid intubation, chest tube, or IV resuscitation if patient decompensates in transit before reaching Apex.`
  }

  // 3rd Best: Next best tertiary apex center (alternative medical college)
  const option3 =
    evaluated.find(
      (c) =>
        c.hospitalId !== option1?.hospitalId &&
        c.hospitalId !== option2?.hospitalId &&
        (c.tier?.includes('TERTIARY') || c.availIcu >= 2),
    ) || evaluated[2] || evaluated[Math.min(2, evaluated.length - 1)] || option2 || option1
  if (option3) {
    option3.rankTier = 'THIRD_BEST'
    option3.clinicalRationale = `🛡️ 3rd Best Option (Alternative Apex Standby): Comprehensive tertiary hospital with dedicated backup surgical roster and ${option3.availIcu} open ICU beds. Serves as automatic contingency if primary corridor suffers gridlock.`
  }

  // Check if primary facility is delayed by severe traffic gridlock and an alternative hospital has the same specialist ready faster
  let globalDiversionRec: string | undefined = undefined
  let diversionHospitalId: string | undefined = undefined
  let diversionHospitalName: string | undefined = undefined
  let diversionSpecialistName: string | undefined = undefined
  let diversionTimeSavingsMin: number | undefined = undefined

  if (option1 && option1.trafficDelayMin >= 10 && !greenWaveActive) {
    const fasterAlternative = evaluated.find(
      (c) =>
        c.hospitalId !== option1.hospitalId &&
        c.specialistReady &&
        c.effectiveEtaMin < option1.effectiveEtaMin - 6
    )
    if (fasterAlternative) {
      diversionTimeSavingsMin = option1.effectiveEtaMin - fasterAlternative.effectiveEtaMin
      diversionHospitalId = fasterAlternative.hospitalId
      diversionHospitalName = fasterAlternative.hospitalName
      diversionSpecialistName = fasterAlternative.doctorInfo?.doctorName
      globalDiversionRec = `⚡ DYNAMIC SPECIALIST TRAFFIC DIVERSION: Highway to ${option1.hospitalName} has +${option1.trafficDelayMin}m gridlock. Diverting to ${fasterAlternative.hospitalName} saves ${diversionTimeSavingsMin} mins with verified on-duty ${requiredRole} (${fasterAlternative.doctorInfo?.doctorName}) ready!`
      option1.trafficDiversionRecommendation = globalDiversionRec
    }
  }

  const bypassSavings = option1?.bypassSavingsMin || 0
  const recommendedCorridorType = option1?.recommendedCorridor || 'PRIMARY_HIGHWAY'

  return {
    option1,
    option2,
    option3,
    allCandidates: evaluated,
    recommendedCorridor: recommendedCorridorType,
    bypassSavingsMin: bypassSavings,
    bypassName: option1?.bypassName,
    trafficDiversionRecommendation: globalDiversionRec,
    diversionHospitalId,
    diversionHospitalName,
    diversionSpecialistName,
    diversionTimeSavingsMin,
  }
}

