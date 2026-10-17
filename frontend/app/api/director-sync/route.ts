import { NextRequest, NextResponse } from 'next/server'

interface SyncState {
  activeShoot: 'web' | 'mobile' | null
  startTime: number
  updatedAt: number
}

// Global in-memory state across requests in dev server
const globalSyncState: SyncState = {
  activeShoot: null,
  startTime: 0,
  updatedAt: Date.now(),
}

export async function GET(req: NextRequest) {
  const trigger = req.nextUrl.searchParams.get('shoot')
  if (trigger === 'web' || trigger === 'mobile') {
    globalSyncState.activeShoot = trigger
    globalSyncState.startTime = Date.now()
    globalSyncState.updatedAt = Date.now()
  } else if (trigger === 'stop') {
    globalSyncState.activeShoot = null
    globalSyncState.startTime = 0
    globalSyncState.updatedAt = Date.now()
  }

  const now = Date.now()
  let elapsedSeconds = 0

  if (globalSyncState.activeShoot) {
    elapsedSeconds = Math.max(0, (now - globalSyncState.startTime) / 1000)
    // Auto-expire after 75 seconds so subsequent runs don't get stuck in expired state
    if (elapsedSeconds > 75) {
      globalSyncState.activeShoot = null
      globalSyncState.startTime = 0
      elapsedSeconds = 0
    }
  }

  return NextResponse.json({
    activeShoot: globalSyncState.activeShoot,
    startTime: globalSyncState.startTime,
    elapsedSeconds: Math.round(elapsedSeconds * 10) / 10,
    serverTime: now,
  })
}

export async function POST(req: NextRequest) {
  try {
    let shoot: string | null = req.nextUrl.searchParams.get('shoot')
    if (!shoot) {
      const body = await req.json().catch(() => ({}))
      shoot = body?.shoot || null
    }

    if (shoot === 'web' || shoot === 'mobile') {
      globalSyncState.activeShoot = shoot
      globalSyncState.startTime = Date.now()
      globalSyncState.updatedAt = Date.now()
    } else {
      globalSyncState.activeShoot = null
      globalSyncState.startTime = 0
      globalSyncState.updatedAt = Date.now()
    }

    return NextResponse.json({
      success: true,
      activeShoot: globalSyncState.activeShoot,
      startTime: globalSyncState.startTime,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
