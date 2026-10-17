'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  Download,
  Smartphone,
  Shield,
  ArrowRight,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  HeartPulse,
  Activity,
  Hospital,
  MapPin,
  Clock,
  Layers,
  FileText,
  Search,
  Sparkles,
  QrCode,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react'

export default function CitizenPortalPage() {
  const [searchDistrict, setSearchDistrict] = useState('')

  const emergencyHelplines = [
    {
      number: '108',
      title: '108 Free Emergency Ambulance',
      desc: '24x7 Ambulance Fleet Dispatch for trauma, cardiac, respiratory, and maternal emergencies across all 24 districts.',
      color: 'bg-red-500/10 border-red-500/30 text-red-400',
      tag: 'TOLL-FREE · 24/7',
    },
    {
      number: '104',
      title: '104 Tele-Health & Medical Advice',
      desc: 'Free tele-consultation with registered medical practitioners, anti-venom availability, and mental health counseling.',
      color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      tag: 'PUBLIC HELPLINE',
    },
    {
      number: '112',
      title: '112 Unified Emergency Hotline',
      desc: 'Integrated Police, Fire, and Medical emergency response coordinator for rapid first responder dispatch.',
      color: 'bg-orange-500/10 border-orange-500/30 text-[#ea580c]',
      tag: 'ALL-HAZARDS',
    },
    {
      number: '1800-345-6540',
      title: 'Regional Health Advisory Control Room',
      desc: 'Health advisory desk for epidemic reporting, public health assistance, hospital coordination, and blood bank inquiries.',
      color: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
      tag: 'HEALTH DESK',
    },
  ]

  const majorHospitals = [
    {
      name: 'Rajendra Institute of Medical Sciences (RIMS)',
      district: 'Ranchi',
      type: 'Apex Tertiary Medical College',
      beds: '1,500 Beds',
      icu: '120 ICU Beds',
      status: '24/7 Level 1 Trauma Center',
      helpline: '0651-2541533',
    },
    {
      name: 'MGM Medical College & Hospital',
      district: 'East Singhbhum (Jamshedpur)',
      type: 'Tertiary Medical College',
      beds: '520 Beds',
      icu: '45 ICU Beds',
      status: 'Active Trauma Bay',
      helpline: '0657-2431057',
    },
    {
      name: 'Shaheed Nirmal Mahto Medical College (SNMMCH)',
      district: 'Dhanbad',
      type: 'Tertiary Medical College',
      beds: '480 Beds',
      icu: '40 ICU Beds',
      status: 'Active Trauma Bay',
      helpline: '0326-2203055',
    },
    {
      name: 'Phulo Jhano Medical College & Hospital',
      district: 'Dumka (Santhal Pargana)',
      type: 'Divisional Medical College',
      beds: '300 Beds',
      icu: '25 ICU Beds',
      status: 'Emergency Unit Ready',
      helpline: '06434-222444',
    },
    {
      name: 'Medinirai Medical College & Hospital',
      district: 'Palamu (Daltonganj)',
      type: 'Divisional Medical College',
      beds: '300 Beds',
      icu: '25 ICU Beds',
      status: 'Emergency Unit Ready',
      helpline: '06562-222111',
    },
    {
      name: 'Sheikh Bhikhari Medical College & Hospital',
      district: 'Hazaribagh (North Chotanagpur)',
      type: 'Divisional Medical College',
      beds: '300 Beds',
      icu: '25 ICU Beds',
      status: 'Emergency Unit Ready',
      helpline: '06546-264000',
    },
  ]

  const filteredHospitals = searchDistrict.trim()
    ? majorHospitals.filter(
        (h) =>
          h.district.toLowerCase().includes(searchDistrict.toLowerCase()) ||
          h.name.toLowerCase().includes(searchDistrict.toLowerCase())
      )
    : majorHospitals

  return (
    <div className="min-h-screen bg-[#100904] text-[#ffedd7] font-sans selection:bg-[#ea580c] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-dashed border-[#40372e]/60 bg-[#100904]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative size-8 overflow-hidden rounded-lg shadow-sm border border-[#491205] bg-[#491205] group-hover:scale-105 transition-transform shrink-0">
              <Image
                src="/triagenet-logo.png"
                alt="TriageNet Jharkhand Emergency Healthcare Logo"
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
              <span className="text-[10px] text-[#dc5000] block font-mono">CITIZEN & PUBLIC ACCESS PORTAL</span>
            </div>
          </Link>

          <div className="flex items-center gap-4 text-xs font-mono">
            <Link href="/" className="text-stone-400 hover:text-[#ffedd7] transition-colors hidden sm:block">
              ABOUT
            </Link>
            <Link href="/downloads" className="text-stone-400 hover:text-[#ffedd7] transition-colors hidden sm:block">
              📱 MOBILE APP
            </Link>
            <Link
              href="/dashboard"
              className="px-3.5 py-1.5 rounded-lg bg-[#382416] hover:bg-[#491205] text-[#ffedd7] font-bold transition-all border border-[#ea580c]/30 flex items-center gap-1.5"
            >
              <span>WEB CONSOLE</span>
              <ArrowRight className="size-3 text-[#ea580c]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-16 border-b border-dashed border-[#40372e]">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ea580c]/10 border border-[#ea580c]/30 text-xs font-mono text-[#ea580c]">
            <HeartPulse className="size-3.5 animate-pulse" />
            <span>EMERGENCY HEALTHCARE PROJECT · MODELED FOR JHARKHAND</span>
            <span className="size-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-emerald-400 font-bold">24-DISTRICT ARCHITECTURE</span>
          </div>

          <div className="max-w-4xl space-y-4">
            <h1 className="text-3xl sm:text-5xl font-medium tracking-tight text-[#ffedd7] uppercase leading-[1.08]">
              PUBLIC HEALTHCARE & REGIONAL DISPATCH PORTAL <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ea580c] via-orange-400 to-amber-300">
                APPLICATION RELEASES, APP DOWNLOADS & WEB ACCESS.
              </span>
            </h1>
            <p className="text-stone-300 text-sm sm:text-base leading-relaxed max-w-3xl font-normal">
              An open-source emergency healthcare resource allocation and regional dispatch project modeled for the
              healthcare infrastructure of Jharkhand. Download mobile companion application packages, inspect release
              artifacts, or access the clinical command workstation.
            </p>
          </div>

          {/* 2 Primary Action Gateway Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* 1. Mobile Companion Download Gateway */}
            <div className="rounded-2xl border border-[#40372e] bg-[#181009]/90 p-6 md:p-8 flex flex-col justify-between space-y-6 hover:border-orange-500/50 transition-all shadow-xl group">
              <div className="space-y-3">
                <div className="size-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#ea580c]">
                  <Smartphone className="size-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-orange-400">OFFICIAL RELEASE V1.2.0</span>
                  <h3 className="text-xl font-bold text-[#ffedd7] uppercase">Mobile Companion App</h3>
                </div>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                  Unified Flutter companion designed for 108 Paramedics, ED Triage Nurses, Hospital Superintendents, and District CMOs.
                  Features Swiggy-style road navigation, live trauma telemetry, and automatic in-app OTA update notices.
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#40372e]/60">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Android APK Download */}
                  <a
                    href="/downloads/triagenet-companion-v1.2.0.apk"
                    download="triagenet-companion-v1.2.0.apk"
                    className="py-3 px-4 rounded-xl bg-[#ea580c] hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
                  >
                    <Download className="size-4 shrink-0" />
                    <div className="text-left">
                      <span className="block leading-none">Download APK (Android)</span>
                      <span className="text-[10px] text-orange-200 font-mono font-normal block mt-0.5">v1.2.0 · 18.4 MB</span>
                    </div>
                  </a>

                  {/* iOS IPA Direct Download */}
                  <a
                    href="/downloads/triagenet-companion-v1.2.0.ipa"
                    download="triagenet-companion-v1.2.0.ipa"
                    className="py-3 px-4 rounded-xl bg-[#20140c] hover:bg-[#2e1d11] text-[#ffedd7] font-semibold text-xs border border-[#40372e] hover:border-amber-500/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Download className="size-4 text-white shrink-0" />
                    <div className="text-left">
                      <span className="block leading-none">Download IPA (iOS)</span>
                      <span className="text-[10px] text-stone-400 font-mono font-normal block mt-0.5">v1.2.0 · 22.1 MB</span>
                    </div>
                  </a>
                </div>

                <div className="text-center pt-1">
                  <Link
                    href="/downloads"
                    className="text-xs font-mono text-orange-300 hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <QrCode className="size-3.5 text-[#ea580c]" />
                    <span>Scan Camera QR Code & View Release Hashes ➔</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* 2. Web Workstation Console */}
            <div className="rounded-2xl border border-[#40372e] bg-[#181009]/90 p-6 md:p-8 flex flex-col justify-between space-y-6 hover:border-amber-500/50 transition-all shadow-xl group">
              <div className="space-y-3">
                <div className="size-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Shield className="size-6" />
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-amber-400">CLINICAL & COMMAND INTERFACE</span>
                  <h3 className="text-xl font-bold text-[#ffedd7] uppercase">Clinical Command Workstation</h3>
                </div>
                <p className="text-stone-400 text-xs sm:text-sm leading-relaxed">
                  Hospital capacity radar, ED priority queue, Hungarian specialist resource matcher, and Dijkstra 108 ambulance
                  regional dispatch modeled across all 24 Jharkhand districts.
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-[#40372e]/60">
                <Link
                  href="/dashboard"
                  className="w-full py-3 px-4 rounded-xl bg-[#382416] hover:bg-[#491205] border border-[#ea580c]/30 text-[#ffedd7] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
                >
                  <span>Launch Web Console</span>
                  <ArrowRight className="size-4 text-[#ea580c]" />
                </Link>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <Link
                    href="/login"
                    className="py-2.5 px-3 rounded-xl bg-black/40 hover:bg-black/60 border border-[#40372e] text-xs font-mono text-stone-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Staff Sign In</span>
                    <ArrowRight className="size-3 text-stone-500" />
                  </Link>

                  <Link
                    href="/onboarding"
                    className="py-2.5 px-3 rounded-xl bg-black/40 hover:bg-black/60 border border-[#40372e] text-xs font-mono text-amber-300 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Facility Onboarding</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official GitHub Releases & Artifacts Section */}
      <section className="px-6 py-16 border-b border-dashed border-[#40372e] bg-[#140b05]">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#ea580c]">
                * OPEN SOURCE RELEASE PORTAL
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium uppercase tracking-tight text-[#ffedd7]">
                PROJECT RELEASES & CODEBASE
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm max-w-2xl">
                TriageNet is distributed with authentic release bundles, reproducible builds, and verifiable checksums.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://github.com/PG300604/TriageNet"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black border border-[#40372e] text-xs font-mono text-stone-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>GitHub Repository</span>
                <ExternalLink className="size-3 text-stone-400" />
              </a>

              <a
                href="https://github.com/PG300604/TriageNet/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-[#382416] hover:bg-[#491205] border border-[#ea580c]/30 text-xs font-mono text-orange-200 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>GitHub Releases Tag</span>
                <ExternalLink className="size-3 text-[#ea580c]" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-[#40372e] bg-black/40 space-y-1">
              <span className="text-[10px] font-mono text-stone-400">LATEST STABLE TAG</span>
              <p className="text-base font-mono font-bold text-emerald-400">v1.2.0-jharkhand</p>
              <p className="text-[11px] text-stone-400">Automated OTA channel active</p>
            </div>

            <div className="p-4 rounded-xl border border-[#40372e] bg-black/40 space-y-1">
              <span className="text-[10px] font-mono text-stone-400">COMPANION PACKAGES</span>
              <p className="text-base font-mono font-bold text-orange-300">Android APK & iOS IPA</p>
              <p className="text-[11px] text-stone-400">Direct server downloads</p>
            </div>

            <div className="p-4 rounded-xl border border-[#40372e] bg-black/40 space-y-1">
              <span className="text-[10px] font-mono text-stone-400">ALGORITHM COMPLIANCE</span>
              <p className="text-base font-mono font-bold text-amber-300">4 Hand-Coded Engines</p>
              <p className="text-[11px] text-stone-400">Deterministic clinical models</p>
            </div>

            <div className="p-4 rounded-xl border border-[#40372e] bg-black/40 space-y-1">
              <span className="text-[10px] font-mono text-stone-400">REGIONAL SCOPE</span>
              <p className="text-base font-mono font-bold text-cyan-300">24 Districts</p>
              <p className="text-[11px] text-stone-400">Jharkhand geographic mesh</p>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Helpline Directory */}
      <section className="px-6 py-16 border-b border-dashed border-[#40372e]">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-[#ea580c]">
              * 24/7 REGIONAL EMERGENCY DIRECTORY
            </span>
            <h2 className="text-2xl sm:text-3xl font-medium uppercase tracking-tight text-[#ffedd7]">
              REGIONAL EMERGENCY HELPLINES
            </h2>
            <p className="text-stone-400 text-xs sm:text-sm max-w-2xl">
              Public emergency hotlines and medical consultation numbers available across urban and rural blocks in Jharkhand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyHelplines.map((item, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-[#40372e] bg-[#181009]/80 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${item.color}`}>
                      {item.tag}
                    </span>
                    <PhoneCall className="size-4 text-stone-500" />
                  </div>
                  <h3 className="text-base font-bold text-[#ffedd7]">{item.title}</h3>
                  <p className="text-stone-400 text-xs leading-relaxed">{item.desc}</p>
                </div>

                <div className="pt-3 border-t border-[#40372e]/60">
                  <a
                    href={`tel:${item.number.replace(/\D/g, '')}`}
                    className="w-full py-2 px-3 rounded-xl bg-[#28180d] hover:bg-[#382416] border border-[#ea580c]/30 text-xs font-mono font-bold text-orange-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>CALL {item.number}</span>
                    <PhoneCall className="size-3 text-[#ea580c]" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Major Hospital Emergency Directory */}
      <section className="px-6 py-16 border-b border-dashed border-[#40372e] bg-[#140b05]">
        <div className="mx-auto max-w-7xl space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#ea580c]">
                * TERTIARY & DIVISIONAL REFERRAL HUBS
              </span>
              <h2 className="text-2xl sm:text-3xl font-medium uppercase tracking-tight text-[#ffedd7]">
                MAJOR TRAUMA & MEDICAL CENTERS
              </h2>
              <p className="text-stone-400 text-xs sm:text-sm max-w-2xl">
                Primary referral destinations for 108 trauma transfers with verified ICU and specialist rosters.
              </p>
            </div>

            {/* Quick District Filter */}
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-stone-400" />
              <input
                type="text"
                value={searchDistrict}
                onChange={(e) => setSearchDistrict(e.target.value)}
                placeholder="Search hospital or district..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 border border-[#40372e] text-xs font-mono text-[#ffedd7] placeholder-stone-500 focus:outline-none focus:border-[#ea580c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredHospitals.map((hosp, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-[#40372e] bg-[#181009]/80 space-y-3 flex flex-col justify-between hover:border-orange-500/40 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#ea580c] font-bold flex items-center gap-1">
                      <MapPin className="size-3" />
                      {hosp.district}
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                      {hosp.status}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-[#ffedd7] leading-tight">{hosp.name}</h3>
                  <p className="text-[11px] text-stone-400">{hosp.type}</p>

                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                    <div className="p-2 rounded-lg bg-black/40 border border-[#40372e]">
                      <span className="text-[10px] text-stone-500 block">TOTAL BEDS</span>
                      <span className="font-bold text-stone-200">{hosp.beds}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 border border-[#40372e]">
                      <span className="text-[10px] text-stone-500 block">ICU CAPACITY</span>
                      <span className="font-bold text-orange-300">{hosp.icu}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#40372e]/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-400">Helpline:</span>
                  <a
                    href={`tel:${hosp.helpline.replace(/\D/g, '')}`}
                    className="text-[#ea580c] hover:underline font-bold flex items-center gap-1"
                  >
                    <span>{hosp.helpline}</span>
                    <PhoneCall className="size-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-dashed border-[#40372e] bg-[#0c0602] text-stone-400 text-xs font-mono">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative size-6 overflow-hidden rounded-md border border-[#491205] bg-[#491205]">
              <Image src="/triagenet-logo.png" alt="TriageNet Official Healthcare Crest Logo" width={24} height={24} className="object-cover" />
            </div>
            <span>TRIAGENET · MODELED FOR EMERGENCY HEALTHCARE IN JHARKHAND</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/downloads" className="hover:text-white transition-colors">Downloads</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">Web Console</Link>
            <Link href="/login" className="hover:text-white transition-colors">Staff Login</Link>
          </div>

          <div>
            <span>AN INDEPENDENT RESEARCH & HEALTHCARE DISPATCH PROJECT · 2026</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
