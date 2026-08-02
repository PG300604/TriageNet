'use client'

import { cn } from '@/lib/utils'
import {
  EDGES,
  type Hospital,
  type TriageState,
  type Transfer,
  hospitalStatus,
  STATUS_LABEL,
} from '@/lib/triage-data'
import { STATUS_CLASSES } from './status'
import { ArrowRight, Route } from 'lucide-react'
import { useState } from 'react'

const W = 800
const H = 500

interface RegionalNetworkViewProps {
  state: TriageState
}

function toXY(h: Hospital) {
  return { x: (h.x / 100) * W, y: (h.y / 100) * H }
}

export function RegionalNetworkView({ state }: RegionalNetworkViewProps) {
  const { hospitals, transfers } = state
  const [hovered, setHovered] = useState<string | null>(null)

  const byId = new Map(hospitals.map((h) => [h.id, h]))
  const activeTransfers = transfers.filter((t) => t.active)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight text-foreground">
          Regional Transfer Network
        </h2>
        <p className="text-sm text-muted-foreground">
          {activeTransfers.length} active transfer{activeTransfers.length === 1 ? '' : 's'} · routing
          via shortest transfer time
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_20rem]">
        <div className="overflow-hidden rounded-xl border border-border bg-card p-2">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-full w-full"
            role="img"
            aria-label="Regional hospital transfer network graph"
          >
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--status-red)" />
              </marker>
            </defs>

            {/* Base network edges */}
            {EDGES.map((edge) => {
              const a = byId.get(edge.fromId)
              const b = byId.get(edge.toId)
              if (!a || !b) return null
              const pa = toXY(a)
              const pb = toXY(b)
              const dx = pb.x - pa.x
              const dy = pb.y - pa.y
              const len = Math.hypot(dx, dy) || 1
              // Nudge label perpendicular to the edge so active transfer lines
              // never sit on top of the transfer-time pill.
              const off = 16
              const mx = (pa.x + pb.x) / 2 + (-dy / len) * off
              const my = (pa.y + pb.y) / 2 + (dx / len) * off
              return (
                <g key={`${edge.fromId}-${edge.toId}`}>
                  <line
                    x1={pa.x}
                    y1={pa.y}
                    x2={pb.x}
                    y2={pb.y}
                    stroke="var(--border)"
                    strokeWidth={2}
                  />
                  <g>
                    <rect
                      x={mx - 26}
                      y={my - 12}
                      width={52}
                      height={20}
                      rx={10}
                      fill="var(--card)"
                      stroke="var(--border)"
                      strokeWidth={1}
                    />
                    <text
                      x={mx}
                      y={my + 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="fill-muted-foreground"
                      style={{ fontSize: 12, fontFamily: 'var(--font-mono)' }}
                    >
                      {edge.minutes} min
                    </text>
                  </g>
                </g>
              )
            })}

            {/* Active transfer edges */}
            {activeTransfers.map((t) => {
              const a = byId.get(t.fromId)
              const b = byId.get(t.toId)
              if (!a || !b) return null
              const pa = toXY(a)
              const pb = toXY(b)
              const isHovered = hovered === t.id
              return (
                <line
                  key={t.id}
                  x1={pa.x}
                  y1={pa.y}
                  x2={pb.x}
                  y2={pb.y}
                  stroke="var(--status-red)"
                  strokeWidth={isHovered ? 4 : 3}
                  markerEnd="url(#arrow)"
                  className="edge-active"
                  opacity={hovered && !isHovered ? 0.35 : 1}
                />
              )
            })}

            {/* Nodes */}
            {hospitals.map((h) => {
              const { x, y } = toXY(h)
              const status = hospitalStatus(h)
              const token = STATUS_CLASSES[status].token
              return (
                <g key={h.id}>
                  {status === 'red' && (
                    <circle
                      cx={x}
                      cy={y}
                      fill={token}
                      className="node-pulse"
                      style={
                        {
                          ['--pulse-min' as string]: '26px',
                          ['--pulse-max' as string]: '44px',
                        } as React.CSSProperties
                      }
                    />
                  )}
                  <circle cx={x} cy={y} r={26} fill="var(--card)" stroke={token} strokeWidth={4} />
                  <circle cx={x} cy={y} r={16} fill={token} opacity={0.15} />
                  <text
                    x={x}
                    y={y + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill={token}
                    style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
                  >
                    {h.short}
                  </text>
                  <text
                    x={x}
                    y={y + 44}
                    textAnchor="middle"
                    className="fill-foreground"
                    style={{ fontSize: 13, fontWeight: 600 }}
                  >
                    {h.name}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Side panel: active transfers + legend */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
              <Route className="size-4 text-destructive" />
              Active transfers
            </h3>
            <ul className="flex flex-col gap-2">
              {activeTransfers.length === 0 && (
                <li className="text-sm text-muted-foreground">No active transfers.</li>
              )}
              {activeTransfers.map((t) => (
                <TransferCard
                  key={t.id}
                  transfer={t}
                  from={byId.get(t.fromId)}
                  to={byId.get(t.toId)}
                  onHover={setHovered}
                  hovered={hovered === t.id}
                />
              ))}
            </ul>
          </div>

          <Legend />
        </div>
      </div>
    </div>
  )
}

function TransferCard({
  transfer,
  from,
  to,
  onHover,
  hovered,
}: {
  transfer: Transfer
  from?: Hospital
  to?: Hospital
  onHover: (id: string | null) => void
  hovered: boolean
}) {
  return (
    <li
      onMouseEnter={() => onHover(transfer.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        'cursor-default rounded-lg border p-3 transition-colors',
        hovered ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-background',
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-sm font-semibold text-foreground">
          Patient {transfer.patientLabel}
        </span>
        <span className="rounded-full bg-status-red-soft px-2 py-0.5 font-mono text-xs font-medium text-status-red">
          {transfer.minutes} min
        </span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-sm text-foreground">
        <span className="truncate">{from?.name}</span>
        <ArrowRight className="size-3.5 shrink-0 text-destructive" />
        <span className="truncate">{to?.name}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Routed via {transfer.algorithm}</p>
        <span className="font-mono text-[10px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
          BED ASSIGNED AT {to?.short ?? 'TARGET'}
        </span>
      </div>
    </li>
  )
}

function Legend() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">Legend</h3>
      <div className="flex flex-col gap-2.5">
        {(['green', 'amber', 'red'] as const).map((s) => (
          <div key={s} className="flex items-center gap-2.5 text-sm">
            <span
              className="size-4 shrink-0 rounded-full border-2"
              style={{ borderColor: STATUS_CLASSES[s].token }}
            />
            <span className="text-muted-foreground">
              Node — {STATUS_LABEL[s]} capacity
            </span>
          </div>
        ))}
        <div className="mt-1 flex items-center gap-2.5 text-sm">
          <svg width="28" height="10" aria-hidden="true">
            <line
              x1="0"
              y1="5"
              x2="28"
              y2="5"
              stroke="var(--border)"
              strokeWidth={2}
            />
          </svg>
          <span className="text-muted-foreground">Route (transfer time)</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm">
          <svg width="28" height="10" aria-hidden="true">
            <line
              x1="0"
              y1="5"
              x2="28"
              y2="5"
              stroke="var(--status-red)"
              strokeWidth={3}
              strokeDasharray="5 4"
            />
          </svg>
          <span className="text-muted-foreground">Active patient transfer</span>
        </div>
      </div>
    </div>
  )
}
