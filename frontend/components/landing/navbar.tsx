'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-5 font-sans">
      <nav className="mx-auto max-w-7xl flex items-center justify-between border-b border-dashed border-[#40372e]/60 pb-4 backdrop-blur-md bg-[#100904]/70">
        {/* Left: Brand Wordmark (Clean TRIAGENET) */}
        <Link href="/" className="flex items-center gap-3">
          <span className="text-xs md:text-sm font-medium uppercase text-[#ffedd7] tracking-wider font-mono">
            TRIAGENET
          </span>
        </Link>

        {/* Center/Right: Navigation Items */}
        <div className="hidden md:flex items-center gap-8 text-xs font-medium uppercase text-[#ffedd7] tracking-normal">
          <a
            href="#problem"
            className="hover:text-[#dc5000] transition-colors border-b border-dashed border-[#40372e] pb-0.5"
          >
            INTRO
          </a>
          <a
            href="#how-it-works"
            className="hover:text-[#dc5000] transition-colors hover:border-b hover:border-dashed hover:border-[#40372e] pb-0.5"
          >
            FEATURES
          </a>
          <a
            href="#algorithms"
            className="hover:text-[#dc5000] transition-colors hover:border-b hover:border-dashed hover:border-[#40372e] pb-0.5"
          >
            ALGORITHMS
          </a>
          <a
            href="#metrics"
            className="hover:text-[#dc5000] transition-colors hover:border-b hover:border-dashed hover:border-[#40372e] pb-0.5"
          >
            TELEMETRY
          </a>
        </div>

        {/* Right: Solid Bark Brown Pill Action Button */}
        <div className="flex items-center gap-3">
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
            <Link
              href="/dashboard"
              className="oryzo-pill-button inline-flex items-center gap-2"
            >
              <span>LAUNCH CONSOLE</span>
              <ArrowUpRight className="size-3.5 text-[#ffedd7]" />
            </Link>
          </motion.div>
        </div>
      </nav>
    </header>
  )
}
