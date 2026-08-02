'use client'

import React from 'react'
import Link from 'next/link'
import { Activity, ArrowRight, ExternalLink, ShieldCheck, Code2 } from 'lucide-react'

export function CtaFooter() {
  return (
    <footer className="relative w-full overflow-hidden bg-slate-950 pt-20 pb-12 landing-dark border-t border-white/10">
      {/* Glow ambient background */}
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-cyan-500/10 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        {/* Main Skeuomorphic CTA Console Box */}
        <div className="skeu-raised relative rounded-3xl border border-cyan-500/40 bg-radial-grid p-8 md:p-16 text-center backdrop-blur-2xl shadow-[0_30px_90px_rgba(6,182,212,0.2)]">
          <div className="mx-auto max-w-3xl">
            <div className="skeu-chip inline-flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-6">
              <Activity className="size-7" />
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
              Experience the Live <span className="text-gradient-cyan">Triage Simulator</span>
            </h2>

            <p className="mt-4 text-base md:text-lg text-slate-300 font-sans">
              Run real-time scenario stress tests — trigger Mass Casualty Incidents, watch Hungarian resource matching live, and inspect Dijkstra overflow routing.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/dashboard"
                className="skeu-raised skeu-pressable group relative flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl border border-cyan-400/40 bg-cyan-500 px-8 py-4 text-sm font-bold text-slate-950 transition-all duration-300 hover:bg-cyan-400 hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] active:scale-95"
              >
                <ShieldCheck className="size-5" />
                <span>Launch Operational Console</span>
                <ArrowRight className="size-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Meta Details */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 sm:flex-row text-xs text-slate-400 font-sans">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">TriageNet</span>
            <span>·</span>
            <span>Final Year B.Tech CSBS Project by Priyanshu Ghosh</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/PG300604"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-cyan-400"
            >
              <Code2 className="size-4" />
              <span>GitHub (PG300604)</span>
            </a>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 transition-colors hover:text-cyan-400 font-semibold"
            >
              <span>Live Console</span>
              <ExternalLink className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
