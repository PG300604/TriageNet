'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole, DEMO_PRESET_USERS } from '@/lib/auth-context';
import { Shield, Activity, User, Lock, ArrowRight, CheckCircle2, Hospital, Stethoscope, Truck, Building2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsDemoRole, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter email and password credentials.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoPreset = (role: UserRole) => {
    loginAsDemoRole(role);
    router.push('/dashboard');
  };

  const rolePresets: { role: UserRole; title: string; subtitle: string; icon: React.ElementType }[] = [
    { role: 'SUPER_ADMIN', title: 'System Super Admin', subtitle: 'Global access & seed management', icon: Shield },
    { role: 'STATE_HEALTH_DEPT', title: 'State Health Department', subtitle: 'State-wide read-only command center', icon: Building2 },
    { role: 'DISTRICT_CMO', title: 'District CMO', subtitle: 'Ranchi district health monitoring', icon: User },
    { role: 'HOSPITAL_ADMIN', title: 'Medical Superintendent', subtitle: 'RIMS Ranchi hospital capacity & beds', icon: Hospital },
    { role: 'TRIAGE_NURSE', title: 'Triage Nurse', subtitle: 'ED patient intake & vitals entry', icon: Stethoscope },
    { role: 'AMBULANCE_DISPATCH', title: 'Ambulance Dispatcher', subtitle: '108 routing & transfer controller', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
          <Activity className="h-5 w-5 text-blue-400" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-blue-400">
            [JHARKHAND STATE HEALTH MISSION]
          </span>
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white font-sans">
          TriageNet Command Portal
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          State-wide Emergency Triage, Resource Balancing & Telemetry System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-4xl px-4 sm:px-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Main Credentials Login Form */}
          <div className="md:col-span-6 bg-[#121929] border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-1">Authenticated Staff Login</h3>
            <p className="text-xs text-slate-400 mb-6">Enter official health department credentials</p>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cmo.ranchi@jharkhand.gov.in"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#0b0f19] border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
              >
                {submitting ? 'Authenticating...' : 'Sign In to Dashboard'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
              <span className="text-xs text-slate-500 font-mono">
                [SYSTEM PROTECTED · JWT AUTH ENABLED]
              </span>
            </div>
          </div>

          {/* Role Presets Demo Selector */}
          <div className="md:col-span-6 bg-[#121929] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold text-white">Instant Demo Roles</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] uppercase">
                  [ONE-CLICK ACCESS]
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Select a pre-configured role to inspect specific RBAC permissions
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {rolePresets.map(({ role, title, subtitle, icon: Icon }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDemoPreset(role)}
                    className="group w-full p-3 rounded-xl bg-[#0b0f19] border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all text-left flex items-start gap-3"
                  >
                    <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-blue-500/20 group-hover:text-blue-400 text-slate-400 transition-colors">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                          {title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          Connect →
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                24 Districts Pre-Loaded
              </span>
              <span className="font-mono">79 Hospitals Seeded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
