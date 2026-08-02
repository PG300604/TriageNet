'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Activity, Clock, Layers, Route, ArrowUpRight } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const ALGORITHMS = [
  {
    icon: Activity,
    name: 'Severity Scoring Model',
    mathLabel: 'Logistic Regression',
    plainEnglish:
      'Calculates an instant 0–100 urgency score from patient vitals so doctors know who needs attention first.',
    detail: 'Embedded weights: Sigmoid(W·X + b) with top-3 risk factor explainability.',
    borderGlow: 'hover:border-cyan-400/50 hover:shadow-[0_0_45px_rgba(6,182,212,0.25)]',
  },
  {
    icon: Clock,
    name: 'Priority Queue with Decay',
    mathLabel: 'O(log n) Heap Scheduler',
    plainEnglish:
      'Ensures patients who have been waiting longer automatically move up in priority so nobody is forgotten.',
    detail: 'Periodic priority recalculation: EffectivePriority = Severity + 0.45 × WaitMinutes.',
    borderGlow: 'hover:border-amber-400/50 hover:shadow-[0_0_45px_rgba(245,158,11,0.25)]',
  },
  {
    icon: Layers,
    name: 'Hungarian Assignment Engine',
    mathLabel: 'Bipartite Matching (O(n³))',
    plainEnglish:
      'Matches freed beds and ventilators to waiting patients in optimal batches rather than simple first-come order.',
    detail: 'Solves cost matrix combining patient urgency with blood-type & specialty compatibility.',
    borderGlow: 'hover:border-emerald-400/50 hover:shadow-[0_0_45px_rgba(16,185,129,0.25)]',
  },
  {
    icon: Route,
    name: 'Regional Graph Overflow Router',
    mathLabel: "Dijkstra's Shortest Path",
    plainEnglish:
      'Finds the fastest transfer path to a nearby hospital with open capacity when the local facility is full.',
    detail: 'Models hospitals as graph nodes and transfer times as directed edge weights.',
    borderGlow: 'hover:border-indigo-400/50 hover:shadow-[0_0_45px_rgba(99,102,241,0.25)]',
  },
]

export function AlgorithmShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.18,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 80%',
            },
          }
        )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="algorithms"
      ref={containerRef}
      className="relative w-full bg-slate-950 py-24 md:py-36 landing-dark border-t border-white/10"
    >
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <span className="skeu-chip inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-300">
            <span>Core Computer Science Foundation</span>
          </span>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Four Real Algorithms.{' '}
            <span className="text-gradient-cyan">Zero Shortcuts.</span>
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-400 font-sans">
            Built from scratch to demonstrate true computer science depth — not simple database lookups or CRUD operations.
          </p>
        </div>

        {/* 4 Skeuomorphic Cards Grid */}
        <div ref={cardsRef} className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2">
          {ALGORITHMS.map((algo) => {
            const Icon = algo.icon
            return (
              <div
                key={algo.name}
                className={`skeu-raised group relative rounded-3xl border border-white/15 bg-slate-900/80 p-8 transition-all duration-300 ${algo.borderGlow}`}
              >
                <div className="flex items-start justify-between">
                  <div className="skeu-chip flex size-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-7" />
                  </div>
                  <span className="skeu-chip rounded-full bg-white/5 px-3 py-1 font-mono text-xs font-semibold text-cyan-300 border border-white/10">
                    {algo.mathLabel}
                  </span>
                </div>

                <h3 className="mt-6 text-2xl font-bold text-white flex items-center justify-between">
                  <span>{algo.name}</span>
                  <ArrowUpRight className="size-5 text-slate-500 transition-colors duration-300 group-hover:text-cyan-400" />
                </h3>

                <p className="mt-3 text-base text-slate-200 font-medium leading-relaxed font-sans">
                  {algo.plainEnglish}
                </p>

                <div className="skeu-inset mt-5 rounded-xl border border-white/10 bg-slate-950 p-3.5 font-mono text-xs text-slate-300">
                  {algo.detail}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
