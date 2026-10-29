/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Lock, X, AlertCircle } from 'lucide-react';
import { auth } from '../firebase';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

const AUTHORIZED_ADMIN_EMAIL = 'phasharak@gmail.com';

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSigningIn(true);
    try {
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      if (credential.user.email?.toLowerCase() !== AUTHORIZED_ADMIN_EMAIL || !credential.user.emailVerified) {
        await signOut(auth);
        throw new Error(`ระบบนี้อนุญาตเฉพาะบัญชี ${AUTHORIZED_ADMIN_EMAIL}`);
      }
      onLoginSuccess();
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setIsSigningIn(false);
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
            <p className="text-xs text-[#8E8E93] mt-0.5">ลงชื่อเข้าใช้ด้วย Google บัญชีผู้ดูแลที่ได้รับอนุญาต</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-[12px] bg-[#FF3B30]/10 text-[#FF3B30] text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2">
              <button
              type="submit"
                disabled={isSigningIn}
              className="w-full py-3 rounded-full bg-[#5856D6] hover:bg-[#4745be] text-white text-sm font-bold shadow-lg shadow-[#5856D6]/25 transition-all active:scale-[0.98] cursor-pointer"
            >
              {isSigningIn ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบด้วย Google'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
