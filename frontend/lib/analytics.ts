/**
 * TriageNet Privacy-Preserving Telemetry & Error Tracking
 * Compliant with DPDP Act 2023 - No third-party ad trackers, zero commercial cookies.
 */

export interface TelemetryEvent {
  name: string
  timestamp: string
  payload?: Record<string, any>
}

export interface ErrorReport {
  message: string
  stack?: string
  digest?: string
  url: string
  timestamp: string
  userAgent: string
}

class ClinicalTelemetryService {
  private eventBuffer: TelemetryEvent[] = []
  private readonly maxBufferSize = 50

  /**
   * Track high-level clinical actions (e.g. Green Wave engaged, Triage score calculated)
   */
  trackEvent(name: string, payload?: Record<string, any>) {
    const event: TelemetryEvent = {
      name,
      timestamp: new Date().toISOString(),
      payload,
    }

    this.eventBuffer.push(event)
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer.shift()
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Telemetry Event] ${name}:`, payload)
    }

    try {
      // Dispatch browser custom event for internal monitors
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('triagenet_telemetry_event', { detail: event }))
      }
    } catch {
      // silent
    }
  }

  /**
   * Track frontend errors with stack trace & context
   */
  trackError(error: Error | string, context?: Record<string, any>) {
    const message = typeof error === 'string' ? error : error.message
    const stack = typeof error === 'string' ? undefined : error.stack

    const report: ErrorReport = {
      message,
      stack,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    }

    console.warn('[Telemetry Error Captured]:', report, context)

    try {
      if (typeof window !== 'undefined') {
        const storedErrors = JSON.parse(localStorage.getItem('triagenet_error_logs') || '[]')
        storedErrors.push({ ...report, context })
        // Keep max 20 logs in localStorage
        if (storedErrors.length > 20) storedErrors.shift()
        localStorage.setItem('triagenet_error_logs', JSON.stringify(storedErrors))
      }
    } catch {
      // localstorage failure silent
    }
  }

  /**
   * Get cached telemetry events
   */
  getRecentEvents(): TelemetryEvent[] {
    return [...this.eventBuffer]
  }

  /**
   * Clear error logs and local telemetry cache
   */
  clearLogs() {
    this.eventBuffer = []
    if (typeof window !== 'undefined') {
      localStorage.removeItem('triagenet_error_logs')
    }
  }
}

export const analytics = new ClinicalTelemetryService()
