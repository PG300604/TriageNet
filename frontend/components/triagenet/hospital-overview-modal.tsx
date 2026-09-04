'use client'

import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  X,
  BedDouble,
  HeartPulse,
  Wind,
  Stethoscope,
  CheckCircle2,
  Activity,
  IndianRupee,
} from 'lucide-react'
import { occupancyRatio, type Hospital } from '@/lib/triage-data'

interface HospitalOverviewModalProps {
  isOpen: boolean
  onClose: () => void
  hospital: Hospital | null
  onAuthorizeReallocation?: (hospital: Hospital) => void
}

export function HospitalOverviewModal({
  isOpen,
  onClose,
  hospital,
  onAuthorizeReallocation,
}: HospitalOverviewModalProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!isOpen || !hospital || !mounted) return null

  const loadPct = Math.round(occupancyRatio(hospital.beds) * 100)
  const icuLoadPct = Math.round((hospital.icuBeds.used / (hospital.icuBeds.total || 1)) * 100)
  const ventLoadPct = Math.round((hospital.ventilators.used / (hospital.ventilators.total || 1)) * 100)

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
          <div className="flex items-center justify-between border-b border-stone-200/80 bg-stone-50/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                <Building2 className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight text-[#382416]">
                    {hospital.name}
                  </h3>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      loadPct >= 85
                        ? 'bg-red-100 text-red-800 border-red-300'
                        : loadPct >= 70
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    {loadPct}% Occupancy
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  District CMO Hospital Overview · {hospital.district || 'District Command'}
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
            {/* 4-Card Capacity Snapshot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                  <BedDouble className="size-3.5 text-orange-600" />
                  <span className="font-semibold text-[10px] uppercase">General Beds</span>
                </div>
                <span className="font-extrabold text-stone-900 text-base">
                  {hospital.beds.used} / {hospital.beds.total}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  {hospital.beds.total - hospital.beds.used} Available
                </span>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                  <HeartPulse className="size-3.5 text-rose-600" />
                  <span className="font-semibold text-[10px] uppercase">ICU Beds</span>
                </div>
                <span className="font-extrabold text-rose-700 text-base">
                  {hospital.icuBeds.used} / {hospital.icuBeds.total}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  {icuLoadPct}% ICU Load
                </span>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                  <Wind className="size-3.5 text-blue-600" />
                  <span className="font-semibold text-[10px] uppercase">Ventilators</span>
                </div>
                <span className="font-extrabold text-blue-700 text-base">
                  {hospital.ventilators.used} / {hospital.ventilators.total}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  {ventLoadPct}% Active
                </span>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3">
                <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                  <Stethoscope className="size-3.5 text-emerald-600" />
                  <span className="font-semibold text-[10px] uppercase">Specialists</span>
                </div>
                <span className="font-extrabold text-emerald-800 text-base">
                  {hospital.specialists.total - hospital.specialists.used} / {hospital.specialists.total}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">Ready on Duty</span>
              </div>
            </div>

            {/* Capacity Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-stone-600">Total Bed Occupancy Ratio</span>
                <span className={loadPct >= 85 ? 'text-red-700 font-bold' : 'text-stone-800'}>
                  {loadPct}%
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-stone-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    loadPct >= 85 ? 'bg-red-500' : loadPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${loadPct}%` }}
                />
              </div>
            </div>

            {/* Operational Assessment */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/60 p-3.5 text-xs text-stone-700 leading-relaxed">
              <span className="font-bold text-stone-900 block mb-1">District CMO Assessment:</span>
              {loadPct >= 85 ? (
                <span>
                  <strong>{hospital.name}</strong> is under severe bed occupancy stress. An emergency reallocation of beds and ventilators from nearby low-occupancy community health centres is advised.
                </span>
              ) : loadPct >= 70 ? (
                <span>
                  <strong>{hospital.name}</strong> is approaching surge thresholds. Monitor active admissions closely.
                </span>
              ) : (
                <span>
                  <strong>{hospital.name}</strong> is operating within safe capacity limits and has surplus beds ready to act as a donor facility for nearby strained hospitals.
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

            {onAuthorizeReallocation && loadPct >= 70 && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onAuthorizeReallocation(hospital)
                }}
                className="rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 className="size-3.5" />
                <span>Authorize Live Reallocation</span>
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )

  return createPortal(modalElement, document.body)
}
