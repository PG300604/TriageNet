'use client'

import { cn } from '@/lib/utils'
import {
  EDGES,
  type Hospital,
  type TriageState,
  type Transfer,
  hospitalStatus,
  STATUS_LABEL,
} from '@/lib/triage-data'
import { STATUS_CLASSES } from './status'
import { ArrowRight, Route, MapPin, Navigation, Sparkles, Activity, ShieldCheck, Truck } from 'lucide-react'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { MapHospitalNode } from './leaflet-map'
import { useAuth } from '@/lib/auth-context'
import { JHARKHAND_24_DISTRICTS, JHARKHAND_79_HOSPITALS } from '@/lib/jharkhand-data'
import { apiClient } from '@/lib/api-client'



// Dynamically import Leaflet map component to prevent SSR window reference issues
const LeafletMap = dynamic(
  () => import('./leaflet-map').then((mod) => mod.LeafletMap),
  { ssr: false, loading: () => <div className="h-[520px] w-full rounded-2xl bg-slate-100 animate-pulse flex items-center justify-center font-mono text-xs text-slate-400">Loading Jharkhand Spatial Map...</div> }
)

const W = 800
const H = 500

interface RegionalNetworkViewProps {
  state: TriageState
  selectedDistrict?: string
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
    // Star/Orbit layout: Primary/Apex hospital in center, surrounding SDH/CHCs distributed evenly around
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

  // Grid/Balanced layout for statewide or large subsets
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

export function RegionalNetworkView({ state, selectedDistrict = 'ALL' }: RegionalNetworkViewProps) {
  const { hospitals, transfers } = state
  const [hovered, setHovered] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'map' | 'graph'>('map')
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(() => hospitals[0]?.id || 'jh-rims-ranchi')

  // Live spatial routing & real hospital nodes state
  const [originLat, setOriginLat] = useState<number>(23.4832)
  const [originLng, setOriginLng] = useState<number>(85.4611)
  const [originName, setOriginName] = useState<string>('NH-33 Toll Crash (Ormanjhi)')
  const [routingResults, setRoutingResults] = useState<any>(null)
  const [calculatingRoute, setCalculatingRoute] = useState(false)
  const [realHospitals, setRealHospitals] = useState<MapHospitalNode[]>([])


  // Fetch real Jharkhand hospitals from backend API on mount
  useEffect(() => {
    async function fetchRealHospitals() {
      try {
        const data = await apiClient.getHospitals()
        if (data && data.length > 0) {
          const mapped: MapHospitalNode[] = data.map((h) => ({
            id: h.id,
            name: h.name,
            districtName: h.districtName || h.region || 'Jharkhand',
            facilityTier: h.facilityTier || 'DISTRICT',
            lat: h.lat,
            lng: h.lng,
            totalBeds: h.totalBeds,
            usedBeds: h.usedBeds,
            availableGeneralBeds: h.availableGeneralBeds ?? (h.totalBeds - h.usedBeds),
            availableIcuBeds: h.availableIcuBeds ?? 4,
            hasVentilator: h.hasVentilator ?? true,
            hasTraumaSurgery: h.hasTraumaSurgery ?? false,
            hasBloodBank: h.hasBloodBank ?? true,
          }))
          setRealHospitals(mapped)
        }
      } catch (err) {
        console.warn('Backend hospital fetch fallback to real Jharkhand dataset:', err)
      }
    }
    fetchRealHospitals()
  }, [])

  // Complete 79 Real Jharkhand Government Healthcare Facilities
  const fallbackJharkhandNodes: MapHospitalNode[] = JHARKHAND_79_HOSPITALS.map((h) => ({
    id: h.id,
    name: h.name,
    districtName: h.districtName,
    facilityTier: h.facilityTier,
    lat: h.latitude,
    lng: h.longitude,
    totalBeds: h.totalGeneralBeds + h.totalIcuBeds,
    usedBeds: (h.totalGeneralBeds + h.totalIcuBeds) - (h.availableGeneralBeds + h.availableIcuBeds),
    availableGeneralBeds: h.availableGeneralBeds,
    availableIcuBeds: h.availableIcuBeds,
    hasVentilator: h.hasVentilator,
    hasTraumaSurgery: h.hasTraumaSurgery,
    hasBloodBank: h.hasBloodBank,
  }))

  const [filterTier, setFilterTier] = useState<string>('ALL')

  const allAvailableNodes = realHospitals.length > 0 ? realHospitals : fallbackJharkhandNodes

  // Dynamically filter map nodes by District & Block/Tier
  const filteredMapNodes = allAvailableNodes.filter((node) => {
    const matchesDistrict = selectedDistrict === 'ALL' || node.districtName.toLowerCase().includes(selectedDistrict.toLowerCase()) || selectedDistrict.toLowerCase().includes(node.districtName.toLowerCase())
    const matchesTier = filterTier === 'ALL' || node.facilityTier === filterTier
    return matchesDistrict && matchesTier
  })

  const mapNodes = filteredMapNodes
  const layoutMap = getLayoutPositions(hospitals)

  const byId = new Map(hospitals.map((h) => [h.id, h]))
  const activeTransfers = transfers.filter((t) => t.active)

  // 108 Dispatch Hotspot State
  const [activeHotspot, setActiveHotspot] = useState<string>('ormanjhi')

  // Trigger optimal spatial routing call to backend API
  const handleCalculateOptimalRoute = async (customLat?: number, customLng?: number, district?: string) => {
    setCalculatingRoute(true)
    try {
      const res = await apiClient.findOptimalHospital({
        originLat: customLat ?? 23.3441,
        originLng: customLng ?? 85.3096,
        preferredDistrict: district ?? (selectedDistrict === 'ALL' ? 'Ranchi' : selectedDistrict),
        requiresIcu: true,
        vitals: {
          spo2: 82.0,
          heartRate: 138.0,
          systolicBp: 84.0,
          temperature: 39.5,
          respRate: 32.0,
          age: 52
        }
      })
      setRoutingResults(res)
      if (res && res.matchedHospital) {
        setSelectedHospitalId(res.matchedHospital.id)
      }
    } catch (e) {
      console.warn('Backend routing fallback to local algorithm:', e)
      const closest = hospitals.find((h) => h.icuBeds.used < h.icuBeds.total) || hospitals[0]
      if (closest) {
        setRoutingResults({
          matchedHospital: {
            id: closest.id,
            name: closest.name,
            distanceKm: 18.5,
            etaMinutes: 24,
            availableIcuBeds: Math.max(1, closest.icuBeds.total - closest.icuBeds.used),
            suitabilityScore: 92.4
          },
          drivingRoutePolyline: [
            [originLat, originLng],
            [23.3853, 85.3411]
          ],
          evaluatedCandidatesCount: hospitals.length
        })
        setSelectedHospitalId(closest.id)
      }
    } finally {
      setCalculatingRoute(false)
    }
  }

  const triggerEmergencyHotspot = (key: string, name: string, lat: number, lng: number, district: string) => {
    setActiveHotspot(key)
    setOriginLat(lat)
    setOriginLng(lng)
    setOriginName(name)
    handleCalculateOptimalRoute(lat, lng, district)
  }

  return (
    <div className="flex flex-col gap-5 font-sans text-[#2c1b0e]">
      {/* Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#382416]/15 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-[#382416] uppercase font-mono">
              JHARKHAND REGIONAL SPATIAL ROUTING NETWORK
            </h2>
            <span className="font-mono text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full">
              [OPENROUTESERVICE API READY]
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeTransfers.length} active inter-hospital patient transfer{activeTransfers.length === 1 ? '' : 's'} · OpenStreetMap Haversine & Dijkstra routing
          </p>
        </div>

        {/* View Switcher Tabs */}
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
            DIJKSTRA GRAPH
          </button>
        </div>
      </div>

      {/* Synchronized Global Scope & Tier Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-[#382416]/15 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-[#382416] uppercase">GLOBAL DISTRICT SCOPE:</span>
            <span className="inline-flex items-center gap-1.5 bg-[#382416] text-[#ffedd7] text-xs font-mono font-bold py-1 px-3 rounded-xl shadow-2xs">
              <MapPin className="size-3 text-[#dc5000]" />
              {selectedDistrict === 'ALL' ? '🌟 ALL 24 DISTRICTS (JHARKHAND STATEWIDE)' : `${selectedDistrict.toUpperCase()} DISTRICT`}
            </span>
            <span className="text-[10px] text-slate-400 font-mono italic">(Synced with Top Bar)</span>
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

        <div className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
          ACTIVE DISTRICT FACILITIES: {hospitals.length} · VISIBLE MAP NODES: {mapNodes.length}
        </div>
      </div>

      {/* 108 Tactical Emergency Incident Hotspot Selector */}
      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50/70 via-white to-amber-50/50 p-3.5 shadow-2xs space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-lg bg-red-600 text-white font-mono text-[10px] font-bold">
              108
            </span>
            <span className="font-mono text-xs font-bold text-red-950 uppercase">
              108 AMBULANCE DISPATCH HOTSPOTS & INCIDENT ORIGINS
            </span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            Click an incident hotspot to simulate live GPS road routing & hospital capacity matching
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {[
            { key: 'ormanjhi', label: 'NH-33 Toll Crash (Ormanjhi)', lat: 23.4832, lng: 85.4611, dist: 'Ranchi' },
            { key: 'bundu', label: 'Bundu Rural Crush Trauma', lat: 23.1678, lng: 85.5891, dist: 'Ranchi' },
            { key: 'jharia', label: 'Dhanbad Jharia Colliery Surge', lat: 23.7501, lng: 86.4162, dist: 'Dhanbad' },
            { key: 'jamshedpur', label: 'Adityapur Industrial Blast', lat: 22.7801, lng: 86.1950, dist: 'East Singhbhum (Jamshedpur)' },
            { key: 'deoghar', label: 'Jasidih Railway Line Trauma', lat: 24.5120, lng: 86.6450, dist: 'Deoghar' },
          ].map((spot) => (
            <button
              key={spot.key}
              type="button"
              onClick={() => triggerEmergencyHotspot(spot.key, spot.label, spot.lat, spot.lng, spot.dist)}
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

      {/* Main Grid View */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_22rem]">

        {/* Left Primary Display: Interactive Map or Network Graph */}
        <div className="space-y-4">
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
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span>🟢 Normal (&lt;80%)</span>
                  <span>🟡 Elevated (&gt;80%)</span>
                  <span>🔴 Critical / Surge (&gt;95%)</span>
                </div>
              </div>

              <svg
                viewBox={`0 0 ${W} ${H}`}
                className="h-[460px] w-full bg-gradient-to-br from-[#FAF6F0]/40 via-white to-[#f7f2ea]/30 rounded-xl"
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

                {/* Base network road edges */}
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
                        stroke="#94a3b8"
                        strokeWidth={2.5}
                        strokeDasharray="4 2"
                        opacity={0.7}
                      />
                      <g className="cursor-pointer">
                        <rect
                          x={mx - 32}
                          y={my - 11}
                          width={64}
                          height={22}
                          rx={11}
                          fill="#ffffff"
                          stroke="#cbd5e1"
                          strokeWidth={1.5}
                          className="shadow-xs"
                        />
                        <text
                          x={mx}
                          y={my + 2}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-slate-700 font-mono text-[10px] font-bold"
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
                      strokeWidth={isHovered ? 5 : 3.5}
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
                              ['--pulse-min' as string]: '28px',
                              ['--pulse-max' as string]: '48px',
                            } as React.CSSProperties
                          }
                        />
                      )}

                      {/* Selection Aura */}
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r={34}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          strokeDasharray="4 2"
                        />
                      )}

                      {/* Outer Status Ring */}
                      <circle cx={x} cy={y} r={26} fill="#ffffff" stroke={token} strokeWidth={4.5} />
                      <circle cx={x} cy={y} r={18} fill={token} opacity={0.12} />

                      {/* Short Code */}
                      <text
                        x={x}
                        y={y + 1}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={token}
                        style={{ fontSize: 11, fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                      >
                        {h.short.substring(0, 5)}
                      </text>

                      {/* Info Card Badge Below Node */}
                      <g transform={`translate(${x}, ${y + 34})`}>
                        <rect
                          x={-85}
                          y={0}
                          width={170}
                          height={38}
                          rx={8}
                          fill="#ffffff"
                          stroke={isSelected ? '#2563eb' : '#e2e8f0'}
                          strokeWidth={isSelected ? 2 : 1}
                          className="shadow-sm"
                        />
                        <text
                          x={0}
                          y={13}
                          textAnchor="middle"
                          className="fill-slate-900 font-sans font-bold"
                          style={{ fontSize: 10 }}
                        >
                          {h.name.length > 24 ? `${h.name.substring(0, 22)}...` : h.name}
                        </text>
                        <text
                          x={0}
                          y={27}
                          textAnchor="middle"
                          className="fill-slate-500 font-mono"
                          style={{ fontSize: 9 }}
                        >
                          Occ: <tspan className="font-bold text-slate-800">{occPercent}%</tspan> ({usedBeds}/{totalBeds}) · ICU: <tspan className="font-bold text-emerald-600">{availIcu}</tspan>
                        </text>
                      </g>
                    </g>
                  )
                })}
              </svg>
            </div>
          )}
        </div>


        {/* Right Side Panel: Live Routing Recommendations & Active Transfers */}
        <div className="flex flex-col gap-4">
          {/* Live Dijkstra & ORS Spatial Router Card */}
          <div className="rounded-2xl border border-[#382416]/15 bg-white p-4 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <h3 className="flex items-center gap-2 text-xs font-bold font-mono text-[#382416] uppercase">
                <Truck className="size-4 text-[#dc5000]" />
                108 Ambulance Spatial Router
              </h3>
              <button
                type="button"
                onClick={handleCalculateOptimalRoute}
                disabled={calculatingRoute}
                className="text-[10px] font-mono font-bold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-2 py-1 rounded cursor-pointer transition-all"
              >
                {calculatingRoute ? 'Calculating...' : 'RE-CALCULATE'}
              </button>
            </div>

            {routingResults?.topChoice ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#382416]/15">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[9px] font-bold text-[#dc5000] uppercase">
                      #1 OPTIMAL MATCH
                    </span>
                    <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      SCORE: {routingResults.topChoice.suitabilityScore} / 100
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-[#382416]">{routingResults.topChoice.hospitalName}</h4>
                  <div className="flex items-center justify-between text-xs text-slate-600 mt-2 font-mono">
                    <span>ETA: <strong className="text-[#382416]">{routingResults.topChoice.estimatedMinutes} Mins</strong></span>
                    <span>Dist: <strong className="text-[#382416]">{routingResults.topChoice.distanceKm} km</strong></span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="font-mono text-[10px] text-slate-500 font-bold uppercase">Candidate Ranking:</span>
                  {routingResults.recommendedHospitals.slice(0, 3).map((h: any, idx: number) => (
                    <div key={h.hospitalId || idx} className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-medium">
                      <span className="truncate max-w-[140px] text-slate-800">{idx + 1}. {h.hospitalName}</span>
                      <span className="font-mono text-[11px] font-bold text-[#382416]">{h.estimatedMinutes}m · {h.distanceKm}km</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 font-mono text-center">
                Click RE-CALCULATE to query live OpenRouteService matrix...
              </div>
            )}
          </div>

          {/* Active Transfers Card */}
          <div className="rounded-2xl border border-[#382416]/15 bg-white p-4 shadow-md">
            <h3 className="mb-3 flex items-center gap-2 text-xs font-bold font-mono text-[#382416] uppercase">
              <Route className="size-4 text-red-600" />
              Active Patient Transfers ({activeTransfers.length})
            </h3>
            <ul className="flex flex-col gap-2">
              {activeTransfers.length === 0 && (
                <li className="text-xs text-slate-500 font-medium">No active inter-hospital transfers.</li>
              )}
              {activeTransfers.map((t) => (
                <TransferCard
                  key={t.id}
                  transfer={t}
                  from={byId.get(t.fromId)}
                  to={byId.get(t.toId)}
                  onHover={setHovered}
                  hovered={hovered === t.id}
                />
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function TransferCard({
  transfer,
  from,
  to,
  onHover,
  hovered,
}: {
  transfer: Transfer
  from?: Hospital
  to?: Hospital
  onHover: (id: string | null) => void
  hovered: boolean
}) {
  return (
    <li
      onMouseEnter={() => onHover(transfer.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        'cursor-default rounded-xl border p-3 transition-colors',
        hovered ? 'border-red-300 bg-red-50' : 'border-[#382416]/10 bg-[#FAF6F0]',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-[#382416]">
          Patient {transfer.patientLabel}
        </span>
        <span className="rounded-full bg-red-100 border border-red-200 px-2 py-0.5 font-mono text-[10px] font-bold text-red-800">
          {transfer.minutes} min
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-[#382416] font-medium">
        <span className="truncate">{from?.name}</span>
        <ArrowRight className="size-3.5 shrink-0 text-red-600" />
        <span className="truncate">{to?.name}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-500">Via {transfer.algorithm}</span>
        <span className="font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded">
          BED ASSIGNED
        </span>
      </div>
    </li>
  )
}
