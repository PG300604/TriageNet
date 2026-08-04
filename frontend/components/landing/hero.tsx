'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import anime from 'animejs'
import { motion } from 'framer-motion'
import { ArrowUpRight, AlertTriangle, FastForward, RotateCcw } from 'lucide-react'
import { TextReveal } from './motion-primitives/text-reveal'
import { AnimatedECGWaveform } from './motion-primitives/animated-ecg-waveform'

interface InteractivePatient {
  id: string
  name: string
  vitals: string
  acuity: number
  waitMin: number
  status: 'Waiting' | 'Assigned' | 'Preempted' | 'Transferred'
  match: string
}

const BASE_PATIENTS: InteractivePatient[] = [
  { id: 'P-901', name: 'JOHN DOE (BLAST TRAUMA)', vitals: 'AIRWAY COMPROMISE · SpO₂ 78%', acuity: 96, waitMin: 4, status: 'Waiting', match: 'ICU BED #01 (PULMONOLOGIST)' },
  { id: 'P-902', name: 'JANE DOE (CRUSH INJURY)', vitals: 'INTERNAL HEMORRHAGE · HR 145', acuity: 92, waitMin: 2, status: 'Waiting', match: 'VENTILATOR #02 (TRAUMA SURGEON)' },
  { id: 'P-104', name: 'ALAN WHITFIELD', vitals: 'SpO₂ 88% · HR 105', acuity: 74, waitMin: 22, status: 'Waiting', match: 'ROUTE ➔ RIVERSIDE MEDICAL' },
]

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const [patients, setPatients] = useState<InteractivePatient[]>(BASE_PATIENTS)
  const [preemptionNotice, setPreemptionNotice] = useState<string | null>(null)

  // Anime.js entrance timeline
  useEffect(() => {
    const el = heroRef.current
    if (!el) return

    anime.timeline({
      easing: 'cubicBezier(0.16, 1, 0.3, 1)',
    })
    .add({
      targets: '.anime-hero-tagline',
      translateY: [15, 0],
      opacity: [0, 1],
      duration: 600,
    })
    .add({
      targets: '.anime-hero-sub',
      translateY: [20, 0],
      opacity: [0, 1],
      duration: 700,
    }, '-=300')
    .add({
      targets: '.anime-hero-actions',
      translateY: [15, 0],
      opacity: [0, 1],
      duration: 600,
    }, '-=400')
    .add({
      targets: '.anime-hero-card',
      translateY: [35, 0],
      opacity: [0, 1],
      scale: [0.98, 1],
      duration: 800,
    }, '-=400')
  }, [])

  const simulateCriticalArrival = () => {
    const newPt: InteractivePatient = {
      id: 'P-999',
      name: 'CARDIAC ARREST ARRIVAL',
      vitals: 'VFIB · SpO₂ 72% · HR 165',
      acuity: 98,
      waitMin: 0,
      status: 'Assigned',
      match: 'ICU BED #01 (CARDIOLOGIST)',
    }
    setPreemptionNotice('PREEMPTION LOGGED: CARDIAC ARREST ARRIVAL PREEMPTED BED #01 TO STEP-DOWN')
    setPatients((prev) => [newPt, ...prev])
  }

  const fastForwardTime = () => {
    setPatients((prev) =>
      prev.map((p) => ({
        ...p,
        waitMin: p.waitMin + 15,
      }))
    )
  }

  const resetSimulation = () => {
    setPatients(BASE_PATIENTS)
    setPreemptionNotice(null)
  }

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full bg-[#100904] text-[#ffedd7] pt-28 pb-20 md:pt-36 md:pb-28 flex flex-col justify-between overflow-hidden font-sans border-b border-dashed border-[#40372e]"
    >
      {/* Subtle Warm Ember Waves Texture Blend */}
      <div className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay overflow-hidden">
        <Image
          src="/ember-waves.png"
          alt="Ember Waves Background Texture"
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* Edge Branding: Vertical Sidebar Label */}
      <div className="hidden lg:block absolute right-8 top-1/3 rotate-90 origin-right text-[11px] font-medium tracking-widest uppercase text-[#6c5f51] pointer-events-none">
        TRIAGENET // REGIONAL GRAPH SOLVER
      </div>

      <div className="mx-auto max-w-7xl px-6 w-full relative z-10">
        {/* Upper Lockup */}
        <div className="max-w-4xl">
          {/* Tagline */}
          <p className="anime-hero-tagline text-xs font-medium uppercase tracking-wider text-[#ffedd7] mb-3">
            MADE FOR HOSPITALS, BUILT FOR TRIAGE.
          </p>

          {/* Display Headline with Motion Primitives TextReveal */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-medium uppercase tracking-normal leading-[0.9] text-[#ffedd7] mb-8">
            <TextReveal text="INTELLIGENT HEALTHCARE RESOURCE ALLOCATION PLATFORM." />
          </h1>

          {/* Mixed-Case Body Copy */}
          <p className="anime-hero-sub text-lg md:text-2xl font-normal leading-relaxed text-[#ffedd7]/90 max-w-3xl mb-10">
            Unifying multi-hospital vital streams, Hungarian bipartite bed matching, and Dijkstra regional overflow routing into a calm command environment.
          </p>

          {/* Action Controls */}
          <div className="anime-hero-actions flex flex-wrap items-center gap-4">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <Link href="/dashboard" className="oryzo-pill-button inline-flex items-center gap-2">
                <span>LAUNCH CONSOLE</span>
                <ArrowUpRight className="size-4" />
              </Link>
            </motion.div>

            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
              <a href="#how-it-works" className="oryzo-ghost-button inline-flex items-center gap-2">
                <span>EXPLORE ALGORITHMS</span>
              </a>
            </motion.div>
          </div>
        </div>

        {/* Product Reveal Container (Interactive Telemetry Artifact) */}
        <div className="anime-hero-card mt-16 md:mt-20">
          <div className="relative rounded-[12px] border border-dashed border-[#40372e] bg-[#100904] p-6 md:p-8">
            {/* Live ECG Waveform Monitor */}
            <div className="mb-6">
              <AnimatedECGWaveform />
            </div>

            {/* Overlay Notice */}
            {preemptionNotice && (
              <div className="mb-6 p-3 rounded-[12px] border border-[#dc5000] bg-[#dc5000]/10 text-xs font-mono text-[#ffedd7] uppercase flex items-center justify-between">
                <span>{preemptionNotice}</span>
                <span className="text-[#dc5000] font-bold">EVENT LOGGED</span>
              </div>
            )}

            {/* Telemetry Header */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-[#40372e] pb-4">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-[#dc5000] block">
                  * REAL-TIME TRIAGE TELEMETRY
                </span>
                <p className="text-xs font-mono text-[#6c5f51] mt-0.5">
                  SYSTEM ACTIVE · HUNGARIAN MATCHING & DIJKSTRA GRAPH ONLINE
                </p>
              </div>

              {/* Simulation Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={simulateCriticalArrival}
                  className="oryzo-ghost-button !py-1.5 !px-3 text-[11px] flex items-center gap-1.5 cursor-pointer"
                >
                  <AlertTriangle className="size-3 text-[#dc5000]" />
                  <span>PREEMPTION</span>
                </motion.button>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={fastForwardTime}
                  className="oryzo-pill-button !py-1.5 !px-3 text-[11px] flex items-center gap-1.5 cursor-pointer"
                >
                  <FastForward className="size-3" />
                  <span>+15M FAST FORWARD</span>
                </motion.button>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={resetSimulation}
                  className="oryzo-ghost-button !py-1.5 !px-3 text-[11px] cursor-pointer"
                >
                  <RotateCcw className="size-3" />
                </motion.button>
              </div>
            </div>

            {/* Patient Heap Queue */}
            <div className="space-y-3 font-mono">
              {patients.map((p, idx) => {
                const priority = Math.round(p.acuity + p.waitMin * 0.45)
                return (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -2 }}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-[#40372e] bg-[#382416]/20 p-4 transition-colors hover:border-[#ffedd7]/30"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-[#dc5000]">#{idx + 1}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium uppercase text-[#ffedd7]">{p.name}</span>
                          <span className="text-xs text-[#6c5f51]">({p.id})</span>
                        </div>
                        <p className="text-xs text-[#6c5f51] mt-0.5">{p.vitals}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-xs">
                      <div>
                        <span className="text-[10px] text-[#6c5f51] uppercase block">WAIT TIME</span>
                        <span className="text-[#ffedd7] font-medium">{p.waitMin} MIN</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6c5f51] uppercase block">MATCHED BED</span>
                        <span className="text-[#ffedd7] font-medium">{p.match}</span>
                      </div>
                      <div className="border border-[#40372e] px-3 py-1 rounded-[12px] bg-[#100904]">
                        <span className="text-[10px] text-[#6c5f51] uppercase block">PRIORITY</span>
                        <span className="text-[#dc5000] font-bold">P: {priority}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* Micro Legal Footnote */}
            <div className="mt-6 border-t border-dashed border-[#40372e] pt-4 flex justify-between items-center text-[8px] uppercase tracking-wider text-[#6c5f51] font-mono">
              <span>* FINAL YEAR PROJECT PG300604 · AEC CSBS 2027</span>
              <span>DESIGNED BY PRIYANSHU GHOSH</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
