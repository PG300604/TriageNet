'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Lock, ShieldAlert, ArrowRight, LogOut, KeyRound } from 'lucide-react';

export const ShiftLockModal: React.FC = () => {
  const { user, isScreenLocked, unlockScreen, endShift } = useAuth();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);

  useEffect(() => {
    if (isScreenLocked) {
      setPin('');
      setError(null);
    }
  }, [isScreenLocked]);

  if (!isScreenLocked || !user) {
    return null;
  }

  const handleUnlock = async (pinToUse?: string) => {
    const code = pinToUse || pin;
    if (code.length !== 4) {
      setError('Please enter your 4-digit Shift PIN.');
      return;
    }

    setUnlocking(true);
    setError(null);

    try {
      await unlockScreen(code);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid Shift PIN. Please try again.');
      setPin('');
    } finally {
      setUnlocking(false);
    }
  };

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      const nextPin = pin + num;
      setPin(nextPin);
      if (nextPin.length === 4) {
        handleUnlock(nextPin);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setPin('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[9999] backdrop-blur-2xl bg-slate-950/85 flex items-center justify-center p-4 select-none animate-in fade-in duration-300">
      <div className="max-w-md w-full bg-[#18110c] border border-[#ffedd7]/15 rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center">
        {/* Header Icon */}
        <div className="size-16 rounded-2xl bg-[#dc5000]/15 border border-[#dc5000]/30 flex items-center justify-center text-[#dc5000] mb-4 shadow-inner">
          <Lock className="h-8 w-8" />
        </div>

        {/* Title & Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dc5000]/10 border border-[#dc5000]/20 text-[#dc5000] text-[10px] font-mono font-bold uppercase tracking-wider mb-2">
          <ShieldAlert className="h-3.5 w-3.5" />
          [TRIAGE WORKSTATION QUICK-LOCKED]
        </div>

        <h2 className="text-xl font-bold text-[#ffedd7] tracking-tight">
          Clinical Bay Privacy Lock
        </h2>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Patient health information is hidden. Enter your 4-digit Shift PIN to resume immediately.
        </p>

        {/* User Identity Card */}
        <div className="w-full mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-left">
          <div>
            <p className="text-xs font-bold text-[#ffedd7]">{user.name}</p>
            <p className="text-[11px] text-slate-400">{user.roleTitle || user.role}</p>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
            ACTIVE SHIFT
          </span>
        </div>

        {/* PIN Dots Display */}
        <div className="my-6 flex items-center justify-center gap-3">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`size-4 rounded-full border transition-all duration-200 ${
                pin.length > index
                  ? 'bg-[#dc5000] border-[#dc5000] scale-110 shadow-sm shadow-[#dc5000]/50'
                  : 'bg-white/5 border-white/20'
              }`}
            />
          ))}
        </div>

        {error && (
          <div className="mb-4 text-xs text-red-400 bg-red-950/50 border border-red-900/60 px-3 py-1.5 rounded-lg font-mono">
            ⚠️ {error}
          </div>
        )}

        {/* Tactile Keypad */}
        <div className="grid grid-cols-3 gap-2.5 w-full max-w-[280px]">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeyPress(num)}
              className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-lg font-bold text-[#ffedd7] transition-all active:scale-95 cursor-pointer"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClear}
            className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-400 transition-all active:scale-95 cursor-pointer"
          >
            CLEAR
          </button>
          <button
            type="button"
            onClick={() => handleKeyPress('0')}
            className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-lg font-bold text-[#ffedd7] transition-all active:scale-95 cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-slate-400 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
          >
            ⌫
          </button>
        </div>

        {/* Bottom Actions */}
        <div className="w-full mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={endShift}
            className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            End Shift & Handover
          </button>

          <span className="text-[10px] font-mono text-slate-500">
            [INSTANT 1-SEC UNLOCK]
          </span>
        </div>
      </div>
    </div>
  );
};
