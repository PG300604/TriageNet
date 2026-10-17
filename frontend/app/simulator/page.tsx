'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Smartphone,
  Truck,
  HeartPulse,
  Building2,
  Activity,
  ArrowRight,
  Shield,
  Wifi,
  Battery,
  Signal,
  RotateCcw,
  Volume2,
  VolumeX,
  Radio,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  BellRing,
  HelpCircle,
  X,
  ExternalLink,
  ChevronRight,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Download,
} from 'lucide-react'

type RoleKey = 'AMBULANCE' | 'NURSE' | 'SUPERINTENDENT' | 'CMO'

export default function PCMobileSimulatorPage() {
  const [activeRole, setActiveRole] = useState<RoleKey>('AMBULANCE')
  const [scale, setScale] = useState<number>(1)
  const [currentTime, setCurrentTime] = useState('18:42')
  const [showOtaBanner, setShowOtaBanner] = useState(true)
  const [otaUpdated, setOtaUpdated] = useState(false)
  const [showGuideModal, setShowGuideModal] = useState(false)

  // Ambulance Telemetry State
  const [gcs, setGcs] = useState<number>(9)
  const [spo2, setSpo2] = useState<number>(86)
  const [systolic, setSystolic] = useState<number>(95)
  const [heartRate, setHeartRate] = useState<number>(128)
  const [greenWaveActive, setGreenWaveActive] = useState<boolean>(false)
  const [traumaPreAlerted, setTraumaPreAlerted] = useState<boolean>(false)

  // Nurse State
  const [lockedBed, setLockedBed] = useState<string | null>(null)
  const [shortageReported, setShortageReported] = useState<boolean>(false)

  // Superintendent State
  const [erpSyncStatus, setErpSyncStatus] = useState<'SYNCED' | 'SYNCING'>('SYNCED')
  const [emergencyGrantApproved, setEmergencyGrantApproved] = useState<boolean>(false)

  // CMO State
  const [transferApproved, setTransferApproved] = useState<boolean>(false)

  useEffect(() => {
    const updateClock = () => {
      const now = new Date()
      const hours = now.getHours().toString().padStart(2, '0')
      const minutes = now.getMinutes().toString().padStart(2, '0')
      setCurrentTime(`${hours}:${minutes}`)
    }
    updateClock()
    const timer = setInterval(updateClock, 30000)
    return () => clearInterval(timer)
  }, [])

  // Calculate simulated ML Severity Score
  const computeSeverity = () => {
    let score = 50
    if (gcs <= 8) score += 30
    else if (gcs <= 12) score += 15

    if (spo2 < 90) score += 20
    else if (spo2 < 94) score += 10

    if (systolic < 90) score += 15
    if (heartRate > 120) score += 10

    return Math.min(100, Math.max(10, score))
  }

  const severityScore = computeSeverity()

  return (
    <div className="min-h-screen bg-[#0e0703] text-[#ffedd7] font-sans selection:bg-[#ea580c] selection:text-white flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-dashed border-[#40372e]/60 bg-[#100904]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative size-8 overflow-hidden rounded-lg shadow-sm border border-[#491205] bg-[#491205] group-hover:scale-105 transition-transform shrink-0">
              <Image src="/triagenet-logo.png" alt="TriageNet Mobile Companion Simulator Crest" width={32} height={32} className="object-cover" priority />
            </div>
            <div>
              <span className="text-xs md:text-sm font-bold uppercase text-[#ffedd7] tracking-wider font-mono">
                TRIAGENET
              </span>
              <span className="text-[10px] text-[#dc5000] block font-mono">PC INTERACTIVE MOBILE SIMULATOR</span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-[#40372e] text-xs font-mono text-stone-200 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="size-3.5 text-orange-400" />
              <span className="hidden sm:inline">How to Test on PC Guide</span>
            </button>

            <Link
              href="/downloads"
              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-[#40372e] text-xs font-mono text-orange-300 flex items-center gap-1.5 transition-colors"
            >
              <Download className="size-3.5 text-[#ea580c]" />
              <span className="hidden sm:inline">Download APK</span>
            </Link>

            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-lg bg-[#382416] hover:bg-[#491205] text-[#ffedd7] font-bold text-xs transition-all border border-[#ea580c]/30 flex items-center gap-1.5"
            >
              <span>WEB CONSOLE</span>
              <ArrowRight className="size-3 text-[#ea580c]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Simulator Workspace Body */}
      <div className="flex-1 flex flex-col items-center justify-start p-4 md:p-8 space-y-6">
        {/* Simulator Control Toolbar */}
        <div className="w-full max-w-4xl bg-[#181009]/90 border border-[#40372e] rounded-2xl p-4 backdrop-blur-md shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Role Persona Switcher */}
          <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-[#40372e]/60 overflow-x-auto w-full md:w-auto">
            <button
              type="button"
              onClick={() => setActiveRole('AMBULANCE')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeRole === 'AMBULANCE'
                  ? 'bg-[#ea580c] text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Truck className="size-3.5" />
              <span>108 Paramedic</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('NURSE')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeRole === 'NURSE'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <HeartPulse className="size-3.5" />
              <span>Triage Nurse</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('SUPERINTENDENT')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeRole === 'SUPERINTENDENT'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Building2 className="size-3.5" />
              <span>Superintendent</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveRole('CMO')}
              className={`px-3 py-2 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                activeRole === 'CMO'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Activity className="size-3.5" />
              <span>District CMO</span>
            </button>
          </div>

          {/* Quick Simulation Options */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end text-xs font-mono">
            {/* OTA Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setShowOtaBanner((v) => !v)
                setOtaUpdated(false)
              }}
              className="px-2.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-[#40372e] text-stone-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              title="Toggle In-App OTA Update Notification Banner"
            >
              <BellRing className={`size-3 text-amber-400 ${showOtaBanner && !otaUpdated ? 'animate-bounce' : ''}`} />
              <span className="text-[11px]">OTA Alert: {showOtaBanner && !otaUpdated ? 'ON' : 'OFF'}</span>
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-[#40372e]/60">
              <button
                type="button"
                onClick={() => setScale((s) => Math.max(0.85, s - 0.05))}
                className="size-6 flex items-center justify-center rounded hover:bg-stone-800 text-stone-300 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="size-3" />
              </button>
              <span className="px-1 text-[10px] text-stone-400">{Math.round(scale * 100)}%</span>
              <button
                type="button"
                onClick={() => setScale((s) => Math.min(1.15, s + 0.05))}
                className="size-6 flex items-center justify-center rounded hover:bg-stone-800 text-stone-300 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="size-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Smartphone Chassis Frame */}
        <div
          className="relative transition-transform duration-200 ease-out"
          style={{ transform: `scale(${scale})`, transformOrigin: 'top center' }}
        >
          {/* Smartphone Physical Bezel (Titanium Shadow & Curved Corners) */}
          <div className="relative w-[380px] h-[780px] rounded-[52px] bg-gradient-to-b from-[#2e2b28] via-[#1a1816] to-[#0e0c0b] p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_0_1px_rgba(255,255,255,0.1),0_0_40px_rgba(234,88,12,0.15)] border-4 border-[#3d3732]">
            {/* Hardware Side Buttons */}
            <div className="absolute -left-[7px] top-28 w-[3px] h-10 bg-[#4a433c] rounded-l-sm" />
            <div className="absolute -left-[7px] top-42 w-[3px] h-14 bg-[#4a433c] rounded-l-sm" />
            <div className="absolute -left-[7px] top-60 w-[3px] h-14 bg-[#4a433c] rounded-l-sm" />
            <div className="absolute -right-[7px] top-36 w-[3px] h-20 bg-[#4a433c] rounded-r-sm" />

            {/* Inner Glass Display */}
            <div className="relative w-full h-full rounded-[42px] bg-[#120b06] overflow-hidden flex flex-col border border-stone-800 text-[#ffedd7] select-none">
              {/* Dynamic Island / Speaker Notch Bar */}
              <div className="relative z-50 pt-2 px-6 flex items-center justify-between text-[11px] font-mono text-stone-300 bg-[#120b06]">
                <span className="font-bold">{currentTime}</span>

                {/* Dynamic Island Pill */}
                <div className="w-24 h-5 rounded-full bg-black flex items-center justify-center gap-1.5 px-2 border border-stone-800 shadow-inner">
                  <div className="size-2 rounded-full bg-[#181818] border border-stone-700" />
                  <div className="size-1 rounded-full bg-cyan-900" />
                </div>

                <div className="flex items-center gap-1.5 text-stone-300">
                  <Signal className="size-3" />
                  <Wifi className="size-3" />
                  <Battery className="size-3.5 text-emerald-400" />
                </div>
              </div>

              {/* In-App OTA Update Notification Banner */}
              <AnimatePresence>
                {showOtaBanner && !otaUpdated && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 px-3 py-1.5 text-white text-[11px] font-mono flex items-center justify-between shrink-0 shadow-md z-40"
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <BellRing className="size-3 shrink-0 animate-bounce" />
                      <span className="font-bold">v1.2.1 OTA Available</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOtaUpdated(true)}
                      className="px-2 py-0.5 rounded bg-white text-orange-900 font-bold text-[10px] uppercase hover:bg-orange-100 transition-colors cursor-pointer shrink-0"
                    >
                      Update ➔
                    </button>
                  </motion.div>
                )}
                {otaUpdated && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="bg-emerald-700 px-3 py-1 text-white text-[10px] font-mono flex items-center justify-center gap-1.5 shrink-0 z-40"
                  >
                    <CheckCircle2 className="size-3" />
                    <span>App Updated to v1.2.1 (Build 121)</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* In-Phone App Content Viewport (Scrollable) */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {/* 1. ROLE: 108 AMBULANCE PARAMEDIC */}
                {activeRole === 'AMBULANCE' && (
                  <div className="space-y-4 text-left">
                    {/* Role Header Banner */}
                    <div className="flex items-center justify-between border-b border-[#40372e]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-orange-500/20 text-[#ea580c] flex items-center justify-center">
                          <Truck className="size-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold font-mono text-[#ffedd7]">AMB-108-JH-44</div>
                          <div className="text-[10px] text-stone-400">Paramedic: Rajesh Toppo</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                        EN ROUTE (NH-33)
                      </span>
                    </div>

                    {/* Patient Header */}
                    <div className="p-3 rounded-xl bg-[#1c120a] border border-[#40372e] space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-stone-200">Ravi Kumar (M, 38)</span>
                        <span className={`font-bold px-1.5 py-0.2 rounded text-[10px] ${
                          severityScore >= 80 ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-orange-500/20 text-orange-400'
                        }`}>
                          SEVERITY: {severityScore}/100
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400">Accident Blackspot #14 · GT Road Intersection</p>
                    </div>

                    {/* Interactive Telemetry Sliders */}
                    <div className="p-3 rounded-xl bg-black/40 border border-[#40372e] space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between text-[11px] font-bold text-[#ea580c]">
                        <span className="flex items-center gap-1">
                          <Sliders className="size-3" />
                          TRAUMA VITALS TELEMETRY
                        </span>
                        <span className="text-[10px] text-stone-400">REAL-TIME</span>
                      </div>

                      {/* GCS Slider */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-stone-300">Glasgow Coma (GCS):</span>
                          <span className="font-bold text-amber-300">{gcs} / 15 {gcs <= 8 ? '(Severe Coma)' : ''}</span>
                        </div>
                        <input
                          type="range"
                          min="3"
                          max="15"
                          value={gcs}
                          onChange={(e) => setGcs(Number(e.target.value))}
                          className="w-full accent-[#ea580c] cursor-pointer"
                        />
                      </div>

                      {/* SpO2 Slider */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-stone-300">Oxygen Saturation (SpO2):</span>
                          <span className={`font-bold ${spo2 < 90 ? 'text-red-400 animate-pulse' : 'text-emerald-400'}`}>
                            {spo2}% {spo2 < 90 ? '(Hypoxia Alert)' : ''}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="70"
                          max="100"
                          value={spo2}
                          onChange={(e) => setSpo2(Number(e.target.value))}
                          className="w-full accent-rose-500 cursor-pointer"
                        />
                      </div>

                      {/* Blood Pressure & Heart Rate */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <span className="text-[10px] text-stone-400 block">Systolic BP</span>
                          <input
                            type="range"
                            min="70"
                            max="160"
                            value={systolic}
                            onChange={(e) => setSystolic(Number(e.target.value))}
                            className="w-full accent-orange-400 cursor-pointer"
                          />
                          <span className="text-[11px] font-bold text-stone-200">{systolic} mmHg</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-stone-400 block">Heart Rate</span>
                          <input
                            type="range"
                            min="50"
                            max="170"
                            value={heartRate}
                            onChange={(e) => setHeartRate(Number(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                          <span className="text-[11px] font-bold text-stone-200">{heartRate} BPM</span>
                        </div>
                      </div>
                    </div>

                    {/* Swiggy-Style Road Map Guidance Card */}
                    <div className="p-3 rounded-xl bg-[#1c120a] border border-[#40372e] space-y-2 font-mono">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-300 flex items-center gap-1.5 font-bold">
                          <MapPin className="size-3 text-[#ea580c]" />
                          Destination: RIMS Ranchi
                        </span>
                        <span className="text-orange-400 font-bold">14.2 km · 18 min</span>
                      </div>
                      <div className="p-2 rounded-lg bg-black/60 border border-stone-800 text-[11px] text-stone-300">
                        Turn left in 400m onto NH-33 Expressway. Traffic light corridor cleared.
                      </div>
                    </div>

                    {/* Green Wave Preemption Siren Button */}
                    <button
                      type="button"
                      onClick={() => setGreenWaveActive((v) => !v)}
                      className={`w-full py-3 px-3 rounded-xl font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                        greenWaveActive
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-pulse'
                          : 'bg-[#ea580c] hover:bg-orange-500 text-white'
                      }`}
                    >
                      <Radio className="size-4" />
                      <span>{greenWaveActive ? '108 GREEN WAVE ACTIVE (DELAY: 0 MIN)' : 'ACTIVATE 108 GREEN WAVE SIREN'}</span>
                    </button>

                    {/* Trauma Bay Pre-Alert Button */}
                    <button
                      type="button"
                      onClick={() => setTraumaPreAlerted(true)}
                      disabled={traumaPreAlerted}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                        traumaPreAlerted
                          ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 cursor-default'
                          : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-stone-300'
                      }`}
                    >
                      <CheckCircle2 className="size-4" />
                      <span>{traumaPreAlerted ? 'TRAUMA BAY 02 LOCKED & PRE-ALERTED' : 'PRE-ALERT RIMS TRAUMA BAY'}</span>
                    </button>
                  </div>
                )}

                {/* 2. ROLE: ED BEDSIDE TRIAGE NURSE */}
                {activeRole === 'NURSE' && (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between border-b border-[#40372e]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                          <HeartPulse className="size-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold font-mono text-[#ffedd7]">ED TRIAGE DESK</div>
                          <div className="text-[10px] text-stone-400">RIMS Ranchi · Trauma Bay</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">
                        4 IN QUEUE
                      </span>
                    </div>

                    {/* Bed Capacity Lock Panel */}
                    <div className="p-3 rounded-xl bg-[#1c120a] border border-[#40372e] space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-stone-200">Trauma Bay Bed Lock:</span>
                        <span className="text-rose-400 font-bold">{lockedBed || 'NONE LOCKED'}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                        <button
                          type="button"
                          onClick={() => setLockedBed('TRAUMA-BAY-01')}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            lockedBed === 'TRAUMA-BAY-01'
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-black/40 border-[#40372e] text-stone-300 hover:bg-stone-900'
                          }`}
                        >
                          Bay 01 (Ventilator)
                        </button>
                        <button
                          type="button"
                          onClick={() => setLockedBed('ICU-BED-04')}
                          className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                            lockedBed === 'ICU-BED-04'
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-black/40 border-[#40372e] text-stone-300 hover:bg-stone-900'
                          }`}
                        >
                          ICU Bed 04 (Resus)
                        </button>
                      </div>
                    </div>

                    {/* Patient Queue Cards */}
                    <div className="space-y-2 font-mono">
                      <span className="text-[10px] uppercase text-stone-400 block">PRIORITY TRIAGE QUEUE:</span>

                      <div className="p-2.5 rounded-xl bg-black/40 border border-red-500/40 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-red-400">#1 AMB-108-JH-44 (ETA 18m)</span>
                          <span className="text-[10px] bg-red-500/20 px-1.5 py-0.5 rounded text-red-300">CRITICAL 92</span>
                        </div>
                        <p className="text-[11px] text-stone-300">Ravi Kumar (38M) · GCS 9 · SpO2 86%</p>
                      </div>

                      <div className="p-2.5 rounded-xl bg-black/40 border border-orange-500/40 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold">
                          <span className="text-orange-400">#2 Priya Soren (29F)</span>
                          <span className="text-[10px] bg-orange-500/20 px-1.5 py-0.5 rounded text-orange-300">URGENT 74</span>
                        </div>
                        <p className="text-[11px] text-stone-300">Respiratory Distress · SpO2 91%</p>
                      </div>
                    </div>

                    {/* Urgent Shortage Report Button */}
                    <button
                      type="button"
                      onClick={() => setShortageReported(true)}
                      className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                        shortageReported
                          ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                          : 'bg-[#28180d] hover:bg-[#382416] border-orange-500/30 text-orange-200'
                      }`}
                    >
                      <AlertTriangle className="size-4" />
                      <span>{shortageReported ? 'O-NEG BLOOD SHORTAGE REPORTED TO SUPT' : 'REPORT URGENT MEDICAL SHORTAGE'}</span>
                    </button>
                  </div>
                )}

                {/* 3. ROLE: MEDICAL SUPERINTENDENT */}
                {activeRole === 'SUPERINTENDENT' && (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between border-b border-[#40372e]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                          <Building2 className="size-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold font-mono text-[#ffedd7]">HOSPITAL COMMAND</div>
                          <div className="text-[10px] text-stone-400">RIMS Ranchi · 1,500 Beds</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                        88% LOAD
                      </span>
                    </div>

                    {/* Capacity Overview */}
                    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-[#40372e]">
                        <span className="text-[10px] text-stone-400 block">TOTAL OCCUPIED</span>
                        <span className="text-base font-bold text-stone-100">1,320 / 1,500</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-[#40372e]">
                        <span className="text-[10px] text-stone-400 block">ICU VENTILATORS</span>
                        <span className="text-base font-bold text-orange-400">112 / 120 (93%)</span>
                      </div>
                    </div>

                    {/* Specialist Duty Roster */}
                    <div className="p-3 rounded-xl bg-[#1c120a] border border-[#40372e] space-y-2 font-mono text-xs">
                      <span className="text-[10px] uppercase text-stone-400 block font-bold">SURGICAL SPECIALISTS:</span>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-300">Dr. S. K. Roy (Trauma)</span>
                        <span className="text-emerald-400 font-bold text-[10px]">READY IN BAY</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-300">Dr. M. Tirkey (Neuro)</span>
                        <span className="text-amber-400 font-bold text-[10px]">OCCUPIED IN OT-2</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-300">Dr. A. Verma (Anesthesia)</span>
                        <span className="text-cyan-400 font-bold text-[10px]">ON-CALL RESUS</span>
                      </div>
                    </div>

                    {/* Hospital ERP Gateway Sync Button */}
                    <div className="p-3 rounded-xl bg-black/40 border border-[#40372e] space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-300">FINANCIAL ERP GATEWAY</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {erpSyncStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-400">Synchronized with NIC e-Hospital & ABDM NHCX.</p>
                      <button
                        type="button"
                        onClick={() => {
                          setErpSyncStatus('SYNCING')
                          setTimeout(() => setErpSyncStatus('SYNCED'), 1200)
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 border border-[#40372e] text-xs font-bold text-stone-200 transition-colors cursor-pointer flex items-center justify-center gap-2"
                      >
                        <RefreshCw className={`size-3 text-amber-400 ${erpSyncStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
                        <span>{erpSyncStatus === 'SYNCING' ? 'Synchronizing Budgets...' : 'Sync Hospital ERP Now'}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 4. ROLE: DISTRICT CMO */}
                {activeRole === 'CMO' && (
                  <div className="space-y-4 text-left">
                    <div className="flex items-center justify-between border-b border-[#40372e]/60 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                          <Activity className="size-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold font-mono text-[#ffedd7]">DISTRICT CMO DESK</div>
                          <div className="text-[10px] text-stone-400">Ranchi District · 24 Facilities</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                        DISTRICT SCOPE
                      </span>
                    </div>

                    {/* District Metrics */}
                    <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-[#40372e]">
                        <span className="text-[10px] text-stone-400 block">CASUALTY LOAD</span>
                        <span className="text-base font-bold text-orange-400">142 Cases / 24h</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-[#40372e]">
                        <span className="text-[10px] text-stone-400 block">CONTINGENCY POOL</span>
                        <span className="text-base font-bold text-emerald-400">₹48.5 Lakhs</span>
                      </div>
                    </div>

                    {/* Pending Transfer Authorization Card */}
                    <div className="p-3 rounded-xl bg-[#1c120a] border border-[#40372e] space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-200">DIJKSTRA TRANSFER QUEUE</span>
                        <span className="text-[10px] text-amber-400">1 PENDING</span>
                      </div>
                      <p className="text-[11px] text-stone-300">
                        Sadar Hospital Ranchi ➔ RIMS Ranchi (Polytrauma, requires urgent neurosurgical OT)
                      </p>
                      <button
                        type="button"
                        onClick={() => setTransferApproved(true)}
                        disabled={transferApproved}
                        className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          transferApproved
                            ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 cursor-default'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        <CheckCircle2 className="size-3.5" />
                        <span>{transferApproved ? 'TRANSFER OFFICIALLY AUTHORIZED' : 'AUTHORIZE 108 INTER-FACILITY TRANSFER'}</span>
                      </button>
                    </div>

                    {/* Emergency Contingency Grant Release */}
                    <button
                      type="button"
                      onClick={() => setEmergencyGrantApproved(true)}
                      disabled={emergencyGrantApproved}
                      className={`w-full py-2.5 px-3 rounded-xl font-mono text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        emergencyGrantApproved
                          ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                          : 'bg-stone-900 hover:bg-stone-800 border-stone-700 text-stone-300'
                      }`}
                    >
                      <span>{emergencyGrantApproved ? '₹12.0L EMERGENCY GRANT DISBURSED TO RIMS' : 'RELEASE ₹12.0L CONTINGENCY GRANT'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* In-Phone Bottom Home Bar */}
              <div className="py-2 flex items-center justify-center bg-[#120b06] border-t border-stone-900 shrink-0">
                <div className="w-32 h-1 bg-stone-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* "How to Test on PC" Guide Modal */}
      <AnimatePresence>
        {showGuideModal && (
          <div className="fixed inset-0 z-[100] backdrop-blur-md bg-black/70 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-w-xl w-full bg-[#181009] border border-[#40372e] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-left"
            >
              <div className="flex items-center justify-between border-b border-[#40372e]/60 pb-3">
                <div className="flex items-center gap-2.5">
                  <Smartphone className="size-5 text-[#ea580c]" />
                  <h3 className="text-base font-bold text-[#ffedd7] uppercase">How to Test the Mobile App on PC</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="size-8 rounded-lg bg-stone-900 hover:bg-stone-800 flex items-center justify-center text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs font-mono text-stone-300 leading-relaxed">
                <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/30 space-y-1">
                  <span className="font-bold text-orange-400 block">METHOD 1: THIS IN-BROWSER SIMULATOR (ZERO RISK)</span>
                  <p className="text-stone-300">
                    You do not need any Android emulator or software install! You can test all 4 role interfaces (108 Paramedic,
                    Nurse, Superintendent, CMO) right on this page with your mouse.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-[#40372e] space-y-1">
                  <span className="font-bold text-emerald-400 block">METHOD 2: FLUTTER WEB (RUN IN CHROME)</span>
                  <p className="text-stone-300">
                    If you have the Flutter SDK installed on your PC, you can run the Flutter app natively in Google Chrome:
                  </p>
                  <div className="p-2 rounded bg-black border border-stone-800 font-mono text-orange-300 text-[11px] select-all">
                    cd mobile<br />
                    flutter run -d chrome
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-[#40372e] space-y-1">
                  <span className="font-bold text-cyan-400 block">METHOD 3: FLUTTER WINDOWS DESKTOP</span>
                  <p className="text-stone-300">
                    Run the Flutter app as a native Windows desktop executable (.exe) on your PC:
                  </p>
                  <div className="p-2 rounded bg-black border border-stone-800 font-mono text-orange-300 text-[11px] select-all">
                    cd mobile<br />
                    flutter run -d windows
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowGuideModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#ea580c] hover:bg-orange-500 text-white font-bold text-xs cursor-pointer shadow"
                >
                  Got It, Continue Testing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
