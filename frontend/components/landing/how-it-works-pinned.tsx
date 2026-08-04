'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Activity, Cpu, Network, Layers } from 'lucide-react'
import { AnimeScrollObserver } from './anime-scroll-observer'

const STEPS = [
  {
    number: '01',
    title: 'PATIENT INTAKE & SEVERITY SCORING',
    badge: 'LOGISTIC REGRESSION',
    description:
      'Patient vitals (heart rate, SpO₂, blood pressure, age, symptoms) are evaluated through an embedded 7-feature logistic regression model. Outputs an explainable severity score (0–100) with top risk drivers.',
    icon: Activity,
  },
  {
    number: '02',
    title: 'DYNAMIC HEAP SCHEDULING',
    badge: 'O(LOG N) HEAP SCHEDULER',
    description:
      'Patients enter a per-hospital priority queue ordered by effective priority: P = Severity + 0.45(Wait Minutes). Dynamic priority decay escalates long-waiting patients automatically.',
    icon: Cpu,
  },
  {
    number: '03',
    title: 'RESOURCE ASSIGNMENT ENGINE',
    badge: 'HUNGARIAN MATCHING O(N³)',
    description:
      'When beds, ventilators, or specialists free up, the Hungarian algorithm matches available resources against waiting patients in optimal clinical batches.',
    icon: Layers,
  },
  {
    number: '04',
    title: 'REGIONAL OVERFLOW ROUTING',
    badge: 'DIJKSTRA SHORTEST PATH',
    description:
      'When a local hospital reaches 100% capacity, the regional graph router evaluates directed hospital edges to compute the fastest transfer path to a nearby facility with verified open capacity.',
    icon: Network,
  },
]

export function HowItWorksPinned() {
  return (
    <section
      id="how-it-works"
      className="relative w-full bg-[#100904] text-[#ffedd7] py-24 md:py-36 border-b border-dashed border-[#40372e] overflow-hidden font-sans"
    >
      <AnimeScrollObserver className="mx-auto max-w-7xl px-6 w-full">
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-medium uppercase tracking-wider text-[#dc5000] block mb-2">
            * PIPELINE SEQUENCE
          </span>
          <h2 className="text-3xl md:text-5xl font-medium uppercase tracking-normal leading-[0.9] text-[#ffedd7]">
            FOUR-STEP CLINICAL PIPELINE.
          </h2>
          <p className="mt-4 text-lg md:text-xl font-normal leading-relaxed text-[#ffedd7]/80">
            From emergency intake to multi-resource matching and regional overflow routing.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.number}
                className="anime-reveal rounded-[12px] border border-dashed border-[#40372e] bg-[#382416]/10 p-8"
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-2xl font-mono font-bold text-[#dc5000]">{step.number}</span>
                  <span className="text-[10px] font-mono text-[#dc5000] uppercase border border-[#40372e] px-2.5 py-1 rounded-[12px] bg-[#100904]">
                    {step.badge}
                  </span>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <Icon className="size-5 text-[#ffedd7]" />
                  <h3 className="text-lg font-medium uppercase text-[#ffedd7]">{step.title}</h3>
                </div>

                <p className="text-sm font-normal leading-relaxed text-[#ffedd7]/80">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </AnimeScrollObserver>
    </section>
  )
}
