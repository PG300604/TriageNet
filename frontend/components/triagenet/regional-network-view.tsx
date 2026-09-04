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
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { MapHospitalNode, MapAmbulanceUnit } from './leaflet-map'
import { useAuth } from '@/lib/auth-context'
import { JHARKHAND_24_DISTRICTS, JHARKHAND_79_HOSPITALS } from '@/lib/jharkhand-data'
import { apiClient } from '@/lib/api-client'

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
  const { user } = useAuth()

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
  const [originLat, setOriginLat] = useState<number>(23.4832)
  const [originLng, setOriginLng] = useState<number>(85.4611)
  const [originName, setOriginName] = useState<string>('NH-33 Toll Crash (Ormanjhi)')
  const [activeHotspot, setActiveHotspot] = useState<string>('ormanjhi')

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

  // Real Multi-Criteria Hospital Match Evaluator - Natural Coordinates (Zero Circle Formula)
  const rankedCandidateHospitals = useMemo(() => {
    return hospitals.map((h) => {
      const f = JHARKHAND_79_HOSPITALS.find(
        (item) =>
          item.id === h.id ||
          item.shortCode.toLowerCase() === h.short.toLowerCase() ||
          item.name.toLowerCase() === h.name.toLowerCase() ||
          item.name.toLowerCase().includes(h.name.toLowerCase()) ||
          h.name.toLowerCase().includes(item.name.toLowerCase())
      )

      const districtObj = JHARKHAND_24_DISTRICTS.find(
        (d) =>
          (h.district && d.name.toLowerCase().includes(h.district.toLowerCase())) ||
          (f?.districtName && d.name.toLowerCase().includes(f.districtName.toLowerCase()))
      )

      // Deterministic spatial offset if facility lat/lng is missing, spreading hospitals naturally
      const idHash = (h.id || h.name).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const jitterLat = ((idHash % 17) - 8) * 0.012
      const jitterLng = (((idHash * 3) % 19) - 9) * 0.014

      const hLat = h.lat ?? f?.latitude ?? (districtObj ? districtObj.lat + jitterLat : 23.3441 + jitterLat)
      const hLng = h.lng ?? f?.longitude ?? (districtObj ? districtObj.lng + jitterLng : 85.3096 + jitterLng)

      const dLat = ((hLat - originLat) * Math.PI) / 180
      const dLng = ((hLng - originLng) * Math.PI) / 180
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((originLat * Math.PI) / 180) *
          Math.cos((hLat * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      const distanceKm = Math.max(1.5, Math.round(6371 * c * 10) / 10)
      const etaMinutes = Math.max(4, Math.round(distanceKm * 1.35))

      const totalIcu = h.icuBeds?.total ?? (f?.totalIcuBeds ?? 10)
      const usedIcu = h.icuBeds?.used ?? (f ? Math.max(0, f.totalIcuBeds - f.availableIcuBeds) : 8)
      const availIcu = Math.max(0, totalIcu - usedIcu)

      const totalGen = h.beds?.total ?? (f ? f.totalGeneralBeds + f.totalIcuBeds : 100)
      const usedGen = h.beds?.used ?? (f ? Math.max(0, (f.totalGeneralBeds - f.availableGeneralBeds) + (f.totalIcuBeds - f.availableIcuBeds)) : 75)
      const availGen = Math.max(0, totalGen - usedGen)

      const hasTraumaSurgeon = (h.specialistRoster?.traumaSurgeons?.available ?? 0) > 0 || (f?.hasTraumaSurgery ?? false) || totalIcu >= 30
      const hasVentilators = (h.ventilators?.total ?? 0) > 0 || (f?.hasVentilator ?? false)

      const timeScore = Math.max(0, 40 - etaMinutes * 0.8)
      const icuScore = availIcu >= 3 ? 30 : availIcu === 2 ? 22 : availIcu === 1 ? 14 : 0
      const capabilityScore = (hasTraumaSurgeon ? 12 : 4) + (hasVentilators ? 8 : 2)
      const loadRatio = usedGen / Math.max(1, totalGen)
      const loadScore = Math.max(0, Math.round((1 - loadRatio) * 10))

      const totalScore = Math.min(99, Math.max(25, Math.round(timeScore + icuScore + capabilityScore + loadScore)))

      return {
        hospital: h,
        distanceKm,
        etaMinutes,
        availIcu,
        availGen,
        hasTraumaSurgeon,
        hasVentilators,
        totalScore,
        tier: f?.facilityTier || 'DISTRICT',
        lat: hLat,
        lng: hLng,
      }
    }).sort((a, b) => b.totalScore - a.totalScore)
  }, [hospitals, originLat, originLng])

  const topMatch = rankedCandidateHospitals[0]
  const targetHospital = rankedCandidateHospitals.find((c) => c.hospital.id === selectedHospitalId) || topMatch

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

  const triggerEmergencyHotspot = (key: string, name: string, lat: number, lng: number) => {
    setActiveHotspot(key)
    setOriginLat(lat)
    setOriginLng(lng)
    setOriginName(name)
  }

  const mapNodes: MapHospitalNode[] = rankedCandidateHospitals.map((c) => {
    const f = JHARKHAND_79_HOSPITALS.find(
      (item) =>
        item.id === c.hospital.id ||
        item.shortCode.toLowerCase() === c.hospital.short.toLowerCase() ||
        item.name.toLowerCase() === c.hospital.name.toLowerCase() ||
        item.name.toLowerCase().includes(c.hospital.name.toLowerCase()) ||
        c.hospital.name.toLowerCase().includes(item.name.toLowerCase())
    )

    const totBeds = (c.hospital.beds && c.hospital.beds.total > 0)
      ? c.hospital.beds.total
      : (f ? f.totalGeneralBeds + f.totalIcuBeds : 100)

    const usedB = (c.hospital.beds && c.hospital.beds.used !== undefined)
      ? c.hospital.beds.used
      : (f ? Math.max(0, (f.totalGeneralBeds - f.availableGeneralBeds) + (f.totalIcuBeds - f.availableIcuBeds)) : 68)

    return {
      id: c.hospital.id,
      name: c.hospital.name,
      districtName: c.hospital.district || f?.districtName || selectedDistrict,
      facilityTier: c.tier,
      lat: c.lat,
      lng: c.lng,
      totalBeds: totBeds,
      usedBeds: usedB,
      availableGeneralBeds: c.availGen,
      availableIcuBeds: c.availIcu,
      hasVentilator: c.hasVentilators,
      hasTraumaSurgery: c.hasTraumaSurgeon,
      hasBloodBank: true,
    }
  })

  const layoutMap = getLayoutPositions(hospitals)
  const activeTransfers = transfers.filter((t) => t.active)
  const inFlightCount = activeDispatches.filter((d) => d.status !== 'ARRIVED_TRAUMA_BAY').length

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

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
              <Truck className="size-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[#382416]">
              108 Ambulance Dispatch & Regional Spatial Routing
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
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-stone-100">
          {[
            { key: 'ormanjhi', label: 'NH-33 Toll Crash (Ormanjhi)', lat: 23.4832, lng: 85.4611 },
            { key: 'bundu', label: 'Bundu NH-33 Rural Polytrauma', lat: 23.1678, lng: 85.5891 },
            { key: 'jharia', label: 'Dhanbad Jharia Colliery Surge', lat: 23.7501, lng: 86.4162 },
            { key: 'jamshedpur', label: 'Adityapur Industrial Blast', lat: 22.7801, lng: 86.1950 },
            { key: 'deoghar', label: 'Jasidih Railway Line Trauma', lat: 24.5120, lng: 86.6450 },
            { key: 'barhi', label: 'Barhi GT Road Highway Pileup', lat: 24.2980, lng: 85.4230 },
          ].map((spot) => (
            <button
              key={spot.key}
              type="button"
              onClick={() => triggerEmergencyHotspot(spot.key, spot.label, spot.lat, spot.lng)}
              className={cn(
                'px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5',
                activeHotspot === spot.key
                  ? 'bg-[#382416] text-[#ffedd7] border-[#382416] shadow-xs'
                  : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100',
              )}
            >
              <Flame className={cn('size-3.5', activeHotspot === spot.key ? 'text-[#ea580c]' : 'text-stone-400')} />
              <span>{spot.label}</span>
            </button>
          ))}
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

              <LeafletMap
                hospitals={mapNodes}
                selectedHospitalId={selectedHospitalId}
                onSelectHospital={setSelectedHospitalId}
                ambulances={filteredAmbulances}
                ambulanceLocation={{ lat: originLat, lng: originLng }}
                onMarkArrived={(ambId) => {
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
                }}
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

                {/* Active emergency transfer edges */}
                {activeTransfers.map((t) => {
                  const pa = layoutMap.get(t.fromId)
                  const pb = layoutMap.get(t.toId)
                  if (!pa || !pb) return null
                  const isHovered = hovered === t.id
                  return (
                    <line
                      key={t.id}
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
                  )
                })}

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
          {/* Dijkstra Multi-Criteria Ranked Facilities */}
          <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#ea580c]">
                  Dijkstra Multi-Criteria Engine
                </span>
                <h3 className="text-sm font-bold text-[#382416]">
                  Ranked Candidate Hospitals
                </h3>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                Top Match: {topMatch?.totalScore ?? 96}/100 pts
              </span>
            </div>

            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {rankedCandidateHospitals.slice(0, 4).map((cand, idx) => {
                const isSelected = cand.hospital.id === selectedHospitalId
                return (
                  <div
                    key={cand.hospital.id}
                    onClick={() => setSelectedHospitalId(cand.hospital.id)}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all cursor-pointer space-y-2',
                      isSelected
                        ? 'bg-orange-50/50 border-[#ea580c] ring-2 ring-[#ea580c]/20 shadow-2xs'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            'size-6 rounded-full flex items-center justify-center text-xs font-bold text-white',
                            idx === 0 ? 'bg-[#ea580c]' : 'bg-stone-400',
                          )}
                        >
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-[#382416] leading-snug">{cand.hospital.name}</h4>
                          <span className="text-[11px] text-stone-500 font-medium">{cand.tier} · {selectedDistrict === 'ALL' ? 'Jharkhand' : selectedDistrict}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold text-emerald-700 block">{cand.totalScore} pts</span>
                        <span className="text-[11px] text-stone-500 font-medium">
                          ⏱ {cand.etaMinutes}m ({cand.distanceKm}km)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 text-[11px]">
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">ICU Beds:</span>
                        <strong className={cand.availIcu > 0 ? 'text-emerald-700' : 'text-red-600'}>
                          {cand.availIcu} Open
                        </strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Trauma:</span>
                        <strong className={cand.hasTraumaSurgeon ? 'text-blue-700' : 'text-stone-500'}>
                          {cand.hasTraumaSurgeon ? 'Ready' : 'None'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px] uppercase font-semibold">Ventilators:</span>
                        <strong className={cand.hasVentilators ? 'text-emerald-700' : 'text-stone-500'}>
                          {cand.hasVentilators ? 'Active' : 'None'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Primary Dispatch CTA Button */}
            <button
              type="button"
              onClick={handleExecute108Dispatch}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition-transform active:scale-98"
            >
              <Send className="size-4" />
              <span>Dispatch 108 Ambulance (Pre-Book Bed at {targetHospital?.hospital.short ?? 'Target Facility'})</span>
            </button>
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
                      <button
                        type="button"
                        onClick={() => handleMarkArrived(disp.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer"
                      >
                        Mark Arrived (Handover)
                      </button>
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
