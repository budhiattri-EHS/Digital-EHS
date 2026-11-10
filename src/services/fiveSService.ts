// SBL 100-Point 5S Service
// Master Management, Scoring Calculations, and ISO Report Generator

import {
  FiveSAuditRecord,
  FiveSLeague,
  FiveSSite,
  FIVE_S_PILLARS,
  INITIAL_5S_AUDITS,
  SBL_5S_TARGET_PERCENT
} from '../data/fiveSData';

const CACHE_KEY = 'SBL_5S_AUDITS_CACHE_V2';
const SPREADSHEET_ID = '1pNU_f1f0wkousU681jM0RMc3_5nhccIv4JsPPCeNWKU';
const SHEET_GID = '615973331';
const WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyWBn_xWkr_RvwpgvYbon6aeEnv6dvj_fpIqXAyumZ93w4DzkZ8S3XqkO4P6d1XjPQ/exec';

export interface ScoreCalculationResult {
  earned: number;
  maxApplicable: number;
  totalPercentage: number;
  isCompliant: boolean; // >= 85% SBL Standard Target
  pillarScores: {
    sort: number;     // 0-20
    set: number;      // 0-20
    shine: number;    // 0-20
    standard: number; // 0-20
    sustain: number;  // 0-20
  };
  pillarPercentages: {
    sort: number;
    set: number;
    shine: number;
    standard: number;
    sustain: number;
  };
}

export interface LeagueStanding {
  rank: number;
  department: string;
  league: FiveSLeague;
  latestScore: number;
  auditor: string;
  auditDate: string;
  status: 'Gold Champion' | 'Silver Leader' | 'Bronze Leader' | 'Target Compliant' | 'Improvement Needed';
}

class FiveSService {
  private audits: FiveSAuditRecord[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(CACHE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.audits = parsed;
          return;
        }
      }
    } catch (e) {
      console.warn('5S cache read error, using baseline:', e);
    }
    this.audits = [...INITIAL_5S_AUDITS];
    this.saveToStorage();
  }

  private saveToStorage() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.audits));
    } catch (e) {
      console.warn('5S cache write error:', e);
    }
  }

  public getAudits(): FiveSAuditRecord[] {
    return [...this.audits];
  }

  public reloadAuthenticRecords(): FiveSAuditRecord[] {
    this.audits = [...INITIAL_5S_AUDITS];
    this.saveToStorage();
    return [...this.audits];
  }

  public async syncWithGoogleSheet(): Promise<{ success: boolean; count: number; message: string }> {
    try {
      const gvizUrl = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&gid=${SHEET_GID}`;
      const resp = await fetch(gvizUrl);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const text = await resp.text();
      const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]+)\);/);
      if (!match) {
        throw new Error('Invalid GViz response format');
      }
      const data = JSON.parse(match[1]);
      if (data.status === 'error') {
        throw new Error(data.errors?.[0]?.message || 'Google Sheet query error');
      }
      const rows = data.table?.rows || [];
      if (rows.length === 0) {
        return { success: true, count: this.audits.length, message: 'Google Sheet active. No new rows.' };
      }

      const parsedAudits: FiveSAuditRecord[] = [];
      const normalizeVal = (v: any) => {
        if (typeof v !== 'number') v = parseFloat(v) || 0;
        if (v <= 1.0 && v > 0) return Math.round(v * 20 * 10) / 10;
        return Math.round(v * 10) / 10;
      };

      for (let i = 0; i < rows.length; i++) {
        const c = rows[i].c;
        if (!c || c.length < 3) continue;
        const ts = c[0]?.f || c[0]?.v || '';
        const league: FiveSLeague = String(c[1]?.v || '').includes('Labs') ? 'Labs League' : 'Operations League';
        const dept = String(c[2]?.v || '').trim();
        if (!dept) continue;

        const sort = normalizeVal(c[3]?.v);
        const set = normalizeVal(c[4]?.v);
        const shine = normalizeVal(c[5]?.v);
        const standard = normalizeVal(c[6]?.v);
        const sustain = normalizeVal(c[7]?.v);
        const total = typeof c[8]?.v === 'number' ? c[8]?.v : parseInt(c[8]?.v, 10) || Math.round(sort + set + shine + standard + sustain);
        const remarks = String(c[9]?.v || '').trim();
        const reportUrl = String(c[10]?.v || '').trim();

        const datePart = String(ts).split(' ')[0].replace(/\//g, '-');
        const site: FiveSSite = dept.toLowerCase().includes('lalru') ? 'Lalru Unit-3' : 'Unit-2';

        parsedAudits.push({
          id: `5S-SBL-${String(rows.length - i).padStart(3, '0')}`,
          timestamp: String(ts),
          date: datePart,
          site,
          league,
          department: dept,
          auditor: 'Budhi Parkash',
          auditee: `${dept} Team Lead`,
          sortScore: sort,
          setScore: set,
          shineScore: shine,
          standardScore: standard,
          sustainScore: sustain,
          totalScore: total,
          remarks: remarks || 'Audit conducted according to SBL/EHS/F-100 standard.',
          reportUrl: reportUrl || undefined
        });
      }

      if (parsedAudits.length > 0) {
        this.audits = parsedAudits.reverse();
        this.saveToStorage();
        return {
          success: true,
          count: this.audits.length,
          message: `Synced ${this.audits.length} live records directly from Google Sheet gid=${SHEET_GID}.`
        };
      }
      return { success: true, count: this.audits.length, message: 'Sync complete.' };
    } catch (err: any) {
      console.warn('Google Sheet live sync notice:', err.message);
      return {
        success: false,
        count: this.audits.length,
        message: `Google Sheet live sync: restricted access (${err.message}). Showing 53 authentic records from SBL Master System.`
      };
    }
  }

  public getTargetScore(): number {
    return SBL_5S_TARGET_PERCENT;
  }

  public calculateScore(scores: Record<string, number | 'NA'>): ScoreCalculationResult {
    let earned = 0;
    let maxApplicable = 0;

    const pillarRaw: Record<string, { earned: number; max: number }> = {
      'SORT (SEIRI)': { earned: 0, max: 0 },
      'SET IN ORDER (SEITON)': { earned: 0, max: 0 },
      'SHINE (SEISO)': { earned: 0, max: 0 },
      'STANDARDIZE (SEIKETSU)': { earned: 0, max: 0 },
      'SUSTAIN (SHITSUKE)': { earned: 0, max: 0 }
    };

    FIVE_S_PILLARS.forEach(pillar => {
      pillar.questions.forEach((_, qIdx) => {
        const key = `${pillar.name}_${qIdx}`;
        const val = scores[key];
        if (typeof val === 'number') {
          earned += val;
          maxApplicable += 2;
          pillarRaw[pillar.name].earned += val;
          pillarRaw[pillar.name].max += 2;
        }
      });
    });

    const totalPercentage = maxApplicable === 0 ? 0 : Math.round((earned / maxApplicable) * 100);

    const calcPillarPct = (pName: string) => {
      const p = pillarRaw[pName];
      return p.max === 0 ? 0 : Math.round((p.earned / p.max) * 100);
    };

    return {
      earned,
      maxApplicable,
      totalPercentage,
      isCompliant: totalPercentage >= SBL_5S_TARGET_PERCENT,
      pillarScores: {
        sort: pillarRaw['SORT (SEIRI)'].earned,
        set: pillarRaw['SET IN ORDER (SEITON)'].earned,
        shine: pillarRaw['SHINE (SEISO)'].earned,
        standard: pillarRaw['STANDARDIZE (SEIKETSU)'].earned,
        sustain: pillarRaw['SUSTAIN (SHITSUKE)'].earned
      },
      pillarPercentages: {
        sort: calcPillarPct('SORT (SEIRI)'),
        set: calcPillarPct('SET IN ORDER (SEITON)'),
        shine: calcPillarPct('SHINE (SEISO)'),
        standard: calcPillarPct('STANDARDIZE (SEIKETSU)'),
        sustain: calcPillarPct('SUSTAIN (SHITSUKE)')
      }
    };
  }

  public getLeagueStandings(league?: FiveSLeague): LeagueStanding[] {
    const list = league ? this.audits.filter(a => a.league === league) : this.audits;
    
    // Group by department taking the latest audit
    const deptMap: Record<string, FiveSAuditRecord> = {};
    list.forEach(a => {
      if (!deptMap[a.department]) {
        deptMap[a.department] = a;
      }
    });

    const sorted = Object.values(deptMap).sort((a, b) => b.totalScore - a.totalScore);

    return sorted.map((item, index) => {
      let status: LeagueStanding['status'] = 'Improvement Needed';
      if (index === 0) status = 'Gold Champion';
      else if (index === 1) status = 'Silver Leader';
      else if (index === 2) status = 'Bronze Leader';
      else if (item.totalScore >= SBL_5S_TARGET_PERCENT) status = 'Target Compliant';

      return {
        rank: index + 1,
        department: item.department,
        league: item.league,
        latestScore: item.totalScore,
        auditor: item.auditor,
        auditDate: item.date,
        status
      };
    });
  }

  public getChampions(): {
    labsLeader: { dept: string; score: number };
    opsLeader: { dept: string; score: number };
    overallLeader: { dept: string; score: number; league: string };
  } {
    const labs = this.getLeagueStandings('Labs League');
    const ops = this.getLeagueStandings('Operations League');

    const labsLeader = labs[0] ? { dept: labs[0].department, score: labs[0].latestScore } : { dept: 'N/A', score: 0 };
    const opsLeader = ops[0] ? { dept: ops[0].department, score: ops[0].latestScore } : { dept: 'N/A', score: 0 };

    let overallLeader = { dept: 'N/A', score: 0, league: '' };
    if (labsLeader.score >= opsLeader.score) {
      overallLeader = { dept: labsLeader.dept, score: labsLeader.score, league: 'Labs League' };
    } else {
      overallLeader = { dept: opsLeader.dept, score: opsLeader.score, league: 'Operations League' };
    }

    return { labsLeader, opsLeader, overallLeader };
  }

  public getPlantAverage(): number {
    if (this.audits.length === 0) return 0;
    const sum = this.audits.reduce((acc, a) => acc + a.totalScore, 0);
    return Math.round(sum / this.audits.length);
  }

  public getPillarAverages(): {
    sort: number;
    set: number;
    shine: number;
    standard: number;
    sustain: number;
  } {
    if (this.audits.length === 0) {
      return { sort: 0, set: 0, shine: 0, standard: 0, sustain: 0 };
    }
    const count = this.audits.length;
    const totals = this.audits.reduce(
      (acc, a) => ({
        sort: acc.sort + a.sortScore,
        set: acc.set + a.setScore,
        shine: acc.shine + a.shineScore,
        standard: acc.standard + a.standardScore,
        sustain: acc.sustain + a.sustainScore
      }),
      { sort: 0, set: 0, shine: 0, standard: 0, sustain: 0 }
    );

    // Convert each pillar out of 20 to percentage (score / 20 * 100)
    return {
      sort: Math.round((totals.sort / (count * 20)) * 100),
      set: Math.round((totals.set / (count * 20)) * 100),
      shine: Math.round((totals.shine / (count * 20)) * 100),
      standard: Math.round((totals.standard / (count * 20)) * 100),
      sustain: Math.round((totals.sustain / (count * 20)) * 100)
    };
  }

  public async submitAudit(payload: {
    site: FiveSSite;
    league: FiveSLeague;
    department: string;
    auditor: string;
    auditee: string;
    auditDate: string; // YYYY-MM-DD
    scores: Record<string, number | 'NA'>;
    remarks: string;
    photosBase64?: { name: string; mimeType: string; data: string }[];
  }): Promise<FiveSAuditRecord> {
    const calc = this.calculateScore(payload.scores);
    const dateParts = payload.auditDate.split('-');
    const formattedDate = dateParts.length === 3 ? `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}` : payload.auditDate;
    const now = new Date();
    const timestampStr = `${formattedDate} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const newId = `5S-${now.getFullYear()}-${String(this.audits.length + 1).padStart(3, '0')}`;

    const newRecord: FiveSAuditRecord = {
      id: newId,
      timestamp: timestampStr,
      date: formattedDate,
      site: payload.site,
      league: payload.league,
      department: payload.department,
      auditor: payload.auditor || 'Budhi Parkash',
      auditee: payload.auditee || 'Zone Supervisor',
      sortScore: calc.pillarScores.sort,
      setScore: calc.pillarScores.set,
      shineScore: calc.pillarScores.shine,
      standardScore: calc.pillarScores.standard,
      sustainScore: calc.pillarScores.sustain,
      totalScore: calc.totalPercentage,
      remarks: payload.remarks || 'Standard 5S audit completed as per checklist.',
      reportUrl: WEBAPP_URL,
      photoUrls: (payload.photosBase64 || []).map(p => `data:${p.mimeType};base64,${p.data}`)
    };

    // Prepend to audit log
    this.audits.unshift(newRecord);
    this.saveToStorage();

    // Fire and forget to Google Apps Script Web App
    try {
      const urlPayload = [
        `${payload.auditDate} 00:00:00`,
        payload.league,
        payload.department,
        calc.pillarScores.sort,
        calc.pillarScores.set,
        calc.pillarScores.shine,
        calc.pillarScores.standard,
        calc.pillarScores.sustain,
        calc.totalPercentage,
        payload.remarks || 'Standard 5S audit completed.'
      ];

      // Build report HTML matching Format SBL/EHS/F-100
      const reportHtml = this.generateIsoReportHtml(newRecord, payload.scores);

      fetch(WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submitAudit',
          payload: urlPayload,
          reportHTML: reportHtml,
          photoData: payload.photosBase64 || []
        })
      }).catch(e => console.log('Apps script submission ping:', e));
    } catch (e) {
      console.warn('Web App background sync error:', e);
    }

    return newRecord;
  }

  public generateIsoReportHtml(
    audit: FiveSAuditRecord,
    scores?: Record<string, number | 'NA'>
  ): string {
    let html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #0f172a; max-width: 800px; margin: 0 auto; background: #ffffff;">
      <!-- ISO DOCUMENT HEADER -->
      <table style="width: 100%; border-collapse: collapse; border: 2px solid #0f172a; margin-bottom: 15px; text-align: center;">
        <tr>
          <td style="border: 1px solid #0f172a; width: 22%; padding: 10px; vertical-align: middle;">
            <div style="font-weight: 900; font-size: 20px; color: #1e3a8a; letter-spacing: 2px;">SBL</div>
            <div style="font-size: 8px; font-weight: bold; text-transform: uppercase; color: #475569;">Specialty Coatings</div>
          </td>
          <td style="border: 1px solid #0f172a; width: 53%; vertical-align: middle; padding: 10px;">
            <h1 style="margin: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; color: #0f172a;">SBL Specialty Coatings Pvt. Ltd.</h1>
            <h2 style="margin: 4px 0 0 0; font-size: 12px; color: #2563eb; text-transform: uppercase; font-weight: bold;">100-Point 5S Audit Verification Report</h2>
          </td>
          <td style="border: 1px solid #0f172a; width: 25%; font-size: 9px; text-align: left; padding: 8px; line-height: 1.4; background: #f8fafc;">
            <strong>Format No:</strong> SBL/EHS/F-100<br>
            <strong>Rev No:</strong> 00<br>
            <strong>Rev Date:</strong> 02-08-2026<br>
            <strong>Audit Ref:</strong> ${audit.id}
          </td>
        </tr>
      </table>

      <!-- AUDIT METADATA -->
      <table style="width: 100%; margin-bottom: 20px; background: #f8fafc; border: 1px solid #0f172a; border-collapse: collapse; font-size: 11px;">
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1; width: 33%;"><strong>Site Location:</strong> ${audit.site}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; width: 33%;"><strong>Department:</strong> ${audit.department} (${audit.league})</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; width: 34%; text-align: center; background: ${audit.totalScore >= 85 ? '#ecfdf5' : '#fef2f2'};" rowspan="2">
            <strong style="font-size: 10px; text-transform: uppercase; color: #475569; display: block;">Total 5S Score</strong>
            <strong style="font-size: 28px; color: ${audit.totalScore >= 85 ? '#059669' : '#dc2626'};">${audit.totalScore}%</strong>
            <div style="font-size: 9px; font-weight: bold; text-transform: uppercase; color: ${audit.totalScore >= 85 ? '#059669' : '#dc2626'};">
              ${audit.totalScore >= 85 ? '✓ SBL STANDARD MET (>=85%)' : '✗ BELOW STANDARD (<85%)'}
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Auditor:</strong> ${audit.auditor}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Zone Owner:</strong> ${audit.auditee}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Physical Audit Date:</strong> ${audit.date}</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1;"><strong>Evaluation Standard:</strong> ISO 5S 100-Point Matrix</td>
          <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-size: 10px;"><strong>Audit Time:</strong> ${audit.timestamp.split(' ')[1] || '11:00'}</td>
        </tr>
      </table>

      <!-- 5 PILLAR SUMMARY BAR -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; text-align: center; font-size: 10px;">
        <tr style="background: #0f172a; color: white;">
          <th style="padding: 8px; border: 1px solid #334155;">1. SORT (Seiri)</th>
          <th style="padding: 8px; border: 1px solid #334155;">2. SET (Seiton)</th>
          <th style="padding: 8px; border: 1px solid #334155;">3. SHINE (Seiso)</th>
          <th style="padding: 8px; border: 1px solid #334155;">4. STANDARDIZE</th>
          <th style="padding: 8px; border: 1px solid #334155;">5. SUSTAIN</th>
        </tr>
        <tr style="background: #f1f5f9; font-weight: bold; font-size: 13px;">
          <td style="padding: 10px; border: 1px solid #cbd5e1; color: #e11d48;">${audit.sortScore}/20</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; color: #d97706;">${audit.setScore}/20</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; color: #059669;">${audit.shineScore}/20</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; color: #2563eb;">${audit.standardScore}/20</td>
          <td style="padding: 10px; border: 1px solid #cbd5e1; color: #7c3aed;">${audit.sustainScore}/20</td>
        </tr>
      </table>

      <!-- AUDITOR REMARKS & NON-CONFORMANCES -->
      <div style="margin-bottom: 20px; padding: 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px;">
        <h4 style="margin: 0 0 6px 0; font-size: 11px; text-transform: uppercase; color: #92400e; font-weight: bold;">Auditor Observations & Non-Conformances:</h4>
        <p style="margin: 0; font-size: 11px; color: #78350f; line-height: 1.5;">${audit.remarks || 'No non-conformances identified.'}</p>
      </div>

      <!-- QUESTIONS BREAKDOWN -->
      ${FIVE_S_PILLARS.map(p => `
        <div style="margin-bottom: 15px;">
          <h3 style="background: #1e293b; color: #ffffff; padding: 6px 10px; margin: 0; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px;">
            ${p.name} - ${p.meaning}
          </h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 10px;">
            ${p.questions.map((q, qIdx) => {
              const key = `${p.name}_${qIdx}`;
              let displayScore = '-';
              if (scores && scores[key] !== undefined) {
                displayScore = String(scores[key]);
              }
              return `
                <tr style="border-bottom: 1px solid #f1f5f9; ${qIdx % 2 === 0 ? 'background: #ffffff;' : 'background: #f8fafc;'}">
                  <td style="padding: 6px 8px; width: 5%; color: #94a3b8; font-weight: bold;">${qIdx + 1}</td>
                  <td style="padding: 6px 8px; width: 85%; color: #1e293b;">${q}</td>
                  <td style="padding: 6px 8px; width: 10%; text-align: center; font-weight: bold; ${displayScore === '0' ? 'color: #dc2626; background: #fee2e2;' : displayScore === '1' ? 'color: #d97706; background: #fef3c7;' : 'color: #059669;'}">
                    ${displayScore === '2' ? '2 (Pass)' : displayScore === '1' ? '1 (Partial)' : displayScore === '0' ? '0 (Fail)' : displayScore}
                  </td>
                </tr>
              `;
            }).join('')}
          </table>
        </div>
      `).join('')}

      <!-- SIGNATURE BLOCK -->
      <table style="width: 100%; margin-top: 30px; border-collapse: collapse; font-size: 10px; text-align: center;">
        <tr>
          <td style="width: 33%; padding: 20px 10px 5px 10px; border-top: 1px dashed #94a3b8;">
            <strong>${audit.auditor}</strong><br>
            <span style="color: #64748b;">Lead EHS Auditor</span>
          </td>
          <td style="width: 33%; padding: 20px 10px 5px 10px; border-top: 1px dashed #94a3b8;">
            <strong>${audit.auditee}</strong><br>
            <span style="color: #64748b;">Zone Owner / Auditee</span>
          </td>
          <td style="width: 34%; padding: 20px 10px 5px 10px; border-top: 1px dashed #94a3b8;">
            <strong>Plant Operations Head</strong><br>
            <span style="color: #64748b;">Management Authorization</span>
          </td>
        </tr>
      </table>
    </div>
    `;

    return html;
  }
}

export const fiveSService = new FiveSService();
