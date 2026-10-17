'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Download,
  Smartphone,
  ShieldCheck,
  QrCode,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Cpu,
  Layers,
  Truck,
  HeartPulse,
  Building2,
  Activity,
  FileCheck2,
  Copy,
  Check,
  ChevronRight,
  WifiOff,
  BellRing,
} from 'lucide-react'

interface VersionData {
  latestVersion: string
  buildNumber: number
  releaseDate: string
  apkDownloadUrl: string
  apkSizeMb: number
  sha256Checksum: string
  releaseHighlights: string[]
  roleInterfaces: Record<string, { role: string; features: string[] }>
}

export default function DownloadsPage() {
  const [versionData, setVersionData] = useState<VersionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copiedSha, setCopiedSha] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [lanIp, setLanIp] = useState('192.168.31.173')
  const [qrMode, setQrMode] = useState<'LAN' | 'HOST'>('LAN')
  const [activeRoleTab, setActiveRoleTab] = useState<'AMBULANCE' | 'NURSE' | 'SUPERINTENDENT' | 'CMO'>('AMBULANCE')

  useEffect(() => {
    fetch('/api/app/version')
      .then((res) => res.json())
      .then((data) => {
        setVersionData(data)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load version data', err)
        setLoading(false)
      })
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSha(true)
    setTimeout(() => setCopiedSha(false), 3000)
  }

  const copyDownloadUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 3000)
  }

  const effectiveApkUrl = qrMode === 'LAN'
    ? `http://${lanIp}:3000/downloads/triagenet-companion-v1.2.0.apk`
    : typeof window !== 'undefined'
    ? `${window.location.origin}/downloads/triagenet-companion-v1.2.0.apk`
    : `http://${lanIp}:3000/downloads/triagenet-companion-v1.2.0.apk`

  const roleDetails = {
    AMBULANCE: {
      title: '108 Ambulance EMT & Paramedic Crew',
      badge: 'Field Operations',
      icon: Truck,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
      description:
        'Tactile, high-contrast paramedic terminal optimized for moving ambulances. Enables in-transit patient trauma telemetry, GPS road navigation, 1-touch Green Wave traffic siren preemption, and direct trauma bay pre-alerting.',
      features: [
        'Real-time vitals entry (GCS 3-15 slider, SpO2 % hypoxia monitor, Systolic BP, Heart Rate)',
        'Swiggy/Domino’s style road-snapped navigation along NH-33, GT Road, and expressways',
        '108 Green Wave traffic signal preemption clearing highway congestion to 0 mins',
        'Trauma Bay arrival pre-alert with 1-touch patient transfer token generation',
        'Offline emergency queuing when traversing low-connectivity rural Jharkhand blocks',
      ],
      quickLink: '/ambulance',
      quickLabel: 'Test Paramedic Web Interface ➔',
    },
    NURSE: {
      title: 'Emergency Department Bedside Triage Nurse',
      badge: 'Clinical Care',
      icon: HeartPulse,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
      description:
        'Rapid intake terminal designed for rapid casualty triage at hospital trauma bays. Computes real-time ML Acuity Scores, confirms bed locks, and triggers local ward shortage notifications.',
      features: [
        'Instant patient registration via camera QR scan or manual clinical entry',
        'Hand-implemented Logistic Regression SeverityScorer (0–100 acuity scale)',
        'Trauma Bay and ICU bed reservation locking before patient physically arrives',
        'Urgent medical shortage reporting directly to the hospital superintendent',
      ],
      quickLink: '/dashboard',
      quickLabel: 'Open Clinical Triage Console ➔',
    },
    SUPERINTENDENT: {
      title: 'Medical Superintendent & Facility Admin',
      badge: 'Institutional Command',
      icon: Building2,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      description:
        'Hospital operational command center. Monitor department occupancy, ICU ventilators, on-duty surgical specialist rosters, and bidirectional financial ERP synchronization.',
      features: [
        'Real-time ward census and ICU capacity meters across 24/7 shifts',
        'Surgical specialist duty roster status (READY IN BAY vs OCCUPIED IN OT)',
        'Emergency GeM procurement requisition submission with budget tracking',
        'Hospital Financial ERP Gateway sync (NIC e-Hospital, ABDM, SAP IS-H, Tally)',
      ],
      quickLink: '/dashboard',
      quickLabel: 'Open Superintendent Console ➔',
    },
    CMO: {
      title: 'District Chief Medical Officer (CMO)',
      badge: 'District Governance',
      icon: Activity,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      description:
        'Macro district oversight terminal across all community health centers and sub-divisional hospitals. Authorizes inter-facility transfers and releases emergency contingency grant reserves.',
      features: [
        'District-wide casualty heatmap and highway accident blackspot tracking',
        'Intelligent Dijkstra cross-district patient transfer authorization',
        'Emergency Contingency Pool grant release to financially stressed facilities',
        'GeM bulk medical supply procurement oversight and reallocation',
      ],
      quickLink: '/dashboard',
      quickLabel: 'Open District CMO View ➔',
    },
  }

  const currentRole = roleDetails[activeRoleTab]
  const RoleIcon = currentRole.icon

  return (
    <div className="min-h-screen bg-[#100904] text-[#ffedd7] font-sans selection:bg-[#ea580c] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-dashed border-[#40372e]/60 bg-[#100904]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative size-8 overflow-hidden rounded-lg shadow-sm border border-[#491205] bg-[#491205] group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/triagenet-logo.png"
                alt="TriageNet Official Logo"
                width={32}
                height={32}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div>
              <span className="text-xs md:text-sm font-bold uppercase text-[#ffedd7] tracking-wider font-mono">
                TRIAGENET
              </span>
              <span className="text-[10px] text-[#dc5000] block font-mono">MOBILE COMPANION PORTAL</span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs font-mono">
            <Link href="/dashboard" className="text-stone-400 hover:text-[#ffedd7] transition-colors hidden sm:block">
              STATE DASHBOARD
            </Link>
            <Link href="/control" className="text-stone-400 hover:text-[#ffedd7] transition-colors hidden sm:block">
              DIRECTOR CONTROL
            </Link>
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-lg bg-[#382416] hover:bg-[#491205] text-[#ffedd7] font-bold transition-all border border-[#ea580c]/30 flex items-center gap-1.5"
            >
              <span>LAUNCH WEB CONSOLE</span>
              <ArrowRight className="size-3 text-[#ea580c]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Downloads Section */}
      <section className="relative px-6 pt-16 pb-20 border-b border-dashed border-[#40372e]">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: APK Download & Core Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ea580c]/10 border border-[#ea580c]/30 text-xs font-mono text-[#ea580c]">
                <Smartphone className="size-3.5 animate-pulse" />
                <span>OFFICIAL ANDROID COMPANION RELEASE</span>
                <span className="size-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-emerald-400 font-bold">STABLE V{versionData?.latestVersion || '1.2.0'}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#ffedd7] uppercase leading-[1.05]">
                UNIFIED COMPANION APP <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea580c] via-orange-400 to-amber-300">
                  FOR STATEWIDE EMERGENCY CARE.
                </span>
              </h1>

              <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
                Single unified Flutter application tailored for all emergency healthcare workers across Jharkhand’s 24
                districts. Features dynamic role-based login auto-redirection for 108 Paramedics, Triage Nurses, Hospital
                Superintendents, and District CMOs with in-transit vital telemetry, Swiggy-style road navigation, and
                automatic in-app OTA update notifications.
              </p>

              {/* Action Buttons: Android APK & iOS */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* 1. Android APK Download */}
                <a
                  href="/downloads/triagenet-companion-v1.2.0.apk"
                  download="triagenet-companion-v1.2.0.apk"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#ea580c] to-[#c2410c] hover:from-orange-500 hover:to-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-950/40 flex items-center gap-3 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <Download className="size-5 shrink-0" />
                  <div className="text-left">
                    <span className="block leading-none">DOWNLOAD APK FOR ANDROID</span>
                    <span className="text-[10px] text-orange-200 font-mono font-normal block mt-1">
                      v{versionData?.latestVersion || '1.2.0'} · {versionData?.apkSizeMb ? `${versionData.apkSizeMb} MB` : 'Direct APK'} (Android 5.0+)
                    </span>
                  </div>
                </a>

                {/* 2. Download for iOS */}
                <a
                  href="/downloads/triagenet-companion-v1.2.0.ipa"
                  download="triagenet-companion-v1.2.0.ipa"
                  className="px-5 py-3.5 rounded-xl bg-[#20140c] hover:bg-[#2e1d11] text-[#ffedd7] font-semibold text-sm border border-[#40372e] hover:border-amber-500/50 flex items-center gap-3 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  <svg viewBox="0 0 24 24" className="size-5 fill-current text-white shrink-0">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.84c.64-.78 1.08-1.86.96-2.94-1 .04-2.17.65-2.83 1.43-.58.67-1.09 1.77-.95 2.83 1.12.09 2.18-.54 2.82-1.32z" />
                  </svg>
                  <div className="text-left">
                    <span className="block leading-none">DOWNLOAD FOR IOS</span>
                    <span className="text-[10px] text-stone-400 font-mono font-normal block mt-1">
                      v{versionData?.latestVersion || '1.2.0'} · 22.1 MB (Direct IPA)
                    </span>
                  </div>
                </a>

                {/* 3. Test on PC Simulator */}
                <Link
                  href="/simulator"
                  className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-stone-900 via-[#2c1a0f] to-stone-900 hover:from-black hover:to-[#382416] text-[#ffedd7] font-semibold text-sm border border-orange-500/40 flex items-center gap-2.5 transition-all cursor-pointer shadow-md hover:scale-[1.02]"
                >
                  <Smartphone className="size-4 text-[#ea580c] animate-pulse shrink-0" />
                  <div className="text-left">
                    <span className="block leading-none">TEST ON PC (NO PHONE NEEDED)</span>
                    <span className="text-[10px] text-orange-300 font-mono font-normal block mt-1">
                      Interactive Device Simulator ➔
                    </span>
                  </div>
                </Link>
              </div>

              {/* System Specs Pill Strip */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-stone-400 pt-3 border-t border-dashed border-[#40372e]/60">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                  Cryptographically Signed Build
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="size-3.5 text-orange-400" />
                  Android 8.0+ / iOS 15+ Compatible
                </span>
                <span className="flex items-center gap-1.5">
                  <WifiOff className="size-3.5 text-cyan-400" />
                  Offline Rural Block Queue
                </span>
                <span className="flex items-center gap-1.5">
                  <BellRing className="size-3.5 text-amber-400" />
                  In-App OTA Auto-Updates
                </span>
              </div>
            </div>

            {/* Right Column: Real Camera-Scannable QR Scan & Integrity Verification Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-dashed border-[#40372e] bg-[#181009]/80 p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-[#40372e]/60 pb-4">
                  <div className="flex items-center gap-2.5">
                    <QrCode className="size-5 text-[#ea580c]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-[#ffedd7]">
                      SCAN TO INSTALL ON MOBILE
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    REAL QR SCANNER READY
                  </span>
                </div>

                {/* Real Camera-Scannable QR Code Frame */}
                <div className="flex flex-col items-center justify-center p-5 bg-white rounded-xl shadow-inner text-stone-900">
                  <div className="relative size-48 flex items-center justify-center p-1 bg-white">
                    {/* Real 100% Camera-Scannable QR Code */}
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=6&data=${encodeURIComponent(
                        effectiveApkUrl
                      )}`}
                      alt="Real Camera Scannable QR Code for Direct APK Download"
                      className="size-full rounded-md object-contain"
                    />
                  </div>
                  <p className="text-[11px] font-mono text-stone-800 font-bold mt-2 text-center">
                    Scan with any phone camera to download APK directly
                  </p>
                </div>

                {/* Wi-Fi LAN Host Settings for Phone Scanners */}
                <div className="p-3 rounded-xl bg-black/40 border border-[#40372e] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-300">
                    <span className="text-[#ea580c] font-bold">WI-FI SCAN TARGET:</span>
                    <button
                      type="button"
                      onClick={() => copyDownloadUrl(effectiveApkUrl)}
                      className="text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      <span>{copiedLink ? 'COPIED LINK!' : 'COPY URL'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={lanIp}
                      onChange={(e) => setLanIp(e.target.value)}
                      placeholder="e.g. 192.168.31.173"
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-stone-900 border border-[#40372e] text-xs font-mono text-orange-200 focus:outline-none focus:border-[#ea580c]"
                    />
                    <button
                      type="button"
                      onClick={() => setQrMode(qrMode === 'LAN' ? 'HOST' : 'LAN')}
                      className={`px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold border cursor-pointer transition-colors ${
                        qrMode === 'LAN'
                          ? 'bg-[#ea580c] text-white border-[#ea580c]'
                          : 'bg-stone-800 text-stone-300 border-stone-600'
                      }`}
                    >
                      {qrMode === 'LAN' ? 'WI-FI LAN' : 'LOCALHOST'}
                    </button>
                  </div>
                  <p className="text-[10px] font-mono text-stone-400 leading-tight">
                    * Phone & PC must be on the same Wi-Fi. Scans target: <span className="text-stone-200 break-all">{effectiveApkUrl}</span>
                  </p>
                </div>

                {/* Cryptographic SHA-256 Checksum Card */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-400">
                    <span>SHA-256 INTEGRITY HASH:</span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(versionData?.sha256Checksum || '')}
                      className="text-[#ea580c] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSha ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                      <span>{copiedSha ? 'COPIED!' : 'COPY HASH'}</span>
                    </button>
                  </div>
                  <div className="p-2.5 rounded-lg bg-black/50 border border-[#40372e] text-[10px] font-mono text-stone-300 break-all select-all">
                    {versionData?.sha256Checksum || '910dc91c787009dae1247e09c5c4228ce8456557b99413b3d80f985df507e434'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Dynamic Redirection Showcase */}
      <section className="px-6 py-20 border-b border-dashed border-[#40372e]">
        <div className="mx-auto max-w-7xl space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-[#ea580c]">
              * SINGLE MONOREPO · MULTI-ROLE ADAPTIVE UI
            </span>
            <h2 className="text-2xl sm:text-4xl font-medium uppercase tracking-tight text-[#ffedd7]">
              ONE APP. FOUR DESIGNATED HEALTHCARE INTERFACES.
            </h2>
            <p className="text-stone-400 text-sm leading-relaxed">
              Upon login, TriageNet inspects the officer’s cryptographic credentials and instantly switches the Flutter
              viewport to their authorized operational role.
            </p>
          </div>

          {/* Role Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {(['AMBULANCE', 'NURSE', 'SUPERINTENDENT', 'CMO'] as const).map((key) => {
              const tab = roleDetails[key]
              const Icon = tab.icon
              const isSelected = activeRoleTab === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveRoleTab(key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 cursor-pointer border ${
                    isSelected
                      ? 'bg-[#382416] text-[#ffedd7] border-[#ea580c] shadow-md shadow-orange-950/20'
                      : 'bg-[#181009] text-stone-400 border-[#40372e] hover:text-[#ffedd7] hover:bg-[#20140c]'
                  }`}
                >
                  <Icon className="size-4 text-[#ea580c]" />
                  <span>{tab.badge}</span>
                </button>
              )
            })}
          </div>

          {/* Active Role Feature Display Card */}
          <div className="rounded-2xl border border-dashed border-[#40372e] bg-[#181009]/90 p-8 lg:p-12 shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${currentRole.color}`}>
                    <RoleIcon className="size-6 text-[#ea580c]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[#ea580c] uppercase font-bold tracking-wider">
                      {currentRole.badge} INTERFACE
                    </span>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#ffedd7]">{currentRole.title}</h3>
                  </div>
                </div>

                <p className="text-stone-300 text-sm leading-relaxed">{currentRole.description}</p>

                <div className="space-y-2.5 pt-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-stone-400 block">
                    SPECIALIZED CAPABILITIES:
                  </span>
                  {currentRole.features.map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-stone-200">
                      <CheckCircle2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Link
                    href={currentRole.quickLink}
                    className="inline-flex items-center gap-2 text-xs font-mono font-bold text-[#ea580c] hover:underline"
                  >
                    <span>{currentRole.quickLabel}</span>
                  </Link>
                </div>
              </div>

              {/* Mockup Frame Preview */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-64 h-[440px] rounded-[36px] border-4 border-stone-800 bg-[#120b06] shadow-2xl p-4 flex flex-col justify-between overflow-hidden">
                  {/* Top Phone Notch */}
                  <div className="flex justify-between items-center px-2 pt-1 text-[10px] font-mono text-stone-400">
                    <span>09:41</span>
                    <div className="w-16 h-3.5 bg-stone-900 rounded-full mx-auto"></div>
                    <span>5G 100%</span>
                  </div>

                  {/* Screen Content Simulation */}
                  <div className="my-auto space-y-3 p-2">
                    <div className="size-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[#ea580c] mx-auto">
                      <RoleIcon className="size-5" />
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-mono text-[#ea580c] block uppercase font-bold">
                        {currentRole.badge}
                      </span>
                      <strong className="text-xs text-white block mt-0.5">{currentRole.title}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-stone-900/80 border border-stone-800 text-[9px] font-mono text-stone-300 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-500">DISTRICT:</span>
                        <span className="text-emerald-400 font-bold">Ranchi Central</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">SECURITY:</span>
                        <span className="text-orange-400 font-bold">AES-256 + TOTP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">TELEMETRY:</span>
                        <span className="text-cyan-400 font-bold">LIVE BROADCAST</span>
                      </div>
                    </div>
                    <div className="w-full py-2 rounded-lg bg-orange-600 text-center text-[10px] font-bold text-white shadow-xs">
                      ACTIVE SESSION
                    </div>
                  </div>

                  {/* Bottom Home Indicator */}
                  <div className="w-24 h-1 bg-stone-700 rounded-full mx-auto mb-1"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* In-App OTA Update Engine Documentation */}
      <section className="px-6 py-20 border-b border-dashed border-[#40372e]">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#40372e]/60 pb-6">
            <div>
              <span className="text-xs font-mono text-[#ea580c] uppercase font-bold tracking-wider">
                * CONTINUOUS DELIVERY & COMPLIANCE
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium uppercase text-[#ffedd7]">
                IN-APP OTA AUTO-UPDATE ENGINE
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
              <RefreshCw className="size-3.5 animate-spin" />
              <span>OTA Endpoint Live (/api/app/version)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-dashed border-[#40372e] bg-[#181009]/60 space-y-3">
              <div className="size-8 rounded-lg bg-orange-500/20 text-[#ea580c] flex items-center justify-center">
                <BellRing className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-[#ffedd7]">1. Background Polling</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                Companion app queries the State Health Command version server every 4 hours. Checks package build
                signatures and determines if mandatory security patches or highway blackspots have been published.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-dashed border-[#40372e] bg-[#181009]/60 space-y-3">
              <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileCheck2 className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-[#ffedd7]">2. High-Priority In-App Banner</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                When an update is detected, an unobtrusive banner slides in displaying clinical changelogs and time savings.
                Users can upgrade instantly with 1-click in the field without losing queued vitals.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-dashed border-[#40372e] bg-[#181009]/60 space-y-3">
              <div className="size-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <WifiOff className="size-4" />
              </div>
              <h3 className="text-sm font-bold text-[#ffedd7]">3. Offline Rural Block Resilience</h3>
              <p className="text-xs text-stone-400 leading-relaxed">
                If ambulances lose mobile coverage in deep valleys or forested ghats, the app caches patient telemetry
                locally in SQLite/Drift, deferring OTA polling until cellular telemetry is re-established.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 text-center text-xs text-stone-500 font-mono">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>TRIAGENET GOV JHARKHAND EMERGENCY HEALTHCARE INITIATIVE</span>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[#ffedd7] transition-colors">
              HOME
            </Link>
            <Link href="/dashboard" className="hover:text-[#ffedd7] transition-colors">
              DASHBOARD
            </Link>
            <Link href="/ambulance" className="hover:text-[#ffedd7] transition-colors">
              108 AMBULANCE
            </Link>
            <a
              href="https://github.com/PG300604/TriageNet"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#ffedd7] transition-colors text-[#ea580c]"
            >
              GITHUB REPO
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
