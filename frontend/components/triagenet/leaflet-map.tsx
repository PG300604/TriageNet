'use client'

import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { Navigation, Hospital, Bed, Activity, MapPin, Stethoscope, AlertTriangle, ShieldCheck, Ambulance } from 'lucide-react'

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

interface LeafletMapProps {
  hospitals: MapHospitalNode[]
  selectedHospitalId?: string
  onSelectHospital?: (id: string) => void
  ambulanceLocation?: { lat: number; lng: number }
  routePolyline?: [number, number][]
}

export function LeafletMap({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  ambulanceLocation = { lat: 23.3441, lng: 85.3096 }, // Ranchi City Center
  routePolyline,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markersGroupRef = useRef<L.LayerGroup | null>(null)
  const routeLineRef = useRef<L.Polyline | null>(null)

  const [activeHospital, setActiveHospital] = useState<MapHospitalNode | null>(null)

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return

    // Center map around Jharkhand (Ranchi capital)
    const map = L.map(mapContainerRef.current, {
      center: [23.3441, 85.3096],
      zoom: 9,
      zoomControl: true,
    })

    // OpenStreetMap CartoDB Positron / Standard Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 19,
    }).addTo(map)

    const markersGroup = L.layerGroup().addTo(map)
    markersGroupRef.current = markersGroup
    mapInstanceRef.current = map

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, [])

  // Render Hospital & Ambulance Markers
  useEffect(() => {
    const map = mapInstanceRef.current
    const group = markersGroupRef.current
    if (!map || !group) return

    group.clearLayers()

    // Add Hospital Markers
    hospitals.forEach((h) => {
      const loadRatio = h.totalBeds > 0 ? h.usedBeds / h.totalBeds : 0.5
      let colorClass = 'bg-emerald-600 border-emerald-300'
      let pulseRing = 'ring-emerald-400/30'

      if (loadRatio > 0.8) {
        colorClass = 'bg-red-600 border-red-300'
        pulseRing = 'ring-red-500/40 animate-pulse'
      } else if (loadRatio > 0.6) {
        colorClass = 'bg-amber-500 border-amber-300'
        pulseRing = 'ring-amber-400/30'
      }

      const isSelected = h.id === selectedHospitalId

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute -inset-1.5 rounded-full ${pulseRing} ${isSelected ? 'ring-4 ring-blue-600 scale-125' : ''}"></div>
            <div class="relative flex items-center justify-center size-8 rounded-xl ${colorClass} text-white font-bold shadow-lg border-2 transition-transform group-hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 6v12M6 12h12"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const marker = L.marker([h.lat, h.lng], { icon: customIcon })

      marker.on('click', () => {
        setActiveHospital(h)
        if (onSelectHospital) onSelectHospital(h.id)
      })

      group.addLayer(marker)
    })

    // Add Ambulance Marker
    if (ambulanceLocation) {
      const ambulanceIcon = L.divIcon({
        className: 'custom-ambulance-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute -inset-2 rounded-full bg-blue-500/30 animate-ping"></div>
            <div class="relative flex items-center justify-center size-9 rounded-xl bg-[#382416] text-[#ffedd7] font-bold shadow-xl border-2 border-[#dc5000]">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc5000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v9c0 .6.4 1 1 1h2"/>
                <circle cx="7" cy="17" r="2"/>
                <path d="M9 17h6"/>
                <circle cx="17" cy="17" r="2"/>
              </svg>
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      })

      const ambMarker = L.marker([ambulanceLocation.lat, ambulanceLocation.lng], { icon: ambulanceIcon })
      ambMarker.bindTooltip('108 AMBULANCE DISPATCH #JH-01', { permanent: false, direction: 'top' })
      group.addLayer(ambMarker)
    }

    // Draw Polyline Route if available
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current)
      routeLineRef.current = null
    }

    if (routePolyline && routePolyline.length > 0) {
      const polyline = L.polyline(routePolyline, {
        color: '#dc5000',
        weight: 5,
        opacity: 0.8,
        dashArray: '8, 8',
      }).addTo(map)
      routeLineRef.current = polyline
    } else if (selectedHospitalId) {
      const selected = hospitals.find((h) => h.id === selectedHospitalId)
      if (selected && ambulanceLocation) {
        const straightRoute: [number, number][] = [
          [ambulanceLocation.lat, ambulanceLocation.lng],
          [selected.lat, selected.lng],
        ]
        const polyline = L.polyline(straightRoute, {
          color: '#2563eb',
          weight: 4,
          opacity: 0.75,
          dashArray: '6, 6',
        }).addTo(map)
        routeLineRef.current = polyline
      }
    }
  }, [hospitals, selectedHospitalId, ambulanceLocation, routePolyline, onSelectHospital])

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-[#382416]/15 shadow-md font-sans">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Map Legend Overlay */}
      <div className="absolute top-3 right-3 z-[400] bg-white/90 backdrop-blur-md border border-[#382416]/15 rounded-xl p-3 shadow-md max-w-xs text-xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-mono text-[10px] font-bold text-[#382416] uppercase tracking-wider">
            [JHARKHAND HOSPITALS]
          </span>
          <span className="font-mono text-[9px] text-slate-500">{hospitals.length} NODES</span>
        </div>
        <div className="space-y-1.5 text-[11px] font-medium text-slate-700">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-emerald-600 shrink-0" />
            <span>Optimal Capacity (&lt; 60% load)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-amber-500 shrink-0" />
            <span>Moderate Load (60–80% load)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-red-600 animate-pulse shrink-0" />
            <span>Surge Capacity (&gt; 80% load)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200">
            <span className="size-3 rounded-lg bg-[#382416] border border-[#dc5000] shrink-0" />
            <span>108 Ambulance Dispatch GPS</span>
          </div>
        </div>
      </div>

      {/* Active Hospital Popup Drawer */}
      {activeHospital && (
        <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto z-[400] bg-white border border-[#382416]/20 rounded-2xl p-4 shadow-xl max-w-md w-full animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-[9px] font-bold text-[#dc5000] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded uppercase">
                [{activeHospital.facilityTier || 'DISTRICT'}]
              </span>
              <h3 className="text-sm font-bold text-[#382416] mt-1">{activeHospital.name}</h3>
              <p className="text-xs text-slate-500 font-medium">{activeHospital.districtName} District, Jharkhand</p>
            </div>
            <button
              type="button"
              onClick={() => setActiveHospital(null)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 my-3">
            <div className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#382416]/10">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Available General Beds</span>
              <span className="text-base font-bold text-emerald-700 font-mono">
                {activeHospital.availableGeneralBeds} Beds
              </span>
            </div>
            <div className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#382416]/10">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Available ICU Beds</span>
              <span className="text-base font-bold text-red-700 font-mono">
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
            <Navigation className="size-3.5 text-[#dc5000]" />
            Set as Active Referral Destination
          </button>
        </div>
      )}
    </div>
  )
}
