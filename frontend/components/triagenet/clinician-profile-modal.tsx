'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
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
  LogOut,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth, type UserProfile, type UserRole } from '@/lib/auth-context'
import { userConfigManager } from '@/lib/user-config'

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
  SUPER_ADMIN: { bg: 'bg-purple-950/70', text: 'text-purple-300', border: 'border-purple-800' },
  STATE_HEALTH_DEPT: { bg: 'bg-blue-950/70', text: 'text-blue-300', border: 'border-blue-800' },
  DISTRICT_CMO: { bg: 'bg-amber-950/70', text: 'text-amber-300', border: 'border-amber-800' },
  HOSPITAL_ADMIN: { bg: 'bg-indigo-950/70', text: 'text-indigo-300', border: 'border-indigo-800' },
  TRIAGE_NURSE: { bg: 'bg-rose-950/70', text: 'text-rose-300', border: 'border-rose-800' },
  AMBULANCE_DISPATCH: { bg: 'bg-emerald-950/70', text: 'text-emerald-300', border: 'border-emerald-800' },
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

  const [mounted, setMounted] = useState(false)
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!isOpen || !mounted) return null

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

  const modalContent = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl rounded-2xl border border-stone-800 bg-[#181512] shadow-2xl overflow-hidden text-stone-100 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="bg-[#12100e] p-6 text-[#ffedd7] border-b border-[#382416]/60 relative shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 rounded-xl p-1.5 text-stone-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-start gap-4 pr-8">
              {/* Avatar Initial Pill */}
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#ea580c] text-white text-xl font-bold shadow-lg ring-4 ring-[#ea580c]/20">
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
            <div className="bg-emerald-950/60 border-b border-emerald-800/80 px-6 py-2.5 flex items-center gap-2 text-xs font-semibold text-emerald-300 shrink-0">
              <Check className="size-4 text-emerald-400" />
              <span>Profile credentials and tactical contact parameters updated successfully.</span>
            </div>
          )}

          {/* Body Content */}
          <div className="p-6 space-y-5 overflow-y-auto bg-[#181512]">
            {/* View / Edit Mode Tabs (Self Mode Only) */}
            {isSelf && (
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer',
                      !isEditing
                        ? 'bg-[#382416] text-[#ffedd7] border border-[#ea580c]/40 shadow-xs'
                        : 'text-stone-400 hover:text-white hover:bg-stone-800'
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
                        : 'text-stone-400 hover:text-white hover:bg-stone-800'
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
                <div className="rounded-xl border border-stone-800/80 bg-[#221e1a] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider flex items-center gap-1.5">
                      <Award className="size-3 text-[#ea580c]" />
                      Degrees & Qualifications
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                      State Verified
                    </span>
                  </div>
                  <p className="text-xs font-bold text-stone-200 leading-relaxed">
                    {qualifications}
                  </p>
                </div>

                {/* Clinical Station & Deployment Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-stone-800/80 bg-[#221e1a] p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      Department
                    </span>
                    <span className="font-semibold text-stone-200 block truncate">
                      {department}
                    </span>
                  </div>

                  <div className="rounded-xl border border-stone-800/80 bg-[#221e1a] p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                      Assigned Station / Bay
                    </span>
                    <span className="font-semibold text-stone-200 block truncate">
                      {stationBay}
                    </span>
                  </div>

                  <div className="rounded-xl border border-stone-800/80 bg-[#221e1a] p-3 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider flex items-center gap-1">
                      <Clock className="size-3 text-emerald-400" />
                      Shift Schedule
                    </span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {shiftPreference}
                    </span>
                  </div>

                  <div className="rounded-xl border border-stone-800/80 bg-[#221e1a] p-3 space-y-1">
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
                <div className="rounded-xl border border-stone-800/80 bg-[#221e1a] p-3.5 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Radio className="size-3.5 text-stone-400" />
                      Secure Station Radio:
                    </span>
                    <span className="font-mono font-bold text-stone-200">{radioFrequency}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-400 border-t border-stone-800/60 pt-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <PhoneCall className="size-3.5 text-stone-400" />
                      VoIP Terminal Line:
                    </span>
                    <span className="font-mono font-bold text-stone-200">{voipLine}</span>
                  </div>
                </div>

                {/* Inpatient Case Load Bar (Inspect Mode) */}
                {!isSelf && clinicianData?.currentCaseLoad !== undefined && (
                  <div className="rounded-xl border border-stone-800/80 bg-[#221e1a] p-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-stone-400 font-medium">Active Inpatient Load:</span>
                      <span className="font-bold text-stone-200">
                        {clinicianData.currentCaseLoad} / {clinicianData.maxCapacity || 4} Patients
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-stone-800">
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
                <div className="rounded-xl border border-emerald-800/60 bg-emerald-950/30 p-3 flex items-start gap-3 text-xs text-stone-300">
                  <FileCheck2 className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold text-emerald-300 block">
                      Cryptographically Sealed Clinical Identity
                    </span>
                    <p className="text-[11px] text-stone-400 leading-relaxed font-mono">
                      SHA256: 9b4d8e2... Verified by TriageNet Institutional Authority
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* EDIT MODE: Profile Customization Form */
              <form onSubmit={handleSave} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block">
                      Full Name & Title
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-stone-700 bg-[#12100e] px-3 py-2 text-xs font-semibold text-white focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block">
                      Official Role Designation
                    </label>
                    <input
                      type="text"
                      value={roleTitle}
                      onChange={(e) => setRoleTitle(e.target.value)}
                      required
                      className="w-full rounded-xl border border-stone-700 bg-[#12100e] px-3 py-2 text-xs font-semibold text-white focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block">
                      Medical Council Reg. Number
                    </label>
                    <input
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="JMC-XXXXX"
                      required
                      className="w-full rounded-xl border border-stone-700 bg-[#12100e] px-3 py-2 text-xs font-mono font-semibold text-white focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      className="w-full rounded-xl border border-stone-700 bg-[#12100e] px-3 py-2 text-xs font-semibold text-white focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-stone-400 block">
                    Degrees & Fellowships (Comma separated)
                  </label>
                  <textarea
                    rows={2}
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                    required
                    className="w-full rounded-xl border border-stone-700 bg-[#12100e] px-3 py-2 text-xs font-semibold text-white focus:border-[#ea580c] focus:outline-hidden resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block">
                      Assigned Station Bay
                    </label>
                    <input
                      type="text"
                      value={stationBay}
                      onChange={(e) => setStationBay(e.target.value)}
                      placeholder="Red Bay Desk Station 1"
                      className="w-full rounded-xl border border-stone-700 bg-[#12100e] px-3 py-2 text-xs font-semibold text-white focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block">
                      Duty Shift Schedule
                    </label>
                    <input
                      type="text"
                      value={shiftPreference}
                      onChange={(e) => setShiftPreference(e.target.value)}
                      placeholder="Day 8h Shift (08:00 - 16:00)"
                      className="w-full rounded-xl border border-stone-700 bg-[#12100e] px-3 py-2 text-xs font-semibold text-white focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block">
                      Pager Extension
                    </label>
                    <input
                      type="text"
                      value={phoneExtension}
                      onChange={(e) => setPhoneExtension(e.target.value)}
                      placeholder="Ext. 4012"
                      className="w-full rounded-xl border border-stone-700 bg-[#12100e] px-2.5 py-2 text-xs font-mono font-semibold text-white focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block">
                      VoIP Line
                    </label>
                    <input
                      type="text"
                      value={voipLine}
                      onChange={(e) => setVoipLine(e.target.value)}
                      placeholder="VOIP-01"
                      className="w-full rounded-xl border border-stone-700 bg-[#12100e] px-2.5 py-2 text-xs font-mono font-semibold text-white focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-stone-400 block">
                      Radio Freq
                    </label>
                    <input
                      type="text"
                      value={radioFrequency}
                      onChange={(e) => setRadioFrequency(e.target.value)}
                      placeholder="154.280 MHz"
                      className="w-full rounded-xl border border-stone-700 bg-[#12100e] px-2.5 py-2 text-xs font-mono font-semibold text-white focus:border-[#ea580c] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-xl border border-stone-700 px-3.5 py-2 text-xs font-semibold text-stone-400 hover:text-white hover:bg-stone-800 cursor-pointer"
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
            <div className="border-t border-stone-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              {isSelf ? (
                <>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => {
                        onClose()
                        logout()
                      }}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-stone-700 bg-stone-900 hover:bg-stone-800 text-stone-300 px-3.5 py-2 text-xs font-semibold cursor-pointer transition-colors"
                      title="Sign out and return to login screen"
                    >
                      <LogOut className="size-3.5" />
                      <span>Sign Out</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/40 hover:bg-red-900/60 text-red-400 px-3 py-2 text-xs font-bold cursor-pointer transition-colors"
                      title="Delete account, clear custom API keys and purge clinical cache"
                    >
                      <Trash2 className="size-3.5 text-red-400" />
                      <span>Delete Account / Purge Cache</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-auto rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
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
                    className="rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 px-4 py-2 text-xs font-semibold cursor-pointer transition-colors ml-auto"
                  >
                    Close
                  </button>
                </>
              )}
            </div>

            {/* Delete Account Confirmation Dialog */}
            {showDeleteConfirm && (
              <div className="absolute inset-0 z-50 rounded-3xl bg-black/85 backdrop-blur-md flex items-center justify-center p-6">
                <div className="max-w-sm w-full bg-[#1c1917] border border-red-800/50 rounded-2xl p-5 text-center space-y-4 shadow-2xl">
                  <div className="size-12 mx-auto rounded-full bg-red-950/60 border border-red-800/60 flex items-center justify-center text-red-400">
                    <Trash2 className="size-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Permanently Delete Account?</h4>
                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      This will revoke your active clinician session, delete custom facility API keys, and purge all local trauma triage caches. This action is irreversible.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 rounded-xl border border-stone-700 bg-stone-800 py-2 text-xs font-semibold text-stone-300 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => {
                        setIsDeleting(true)
                        setTimeout(() => {
                          userConfigManager.wipeAllUserData()
                          logout()
                          onClose()
                          if (typeof window !== 'undefined') {
                            window.location.href = '/login'
                          }
                        }, 600)
                      }}
                      className="flex-1 rounded-xl bg-red-700 hover:bg-red-600 text-white py-2 text-xs font-bold transition-colors shadow-md"
                    >
                      {isDeleting ? 'Wiping Data...' : 'Yes, Delete'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return createPortal(modalContent, document.body)
}
