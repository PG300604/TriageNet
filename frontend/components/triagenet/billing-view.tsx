'use client'

import React, { useState } from 'react'
import { BadgePercent, TrendingUp, DollarSign, FileText, CheckCircle2, ShieldCheck, AlertCircle, RefreshCw, ArrowUpRight } from 'lucide-react'

interface InsuranceClaim {
  id: string
  patientName: string
  hospitalName: string
  amount: number
  severity: number
  insuranceProvider: string
  status: 'Pending Verification' | 'Approved' | 'Flagged for Audit'
}

export function BillingView() {
  const [totalRevenue, setTotalRevenue] = useState(184250)
  const [approvedCount, setApprovedCount] = useState(98.4)

  const [claims, setClaims] = useState<InsuranceClaim[]>([
    { id: 'CLM-9041', patientName: 'Alan Whitfield', hospitalName: 'City General', amount: 3200, severity: 88, insuranceProvider: 'BlueCross Health', status: 'Pending Verification' },
    { id: 'CLM-9042', patientName: 'Sofia Márquez', hospitalName: 'Riverside Medical', amount: 2450, severity: 76, insuranceProvider: 'United Healthcare', status: 'Pending Verification' },
    { id: 'CLM-9043', patientName: 'Owen Barrett', hospitalName: "St. Mary's", amount: 4100, severity: 91, insuranceProvider: 'Aetna Global', status: 'Pending Verification' },
    { id: 'CLM-9044', patientName: 'Priya Nadella', hospitalName: 'City General', amount: 1150, severity: 41, insuranceProvider: 'Kaiser Permanente', status: 'Pending Verification' },
  ])

  const handleApprove = (id: string, amount: number) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Approved' as const } : c))
    )
    setTotalRevenue((prev) => prev + amount)
  }

  const handleFlag = (id: string) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: 'Flagged for Audit' as const } : c))
    )
  }

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BadgePercent className="size-5 text-emerald-600" />
            Billing & Financial Revenue Telemetry
          </h2>
          <p className="text-xs text-slate-500">
            Real-time emergency insurance verification, automated claim payouts, and clinical revenue tracking.
          </p>
        </div>

        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
          Auto-Claim Verification Engine Active
        </span>
      </div>

      {/* METRIC CARDS GRID */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Total Revenue (Today)</span>
          <span className="text-3xl font-extrabold font-mono text-slate-900">${totalRevenue.toLocaleString()}</span>
          <span className="text-xs text-emerald-600 font-bold block mt-1">+14.2% Auto-Approved</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Auto Claims Verified</span>
          <span className="text-3xl font-extrabold font-mono text-emerald-600">{approvedCount}%</span>
          <span className="text-xs text-slate-500 font-medium block mt-1">Instant Verification</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Pending Approvals</span>
          <span className="text-3xl font-extrabold font-mono text-amber-600">
            {claims.filter((c) => c.status === 'Pending Verification').length} Claims
          </span>
          <span className="text-xs text-amber-600 font-bold block mt-1">Requires Approval</span>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs text-slate-500 font-semibold block">Avg Cost / Case</span>
          <span className="text-3xl font-extrabold font-mono text-slate-900">$1,420</span>
          <span className="text-xs text-slate-500 font-medium block mt-1">ML Optimized Intake</span>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Interactive Claims Queue */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-7">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="size-5 text-emerald-600" />
              Insurance Claims Queue & One-Click Approval
            </h3>
            <span className="text-xs font-mono text-slate-500">Live Claim Feed</span>
          </div>

          <div className="space-y-3">
            {claims.map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{c.patientName}</span>
                    <span className="text-xs font-mono text-slate-500">({c.id})</span>
                    <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      S: {c.severity}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-sans block mt-0.5">
                    {c.hospitalName} · {c.insuranceProvider} · Claim Amount: <strong>${c.amount.toLocaleString()}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {c.status === 'Pending Verification' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleApprove(c.id, c.amount)}
                        className="rounded-lg bg-emerald-600 px-3 py-1.5 font-mono text-xs font-bold text-white shadow-xs hover:bg-emerald-700 cursor-pointer"
                      >
                        Approve & Pay
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFlag(c.id)}
                        className="rounded-lg bg-amber-100 border border-amber-300 px-3 py-1.5 font-mono text-xs font-bold text-amber-800 hover:bg-amber-200 cursor-pointer"
                      >
                        Flag Audit
                      </button>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-bold font-mono px-3 py-1 rounded-full ${
                        c.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {c.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue Breakdown by Severity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Revenue Breakdown by Triage Tier</h3>
            <p className="text-xs text-slate-500 mb-4">Financial allocation stratified by patient severity risk tier.</p>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-red-700">High Risk (S ≥ 80) Trauma Intake</span>
                  <span className="font-mono text-slate-900">$92,400 (50%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-red-500 w-1/2" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-blue-700">Moderate Risk (S 50-79) Observation</span>
                  <span className="font-mono text-slate-900">$58,100 (32%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-blue-500 w-[32%]" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-700">Low Risk (S &lt; 50) Routine Clinic</span>
                  <span className="font-mono text-slate-900">$33,750 (18%)</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 w-[18%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-slate-50 p-4 border border-slate-200 font-mono text-xs flex justify-between items-center">
            <span>Average Hospital Payout Time</span>
            <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">1.4 Seconds</span>
          </div>
        </div>
      </div>
    </div>
  )
}
