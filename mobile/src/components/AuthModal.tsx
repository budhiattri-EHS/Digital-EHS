import React, { useState } from 'react';
import { X, ShieldCheck, Lock, User, CheckCircle2, LogOut } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  user: UserProfile;
  onLogin: (profile: UserProfile) => void;
  onLogout: () => void;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  user,
  onLogin,
  onLogout,
  onClose
}) => {
  const [empCode, setEmpCode] = useState(user.employeeCode || '');
  const [pin, setPin] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({
      employeeCode: empCode.toUpperCase() || 'WS0001',
      name: 'Budhi Parkash',
      role: 'EHS Manager',
      facility: 'Lalru Unit-3',
      isAuthenticated: true
    });
    onClose();
  };

  const handleQuickDemo = () => {
    onLogin({
      employeeCode: 'BP-EHS-01',
      name: 'Budhi Parkash',
      role: 'EHS Manager',
      facility: 'Lalru Unit-3',
      isAuthenticated: true
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-md">
            <img 
              src="sbl-logo.png" 
              alt="SBL Logo" 
              className="h-8 w-auto object-contain"
              onError={(e) => { (e.target as HTMLImageElement).src = '/sbl-logo.png'; }} 
            />
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-lg font-black text-slate-100 tracking-tight">
          {user.isAuthenticated ? 'Authorized Employee Profile' : 'Verify Identity'}
        </h2>
        <p className="text-xs text-slate-400 mt-1 mb-5">
          {user.isAuthenticated
            ? 'Logged into SBL EHS Command & Safety Management System.'
            : 'Enter employee credentials to sync shop-floor telemetry.'}
        </p>

        {user.isAuthenticated ? (
          <div className="space-y-4">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Employee Name:</span>
                <span className="font-bold text-slate-100">{user.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Employee Code:</span>
                <span className="font-mono font-bold text-blue-400">{user.employeeCode}</span>
              </div>
              {user.department && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-bold text-amber-400">{user.department}</span>
                </div>
              )}
              {user.designation && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Designation:</span>
                  <span className="font-bold text-purple-400">{user.designation}</span>
                </div>
              )}
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Plant / Facility:</span>
                <span className="font-bold text-emerald-400">{user.facility}</span>
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-red-400 border border-red-500/30 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out / लॉग आउट</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Employee Code
              </label>
              <input
                type="text"
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                placeholder="e.g. WS0001"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white uppercase font-mono font-bold outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1">
                Secure PIN
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white font-mono outline-none focus:border-blue-500 tracking-widest"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-900/40 active:scale-95 transition-all mt-2"
            >
              Authorize Telemetry Access
            </button>

            <button
              type="button"
              onClick={handleQuickDemo}
              className="w-full py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 font-bold text-xs border border-slate-700 active:scale-95 transition-all"
            >
              Quick Demo (Budhi Parkash - EHS Mgr)
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
