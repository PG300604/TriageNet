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
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { MapHospitalNode } from './leaflet-map'
import { useAuth } from '@/lib/auth-context'
import { JHARKHAND_24_DISTRICTS, JHARKHAND_79_HOSPITALS } from '@/lib/jharkhand-data'
import { apiClient } from '@/lib/api-client'

// Dynamically import Leaflet map component to prevent SSR window reference issues
const LeafletMap = dynamic(
  () => import('./leaflet-map').then((mod) => mod.LeafletMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] w-full rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center font-mono text-xs text-slate-400">
        Loading Jharkhand Spatial Map...
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

  // Real Multi-Criteria Hospital Match Evaluator
  const rankedCandidateHospitals = useMemo(() => {
    return hospitals.map((h) => {
      const f = JHARKHAND_79_HOSPITALS.find((item) => item.id === h.id)
      const hLat = f?.latitude ?? (23.3441 + (h.y - 50) * 0.02)
      const hLng = f?.longitude ?? (85.3096 + (h.x - 50) * 0.02)

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

      const totalIcu = h.icuBeds?.total ?? 10
      const usedIcu = h.icuBeds?.used ?? 8
      const availIcu = Math.max(0, totalIcu - usedIcu)

      const totalGen = h.beds?.total ?? 100
      const usedGen = h.beds?.used ?? 80
      const availGen = Math.max(0, totalGen - usedGen)

      const hasTraumaSurgeon = (h.specialistRoster?.traumaSurgeons?.available ?? 0) > 0 || totalIcu >= 30
      const hasVentilators = (h.ventilators?.total ?? 0) > 0

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

    setLastDispatchAlert(
      `🚨 ${assignedAmbulance} DISPATCHED! Pre-booked ICU bed at ${targetHospital.hospital.name}. ETA: ${targetHospital.etaMinutes} mins (Token: ${dispatchToken})`,
    )
    setTimeout(() => setLastDispatchAlert(null), 8000)
  }

  const handleMarkArrived = (dispId: string) => {
    setActiveDispatches((prev) =>
      prev.map((d) => (d.id === dispId ? { ...d, status: 'ARRIVED_TRAUMA_BAY', remainingMinutes: 0 } : d)),
    )
    setLastDispatchAlert(`✅ Patient safely handed over to Trauma Bay team. Ambulance unit released!`)
    setTimeout(() => setLastDispatchAlert(null), 6000)
  }

  const triggerEmergencyHotspot = (key: string, name: string, lat: number, lng: number) => {
    setActiveHotspot(key)
    setOriginLat(lat)
    setOriginLng(lng)
    setOriginName(name)
  }

  const mapNodes: MapHospitalNode[] = rankedCandidateHospitals.map((c) => ({
    id: c.hospital.id,
    name: c.hospital.name,
    districtName: selectedDistrict,
    facilityTier: c.tier,
    lat: c.lat,
    lng: c.lng,
    totalBeds: c.hospital.beds?.total ?? 100,
    usedBeds: c.hospital.beds?.used ?? 80,
    availableGeneralBeds: c.availGen,
    availableIcuBeds: c.availIcu,
    hasVentilator: c.hasVentilators,
    hasTraumaSurgery: c.hasTraumaSurgeon,
    hasBloodBank: true,
  }))

  const layoutMap = getLayoutPositions(hospitals)
  const activeTransfers = transfers.filter((t) => t.active)

  return (
    <div className="flex flex-col gap-5 font-sans text-[#2c1b0e]">
      {lastDispatchAlert && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-red-300 bg-gradient-to-r from-red-600 to-rose-700 p-4 text-white shadow-lg animate-bounce">
          <div className="flex items-center gap-3">
            <Radio className="size-6 animate-pulse text-[#ffedd7]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">{lastDispatchAlert}</span>
          </div>
          <button
            type="button"
            onClick={() => setLastDispatchAlert(null)}
            className="rounded-lg bg-black/20 px-2 py-1 text-[10px] font-mono font-bold hover:bg-black/30 cursor-pointer"
          >
            DISMISS
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#382416]/15 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-[#382416] uppercase font-mono flex items-center gap-2">
              <Truck className="size-5 text-[#dc5000]" />
              108 AMBULANCE TACTICAL DISPATCH & SPATIAL ROUTING COMMAND
            </h2>
            <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
              [LIVE TELEMETRY READY]
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time GPS incident positioning, multi-criteria Dijkstra hospital matching, pre-booked ICU beds, and live fleet handover
          </p>
        </div>

        <div className="inline-flex p-1 bg-white border border-[#382416]/15 rounded-xl shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'map'
                ? 'bg-[#382416] text-[#ffedd7] shadow-xs'
                : 'text-slate-600 hover:text-[#382416] hover:bg-slate-100',
            )}
          >
            <MapPin className="size-3.5 text-[#dc5000]" />
            SPATIAL MAP
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('graph')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5',
              activeTab === 'graph'
                ? 'bg-[#382416] text-[#ffedd7] shadow-xs'
                : 'text-slate-600 hover:text-[#382416] hover:bg-slate-100',
            )}
          >
            <Route className="size-3.5 text-[#dc5000]" />
            DIJKSTRA TOPOLOGY
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#382416]/15 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#382416] uppercase">ACTIVE DISTRICT COMMAND:</span>
            <span className="inline-flex items-center gap-1.5 bg-[#382416] text-[#ffedd7] text-xs font-mono font-bold py-1 px-3 rounded-xl shadow-2xs">
              <MapPin className="size-3 text-[#dc5000]" />
              {selectedDistrict === 'ALL' ? '🌟 ALL 24 DISTRICTS (JHARKHAND STATEWIDE)' : `${selectedDistrict.toUpperCase()} DISTRICT`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#382416] uppercase">FACILITY TIER:</span>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="bg-[#FAF6F0] border border-[#382416]/20 text-[#382416] text-xs font-mono font-bold py-1.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563eb]"
            >
              <option value="ALL">ALL FACILITY TIERS</option>
              <option value="TERTIARY">TERTIARY (Medical Colleges & Apex)</option>
              <option value="DISTRICT">DISTRICT (Sadar Hospitals)</option>
              <option value="SUB_DIVISIONAL">SUB-DIVISIONAL (SDH Referral)</option>
              <option value="CHC">CHC (Community Health Centers)</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="bg-red-50 border border-red-200 text-red-700 px-3 py-1 rounded-xl font-bold">
            ACTIVE 108 DISPATCHES: {activeDispatches.filter((d) => d.status !== 'ARRIVED_TRAUMA_BAY').length}
          </span>
          <span className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-xl font-bold">
            CANDIDATE FACILITIES: {rankedCandidateHospitals.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50/80 via-white to-amber-50/50 p-3.5 shadow-2xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-lg bg-red-600 text-white font-mono text-[10px] font-bold">
                  108
                </span>
                <span className="font-mono text-xs font-bold text-red-950 uppercase">
                  HIGHWAY & INDUSTRIAL INCIDENT HOTSPOTS
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Click hotspot to snap GPS beacon & compute optimal hospital routing
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
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
                    'px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                    activeHotspot === spot.key
                      ? 'bg-red-700 text-white border-red-800 shadow-xs ring-2 ring-red-400/40'
                      : 'bg-white text-slate-700 border-red-200 hover:bg-red-50',
                  )}
                >
                  <Truck className="size-3.5 text-red-500" />
                  <span>{spot.label}</span>
                </button>
              ))}
            </div>
          </div>

          {activeTab === 'map' ? (
            <LeafletMap
              hospitals={mapNodes}
              selectedHospitalId={selectedHospitalId}
              onSelectHospital={setSelectedHospitalId}
              ambulanceLocation={{ lat: originLat, lng: originLng }}
            />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#382416]/15 bg-white p-4 shadow-md space-y-2">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 font-mono text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-[#382416]">DIJKSTRA MINIMUM-TIME TRANSFER TOPOLOGY</span>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-[#dc5000]" />
                <h3 className="text-xs font-mono font-bold uppercase text-[#382416]">
                  108 EMERGENCY INCIDENT INTAKE & ONBOARD TELEMETRY
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-2.5 py-1 rounded-full font-mono text-[10px] font-bold border',
                    liveAcuityScore >= 80
                      ? 'bg-red-100 text-red-800 border-red-300 animate-pulse'
                      : 'bg-amber-100 text-amber-800 border-amber-300',
                  )}
                >
                  LIVE SEVERITY: {liveAcuityScore}/100 {liveAcuityScore >= 80 ? '🔴 ICU MANDATORY' : '🟡 URGENT'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-mono text-[10px] font-bold text-slate-500 uppercase">Patient Name / Caller:</label>
                <input
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-[#FAF6F0] px-3 py-2 text-xs font-mono font-bold text-[#382416] focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-mono text-[10px] font-bold text-slate-500 uppercase">Emergency Incident Nature:</label>
                <select
                  value={incidentNature}
                  onChange={(e) => setIncidentNature(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-[#FAF6F0] px-3 py-2 text-xs font-mono font-bold text-[#382416] focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                  <option value="High-Speed Highway Polytrauma (NH-33)">High-Speed Highway Polytrauma (NH-33)</option>
                  <option value="Coal Mine Colliery Inundation & Crush">Coal Mine Colliery Inundation & Crush</option>
                  <option value="Industrial Chemical Blast & Burns">Industrial Chemical Blast & Burns</option>
                  <option value="Acute Massive STEMI Cardiac Arrest">Acute Massive STEMI Cardiac Arrest</option>
                  <option value="Severe Septic Shock & Hypoxia">Severe Septic Shock & Hypoxia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#FAF6F0] p-3 rounded-xl border border-[#382416]/10">
              <div>
                <div className="flex justify-between text-[10px] font-mono font-bold">
                  <span className="text-slate-500">SpO₂:</span>
                  <span className={spo2 < 88 ? 'text-red-600 font-bold' : 'text-emerald-700'}>{spo2}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={spo2}
                  onChange={(e) => setSpo2(Number(e.target.value))}
                  className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono font-bold">
                  <span className="text-slate-500">Heart Rate:</span>
                  <span className={heartRate > 120 ? 'text-red-600 font-bold' : 'text-emerald-700'}>{heartRate} bpm</span>
                </div>
                <input
                  type="range"
                  min="40"
                  max="180"
                  value={heartRate}
                  onChange={(e) => setHeartRate(Number(e.target.value))}
                  className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono font-bold">
                  <span className="text-slate-500">Systolic BP:</span>
                  <span className={systolicBp < 90 ? 'text-red-600 font-bold' : 'text-emerald-700'}>{systolicBp} mmHg</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="200"
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(Number(e.target.value))}
                  className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] font-mono font-bold">
                  <span className="text-slate-500">GCS (Coma):</span>
                  <span className={gcs < 10 ? 'text-red-600 font-bold' : 'text-emerald-700'}>{gcs}/15</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={gcs}
                  onChange={(e) => setGcs(Number(e.target.value))}
                  className="w-full accent-red-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">Assigned Unit:</span>
                <select
                  value={assignedAmbulance}
                  onChange={(e) => setAssignedAmbulance(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-mono font-bold text-[#382416]"
                >
                  <option value="JH-01-ALS-1081">JH-01-ALS-1081 (Ventilator + Defibrillator)</option>
                  <option value="JH-01-ALS-1084">JH-01-ALS-1084 (Trauma Resuscitation Unit)</option>
                  <option value="JH-01-BLS-1089">JH-01-BLS-1089 (Basic Life Support Oxygen)</option>
                </select>
              </div>

              <div className="text-[10px] font-mono text-slate-500">
                Origin: <strong className="text-[#382416]">{originName}</strong>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-[#382416]/15 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-[#dc5000] uppercase">
                  DIJKSTRA MULTI-CRITERIA ENGINE
                </span>
                <h3 className="text-sm font-bold text-[#382416] font-mono uppercase">
                  RANKED CANDIDATE HOSPITALS
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                TOP: {topMatch?.totalScore ?? 96}/100
              </span>
            </div>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {rankedCandidateHospitals.slice(0, 4).map((cand, idx) => {
                const isSelected = cand.hospital.id === selectedHospitalId
                return (
                  <div
                    key={cand.hospital.id}
                    onClick={() => setSelectedHospitalId(cand.hospital.id)}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all cursor-pointer space-y-2',
                      isSelected
                        ? 'bg-[#FAF6F0] border-[#382416] ring-2 ring-[#382416]/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'size-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold text-white',
                            idx === 0 ? 'bg-[#dc5000]' : 'bg-slate-400',
                          )}
                        >
                          #{idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-[#382416] leading-tight">{cand.hospital.name}</h4>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">{cand.tier} · {selectedDistrict}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-xs font-bold text-emerald-700">{cand.totalScore} pts</span>
                        <div className="text-[10px] font-mono text-slate-500 font-bold">
                          ⏱ {cand.etaMinutes}m ({cand.distanceKm}km)
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-400">ICU BEDS:</span>{' '}
                        <strong className={cand.availIcu > 0 ? 'text-emerald-700' : 'text-red-600'}>
                          {cand.availIcu} Avail
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">TRAUMA:</span>{' '}
                        <strong className={cand.hasTraumaSurgeon ? 'text-blue-700' : 'text-slate-500'}>
                          {cand.hasTraumaSurgeon ? 'READY' : 'NO'}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">VENTILATORS:</span>{' '}
                        <strong className={cand.hasVentilators ? 'text-emerald-700' : 'text-slate-500'}>
                          {cand.hasVentilators ? 'ACTIVE' : 'NO'}
                        </strong>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              type="button"
              onClick={handleExecute108Dispatch}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-transform active:scale-98"
            >
              <Send className="size-4" />
              <span>🚨 DISPATCH 108 AMBULANCE (PRE-BOOK BED AT {targetHospital?.hospital.short ?? 'HOSPITAL'})</span>
            </button>
          </div>

          <div className="rounded-2xl border border-[#382416]/15 bg-white p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-xs font-bold font-mono text-[#382416] uppercase">
                <Activity className="size-4 text-red-600" />
                ACTIVE IN-FLIGHT 108 DISPATCHES ({activeDispatches.length})
              </h3>
              <span className="size-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="space-y-2.5 max-h-[260px] overflow-y-auto">
              {activeDispatches.map((disp) => (
                <div key={disp.id} className="p-3 rounded-xl border border-red-200 bg-red-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      {disp.token}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-slate-700">
                      {disp.ambulanceNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-[#382416]">
                    <span>{disp.patientName}</span>
                    <span className="text-red-700 font-mono">ETA: {disp.remainingMinutes} Mins</span>
                  </div>

                  <div className="text-[10px] text-slate-600 font-mono truncate">
                    Destination: <strong>{disp.destinationHospitalName}</strong>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-red-100">
                    <span className="text-[9px] font-mono text-slate-500">
                      SpO₂: {disp.vitals.spo2}% · HR: {disp.vitals.heartRate} · BP: {disp.vitals.systolicBp}
                    </span>
                    {disp.status !== 'ARRIVED_TRAUMA_BAY' ? (
                      <button
                        type="button"
                        onClick={() => handleMarkArrived(disp.id)}
                        className="px-2.5 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-mono text-[9px] font-bold cursor-pointer"
                      >
                        ⚡ MARK ARRIVED (BED HANDOVER)
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> ADMITTED
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


