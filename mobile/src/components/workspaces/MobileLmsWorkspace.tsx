import React, { useState, useEffect, useMemo } from 'react';
import { 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  Clock, 
  Search, 
  X, 
  Play, 
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  RefreshCw, 
  User, 
  Building, 
  ShieldCheck, 
  ChevronRight, 
  ArrowLeft, 
  Lock, 
  Plus, 
  FileText, 
  Download, 
  Check, 
  AlertOctagon, 
  ExternalLink, 
  Send, 
  Trophy, 
  Video,
  KeyRound,
  Settings,
  Sparkles,
  Zap
} from 'lucide-react';
import { AppleHaptics } from '../../services/appleHaptics';
import { AuthService } from '../../services/authService';
import { 
  SblLiveSyncService, 
  SblLmsCourse, 
  SblLmsDeptStat, 
  SblLmsCertData,
  SblLmsQuestion 
} from '../../services/liveDataService';

// YouTube-like Responsive Video Player - Default Theater Mode, Clean Playback, Controls at Bottom
interface YouTubePlayerProps {
  videoUrl: string;
  title: string;
  titleHi?: string;
  courseId: string;
  dept: string;
  lang: 'EN' | 'HI';
}

export const YouTubeLikePlayer: React.FC<YouTubePlayerProps> = ({
  videoUrl,
  title,
  titleHi,
  courseId,
  dept,
  lang
}) => {
  // Theater mode as DEFAULT view
  const [isTheater, setIsTheater] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [rippleAnim, setRippleAnim] = useState<{ type: 'play' | 'pause' | 'fwd' | 'rwd' | 'mute' | 'unmute' | 'speed'; key: number } | null>(null);

  // Parse URLs
  const isYouTube = videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const ytMatch = videoUrl.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*)/);
  const ytId = ytMatch && ytMatch[1].length === 11 ? ytMatch[1] : null;

  const driveMatch = videoUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || videoUrl.match(/id=([a-zA-Z0-9_-]+)/);
  const driveId = driveMatch ? driveMatch[1] : null;

  // Stream source: Native 1080p stream through Vite / SW Gateway for Google Drive
  const streamSrc = useMemo(() => {
    if (driveId) return `/api/stream-video?id=${driveId}`;
    if (!isYouTube && videoUrl) return videoUrl;
    return '';
  }, [driveId, isYouTube, videoUrl]);

  // Embed URL as fallback if needed
  const embedUrl = ytId
    ? `https://www.youtube.com/embed/${ytId}?autoplay=1&enablejsapi=1&rel=0`
    : driveId
      ? `https://drive.google.com/file/d/${driveId}/preview`
      : videoUrl;

  const externalUrl = ytId
    ? `https://www.youtube.com/watch?v=${ytId}`
    : driveId
      ? `https://drive.google.com/file/d/${driveId}/view`
      : videoUrl;

  const [useFallbackEmbed, setUseFallbackEmbed] = useState(false);

  const videoRef = React.useRef<HTMLVideoElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const hideTimerRef = React.useRef<any>(null);

  // Auto-hide controls after 2.5s of playback (YouTube standard)
  const kickControlsTimer = () => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    if (isPlaying) {
      hideTimerRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSettings(false);
      }, 2500);
    }
  };

  const triggerRipple = (type: 'play' | 'pause' | 'fwd' | 'rwd' | 'mute' | 'unmute' | 'speed') => {
    setRippleAnim({ type, key: Date.now() });
    setTimeout(() => {
      setRippleAnim(null);
    }, 600);
  };

  const togglePlay = () => {
    AppleHaptics.selection();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        triggerRipple('play');
      }).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      triggerRipple('pause');
    }
    kickControlsTimer();
  };

  const seekRelative = (deltaSec: number) => {
    AppleHaptics.click();
    triggerRipple(deltaSec > 0 ? 'fwd' : 'rwd');
    if (videoRef.current) {
      const dur = duration || (videoRef.current.duration) || 1000;
      const next = Math.max(0, Math.min(dur, videoRef.current.currentTime + deltaSec));
      videoRef.current.currentTime = next;
      setCurrentTime(next);
    }
    kickControlsTimer();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
    kickControlsTimer();
  };

  const toggleMute = () => {
    AppleHaptics.click();
    if (videoRef.current) {
      const next = !isMuted;
      videoRef.current.muted = next;
      setIsMuted(next);
      triggerRipple(next ? 'mute' : 'unmute');
    }
    kickControlsTimer();
  };

  const changeVolume = (val: number) => {
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
    kickControlsTimer();
  };

  const changeRate = (rate: number) => {
    AppleHaptics.click();
    setPlaybackRate(rate);
    if (videoRef.current) videoRef.current.playbackRate = rate;
    setShowSettings(false);
    triggerRipple('speed');
    kickControlsTimer();
  };

  const toggleFullscreen = () => {
    AppleHaptics.click();
    const cont = containerRef.current;
    if (!cont) return;
    if (!document.fullscreenElement) {
      if (cont.requestFullscreen) {
        cont.requestFullscreen().catch(() => {});
      } else if ((cont as any).webkitRequestFullscreen) {
        (cont as any).webkitRequestFullscreen();
      } else if (videoRef.current && (videoRef.current as any).webkitEnterFullscreen) {
        (videoRef.current as any).webkitEnterFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      }
    }
  };

  const formatSec = (s: number) => {
    if (!s || isNaN(s)) return '00:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-2">
      {/* Container - Cinema-Grade Theater Mode (16:9 Widescreen, 100% Bright, Zero Dimming) */}
      <div
        ref={containerRef}
        onMouseMove={kickControlsTimer}
        onTouchStart={kickControlsTimer}
        onClick={kickControlsTimer}
        className={`w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative border-2 ${isTheater ? 'border-indigo-500/50 shadow-indigo-950/60 ring-2 ring-indigo-500/30' : 'border-slate-800'} transition-all duration-300 select-none group`}
      >
        {!useFallbackEmbed && (streamSrc || (!isYouTube && videoUrl)) ? (
          /* Native HTML5 Video Stream - 100% Bright, Fully Interactive */
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <video
              ref={videoRef}
              src={streamSrc}
              className="w-full h-full object-contain cursor-pointer"
              playsInline
              preload="auto"
              onTimeUpdate={() => {
                if (videoRef.current) {
                  setCurrentTime(videoRef.current.currentTime);
                  setDuration(videoRef.current.duration || 0);
                  if (videoRef.current.buffered.length > 0) {
                    setBufferedTime(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
                  }
                }
              }}
              onLoadedMetadata={() => {
                if (videoRef.current) {
                  setDuration(videoRef.current.duration || 0);
                }
              }}
              onWaiting={() => setIsBuffering(true)}
              onPlaying={() => {
                setIsBuffering(false);
                setIsPlaying(true);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onError={() => {
                console.warn('[Video Player] Stream error, mounting fallback embed');
                setUseFallbackEmbed(true);
              }}
            />

            {/* Gesture Tap Zones (Double-tap left = -10s, double-tap right = +10s, center = play/pause) - Stops at bottom-16 to never overlap controls */}
            <div className="absolute top-0 left-0 right-0 bottom-16 flex z-10 pointer-events-auto">
              {/* Left 35% Zone */}
              <div 
                className="w-[35%] h-full cursor-pointer" 
                onDoubleClick={(e) => { e.stopPropagation(); seekRelative(-10); }}
                onClick={(e) => {
                  e.stopPropagation();
                  kickControlsTimer();
                }}
              />
              {/* Center 30% Zone */}
              <div 
                className="w-[30%] h-full cursor-pointer flex items-center justify-center" 
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
              />
              {/* Right 35% Zone */}
              <div 
                className="w-[35%] h-full cursor-pointer" 
                onDoubleClick={(e) => { e.stopPropagation(); seekRelative(10); }}
                onClick={(e) => {
                  e.stopPropagation();
                  kickControlsTimer();
                }}
              />
            </div>

            {/* Buffering Indicator */}
            {isBuffering && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 z-20 pointer-events-none">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-[11px] font-mono text-white/90 mt-2 font-bold tracking-wider">LOADING HD STREAM...</span>
              </div>
            )}

            {/* Animated Ripple Effects */}
            {rippleAnim && (
              <div key={rippleAnim.key} className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-out fade-out zoom-out duration-500">
                <div className="w-20 h-20 rounded-full bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-white shadow-2xl border border-white/20">
                  {rippleAnim.type === 'play' && <Play className="w-10 h-10 fill-white ml-1" />}
                  {rippleAnim.type === 'pause' && <Pause className="w-10 h-10 fill-white" />}
                  {rippleAnim.type === 'fwd' && (
                    <>
                      <RotateCw className="w-6 h-6 mb-0.5 text-red-500" />
                      <span className="text-[11px] font-bold font-mono tracking-tight text-red-400">+10s</span>
                    </>
                  )}
                  {rippleAnim.type === 'rwd' && (
                    <>
                      <RotateCcw className="w-6 h-6 mb-0.5 text-red-500" />
                      <span className="text-[11px] font-bold font-mono tracking-tight text-red-400">-10s</span>
                    </>
                  )}
                  {rippleAnim.type === 'mute' && (
                    <>
                      <VolumeX className="w-7 h-7 text-red-400 mb-0.5" />
                      <span className="text-[9px] font-bold font-mono text-red-400 uppercase tracking-tight">MUTED</span>
                    </>
                  )}
                  {rippleAnim.type === 'unmute' && (
                    <>
                      <Volume2 className="w-7 h-7 text-emerald-400 mb-0.5" />
                      <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-tight">SOUND ON</span>
                    </>
                  )}
                  {rippleAnim.type === 'speed' && (
                    <>
                      <Zap className="w-6 h-6 text-amber-400 mb-0.5" />
                      <span className="text-[11px] font-bold font-mono text-amber-300">{playbackRate}x</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Top Info Bar (Header overlay - fades with controls) */}
            <div className={`absolute top-0 inset-x-0 p-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-20 transition-opacity duration-300 flex items-center justify-between text-white text-xs ${showControls || !isPlaying ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
              <div className="flex items-center gap-2 truncate pr-2">
                <span className="px-2 py-0.5 rounded-full bg-indigo-600/80 text-[10px] font-mono font-bold">{courseId}</span>
                <span className="font-bold text-xs truncate drop-shadow">{lang === 'EN' ? title : (titleHi || title)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-white/20 text-emerald-300 border border-emerald-400/30">1080p HD</span>
              </div>
            </div>

            {/* Bottom YouTube Controls Bar (Auto-hides smoothly after 2.5s of playback) */}
            <div 
              onMouseEnter={() => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }}
              onMouseLeave={kickControlsTimer}
              onTouchStart={() => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); }}
              onTouchEnd={kickControlsTimer}
              onClick={(e) => e.stopPropagation()}
              className={`absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/95 via-black/80 to-transparent space-y-2 z-40 transition-opacity duration-300 pointer-events-auto ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              {/* YouTube Red Scrubber Bar */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="group/scrub relative w-full h-2 hover:h-3 bg-white/20 rounded-full cursor-pointer transition-all flex items-center"
              >
                {/* Buffered Track */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-white/30 rounded-full transition-all"
                  style={{ width: `${duration > 0 ? Math.min(100, (bufferedTime / duration) * 100) : 0}%` }}
                />
                {/* Played Track (YouTube Red #FF0000) */}
                <div
                  className="h-full bg-[#FF0000] rounded-full relative z-10"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                >
                  {/* Glowing Red Scrubber Handle */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-[#FF0000] rounded-full shadow-lg shadow-red-600/80 scale-100 transition-transform"></div>
                </div>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.1"
                  value={currentTime}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleSeek(e);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />
              </div>

              {/* Bottom Toolbar Controls */}
              <div className="flex items-center justify-between text-white text-xs">
                {/* Left Controls: Play/Pause, Rewind 10s, Forward 10s, Volume, Time */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglePlay();
                    }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white flex items-center justify-center shadow"
                    title={isPlaying ? "Pause (Space)" : "Play (Space)"}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4 text-white fill-white" />
                    ) : (
                      <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      seekRelative(-10);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-slate-300 hover:text-white"
                    title="Rewind 10 seconds (-10s)"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      seekRelative(10);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-slate-300 hover:text-white"
                    title="Forward 10 seconds (+10s)"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                  </button>

                  {/* Volume Button with Pop-up Slider */}
                  <div className="flex items-center group/vol">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMute();
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white"
                      title={isMuted ? "Unmute" : "Mute"}
                    >
                      {isMuted ? (
                        <VolumeX className="w-4 h-4 text-red-400" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <input 
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={isMuted ? 0 : volume}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        changeVolume(parseFloat(e.target.value));
                      }}
                      className="w-14 h-1 accent-[#FF0000] cursor-pointer opacity-70 group-hover/vol:opacity-100 transition-opacity ml-1 hidden sm:inline-block"
                    />
                  </div>

                  {/* Time Counter */}
                  <span className="text-[11px] font-mono text-slate-200 font-bold select-none ml-1">
                    {formatSec(currentTime)} / {formatSec(duration)}
                  </span>
                </div>

                {/* Right Controls: Playback Speed, Theater Toggle, Fullscreen */}
                <div className="flex items-center gap-1.5 relative">
                  {/* Playback Speed Pill */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSettings(!showSettings);
                      }}
                      className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 active:scale-95 text-[10px] font-mono font-bold text-white transition-all flex items-center gap-1"
                      title="Playback Speed"
                    >
                      <span>{playbackRate === 1 ? '1.0x' : `${playbackRate}x`}</span>
                    </button>

                    {showSettings && (
                      <div 
                        onClick={(e) => e.stopPropagation()}
                        className="absolute bottom-9 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 flex flex-col gap-1 z-50 text-[11px] font-mono w-28"
                      >
                        <span className="text-[9px] text-slate-400 font-bold px-2 py-0.5 uppercase tracking-wider">Speed</span>
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map(r => (
                          <button
                            key={r}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              changeRate(r);
                            }}
                            className={`px-2 py-1 rounded text-left font-bold transition-all ${playbackRate === r ? 'bg-[#FF0000] text-white' : 'text-slate-300 hover:bg-slate-800'}`}
                          >
                            {r === 1 ? '1.0x Normal' : `${r}x`}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Theater Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      AppleHaptics.selection();
                      setIsTheater(!isTheater);
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white active:scale-95 transition-all"
                    title={isTheater ? "Standard View" : "Theater Mode"}
                  >
                    {isTheater ? <Minimize2 className="w-4 h-4 text-blue-400" /> : <Maximize2 className="w-4 h-4 text-blue-400" />}
                  </button>

                  {/* Fullscreen Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white active:scale-95 transition-all"
                    title="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* YouTube Embed View (with native controls) */
          <div className="relative w-full h-full overflow-hidden bg-black flex items-center justify-center">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                title={title}
              />
            ) : (
              <div className="p-6 text-center text-slate-500">
                <Video className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <p className="text-xs font-bold text-white uppercase">Video Stream Cached on Plant Server</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* External Controls Toolbar (Below the video - Clean & Unobtrusive) */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-[10px] font-bold border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{isYouTube ? 'YouTube HD' : 'SBL HD Stream 1080p'}</span>
          </span>
          <button
            onClick={() => {
              AppleHaptics.selection();
              setIsTheater(!isTheater);
            }}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold border border-slate-700 flex items-center gap-1.5 active:scale-95 transition-all shadow"
          >
            {isTheater ? <Minimize2 className="w-3.5 h-3.5 text-blue-400" /> : <Maximize2 className="w-3.5 h-3.5 text-blue-400" />}
            <span>{isTheater ? (lang === 'EN' ? 'Standard View' : 'सामान्य दृश्य') : (lang === 'EN' ? 'Theater Mode' : 'थिएटर मोड')}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {externalUrl && (
            <a
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              onClick={() => AppleHaptics.click()}
              className="px-3 py-1 rounded-full bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold flex items-center gap-1.5 active:scale-95 transition-all shadow shadow-red-950/60"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{lang === 'EN' ? 'Open in App' : 'ऐप में खोलें'}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};


export const MobileLmsWorkspace: React.FC = () => {
  // Current logged in user from AuthService (Default official code E0414)
  const authUser = AuthService.getCurrentUser();
  const [user, setUser] = useState<{
    code: string;
    name: string;
    department: string;
    designation: string;
    isEhsManager: boolean;
    isDeptHod: boolean;
  }>({
    code: authUser?.employeeCode || 'E0414',
    name: authUser?.name || 'Budhi Parkash',
    department: authUser?.department || 'Manufacturing',
    designation: authUser?.designation || 'HOD',
    isEhsManager: true,
    isDeptHod: true
  });

  // State
  const [courses, setCourses] = useState<SblLmsCourse[]>(SblLiveSyncService.liveLmsCatalog);
  const [deptStats, setDeptStats] = useState<SblLmsDeptStat[]>(SblLiveSyncService.liveLmsDeptStats);
  const [overallCompliance, setOverallCompliance] = useState<number>(67);
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');

  // LMS View State Restoration from localStorage (App resumption)
  const LMS_VIEW_STORAGE_KEY = 'SBL_LMS_ACTIVE_VIEW';
  const LMS_COURSE_STORAGE_KEY = 'SBL_LMS_ACTIVE_COURSE_ID';

  const [view, setView] = useState<'dashboard' | 'training' | 'quiz' | 'admin'>(() => {
    try {
      const saved = localStorage.getItem(LMS_VIEW_STORAGE_KEY);
      if (saved && ['dashboard', 'training', 'quiz', 'admin'].includes(saved)) {
        return saved as any;
      }
    } catch (e) {}
    return 'dashboard';
  });

  const [activeCourse, setActiveCourse] = useState<SblLmsCourse | null>(() => {
    try {
      const savedId = localStorage.getItem(LMS_COURSE_STORAGE_KEY);
      if (savedId) {
        const found = SblLiveSyncService.liveLmsCatalog.find(c => c.id.toUpperCase() === savedId.toUpperCase());
        if (found) return found;
      }
    } catch (e) {}
    return null;
  });

  const [viewStack, setViewStack] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'assigned' | 'pending' | 'cleared' | 'all'>('assigned');
  const [isSyncing, setIsSyncing] = useState(false);

  // App Resumption: Persist view and active course whenever changed
  useEffect(() => {
    try {
      localStorage.setItem(LMS_VIEW_STORAGE_KEY, view);
      if (activeCourse) {
        localStorage.setItem(LMS_COURSE_STORAGE_KEY, activeCourse.id);
      } else {
        localStorage.removeItem(LMS_COURSE_STORAGE_KEY);
      }
    } catch (e) {}
  }, [view, activeCourse]);

  // App Resumption Listener: restore exact screen when user returns to app
  useEffect(() => {
    const handleResume = () => {
      if (document.visibilityState === 'visible') {
        try {
          const savedView = localStorage.getItem(LMS_VIEW_STORAGE_KEY);
          const savedCourseId = localStorage.getItem(LMS_COURSE_STORAGE_KEY);
          if (savedView && savedView !== view && ['dashboard', 'training', 'quiz', 'admin'].includes(savedView)) {
            setView(savedView as any);
          }
          if (savedCourseId && (!activeCourse || activeCourse.id.toUpperCase() !== savedCourseId.toUpperCase())) {
            const found = courses.find(c => c.id.toUpperCase() === savedCourseId.toUpperCase());
            if (found) setActiveCourse(found);
          }
        } catch (e) {}
      }
    };
    document.addEventListener('visibilitychange', handleResume);
    window.addEventListener('pageshow', handleResume);
    return () => {
      document.removeEventListener('visibilitychange', handleResume);
      window.removeEventListener('pageshow', handleResume);
    };
  }, [courses, view, activeCourse]);

  // Active Training / Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);

  // Result & Certificate Modal State
  const [resultModal, setResultModal] = useState<{
    show: boolean;
    status: 'PASS' | 'FAIL';
    score: number;
    certData?: SblLmsCertData;
  }>({ show: false, status: 'PASS', score: 0 });

  // Admin Console State
  const [adminPin, setAdminPin] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminActiveTab, setAdminActiveTab] = useState<'registry' | 'hod_request' | 'ehs_publish'>('registry');

  // Admin Form States
  const [newEmpCode, setNewEmpCode] = useState('');
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpPass, setNewEmpPass] = useState('');
  const [newEmpDept, setNewEmpDept] = useState('Production');
  const [newEmpDesig, setNewEmpDesig] = useState('Operator');

  const [reqTitle, setReqTitle] = useState('');
  const [reqDesig, setReqDesig] = useState('All Plant Staff');

  // EHS Module Builder State
  const [pubId, setPubId] = useState(`SBL-EHS-${String(courses.length + 1).padStart(3, '0')}`);
  const [pubTitleEn, setPubTitleEn] = useState('');
  const [pubTitleHi, setPubTitleHi] = useState('');
  const [pubVideoUrl, setPubVideoUrl] = useState('');
  const [pubTargetDept, setPubTargetDept] = useState('GLOBAL');
  const [pubTargetDesig, setPubTargetDesig] = useState('GLOBAL');
  const [tempQuestions, setTempQuestions] = useState<SblLmsQuestion[]>([]);
  const [qEn, setQEn] = useState('');
  const [qHi, setQHi] = useState('');
  const [qOpt, setQOpt] = useState('Yes (हाँ), No (नहीं)');
  const [qAns, setQAns] = useState('Yes (हाँ)');

  // Toast Notification
  const [toast, setToast] = useState<{ show: boolean; message: string; isError?: boolean }>({ show: false, message: '' });

  const showToast = (message: string, isError = false) => {
    setToast({ show: true, message, isError });
    if (isError) AppleHaptics.error();
    else AppleHaptics.success();
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 4000);
  };

  // Initial Sync from Cloud
  useEffect(() => {
    handleCloudSync(false);
  }, []);

  const handleCloudSync = async (triggerHaptic = true) => {
    if (triggerHaptic) AppleHaptics.light();
    setIsSyncing(true);
    try {
      const res = await SblLiveSyncService.fetchLiveLmsCurriculum(user.code);
      if (res.courses.length > 0) {
        setCourses(res.courses);
        setDeptStats(res.stats);
        setOverallCompliance(res.overallCompliance);
        if (triggerHaptic) AppleHaptics.success();
        showToast(lang === 'EN' ? `Synchronized ${res.courses.length} courses with Central Sheet (gid 1774039163)` : `गूगल शीट (gid 1774039163) से ${res.courses.length} पाठ्यक्रम सिंक किए गए`);
      }
    } catch {
      showToast("Offline mode: using verified local catalog", true);
    } finally {
      setIsSyncing(false);
    }
  };

  // Navigation State Machine matching LMS Extension v1.9
  const switchView = (targetView: 'dashboard' | 'training' | 'quiz' | 'admin', isBack = false) => {
    AppleHaptics.click();
    if (view === targetView) return;

    if (!isBack && view !== 'dashboard') {
      setViewStack(prev => [...prev, view]);
    }
    setView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetreat = () => {
    AppleHaptics.selection();
    if (view === 'quiz') {
      const confirmRetreat = window.confirm(
        lang === 'EN' 
          ? "Alert: Going back will clear your current assessment progress. Proceed?" 
          : "चेतावनी: वापस जाने से आपकी वर्तमान परीक्षा प्रगति रद्द हो जाएगी। क्या आप आगे बढ़ना चाहते हैं?"
      );
      if (!confirmRetreat) return;
    }

    if (viewStack.length > 0) {
      const prev = viewStack[viewStack.length - 1] as any;
      setViewStack(s => s.slice(0, -1));
      switchView(prev, true);
    } else {
      switchView('dashboard', true);
    }
  };

  // Start Training
  const startTraining = (course: SblLmsCourse) => {
    AppleHaptics.click();
    setActiveCourse(course);
    setSelectedAnswers({});
    setFeedbackText('');
    switchView('training');
  };

  // Launch Quiz from Training
  const handleLaunchQuiz = () => {
    AppleHaptics.click();
    if (!activeCourse) return;
    setSelectedAnswers({});
    switchView('quiz');
  };

  // Submit Assessment
  const handleSubmitAssessment = () => {
    if (!activeCourse) return;

    const questions = activeCourse.questions;
    if (questions.length === 0) {
      showToast("Module has no evaluation questions", true);
      return;
    }

    // Check answered questions
    let correctCount = 0;
    questions.forEach((q, idx) => {
      const selected = selectedAnswers[idx];
      if (selected && (selected.trim() === q.answer.trim() || selected.toLowerCase().includes(q.answer.toLowerCase()) || q.answer.toLowerCase().includes(selected.toLowerCase()))) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / questions.length) * 100);
    setIsSubmittingQuiz(true);

    const courseTitle = lang === 'EN' ? activeCourse.titleEn : activeCourse.titleHi;

    setTimeout(() => {
      setIsSubmittingQuiz(false);
      const res = SblLiveSyncService.submitLmsAssessment({
        code: user.code,
        userName: user.name,
        courseId: activeCourse.id,
        courseTitle,
        score,
        feedback: feedbackText,
        department: user.department
      });

      setResultModal({
        show: true,
        status: res.status,
        score,
        certData: res.certData
      });

      if (res.status === 'PASS') {
        AppleHaptics.success();
        setCourses(prev => prev.map(c => c.id === activeCourse.id ? { ...c, isCleared: true, statusLabel: 'COMPLETED' } : c));
        // Live refresh curriculum stats & department completion tally
        SblLiveSyncService.fetchLiveLmsCurriculum(user.code).then(live => {
          if (live.courses.length > 0) setCourses(live.courses);
          if (live.stats.length > 0) setDeptStats(live.stats);
          if (live.overallCompliance > 0) setOverallCompliance(live.overallCompliance);
        }).catch(() => {});
        showToast(lang === 'EN' ? "Assessment Passed & Recorded in Plant Audit_Log" : "परीक्षा उत्तीर्ण और प्लांट Audit_Log में दर्ज");
      } else {
        AppleHaptics.error();
      }
    }, 600);
  };

  // Unlock Admin Console
  const handleUnlockAdmin = () => {
    if (adminPin.trim() === '1406') {
      AppleHaptics.success();
      setIsAdminUnlocked(true);
      setAdminPin('');
      showToast("Management Console Unlocked (PIN 1406 Verified)");
    } else {
      AppleHaptics.error();
      showToast("Forensic PIN Rejected. Invalid Key.", true);
    }
  };

  // Admin: Register Employee
  const handleRegisterEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmpCode.trim() || !newEmpName.trim()) {
      showToast("Code and Name are mandatory", true);
      return;
    }
    try {
      SblLiveSyncService.adminAddEmployee('1406', {
        code: newEmpCode.trim(),
        name: newEmpName.trim(),
        pass: newEmpPass.trim() || '1234',
        dept: newEmpDept,
        desig: newEmpDesig
      });
      showToast(`Identity for ${newEmpName} archived in SBL Ledger`);
      setNewEmpCode('');
      setNewEmpName('');
      setNewEmpPass('');
    } catch (err: any) {
      showToast(err.message, true);
    }
  };

  // Admin: HOD Training Request
  const handleHodRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle.trim()) {
      showToast("Training Subject is mandatory", true);
      return;
    }
    try {
      SblLiveSyncService.hodRequestTraining('1406', {
        hodName: user.name,
        dept: user.department,
        desig: reqDesig,
        topic: reqTitle.trim()
      });
      showToast("Requirement logged for EHS Review in Training_Requests");
      setReqTitle('');
    } catch (err: any) {
      showToast(err.message, true);
    }
  };

  // Admin: Add Question to Queue
  const handleAddQuestionToQueue = () => {
    if (!qEn.trim()) {
      showToast("Question in English is required", true);
      return;
    }
    const opts = qOpt.split(',').map(s => s.trim()).filter(Boolean);
    const newQ: SblLmsQuestion = {
      text_en: qEn.trim(),
      text_hi: qHi.trim() || qEn.trim(),
      options: opts.length ? opts : ["Yes (हाँ)", "No (नहीं)"],
      answer: qAns.trim() || opts[0] || "Yes (हाँ)"
    };
    setTempQuestions(prev => [...prev, newQ]);
    setQEn('');
    setQHi('');
    showToast("Question added to module queue");
  };

  // Admin: Publish EHS Module
  const handlePublishModule = () => {
    if (!pubTitleEn.trim()) {
      showToast("Module title is mandatory", true);
      return;
    }
    try {
      SblLiveSyncService.ehsPublishModule('1406', {
        id: pubId,
        titleEn: pubTitleEn.trim(),
        titleHi: pubTitleHi.trim() || pubTitleEn.trim(),
        videoUrl: pubVideoUrl.trim(),
        dept: pubTargetDept,
        desig: pubTargetDesig,
        questionsJson: JSON.stringify(tempQuestions)
      });
      showToast(`Module ${pubId} Authorized & Published`);
      setCourses([...SblLiveSyncService.liveLmsCatalog]);
      setPubId(`SBL-EHS-${String(courses.length + 2).padStart(3, '0')}`);
      setPubTitleEn('');
      setPubTitleHi('');
      setPubVideoUrl('');
      setTempQuestions([]);
    } catch (err: any) {
      showToast(err.message, true);
    }
  };

  // Format video url to Google Drive preview or embed
  const formatVideoUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/d\/(.+?)(\/|$)/) || url.match(/id=(.+?)(&|$)/);
      if (match && match[1]) {
        return `https://drive.google.com/file/d/${match[1]}/preview`;
      }
    }
    return url;
  };

  // Filtered & Assigned Courses
  const assignedCourses = useMemo(() => {
    return courses.filter(c => c.dept !== 'UNASSIGNED' && Boolean(c.videoUrl) && (
      c.dept.toUpperCase() === 'GLOBAL' || c.dept.toUpperCase() === user.department.toUpperCase()
    ));
  }, [courses, user.department]);

  const assignedClearedCount = useMemo(() => {
    return assignedCourses.filter(c => c.isCleared).length;
  }, [assignedCourses]);

  const assignedPendingCount = useMemo(() => {
    return assignedCourses.filter(c => !c.isCleared).length;
  }, [assignedCourses]);

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q ||
        c.id.toLowerCase().includes(q) ||
        c.titleEn.toLowerCase().includes(q) ||
        c.titleHi.toLowerCase().includes(q) ||
        c.dept.toLowerCase().includes(q);

      const isAssigned = c.dept !== 'UNASSIGNED' && Boolean(c.videoUrl) && (
        c.dept.toUpperCase() === 'GLOBAL' || c.dept.toUpperCase() === user.department.toUpperCase()
      );

      let matchTab = true;
      if (activeTab === 'assigned') matchTab = isAssigned;
      else if (activeTab === 'pending') matchTab = isAssigned && !c.isCleared;
      else if (activeTab === 'cleared') matchTab = !!c.isCleared;
      else if (activeTab === 'all') matchTab = true;

      return matchSearch && matchTab;
    });
  }, [courses, searchQuery, activeTab, user.department]);

  const clearedCount = courses.filter(c => c.isCleared).length;

  return (
    <div className="space-y-4 p-2.5 sm:p-4 pb-28 text-slate-100 max-w-5xl mx-auto">
      {/* 0. TOAST NOTIFICATION SYSTEM */}
      {toast.show && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-[200] px-5 py-3 rounded-2xl text-white font-black uppercase tracking-wider text-xs shadow-2xl flex items-center gap-3 animate-bounce border-2 ${
          toast.isError ? 'bg-rose-600 border-white' : 'bg-blue-900 border-orange-500'
        }`}>
          {toast.isError ? <AlertOctagon className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0 text-orange-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 1. MASTER-CLASS CENTERED HEADER WITH RETREAT NAVIGATION */}
      <header className="ios-card p-4 text-center relative overflow-hidden bg-white text-slate-900 border-b-4 border-blue-600 shadow-xl rounded-2xl">
        <div className="flex justify-between items-center px-1">
          {/* Context-Aware Retreat Button */}
          <div className="w-1/4 flex justify-start">
            {view !== 'dashboard' && (
              <button
                onClick={handleRetreat}
                className="group flex items-center gap-1.5 bg-slate-100 hover:bg-blue-900 text-slate-700 hover:text-white px-3 py-1.5 rounded-xl font-black text-[11px] uppercase tracking-wider transition-all shadow-sm active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 transform group-hover:-translate-x-0.5 transition-transform" />
                <span>{lang === 'EN' ? 'Retreat' : 'वापस'}</span>
              </button>
            )}
          </div>

          {/* Centered SBL Logo & Title */}
          <div 
            onClick={() => switchView('dashboard')}
            className="w-2/4 flex flex-col items-center justify-center cursor-pointer group"
          >
            <img 
              src="https://lh3.googleusercontent.com/d/1fVvoUClB-z32WwaNeMOWVEzAYBlehdHL" 
              alt="SBL Logo" 
              className="h-10 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
            <div className="text-center mt-1">
              <h1 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight">
                DIGITAL LEARNING
              </h1>
              <h2 className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] leading-none">
                MANAGEMENT SYSTEM
              </h2>
            </div>
          </div>

          {/* Bilingual Language Switcher */}
          <div className="w-1/4 flex justify-end">
            <div className="inline-flex bg-slate-100 p-0.5 rounded-xl border border-slate-200">
              <button
                onClick={() => {
                  AppleHaptics.selection();
                  setLang('EN');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  lang === 'EN' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => {
                  AppleHaptics.selection();
                  setLang('HI');
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                  lang === 'HI' ? 'bg-blue-900 text-white shadow' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. DASHBOARD VIEW */}
      {view === 'dashboard' && (
        <div className="space-y-4">
          {/* Welcome User Hero Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#001F3F] to-[#003366] text-white shadow-xl border-b-4 border-orange-500 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 relative z-10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                  {lang === 'EN' ? 'SBL Forensic Safety Engine' : 'एसबीएल फॉरेंसिक सुरक्षा इंजन'}
                </span>
                <h2 className="text-xl sm:text-2xl font-black italic tracking-tight">
                  Welcome, <span className="text-white">{user.name}</span>
                </h2>
                <p className="text-[10px] font-bold text-slate-300 tracking-wider uppercase mt-0.5">
                  DEPARTMENT: <b className="text-white">{user.department.toUpperCase()}</b> • DESIGNATION: <b className="text-white">{user.designation.toUpperCase()}</b>
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Control Portal button for Managers/HODs */}
                {(user.isDeptHod || user.isEhsManager) && (
                  <button
                    onClick={() => {
                      AppleHaptics.click();
                      switchView('admin');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Control Portal</span>
                  </button>
                )}

                <button
                  onClick={() => handleCloudSync(true)}
                  disabled={isSyncing}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1 border border-white/20 active:scale-95"
                  title="Synchronize LMS with Cloud"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-orange-400' : ''}`} />
                  <span>{isSyncing ? 'Sync...' : 'Sync'}</span>
                </button>
              </div>
            </div>

            {/* Subtle background branding */}
            <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.06] pointer-events-none">
              <img src="https://lh3.googleusercontent.com/d/1fVvoUClB-z32WwaNeMOWVEzAYBlehdHL" alt="" className="w-48" />
            </div>
          </div>

          {/* Plant-Wide Training Health Card */}
          <div className="ios-card p-4 bg-slate-900/90 border border-slate-800">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 block">
                  {lang === 'EN' ? 'Plant-Wide Safety Training Health' : 'प्लांट-स्तरीय सुरक्षा प्रशिक्षण स्थिति'}
                </span>
                <h3 className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Digital LMS Overall Compliance</span>
                </h3>
              </div>
              <div className="text-right">
                <span className="text-3xl font-black text-emerald-400 font-mono">{overallCompliance}%</span>
                <span className="text-[9px] text-slate-400 block uppercase font-bold">Target: 100%</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-800 my-2">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000" 
                style={{ width: `${overallCompliance}%` }} 
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-400 font-bold pt-1">
              <span><b>2,858</b> {lang === 'EN' ? 'Unique Passes' : 'सत्यापित पास'}</span>
              <span><b>4,422</b> {lang === 'EN' ? 'Required Total' : 'कुल आवश्यक'}</span>
              <span className="text-emerald-400 font-mono"><b>{assignedClearedCount}/{assignedCourses.length}</b> ({assignedCourses.length > 0 ? Math.round((assignedClearedCount/assignedCourses.length)*100) : 100}%) {lang === 'EN' ? 'My Cleared' : 'मेरे उत्तीर्ण'}</span>
            </div>
          </div>

          {/* Department Safety Rankings Leaderboard */}
          <div className="ios-card p-4 bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="text-xs font-black uppercase text-white flex items-center gap-2 tracking-wider">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>{lang === 'EN' ? 'Department Safety Rankings' : 'विभागीय सुरक्षा रैंकिंग'}</span>
              </h3>
              <span className="text-[9px] font-black text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800 uppercase">
                Real-Time Integrity
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {deptStats.map((dept, idx) => {
                const isTop = idx === 0;
                return (
                  <div 
                    key={dept.name} 
                    className={`p-3 rounded-xl border transition-all ${
                      isTop 
                        ? 'bg-amber-950/20 border-amber-600/40 text-amber-100' 
                        : 'bg-slate-950 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-black uppercase truncate flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-slate-400">#{idx + 1}</span>
                        {dept.name}
                      </span>
                      <span className={`text-xs font-black font-mono ${dept.percent >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {dept.percent}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden my-1.5">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          dept.percent >= 80 ? 'bg-emerald-500' : dept.percent >= 50 ? 'bg-blue-500' : 'bg-amber-500'
                        }`} 
                        style={{ width: `${dept.percent}%` }}
                      />
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-400 font-bold mt-1">
                      <span>Champion: <b className="text-slate-200">{dept.champion}</b></span>
                      <span className="font-mono">{dept.completed}/{dept.totalNeeded}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module Filtering Tabs & Search Bar */}
          <div className="ios-card p-3 bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="flex flex-col sm:flex-row gap-2">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={lang === 'EN' ? "Search by ID (e.g. SBL-EHS-001) or Topic..." : "मॉड्यूल या विषय खोजें..."}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
                {[
                  { key: 'assigned', label: lang === 'EN' ? `My Modules (${assignedCourses.length})` : `मेरे मॉड्यूल (${assignedCourses.length})` },
                  { key: 'pending', label: lang === 'EN' ? `Pending (${assignedPendingCount})` : `लंबित (${assignedPendingCount})` },
                  { key: 'cleared', label: lang === 'EN' ? `Cleared (${assignedClearedCount})` : `उत्तीर्ण (${assignedClearedCount})` },
                  { key: 'all', label: lang === 'EN' ? `All Library (${courses.length})` : `संपूर्ण सूची (${courses.length})` }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => {
                      AppleHaptics.selection();
                      setActiveTab(tab.key as any);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase whitespace-nowrap transition-all ${
                      activeTab === tab.key
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Courses Grid Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCourses.length === 0 ? (
              <div className="col-span-full ios-card p-12 text-center text-slate-400 border border-slate-800">
                <GraduationCap className="w-12 h-12 mx-auto text-slate-600 mb-2" />
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  {lang === 'EN' ? 'No Assigned Modules Found' : 'कोई मॉड्यूल नहीं मिला'}
                </h4>
                <p className="text-[10px] text-slate-500 mt-1">Adjust search filter or switch tabs.</p>
              </div>
            ) : (
              filteredCourses.map((course) => {
                const title = lang === 'EN' ? course.titleEn : course.titleHi;
                const isCleared = course.isCleared;
                const isAssigned = course.dept !== 'UNASSIGNED' && Boolean(course.videoUrl) && (
                  course.dept.toUpperCase() === 'GLOBAL' || course.dept.toUpperCase() === user.department.toUpperCase()
                );
                const isDraft = course.dept === 'UNASSIGNED' || !course.videoUrl;

                return (
                  <div
                    key={course.id}
                    onClick={() => startTraining(course)}
                    className={`ios-card p-4 rounded-2xl cursor-pointer group transition-all relative overflow-hidden border-b-4 ${
                      isCleared 
                        ? 'bg-slate-900/90 border-b-emerald-500 hover:border-emerald-400' 
                        : isAssigned
                          ? 'bg-slate-900/90 border-b-blue-600 hover:border-blue-500'
                          : 'bg-slate-900/60 border-b-slate-700 hover:border-slate-600 opacity-80'
                    } active:scale-[0.99] hover:shadow-xl`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2 relative z-10">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-black text-blue-300 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                          {course.id}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 uppercase">
                          {isDraft ? (lang === 'EN' ? 'UNASSIGNED' : 'अनिर्धारित') : course.dept}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span className={`text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isCleared
                          ? 'bg-emerald-500 text-white border border-emerald-400 shadow-sm'
                          : isAssigned
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {isCleared 
                          ? (lang === 'EN' ? '✓ CLEARED' : '✓ उत्तीर्ण') 
                          : isAssigned 
                            ? (lang === 'EN' ? '○ PENDING' : '○ लंबित') 
                            : (lang === 'EN' ? '○ DRAFT' : '○ प्रारूप')}
                      </span>
                    </div>

                    <h3 className="text-sm font-black text-white group-hover:text-blue-300 transition-colors leading-snug relative z-10">
                      {title}
                    </h3>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] relative z-10">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Video className="w-3 h-3 text-slate-500" />
                        <span>Interactive E-Learning</span>
                      </span>

                      <span className={`font-black uppercase tracking-wider flex items-center gap-1 ${
                        isCleared ? 'text-emerald-400' : 'text-blue-400'
                      }`}>
                        <span>{isCleared ? (lang === 'EN' ? 'REVIEW MODULE →' : 'पुनरावलोकन करें →') : (lang === 'EN' ? 'START LEARNING →' : 'प्रारंभ करें →')}</span>
                      </span>
                    </div>

                    {/* Watermark Logo */}
                    <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] pointer-events-none group-hover:opacity-[0.07] transition-opacity">
                      <img src="https://lh3.googleusercontent.com/d/1fVvoUClB-z32WwaNeMOWVEzAYBlehdHL" alt="" className="w-32" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 3. TRAINING MODULE PLAYER VIEW */}
      {view === 'training' && activeCourse && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="ios-card p-4 bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <span className="font-mono text-xs font-black text-blue-400 bg-blue-950 px-2.5 py-0.5 rounded border border-blue-800">
                {activeCourse.id}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                {lang === 'EN' ? 'Interactive Video Module' : 'इंटरैक्टिव वीडियो मॉड्यूल'}
              </span>
            </div>

            {/* YouTube-like Responsive Video Experience */}
            <YouTubeLikePlayer
              videoUrl={activeCourse.videoUrl}
              title={lang === 'EN' ? activeCourse.titleEn : activeCourse.titleHi}
              titleHi={activeCourse.titleHi}
              courseId={activeCourse.id}
              dept={activeCourse.dept}
              lang={lang}
            />

            {/* Module Title */}
            <div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {lang === 'EN' ? activeCourse.titleEn : activeCourse.titleHi}
              </h2>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'EN' ? 'Department Scope: ' : 'विभागीय दायरा: '}
                <b className="text-slate-200">{activeCourse.dept}</b> • {lang === 'EN' ? 'Designation Scope: ' : 'पद दायरा: '}
                <b className="text-slate-200">{activeCourse.desig}</b>
              </p>
            </div>

            {/* Start Assessment Action */}
            <div className="pt-2">
              <button
                onClick={handleLaunchQuiz}
                className="w-full py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-orange-950 flex items-center justify-center gap-2 animate-pulse"
              >
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'EN' ? 'Start Assessment' : 'सत्यापन परीक्षा शुरू करें'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. ASSESSMENT VERIFICATION ENGINE (QUIZ VIEW) */}
      {view === 'quiz' && activeCourse && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="ios-card p-4 sm:p-6 bg-slate-900 border-l-8 border-l-orange-500 border border-slate-800 space-y-4">
            <div className="flex justify-between items-start pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
                  {lang === 'EN' ? 'Forensic Knowledge Verification' : 'फॉरेंसिक ज्ञान सत्यापन'}
                </span>
                <h2 className="text-lg font-black uppercase text-white mt-0.5">
                  {lang === 'EN' ? activeCourse.titleEn : activeCourse.titleHi}
                </h2>
              </div>
              <span className="font-mono text-xs font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                80% Pass
              </span>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {activeCourse.questions.map((q, idx) => {
                const questionText = lang === 'EN' ? q.text_en : (q.text_hi || q.text_en);
                const selected = selectedAnswers[idx];

                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
                    <p className="text-xs font-black text-slate-100 leading-snug">
                      <span className="text-orange-500 font-mono mr-1.5">{idx + 1}.</span>
                      {questionText}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChecked = selected === opt;
                        return (
                          <label
                            key={optIdx}
                            onClick={() => {
                              AppleHaptics.selection();
                              setSelectedAnswers(prev => ({ ...prev, [idx]: opt }));
                            }}
                            className={`flex items-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                              isChecked
                                ? 'bg-blue-950/60 border-blue-500 text-white shadow-sm'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q_${idx}`}
                              checked={isChecked}
                              onChange={() => {}}
                              className="w-4 h-4 accent-blue-600 shrink-0"
                            />
                            <span className="ml-2.5 text-xs font-bold">{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Feedback Input */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                {lang === 'EN' ? 'Safety Observation / Training Feedback (Optional)' : 'सुरक्षा सुझाव / फीडबैक (वैकल्पिक)'}
              </label>
              <textarea
                rows={2}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={lang === 'EN' ? "Note any shopfloor hazards or improvements..." : "प्लांट में सुरक्षा सुधार के लिए सुझाव लिखें..."}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>

            {/* Submit Forensic Record Button */}
            <button
              onClick={handleSubmitAssessment}
              disabled={isSubmittingQuiz}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 text-white font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-xl shadow-blue-950 border border-blue-500/30 flex items-center justify-center gap-2"
            >
              {isSubmittingQuiz ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
                  <span>{lang === 'EN' ? 'ARCHIVING FORENSIC RECORD...' : 'रिकॉर्ड सहेजा जा रहा है...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-orange-400" />
                  <span>{lang === 'EN' ? 'Submit Forensic Record' : 'फोरेंसिक रिकॉर्ड सबमिट करें'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 5. PASS / FAIL RESULT & CERTIFICATE MODAL */}
      {resultModal.show && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3">
          <div className="bg-white text-slate-900 w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border-t-8 border-orange-500 text-center space-y-4 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            {resultModal.status === 'PASS' ? (
              <>
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-inner">
                  <Award className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-emerald-600 uppercase italic tracking-tight">
                    PASS / उत्तीर्ण
                  </h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                    Forensic Grade: <b className="text-emerald-700 font-mono text-sm">{resultModal.score}%</b>. Safety competency confirmed.
                  </p>
                </div>

                {/* CERTIFICATE OF ACHIEVEMENT PREVIEW */}
                {resultModal.certData && (
                  <div className="p-4 rounded-2xl bg-white border-4 border-[#001F3F] relative overflow-hidden text-center shadow-lg space-y-2">
                    <div className="absolute inset-0 border-2 border-orange-500 pointer-events-none" />
                    
                    <div className="flex items-center justify-center gap-2">
                      <img 
                        src="https://lh3.googleusercontent.com/d/1fVvoUClB-z32WwaNeMOWVEzAYBlehdHL" 
                        alt="Logo" 
                        className="h-7 object-contain" 
                      />
                    </div>
                    <p className="text-[10px] font-black uppercase text-[#001F3F] tracking-widest leading-none">
                      SBL SPECIALTY COATINGS PVT. LTD.
                    </p>
                    <h3 className="text-sm font-black text-[#001F3F] uppercase tracking-tight">
                      CERTIFICATE OF ACHIEVEMENT
                    </h3>
                    
                    <p className="text-[9px] text-slate-500 uppercase font-semibold">Awarded for professional safety mastery to</p>
                    <div className="text-lg font-black text-[#001F3F] uppercase border-b-2 border-orange-500 pb-0.5 inline-block px-4">
                      {resultModal.certData.name}
                    </div>

                    <div className="flex justify-center gap-4 text-[9px] font-bold text-slate-600">
                      <span>Code: <b className="text-[#001F3F] font-mono">{resultModal.certData.code}</b></span>
                      <span>Dept: <b className="text-[#001F3F]">{resultModal.certData.department}</b></span>
                    </div>

                    <p className="text-[9px] font-black text-orange-600 uppercase mt-1">
                      {resultModal.certData.courseTitle}
                    </p>

                    <div className="pt-2 border-t border-slate-200 flex justify-between items-end text-left text-[8px] text-slate-500">
                      <div>
                        <span>ISSUED ON: <b>{resultModal.certData.dateStr}</b></span>
                        <div className="font-mono text-[#001F3F] font-bold mt-0.5 bg-orange-50 px-1 py-0.5 border border-orange-200 rounded">
                          {resultModal.certData.serial}
                        </div>
                      </div>

                      <div className="text-right">
                        <b className="text-[#001F3F] text-[9px] block">Budhi Parkash</b>
                        <span className="text-[7px] uppercase font-bold text-slate-500">HOD - ENVIRONMENT, HEALTH & SAFETY</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      AppleHaptics.success();
                      window.print();
                    }}
                    className="w-full py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Print / Save Certificate</span>
                  </button>

                  <button
                    onClick={() => {
                      setResultModal(prev => ({ ...prev, show: false }));
                      switchView('dashboard');
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto border-2 border-rose-500 shadow-inner">
                  <AlertOctagon className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-rose-600 uppercase italic tracking-tight">
                    FAIL / अनुत्तीर्ण
                  </h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                    Score: <b className="text-rose-600 font-mono text-sm">{resultModal.score}%</b>. Mandatory 80% passing threshold required.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-left leading-relaxed">
                  Please re-watch the module video carefully and retake the assessment to confirm plant safety mastery.
                </div>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={() => {
                      setResultModal(prev => ({ ...prev, show: false }));
                      setSelectedAnswers({});
                    }}
                    className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-all shadow"
                  >
                    Retry Assessment
                  </button>

                  <button
                    onClick={() => {
                      setResultModal(prev => ({ ...prev, show: false }));
                      switchView('dashboard');
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-200 font-black text-xs uppercase tracking-wider"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 6. ADMINISTRATIVE & HOD CONTROL CONSOLE */}
      {view === 'admin' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="ios-card p-4 sm:p-6 bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-orange-400" />
                <div>
                  <h3 className="text-sm font-black uppercase text-white">Management Console</h3>
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider">SBL Forensic Administration</p>
                </div>
              </div>
              <button onClick={() => switchView('dashboard')} className="text-slate-400 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PIN GATEWAY */}
            {!isAdminUnlocked ? (
              <div className="max-w-sm mx-auto text-center space-y-3 py-6">
                <div className="w-12 h-12 bg-blue-950 text-blue-400 rounded-full flex items-center justify-center mx-auto border border-blue-800">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase text-white tracking-wider">
                    Enter Management Access Key
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Authorizes Personnel Registry, HOD Requests & Module Publishing</p>
                </div>
                <input
                  type="password"
                  maxLength={4}
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  placeholder="••••"
                  autoFocus
                  className="w-full bg-slate-950 border-2 border-blue-600 rounded-xl py-2.5 text-center text-2xl font-mono tracking-[0.5em] text-white outline-none focus:border-blue-400"
                />
                <button
                  onClick={handleUnlockAdmin}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-blue-900/40 active:scale-95"
                >
                  Grant Access (PIN 1406)
                </button>
              </div>
            ) : (
              /* UNLOCKED TABS */
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-black uppercase tracking-wider">
                  <button
                    onClick={() => setAdminActiveTab('registry')}
                    className={`py-2 rounded-lg transition-all ${adminActiveTab === 'registry' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
                  >
                    Personnel Registry
                  </button>
                  <button
                    onClick={() => setAdminActiveTab('hod_request')}
                    className={`py-2 rounded-lg transition-all ${adminActiveTab === 'hod_request' ? 'bg-blue-600 text-white shadow' : 'text-slate-400'}`}
                  >
                    HOD Request
                  </button>
                  <button
                    onClick={() => setAdminActiveTab('ehs_publish')}
                    className={`py-2 rounded-lg transition-all ${adminActiveTab === 'ehs_publish' ? 'bg-orange-600 text-white shadow' : 'text-slate-400'}`}
                  >
                    EHS Architect
                  </button>
                </div>

                {/* TAB 1: PERSONNEL REGISTRY */}
                {adminActiveTab === 'registry' && (
                  <form onSubmit={handleRegisterEmployee} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-left">
                    <h4 className="text-xs font-black uppercase text-blue-400 border-l-4 border-blue-500 pl-2">
                      Add Personnel Identity
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Employee Code *</label>
                        <input
                          required
                          type="text"
                          value={newEmpCode}
                          onChange={(e) => setNewEmpCode(e.target.value)}
                          placeholder="e.g. W0342 / EMP-101"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Full Name *</label>
                        <input
                          required
                          type="text"
                          value={newEmpName}
                          onChange={(e) => setNewEmpName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Set Password</label>
                        <input
                          type="text"
                          value={newEmpPass}
                          onChange={(e) => setNewEmpPass(e.target.value)}
                          placeholder="Default: 1234"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Department</label>
                        <select
                          value={newEmpDept}
                          onChange={(e) => setNewEmpDept(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none focus:border-blue-500 font-semibold"
                        >
                          <option>Manufacturing</option>
                          <option>Product Development</option>
                          <option>Administration</option>
                          <option>Quality Control</option>
                          <option>EHS</option>
                          <option>Engineering</option>
                          <option>Customer Support</option>
                          <option>Sales & Marketing</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Designation</label>
                        <input
                          type="text"
                          value={newEmpDesig}
                          onChange={(e) => setNewEmpDesig(e.target.value)}
                          placeholder="e.g. Senior Chemist"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-wider active:scale-95 shadow"
                    >
                      Archive Personnel in Ledger
                    </button>
                  </form>
                )}

                {/* TAB 2: HOD TRAINING REQUEST */}
                {adminActiveTab === 'hod_request' && (
                  <form onSubmit={handleHodRequest} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs text-left">
                    <h4 className="text-xs font-black uppercase text-blue-400 border-l-4 border-blue-500 pl-2">
                      Department Training Need Requisition
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
                      <div>
                        <span>HOD Name:</span>
                        <b className="text-white block">{user.name}</b>
                      </div>
                      <div>
                        <span>Department:</span>
                        <b className="text-white block">{user.department}</b>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Applicable Designations *</label>
                      <input
                        required
                        type="text"
                        value={reqDesig}
                        onChange={(e) => setReqDesig(e.target.value)}
                        placeholder="e.g. All Bay Operators, QC Chemists"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Proposed Training Topic *</label>
                      <textarea
                        required
                        rows={2}
                        value={reqTitle}
                        onChange={(e) => setReqTitle(e.target.value)}
                        placeholder="Describe specific safety risk, equipment SOP, or chemical drill required..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none focus:border-blue-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black uppercase text-xs tracking-wider active:scale-95 shadow"
                    >
                      Submit Requirement to EHS
                    </button>
                  </form>
                )}

                {/* TAB 3: EHS ARCHITECT MODULE PUBLISHER */}
                {adminActiveTab === 'ehs_publish' && (
                  <div className="p-4 rounded-xl bg-slate-950 border border-orange-500/50 space-y-3 text-xs text-left">
                    <h4 className="text-xs font-black uppercase text-orange-400 border-l-4 border-orange-500 pl-2">
                      EHS Module Architect & Multi-Question Builder
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Module ID</label>
                        <input
                          type="text"
                          value={pubId}
                          onChange={(e) => setPubId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white font-mono outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Department</label>
                        <input
                          type="text"
                          value={pubTargetDept}
                          onChange={(e) => setPubTargetDept(e.target.value)}
                          placeholder="GLOBAL or Specific"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Target Designation</label>
                        <input
                          type="text"
                          value={pubTargetDesig}
                          onChange={(e) => setPubTargetDesig(e.target.value)}
                          placeholder="GLOBAL"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Title (English) *</label>
                        <input
                          required
                          type="text"
                          value={pubTitleEn}
                          onChange={(e) => setPubTitleEn(e.target.value)}
                          placeholder="e.g. Compressed Gas Cylinder Safety"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Title (Hindi) *</label>
                        <input
                          type="text"
                          value={pubTitleHi}
                          onChange={(e) => setPubTitleHi(e.target.value)}
                          placeholder="e.g. संपीड़ित गैस सिलेंडर सुरक्षा"
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Google Drive Video Link</label>
                      <input
                        type="text"
                        value={pubVideoUrl}
                        onChange={(e) => setPubVideoUrl(e.target.value)}
                        placeholder="https://drive.google.com/file/d/.../view"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2 text-white outline-none font-mono text-[11px]"
                      />
                    </div>

                    {/* Question Suite */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase text-orange-400 block">Add Assessment Question</span>
                      <input
                        type="text"
                        value={qEn}
                        onChange={(e) => setQEn(e.target.value)}
                        placeholder="Question in English?..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none"
                      />
                      <input
                        type="text"
                        value={qHi}
                        onChange={(e) => setQHi(e.target.value)}
                        placeholder="हिन्दी में प्रश्न?..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={qOpt}
                          onChange={(e) => setQOpt(e.target.value)}
                          placeholder="Options: Yes (हाँ), No (नहीं)"
                          className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px] text-white outline-none"
                        />
                        <input
                          type="text"
                          value={qAns}
                          onChange={(e) => setQAns(e.target.value)}
                          placeholder="Correct Answer: Yes (हाँ)"
                          className="bg-slate-950 border border-orange-500 rounded-lg p-2 text-[11px] text-orange-400 font-bold outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddQuestionToQueue}
                        className="w-full py-1.5 rounded-lg bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider"
                      >
                        + Add Question to Queue ({tempQuestions.length} in queue)
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handlePublishModule}
                      className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black uppercase text-xs tracking-wider shadow-lg shadow-orange-950 active:scale-95"
                    >
                      Authorize & Publish Module into SBL Catalog
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. WORLD-CLASS FOOTER WITH DEVELOPER ATTRIBUTION */}
      <footer className="pt-6 pb-2 text-center border-t border-slate-800/60 space-y-1">
        <div className="flex items-center justify-center gap-2">
          <img
            src="https://lh3.googleusercontent.com/d/1fVvoUClB-z32WwaNeMOWVEzAYBlehdHL"
            alt="Logo"
            className="h-5 opacity-40 grayscale"
          />
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
            SBL Specialty Coatings Pvt. Ltd.
          </span>
        </div>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
          Forensic Safety Ecosystem • 2026
        </p>
        <div className="flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-wider text-slate-300">
          <span className="text-slate-500 font-normal">Developed by</span>
          <span className="text-blue-400 italic">Budhi Parkash</span>
        </div>
      </footer>
    </div>
  );
};
