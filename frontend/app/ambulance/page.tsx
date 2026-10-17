'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Ambulance,
  ArrowRight,
  Award,
  BatteryCharging,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  CornerDownRight,
  ExternalLink,
  Flame,
  HeartPulse,
  Hospital,
  Layers,
  MapPin,
  Navigation,
  PhoneCall,
  Radio,
  RefreshCw,
  Route,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Sliders,
  Sparkles,
  Stethoscope,
  Truck,
  UserCheck,
  Wifi,
  Zap,
  BellRing,
} from 'lucide-react'
import {
  ACCIDENT_HOTSPOTS,
  type AccidentHotspot,
  type SpecialistRole,
  evaluateCandidateOptions,
  type CandidateHospitalEvaluation,
} from '@/lib/accident-hotspots'
import { directorBridge, type DirectorEvent } from '@/lib/director-bridge'
import { buildScenario } from '@/lib/triage-data'
import { soundBeacon } from '@/lib/sound-beacon'
import { apiClient } from '@/lib/api-client'

export default function AmbulanceMobilePage() {
  const [selectedHotspot, setSelectedHotspot] = useState<AccidentHotspot>(ACCIDENT_HOTSPOTS[0])
  const [patientName, setPatientName] = useState<string>(ACCIDENT_HOTSPOTS[0].defaultPatient)
  const [incidentNature, setIncidentNature] = useState<string>(ACCIDENT_HOTSPOTS[0].defaultIncident)
  const [requiredSpecialistRole, setRequiredSpecialistRole] = useState<SpecialistRole>(
    ACCIDENT_HOTSPOTS[0].requiredSpecialistRole
  )
  const [ambulanceNumber, setAmbulanceNumber] = useState<string>('JH-01-ALS-1081')
  const [paramedicName, setParamedicName] = useState<string>('Sanjay Tirkey (EMT-P)')
  const [pilotName, setPilotName] = useState<string>('Manoj Toppo')

  // Live Vitals
  const [spo2, setSpo2] = useState<number>(ACCIDENT_HOTSPOTS[0].defaultVitals.spo2)
  const [heartRate, setHeartRate] = useState<number>(ACCIDENT_HOTSPOTS[0].defaultVitals.heartRate)
  const [systolicBp, setSystolicBp] = useState<number>(ACCIDENT_HOTSPOTS[0].defaultVitals.systolicBp)
  const [gcs, setGcs] = useState<number>(ACCIDENT_HOTSPOTS[0].defaultVitals.gcs)

  // Traffic & Green Wave
  const [trafficLevel, setTrafficLevel] = useState<'CLEAR' | 'MODERATE' | 'HEAVY'>(
    ACCIDENT_HOTSPOTS[0].defaultTrafficLevel
  )
  const [trafficDelayMin, setTrafficDelayMin] = useState<number>(ACCIDENT_HOTSPOTS[0].defaultTrafficDelayMin)
  const [greenWaveActive, setGreenWaveActive] = useState<boolean>(false)
  const [trafficCorridorStatus, setTrafficCorridorStatus] = useState<any | null>(null)
  const [itmsPreemptionLoading, setItmsPreemptionLoading] = useState<boolean>(false)

  // Selected Target Hospital
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>('')
  const [syncStatus, setSyncStatus] = useState<string>('Live Telemetry Connected')
  const [isTransmitting, setIsTransmitting] = useState<boolean>(false)
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null)
  const [otaNotice, setOtaNotice] = useState<{ version: string; notes: string } | null>(null)

  useEffect(() => {
    fetch('/api/app/version')
      .then((res) => res.json())
      .then((data) => {
        if (data.latestVersion) {
          setOtaNotice({ version: data.latestVersion, notes: '3D Road Navigation & Multi-Corridor Bypass' })
        }
      })
      .catch(() => {})
  }, [])

  const defaultHospitals = useMemo(() => buildScenario('steady').hospitals, [])

  // Hospital options calculation
  const candidateOptions = useMemo(() => {
    return evaluateCandidateOptions(
      defaultHospitals,
      selectedHotspot.lat,
      selectedHotspot.lng,
      requiredSpecialistRole,
      trafficDelayMin,
      trafficLevel,
      greenWaveActive
    )
  }, [defaultHospitals, selectedHotspot, requiredSpecialistRole, trafficDelayMin, trafficLevel, greenWaveActive])

  // Default target is Option 1
  useEffect(() => {
    if (!selectedHospitalId && candidateOptions.option1) {
      setSelectedHospitalId(candidateOptions.option1.hospitalId)
    }
  }, [candidateOptions, selectedHospitalId])

  // Listen to remote changes from director or dashboard
  useEffect(() => {
    const unsub = directorBridge.subscribe((ev: DirectorEvent) => {
      if (ev.type === 'TRIGGER_ACCIDENT_HOTSPOT') {
        const spot = ACCIDENT_HOTSPOTS.find((h) => h.id === ev.hotspotId)
        if (spot) {
          setSelectedHotspot(spot)
          setPatientName(spot.defaultPatient)
          setIncidentNature(spot.defaultIncident)
          setRequiredSpecialistRole(spot.requiredSpecialistRole)
          setTrafficLevel(spot.defaultTrafficLevel)
          setTrafficDelayMin(spot.defaultTrafficDelayMin)
          setSpo2(spot.defaultVitals.spo2)
          setHeartRate(spot.defaultVitals.heartRate)
          setSystolicBp(spot.defaultVitals.systolicBp)
          setGcs(spot.defaultVitals.gcs)
          setGreenWaveActive(false)
          setLastActionMessage(`Remote Dispatch: Incident loaded at ${spot.name}`)
          setTimeout(() => setLastActionMessage(null), 5000)
        }
      } else if (ev.type === 'TOGGLE_GREEN_WAVE') {
        setGreenWaveActive(ev.active)
      }
    })
    return () => unsub()
  }, [])

  // Auto-broadcast vitals updates with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      directorBridge.send({
        type: 'UPDATE_PATIENT_VITALS',
        vitals: { spo2, heartRate, systolicBp, gcs },
        patientName,
        incidentNature,
        requiredSpecialistRole,
      })
    }, 400)
    return () => clearTimeout(timer)
  }, [spo2, heartRate, systolicBp, gcs, patientName, incidentNature, requiredSpecialistRole])

  const handleSelectHotspot = (hotspot: AccidentHotspot) => {
    setSelectedHotspot(hotspot)
    setPatientName(hotspot.defaultPatient)
    setIncidentNature(hotspot.defaultIncident)
    setRequiredSpecialistRole(hotspot.requiredSpecialistRole)
    setTrafficLevel(hotspot.defaultTrafficLevel)
    setTrafficDelayMin(hotspot.defaultTrafficDelayMin)
    setSpo2(hotspot.defaultVitals.spo2)
    setHeartRate(hotspot.defaultVitals.heartRate)
    setSystolicBp(hotspot.defaultVitals.systolicBp)
    setGcs(hotspot.defaultVitals.gcs)
    setGreenWaveActive(false)

    directorBridge.send({
      type: 'TRIGGER_ACCIDENT_HOTSPOT',
      hotspotId: hotspot.id,
      name: hotspot.name,
      lat: hotspot.lat,
      lng: hotspot.lng,
      incidentNature: hotspot.defaultIncident,
      patientName: hotspot.defaultPatient,
      requiredSpecialistRole: hotspot.requiredSpecialistRole,
      trafficLevel: hotspot.defaultTrafficLevel,
      trafficDelayMin: hotspot.defaultTrafficDelayMin,
      vitals: hotspot.defaultVitals,
    })

    setLastActionMessage(`GPS Synced: ${hotspot.name}`)
    setTimeout(() => setLastActionMessage(null), 4000)
  }

  const handleToggleGreenWave = async () => {
    const nextState = !greenWaveActive
    setGreenWaveActive(nextState)
    directorBridge.send({ type: 'TOGGLE_GREEN_WAVE', active: nextState })

    if (nextState) {
      soundBeacon.playDualToneSiren(2.4)
      setItmsPreemptionLoading(true)
      try {
        const destHospital = candidateOptions.option1?.hospitalName || 'RIMS Ranchi Trauma Center'
        const result = await apiClient.activateTrafficPreemption({
          ambulanceNumber,
          destinationHospitalName: destHospital,
          corridorName: 'NH-33 - Booty More - Bariatu Road - RIMS Trauma Corridor',
          currentLat: selectedHotspot.lat,
          currentLng: selectedHotspot.lng,
          speedKmph: 74.0,
          acuityScore: spo2 < 85 ? 94.0 : 78.0,
          priorityTier: 'CODE_RED_CRITICAL',
          patientCondition: `${patientName} (${incidentNature}) - SpO2: ${spo2}%, GCS: ${gcs}`,
        })
        setTrafficCorridorStatus(result)
        directorBridge.send({
          type: 'TRAFFIC_SIGNAL_PREEMPTION_UPDATE',
          ambulanceNumber,
          active: true,
          signalsPreempted: result.signalsPreemptedGreen || 4,
          trafficDelayClearedMin: result.trafficDelayClearedMinutes || 13.6,
          vmsAlert: result.activeVmsAlert || '108 AMBULANCE APPROACHING - MERGE LEFT',
          upcomingSignals: (result.upcomingIntersections || []).map((s: any) => ({
            signalId: s.signalId,
            name: s.intersectionName,
            distanceMeters: s.distanceMeters,
            etaSec: s.etaSeconds,
            phase: s.mainStreetPhase,
          })),
        })
      } catch (err) {
        console.warn('ITMS Gateway activation fallback', err)
      } finally {
        setItmsPreemptionLoading(false)
      }
    } else {
      soundBeacon.playRadioClick()
      try {
        await apiClient.releaseTrafficPreemption(ambulanceNumber)
      } catch (e) {
        // ignore
      }
      setTrafficCorridorStatus(null)
      directorBridge.send({
        type: 'TRAFFIC_SIGNAL_PREEMPTION_UPDATE',
        ambulanceNumber,
        active: false,
        signalsPreempted: 0,
        trafficDelayClearedMin: 0,
        vmsAlert: 'Normal Traffic Adaptive Cycle Restored',
      })
    }

    setLastActionMessage(
      nextState
        ? '⚡ ITMS Municipal Signal Preemption & Road V2X Telemetry Uplink ACTIVE!'
        : 'ITMS Green Wave released to normal municipal traffic cycle.'
    )
    setTimeout(() => setLastActionMessage(null), 4500)
  }

  // Periodic V2X telemetry stream when Green Wave is active
  useEffect(() => {
    if (!greenWaveActive) return
    const interval = setInterval(async () => {
      try {
        const destHospital = candidateOptions.option1?.hospitalName || 'RIMS Ranchi Trauma Center'
        const updated = await apiClient.streamTrafficTelemetry({
          ambulanceNumber,
          destinationHospitalName: destHospital,
          currentLat: selectedHotspot.lat,
          currentLng: selectedHotspot.lng,
          speedKmph: 74.0,
          acuityScore: spo2 < 85 ? 94.0 : 78.0,
          priorityTier: 'CODE_RED_CRITICAL',
          patientCondition: `${patientName} (${incidentNature}) - SpO2: ${spo2}%, GCS: ${gcs}`,
        })
        setTrafficCorridorStatus(updated)
      } catch (e) {
        // quiet stream
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [greenWaveActive, ambulanceNumber, candidateOptions, selectedHotspot, spo2, gcs, patientName, incidentNature])

  const handleSelectDestination = (opt: CandidateHospitalEvaluation, modeLabel: string) => {
    setSelectedHospitalId(opt.hospitalId)
    soundBeacon.playRadioClick()
    directorBridge.send({
      type: 'SELECT_DESTINATION_HOSPITAL',
      hospitalId: opt.hospitalId,
      hospitalName: opt.hospitalName,
      ambulanceNumber,
    })
    setLastActionMessage(`Route Locked to ${opt.hospitalName} (${modeLabel})`)
    setTimeout(() => setLastActionMessage(null), 5000)
  }

  const handleDispatchAndPrealert = (opt: CandidateHospitalEvaluation) => {
    setIsTransmitting(true)
    soundBeacon.playRadioClick()
    soundBeacon.playDualToneSiren(1.8)
    directorBridge.send({
      type: 'DISPATCH_AMBULANCE_FROM_MOBILE',
      ambulanceNumber,
      hospitalId: opt.hospitalId,
      hospitalName: opt.hospitalName,
      patientName,
      incidentNature,
      etaMinutes: opt.effectiveEtaMin,
      vitals: { spo2, heartRate, systolicBp, gcs },
    })

    setTimeout(() => {
      setIsTransmitting(false)
      soundBeacon.playAllocationChime()
      setLastActionMessage(
        `🚨 Trauma Bay Pre-Alert Broadcasted! Destination: ${opt.hospitalName} (ETA ${opt.effectiveEtaMin}m)`
      )
      setTimeout(() => setLastActionMessage(null), 6000)
    }, 600)
  }

  // Quick vital presets for rapid live demonstration
  const applyPreset = (type: 'crash' | 'moderate' | 'stabilized') => {
    if (type === 'crash') {
      setGcs(7)
      setSpo2(76)
      setSystolicBp(72)
      setHeartRate(148)
      soundBeacon.playCriticalVitalsChime()
      setLastActionMessage('Vitals Preset: Severe Decompensation / Arrest Risk (GCS 7, SpO2 76%)')
    } else if (type === 'moderate') {
      setGcs(11)
      setSpo2(89)
      setSystolicBp(94)
      setHeartRate(118)
      soundBeacon.playRadioClick()
      setLastActionMessage('Vitals Preset: Moderate Polytrauma (GCS 11, SpO2 89%)')
    } else {
      setGcs(14)
      setSpo2(98)
      setSystolicBp(120)
      setHeartRate(82)
      soundBeacon.playRadioClick()
      setLastActionMessage('Vitals Preset: Stabilized Post-Resuscitation (GCS 14, SpO2 98%)')
    }
    setTimeout(() => setLastActionMessage(null), 4000)
  }

  return (
    <div className="min-h-screen bg-[#0e0d0b] text-[#f5f0e8] font-sans antialiased pb-24 selection:bg-amber-600/30">
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-40 bg-[#161412]/95 backdrop-blur-md border-b border-amber-900/30 px-4 py-3 shadow-xl">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 shadow-md shadow-amber-600/20 text-white font-bold">
              <Ambulance className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#161412] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold tracking-wider text-amber-400">108 EMTS JHARKHAND</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 rounded-full font-mono font-bold">
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-mono">
                Unit <strong className="text-stone-200">{ambulanceNumber}</strong> · ALS
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="text-[11px] font-mono px-2.5 py-1 bg-stone-900/80 hover:bg-stone-800 text-stone-300 border border-stone-800 rounded-lg transition-colors flex items-center gap-1"
            >
              <Layers className="w-3 h-3 text-amber-500" />
              Command Map
            </Link>
            <Link
              href="/control"
              className="text-[11px] font-mono px-2 py-1 bg-amber-950/40 hover:bg-amber-900/50 text-amber-400 border border-amber-800/50 rounded-lg transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-amber-400" />
              Director
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Container (Mobile-first max-w-xl) */}
      <main className="max-w-xl mx-auto px-4 py-4 space-y-4">
        {/* Real-time Status Toast Alert */}
        {lastActionMessage && (
          <div className="p-3 bg-amber-950/70 border border-amber-600/50 rounded-xl text-xs text-amber-200 flex items-center gap-2.5 shadow-lg animate-in fade-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono">{lastActionMessage}</span>
          </div>
        )}

        {/* In-App OTA Update Check Notification Banner */}
        {otaNotice && (
          <div className="p-2.5 bg-gradient-to-r from-orange-950/80 via-amber-900/60 to-orange-950/80 border border-amber-500/40 rounded-xl text-xs flex items-center justify-between gap-2 shadow-md animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-200">
              <BellRing className="size-3.5 text-amber-400 animate-bounce" />
              <span className="font-mono text-[11px]">
                Update <strong>v{otaNotice.version}</strong> Available ({otaNotice.notes})
              </span>
            </div>
            <Link
              href="/downloads"
              className="px-2 py-0.5 rounded bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-[10px] font-mono transition-colors shrink-0"
            >
              Update Now ➔
            </Link>
          </div>
        )}

        {/* Vehicle Telemetry & Crew Banner */}
        <div className="bg-[#181512] border border-amber-900/25 rounded-2xl p-3.5 space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-mono text-stone-300">GPS Locked:</span>
              <span className="font-mono text-emerald-400 font-bold">
                {selectedHotspot.lat.toFixed(4)}°N, {selectedHotspot.lng.toFixed(4)}°E
              </span>
            </div>
            <div className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400">
              Corridor: {selectedHotspot.highway}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-stone-950/60 p-2.5 rounded-xl border border-stone-900">
            <div>
              <span className="text-stone-500 block text-[10px]">LEAD EMT PARAMEDIC</span>
              <span className="text-stone-200 font-bold">{paramedicName}</span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">PILOT / DRIVER</span>
              <span className="text-stone-200 font-bold">{pilotName}</span>
            </div>
          </div>
        </div>

        {/* Accident Hotspot Quick Switcher */}
        <div className="bg-[#181512] border border-amber-900/25 rounded-2xl p-3.5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Accident Hotspot Node
              </h2>
            </div>
            <span className="text-[10px] font-mono text-amber-400/90 font-bold">
              {selectedHotspot.blackspotRanking}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-1.5">
            {ACCIDENT_HOTSPOTS.map((spot) => {
              const isSelected = spot.id === selectedHotspot.id
              return (
                <button
                  key={spot.id}
                  onClick={() => handleSelectHotspot(spot)}
                  className={`text-left p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                    isSelected
                      ? 'bg-amber-950/50 border-amber-600/70 text-white shadow-md'
                      : 'bg-stone-950/40 border-stone-900/80 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5">
                      <span className={isSelected ? 'text-amber-400' : 'text-stone-300'}>
                        {spot.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-stone-500 font-mono">
                      {spot.defaultIncident} · {spot.requiredSpecialistRole}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 ml-2" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Live Patient Critical Condition & Vitals In-Transit Entry */}
        <div className="bg-[#181512] border border-amber-900/25 rounded-2xl p-4 space-y-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-red-400 animate-pulse" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Live Onboard Patient Vitals
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-stone-500 font-mono">Presets:</span>
              <button
                onClick={() => applyPreset('crash')}
                className="text-[10px] font-mono px-1.5 py-0.5 bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-800/50 rounded"
              >
                Crash
              </button>
              <button
                onClick={() => applyPreset('moderate')}
                className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-950/60 hover:bg-amber-900 text-amber-300 border border-amber-800/50 rounded"
              >
                Mod
              </button>
              <button
                onClick={() => applyPreset('stabilized')}
                className="text-[10px] font-mono px-1.5 py-0.5 bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 rounded"
              >
                Stable
              </button>
            </div>
          </div>

          {/* Patient Info Fields */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] text-stone-500 uppercase font-mono block mb-1">
                Patient Identity
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 font-mono text-xs focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="text-[10px] text-stone-500 uppercase font-mono block mb-1">
                Required Specialist
              </label>
              <select
                value={requiredSpecialistRole}
                onChange={(e) => setRequiredSpecialistRole(e.target.value as SpecialistRole)}
                className="w-full bg-stone-950 border border-stone-800 rounded-lg px-2.5 py-1.5 text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-600"
              >
                <option value="Neurosurgeon">Neurosurgeon (TBI)</option>
                <option value="Pulmonologist">Pulmonologist (CO/Gas)</option>
                <option value="TraumaSurgeon">Trauma Surgeon (Chest/Abdomen)</option>
                <option value="BurnsPlastic">Burns & Plastic Surgeon</option>
                <option value="OrthopedicSurgeon">Orthopedic / Spine Surgeon</option>
              </select>
            </div>
          </div>

          {/* Vitals Grid with Sliders & Number Controls */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* GCS Card */}
            <div
              className={`p-3 rounded-xl border ${
                gcs <= 8
                  ? 'bg-red-950/30 border-red-800/60'
                  : gcs <= 12
                  ? 'bg-amber-950/30 border-amber-800/60'
                  : 'bg-emerald-950/20 border-emerald-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-stone-400">GCS (COMA SCALE)</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    gcs <= 8
                      ? 'bg-red-950 text-red-400'
                      : gcs <= 12
                      ? 'bg-amber-950 text-amber-400'
                      : 'bg-emerald-950 text-emerald-400'
                  }`}
                >
                  {gcs <= 8 ? 'SEVERE TBI' : gcs <= 12 ? 'MODERATE' : 'MILD'}
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-mono font-bold text-stone-100">{gcs}</span>
                <span className="text-[10px] font-mono text-stone-500">/ 15</span>
              </div>
              <input
                type="range"
                min="3"
                max="15"
                value={gcs}
                onChange={(e) => setGcs(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-stone-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* SpO2 Card */}
            <div
              className={`p-3 rounded-xl border ${
                spo2 < 85
                  ? 'bg-red-950/30 border-red-800/60'
                  : spo2 < 93
                  ? 'bg-amber-950/30 border-amber-800/60'
                  : 'bg-emerald-950/20 border-emerald-800/50'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-stone-400">SPO₂ OXYGEN</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    spo2 < 85
                      ? 'bg-red-950 text-red-400'
                      : spo2 < 93
                      ? 'bg-amber-950 text-amber-400'
                      : 'bg-emerald-950 text-emerald-400'
                  }`}
                >
                  {spo2 < 85 ? 'HYPOXIA' : spo2 < 93 ? 'BORDERLINE' : 'NORMAL'}
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-mono font-bold text-stone-100">{spo2}</span>
                <span className="text-[10px] font-mono text-stone-500">%</span>
              </div>
              <input
                type="range"
                min="65"
                max="100"
                value={spo2}
                onChange={(e) => setSpo2(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-stone-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Systolic BP Card */}
            <div
              className={`p-3 rounded-xl border ${
                systolicBp < 90
                  ? 'bg-red-950/30 border-red-800/60'
                  : 'bg-stone-950/40 border-stone-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-stone-400">SYSTOLIC BP</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    systolicBp < 90 ? 'bg-red-950 text-red-400' : 'bg-stone-900 text-stone-400'
                  }`}
                >
                  {systolicBp < 90 ? 'SHOCK' : 'NORMOTENSIVE'}
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-mono font-bold text-stone-100">{systolicBp}</span>
                <span className="text-[10px] font-mono text-stone-500">mmHg</span>
              </div>
              <input
                type="range"
                min="60"
                max="190"
                value={systolicBp}
                onChange={(e) => setSystolicBp(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-stone-900 rounded-lg cursor-pointer"
              />
            </div>

            {/* Heart Rate Card */}
            <div
              className={`p-3 rounded-xl border ${
                heartRate > 130 || heartRate < 50
                  ? 'bg-red-950/30 border-red-800/60'
                  : 'bg-stone-950/40 border-stone-800/80'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-stone-400">HEART RATE</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                    heartRate > 130
                      ? 'bg-red-950 text-red-400'
                      : heartRate < 50
                      ? 'bg-amber-950 text-amber-400'
                      : 'bg-stone-900 text-stone-400'
                  }`}
                >
                  {heartRate > 130 ? 'TACHYCARDIA' : heartRate < 50 ? 'BRADYCARDIA' : 'NORMAL'}
                </span>
              </div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-mono font-bold text-stone-100">{heartRate}</span>
                <span className="text-[10px] font-mono text-stone-500">BPM</span>
              </div>
              <input
                type="range"
                min="40"
                max="180"
                value={heartRate}
                onChange={(e) => setHeartRate(Number(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-stone-900 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Highway Traffic & Municipal ITMS Road Preemption Console */}
        <div className="bg-[#181512] border border-amber-900/30 rounded-2xl p-4 space-y-3.5 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Route className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                Municipal ITMS Road Preemption & V2X Telemetry
              </h2>
            </div>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                greenWaveActive
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : trafficLevel === 'HEAVY'
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {greenWaveActive ? '🟢 ITMS V2X GREEN WAVE (ACTIVE)' : `${trafficLevel} CONGESTION`}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-stone-950/70 p-2.5 rounded-xl border border-stone-800/80">
            <div>
              <span className="text-stone-500 block text-[10px]">CORRIDOR BOTTLENECK</span>
              <span className="text-stone-300 font-bold">
                {greenWaveActive ? '⚡ 4 Intersections Preempted' : `+${trafficDelayMin}m Traffic Gridlock`}
              </span>
            </div>
            <div>
              <span className="text-stone-500 block text-[10px]">VEHICLE SPEED</span>
              <span className="text-amber-400 font-bold">
                {greenWaveActive ? '74 km/h (Emergency)' : trafficLevel === 'HEAVY' ? '24 km/h' : '48 km/h'}
              </span>
            </div>
          </div>

          {/* ITMS Road Preemption & V2X Telemetry Uplink Display */}
          {greenWaveActive && (
            <div className="space-y-2.5 pt-1">
              {/* V2X Link Status Bar */}
              <div className="flex items-center justify-between text-[10px] font-mono bg-emerald-950/50 border border-emerald-800/60 p-2 rounded-xl text-emerald-300">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold">ITMS V2I PROTOCOL ACTIVE</span>
                </div>
                <div className="text-stone-400">
                  <span>Ping: </span>
                  <span className="text-emerald-400 font-bold">
                    {trafficCorridorStatus?.handshakeLatencyMs || 18}ms
                  </span>
                  <span> | SCATS / NTCIP 1202</span>
                </div>
              </div>

              {/* Electronic Overhead VMS Gantry Broadcast Display */}
              <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-2.5 font-mono text-[11px] text-amber-200">
                <div className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>OVERHEAD HIGHWAY VMS GANTRY BROADCAST (KM 12)</span>
                </div>
                <div className="bg-black/80 px-2.5 py-1.5 rounded-lg border border-amber-500/20 text-amber-300 font-bold tracking-wide">
                  {trafficCorridorStatus?.activeVmsAlert ||
                    '⚠ 108 AMBULANCE APPROACHING (JH-01-ALS-1081) - MERGE LEFT - CLEAR AMBULANCE CORRIDOR'}
                </div>
              </div>

              {/* Upcoming Signal Intersections Preemption Table */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 font-semibold px-1">
                  <span>UPCOMING INTERSECTIONS</span>
                  <span>PHASE / ACTION</span>
                </div>
                <div className="space-y-1 text-[11px] font-mono">
                  {(
                    trafficCorridorStatus?.upcomingIntersections || [
                      {
                        signalId: 'SIG-RN-01',
                        intersectionName: 'Ormanjhi NH-33 Toll Ramp',
                        distanceMeters: 0,
                        etaSeconds: 0,
                        preemptionStatus: 'GREEN_WAVE_LOCKED',
                        mainStreetPhase: 'SOLID_GREEN',
                        crossStreetPhase: 'ALL_RED_HOLD',
                        policeChowkiName: 'Ormanjhi Traffic Outpost',
                      },
                      {
                        signalId: 'SIG-RN-02',
                        intersectionName: 'Mesra Ring Road Junction',
                        distanceMeters: 850,
                        etaSeconds: 41,
                        preemptionStatus: 'GREEN_WAVE_LOCKED',
                        mainStreetPhase: 'SOLID_GREEN',
                        crossStreetPhase: 'ALL_RED_HOLD',
                        policeChowkiName: 'Mesra PCR-04 Interceptor',
                      },
                      {
                        signalId: 'SIG-RN-03',
                        intersectionName: 'Booty More Traffic Circle',
                        distanceMeters: 2100,
                        etaSeconds: 102,
                        preemptionStatus: 'GREEN_WAVE_LOCKED',
                        mainStreetPhase: 'SOLID_GREEN',
                        crossStreetPhase: 'ALL_RED_HOLD',
                        policeChowkiName: 'Booty More Police Chowki',
                      },
                      {
                        signalId: 'SIG-RN-04',
                        intersectionName: 'Kanta Toli Flyover Ramp',
                        distanceMeters: 4400,
                        etaSeconds: 215,
                        preemptionStatus: 'CLEARING_CROSS_STREETS',
                        mainStreetPhase: 'FLASHING_YELLOW',
                        crossStreetPhase: 'RED_CLEARANCE',
                        policeChowkiName: 'Kanta Toli PCR Unit 09',
                      },
                      {
                        signalId: 'SIG-RN-05',
                        intersectionName: 'Bariatu Road Medical Crossing',
                        distanceMeters: 6800,
                        etaSeconds: 330,
                        preemptionStatus: 'STANDBY',
                        mainStreetPhase: 'NORMAL_CYCLE',
                        crossStreetPhase: 'NORMAL_CYCLE',
                        policeChowkiName: 'Bariatu Outpost',
                      },
                      {
                        signalId: 'SIG-RN-06',
                        intersectionName: 'RIMS Trauma Bay Emergency Gate',
                        distanceMeters: 7500,
                        etaSeconds: 365,
                        preemptionStatus: 'STANDBY',
                        mainStreetPhase: 'NORMAL_CYCLE',
                        crossStreetPhase: 'NORMAL_CYCLE',
                        policeChowkiName: 'RIMS Emergency Warden',
                      },
                    ]
                  ).map((sig: any) => {
                    const isLocked = sig.preemptionStatus === 'GREEN_WAVE_LOCKED'
                    const isClearing = sig.preemptionStatus === 'CLEARING_CROSS_STREETS'
                    return (
                      <div
                        key={sig.signalId}
                        className={`flex items-center justify-between p-2 rounded-xl border ${
                          isLocked
                            ? 'bg-emerald-950/40 border-emerald-700/60 text-emerald-200'
                            : isClearing
                            ? 'bg-amber-950/30 border-amber-700/50 text-amber-200'
                            : 'bg-stone-900/40 border-stone-800 text-stone-400'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold flex items-center gap-1.5">
                            <span
                              className={`size-2 rounded-full ${
                                isLocked
                                  ? 'bg-emerald-400 shadow-xs shadow-emerald-400'
                                  : isClearing
                                  ? 'bg-amber-400'
                                  : 'bg-stone-600'
                              }`}
                            />
                            <span className="truncate">{sig.intersectionName}</span>
                          </div>
                          <div className="text-[10px] text-stone-400 pl-3.5">
                            {sig.distanceMeters > 0 ? `${(sig.distanceMeters / 1000).toFixed(1)} km · ETA ${sig.etaSeconds}s` : 'Passed · Corridor Cleared'}
                            {' | '}
                            <span className="text-stone-300">{sig.policeChowkiName}</span>
                          </div>
                        </div>

                        <div className="shrink-0 text-right">
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              isLocked
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : isClearing
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-stone-800 text-stone-400'
                            }`}
                          >
                            {isLocked ? 'SOLID GREEN' : isClearing ? 'CLEARING' : 'STANDBY'}
                          </span>
                          <span className="block text-[8px] text-stone-500 uppercase mt-0.5">
                            {sig.crossStreetPhase === 'ALL_RED_HOLD' ? 'Cross-Traffic: RED' : 'Cross: Normal'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Police Interceptor Coordination Pill */}
              <div className="text-[10px] font-mono text-stone-400 bg-stone-950/70 p-2 rounded-xl border border-stone-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-stone-300 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Traffic Police PCR Units:</span>
                </span>
                <span className="text-emerald-400 font-bold">4 Interceptors Stationed Ahead</span>
              </div>
            </div>
          )}

          {/* Green Wave Button */}
          <button
            onClick={handleToggleGreenWave}
            disabled={itmsPreemptionLoading}
            className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
              greenWaveActive
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40 ring-2 ring-emerald-400/30'
                : 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-900/30'
            }`}
          >
            <Siren className={`w-4 h-4 ${greenWaveActive ? 'animate-bounce' : ''}`} />
            {greenWaveActive
              ? '⚡ ITMS GREEN WAVE ACTIVE (TAP TO RELEASE CORRIDOR)'
              : 'TRANSMIT TELEMETRY & PREEMPT ROAD SIGNALS TO GREEN'}
          </button>
        </div>

        {/* AI Hospital Matching & 1st, 2nd, 3rd Best Options */}
        <div className="bg-[#181512] border border-amber-900/25 rounded-2xl p-4 space-y-3.5 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-200">
                AI Hospital Destination Matching
              </h2>
            </div>
            <span className="text-[10px] font-mono text-stone-400">Multi-Criteria Score</span>
          </div>

          {/* Option 1: 1st Best Apex */}
          {candidateOptions.option1 && (
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                selectedHospitalId === candidateOptions.option1.hospitalId
                  ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/40 shadow-lg'
                  : 'bg-stone-950/60 border-stone-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-500/40">
                      🏆 1ST BEST (RECOMMENDED APEX)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      Score: {candidateOptions.option1.compositeScore}/99
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-stone-100 mt-1">
                    {candidateOptions.option1.hospitalName}
                  </h3>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {candidateOptions.option1.distanceKm} km · Traffic ETA:{' '}
                    <strong className="text-amber-400 font-bold">
                      {candidateOptions.option1.effectiveEtaMin} mins
                    </strong>
                  </p>
                </div>
              </div>

              {/* Doctor Duty Roster Card */}
              <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800 mb-3 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-stone-400 font-mono">On-Duty {requiredSpecialistRole}:</span>
                  <span
                    className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      candidateOptions.option1.doctorInfo.status === 'READY_TRAUMA_BAY'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : candidateOptions.option1.doctorInfo.status === 'OCCUPIED_IN_OT'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-red-950 text-red-400 border border-red-800'
                    }`}
                  >
                    {candidateOptions.option1.doctorInfo.status === 'READY_TRAUMA_BAY'
                      ? 'READY IN TRAUMA BAY'
                      : candidateOptions.option1.doctorInfo.status}
                  </span>
                </div>
                <div className="text-xs font-bold text-stone-200">
                  {candidateOptions.option1.doctorInfo.doctorName}
                </div>
                <div className="text-[10px] text-stone-500 font-mono">
                  {candidateOptions.option1.doctorInfo.department} ·{' '}
                  {candidateOptions.option1.availIcu} ICU Beds Open
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() =>
                    handleSelectDestination(candidateOptions.option1, '1st Best Apex')
                  }
                  className="flex-1 py-2 px-3 rounded-lg font-mono text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  Lock Apex Route
                </button>
                <button
                  onClick={() => handleDispatchAndPrealert(candidateOptions.option1)}
                  disabled={isTransmitting}
                  className="py-2 px-3 rounded-lg font-mono text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-colors flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Pre-Alert Bay
                </button>
              </div>
            </div>
          )}

          {/* Option 2: 2nd Best Immediate Stabilization Fallback */}
          {candidateOptions.option2 && (
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                selectedHospitalId === candidateOptions.option2.hospitalId
                  ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/40 shadow-lg'
                  : 'bg-stone-950/60 border-stone-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/40">
                      ⚡ 2ND BEST (STABILIZATION FALLBACK)
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-stone-100 mt-1">
                    {candidateOptions.option2.hospitalName}
                  </h3>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {candidateOptions.option2.distanceKm} km ({candidateOptions.option2.effectiveEtaMin} mins) ·{' '}
                    <span className="text-emerald-400 font-bold">
                      {Math.max(
                        0,
                        (candidateOptions.option1?.effectiveEtaMin || 0) -
                          candidateOptions.option2.effectiveEtaMin
                      )}
                      m faster
                    </span>
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-stone-400 font-mono bg-stone-900/60 p-2 rounded-lg border border-stone-800 mb-2.5">
                Recommended if patient decompensates in transit (airway, IV resuscitation, chest tube).
              </p>

              <button
                onClick={() =>
                  handleSelectDestination(
                    candidateOptions.option2,
                    '2nd Best Stabilization Fallback'
                  )
                }
                className="w-full py-2 px-3 rounded-lg font-mono text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <CornerDownRight className="w-3.5 h-3.5 text-blue-400" />
                Divert to Stabilization Bay
              </button>
            </div>
          )}

          {/* Option 3: 3rd Best Alternative Apex Contingency */}
          {candidateOptions.option3 && (
            <div
              className={`p-3.5 rounded-xl border transition-all ${
                selectedHospitalId === candidateOptions.option3.hospitalId
                  ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/40 shadow-lg'
                  : 'bg-stone-950/60 border-stone-800'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/40">
                      🛡️ 3RD BEST (CONTINGENCY APEX)
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-stone-100 mt-1">
                    {candidateOptions.option3.hospitalName}
                  </h3>
                  <p className="text-[11px] text-stone-400 font-mono">
                    {candidateOptions.option3.distanceKm} km · ETA:{' '}
                    {candidateOptions.option3.effectiveEtaMin} mins ·{' '}
                    {candidateOptions.option3.availIcu} ICU Beds
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  handleSelectDestination(
                    candidateOptions.option3,
                    '3rd Best Contingency Backup'
                  )
                }
                className="w-full py-2 px-3 rounded-lg font-mono text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <Hospital className="w-3.5 h-3.5 text-purple-400" />
                Select Alternative Tertiary Apex
              </button>
            </div>
          )}
        </div>

        {/* Live Broadcast Footer Info */}
        <div className="text-center space-y-1 py-2">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-stone-500">
            <Wifi className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            <span>State BroadcastChannel: Active (0ms Latency)</span>
          </div>
          <p className="text-[10px] text-stone-600 font-mono">
            TriageNet Emergency Medical Telemetry · Jharkhand 108 Fleet
          </p>
        </div>
      </main>

      {/* Floating Bottom Quick Dispatch Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#161412]/95 backdrop-blur-md border-t border-amber-900/30 p-3 z-40">
        <div className="max-w-xl mx-auto flex items-center gap-2">
          <button
            onClick={() => {
              const target =
                candidateOptions.allCandidates.find((h) => h.hospitalId === selectedHospitalId) ||
                candidateOptions.option1
              if (target) handleDispatchAndPrealert(target)
            }}
            disabled={isTransmitting}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition-all active:scale-[0.98]"
          >
            <Siren className="w-4 h-4 animate-pulse" />
            {isTransmitting
              ? 'BROADCASTING TO TRAUMA BAY...'
              : 'TRANSMIT TELEMETRY & PRE-ALERT BAY'}
          </button>
        </div>
      </div>
    </div>
  )
}
