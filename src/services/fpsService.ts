// SBL Absolute Fire Protection System - Service Layer
// Master Engine v37.0 & AppSheet "Pending Assets This Month" Slice Integration

import { FPSAsset, BASELINE_FPS_ASSETS } from '../data/fpsAssetsData';
import { FPSDirective, FPS_DIRECTIVES, InspectionRecord, CAPAItem, INITIAL_CAPA_ITEMS } from '../data/fpsDirectives';

export const GOOGLE_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/11c8tjmDQdo3S_c3HTD0OB2Bdw-sAsl4IKRRi0Z75b_M/gviz/tq?tqx=out:csv&gid=160063332';
export const APPS_SCRIPT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyBZDFILlt-k2aGB1MjMfigydyxyBuptynCrvgCh32bv71d5K8Bu66g7vJnorCW9QXy/exec';

const STORAGE_KEY_ASSETS = 'sbl_fps_assets_override_v2';
const STORAGE_KEY_INSPECTIONS = 'sbl_fps_inspections_v2';
const STORAGE_KEY_CAPA = 'sbl_fps_capa_v2';

/**
 * Normalizes an Asset ID for foolproof matching:
 * Trims whitespace, removes leading zeros ('00683' -> '683', '01' -> '1'), and lowercases.
 */
export function normalizeAssetId(rawId: string | number | undefined | null): string {
  if (rawId === undefined || rawId === null) return '';
  return String(rawId).trim().replace(/^0+/, '').toLowerCase();
}

/**
 * AppSheet Slice Rule: "Pending Assets This Month"
 * OR(
 *   ISBLANK([Last_Inspection]),
 *   MONTH([Last_Inspection]) <> MONTH(TODAY()),
 *   YEAR([Last_Inspection]) <> YEAR(TODAY()),
 *   [Status] = "Defective"
 * )
 */
export function isPendingThisMonth(asset: FPSAsset, refDate = new Date()): boolean {
  if (asset.status === 'Defective') {
    return true; // Defective assets stay pending until repaired and verified
  }

  if (!asset.lastInspection || asset.lastInspection.trim() === '') {
    return true;
  }

  const parts = asset.lastInspection.trim().split(/[\/\-\.]/);
  if (parts.length < 3) {
    return true;
  }

  let month: number;
  let year: number;

  if (parts[0].length === 4) {
    // YYYY-MM-DD
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
  } else {
    // M/D/YYYY or MM/DD/YYYY
    month = parseInt(parts[0], 10);
    year = parseInt(parts[2], 10);
  }

  const curMonth = refDate.getMonth() + 1; // 1-12
  const curYear = refDate.getFullYear();

  if (isNaN(month) || isNaN(year)) {
    return true;
  }

  return month !== curMonth || year !== curYear;
}

export function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

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

class FPSManager {
  private assetsCache: FPSAsset[] = [];
  private isLoaded = false;

  public getAssets(): FPSAsset[] {
    if (!this.isLoaded) {
      this.loadAssetsFromStorage();
    }
    return this.assetsCache;
  }

  private loadAssetsFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ASSETS);
      if (stored) {
        const overrides: Record<string, Partial<FPSAsset>> = JSON.parse(stored);
        this.assetsCache = BASELINE_FPS_ASSETS.map(asset => {
          const norm = normalizeAssetId(asset.id);
          if (overrides[norm]) {
            return { ...asset, ...overrides[norm] };
          }
          return asset;
        });
      } else {
        this.assetsCache = [...BASELINE_FPS_ASSETS];
      }
    } catch (e) {
      console.warn('Failed to load FPS assets from localStorage:', e);
      this.assetsCache = [...BASELINE_FPS_ASSETS];
    }
    this.isLoaded = true;
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
      const rows = parseCsvRows(csvText);
      if (rows.length < 2) {
        throw new Error('CSV response contains no data rows');
      }

      const fetchedMap = new Map<string, Partial<FPSAsset>>();
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (!r[0]) continue;
        const norm = normalizeAssetId(r[0]);
        fetchedMap.set(norm, {
          id: r[0],
          unit: r[1] || 'Unit 3-Lalru',
          type: r[2] || 'Fire Extinguisher',
          location: r[3] || '',
          floor: r[4] || 'GF',
          capacity: r[5] || '',
          engineModel: r[6] || '',
          engineSN: r[7] || '',
          pumpSN: r[8] || '',
          landmark: r[9] || '',
          calibrationExpiry: r[10] || '',
          qrCodeLink: r[11] || '',
          status: (r[12] as any) || 'Operational',
          lastInspection: r[13] || '',
          conditionScore: parseInt(r[14] || '100', 10) || 100,
          gpsCoordinates: r[15] || ''
        });
      }

      // Merge with current state (preserving un-synced local inspections)
      const currentOverrides = this.getLocalOverrides();
      this.assetsCache = this.assetsCache.map(asset => {
        const norm = normalizeAssetId(asset.id);
        const live = fetchedMap.get(norm);
        const local = currentOverrides[norm];
        return {
          ...asset,
          ...(live || {}),
          ...(local || {})
        };
      });

      return { success: true, count: fetchedMap.size };
    } catch (err: any) {
      console.warn('Live Google Sheet sync fallback to baseline:', err.message);
      return { success: false, count: this.assetsCache.length, error: err.message };
    }
  }

  private getLocalOverrides(): Record<string, Partial<FPSAsset>> {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ASSETS);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private saveLocalOverrides(overrides: Record<string, Partial<FPSAsset>>): void {
    try {
      localStorage.setItem(STORAGE_KEY_ASSETS, JSON.stringify(overrides));
    } catch (e) {
      console.error('Failed to save asset overrides to localStorage:', e);
    }
  }

  public findAsset(search: string): FPSAsset | undefined {
    const assets = this.getAssets();
    const cleanSearch = normalizeAssetId(search);
    if (!cleanSearch) return undefined;

    return assets.find(a => {
      const normId = normalizeAssetId(a.id);
      return (
        normId === cleanSearch ||
        a.id.toLowerCase() === search.trim().toLowerCase() ||
        (a.qrCodeLink && a.qrCodeLink.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }

  public recordInspection(
    record: InspectionRecord
  ): { success: boolean; asset: FPSAsset; capaItem?: CAPAItem } {
    const assets = this.getAssets();
    const cleanId = normalizeAssetId(record.assetId);

    const assetIdx = assets.findIndex(a => normalizeAssetId(a.id) === cleanId);
    if (assetIdx === -1) {
      throw new Error(`Asset ID "${record.assetId}" not found in database.`);
    }

    const currentAsset = assets[assetIdx];
    const today = new Date();
    const todayStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    const updatedAsset: FPSAsset = {
      ...currentAsset,
      status: record.statusFound,
      conditionScore: record.score,
      lastInspection: todayStr
    };

    // Update in memory
    assets[assetIdx] = updatedAsset;
    this.assetsCache = [...assets];

    // Save override to localStorage
    const overrides = this.getLocalOverrides();
    overrides[cleanId] = {
      status: record.statusFound,
      conditionScore: record.score,
      lastInspection: todayStr
    };
    this.saveLocalOverrides(overrides);

    // Save inspection log to history
    this.appendInspectionLog(record);

    // Check if CAPA required: Defective status OR score < 95 OR Box Key missing
    let capaItem: CAPAItem | undefined;
    const isKeyMissing = record.checklistData && record.checklistData['HYD_Box_Key'] === 'Missing';
    if (record.statusFound === 'Defective' || record.score < 95 || isKeyMissing) {
      capaItem = this.createCAPAItem({
        unit: updatedAsset.unit,
        assetId: updatedAsset.id,
        severity: isKeyMissing || record.score < 80 ? 'CRITICAL' : 'MAJOR',
        faultDescription: record.remarks || `Forensic failure detected (Score: ${record.score}%, Status: ${record.statusFound})`
      });
    }

    // Fire-and-forget sync to Google Apps Script Webhook
    this.postToAppsScriptWebhook(record, updatedAsset);

    return { success: true, asset: updatedAsset, capaItem };
  }

  private appendInspectionLog(record: InspectionRecord): void {
    try {
      const logs = this.getInspectionLogs();
      logs.unshift(record);
      // Keep last 100 in memory/storage
      const trimmed = logs.slice(0, 100);
      localStorage.setItem(STORAGE_KEY_INSPECTIONS, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to append inspection log:', e);
    }
  }

  public getInspectionLogs(): InspectionRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_INSPECTIONS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public getCAPAItems(): CAPAItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CAPA);
      if (stored) {
        return JSON.parse(stored);
      }
      return [...INITIAL_CAPA_ITEMS];
    } catch {
      return [...INITIAL_CAPA_ITEMS];
    }
  }

  public createCAPAItem(data: {
    unit: string;
    assetId: string;
    severity: 'CRITICAL' | 'MAJOR' | 'NORMAL';
    faultDescription: string;
  }): CAPAItem {
    const items = this.getCAPAItems();
    const now = new Date();
    const issueId = `ISS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(Math.floor(Math.random() * 900) + 100)}`;
    const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;

    const newItem: CAPAItem = {
      issueId,
      unit: data.unit,
      assetId: data.assetId,
      dateRaised: dateStr,
      severity: data.severity,
      faultDescription: data.faultDescription,
      assignedTo: 'Unit Safety Lead',
      status: 'OPEN'
    };

    items.unshift(newItem);
    try {
      localStorage.setItem(STORAGE_KEY_CAPA, JSON.stringify(items));
    } catch (e) {
      console.warn('Failed to save CAPA item:', e);
    }
    return newItem;
  }

  public resolveCAPAItem(issueId: string, notes?: string): void {
    const items = this.getCAPAItems();
    const idx = items.findIndex(i => i.issueId === issueId);
    if (idx !== -1) {
      const now = new Date();
      items[idx].status = 'RESOLVED';
      items[idx].resolutionDate = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()}`;
      if (notes) {
        items[idx].faultDescription += ` [Resolved: ${notes}]`;
      }
      try {
        localStorage.setItem(STORAGE_KEY_CAPA, JSON.stringify(items));
      } catch (e) {
        console.warn('Failed to save resolved CAPA:', e);
      }
    }
  }

  private async postToAppsScriptWebhook(record: InspectionRecord, asset: FPSAsset): Promise<void> {
    try {
      const payload = {
        Asset_ID: asset.id,
        Unit: asset.unit,
        Type: asset.type,
        Status_Found: record.statusFound,
        Score: record.score,
        Inspector_Email: record.inspectorEmail,
        Timestamp: record.timestamp,
        Field_GPS: record.fieldGps,
        Ambient_Temp_C: record.ambientTempC,
        Verified_Serial_No: record.verifiedSerialNo,
        Remarks: record.remarks,
        HYD_Box_Key: record.checklistData['HYD_Box_Key'],
        ...record.checklistData
      };

      // Use fetch with mode: 'no-cors' so it reaches Google Apps Script cleanly
      await fetch(APPS_SCRIPT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
        mode: 'no-cors'
      });
      console.log('Successfully dispatched inspection payload to Master Engine Webhook.');
    } catch (err) {
      console.warn('Asynchronous Google Apps Script post deferred:', err);
    }
  }

  public getSummaryStats(unitFilter = 'All') {
    const all = this.getAssets().filter(a => unitFilter === 'All' || a.unit === unitFilter);
    const total = all.length;
    const pendingThisMonth = all.filter(a => isPendingThisMonth(a)).length;
    const completedThisMonth = total - pendingThisMonth;
    const defective = all.filter(a => a.status === 'Defective').length;
    const avgScore = total > 0 ? Math.round(all.reduce((acc, a) => acc + (a.conditionScore || 100), 0) / total) : 100;
    const complianceRate = total > 0 ? Math.round((completedThisMonth / total) * 100) : 0;

    return {
      total,
      pendingThisMonth,
      completedThisMonth,
      defective,
      avgScore,
      complianceRate
    };
  }
}

export const fpsService = new FPSManager();
