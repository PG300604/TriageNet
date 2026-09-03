'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole, DEMO_PRESET_USERS } from '@/lib/auth-context';
import { ApiClient, HospitalApiData, StaffStatusResponse } from '@/lib/api-client';
import Link from 'next/link';
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
  UserPlus,
  Mail,
  KeyRound,
  Clock,
  ArrowLeft,
  Copy,
  Check,
  FileText,
  QrCode,
  Search,
  AlertTriangle,
  RefreshCw,
  BadgeCheck,
} from 'lucide-react';

import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  const { login, verify2FAAndStartShift, loginAsDemoRole, isLoading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loginStep, setLoginStep] = useState<'credentials' | '2fa'>('credentials');
  const [challengeToken, setChallengeToken] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [shiftDuration, setShiftDuration] = useState<number>(8);
  const [shiftPin, setShiftPin] = useState('1234');

  // Sign In State & Probe
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [probeStatus, setProbeStatus] = useState<StaffStatusResponse | null>(null);
  const [probing, setProbing] = useState(false);

  // 4-Stage Continuous Onboarding State
  const [onboardingStage, setOnboardingStage] = useState<1 | 2 | 3 | 4>(1);
  const [name, setName] = useState('');
  const [staffIdInput, setStaffIdInput] = useState('');
  const [email, setEmail] = useState('');
  const [desiredRole, setDesiredRole] = useState('TRIAGE_NURSE');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');
  const [assignedHospitalName, setAssignedHospitalName] = useState('');
  const [totpData, setTotpData] = useState<{
    secret: string;
    qrUri: string;
    mnemonic: string;
    backupCodes: string[];
  } | null>(null);
  const [confirm2FaCode, setConfirm2FaCode] = useState('');
  const [copiedMnemonic, setCopiedMnemonic] = useState(false);
  const [stage4ProbeStatus, setStage4ProbeStatus] = useState<StaffStatusResponse | null>(null);
  const [stage4Probing, setStage4Probing] = useState(false);

  const [hospitals, setHospitals] = useState<HospitalApiData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    ApiClient.getHospitals()
      .then((data) => setHospitals(data || []))
      .catch(() => {});
  }, []);

  // Public Real-Time Staff Status Probe
  const handleProbeStatus = async (overrideId?: string) => {
    const idToProbe = (overrideId || loginIdentifier).trim();
    if (!idToProbe) {
      setError('Please enter a Staff ID to check authorization status.');
      return;
    }
    setProbing(true);
    setError(null);
    try {
      const res = await ApiClient.getStaffStatus(idToProbe);
      setProbeStatus(res);
    } catch (err: unknown) {
      setProbeStatus(null);
      setError(err instanceof Error ? err.message : 'Staff ID record not found in state healthcare registry.');
    } finally {
      setProbing(false);
    }
  };

  const handleStage4Probe = async () => {
    if (!assignedStaffId) return;
    setStage4Probing(true);
    try {
      const res = await ApiClient.getStaffStatus(assignedStaffId);
      setStage4ProbeStatus(res);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Status probe failed.');
    } finally {
      setStage4Probing(false);
    }
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !password) {
      setError('Please enter your official Staff ID (or email) and password.');
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      const resp = await login(loginIdentifier.trim(), password);
      if (resp && resp.twoFactorRequired && resp.challengeToken) {
        setChallengeToken(resp.challengeToken);
        setLoginStep('2fa');
        return;
      }
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please verify Staff ID and password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!twoFactorCode.trim()) {
      setError('Please enter your 6-digit authenticator code or emergency backup code.');
      return;
    }
    if (shiftPin.length !== 4) {
      setError('Please enter a 4-digit Shift PIN for terminal quick-locking.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await verify2FAAndStartShift(challengeToken, twoFactorCode.trim(), shiftDuration, shiftPin);
      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid 2FA code or expired challenge token.');
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 1 -> Stage 2
  const handleStage1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setError('Full name and official email are required.');
      return;
    }
    setError(null);
    setOnboardingStage(2);
  };

  // Stage 2 -> Call Backend Register -> Stage 3
  const handleStage2Next = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Master password is required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>?/|`~]).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters with at least 1 uppercase, 1 lowercase, 1 digit, and 1 special symbol.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const resp = await ApiClient.register({
        name: name.trim(),
        staffId: staffIdInput.trim() || undefined,
        desiredRole,
        email: email.trim(),
        password,
        hospitalId: selectedHospitalId || undefined,
      });

      const effectiveStaffId = resp.staffId || staffIdInput.trim() || 'JH-STF-XXXX';
      setAssignedStaffId(effectiveStaffId);

      const hospObj = hospitals.find((h) => h.id === selectedHospitalId);
      setAssignedHospitalName(hospObj ? hospObj.name : 'Jharkhand General Hospital Pool');

      setTotpData({
        secret: resp.totpSecret || 'TRIAGENETSECRET2FA',
        qrUri: resp.qrUri || '',
        mnemonic: resp.recoveryMnemonic || 'matrix clinic pulse shelter doctor orbit copper shield river canyon alert beacon',
        backupCodes: resp.backupCodes || [],
      });

      setOnboardingStage(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed. Staff ID or email may already be in use.');
    } finally {
      setSubmitting(false);
    }
  };

  // Stage 3 -> Stage 4
  const handleStage3Next = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOnboardingStage(4);
  };

  const handleCopyMnemonic = () => {
    if (!totpData?.mnemonic) return;
    navigator.clipboard.writeText(totpData.mnemonic);
    setCopiedMnemonic(true);
    setTimeout(() => setCopiedMnemonic(false), 3000);
  };

  const handleDemoPreset = (role: UserRole) => {
    loginAsDemoRole(role);
  };

  const rolePresets: { role: UserRole; title: string; subtitle: string; icon: React.ElementType }[] = [
    {
      role: 'SUPER_ADMIN',
      title: 'State Health Command (Super Admin)',
      subtitle: 'Statewide triage routing, node management & system audit logs',
      icon: Shield,
    },
    {
      role: 'DISTRICT_CMO',
      title: 'District CMO (Ranchi District)',
      subtitle: 'District-wide bed quotas, surge overrides & emergency escrow',
      icon: Activity,
    },
    {
      role: 'HOSPITAL_ADMIN',
      title: 'Medical Superintendent (RIMS)',
      subtitle: 'Hospital ICU/Oxygen inventory, staff verification & transfer requests',
      icon: Building2,
    },
    {
      role: 'TRIAGE_NURSE',
      title: 'Emergency Triage Nurse (RIMS ED)',
      subtitle: 'Rapid bedside MEWS scoring, queue priority & clinical shifts',
      icon: Stethoscope,
    },
    {
      role: 'AMBULANCE_DISPATCH',
      title: '108 Ambulance Dispatcher',
      subtitle: 'Live fleet positioning, automated patient routing & field dispatch',
      icon: Truck,
    },
    {
      role: 'HOSPITAL_STAFF',
      title: 'Medical Officer (Sadar Hospital)',
      subtitle: 'General ward admissions, bed tracking & patient intake',
      icon: Hospital,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-5xl space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative size-12 rounded-xl bg-white border border-[#382416]/15 shadow-sm flex items-center justify-center overflow-hidden">
              <Image src="/jh-logo.png" alt="Jharkhand State Emblem" fill className="object-contain p-1" priority />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-[#382416]">TriageNet</h1>
                <span className="font-mono text-[10px] font-bold text-[#dc5000] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                  OFFICIAL STATE SECURE PORTAL
                </span>
              </div>
              <p className="text-xs text-slate-500">Government of Jharkhand • Department of Health & Family Welfare</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            ZERO-EMAIL CRYPTOGRAPHIC 2FA ACTIVE
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left Card: Staff ID Authentication & Continuous Onboarding */}
          <div className="md:col-span-6 bg-white border border-[#382416]/15 rounded-2xl p-6 sm:p-7 shadow-xl">
            {/* Tab Header */}
            {loginStep === 'credentials' && onboardingStage !== 4 && (
              <div className="flex border-b border-[#382416]/10 mb-5">
                <button
                  type="button"
                  onClick={() => { setMode('signin'); setError(null); }}
                  className={`flex-1 pb-3 text-xs font-bold font-mono tracking-wider transition-all cursor-pointer ${
                    mode === 'signin'
                      ? 'text-[#382416] border-b-2 border-[#382416]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  STAFF SIGN IN
                </button>
                <button
                  type="button"
                  onClick={() => { setMode('signup'); setError(null); setOnboardingStage(1); }}
                  className={`flex-1 pb-3 text-xs font-bold font-mono tracking-wider transition-all cursor-pointer ${
                    mode === 'signup'
                      ? 'text-[#382416] border-b-2 border-[#382416]'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  STAFF ONBOARDING
                </button>
              </div>
            )}

            {/* Notifications */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span>{error}</span>
                  {error.includes('pending') && (
                    <div className="mt-1.5 text-[11px] text-amber-800 bg-amber-100/70 p-2 rounded-lg font-sans">
                      <strong>In-Person Verification Required:</strong> Please present your clinician ID badge to your Hospital Medical Superintendent or District CMO office.
                    </div>
                  )}
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* STEP 2: 2FA & Shift Setup */}
            {loginStep === '2fa' ? (
              <form onSubmit={handleVerify2FA} className="space-y-4">
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 flex items-center gap-2.5">
                  <Shield className="h-5 w-5 text-[#dc5000] shrink-0" />
                  <div>
                    <h3 className="text-xs font-bold text-[#382416]">Cryptographic 2FA Required</h3>
                    <p className="text-[11px] text-slate-600">Enter the 6-digit code from Google Authenticator or your emergency backup code.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                    Authenticator Code / Backup Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <KeyRound className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      placeholder="e.g. 849201 or TR-8492-7104"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-mono font-bold text-[#382416] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#dc5000] transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                    Clinical Shift Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setShiftDuration(8)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        shiftDuration === 8
                          ? 'bg-[#382416] text-[#ffedd7] border-[#382416]'
                          : 'bg-[#FAF6F0] text-slate-600 border-[#382416]/20 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      8 Hours (Standard)
                    </button>
                    <button
                      type="button"
                      onClick={() => setShiftDuration(12)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        shiftDuration === 12
                          ? 'bg-[#dc5000] text-white border-[#dc5000]'
                          : 'bg-[#FAF6F0] text-slate-600 border-[#382416]/20 hover:bg-slate-100'
                      }`}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      12 Hours (Surge)
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase text-[#382416]">
                      4-Digit Quick-Lock Shift PIN
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">1-SEC SCREEN UNLOCK</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      value={shiftPin}
                      onChange={(e) => setShiftPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="1234"
                      maxLength={4}
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-sm font-mono tracking-widest font-bold text-[#382416] focus:outline-none focus:ring-2 focus:ring-[#dc5000] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#dc5000] hover:bg-[#c24600] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Verifying 2FA...' : 'Start Clinical Duty Shift'}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-between text-[11px] pt-2">
                  <button
                    type="button"
                    onClick={() => { setLoginStep('credentials'); setError(null); }}
                    className="text-slate-500 hover:text-[#382416] flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <ArrowLeft className="h-3 w-3" />
                    Back to Credentials
                  </button>

                  <Link href="/recovery" className="text-[#dc5000] hover:underline font-semibold">
                    Lost 2FA phone? Recover →
                  </Link>
                </div>
              </form>
            ) : mode === 'signin' ? (
              /* SIGN IN FORM (STAFF ID PRIMARY) */
              <form onSubmit={handleCustomLogin} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-mono font-bold uppercase text-[#382416]">
                      Official Healthcare Staff ID
                    </label>
                    <button
                      type="button"
                      onClick={() => handleProbeStatus()}
                      disabled={probing}
                      className="text-[10px] text-[#dc5000] hover:underline font-mono font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Search className="h-3 w-3" />
                      {probing ? 'Checking...' : 'Check ID Status'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BadgeCheck className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="JH-STF-1042 (or official email)"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-mono font-medium text-[#382416] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#382416] transition-all"
                    />
                  </div>
                </div>

                {/* Inline Status Probe Badge */}
                {probeStatus && (
                  <div className={`p-2.5 rounded-xl border text-xs font-mono ${
                    probeStatus.status === 'ACTIVE'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : probeStatus.status === 'PENDING_VERIFICATION'
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span>{probeStatus.name} ({probeStatus.staffId})</span>
                      <span className="uppercase text-[10px] px-2 py-0.5 rounded bg-white/60">
                        {probeStatus.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-[11px] mt-0.5 font-sans opacity-90">
                      {probeStatus.status === 'ACTIVE'
                        ? `Verified for ${probeStatus.hospitalName}. Ready to log in.`
                        : probeStatus.status === 'PENDING_VERIFICATION'
                        ? `Pending in-person verification by Medical Superintendent at ${probeStatus.hospitalName}.`
                        : `Account is ${probeStatus.status}. Contact administration.`}
                    </p>
                  </div>
                )}

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
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#382416] transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || isLoading}
                  className="w-full mt-3 py-3 px-4 rounded-xl bg-[#382416] hover:bg-[#28180d] text-[#ffedd7] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Authenticating...' : 'Sign In to Clinical Terminal'}
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="text-center mt-2">
                  <button
                    type="button"
                    onClick={() => { setMode('signup'); setError(null); setOnboardingStage(1); }}
                    className="text-[11px] text-[#dc5000] hover:underline font-semibold cursor-pointer"
                  >
                    New hospital staff? Start official onboarding wizard →
                  </button>
                </div>

                <div className="text-center mt-3 pt-3 border-t border-slate-100">
                  <Link
                    href="/recovery"
                    className="text-[11px] text-slate-500 hover:text-[#382416] hover:underline inline-flex items-center gap-1 font-medium"
                  >
                    <KeyRound className="h-3 w-3 text-slate-400" />
                    Lost 2FA device or password? 12-Word Recovery Portal →
                  </Link>
                </div>
              </form>
            ) : (
              /* CONTINUOUS 4-STAGE ONBOARDING WIZARD */
              <div>
                {/* Onboarding Stage Stepper */}
                <div className="flex items-center justify-between mb-5 border-b border-[#382416]/10 pb-3">
                  {[
                    { s: 1, label: 'Identity' },
                    { s: 2, label: 'Password' },
                    { s: 3, label: '2FA Setup' },
                    { s: 4, label: 'Verification' },
                  ].map(({ s, label }) => (
                    <div key={s} className="flex items-center gap-1">
                      <span className={`size-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                        onboardingStage === s
                          ? 'bg-[#dc5000] text-white'
                          : onboardingStage > s
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}>
                        {onboardingStage > s ? '✓' : s}
                      </span>
                      <span className={`text-[11px] font-mono font-bold ${
                        onboardingStage === s ? 'text-[#382416]' : 'text-slate-400'
                      }`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* STAGE 1: Identity & Role */}
                {onboardingStage === 1 && (
                  <form onSubmit={handleStage1Next} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1">
                        Full Name & Clinical Title
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Dr. Ananya Verma (Medical Officer)"
                        className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#dc5000]"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-mono font-bold uppercase text-[#382416]">
                          Official Staff ID
                        </label>
                        <span className="text-[10px] text-slate-400">Leave blank for auto-assignment</span>
                      </div>
                      <input
                        type="text"
                        value={staffIdInput}
                        onChange={(e) => setStaffIdInput(e.target.value.toUpperCase())}
                        placeholder="e.g. JH-STF-8012"
                        className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-mono font-bold text-[#382416] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#dc5000]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1">
                        Official Government Email (Audit Record)
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="ananya.verma@rims.gov.in"
                        className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#dc5000]"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1">
                          Clinical Duty Role
                        </label>
                        <select
                          value={desiredRole}
                          onChange={(e) => setDesiredRole(e.target.value)}
                          className="w-full px-2.5 py-2 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] focus:outline-none focus:ring-2 focus:ring-[#dc5000]"
                        >
                          <option value="TRIAGE_NURSE">Triage Nurse</option>
                          <option value="HOSPITAL_STAFF">Medical Officer / Doctor</option>
                          <option value="AMBULANCE_DISPATCH">Ambulance Dispatcher</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1">
                          Assigned Hospital
                        </label>
                        <select
                          value={selectedHospitalId}
                          onChange={(e) => setSelectedHospitalId(e.target.value)}
                          className="w-full px-2.5 py-2 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] focus:outline-none focus:ring-2 focus:ring-[#dc5000]"
                        >
                          <option value="">Select Facility</option>
                          {hospitals.map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-[#dc5000] hover:bg-[#c24600] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      Continue to Master Password
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => { setMode('signin'); setError(null); }}
                        className="text-[11px] text-slate-500 hover:text-[#382416] hover:underline"
                      >
                        Already have credentials? Back to Sign In
                      </button>
                    </div>
                  </form>
                )}

                {/* STAGE 2: Password Creation */}
                {onboardingStage === 2 && (
                  <form onSubmit={handleStage2Next} className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1">
                        Master Password
                      </label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 8 chars, uppercase, lowercase, digit, symbol"
                        className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#dc5000]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1">
                        Confirm Master Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat master password"
                        className="w-full px-3 py-2 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#dc5000]"
                        required
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-[#FAF6F0] border border-[#382416]/10 text-[11px] text-slate-600 space-y-1">
                      <div className="font-bold text-[#382416] flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5 text-[#dc5000]" />
                        Zero-Email Security Architecture
                      </div>
                      <p>
                        In the next step, you will be issued an offline 2FA authenticator QR code and a 12-word cryptographic recovery phrase. No SMS or emails are ever sent.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setOnboardingStage(1)}
                        className="py-2.5 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-3 px-4 rounded-xl bg-[#dc5000] hover:bg-[#c24600] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow disabled:opacity-50"
                      >
                        {submitting ? 'Generating 2FA Keys...' : 'Generate 2FA & 12-Word Mnemonic'}
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                )}

                {/* STAGE 3: Cryptographic 2FA & 12-Word BIP-39 Sheet */}
                {onboardingStage === 3 && totpData && (
                  <form onSubmit={handleStage3Next} className="space-y-4">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                      <strong>Cryptographic Packet Generated:</strong> Add this key to Google Authenticator, Microsoft Authenticator, or YubiKey.
                    </div>

                    {/* Secret Key Display */}
                    <div>
                      <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1">
                        TOTP Base32 Key
                      </label>
                      <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 font-mono text-center text-xs tracking-wider font-bold select-all">
                        {totpData.secret}
                      </div>
                    </div>

                    {/* 12-Word Recovery Mnemonic */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-mono font-bold uppercase text-[#382416]">
                          12-Word BIP-39 Emergency Recovery Phrase
                        </label>
                        <button
                          type="button"
                          onClick={handleCopyMnemonic}
                          className="text-[10px] text-[#dc5000] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                        >
                          {copiedMnemonic ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                          {copiedMnemonic ? 'Copied to Clipboard!' : 'Copy Phrase'}
                        </button>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#FAF6F0] border border-[#382416]/20 font-mono text-xs text-[#382416] select-all leading-relaxed">
                        {totpData.mnemonic}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1">
                        Keep this phrase safe. It allows you to recover your account without admin intervention if your phone is lost.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                    >
                      I Have Saved My 2FA Key & Phrase → Complete Onboarding
                    </button>
                  </form>
                )}

                {/* STAGE 4: Onboarding Complete & Verification Notice */}
                {onboardingStage === 4 && (
                  <div className="space-y-4 text-center py-2">
                    <div className="size-14 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-[#382416]">
                        Onboarding & Cryptographic Setup Complete!
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Your account has been officially registered in the Jharkhand State Health Registry.
                      </p>
                    </div>

                    {/* Summary Card */}
                    <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#382416]/15 text-left space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b border-[#382416]/10 pb-2">
                        <span className="text-slate-500">Official Staff ID:</span>
                        <span className="font-mono font-bold text-[#dc5000] text-sm bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-lg">
                          {assignedStaffId}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-[#382416]/10 pb-2">
                        <span className="text-slate-500">Hospital Facility:</span>
                        <span className="font-bold text-[#382416]">{assignedHospitalName}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-[#382416]/10 pb-2">
                        <span className="text-slate-500">Two-Factor Authentication:</span>
                        <span className="text-emerald-700 font-bold">Enabled (TOTP & Mnemonic)</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Status:</span>
                        <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          {stage4ProbeStatus ? stage4ProbeStatus.status : 'PENDING BADGE VERIFICATION'}
                        </span>
                      </div>
                    </div>

                    {/* Explanatory Callout */}
                    <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-left text-xs text-amber-900 leading-relaxed">
                      <strong>Next Step (Physical Desk Verification):</strong>
                      <p className="mt-1 text-[11px]">
                        To prevent unauthorized access to confidential patient records (Protected Health Information), your Medical Superintendent or District CMO must verify your physical clinician badge. Once verified, your status will instantly transition to <strong>ACTIVE</strong>.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 pt-2">
                      <button
                        type="button"
                        onClick={handleStage4Probe}
                        disabled={stage4Probing}
                        className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-[#382416]/20 text-[#382416] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                      >
                        <RefreshCw className={`h-3.5 w-3.5 text-[#dc5000] ${stage4Probing ? 'animate-spin' : ''}`} />
                        {stage4Probing ? 'Checking Registry...' : 'Check Approval Status Now'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier(assignedStaffId);
                          setMode('signin');
                          setOnboardingStage(1);
                        }}
                        className="w-full py-3 px-4 rounded-xl bg-[#382416] hover:bg-[#28180d] text-[#ffedd7] font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow"
                      >
                        Proceed to Sign In Terminal
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>[ZERO EMAIL / SMS]</span>
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
              <span className="font-mono text-[10px]">111 HOSPITALS SEEDED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
