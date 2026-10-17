import React from 'react'
import Link from 'next/link'
import { AlertOctagon, ArrowLeft, Home, PhoneCall, ShieldAlert, Radio } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 selection:bg-[#491205] selection:text-white">
      {/* Background Accent Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#491205]/20 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-red-950/15 blur-3xl rounded-full" />
      </div>

      <div className="relative z-10 max-w-lg w-full text-center space-y-6">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-950/40 border border-red-800/40 text-red-400 text-xs font-mono uppercase tracking-wider">
          <AlertOctagon className="w-3.5 h-3.5 text-red-500 animate-pulse" />
          <span>Clinical Route 404 · Signal Lost</span>
        </div>

        {/* 404 Headline */}
        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-stone-100 via-stone-300 to-red-400">
            404
          </h1>
          <h2 className="text-xl font-bold tracking-tight text-stone-200">
            Emergency Telemetry Route Not Found
          </h2>
          <p className="text-sm text-stone-400 leading-relaxed max-w-md mx-auto">
            The requested clinical station or ward path does not exist in the TriageNet registry.
            Please re-route to the State Command Center or verify your operational credentials.
          </p>
        </div>

        {/* Navigation Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#491205] hover:bg-[#5c1706] text-white font-medium text-sm transition-all shadow-lg shadow-black/40 border border-red-700/30 active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return to Command Center</span>
          </Link>
          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white font-medium text-sm border border-stone-800 transition-all active:scale-95"
          >
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Live Triage Dashboard</span>
          </Link>
        </div>

        {/* Quick Emergency Helplines Pill */}
        <div className="mt-8 pt-6 border-t border-stone-900/80 text-xs text-stone-400 space-y-2">
          <div className="flex items-center justify-center gap-1.5 text-stone-400 font-mono">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Immediate Emergency Helplines (Jharkhand 24-Districts)</span>
          </div>
          <div className="flex items-center justify-center gap-4 text-stone-300 font-mono">
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-red-400" />
              <strong>108</strong> (Ambulance)
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-emerald-400" />
              <strong>104</strong> (Health Desk)
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-sky-400" />
              <strong>112</strong> (Police ERSS)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
