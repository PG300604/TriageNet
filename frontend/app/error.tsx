'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to console / tracking
    console.error('TriageNet Global Runtime Exception:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 selection:bg-[#491205] selection:text-white">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="size-16 mx-auto rounded-2xl bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-500 shadow-xl shadow-red-950/20">
          <AlertTriangle className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-red-400 bg-red-950/60 px-3 py-1 rounded-full border border-red-800/40">
            Clinical System Exception Caught
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-stone-100">
            Telemetry Processing Interrupted
          </h1>
          <p className="text-sm text-stone-400 leading-relaxed">
            An unexpected error occurred while rendering the clinical interface.
            Your patient records and local session state remain safely isolated.
          </p>
        </div>

        {error.message && (
          <div className="text-left font-mono text-[11px] bg-stone-900/80 p-3.5 rounded-xl border border-stone-800 text-stone-400 break-words max-h-32 overflow-y-auto">
            <span className="text-red-400 font-bold">Error:</span> {error.message}
            {error.digest && (
              <span className="block text-stone-500 mt-1">Digest: {error.digest}</span>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#491205] hover:bg-[#5c1706] text-white font-medium text-sm transition-all shadow-lg active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Re-initialize Component</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 font-medium text-sm border border-stone-800 transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>

        <div className="pt-4 text-xs text-stone-500 font-mono">
          TriageNet Emergency System · Fail-Safe Telemetry Guard
        </div>
      </div>
    </div>
  )
}
