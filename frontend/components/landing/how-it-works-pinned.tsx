'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Activity, Cpu, Network, Sparkles, CheckCircle2, ArrowRight, Layers } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const STEPS = [
  {
    number: '01',
    title: 'Patient Intake & Severity Scoring',
    badge: 'Offline Logistic Regression',
    description:
      'Patient vitals (heart rate, SpO₂, blood pressure, age, symptoms) are evaluated through an embedded 7-feature logistic regression model. Outputs an explainable severity score (0–100) with top clinical risk drivers.',
    icon: Activity,
  },
  {
    number: '02',
    title: 'Dynamic Priority Queue with Decay',
    badge: 'O(log n) Heap Scheduler',
    description:
      'Patients enter a per-hospital priority queue ordered by effective priority: P = Severity + 0.45(Wait Minutes). Periodic background jobs recompute priority decay, escalating long-waiting patients automatically.',
    icon: Cpu,
  },
  {
    number: '03',
    title: 'Resource Assignment Engine',
    badge: 'Hungarian Bipartite Matching (O(n³))',
    description:
      'When beds, ventilators, or specialists free up, the hand-implemented Hungarian algorithm matches available resources against waiting patients in optimal batches, satisfying hard blood-type and specialty constraints.',
    icon: Layers,
  },
  {
    number: '04',
    title: 'Regional Overflow Routing',
    badge: "Dijkstra Shortest-Path Graph Engine",
    description:
      'When a local hospital reaches 100% capacity, the regional graph router evaluates directed hospital edges to compute the fastest transfer path to the nearest facility with verified open capacity.',
    icon: Network,
  },
]

export function HowItWorksPinned() {
  const containerRef = useRef<HTMLDivElement>(null)
  const pinRef = useRef<HTMLDivElement>(null)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: 'bottom bottom',
        pin: pinRef.current,
        pinSpacing: false,
        onUpdate: (self) => {
          const stepIndex = Math.min(
            STEPS.length - 1,
            Math.floor(self.progress * STEPS.length)
          )
          setActiveStep(stepIndex)
        },
      })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="how-it-works"
      ref={containerRef}
      className="relative w-full bg-slate-950 landing-dark border-t border-white/10"
    >
      <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-32">
        {/* Section Header */}
        <div className="mb-16 text-center">
          <span className="skeu-chip inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300">
            <Sparkles className="size-3.5 text-cyan-400" />
            <span>End-to-End Sequence</span>
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Four Steps of <span className="text-gradient-cyan">Algorithmic Precision</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-400 max-w-2xl mx-auto font-sans">
            Scroll down to walk through the exact mathematical sequence that turns intake vitals into optimal regional patient placement.
          </p>
        </div>

        {/* Pinned Layout */}
        <div className="relative grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 items-start">
          {/* Left Column: Scrollable Step Items */}
          <div className="space-y-24 lg:col-span-6 lg:pb-32">
            {STEPS.map((step, idx) => {
              const Icon = step.icon
              const isActive = activeStep === idx
              return (
                <div
                  key={step.number}
                  className={`skeu-raised group relative rounded-3xl border p-8 transition-all duration-500 ${
                    isActive
                      ? 'border-cyan-400/50 bg-slate-900/95 shadow-[0_0_50px_rgba(6,182,212,0.2)] scale-[1.02]'
                      : 'border-white/10 bg-slate-900/50 opacity-60 hover:opacity-90'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-3xl font-black text-cyan-400">
                      {step.number}
                    </span>
                    <span className="skeu-chip rounded-full bg-cyan-500/10 px-3 py-1 font-mono text-xs font-semibold text-cyan-300 border border-cyan-500/30">
                      {step.badge}
                    </span>
                  </div>

                  <h3 className="mt-6 text-2xl font-bold text-white flex items-center gap-3">
                    <Icon className="size-6 text-cyan-400" />
                    {step.title}
                  </h3>

                  <p className="mt-4 text-sm md:text-base text-slate-300 leading-relaxed font-sans">
                    {step.description}
                  </p>

                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-cyan-400 font-mono">
                    <span>ALGORITHM PHASE {step.number} ACTIVE</span>
                    <ArrowRight className="size-3.5" />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Pinned Skeuomorphic Telemetry Screen */}
          <div className="hidden lg:block lg:col-span-6 lg:sticky lg:top-32" ref={pinRef}>
            <div className="skeu-raised relative rounded-3xl border border-cyan-500/35 bg-slate-950/95 p-6 md:p-8 shadow-[0_30px_90px_rgba(0,0,0,0.9)] backdrop-blur-2xl overflow-hidden min-h-[500px] flex flex-col justify-between">
              {/* Header Bar */}
              <div className="skeu-side-raised flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/90 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
                    STEP {STEPS[activeStep].number} // TELEMETRY MONITOR
                  </span>
                </div>
                <span className="font-mono text-xs text-slate-400">
                  {STEPS[activeStep].badge}
                </span>
              </div>

              {/* Inset Screen Body */}
              <div className="skeu-inset my-5 flex-1 rounded-2xl border border-white/10 bg-slate-950 p-5 flex flex-col justify-center">
                {activeStep === 0 && (
                  <div className="space-y-4 font-mono">
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                      <div className="flex justify-between items-center text-xs text-cyan-300 mb-2 font-bold">
                        <span>CLINICAL INPUT VITALS</span>
                        <span>Patient P-2041</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded bg-slate-900 p-2 text-slate-200">SpO₂: 86% (Severe Hypoxia)</div>
                        <div className="rounded bg-slate-900 p-2 text-slate-200">Heart Rate: 118 bpm</div>
                        <div className="rounded bg-slate-900 p-2 text-slate-200">BP: 145/92 mmHg</div>
                        <div className="rounded bg-slate-900 p-2 text-slate-200">Age: 62 y/o</div>
                      </div>
                    </div>
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <div className="flex justify-between text-sm font-bold text-white mb-2">
                        <span>SEVERITY SCORE COMPUTED</span>
                        <span className="text-emerald-400 text-xl font-extrabold">88 / 100</span>
                      </div>
                      <p className="text-xs text-slate-300 font-sans">
                        Factor Breakdown: Hypoxia (+38%), Tachycardia (+24%), Age Risk (+14%)
                      </p>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="text-xs text-slate-400 font-sans mb-1">
                      Dynamic Priority Decay Re-ordering:
                    </div>
                    <div className="skeu-raised flex items-center justify-between rounded-xl border border-red-500/40 bg-red-950/40 p-3">
                      <div>
                        <span className="font-bold text-white">#1 P-2101 · Blast Trauma (MCI)</span>
                        <p className="text-[11px] text-red-300 font-sans">Acuity 95 + Wait 4m = P:97</p>
                      </div>
                      <span className="skeu-chip rounded bg-red-500 px-2.5 py-1 text-white font-bold">P: 97</span>
                    </div>
                    <div className="skeu-raised flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-950/40 p-3">
                      <div>
                        <span className="font-bold text-white">#2 P-2041 · Alan Whitfield</span>
                        <p className="text-[11px] text-amber-300 font-sans">Acuity 72 + Wait 42m(x0.45) = P:91</p>
                      </div>
                      <span className="skeu-chip rounded bg-amber-500/80 px-2.5 py-1 text-white font-bold">P: 91</span>
                    </div>
                    <div className="skeu-raised flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/60 p-3 text-slate-400">
                      <div>
                        <span className="text-slate-200">#3 P-2052 · Priya Nadella</span>
                        <p className="text-[11px] font-sans">Acuity 41 + Wait 12m = P:46</p>
                      </div>
                      <span className="skeu-chip rounded bg-slate-700 px-2.5 py-1 text-slate-200 font-bold">P: 46</span>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-3 font-mono">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                      <div className="flex justify-between items-center text-xs text-emerald-300 mb-2 font-bold">
                        <span>HUNGARIAN BIPARTITE MATCHING</span>
                        <span className="text-emerald-400">O(n³) Minimum Cost</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between rounded bg-slate-900 p-2 text-slate-200">
                          <span>Patient #2101 (O+) ➔ ICU Bed #04</span>
                          <span className="text-emerald-400 font-bold">Cost: 0.12</span>
                        </div>
                        <div className="flex justify-between rounded bg-slate-900 p-2 text-slate-200">
                          <span>Patient #2041 ➔ Ventilator #02</span>
                          <span className="text-emerald-400 font-bold">Cost: 0.18</span>
                        </div>
                        <div className="flex justify-between rounded bg-slate-900 p-2 text-slate-200">
                          <span>Patient #4007 ➔ Neuro Specialist #01</span>
                          <span className="text-emerald-400 font-bold">Cost: 0.22</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                      <div className="flex justify-between text-cyan-300 font-bold mb-2">
                        <span>REGIONAL GRAPH ROUTER</span>
                        <span>DIJKSTRA SOLVER</span>
                      </div>
                      <div className="space-y-2">
                        <div className="rounded bg-slate-900 p-2.5 text-slate-300">
                          <div className="flex justify-between text-white font-bold mb-1">
                            <span>City General (Local Hospital)</span>
                            <span className="text-red-400">100% Full (0 Beds)</span>
                          </div>
                          <p className="text-[11px] font-sans text-slate-400">
                            Evaluating transfer edges: St. Mary's (15m), Riverside (12m), North (9m)
                          </p>
                        </div>
                        <div className="rounded bg-emerald-950/60 border border-emerald-500/40 p-2.5 text-emerald-300">
                          <div className="flex justify-between font-bold mb-1">
                            <span>Target: Riverside Medical</span>
                            <span className="font-mono">12 min transfer</span>
                          </div>
                          <p className="text-[11px] font-sans text-emerald-200/80">
                            Shortest transfer path verified with 18 open capacity beds
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Monitor Footer */}
              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-cyan-400" />
                  Algorithm Output Verified
                </span>
                <span className="text-cyan-400">Step {activeStep + 1} / 4</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
