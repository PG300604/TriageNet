'use client'

import { cn } from '@/lib/utils'
import {
  HOSPITAL_IDS,
  type Patient,
  type ReferralRecommendation,
  type ScenarioKey,
  type TriageState,
  advanceTime,
  buildScenario,
  executeRegionalReferral,
  getRegionalReferralRecommendation,
  processNewArrival,
  runContinuousSimulationStep,
  runAiSupplyDispatch,
  severityStatus,
  triggerBedRelease,
} from '@/lib/triage-data'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { CapacityView } from './capacity-view'
import { RegionalNetworkView } from './regional-network-view'
import { Sidebar, type ViewKey, ROLE_ALLOWED_VIEWS, ROLE_CONFIGS } from './sidebar'
import { useAuth, UserRole } from '@/lib/auth-context'
import { TopBar } from './top-bar'
import { TriageQueueView } from './triage-queue-view'
import { PatientsView } from './patients-view'
import { AiCdsView } from './aicds-view'
import { AppointmentsView } from './appointments-view'
import { ClinicalView } from './clinical-view'
import { BillingView } from './billing-view'
import { DocsView } from './docs-view'
import { SuppliesView } from './supplies-view'
import { ReportsView } from './reports-view'
import { CommsView } from './comms-view'
import { Siren } from 'lucide-react'

const VIEW_TITLES: Record<string, string> = {
  capacity: 'Dashboard & Analytics',
  patients: 'Patient Directory & Clinical ML Scorer',
  queue: 'Triage Priority Heap Queue',
  network: 'Regional Network & Dijkstra Overflow',
  aicds: 'AI Clinical Decision Support (CDS)',
  appointments: 'Appointments & Triage Schedule',
  clinical: 'Clinical Operations & Bed Management',
  billing: 'Billing & Financial Revenue Triage',
  docs: 'Medical Records & EHR Documents',
  supplies: 'Inventory & Supplies',
  reports: 'Reports & Risk Telemetry Analytics',
  comms: 'Regional Emergency Communications',
}

export function Dashboard() {
  const { user } = useAuth()
  const currentRole: UserRole = user?.role || 'SUPER_ADMIN'
  const allowedViews = ROLE_ALLOWED_VIEWS[currentRole] || ROLE_ALLOWED_VIEWS.SUPER_ADMIN
  const roleConfig = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.SUPER_ADMIN

  const [view, setView] = useState<ViewKey>(allowedViews[0] || 'capacity')
  const [scenario, setScenario] = useState<ScenarioKey>('steady')
  const [state, setState] = useState<TriageState>(() => buildScenario('steady'))
  const [selectedHospitalId, setSelectedHospitalId] = useState<string>(HOSPITAL_IDS.city)
  const [updatedIds, setUpdatedIds] = useState<Set<string>>(new Set())
  const [isPlaying, setIsPlaying] = useState(false)
  const [lastEventMessage, setLastEventMessage] = useState<string | null>(null)

  // Auto-redirect if current view is disallowed for the active role
  useEffect(() => {
    if (!allowedViews.includes(view)) {
      setView(allowedViews[0])
    }
  }, [user, currentRole, allowedViews, view])

  const selectedHospital = useMemo(
    () => state.hospitals.find((h) => h.id === selectedHospitalId) ?? state.hospitals[0],
    [state.hospitals, selectedHospitalId],
  )

  const runScenario = useCallback((next: ScenarioKey) => {
    const built = buildScenario(next)
    setScenario(next)
    setState(built)
    setIsPlaying(false)
    setLastEventMessage(null)
    if (next === 'mass-casualty') {
      setSelectedHospitalId(HOSPITAL_IDS.city)
      setView('queue')
      setUpdatedIds(new Set(built.patients.map((p) => p.id)))
      window.setTimeout(() => setUpdatedIds(new Set()), 1200)
    } else {
      setUpdatedIds(new Set())
    }
  }, [])

  const simulateTime = useCallback((stepMinutes = 7) => {
    setState((prev) => {
      const nextPatients = advanceTime(prev.patients, stepMinutes)
      return { ...prev, patients: nextPatients }
    })
    setUpdatedIds(
      new Set(
        state.patients
          .filter((p) => p.hospitalId === selectedHospitalId && p.status !== 'Transferred')
          .map((p) => p.id),
      ),
    )
    window.setTimeout(() => setUpdatedIds(new Set()), 1200)
  }, [state.patients, selectedHospitalId])

  const handleAiSupplyDispatch = useCallback(() => {
    const { state: nextState, eventMsg } = runAiSupplyDispatch(state)
    setState(nextState)
    setLastEventMessage(eventMsg)
    setTimeout(() => setLastEventMessage(null), 8000)
  }, [state])

  const injectArrival = useCallback(
    (severity: number, name: string, complaint: string) => {
      const newPt: Patient = {
        id: `P-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        hospitalId: selectedHospitalId,
        severity,
        waitMinutes: 0,
        topFactor: complaint,
        status: 'Waiting',
      }

      const { state: nextState, preemptedPatientName } = processNewArrival(state, newPt)
      setState(nextState)
      setUpdatedIds(new Set([newPt.id]))

      if (preemptedPatientName) {
        setLastEventMessage(
          `Critical arrival ${newPt.name} (Severity: ${severity}) assigned at ${selectedHospital.name}. Preempted lower-acuity patient ${preemptedPatientName} to step-down holding!`,
        )
      } else {
        setLastEventMessage(`Arrival registered: ${newPt.name} entered ${selectedHospital.name} queue in Holding state.`)
      }
      setTimeout(() => setLastEventMessage(null), 6000)
    },
    [state, selectedHospitalId, selectedHospital],
  )

  const handleBedRelease = useCallback(
    (reason: 'recovery' | 'family_ama') => {
      const { state: nextState, message } = triggerBedRelease(state, selectedHospitalId, reason)
      setState(nextState)
      setLastEventMessage(message)
      setTimeout(() => setLastEventMessage(null), 6000)
    },
    [state, selectedHospitalId],
  )

  const referralRecommendation = useMemo(
    () => getRegionalReferralRecommendation(state),
    [state],
  )

  const handleExecuteReferral = useCallback(
    (referral: ReferralRecommendation) => {
      const { state: nextState, message } = executeRegionalReferral(state, referral)
      setState(nextState)
      setLastEventMessage(message)
      setTimeout(() => setLastEventMessage(null), 6000)
    },
    [state],
  )

  // Auto-play timer for continuous simulation
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setState((prev) => {
        const { state: nextState, eventMsg } = runContinuousSimulationStep(prev)
        setLastEventMessage(eventMsg)
        return nextState
      })
    }, 1600)
    return () => clearInterval(interval)
  }, [isPlaying])

  const hospitalPatients = useMemo(
    () => state.patients.filter((p) => p.hospitalId === selectedHospitalId),
    [state.patients, selectedHospitalId],
  )

  const criticalCount = useMemo(
    () =>
      state.patients.filter(
        (p) => p.status !== 'Transferred' && severityStatus(p.severity) === 'red',
      ).length,
    [state.patients],
  )

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gradient-to-br from-[#fdfbf7] via-[#f7f2ea]/80 to-[#ffffff] text-[#2c1b0e] font-sans">
      <Sidebar active={view} onChange={setView} criticalCount={criticalCount} />

      <div className="flex min-w-0 flex-1 flex-col relative z-20">
        <TopBar
          hospitals={state.hospitals}
          patients={state.patients}
          selectedHospitalId={selectedHospitalId}
          onSelectHospital={setSelectedHospitalId}
          scenario={scenario}
          onRunScenario={runScenario}
          onFastForward={simulateTime}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((v) => !v)}
          onNavigateView={setView}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gradient-to-br from-[#fdfbf7] via-[#f7f2ea]/70 to-[#ffffff] relative z-1">
          <div className="mx-auto max-w-7xl">
            {/* RBAC Role Context Header */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#382416]/15 bg-white p-3.5 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-[#382416] text-[#ffedd7] shrink-0">
                  <roleConfig.icon className="size-4 text-[#dc5000]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#382416] text-sm">{user?.name || 'Dr. Priyanshu Ghosh'}</span>
                    <span className={cn('font-mono text-[9px] font-bold px-2 py-0.5 rounded border uppercase', roleConfig.color)}>
                      [{roleConfig.badge}]
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {user?.roleTitle || 'System Super Admin'} · {user?.districtName || 'Statewide Command'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="bg-[#FAF6F0] px-2.5 py-1 rounded-lg border border-[#382416]/10 font-bold text-[#382416]">
                  ROLE PERMITTED VIEWS: {allowedViews.length} / 12
                </span>
              </div>
            </div>

            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#382416]/15 pb-3">
              <h1 className="text-lg font-bold tracking-tight text-[#382416] uppercase md:text-xl font-mono">
                {VIEW_TITLES[view] ?? 'Dashboard'}
              </h1>
              {scenario !== 'steady' && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 border border-red-300 px-3 py-1 text-xs font-bold text-red-800 uppercase font-mono">
                  <Siren className="size-3.5" />
                  {scenario === 'mass-casualty' ? 'Mass Casualty Event' : 'Regional Surge'} active
                </span>
              )}
            </div>


            {view === 'capacity' && (
              <CapacityView
                state={state}
                selectedHospitalId={selectedHospitalId}
                onSelectHospital={setSelectedHospitalId}
                onNavigateView={setView}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((v) => !v)}
                onFastForward={simulateTime}
              />
            )}
            {view === 'queue' && (
              <TriageQueueView
                hospital={selectedHospital}
                patients={hospitalPatients}
                updatedIds={updatedIds}
                onSimulate={() => simulateTime(7)}
                onFastForward5x={() => simulateTime(35)}
                onInjectArrival={injectArrival}
                onTriggerBedRelease={handleBedRelease}
                referralRecommendation={referralRecommendation}
                onExecuteReferral={handleExecuteReferral}
                lastEventMessage={lastEventMessage}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((v) => !v)}
              />
            )}
            {view === 'network' && <RegionalNetworkView state={state} />}
            {(view as string) === 'patients' && <PatientsView state={state} />}
            {(view as string) === 'aicds' && <AiCdsView state={state} />}
            {(view as string) === 'appointments' && <AppointmentsView />}
            {(view as string) === 'clinical' && <ClinicalView state={state} onStateChange={setState} />}
            {(view as string) === 'billing' && <BillingView />}
            {(view as string) === 'docs' && <DocsView />}
            {(view as string) === 'supplies' && (
              <SuppliesView
                state={state}
                onStateChange={setState}
                onRunAiSupplyDispatch={handleAiSupplyDispatch}
              />
            )}
            {(view as string) === 'reports' && (
              <ReportsView
                state={state}
                onRunAiSupplyDispatch={handleAiSupplyDispatch}
              />
            )}
            {(view as string) === 'comms' && <CommsView />}
          </div>
        </main>
      </div>
    </div>
  )
}
