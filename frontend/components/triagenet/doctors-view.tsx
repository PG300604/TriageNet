'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { type TriageState } from '@/lib/triage-data'
import {
  Stethoscope,
  Search,
  Filter,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Building2,
  PhoneCall,
  Bell,
  HeartPulse,
  Flame,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  Send,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type DoctorStatus = 'Available' | 'In Emergency' | 'In Surgery' | 'On Call' | 'Off Duty'
export type MedicalDepartment =
  | 'Trauma Surgery'
  | 'Cardiology'
  | 'Pulmonology'
  | 'General Medicine'
  | 'Anesthesiology'
  | 'Pediatrics'
  | 'Emergency Medicine'

export interface DoctorStaffRecord {
  id: string
  name: string
  qualification: string
  department: MedicalDepartment
  hospitalId: string
  hospitalName: string
  roomOrBay: string
  status: DoctorStatus
  shiftHours: string
  currentCaseLoad: number
  maxCapacity: number
  phoneExtension: string
  isLeadSpecialist?: boolean
}

interface DoctorsViewProps {
  state?: TriageState
  selectedHospitalId?: string
}

const INITIAL_DOCTORS: DoctorStaffRecord[] = [
  {
    id: 'DOC-101',
    name: 'Dr. Rameshwar Oraon',
    qualification: 'MS, MCh (Trauma & Ortho)',
    department: 'Trauma Surgery',
    hospitalId: 'jh-rims-ranchi',
    hospitalName: 'Rajendra Institute of Medical Sciences (RIMS)',
    roomOrBay: 'Trauma OT-1',
    status: 'In Surgery',
    shiftHours: '08:00 - 20:00 (12h Shift)',
    currentCaseLoad: 3,
    maxCapacity: 4,
    phoneExtension: 'Ext. 4012',
    isLeadSpecialist: true,
  },
  {
    id: 'DOC-102',
    name: 'Dr. Sunita Murmu',
    qualification: 'MD, DM (Cardiology)',
    department: 'Cardiology',
    hospitalId: 'jh-rims-ranchi',
    hospitalName: 'Rajendra Institute of Medical Sciences (RIMS)',
    roomOrBay: 'Cath Lab & CCU-2',
    status: 'In Emergency',
    shiftHours: '08:00 - 20:00 (12h Shift)',
    currentCaseLoad: 2,
    maxCapacity: 3,
    phoneExtension: 'Ext. 4018',
    isLeadSpecialist: true,
  },
  {
    id: 'DOC-103',
    name: 'Dr. Anand Kumar Verma',
    qualification: 'MD (Respiratory Medicine)',
    department: 'Pulmonology',
    hospitalId: 'jh-rims-ranchi',
    hospitalName: 'Rajendra Institute of Medical Sciences (RIMS)',
    roomOrBay: 'ICU-B High Dependency',
    status: 'Available',
    shiftHours: '08:00 - 16:00 (8h Shift)',
    currentCaseLoad: 1,
    maxCapacity: 5,
    phoneExtension: 'Ext. 4022',
  },
  {
    id: 'DOC-104',
    name: 'Dr. Neha Choudhary',
    qualification: 'MD (Anesthesiology & Critical Care)',
    department: 'Anesthesiology',
    hospitalId: 'jh-rims-ranchi',
    hospitalName: 'Rajendra Institute of Medical Sciences (RIMS)',
    roomOrBay: 'Main OT Suite 3',
    status: 'In Surgery',
    shiftHours: '08:00 - 20:00 (12h Shift)',
    currentCaseLoad: 2,
    maxCapacity: 2,
    phoneExtension: 'Ext. 4030',
  },
  {
    id: 'DOC-105',
    name: 'Dr. Prabhat Kumar',
    qualification: 'MD, DNB (General Medicine)',
    department: 'Emergency Medicine',
    hospitalId: 'jh-sadar-ranchi',
    hospitalName: 'Sadar Hospital Ranchi',
    roomOrBay: 'Emergency Bay A-1',
    status: 'Available',
    shiftHours: '09:00 - 17:00 (Day Shift)',
    currentCaseLoad: 1,
    maxCapacity: 6,
    phoneExtension: 'Ext. 2101',
    isLeadSpecialist: true,
  },
  {
    id: 'DOC-106',
    name: 'Dr. Ananya Verma',
    qualification: 'MBBS, MEM (Emergency Medicine)',
    department: 'Emergency Medicine',
    hospitalId: 'jh-sadar-ranchi',
    hospitalName: 'Sadar Hospital Ranchi',
    roomOrBay: 'Triage Station Red',
    status: 'In Emergency',
    shiftHours: '08:00 - 20:00 (12h Shift)',
    currentCaseLoad: 4,
    maxCapacity: 5,
    phoneExtension: 'Ext. 2104',
  },
  {
    id: 'DOC-107',
    name: 'Dr. Deepak Mahto',
    qualification: 'MS (General & Laparoscopic Surgery)',
    department: 'Trauma Surgery',
    hospitalId: 'jh-sadar-ranchi',
    hospitalName: 'Sadar Hospital Ranchi',
    roomOrBay: 'Emergency Minor OT',
    status: 'Available',
    shiftHours: '08:00 - 16:00 (8h Shift)',
    currentCaseLoad: 0,
    maxCapacity: 3,
    phoneExtension: 'Ext. 2110',
  },
  {
    id: 'DOC-108',
    name: 'Dr. Meena Gope',
    qualification: 'MD (Pediatrics), DCH',
    department: 'Pediatrics',
    hospitalId: 'jh-sadar-ranchi',
    hospitalName: 'Sadar Hospital Ranchi',
    roomOrBay: 'Pediatric Emergency Ward',
    status: 'Available',
    shiftHours: '09:00 - 17:00 (Day Shift)',
    currentCaseLoad: 2,
    maxCapacity: 6,
    phoneExtension: 'Ext. 2115',
  },
  {
    id: 'DOC-109',
    name: 'Dr. Sanjay Tirkey',
    qualification: 'MD (General Medicine)',
    department: 'General Medicine',
    hospitalId: 'jh-cch-ranchi',
    hospitalName: 'Central Coalfields Gandhi Nagar Hospital',
    roomOrBay: 'Acute Medical Unit',
    status: 'On Call',
    shiftHours: 'On-Call (24h Emergency)',
    currentCaseLoad: 1,
    maxCapacity: 4,
    phoneExtension: 'Ext. 3101',
  },
  {
    id: 'DOC-110',
    name: 'Dr. Priyanka Singh',
    qualification: 'MD (Cardiology), FESC',
    department: 'Cardiology',
    hospitalId: 'jh-cch-ranchi',
    hospitalName: 'Central Coalfields Gandhi Nagar Hospital',
    roomOrBay: 'Cardiac Care Unit',
    status: 'Available',
    shiftHours: '08:00 - 16:00 (8h Shift)',
    currentCaseLoad: 1,
    maxCapacity: 3,
    phoneExtension: 'Ext. 3105',
  },
]

export function DoctorsView({ state, selectedHospitalId }: DoctorsViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [doctorsList, setDoctorsList] = useState<DoctorStaffRecord[]>(INITIAL_DOCTORS)
  const [pagingDoctor, setPagingDoctor] = useState<DoctorStaffRecord | null>(null)
  const [selectedDoctorProfile, setSelectedDoctorProfile] = useState<DoctorStaffRecord | null>(null)
  const [pageMessage, setPageMessage] = useState('')
  const [pageSentToast, setPageSentToast] = useState<string | null>(null)

  // Metrics
  const totalDoctors = doctorsList.length
  const availableCount = doctorsList.filter((d) => d.status === 'Available').length
  const inEmergencyCount = doctorsList.filter((d) => d.status === 'In Emergency' || d.status === 'In Surgery').length
  const onCallCount = doctorsList.filter((d) => d.status === 'On Call').length

  const departments: MedicalDepartment[] = [
    'Trauma Surgery',
    'Cardiology',
    'Pulmonology',
    'Emergency Medicine',
    'Anesthesiology',
    'General Medicine',
    'Pediatrics',
  ]

  const filteredDoctors = useMemo(() => {
    return doctorsList.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.hospitalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.roomOrBay.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesDept = selectedDept === 'ALL' || doc.department === selectedDept
      const matchesStatus = selectedStatus === 'ALL' || doc.status === selectedStatus

      return matchesSearch && matchesDept && matchesStatus
    })
  }, [doctorsList, searchQuery, selectedDept, selectedStatus])

  const handleSendPage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pagingDoctor) return

    const msg = `[CRITICAL CLINICAL PAGE] Alert dispatched to ${pagingDoctor.name} (${pagingDoctor.department}) at ${pagingDoctor.roomOrBay}: "${pageMessage || 'Urgent Triage Consultation Required'}"`
    setPageSentToast(msg)
    setPagingDoctor(null)
    setPageMessage('')
    setTimeout(() => setPageSentToast(null), 6000)
  }

  const getStatusBadge = (status: DoctorStatus) => {
    switch (status) {
      case 'Available':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'In Emergency':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'In Surgery':
        return 'bg-rose-50 text-rose-700 border-rose-200'
      case 'On Call':
        return 'bg-sky-50 text-sky-700 border-sky-200'
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200'
    }
  }

  return (
    <div className="space-y-6 font-sans text-[#2c1b0e]">
      {/* Toast Alert */}
      <AnimatePresence>
        {pageSentToast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>{pageSentToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setPageSentToast(null)}
              className="text-emerald-700 hover:text-emerald-900"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4-Card Hero Metric Grid (Inspired by Boltshift & Starline) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Hero Brand Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#ea580c] to-[#c2410c] p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide backdrop-blur-xs">
              ON-DUTY ROSTER
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-white/15">
              <Stethoscope className="size-4 text-white" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight">{totalDoctors}</p>
            <p className="mt-1 text-xs font-medium text-white/80">
              Active Medical Specialists on Duty
            </p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
            <span className="inline-block size-1.5 rounded-full bg-emerald-300 animate-pulse" />
            100% Core Specialty Coverage
          </div>
        </div>

        {/* Card 2: Available Specialists */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              IMMEDIATELY AVAILABLE
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <UserCheck className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[#382416]">
              {availableCount}
            </p>
            <p className="mt-1 text-xs font-medium text-stone-500">
              Ready for urgent triage intake
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
            ↑ Low Wait Time Impact
          </div>
        </div>

        {/* Card 3: In Emergency / Surgery */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              IN EMERGENCY / OR
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <HeartPulse className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[#382416]">
              {inEmergencyCount}
            </p>
            <p className="mt-1 text-xs font-medium text-stone-500">
              Critical operations active
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
            {inEmergencyCount} OR Suites Occupied
          </div>
        </div>

        {/* Card 4: On-Call Backups */}
        <div className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-xs transition-shadow hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400">
              ON-CALL SURGEONS
            </span>
            <div className="flex size-9 items-center justify-center rounded-full bg-sky-50 text-sky-600">
              <PhoneCall className="size-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold tracking-tight text-[#382416]">
              {onCallCount}
            </p>
            <p className="mt-1 text-xs font-medium text-stone-500">
              Sub-15m emergency response
            </p>
          </div>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700">
            Emergency Surge Ready
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar (Inspired by Bright Leads) */}
      <div className="flex flex-col gap-3 rounded-2xl border border-stone-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search doctor, specialty, room, or hospital..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2 pl-9 pr-4 text-xs font-medium text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-[#ea580c] focus:bg-white focus:ring-1 focus:ring-[#ea580c]/30"
            />
          </div>

          {/* Status Quick Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {['ALL', 'Available', 'In Emergency', 'In Surgery', 'On Call'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={cn(
                  'rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                  selectedStatus === st
                    ? 'bg-[#382416] text-[#ffedd7] shadow-2xs'
                    : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70'
                )}
              >
                {st === 'ALL' ? 'All Statuses' : st}
              </button>
            ))}
          </div>
        </div>

        {/* Specialty Pills Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-t border-stone-100 pt-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-400 mr-1 shrink-0">
            Specialty:
          </span>
          <button
            type="button"
            onClick={() => setSelectedDept('ALL')}
            className={cn(
              'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer shrink-0',
              selectedDept === 'ALL'
                ? 'bg-[#ea580c] text-white shadow-2xs'
                : 'text-stone-600 hover:bg-stone-100'
            )}
          >
            All Specialties
          </button>
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setSelectedDept(dept)}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer shrink-0',
                selectedDept === dept
                  ? 'bg-[#ea580c] text-white shadow-2xs'
                  : 'text-stone-600 hover:bg-stone-100'
              )}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Doctor Availability Roster Table (Inspired by Bright & Transaction History) */}
      <div className="overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/80 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                <th className="py-3.5 px-4">Specialist Details</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Assigned Facility & Station</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Case Load</th>
                <th className="py-3.5 px-4 text-right">Emergency Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredDoctors.map((doc) => {
                const isAvailable = doc.status === 'Available'
                const loadPct = Math.round((doc.currentCaseLoad / (doc.maxCapacity || 1)) * 100)

                return (
                  <tr
                    key={doc.id}
                    onClick={() => setSelectedDoctorProfile(doc)}
                    className="hover:bg-orange-50/40 cursor-pointer transition-colors group"
                  >
                    {/* Specialist */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#382416]/10 text-xs font-bold text-[#382416] group-hover:bg-[#382416] group-hover:text-[#ffedd7] transition-colors">
                          {doc.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 group-hover:text-[#ea580c] transition-colors">{doc.name}</span>
                            {doc.isLeadSpecialist && (
                              <span className="rounded bg-[#ea580c]/10 px-1.5 py-0.2 text-[10px] font-bold text-[#ea580c]">
                                Lead
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-stone-400 font-medium">
                            {doc.qualification}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-700">{doc.department}</span>
                      <p className="text-[10px] text-stone-400">{doc.shiftHours}</p>
                    </td>

                    {/* Facility & Room */}
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-stone-800">{doc.roomOrBay}</p>
                      <p className="text-[11px] text-stone-400 truncate max-w-[200px]">
                        {doc.hospitalName}
                      </p>
                    </td>

                    {/* Status Pill */}
                    <td className="py-3.5 px-4">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold',
                          getStatusBadge(doc.status)
                        )}
                      >
                        <span
                          className={cn(
                            'size-1.5 rounded-full',
                            doc.status === 'Available'
                              ? 'bg-emerald-500'
                              : doc.status === 'In Surgery'
                              ? 'bg-rose-500'
                              : doc.status === 'In Emergency'
                              ? 'bg-amber-500'
                              : 'bg-sky-500'
                          )}
                        />
                        {doc.status}
                      </span>
                    </td>

                    {/* Case Load */}
                    <td className="py-3.5 px-4">
                      <div className="w-28 space-y-1">
                        <div className="flex justify-between text-[11px] font-medium text-stone-500">
                          <span>{doc.currentCaseLoad} / {doc.maxCapacity} Active</span>
                          <span>{loadPct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              loadPct >= 80
                                ? 'bg-rose-500'
                                : loadPct >= 50
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            )}
                            style={{ width: `${loadPct}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setPagingDoctor(doc)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#382416]/20 bg-white px-3 py-1.5 text-xs font-semibold text-[#382416] transition-all hover:bg-[#382416] hover:text-[#ffedd7] cursor-pointer shadow-2xs"
                      >
                        <Bell className="size-3 text-[#ea580c]" />
                        <span>Page Doctor</span>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emergency Specialist Paging Modal */}
      <AnimatePresence>
        {pagingDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#ea580c]/10 text-[#ea580c]">
                    <Bell className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-900">
                      Emergency Specialist Paging
                    </h3>
                    <p className="text-xs text-stone-400">
                      Direct notification to physician pager
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPagingDoctor(null)}
                  className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-600"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="rounded-xl border border-stone-100 bg-stone-50/70 p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-stone-400 font-medium">Physician:</span>
                  <span className="font-bold text-stone-800">{pagingDoctor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-medium">Specialty:</span>
                  <span className="font-semibold text-stone-700">{pagingDoctor.department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-medium">Station:</span>
                  <span className="font-medium text-stone-700">{pagingDoctor.roomOrBay}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-400 font-medium">Internal Comm:</span>
                  <span className="font-mono font-bold text-[#ea580c]">{pagingDoctor.phoneExtension}</span>
                </div>
              </div>

              <form onSubmit={handleSendPage} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Emergency Case Brief / Triage Reason
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Code STEMI incoming in 7 mins; Trauma Bay 1 acute hemorrhage..."
                    value={pageMessage}
                    onChange={(e) => setPageMessage(e.target.value)}
                    className="w-full rounded-xl border border-stone-200 bg-stone-50/60 p-3 text-xs font-medium text-stone-800 placeholder-stone-400 outline-none transition-all focus:border-[#ea580c] focus:bg-white focus:ring-1 focus:ring-[#ea580c]/30"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPagingDoctor(null)}
                    className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#ea580c] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[#c2410c] transition-colors cursor-pointer"
                  >
                    <Send className="size-3.5" />
                    <span>Dispatch Immediate Page</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Interactive Doctor Profile Modal */}
        {selectedDoctorProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-2xl space-y-4 text-stone-900"
            >
              {/* Header with Doctor Avatar & Close */}
              <div className="flex items-start justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-3.5">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-[#382416] text-[#ffedd7] text-lg font-bold shadow-md">
                    {selectedDoctorProfile.name.replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base font-bold text-[#382416]">
                        {selectedDoctorProfile.name}
                      </h3>
                      {selectedDoctorProfile.isLeadSpecialist && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-300">
                          <Sparkles className="size-2.5 text-[#ea580c]" />
                          Lead Specialist
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 font-medium mt-0.5">
                      {selectedDoctorProfile.qualification}
                    </p>
                    <span className="font-mono text-[10px] text-stone-400">
                      Reg. No: JMC-{selectedDoctorProfile.id.replace('DOC-', '')}4920 · Medical Council of Jharkhand
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedDoctorProfile(null)}
                  className="rounded-xl p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Status & Department Quick Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    Duty Status
                  </span>
                  <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold border', getStatusBadge(selectedDoctorProfile.status))}>
                    <span className="size-1.5 rounded-full bg-current"></span>
                    {selectedDoctorProfile.status}
                  </span>
                </div>

                <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                    Department
                  </span>
                  <span className="text-xs font-bold text-stone-800 block">
                    {selectedDoctorProfile.department}
                  </span>
                </div>
              </div>

              {/* Detailed Operational Attributes */}
              <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-4 text-xs space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-medium">Affiliated Hospital:</span>
                  <span className="font-semibold text-stone-800 text-right max-w-[240px] truncate">
                    {selectedDoctorProfile.hospitalName}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-medium">Assigned Station / Bay:</span>
                  <span className="font-semibold text-stone-800">
                    {selectedDoctorProfile.roomOrBay}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-medium">Active Shift Schedule:</span>
                  <span className="font-semibold text-stone-800">
                    {selectedDoctorProfile.shiftHours}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-stone-500 font-medium">Internal Communication:</span>
                  <span className="font-mono font-bold text-[#ea580c]">
                    {selectedDoctorProfile.phoneExtension}
                  </span>
                </div>

                {/* Case Load Bar */}
                <div className="pt-2 border-t border-stone-200/60 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-stone-500 font-medium">Inpatient Case Load:</span>
                    <span className="font-bold text-stone-800">
                      {selectedDoctorProfile.currentCaseLoad} / {selectedDoctorProfile.maxCapacity} Patients ({Math.round((selectedDoctorProfile.currentCaseLoad / (selectedDoctorProfile.maxCapacity || 1)) * 100)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-200">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        (selectedDoctorProfile.currentCaseLoad / selectedDoctorProfile.maxCapacity) >= 0.8
                          ? 'bg-rose-500'
                          : (selectedDoctorProfile.currentCaseLoad / selectedDoctorProfile.maxCapacity) >= 0.5
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      )}
                      style={{ width: `${Math.round((selectedDoctorProfile.currentCaseLoad / (selectedDoctorProfile.maxCapacity || 1)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const docToPage = selectedDoctorProfile
                    setSelectedDoctorProfile(null)
                    setPagingDoctor(docToPage)
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-2 text-xs font-bold shadow-xs cursor-pointer transition-colors"
                >
                  <Bell className="size-3.5" />
                  <span>Page Doctor to Bay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDoctorProfile(null)}
                  className="rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 px-4 py-2 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
