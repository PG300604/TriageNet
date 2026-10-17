'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { directorBridge, type DirectorEvent } from '@/lib/director-bridge'
import { ApiClient, type StateOverviewData } from '@/lib/api-client'
import { UserRole } from '@/lib/auth-context'
import { cn } from '@/lib/utils'
import { ACCIDENT_HOTSPOTS, type AccidentHotspot } from '@/lib/accident-hotspots'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Compass,
  Copy,
  ExternalLink,
  FastForward,
  Flame,
  HeartPulse,
  Layers,
  MapPin,
  Monitor,
  Pause,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Server,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Terminal,
  Truck,
  Building2,
  UserCheck,
  Users,
  Wifi,
  WifiOff,
  Zap,
  Smartphone,
  Ambulance,
} from 'lucide-react'

interface RoleCard {
  role: UserRole
  staffId: string
  name: string
  title: string
  jurisdiction: string
  icon: React.ElementType
  color: string
}

const ROLES: RoleCard[] = [
  {
    role: 'SUPER_ADMIN',
    staffId: 'JH-SYS-0001',
    name: 'State Health Command (Super Admin)',
    title: 'State Health Command (Super Admin)',
    jurisdiction: 'Statewide (24 Districts)',
    icon: Shield,
    color: 'border-orange-500/40 text-orange-400 bg-orange-950/20',
  },
  {
    role: 'DISTRICT_CMO',
    staffId: 'JH-CMO-2001',
    name: 'Dr. Anita Soren',
    title: 'District CMO (Ranchi Command)',
    jurisdiction: 'Ranchi District HQ',
    icon: Activity,
    color: 'border-blue-500/40 text-blue-400 bg-blue-950/20',
  },
  {
    role: 'HOSPITAL_ADMIN',
    staffId: 'JH-ADM-3001',
    name: 'Dr. Rajesh Murmu',
    title: 'Medical Superintendent (RIMS)',
    jurisdiction: 'RIMS Ranchi Command',
    icon: Building2,
    color: 'border-purple-500/40 text-purple-400 bg-purple-950/20',
  },
  {
    role: 'TRIAGE_NURSE',
    staffId: 'JH-NUR-4001',
    name: 'Sister Sunita Kumari',
    title: 'Lead Emergency Triage Nurse',
    jurisdiction: 'RIMS ED Triage Desk',
    icon: Stethoscope,
    color: 'border-emerald-500/40 text-emerald-400 bg-emerald-950/20',
  },
  {
    role: 'AMBULANCE_DISPATCH',
    staffId: 'JH-DSP-5001',
    name: 'Vikram Singh',
    title: '108 Ambulance Dispatcher',
    jurisdiction: 'Central Fleet Routing Desk',
    icon: Truck,
    color: 'border-amber-500/40 text-amber-400 bg-amber-950/20',
  },
  {
    role: 'HOSPITAL_STAFF',
    staffId: 'JH-MED-6001',
    name: 'Dr. Deepak Verma',
    title: 'Medical Officer (Sadar Hospital)',
    jurisdiction: 'Sadar Ward In-Charge',
    icon: Users,
    color: 'border-stone-500/40 text-stone-300 bg-stone-900/30',
  },
]

export default function DirectorControlPage() {
  const [displayStatus, setDisplayStatus] = useState<'connected' | 'disconnected'>('disconnected')
  const [lastPong, setLastPong] = useState<{
    activeView?: string
    role?: string
    dataSourceMode?: 'live' | 'simulated'
    hospitalCount?: number
    scenario?: string
    isPlaying?: boolean
    time: number
  } | null>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [activeScenario, setActiveScenario] = useState<'steady' | 'mass-casualty' | 'regional-surge'>('steady')
  const [backendStatus, setBackendStatus] = useState<'live' | 'simulated' | 'checking'>('checking')
  const [stateOverview, setStateOverview] = useState<StateOverviewData | null>(null)
  const [copiedStaffId, setCopiedStaffId] = useState<string | null>(null)
  const [copiedPassword, setCopiedPassword] = useState(false)
  const [actionLog, setActionLog] = useState<{ id: string; time: string; text: string }[]>([])

  const logAction = useCallback((text: string) => {
    const timeStr = new Date().toLocaleTimeString()
    setActionLog((prev) => [{ id: Math.random().toString(), time: timeStr, text }, ...prev.slice(0, 19)])
  }, [])

  // Probe backend Spring Boot API
  const probeBackend = useCallback(async () => {
    setBackendStatus('checking')
    try {
      const overview = await ApiClient.getStateOverview()
      setStateOverview(overview)
      setBackendStatus('live')
    } catch {
      setBackendStatus('simulated')
    }
  }, [])

  useEffect(() => {
    probeBackend()
  }, [probeBackend])

  // Probe active display tabs via ping
  const sendPing = useCallback(() => {
    directorBridge.send({ type: 'PING' })
  }, [])

  useEffect(() => {
    const unsubscribe = directorBridge.subscribe((ev: DirectorEvent) => {
      if (ev.type === 'PONG') {
        setDisplayStatus('connected')
        setLastPong({
          activeView: ev.activeView,
          role: ev.role,
          dataSourceMode: ev.dataSourceMode,
          hospitalCount: ev.hospitalCount,
          scenario: ev.scenario,
          isPlaying: ev.isPlaying,
          time: Date.now(),
        })
        if (ev.scenario) {
          setActiveScenario(ev.scenario as any)
        }
        if (typeof ev.isPlaying === 'boolean') {
          setIsPlaying(ev.isPlaying)
        }
        if (ev.dataSourceMode) {
          setBackendStatus(ev.dataSourceMode)
        }
      }
    })

    // Initial ping and interval ping
    sendPing()
    const timer = setInterval(() => {
      sendPing()
    }, 3500)

    return () => {
      clearInterval(timer)
      unsubscribe()
    }
  }, [sendPing])

  // Check if last pong is stale (> 9 seconds)
  useEffect(() => {
    const checkTimer = setInterval(() => {
      if (lastPong && Date.now() - lastPong.time > 9000) {
        setDisplayStatus('disconnected')
      }
    }, 3000)
    return () => clearInterval(checkTimer)
  }, [lastPong])

  // Remote Actions
  const handleSwitchRole = (staffId: string, title: string) => {
    directorBridge.send({ type: 'SWITCH_ROLE', staffId })
    logAction(`Dispatched persona switch: ${title} (${staffId})`)
  }

  const handleScenario = (scenario: 'steady' | 'mass-casualty' | 'regional-surge') => {
    setActiveScenario(scenario)
    directorBridge.send({ type: 'TRIGGER_SCENARIO', scenario })
    logAction(`Triggered scenario: ${scenario.toUpperCase().replace('-', ' ')}`)
  }

  const handleTogglePlay = () => {
    const next = !isPlaying
    setIsPlaying(next)
    directorBridge.send({ type: 'SET_PLAYING', isPlaying: next })
    logAction(`${next ? 'Started' : 'Paused'} continuous simulation auto-play`)
  }

  const handleStepTime = (minutes: number) => {
    directorBridge.send({ type: 'STEP_TIME', minutes })
    logAction(`Advanced simulation clock by +${minutes} minutes`)
  }

  const handleInject = (patientType: 'critical_trauma' | 'cardiac_arrest' | 'pediatric_respiratory' | 'sepsis_shock', label: string) => {
    directorBridge.send({ type: 'INJECT_PATIENT', patientType })
    logAction(`Injected clinical incident: ${label}`)
  }

  const handleBedRelease = (reason: 'recovery' | 'family_ama') => {
    directorBridge.send({ type: 'TRIGGER_BED_RELEASE', reason })
    logAction(`Triggered bed release: ${reason === 'recovery' ? 'Step-Down Recovery' : 'Transfer / AMA'}`)
  }

  const handleSetView = (view: string, label: string) => {
    directorBridge.send({ type: 'SET_VIEW', view })
    logAction(`Navigated display view to: ${label}`)
  }

  const handleSetDistrict = (district: string) => {
    directorBridge.send({ type: 'SET_DISTRICT', district })
    logAction(`Filtered display district to: ${district}`)
  }

  const handleRetryBackend = () => {
    probeBackend()
    directorBridge.send({ type: 'RETRY_BACKEND' })
    logAction('Probed Spring Boot backend (port 8080) and synced all display tabs')
  }

  const handleReset = () => {
    setActiveScenario('steady')
    setIsPlaying(false)
    directorBridge.send({ type: 'RESET_SIMULATION' })
    logAction('Reset simulation to Steady State')
  }

  const [activeSimHotspot, setActiveSimHotspot] = useState<string | null>(null)
  const [directorGreenWave, setDirectorGreenWave] = useState(false)

  const handleSimulateHotspot = (hotspot: AccidentHotspot) => {
    setActiveSimHotspot(hotspot.id)
    directorBridge.send({ type: 'SET_VIEW', view: 'network' })
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
    logAction(`🚨 Broadcasted Accident Blackspot: ${hotspot.name} (${hotspot.blackspotRanking}). Req Doctor: ${hotspot.requiredSpecialistRole}`)
  }

  const handleToggleDirectorGreenWave = () => {
    const next = !directorGreenWave
    setDirectorGreenWave(next)
    directorBridge.send({ type: 'TOGGLE_GREEN_WAVE', active: next })
    logAction(`${next ? '⚡ ACTIVATED' : 'RELEASED'} 108 Green Wave Signal Preemption Corridor`)
  }

  const copyToClipboard = (text: string, type: 'id' | 'pw', id?: string) => {
    navigator.clipboard.writeText(text)
    if (type === 'id' && id) {
      setCopiedStaffId(id)
      setTimeout(() => setCopiedStaffId(null), 2000)
    } else {
      setCopiedPassword(true)
      setTimeout(() => setCopiedPassword(false), 2000)
    }
  }

  const connectedNodesCount = lastPong?.hospitalCount || stateOverview?.totalHospitals || 79

  return (
    <div className="min-h-screen bg-[#0d0905] text-[#ffedd7] font-sans antialiased p-4 md:p-8">
      {/* Top Header & Telemetry Bar */}
      <header className="mx-auto max-w-7xl mb-8 border-b border-dashed border-[#40372e] pb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[#ea580c] text-white shadow-lg shadow-orange-500/20">
            <Radio className="size-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#ffedd7]">
                TriageNet Director Control Center
              </h1>
              <span className="font-mono text-[10px] font-bold text-[#ea580c] bg-orange-950/40 border border-orange-500/30 px-2 py-0.5 rounded uppercase">
                HIDDEN OPERATOR TERMINAL
              </span>
            </div>
            <p className="text-xs text-[#a89984] mt-0.5">
              Remote orchestrator for OBS recording — controls scenarios, time stepping, and personas with zero cursor clutter.
            </p>
          </div>
        </div>

        {/* Display Tab Connection Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 rounded-2xl border border-[#40372e] bg-[#1a140f] px-3.5 py-2">
            <Monitor className="size-4 text-[#ea580c]" />
            <div className="text-left font-mono">
              <div className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${displayStatus === 'connected' ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
                <span className="text-[11px] font-bold uppercase text-stone-200">
                  {displayStatus === 'connected' ? 'DISPLAY TAB LINKED' : 'SEARCHING TABS…'}
                </span>
              </div>
              {lastPong && displayStatus === 'connected' && (
                <p className="text-[10px] text-stone-400">
                  View: <span className="text-orange-400 font-bold">{lastPong.activeView || 'dashboard'}</span> · Role: <span className="text-emerald-400">{lastPong.role || 'SUPER_ADMIN'}</span>
                </p>
              )}
            </div>
          </div>

          <a
            href="/ambulance"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-950/40 hover:bg-amber-900/50 px-3 py-2 text-xs font-bold text-amber-300 transition-colors cursor-pointer"
          >
            <Smartphone className="size-3.5 text-amber-400" />
            <span>Open 108 Ambulance App</span>
            <ExternalLink className="size-3.5" />
          </a>

          <a
            href="/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-950/40 hover:bg-orange-900/50 px-3 py-2 text-xs font-bold text-orange-300 transition-colors cursor-pointer"
          >
            <span>Open Display Tab</span>
            <ExternalLink className="size-3.5" />
          </a>
        </div>
      </header>

      {/* Main Grid */}
      <div className="mx-auto max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Core Simulation Engines & Telemetry (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* SCREENSHOT 1 & SCREENSHOT 4 ROW: Scenario Pill Switcher & Live API Gateway */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            {/* Screenshot 1: SCENARIO: [Steady State] [Mass Casualty] [Regional Surge] */}
            <section className="md:col-span-7 rounded-2xl border border-[#40372e] bg-[#16100a] p-4 shadow-xl flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-[#32281e]/60">
                <span className="size-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="size-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[10px] font-mono text-stone-400 ml-2 uppercase font-semibold">
                  Scenario Orchestrator (Screenshot 1)
                </span>
              </div>

              <div className="inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-[#40372e] bg-[#100904] p-1.5 shadow-inner">
                <span className="px-3 text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  SCENARIO:
                </span>
                {[
                  { key: 'steady', label: 'Steady State' },
                  { key: 'mass-casualty', label: 'Mass Casualty' },
                  { key: 'regional-surge', label: 'Regional Surge' },
                ].map((sc) => (
                  <button
                    key={sc.key}
                    type="button"
                    onClick={() => handleScenario(sc.key as any)}
                    className={cn(
                      'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                      activeScenario === sc.key
                        ? 'bg-[#382416] text-[#ffedd7] shadow-sm border border-orange-500/40 ring-1 ring-orange-500/20'
                        : 'text-stone-400 hover:bg-[#1f1710] hover:text-stone-200'
                    )}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Screenshot 4: LIVE API Gateway & Backend Probe */}
            <section className="md:col-span-5 rounded-2xl border border-[#40372e] bg-[#16100a] p-4 shadow-xl flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-[#32281e]/60">
                <span className="size-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="size-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[10px] font-mono text-stone-400 ml-2 uppercase font-semibold">
                  Backend Mode (Screenshot 4)
                </span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleRetryBackend}
                  disabled={backendStatus === 'checking'}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-mono font-bold tracking-wider transition-all cursor-pointer shadow-sm',
                    backendStatus === 'live'
                      ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/60'
                      : backendStatus === 'checking'
                        ? 'bg-stone-900 border-stone-600 text-stone-400 animate-pulse'
                        : 'bg-amber-950/60 border-amber-500/50 text-amber-400 hover:bg-amber-900/60'
                  )}
                  title="Click to re-probe Spring Boot API and sync all connected display tabs"
                >
                  {backendStatus === 'live' ? (
                    <><Wifi className="size-3.5 text-emerald-400" /> LIVE API</>
                  ) : backendStatus === 'checking' ? (
                    <><Server className="size-3.5 text-stone-400 animate-spin" /> CONNECTING…</>
                  ) : (
                    <><WifiOff className="size-3.5 text-amber-400" /> SIMULATED</>
                  )}
                </button>

                <div className="text-right font-mono text-[10px] text-stone-400 leading-tight">
                  <div className="text-stone-300 font-bold">Port 8080 Active</div>
                  <div className="text-stone-500">
                    {stateOverview ? `${stateOverview.totalHospitals} Hospitals Seeded` : '111 Hospitals'}
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* SCREENSHOT 2: Continuous Simulation Engine HUD Card */}
          <section className="rounded-2xl border border-[#40372e] bg-[#16100a] p-5 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-[#32281e] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="size-2.5 rounded-full bg-rose-500 inline-block" />
                  <span className="size-2.5 rounded-full bg-amber-500 inline-block" />
                  <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
                </div>
                <div className="flex size-8 items-center justify-center rounded-xl bg-[#382416] text-[#ffedd7]">
                  <Activity className="size-4 text-[#ea580c]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#ffedd7]">Continuous Simulation Engine</h3>
                  <p className="text-[11px] text-stone-400">
                    Automated time forward step & Hungarian hospital rebalancing
                  </p>
                </div>
              </div>
              {isPlaying && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Continuous Mode
                </span>
              )}
            </div>

            <div className="my-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#32281e] bg-[#100904] p-4">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-stone-300">
                  Simulation Step Interval: <span className="font-bold text-[#ea580c]">7 Minutes</span>
                </p>
                <p className="text-[11px] text-stone-500">
                  Advances vitals decay, Hungarian bed reassignment, and step-down discharge.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer shadow-md',
                    isPlaying
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-[#382416] hover:bg-[#28180d] text-[#ffedd7] border border-orange-500/40'
                  )}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="size-3.5 fill-white" />
                      <span>Pause Auto-Play</span>
                    </>
                  ) : (
                    <>
                      <Play className="size-3.5 fill-[#ffedd7]" />
                      <span>Start Auto-Play</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleStepTime(15)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#40372e] bg-[#1f1710] px-3.5 py-2.5 text-xs font-bold text-stone-300 hover:bg-[#2a1e14] cursor-pointer shadow-xs transition-colors"
                >
                  <FastForward className="size-3.5 text-[#ea580c]" />
                  <span>+15m Step</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-emerald-500" />
                Real-time Dijkstra shortest-path rerouting enabled
              </span>
              <span className="font-semibold text-stone-400">
                Active Connected Nodes: {connectedNodesCount} Facilities
              </span>
            </div>
          </section>

          {/* SCREENSHOT 3 & TIME ADVANCEMENT BAR */}
          <section className="rounded-2xl border border-[#40372e] bg-[#16100a] p-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#32281e] pb-2.5 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="size-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="size-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[10px] font-mono text-stone-400 ml-2 uppercase font-semibold">
                  Time Stepper Controls (Screenshot 3)
                </span>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 rounded-lg border border-[#40372e] bg-[#1f1710] px-2 py-0.5 text-[10px] font-bold text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="size-3 text-orange-400" />
                <span>Reset Baseline</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => handleStepTime(7)}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#382416] px-5 py-2.5 font-bold text-[#ffedd7] hover:bg-[#28180d] cursor-pointer shadow-md transition-colors border border-orange-500/30 text-xs"
              >
                <Play className="size-3.5 fill-[#ffedd7]" />
                <span>+7m Step</span>
              </button>

              <button
                type="button"
                onClick={() => handleStepTime(35)}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#40372e] bg-[#100904] px-5 py-2.5 text-xs font-bold text-stone-300 hover:bg-[#1f1710] cursor-pointer transition-colors shadow-xs"
              >
                <FastForward className="size-3.5 text-[#ea580c]" />
                <span>+35m</span>
              </button>

              <button
                type="button"
                onClick={() => handleStepTime(15)}
                className="inline-flex items-center gap-1.5 rounded-2xl border border-[#40372e] bg-[#100904] px-4 py-2.5 text-xs font-bold text-stone-400 hover:text-stone-200 cursor-pointer transition-colors"
              >
                <FastForward className="size-3 text-orange-400" />
                <span>+15m Step</span>
              </button>
            </div>
          </section>

          {/* Scripted Storyboard Autopilot */}
          <section className="rounded-2xl border border-[#40372e] bg-[#16100a] p-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#32281e] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-orange-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffedd7]">
                  Scripted Storyboard Autopilot (Video Scene Flow)
                </h2>
              </div>
              <span className="text-[10px] font-mono text-stone-400">1-CLICK DEMO CHAPTERS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  handleSetDistrict('ALL')
                  handleSetView('network', 'Regional Network')
                  handleScenario('steady')
                }}
                className="p-3 rounded-xl border border-[#32281e] bg-[#1f1710] hover:border-orange-500/50 hover:bg-[#2a1e14] transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 group-hover:text-orange-400">
                  <span>Scene 1: Statewide Graph</span>
                  <span className="font-mono text-[9px] text-stone-500">CH 1</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Opens Regional Network map across all 24 districts with steady-state baseline.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSetDistrict('Ranchi')
                  handleSetView('capacity', 'Capacity Matrix')
                }}
                className="p-3 rounded-xl border border-[#32281e] bg-[#1f1710] hover:border-orange-500/50 hover:bg-[#2a1e14] transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 group-hover:text-orange-400">
                  <span>Scene 2: RIMS Capacity</span>
                  <span className="font-mono text-[9px] text-stone-500">CH 2</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Zooms into Ranchi district and inspects RIMS critical bed saturation & ICU meters.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleScenario('mass-casualty')
                }}
                className="p-3 rounded-xl border border-[#32281e] bg-[#1f1710] hover:border-rose-500/50 hover:bg-[#2a1e14] transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 group-hover:text-rose-400">
                  <span>Scene 3: Mass Casualty Surge</span>
                  <span className="font-mono text-[9px] text-rose-500">CH 3</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Fires Mass Casualty protocol siren and floods triage heap with high-acuity admissions.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSetView('queue', 'Triage Queue')
                  handleInject('critical_trauma', 'Rahul Verma (Chest & Pelvic Fracture)')
                }}
                className="p-3 rounded-xl border border-[#32281e] bg-[#1f1710] hover:border-orange-500/50 hover:bg-[#2a1e14] transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 group-hover:text-orange-400">
                  <span>Scene 4: Code Red Preemption</span>
                  <span className="font-mono text-[9px] text-stone-500">CH 4</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Switches to Triage Queue and injects Code Red polytrauma preempting bed.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleStepTime(15)
                }}
                className="p-3 rounded-xl border border-[#32281e] bg-[#1f1710] hover:border-orange-500/50 hover:bg-[#2a1e14] transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 group-hover:text-orange-400">
                  <span>Scene 5: Dijkstra Routing</span>
                  <span className="font-mono text-[9px] text-stone-500">CH 5</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Advances time +15m triggering Dijkstra multi-district overflow rerouting.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSwitchRole('JH-CMO-2001', 'District CMO (Ranchi District)')
                }}
                className="p-3 rounded-xl border border-[#32281e] bg-[#1f1710] hover:border-blue-500/50 hover:bg-[#2a1e14] transition-all text-left cursor-pointer group"
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-300 group-hover:text-blue-400">
                  <span>Scene 6: CMO Escrow Authorization</span>
                  <span className="font-mono text-[9px] text-blue-500">CH 6</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  Switches active user to District CMO without touching the recording screen.
                </p>
              </button>
            </div>
          </section>

          {/* AI Automated Accident Blackspot & Dynamic Casualty Router Simulator */}
          <section className="rounded-2xl border border-red-500/30 bg-[#16100a] p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#32281e] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 items-center justify-center rounded-xl bg-red-950/60 text-red-400 border border-red-500/40">
                  <Flame className="size-4 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffedd7]">
                      AI Accident Blackspot &amp; Casualty Router Simulator
                    </h2>
                    <span className="font-mono text-[9px] bg-red-950/80 text-rose-300 border border-red-500/40 px-2 py-0.5 rounded-full font-bold">
                      5 SCENARIOS
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Triggers concentrated accident nodes, fetches live traffic congestion factors, queries on-duty doctor rosters, and calculates 1st, 2nd &amp; 3rd best options.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <a
                  href="/ambulance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 shadow-md"
                >
                  <Smartphone className="size-3.5 text-amber-400" />
                  <span>📱 EMT Mobile App</span>
                  <ExternalLink className="size-3" />
                </a>

                <button
                  type="button"
                  onClick={handleToggleDirectorGreenWave}
                  className={cn(
                    'px-3.5 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5 border shadow-md',
                    directorGreenWave
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                      : 'bg-[#ea580c] hover:bg-[#c2410c] text-white border-orange-400 animate-pulse'
                  )}
                >
                  <Zap className="size-3.5 fill-current" />
                  <span>{directorGreenWave ? '⚡ Green Wave Active' : '🚨 Signal Preemption'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {ACCIDENT_HOTSPOTS.map((spot, sIdx) => {
                const isSelected = activeSimHotspot === spot.id
                return (
                  <div
                    key={spot.id}
                    className={cn(
                      'p-3.5 rounded-xl border transition-all text-left space-y-2.5 flex flex-col justify-between',
                      isSelected
                        ? 'bg-red-950/30 border-red-500 shadow-md ring-1 ring-red-500/30'
                        : 'bg-[#1b140d] border-[#382416] hover:border-red-500/40'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 text-[10px] font-mono mb-1">
                        <span className="text-rose-400 font-bold uppercase">
                          SCENARIO {sIdx + 1}
                        </span>
                        <span className="text-stone-300 bg-black/60 px-1.5 py-0.2 rounded border border-stone-800 font-semibold">
                          {spot.monthlyAccidents} CRASHES/MO
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-stone-100 leading-snug">{spot.name}</h4>
                      <p className="text-[10px] text-stone-400 mt-0.5 font-mono">{spot.highway}</p>
                    </div>

                    <div className="pt-2 border-t border-[#32281e]/80 text-[10px] space-y-1 font-mono">
                      <div className="flex justify-between text-stone-300">
                        <span className="text-stone-500">REQ SPECIALIST:</span>
                        <span className="text-orange-300 font-bold">{spot.requiredSpecialistRole}</span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span className="text-stone-500">TRAFFIC LEVEL:</span>
                        <span className={spot.defaultTrafficLevel === 'HEAVY' ? 'text-red-400 font-bold' : 'text-amber-400 font-bold'}>
                          {spot.defaultTrafficLevel} (+{spot.defaultTrafficDelayMin}m)
                        </span>
                      </div>
                      <div className="flex justify-between text-stone-300">
                        <span className="text-stone-500">PATIENT GCS:</span>
                        <span className="text-rose-400 font-bold">{spot.defaultVitals.gcs}/15 · SpO2: {spot.defaultVitals.spo2}%</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSimulateHotspot(spot)}
                      className={cn(
                        'w-full py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs mt-1',
                        isSelected
                          ? 'bg-rose-700 hover:bg-rose-600 text-white'
                          : 'bg-[#382416] hover:bg-[#ea580c] text-[#ffedd7]'
                      )}
                    >
                      <Truck className="size-3.5" />
                      <span>{isSelected ? '✓ Broadcasted' : 'Simulate Blackspot'}</span>
                    </button>
                  </div>
                )
              })}
            </div>
          </section>

          {/* Clinical Incident Injector & Bed Releases */}
          <section className="rounded-2xl border border-[#40372e] bg-[#16100a] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#32281e] pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse className="size-4 text-rose-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffedd7]">
                  Clinical Incident Injector & Bed Releases
                </h2>
              </div>
              <span className="text-[10px] font-mono text-stone-400">REAL-TIME ARRIVALS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => handleInject('critical_trauma', 'Rahul Verma (Chest & Pelvic Fracture)')}
                className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/30 text-left transition-all cursor-pointer"
              >
                <span className="font-mono text-[9px] font-bold text-rose-400 uppercase block">CODE RED · S: 95</span>
                <p className="text-xs font-bold text-[#ffedd7] mt-0.5">Polytrauma Influx</p>
                <p className="text-[10px] text-stone-400 mt-1">Preempts lower-acuity ICU bed</p>
              </button>

              <button
                type="button"
                onClick={() => handleInject('cardiac_arrest', 'Anand Kumar (STEMI VFIB)')}
                className="p-3 rounded-xl border border-rose-500/30 bg-rose-950/20 hover:bg-rose-900/30 text-left transition-all cursor-pointer"
              >
                <span className="font-mono text-[9px] font-bold text-rose-400 uppercase block">CRITICAL · S: 98</span>
                <p className="text-xs font-bold text-[#ffedd7] mt-0.5">Cardiac Arrest VFIB</p>
                <p className="text-[10px] text-stone-400 mt-1">Requires immediate ICU/Ventilator</p>
              </button>

              <button
                type="button"
                onClick={() => handleInject('pediatric_respiratory', 'Aarav Roy (4y Asthmaticus)')}
                className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-900/30 text-left transition-all cursor-pointer"
              >
                <span className="font-mono text-[9px] font-bold text-amber-400 uppercase block">URGENT · S: 88</span>
                <p className="text-xs font-bold text-[#ffedd7] mt-0.5">Pediatric Respiratory</p>
                <p className="text-[10px] text-stone-400 mt-1">Status Asthmaticus with Stridor</p>
              </button>

              <button
                type="button"
                onClick={() => handleInject('sepsis_shock', 'Pooja Kumari (Septic Shock)')}
                className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 hover:bg-amber-900/30 text-left transition-all cursor-pointer"
              >
                <span className="font-mono text-[9px] font-bold text-amber-400 uppercase block">URGENT · S: 92</span>
                <p className="text-xs font-bold text-[#ffedd7] mt-0.5">Septic Shock</p>
                <p className="text-[10px] text-stone-400 mt-1">Refractory Hypotension</p>
              </button>
            </div>

            <div className="pt-2 border-t border-[#32281e] flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-mono font-bold uppercase text-stone-400">
                Trigger Bed Discharge:
              </span>
              <button
                type="button"
                onClick={() => handleBedRelease('recovery')}
                className="rounded-xl border border-emerald-500/40 bg-emerald-950/30 px-3.5 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-900/40 transition-colors cursor-pointer"
              >
                ✓ Step-Down Recovery Discharge
              </button>
              <button
                type="button"
                onClick={() => handleBedRelease('family_ama')}
                className="rounded-xl border border-stone-600 bg-stone-900 px-3.5 py-1.5 text-xs font-bold text-stone-300 hover:bg-stone-800 transition-colors cursor-pointer"
              >
                ⇄ Transfer / AMA Discharge
              </button>
            </div>
          </section>

          {/* Remote Navigation & District View Selector */}
          <section className="rounded-2xl border border-[#40372e] bg-[#16100a] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#32281e] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="size-4 text-orange-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffedd7]">
                  Display Navigation & District Focus
                </h2>
              </div>
              <span className="text-[10px] font-mono text-stone-400">ZERO TOUCH RECORDING</span>
            </div>

            <div className="space-y-3">
              <div>
                <span className="block text-[11px] font-mono font-bold uppercase text-stone-400 mb-1.5">
                  Switch Active View
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'capacity', label: 'Capacity Matrix' },
                    { key: 'queue', label: 'Triage Queue' },
                    { key: 'network', label: 'Regional Network Map' },
                    { key: 'patients', label: 'Patient Directory' },
                    { key: 'aicds', label: 'AI Clinical CDS' },
                    { key: 'doctors', label: 'Doctor Roster' },
                    { key: 'clinical', label: 'Clinical Ops' },
                    { key: 'billing', label: 'Ayushman Escrow' },
                    { key: 'supplies', label: 'Oxygen & Supplies' },
                    { key: 'reports', label: 'Audit Reports' },
                    { key: 'comms', label: 'Regional Comms Relay' },
                  ].map((v) => {
                    const isActive = lastPong?.activeView === v.key
                    return (
                      <button
                        key={v.key}
                        type="button"
                        onClick={() => handleSetView(v.key, v.label)}
                        className={cn(
                          'px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer',
                          isActive
                            ? 'bg-[#ea580c] text-white border-orange-400 shadow-sm shadow-orange-500/20 ring-1 ring-orange-400/40'
                            : 'border-[#32281e] bg-[#1f1710] text-stone-300 hover:border-orange-500/40 hover:text-orange-400'
                        )}
                      >
                        {v.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <span className="block text-[11px] font-mono font-bold uppercase text-stone-400 mb-1.5">
                  Switch District Scope
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'ALL',
                    'Ranchi',
                    'East Singhbhum (Jamshedpur)',
                    'Dhanbad',
                    'Bokaro',
                    'Hazaribagh',
                    'Deoghar',
                    'Palamu (Daltonganj)',
                  ].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => handleSetDistrict(d)}
                      className="px-3 py-1 rounded-lg border border-[#32281e] bg-[#1f1710] hover:border-orange-500/40 text-[11px] font-semibold text-stone-300 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      {d === 'ALL' ? '🌟 Statewide (24 Districts)' : d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Persona Switcher & Live Action Log (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Persona Dispatcher */}
          <section className="rounded-2xl border border-[#40372e] bg-[#16100a] p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#32281e] pb-3">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-orange-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#ffedd7]">
                  Leadership Personas (6 RBAC Roles)
                </h2>
              </div>
            </div>

            {/* Master Password Card */}
            <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-950/20 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                  Master Password (All 6 Accounts)
                </span>
                <code className="text-xs font-mono font-bold text-[#ffedd7]">Triage@2026!</code>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard('Triage@2026!', 'pw')}
                className="flex items-center gap-1 rounded-lg bg-amber-900/40 border border-amber-500/30 px-2 py-1 text-[10px] font-bold text-amber-300 hover:bg-amber-800/40 transition-colors cursor-pointer"
              >
                {copiedPassword ? <Check className="size-3" /> : <Copy className="size-3" />}
                <span>{copiedPassword ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {ROLES.map((r) => {
                const isCurrentRole = lastPong?.role === r.role
                return (
                  <div
                    key={r.role}
                    className={`p-3 rounded-xl border transition-all ${r.color} ${
                      isCurrentRole ? 'ring-2 ring-emerald-500 shadow-md shadow-emerald-500/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-[#0d0905]/60">
                          <r.icon className="size-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-bold bg-[#0d0905]/80 px-1.5 py-0.5 rounded border border-[#40372e]">
                              {r.staffId}
                            </span>
                            <span className="text-xs font-bold text-[#ffedd7] truncate">{r.name}</span>
                            {isCurrentRole && (
                              <span className="font-mono text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/50 uppercase">
                                Active Tab
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-stone-400 mt-0.5">{r.title}</p>
                        </div>
                      </div>
                    </div>

                  <div className="mt-2.5 pt-2 border-t border-[#40372e]/50 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => copyToClipboard(r.staffId, 'id', r.staffId)}
                      className="flex items-center gap-1 text-[10px] font-mono text-stone-400 hover:text-stone-200 cursor-pointer"
                    >
                      {copiedStaffId === r.staffId ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      <span>{copiedStaffId === r.staffId ? 'Copied ID' : 'Copy ID'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSwitchRole(r.staffId, r.title)}
                      className="flex items-center gap-1 rounded-lg bg-[#ea580c] hover:bg-[#c24600] px-2.5 py-1 text-[10px] font-bold text-white transition-colors cursor-pointer shadow-sm"
                    >
                      <Zap className="size-3" />
                      <span>Switch Display Tab</span>
                    </button>
                  </div>
                </div>
              )})}
            </div>
          </section>

          {/* Action Audit Log */}
          <section className="rounded-2xl border border-[#40372e] bg-[#16100a] p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#32281e] pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-orange-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#ffedd7]">
                  Director Action Telemetry
                </h2>
              </div>
              <span className="text-[9px] font-mono text-stone-400">BROADCAST LOG</span>
            </div>

            <div className="h-48 overflow-y-auto space-y-1.5 font-mono text-[10px] pr-1">
              {actionLog.length === 0 ? (
                <p className="text-stone-500 italic p-2">Ready. Commands triggered here will appear in this log.</p>
              ) : (
                actionLog.map((log) => (
                  <div key={log.id} className="p-1.5 rounded bg-[#1f1710] border border-[#32281e] flex items-start gap-2">
                    <span className="text-stone-500 shrink-0">[{log.time}]</span>
                    <span className="text-stone-300">{log.text}</span>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
