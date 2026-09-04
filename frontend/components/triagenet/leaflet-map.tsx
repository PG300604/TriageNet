'use client'

import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import {
  Navigation,
  Hospital,
  Bed,
  Activity,
  MapPin,
  Stethoscope,
  AlertTriangle,
  ShieldCheck,
  Ambulance,
  Radio,
  Flame,
  CheckCircle2,
  User,
  Wrench,
  X,
  RefreshCw,
  Layers,
} from 'lucide-react'

export interface MapHospitalNode {
  id: string
  name: string
  districtName: string
  facilityTier: string
  lat: number
  lng: number
  totalBeds: number
  usedBeds: number
  availableGeneralBeds: number
  availableIcuBeds: number
  hasVentilator: boolean
  hasTraumaSurgery: boolean
  hasBloodBank: boolean
}

export interface MapAmbulanceUnit {
  id: string
  callSign: string
  number: string
  type: 'ALS' | 'BLS'
  status: 'DISPATCHED' | 'AVAILABLE_AT_BASE' | 'ON_SCENE'
  lat: number
  lng: number
  baseStationName: string
  coverageRadiusKm: number
  patientName?: string
  incidentNature?: string
  priority?: 'P1' | 'P2' | 'P3'
  severityScore?: number
  destinationHospitalId?: string
  destinationHospitalName?: string
  etaMinutes?: number
  vitals?: {
    spo2: number
    heartRate: number
    systolicBp: number
    gcs: number
  }
  crew?: {
    driver: string
    paramedic: string
  }
  equipment?: string[]
}

interface LeafletMapProps {
  hospitals: MapHospitalNode[]
  selectedHospitalId?: string
  onSelectHospital?: (id: string) => void
  ambulances?: MapAmbulanceUnit[]
  selectedAmbulanceId?: string
  onSelectAmbulance?: (amb: MapAmbulanceUnit | null) => void
  ambulanceLocation?: { lat: number; lng: number }
  routePolyline?: [number, number][]
  showCoverageZones?: boolean
  onRerouteAmbulance?: (ambId: string, newHospitalId: string) => void
  onMarkArrived?: (ambId: string) => void
}

export function LeafletMap({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  ambulances = [],
  selectedAmbulanceId,
  onSelectAmbulance,
  ambulanceLocation = { lat: 23.3441, lng: 85.3096 }, // Ranchi City Center fallback
  routePolyline,
  showCoverageZones = true,
  onRerouteAmbulance,
  onMarkArrived,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersGroupRef = useRef<L.LayerGroup | null>(null)
  const coverageGroupRef = useRef<L.LayerGroup | null>(null)
  const routeGroupRef = useRef<L.LayerGroup | null>(null)

  const [activeHospital, setActiveHospital] = useState<MapHospitalNode | null>(null)
  const [activeAmbulance, setActiveAmbulance] = useState<MapAmbulanceUnit | null>(null)
  const [localShowZones, setLocalShowZones] = useState<boolean>(showCoverageZones)

  // Initialize Leaflet map with standard OpenStreetMap tiles (eliminates Carto watermark)
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    // Center map around Jharkhand (Ranchi capital)
    const map = L.map(mapContainerRef.current, {
      center: [23.45, 85.35],
      zoom: 8,
      zoomControl: true,
    })

    // Clean OpenStreetMap standard tile layer - no API key requirement, no watermarks
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map)

    const coverageGroup = L.layerGroup().addTo(map)
    const routeGroup = L.layerGroup().addTo(map)
    const markersGroup = L.layerGroup().addTo(map)

    coverageGroupRef.current = coverageGroup
    routeGroupRef.current = routeGroup
    markersGroupRef.current = markersGroup
    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Sync external selectedAmbulanceId
  useEffect(() => {
    if (selectedAmbulanceId) {
      const found = ambulances.find((a) => a.id === selectedAmbulanceId)
      if (found) {
        setActiveAmbulance(found)
        setActiveHospital(null)
      }
    }
  }, [selectedAmbulanceId, ambulances])

  // Sync external selectedHospitalId
  useEffect(() => {
    if (selectedHospitalId) {
      const found = hospitals.find((h) => h.id === selectedHospitalId)
      if (found) {
        setActiveHospital(found)
      }
    }
  }, [selectedHospitalId, hospitals])

  // Render Hospital Markers, Ambulance Markers, Coverage Radii, and Routing Lines
  useEffect(() => {
    const map = mapInstanceRef.current
    const markersGroup = markersGroupRef.current
    const coverageGroup = coverageGroupRef.current
    const routeGroup = routeGroupRef.current
    if (!map || !markersGroup || !coverageGroup || !routeGroup) return

    markersGroup.clearLayers()
    coverageGroup.clearLayers()
    routeGroup.clearLayers()

    // 1. Render Hospital Markers with Dynamic Capacity & Surge Coloring
    hospitals.forEach((h) => {
      const loadRatio = h.totalBeds > 0 ? h.usedBeds / h.totalBeds : 0.5
      const loadPercent = Math.round(loadRatio * 100)
      const isSelected = h.id === selectedHospitalId

      let colorClass = 'bg-emerald-600 border-emerald-300'
      let ringClass = 'ring-2 ring-emerald-400/40'
      let badgeHtml = `<span class="absolute -top-3.5 px-1 py-0.2 rounded-full bg-emerald-700 text-white text-[9px] font-mono font-bold tracking-tight border border-emerald-300 shadow-xs">${loadPercent}%</span>`

      // Distinct visual tiers:
      // >= 80%: High-stress Crimson Red with pulsing beacon & alert badge
      // 60-79%: Amber / Warm Orange
      // < 60%: Balanced Emerald Green
      if (loadRatio >= 0.80) {
        colorClass = 'bg-rose-600 border-rose-200'
        ringClass = 'ring-4 ring-rose-500/60 animate-pulse'
        badgeHtml = `<span class="absolute -top-3.5 px-1.5 py-0.2 rounded-full bg-rose-700 text-white text-[9px] font-mono font-bold tracking-tight border border-rose-300 shadow-sm flex items-center gap-0.5">⚠️ ${loadPercent}%</span>`
      } else if (loadRatio >= 0.60) {
        colorClass = 'bg-amber-500 border-amber-200'
        ringClass = 'ring-2 ring-amber-400/40'
        badgeHtml = `<span class="absolute -top-3.5 px-1 py-0.2 rounded-full bg-amber-600 text-white text-[9px] font-mono font-bold tracking-tight border border-amber-300 shadow-xs">${loadPercent}%</span>`
      }

      const customIcon = L.divIcon({
        className: 'custom-hospital-marker',
        html: `
          <div class="relative flex flex-col items-center justify-center cursor-pointer group">
            ${badgeHtml}
            <div class="absolute -inset-1 rounded-xl ${ringClass} ${isSelected ? 'ring-4 ring-blue-600 scale-125' : ''}"></div>
            <div class="relative flex items-center justify-center size-8 rounded-xl ${colorClass} text-white font-bold shadow-lg border-2 transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6v12M6 12h12"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const marker = L.marker([h.lat, h.lng], { icon: customIcon })

      marker.bindTooltip(
        `<b>${h.name}</b><br/>Occupancy: <span style="font-weight:bold; color:${loadRatio >= 0.8 ? '#e11d48' : loadRatio >= 0.6 ? '#d97706' : '#059669'}">${loadPercent}% (${h.usedBeds}/${h.totalBeds} Beds)</span><br/>ICU Available: <b>${h.availableIcuBeds}</b>`,
        { permanent: false, direction: 'top', offset: [0, -18] }
      )

      marker.on('click', () => {
        setActiveHospital(h)
        setActiveAmbulance(null)
        if (onSelectHospital) onSelectHospital(h.id)
      })

      markersGroup.addLayer(marker)
    })

    // 2. Render Multi-Ambulance Fleet & Operational Coverage Radii
    const fleetToRender: MapAmbulanceUnit[] = ambulances.length > 0 ? ambulances : [
      {
        id: 'amb-jh-01',
        callSign: '108 ALS #JH-01',
        number: 'JH-01-AZ-1081',
        type: 'ALS',
        status: 'DISPATCHED',
        lat: ambulanceLocation.lat,
        lng: ambulanceLocation.lng,
        baseStationName: 'RIMS Ranchi Central EMT Hub',
        coverageRadiusKm: 25,
        patientName: 'Rameshwar Mahato',
        incidentNature: 'NH-33 Toll High-Speed Collision',
        priority: 'P1',
        severityScore: 92,
        destinationHospitalName: hospitals[0]?.name || 'Rajendra Institute of Medical Sciences (RIMS)',
        etaMinutes: 14,
        vitals: { spo2: 84, heartRate: 128, systolicBp: 88, gcs: 9 },
        crew: { driver: 'S. K. Verma', paramedic: 'Dr. A. Minz (EMT-Adv)' },
        equipment: ['Mindray Transport Vent', 'Philips MRx Defib', 'O2 Supply', 'Syringe Pump'],
      },
    ]

    fleetToRender.forEach((amb) => {
      const isDispatched = amb.status === 'DISPATCHED'
      const isOnScene = amb.status === 'ON_SCENE'

      // Render Coverage Service Zone Circle (if toggled on)
      if (localShowZones && amb.coverageRadiusKm > 0) {
        let zoneColor = '#16a34a' // Green for available base
        let fillColor = '#22c55e'
        if (isDispatched) {
          zoneColor = '#ea580c' // Orange for dispatched
          fillColor = '#f97316'
        } else if (isOnScene) {
          zoneColor = '#dc2626' // Red for on-scene
          fillColor = '#ef4444'
        }

        const coverageCircle = L.circle([amb.lat, amb.lng], {
          radius: amb.coverageRadiusKm * 1000,
          color: zoneColor,
          weight: isDispatched ? 2 : 1.2,
          opacity: 0.7,
          fillColor: fillColor,
          fillOpacity: 0.07,
          dashArray: '5, 5',
        })

        coverageCircle.bindTooltip(
          `<b>${amb.callSign} Operational Coverage</b><br/>Base: ${amb.baseStationName}<br/>Radius: ${amb.coverageRadiusKm} km (${amb.status})`,
          { permanent: false, direction: 'center' }
        )

        coverageGroup.addLayer(coverageCircle)
      }

      // Ambulance Marker Icon based on status
      let ambBg = 'bg-emerald-700 border-emerald-300 text-white'
      let pulsePing = ''
      let statusBadge = 'STANDBY'

      if (isDispatched) {
        ambBg = 'bg-[#382416] border-[#ea580c] text-[#ffedd7]'
        pulsePing = '<div class="absolute -inset-2 rounded-full bg-orange-500/35 animate-ping"></div>'
        statusBadge = 'DISPATCHED'
      } else if (isOnScene) {
        ambBg = 'bg-rose-700 border-rose-300 text-white'
        pulsePing = '<div class="absolute -inset-2 rounded-full bg-rose-500/35 animate-ping"></div>'
        statusBadge = 'ON-SCENE'
      }

      const ambIcon = L.divIcon({
        className: 'custom-ambulance-marker',
        html: `
          <div class="relative flex flex-col items-center justify-center cursor-pointer group">
            ${pulsePing}
            <div class="relative flex items-center justify-center size-9 rounded-xl ${ambBg} font-bold shadow-xl border-2 transition-transform group-hover:scale-115">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${isDispatched ? '#ea580c' : '#ffffff'}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v9c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <path d="M9 17h6"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
            <span class="mt-1 bg-[#382416] text-[#ffedd7] border ${isDispatched ? 'border-[#ea580c]' : 'border-stone-400'} text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shadow whitespace-nowrap">
              ${amb.callSign} [${statusBadge}]
            </span>
          </div>
        `,
        iconSize: [40, 48],
        iconAnchor: [20, 24],
      })

      const ambMarker = L.marker([amb.lat, amb.lng], { icon: ambIcon })

      ambMarker.bindTooltip(
        `<b>${amb.callSign} (${amb.type})</b><br/>Base: ${amb.baseStationName}<br/>Status: <b>${amb.status}</b>${amb.patientName ? `<br/>Patient: ${amb.patientName} (${amb.etaMinutes ?? 10}m ETA)` : ''}`,
        { permanent: false, direction: 'top', offset: [0, -22] }
      )

      ambMarker.on('click', () => {
        setActiveAmbulance(amb)
        setActiveHospital(null)
        if (onSelectAmbulance) onSelectAmbulance(amb)
      })

      markersGroup.addLayer(ambMarker)

      // Draw active transit route line from dispatched ambulance to its target hospital
      if (isDispatched && amb.destinationHospitalId) {
        const destHospital = hospitals.find((h) => h.id === amb.destinationHospitalId)
        if (destHospital) {
          const polyline = L.polyline(
            [
              [amb.lat, amb.lng],
              [destHospital.lat, destHospital.lng],
            ],
            {
              color: '#ea580c',
              weight: 4,
              opacity: 0.8,
              dashArray: '8, 6',
            }
          )
          routeGroup.addLayer(polyline)
        }
      }
    })

    // Custom routePolyline if passed explicitly
    if (routePolyline && routePolyline.length > 0) {
      const polyline = L.polyline(routePolyline, {
        color: '#dc5000',
        weight: 5,
        opacity: 0.85,
        dashArray: '8, 8',
      })
      routeGroup.addLayer(polyline)
    }
  }, [hospitals, selectedHospitalId, ambulances, ambulanceLocation, routePolyline, localShowZones, onSelectHospital, onSelectAmbulance])

  return (
    <div className="relative w-full h-[550px] rounded-2xl overflow-hidden border border-[#382416]/15 shadow-md font-sans">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Left: Coverage Layer Toggle */}
      <div className="absolute top-3 left-3 z-[400] flex items-center gap-2">
        <button
          type="button"
          onClick={() => setLocalShowZones((prev) => !prev)}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold backdrop-blur-md border shadow-md flex items-center gap-1.5 transition-all cursor-pointer ${
            localShowZones
              ? 'bg-[#382416] text-[#ffedd7] border-[#382416]'
              : 'bg-white/90 text-stone-700 border-stone-300 hover:bg-stone-50'
          }`}
        >
          <Layers className="size-3.5 text-[#ea580c]" />
          <span>{localShowZones ? 'Hide Coverage Radii' : 'Show Coverage Radii (Zones)'}</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[400] bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl p-3.5 shadow-lg max-w-xs text-xs">
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-stone-100">
          <span className="font-mono text-[10px] font-bold text-[#382416] uppercase tracking-wider">
            [GIS REAL-TIME TELEMETRY]
          </span>
          <span className="font-mono text-[9px] text-stone-500 font-semibold">{hospitals.length} HOSPITALS</span>
        </div>
        <div className="space-y-2 text-[11px] font-medium text-stone-700">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-rose-600 ring-2 ring-rose-400/50 animate-pulse shrink-0" />
              <span className="font-bold text-rose-700">Surge / Max Capacity</span>
            </div>
            <span className="font-mono text-[10px] text-rose-700 font-bold">&ge; 80%</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-amber-500 shrink-0" />
              <span>Moderate Load</span>
            </div>
            <span className="font-mono text-[10px] text-amber-700 font-bold">60–79%</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full bg-emerald-600 shrink-0" />
              <span>Optimal Capacity</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-700 font-bold">&lt; 60%</span>
          </div>

          <div className="pt-2 border-t border-stone-100 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-lg bg-[#382416] border border-[#ea580c] shrink-0" />
              <span className="font-semibold text-stone-800">108 Dispatched (En Route)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-lg bg-emerald-700 border border-emerald-300 shrink-0" />
              <span>108 Available (At Base)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full border-2 border-dashed border-orange-500 shrink-0" />
              <span className="text-stone-500 text-[10px]">Operational Service Radius</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Hospital Detail Drawer */}
      {activeHospital && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto z-[400] bg-white border border-[#382416]/20 rounded-2xl p-4 shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-bold text-[#ea580c] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded uppercase">
                  [{activeHospital.facilityTier || 'DISTRICT'}]
                </span>
                {activeHospital.totalBeds > 0 && activeHospital.usedBeds / activeHospital.totalBeds >= 0.8 ? (
                  <span className="font-mono text-[9px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded uppercase animate-pulse">
                    CRITICAL SURGE
                  </span>
                ) : null}
              </div>
              <h3 className="text-sm font-bold text-[#382416] mt-1">{activeHospital.name}</h3>
              <p className="text-xs text-stone-500 font-medium">{activeHospital.districtName} District, Jharkhand</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveHospital(null)}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3">
            <div className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#382416]/10">
              <span className="text-[10px] font-mono text-stone-500 block uppercase">Available General Beds</span>
              <span className="text-base font-bold text-emerald-700 font-mono">
                {activeHospital.availableGeneralBeds} Beds
              </span>
            </div>
            <div className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#382416]/10">
              <span className="text-[10px] font-mono text-stone-500 block uppercase">Available ICU Beds</span>
              <span className="text-base font-bold text-rose-700 font-mono">
                {activeHospital.availableIcuBeds} ICU Beds
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap mb-3 text-[10px] font-mono">
            {activeHospital.hasVentilator && (
              <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded">
                ✔ VENTILATORS
              </span>
            )}
            {activeHospital.hasTraumaSurgery && (
              <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded">
                ✔ TRAUMA SURGERY
              </span>
            )}
            {activeHospital.hasBloodBank && (
              <span className="bg-red-50 text-red-800 border border-red-200 px-2 py-0.5 rounded">
                ✔ BLOOD BANK
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (onSelectHospital) onSelectHospital(activeHospital.id)
            }}
            className="w-full py-2 px-3 rounded-xl bg-[#382416] hover:bg-[#28180d] text-[#ffedd7] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Navigation className="size-3.5 text-[#ea580c]" />
            Set as Active Referral Destination
          </button>
        </div>
      )}

      {/* Interactive Ambulance Fleet Telemetry Drawer */}
      {activeAmbulance && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto z-[400] bg-white border border-[#382416]/20 rounded-2xl p-4 shadow-2xl max-w-md w-full animate-in fade-in slide-in-from-bottom-2 font-sans">
          <div className="flex items-start justify-between gap-3 pb-2 border-b border-stone-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[9px] font-bold text-white bg-[#382416] px-2 py-0.5 rounded uppercase">
                  {activeAmbulance.type} UNIT
                </span>
                <span
                  className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                    activeAmbulance.status === 'DISPATCHED'
                      ? 'bg-orange-100 text-[#ea580c] border border-orange-200'
                      : activeAmbulance.status === 'ON_SCENE'
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {activeAmbulance.status === 'DISPATCHED' ? '🚨 DISPATCHED' : activeAmbulance.status === 'ON_SCENE' ? '🔴 ON-SCENE' : '🟢 AVAILABLE AT BASE'}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#382416] mt-1">{activeAmbulance.callSign}</h3>
              <p className="text-xs text-stone-500 font-medium">Reg: {activeAmbulance.number} · {activeAmbulance.baseStationName}</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveAmbulance(null)}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-lg hover:bg-stone-100 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Coverage & Crew Details */}
          <div className="grid grid-cols-2 gap-2 my-2.5">
            <div className="bg-[#FAF6F0] p-2 rounded-xl border border-[#382416]/10">
              <span className="text-[9px] font-mono text-stone-500 block uppercase">Operational Radius</span>
              <span className="text-xs font-bold text-stone-800 font-mono">
                {activeAmbulance.coverageRadiusKm} km Service Zone
              </span>
            </div>
            <div className="bg-[#FAF6F0] p-2 rounded-xl border border-[#382416]/10">
              <span className="text-[9px] font-mono text-stone-500 block uppercase">EMT Crew on Board</span>
              <span className="text-xs font-bold text-stone-800 font-mono truncate block">
                {activeAmbulance.crew?.paramedic || 'Certified EMT Paramedic'}
              </span>
            </div>
          </div>

          {/* If Dispatched: Patient & Telemetry Card */}
          {activeAmbulance.patientName && (
            <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-3 my-2.5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#382416]">
                  Patient: {activeAmbulance.patientName} ({activeAmbulance.priority || 'P1'})
                </span>
                <span className="font-mono text-[10px] font-bold text-red-600 bg-white px-2 py-0.5 rounded border border-red-200">
                  Acuity: {activeAmbulance.severityScore || 90}/100
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium">
                Incident: {activeAmbulance.incidentNature || 'Severe Trauma / Road Collision'}
              </p>

              {/* Vitals HUD */}
              {activeAmbulance.vitals && (
                <div className="grid grid-cols-4 gap-1.5 pt-1 text-center font-mono">
                  <div className="bg-white p-1 rounded-lg border border-orange-200">
                    <span className="text-[8px] text-stone-400 block">SpO₂</span>
                    <span className="text-[11px] font-bold text-red-600">{activeAmbulance.vitals.spo2}%</span>
                  </div>
                  <div className="bg-white p-1 rounded-lg border border-orange-200">
                    <span className="text-[8px] text-stone-400 block">HR</span>
                    <span className="text-[11px] font-bold text-stone-800">{activeAmbulance.vitals.heartRate}</span>
                  </div>
                  <div className="bg-white p-1 rounded-lg border border-orange-200">
                    <span className="text-[8px] text-stone-400 block">BP</span>
                    <span className="text-[11px] font-bold text-stone-800">{activeAmbulance.vitals.systolicBp}</span>
                  </div>
                  <div className="bg-white p-1 rounded-lg border border-orange-200">
                    <span className="text-[8px] text-stone-400 block">GCS</span>
                    <span className="text-[11px] font-bold text-red-600">{activeAmbulance.vitals.gcs}/15</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-orange-200/60">
                <span className="text-stone-600">
                  Target: <b>{activeAmbulance.destinationHospitalName || 'Apex Facility'}</b>
                </span>
                <span className="font-mono font-bold text-[#ea580c]">
                  ETA: ~{activeAmbulance.etaMinutes || 12} mins
                </span>
              </div>
            </div>
          )}

          {/* Onboard Equipment Badges */}
          <div className="flex items-center gap-1 flex-wrap mb-3 text-[9px] font-mono">
            {(activeAmbulance.equipment || ['Intensive Ventilator', 'Defibrillator', 'O2 Cylinder', 'Infusion Pump']).map(
              (eq) => (
                <span key={eq} className="bg-stone-100 text-stone-700 border border-stone-200 px-1.5 py-0.5 rounded">
                  ✔ {eq}
                </span>
              )
            )}
          </div>

          {/* Interactive Actions */}
          <div className="flex items-center gap-2">
            {activeAmbulance.status === 'DISPATCHED' ? (
              <button
                type="button"
                onClick={() => {
                  if (onMarkArrived) onMarkArrived(activeAmbulance.id)
                  setActiveAmbulance(null)
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <CheckCircle2 className="size-3.5 text-emerald-200" />
                Confirm Trauma Bay Arrival
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setActiveAmbulance(null)
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-[#382416] hover:bg-[#28180d] text-[#ffedd7] font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Radio className="size-3.5 text-[#ea580c]" />
                Unit Ready for Emergency Dispatch
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
