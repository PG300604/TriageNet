'use client'

import React from 'react'
import { FileText, Search, ShieldCheck, Download } from 'lucide-react'

export function DocsView() {
  const docs = [
    { title: 'Emergency Intake Record #104', type: 'EHR Clinical Summary', date: 'Feb 17, 2026', doctor: 'Dr. Sarah Jenkins' },
    { title: 'Logistic Regression Model Weights Export', type: 'ML Analytics Log', date: 'Feb 17, 2026', doctor: 'System Engine' },
    { title: 'Regional Load Referral Authorization #T-402', type: 'Transfer Protocol', date: 'Feb 16, 2026', doctor: 'Dr. Aris Thorne' },
  ]

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="size-5 text-emerald-600" />
            Medical Records & EHR Documents
          </h2>
          <p className="text-xs text-slate-500">Centralized patient records, clinical summaries, and ML telemetry logs.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
        {docs.map((doc, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div>
              <span className="text-sm font-bold text-slate-900 block">{doc.title}</span>
              <span className="text-xs text-slate-500">{doc.type} · {doc.doctor} · {doc.date}</span>
            </div>
            <button type="button" className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
              <Download className="size-3.5" /> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
