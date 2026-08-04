'use client'

import React, { useEffect, useRef } from 'react'
import Image from 'next/image'
import anime from 'animejs'
import { TextReveal } from './motion-primitives/text-reveal'
import { InView } from './motion-primitives/in-view'

export function InteractiveGraphShowcase() {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return

    anime({
      targets: el.querySelectorAll('.dijkstra-edge'),
      strokeDashoffset: [anime.setDashoffset, 0],
      easing: 'easeInOutSine',
      duration: 2000,
      delay: anime.stagger(300),
      loop: true,
      direction: 'alternate',
    })

    anime({
      targets: el.querySelectorAll('.hospital-node'),
      scale: [1, 1.15, 1],
      opacity: [0.8, 1, 0.8],
      easing: 'easeInOutQuad',
      duration: 1800,
      delay: anime.stagger(400),
      loop: true,
    })
  }, [])

  return (
    <section className="relative min-h-screen w-full bg-[#100904] text-[#ffedd7] py-24 md:py-32 flex flex-col justify-center border-b border-dashed border-[#40372e] overflow-hidden">
      <InView className="mx-auto max-w-7xl px-6 w-full">
        {/* Full-Viewport Product Reveal Section — 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Heading at 41px uppercase */}
          <div className="lg:col-span-4 space-y-4">
            <span className="text-xs font-medium uppercase tracking-wider text-[#dc5000]">
              * REGIONAL GRAPH MATRIX
            </span>
            <h2 className="text-3xl md:text-5xl font-medium uppercase tracking-normal leading-[0.9] text-[#ffedd7]">
              <TextReveal text="ISN'T JUST A TRIAGE QUEUE." />
            </h2>
            <div className="pt-4 border-t border-dashed border-[#40372e]">
              <span className="text-xs font-mono text-[#6c5f51] block uppercase">
                ALGORITHMIC ENGINE // PHASE 3
              </span>
              <p className="text-xs font-mono text-[#ffedd7]/80 mt-1">
                Dijkstra Shortest-Path Referral Routing & Multi-Resource Hungarian Matching.
              </p>
            </div>
          </div>

          {/* Middle Column: Centered 3D Interactive Hospital Network Object */}
          <div className="lg:col-span-4 flex flex-col items-center">
            <div className="relative w-full max-w-sm rounded-[12px] border border-dashed border-[#40372e] bg-[#382416]/10 p-6 flex flex-col items-center overflow-hidden">
              {/* Subtle Warm Waves Layer */}
              <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay">
                <Image
                  src="/ember-waves.png"
                  alt="Ember Waves Background Texture"
                  fill
                  className="object-cover object-center"
                />
              </div>

              <svg
                ref={svgRef}
                viewBox="0 0 300 240"
                className="w-full h-auto overflow-visible relative z-10"
              >
                {/* Connecting Edges */}
                <path
                  d="M60,60 L240,60"
                  stroke="#40372e"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <path
                  d="M60,60 L150,180"
                  stroke="#dc5000"
                  strokeWidth="3"
                  className="dijkstra-edge"
                />
                <path
                  d="M240,60 L150,180"
                  stroke="#40372e"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />
                <path
                  d="M60,60 L240,180"
                  stroke="#dc5000"
                  strokeWidth="2"
                  className="dijkstra-edge"
                />

                {/* Regional Nodes */}
                <g className="hospital-node">
                  <circle cx="60" cy="60" r="16" fill="#382416" stroke="#ffedd7" strokeWidth="2" />
                  <text x="60" y="64" textAnchor="middle" fill="#ffedd7" fontSize="10" fontWeight="bold">H1</text>
                </g>

                <g className="hospital-node">
                  <circle cx="240" cy="60" r="16" fill="#382416" stroke="#ffedd7" strokeWidth="2" />
                  <text x="240" y="64" textAnchor="middle" fill="#ffedd7" fontSize="10" fontWeight="bold">H2</text>
                </g>

                <g className="hospital-node">
                  <circle cx="150" cy="180" r="20" fill="#dc5000" stroke="#ffedd7" strokeWidth="2" />
                  <text x="150" y="184" textAnchor="middle" fill="#ffedd7" fontSize="11" fontWeight="bold">H3</text>
                </g>

                <g className="hospital-node">
                  <circle cx="240" cy="180" r="14" fill="#382416" stroke="#6c5f51" strokeWidth="2" />
                  <text x="240" y="184" textAnchor="middle" fill="#ffedd7" fontSize="9" fontWeight="bold">H4</text>
                </g>
              </svg>

              <div className="mt-4 text-center relative z-10">
                <span className="text-[11px] font-mono font-medium text-[#dc5000] uppercase block">
                  ACTIVE ROUTE: CITY GENERAL ➔ RIVERSIDE (14 MIN)
                </span>
                <span className="text-[9px] font-mono text-[#6c5f51] uppercase">
                  WEIGHTED GRAPH: MINIMIZING OVERFLOW LATENCY
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Mixed-Case Body Copy at 29px weight 400 */}
          <div className="lg:col-span-4 space-y-6">
            <p className="text-xl md:text-2xl font-normal leading-relaxed text-[#ffedd7]/90">
              Designed to calculate, load-balance, and route in all the right ways. TriageNet makes critical emergency response feel instantaneous and deeply considered.
            </p>

            {/* Sparkline Analytics */}
            <div className="space-y-3 pt-4 border-t border-dashed border-[#40372e]">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#6c5f51] uppercase">QUEUE LATENCY REDUCTION</span>
                <span className="text-[#dc5000] font-bold">-42.4%</span>
              </div>

              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#6c5f51] uppercase">BED COMPATIBILITY ACCURACY</span>
                <span className="text-[#ffedd7] font-medium">98.6%</span>
              </div>
            </div>
          </div>
        </div>
      </InView>
    </section>
  )
}
