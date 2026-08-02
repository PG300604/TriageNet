'use client'

import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'skeu-chip skeu-pressable flex size-10 items-center justify-center rounded-lg',
        'border border-border bg-secondary text-secondary-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      {/* Render a stable icon until mounted to avoid hydration mismatch. */}
      {mounted ? (
        isDark ? (
          <Moon className="size-5 text-primary" />
        ) : (
          <Sun className="size-5 text-primary" />
        )
      ) : (
        <Sun className="size-5 text-primary" />
      )}
    </button>
  )
}
