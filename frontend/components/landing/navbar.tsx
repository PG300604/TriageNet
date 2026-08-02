'use client'

import React from 'react'
import Link from 'next/link'
import { Activity, ArrowRight, ShieldCheck, ShieldPlus } from 'lucide-react'

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8 font-sans">
      <div className="mx-auto max-w-7xl">
        <nav className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white/90 p-3.5 backdrop-blur-xl shadow-md">
          {/* Brand Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-300 transition-all duration-300 group-hover:scale-105">
              <ShieldPlus className="size-6 transition-transform duration-300 group-hover:rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900">
                  Triage<span className="text-emerald-600">Net</span>
                </span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 border border-emerald-300 uppercase tracking-wider">
                  Healthcare SaaS
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">
                Resource Allocation & Patient Telemetry System
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden items-center gap-8 md:flex">
            <a
              href="#problem"
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
            >
              The Bottleneck
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
            >
              Sequence
            </a>
            <a
              href="#algorithms"
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
            >
              Four Algorithms
            </a>
            <a
              href="#metrics"
              className="text-sm font-semibold text-slate-600 transition-colors hover:text-emerald-600"
            >
              Analytics
            </a>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="group relative inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs md:text-sm font-bold text-white shadow-sm transition-all duration-300 hover:bg-emerald-700 hover:shadow-md active:scale-95"
            >
              <ShieldCheck className="size-4" />
              <span>Launch Operational Console</span>
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
