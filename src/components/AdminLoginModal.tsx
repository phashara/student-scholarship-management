/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, ShieldCheck, X, Eye, EyeOff, AlertCircle } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AUTHORIZED_ADMINS: Record<string, string> = {
  phasharak: '07011985',
  sirapatr: '1911',
};

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (AUTHORIZED_ADMINS[cleanUser] && AUTHORIZED_ADMINS[cleanUser] === cleanPass) {
      setError('');
      // Save login state in sessionStorage for session persistence
      sessionStorage.setItem('socsci_admin_auth', 'true');
      sessionStorage.setItem('socsci_admin_user', username.trim());
      onLoginSuccess();
      onClose();
    } else {
      setError('ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-[28px] shadow-2xl border border-black/[0.08] overflow-hidden p-6 sm:p-7">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#8E8E93] hover:text-[#1C1C1E] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-[20px] bg-gradient-to-tr from-[#5856D6] to-[#007AFF] text-white flex items-center justify-center shadow-lg shadow-[#5856D6]/30">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[#1C1C1E] font-['Prompt',sans-serif]">
              เข้าสู่ระบบเจ้าหน้าที่
            </h3>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              งานกิจการนิสิตและศิษย์เก่าสัมพันธ์ คณะสังคมศาสตร์
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1C1C1E]">
              ชื่อผู้ใช้งาน (Username)
            </label>
            <input
              type="text"
              autoFocus
              placeholder="ระบุชื่อผู้ใช้"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#F2F2F7] text-sm text-[#1C1C1E] outline-none border border-transparent focus:bg-white focus:border-[#5856D6] focus:ring-2 focus:ring-[#5856D6]/20 transition-all font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#1C1C1E]">
              รหัสผ่าน (Password)
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="ระบุรหัสผ่าน"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="w-full px-3.5 py-2.5 pr-10 rounded-[14px] bg-[#F2F2F7] text-sm text-[#1C1C1E] outline-none border border-transparent focus:bg-white focus:border-[#5856D6] focus:ring-2 focus:ring-[#5856D6]/20 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#8E8E93] hover:text-[#1C1C1E] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-[12px] bg-[#FF3B30]/10 text-[#FF3B30] text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 rounded-full bg-[#5856D6] hover:bg-[#4745be] text-white text-sm font-bold shadow-lg shadow-[#5856D6]/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              เข้าสู่ระบบ (Sign In)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
