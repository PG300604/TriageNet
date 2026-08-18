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

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginAsDemoRole: (role: UserRole) => void;
  logout: () => void;
  hasRoleAccess: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEMO_PRESET_USERS.SUPER_ADMIN);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load persisted user & token from localStorage
    const existingToken = getAuthToken();
    const storedUser = localStorage.getItem('triagenet_user');

    if (existingToken && storedUser) {
      try {
        setToken(existingToken);
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(DEMO_PRESET_USERS.SUPER_ADMIN);
      }
    } else {
      // Default to Super Admin demo profile
      setUser(DEMO_PRESET_USERS.SUPER_ADMIN);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const resp = await ApiClient.login(email, pass);
      const profile: UserProfile = {
        id: resp.id,
        name: resp.name,
        email: resp.email,
        role: (resp.role as UserRole) || 'TRIAGE_NURSE',
        roleTitle: resp.role || 'Hospital Staff',
        hospitalId: resp.hospitalId,
      };

      setAuthToken(resp.token);
      setToken(resp.token);
      setUser(profile);
      localStorage.setItem('triagenet_user', JSON.stringify(profile));
    } catch (err) {
      setIsLoading(false);
      throw err;
    }
    setIsLoading(false);
  };

  const loginAsDemoRole = (role: UserRole) => {
    const profile = DEMO_PRESET_USERS[role];
    const mockJwtToken = `mock-jwt-token-${role.toLowerCase()}-${Date.now()}`;
    setAuthToken(mockJwtToken);
    setToken(mockJwtToken);
    setUser(profile);
    localStorage.setItem('triagenet_user', JSON.stringify(profile));
  };

  const logout = () => {
    ApiClient.logout().catch(() => {});
    removeAuthToken();
    setToken(null);
    setUser(null);
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
        login,
        loginAsDemoRole,
        logout,
        hasRoleAccess,
      }}
    >
      {children}
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
