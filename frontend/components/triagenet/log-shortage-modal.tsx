'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle,
  X,
  CheckCircle2,
  Boxes,
  Stethoscope,
  HeartPulse,
  Wind,
  BedDouble,
  Droplets,
  Activity,
  Bot,
} from 'lucide-react'
import {
  type ShortageResourceType,
  type ShortageIncidentReport,
} from '@/lib/predictive-supply-engine'

interface LogShortageModalProps {
  isOpen: boolean
  onClose: () => void
  facilityName: string
  facilityId: string
  district: string
  officerName: string
  officerRole: string
  onSubmitShortage: (report: ShortageIncidentReport) => void
}

export function LogShortageModal({
  isOpen,
  onClose,
  facilityName,
  facilityId,
  district,
  officerName,
  officerRole,
  onSubmitShortage,
}: LogShortageModalProps) {
  const [mounted, setMounted] = useState(false)
  const [department, setDepartment] = useState('Emergency Trauma Bay')
  const [resourceType, setResourceType] = useState<ShortageResourceType>('VENTILATORS')
  const [quantityDeficit, setQuantityDeficit] = useState<number>(3)
  const [patientImpactCount, setPatientImpactCount] = useState<number>(4)
  const [clinicalNotes, setClinicalNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !mounted) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const now = new Date()
    const timeStr = now.toTimeString().split(' ')[0]
    const randomId = `SHORT-2026-${Math.floor(1000 + Math.random() * 9000)}`

    const newReport: ShortageIncidentReport = {
      id: randomId,
      timestamp: timeStr,
      facilityId,
      facilityName,
      district,
      department,
      resourceType,
      quantityDeficit,
      reportingOfficerName: officerName,
      reportingOfficerRole: officerRole,
      urgencyScore: Math.min(100, 70 + patientImpactCount * 6),
      patientImpactCount,
      clinicalNotes:
        clinicalNotes.trim() ||
        `Urgent deficit reported in ${department}: short by ${quantityDeficit} units affecting ${patientImpactCount} active patients.`,
      status: 'ANALYZED_BY_AI',
    }

    setTimeout(() => {
      setIsSubmitting(false)
      onSubmitShortage(newReport)
      onClose()
    }, 200)
  }

  const modalElement = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md font-sans text-stone-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-stone-200/90 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200/80 bg-rose-50/70 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight text-stone-900">
                  Log Clinical Shortage Incident Report
                </h3>
                <p className="text-xs text-stone-600">
                  Bottom-up frontline telemetry: AI engine analyzes deficits to recommend proactive pre-fetching.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-200/70 hover:text-stone-700 transition-colors cursor-pointer"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Reporting Officer & Facility info */}
            <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Reporting Clinician</span>
                <span className="font-bold text-stone-800">{officerName}</span>
                <span className="text-stone-500 block text-[11px]">{officerRole}</span>
              </div>

              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-stone-400 block">Facility & District</span>
                <span className="font-bold text-stone-800">{facilityName}</span>
                <span className="text-stone-500 block text-[11px]">{district} District</span>
              </div>
            </div>

            {/* Department */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                Affected Clinical Department / Station
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-stone-900 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="Emergency Trauma Bay">Emergency Trauma Bay / Red Zone</option>
                <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU / CCU)</option>
                <option value="High Dependency Unit (HDU)">High Dependency Unit (HDU / Step-Down)</option>
                <option value="General Inpatient Ward">General Inpatient & Surgical Wards</option>
                <option value="Pediatric & Neonatal ICU">Pediatric & Neonatal ICU (NICU/PICU)</option>
                <option value="Triage Intake Desk">Triage Intake Desk & Holding Area</option>
              </select>
            </div>

            {/* Resource Type */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                Deficit Resource Category
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'VENTILATORS', label: 'ICU Ventilators', icon: Wind },
                  { key: 'ICU_BEDS', label: 'Critical Care Beds', icon: BedDouble },
                  { key: 'HIGH_FLOW_O2', label: 'High-Flow O₂ Humidifiers', icon: HeartPulse },
                  { key: 'TRAUMA_MONITORS', label: 'Multipara Cardiac Monitors', icon: Activity },
                  { key: 'BLOOD_UNITS', label: 'Blood Units (Emergency Bank)', icon: Droplets },
                  { key: 'CRRT_DIALYSIS', label: 'Dialysis Consumables / Lines', icon: Boxes },
                ].map((res) => {
                  const Icon = res.icon
                  const isSelected = resourceType === res.key
                  return (
                    <button
                      key={res.key}
                      type="button"
                      onClick={() => setResourceType(res.key as ShortageResourceType)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left cursor-pointer transition-colors ${
                        isSelected
                          ? 'border-rose-400 bg-rose-50/80 text-rose-950 font-bold'
                          : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <Icon className={`size-4 ${isSelected ? 'text-rose-600' : 'text-stone-400'}`} />
                      <span className="text-[11px] leading-tight">{res.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Quantity Deficit & Impact */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  Deficit Quantity Needed
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={quantityDeficit}
                  onChange={(e) => setQuantityDeficit(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-900 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  Active Patients Impacted
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={patientImpactCount}
                  onChange={(e) => setPatientImpactCount(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-xs font-bold text-stone-900 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Clinical Observations / Context */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 block">
                Clinical Observations & Surge Context
              </label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="E.g. Inflow of 4 severe trauma patients with bilateral pulmonary contusions; existing ventilator buffer exhausted."
                className="w-full rounded-xl border border-stone-300 bg-white p-3 text-xs text-stone-900 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-rose-500 placeholder:text-stone-400"
              />
            </div>

            {/* AI Engine Feedback notice */}
            <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 p-3 flex items-center gap-2.5 text-xs text-indigo-950">
              <Bot className="size-5 text-indigo-600 shrink-0" />
              <div>
                <span className="font-bold block">AI Telemetry Automated Pipeline:</span>
                <span>
                  Logging this deficit enables AI to recommend proactive pre-fetch orders across nearby reserve depots before the queue bottlenecks.
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-rose-700 hover:bg-rose-600 text-white px-5 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="size-4" />
                <span>{isSubmitting ? 'Logging Telemetry...' : 'Submit Shortage Telemetry'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return createPortal(modalElement, document.body)
}
