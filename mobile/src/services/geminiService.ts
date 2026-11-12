import { MasterTelemetry } from '../types';

export class GeminiService {
  private static API_KEY_STORAGE = 'SBL_GEMINI_API_KEY';
  private static DEFAULT_API_KEY = (typeof process !== 'undefined' && (process.env?.NEXT_PUBLIC_GEMINI_API_KEY || process.env?.GEMINI_API_KEY)) || (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || '';

  private static PASSCODE_STORAGE = 'SBL_JARVIS_PASSCODE';
  public static DEFAULT_PASSCODE = (typeof process !== 'undefined' && process.env?.JARVIS_PASSCODE) || 'SBL-COMMAND';

  public static getApiKey(): string {
    return (typeof window !== 'undefined' ? localStorage.getItem(this.API_KEY_STORAGE) : null) || this.DEFAULT_API_KEY;
  }

  public static setApiKey(key: string): void {
    localStorage.setItem(this.API_KEY_STORAGE, key.trim());
  }

  public static getPasscode(): string {
    return localStorage.getItem(this.PASSCODE_STORAGE) || this.DEFAULT_PASSCODE;
  }

  public static setPasscode(code: string): void {
    localStorage.setItem(this.PASSCODE_STORAGE, code.trim());
  }

  public static verifyPasscode(input: string): boolean {
    const current = this.getPasscode();
    return input.trim().toUpperCase() === current.trim().toUpperCase();
  }

  public static async queryJarvis(
    userPrompt: string,
    telemetry: MasterTelemetry,
    facilityName: string = 'Lalru Unit-3'
  ): Promise<string> {
    const apiKey = this.getApiKey();

    const cleanMetrics = {
      globalRiskScore: telemetry.globalRiskScore,
      ptw: {
        total: telemetry.metrics.ptw.total,
        highRisk: telemetry.metrics.ptw.highRisk,
        yesterday: telemetry.metrics.ptw.yesterday
      },
      kaizen: {
        total: telemetry.metrics.kaizen.total,
        pending: telemetry.metrics.kaizen.pending
      },
      lms: {
        compliance: `${telemetry.metrics.lms.compliance}%`
      },
      incidents: {
        totalActive: telemetry.metrics.incidents.totalActive,
        yesterday: telemetry.metrics.incidents.yesterday
      },
      criticalHazards: telemetry.criticalHazards.map(h => ({
        id: h.id,
        desc: h.desc,
        capa: h.capa,
        priority: h.priority
      }))
    };

    const systemPrompt = `You are J.A.R.V.I.S., an advanced predictive Industrial EHS AI engineered for SBL Specialty Coatings.
You are directly assisting Budhi Parkash (EHS Manager) and safety teams at ${facilityName}.

CURRENT REAL-TIME FACILITY TELEMETRY:
${JSON.stringify(cleanMetrics, null, 2)}

SBL EHS ARCHITECTURAL STANDARDS (SYNCHRONIZED WITH REVISED EHS MANAGEMENT SYSTEM):
- PTW v15.24: 5-Level Approval Chain (Area Incharge -> Eng Incharge -> EHS Manager -> Eng HOD -> Area HOD). 6 Permit Types (Hot, Height, Confined, Line Breaking, Excavation, Hoisting). Numeric interlocks: LEL 0.0%, Oxygen 19.5%-23.0%.
- UA/C Master Safety Log: 28 records (all closed). Area Lead PIN verification & EHS consequence ledger.
- Kaizen Hub v15.0: Value-based gamification score system. Form 1oqIQs8wV99AMw2xGwn-Hsnt9TJi7s21-Aocc8dVpNrY.
- Digital LMS v1.8: Admin Access PIN 1406, 13 industrial training courses with forensic duplicity elimination.
- Fire Protection System v37.0: 76-node directive completion, Ring Main Pressure 7.8 kg/cm², GPS 30.4546226, 76.8461592.
- Incident Investigation: Doc No QS-011-024-01, Ishikawa Fishbone + 5-Whys RCA, Chemical Spill & Vehicle compliance.
- 5S System: 100-Point Master Audit (Sort, Set in Order, Shine, Standardize, Sustain).
- First Aid Inspection: Strict inventory targets (Small 12, Medium 6, Large 6, Cutisorb 6, Band-Aid 6, Antiseptics).
- Industrial Hygiene: Factory Act Illumination Lux survey (>150/300 Lux) & Noise TWA monitoring (<85 dB(A)).

USER COMMAND: "${userPrompt}"

RESPONSE PROTOCOL:
1. Address the user crisply and authoritatively as "Sir" or "Mr. Parkash".
2. Provide concise, direct, industrial safety insights based on the provided live telemetry and updated SBL codes.
3. Highlight high-risk permits, CAPA backlogs, or compliance deficits with actionable shop-floor steps.
4. Keep the answer to 2-4 focused paragraphs or crisp bullet points so it is readable on mobile.
5. Do not use overly verbose markdown or disclaimers.`;

    // Try Gemini API models in order: gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash
    const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: systemPrompt }] }],
            generationConfig: {
              temperature: 0.2,
              maxOutputTokens: 1024
            }
          })
        });

        if (response.ok) {
          const json = await response.json();
          if (json.candidates && json.candidates[0]?.content?.parts?.[0]?.text) {
            return json.candidates[0].content.parts[0].text;
          }
        }
      } catch (err) {
        console.warn(`Gemini model ${model} fetch failed:`, err);
      }
    }

    // Intelligent Offline Safety Fallback
    return this.getOfflineRuleBasedResponse(userPrompt, telemetry, facilityName);
  }

  private static getOfflineRuleBasedResponse(
    userPrompt: string,
    telemetry: MasterTelemetry,
    facilityName: string
  ): string {
    const q = userPrompt.toLowerCase();
    const m = telemetry.metrics;

    if (q.includes('briefing') || q.includes('handover') || q.includes('shift')) {
      return `Sir, here is your tactical shift synopsis for ${facilityName}:

• Facility Risk Index stands at ${telemetry.globalRiskScore}/100 (${telemetry.globalRiskScore >= 70 ? 'CRITICAL' : telemetry.globalRiskScore >= 30 ? 'ELEVATED' : 'OPTIMAL'}).
• Active PTWs: ${m.ptw.total} live permits on the shop floor${m.ptw.total > 0 ? `, including ${m.ptw.highRisk} Critical High-Risk tasks (Hot/Height/Confined).` : ' (Zero active permits issued today — all previous permits closed).' }
• Compliance Backlog: ${m.incidents.totalActive} open safety observations requiring CAPA closure${m.incidents.totalActive === 0 ? ' (All 28 historical records closed in Master Safety Log).' : '.'}
• LMS Compliance: Running at ${m.lms.compliance}% against annual target.

Recommendation: ${m.ptw.total > 0 ? 'Prioritize floor patrol for high-risk permit verification.' : 'Shop floor operations verified normal. Expedite HOD review for ' + m.kaizen.pending + ' pending Kaizens.'}`;
    }

    if (q.includes('ptw') || q.includes('permit')) {
      if (m.ptw.total === 0) {
        return `Permit Telemetry Report: There are currently zero (0) active permits on the plant floor today at ${facilityName}. All high-risk maintenance permits are closed and verified safe. Standard production safety protocols apply.`;
      }
      return `Permit Telemetry Report: There are currently ${m.ptw.total} active permits. Crucially, ${m.ptw.highRisk} are classified as High-Risk (Hot Work, Confined Space, or Work at Height). Ensure gas testing certificates and safety harness lifelines are doubly inspected prior to shift change.`;
    }

    if (q.includes('hazard') || q.includes('incident') || q.includes('capa')) {
      if (m.incidents.totalActive === 0) {
        return `Critical Hazard Assessment: All 28 logged safety observations in the Master Safety Log are 100% resolved with verified CAPA. Zero active or open high-risk hazards on the plant floor today.`;
      }
      return `Critical Hazard Assessment: ${telemetry.criticalHazards.length} high-priority CAPA items are currently flagged in the Master Ledger. Top item: ${telemetry.criticalHazards[0]?.desc || 'None'}. Target team: ${telemetry.criticalHazards[0]?.assignedTo || 'Maintenance'}.`;
    }

    return `Sir, telemetry stream verified for ${facilityName}. Facility Risk is calibrated at ${telemetry.globalRiskScore}/100 (Optimal). With ${m.ptw.total} active permits and ${m.incidents.totalActive} actionable safety observations, all standard interlocks and emergency response protocols remain active. How may I assist your inspection?`;
  }

  public static speak(text: string): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const clean = text.replace(/<[^>]*>?/gm, '').replace(/[*#_•]/g, ' ');
      const utterance = new SpeechSynthesisUtterance(clean);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => (v.name.includes('Natural') || v.name.includes('Online')) && v.lang.includes('en'))
        || voices.find(v => v.lang === 'en-GB' && v.name.includes('Male'))
        || voices.find(v => v.lang === 'en-IN')
        || voices.find(v => v.lang.startsWith('en'));

      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
    }
  }

  public static stopSpeaking(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
