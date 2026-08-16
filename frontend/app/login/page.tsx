'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole, DEMO_PRESET_USERS } from '@/lib/auth-context';
import {
  Shield,
  Activity,
  User,
  Lock,
  ArrowRight,
  CheckCircle2,
  Hospital,
  Stethoscope,
  Truck,
  Building2,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

import Image from 'next/image';

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
      setError('Please enter official health department credentials.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please verify email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoPreset = (role: UserRole) => {
    loginAsDemoRole(role);
    router.push('/dashboard');
  };

  const rolePresets: { role: UserRole; title: string; subtitle: string; icon: React.ElementType }[] = [
    { role: 'SUPER_ADMIN', title: 'System Super Admin', subtitle: 'Global state configuration & seed control', icon: Shield },
    { role: 'STATE_HEALTH_DEPT', title: 'State Health Department', subtitle: 'State-wide read-only command telemetry', icon: Building2 },
    { role: 'DISTRICT_CMO', title: 'District CMO (Ranchi)', subtitle: 'District emergency health officer', icon: User },
    { role: 'HOSPITAL_ADMIN', title: 'Medical Superintendent', subtitle: 'RIMS Ranchi hospital & bed capacity', icon: Hospital },
    { role: 'TRIAGE_NURSE', title: 'Triage Nurse', subtitle: 'ED patient intake & ML vitals scoring', icon: Stethoscope },
    { role: 'AMBULANCE_DISPATCH', title: 'Ambulance Dispatcher', subtitle: '108 referral & overflow controller', icon: Truck },
  ];

  return (
    <div className="min-h-screen bg-[#eef1f6] text-slate-800 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#2563eb]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#dc5000]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Top Header Card */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="relative size-16 mb-4 overflow-hidden rounded-2xl shadow-md border border-[#491205] bg-[#491205]">
            <Image
              src="/triagenet-logo.png"
              alt="TriageNet Official Logo"
              width={64}
              height={64}
              className="object-cover w-full h-full"
              priority
            />
          </div>


          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#382416]/15 shadow-2xs mb-3">
            <Activity className="h-4 w-4 text-[#dc5000]" />
            <span className="font-mono text-[11px] font-bold text-[#382416] tracking-wider uppercase">
              [JHARKHAND STATE HEALTH MISSION]
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#382416] tracking-tight font-sans">
            TriageNet Command Portal
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-xl mx-auto font-medium">
            Panacea Healthcare SaaS · State-Wide Emergency Triage, Load Balancing & Real-Time Telemetry
          </p>
        </div>


        {/* Dual Panel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
          {/* Left Card: Authenticated Login Form */}
          <div className="md:col-span-6 bg-white border border-[#382416]/15 rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-[#382416]">Staff Authentication</h2>
                <span className="font-mono text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                  [SPRING SECURITY]
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Enter your official health department email and credentials to access your command console.
              </p>

              {error && (
                <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleCustomLogin} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                    Official Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="cmo.ranchi@jharkhand.gov.in"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                    Account Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563eb] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full mt-3 py-3 px-4 rounded-xl bg-[#382416] hover:bg-[#28180d] text-[#ffedd7] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Authenticating...' : 'Sign In to Command Portal'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>[JWT PROTECTED]</span>
              <span>STATE HEALTH V2.0</span>
            </div>
          </div>

          {/* Right Card: Instant RBAC Demo Presets */}
          <div className="md:col-span-6 bg-white border border-[#382416]/15 rounded-2xl p-6 sm:p-7 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-lg font-bold text-[#382416]">Instant RBAC Roles</h2>
                <span className="font-mono text-[10px] font-bold text-[#dc5000] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                  <Sparkles className="inline h-3 w-3 mr-1" />
                  ONE-CLICK DEMO
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Click any pre-configured role to inspect specific RBAC dashboard views & permissions:
              </p>

              <div className="space-y-2">
                {rolePresets.map(({ role, title, subtitle, icon: Icon }) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleDemoPreset(role)}
                    className="group w-full p-2.5 rounded-xl bg-[#FAF6F0] border border-[#382416]/10 hover:border-[#382416]/30 hover:bg-[#f2eae0] transition-all text-left flex items-center gap-3 cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-white border border-[#382416]/10 group-hover:bg-[#382416] group-hover:text-[#ffedd7] text-[#382416] transition-colors shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#382416] group-hover:text-[#dc5000] transition-colors truncate">
                          {title}
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#382416] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                24 Districts Connected
              </span>
              <span className="font-mono text-[10px]">79 HOSPITALS SEEDED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
