import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Cpu, 
  User, 
  RotateCcw,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import { MasterTelemetry, ChatMessage } from '../types';
import { GeminiService } from '../services/geminiService';

interface JarvisViewProps {
  telemetry: MasterTelemetry;
  facility: string;
  onOpenShiftBriefing: () => void;
}

export const JarvisView: React.FC<JarvisViewProps> = ({
  telemetry,
  facility,
  onOpenShiftBriefing
}) => {
  // Password Protection State
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('SBL_JARVIS_UNLOCKED') === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  // Chat & Speech State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'JARVIS',
      text: `Online and synchronized with ${facility} telemetry. Facility Risk Index is calibrated at ${telemetry.globalRiskScore}/100. How may I assist your EHS shift inspection, Sir?`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isUnlocked) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isUnlocked]);

  useEffect(() => {
    if (!isUnlocked) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-IN';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSendMessage(transcript);
        }
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
    return () => {
      GeminiService.stopSpeaking();
    };
  }, [telemetry, isUnlocked]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthorizing(true);

    setTimeout(() => {
      if (GeminiService.verifyPasscode(passcodeInput)) {
        setIsUnlocked(true);
        sessionStorage.setItem('SBL_JARVIS_UNLOCKED', 'true');
        setPasscodeInput('');
        setIsAuthorizing(false);
        // Play vocal unlock greeting matching original Index.html specification
        GeminiService.speak("Security protocols bypassed. I am online and monitoring the facility.");
      } else {
        setAuthError("Clearance denied. Access attempt logged.");
        setIsAuthorizing(false);
      }
    }, 400);
  };

  const handleLock = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('SBL_JARVIS_UNLOCKED');
    GeminiService.stopSpeaking();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputVal.trim();
    if (!query || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      text: query,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const response = await GeminiService.queryJarvis(query, telemetry, facility);
      const jarvisMsg: ChatMessage = {
        id: `jarvis-${Date.now()}`,
        sender: 'JARVIS',
        text: response,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, jarvisMsg]);

      if (voiceEnabled) {
        GeminiService.speak(response);
      }
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'JARVIS',
        text: 'Sir, an anomaly occurred while querying the neural cortex. Telemetry streams remain locally secure.',
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const promptPills = [
    { label: 'Generate Shift Handover', action: onOpenShiftBriefing },
    { label: 'High-Risk Permits Check', query: 'List all active high-risk permits and safety checks needed today.' },
    { label: 'Top Critical Hazards', query: 'What are the top critical hazards in the Master Ledger?' },
    { label: 'LMS Compliance Gaps', query: 'Show me departments lagging behind in digital LMS training.' }
  ];

  // ==========================================
  // VIEW 1: LOCKED SECURITY CLEARANCE GATE
  // ==========================================
  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-190px)] px-2 py-4">
        <div className="mobile-card rounded-3xl p-6 w-full max-w-sm text-center border-cyan-500/30 relative overflow-hidden shadow-2xl">
          {/* Subtle Ambient Laser Glow */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

          {/* 3D Arc Reactor / Obsidian Nucleus with Lock Graphic */}
          <div className="my-3 flex justify-center">
            <div className="relative w-20 h-20 rounded-full bg-slate-950 border-2 border-cyan-400/70 shadow-[0_0_25px_rgba(56,189,248,0.5)] flex items-center justify-center">
              {/* Outer Orbit */}
              <div className="absolute inset-1 rounded-full border border-dashed border-cyan-300/40 animate-spin-slow" />
              {/* Center Lock Core */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-700 flex items-center justify-center shadow-inner">
                <Lock className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Gate Typography */}
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-100 mt-2">
            Director Clearance Required
          </h2>
          <p className="text-[10px] text-cyan-400 font-mono tracking-wider mt-0.5 uppercase">
            SBL Secure Cortex Override
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Enter your authorized Director Clearance Code to unlock the J.A.R.V.I.S. neural telemetry pipeline.
          </p>

          {/* Clearance Form */}
          <form onSubmit={handleUnlock} className="mt-5 space-y-3.5 text-left">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-1.5 ml-1">
                Clearance Code
              </label>
              <div className="relative flex items-center">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                <input
                  type={showPasscode ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passcodeInput}
                  onChange={(e) => {
                    setPasscodeInput(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  placeholder="Enter Passcode..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white font-mono uppercase tracking-wider outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  className="absolute right-3 text-slate-500 hover:text-slate-300"
                >
                  {showPasscode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {authError && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2 animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span className="font-bold text-[11px]">{authError}</span>
              </div>
            )}

            {/* Unlock Button */}
            <button
              type="submit"
              disabled={!passcodeInput.trim() || isAuthorizing}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-sky-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-900/40 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {isAuthorizing ? (
                <>
                  <Cpu className="w-4 h-4 animate-spin-slow" />
                  <span>Verifying Protocols...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Authorize & Unlock</span>
                </>
              )}
            </button>

            {/* Quick Demo Hint */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setPasscodeInput('SBL-COMMAND');
                  setAuthError(null);
                }}
                className="text-[10px] text-slate-500 hover:text-cyan-400 font-mono transition-colors"
              >
                Default Clearance: <span className="underline font-bold text-slate-400 hover:text-cyan-300">SBL-COMMAND</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: UNLOCKED J.A.R.V.I.S. CORTEX
  // ==========================================
  return (
    <div className="flex flex-col h-[calc(100vh-175px)] pb-12">
      {/* J.A.R.V.I.S. 3D Atomic Core Header */}
      <div className="mobile-card rounded-2xl p-3.5 mb-3 flex items-center justify-between border-cyan-500/30">
        <div className="flex items-center gap-3">
          {/* 3D Core Mini */}
          <div className="w-10 h-10 rounded-full bg-slate-950 border border-cyan-400/60 shadow-[0_0_15px_rgba(56,189,248,0.4)] flex items-center justify-center relative">
            <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div className="absolute inset-0 rounded-full border border-cyan-300/20 animate-spin-slow" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-100">
                J.A.R.V.I.S. Cortex
              </h2>
              <span className="text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                UNLOCKED
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Gemini EHS Predictive Engine</p>
          </div>
        </div>

        {/* Action Controls: Audio Toggle, Clear, and Re-Lock */}
        <div className="flex items-center gap-1.5">
          {/* Audio Output Toggle */}
          <button
            onClick={() => {
              if (voiceEnabled) GeminiService.stopSpeaking();
              setVoiceEnabled(!voiceEnabled);
            }}
            className={`p-2 rounded-xl border transition-all ${
              voiceEnabled 
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title="Toggle Voice Output"
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset Chat */}
          <button
            onClick={() => setMessages([messages[0]])}
            className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200"
            title="Reset Chat Stream"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Lock J.A.R.V.I.S. */}
          <button
            onClick={handleLock}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 active:scale-95 transition-all"
            title="Lock J.A.R.V.I.S. Cortex"
          >
            <Lock className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
        {promptPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (pill.action) pill.action();
              else if (pill.query) handleSendMessage(pill.query);
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-750 border border-slate-700/60 text-slate-300 text-[11px] font-medium whitespace-nowrap active:scale-95 transition-all shadow-sm"
          >
            <Sparkles className="w-3 h-3 text-cyan-400 flex-shrink-0" />
            <span>{pill.label}</span>
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'USER';
          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'flex-row-reverse text-right' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                isUser 
                  ? 'bg-blue-600/30 border-blue-500/40 text-blue-300' 
                  : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
              }`}>
                {isUser ? <User className="w-4 h-4" /> : <Cpu className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[82%] rounded-2xl p-3 text-xs leading-relaxed shadow-md ${
                isUser
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'mobile-card border-slate-700/80 text-slate-200 rounded-tl-none whitespace-pre-line'
              }`}>
                <p>{msg.text}</p>
                <span className={`block text-[9px] mt-1 font-mono ${
                  isUser ? 'text-blue-200' : 'text-slate-500'
                }`}>
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Cpu className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="mobile-card rounded-2xl rounded-tl-none p-3 text-xs text-cyan-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Analyzing live telemetry matrix...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-2xl p-1.5 shadow-lg"
        >
          {/* Voice input button */}
          <button
            type="button"
            onClick={toggleMic}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/50'
                : 'bg-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-750'
            }`}
            title="Tap for voice input"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={isListening ? "Listening... Speak now..." : "Ask J.A.R.V.I.S. anything..."}
            className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-none px-2"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputVal.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
