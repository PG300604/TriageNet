'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiClient, getAuthToken, setAuthToken, removeAuthToken } from './api-client';

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
}

export const DEMO_PRESET_USERS: Record<UserRole, UserProfile> = {
  SUPER_ADMIN: {
    id: 'demo-super-admin',
    name: 'Dr. Rajeshwar Sharma',
    email: 'admin@triagenet.jharkhand.gov.in',
    role: 'SUPER_ADMIN',
    roleTitle: 'System Super Admin',
    districtName: 'Statewide',
  },
  STATE_HEALTH_DEPT: {
    id: 'demo-state-health',
    name: 'Shri A.K. Jha (IAS)',
    email: 'secretary.health@jharkhand.gov.in',
    role: 'STATE_HEALTH_DEPT',
    roleTitle: 'State Health Department Director',
    districtName: 'Statewide (All 24 Districts)',
  },
  DISTRICT_CMO: {
    id: 'demo-district-cmo',
    name: 'Dr. Prabhat Kumar (CMO)',
    email: 'cmo.ranchi@jharkhand.gov.in',
    role: 'DISTRICT_CMO',
    roleTitle: 'District Chief Medical Officer (Ranchi)',
    districtName: 'Ranchi',
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
  },
  TRIAGE_NURSE: {
    id: 'demo-nurse',
    name: 'Sister Sunita Kujur',
    email: 'ed.nurse@rims.gov.in',
    role: 'TRIAGE_NURSE',
    roleTitle: 'Emergency Triage Nurse',
    districtName: 'Ranchi',
    hospitalId: 'rims-ranchi',
    hospitalName: 'RIMS Ranchi ED',
  },
  AMBULANCE_DISPATCH: {
    id: 'demo-dispatch',
    name: 'Operator Manoj Soren',
    email: 'dispatch108@jharkhand.gov.in',
    role: 'AMBULANCE_DISPATCH',
    roleTitle: '108 Ambulance Dispatch Controller',
    districtName: 'Ranchi District Command',
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
        if (isDemo) {
          const demoRole = (localStorage.getItem('triagenet_demo_role') as UserRole) || 'SUPER_ADMIN';
          setUser(DEMO_PRESET_USERS[demoRole] || DEMO_PRESET_USERS.SUPER_ADMIN);
        } else {
          // Default preview fallback for demo UI
          setUser(DEMO_PRESET_USERS.SUPER_ADMIN);
        }
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
    const profile = DEMO_PRESET_USERS[role];
    setToken(null);
    setUser(profile);
    setIsShiftActive(true);
    setIsScreenLocked(false);
    localStorage.setItem('triagenet_demo_active', 'true');
    localStorage.setItem('triagenet_demo_role', role);
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
