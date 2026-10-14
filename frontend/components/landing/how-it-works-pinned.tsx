'use client'

import React from 'react'
import { Activity, Cpu, Network, Layers } from 'lucide-react'
import { AnimeScrollObserver } from './anime-scroll-observer'

const STEPS = [
  {
    number: '01',
    title: 'PATIENT INTAKE & SEVERITY SCORING',
    description:
      'Patient vital signs (heart rate, SpO₂, blood pressure, age, symptoms) are analyzed to generate an instant clinical acuity score with top risk factor explanations.',
    icon: Activity,
  },
  {
    number: '02',
    title: 'DYNAMIC QUEUE SCHEDULING',
    description:
      'Patients enter an intelligent priority queue where emergency urgency and waiting time dynamically escalate priority, ensuring delayed patients receive prompt medical attention.',
    icon: Cpu,
  },
  {
    number: '03',
    title: 'RESOURCE ASSIGNMENT ENGINE',
    description:
      'When intensive care beds, ventilators, or emergency physicians become available, the system matches clinical resources to waiting patients in optimal batches.',
    icon: Layers,
  },
  {
    number: '04',
    title: 'REGIONAL OVERFLOW ROUTING',
    description:
      'When a local hospital reaches maximum capacity, the regional transfer router identifies the fastest transit route to a nearby facility with verified open capacity.',
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
