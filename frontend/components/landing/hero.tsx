'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Activity, ArrowRight, ShieldCheck, Cpu, Network, Sparkles, AlertTriangle, RefreshCw, Zap, FastForward, Play, Pause, RotateCcw, UserPlus, CheckCircle2, TrendingUp, Users, Calendar, Grid } from 'lucide-react'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

interface InteractivePatient {
  id: string
  name: string
  vitals: string
  acuity: number
  waitMin: number
  status: 'Waiting' | 'Assigned' | 'Preempted' | 'Transferred'
  match: string
}

const BASE_PATIENTS: Record<'normal' | 'mci' | 'surge', InteractivePatient[]> = {
  normal: [
    { id: 'P-104', name: 'Alan Whitfield', vitals: 'SpO₂ 88% · HR 105', acuity: 74, waitMin: 22, status: 'Waiting', match: 'Bed #02' },
    { id: 'P-109', name: 'Priya Nadella', vitals: 'Laceration · BP 124/80', acuity: 42, waitMin: 14, status: 'Waiting', match: 'Observation' },
    { id: 'P-112', name: 'Marcus Reid', vitals: 'Arrhythmia · HR 112', acuity: 58, waitMin: 8, status: 'Assigned', match: 'Cardio-Bed #01' },
  ],
  mci: [
    { id: 'P-901', name: 'John Doe (Blast Trauma)', vitals: 'Airway Compromise · SpO₂ 78%', acuity: 96, waitMin: 4, status: 'Waiting', match: 'ICU Bed #01 (O+)' },
    { id: 'P-902', name: 'Jane Doe (Crush Injury)', vitals: 'Internal Hemorrhage · HR 145', acuity: 92, waitMin: 2, status: 'Waiting', match: 'Ventilator #02' },
    { id: 'P-104', name: 'Alan Whitfield', vitals: 'SpO₂ 88% · HR 105', acuity: 74, waitMin: 52, status: 'Waiting', match: 'Route ➔ Riverside' },
  ],
  surge: [
    { id: 'P-501', name: 'Beatriz Alves (Monsoon Fever)', vitals: 'Rigidity · Temp 39.8°C', acuity: 85, waitMin: 34, status: 'Waiting', match: 'Ventilator #01' },
    { id: 'P-504', name: 'Ken Osei (Severe Dehydration)', vitals: 'Hypotension · BP 85/55', acuity: 78, waitMin: 28, status: 'Waiting', match: 'Bed #05' },
    { id: 'P-508', name: 'Amara Diallo (Acute Asthma)', vitals: 'SpO₂ 84% · HR 122', acuity: 89, waitMin: 12, status: 'Assigned', match: 'ICU Bed #03' },
  ],
}

export function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const subheadRef = useRef<HTMLParagraphElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)
  const mockCardRef = useRef<HTMLDivElement>(null)

  // Interactive State
  const [scenario, setScenario] = useState<'normal' | 'mci' | 'surge'>('mci')
  const [patients, setPatients] = useState<InteractivePatient[]>(BASE_PATIENTS['mci'])
  const [isComputing, setIsComputing] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [flashId, setFlashId] = useState<string | null>(null)
  const [preemptionNotice, setPreemptionNotice] = useState<string | null>(null)

  const triggerScenario = (next: 'normal' | 'mci' | 'surge') => {
    setIsComputing(true)
    setScenario(next)
    setPatients(BASE_PATIENTS[next])
    setIsPlaying(false)
    setPreemptionNotice(null)
    setTimeout(() => setIsComputing(false), 300)
  }

  const fastForwardTime = (minutesToAdd = 15) => {
    setIsComputing(true)
    setPatients((prev) => {
      const updated = prev.map((p) => {
        const nextWait = p.waitMin + minutesToAdd
        const nextAcuity = p.status === 'Waiting' ? Math.min(100, p.acuity + (nextWait > 40 ? 2 : 0)) : p.acuity
        return {
          ...p,
          waitMin: nextWait,
          acuity: nextAcuity,
        }
      })

      const sorted = [...updated].sort(
        (a, b) => (b.acuity + b.waitMin * 0.45) - (a.acuity + a.waitMin * 0.45)
      )
      setFlashId(sorted[0].id)
      return sorted
    })

    setTimeout(() => {
      setIsComputing(false)
      setFlashId(null)
    }, 450)
  }

  const simulateCriticalArrival = () => {
    setIsComputing(true)
    const newPt: InteractivePatient = {
      id: 'P-999',
      name: 'Ambulance Arrival (Cardiac Arrest)',
      vitals: 'VFib · SpO₂ 72% · HR 165',
      acuity: 98,
      waitMin: 0,
      status: 'Assigned',
      match: 'ICU Bed #01 (PREEMPTED)',
    }

    setPatients((prev) => {
      let preemptedName = ''
      const updated = prev.map((p) => {
        if (p.status === 'Assigned' && p.acuity <= 65) {
          preemptedName = p.name
          return { ...p, status: 'Preempted' as const, match: 'Step-Down Ward' }
        }
        return p
      })

      if (preemptedName) {
        setPreemptionNotice(`⚡ PREEMPTION: Cardiac Arrest arrival preempted ${preemptedName} to Step-Down ward!`)
      } else {
        newPt.status = 'Waiting'
        newPt.match = 'Priority Queue #1'
      }

      const list = [newPt, ...updated].sort(
        (a, b) => (b.acuity + b.waitMin * 0.45) - (a.acuity + a.waitMin * 0.45)
      )
      setFlashId(newPt.id)
      return list
    })

    setTimeout(() => {
      setIsComputing(false)
      setFlashId(null)
    }, 600)
  }

  const resetTime = () => {
    setPatients(BASE_PATIENTS[scenario])
    setIsPlaying(false)
    setPreemptionNotice(null)
  }

  // Auto-play timer for fast-forward simulation
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      fastForwardTime(10)
    }, 1500)
    return () => clearInterval(interval)
  }, [isPlaying, scenario])

  useEffect(() => {
    const ctx = gsap.context(() => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReducedMotion) return

      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } })

      tl.fromTo(headlineRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
        .fromTo(subheadRef.current, { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, '-=0.6')
        .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, '-=0.5')
        .fromTo(mockCardRef.current, { y: 50, opacity: 0, scale: 0.97 }, { y: 0, opacity: 1, scale: 1, duration: 1 }, '-=0.5')

      gsap.to(mockCardRef.current, {
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
        scale: 1.02,
        y: -20,
        opacity: 0.98,
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen w-full overflow-hidden bg-slate-50 pt-32 pb-24 md:pt-36 md:pb-32 flex flex-col justify-center font-sans text-slate-900"
    >
      {/* Soft Ambient Radial Backdrop */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[700px] rounded-full bg-emerald-400/15 blur-[160px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        {/* Category Pill */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100/80 px-4 py-1.5 text-xs font-bold text-emerald-800 shadow-2xs">
            <Sparkles className="size-3.5 text-emerald-600 animate-pulse" />
            <span>TriageNet Healthcare SaaS Allocation Platform</span>
          </span>
        </div>

        {/* Hero Headline */}
        <h1
          ref={headlineRef}
          className="mx-auto max-w-4xl text-center text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl md:text-7xl lg:leading-[1.1]"
        >
          AI-Driven Hospital Triage &{' '}
          <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy">
            Resource Allocation Precision.
          </span>
        </h1>

        {/* Hero Subheadline */}
        <p
          ref={subheadRef}
          className="mx-auto mt-6 max-w-2xl text-center text-base md:text-xl font-medium leading-relaxed text-slate-600"
        >
          Unifying patient records, real-time vital streams, Hungarian bed matching, and Dijkstra regional overflow routing into a calm, high-clarity command center.
        </p>

        {/* Actions */}
        <div
          ref={ctaRef}
          className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            href="/dashboard"
            className="group relative flex w-full sm:w-auto items-center justify-center gap-3 rounded-xl bg-emerald-600 px-8 py-4 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:bg-emerald-700 hover:shadow-xl active:scale-95"
          >
            <ShieldCheck className="size-5" />
            <span>Launch TriageNet Dashboard</span>
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <a
            href="#how-it-works"
            className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:border-slate-400"
          >
            <span>Explore 4-Step Pipeline</span>
          </a>
        </div>

        {/* TriageNet Interactive Telemetry Command Widget */}
        <div ref={mockCardRef} className="mt-14 md:mt-16">
          <div className="relative mx-auto max-w-5xl rounded-3xl border border-slate-200 bg-white p-4 md:p-6 shadow-2xl backdrop-blur-xl">
            {/* Preemption Notice Alert */}
            {preemptionNotice && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-purple-300 bg-purple-100 px-4 py-2.5 text-purple-900 text-xs font-mono font-bold animate-pulse">
                <span>{preemptionNotice}</span>
                <span className="text-[10px] text-purple-800 border border-purple-400 rounded px-1.5 py-0.5 bg-white">PREEMPTION LOGGED</span>
              </div>
            )}

            {/* Top Bar Header */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex size-8 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-2xs">
                  T
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 tracking-wider">
                  TRIAGENET // TELEMETRY COMMAND
                </span>
              </div>

              {/* Interactive Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={simulateCriticalArrival}
                  className="flex items-center gap-1 rounded-xl bg-red-100 px-3 py-1.5 font-mono text-xs font-bold text-red-800 border border-red-300 hover:bg-red-200"
                >
                  <AlertTriangle className="size-3.5 text-red-600" />
                  <span>Simulate Preemption</span>
                </button>

                <button
                  type="button"
                  onClick={() => fastForwardTime(15)}
                  className="flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 font-mono text-xs font-bold text-white shadow-2xs hover:bg-emerald-700"
                >
                  <FastForward className="size-3.5" />
                  <span>+15m Fast Forward</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`flex items-center gap-1 rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                    isPlaying
                      ? 'bg-amber-500 text-white shadow-2xs'
                      : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {isPlaying ? <Pause className="size-3.5" /> : <Play className="size-3.5 text-emerald-600" />}
                  <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
                </button>

                <button
                  type="button"
                  onClick={resetTime}
                  className="p-1.5 rounded-xl bg-white text-slate-500 border border-slate-300 hover:bg-slate-100"
                >
                  <RotateCcw className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Inner Telemetry Display */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:p-5">
              <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="flex items-center gap-2 font-mono text-xs font-bold text-slate-800">
                  <Cpu className="size-4 text-emerald-600" />
                  DYNAMIC PRIORITY HEAP — RE-ORDERED BY (SEVERITY + WAIT DECAY)
                </span>
                {isComputing ? (
                  <span className="flex items-center gap-1.5 font-mono text-xs text-emerald-600 font-bold animate-pulse">
                    <RefreshCw className="size-3.5 animate-spin" />
                    RE-COMPUTING HUNGARIAN MATRIX...
                  </span>
                ) : (
                  <span className="font-mono text-xs text-emerald-700 font-bold flex items-center gap-1">
                    <Zap className="size-3.5" />
                    O(n³) Hungarian & Dijkstra Active
                  </span>
                )}
              </div>

              {/* Dynamic Queue List */}
              <div className="space-y-3 font-mono">
                {patients.map((p, idx) => {
                  const effectivePriority = Math.round(p.acuity + p.waitMin * 0.45)
                  const isRed = effectivePriority >= 85
                  const isAmber = effectivePriority >= 60 && effectivePriority < 85
                  const isFlashed = p.id === flashId
                  const isPreempted = p.status === 'Preempted'

                  return (
                    <div
                      key={p.id}
                      className={`flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 transition-all duration-300 ${
                        isFlashed ? 'bg-emerald-100 border-emerald-400' : ''
                      } ${
                        isPreempted
                          ? 'border-purple-300 bg-purple-50'
                          : isRed
                          ? 'border-red-200 bg-red-50/70'
                          : isAmber
                          ? 'border-amber-200 bg-amber-50/70'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex size-8 items-center justify-center rounded-full font-mono text-xs font-bold shadow-2xs ${
                            isPreempted
                              ? 'bg-purple-200 text-purple-900 border border-purple-300'
                              : isRed
                              ? 'bg-red-200 text-red-900 border border-red-300'
                              : isAmber
                              ? 'bg-amber-200 text-amber-900 border border-amber-300'
                              : 'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}
                        >
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 font-sans">{p.name}</span>
                            <span className="text-xs text-slate-500 font-mono">({p.id})</span>
                            {isPreempted && (
                              <span className="text-[10px] font-mono font-bold text-purple-800 bg-purple-200 px-2 py-0.5 rounded-full border border-purple-300">
                                PREEMPTED ➔ STEP-DOWN
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 font-sans mt-0.5">{p.vitals}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 sm:gap-6">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block font-sans">Wait Time</span>
                          <span className="text-xs text-slate-800 font-bold">{p.waitMin} min</span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 block font-sans">Hungarian Match</span>
                          <span className={`text-xs font-bold ${isPreempted ? 'text-purple-700' : 'text-emerald-700'}`}>
                            {p.match}
                          </span>
                        </div>

                        <div className="rounded-xl px-3 py-1.5 text-center bg-slate-100 border border-slate-300">
                          <span className="text-[10px] text-slate-500 block font-sans">Priority</span>
                          <span
                            className={`text-sm font-black ${
                              isPreempted
                                ? 'text-purple-700'
                                : isRed
                                ? 'text-red-600'
                                : isAmber
                                ? 'text-amber-600'
                                : 'text-emerald-600'
                            }`}
                          >
                            P: {effectivePriority}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Monitor Footer Bar */}
              <div className="mt-4 flex flex-wrap items-center justify-between border-t border-slate-200 pt-3 text-xs text-slate-600 font-mono">
                <span>SEVERITY: Sigmoid(W·X + b)</span>
                <span>HUNGARIAN MATRIX: COST = COMPATIBILITY + (100 - P)</span>
                <span className="text-emerald-700 font-bold">DIJKSTRA GRAPH: ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
