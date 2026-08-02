'use client'

import React, { useState } from 'react'
import { type TriageState, type Hospital } from '@/lib/triage-data'
import { Boxes, Wind, BedDouble, Stethoscope, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw, Activity, Droplets } from 'lucide-react'

interface SuppliesViewProps {
  state: TriageState
  onStateChange?: (next: TriageState) => void
}

interface SupplyRequest {
  id: string
  fromHospital: string
  toHospital: string
  item: string
  quantity: number
  status: 'Pending Coordinator Approval' | 'Approved & Transferred'
}

export function SuppliesView({ state, onStateChange }: SuppliesViewProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>(state.hospitals)
  const [requests, setRequests] = useState<SupplyRequest[]>([
    { id: 'REQ-101', fromHospital: 'City General', toHospital: 'Riverside Medical', item: 'Ventilators', quantity: 3, status: 'Pending Coordinator Approval' },
    { id: 'REQ-102', fromHospital: 'North District Hospital', toHospital: "St. Mary's", item: 'ICU Beds', quantity: 4, status: 'Pending Coordinator Approval' },
    { id: 'REQ-103', fromHospital: 'City General', toHospital: 'Riverside Medical', item: 'O+ Blood Packs', quantity: 10, status: 'Pending Coordinator Approval' },
  ])
  const [lastEvent, setLastEvent] = useState<string | null>(null)

  const handleApproveRequest = (reqId: string) => {
    const req = requests.find((r) => r.id === reqId)
    if (!req) return

    // Reallocate supplies in real time between hospitals
    const updated = hospitals.map((h) => {
      if (h.name === req.fromHospital) {
        // Target hospital receives equipment (increases total capacity)
        if (req.item.includes('Ventilators')) {
          return { ...h, ventilators: { ...h.ventilators, total: h.ventilators.total + req.quantity } }
        }
        if (req.item.includes('ICU Beds')) {
          return { ...h, beds: { ...h.beds, total: h.beds.total + req.quantity } }
        }
      }
      if (h.name === req.toHospital) {
        // Donor hospital transfers equipment (decreases total capacity)
        if (req.item.includes('Ventilators')) {
          return { ...h, ventilators: { ...h.ventilators, total: Math.max(1, h.ventilators.total - req.quantity) } }
        }
        if (req.item.includes('ICU Beds')) {
          return { ...h, beds: { ...h.beds, total: Math.max(1, h.beds.total - req.quantity) } }
        }
      }
      return h
    })

    setHospitals(updated)
    setRequests((prev) =>
      prev.map((r) => (r.id === reqId ? { ...r, status: 'Approved & Transferred' as const } : r))
    )
    setLastEvent(`REALLOCATION APPROVED: Transferred ${req.quantity} ${req.item} from ${req.toHospital} ➔ ${req.fromHospital} in real time!`)

    if (onStateChange) {
      onStateChange({ ...state, hospitals: updated })
    }
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="size-5 text-emerald-600" />
            Regional Supply Inventory & Dynamic Resource Reallocation
          </h2>
          <p className="text-xs text-slate-500">
            Real-time equipment tracking across all 4 regional hospitals with one-click inter-hospital supply transfer approval.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
          Real-Time Regional Sync Active
        </span>
      </div>

      {/* Event Message Banner */}
      {lastEvent && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-mono font-bold text-emerald-900 flex items-center justify-between shadow-xs">
          <span>{lastEvent}</span>
          <span className="text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-300">UPDATED LIVE</span>
        </div>
      )}

      {/* INTER-HOSPITAL SUPPLY REQUEST FLAGGING & APPROVAL PANEL */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-600" />
            Hospital Supply Need Flagging & One-Click Approval System
          </h3>
          <span className="text-xs font-mono text-slate-500">Coordinator Dispatches</span>
        </div>

        <div className="space-y-3">
          {requests.map((req) => (
            <div
              key={req.id}
              className={`flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border transition-all ${
                req.status === 'Approved & Transferred'
                  ? 'border-emerald-200 bg-emerald-50/60'
                  : 'border-amber-200 bg-amber-50/60'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">{req.fromHospital} Flagged Need</span>
                  <span className="text-xs font-mono text-slate-500">({req.id})</span>
                  <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    +{req.quantity} {req.item} Needed
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-sans mt-0.5">
                  <span>Donor Facility: <strong>{req.toHospital}</strong></span>
                  <ArrowRight className="size-3 text-slate-400" />
                  <span>Recipient: <strong>{req.fromHospital}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {req.status === 'Pending Coordinator Approval' ? (
                  <button
                    type="button"
                    onClick={() => handleApproveRequest(req.id)}
                    className="rounded-xl bg-emerald-600 px-4 py-2 font-mono text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                  >
                    Approve & Transfer Supply Live
                  </button>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-bold font-mono text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    Transferred & Synced
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REAL-TIME INVENTORY MATRIX FOR ALL HOSPITALS */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">
          Live Inventory Telemetry Across All Regional Facilities
        </h3>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {hospitals.map((h) => {
            const bedPct = Math.round((h.beds.used / h.beds.total) * 100)
            const ventPct = Math.round((h.ventilators.used / h.ventilators.total) * 100)

            return (
              <div key={h.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-base font-bold text-slate-900">{h.name}</h4>
                      <span className="text-xs text-slate-500">Facility Code: {h.short}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Live Telemetry
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 border-y border-slate-200/80 py-3 text-center font-mono my-3">
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{h.beds.used}/{h.beds.total}</span>
                      <span className="text-[10px] text-slate-500 font-sans">ICU Beds ({bedPct}%)</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{h.ventilators.used}/{h.ventilators.total}</span>
                      <span className="text-[10px] text-slate-500 font-sans">Ventilators ({ventPct}%)</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{h.specialists.used}/{h.specialists.total}</span>
                      <span className="text-[10px] text-slate-500 font-sans">Specialists</span>
                    </div>
                  </div>

                  <div className="space-y-2 font-mono text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1.5">
                        <Droplets className="size-3.5 text-red-500" />
                        Blood Bank Supply (O+ / A+)
                      </span>
                      <span className="font-bold text-slate-900">32 Units Available</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="flex items-center gap-1.5">
                        <Wind className="size-3.5 text-blue-500" />
                        High-Flow Oxygen Tanks
                      </span>
                      <span className="font-bold text-slate-900">45 Cylinder Capacity</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
