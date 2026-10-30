/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ShieldCheck, KeyRound, AlertCircle, X, ArrowRight } from 'lucide-react';
import { Language } from '../types/index.ts';
import { getTranslation } from '../translations/i18n.ts';
import { StorageService } from '../services/storage.ts';

interface OwnerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: Language;
}

export default function OwnerAuthModal({
  isOpen,
  onClose,
  onSuccess,
  language,
}: OwnerAuthModalProps) {
  const t = getTranslation(language);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) {
      setError(t.owner_passcode_placeholder);
      return;
    }

    if (StorageService.verifyOwnerPasscode(passcode)) {
      StorageService.setOwnerActive(true);
      setError('');
      setPasscode('');
      onSuccess();
    } else {
      setError(t.owner_auth_error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1B4332]/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FBF9F4] w-full max-w-md rounded-3xl shadow-2xl border border-[#E2DBD0] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-7">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl border border-amber-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-[#1B4332] font-heading">
                  {t.owner_auth_modal_title}
                </h3>
                <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                  {t.owner_badge_exclusive}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#7A7264] hover:text-[#2D2A26] rounded-xl hover:bg-[#EFEAE1] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-xs text-[#5C5549] mt-3 leading-relaxed">
            {t.owner_auth_modal_desc}
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="owner_passcode_input" className="block text-xs font-bold text-[#2D2A26] mb-1.5">
                {t.owner_passcode_label}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-[#7A7264] absolute left-3.5 top-3" />
                <input
                  id="owner_passcode_input"
                  type="password"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder={t.owner_passcode_placeholder}
                  className="w-full bg-white border border-[#D5CDC0] rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#2D2A26] focus:ring-2 focus:ring-[#2D6A4F] focus:outline-hidden"
                  autoFocus
                />
              </div>
              <div className="mt-1 text-[11px] text-[#7A7264]">
                รหัสผ่านเริ่มต้น: <code className="bg-stone-200 px-1 py-0.5 rounded text-[#1B4332] font-bold">ktpp0602</code>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-2.5 bg-[#EFEAE1] hover:bg-[#E2DBD0] text-[#4A453E] rounded-xl text-xs font-bold cursor-pointer transition-colors"
              >
                {t.cancel}
              </button>

              <button
                type="submit"
                className="w-1/2 py-2.5 bg-[#1B4332] hover:bg-[#2D6A4F] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
              >
                <span>{t.owner_auth_submit}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
