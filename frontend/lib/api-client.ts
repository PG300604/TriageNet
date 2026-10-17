// TriageNet API Client — Type-Safe Spring Boot REST Client

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('onrender.com')) {
      return 'https://triagenet-backend.onrender.com/api';
    }
  }
  return 'http://localhost:8080/api';
}

// Auth Helper (Dual transport: HttpOnly Cookie + Authorization Bearer header for robust cross-origin cloud deployments)
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('triagenet_jwt_token');
  }
  return null;
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('triagenet_jwt_token', token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('triagenet_jwt_token');
    localStorage.removeItem('triagenet_user');
    localStorage.removeItem('triagenet_session_active');
    localStorage.removeItem('triagenet_demo_active');
    localStorage.removeItem('triagenet_demo_role');
  }
};

// Generic API Fetch Wrapper (relying on credentials: 'include' + Bearer token for seamless cross-domain auth)
async function apiFetch<T>(endpoint: string, options: RequestInit = {}, isRetry: boolean = false): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...(options.headers as Record<string, string>),
  };

  const token = getAuthToken();
  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const baseUrl = getApiBaseUrl();
  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers,
  });

  // Automatic token refresh on 401 (only if an active authenticated backend session exists)
  if (response.status === 401 && !isRetry && !endpoint.startsWith('/auth/')) {
    const hasSession = typeof window !== 'undefined' ? localStorage.getItem('triagenet_session_active') === 'true' : false;
    if (hasSession) {
      try {
        const refreshResponse = await fetch(`${baseUrl}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          if (refreshData?.token) {
            setAuthToken(refreshData.token);
          }
          return apiFetch<T>(endpoint, options, true);
        } else {
          removeAuthToken();
        }
      } catch {
        removeAuthToken();
      }
    }
  }

  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    try {
      const errorJson = await response.json();
      if (errorJson.message) errorMessage = errorJson.message;
    } catch {
      // fallback to default status text
    }
    throw new Error(errorMessage);
  }

  // Handle empty 204 responses
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Data Interfaces
export interface StateOverviewData {
  stateName: string;
  stateCode: string;
  totalDistricts: number;
  totalHospitals: number;
  totalGeneralBeds: number;
  availableGeneralBeds: number;
  totalIcuBeds: number;
  availableIcuBeds: number;
  totalVentilators: number;
  averageCapacityUtilization: number;
  districts: DistrictSummary[];
}

export interface DistrictSummary {
  id: string;
  name: string;
  cmoName: string;
  cmoPhone: string;
  hospitalCount: number;
  totalBeds: number;
  availableBeds: number;
  icuTotal: number;
  icuAvailable: number;
}

export interface HospitalApiData {
  id: string;
  name: string;
  shortCode?: string;
  region: string;
  districtName?: string;
  facilityTier?: string;
  lat: number;
  lng: number;
  totalBeds: number;
  usedBeds: number;
  totalGeneralBeds?: number;
  availableGeneralBeds?: number;
  totalIcuBeds?: number;
  availableIcuBeds?: number;
  totalVentilators: number;
  usedVentilators: number;
  totalSpecialists: number;
  usedSpecialists: number;
  icuiCapacityRatio?: number;
  hasVentilator?: boolean;
  hasTraumaSurgery?: boolean;
  hasBloodBank?: boolean;
  hasOxygenGenerator?: boolean;
}

export interface VitalsInput {
  spo2: number;
  heartRate: number;
  systolicBp: number;
  diastolicBp?: number;
  temperature?: number;
  respRate?: number;
  age: number;
}

export interface SeverityScoreResult {
  score: number;
  riskTier: 'HIGH_RISK' | 'MODERATE_RISK' | 'LOW_RISK';
  sepsisWarning: boolean;
  topFactor: string;
  factorContributions: Record<string, number>;
}

export interface PatientApiData {
  id?: string;
  name: string;
  age: number;
  presentingComplaint: string;
  spo2: number;
  heartRate: number;
  systolicBp: number;
  bloodType?: string;
  hospitalId: string;
  requiredSpecialty?: string;
  status?: 'WAITING' | 'ASSIGNED' | 'TRANSFERRED' | 'DISCHARGED';
}

export interface AuthResponse {
  token: string;
  type: string;
  id: string;
  email: string;
  name: string;
  role: string;
  hospitalId?: string;
  hospitalName?: string;
  districtName?: string;
  twoFactorRequired?: boolean;
  challengeToken?: string;
  shiftActive?: boolean;
  shiftDurationHours?: number;
  isScreenLocked?: boolean;
  staffId?: string;
  status?: string;
  totpSecret?: string;
  qrUri?: string;
  recoveryMnemonic?: string;
  backupCodes?: string[];
}

export interface StaffStatusResponse {
  staffId: string;
  name: string;
  status: 'ACTIVE' | 'PENDING_VERIFICATION' | 'SUSPENDED' | 'REJECTED';
  hospitalName: string;
  role: string;
  registeredAt: string;
}

export interface PendingStaffUser {
  id: string;
  staffId: string;
  name: string;
  email: string;
  role: string;
  hospitalId?: string;
  hospitalName: string;
  status?: string;
  createdAt: string;
  registrationNumber?: string;
  qualifications?: string;
}

export interface TwoFactorSetupData {
  secret: string;
  qrUri: string;
  recoveryMnemonic: string;
  backupCodes: string[];
}

export interface ShiftStatusData {
  shiftActive: boolean;
  isLocked: boolean;
  durationHours: number;
  remainingMinutes: number;
  startedAt?: string;
  expiresAt?: string;
}

// Exported API Client Methods
export const ApiClient = {
  // Authentication
  login: (email: string, password: string): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: {
    name: string;
    staffId?: string;
    desiredRole?: string;
    email: string;
    password: string;
    role?: string;
    hospitalId?: string;
  }): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getCurrentUser: (): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/auth/me'),

  refreshToken: (): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/auth/refresh', { method: 'POST' }),

  logout: async (): Promise<{ message: string }> => {
    try {
      return await apiFetch<{ message: string }>('/auth/logout', { method: 'POST' });
    } finally {
      removeAuthToken();
    }
  },

  // Staff ID Status Probe & Verification
  getStaffStatus: (staffId: string): Promise<StaffStatusResponse> =>
    apiFetch<StaffStatusResponse>(`/auth/status/${encodeURIComponent(staffId)}`),

  // Hospital Admin Staff Verification Queue
  getPendingStaff: (): Promise<PendingStaffUser[]> =>
    apiFetch<PendingStaffUser[]>('/admin/staff/pending'),

  approveStaff: (id: string, role?: string): Promise<{ message: string }> =>
    apiFetch<{ message: string }>(`/admin/staff/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ role: role || undefined }),
    }),

  rejectStaff: (id: string): Promise<{ message: string }> =>
    apiFetch<{ message: string }>(`/admin/staff/${id}/reject`, { method: 'POST' }),

  // 2FA & Clinical Shift Sessions
  setup2FA: (): Promise<TwoFactorSetupData> =>
    apiFetch<TwoFactorSetupData>('/auth/2fa/setup', { method: 'POST' }),

  confirm2FASetup: (code: string): Promise<{ message: string }> =>
    apiFetch<{ message: string }>('/auth/2fa/confirm-setup', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  verify2FA: (data: { challengeToken: string; code: string; shiftDurationHours?: number; shiftPin?: string }): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  unlockShift: (pin: string): Promise<AuthResponse> =>
    apiFetch<AuthResponse>('/auth/shift/unlock', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    }),

  lockShift: (): Promise<{ message: string }> =>
    apiFetch<{ message: string }>('/auth/shift/lock', { method: 'POST' }),

  endShift: async (): Promise<{ message: string }> => {
    try {
      return await apiFetch<{ message: string }>('/auth/shift/end', { method: 'POST' });
    } finally {
      removeAuthToken();
    }
  },

  getShiftStatus: (): Promise<ShiftStatusData> =>
    apiFetch<ShiftStatusData>('/auth/shift/status'),

  // Cryptographic Account Recovery (No Email)
  recoverWithMnemonic: (data: { email: string; mnemonic: string; newPassword: string }): Promise<{ message: string }> =>
    apiFetch<{ message: string }>('/auth/recovery/mnemonic', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  recoverWithBackupCode: (data: { email: string; backupCode: string; newPassword: string }): Promise<{ message: string }> =>
    apiFetch<{ message: string }>('/auth/recovery/backup-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  approveCmoEscrow: (data: { targetStaffEmail: string; escrowReason: string }): Promise<{ message: string; emergencyToken: string }> =>
    apiFetch<{ message: string; emergencyToken: string }>('/auth/recovery/cmo-escrow', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Dashboard & Telemetry
  getStateOverview: (): Promise<StateOverviewData> =>
    apiFetch<StateOverviewData>('/dashboard/state-overview'),

  getDistrictDetails: (districtName: string): Promise<{ district: DistrictSummary; hospitals: HospitalApiData[]; facilityCount: number }> =>
    apiFetch(`/dashboard/district/${encodeURIComponent(districtName)}`),

  getHospitals: (params?: { district?: string; includeTertiary?: boolean }): Promise<HospitalApiData[]> => {
    const query = new URLSearchParams()
    if (params?.district) query.append('district', params.district)
    if (params?.includeTertiary) query.append('includeTertiary', 'true')
    const qs = query.toString() ? `?${query.toString()}` : ''
    return apiFetch<HospitalApiData[]>(`/hospitals${qs}`)
  },

  getHospitalById: (id: string): Promise<HospitalApiData> =>
    apiFetch<HospitalApiData>(`/hospitals/${id}`),

  // ML Severity & Patients
  scoreVitals: (vitals: VitalsInput): Promise<SeverityScoreResult> =>
    apiFetch<SeverityScoreResult>('/patients/score-vitals', {
      method: 'POST',
      body: JSON.stringify(vitals),
    }),

  getAllPatients: (): Promise<PatientApiData[]> =>
    apiFetch<PatientApiData[]>('/patients'),

  registerPatient: (patient: PatientApiData): Promise<PatientApiData> =>
    apiFetch<PatientApiData>('/patients', {
      method: 'POST',
      body: JSON.stringify(patient),
    }),

  dischargePatient: (id: string, reason: string = 'Treatment Completed'): Promise<PatientApiData> =>
    apiFetch<PatientApiData>(`/patients/${id}/discharge?reason=${encodeURIComponent(reason)}`, {
      method: 'POST',
    }),

  // Spatial Routing & Dijkstra
  findOptimalHospital: (req: {
    originLat: number;
    originLng: number;
    preferredDistrict?: string;
    requiresIcu?: boolean;
    requiresVentilator?: boolean;
    vitals?: VitalsInput;
  }): Promise<any> =>
    apiFetch('/routing/optimal', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  getDistrictDistanceMatrix: (districtName: string): Promise<any> =>
    apiFetch(`/routing/matrix/${encodeURIComponent(districtName)}`),

  // 108 Ambulance Referrals & Transfers
  createReferral: (req: {
    patientId: string;
    originHospitalId: string;
    targetHospitalId: string;
    reason: string;
    resourceType: string;
    urgencyLevel: string;
  }): Promise<any> =>
    apiFetch('/referrals', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  getActiveReferrals: (): Promise<any[]> =>
    apiFetch('/referrals/active'),

  updateReferralStatus: (id: string, statusUpdate: { status: string; notes?: string }): Promise<any> =>
    apiFetch(`/referrals/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusUpdate),
    }),

  getReferralRecommendation: (): Promise<any> =>
    apiFetch('/referrals/recommendation'),

  autoReleaseExpiredReferrals: (ttlMinutes: number = 45): Promise<{ releasedCount: number; ttlMinutes: number; timestamp: string }> =>
    apiFetch(`/referrals/auto-release?ttlMinutes=${ttlMinutes}`, { method: 'POST' }),

  // Triage Queue
  getTriageQueue: (hospitalId: string): Promise<any[]> =>
    apiFetch(`/triage-queue/hospital/${hospitalId}`),

  recomputeQueue: (hospitalId: string): Promise<any> =>
    apiFetch(`/triage-queue/recompute/${hospitalId}`, { method: 'POST' }),

  // Resources & Hungarian Matcher
  getHospitalResources: (hospitalId: string): Promise<any[]> =>
    apiFetch(`/resources/hospital/${hospitalId}`),

  runHungarianAssignment: (hospitalId: string): Promise<any> =>
    apiFetch(`/resources/assign/${hospitalId}`, { method: 'POST' }),

  // Phase 11: Real-Time Bed & Oxygen IoT Telemetry
  ingestOxygenTelemetry: (dto: {
    hospitalId: string;
    psaOxygenPurity?: number;
    lmoTankPressureBar?: number;
    flowRateLpm?: number;
    capacityPercent?: number;
  }): Promise<any> =>
    apiFetch('/iot/oxygen-telemetry', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  getOxygenTelemetryForHospital: (hospitalId: string): Promise<any> =>
    apiFetch(`/iot/oxygen-telemetry/hospital/${hospitalId}`),

  getActiveOxygenAlerts: (): Promise<any[]> =>
    apiFetch('/iot/oxygen-telemetry/alerts'),

  // Phase 14: Ayushman Bharat Digital Mission (ABDM)
  verifyAbha: (abhaNumber: string): Promise<any> =>
    apiFetch(`/abdm/verify-abha?abhaNumber=${encodeURIComponent(abhaNumber)}`, { method: 'POST' }),

  lookupAbhaPatient: (abhaNumber: string): Promise<any> =>
    apiFetch(`/abdm/patient/${encodeURIComponent(abhaNumber)}`),

  // Municipal ITMS & Highway Road Traffic Preemption
  activateTrafficPreemption: (data: any): Promise<any> =>
    apiFetch('/traffic/preemption/activate', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  streamTrafficTelemetry: (data: any): Promise<any> =>
    apiFetch('/traffic/preemption/telemetry', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getTrafficCorridorStatus: (ambulanceNumber: string): Promise<any> =>
    apiFetch(`/traffic/preemption/corridor/${encodeURIComponent(ambulanceNumber)}`),

  getAllTrafficCorridors: (): Promise<any[]> =>
    apiFetch('/traffic/preemption/corridors'),

  releaseTrafficPreemption: (ambulanceNumber: string): Promise<any> =>
    apiFetch(`/traffic/preemption/${encodeURIComponent(ambulanceNumber)}/release`, {
      method: 'POST',
    }),

  getItmsDiagnosticStatus: (): Promise<any> =>
    apiFetch('/traffic/itms/status'),
};

// Referral & Transfer Interfaces
export interface ReferralRequestData {
  patientId: string;
  originHospitalId: string;
  targetHospitalId: string;
  reason: string;
  resourceType: 'ICU_BED' | 'VENTILATOR' | 'SPECIALIST' | 'OXYGEN_BED';
  urgencyLevel: string;
}

export interface ReferralResponseData {
  id: string;
  patientId: string;
  fromHospitalId: string;
  toHospitalId: string;
  dispatchToken: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
  reason: string;
  requestedAt: string;
  updatedAt: string;
}

export interface ReferralRecommendationData {
  fromHospitalId: string;
  fromHospitalName: string;
  toHospitalId: string;
  toHospitalName: string;
  patientId: string;
  patientName: string;
  patientSeverity: number;
  travelMinutes: number;
  reason: string;
  matchReason: string;
}

export interface TriageQueueEntryData {
  id: string;
  patientId: string;
  hospitalId: string;
  baseSeverity: number;
  decayLambda: number;
  waitTimeMinutes: number;
  effectivePriority: number;
  enteredQueueAt: string;
  lastRecomputedAt: string;
}

export interface ResourceData {
  id: string;
  hospitalId: string;
  type: 'ICU_BED' | 'VENTILATOR' | 'SPECIALIST' | 'OXYGEN_BED';
  subtype: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  lastUpdated: string;
}

export const apiClient = ApiClient;

