'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  X,
  IndianRupee,
  BedDouble,
  HeartPulse,
  Wind,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Users,
} from 'lucide-react'
import { occupancyRatio, type Hospital } from '@/lib/triage-data'

export interface DistrictBudgetRecord {
  id: string
  districtName: string
  population: string
  hospitalCount: number
  totalBudgetCr: number
  releasedBudgetCr: number
  capacityLoadPct: number
  queuedPatients: number
  status: 'CRITICAL_SURGE' | 'MODERATE_STRAIN' | 'NOMINAL'
  pendingRequisitions: number
}

interface DistrictOverviewModalProps {
  isOpen: boolean
  onClose: () => void
  district: DistrictBudgetRecord | null
  onReleaseGrant?: (district: DistrictBudgetRecord) => void
  hospitals: Hospital[]
}

export function DistrictOverviewModal({
  isOpen,
  onClose,
  district,
  onReleaseGrant,
  hospitals,
}: DistrictOverviewModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !district || !mounted) return null

  // Filter facilities belonging to this district
  const districtFacilities = hospitals.filter(
    (h) =>
      (h.district && h.district.toLowerCase().includes(district.districtName.toLowerCase())) ||
      h.name.toLowerCase().includes(district.districtName.toLowerCase())
  )

  const displayFacilities = districtFacilities.length > 0 ? districtFacilities : hospitals.slice(0, 4)

  const modalElement = (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-md font-sans text-stone-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-stone-200/90 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200/80 bg-stone-50/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                <Building2 className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight text-[#382416]">
                    {district.districtName} District Healthcare Overview
                  </h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      district.status === 'CRITICAL_SURGE'
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : district.status === 'MODERATE_STRAIN'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {district.status === 'CRITICAL_SURGE'
                      ? 'Critical Surge'
                      : district.status === 'MODERATE_STRAIN'
                      ? 'Moderate Strain'
                      : 'Nominal'}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  State Health Command Macro Summary · Population {district.population} · {district.hospitalCount} Facilities
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

          {/* Body */}
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* 4-Card District Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <span className="text-stone-500 font-semibold block text-[10px] uppercase">Allocated Budget</span>
                <span className="font-extrabold text-[#382416] text-base">₹{district.totalBudgetCr.toFixed(2)} Cr</span>
                <span className="text-[10px] text-emerald-700 block mt-0.5">₹{district.releasedBudgetCr.toFixed(2)} Cr Released</span>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <span className="text-stone-500 font-semibold block text-[10px] uppercase">Remaining Quota</span>
                <span className="font-extrabold text-orange-700 text-base">
                  ₹{(district.totalBudgetCr - district.releasedBudgetCr).toFixed(2)} Cr
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">Contingency</span>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <span className="text-stone-500 font-semibold block text-[10px] uppercase">Capacity Load</span>
                <span className={`font-extrabold text-base ${district.capacityLoadPct >= 80 ? 'text-red-700' : 'text-stone-900'}`}>
                  {district.capacityLoadPct}%
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">Bed Occupancy</span>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <span className="text-stone-500 font-semibold block text-[10px] uppercase">Queued Patients</span>
                <span className="font-extrabold text-rose-700 text-base">{district.queuedPatients} Queued</span>
                <span className="text-[10px] text-stone-500 block mt-0.5">High Acuity</span>
              </div>
            </div>

            {/* Key Facilities Snapshot */}
            <div className="rounded-xl border border-stone-200/90 bg-white p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#382416] flex items-center gap-1.5">
                  <Activity className="size-3.5 text-stone-500" />
                  Key Healthcare Facilities in {district.districtName}
                </h4>
                <span className="text-[11px] text-stone-500">{displayFacilities.length} Facilities Telemetry</span>
              </div>

              <div className="space-y-2">
                {displayFacilities.map((h) => {
                  const load = Math.round(occupancyRatio(h.beds) * 100)
                  return (
                    <div
                      key={h.id}
                      className="p-2.5 rounded-lg border border-stone-200/80 bg-stone-50/50 flex items-center justify-between text-xs gap-3"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-stone-900 truncate">{h.name}</div>
                        <div className="text-[10px] text-stone-500">
                          {h.beds.used}/{h.beds.total} Beds · {h.icuBeds.used}/{h.icuBeds.total} ICU · {h.ventilators.used}/{h.ventilators.total} Vents
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16 h-1.5 rounded-full bg-stone-200 overflow-hidden hidden sm:block">
                          <div
                            className={`h-full rounded-full ${
                              load >= 85 ? 'bg-red-500' : load >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${load}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[10px] border ${
                            load >= 85
                              ? 'bg-red-100 text-red-800 border-red-300'
                              : load >= 70
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          }`}
                        >
                          {load}% Load
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Governance Recommendation Summary */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3.5 text-xs text-stone-700 leading-relaxed">
              <span className="font-bold text-stone-900 block mb-1">State Health Command Assessment:</span>
              {district.status === 'CRITICAL_SURGE' ? (
                <span>
                  {district.districtName} is currently experiencing critical emergency admission pressure. Immediate state release of remaining budget allocation and mobilization of emergency ICU quotas is strongly recommended.
                </span>
              ) : district.status === 'MODERATE_STRAIN' ? (
                <span>
                  {district.districtName} facilities are managing moderate seasonal patient inflows. District CMO has sufficient authority to rebalance inter-facility resources.
                </span>
              ) : (
                <span>
                  {district.districtName} healthcare operations are running within nominal capacity limits (&lt; 70% occupancy). No emergency state intervention required at this time.
                </span>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-stone-200/80 bg-stone-50/80 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Close
            </button>

            {onReleaseGrant && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onReleaseGrant(district)
                }}
                className="rounded-xl bg-[#ea580c] hover:bg-[#c2410c] text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <IndianRupee className="size-3.5" />
                <span>Release Emergency District Grant</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return createPortal(modalElement, document.body)
}
