'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/lib/api-client';
import {
  KeyRound,
  ShieldCheck,
  Building2,
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertCircle,
  CheckCircle2,
  Lock,
  Mail,
  UserCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function AccountRecoveryPage() {
  const router = useRouter();
  const [tab, setTab] = useState<'mnemonic' | 'backup' | 'cmo'>('mnemonic');

  const [email, setEmail] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // CMO Escrow Form
  const [targetStaffEmail, setTargetStaffEmail] = useState('');
  const [escrowReason, setEscrowReason] = useState('');
  const [issuedEmergencyToken, setIssuedEmergencyToken] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const validatePassword = (pass: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'",.<>?/|`~]).{8,}$/;
    return regex.test(pass);
  };

  const handleMnemonicRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !mnemonic.trim() || !newPassword) {
      setError('Please fill out all required fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (!validatePassword(newPassword)) {
      setError('Password must be 8+ characters with uppercase, lowercase, digit, and special symbol.');
      return;
    }

    const wordCount = mnemonic.trim().split(/\s+/).length;
    if (wordCount !== 12) {
      setError(`Your recovery phrase has ${wordCount} words. Exactly 12 words are required.`);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await ApiClient.recoverWithMnemonic({
        email: email.trim(),
        mnemonic: mnemonic.trim(),
        newPassword,
      });
      setSuccess('Account recovered successfully! You can now sign in with your new password.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid 12-word recovery phrase or email.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBackupCodeRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !backupCode.trim() || !newPassword) {
      setError('Please fill out all required fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (!validatePassword(newPassword)) {
      setError('Password must be 8+ characters with uppercase, lowercase, digit, and special symbol.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      await ApiClient.recoverWithBackupCode({
        email: email.trim(),
        backupCode: backupCode.trim().toUpperCase(),
        newPassword,
      });
      setSuccess('Emergency code redeemed! Account password reset successfully.');
      setTimeout(() => router.push('/login'), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or already utilized emergency backup code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCmoEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStaffEmail.trim() || !escrowReason.trim()) {
      setError('Staff email and justification reason are required.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const resp = await ApiClient.approveCmoEscrow({
        targetStaffEmail: targetStaffEmail.trim(),
        escrowReason: escrowReason.trim(),
      });
      setIssuedEmergencyToken(resp.emergencyToken);
      setSuccess('15-Minute Emergency Clinical Bypass Token issued!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Only District CMOs, Super Admins, or Hospital Superintendents can authorize escrow.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef1f6] text-slate-800 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="max-w-2xl mx-auto w-full">
        {/* Navigation Link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#382416] mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Command Portal Login
        </Link>

        {/* Main Card */}
        <div className="bg-white border border-[#382416]/15 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#382416]/10 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-xl bg-[#dc5000]/10 border border-[#dc5000]/20 flex items-center justify-center text-[#dc5000]">
                <KeyRound className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#382416]">
                  Cryptographic Account Recovery
                </h1>
                <p className="text-xs text-slate-500">
                  Zero-email self-service identity restoration for state healthcare personnel
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              [OFFLINE RECOVERY]
            </span>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-[#382416]/15 mb-6">
            <button
              type="button"
              onClick={() => { setTab('mnemonic'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'mnemonic'
                  ? 'border-[#382416] text-[#382416] bg-[#382416]/5'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              12-Word Mnemonic Phrase
            </button>
            <button
              type="button"
              onClick={() => { setTab('backup'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'backup'
                  ? 'border-[#dc5000] text-[#dc5000] bg-orange-50/50'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Emergency Backup Code
            </button>
            <button
              type="button"
              onClick={() => { setTab('cmo'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                tab === 'cmo'
                  ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              CMO Dual Escrow
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Tab 1: 12-Word Mnemonic */}
          {tab === 'mnemonic' && (
            <form onSubmit={handleMnemonicRecovery} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="cmo.ranchi@jharkhand.gov.in"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] focus:outline-none focus:ring-2 focus:ring-[#382416]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-mono font-bold uppercase text-[#382416]">
                    12-Word Cryptographic Mnemonic Phrase
                  </label>
                  <span className="text-[10px] text-slate-400">Exact 12 words separated by spaces</span>
                </div>
                <textarea
                  rows={3}
                  value={mnemonic}
                  onChange={(e) => setMnemonic(e.target.value)}
                  placeholder="matrix clinic pulse shelter doctor orbit copper shield river canyon alert beacon"
                  className="w-full p-3 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-mono text-[#382416] focus:outline-none focus:ring-2 focus:ring-[#382416]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                    New Master Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New strong password"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] focus:outline-none focus:ring-2 focus:ring-[#382416]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] focus:outline-none focus:ring-2 focus:ring-[#382416]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#382416] hover:bg-[#28180d] text-[#ffedd7] font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Verifying Cryptographic Seed...' : 'Restore Identity & Set New Password'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Tab 2: Emergency Backup Code */}
          {tab === 'backup' && (
            <form onSubmit={handleBackupCodeRecovery} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nurse.ananya@rims.gov.in"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] focus:outline-none focus:ring-2 focus:ring-[#dc5000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                  One-Time Emergency Backup Code
                </label>
                <input
                  type="text"
                  value={backupCode}
                  onChange={(e) => setBackupCode(e.target.value)}
                  placeholder="TR-8492-7104"
                  className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-sm font-mono tracking-wider font-bold text-[#dc5000] focus:outline-none focus:ring-2 focus:ring-[#dc5000]"
                />
                <p className="text-[10px] text-slate-500 mt-1 italic">
                  * Note: Using an emergency backup code permanently burns that single-use code.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                    New Master Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] focus:outline-none focus:ring-2 focus:ring-[#dc5000]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] focus:outline-none focus:ring-2 focus:ring-[#dc5000]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#dc5000] hover:bg-[#c24600] text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Redeeming Emergency Code...' : 'Redeem Emergency Code & Set Password'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Tab 3: CMO Dual Escrow */}
          {tab === 'cmo' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 mb-1 text-blue-950">
                  <UserCheck className="h-4 w-4 text-blue-600" />
                  Dual-Control Emergency Clinical Escrow Protocol
                </p>
                If an on-duty clinician has lost both their phone authenticator and 12-word recovery sheet, they must present their physical government medical badge to the on-duty <strong>Medical Superintendent</strong> or <strong>District CMO</strong>. The CMO can authorize an emergency 15-minute clinical shift bypass.
              </div>

              <form onSubmit={handleCmoEscrow} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                    Target Clinician / Staff Email
                  </label>
                  <input
                    type="email"
                    value={targetStaffEmail}
                    onChange={(e) => setTargetStaffEmail(e.target.value)}
                    placeholder="doctor.lostdevice@rims.gov.in"
                    className="w-full px-3.5 py-2.5 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-[#382416] mb-1.5">
                    Clinical Justification / Audit Reason
                  </label>
                  <textarea
                    rows={2}
                    value={escrowReason}
                    onChange={(e) => setEscrowReason(e.target.value)}
                    placeholder="Verified government medical registration in person. Phone lost during trauma ambulance transit."
                    className="w-full p-3 bg-[#FAF6F0] border border-[#382416]/20 rounded-xl text-xs font-medium text-[#382416] focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Issuing Escrow Token...' : 'Authorize Emergency Shift Bypass'}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              {issuedEmergencyToken && (
                <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <p className="text-xs font-bold text-emerald-900 mb-1">
                    Emergency Clinical Bypass Token (Valid for 15 minutes):
                  </p>
                  <div className="p-2.5 bg-white border border-emerald-300 rounded-lg text-[10px] font-mono break-all text-slate-700 select-all">
                    {issuedEmergencyToken}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
