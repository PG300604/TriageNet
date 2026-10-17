'use client'

import { cn } from '@/lib/utils'
import {
  EDGES,
  type Hospital,
  type TriageState,
  type Transfer,
  type Patient,
  hospitalStatus,
  STATUS_LABEL,
} from '@/lib/triage-data'
import { STATUS_CLASSES } from './status'
import {
  ArrowRight,
  Route,
  MapPin,
  Navigation,
  Sparkles,
  Activity,
  ShieldCheck,
  Truck,
  AlertTriangle,
  HeartPulse,
  BedDouble,
  CheckCircle2,
  PhoneCall,
  Clock,
  Zap,
  Radio,
  Sliders,
  Send,
  Building2,
  Flame,
  Check,
  PlusCircle,
  X,
  FileText,
  User,
  Smartphone,
  ExternalLink,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { MapHospitalNode, MapAmbulanceUnit } from './leaflet-map'
import { useAuth } from '@/lib/auth-context'
import { JHARKHAND_24_DISTRICTS, JHARKHAND_79_HOSPITALS } from '@/lib/jharkhand-data'
import { apiClient } from '@/lib/api-client'
import {
  ACCIDENT_HOTSPOTS,
  type AccidentHotspot,
  type SpecialistRole,
  evaluateCandidateOptions,
  type DoctorDutyInfo,
  type CandidateHospitalEvaluation,
} from '@/lib/accident-hotspots'
import { directorBridge } from '@/lib/director-bridge'

// Dynamically import Leaflet map component to prevent SSR window reference issues
const LeafletMap = dynamic(
  () => import('./leaflet-map').then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] w-full rounded-2xl bg-stone-100 animate-pulse flex items-center justify-center font-sans text-xs text-stone-500 font-medium">
        Loading Jharkhand Spatial Map Telemetry...
      </div>
    ),
  },
)

const W = 800
const H = 500

interface RegionalNetworkViewProps {
  state: TriageState
  selectedDistrict?: string
  onStateChange?: React.Dispatch<React.SetStateAction<TriageState>>
  onInjectArrival?: (severity: number, name: string, complaint: string) => void
}

export interface ActiveAmbulanceDispatch {
  id: string
  token: string
  ambulanceNumber: string
  ambulanceType: 'ALS (Advanced Life Support)' | 'BLS (Basic Life Support)'
  patientName: string
  incidentNature: string
  priority: 'P1_IMMEDIATE' | 'P2_URGENT' | 'P3_DELAYED'
  severityScore: number
  originName: string
  destinationHospitalId: string
  destinationHospitalName: string
  distanceKm: number
  initialEtaMinutes: number
  remainingMinutes: number
  status: 'DISPATCHED_TO_SCENE' | 'EN_ROUTE_TO_HOSPITAL' | 'ARRIVED_TRAUMA_BAY'
  vitals: {
    spo2: number
    heartRate: number
    systolicBp: number
    gcs: number
  }
}

function getLayoutPositions(hospitals: Hospital[]) {
  const n = hospitals.length
  const map = new Map<string, { x: number; y: number }>()
  if (n === 0) return map
  if (n === 1) {
    map.set(hospitals[0].id, { x: 400, y: 250 })
    return map
  }
  if (n <= 8) {
    const cx = 400
    const cy = 250
    const r = 165
    map.set(hospitals[0].id, { x: cx, y: cy })

    const others = hospitals.slice(1)
    others.forEach((h, i) => {
      const angle = (i * 2 * Math.PI) / others.length - Math.PI / 2
      const x = Math.round(cx + r * Math.cos(angle))
      const y = Math.round(cy + r * Math.sin(angle))
      map.set(h.id, { x, y })
    })
    return map
  }

  const cols = Math.ceil(Math.sqrt(n * 1.6))
  const rows = Math.ceil(n / cols)
  const xStep = 680 / (cols + 1)
  const yStep = 400 / (rows + 1)
  hospitals.forEach((h, i) => {
    const col = (i % cols) + 1
    const row = Math.floor(i / cols) + 1
    map.set(h.id, { x: Math.round(60 + col * xStep), y: Math.round(45 + row * yStep) })
  })
  return map
}

export function RegionalNetworkView({
  state,
  selectedDistrict = 'ALL',
  onStateChange,
  onInjectArrival,
}: RegionalNetworkViewProps) {
  const { hospitals, transfers } = state
  const { user, loginAsDemoRole } = useAuth()
  const canDispatch = user?.role === 'AMBULANCE_DISPATCH'

  const [hovered, setHovered] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'graph'>('map')
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(() => hospitals[0]?.id || 'jh-rims-ranchi')
  const [filterTier, setFilterTier] = useState<string>('ALL')

  // 108 Emergency Call & Intake Form State
  const [patientName, setPatientName] = useState('Ramesh Soren')
  const [incidentNature, setIncidentNature] = useState('High-Speed Highway Polytrauma (NH-33)')
  const [priorityTier, setPriorityTier] = useState<'P1_IMMEDIATE' | 'P2_URGENT' | 'P3_DELAYED'>('P1_IMMEDIATE')
  const [assignedAmbulance, setAssignedAmbulance] = useState('JH-01-ALS-1081')
  const [ambulanceType, setAmbulanceType] = useState<'ALS (Advanced Life Support)' | 'BLS (Basic Life Support)'>('ALS (Advanced Life Support)')
  
  // Real-time Onboard Vitals Telemetry
  const [spo2, setSpo2] = useState(82)
  const [heartRate, setHeartRate] = useState(138)
  const [systolicBp, setSystolicBp] = useState(84)
  const [gcs, setGcs] = useState(10)

  // GPS Location & Hotspot Presets
  const [selectedHotspot, setSelectedHotspot] = useState<AccidentHotspot>(() => ACCIDENT_HOTSPOTS[0])
  const [originLat, setOriginLat] = useState<number>(ACCIDENT_HOTSPOTS[0].lat)
  const [originLng, setOriginLng] = useState<number>(ACCIDENT_HOTSPOTS[0].lng)
  const [originName, setOriginName] = useState<string>(ACCIDENT_HOTSPOTS[0].name)
  const [activeHotspot, setActiveHotspot] = useState<string>(ACCIDENT_HOTSPOTS[0].id)
  const [requiredSpecialistRole, setRequiredSpecialistRole] = useState<SpecialistRole>(ACCIDENT_HOTSPOTS[0].requiredSpecialistRole)
  const [corridorTrafficLevel, setCorridorTrafficLevel] = useState<'CLEAR' | 'MODERATE' | 'HEAVY'>(ACCIDENT_HOTSPOTS[0].defaultTrafficLevel)
  const [corridorTrafficDelay, setCorridorTrafficDelay] = useState<number>(ACCIDENT_HOTSPOTS[0].defaultTrafficDelayMin)
  const [greenWaveActive, setGreenWaveActive] = useState<boolean>(false)

  // Multi-Ambulance Fleet State across Jharkhand
  const [fleetAmbulances, setFleetAmbulances] = useState<MapAmbulanceUnit[]>([
    {
      id: 'amb-1081',
      callSign: '108 ALS #1081',
      number: 'JH-01-ALS-1081',
      type: 'ALS',
      status: 'DISPATCHED',
      lat: 23.4832,
      lng: 85.4611,
      baseStationName: 'RIMS Central Trauma EMT Hub (Ranchi)',
      coverageRadiusKm: 25,
      patientName: 'Kunal Besra',
      incidentNature: 'NH-33 Toll High-Speed Collision',
      priority: 'P1',
      severityScore: 92,
      destinationHospitalId: hospitals[0]?.id || 'jh-rims-ranchi',
      destinationHospitalName: hospitals[0]?.name || 'Rajendra Institute of Medical Sciences (RIMS)',
      etaMinutes: 11,
      vitals: { spo2: 83, heartRate: 132, systolicBp: 86, gcs: 9 },
      crew: { driver: 'S. K. Verma', paramedic: 'Dr. A. Minz (EMT-Adv)' },
      equipment: ['Mindray Transport Vent', 'Philips MRx Defib', 'O2 Supply', 'Syringe Pump'],
    },
    {
      id: 'amb-1082',
      callSign: '108 ALS #1082',
      number: 'JH-01-ALS-1082',
      type: 'ALS',
      status: 'AVAILABLE_AT_BASE',
      lat: 23.3667,
      lng: 85.325,
      baseStationName: 'Sadar Hospital Base (Ranchi Central)',
      coverageRadiusKm: 20,
      crew: { driver: 'M. P. Yadav', paramedic: 'P. Linda (Paramedic)' },
      equipment: ['Transport Vent', 'Defibrillator', 'Crash Cart', 'Oxygen Tank'],
    },
    {
      id: 'amb-1083',
      callSign: '108 ALS #1083',
      number: 'JH-04-ALS-1083',
      type: 'ALS',
      status: 'DISPATCHED',
      lat: 23.7501,
      lng: 86.4162,
      baseStationName: 'SNMMCH Dhanbad Colliery Emergency Station',
      coverageRadiusKm: 30,
      patientName: 'Sunil Karmakar',
      incidentNature: 'Jharia Underground Mine Surge',
      priority: 'P1',
      severityScore: 89,
      destinationHospitalId: 'jh-shaheed-nirmal-mahto-medical-college-hospital-dhanbad',
      destinationHospitalName: 'SNMMCH Dhanbad',
      etaMinutes: 16,
      vitals: { spo2: 86, heartRate: 124, systolicBp: 94, gcs: 11 },
      crew: { driver: 'R. K. Roy', paramedic: 'S. Banerjee (Critical Care Paramedic)' },
      equipment: ['BIPAP/CPAP Vent', 'Defib Unit', 'Suction Machine', 'Multipara Monitor'],
    },
    {
      id: 'amb-1084',
      callSign: '108 BLS #1084',
      number: 'JH-05-BLS-1084',
      type: 'BLS',
      status: 'AVAILABLE_AT_BASE',
      lat: 22.8046,
      lng: 86.2029,
      baseStationName: 'MGM Medical College Hub (Jamshedpur)',
      coverageRadiusKm: 22,
      crew: { driver: 'D. Hansda', paramedic: 'A. Gorai (BLS Specialist)' },
      equipment: ['Stretcher Trolley', 'Portable Oxygen', 'First Aid Trauma Kit'],
    },
    {
      id: 'amb-1085',
      callSign: '108 ALS #1085',
      number: 'JH-02-ALS-1085',
      type: 'ALS',
      status: 'ON_SCENE',
      lat: 24.298,
      lng: 85.423,
      baseStationName: 'Sadar Hospital Hazaribagh / Barhi GT Road Base',
      coverageRadiusKm: 35,
      patientName: 'Devendra Tiwary',
      incidentNature: 'Barhi GT Road Multi-Vehicle Highway Pileup',
      priority: 'P1',
      severityScore: 88,
      destinationHospitalId: 'jh-hazaribagh-medical-college-hospital',
      destinationHospitalName: 'Hazaribagh Medical College Hospital',
      etaMinutes: 24,
      vitals: { spo2: 88, heartRate: 116, systolicBp: 102, gcs: 12 },
      crew: { driver: 'B. Paswan', paramedic: 'Dr. N. K. Pandey' },
      equipment: ['Spine Board & Extrication Collar', 'Automated CPR Machine', 'Transport Ventilator'],
    },
    {
      id: 'amb-1086',
      callSign: '108 BLS #1086',
      number: 'JH-03-BLS-1086',
      type: 'BLS',
      status: 'AVAILABLE_AT_BASE',
      lat: 23.6693,
      lng: 86.1511,
      baseStationName: 'Bokaro General Hospital EMT Base',
      coverageRadiusKm: 20,
      crew: { driver: 'K. N. Soren', paramedic: 'R. Kisku' },
      equipment: ['Vital Signs Monitor', 'Oxygen Resuscitator', 'Splints & Burn Dressings'],
    },
  ])

  const [fleetFilter, setFleetFilter] = useState<'ALL' | 'DISPATCHED' | 'AVAILABLE' | 'ON_SCENE'>('ALL')

  const filteredAmbulances = useMemo(() => {
    if (fleetFilter === 'DISPATCHED') return fleetAmbulances.filter((a) => a.status === 'DISPATCHED')
    if (fleetFilter === 'AVAILABLE') return fleetAmbulances.filter((a) => a.status === 'AVAILABLE_AT_BASE')
    if (fleetFilter === 'ON_SCENE') return fleetAmbulances.filter((a) => a.status === 'ON_SCENE')
    return fleetAmbulances
  }, [fleetAmbulances, fleetFilter])

  // Live Dispatches Fleet State
  const [activeDispatches, setActiveDispatches] = useState<ActiveAmbulanceDispatch[]>([
    {
      id: 'disp-101',
      token: 'JH-108-DISPATCH-9142',
      ambulanceNumber: 'JH-01-ALS-1081',
      ambulanceType: 'ALS (Advanced Life Support)',
      patientName: 'Kunal Besra',
      incidentNature: 'Blast Trauma & Hypoxia',
      priority: 'P1_IMMEDIATE',
      severityScore: 92,
      originName: 'NH-33 Toll Crash (Ormanjhi)',
      destinationHospitalId: hospitals[0]?.id || 'jh-rims-ranchi',
      destinationHospitalName: hospitals[0]?.name || 'Rajendra Institute of Medical Sciences (RIMS)',
      distanceKm: 14.8,
      initialEtaMinutes: 19,
      remainingMinutes: 11,
      status: 'EN_ROUTE_TO_HOSPITAL',
      vitals: { spo2: 83, heartRate: 132, systolicBp: 86, gcs: 9 },
    },
  ])

  const [lastDispatchAlert, setLastDispatchAlert] = useState<string | null>(null)

  // Dynamic Multi-Criteria Dijkstra & Doctor Availability Hospital Match Evaluator
  const candidateResults = useMemo(() => {
    return evaluateCandidateOptions(
      hospitals,
      originLat,
      originLng,
      requiredSpecialistRole,
      corridorTrafficDelay,
      corridorTrafficLevel,
      greenWaveActive,
    )
  }, [hospitals, originLat, originLng, requiredSpecialistRole, corridorTrafficDelay, corridorTrafficLevel, greenWaveActive])

  const option1 = candidateResults.option1
  const option2 = candidateResults.option2
  const option3 = candidateResults.option3
  const rankedCandidateHospitals = candidateResults.allCandidates
  const topMatch = candidateResults.option1
  const targetHospital = rankedCandidateHospitals.find((c) => c.hospital.id === selectedHospitalId || c.hospitalId === selectedHospitalId) || topMatch

  const [activeCorridorType, setActiveCorridorType] = useState<'PRIMARY' | 'BYPASS'>('PRIMARY')

  // Dynamic Dijkstra Shortest Path Polyline using real highway waypoints or bypass
  const dijkstraRoutePolyline = useMemo<[number, number][]>(() => {
    if (!targetHospital) return []

    // If targeted at Apex and real accident hotspot is active, use authentic road coordinates
    const targetId = targetHospital?.hospital?.id || targetHospital?.hospitalId
    const topId = topMatch?.hospital?.id || topMatch?.hospitalId
    const isTargetApex = Boolean(targetId && topId && targetId === topId)
    if (selectedHotspot && isTargetApex) {
      if (activeCorridorType === 'BYPASS' && selectedHotspot.bypassRouteWaypoints && selectedHotspot.bypassRouteWaypoints.length > 0) {
        return selectedHotspot.bypassRouteWaypoints
      }
      if (selectedHotspot.primaryRouteWaypoints && selectedHotspot.primaryRouteWaypoints.length > 0) {
        return selectedHotspot.primaryRouteWaypoints
      }
    }

    const startLat = originLat
    const startLng = originLng
    const endLat = targetHospital.lat
    const endLng = targetHospital.lng

    const points: [number, number][] = []
    const numSegments = 16
    for (let i = 0; i <= numSegments; i++) {
      const t = i / numSegments
      const baseLat = startLat + (endLat - startLat) * t
      const baseLng = startLng + (endLng - startLng) * t
      // Add natural highway curvature resembling NH-33 / NH-20 corridor
      const curvature = Math.sin(t * Math.PI) * 0.015
      const bendLat = baseLat + curvature * 0.6
      const bendLng = baseLng - curvature * 0.8
      points.push([Number(bendLat.toFixed(5)), Number(bendLng.toFixed(5))])
    }
    return points
  }, [originLat, originLng, targetHospital, selectedHotspot, activeCorridorType, topMatch])

  const [manualDispatchModalOpen, setManualDispatchModalOpen] = useState<boolean>(false)
  const [manualCallerName, setManualCallerName] = useState<string>('Subhash Murmu (NH-33 Toll Staff)')
  const [manualIncidentLocation, setManualIncidentLocation] = useState<string>('NH-33 Toll Plaza, Ormanjhi')
  const [manualComplaint, setManualComplaint] = useState<string>('Head Trauma, Multiple Rib Fractures & Tension Pneumothorax')
  const [manualPriority, setManualPriority] = useState<'P1_IMMEDIATE' | 'P2_URGENT' | 'P3_DELAYED'>('P1_IMMEDIATE')
  const [manualAmbulance, setManualAmbulance] = useState<string>('JH-01-ALS-1081')
  const [manualHospitalId, setManualHospitalId] = useState<string>(targetHospital?.hospital.id || hospitals[0]?.id || '')

  const liveAcuityScore = useMemo(() => {
    let score = 50
    if (spo2 < 85) score += 28
    else if (spo2 < 92) score += 15
    if (heartRate > 130) score += 16
    if (systolicBp < 90) score += 20
    if (gcs < 11) score += 15
    return Math.min(99, score)
  }, [spo2, heartRate, systolicBp, gcs])

  // Total available ICU beds across candidate facilities
  const totalCandidateIcuAvail = useMemo(() => {
    return rankedCandidateHospitals.reduce((sum, h) => sum + h.availIcu, 0)
  }, [rankedCandidateHospitals])

  const handleExecute108Dispatch = () => {
    if (!canDispatch) {
      setLastDispatchAlert(
        '🔒 Access Denied: 108 Emergency Dispatch & Bed Pre-Booking is restricted to 108 Central Fleet Command (JH-DSP-5001). Super Admin is in State Command Observer Mode.'
      )
      setTimeout(() => setLastDispatchAlert(null), 7000)
      return
    }
    if (!targetHospital) return

    const dispatchToken = `JH-108-DISPATCH-${Math.floor(1000 + Math.random() * 9000)}`
    const newDispatch: ActiveAmbulanceDispatch = {
      id: `disp-${Date.now()}`,
      token: dispatchToken,
      ambulanceNumber: assignedAmbulance,
      ambulanceType,
      patientName,
      incidentNature,
      priority: priorityTier,
      severityScore: liveAcuityScore,
      originName,
      destinationHospitalId: targetHospital.hospital.id,
      destinationHospitalName: targetHospital.hospital.name,
      distanceKm: targetHospital.distanceKm,
      initialEtaMinutes: targetHospital.etaMinutes,
      remainingMinutes: targetHospital.etaMinutes,
      status: 'EN_ROUTE_TO_HOSPITAL',
      vitals: { spo2, heartRate, systolicBp, gcs },
    }

    setActiveDispatches((prev) => [newDispatch, ...prev])

    if (onInjectArrival) {
      onInjectArrival(liveAcuityScore, `[108 ALS] ${patientName}`, `${incidentNature} · SpO₂ ${spo2}%`)
    }

    if (onStateChange) {
      onStateChange((prev) => {
        const nextHospitals = prev.hospitals.map((h) => {
          if (h.id === targetHospital.hospital.id) {
            const nextUsedIcu = Math.min(h.icuBeds.total, h.icuBeds.used + 1)
            const nextUsedBeds = Math.min(h.beds.total, h.beds.used + 1)
            return {
              ...h,
              beds: { ...h.beds, used: nextUsedBeds },
              icuBeds: { ...h.icuBeds, used: nextUsedIcu },
            }
          }
          return h
        })

        const newTransfer: Transfer = {
          id: `trans-${Date.now()}`,
          patientId: `P-108-${Math.floor(1000 + Math.random() * 9000)}`,
          patientLabel: `${patientName} (${assignedAmbulance})`,
          fromId: hospitals[0]?.id || targetHospital.hospital.id,
          toId: targetHospital.hospital.id,
          minutes: targetHospital.etaMinutes,
          algorithm: '108 Multi-Criteria Dijkstra Dispatch',
          active: true,
        }

        return {
          ...prev,
          hospitals: nextHospitals,
          transfers: [newTransfer, ...prev.transfers],
        }
      })
    }

    // Sync into active fleet units
    setFleetAmbulances((prev) => {
      const idx = prev.findIndex((a) => a.number === assignedAmbulance || a.callSign.includes(assignedAmbulance))
      if (idx !== -1) {
        const updated = [...prev]
        updated[idx] = {
          ...updated[idx],
          status: 'DISPATCHED',
          patientName,
          incidentNature,
          priority: priorityTier === 'P1_IMMEDIATE' ? 'P1' : priorityTier === 'P2_URGENT' ? 'P2' : 'P3',
          severityScore: liveAcuityScore,
          destinationHospitalId: targetHospital.hospital.id,
          destinationHospitalName: targetHospital.hospital.name,
          etaMinutes: targetHospital.etaMinutes,
          vitals: { spo2, heartRate, systolicBp, gcs },
        }
        return updated
      }
      return prev
    })

    setLastDispatchAlert(
      `🚨 ${assignedAmbulance} DISPATCHED! Pre-booked ICU bed at ${targetHospital.hospital.name}. ETA: ${targetHospital.etaMinutes} mins (Token: ${dispatchToken})`,
    )
    setTimeout(() => setLastDispatchAlert(null), 8000)
  }

  const handleMarkArrived = (dispId: string) => {
    if (!canDispatch) {
      setLastDispatchAlert(
        '🔒 Access Denied: Handover confirmation is restricted to 108 Central Dispatch Command (JH-DSP-5001).'
      )
      setTimeout(() => setLastDispatchAlert(null), 6000)
      return
    }
    const disp = activeDispatches.find((d) => d.id === dispId)
    setActiveDispatches((prev) =>
      prev.map((d) => (d.id === dispId ? { ...d, status: 'ARRIVED_TRAUMA_BAY', remainingMinutes: 0 } : d)),
    )

    if (disp) {
      setFleetAmbulances((prev) =>
        prev.map((a) =>
          a.number === disp.ambulanceNumber || a.callSign.includes(disp.ambulanceNumber)
            ? {
                ...a,
                status: 'AVAILABLE_AT_BASE',
                patientName: undefined,
                incidentNature: undefined,
                destinationHospitalId: undefined,
                destinationHospitalName: undefined,
              }
            : a
        )
      )
    }

    setLastDispatchAlert(`✅ Patient safely handed over to Trauma Bay team. Ambulance unit released to Standby!`)
    setTimeout(() => setLastDispatchAlert(null), 6000)
  }

  const triggerEmergencyHotspot = (hotspot: AccidentHotspot) => {
    setSelectedHotspot(hotspot)
    setActiveHotspot(hotspot.id)
    setOriginLat(hotspot.lat)
    setOriginLng(hotspot.lng)
    setOriginName(hotspot.name)
    setPatientName(hotspot.defaultPatient)
    setIncidentNature(hotspot.defaultIncident)
    setRequiredSpecialistRole(hotspot.requiredSpecialistRole)
    setCorridorTrafficLevel(hotspot.defaultTrafficLevel)
    setCorridorTrafficDelay(hotspot.defaultTrafficDelayMin)
    setSpo2(hotspot.defaultVitals.spo2)
    setHeartRate(hotspot.defaultVitals.heartRate)
    setSystolicBp(hotspot.defaultVitals.systolicBp)
    setGcs(hotspot.defaultVitals.gcs)
    setGreenWaveActive(false)
    setLastDispatchAlert(
      `🚨 [ACCIDENT CLUSTER ACTIVATED] ${hotspot.name} (${hotspot.blackspotRanking}). Required Doctor: ${hotspot.requiredSpecialistRole}. Computing Apex vs Fallback options...`
    )
    setTimeout(() => setLastDispatchAlert(null), 8000)
  }

  // Cross-Tab Remote Bridge (Director's View /control integration)
  useEffect(() => {
    const unsub = directorBridge.subscribe((ev) => {
      if (ev.type === 'TRIGGER_ACCIDENT_HOTSPOT') {
        const hotspot = ACCIDENT_HOTSPOTS.find((h) => h.id === ev.hotspotId) || {
          id: ev.hotspotId,
          name: ev.name,
          highway: 'Jharkhand State Highway Corridor',
          district: 'Statewide',
          lat: ev.lat,
          lng: ev.lng,
          monthlyAccidents: 12,
          blackspotRanking: 'State Hazard Blackspot',
          riskCategory: 'CRITICAL_BLACKSPOT' as const,
          defaultIncident: ev.incidentNature,
          defaultPatient: ev.patientName,
          requiredSpecialist: `${ev.requiredSpecialistRole} Team`,
          requiredSpecialistRole: ev.requiredSpecialistRole,
          baseCorridorKm: 18.5,
          defaultTrafficDelayMin: ev.trafficDelayMin,
          defaultTrafficLevel: ev.trafficLevel,
          defaultVitals: ev.vitals,
          primaryRouteWaypoints: [
            [ev.lat, ev.lng],
            [23.375, 85.34],
            [23.3667, 85.325],
          ] as [number, number][],
          bypassRouteWaypoints: [
            [ev.lat, ev.lng],
            [23.35, 85.37],
            [23.3667, 85.325],
          ] as [number, number][],
          bypassName: 'State Highway Ring Road Bypass',
          bypassDistanceKm: 22.4,
          bypassTrafficDelayMin: 2,
        }
        setSelectedHotspot(hotspot)
        setActiveHotspot(ev.hotspotId)
        setOriginLat(ev.lat)
        setOriginLng(ev.lng)
        setOriginName(ev.name)
        setPatientName(ev.patientName)
        setIncidentNature(ev.incidentNature)
        setRequiredSpecialistRole(ev.requiredSpecialistRole)
        setCorridorTrafficLevel(ev.trafficLevel)
        setCorridorTrafficDelay(ev.trafficDelayMin)
        setSpo2(ev.vitals.spo2)
        setHeartRate(ev.vitals.heartRate)
        setSystolicBp(ev.vitals.systolicBp)
        setGcs(ev.vitals.gcs)
        setGreenWaveActive(false)

        // Mobilize primary response ambulance
        setFleetAmbulances((prev) =>
          prev.map((a, idx) =>
            idx === 0 || a.number === 'JH-01-ALS-1081'
              ? {
                  ...a,
                  status: 'DISPATCHED',
                  patientName: ev.patientName,
                  incidentNature: ev.incidentNature,
                  priority: 'P1',
                  severityScore: 92,
                  vitals: ev.vitals,
                }
              : a
          )
        )

        setLastDispatchAlert(
          `🚨 [DIRECTOR BLACKSPOT SIMULATION] ${ev.name} triggered! Specialist: ${ev.requiredSpecialistRole}. 108 ALS Dispatched.`
        )
        setTimeout(() => setLastDispatchAlert(null), 8000)
      } else if (ev.type === 'TOGGLE_GREEN_WAVE') {
        setGreenWaveActive(ev.active)
        setLastDispatchAlert(
          ev.active
            ? '⚡ 108 GREEN WAVE PREEMPTION ACTIVE: Highway traffic signals preempted to green! Delay cleared to 0m (72 km/h).'
            : 'Green Wave preemption released. Standard highway delay factors active.'
        )
        setTimeout(() => setLastDispatchAlert(null), 6000)
      } else if (ev.type === 'UPDATE_PATIENT_VITALS') {
        setSpo2(ev.vitals.spo2)
        setHeartRate(ev.vitals.heartRate)
        setSystolicBp(ev.vitals.systolicBp)
        setGcs(ev.vitals.gcs)
        if (ev.patientName) setPatientName(ev.patientName)
        if (ev.incidentNature) setIncidentNature(ev.incidentNature)
        if (ev.requiredSpecialistRole) setRequiredSpecialistRole(ev.requiredSpecialistRole)

        setFleetAmbulances((prev) =>
          prev.map((a, idx) =>
            idx === 0 || a.number === 'JH-01-ALS-1081'
              ? {
                  ...a,
                  patientName: ev.patientName || a.patientName,
                  incidentNature: ev.incidentNature || a.incidentNature,
                  vitals: ev.vitals,
                }
              : a
          )
        )

        setLastDispatchAlert(
          `📱 [108 AMBULANCE TELEMETRY SYNC] Live in-transit vitals received: SpO₂ ${ev.vitals.spo2}%, GCS ${ev.vitals.gcs}, HR ${ev.vitals.heartRate} bpm, BP ${ev.vitals.systolicBp} mmHg.`
        )
        setTimeout(() => setLastDispatchAlert(null), 7000)
      } else if (ev.type === 'SELECT_DESTINATION_HOSPITAL') {
        setSelectedHospitalId(ev.hospitalId)
        setLastDispatchAlert(
          `🎯 [108 EMT ROUTE SELECTED] Ambulance locked destination: ${ev.hospitalName}. Recalculating Dijkstra corridor.`
        )
        setTimeout(() => setLastDispatchAlert(null), 7000)
      } else if (ev.type === 'DISPATCH_AMBULANCE_FROM_MOBILE') {
        const dispatchToken = `JH-108-MOBILE-${Math.floor(1000 + Math.random() * 9000)}`
        const newDispatch: ActiveAmbulanceDispatch = {
          id: `disp-mob-${Date.now()}`,
          token: dispatchToken,
          ambulanceNumber: ev.ambulanceNumber,
          ambulanceType: 'ALS (Advanced Life Support)',
          patientName: ev.patientName,
          incidentNature: ev.incidentNature,
          priority: 'P1_IMMEDIATE',
          severityScore: 94,
          originName,
          destinationHospitalId: ev.hospitalId,
          destinationHospitalName: ev.hospitalName,
          distanceKm: 18.4,
          initialEtaMinutes: ev.etaMinutes,
          remainingMinutes: ev.etaMinutes,
          status: 'EN_ROUTE_TO_HOSPITAL',
          vitals: ev.vitals,
        }
        setActiveDispatches((prev) => [newDispatch, ...prev])
        setSelectedHospitalId(ev.hospitalId)

        if (onInjectArrival) {
          onInjectArrival(94, `[108 ALS] ${ev.patientName}`, `${ev.incidentNature} · SpO₂ ${ev.vitals.spo2}%`)
        }

        setFleetAmbulances((prev) =>
          prev.map((a, idx) =>
            idx === 0 || a.number === ev.ambulanceNumber
              ? {
                  ...a,
                  status: 'DISPATCHED',
                  patientName: ev.patientName,
                  incidentNature: ev.incidentNature,
                  priority: 'P1',
                  severityScore: 94,
                  destinationHospitalId: ev.hospitalId,
                  destinationHospitalName: ev.hospitalName,
                  etaMinutes: ev.etaMinutes,
                  vitals: ev.vitals,
                }
              : a
          )
        )

        setLastDispatchAlert(
          `🚨 [MOBILE EMT DISPATCH ACTIVATED] ${ev.ambulanceNumber} en route to ${ev.hospitalName} (ETA: ${ev.etaMinutes} mins). Token: ${dispatchToken}`
        )
        setTimeout(() => setLastDispatchAlert(null), 9000)
      }
    })
    return () => unsub()
  }, [])

  const mapNodes: MapHospitalNode[] = rankedCandidateHospitals.map((c) => {
    const cId = c.hospital?.id || c.hospitalId
    const cName = c.hospital?.name || c.hospitalName || ''
    const cShort = (c.hospital?.short || '').toLowerCase()

    const f = JHARKHAND_79_HOSPITALS.find(
      (item) =>
        (item.id && cId && item.id === cId) ||
        (item.shortCode && cShort && item.shortCode.toLowerCase() === cShort) ||
        (item.name && cName && item.name.toLowerCase() === cName.toLowerCase()) ||
        (item.name && cName && item.name.toLowerCase().includes(cName.toLowerCase())) ||
        (cName && item.name && cName.toLowerCase().includes(item.name.toLowerCase()))
    )

    const totBeds = (c.hospital?.beds && c.hospital.beds.total > 0)
      ? c.hospital.beds.total
      : (f ? f.totalGeneralBeds + f.totalIcuBeds : 100)

    const usedB = (c.hospital?.beds && c.hospital.beds.used !== undefined)
      ? c.hospital.beds.used
      : (f ? Math.max(0, (f.totalGeneralBeds - f.availableGeneralBeds) + (f.totalIcuBeds - f.availableIcuBeds)) : 68)

    return {
      id: cId,
      name: cName,
      districtName: c.hospital?.district || f?.districtName || selectedDistrict,
      facilityTier: c.tier || 'TERTIARY APEX',
      lat: c.lat,
      lng: c.lng,
      totalBeds: totBeds,
      usedBeds: usedB,
      availableGeneralBeds: c.availGen ?? 50,
      availableIcuBeds: c.availIcu ?? 5,
      hasVentilator: c.hasVentilators ?? true,
      hasTraumaSurgery: c.hasTraumaSurgeon ?? true,
      hasBloodBank: true,
    }
  })

  const layoutMap = getLayoutPositions(hospitals)
  // Active emergency transfer edges from state transfers and live ambulance dispatches
  const activeTransfers = useMemo(() => {
    const list = [...transfers.filter((t) => t.active)]
    activeDispatches.forEach((disp) => {
      if (disp.status === 'EN_ROUTE_TO_HOSPITAL' && disp.destinationHospitalId) {
        const rootId = hospitals[0]?.id || 'hosp-1'
        if (disp.destinationHospitalId !== rootId && !list.some((t) => t.toId === disp.destinationHospitalId)) {
          list.push({
            id: `disp-trans-${disp.id}`,
            patientId: disp.token,
            patientLabel: `${disp.patientName} (${disp.ambulanceNumber})`,
            fromId: rootId,
            toId: disp.destinationHospitalId,
            minutes: disp.remainingMinutes,
            algorithm: '108 Multi-Criteria Dijkstra Dispatch',
            active: true,
          })
        }
      }
    })
    return list
  }, [transfers, activeDispatches, hospitals])

  const inFlightCount = activeDispatches.filter((d) => d.status !== 'ARRIVED_TRAUMA_BAY').length

  const currentCorridorDistance = activeCorridorType === 'BYPASS' && selectedHotspot?.bypassDistanceKm
    ? selectedHotspot.bypassDistanceKm
    : targetHospital.distanceKm

  const currentCorridorEta = activeCorridorType === 'BYPASS' && candidateResults.bypassSavingsMin > 0
    ? Math.max(4, targetHospital.etaMinutes - candidateResults.bypassSavingsMin)
    : targetHospital.etaMinutes

  return (
    <div className="flex flex-col gap-6 font-sans text-stone-900">
      {/* Alert Notification Toast */}
      {lastDispatchAlert && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-200 bg-gradient-to-r from-red-600 to-rose-700 p-4 text-white shadow-lg animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <Radio className="size-5 animate-pulse text-[#ffedd7]" />
            <span className="text-xs font-semibold uppercase tracking-wide">{lastDispatchAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setLastDispatchAlert(null)}
            className="rounded-lg bg-black/20 px-2.5 py-1 text-xs font-bold hover:bg-black/30 cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* MANUAL 108 EMERGENCY DISPATCH MODAL (USER ENTRY FOR 108 DISPATCHER ROLE) */}
      <AnimatePresence>
        {manualDispatchModalOpen && (
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
                    <Truck className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#382416] flex items-center gap-2">
                      Manual 108 Emergency Call &amp; Dispatch
                    </h3>
                    <p className="text-xs text-stone-500">
                      Emergency Medical Dispatcher Console · Formulate &amp; Authorize Ambulance Dispatch
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setManualDispatchModalOpen(false)}
                  className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  const targetH = hospitals.find((h) => h.id === manualHospitalId) || hospitals[0]
                  const dispatchToken = `JH-108-DISPATCH-${Math.floor(1000 + Math.random() * 9000)}`
                  const newDisp: ActiveAmbulanceDispatch = {
                    id: `disp-${Date.now()}`,
                    token: dispatchToken,
                    ambulanceNumber: manualAmbulance,
                    ambulanceType: manualAmbulance.includes('ALS') ? 'ALS (Advanced Life Support)' : 'BLS (Basic Life Support)',
                    patientName: manualCallerName,
                    incidentNature: manualComplaint,
                    priority: manualPriority,
                    severityScore: manualPriority === 'P1_IMMEDIATE' ? 88 : manualPriority === 'P2_URGENT' ? 68 : 42,
                    originName: manualIncidentLocation,
                    destinationHospitalId: targetH.id,
                    destinationHospitalName: targetH.name,
                    distanceKm: 16.4,
                    initialEtaMinutes: 18,
                    remainingMinutes: 18,
                    status: 'EN_ROUTE_TO_HOSPITAL',
                    vitals: { spo2, heartRate, systolicBp, gcs },
                  }

                  setActiveDispatches((prev) => [newDisp, ...prev])
                  setFleetAmbulances((prev) =>
                    prev.map((a) =>
                      a.number === manualAmbulance || a.callSign.includes(manualAmbulance)
                        ? {
                            ...a,
                            status: 'DISPATCHED',
                            patientName: manualCallerName,
                            incidentNature: manualComplaint,
                            destinationHospitalId: targetH.id,
                            destinationHospitalName: targetH.name,
                            etaMinutes: 18,
                          }
                        : a
                    )
                  )

                  setManualDispatchModalOpen(false)
                  setLastDispatchAlert(`🚨 [MANUAL DISPATCH EXECUTED] ${manualAmbulance} mobilized to ${manualIncidentLocation} for ${manualCallerName}. Target: ${targetH.name}.`)
                }}
                className="space-y-3.5 text-xs"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Patient / Caller Name:
                    </label>
                    <input
                      type="text"
                      required
                      value={manualCallerName}
                      onChange={(e) => setManualCallerName(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Incident Location / Landmark:
                    </label>
                    <input
                      type="text"
                      required
                      value={manualIncidentLocation}
                      onChange={(e) => setManualIncidentLocation(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                    Emergency Nature &amp; Complaint:
                  </label>
                  <input
                    type="text"
                    required
                    value={manualComplaint}
                    onChange={(e) => setManualComplaint(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Triage Priority:
                    </label>
                    <select
                      value={manualPriority}
                      onChange={(e) => setManualPriority(e.target.value as any)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-2.5 py-2 font-bold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    >
                      <option value="P1_IMMEDIATE">P1 (Immediate Critical)</option>
                      <option value="P2_URGENT">P2 (Urgent Trauma)</option>
                      <option value="P3_DELAYED">P3 (Delayed / Stable)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Assign 108 Ambulance:
                    </label>
                    <select
                      value={manualAmbulance}
                      onChange={(e) => setManualAmbulance(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-2.5 py-2 font-bold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    >
                      {fleetAmbulances.map((a) => (
                        <option key={a.id} value={a.number || a.callSign}>
                          {a.callSign} ({a.type}) · {a.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-600 block mb-1">
                      Pre-Booked Hospital:
                    </label>
                    <select
                      value={manualHospitalId}
                      onChange={(e) => setManualHospitalId(e.target.value)}
                      className="w-full rounded-xl border border-stone-300 bg-stone-50 px-2.5 py-2 font-bold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    >
                      {hospitals.map((h) => (
                        <option key={h.id} value={h.id}>
                          {h.short} — {h.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
                  <button
                    type="button"
                    onClick={() => setManualDispatchModalOpen(false)}
                    className="rounded-xl border border-stone-300 px-4 py-2 font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#ea580c] hover:bg-[#d94e08] text-white px-5 py-2 font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
                  >
                    <Truck className="size-4" />
                    <span>Authorize &amp; Dispatch Unit</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
              <Truck className="size-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#382416]">
              108 Ambulance Dispatch &amp; Regional Spatial Routing
            </h2>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-stone-600 mt-1">
            Real-time GPS incident positioning, multi-criteria Dijkstra hospital matching, pre-booked ICU beds, and live fleet handover.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setManualDispatchModalOpen(true)}
            className="rounded-xl bg-[#ea580c] hover:bg-[#d94e08] text-white px-3.5 py-2 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="size-3.5" />
            <span>Manual 108 Dispatch</span>
          </button>

          <a
            href="/ambulance"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3.5 py-2 text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <Smartphone className="size-3.5 text-amber-700" />
            <span>108 EMT Mobile App</span>
            <ExternalLink className="size-3 text-amber-600" />
          </a>

          {/* Spatial Map / Topology Tab Switcher */}
          <div className="inline-flex p-1 bg-stone-100 border border-stone-200 rounded-xl shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'map'
                ? 'bg-[#382416] text-[#ffedd7] shadow-xs'
                : 'text-stone-600 hover:text-[#382416] hover:bg-stone-200/60',
            )}
          >
            <MapPin className="size-3.5 text-[#ea580c]" />
            Spatial GIS Map
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('graph')}
            className={cn(
              'px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'graph'
                ? 'bg-[#382416] text-[#ffedd7] shadow-xs'
                : 'text-stone-600 hover:text-[#382416] hover:bg-stone-200/60',
            )}
          >
            <Route className="size-3.5 text-[#ea580c]" />
            Dijkstra Topology
          </button>
        </div>
      </div>
      </div>

      {/* 4-Card Boltshift/Starline Metric Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active In-Flight Dispatches (Hero Terracotta) */}
        <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-br from-[#ea580c] to-[#c2410c] p-5 text-white shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-orange-100">
              Active Dispatches
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-white/20">
              <Radio className="size-4 text-white animate-pulse" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight">{inFlightCount}</span>
            <span className="text-xs font-medium text-orange-100">Units In Transit</span>
          </div>
          <p className="mt-2 text-xs text-orange-100/80">
            {inFlightCount > 0 ? 'Live GPS beacon telemetry transmitting' : 'All fleet units at bay readiness'}
          </p>
        </div>

        {/* Card 2: Connected Candidate Facilities */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Candidate Facilities
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-stone-100 text-stone-700">
              <Building2 className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-[#382416]">
              {rankedCandidateHospitals.length}
            </span>
            <span className="text-xs font-medium text-stone-500">Nodes Synced</span>
          </div>
          <p className="mt-2 text-xs text-stone-600">
            {selectedDistrict === 'ALL' ? 'Statewide Net (Jharkhand)' : `${selectedDistrict} District Scope`}
          </p>
        </div>

        {/* Card 3: Regional ICU Bed Pool */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Regional ICU Pool
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-red-50 text-red-600">
              <BedDouble className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-red-700">
              {totalCandidateIcuAvail}
            </span>
            <span className="text-xs font-medium text-stone-500">Available Beds</span>
          </div>
          <p className="mt-2 text-xs text-stone-600">
            Pre-reservation hold capability active
          </p>
        </div>

        {/* Card 4: Shortest Route Transit Latency */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs hover:border-stone-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">
              Fastest ETA Match
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-emerald-700">
              {topMatch?.etaMinutes ?? 12}
            </span>
            <span className="text-xs font-medium text-stone-500">Mins ({topMatch?.distanceKm ?? 14} km)</span>
          </div>
          <p className="mt-2 text-xs text-stone-600">
            To {topMatch?.hospital.short ?? 'Nearest Apex Facility'}
          </p>
        </div>
      </div>

      {/* Scope Filter Ribbon & Incident Hotspots */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Command Scope:</span>
              <span className="inline-flex items-center gap-1.5 bg-[#382416] text-[#ffedd7] text-xs font-semibold py-1 px-3 rounded-xl shadow-2xs">
                <MapPin className="size-3 text-[#ea580c]" />
                {selectedDistrict === 'ALL' ? 'Statewide (All 24 Districts)' : `${selectedDistrict.toUpperCase()} District`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-500">Facility Tier:</span>
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="bg-stone-50 border border-stone-200 text-stone-800 text-xs font-semibold py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ea580c]"
              >
                <option value="ALL">All Facility Tiers</option>
                <option value="TERTIARY">Tertiary (Medical Colleges & Apex)</option>
                <option value="DISTRICT">District (Sadar Hospitals)</option>
                <option value="SUB_DIVISIONAL">Sub-Divisional (SDH Referral)</option>
                <option value="CHC">CHC (Community Health Centers)</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Click an incident hotspot below to snap GPS coordinates & recompute Dijkstra optimal routing:
          </div>
        </div>

        {/* Hotspot Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-stone-100">
          <span className="text-[11px] font-mono font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1.5 mr-1">
            <span className="size-2 rounded-full bg-rose-600 animate-ping"></span>
            AI Incident Blackspots:
          </span>
          {ACCIDENT_HOTSPOTS.map((spot) => {
            const isCurrent = activeHotspot === spot.id
            return (
              <button
                key={spot.id}
                type="button"
                onClick={() => triggerEmergencyHotspot(spot)}
                className={cn(
                  'px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 shadow-2xs',
                  isCurrent
                    ? 'bg-[#382416] text-[#ffedd7] border-[#382416] shadow-xs ring-2 ring-orange-500/30'
                    : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100',
                )}
              >
                <Flame className={cn('size-3.5 shrink-0', isCurrent ? 'text-[#ea580c]' : 'text-stone-400')} />
                <span className="font-bold">{spot.name}</span>
                <span
                  className={cn(
                    'text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold',
                    isCurrent ? 'bg-orange-950/60 text-orange-300' : 'bg-stone-200 text-stone-600',
                  )}
                >
                  {spot.monthlyAccidents} crashes/mo · {spot.requiredSpecialistRole}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Grid: Spatial Map & Intake Telemetry vs Ranked Facilities & Fleet */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Left Column: Spatial Map / Topology + Floating Telemetry HUD */}
        <div className="space-y-4">
          {activeTab === 'map' ? (
            <div className="rounded-2xl border border-stone-200/80 bg-white p-3 shadow-sm overflow-hidden space-y-3">
              {/* Fleet Filter Bar & Status Overview */}
              <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-stone-100">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mr-1">
                    Fleet Filter:
                  </span>
                  <button
                    type="button"
                    onClick={() => setFleetFilter('ALL')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer',
                      fleetFilter === 'ALL'
                        ? 'bg-[#382416] text-[#ffedd7] shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/60'
                    )}
                  >
                    All Fleet ({fleetAmbulances.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFleetFilter('DISPATCHED')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                      fleetFilter === 'DISPATCHED'
                        ? 'bg-[#ea580c] text-white shadow-2xs'
                        : 'bg-orange-50 text-[#ea580c] border border-orange-200 hover:bg-orange-100/60'
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-[#ea580c] animate-ping"></span>
                    Dispatched ({fleetAmbulances.filter((a) => a.status === 'DISPATCHED').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFleetFilter('AVAILABLE')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                      fleetFilter === 'AVAILABLE'
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100/60'
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-emerald-500"></span>
                    Ready at Base ({fleetAmbulances.filter((a) => a.status === 'AVAILABLE_AT_BASE').length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFleetFilter('ON_SCENE')}
                    className={cn(
                      'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                      fleetFilter === 'ON_SCENE'
                        ? 'bg-rose-700 text-white shadow-2xs'
                        : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100/60'
                    )}
                  >
                    On-Scene ({fleetAmbulances.filter((a) => a.status === 'ON_SCENE').length})
                  </button>
                </div>

                <div className="text-[11px] text-stone-500 font-medium hidden sm:block">
                  Click any ambulance or hospital marker to inspect real-time telemetry
                </div>
              </div>

              {/* Live Dijkstra Route & Green Corridor Telemetry Strip (Uber Style) */}
              <div className="rounded-xl border border-orange-500/30 bg-gradient-to-r from-[#2c1b0e] via-[#382416] to-[#25170d] p-3 text-white shadow-sm flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-lg bg-orange-500/20 text-[#ea580c] border border-orange-500/40 flex items-center justify-center shrink-0">
                    <Route className="size-4 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-orange-400 uppercase">
                        DIJKSTRA OPTIMAL CORRIDOR
                      </span>
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">GREEN WAVE ACTIVE</span>
                    </div>
                    <div className="text-xs font-bold text-stone-100 flex items-center gap-1.5 mt-0.5">
                      <span>{originName}</span>
                      <ArrowRight className="size-3 text-orange-400" />
                      <span className="text-orange-200">{targetHospital.hospital.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block uppercase">
                      {activeCorridorType === 'BYPASS' ? 'BYPASS DISTANCE' : 'HIGHWAY DISTANCE'}
                    </span>
                    <strong className="text-orange-400 font-bold">{currentCorridorDistance} km · ~{currentCorridorEta}m ETA</strong>
                  </div>
                  <div className="h-6 w-px bg-stone-700 hidden sm:block"></div>
                  <div className="text-right hidden sm:block">
                    <span className="text-[10px] text-stone-400 block uppercase">TARGET ICU BEDS</span>
                    <strong className={targetHospital.availIcu > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {targetHospital.availIcu > 0 ? `${targetHospital.availIcu} ICU Open` : 'Emergency Surge'}
                    </strong>
                  </div>
                  <div className="h-6 w-px bg-stone-700 hidden sm:block"></div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block uppercase">UNIT DISPATCHED</span>
                    <strong className="text-cyan-400 font-bold">{assignedAmbulance}</strong>
                  </div>
                </div>
              </div>

              {/* Multi-Corridor Bypass Selector & Corridor Details */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 rounded-xl border border-stone-200/90 bg-stone-50/90 px-3.5 py-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold text-stone-600">Corridor Route:</span>
                  <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5 shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setActiveCorridorType('PRIMARY')}
                      className={cn(
                        'px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5',
                        activeCorridorType === 'PRIMARY'
                          ? 'bg-[#382416] text-[#ffedd7] shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100',
                      )}
                    >
                      <span>🛣️ Route 1: Primary Highway</span>
                      {corridorTrafficDelay > 0 && !greenWaveActive && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 font-mono">
                          +{corridorTrafficDelay}m
                        </span>
                      )}
                    </button>
                    {selectedHotspot?.bypassName && (
                      <button
                        type="button"
                        onClick={() => setActiveCorridorType('BYPASS')}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5',
                          activeCorridorType === 'BYPASS'
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100',
                        )}
                      >
                        <span>⚡ Route 2: {selectedHotspot.bypassName}</span>
                        {candidateResults.bypassSavingsMin > 0 && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono font-bold">
                            Saves ~{candidateResults.bypassSavingsMin}m
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="text-[11px] font-medium text-stone-500 flex items-center gap-2">
                  <span>
                    {activeCorridorType === 'BYPASS' && selectedHotspot?.bypassDistanceKm
                      ? `Bypass Corridor: ${selectedHotspot.bypassDistanceKm} km · Fast-Flow Ring Road`
                      : `Primary Highway: ${targetHospital.distanceKm} km · ${corridorTrafficLevel} Congestion`}
                  </span>
                </div>
              </div>

              {/* Dynamic Traffic Gridlock Diversion Recommendation Alert */}
              {candidateResults.trafficDiversionRecommendation && (
                <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 p-3.5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-start sm:items-center gap-2.5 text-amber-950">
                    <div className="p-1.5 rounded-lg bg-amber-500 text-white shrink-0 mt-0.5 sm:mt-0 shadow-2xs">
                      <AlertTriangle className="size-4" />
                    </div>
                    <div>
                      <div className="font-bold text-amber-900 flex items-center gap-2">
                        <span>AI Traffic & Specialist Diversion Re-Routing</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900">
                          Gridlock Bypass Active
                        </span>
                      </div>
                      <p className="text-stone-700 mt-0.5 leading-snug">
                        {candidateResults.trafficDiversionRecommendation}
                      </p>
                    </div>
                  </div>

                  {candidateResults.diversionHospitalId && (
                    <button
                      type="button"
                      onClick={() => {
                        if (candidateResults.diversionHospitalId) {
                          setSelectedHospitalId(candidateResults.diversionHospitalId)
                          setLastDispatchAlert(
                            `🔄 [AI TRAFFIC DIVERSION EXECUTED] Route rerouted to ${candidateResults.diversionHospitalName}! Verified on-duty ${candidateResults.diversionSpecialistName} notified.`
                          )
                          setTimeout(() => setLastDispatchAlert(null), 8000)
                        }
                      }}
                      className="shrink-0 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs cursor-pointer transition-all shadow-sm flex items-center gap-1.5 hover:scale-[1.02]"
                    >
                      <Route className="size-3.5" />
                      Divert to {candidateResults.diversionHospitalName} (-{candidateResults.diversionTimeSavingsMin}m)
                    </button>
                  )}
                </div>
              )}

              <LeafletMap
                hospitals={mapNodes}
                selectedHospitalId={selectedHospitalId}
                onSelectHospital={setSelectedHospitalId}
                ambulances={filteredAmbulances}
                selectedAmbulanceId={assignedAmbulance}
                onSelectAmbulance={(amb) => {
                  if (amb) {
                    setAssignedAmbulance(amb.number)
                    if (amb.destinationHospitalId) setSelectedHospitalId(amb.destinationHospitalId)
                  }
                }}
                ambulanceLocation={{ lat: originLat, lng: originLng }}
                routePolyline={dijkstraRoutePolyline}
                showCoverageZones={true}
                accidentHotspot={{
                  id: selectedHotspot.id,
                  name: selectedHotspot.name,
                  highway: selectedHotspot.highway,
                  district: selectedHotspot.district,
                  lat: originLat,
                  lng: originLng,
                  monthlyAccidents: selectedHotspot.monthlyAccidents,
                  blackspotRanking: selectedHotspot.blackspotRanking,
                  riskCategory: selectedHotspot.riskCategory,
                }}
                trafficCondition={{
                  level: greenWaveActive ? 'CLEAR' : corridorTrafficLevel,
                  delayMin: greenWaveActive ? 0 : corridorTrafficDelay,
                  greenWaveActive,
                  speedKmH: greenWaveActive ? 74 : corridorTrafficLevel === 'HEAVY' ? 24 : 40,
                }}
                onToggleGreenWave={() => {
                  const next = !greenWaveActive
                  setGreenWaveActive(next)
                  directorBridge.send({ type: 'TOGGLE_GREEN_WAVE', active: next })
                }}
                onMarkArrived={canDispatch ? (ambId) => {
                  setFleetAmbulances((prev) =>
                    prev.map((a) =>
                      a.id === ambId
                        ? {
                            ...a,
                            status: 'AVAILABLE_AT_BASE',
                            patientName: undefined,
                            incidentNature: undefined,
                            destinationHospitalId: undefined,
                            destinationHospitalName: undefined,
                          }
                        : a
                    )
                  )
                  setLastDispatchAlert(`✅ Patient safely handed over to Trauma Bay. Unit returned to standby!`)
                  setTimeout(() => setLastDispatchAlert(null), 6000)
                } : undefined}
              />
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 text-xs">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-[#382416]">Dijkstra Minimum-Time Transfer Topology</span>
                </div>
                <div className="flex items-center gap-3 text-stone-500 text-[11px] font-medium">
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-emerald-500"></span> Normal (&lt;80%)</span>
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-amber-500"></span> Elevated (&gt;80%)</span>
                  <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-red-500 animate-pulse"></span> Surge (&gt;95%)</span>
                </div>
              </div>

              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="h-[480px] w-full bg-gradient-to-br from-stone-50/60 via-white to-[#f7f2ea]/40 rounded-xl"
                role="img"
                aria-label="Regional hospital transfer network graph"
              >
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
                  </marker>
                </defs>

                {/* Base road network edges */}
                {(state.edges && state.edges.length > 0 ? state.edges : EDGES).map((edge) => {
                  const pa = layoutMap.get(edge.fromId)
                  const pb = layoutMap.get(edge.toId)

                  if (!pa || !pb) return null
                  const dx = pb.x - pa.x
                  const dy = pb.y - pa.y
                  const len = Math.hypot(dx, dy) || 1
                  const off = 18
                  const mx = (pa.x + pb.x) / 2 + (-dy / len) * off
                  const my = (pa.y + pb.y) / 2 + (dx / len) * off
                  return (
                    <g key={`${edge.fromId}-${edge.toId}`}>
                      <line
                        x1={pa.x}
                        y1={pa.y}
                        x2={pb.x}
                        y2={pb.y}
                        stroke="#cbd5e1"
                        strokeWidth={2}
                        strokeDasharray="4 2"
                        opacity={0.8}
                      />
                      <g className="cursor-pointer">
                        <rect
                          x={mx - 30}
                          y={my - 10}
                          width={60}
                          height={20}
                          rx={10}
                          fill="#ffffff"
                          stroke="#cbd5e1"
                          strokeWidth={1}
                          className="shadow-2xs"
                        />
                        <text
                          x={mx}
                          y={my + 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-stone-700 font-sans text-[10px] font-semibold"
                        >
                          ⏱ {edge.minutes}m
                        </text>
                      </g>
                    </g>
                  )
                })}

                {/* Active emergency transfer edges with animated patient flow */}
                {activeTransfers.map((t) => {
                  const pa = layoutMap.get(t.fromId)
                  const pb = layoutMap.get(t.toId)
                  if (!pa || !pb) return null
                  const isHovered = hovered === t.id
                  return (
                    <g key={t.id}>
                      <line
                        x1={pa.x}
                        y1={pa.y}
                        x2={pb.x}
                        y2={pb.y}
                        stroke="#dc2626"
                        strokeWidth={isHovered ? 4.5 : 3}
                        markerEnd="url(#arrow)"
                        className="edge-active animate-pulse"
                        opacity={hovered && !isHovered ? 0.35 : 1}
                      />
                      {/* Animated Primary Patient Flow Particle */}
                      <circle cx="0" cy="0" r="5" fill="#dc2626" opacity="0.95">
                        <animateMotion
                          path={`M ${pa.x} ${pa.y} L ${pb.x} ${pb.y}`}
                          dur="2.8s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx="0" cy="0" r="2.5" fill="#ffffff" opacity="0.95">
                        <animateMotion
                          path={`M ${pa.x} ${pa.y} L ${pb.x} ${pb.y}`}
                          dur="2.8s"
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Staggered Follower Particle */}
                      <circle cx="0" cy="0" r="3.5" fill="#f97316" opacity="0.85">
                        <animateMotion
                          path={`M ${pa.x} ${pa.y} L ${pb.x} ${pb.y}`}
                          dur="2.8s"
                          begin="1.4s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx="0" cy="0" r="1.8" fill="#ffffff" opacity="0.9">
                        <animateMotion
                          path={`M ${pa.x} ${pa.y} L ${pb.x} ${pb.y}`}
                          dur="2.8s"
                          begin="1.4s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  )
                })}

                {/* Highlighted Dijkstra Shortest-Path Route Corridors with Continuous Flow Stream */}
                {(() => {
                  const rootId = hospitals[0]?.id || 'hosp-1'
                  const destId = targetHospital.hospital.id
                  const pa = layoutMap.get(rootId)
                  const pb = layoutMap.get(destId)
                  if (!pa || !pb || rootId === destId) return null
                  return (
                    <g key="dijkstra-active-path">
                      <line
                        x1={pa.x}
                        y1={pa.y}
                        x2={pb.x}
                        y2={pb.y}
                        stroke="#ea580c"
                        strokeWidth={8}
                        opacity={0.3}
                        strokeLinecap="round"
                      />
                      <line
                        x1={pa.x}
                        y1={pa.y}
                        x2={pb.x}
                        y2={pb.y}
                        stroke="#ff6b00"
                        strokeWidth={3.5}
                        strokeDasharray="6 4"
                        markerEnd="url(#arrow)"
                        className="animate-pulse"
                      />
                      {/* Dijkstra Active Flow Pulse 1 */}
                      <circle cx="0" cy="0" r="6" fill="#ea580c" opacity="0.4">
                        <animateMotion
                          path={`M ${pa.x} ${pa.y} L ${pb.x} ${pb.y}`}
                          dur="2.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle cx="0" cy="0" r="4.5" fill="#ea580c" stroke="#ffffff" strokeWidth="1.5">
                        <animateMotion
                          path={`M ${pa.x} ${pa.y} L ${pb.x} ${pb.y}`}
                          dur="2.2s"
                          repeatCount="indefinite"
                        />
                      </circle>

                      {/* Dijkstra Active Flow Pulse 2 */}
                      <circle cx="0" cy="0" r="4" fill="#fbbf24" stroke="#ffffff" strokeWidth="1">
                        <animateMotion
                          path={`M ${pa.x} ${pa.y} L ${pb.x} ${pb.y}`}
                          dur="2.2s"
                          begin="1.1s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </g>
                  )
                })()}

                {/* Hospital Nodes */}
                {hospitals.map((h) => {
                  const pos = layoutMap.get(h.id) ?? { x: 400, y: 250 }
                  const { x, y } = pos
                  const status = hospitalStatus(h)
                  const token = STATUS_CLASSES[status].token
                  const isSelected = selectedHospitalId === h.id
                  const usedBeds = h.beds?.used ?? 0
                  const totalBeds = h.beds?.total ?? 1
                  const occPercent = Math.round((usedBeds / totalBeds) * 100)
                  const availIcu = Math.max(0, (h.icuBeds?.total ?? 0) - (h.icuBeds?.used ?? 0))

                  return (
                    <g
                      key={h.id}
                      className="cursor-pointer transition-all"
                      onClick={() => setSelectedHospitalId(h.id)}
                      onMouseEnter={() => setHovered(h.id)}
                      onMouseLeave={() => setHovered(null)}
                    >
                      {status === 'red' && (
                        <circle
                          cx={x}
                          cy={y}
                          fill={token}
                          className="node-pulse"
                          style={
                            {
                              ['--pulse-min' as string]: '26px',
                              ['--pulse-max' as string]: '44px',
                            } as React.CSSProperties
                          }
                        />
                      )}

                      {/* Selection Ring */}
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r={32}
                          fill="none"
                          stroke="#ea580c"
                          strokeWidth={2.5}
                          strokeDasharray="4 2"
                        />
                      )}

                      {/* Outer Status Circle */}
                      <circle cx={x} cy={y} r={24} fill="#ffffff" stroke={token} strokeWidth={4} />
                      <circle cx={x} cy={y} r={16} fill={token} opacity={0.12} />

                      {/* Short Code */}
                      <text
                        x={x}
                        y={y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={token}
                        style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-sans)' }}
                      >
                        {h.short.substring(0, 5)}
                      </text>

                      {/* Node Label Card */}
                      <g transform={`translate(${x}, ${y + 32})`}>
                        <rect
                          x={-80}
                          y={0}
                          width={160}
                          height={36}
                          rx={8}
                          fill="#ffffff"
                          stroke={isSelected ? '#ea580c' : '#e2e8f0'}
                          strokeWidth={isSelected ? 1.5 : 1}
                          className="shadow-2xs"
                        />
                        <text
                          x={0}
                          y={13}
                          textAnchor="middle"
                          className="fill-stone-900 font-sans font-bold"
                          style={{ fontSize: 10 }}
                        >
                          {h.name.length > 22 ? `${h.name.substring(0, 20)}...` : h.name}
                        </text>
                        <text
                          x={0}
                          y={26}
                          textAnchor="middle"
                          className="fill-stone-500 font-sans"
                          style={{ fontSize: 9 }}
                        >
                          Load: <tspan className="font-semibold text-stone-800">{occPercent}%</tspan> · ICU: <tspan className="font-semibold text-emerald-600">{availIcu} Open</tspan>
                        </text>
                      </g>
                    </g>
                  )
                })}
              </svg>
            </div>
          )}

          {/* Incident Intake & Real-time Telemetry Console (Globetrans Bottom HUD) */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-orange-50 text-[#ea580c]">
                  <Sliders className="size-4" />
                </div>
                <h3 className="text-sm font-bold text-[#382416]">
                  108 Emergency Incident Intake & Onboard Telemetry
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5',
                    liveAcuityScore >= 80
                      ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                      : 'bg-amber-100 text-amber-800 border-amber-300',
                  )}
                >
                  <Activity className="size-3" />
                  Live Severity: {liveAcuityScore}/100 {liveAcuityScore >= 80 ? '(ICU Mandatory)' : '(Urgent)'}
                </span>
              </div>
            </div>

            {/* Observer Mode / RBAC Notice */}
            {!canDispatch && (
              <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2.5 text-amber-900">
                  <div className="p-1.5 rounded-lg bg-amber-200/80 text-amber-900 shrink-0">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <span className="font-bold">State Command Telemetry Observer Mode:</span>
                    <span className="text-amber-800 ml-1">
                      108 Emergency vehicle dispatching and trauma bed locks are restricted to <strong>108 Central Fleet Command (JH-DSP-5001)</strong>. {user?.roleTitle || 'Super Admin'} operates in telemetry observation mode.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => loginAsDemoRole('AMBULANCE_DISPATCH')}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-[#382416] hover:bg-black text-[#ffedd7] text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Truck className="size-3.5 text-[#ea580c]" />
                  Switch to 108 Dispatcher (JH-DSP-5001)
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1">
                  Patient Name / Caller:
                </label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 block mb-1">
                  Emergency Incident Nature:
                </label>
                <select
                  value={incidentNature}
                  onChange={(e) => setIncidentNature(e.target.value)}
                  className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3.5 py-2 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#ea580c] focus:outline-none"
                >
                  <option value="High-Speed Highway Polytrauma (NH-33)">High-Speed Highway Polytrauma (NH-33)</option>
                  <option value="Coal Mine Colliery Inundation & Crush">Coal Mine Colliery Inundation & Crush</option>
                  <option value="Industrial Chemical Blast & Burns">Industrial Chemical Blast & Burns</option>
                  <option value="Acute Massive STEMI Cardiac Arrest">Acute Massive STEMI Cardiac Arrest</option>
                  <option value="Severe Septic Shock & Hypoxia">Severe Septic Shock & Hypoxia</option>
                </select>
              </div>
            </div>

            {/* Vitals Range Sliders */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-50/80 p-3.5 rounded-xl border border-stone-200/80">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-500">SpO₂</span>
                  <span className={spo2 < 88 ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>{spo2}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full accent-[#ea580c] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-500">Heart Rate</span>
                  <span className={heartRate > 120 ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>{heartRate} bpm</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full accent-[#ea580c] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-500">Systolic BP</span>
                  <span className={systolicBp < 90 ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>{systolicBp} mmHg</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(Number(e.target.value))}
                  className="w-full accent-[#ea580c] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-stone-500">GCS (Coma)</span>
                  <span className={gcs < 10 ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>{gcs}/15</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={gcs}
                  onChange={(e) => setGcs(Number(e.target.value))}
                  className="w-full accent-[#ea580c] h-1.5 bg-stone-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Bottom Row: Assigned Unit & Location Info */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-stone-500 font-semibold uppercase tracking-wider text-[11px]">Assigned Unit:</span>
                <select
                  value={assignedAmbulance}
                  onChange={(e) => setAssignedAmbulance(e.target.value)}
                  className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800"
                >
                  <option value="JH-01-ALS-1081">JH-01-ALS-1081 (Ventilator + Defibrillator)</option>
                  <option value="JH-01-ALS-1084">JH-01-ALS-1084 (Trauma Resuscitation Unit)</option>
                  <option value="JH-01-BLS-1089">JH-01-BLS-1089 (Basic Life Support Oxygen)</option>
                </select>
              </div>

              <div className="text-xs text-stone-500">
                Origin Beacon: <strong className="text-stone-800">{originName}</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Dijkstra Multi-Criteria Hospital Matches & Active Dispatches */}
        <div className="space-y-4">
          {/* Dijkstra Multi-Criteria Ranked Facilities & AI Doctor Roster Match */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ea580c]">
                    AI CASUALTY ROUTER &amp; DOCTOR MATCH
                  </span>
                  <span className="bg-orange-100 text-[#ea580c] font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-orange-300">
                    REQ: {requiredSpecialistRole.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-[#382416] mt-0.5">
                  1st, 2nd &amp; 3rd Best Hospital Recommendations
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const next = !greenWaveActive
                    setGreenWaveActive(next)
                    directorBridge.send({ type: 'TOGGLE_GREEN_WAVE', active: next })
                  }}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 border',
                    greenWaveActive
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-2xs'
                      : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200',
                  )}
                >
                  <Zap className="size-3 fill-current" />
                  <span>{greenWaveActive ? 'GREEN WAVE ON' : 'PREEMPTION'}</span>
                </button>
              </div>
            </div>

            {/* The 3 Calculated Best Options */}
            <div className="space-y-3">
              {/* OPTION 1: 1ST BEST (RECOMMENDED APEX MATCH) */}
              {option1 && (
                <div
                  onClick={() => setSelectedHospitalId(option1.hospitalId)}
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 relative overflow-hidden',
                    selectedHospitalId === option1.hospitalId
                      ? 'bg-gradient-to-br from-emerald-50/90 to-green-50/40 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
                      : 'bg-white border-stone-200 hover:border-emerald-300 hover:bg-stone-50/50',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="size-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                        #1
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 uppercase">
                            🏆 1ST BEST · APEX DEFINITIVE SURGERY
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#382416] mt-0.5">{option1.hospitalName}</h4>
                        <span className="text-[11px] text-stone-500 font-medium">{option1.tier} · {option1.district}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-emerald-700 block">{option1.compositeScore} pts</span>
                      <span className="text-xs font-bold text-stone-700">
                        ⏱ {option1.effectiveEtaMin}m ETA ({option1.distanceKm} km)
                      </span>
                    </div>
                  </div>

                  {/* Specialist Doctor Roster Badge */}
                  <div className="p-2.5 rounded-xl bg-emerald-950/5 border border-emerald-500/30 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                        <User className="size-3.5 text-emerald-700" />
                        <span>{option1.doctorInfo.doctorName}</span>
                        <span className="text-[10px] font-normal text-emerald-700">({option1.doctorInfo.specialty})</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-600 text-white uppercase">
                        ON DUTY · TRAUMA BAY READY
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      {option1.doctorInfo.statusNote}
                    </p>
                  </div>

                  {/* Traffic & Capacity Telemetry */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-emerald-100 text-[11px]">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">ICU Beds:</span>
                      <strong className="text-emerald-700 font-bold">{option1.availIcu} Open ICU</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Corridor Traffic:</span>
                      <strong className={greenWaveActive ? 'text-emerald-600 font-bold' : option1.trafficDelayMin > 10 ? 'text-rose-600 font-bold' : 'text-amber-700 font-bold'}>
                        {greenWaveActive ? '⚡ 0m (Green Wave)' : `+${option1.trafficDelayMin}m Delay`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Match Status:</span>
                      <strong className="text-emerald-700 font-bold">Recommended</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                    {option1.clinicalRationale}
                  </p>
                </div>
              )}

              {/* OPTION 2: 2ND BEST (AIRWAY & SHOCK STABILIZATION FALLBACK) */}
              {option2 && (
                <div
                  onClick={() => setSelectedHospitalId(option2.hospitalId)}
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 relative overflow-hidden',
                    selectedHospitalId === option2.hospitalId
                      ? 'bg-gradient-to-br from-amber-50/90 to-yellow-50/40 border-amber-500 shadow-md ring-2 ring-amber-500/20'
                      : 'bg-white border-stone-200 hover:border-amber-300 hover:bg-stone-50/50',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="size-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                        #2
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 uppercase">
                            ⚡ 2ND BEST · RAPID AIRWAY / SHOCK RESUSCITATION
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#382416] mt-0.5">{option2.hospitalName}</h4>
                        <span className="text-[11px] text-stone-500 font-medium">{option2.tier} · {option2.district}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-amber-700 block">{option2.compositeScore} pts</span>
                      <span className="text-xs font-bold text-stone-700">
                        ⏱ {option2.effectiveEtaMin}m ETA ({option2.distanceKm} km)
                      </span>
                    </div>
                  </div>

                  {/* Doctor Status / Warning */}
                  <div className="p-2.5 rounded-xl bg-amber-950/5 border border-amber-500/30 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <User className="size-3.5 text-amber-700" />
                        <span>{option2.doctorInfo.doctorName}</span>
                      </div>
                      <span className={cn(
                        'px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase',
                        option2.doctorInfo.status === 'NOT_AVAILABLE'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-600 text-white'
                      )}>
                        {option2.doctorInfo.status === 'NOT_AVAILABLE' ? `NO ${requiredSpecialistRole.toUpperCase()}` : 'STABILIZATION ONLY'}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800 font-medium">
                      {option2.doctorInfo.statusNote}
                    </p>
                  </div>

                  {/* Traffic & Distance Advantage */}
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-amber-100 text-[11px]">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">ICU Beds:</span>
                      <strong className={option2.availIcu > 0 ? 'text-amber-800 font-bold' : 'text-stone-500'}>
                        {option2.availIcu} Open ICU
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Transit Distance:</span>
                      <strong className="text-amber-800 font-bold">
                        {option1.distanceKm > option2.distanceKm ? `Saves ${(option1.distanceKm - option2.distanceKm).toFixed(1)} km` : `${option2.distanceKm} km`}
                      </strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-semibold">Clinical Role:</span>
                      <strong className="text-amber-700 font-bold">Transit Resus</strong>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                    {option2.clinicalRationale}
                  </p>
                </div>
              )}

              {/* OPTION 3: 3RD BEST (CONTINGENCY TERTIARY APEX) */}
              {option3 && (
                <div
                  onClick={() => setSelectedHospitalId(option3.hospitalId)}
                  className={cn(
                    'p-4 rounded-2xl border-2 transition-all cursor-pointer space-y-2.5 relative overflow-hidden',
                    selectedHospitalId === option3.hospitalId
                      ? 'bg-gradient-to-br from-blue-50/90 to-sky-50/40 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                      : 'bg-white border-stone-200 hover:border-blue-300 hover:bg-stone-50/50',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="size-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-xs">
                        #3
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-black text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300 uppercase">
                            🛡️ 3RD BEST · CONTINGENCY TERTIARY BACKUP
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-[#382416] mt-0.5">{option3.hospitalName}</h4>
                        <span className="text-[11px] text-stone-500 font-medium">{option3.tier} · {option3.district}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-blue-700 block">{option3.compositeScore} pts</span>
                      <span className="text-xs font-bold text-stone-700">
                        ⏱ {option3.effectiveEtaMin}m ETA ({option3.distanceKm} km)
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-950/5 border border-blue-500/30 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-blue-900">
                        <User className="size-3.5 text-blue-700" />
                        <span>{option3.doctorInfo.doctorName}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-600 text-white uppercase">
                        SURGICAL BACKUP
                      </span>
                    </div>
                    <p className="text-[11px] text-blue-800 font-medium">
                      {option3.doctorInfo.statusNote}
                    </p>
                  </div>

                  <p className="text-[10px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                    {option3.clinicalRationale}
                  </p>
                </div>
              )}
            </div>

            {/* Primary Dispatch CTA Button / RBAC Restricted */}
            {canDispatch ? (
              <button
                type="button"
                onClick={handleExecute108Dispatch}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-transform active:scale-98"
              >
                <Send className="size-4" />
                <span>Dispatch 108 Ambulance (Pre-Book Bed at {targetHospital?.hospital.short ?? 'Target Facility'})</span>
              </button>
            ) : (
              <div className="w-full p-4 rounded-xl border border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-stone-600">
                  <div className="p-1.5 rounded-lg bg-stone-200 text-stone-700 shrink-0">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div>
                    <div className="font-bold text-stone-800">108 Dispatch Authority Locked (Observer Mode)</div>
                    <div className="text-[11px] text-stone-500">
                      Super Admin can observe spatial routing, but emergency vehicle dispatches & bed reservations are restricted to Operator Vikram Singh (JH-DSP-5001).
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => loginAsDemoRole('AMBULANCE_DISPATCH')}
                  className="shrink-0 w-full sm:w-auto px-3.5 py-2 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Truck className="size-3.5" />
                  Switch to Dispatcher
                </button>
              </div>
            )}
          </div>

          {/* Active In-Flight Dispatches Fleet Panel */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="flex items-center gap-2 text-xs font-bold text-[#382416] uppercase tracking-wider">
                <Activity className="size-4 text-red-600" />
                Active Fleet Dispatches ({activeDispatches.length})
              </h3>
              <span className="size-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
              {activeDispatches.map((disp) => (
                <div key={disp.id} className="p-3.5 rounded-xl border border-red-200 bg-red-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-md">
                      {disp.token}
                    </span>
                    <span className="text-xs font-semibold text-stone-700">
                      {disp.ambulanceNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-[#382416]">
                    <span>{disp.patientName}</span>
                    <span className="text-red-700 font-semibold">ETA: {disp.remainingMinutes} Mins</span>
                  </div>

                  <div className="text-xs text-stone-600 truncate">
                    Destination: <strong>{disp.destinationHospitalName}</strong>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-red-100 text-xs">
                    <span className="text-[11px] text-stone-500">
                      SpO₂: {disp.vitals.spo2}% · HR: {disp.vitals.heartRate} · BP: {disp.vitals.systolicBp}
                    </span>
                    {disp.status !== 'ARRIVED_TRAUMA_BAY' ? (
                      canDispatch ? (
                        <button
                          type="button"
                          onClick={() => handleMarkArrived(disp.id)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                        >
                          Mark Arrived (Handover)
                        </button>
                      ) : (
                        <span className="text-[11px] font-medium text-stone-500 italic flex items-center gap-1">
                          <Truck className="size-3 text-stone-400" />
                          Handover by 108 Unit
                        </span>
                      )
                    ) : (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="size-3.5" /> Admitted
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
