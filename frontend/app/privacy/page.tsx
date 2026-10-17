import type { Metadata } from 'next'
import React from 'react'
import Link from 'next/link'
import { ShieldCheck, ArrowLeft, Lock, Database, Eye, Trash2, HeartPulse, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy & Health Data Governance (DISHA / ABDM)',
  description:
    'Comprehensive health data privacy charter, ABHA compliance, DISHA standards, and patient data protection policies for TriageNet Jharkhand.',
  alternates: {
    canonical: '/privacy',
  },
  openGraph: {
    title: 'Privacy Policy & Health Data Governance — TriageNet',
    description:
      'Digital Personal Data Protection Act 2023, DISHA standards, and ABDM health data compliance guidelines.',
    url: '/privacy',
    type: 'website',
    images: [{ url: '/opengraph-image.png', width: 1200, height: 630, alt: 'TriageNet Privacy Policy' }],
  },
}

export default function PrivacyPolicyPage() {
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
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DPDP Act 2023 Compliant</span>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* Title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#491205]/40 border border-red-800/30 text-red-400 text-xs font-mono uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Clinical Data Governance</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-100 tracking-tight">
            Privacy Policy & Health Data Governance
          </h1>
          <p className="text-sm text-stone-400 leading-relaxed font-mono">
            Last Updated: October 17, 2026 · Effective across all 24 Districts of Jharkhand
          </p>
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
            <div className="size-8 rounded-lg bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <Lock className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-stone-200">Zero Commercial Tracking</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              TriageNet does not sell health data, deploy advertising trackers, or share clinical vitals with unauthorized commercial brokers.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
            <div className="size-8 rounded-lg bg-sky-950/50 border border-sky-800/40 flex items-center justify-center text-sky-400">
              <Database className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-stone-200">ABDM & Ayushman Parity</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              14-digit ABHA health identifiers are strictly processed under National Health Authority (NHA) digital consent frameworks.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800 space-y-2">
            <div className="size-8 rounded-lg bg-amber-950/50 border border-amber-800/40 flex items-center justify-center text-amber-400">
              <Trash2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-stone-200">Right to Erasure</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Clinicians and healthcare workers can wipe local operational caches and request account de-registration at any time.
            </p>
          </div>
        </div>

        {/* Detailed Sections */}
        <section className="space-y-6 text-stone-300 text-sm leading-relaxed border-t border-stone-800/80 pt-8">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-stone-100">1. Information We Collect During Emergency Operations</h2>
            <p className="text-stone-400">
              During high-acuity trauma triage, 108 ambulance dispatch, and hospital transfers, TriageNet processes:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-400 text-xs">
              <li><strong>De-Identified Clinical Triage Telemetry</strong>: Presenting complaint, Glasgow Coma Scale (GCS), SpO2 saturation, systolic blood pressure, respiratory rate, and triage priority score.</li>
              <li><strong>Emergency Vehicle Telemetry</strong>: Real-time GPS coordinates, transit speed, destination hospital ETA, and NTCIP 1202 traffic signal preemption telemetry.</li>
              <li><strong>Hospital Facility Inventory</strong>: Available general beds, ICU beds, oxygen generation capacity (PSA purity and line pressure), ventilator availability, and on-duty surgical roster.</li>
              <li><strong>Healthcare Personnel Metadata</strong>: Verified State Clinician IDs (`JH-DOC-XXXX`, `JH-NUR-XXXX`), role credentials, shift PIN hashes, and TOTP MFA tokens.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-stone-100">2. Legal Basis & Statutory Compliance</h2>
            <p className="text-stone-400">
              Processing is carried out strictly under the <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> for emergency medical purposes, life-saving triage decisions, and state public healthcare resource governance. All national health intake respects Ayushman Bharat Digital Mission (ABDM) standards.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-stone-100">3. Cryptographic Storage & Transmission</h2>
            <p className="text-stone-400">
              All communications in transit are encrypted using <strong>TLS 1.3 / HTTP/2</strong> with strict Content-Security-Policy headers. Stored data is safeguarded with PostgreSQL row-level isolation and salted SHA-256 authentication hashes. Sensitive third-party API keys (e.g. OpenRouteService, ABDM Sandbox) are kept off client bundles and proxied server-side.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-stone-100">4. User Rights & Data Wipe Protocol</h2>
            <p className="text-stone-400">
              Users and participating hospital administrators may request immediate export or deletion of personal account records and local preference caches. The &ldquo;Delete Account / Clear Local Clinical Cache&rdquo; tool in your clinician settings purges all stored tokens, credentials, and custom keys with zero delay.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-stone-100">5. Contact & Clinical Grievance Redressal</h2>
            <p className="text-stone-400">
              For security disclosures or health data inquiries:
            </p>
            <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 font-mono text-xs text-stone-400 space-y-1">
              <div><strong>Grievance Officer:</strong> Clinical Security & Telemetry Secretariat</div>
              <div><strong>Email:</strong> privacy@triagenet.dev · security@triagenet.dev</div>
              <div><strong>Emergency Helplines:</strong> 108 (Ambulance Command) · 104 (Health Information)</div>
            </div>
          </div>
        </section>

        {/* Footer Return */}
        <div className="border-t border-stone-900 pt-6 flex items-center justify-between text-xs text-stone-500 font-mono">
          <span>TriageNet · Open-Source Emergency Infrastructure</span>
          <Link href="/terms" className="hover:text-stone-300 underline">
            Terms of Service →
          </Link>
        </div>
      </main>
    </div>
  )
}
