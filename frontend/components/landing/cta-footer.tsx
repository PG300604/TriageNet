'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowUpRight, Code2 } from 'lucide-react'
import { InView } from './motion-primitives/in-view'
import { TextReveal } from './motion-primitives/text-reveal'

export function CtaFooter() {
  return (
    <footer className="relative w-full bg-[#100904] text-[#ffedd7] pt-20 pb-12 border-t border-dashed border-[#40372e] font-sans">
      <InView className="mx-auto max-w-7xl px-6 w-full">
        {/* Main Editorial CTA Box */}
        <div className="relative rounded-[12px] border border-dashed border-[#40372e] bg-[#382416]/10 p-8 md:p-16 text-center flex flex-col items-center overflow-hidden">
          {/* Subtle Warm Waves Backdrop */}
          <div className="absolute inset-0 pointer-events-none opacity-15 mix-blend-overlay">
            <Image
              src="/ember-waves.png"
              alt="Ember Waves Texture"
              fill
              className="object-cover object-center"
            />
          </div>

          <div className="mx-auto max-w-3xl flex flex-col items-center text-center relative z-10">
            <span className="text-xs font-medium uppercase tracking-wider text-[#dc5000] block mb-3 text-center">
              * OPERATIONAL COMMAND CENTER
            </span>

            <h2 className="text-3xl sm:text-5xl font-medium uppercase tracking-normal leading-[0.9] text-[#ffedd7] text-center flex justify-center">
              <TextReveal text="EXPERIENCE LIVE ALGORITHMIC TRIAGE." className="justify-center text-center" />
            </h2>

            <p className="mt-4 text-base md:text-xl font-normal leading-relaxed text-[#ffedd7]/80 text-center max-w-2xl">
              Trigger mass-casualty stress tests, observe Hungarian resource matching live, and inspect Dijkstra shortest-path regional referrals.
            </p>

            <div className="mt-8 flex justify-center">
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link href="/dashboard" className="oryzo-pill-button inline-flex items-center gap-2">
                  <span>LAUNCH OPERATIONAL CONSOLE</span>
                  <ArrowUpRight className="size-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Footer Meta Details */}
        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-dashed border-[#40372e] pt-8 sm:flex-row text-xs text-[#6c5f51]">
          <div className="flex items-center gap-2">
            <span className="font-medium uppercase text-[#ffedd7]">TRIAGENET</span>
            <span>·</span>
            <span className="text-[#dc5000] uppercase font-mono">* DESIGNED & BUILT BY PRIYANSHU GHOSH (CSBS 2027)</span>
          </div>

          <div className="flex items-center gap-6 font-mono text-[11px]">
            <a
              href="https://github.com/PG300604"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 uppercase hover:text-[#ffedd7] transition-colors"
            >
              <Code2 className="size-3.5 text-[#dc5000]" />
              <span>GITHUB (PG300604)</span>
            </a>
            <Link
              href="/dashboard"
              className="uppercase hover:text-[#ffedd7] transition-colors text-[#ffedd7] font-medium"
            >
              <span>LIVE CONSOLE ➔</span>
            </Link>
          </div>
        </div>
      </InView>
    </footer>
  )
}
