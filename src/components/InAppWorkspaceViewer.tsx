import React, { useState } from 'react';
import { 
  ArrowLeft, 
  RotateCw, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone, 
  Globe, 
  Maximize2, 
  Minimize2,
  AlertCircle
} from 'lucide-react';
import { WorkspaceLink } from '../types';
import { AppleHaptics } from '../services/appleHaptics';

// Mobile Workspace Components
import { MobilePtwWorkspace } from './workspaces/MobilePtwWorkspace';
import { MobileEngineeringWorkspace } from './workspaces/MobileEngineeringWorkspace';
import { MobileKaizenWorkspace } from './workspaces/MobileKaizenWorkspace';
import { MobileUacWorkspace } from './workspaces/MobileUacWorkspace';
import { MobileLmsWorkspace } from './workspaces/MobileLmsWorkspace';
import { MobileFireWorkspace } from './workspaces/MobileFireWorkspace';
import { MobileFiveSWorkspace } from './workspaces/MobileFiveSWorkspace';
import { MobileGenericWorkspace } from './workspaces/MobileGenericWorkspace';

interface InAppWorkspaceViewerProps {
  workspace: WorkspaceLink;
  onClose: () => void;
}

export const InAppWorkspaceViewer: React.FC<InAppWorkspaceViewerProps> = ({
  workspace,
  onClose
}) => {
  // Default to 100% mobile-native responsive mode
  const [viewMode, setViewMode] = useState<'mobile' | 'web'>('mobile');
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleReload = () => {
    AppleHaptics.click();
    setIsLoading(true);
    setHasError(false);
    setIframeKey((prev) => prev + 1);
  };

  const handleOpenExternal = () => {
    AppleHaptics.click();
    window.open(workspace.url, '_blank', 'noopener,noreferrer');
  };

  const renderMobileWorkspace = () => {
    switch (workspace.id) {
      case 'ptw-dashboard':
      case 'create-ptw':
        return <MobilePtwWorkspace />;
      case 'engineering-portal':
        return <MobileEngineeringWorkspace />;
      case 'kaizen-hub':
        return <MobileKaizenWorkspace />;
      case 'uac-nm-dashboard':
      case 'uac-nm-form':
      case 'incident-investigation':
        return <MobileUacWorkspace />;
      case 'digital-lms':
        return <MobileLmsWorkspace />;
      case 'fire-protection':
        return <MobileFireWorkspace />;
      case '5s-dashboard':
        return <MobileFiveSWorkspace />;
      default:
        return (
          <MobileGenericWorkspace
            workspace={workspace}
            onOpenOriginalUrl={() => {
              AppleHaptics.click();
              setViewMode('web');
            }}
          />
        );
    }
  };

  return (
    <div className={`fixed inset-0 z-50 bg-slate-950 flex flex-col transition-all duration-300 ${
      isFullscreen ? 'p-0' : 'p-0 sm:p-2'
    }`}>
      {/* In-App Header Navigation Bar */}
      <div className="ios-glass-header pt-safe px-3 py-2 flex items-center justify-between gap-2 shadow-lg flex-shrink-0">
        {/* Back Button */}
        <button
          onClick={() => {
            AppleHaptics.light();
            onClose();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700/80 active:scale-95 transition-all text-xs font-bold shrink-0"
        >
          <ArrowLeft className="w-4 h-4 text-blue-400" />
          <span className="hidden xs:inline">Back</span>
        </button>

        {/* View Mode Toggle Segment: Mobile App vs Web Frame */}
        <div className="flex items-center ios-segmented p-0.5 max-w-[210px] w-full">
          <button
            onClick={() => {
              AppleHaptics.selection();
              setViewMode('mobile');
            }}
            className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              viewMode === 'mobile'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Mobile App</span>
          </button>

          <button
            onClick={() => {
              AppleHaptics.selection();
              setViewMode('web');
            }}
            className={`flex-1 py-1 px-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${
              viewMode === 'web'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3 h-3" />
            <span>Web App</span>
          </button>
        </div>

        {/* Actions: Reload & External Browser */}
        <div className="flex items-center gap-1 shrink-0">
          {viewMode === 'web' && (
            <button
              onClick={handleReload}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 active:scale-95 transition-all"
              title="Reload Frame"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-400' : ''}`} />
            </button>
          )}

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white border border-slate-700 active:scale-95 transition-all hidden xs:flex"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleOpenExternal}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-blue-400 border border-slate-700 active:scale-95 transition-all"
            title="Open in Browser"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 relative w-full h-full bg-slate-950 overflow-y-auto">
        {viewMode === 'mobile' ? (
          <div className="max-w-lg mx-auto w-full">
            {renderMobileWorkspace()}
          </div>
        ) : (
          <div className="w-full h-full relative">
            {/* Loading Indicator for Iframe */}
            {isLoading && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm gap-3">
                <div className="w-8 h-8 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
                <p className="text-xs font-bold text-slate-300">
                  Loading {workspace.name} in Desktop Frame...
                </p>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={workspace.url}
              title={workspace.name}
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
              className="w-full h-full border-none bg-white"
              allow="camera; microphone; geolocation"
              sandbox="allow-forms allow-scripts allow-same-origin allow-popups allow-downloads allow-modals"
            />

            {hasError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center">
                <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
                <h4 className="text-xs font-bold text-white">Embed Blocked by Google Security</h4>
                <p className="text-[11px] text-slate-400 mt-1 mb-3">
                  Switch back to Mobile App mode or launch directly in browser.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('mobile')}
                    className="py-2 px-3 rounded-xl bg-blue-600 text-white font-bold text-xs"
                  >
                    Switch to Mobile App Mode
                  </button>
                  <button
                    onClick={handleOpenExternal}
                    className="py-2 px-3 rounded-xl bg-slate-800 text-slate-200 font-bold text-xs"
                  >
                    Open in Browser
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
