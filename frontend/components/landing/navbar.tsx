'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'

import Image from 'next/image'

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-5 font-sans">
      <nav className="mx-auto max-w-7xl flex items-center justify-between border-b border-dashed border-[#40372e]/60 pb-4 backdrop-blur-md bg-[#100904]/70">
        {/* Left: Brand Wordmark with Official TriageNet Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative size-8 overflow-hidden rounded-lg shadow-sm border border-[#491205] bg-[#491205] group-hover:scale-105 transition-transform shrink-0">
            <Image
              src="/triagenet-logo.png"
              alt="TriageNet Official Logo"
              width={32}
              height={32}
              className="object-cover w-full h-full"
              priority
            />
          </div>
          <span className="text-xs md:text-sm font-bold uppercase text-[#ffedd7] tracking-wider font-mono">
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
          <Link
            href="/portal"
            className="text-amber-300 hover:text-amber-200 transition-colors font-bold flex items-center gap-1 border-b border-dashed border-amber-500/30 pb-0.5"
          >
            <span>CITIZEN PORTAL</span>
          </Link>
          <Link
            href="/downloads"
            className="text-[#ea580c] hover:text-orange-400 transition-colors font-bold flex items-center gap-1"
          >
            <span>📱 GET APP</span>
          </Link>
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
