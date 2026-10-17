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
  Zap,
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
  accidentHotspot?: {
    id: string
    name: string
    highway: string
    district: string
    lat: number
    lng: number
    monthlyAccidents: number
    blackspotRanking: string
    riskCategory: 'CRITICAL_BLACKSPOT' | 'HIGH_HAZARD' | 'SEVERE_CORRIDOR'
  }
  trafficCondition?: {
    level: 'CLEAR' | 'MODERATE' | 'HEAVY'
    delayMin: number
    greenWaveActive: boolean
    speedKmH?: number
  }
  onToggleGreenWave?: () => void
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
  accidentHotspot,
  trafficCondition,
  onToggleGreenWave,
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
  const [simTick, setSimTick] = useState<number>(0)

  // Uber-style continuous vehicle progression ticker (1.2s intervals)
  useEffect(() => {
    const timer = setInterval(() => {
      setSimTick((prev) => (prev + 1) % 100)
    }, 1200)
    return () => clearInterval(timer)
  }, [])

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

  // Camera auto-framing whenever Dijkstra routePolyline updates
  const lastFittedRouteKey = useRef<string>('')
  useEffect(() => {
    if (!mapInstanceRef.current || !routePolyline || routePolyline.length < 2) return
    const routeKey = `${routePolyline[0][0]},${routePolyline[0][1]}->${routePolyline[routePolyline.length - 1][0]},${routePolyline[routePolyline.length - 1][1]}`
    if (lastFittedRouteKey.current !== routeKey) {
      lastFittedRouteKey.current = routeKey
      try {
        const bounds = L.latLngBounds(routePolyline)
        mapInstanceRef.current.fitBounds(bounds, { padding: [65, 65], maxZoom: 12, animate: true })
      } catch (err) {
        console.warn('fitBounds error', err)
      }
    }
  }, [routePolyline])

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

    let primaryAmbulanceLat: number | null = null
    let primaryAmbulanceLng: number | null = null
    let primarySegmentIdx = 0

    fleetToRender.forEach((amb, ambIndex) => {
      const isDispatched = amb.status === 'DISPATCHED'
      const isOnScene = amb.status === 'ON_SCENE'

      // Calculate dynamic simulated position and heading along active route (Uber 3D Vehicle Telemetry)
      let currentLat = amb.lat
      let currentLng = amb.lng
      let heading = (ambIndex * 65 + 35) % 360
      let speedKmH = 0

      // Determine if this specific ambulance is the primary responding unit for the active route
      const isPrimaryRouteUnit =
        ambIndex === 0 ||
        amb.number === 'JH-01-ALS-1081' ||
        (selectedAmbulanceId && amb.id === selectedAmbulanceId)

      if (isDispatched) {
        if (trafficCondition?.greenWaveActive) {
          speedKmH = 72 + ((simTick + ambIndex * 2) % 4) * 2 // 72 - 78 km/h Green Wave Clear
        } else if (trafficCondition?.level === 'HEAVY') {
          speedKmH = 22 + ((simTick + ambIndex * 2) % 4) * 2 // 22 - 28 km/h Heavy Congestion
        } else if (trafficCondition?.level === 'MODERATE') {
          speedKmH = 38 + ((simTick + ambIndex * 2) % 4) * 2 // 38 - 44 km/h Moderate Toll Queue
        } else {
          speedKmH = 56 + ((simTick + ambIndex * 3) % 6) * 2 // 56 - 66 km/h Free Flow Corridor
        }
        if (isPrimaryRouteUnit && routePolyline && routePolyline.length >= 2) {
          // Progress primary responding unit smoothly along routePolyline waypoints
          const totalPts = routePolyline.length
          const phase = ((simTick * 1.5) % 36) / 36
          const indexFloat = phase * (totalPts - 1)
          const currIdx = Math.floor(indexFloat)
          const nextIdx = Math.min(totalPts - 1, currIdx + 1)
          const fract = indexFloat - currIdx

          const p1 = routePolyline[currIdx]
          const p2 = routePolyline[nextIdx]
          currentLat = p1[0] + (p2[0] - p1[0]) * fract
          currentLng = p1[1] + (p2[1] - p1[1]) * fract

          const dLat = p2[0] - p1[0]
          const dLng = p2[1] - p1[1]
          heading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI)

          primaryAmbulanceLat = currentLat
          primaryAmbulanceLng = currentLng
          primarySegmentIdx = currIdx
        } else if (amb.destinationHospitalId) {
          const destHospital = hospitals.find((h) => h.id === amb.destinationHospitalId)
          if (destHospital) {
            const progress = ((simTick + ambIndex * 5) % 25) / 25
            currentLat = amb.lat + (destHospital.lat - amb.lat) * progress
            currentLng = amb.lng + (destHospital.lng - amb.lng) * progress
            const dLat = destHospital.lat - amb.lat
            const dLng = destHospital.lng - amb.lng
            heading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI)
          }
        }
      } else if (isOnScene) {
        speedKmH = 0
      } else {
        // Standby at base station
        speedKmH = 0
      }

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

      // High-Fidelity 3D Isometric Ambulance Van Marker with roof strobe, Battenburg livery & headlights
      const amb3dIcon = L.divIcon({
        className: 'uber-ambulance-marker',
        html: `
          <div class="relative flex flex-col items-center justify-center cursor-pointer group" style="filter: drop-shadow(0 8px 18px rgba(0,0,0,0.55));">
            <!-- Pulsing Radar Wave Rings for Dispatched or On-Scene Units -->
            ${isDispatched ? '<div class="absolute -inset-4 rounded-full bg-orange-500/35 animate-ping pointer-events-none"></div>' : ''}
            ${isOnScene ? '<div class="absolute -inset-4 rounded-full bg-rose-500/35 animate-ping pointer-events-none"></div>' : ''}

            <!-- 3D Ambulance Vehicle Body with Directional Heading -->
            <div class="relative transition-transform duration-500 ease-linear" style="transform: rotate(${heading}deg);">
              <!-- Forward Headlight Cones (projecting onto asphalt road) -->
              ${isDispatched ? `
              <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-14 h-12 pointer-events-none z-0">
                <div style="width: 100%; height: 100%; background: radial-gradient(ellipse at 50% 100%, rgba(254, 240, 138, 0.55) 0%, rgba(254, 240, 138, 0.08) 55%, transparent 75%); clip-path: polygon(30% 100%, 70% 100%, 98% 0%, 2% 0%);"></div>
              </div>
              ` : ''}

              <!-- Asphalt Road Ground Shadow -->
              <div class="absolute -bottom-1 -left-1 w-7 h-14 bg-black/60 blur-[3px] rounded-xl pointer-events-none"></div>

              <!-- Authentic 3D Emergency Ambulance Van (28px wide, 54px long) -->
              <svg width="28" height="54" viewBox="0 0 28 54" fill="none" xmlns="http://www.w3.org/2000/svg" class="relative z-10">
                <!-- White Emergency Chassis with beveled corner curves -->
                <rect x="2" y="1" width="24" height="52" rx="6" fill="#f8fafc" stroke="#334155" stroke-width="1.2"/>
                
                <!-- Front Cab Hood & Bumper -->
                <rect x="3.5" y="1.5" width="21" height="9" rx="4" fill="#e2e8f0"/>
                <!-- Dual Headlights -->
                <rect x="4" y="2" width="3.5" height="2" rx="1" fill="#fef08a" stroke="#ca8a04" stroke-width="0.4"/>
                <rect x="20.5" y="2" width="3.5" height="2" rx="1" fill="#fef08a" stroke="#ca8a04" stroke-width="0.4"/>

                <!-- Dark Tinted Curved Windshield -->
                <path d="M 4 11 C 4 8.5 24 8.5 24 11 L 22.5 16.5 L 5.5 16.5 Z" fill="#0f172a" stroke="#38bdf8" stroke-width="0.6"/>

                <!-- Cab Roof Emergency Lightbar Housing -->
                <rect x="4.5" y="17.5" width="19" height="4.5" rx="1.5" fill="#1e293b" stroke="#0f172a" stroke-width="0.5"/>
                <!-- Strobe LEDs (Red on driver side, Cyan/Blue on passenger side) -->
                <circle cx="8" cy="19.7" r="2.2" fill="${isDispatched ? '#ef4444' : '#22c55e'}" class="${isDispatched ? 'animate-pulse' : ''}"/>
                <circle cx="20" cy="19.7" r="2.2" fill="${isDispatched ? '#06b6d4' : '#ffffff'}" class="${isDispatched ? 'animate-pulse' : ''}"/>

                <!-- High-Vis Retroreflective Battenburg Side Markings (Alternating Yellow & Green) -->
                <rect x="2" y="23" width="2.5" height="4.5" fill="#facc15"/>
                <rect x="2" y="27.5" width="2.5" height="4.5" fill="#15803d"/>
                <rect x="2" y="32" width="2.5" height="4.5" fill="#facc15"/>
                <rect x="2" y="36.5" width="2.5" height="4.5" fill="#15803d"/>
                <rect x="2" y="41" width="2.5" height="4.5" fill="#facc15"/>

                <rect x="23.5" y="23" width="2.5" height="4.5" fill="#facc15"/>
                <rect x="23.5" y="27.5" width="2.5" height="4.5" fill="#15803d"/>
                <rect x="23.5" y="32" width="2.5" height="4.5" fill="#facc15"/>
                <rect x="23.5" y="36.5" width="2.5" height="4.5" fill="#15803d"/>
                <rect x="23.5" y="41" width="2.5" height="4.5" fill="#facc15"/>

                <!-- Patient Care Compartment Roof -->
                <rect x="4.5" y="23" width="19" height="24" rx="2" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="0.5"/>
                <!-- Red Emergency Medical Cross -->
                <rect x="12.5" y="30.5" width="3" height="10" rx="0.5" fill="#dc2626"/>
                <rect x="9" y="34" width="10" height="3" rx="0.5" fill="#dc2626"/>
                <!-- "108 ALS" Text -->
                <text x="14" y="27.5" text-anchor="middle" font-size="4.2" font-family="monospace" font-weight="900" fill="#0f172a" letter-spacing="0.2">108 ALS</text>

                <!-- Rear Emergency Doors & Dual Red Taillights -->
                <rect x="3.5" y="48.5" width="21" height="3" rx="1" fill="#cbd5e1"/>
                <line x1="14" y1="48.5" x2="14" y2="51.5" stroke="#64748b" stroke-width="0.8"/>
                <rect x="4" y="50" width="3.5" height="1.5" rx="0.5" fill="#ef4444"/>
                <rect x="20.5" y="50" width="3.5" height="1.5" rx="0.5" fill="#ef4444"/>
              </svg>
            </div>

            <!-- Floating Callsign & Live Speed Badge (Uber Style) -->
            <div class="mt-2 bg-stone-950/95 text-stone-100 border ${
              isDispatched
                ? 'border-orange-500/80 shadow-[0_0_12px_rgba(234,88,12,0.4)]'
                : 'border-stone-700'
            } text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shadow-xl whitespace-nowrap flex items-center gap-1.5">
              <span class="size-1.5 rounded-full ${isDispatched ? 'bg-orange-500 animate-ping' : 'bg-emerald-400'}"></span>
              <span>${amb.callSign}</span>
              ${isDispatched ? `<span class="text-orange-400 font-black">${speedKmH} km/h</span>` : `<span class="text-emerald-400">STANDBY</span>`}
            </div>
          </div>
        `,
        iconSize: [48, 62],
        iconAnchor: [24, 31],
      })

      const ambMarker = L.marker([currentLat, currentLng], { icon: amb3dIcon })

      ambMarker.bindTooltip(
        `<b>${amb.callSign} (${amb.type})</b><br/>Base: ${amb.baseStationName}<br/>Status: <b>${amb.status}</b>${
          isDispatched ? `<br/>Speed: <b>${speedKmH} km/h</b>` : ''
        }${amb.patientName ? `<br/>Patient: ${amb.patientName} (${amb.etaMinutes ?? 10}m ETA)` : ''}`,
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
              [currentLat, currentLng],
              [destHospital.lat, destHospital.lng],
            ],
            {
              color: '#ea580c',
              weight: 3.5,
              opacity: 0.75,
              dashArray: '6, 6',
            }
          )
          routeGroup.addLayer(polyline)
        }
      }
    })

    // 3. Render High-Resolution Dijkstra Shortest Path Corridors (Swiggy / Domino's Style Traveled vs Remaining Path)
    if (routePolyline && routePolyline.length > 0) {
      const isGreenWave = trafficCondition?.greenWaveActive ?? false
      const isHeavy = trafficCondition?.level === 'HEAVY' && !isGreenWave
      const isModerate = trafficCondition?.level === 'MODERATE' && !isGreenWave

      const glowColor = isGreenWave ? '#10b981' : isHeavy ? '#dc2626' : isModerate ? '#ea580c' : '#16a34a'
      const coreColor = isGreenWave ? '#34d399' : isHeavy ? '#ef4444' : isModerate ? '#ff6b00' : '#22c55e'
      const glowOpacity = isGreenWave ? 0.45 : isHeavy ? 0.38 : 0.28
      const glowWeight = isGreenWave ? 11 : 9

      if (primaryAmbulanceLat !== null && primaryAmbulanceLng !== null && routePolyline.length >= 2) {
        // A. Traveled Path Segment (Swiggy / Domino's Style: Dimmed consumed trail behind the ambulance)
        const traveledPts: [number, number][] = []
        for (let i = 0; i <= primarySegmentIdx; i++) {
          traveledPts.push(routePolyline[i])
        }
        traveledPts.push([primaryAmbulanceLat, primaryAmbulanceLng])

        if (traveledPts.length >= 2) {
          const traveledLine = L.polyline(traveledPts, {
            color: '#64748b',
            weight: 3.5,
            opacity: 0.45,
            dashArray: '6, 6',
            lineCap: 'round',
            lineJoin: 'round',
          })
          routeGroup.addLayer(traveledLine)
        }

        // B. Remaining Path Ahead (Vibrant emergency corridor with pulsing live traffic styling)
        const remainingPts: [number, number][] = [[primaryAmbulanceLat, primaryAmbulanceLng]]
        for (let i = primarySegmentIdx + 1; i < routePolyline.length; i++) {
          remainingPts.push(routePolyline[i])
        }

        if (remainingPts.length >= 2) {
          const glowLine = L.polyline(remainingPts, {
            color: glowColor,
            weight: glowWeight,
            opacity: glowOpacity,
            lineCap: 'round',
            lineJoin: 'round',
          })
          routeGroup.addLayer(glowLine)

          const coreLine = L.polyline(remainingPts, {
            color: coreColor,
            weight: 5,
            opacity: 0.98,
            dashArray: isGreenWave ? '14, 6' : '10, 8',
            lineCap: 'round',
            lineJoin: 'round',
          })
          routeGroup.addLayer(coreLine)
        }
      } else {
        // Fallback: Full polyline if vehicle hasn't dispatched yet
        const glowLine = L.polyline(routePolyline, {
          color: glowColor,
          weight: glowWeight,
          opacity: glowOpacity,
          lineCap: 'round',
          lineJoin: 'round',
        })
        routeGroup.addLayer(glowLine)

        const coreLine = L.polyline(routePolyline, {
          color: coreColor,
          weight: 4.5,
          opacity: 0.95,
          dashArray: isGreenWave ? '14, 6' : '10, 8',
          lineCap: 'round',
          lineJoin: 'round',
        })
        routeGroup.addLayer(coreLine)
      }

      // Start Marker (Incident Pick-up Scene / Blackspot Hazard Beacon)
      const startPt = routePolyline[0]
      const isBlackspot = !!accidentHotspot
      const incidentIcon = L.divIcon({
        className: 'incident-scene-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-4 rounded-full bg-rose-600/40 animate-ping"></div>
            <div class="absolute -inset-2 rounded-full bg-red-500/30 animate-pulse"></div>
            <div class="size-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-900 border-2 border-white text-white flex items-center justify-center shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
              </svg>
            </div>
            <div class="absolute -bottom-8 flex flex-col items-center pointer-events-none">
              <span class="bg-black/95 text-rose-300 font-mono text-[9px] font-black px-2 py-0.5 rounded-full border border-rose-500 whitespace-nowrap shadow-xl">
                ${isBlackspot ? `🔴 BLACKSPOT: ${accidentHotspot.monthlyAccidents} CRASHES/MO` : 'INCIDENT PICKUP'}
              </span>
              ${isBlackspot ? `<span class="text-[8px] font-bold text-white bg-red-950/90 px-1.5 py-0.2 rounded mt-0.5 border border-red-800 whitespace-nowrap">${accidentHotspot.name}</span>` : ''}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })
      const startMarker = L.marker([startPt[0], startPt[1]], { icon: incidentIcon })
      startMarker.bindTooltip(
        isBlackspot
          ? `<b>🚨 HIGH-RISK ACCIDENT BLACKSPOT</b><br/><b>${accidentHotspot.name}</b><br/>Corridor: ${accidentHotspot.highway}<br/>Monthly Collisions: <b>${accidentHotspot.monthlyAccidents}</b><br/>Classification: <b>${accidentHotspot.riskCategory.replace('_', ' ')}</b>`
          : '<b>Incident Hotspot Location</b><br/>108 Rapid Extraction Target',
        { permanent: false, direction: 'top' }
      )
      markersGroup.addLayer(startMarker)

      // End Marker (Destination Hospital)
      const endPt = routePolyline[routePolyline.length - 1]
      const destIcon = L.divIcon({
        className: 'destination-hospital-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-3 rounded-full bg-emerald-500/40 animate-pulse"></div>
            <div class="size-7 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 border-2 border-white text-white flex items-center justify-center shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6v12M6 12h12"/>
              </svg>
            </div>
            <span class="absolute -bottom-6 bg-stone-950/95 text-emerald-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-500 whitespace-nowrap shadow-lg">
              ICU HELD (DIJKSTRA TARGET)
            </span>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      })
      const destMarker = L.marker([endPt[0], endPt[1]], { icon: destIcon })
      destMarker.bindTooltip('<b>Target Facility Hospital</b><br/>Emergency Bed Hold Authorized', { permanent: false, direction: 'top' })
      markersGroup.addLayer(destMarker)
    }
  }, [hospitals, selectedHospitalId, ambulances, ambulanceLocation, routePolyline, localShowZones, simTick, onSelectHospital, onSelectAmbulance, accidentHotspot, trafficCondition])

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
              onMarkArrived ? (
                <button
                  type="button"
                  onClick={() => {
                    onMarkArrived(activeAmbulance.id)
                    setActiveAmbulance(null)
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <CheckCircle2 className="size-3.5 text-emerald-200" />
                  Confirm Trauma Bay Arrival
                </button>
              ) : (
                <div className="flex-1 py-2 px-3 rounded-xl bg-stone-100 text-stone-600 font-semibold text-xs flex items-center justify-center gap-1.5 border border-stone-200">
                  <ShieldCheck className="size-3.5 text-stone-500" />
                  <span>Observer Mode (Handover by 108 Dispatcher)</span>
                </div>
              )
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

      {/* Floating AI Highway Traffic & Green Wave Preemption Strip */}
      {trafficCondition && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-black/90 backdrop-blur-md border border-stone-700/80 rounded-2xl px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${
                trafficCondition.greenWaveActive
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                  : trafficCondition.level === 'HEAVY'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                  : 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
              }`}
            >
              <Activity className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] font-bold text-[#ffedd7]">
                  {accidentHotspot ? `${accidentHotspot.name}` : 'Jharkhand Highway Emergency Corridor'}
                </span>
                {trafficCondition.greenWaveActive ? (
                  <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-500/60 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    ⚡ GREEN WAVE CORRIDOR ACTIVE
                  </span>
                ) : (
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      trafficCondition.level === 'HEAVY'
                        ? 'bg-red-500/30 text-red-300 border border-red-500/60'
                        : 'bg-amber-500/30 text-amber-300 border border-amber-500/60'
                    }`}
                  >
                    TRAFFIC: {trafficCondition.level} (+{trafficCondition.delayMin}m DELAY)
                  </span>
                )}
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5">
                {trafficCondition.greenWaveActive
                  ? 'All corridor signals synchronized to Green · 0 congestion delay · Ambulance transit speed ~74 km/h'
                  : `Highway delay factor: +${trafficCondition.delayMin} mins · Ambulance speed restricted to ~${trafficCondition.level === 'HEAVY' ? '24' : '40'} km/h`}
              </p>
            </div>
          </div>

          {onToggleGreenWave && (
            <button
              type="button"
              onClick={onToggleGreenWave}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 shadow-lg ${
                trafficCondition.greenWaveActive
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-300'
                  : 'bg-[#ea580c] hover:bg-[#d94e08] text-white border border-orange-400 animate-pulse'
              }`}
            >
              <Zap className="size-3.5 fill-current" />
              <span>{trafficCondition.greenWaveActive ? '✓ Green Wave Engaged' : '🚨 Activate Green Wave Corridor'}</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
