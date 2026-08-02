'use client'

import React, { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AlertCircle, Clock, Building2, UserX } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function ProblemSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      gsap.fromTo(
        textRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          },
        }
      )

      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
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
      id="problem"
      ref={containerRef}
      className="relative w-full bg-slate-950 py-24 md:py-36 landing-dark border-t border-white/10"
    >
      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        {/* Text-forward quiet contrast beat */}
        <div ref={textRef} className="mx-auto max-w-3xl text-center">
          <span className="skeu-chip inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-400">
            <AlertCircle className="size-3.5" />
            <span>The Operational Reality</span>
          </span>

          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Surge Events Uncover a Fatal Bottleneck:{' '}
            <span className="text-gradient-red">Information Mismatch.</span>
          </h2>

          <p className="mt-6 text-base md:text-lg text-slate-300 leading-relaxed font-sans">
            During mass-casualty incidents, seasonal flu spikes, or monsoons, one regional hospital
            is overwhelmed with zero open ICU beds — while a facility 10 minutes away sits with
            unused ventilators. Legacy first-come-first-served queues leave critical patients waiting while resources sit idle.
          </p>
        </div>

        {/* 3 Skeuomorphic Quiet Impact Cards */}
        <div ref={cardsRef} className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Card 1 */}
          <div className="skeu-raised rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8 transition-all duration-300 hover:border-red-500/40">
            <div className="skeu-chip flex size-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 mb-6">
              <UserX className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-white">First-Come Bias</h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed font-sans">
              Standard intake queues treat patients by arrival order, delaying critical high-acuity
              cases behind stable patients who arrived earlier.
            </p>
          </div>

          {/* Card 2 */}
          <div className="skeu-raised rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8 transition-all duration-300 hover:border-amber-500/40">
            <div className="skeu-chip flex size-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-6">
              <Clock className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Static Queue Decay</h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed font-sans">
              Without automatic wait-time priority escalation, lower-acuity patients wait endlessly in waiting rooms, risking hidden deterioration.
            </p>
          </div>

          {/* Card 3 */}
          <div className="skeu-raised rounded-3xl border border-white/10 bg-slate-900/80 p-6 md:p-8 transition-all duration-300 hover:border-cyan-500/40">
            <div className="skeu-chip flex size-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-6">
              <Building2 className="size-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Regional Isolation</h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed font-sans">
              Hospitals operate as isolated islands without real-time graph routing, causing patient overflow to be sent to random or full facilities.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
