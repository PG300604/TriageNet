'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient, getAuthToken, setAuthToken, removeAuthToken, type AuthResponse } from './api-client';

export type UserRole =
  | 'SUPER_ADMIN'
  | 'STATE_HEALTH_DEPT'
  | 'DISTRICT_CMO'
  | 'HOSPITAL_ADMIN'
  | 'TRIAGE_NURSE'
  | 'AMBULANCE_DISPATCH';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  districtName?: string;
  hospitalId?: string;
  hospitalName?: string;
  staffId?: string;
  registrationNumber?: string;
  qualifications?: string;
  department?: string;
  stationBay?: string;
  shiftPreference?: string;
  phoneExtension?: string;
  voipLine?: string;
  radioFrequency?: string;
  signatureSealVerified?: boolean;
}

export const DEMO_PRESET_USERS: Record<UserRole, UserProfile> = {
  SUPER_ADMIN: {
    id: 'demo-super-admin',
    name: 'Dr. Rajeshwar Sharma',
    email: 'admin@triagenet.jharkhand.gov.in',
    role: 'SUPER_ADMIN',
    roleTitle: 'State Health Command Controller',
    districtName: 'Statewide',
    staffId: 'JH-SYS-0001',
    registrationNumber: 'NMC-IND-90112',
    qualifications: 'MBBS, MD (Hospital Admin), FACP',
    department: 'State Directorate of Health Services',
    stationBay: 'Main Command Console',
    shiftPreference: 'Continuous Command (24/7 Roster)',
    phoneExtension: 'Ext. 1001',
    voipLine: 'JH-HEALTH-HQ-01',
    radioFrequency: '155.050 MHz (State Command)',
    signatureSealVerified: true,
  },
  STATE_HEALTH_DEPT: {
    id: 'demo-state-health',
    name: 'Shri A.K. Jha (IAS)',
    email: 'secretary.health@jharkhand.gov.in',
    role: 'STATE_HEALTH_DEPT',
    roleTitle: 'State Health Department Director',
    districtName: 'Statewide (All 24 Districts)',
    staffId: 'JH-SYS-0002',
    registrationNumber: 'IAS-JH-2011',
    qualifications: 'MPA (Public Health Policy)',
    department: 'Ministry of Health & Family Welfare',
    stationBay: 'Secretariat Room 304',
    shiftPreference: 'Executive Oversight',
    phoneExtension: 'Ext. 1002',
    voipLine: 'JH-SEC-HEALTH',
    radioFrequency: '155.050 MHz',
    signatureSealVerified: true,
  },
  DISTRICT_CMO: {
    id: 'demo-district-cmo',
    name: 'Dr. Prabhat Kumar (CMO)',
    email: 'cmo.ranchi@jharkhand.gov.in',
    role: 'DISTRICT_CMO',
    roleTitle: 'District Chief Medical Officer (Ranchi)',
    districtName: 'Ranchi',
    staffId: 'JH-STF-1004',
    registrationNumber: 'JMC-71940',
    qualifications: 'MBBS, MD (Community Medicine)',
    department: 'District Health Office Ranchi',
    stationBay: 'CMO Operations Desk',
    shiftPreference: 'Day Shift (08:00 - 18:00)',
    phoneExtension: 'Ext. 2004',
    voipLine: 'CMO-RANCHI-DIRECT',
    radioFrequency: '154.250 MHz (District Net)',
    signatureSealVerified: true,
  },
  HOSPITAL_ADMIN: {
    id: 'demo-hosp-admin',
    name: 'Dr. S.K. Chaudhary',
    email: 'supt.rims@jharkhand.gov.in',
    role: 'HOSPITAL_ADMIN',
    roleTitle: 'Medical Superintendent (RIMS Ranchi)',
    districtName: 'Ranchi',
    hospitalId: 'rims-ranchi',
    hospitalName: 'Rajendra Institute of Medical Sciences (RIMS)',
    staffId: 'JH-STF-2015',
    registrationNumber: 'JMC-84920',
    qualifications: 'MBBS, MS (General Surgery), MHA',
    department: 'Hospital Administration & Trauma Command',
    stationBay: 'Superintendent Office Bay-A',
    shiftPreference: 'Day 12h Duty (08:00 - 20:00)',
    phoneExtension: 'Ext. 3010',
    voipLine: 'RIMS-SUPT-LINE',
    radioFrequency: '154.280 MHz (RIMS ED)',
    signatureSealVerified: true,
  },
  TRIAGE_NURSE: {
    id: 'demo-nurse',
    name: 'Sister Sunita Kujur',
    email: 'ed.nurse@rims.gov.in',
    role: 'TRIAGE_NURSE',
    roleTitle: 'Emergency Triage Lead Nurse',
    districtName: 'Ranchi',
    hospitalId: 'rims-ranchi',
    hospitalName: 'RIMS Ranchi ED',
    staffId: 'JH-STF-4089',
    registrationNumber: 'JNC-N-52194',
    qualifications: 'B.Sc (Hons) Nursing, Certified ED Triage (CTN)',
    department: 'Emergency & Trauma Bay Intake',
    stationBay: 'Red Bay Desk Station 1',
    shiftPreference: 'Day 8h Shift (08:00 - 16:00)',
    phoneExtension: 'Ext. 4012',
    voipLine: 'RIMS-ED-TRIAGE-01',
    radioFrequency: '154.280 MHz (RIMS ED)',
    signatureSealVerified: true,
  },
  AMBULANCE_DISPATCH: {
    id: 'demo-dispatch',
    name: 'Operator Manoj Soren',
    email: 'dispatch108@jharkhand.gov.in',
    role: 'AMBULANCE_DISPATCH',
    roleTitle: '108 Central Fleet Dispatcher',
    districtName: 'Ranchi District Command',
    staffId: 'JH-STF-5002',
    registrationNumber: 'EMRS-JH-108',
    qualifications: 'Advanced Emergency Medical Dispatch (AEMD), GIS Spatial Ops',
    department: 'Central 108 Operations & Spatial Routing Hub',
    stationBay: 'Console #04 (Central Fleet Desk)',
    shiftPreference: 'Night Emergency (20:00 - 08:00)',
    phoneExtension: 'Ext. 1084',
    voipLine: '108-FLEET-RANCHI',
    radioFrequency: '155.160 MHz (108 Fleet Net)',
    signatureSealVerified: true,
  },
};

import { ShiftLockModal } from '@/components/shift-lock-modal';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isShiftActive: boolean;
  isScreenLocked: boolean;
  shiftDurationHours: number;
  login: (email: string, pass: string) => Promise<AuthResponse>;
  register: (name: string, email: string, pass: string, hospitalId?: string) => Promise<void>;
  verify2FAAndStartShift: (challengeToken: string, code: string, shiftDurationHours: number, shiftPin: string) => Promise<void>;
  unlockScreen: (pin: string) => Promise<void>;
  lockScreen: () => Promise<void>;
  endShift: () => Promise<void>;
  loginAsDemoRole: (role: UserRole) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  logout: () => void;
  hasRoleAccess: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const [shiftDurationHours, setShiftDurationHours] = useState(8);

  const lockScreen = async () => {
    setIsScreenLocked(true);
    try {
      await ApiClient.lockShift();
    } catch {}
  };

  const unlockScreen = async (pin: string) => {
    const resp = await ApiClient.unlockShift(pin);
    if (resp.token) {
      setToken(resp.token);
    }
    setIsScreenLocked(false);
  };

  const endShift = async () => {
    try {
      await ApiClient.endShift();
    } catch {}
    setIsShiftActive(false);
    setIsScreenLocked(false);
    setToken(null);
    setUser(null);
  };

  // Proactive background silent refresh every 10 minutes (600,000 ms)
  useEffect(() => {
    if (!user) return;
    const refreshInterval = setInterval(() => {
      ApiClient.refreshToken().catch(() => {});
    }, 600000);

    return () => clearInterval(refreshInterval);
  }, [user]);

  // Idle Activity Tracker: Locks screen after 20 minutes of inactivity
  useEffect(() => {
    if (!user || !isShiftActive || isScreenLocked) return;

    let timeoutId: NodeJS.Timeout;
    const resetIdleTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        lockScreen();
      }, 1200000); // 20 minutes
    };

    const events = ['mousedown', 'mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer));
    resetIdleTimer();

    return () => {
      clearTimeout(timeoutId);
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
    };
  }, [user, isShiftActive, isScreenLocked]);

  useEffect(() => {
    // SECURITY (B9): Authenticate with backend /api/auth/me using HttpOnly cookie
    // Server-verified user identity replaces mutable localStorage profile
    const initializeAuth = async () => {
      try {
        const resp = await ApiClient.getCurrentUser();
        const profile: UserProfile = {
          id: resp.id,
          name: resp.name,
          email: resp.email,
          role: (resp.role as UserRole) || 'TRIAGE_NURSE',
          roleTitle: resp.role || 'Hospital Staff',
          hospitalId: resp.hospitalId,
          hospitalName: resp.hospitalName,
          districtName: resp.districtName,
        };
        setUser(profile);

        // Check active shift status
        try {
          const shift = await ApiClient.getShiftStatus();
          setIsShiftActive(shift.shiftActive);
          setIsScreenLocked(shift.isLocked);
          if (shift.durationHours) setShiftDurationHours(shift.durationHours);
        } catch {}
      } catch {
        // If unauthenticated on server, check if offline demo mode is chosen
        const isDemo = typeof window !== 'undefined' ? localStorage.getItem('triagenet_demo_active') : null;
        const demoRole = (localStorage.getItem('triagenet_demo_role') as UserRole) || 'SUPER_ADMIN';
        const defaultProfile = DEMO_PRESET_USERS[demoRole] || DEMO_PRESET_USERS.SUPER_ADMIN;
        let finalProfile = defaultProfile;
        if (typeof window !== 'undefined') {
          try {
            const saved = localStorage.getItem(`triagenet_custom_profile_${defaultProfile.id}`);
            if (saved) {
              finalProfile = { ...defaultProfile, ...JSON.parse(saved) };
            }
          } catch {}
        }
        setUser(finalProfile);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const resp = await ApiClient.login(email, pass);
      if (resp.twoFactorRequired) {
        setIsLoading(false);
        return resp;
      }

      const profile: UserProfile = {
        id: resp.id,
        name: resp.name,
        email: resp.email,
        role: (resp.role as UserRole) || 'TRIAGE_NURSE',
        roleTitle: resp.role || 'Hospital Staff',
        hospitalId: resp.hospitalId,
        hospitalName: resp.hospitalName,
        districtName: resp.districtName,
      };

      setToken(resp.token || null);
      setUser(profile);
      setIsShiftActive(!!resp.shiftActive);
      setIsScreenLocked(!!resp.isScreenLocked);
      localStorage.removeItem('triagenet_demo_active');
      localStorage.removeItem('triagenet_demo_role');
      setIsLoading(false);
      return resp;
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const verify2FAAndStartShift = async (
    challengeToken: string,
    code: string,
    durationHours: number,
    shiftPin: string
  ) => {
    setIsLoading(true);
    try {
      const resp = await ApiClient.verify2FA({
        challengeToken,
        code,
        shiftDurationHours: durationHours,
        shiftPin,
      });

      const profile: UserProfile = {
        id: resp.id,
        name: resp.name,
        email: resp.email,
        role: (resp.role as UserRole) || 'TRIAGE_NURSE',
        roleTitle: resp.role || 'Hospital Staff',
        hospitalId: resp.hospitalId,
        hospitalName: resp.hospitalName,
        districtName: resp.districtName,
      };

      setToken(resp.token || null);
      setUser(profile);
      setIsShiftActive(true);
      setIsScreenLocked(false);
      setShiftDurationHours(durationHours);
      localStorage.removeItem('triagenet_demo_active');
      localStorage.removeItem('triagenet_demo_role');
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
  };

  const register = async (name: string, email: string, pass: string, hospitalId?: string) => {
    setIsLoading(true);
    try {
      await ApiClient.register({
        name,
        email,
        password: pass,
        role: 'HOSPITAL_STAFF',
        hospitalId: hospitalId || undefined,
      });
      // Automatically login after successful registration
      await login(email, pass);
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
  };

  const loginAsDemoRole = (role: UserRole) => {
    const defaultProfile = DEMO_PRESET_USERS[role];
    let profile = defaultProfile;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(`triagenet_custom_profile_${defaultProfile.id}`);
        if (saved) {
          profile = { ...defaultProfile, ...JSON.parse(saved) };
        }
      } catch {}
    }
    setToken(null);
    setUser(profile);
    setIsShiftActive(true);
    setIsScreenLocked(false);
    localStorage.setItem('triagenet_demo_active', 'true');
    localStorage.setItem('triagenet_demo_role', role);
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(`triagenet_custom_profile_${updated.id}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const logout = () => {
    ApiClient.logout().catch(() => {});
    removeAuthToken();
    localStorage.removeItem('triagenet_demo_active');
    localStorage.removeItem('triagenet_demo_role');
    setToken(null);
    setUser(null);
    setIsShiftActive(false);
    setIsScreenLocked(false);
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  };

  const hasRoleAccess = (allowedRoles: UserRole[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isShiftActive,
        isScreenLocked,
        shiftDurationHours,
        login,
        register,
        verify2FAAndStartShift,
        unlockScreen,
        lockScreen,
        endShift,
        loginAsDemoRole,
        updateUserProfile,
        logout,
        hasRoleAccess,
      }}
    >
      {children}
      <ShiftLockModal />
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
