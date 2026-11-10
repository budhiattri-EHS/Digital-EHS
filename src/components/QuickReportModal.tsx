import React, { useState } from 'react';
import { 
  X, 
  Camera, 
  ShieldAlert, 
  CheckCircle2, 
  ExternalLink, 
  Send, 
  User, 
  Building2, 
  Sparkles,
  RefreshCw,
  Globe
} from 'lucide-react';
import { 
  SBL_SAFETY_ALERT_FORM_URL, 
  SBL_DEPARTMENTS, 
  LogHazardPayload 
} from '../services/dataService';
import { AppleHaptics } from '../services/appleHaptics';

interface QuickReportModalProps {
  onClose: () => void;
  onSubmit: (payload: LogHazardPayload) => void;
  defaultObserver?: string;
}

export const QuickReportModal: React.FC<QuickReportModalProps> = ({ 
  onClose, 
  onSubmit,
  defaultObserver = 'Budhi Parkash (EHS)'
}) => {
  // Default to Fast Offline Mode as requested
  const [activeTab, setActiveTab] = useState<'google-form' | 'offline-form'>('offline-form');
  const [iframeKey, setIframeKey] = useState<number>(1);
  const [isIframeLoading, setIsIframeLoading] = useState<boolean>(true);

  // Offline / Fast Form Fields (Exact 9 Bilingual Questions)
  const [observerInfo, setObserverInfo] = useState(defaultObserver);
  const [observationType, setObservationType] = useState<string>('Unsafe Condition (UC) / असुरक्षित स्थिति');

  const now = new Date();
  const defaultDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const [dateTime, setDateTime] = useState<string>(defaultDateTime);
  const [location, setLocation] = useState<string>('');
  const [potentialSeverity, setPotentialSeverity] = useState<string>('Medium / मध्यम');
  const [hazardDescription, setHazardDescription] = useState<string>('');
  const [immediateAction, setImmediateAction] = useState<string>('');
  const [observerSuggestion, setObserverSuggestion] = useState<string>('');
  const [concernedDepartment, setConcernedDepartment] = useState<string>('Maintenance');
  const [photoName, setPhotoName] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [photoType, setPhotoType] = useState<string>('image/jpeg');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null);

  const observationTypes = [
    { label: 'Unsafe Act (UA) / असुरक्षित कार्य', color: 'border-orange-500/50 bg-orange-500/10 text-orange-400' },
    { label: 'Unsafe Condition (UC) / असुरक्षित स्थिति', color: 'border-amber-500/50 bg-amber-500/10 text-amber-400' },
    { label: 'Near Miss (NM) / नज़दीकी चूक', color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' }
  ];

  const severityLevels = [
    { label: 'High / उच्च', color: 'border-red-500 bg-red-600 text-white' },
    { label: 'Medium / मध्यम', color: 'border-amber-500 bg-amber-600 text-white' },
    { label: 'Low / कम', color: 'border-blue-500 bg-blue-600 text-white' }
  ];

  const handleOfflineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hazardDescription.trim() || !immediateAction.trim() || !location.trim()) {
      alert('Please fill all required fields (*) before submitting.');
      return;
    }

    setIsSubmitting(true);
    AppleHaptics.success();

    const payload: LogHazardPayload = {
      observerInfo: observerInfo.trim() || 'Anonymous Observer',
      observationType,
      dateTime,
      location: location.trim(),
      potentialSeverity,
      hazardDescription: hazardDescription.trim(),
      immediateAction: immediateAction.trim(),
      observerSuggestion: observerSuggestion.trim() || 'N/A',
      concernedDepartment,
      attachmentLink: photoName ? `Photo: ${photoName}` : 'N/A',
      photoBase64: photoBase64 || undefined,
      photoName: photoName || undefined,
      photoType: photoType || 'image/jpeg'
    };

    onSubmit(payload);

    const generatedId = `SA/2026/${Math.floor(556 + Math.random() * 50)}`;
    setSubmittedReportId(generatedId);
    setIsSubmitting(false);
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoName(file.name);
      setPhotoType(file.type || 'image/jpeg');
      setIsProcessingPhoto(true);
      AppleHaptics.light();

      const reader = new FileReader();
      reader.onload = (event) => {
        const rawResult = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 1280;
          let w = img.width;
          let h = img.height;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
            setPhotoPreview(compressedDataUrl);
            setPhotoBase64(compressedDataUrl.split(',')[1]);
          } else {
            setPhotoPreview(rawResult);
            setPhotoBase64(rawResult.split(',')[1]);
          }
          setIsProcessingPhoto(false);
        };
        img.onerror = () => {
          setPhotoPreview(rawResult);
          setPhotoBase64(rawResult.split(',')[1]);
          setIsProcessingPhoto(false);
        };
        img.src = rawResult;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setPhotoName(null);
    setPhotoBase64(null);
    setPhotoPreview(null);
    setIsProcessingPhoto(false);
  };

  const handleReloadIframe = () => {
    setIsIframeLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl animate-fade-in">
        
        {/* MODAL HEADER */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/90">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">
                    Safety Alert Form
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    सेफ्टी अलर्ट फ़ॉर्म
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Shop-Floor Incident & Near-Miss Official Capture
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {activeTab === 'google-form' && (
                <a
                  href={SBL_SAFETY_ALERT_FORM_URL}
                  target="_blank"
                  rel="noreferrer"
                  title="Open Form in Fullscreen"
                  className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
              <button 
                onClick={onClose} 
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Mode Selector: Fast Offline Mode (Default) vs Live Google Form */}
          <div className="grid grid-cols-2 gap-2 mt-3 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => { AppleHaptics.selection(); setActiveTab('offline-form'); }}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'offline-form' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Fast Offline Mode</span>
            </button>

            <button
              type="button"
              onClick={() => { AppleHaptics.selection(); setActiveTab('google-form'); }}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'google-form' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Safety Form (Direct Sync)</span>
            </button>
          </div>
        </div>

        {/* TAB 1: LIVE OFFICIAL GOOGLE FORM (DIRECT REAL-TIME SUBMISSION) */}
        {activeTab === 'google-form' && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 p-2 sm:p-3 relative">
            <div className="flex items-center justify-between pb-2 px-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Connected to Safety Alert System
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReloadIframe}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-[10px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload</span>
                </button>
                <a
                  href={SBL_SAFETY_ALERT_FORM_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-0.5 text-[10px] font-bold"
                >
                  <span>Fullscreen</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Embedded Responsive Form Frame */}
            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 bg-white shadow-inner relative min-h-[500px]">
              {isIframeLoading && (
                <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center gap-3 z-10 text-center p-4">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-slate-300 font-medium">Loading Safety Alert Form...</span>
                  <span className="text-[10px] text-slate-500">सेफ्टी अलर्ट फ़ॉर्म लोड हो रहा है...</span>
                </div>
              )}
              <iframe
                key={iframeKey}
                src={`${SBL_SAFETY_ALERT_FORM_URL}?embedded=true`}
                width="100%"
                height="100%"
                frameBorder="0"
                marginHeight={0}
                marginWidth={0}
                title="SBL Safety Alert Form"
                onLoad={() => setIsIframeLoading(false)}
                className="w-full h-full"
              >
                Loading Safety Alert Form...
              </iframe>
            </div>
          </div>
        )}

        {/* TAB 2: FAST OFFLINE FORM (EXACT 9 QUESTIONS) */}
        {activeTab === 'offline-form' && (
          submittedReportId ? (
            <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4 overflow-y-auto">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                  Observation Logged Successfully
                </span>
                <h3 className="text-lg font-bold text-white">Safety Report Recorded</h3>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Status: Open for Investigation
                </span>
              </div>

              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-left w-full space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold text-slate-200">{observationType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Department:</span>
                  <span className="font-semibold text-slate-200">{concernedDepartment}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-1.5">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-semibold text-slate-200">{location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Severity:</span>
                  <span className="font-semibold text-red-400">{potentialSeverity}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs"
              >
                Close & Return
              </button>
            </div>
          ) : (
            <form onSubmit={handleOfflineSubmit} className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                <p className="text-slate-300 font-medium">
                  Please report any Unsafe Acts (UA), Unsafe Conditions (UC), or Near Misses (NM) observed.
                </p>
                <p className="text-slate-400 mt-0.5">
                  कृपया किसी भी असुरक्षित कार्य (UA), असुरक्षित स्थिति (UC), या नज़दीकी चूक (NM) की रिपोर्ट करें।
                </p>
              </div>

              {/* 1. Observer Name / Email */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Observer Name / Email (Optional) / <span className="text-slate-400 font-normal">रिपोर्टकर्ता का नाम / ईमेल (वैकल्पिक)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={observerInfo}
                    onChange={(e) => setObserverInfo(e.target.value)}
                    placeholder="e.g. Budhi Parkash / b.parkash@sblcoatings.com"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
                  />
                  <User className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                </div>
              </div>

              {/* 2. Observation Type */}
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1.5">
                  A. Observation Type / <span className="text-slate-400 font-normal">अवलोकन प्रकार (UA/UC/NM)</span> <span className="text-red-400">*</span>
                </label>
                <div className="space-y-1.5">
                  {observationTypes.map((t) => {
                    const isSelected = observationType === t.label;
                    return (
                      <div
                        key={t.label}
                        onClick={() => {
                          AppleHaptics.selection();
                          setObservationType(t.label);
                        }}
                        className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? `${t.color} border-2 shadow-sm font-bold` 
                            : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-xs">{t.label}</span>
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-current bg-current/20' : 'border-slate-600'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-current" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Date and Time */}
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1">
                  B. Date and Time / <span className="text-slate-400 font-normal">दिनांक और समय</span> <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  required
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-blue-500 font-mono"
                />
              </div>

              {/* 4. Location */}
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1">
                  C. Location (Detailed) / <span className="text-slate-400 font-normal">स्थान (विवरण सहित)</span> <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Enter specific location / स्थान दर्ज करें (e.g. Grinding Bay, Floor 2)..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500"
                />
              </div>

              {/* 5. Severity */}
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1.5">
                  E. Potential Severity / <span className="text-slate-400 font-normal">संभावित गंभीरता</span> <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {severityLevels.map((sev) => {
                    const isSelected = potentialSeverity === sev.label;
                    return (
                      <button
                        type="button"
                        key={sev.label}
                        onClick={() => {
                          AppleHaptics.selection();
                          setPotentialSeverity(sev.label);
                        }}
                        className={`py-2 px-2 rounded-xl text-center font-bold text-xs transition-all border ${
                          isSelected 
                            ? `${sev.color} shadow-md` 
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {sev.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 6. Hazard Description */}
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1">
                  F. Observed Hazard/Condition / <span className="text-slate-400 font-normal">देखी गई ख़तरा/स्थिति</span> <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={hazardDescription}
                  onChange={(e) => setHazardDescription(e.target.value)}
                  placeholder="देखी गई ख़तरा/स्थिति का विस्तृत विवरण दर्ज करें..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* 7. Immediate Action */}
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1">
                  G. Immediate Action Taken / <span className="text-slate-400 font-normal">तत्काल की गई कार्रवाई</span> <span className="text-red-400">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  value={immediateAction}
                  onChange={(e) => setImmediateAction(e.target.value)}
                  placeholder="तत्काल की गई कार्रवाई का विवरण दर्ज करें..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* 8. Suggestion */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  H. Observer Suggestion (Continual Improvement) / <span className="text-slate-400 font-normal">रिपोर्टकर्ता का सुझाव (सतत सुधार)</span>
                </label>
                <textarea
                  rows={2}
                  value={observerSuggestion}
                  onChange={(e) => setObserverSuggestion(e.target.value)}
                  placeholder="सतत सुधार के लिए कोई सुझाव (वैकल्पिक)..."
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* 9. Department */}
              <div>
                <label className="text-[11px] font-bold text-slate-200 block mb-1">
                  Concerned Department Manager for Action / <span className="text-slate-400 font-normal">कार्रवाई के लिए संबंधित विभाग प्रबंधक</span> <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={concernedDepartment}
                    onChange={(e) => setConcernedDepartment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-blue-500 font-medium"
                  >
                    {SBL_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <Building2 className="w-4 h-4 text-slate-500 absolute right-8 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Photo Evidence */}
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  Attachment / Photo Evidence / <span className="text-slate-400 font-normal">फ़ोटो या प्रमाण संलग्न करें</span>
                </label>

                {photoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 p-2 flex items-center gap-3">
                    <img src={photoPreview} alt="Preview" className="w-14 h-14 object-cover rounded-xl border border-slate-700" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-bold text-slate-200 block truncate">{photoName}</span>
                      <span className="text-[10px] text-emerald-400 block">✓ Ready for Google Drive upload</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearPhoto}
                      className="p-1.5 rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="Remove photo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-700 hover:border-blue-500 bg-slate-950/60 cursor-pointer text-slate-400 hover:text-slate-200 transition-colors">
                    {isProcessingPhoto ? (
                      <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 text-blue-400" />
                    )}
                    <span className="text-xs font-medium">
                      {isProcessingPhoto ? 'Compressing photo...' : 'Take photo or choose from device'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoCapture}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Submit */}
              <div className="pt-2 sticky bottom-0 bg-slate-900 pb-1">
                <button
                  type="submit"
                  disabled={isSubmitting || isProcessingPhoto}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-red-950/60 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessingPhoto ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Optimizing Photo...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit Safety Observation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )
        )}
      </div>
    </div>
  );
};
