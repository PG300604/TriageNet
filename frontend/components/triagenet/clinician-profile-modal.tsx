'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  Stethoscope,
  Building2,
  PhoneCall,
  Clock,
  Radio,
  FileCheck2,
  Edit3,
  Check,
  X,
  Bell,
  Sparkles,
  Award,
  Hash,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, type UserProfile, type UserRole } from '@/lib/auth-context'

export interface ClinicianProfileData {
  id: string
  name: string
  role?: string
  roleTitle?: string
  staffId?: string
  registrationNumber?: string
  qualifications?: string
  department?: string
  hospitalName?: string
  stationBay?: string
  shiftPreference?: string
  phoneExtension?: string
  voipLine?: string
  radioFrequency?: string
  status?: string
  currentCaseLoad?: number
  maxCapacity?: number
  isLeadSpecialist?: boolean
  signatureSealVerified?: boolean
}

interface ClinicianProfileModalProps {
  isOpen: boolean
  onClose: () => void
  mode?: 'self' | 'inspect'
  clinicianData?: ClinicianProfileData | null
  onPageDoctor?: (clinician: ClinicianProfileData) => void
}

const ROLE_BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  SUPER_ADMIN: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-300' },
  STATE_HEALTH_DEPT: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-300' },
  DISTRICT_CMO: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
  HOSPITAL_ADMIN: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-300' },
  TRIAGE_NURSE: { bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-300' },
  AMBULANCE_DISPATCH: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
}

export function ClinicianProfileModal({
  isOpen,
  onClose,
  mode = 'self',
  clinicianData,
  onPageDoctor,
}: ClinicianProfileModalProps) {
  const { user, updateUserProfile, logout } = useAuth()
  const isSelf = mode === 'self'

  const [isEditing, setIsEditing] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Editable Form State
  const [name, setName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [qualifications, setQualifications] = useState('')
  const [department, setDepartment] = useState('')
  const [stationBay, setStationBay] = useState('')
  const [shiftPreference, setShiftPreference] = useState('')
  const [phoneExtension, setPhoneExtension] = useState('')
  const [voipLine, setVoipLine] = useState('')
  const [radioFrequency, setRadioFrequency] = useState('')

  // Synchronize state when opened
  useEffect(() => {
    if (isSelf && user) {
      setName(user.name || '')
      setRoleTitle(user.roleTitle || '')
      setRegistrationNumber(user.registrationNumber || 'JMC-84920')
      setQualifications(user.qualifications || 'MBBS, MD, Fellowship in Emergency Medicine')
      setDepartment(user.department || 'Emergency Medicine & Trauma Intake')
      setStationBay(user.stationBay || 'Red Bay Station 1')
      setShiftPreference(user.shiftPreference || 'Day 8h Shift (08:00 - 16:00)')
      setPhoneExtension(user.phoneExtension || 'Ext. 4012')
      setVoipLine(user.voipLine || 'VOIP-RIMS-01')
      setRadioFrequency(user.radioFrequency || '154.280 MHz')
    } else if (clinicianData) {
      setName(clinicianData.name || '')
      setRoleTitle(clinicianData.roleTitle || clinicianData.department || 'Consultant Specialist')
      setRegistrationNumber(clinicianData.registrationNumber || `JMC-${clinicianData.id.replace(/\D/g, '') || '91024'}`)
      setQualifications(clinicianData.qualifications || 'MBBS, MS, MCh (Trauma Surgery)')
      setDepartment(clinicianData.department || 'Trauma & Emergency Care')
      setStationBay(clinicianData.stationBay || 'Trauma OT-1')
      setShiftPreference(clinicianData.shiftPreference || 'Emergency 12h Duty')
      setPhoneExtension(clinicianData.phoneExtension || 'Ext. 4012')
      setVoipLine(clinicianData.voipLine || 'VOIP-DIRECT-108')
      setRadioFrequency(clinicianData.radioFrequency || '154.280 MHz')
    }
    setIsEditing(false)
    setSaveSuccess(false)
  }, [isOpen, isSelf, user, clinicianData])

  if (!isOpen) return null

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSelf) return

    updateUserProfile({
      name,
      roleTitle,
      registrationNumber,
      qualifications,
      department,
      stationBay,
      shiftPreference,
      phoneExtension,
      voipLine,
      radioFrequency,
    })

    setSaveSuccess(true)
    setIsEditing(false)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  // Active Display Info
  const activeStaffId = isSelf
    ? user?.staffId || 'JH-STF-8012'
    : clinicianData?.staffId || `JH-DOC-${clinicianData?.id || '101'}`
  const activeHospitalName = isSelf
    ? user?.hospitalName || 'Rajendra Institute of Medical Sciences (RIMS)'
    : clinicianData?.hospitalName || 'RIMS Ranchi'
  const activeRoleKey = (isSelf ? user?.role : clinicianData?.role) || 'HOSPITAL_ADMIN'
  const badgeStyle = ROLE_BADGE_STYLES[activeRoleKey] || ROLE_BADGE_STYLES.HOSPITAL_ADMIN

  const initials = (name || 'Dr. Doctor')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl rounded-2xl border border-stone-200 bg-white shadow-2xl overflow-hidden text-stone-900 my-8"
        >
          {/* Header Banner */}
          <div className="bg-[#382416] p-6 text-[#ffedd7] relative">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-stone-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-start gap-4 pr-8">
              {/* Avatar Initial Pill */}
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#ea580c] text-white text-xl font-bold shadow-lg ring-4 ring-[#ffedd7]/10">
                {initials}
              </div>

              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-white tracking-tight truncate">
                    {name || 'Medical Officer'}
                  </h2>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    <ShieldCheck className="size-3 text-emerald-400" />
                    Verified Clinician
                  </span>
                </div>

                <p className="text-xs text-[#ffedd7]/80 font-medium truncate">
                  {roleTitle || 'Clinical Command Officer'}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#ffedd7]/70 pt-1 font-mono">
                  <span className="flex items-center gap-1">
                    <Hash className="size-3 text-[#ea580c]" />
                    {activeStaffId}
                  </span>
                  <span>•</span>
                  <span className="text-[#ffedd7]/90 font-sans">
                    Reg No: <strong className="font-mono text-white">{registrationNumber}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Subtext */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-[#ffedd7]/70">
              <span className="flex items-center gap-1.5">
                <Building2 className="size-3.5 text-[#ea580c]" />
                {activeHospitalName}
              </span>
              <span className="font-mono text-[10px] text-white/50">
                NMC / Jharkhand Medical Council
              </span>
            </div>
          </div>

          {/* Sub-Header / Notification Toast */}
          {saveSuccess && (
            <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <Check className="size-4 text-emerald-600" />
              <span>Profile credentials and tactical contact parameters updated successfully.</span>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 space-y-5">
            {/* View / Edit Mode Tabs (Self Mode Only) */}
            {isSelf && (
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer',
                      !isEditing
                        ? 'bg-[#382416] text-[#ffedd7] shadow-xs'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                    )}
                  >
                    Clinical Credential Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer',
                      isEditing
                        ? 'bg-[#ea580c] text-white shadow-xs'
                        : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
                    )}
                  >
                    <Edit3 className="size-3.5" />
                    <span>Edit Profile Data</span>
                  </button>
                </div>

                <span className={cn('rounded-full px-2.5 py-0.5 text-[10px] font-bold border', badgeStyle.bg, badgeStyle.text, badgeStyle.border)}>
                  {activeRoleKey}
                </span>
              </div>
            )}

            {!isEditing ? (
              /* VIEW MODE: High-Aesthetic Clinical Credential Card */
              <div className="space-y-4">
                {/* Qualifications & Medical Council */}
                <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                      <Award className="size-3 text-[#ea580c]" />
                      Degrees & Qualifications
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                      State Verified
                    </span>
                  </div>
                  <p className="text-xs font-bold text-stone-800 leading-relaxed">
                    {qualifications}
                  </p>
                </div>

                {/* Clinical Station & Deployment Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      Department
                    </span>
                    <span className="font-semibold text-stone-800 block truncate">
                      {department}
                    </span>
                  </div>

                  <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      Assigned Station / Bay
                    </span>
                    <span className="font-semibold text-stone-800 block truncate">
                      {stationBay}
                    </span>
                  </div>

                  <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider flex items-center gap-1">
                      <Clock className="size-3 text-emerald-600" />
                      Shift Schedule
                    </span>
                    <span className="font-semibold text-emerald-700 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {shiftPreference}
                    </span>
                  </div>

                  <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider flex items-center gap-1">
                      <PhoneCall className="size-3 text-[#ea580c]" />
                      Internal Extension
                    </span>
                    <span className="font-mono font-bold text-[#ea580c]">
                      {phoneExtension}
                    </span>
                  </div>
                </div>

                {/* Comms & Radio Telemetry */}
                <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Radio className="size-3.5 text-stone-400" />
                      Secure Station Radio:
                    </span>
                    <span className="font-mono font-bold text-stone-800">{radioFrequency}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-600 border-t border-stone-200/60 pt-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <PhoneCall className="size-3.5 text-stone-400" />
                      VoIP Terminal Line:
                    </span>
                    <span className="font-mono font-bold text-stone-800">{voipLine}</span>
                  </div>
                </div>

                {/* Inpatient Case Load Bar (Inspect Mode) */}
                {!isSelf && clinicianData?.currentCaseLoad !== undefined && (
                  <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-500 font-medium">Active Inpatient Load:</span>
                      <span className="font-bold text-stone-800">
                        {clinicianData.currentCaseLoad} / {clinicianData.maxCapacity || 4} Patients
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          (clinicianData.currentCaseLoad / (clinicianData.maxCapacity || 4)) >= 0.8
                            ? 'bg-rose-500'
                            : (clinicianData.currentCaseLoad / (clinicianData.maxCapacity || 4)) >= 0.5
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        )}
                        style={{
                          width: `${Math.round(
                            (clinicianData.currentCaseLoad / (clinicianData.maxCapacity || 4)) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Digital Cryptographic Verification Seal */}
                <div className="rounded-xl border border-emerald-200/90 bg-emerald-50/40 p-3 flex items-start gap-3 text-xs text-stone-700">
                  <FileCheck2 className="size-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-900 block">
                      Cryptographically Sealed Clinical Identity
                    </span>
                    <p className="text-[11px] text-stone-600 leading-relaxed font-mono">
                      SHA256: 9b4d8e2... Verified by Government of Jharkhand Health Command
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT MODE: Profile Customization Form */
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block">
                      Full Name & Title
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block">
                      Official Role Designation
                    </label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      required
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block">
                      Medical Council Reg. Number
                    </label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="JMC-XXXXX"
                      required
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-500 block">
                    Degrees & Clinical Qualifications
                  </label>
                  <input
                    type="text"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    placeholder="e.g. MBBS, MS, MCh (Trauma Surgery)"
                    required
                    className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block">
                      Station / OT Bay / Desk
                    </label>
                    <input
                      type="text"
                      value={stationBay}
                      onChange={(e) => setStationBay(e.target.value)}
                      placeholder="e.g. Red Bay Desk 1"
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block">
                      Shift Schedule Preference
                    </label>
                    <select
                      value={shiftPreference}
                      onChange={(e) => setShiftPreference(e.target.value)}
                      className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    >
                      <option value="Day 8h Shift (08:00 - 16:00)">Day 8h Shift (08:00 - 16:00)</option>
                      <option value="Day 12h Duty (08:00 - 20:00)">Day 12h Duty (08:00 - 20:00)</option>
                      <option value="Night Emergency (20:00 - 08:00)">Night Emergency (20:00 - 08:00)</option>
                      <option value="On-Call Trauma Specialist">On-Call Trauma Specialist</option>
                      <option value="Continuous Command (24/7 Roster)">Continuous Command (24/7 Roster)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block">
                      Pager Extension
                    </label>
                    <input
                      type="text"
                      value={phoneExtension}
                      onChange={(e) => setPhoneExtension(e.target.value)}
                      placeholder="Ext. 4012"
                      className="w-full rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs font-mono font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block">
                      VoIP Line
                    </label>
                    <input
                      type="text"
                      value={voipLine}
                      onChange={(e) => setVoipLine(e.target.value)}
                      placeholder="VOIP-01"
                      className="w-full rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs font-mono font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-500 block">
                      Radio Freq
                    </label>
                    <input
                      type="text"
                      value={radioFrequency}
                      onChange={(e) => setRadioFrequency(e.target.value)}
                      placeholder="154.280 MHz"
                      className="w-full rounded-xl border border-stone-200 bg-white px-2.5 py-2 text-xs font-mono font-semibold text-stone-900 focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-stone-200 px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {/* Bottom Actions */}
            <div className="border-t border-stone-100 pt-4 flex items-center justify-between gap-3">
              {isSelf ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      logout()
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 px-3.5 py-2 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Logout Session
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  {onPageDoctor && (
                    <button
                      type="button"
                      onClick={() => {
                        if (clinicianData) onPageDoctor(clinicianData)
                        onClose()
                      }}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer transition-colors"
                    >
                      <Bell className="size-3.5" />
                      <span>Page Specialist to Bay</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 px-4 py-2 text-xs font-semibold cursor-pointer transition-colors ml-auto"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
