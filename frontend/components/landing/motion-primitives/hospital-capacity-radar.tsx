'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { InView } from './in-view'

interface HospitalNode {
  id: string
  name: string
  icuBeds: number
  generalBeds: number
  occupancy: number
  transitMin: number
  status: 'OPTIMAL' | 'HIGH LOAD' | 'CRITICAL LOCK'
}

const REGIONAL_HOSPITALS: HospitalNode[] = [
  { id: 'H1', name: 'City General Hospital', icuBeds: 2, generalBeds: 8, occupancy: 94, transitMin: 0, status: 'CRITICAL LOCK' },
  { id: 'H2', name: 'St. Mary Trauma Center', icuBeds: 5, generalBeds: 12, occupancy: 78, transitMin: 8, status: 'HIGH LOAD' },
  { id: 'H3', name: 'Riverside Medical Center', icuBeds: 8, generalBeds: 24, occupancy: 45, transitMin: 14, status: 'OPTIMAL' },
  { id: 'H4', name: 'North District Hospital', icuBeds: 6, generalBeds: 18, occupancy: 60, transitMin: 19, status: 'OPTIMAL' },
]

export function HospitalCapacityRadar() {
  const [selectedNode, setSelectedNode] = useState<HospitalNode>(REGIONAL_HOSPITALS[0])

  return (
    <section className="relative w-full bg-[#100904] text-[#ffedd7] py-24 md:py-32 border-b border-dashed border-[#40372e] overflow-hidden font-sans">
      <InView className="mx-auto max-w-7xl px-6 w-full">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-medium uppercase tracking-wider text-[#dc5000] block mb-2">
            * INTERACTIVE REGIONAL NETWORK MATRIX
          </span>
          <h2 className="text-3xl md:text-5xl font-medium uppercase tracking-normal leading-[0.9] text-[#ffedd7]">
            LIVE CAPACITY RADAR & DIJKSTRA ROUTING.
          </h2>
          <p className="mt-4 text-lg md:text-xl font-normal leading-relaxed text-[#ffedd7]/80">
            Click any regional hospital node to inspect real-time bed stratification, on-call specialist rosters, and live Dijkstra referral calculations.
          </p>
        </div>

        {/* Interactive Matrix Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Radar Canvas */}
          <div className="lg:col-span-7">
            <div className="relative rounded-[12px] border border-dashed border-[#40372e] bg-[#382416]/10 p-6 md:p-8 flex flex-col items-center">
              <div className="w-full flex items-center justify-between border-b border-dashed border-[#40372e] pb-4 mb-6">
                <span className="text-xs font-mono text-[#ffedd7] uppercase">
                  NETWORK TOPOLOGY: 4 REGIONAL NODES
                </span>
                <span className="text-[10px] font-mono text-[#dc5000] uppercase border border-[#40372e] px-2 py-0.5 rounded-[12px] bg-[#100904]">
                  RADAR SWEEP ONLINE
                </span>
              </div>

              <div className="relative w-full max-w-md aspect-square rounded-full border border-dashed border-[#40372e] flex items-center justify-center p-4">
                {/* Radar Sweep Effect */}
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#dc5000]/15 to-transparent pointer-events-none"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, ease: 'linear', repeat: Infinity }}
                />

                <div className="absolute inset-8 rounded-full border border-dashed border-[#40372e]/50" />
                <div className="absolute inset-24 rounded-full border border-dashed border-[#40372e]/30" />

                {/* Nodes Positioned on Map */}
                {REGIONAL_HOSPITALS.map((h, i) => {
                  const isSelected = selectedNode.id === h.id
                  const positions = [
                    'top-8 left-12',
                    'top-8 right-12',
                    'bottom-12 left-1/2 -translate-x-1/2',
                    'top-1/2 right-6 -translate-y-1/2',
                  ]

                  return (
                    <motion.button
                      key={h.id}
                      type="button"
                      onClick={() => setSelectedNode(h)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`absolute ${positions[i]} z-20 flex flex-col items-center group cursor-pointer`}
                    >
                      <div
                        className={`flex size-12 items-center justify-center rounded-full border-2 text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-[#dc5000] text-[#ffedd7] border-[#ffedd7] shadow-lg'
                            : 'bg-[#100904] text-[#ffedd7] border-[#40372e] hover:border-[#dc5000]'
                        }`}
                      >
                        {h.id}
                      </div>
                      <span className="mt-1 text-[10px] font-mono font-medium text-[#ffedd7] bg-[#100904] px-2 py-0.5 rounded border border-[#40372e] uppercase whitespace-nowrap">
                        {h.name}
                      </span>
                    </motion.button>
                  )
                })}
              </div>

              <div className="mt-6 text-center text-xs font-mono text-[#6c5f51] uppercase">
                CLICK NODES TO RE-CALCULATE DIJKSTRA REFERRAL ROUTE
              </div>
            </div>
          </div>

          {/* Right Column: Node Details Inspector Card */}
          <div className="lg:col-span-5">
            <div className="rounded-[12px] border border-dashed border-[#40372e] bg-[#100904] p-6 md:p-8 space-y-6">
              <div className="border-b border-dashed border-[#40372e] pb-4">
                <span className="text-xs font-mono text-[#dc5000] uppercase block">
                  SELECTED NODE INSPECTOR
                </span>
                <h3 className="text-2xl font-medium uppercase text-[#ffedd7] mt-1">
                  {selectedNode.name}
                </h3>
                <span className="text-xs font-mono text-[#6c5f51] mt-0.5 block uppercase">
                  NODE ID: {selectedNode.id} · TRANSIT: {selectedNode.transitMin} MIN
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#6c5f51] uppercase">CAPACITY STATUS</span>
                <span
                  className={`font-bold px-3 py-1 rounded-[12px] border ${
                    selectedNode.status === 'CRITICAL LOCK'
                      ? 'bg-[#dc5000]/20 text-[#dc5000] border-[#dc5000]'
                      : 'bg-[#382416] text-[#ffedd7] border-[#40372e]'
                  }`}
                >
                  {selectedNode.status}
                </span>
              </div>

              {/* Bed Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-[12px] border border-[#40372e] bg-[#382416]/20 p-4">
                  <span className="text-[10px] text-[#6c5f51] uppercase block font-mono">AVAILABLE ICU BEDS</span>
                  <span className="text-2xl font-bold text-[#ffedd7] mt-1 block">{selectedNode.icuBeds}</span>
                </div>
                <div className="rounded-[12px] border border-[#40372e] bg-[#382416]/20 p-4">
                  <span className="text-[10px] text-[#6c5f51] uppercase block font-mono">GENERAL WARD BEDS</span>
                  <span className="text-2xl font-bold text-[#ffedd7] mt-1 block">{selectedNode.generalBeds}</span>
                </div>
              </div>

              {/* Dijkstra Action */}
              <div className="pt-4 border-t border-dashed border-[#40372e]">
                <span className="text-xs font-mono text-[#6c5f51] block uppercase mb-2">
                  DIJKSTRA SHORTEST REFERRAL PATH
                </span>
                <p className="text-xs font-mono text-[#ffedd7]/80">
                  {selectedNode.id === 'H1'
                    ? 'City General is 94% occupied. Algorithm routes severe overflow to Riverside Medical Center (H3) via Directed Edge (14 min).'
                    : `Optimal referral pathway configured for ${selectedNode.name} (${selectedNode.transitMin} min transit time).`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </InView>
    </section>
  )
}
