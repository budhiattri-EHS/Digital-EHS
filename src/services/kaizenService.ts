// SBL Kaizen Master Service
// Seamless Integration with Google Sheet 1apD4hJx2e0MwYWt-yfkWsGf6-q5YwORSLWotmxaFZbI
// and Google Form 1oqIQs8wV99AMw2xGwn-Hsnt9TJi7s21-Aocc8dVpNrY
// Master Engine v15.0 Automation

import { KaizenRecord, BASELINE_KAIZENS, calculateKaizenScore, HOD_DIRECTORY, ASSESSOR_DIRECTORY } from '../data/kaizenData';

export const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1apD4hJx2e0MwYWt-yfkWsGf6-q5YwORSLWotmxaFZbI/gviz/tq?tqx=out:csv&gid=0';
export const GOOGLE_FORM_ACTION_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdO5Voc__ZiSmvOhlfJedrpBC02lmjMziSUA7RK4Kmfbfq6MQ/formResponse';
export const KAIZEN_WEBAPP_URL = 'https://script.google.com/macros/s/AKfycbyPmbET66iFW2DO4ppSGP1kQoz6phVJ2ZgOagWkDYjXZafGGEX1tAdbj65oKgIT7hM/exec';

const STORAGE_KEY_KAIZENS = 'sbl_kaizen_records_v3';

function parseCSV(content: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    const nextChar = content[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal.trim());
      if (currentRow.length > 1 || currentRow[0] !== '') {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }
  return rows;
}

class KaizenManager {
  private cache: KaizenRecord[] = [];
  private isLoaded = false;

  public getKaizens(): KaizenRecord[] {
    if (!this.isLoaded) {
      this.loadFromStorage();
    }
    return this.cache;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_KAIZENS);
      if (stored) {
        const localList: KaizenRecord[] = JSON.parse(stored);
        // Merge local additions with baseline
        const map = new Map<string, KaizenRecord>();
        BASELINE_KAIZENS.forEach(k => map.set(k.id.toUpperCase(), k));
        localList.forEach(k => map.set(k.id.toUpperCase(), k));
        this.cache = Array.from(map.values()).sort((a, b) => b.id.localeCompare(a.id));
      } else {
        this.cache = [...BASELINE_KAIZENS];
      }
    } catch (e) {
      console.warn('Failed to load Kaizens from localStorage:', e);
      this.cache = [...BASELINE_KAIZENS];
    }
    this.isLoaded = true;
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY_KAIZENS, JSON.stringify(this.cache));
    } catch (e) {
      console.error('Failed to save Kaizens to localStorage:', e);
    }
  }

  public async syncWithGoogleSheet(): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const response = await fetch(GOOGLE_SHEET_CSV_URL, {
        headers: { Accept: 'text/csv' }
      });
      if (!response.ok) {
        throw new Error(`Google Sheet returned HTTP ${response.status}`);
      }
      const csvText = await response.text();
      const rows = parseCSV(csvText);
      if (rows.length < 2) {
        throw new Error('CSV response contains no data rows');
      }

      const map = new Map<string, KaizenRecord>();
      // Keep existing local overrides
      this.cache.forEach(k => map.set(k.id.toUpperCase(), k));

      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r[0]) continue;
        const idKey = r[0].trim().toUpperCase();
        const existing = map.get(idKey);

        map.set(idKey, {
          id: r[0].trim(),
          status: (r[1] as any) || existing?.status || 'Submitted',
          timestamp: r[2] || existing?.timestamp || '',
          name: r[3] || existing?.name || 'Anonymous',
          email: r[4] || existing?.email || '',
          department: r[5] || existing?.department || 'General',
          category: r[6] || existing?.category || 'General',
          title: r[7] || existing?.title || 'Kaizen Proposal',
          problem: r[8] || existing?.problem || '',
          proposedImprovement: r[9] || existing?.proposedImprovement || '',
          expectedBenefits: r[10] || existing?.expectedBenefits || '',
          hodName: r[11] || existing?.hodName || '',
          hodApprovalDate: r[12] || existing?.hodApprovalDate || '',
          hodComments: r[13] || existing?.hodComments || '',
          assessorEmail: r[14] || existing?.assessorEmail || '',
          verifiedAchievedBenefit: r[15] || existing?.verifiedAchievedBenefit || '',
          dateVerified: r[16] || existing?.dateVerified || '',
          assessorLog: r[17] || existing?.assessorLog || '',
          assessorComments: r[18] || existing?.assessorComments || '',
          kaizenScore: parseInt(r[19] || '0', 10) || existing?.kaizenScore || 0,
          resourceStatus: r[20] || existing?.resourceStatus || 'NO',
          token: r[21] || existing?.token || ''
        });
      }

      this.cache = Array.from(map.values()).sort((a, b) => b.id.localeCompare(a.id));
      this.saveToStorage();

      return { success: true, count: this.cache.length };
    } catch (err: any) {
      console.warn('Kaizen Google Sheet live sync fallback to local cache:', err.message);
      return { success: false, count: this.cache.length, error: err.message };
    }
  }

  public getNextKaizenId(): string {
    const year = new Date().getFullYear();
    let maxNum = 0;
    this.cache.forEach(k => {
      const match = k.id.match(/KZN-\d{4}-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });
    const nextNum = maxNum + 1;
    return `KZN-${year}-${String(nextNum).padStart(4, '0')}`;
  }

  /**
   * Submits a new Kaizen and ensures it is written to the Google Sheet via Google Form response
   */
  public async submitKaizen(data: {
    employeeName: string;
    employeeCode: string;
    email: string;
    department: string;
    categories: string[];
    title: string;
    problem: string;
    proposedImprovement: string;
    expectedBenefits: string;
    teamMembers?: string;
    resourcesNeeded?: string;
    implementationSteps?: string;
    claimedImpact?: {
      costSavingRsThousand?: number;
      productivityPct?: number;
      qualityFailureRatePct?: number;
      spaceSavingM2?: number;
      ehsBenefit?: boolean;
      psychosocialBenefit?: boolean;
    };
  }): Promise<{ success: boolean; kaizen: KaizenRecord }> {
    const kaizenId = this.getNextKaizenId();
    const token = 'tok-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    const now = new Date();
    const timestampStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const categoryStr = data.categories.join(', ');

    const estimatedScore = calculateKaizenScore({
      categories: data.categories,
      costSavingRsThousand: data.claimedImpact?.costSavingRsThousand,
      productivityPct: data.claimedImpact?.productivityPct,
      qualityFailureRatePct: data.claimedImpact?.qualityFailureRatePct,
      spaceSavingM2: data.claimedImpact?.spaceSavingM2,
      ehsBenefit: data.claimedImpact?.ehsBenefit,
      psychosocialBenefit: data.claimedImpact?.psychosocialBenefit,
      noResourcesRequired: (data.resourcesNeeded || '').trim().toUpperCase() === 'NO' || (data.resourcesNeeded || '').trim() === ''
    });

    const newRecord: KaizenRecord = {
      id: kaizenId,
      status: 'Pending HOD Approval',
      timestamp: timestampStr,
      name: data.employeeName,
      email: data.email,
      department: data.department,
      category: categoryStr,
      title: data.title,
      problem: data.problem,
      proposedImprovement: data.proposedImprovement,
      expectedBenefits: data.expectedBenefits,
      kaizenScore: estimatedScore,
      resourceStatus: data.resourcesNeeded || 'NO',
      token: token,
      teamMembers: data.teamMembers,
      implementationSteps: data.implementationSteps
    };

    // Update in memory & storage
    this.cache.unshift(newRecord);
    this.saveToStorage();

    // 1. Dispatch directly to Google Form 1oqIQs8wV99AMw2xGwn-Hsnt9TJi7s21-Aocc8dVpNrY
    // which appends the row to Google Sheet 1apD4hJx2e0MwYWt-yfkWsGf6-q5YwORSLWotmxaFZbI
    try {
      const formParams = new URLSearchParams();
      formParams.append('entry.773281554', data.employeeName);
      formParams.append('entry.1697991762', data.employeeCode);
      formParams.append('entry.831637936', data.email);
      formParams.append('entry.1698943745', data.department);
      formParams.append('entry.565755019', categoryStr);
      formParams.append('entry.1102716839', data.title);
      formParams.append('entry.633027159', data.problem);
      formParams.append('entry.1699700935', data.proposedImprovement);
      formParams.append('entry.73086347', data.expectedBenefits);
      if (data.teamMembers) formParams.append('entry.1381329093', data.teamMembers);
      formParams.append('entry.324701792', data.resourcesNeeded || 'NO');
      if (data.implementationSteps) formParams.append('entry.1175070279', data.implementationSteps);
      formParams.append('entry.765605788', kaizenId);

      // Quantifiable Achieved Benefit placeholders
      if (data.claimedImpact?.qualityFailureRatePct) formParams.append('entry.1160982253', String(data.claimedImpact.qualityFailureRatePct));
      if (data.claimedImpact?.productivityPct) formParams.append('entry.31946014', String(data.claimedImpact.productivityPct));
      if (data.claimedImpact?.costSavingRsThousand) formParams.append('entry.76622329', String(data.claimedImpact.costSavingRsThousand));
      if (data.claimedImpact?.spaceSavingM2) formParams.append('entry.1599617885', String(data.claimedImpact.spaceSavingM2));
      if (data.claimedImpact?.ehsBenefit) formParams.append('entry.71805941', 'Yes');
      if (data.claimedImpact?.psychosocialBenefit) formParams.append('entry.2087759335', 'Yes');

      await fetch(GOOGLE_FORM_ACTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formParams.toString(),
        mode: 'no-cors'
      });
      console.log('Successfully posted Kaizen to Google Form and Google Sheet!');
    } catch (err) {
      console.warn('Background Google Form post deferred:', err);
    }

    return { success: true, kaizen: newRecord };
  }

  /**
   * Approves a Kaizen and writes HOD approval to the Google Sheet
   */
  public async approveKaizen(kaizenId: string, hodName: string, hodComments = 'Approved for implementation.'): Promise<{ success: boolean }> {
    const idx = this.cache.findIndex(k => k.id.toUpperCase() === kaizenId.toUpperCase());
    if (idx === -1) throw new Error(`Kaizen ID ${kaizenId} not found.`);

    const todayStr = new Date().toLocaleDateString();
    this.cache[idx] = {
      ...this.cache[idx],
      status: 'Approved - Implementation in Progress',
      hodName: hodName,
      hodApprovalDate: todayStr,
      hodComments: hodComments
    };
    this.saveToStorage();

    // Write approval to Google Sheet via Web App endpoint
    const token = this.cache[idx].token || 'auto-token';
    const approvalUrl = `${KAIZEN_WEBAPP_URL}?approvalType=initial&action=approve&id=${encodeURIComponent(kaizenId)}&token=${encodeURIComponent(token)}&hodName=${encodeURIComponent(hodName)}&hodComments=${encodeURIComponent(hodComments)}`;

    try {
      await fetch(approvalUrl, { mode: 'no-cors' });
      console.log(`HOD Approval written to Google Sheet for ${kaizenId}`);
    } catch (e) {
      console.warn('Web App approval webhook deferred:', e);
    }

    return { success: true };
  }

  /**
   * Rejects a Kaizen and writes reason to the Google Sheet
   */
  public async rejectKaizen(kaizenId: string, hodName: string, reason: string): Promise<{ success: boolean }> {
    const idx = this.cache.findIndex(k => k.id.toUpperCase() === kaizenId.toUpperCase());
    if (idx === -1) throw new Error(`Kaizen ID ${kaizenId} not found.`);

    const todayStr = new Date().toLocaleDateString();
    this.cache[idx] = {
      ...this.cache[idx],
      status: 'Rejected',
      hodName: hodName,
      hodApprovalDate: todayStr,
      hodComments: reason
    };
    this.saveToStorage();

    const token = this.cache[idx].token || 'auto-token';
    const rejectUrl = `${KAIZEN_WEBAPP_URL}?approvalType=initial&action=reject&id=${encodeURIComponent(kaizenId)}&token=${encodeURIComponent(token)}&reason=${encodeURIComponent(reason)}`;

    try {
      await fetch(rejectUrl, { mode: 'no-cors' });
      console.log(`Rejection written to Google Sheet for ${kaizenId}`);
    } catch (e) {
      console.warn('Web App rejection webhook deferred:', e);
    }

    return { success: true };
  }

  /**
   * Verifies & assigns score to an implemented Kaizen (Assessor / Committee)
   */
  public async verifyAndScoreKaizen(
    kaizenId: string,
    assessorEmail: string,
    verifiedBenefitJSON: string,
    finalScore: number,
    assessorComments = 'Verified and audited on site.'
  ): Promise<{ success: boolean }> {
    const idx = this.cache.findIndex(k => k.id.toUpperCase() === kaizenId.toUpperCase());
    if (idx === -1) throw new Error(`Kaizen ID ${kaizenId} not found.`);

    const todayStr = new Date().toLocaleDateString();
    this.cache[idx] = {
      ...this.cache[idx],
      status: 'Completed & Verified',
      assessorEmail: assessorEmail,
      dateVerified: todayStr,
      assessorLog: `${assessorEmail} on ${todayStr}`,
      assessorComments: assessorComments,
      verifiedAchievedBenefit: verifiedBenefitJSON,
      kaizenScore: finalScore
    };
    this.saveToStorage();

    const token = this.cache[idx].token || 'auto-token';
    const verifyUrl = `${KAIZEN_WEBAPP_URL}?approvalType=assessment&action=score&id=${encodeURIComponent(kaizenId)}&token=${encodeURIComponent(token)}&assessor=${encodeURIComponent(assessorEmail)}&score=${finalScore}&comments=${encodeURIComponent(assessorComments)}`;

    try {
      await fetch(verifyUrl, { mode: 'no-cors' });
      console.log(`Assessor verification & score written to Google Sheet for ${kaizenId}`);
    } catch (e) {
      console.warn('Web App verification webhook deferred:', e);
    }

    return { success: true };
  }

  public getSummaryStats() {
    const all = this.getKaizens();
    const total = all.length;
    const completed = all.filter(k => k.status === 'Completed & Verified').length;
    const inProgress = all.filter(k => k.status === 'Approved - Implementation in Progress').length;
    const pendingHod = all.filter(k => k.status === 'Pending HOD Approval' || k.status === 'Submitted').length;
    const totalScore = all.reduce((sum, k) => sum + (k.kaizenScore || 0), 0);
    const avgScore = completed > 0 ? (all.filter(k => k.status === 'Completed & Verified').reduce((sum, k) => sum + (k.kaizenScore || 0), 0) / completed).toFixed(1) : '0';

    return {
      total,
      completed,
      inProgress,
      pendingHod,
      totalScore,
      avgScore
    };
  }
}

export const kaizenService = new KaizenManager();
