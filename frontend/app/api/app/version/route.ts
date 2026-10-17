import { NextResponse } from 'next/server'

export async function GET() {
  const versionInfo = {
    appName: 'TriageNet Mobile Companion',
    packageName: 'com.triagenet.companion',
    latestVersion: '1.2.0',
    buildNumber: 120,
    releaseDate: '2026-10-16',
    channel: 'production',
    mandatory: false,
    minSupportedVersion: '1.0.0',
    apkDownloadUrl: '/downloads/triagenet-companion-v1.2.0.apk',
    ipaDownloadUrl: '/downloads/triagenet-companion-v1.2.0.ipa',
    gitHubReleaseUrl: 'https://github.com/PG300604/TriageNet/releases',
    apkSizeMb: 0.1,
    ipaSizeMb: 22.1,
    sha256Checksum: '910dc91c787009dae1247e09c5c4228ce8456557b99413b3d80f985df507e434',
    releaseHighlights: [
      '3D Isometric Ambulance Van Model with Battenburg livery and active LED strobes',
      'Swiggy / Domino\'s style real road-snapped highway navigation (NH-33, GT Road)',
      'Multi-corridor Express Bypass vs Primary Highway ETA comparison',
      'AI Dynamic Specialist Traffic Diversion for apex facilities during severe gridlock',
      'Hardware-accelerated SVG Dijkstra patient flow wave telemetry',
      'Paramedic field vitals entry with 1-touch Green Wave signal preemption siren',
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
