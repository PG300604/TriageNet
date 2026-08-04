'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { UserX, Clock, Building2 } from 'lucide-react'
import { InView } from './motion-primitives/in-view'
import { TextReveal } from './motion-primitives/text-reveal'

export function ProblemSection() {
  return (
    <section
      id="problem"
      className="relative w-full bg-[#100904] text-[#ffedd7] py-24 md:py-36 border-b border-dashed border-[#40372e] overflow-hidden font-sans"
    >
      <InView className="mx-auto max-w-7xl px-6 w-full">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-medium uppercase tracking-wider text-[#dc5000] block mb-2">
            * OPERATIONAL REALITY
          </span>
          <h2 className="text-3xl md:text-5xl font-medium uppercase tracking-normal leading-[0.9] text-[#ffedd7]">
            <TextReveal text="THE BOTTLENECK IN EMERGENCY CARE." />
          </h2>
          <p className="mt-4 text-lg md:text-xl font-normal leading-relaxed text-[#ffedd7]/80">
            During mass-casualty surges, one regional hospital sits overwhelmed with zero open ICU beds — while a facility 10 minutes away sits with unused equipment.
          </p>
        </div>

        {/* 3 Editorial Cards Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <InView>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-[12px] border border-dashed border-[#40372e] bg-[#382416]/20 p-8 transition-all duration-300 hover:border-[#ffedd7]/40 cursor-pointer"
            >
              <div className="flex size-12 items-center justify-center rounded-[12px] bg-[#100904] text-[#dc5000] border border-[#40372e] mb-6">
                <UserX className="size-6" />
              </div>
              <h3 className="text-xl font-medium uppercase tracking-tight text-[#ffedd7]">FIRST-COME BIAS</h3>
              <p className="mt-3 text-sm font-normal leading-relaxed text-[#ffedd7]/80">
                Legacy intake queues treat patients strictly by arrival timestamp, leaving critical high-acuity cases waiting behind stable arrivals.
              </p>
            </motion.div>
          </InView>

          {/* Card 2 */}
          <InView>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-[12px] border border-dashed border-[#40372e] bg-[#382416]/20 p-8 transition-all duration-300 hover:border-[#ffedd7]/40 cursor-pointer"
            >
              <div className="flex size-12 items-center justify-center rounded-[12px] bg-[#100904] text-[#dc5000] border border-[#40372e] mb-6">
                <Clock className="size-6" />
              </div>
              <h3 className="text-xl font-medium uppercase tracking-tight text-[#ffedd7]">STATIC QUEUE DECAY</h3>
              <p className="mt-3 text-sm font-normal leading-relaxed text-[#ffedd7]/80">
                Without dynamic priority escalation, lower-acuity patients wait endlessly in waiting rooms, risking silent physiological deterioration.
              </p>
            </motion.div>
          </InView>

          {/* Card 3 */}
          <InView>
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className="rounded-[12px] border border-dashed border-[#40372e] bg-[#382416]/20 p-8 transition-all duration-300 hover:border-[#ffedd7]/40 cursor-pointer"
            >
              <div className="flex size-12 items-center justify-center rounded-[12px] bg-[#100904] text-[#dc5000] border border-[#40372e] mb-6">
                <Building2 className="size-6" />
              </div>
              <h3 className="text-xl font-medium uppercase tracking-tight text-[#ffedd7]">REGIONAL ISOLATION</h3>
              <p className="mt-3 text-sm font-normal leading-relaxed text-[#ffedd7]/80">
                Hospitals operate as isolated silos without real-time graph routing, causing patient overflow to be sent blindly to full facilities.
              </p>
            </motion.div>
          </InView>
        </div>
      </InView>
    </section>
  )
}
