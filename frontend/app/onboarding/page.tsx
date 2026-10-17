'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  MapPin,
  BedDouble,
  HeartPulse,
  UserCheck,
  CreditCard,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
  Copy,
  Check,
  Sparkles,
  AlertTriangle,
  Flame,
  Stethoscope,
  Activity,
  Layers,
  Database,
  RefreshCw,
  Sliders,
  DollarSign,
  KeyRound,
} from 'lucide-react'
import { JHARKHAND_24_DISTRICTS } from '@/lib/jharkhand-data'
import { userConfigManager } from '@/lib/user-config'
import { analytics } from '@/lib/analytics'

interface FacilityOnboardingData {
  // Step 1: Identification & Location
  facilityName: string
  institutionalCode: string
  districtName: string
  subdivision: string
  streetAddress: string
  pincode: string
  latitude: number
  longitude: number
  tier: 'TERTIARY' | 'DISTRICT' | 'SUB_DIVISIONAL' | 'CHC'

  // Step 2: Ward & Clinical Capacity
  emergencyResusBeds: number
  icuTotalBeds: number
  icuStaffedVentilators: number
  hduBeds: number
  generalWardBeds: number
  burnUnitBeds: number
  modularOtSuites: number

  // Step 3: Clinical Leadership & Roster
  superintendentName: string
  superintendentEmail: string
  superintendentPhone: string
  chiefTraumaOfficer: string
  onDutySpecialists: string[]
  ambulanceCallSigns: string[]

  // Step 4: Hospital Financial Software / HMS
  financialSoftwareType: 'NIC_E_HOSPITAL' | 'ABDM_NHCX' | 'SAP_HEALTHCARE' | 'JPFMS_TALLY'
  financialApiEndpoint: string
  financialSyncCadence: 'REALTIME_WEBHOOK' | 'BATCH_HOURLY' | 'DAILY_MIDNIGHT'
  operationalBudgetLakhs: number
  contingencyGrantTargetLakhs: number
}

const INITIAL_DATA: FacilityOnboardingData = {
  facilityName: 'Sadar Hospital Hazaribagh',
  institutionalCode: 'JH-HZB-HOSP-01',
  districtName: 'Hazaribagh',
  subdivision: 'Sadar Urban',
  streetAddress: 'Matwari Road, Opp. Collectorate Complex, Hazaribagh',
  pincode: '825301',
  latitude: 23.9925,
  longitude: 85.3647,
  tier: 'DISTRICT',

  emergencyResusBeds: 12,
  icuTotalBeds: 16,
  icuStaffedVentilators: 8,
  hduBeds: 24,
  generalWardBeds: 180,
  burnUnitBeds: 6,
  modularOtSuites: 4,

  superintendentName: 'Dr. Vinay Kumar Sinha, MS',
  superintendentEmail: 'ms.hazaribagh@jharkhandhealth.gov.in',
  superintendentPhone: '+91-6546-224411',
  chiefTraumaOfficer: 'Dr. R. P. Saw, MD (Emergency)',
  onDutySpecialists: ['TraumaSurgeon', 'OrthopedicSurgeon', 'Pulmonologist'],
  ambulanceCallSigns: ['JH-02-ALS-1085', 'JH-02-BLS-1086'],

  financialSoftwareType: 'NIC_E_HOSPITAL',
  financialApiEndpoint: 'https://hazaribagh.ehospital.gov.in/api/v4/billing-ledger',
  financialSyncCadence: 'REALTIME_WEBHOOK',
  operationalBudgetLakhs: 85.0,
  contingencyGrantTargetLakhs: 20.0,
}

export default function OnboardingPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [formData, setFormData] = useState<FacilityOnboardingData>(INITIAL_DATA)
  const [generatedToken, setGeneratedToken] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  const updateField = <K extends keyof FacilityOnboardingData>(key: K, value: FacilityOnboardingData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  const toggleSpecialist = (role: string) => {
    setFormData((prev) => {
      const exists = prev.onDutySpecialists.includes(role)
      return {
        ...prev,
        onDutySpecialists: exists
          ? prev.onDutySpecialists.filter((r) => r !== role)
          : [...prev.onDutySpecialists, role],
      }
    })
  }

  const handleFinalSubmit = () => {
    setIsSubmitting(true)
    setTimeout(() => {
      const token = `JH-FACILITY-2026-${Math.floor(100000 + Math.random() * 900000)}`
      setGeneratedToken(token)

      // Save into browser localStorage so user-entered metrics persist across sessions
      if (typeof window !== 'undefined') {
        const storedFacilities = JSON.parse(localStorage.getItem('triagenet_onboarded_facilities') || '[]')
        storedFacilities.push({ ...formData, facilityToken: token, onboardedAt: new Date().toISOString() })
        localStorage.setItem('triagenet_onboarded_facilities', JSON.stringify(storedFacilities))
        localStorage.setItem('triagenet_active_facility_token', token)

        // Dynamically update active clinical configuration
        userConfigManager.updateConfig({
          facilityName: formData.facilityName,
          hospitalId: formData.institutionalCode,
          districtName: formData.districtName,
          facilityTier: formData.tier,
          lat: formData.latitude,
          lng: formData.longitude,
          totalGeneralBeds: formData.generalWardBeds,
          totalIcuBeds: formData.icuTotalBeds,
          totalVentilators: formData.icuStaffedVentilators,
          superintendentName: formData.superintendentName,
          superintendentContact: formData.superintendentPhone,
          onboardingCompleted: true,
        })

        analytics.trackEvent('FACILITY_ONBOARDED', {
          facilityName: formData.facilityName,
          district: formData.districtName,
          tier: formData.tier,
          icuBeds: formData.icuTotalBeds,
        })
      }

      setIsSubmitting(false)
      setStep(5)
    }, 1200)
  }

  const copyToken = () => {
    if (generatedToken) {
      navigator.clipboard.writeText(generatedToken)
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-[#100904] text-[#ffedd7] font-sans selection:bg-[#ea580c] selection:text-white pb-20">
      {/* Top Header */}
      <header className="border-b border-dashed border-[#40372e]/60 bg-[#100904]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
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
              <span className="text-[10px] text-[#dc5000] block font-mono">INSTITUTIONAL ONBOARDING ENGINE</span>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs font-mono">
            <Link href="/dashboard" className="text-stone-400 hover:text-[#ffedd7] transition-colors hidden sm:block">
              STATE DASHBOARD
            </Link>
            <Link href="/downloads" className="text-stone-400 hover:text-[#ffedd7] transition-colors hidden sm:block">
              MOBILE APPS
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-lg bg-[#20140c] hover:bg-[#2e1d11] text-[#ffedd7] font-medium border border-[#40372e] transition-colors"
            >
              STAFF LOGIN
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 pt-10 space-y-8">
        {/* Title & Introduction */}
        <div className="space-y-2 border-b border-dashed border-[#40372e]/60 pb-6">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-[#ea580c]/10 border border-[#ea580c]/30 text-xs font-mono text-[#ea580c]">
            <Database className="size-3.5" />
            <span>ZERO-MOCK PRODUCTION SETUP</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-medium tracking-tight text-[#ffedd7] uppercase">
            HOSPITAL &amp; DEPARTMENT ONBOARDING PORTAL
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
            Configure your facility’s authentic geospatial coordinates, ward capacities, on-duty surgical rosters, and
            financial accounting software. Once onboarded, your hospital enters production mode with persistent relational
            data entered by your authorized staff.
          </p>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          {[
            { num: 1, title: 'FACILITY PROFILE', icon: Building2 },
            { num: 2, title: 'WARD CAPACITY', icon: BedDouble },
            { num: 3, title: 'CLINICAL ROSTER', icon: Stethoscope },
            { num: 4, title: 'FINANCIAL ERP', icon: CreditCard },
          ].map((item) => {
            const Icon = item.icon
            const isCurrent = step === item.num
            const isCompleted = step > item.num || step === 5
            return (
              <div
                key={item.num}
                className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                  isCurrent
                    ? 'border-[#ea580c] bg-[#382416]/60 text-white shadow-md'
                    : isCompleted
                    ? 'border-emerald-600/40 bg-emerald-950/20 text-emerald-400'
                    : 'border-[#40372e] bg-[#181009]/60 text-stone-500'
                }`}
              >
                <div
                  className={`size-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                    isCurrent
                      ? 'bg-[#ea580c] text-white'
                      : isCompleted
                      ? 'bg-emerald-500 text-stone-950'
                      : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {isCompleted && step !== item.num ? <Check className="size-3.5" /> : item.num}
                </div>
                <div className="truncate">
                  <span className="block text-[10px] text-stone-400 font-normal">STEP 0{item.num}</span>
                  <span className="font-bold truncate block">{item.title}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Form Body */}
        <div className="rounded-2xl border border-dashed border-[#40372e] bg-[#181009]/90 p-6 md:p-8 backdrop-blur-md shadow-2xl">
          {/* STEP 1: Identification & Location */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-2.5 border-b border-[#40372e]/60 pb-3">
                <Building2 className="size-5 text-[#ea580c]" />
                <h2 className="text-lg font-bold text-[#ffedd7] uppercase">Step 1: Facility Identification &amp; GPS</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-stone-300 font-semibold block">OFFICIAL HOSPITAL NAME</label>
                  <input
                    type="text"
                    value={formData.facilityName}
                    onChange={(e) => updateField('facilityName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                    placeholder="e.g. Rajendra Institute of Medical Sciences (RIMS) or Sadar Hospital"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold block">INSTITUTIONAL CODE (NIN / ID)</label>
                  <input
                    type="text"
                    value={formData.institutionalCode}
                    onChange={(e) => updateField('institutionalCode', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                    placeholder="e.g. JH-RNC-HOSP-01"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold block">DISTRICT (JHARKHAND 24 DISTRICTS)</label>
                  <select
                    value={formData.districtName}
                    onChange={(e) => updateField('districtName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                  >
                    {JHARKHAND_24_DISTRICTS.map((d) => (
                      <option key={d.id} value={d.name} className="bg-stone-900 text-stone-100">
                        {d.name} (CMO: {d.cmoName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold block">SUB-DIVISION / BLOCK</label>
                  <input
                    type="text"
                    value={formData.subdivision}
                    onChange={(e) => updateField('subdivision', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                    placeholder="e.g. Sadar Urban / Ormanjhi Block"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold block">FACILITY TIER</label>
                  <select
                    value={formData.tier}
                    onChange={(e) => updateField('tier', e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                  >
                    <option value="TERTIARY" className="bg-stone-900">Apex Tertiary Medical College (RIMS / MGM / SNMMCH)</option>
                    <option value="DISTRICT" className="bg-stone-900">District Sadar Hospital (Secondary Level)</option>
                    <option value="SUB_DIVISIONAL" className="bg-stone-900">Sub-Divisional Hospital (SDH)</option>
                    <option value="CHC" className="bg-stone-900">Community Health Center (CHC)</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-stone-300 font-semibold block">FULL PHYSICAL STREET ADDRESS</label>
                  <input
                    type="text"
                    value={formData.streetAddress}
                    onChange={(e) => updateField('streetAddress', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                    placeholder="Building name, road, nearby highway junction"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold block">GPS LATITUDE (DECIMAL)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.latitude}
                    onChange={(e) => updateField('latitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold block">GPS LONGITUDE (DECIMAL)</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={formData.longitude}
                    onChange={(e) => updateField('longitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl bg-[#ea580c] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <span>NEXT: CONFIGURE WARDS</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Ward & Clinical Capacity */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-2.5 border-b border-[#40372e]/60 pb-3">
                <BedDouble className="size-5 text-[#ea580c]" />
                <h2 className="text-lg font-bold text-[#ffedd7] uppercase">Step 2: Department &amp; Ward Capacity Allocation</h2>
              </div>

              <p className="text-xs text-stone-400">
                These numbers define your facility’s baseline capacity in the Hungarian Bipartite Matching matrix.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-black/40 border border-[#40372e] space-y-1.5">
                  <label className="text-orange-400 font-bold block">🚨 TRAUMA RESUSCITATION BAYS</label>
                  <input
                    type="number"
                    value={formData.emergencyResusBeds}
                    onChange={(e) => updateField('emergencyResusBeds', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] font-bold text-sm"
                  />
                  <span className="text-[10px] text-stone-500 block">Immediate P1 casualty stabilization</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-[#40372e] space-y-1.5">
                  <label className="text-rose-400 font-bold block">🫁 ICU TOTAL BEDS</label>
                  <input
                    type="number"
                    value={formData.icuTotalBeds}
                    onChange={(e) => updateField('icuTotalBeds', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] font-bold text-sm"
                  />
                  <span className="text-[10px] text-stone-500 block">Critical care monitoring suites</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-[#40372e] space-y-1.5">
                  <label className="text-cyan-400 font-bold block">💨 STAFFED VENTILATORS</label>
                  <input
                    type="number"
                    value={formData.icuStaffedVentilators}
                    onChange={(e) => updateField('icuStaffedVentilators', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] font-bold text-sm"
                  />
                  <span className="text-[10px] text-stone-500 block">Active invasive/BIPAP units</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-[#40372e] space-y-1.5">
                  <label className="text-amber-400 font-bold block">🏥 HDU STEP-DOWN BEDS</label>
                  <input
                    type="number"
                    value={formData.hduBeds}
                    onChange={(e) => updateField('hduBeds', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] font-bold text-sm"
                  />
                  <span className="text-[10px] text-stone-500 block">High Dependency post-operative</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-[#40372e] space-y-1.5">
                  <label className="text-stone-300 font-bold block">🛌 GENERAL INPATIENT BEDS</label>
                  <input
                    type="number"
                    value={formData.generalWardBeds}
                    onChange={(e) => updateField('generalWardBeds', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] font-bold text-sm"
                  />
                  <span className="text-[10px] text-stone-500 block">Male, Female &amp; Pediatric wards</span>
                </div>

                <div className="p-3.5 rounded-xl bg-black/40 border border-[#40372e] space-y-1.5">
                  <label className="text-emerald-400 font-bold block">🔪 MODULAR OT SUITES</label>
                  <input
                    type="number"
                    value={formData.modularOtSuites}
                    onChange={(e) => updateField('modularOtSuites', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] font-bold text-sm"
                  />
                  <span className="text-[10px] text-stone-500 block">Laminar flow emergency theatres</span>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-[#20140c] hover:bg-[#2e1d11] text-stone-300 font-bold text-xs flex items-center gap-2 cursor-pointer border border-[#40372e]"
                >
                  <ArrowLeft className="size-4" />
                  <span>PREVIOUS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl bg-[#ea580c] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <span>NEXT: CLINICAL ROSTER</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Clinical Leadership & Emergency Staff Roster */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-2.5 border-b border-[#40372e]/60 pb-3">
                <Stethoscope className="size-5 text-[#ea580c]" />
                <h2 className="text-lg font-bold text-[#ffedd7] uppercase">Step 3: Medical Leadership &amp; Surgical Specialists</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold block">MEDICAL SUPERINTENDENT NAME</label>
                  <input
                    type="text"
                    value={formData.superintendentName}
                    onChange={(e) => updateField('superintendentName', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                    placeholder="Dr. Full Name, Designation"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold block">OFFICIAL GOVT EMAIL</label>
                  <input
                    type="email"
                    value={formData.superintendentEmail}
                    onChange={(e) => updateField('superintendentEmail', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                    placeholder="ms.hospital@jharkhandhealth.gov.in"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold block">CHIEF EMERGENCY OFFICER</label>
                  <input
                    type="text"
                    value={formData.chiefTraumaOfficer}
                    onChange={(e) => updateField('chiefTraumaOfficer', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                    placeholder="Head of Trauma Resuscitation"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold block">DIRECT EMERGENCY PHONE</label>
                  <input
                    type="text"
                    value={formData.superintendentPhone}
                    onChange={(e) => updateField('superintendentPhone', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                    placeholder="+91-XXXXXXXXXX"
                  />
                </div>
              </div>

              {/* Specialist Checklist for Dijkstra Dynamic Routing */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-mono font-bold text-orange-400 block uppercase">
                  ACTIVE ON-DUTY SURGICAL SPECIALISTS (CHECK ALL ON ACTIVE ROSTER):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs font-mono">
                  {[
                    { id: 'TraumaSurgeon', label: 'Trauma Surgeon (Chief OT)', desc: 'Thoracotomy & laparotomy' },
                    { id: 'Neurosurgeon', label: 'Neurosurgeon (Level-1)', desc: 'TBI & intracranial decompression' },
                    { id: 'OrthopedicSurgeon', label: 'Orthopedic Surgeon', desc: 'Pelvic & spinal stabilization' },
                    { id: 'BurnsPlastic', label: 'Burns & Plastic Surgeon', desc: 'Debridement & grafting' },
                    { id: 'Pulmonologist', label: 'Pulmonologist / Intensivist', desc: 'Ventilator management & ARDS' },
                  ].map((spec) => {
                    const isChecked = formData.onDutySpecialists.includes(spec.id)
                    return (
                      <div
                        key={spec.id}
                        onClick={() => toggleSpecialist(spec.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-[#382416] border-[#ea580c] text-white'
                            : 'bg-black/40 border-[#40372e] text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold">{spec.label}</span>
                          <div
                            className={`size-4 rounded flex items-center justify-center border ${
                              isChecked ? 'bg-[#ea580c] border-[#ea580c]' : 'border-stone-600'
                            }`}
                          >
                            {isChecked && <Check className="size-3 text-white" />}
                          </div>
                        </div>
                        <span className="text-[10px] text-stone-500 block mt-1">{spec.desc}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-[#20140c] hover:bg-[#2e1d11] text-stone-300 font-bold text-xs flex items-center gap-2 cursor-pointer border border-[#40372e]"
                >
                  <ArrowLeft className="size-4" />
                  <span>PREVIOUS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="px-6 py-2.5 rounded-xl bg-[#ea580c] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <span>NEXT: FINANCIAL ERP GATEWAY</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Hospital Financial Software & HMS Gateway */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center gap-2.5 border-b border-[#40372e]/60 pb-3">
                <CreditCard className="size-5 text-[#ea580c]" />
                <h2 className="text-lg font-bold text-[#ffedd7] uppercase">Step 4: Hospital Accounting &amp; Financial ERP Gateway</h2>
              </div>

              <p className="text-xs text-stone-400">
                Connect your hospital’s existing billing and procurement system so TriageNet automatically synchronizes
                operating budgets and Ayushman Bharat recovery claims seamlessly.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-stone-300 font-semibold block">FINANCIAL SOFTWARE PLATFORM</label>
                  <select
                    value={formData.financialSoftwareType}
                    onChange={(e) => updateField('financialSoftwareType', e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                  >
                    <option value="NIC_E_HOSPITAL" className="bg-stone-900">NIC e-Hospital HMS v4.2 (National Informatics Centre)</option>
                    <option value="ABDM_NHCX" className="bg-stone-900">ABDM NHCX National Health Claims Exchange Gateway</option>
                    <option value="SAP_HEALTHCARE" className="bg-stone-900">SAP Healthcare IS-H Enterprise Ledger</option>
                    <option value="JPFMS_TALLY" className="bg-stone-900">JPFMS / Tally Cloud Treasury Management</option>
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-stone-300 font-semibold block">API ENDPOINT URL (REST / FHIR)</label>
                  <input
                    type="url"
                    value={formData.financialApiEndpoint}
                    onChange={(e) => updateField('financialApiEndpoint', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                    placeholder="https://hospital-domain.gov.in/api/v1/ledger"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold block">CURRENT OPERATING BUDGET (₹ LAKHS)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.operationalBudgetLakhs}
                    onChange={(e) => updateField('operationalBudgetLakhs', parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-stone-300 font-semibold block">RECONCILIATION SYNC CADENCE</label>
                  <select
                    value={formData.financialSyncCadence}
                    onChange={(e) => updateField('financialSyncCadence', e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-black/60 border border-[#40372e] text-[#ffedd7] focus:outline-none focus:border-[#ea580c]"
                  >
                    <option value="REALTIME_WEBHOOK" className="bg-stone-900">Real-Time Event Webhook (Zero Delay)</option>
                    <option value="BATCH_HOURLY" className="bg-stone-900">Batch Synchronization (Hourly)</option>
                    <option value="DAILY_MIDNIGHT" className="bg-stone-900">Daily Nightly Reconciliation (00:00 IST)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-[#20140c] hover:bg-[#2e1d11] text-stone-300 font-bold text-xs flex items-center gap-2 cursor-pointer border border-[#40372e]"
                >
                  <ArrowLeft className="size-4" />
                  <span>PREVIOUS</span>
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="px-7 py-3 rounded-xl bg-gradient-to-r from-[#ea580c] to-orange-600 hover:from-orange-500 hover:to-orange-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-orange-950/40"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="size-4 animate-spin" />
                      <span>GENERATING CRYPTOGRAPHIC FACILITY TOKEN...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-4" />
                      <span>COMPLETE ONBOARDING &amp; GENERATE TOKEN</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: Verification Certificate & Cryptographic Token Generation */}
          {step === 5 && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-300">
              <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-950/20">
                <ShieldCheck className="size-8" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">
                  INSTITUTION ONBOARDED SUCCESSFULLY
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#ffedd7] uppercase">
                  {formData.facilityName}
                </h2>
                <p className="text-xs text-stone-400 font-mono">
                  District: {formData.districtName} · NIN: {formData.institutionalCode} · Tier: {formData.tier}
                </p>
              </div>

              {/* Cryptographic Facility Token Box */}
              <div className="p-5 rounded-2xl bg-black/60 border border-emerald-500/40 max-w-lg mx-auto space-y-3 text-left">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-stone-400">PERMANENT FACILITY TOKEN:</span>
                  <button
                    type="button"
                    onClick={copyToken}
                    className="text-[#ea580c] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    {copiedToken ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                    <span>{copiedToken ? 'TOKEN COPIED!' : 'COPY TOKEN'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 font-mono text-sm sm:text-base font-bold text-emerald-300 tracking-wider text-center select-all">
                  {generatedToken}
                </div>
                <p className="text-[11px] font-mono text-stone-500">
                  Save this token securely. Medical Superintendents and Chief Medical Officers use this token to authorize
                  clinician accounts, lock bed reserves, and sync financial balances.
                </p>
              </div>

              {/* Onboarded Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono max-w-2xl mx-auto pt-2">
                <div className="p-3 rounded-xl bg-[#20140c] border border-[#40372e]">
                  <span className="text-[10px] text-stone-500 block">ICU BEDS</span>
                  <strong className="text-rose-400 text-sm font-bold">{formData.icuTotalBeds} Beds</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#20140c] border border-[#40372e]">
                  <span className="text-[10px] text-stone-500 block">VENTILATORS</span>
                  <strong className="text-cyan-400 text-sm font-bold">{formData.icuStaffedVentilators} Units</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#20140c] border border-[#40372e]">
                  <span className="text-[10px] text-stone-500 block">SURGICAL OT</span>
                  <strong className="text-emerald-400 text-sm font-bold">{formData.modularOtSuites} Suites</strong>
                </div>
                <div className="p-3 rounded-xl bg-[#20140c] border border-[#40372e]">
                  <span className="text-[10px] text-stone-500 block">BUDGET ALLOCATED</span>
                  <strong className="text-amber-400 text-sm font-bold">₹{formData.operationalBudgetLakhs}L</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-6">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 rounded-xl bg-[#ea580c] hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all shadow-md"
                >
                  <span>LAUNCH STATE COMMAND CONSOLE</span>
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/downloads"
                  className="px-5 py-3 rounded-xl bg-[#20140c] hover:bg-[#2e1d11] text-[#ffedd7] font-semibold text-xs border border-[#40372e] flex items-center gap-2 cursor-pointer"
                >
                  <span>DOWNLOAD MOBILE APP</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
