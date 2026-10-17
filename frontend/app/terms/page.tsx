import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import { FileText, ArrowLeft, ShieldCheck, AlertTriangle, Stethoscope, Scale, Radio } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service & Clinical Decision-Support Governance',
  description:
    'Statutory terms of service, AI clinical decision-support disclaimers, emergency medical response liability, and user compliance agreements for TriageNet Jharkhand.',
  alternates: {
    canonical: '/terms',
  },
  openGraph: {
    title: 'Terms of Service & Clinical Governance — TriageNet',
    description:
      'Clinical decision-support terms, triage liability frameworks, and health system operational compliance.',
    url: '/terms',
    type: 'website',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'TriageNet Terms of Service' }],
  },
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 selection:bg-[#491205] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur-md sticky top-0 z-30 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono text-stone-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Command Portal</span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-3 py-1 rounded-full">
            <Scale className="w-3.5 h-3.5" />
            <span>Clinical Terms of Service</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#491205]/40 border border-red-800/30 text-red-400 text-xs font-mono uppercase tracking-wider">
            <FileText className="w-3.5 h-3.5" />
            <span>Software Operational Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
            Terms of Service & Clinical Operational Notice
          </h1>
          <p className="text-sm text-stone-400 leading-relaxed font-mono">
            Version 1.3.0 · Applicable to all 108 Emergency Fleets & Healthcare Institutions
          </p>
        </div>

        {/* Warning Banner */}
        <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-300 leading-relaxed">
            <strong className="block font-bold text-amber-200">Clinical Decision Support Disclaimer</strong>
            TriageNet provides algorithmic decision support, spatial Dijkstra routing, and Kuhn-Munkres bed allocation optimization. It does not replace the independent medical judgment of on-duty emergency physicians, trauma surgeons, or licensed paramedics.
          </div>
        </div>

        {/* Sections */}
        <section className="space-y-8 text-stone-300 text-sm leading-relaxed border-t border-stone-800/80 pt-8">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-stone-100">1. Acceptance of Terms</h2>
            <p className="text-stone-400">
              By accessing or utilizing TriageNet (including the State Command Dashboard, 108 Ambulance EMT field companion, Bedside Nurse intake console, and API interfaces), you agree to be bound by these Terms of Service. If operating on behalf of a public hospital or ambulance agency, you represent that you hold valid operational authority.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-stone-100">2. Permitted Clinical Use & Authentication</h2>
            <p className="text-stone-400">
              Access is restricted to authorized state health officers, clinicians, nurses, and 108 emergency dispatchers. Users must safeguard their 6-digit TOTP authenticators, shift PIN codes, and 12-word mnemonic recovery phrases. Account sharing or transmitting clinical credentials in unencrypted channels is strictly prohibited.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-stone-100">3. Emergency Traffic Preemption & Highway Safety</h2>
            <p className="text-stone-400">
              The Municipal ITMS 108 Green Wave Signal Preemption system transmits NTCIP 1202 / SCATS preemption commands to traffic signal controllers. Ambulance drivers and dispatchers must ensure:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-400 text-xs">
              <li>Preemption is engaged exclusively during Code Red and severe trauma emergency transport with active visual and acoustic sirens.</li>
              <li>Drivers exercise due caution when entering intersections regardless of green signal lock status.</li>
              <li>Preemption corridors are released immediately upon patient handover at the trauma center.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-stone-100">4. Bed Hold TTL & Allocation Protocol</h2>
            <p className="text-stone-400">
              Under Phase 9.7, inter-district ICU and ventilator transfer reservations are subject to a strict <strong>45-minute Time-To-Live (TTL)</strong> reservation window. If an in-transit ambulance fails to arrive or cancels, the receiving hospital reservation is automatically returned to the state emergency pool to prevent bed starvation.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-stone-100">5. Limitation of Liability</h2>
            <p className="text-stone-400">
              TriageNet is provided &ldquo;as is&rdquo; without warranty of uninterrupted network availability. The developers, state health authorities, and open-source contributors shall not be held liable for communication delays resulting from cellular dead zones, satellite GPS outages, or highway physical obstacles beyond system control.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-stone-100">6. Modifications to Terms & Platform Updates</h2>
            <p className="text-stone-400">
              We reserve the right to upgrade algorithms, adjust triage scoring weights ($\lambda$ decay parameters), and modify APIs in accordance with clinical governance board directives. Over-The-Air (OTA) updates will deliver version upgrades through the official versioning channel.
            </p>
          </div>
        </section>

        {/* Footer Return */}
        <div className="border-t border-stone-900 pt-6 flex items-center justify-between text-xs text-stone-500 font-mono">
          <span>TriageNet · Open-Source Emergency Infrastructure</span>
          <Link href="/privacy" className="hover:text-stone-300 underline">
            Privacy Policy & Health Data Governance →
          </Link>
        </div>
      </main>
    </div>
  )
}
