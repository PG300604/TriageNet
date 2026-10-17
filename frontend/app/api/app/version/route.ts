import { NextResponse } from 'next/server'

export async function GET() {
  const versionInfo = {
    appName: 'TriageNet Mobile Companion',
    packageName: 'com.triagenet.companion',
    latestVersion: '1.3.0',
    buildNumber: 130,
    releaseDate: '2026-10-17',
    channel: 'production',
    mandatory: false,
    minSupportedVersion: '1.0.0',
    apkDownloadUrl: '/downloads/triagenet-companion-v1.2.0.apk',
    ipaDownloadUrl: '/downloads/triagenet-companion-v1.2.0.ipa',
    gitHubReleaseUrl: 'https://github.com/PG300604/TriageNet/releases',
    apkSizeMb: 18.4,
    ipaSizeMb: 22.1,
    sha256Checksum: '910dc91c787009dae1247e09c5c4228ce8456557b99413b3d80f985df507e434',
    releaseHighlights: [
      'Phase 12: Municipal ITMS NTCIP 1202 & SCATS Traffic Signal Preemption with Highway VMS gantries',
      'Phase 12: Automated Police PCR Interceptor radio coordination & intersection clearance',
      'Phase 11: Real-Time PSA Oxygen Plant & Cryogenic LMO Tank IoT Telemetry Monitor',
      'Phase 13: Acoustic Siren & Sound Beacon (Native Web Audio API dual-tone emergency sirens)',
      'Phase 14: Ayushman Bharat ABDM / ABHA 14-digit patient intake with clinical prefill',
      'Phase 9.7: 45-minute cross-district bed hold TTL reservation auto-release protocol',
      '3D Isometric Ambulance Van Model with Swiggy/Domino\'s road-snapped highway corridor navigation',
    ],
    roleInterfaces: {
      AMBULANCE_DISPATCH: {
        role: '108 Emergency Ambulance EMT',
        features: ['GPS Highway Navigation', 'Vitals In-Transit Entry', 'Green Wave Preemption', 'Trauma Bay Pre-Alert'],
      },
      TRIAGE_NURSE: {
        role: 'Emergency Department Triage Nurse',
        features: ['Rapid QR Intake', 'ML Acuity Vital Scorer', 'Trauma Bay Bed Lock', 'Local Ward Shortage Alert'],
      },
      HOSPITAL_ADMIN: {
        role: 'Medical Superintendent',
        features: ['Ward Census & ICU Overrides', 'Surgeon Duty Rosters', 'OT Room Allocation', 'ERP Gateway Sync'],
      },
      DISTRICT_CMO: {
        role: 'Chief Medical Officer',
        features: ['District Casualty Heatmap', 'Inter-Facility Transfer Authorizations', 'Emergency Pool Grant Release'],
      },
      SUPER_ADMIN: {
        role: 'State Health Command',
        features: ['24-District Master Telemetry', 'State Highway Hotspot Monitor', 'Institutional Verification'],
      },
    },
    updateEngine: {
      pollingIntervalHours: 4,
      allowMeteredDownload: true,
      inAppNoticeBanner: true,
    },
  }

  return NextResponse.json(versionInfo, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
    },
  })
}
