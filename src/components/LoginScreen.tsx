import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle, ArrowRight } from 'lucide-react';
import { AuthService } from '../services/authService';
import { UserProfile } from '../types';
import { AppleHaptics } from '../services/appleHaptics';

interface LoginScreenProps {
  onLogin: (user: UserProfile) => void;
  isAppleMode?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, isAppleMode = true }) => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    AppleHaptics.light();

    setTimeout(() => {
      const result = AuthService.authenticate(employeeCode, password);
      setIsLoading(false);

      if (result.success && result.user) {
        AppleHaptics.success();
        onLogin(result.user);
      } else {
        AppleHaptics.error();
        setError(result.message || 'Invalid Employee Code or Password.');
      }
    }, 250);
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 ${isAppleMode ? 'font-ios' : 'font-sans'} relative overflow-hidden select-none`}>
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header / Facility Badge */}
      <div className="pt-safe-top pt-4 flex items-center justify-between text-xs text-slate-400 z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-semibold text-slate-300">Lalru Unit-3</span>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>EHS Secure Access</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm mx-auto my-auto py-6 z-10">
        {/* SBL Logo Container */}
        <div className="text-center mb-6">
          <div className="inline-block p-2.5 rounded-2xl bg-white shadow-xl shadow-blue-950/40 border border-slate-200/80 mb-3.5 transform transition-transform hover:scale-105">
            <img 
              src="sbl-logo.png" 
              alt="SBL Specialty Coatings Logo" 
              className="h-14 w-auto object-contain mx-auto"
              onError={(e) => {
                // Fallback to public path if needed
                (e.target as HTMLImageElement).src = '/sbl-logo.png';
              }}
            />
          </div>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">
            SBL Specialty Coatings
          </h1>
          <p className="text-xs text-blue-400 font-bold mt-0.5 tracking-wider uppercase">
            EHS Online Management System
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            Sign in with your Employee Code & Password
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-start gap-2.5 animate-shake shadow-lg">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 1. Employee Code Input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Employee Code / कर्मचारी कोड
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4 text-blue-400" />
              </div>
              <input
                type="text"
                required
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck="false"
                value={employeeCode}
                onChange={(e) => setEmployeeCode(e.target.value.toUpperCase())}
                placeholder="Enter Employee Code (e.g. E0414)"
                className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-500 text-sm font-mono font-bold uppercase tracking-wider outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* 2. Password Input */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 block mb-1.5">
              Password / पासवर्ड
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4 text-blue-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter Password"
                className="w-full pl-10 pr-11 py-3 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-500 text-sm font-mono outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all shadow-inner tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-black text-xs uppercase tracking-wider shadow-xl shadow-blue-950/60 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Verifying Credentials...</span>
              </span>
            ) : (
              <>
                <span>Sign In to EHS Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer / Attribution */}
      <div className="pb-safe-bottom pb-3 text-center z-10 space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 font-medium shadow-md">
          <span>Created, Developed and Maintained by <strong className="text-blue-400 font-bold">Budhi Parkash</strong></span>
        </div>
        <p className="text-[10px] text-slate-400">© SBL Specialty Coatings Pvt. Ltd. • All Rights Reserved</p>
      </div>
    </div>
  );
};
