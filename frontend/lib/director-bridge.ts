/**
 * Director Bridge — Cross-Window / Cross-Tab Communication Protocol
 * Enables the hidden /control dashboard to remotely orchestrate simulations,
 * scenarios, time advancement, patient injections, and persona switching
 * on active TriageNet display tabs via the browser BroadcastChannel API.
 */

export type DirectorEvent =
  | { type: 'TRIGGER_SCENARIO'; scenario: 'steady' | 'mass-casualty' | 'regional-surge' }
  | { type: 'SET_PLAYING'; isPlaying: boolean }
  | { type: 'STEP_TIME'; minutes: number }
  | { type: 'INJECT_PATIENT'; patientType: 'critical_trauma' | 'cardiac_arrest' | 'pediatric_respiratory' | 'sepsis_shock' }
  | { type: 'TRIGGER_BED_RELEASE'; reason: 'recovery' | 'family_ama' }
  | { type: 'SWITCH_ROLE'; staffId: string }
  | { type: 'SET_VIEW'; view: string }
  | { type: 'SET_DISTRICT'; district: string }
  | {
      type: 'TRIGGER_ACCIDENT_HOTSPOT'
      hotspotId: string
      name: string
      lat: number
      lng: number
      incidentNature: string
      patientName: string
      requiredSpecialistRole: 'Neurosurgeon' | 'Pulmonologist' | 'TraumaSurgeon' | 'BurnsPlastic' | 'OrthopedicSurgeon'
      trafficLevel: 'CLEAR' | 'MODERATE' | 'HEAVY'
      trafficDelayMin: number
      vitals: {
        spo2: number
        heartRate: number
        systolicBp: number
        gcs: number
      }
    }
  | { type: 'TOGGLE_GREEN_WAVE'; active: boolean }
  | {
      type: 'TRAFFIC_SIGNAL_PREEMPTION_UPDATE'
      ambulanceNumber: string
      active: boolean
      signalsPreempted: number
      trafficDelayClearedMin: number
      vmsAlert: string
      upcomingSignals?: Array<{
        signalId: string
        name: string
        distanceMeters: number
        etaSec: number
        phase: string
      }>
    }
  | {
      type: 'UPDATE_PATIENT_VITALS'
      vitals: {
        spo2: number
        heartRate: number
        systolicBp: number
        gcs: number
      }
      patientName?: string
      incidentNature?: string
      requiredSpecialistRole?: 'Neurosurgeon' | 'Pulmonologist' | 'TraumaSurgeon' | 'BurnsPlastic' | 'OrthopedicSurgeon'
    }
  | {
      type: 'SELECT_DESTINATION_HOSPITAL'
      hospitalId: string
      hospitalName: string
      ambulanceNumber?: string
    }
  | {
      type: 'DISPATCH_AMBULANCE_FROM_MOBILE'
      ambulanceNumber: string
      hospitalId: string
      hospitalName: string
      patientName: string
      incidentNature: string
      etaMinutes: number
      vitals: {
        spo2: number
        heartRate: number
        systolicBp: number
        gcs: number
      }
    }
  | { type: 'RETRY_BACKEND' }
  | { type: 'RESET_SIMULATION' }
  | { type: 'PING' }
  | { type: 'PONG'; activeView?: string; role?: string; dataSourceMode?: 'live' | 'simulated'; hospitalCount?: number; scenario?: string; isPlaying?: boolean };

const CHANNEL_NAME = 'triagenet_director_bridge';

class DirectorBridge {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(event: DirectorEvent) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (msg: MessageEvent<DirectorEvent>) => {
        if (msg.data) {
          this.listeners.forEach((listener) => listener(msg.data));
        }
      };
    }
  }

  public send(event: DirectorEvent) {
    if (this.channel) {
      this.channel.postMessage(event);
    }
  }

  public subscribe(listener: (event: DirectorEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const directorBridge = new DirectorBridge();
