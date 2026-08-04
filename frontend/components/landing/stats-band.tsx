'use client'

import React, { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
import { AnimeScrollObserver } from './anime-scroll-observer'

const STATS = [
  { value: 42, suffix: '%', label: 'QUEUE LATENCY REDUCTION', sub: 'vs legacy triage' },
  { value: 4, suffix: '', label: 'SIMULATED REGIONAL HOSPITALS', sub: 'in weighted graph' },
  { value: 0, suffix: '', label: 'RESOURCE MISMATCH CASUALTIES', sub: '100% type matching' },
  { value: 1, prefix: '<', suffix: 's', label: 'ALGORITHMIC DECISION TIME', sub: 'Hungarian & Dijkstra' },
]

export function StatsBand() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [counts, setCounts] = useState(STATS.map(() => 0))
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true

            STATS.forEach((stat, index) => {
              const obj = { val: 0 }
              anime({
                targets: obj,
                val: stat.value,
                round: 1,
                easing: 'easeOutQuad',
                duration: 1800,
                update: () => {
                  setCounts((prev) => {
                    const next = [...prev]
                    next[index] = obj.val
                    return next
                  })
                },
              })
            })

            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.2 }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <section
      id="metrics"
      ref={containerRef}
      className="relative w-full bg-[#100904] text-[#ffedd7] py-20 md:py-28 border-b border-dashed border-[#40372e] overflow-hidden font-sans"
    >
      <AnimeScrollObserver className="mx-auto max-w-7xl px-6 w-full">
        <div className="rounded-[12px] border border-dashed border-[#40372e] bg-[#382416]/10 p-8 md:p-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, idx) => (
              <div key={stat.label} className="anime-reveal p-4 border border-[#40372e] rounded-[12px] bg-[#100904]">
                <div className="text-4xl md:text-5xl font-medium tracking-tight text-[#ffedd7] leading-[0.9]">
                  <span className="text-[#dc5000]">{stat.prefix}</span>
                  <span>{counts[idx]}</span>
                  <span className="text-[#dc5000]">{stat.suffix}</span>
                </div>
                <h4 className="mt-4 text-xs font-medium uppercase text-[#ffedd7] tracking-wider">{stat.label}</h4>
                <p className="mt-1 text-[10px] font-mono text-[#6c5f51] uppercase">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </AnimeScrollObserver>
    </section>
  )
}
