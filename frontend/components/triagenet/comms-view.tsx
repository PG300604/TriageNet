'use client'

import React from 'react'
import { MessageSquare, Siren, Send, CheckCircle2 } from 'lucide-react'

export function CommsView() {
  const messages = [
    { sender: 'Riverside General ICU', text: 'Preparing 2 beds for Dijkstra referral transfer P-901.', time: '11:14 AM' },
    { sender: 'Metro Trauma Dispatch', text: 'Ambulance #12 carrying Cardiac Arrest (P-999) 3 mins away.', time: '11:08 AM' },
    { sender: 'St. Jude Emergency Center', text: 'Ventilator unit #04 freed up following Early Recovery Discharge.', time: '10:45 AM' },
  ]

  return (
    <div className="flex flex-col gap-6 font-sans text-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="size-5 text-emerald-600" />
            Regional Emergency Communications & Dispatches
          </h2>
          <p className="text-xs text-slate-500">Live inter-hospital messaging channel for regional patient transfers and emergency alerts.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <div className="space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold text-slate-900">{m.sender}</span>
                <span className="text-[10px] font-mono text-slate-500">{m.time}</span>
              </div>
              <p className="text-xs text-slate-700 font-medium">{m.text}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Broadcast message to regional triage network..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <button type="button" className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700">
            <Send className="size-3.5" /> Broadcast
          </button>
        </div>
      </div>
    </div>
  )
}
