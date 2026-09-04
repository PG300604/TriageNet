'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck,
  X,
  ArrowRight,
  CheckCircle2,
  Building2,
  Boxes,
  Zap,
  IndianRupee,
  BedDouble,
  HeartPulse,
  Wind,
  Layers,
  FileCheck2,
  Clock,
} from 'lucide-react'

export interface SupplyRequisition {
  id: string
  title: string
  tier: 'STATE_GRANT' | 'DISTRICT_TRANSFER' | 'DEPARTMENT_ALLOCATION'
  source: string
  destination: string
  urgency: 'Critical P1' | 'High P2' | 'Moderate P3'
  items: Array<{
    label: string
    value: string
    icon?: 'bed' | 'icu' | 'vent' | 'cash' | 'box'
    highlight?: boolean
  }>
  currentLoad?: number
  projectedLoad?: number
  reliefPct?: number
  clinicalJustification: string
  timestamp?: string
}

interface SupplyApprovalPillModalProps {
  isOpen: boolean
  onClose: () => void
  requisition: SupplyRequisition | null
  onConfirm: (req: SupplyRequisition) => void
}

export function SupplyApprovalPillModal({
  isOpen,
  onClose,
  requisition,
  onConfirm,
}: SupplyApprovalPillModalProps) {
  const [isAuthorizing, setIsAuthorizing] = useState(false)

  if (!isOpen || !requisition) return null

  const handleAuthorize = () => {
    setIsAuthorizing(true)
    setTimeout(() => {
      setIsAuthorizing(false)
      onConfirm(requisition)
      onClose()
    }, 250)
  }

  const urgencyColor =
    requisition.urgency === 'Critical P1'
      ? 'bg-rose-100 text-rose-800 border-rose-300'
      : requisition.urgency === 'High P2'
      ? 'bg-amber-100 text-amber-800 border-amber-300'
      : 'bg-emerald-100 text-emerald-800 border-emerald-300'

  const tierBadge =
    requisition.tier === 'STATE_GRANT'
      ? { label: 'State Directorate ➔ District Grant', color: 'bg-orange-100 text-[#ea580c] border-orange-300' }
      : requisition.tier === 'DISTRICT_TRANSFER'
      ? { label: 'District CMO ➔ Inter-Hospital Share', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' }
      : { label: 'Medical Supt ➔ Department Allocation', color: 'bg-teal-100 text-teal-800 border-teal-300' }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs font-sans text-stone-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 0.95, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-xl rounded-2xl bg-white shadow-2xl border border-stone-200/90 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200/80 bg-stone-50/80 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-orange-100 text-[#ea580c]">
                <FileCheck2 className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold tracking-tight text-[#382416]">
                    Requisition Authorization Review
                  </h3>
                  <span className="font-mono text-xs font-bold text-stone-600 bg-stone-200/70 px-2 py-0.5 rounded-md">
                    {requisition.id}
                  </span>
                </div>
                <p className="text-xs text-stone-500">
                  Clinical & fiscal governance clearance required prior to disbursement
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
          <div className="p-6 space-y-5">
            {/* Tier & Urgency Badges */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${tierBadge.color}`}>
                <Layers className="size-3.5" />
                {tierBadge.label}
              </span>

              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${urgencyColor}`}>
                <Zap className="size-3.5" />
                {requisition.urgency}
              </span>
            </div>

            {/* Source to Recipient Route Card */}
            <div className="rounded-xl border border-stone-200/90 bg-stone-50/70 p-4">
              <div className="flex items-center justify-between gap-3 text-xs">
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Source Authority / Donor
                  </span>
                  <div className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                    <Building2 className="size-4 text-stone-500 shrink-0" />
                    <span>{requisition.source}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center shrink-0 px-2">
                  <div className="size-7 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-[#ea580c]">
                    <ArrowRight className="size-4" />
                  </div>
                  <span className="text-[9px] font-semibold text-stone-400 mt-0.5">TRANSFER</span>
                </div>

                <div className="flex-1 space-y-1 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                    Target Recipient Facility / Dept
                  </span>
                  <div className="font-bold text-stone-900 text-sm flex items-center justify-end gap-1.5">
                    <span>{requisition.destination}</span>
                    <Building2 className="size-4 text-[#ea580c] shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            {/* Allocated Resources Breakdown (Pills) */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2">
                Allocated Resource Package
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {requisition.items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-3 border text-xs ${
                      item.highlight
                        ? 'bg-orange-50 border-orange-300 text-stone-900'
                        : 'bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                      {item.icon === 'vent' ? (
                        <Wind className="size-3.5 text-blue-600" />
                      ) : item.icon === 'icu' ? (
                        <HeartPulse className="size-3.5 text-rose-600" />
                      ) : item.icon === 'bed' ? (
                        <BedDouble className="size-3.5 text-orange-600" />
                      ) : item.icon === 'cash' ? (
                        <IndianRupee className="size-3.5 text-emerald-600" />
                      ) : (
                        <Boxes className="size-3.5 text-stone-600" />
                      )}
                      <span className="text-[10px] font-semibold uppercase">{item.label}</span>
                    </div>
                    <div className="font-extrabold text-sm text-[#382416]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Capacity Relief Metric Pill */}
            {requisition.currentLoad !== undefined && requisition.projectedLoad !== undefined && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <span className="font-bold text-emerald-950">Capacity Relief Impact:</span>
                  <span className="text-emerald-900">
                    <strong className="text-rose-700">{requisition.currentLoad}%</strong> ➔{' '}
                    <strong className="text-emerald-700">{requisition.projectedLoad}%</strong> Occupancy
                  </span>
                </div>
                {requisition.reliefPct !== undefined && (
                  <span className="font-extrabold text-xs px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-2xs">
                    -{requisition.reliefPct}% Relief
                  </span>
                )}
              </div>
            )}

            {/* Clinical Justification Rationale */}
            <div className="rounded-xl border border-stone-200/80 bg-stone-50/50 p-3.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-1">
                Clinical & Administrative Justification
              </span>
              <p className="text-xs text-stone-700 leading-relaxed">
                {requisition.clinicalJustification}
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-stone-200/80 bg-stone-50/80 px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isAuthorizing}
              className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            >
              Dismiss
            </button>

            <button
              type="button"
              onClick={handleAuthorize}
              disabled={isAuthorizing}
              className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white px-5 py-2 text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="size-4" />
              <span>{isAuthorizing ? 'Authorizing Live...' : 'Authorize & Disburse Live'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
