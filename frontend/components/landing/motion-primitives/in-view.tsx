'use client'

import React, { useRef } from 'react'
import { motion, useInView, type Variants } from 'framer-motion'

interface InViewProps {
  children: React.ReactNode
  className?: string
  variants?: Variants
  transition?: object
  viewOptions?: object
}

const defaultVariants: Variants = {
  hidden: { opacity: 0, y: 35, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
}

export function InView({
  children,
  className = '',
  variants = defaultVariants,
  transition = { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  viewOptions = { once: true, margin: '-50px' },
}: InViewProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, viewOptions)

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  )
}
