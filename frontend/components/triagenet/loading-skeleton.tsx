import React from 'react'

export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border border-stone-800/80 bg-stone-900/40 p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 bg-stone-800 rounded-md" />
            <div className="h-5 w-16 bg-stone-800 rounded-full" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-3/4 bg-stone-800/70 rounded" />
            <div className="h-3 w-1/2 bg-stone-800/50 rounded" />
          </div>
          <div className="pt-2 flex items-center gap-2">
            <div className="h-7 w-20 bg-stone-800/80 rounded-lg" />
            <div className="h-7 w-20 bg-stone-800/60 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full rounded-2xl border border-stone-800 bg-stone-950/60 overflow-hidden animate-pulse">
      <div className="h-10 bg-stone-900/80 border-b border-stone-800 flex items-center px-4 gap-4">
        <div className="h-3 w-20 bg-stone-800 rounded" />
        <div className="h-3 w-32 bg-stone-800 rounded" />
        <div className="h-3 w-24 bg-stone-800 rounded" />
        <div className="h-3 w-16 bg-stone-800 rounded ml-auto" />
      </div>
      <div className="divide-y divide-stone-900">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 px-4 flex items-center gap-4">
            <div className="h-3 w-16 bg-stone-800/60 rounded" />
            <div className="h-3 w-40 bg-stone-800/80 rounded" />
            <div className="h-3 w-28 bg-stone-800/50 rounded" />
            <div className="h-6 w-20 bg-stone-800/70 rounded-full ml-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function GaugeSkeleton() {
  return (
    <div className="rounded-2xl border border-stone-800 bg-stone-900/40 p-5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-4 w-36 bg-stone-800 rounded" />
        <div className="h-4 w-12 bg-stone-800 rounded" />
      </div>
      <div className="h-2 w-full bg-stone-800 rounded-full" />
      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="h-10 bg-stone-800/60 rounded-xl" />
        <div className="h-10 bg-stone-800/60 rounded-xl" />
        <div className="h-10 bg-stone-800/60 rounded-xl" />
      </div>
    </div>
  )
}
