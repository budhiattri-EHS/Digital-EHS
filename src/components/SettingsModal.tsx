import React from 'react';
import { X, RefreshCw, Smartphone, Database, ShieldCheck, Apple, ExternalLink } from 'lucide-react';
import { AppleHaptics } from '../services/appleHaptics';

interface SettingsModalProps {
  onResetData: () => void;
  onClose: () => void;
  isAppleMode?: boolean;
  onToggleAppleMode?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  onResetData, 
  onClose,
  isAppleMode = false,
  onToggleAppleMode
}) => {
  const handleOpenAppleEdition = () => {
    AppleHaptics.click();
    window.open('/sbl-ehs-apple-ios.html', '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-sm overflow-hidden flex flex-col shadow-2xl p-5 max-h-[90vh]">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-100">
              Control Tower Settings
            </h3>
            {isAppleMode && (
              <span className="text-[9px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.2 rounded border border-blue-500/30">
                iOS Cupertino
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 text-xs">
          {/* Apple iOS Theme Mode Toggle */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Apple className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">Apple iOS Cupertino UI</span>
                <span className="text-[10px] text-slate-400">Cupertino HIG styling & Taptics</span>
              </div>
            </div>

            <button
              onClick={() => {
                AppleHaptics.selection();
                if (onToggleAppleMode) onToggleAppleMode();
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                isAppleMode ? 'bg-blue-600' : 'bg-slate-800'
              }`}
            >
              <div className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                isAppleMode ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Standalone Apple Edition Shortcut */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-3.5 rounded-2xl border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                <Apple className="w-4 h-4" />
                <span>Dedicated Apple iOS Edition</span>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 font-bold">READY</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Open the standalone zero-dependency Apple iOS edition customized for Safari, Dynamic Island, and Apple Watch ECG styles.
            </p>
            <button
              type="button"
              onClick={handleOpenAppleEdition}
              className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Launch Apple iOS Edition</span>
            </button>
          </div>

          {/* Install to Home Screen Info (iOS / Android) */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Smartphone className="w-3.5 h-3.5 text-blue-400" />
              <span>iPhone & iPad PWA Installation</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              To install as a full native-feeling app on your Apple device:
            </p>
            <ol className="text-[10px] text-slate-300 space-y-1 list-decimal list-inside">
              <li>Open this app in <strong>Safari</strong> on your iPhone.</li>
              <li>Tap the <strong>Share</strong> button (box with upward arrow).</li>
              <li>Select <strong>"Add to Home Screen"</strong> and tap <strong>"Add"</strong>.</li>
            </ol>
          </div>

          {/* Reset Factory Data */}
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-300 font-bold">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span>Telemetry Cache</span>
            </div>
            <p className="text-[10px] text-slate-400">
              Restore default mock telemetry and clear local observation logs.
            </p>
            <button
              type="button"
              onClick={() => {
                onResetData();
                onClose();
              }}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-400 border border-amber-500/30 font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Default Telemetry</span>
            </button>
          </div>

          {/* Attribution & Build Info */}
          <div className="pt-2 border-t border-slate-800 text-center space-y-1">
            <p className="text-[11px] font-bold text-slate-300">
              Created, Developed and Maintained by <span className="text-blue-400 font-extrabold">Budhi Parkash</span>
            </p>
            <p className="text-[10px] text-slate-500 font-mono">
              SBL EHS Mobile App • Apple iOS & Android Production v1.2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
