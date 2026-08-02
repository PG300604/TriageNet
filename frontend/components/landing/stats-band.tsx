'use client'

import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

const STATS = [
  { value: 40, suffix: '%', label: 'Faster Emergency Intake Response', sub: 'vs legacy manual triage' },
  { value: 12, suffix: '+', label: 'Simulated Regional Hospitals', sub: 'connected in graph topology' },
  { value: 0, suffix: '', label: 'Resource Mismatch Failures', sub: '100% type-compatibility enforced' },
  { value: 1, prefix: '<', suffix: 's', label: 'Algorithmic Decision Latency', sub: 'for Hungarian & Dijkstra runs' },
]

export function StatsBand() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [counts, setCounts] = useState(STATS.map(() => 0))
  const hasAnimated = useRef(false)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 80%',
        onEnter: () => {
          if (hasAnimated.current) return
          hasAnimated.current = true

          if (prefersReducedMotion) {
            setCounts(STATS.map((s) => s.value))
            return
          }

          STATS.forEach((stat, index) => {
            const obj = { val: 0 }
            gsap.to(obj, {
              val: stat.value,
              duration: 2,
              ease: 'power2.out',
              onUpdate: () => {
                setCounts((prev) => {
                  const next = [...prev]
                  next[index] = Math.floor(obj.val)
                  return next
                })
              },
            })
          })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      id="metrics"
      ref={sectionRef}
      className="relative w-full bg-slate-950 py-20 md:py-28 landing-dark border-t border-white/10"
    >
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        <div className="skeu-raised rounded-3xl border border-cyan-500/30 bg-slate-900/80 p-8 md:p-12 shadow-[0_25px_70px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((stat, idx) => (
              <div key={stat.label} className="skeu-inset rounded-2xl border border-white/10 bg-slate-950 p-6 text-center md:text-left">
                <div className="font-mono text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                  <span className="text-cyan-400">{stat.prefix}</span>
                  <span>{counts[idx]}</span>
                  <span className="text-cyan-400">{stat.suffix}</span>
                </div>
                <h4 className="mt-3 text-sm md:text-base font-bold text-white font-sans">{stat.label}</h4>
                <p className="mt-1 text-xs text-slate-400 font-sans">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
