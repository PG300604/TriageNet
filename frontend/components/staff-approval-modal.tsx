'use client';

import React, { useState, useEffect } from 'react';
import { ApiClient, PendingStaffUser } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import {
  ShieldCheck,
  UserCheck,
  X,
  AlertCircle,
  CheckCircle2,
  Building2,
  Clock,
  UserX,
} from 'lucide-react';

interface StaffApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApproved?: () => void;
}

export const StaffApprovalModal: React.FC<StaffApprovalModalProps> = ({
  isOpen,
  onClose,
  onApproved,
}) => {
  const { user } = useAuth();
  const [pendingList, setPendingList] = useState<PendingStaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<Record<string, string>>({});

  const loadPending = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.getPendingStaff();
      setPendingList(data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load pending staff registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPending();
      setSuccess(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApprove = async (staff: PendingStaffUser) => {
    setActionLoading(staff.id);
    setError(null);
    setSuccess(null);
    try {
      const role = selectedRoles[staff.id] || staff.role || 'HOSPITAL_STAFF';
      await ApiClient.approveStaff(staff.id, role);
      setSuccess(`Verified and granted active clinical status to ${staff.name} (${staff.staffId})!`);
      setPendingList((prev) => prev.filter((item) => item.id !== staff.id));
      if (onApproved) onApproved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to approve staff member.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (staff: PendingStaffUser) => {
    if (!window.confirm(`Are you sure you want to reject registration for ${staff.name} (${staff.staffId})?`)) {
      return;
    }
    setActionLoading(staff.id);
    setError(null);
    try {
      await ApiClient.rejectStaff(staff.id);
      setSuccess(`Registration for ${staff.name} has been rejected.`);
      setPendingList((prev) => prev.filter((item) => item.id !== staff.id));
      if (onApproved) onApproved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to reject staff member.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9990] backdrop-blur-md bg-slate-900/60 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="max-w-3xl w-full bg-white border border-[#382416]/15 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#382416]/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-700">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#382416]">
                  Hospital Staff Verification & Authorization Queue
                </h2>
                <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  [DUAL-CONTROL ONBOARDING]
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Inspect government credentials and authorize official hospital staff access.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Content List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400 font-mono">
              Loading pending clinician verification queue...
            </div>
          ) : pendingList.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="size-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-2">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-slate-700">All Registrations Cleared</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                There are no pending staff accounts awaiting badge verification at this time.
              </p>
            </div>
          ) : (
            pendingList.map((staff) => (
              <div
                key={staff.id}
                className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#382416]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-[#382416]/30"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#dc5000] bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
                      {staff.staffId}
                    </span>
                    <h3 className="text-sm font-bold text-[#382416]">{staff.name}</h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3 w-3 text-slate-400" />
                      {staff.hospitalName}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <Clock className="h-3 w-3 text-slate-400" />
                      Registered {new Date(staff.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Right: Role selection & Action buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <select
                    value={selectedRoles[staff.id] || staff.role}
                    onChange={(e) =>
                      setSelectedRoles((prev) => ({ ...prev, [staff.id]: e.target.value }))
                    }
                    className="text-xs font-bold bg-white border border-[#382416]/20 rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#382416]"
                  >
                    <option value="TRIAGE_NURSE">Triage Nurse</option>
                    <option value="HOSPITAL_STAFF">Medical Officer / Doctor</option>
                    <option value="HOSPITAL_ADMIN">Medical Superintendent</option>
                    <option value="AMBULANCE_DISPATCH">108 Dispatcher</option>
                    <option value="DISTRICT_CMO">District CMO</option>
                  </select>

                  <button
                    type="button"
                    disabled={actionLoading === staff.id}
                    onClick={() => handleApprove(staff)}
                    className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="h-3.5 w-3.5" />
                    Approve
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading === staff.id}
                    onClick={() => handleReject(staff)}
                    className="py-1.5 px-2.5 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-red-600 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <UserX className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-3 border-t border-[#382416]/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>Logged in as {user?.name} ({user?.roleTitle || user?.role})</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-600 hover:text-[#382416] cursor-pointer"
          >
            Close Queue
          </button>
        </div>
      </div>
    </div>
  );
};
