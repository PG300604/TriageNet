'use client'

import React from 'react'
import { motion } from 'framer-motion'

export function AnimatedECGWaveform() {
  return (
    <div className="relative w-full h-12 rounded-[12px] border border-dashed border-[#40372e] bg-[#100904] p-1 flex items-center overflow-hidden">
      <svg
        className="w-full h-full stroke-[#dc5000] fill-none opacity-90"
        viewBox="0 0 500 60"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M0,30 L60,30 L70,10 L80,50 L90,5 L100,40 L110,30 L200,30 L210,10 L220,50 L230,5 L240,40 L250,30 L350,30 L360,10 L370,50 L380,5 L390,40 L400,30 L500,30"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 2.5,
            ease: 'linear',
            repeat: Infinity,
          }}
        />
      </svg>
    </div>
  )
}
