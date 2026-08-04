'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Activity, Clock, Layers, Route, ArrowUpRight } from 'lucide-react'
import { InView } from './motion-primitives/in-view'
import { TextReveal } from './motion-primitives/text-reveal'

const ALGORITHMS = [
  {
    icon: Activity,
    name: 'SEVERITY SCORING MODEL',
    mathLabel: 'LOGISTIC REGRESSION',
    plainEnglish:
      'Calculates an instant 0–100 urgency score from patient vitals so doctors know who needs attention first.',
    detail: 'Sigmoid(W·X + b) with top-3 risk factor explainability attributions.',
  },
  {
    icon: Clock,
    name: 'PRIORITY HEAP SCHEDULER',
    mathLabel: 'O(LOG N) HEAP SCHEDULER',
    plainEnglish:
      'Ensures patients waiting longer automatically escalate in effective priority so nobody is left behind.',
    detail: 'EffectivePriority = Severity + 0.45 × WaitMinutes.',
  },
  {
    icon: Layers,
    name: 'HUNGARIAN ASSIGNMENT ENGINE',
    mathLabel: 'BIPARTITE MATCHING O(N³)',
    plainEnglish:
      'Matches freed ICU/General beds and ventilators to waiting patients in optimal clinical batches.',
    detail: 'Solves 3-way multi-resource compatibility matrix (Beds + Equipment + Specialist).',
  },
  {
    icon: Route,
    name: 'REGIONAL DIJKSTRA ROUTER',
    mathLabel: "DIJKSTRA'S SHORTEST PATH",
    plainEnglish:
      'Finds the fastest transfer route to a nearby hospital when the local facility hits critical occupancy.',
    detail: 'Graph shortest path minimizing inter-hospital transit time.',
  },
]

export function AlgorithmShowcase() {
  return (
    <section
      id="algorithms"
      className="relative w-full bg-[#100904] text-[#ffedd7] py-24 md:py-36 border-b border-dashed border-[#40372e] overflow-hidden font-sans"
    >
      <InView className="mx-auto max-w-7xl px-6 w-full">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-medium uppercase tracking-wider text-[#dc5000] block mb-2">
            * COMPUTER SCIENCE FOUNDATION
          </span>
          <h2 className="text-3xl md:text-5xl font-medium uppercase tracking-normal leading-[0.9] text-[#ffedd7]">
            <TextReveal text="FOUR CORE ALGORITHMS. ZERO SHORTCUTS." />
          </h2>
          <p className="mt-4 text-lg md:text-xl font-normal leading-relaxed text-[#ffedd7]/80">
            Engineered from fundamental data structures and graph theory to demonstrate authentic computer science depth.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {ALGORITHMS.map((algo) => {
            const Icon = algo.icon
            return (
              <InView key={algo.name}>
                <motion.div
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="group rounded-[12px] border border-dashed border-[#40372e] bg-[#382416]/20 p-8 transition-all duration-300 hover:border-[#ffedd7]/40 cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-[12px] bg-[#100904] text-[#ffedd7] border border-[#40372e]">
                      <Icon className="size-6 text-[#dc5000]" />
                    </div>
                    <span className="text-[10px] font-mono font-medium text-[#dc5000] uppercase border border-[#40372e] px-2.5 py-1 rounded-[12px] bg-[#100904]">
                      {algo.mathLabel}
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-medium uppercase tracking-tight text-[#ffedd7] flex items-center justify-between">
                    <span>{algo.name}</span>
                    <ArrowUpRight className="size-4 text-[#6c5f51] transition-colors duration-300 group-hover:text-[#dc5000]" />
                  </h3>

                  <p className="mt-3 text-sm font-normal leading-relaxed text-[#ffedd7]/80">
                    {algo.plainEnglish}
                  </p>

                  <div className="mt-6 rounded-[12px] border border-dashed border-[#40372e] bg-[#100904] p-3.5 font-mono text-xs text-[#6c5f51]">
                    {algo.detail}
                  </div>
                </motion.div>
              </InView>
            )
          })}
        </div>
      </InView>
    </section>
  )
}
