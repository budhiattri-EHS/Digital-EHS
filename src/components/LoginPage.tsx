'use client';

import React, { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Company } from '@/types';
import { Building2, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface LoginPageProps {
  companies: Company[];
  onLoginSuccess: (companyId: string, employeeCode: string, userProfile: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  companies,
  onLoginSuccess
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    companies[0]?.id || '00000000-0000-0000-0000-000000000001'
  );
  const [employeeCode, setEmployeeCode] = useState<string>('E0414');
  const [password, setPassword] = useState<string>('admin123');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanCode = employeeCode.trim().toUpperCase();
    const cleanPw = password.trim();

    if (!cleanCode) {
      setErrorMessage('Please enter your Employee Code.');
      return;
    }
    if (!cleanPw) {
      setErrorMessage('Please enter your Password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Determine user profile based on employee code
      const isBudhi = cleanCode === 'E0414' || cleanCode === '1406' || cleanCode.includes('BUDHI');
      const userProfile = {
        employeeCode: cleanCode,
        fullName: isBudhi ? 'Budhi Parkash' : `User (${cleanCode})`,
        role: isBudhi ? 'HOD (Manufacturing & EHS)' : 'EHS Officer',
        department: isBudhi ? 'Manufacturing & EHS' : 'Operations',
        companyId: selectedCompanyId,
        companyName: selectedCompany?.name || 'SBL Specialty Coatings',
        authenticatedAt: new Date().toISOString()
      };

      // Persist auth session
      try {
        localStorage.setItem('EHS_AUTH_SESSION', JSON.stringify({
          isLoggedIn: true,
          companyId: selectedCompanyId,
          user: userProfile
        }));
      } catch (e) {
        console.warn('Failed to save auth session to localStorage', e);
      }

      setIsSubmitting(false);
      onLoginSuccess(selectedCompanyId, cleanCode, userProfile);
    }, 400);
  };

  const handleFillDemo = (code: string, pw: string) => {
    setEmployeeCode(code);
    setPassword(pw);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen w-screen bg-[#f5f5f7] flex flex-col justify-between items-center px-3 sm:px-4 py-4 sm:py-8 antialiased selection:bg-[#0071e3] selection:text-white font-sans overflow-y-auto">
      {/* Top Header / Subtle Status */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 shrink-0">
        <BrandLogo size="sm" showSubtitle={true} />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2.5 sm:px-3 py-1 rounded-full bg-white border border-[#d2d2d7] text-[#86868b] shadow-sm">
            ISO 45001 • B2B SaaS
          </span>
        </div>
      </header>

      {/* Main Central Card (Apple Glass Aesthetics with 95vw mobile constraint) */}
      <main className="w-[95vw] max-w-md my-auto py-4">
        <div className="bg-white/90 backdrop-blur-2xl border border-[#d2d2d7]/80 rounded-[28px] sm:rounded-[32px] p-5 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] transition-all">
          {/* Logo Hero in Login Card */}
          <div className="flex flex-col items-center text-center mb-5 sm:mb-6">
            <BrandLogo size="lg" showSubtitle={true} className="justify-center mb-2 sm:mb-3" />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#1d1d1f] mt-1">
              Sign in to Enterprise EHS
            </h2>
            <p className="text-xs text-[#86868b] mt-1 max-w-xs leading-relaxed">
              Select your corporate tenant and enter your authorized employee credentials.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 1. Company Selection */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block mb-1.5">
                Corporate Tenant / Company
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full bg-[#f5f5f7] border border-[#d2d2d7] text-xs sm:text-sm rounded-2xl pl-10 pr-8 py-3.5 min-h-[48px] font-semibold text-[#1d1d1f] focus:outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all cursor-pointer shadow-sm appearance-none"
                >
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#86868b] text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* 2. Employee Code */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b] block mb-1.5">
                Employee Code / ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={employeeCode}
                  onChange={(e) => setEmployeeCode(e.target.value)}
                  placeholder="e.g. E0414"
                  className="w-full bg-[#f5f5f7] border border-[#d2d2d7] text-xs sm:text-sm rounded-2xl pl-10 pr-4 py-3.5 min-h-[48px] font-semibold text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all shadow-sm font-mono"
                />
              </div>
            </div>

            {/* 3. Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#86868b]">
                  Password / PIN
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-[#0071e3] hover:underline flex items-center gap-1 font-medium p-1 touch-target"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#86868b] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full bg-[#f5f5f7] border border-[#d2d2d7] text-xs sm:text-sm rounded-2xl pl-10 pr-4 py-3.5 min-h-[48px] font-semibold text-[#1d1d1f] placeholder:text-[#86868b] focus:outline-none focus:bg-white focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/20 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Sign In Button (Accessible Touch Target) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3.5 min-h-[48px] px-4 rounded-2xl bg-[#0071e3] hover:bg-[#0077ed] text-white text-xs sm:text-sm font-bold tracking-wide shadow-md shadow-[#0071e3]/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 touch-target"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In to EHS Cloud'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-5 pt-4 border-t border-[#d2d2d7]/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#86868b]">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
              Quick fill credentials:
            </span>
            <button
              type="button"
              onClick={() => handleFillDemo('E0414', 'admin123')}
              className="px-3 py-1.5 rounded-full bg-[#f5f5f7] hover:bg-[#e8e8ed] text-[#0071e3] font-semibold border border-[#d2d2d7] active:scale-95 transition-all touch-target"
            >
              E0414 (Budhi Parkash)
            </button>
          </div>
        </div>
      </main>

      {/* Mandatory Regulatory & Creator Footer */}
      <footer className="w-full max-w-4xl text-center pt-4 pb-2 shrink-0">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-[#d2d2d7]/70 shadow-sm text-xs text-[#515154]">
          <ShieldCheck className="w-4 h-4 text-[#0071e3] shrink-0" />
          <span className="font-medium text-center">
            EHS Management Software created developed and maintained by Mr Budhi Parkash.
          </span>
        </div>
        <p className="text-[10px] text-[#86868b] mt-1.5">
          Enterprise Multi-Tenant Cloud Architecture • Row-Level Security (RLS) Protected
        </p>
      </footer>
    </div>
  );
};
