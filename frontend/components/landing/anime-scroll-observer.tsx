'use client'

import React, { useEffect, useRef } from 'react'
import anime from 'animejs'

interface AnimeScrollObserverProps {
  children: React.ReactNode
  className?: string
  delay?: number
  stagger?: number
}

export function AnimeScrollObserver({
  children,
  className = '',
  delay = 0,
  stagger = 100,
}: AnimeScrollObserverProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const hasAnimated = useRef(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true

            // Target child elements or container itself
            const targets = el.querySelectorAll('.anime-reveal')
            const animTargets = targets.length > 0 ? targets : el

            anime({
              targets: animTargets,
              translateY: [35, 0],
              opacity: [0, 1],
              scale: [0.98, 1],
              easing: 'cubicBezier(0.16, 1, 0.3, 1)',
              duration: 900,
              delay: anime.stagger(stagger, { start: delay }),
            })

            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.15 }
    )

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [delay, stagger])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}
