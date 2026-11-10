import { UserProfile } from '../types';
import defaultEmployees from '../data/employees.json';

export interface EmployeeRecord {
  code: string;
  password: string;
  name: string;
  department: string;
  designation: string;
}

const STORAGE_KEY_AUTH_USER = 'SBL_AUTH_USER';
const STORAGE_KEY_EMPLOYEES = 'SBL_CACHED_EMPLOYEES';
const EMPLOYEES_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1Dx0pLWeBbisLsI3luusmPd0_YJq4ROV7FzOzwGteaVI/gviz/tq?tqx=out:csv&gid=1774039163';

export class AuthService {
  private static directory: EmployeeRecord[] = [];
  private static isInitialized = false;

  public static initialize(): void {
    if (this.isInitialized) return;
    this.directory = [...(defaultEmployees as EmployeeRecord[])];

    // Load any updated cache from localStorage
    try {
      const cached = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.directory = parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse cached employees, using bundled directory', e);
    }

    this.isInitialized = true;

    // Trigger background sync from Google Sheets if online
    if (typeof window !== 'undefined' && navigator.onLine) {
      this.syncEmployeesFromCloud().catch(() => {});
    }
  }

  public static async syncEmployeesFromCloud(): Promise<boolean> {
    try {
      const res = await fetch(`${EMPLOYEES_SHEET_CSV_URL}&_=${Date.now()}`);
      if (!res.ok) return false;
      const text = await res.text();
      const lines = text.trim().split('\n');
      if (lines.length < 2) return false;

      const updated: EmployeeRecord[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const cols = this.parseCSVLine(line);
        if (cols.length >= 5 && cols[0]) {
          updated.push({
            code: cols[0],
            password: cols[1],
            name: cols[2],
            department: cols[3],
            designation: cols[4]
          });
        }
      }

      if (updated.length > 0) {
        this.directory = updated;
        localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(updated));
        console.log(`Synced ${updated.length} employees from SBL Google Sheet.`);
        return true;
      }
    } catch (err) {
      console.warn('Employee directory cloud sync deferred (offline/network):', err);
    }
    return false;
  }

  public static authenticate(code: string, password: string): {
    success: boolean;
    user?: UserProfile;
    message?: string;
  } {
    this.initialize();

    let cleanCode = (code || '').trim().toUpperCase();
    if (cleanCode === '1406') {
      cleanCode = 'E0414';
    }
    const cleanPw = (password || '').trim();

    if (!cleanCode) {
      return { success: false, message: 'Please enter your Employee Code / कर्मचारी कोड दर्ज करें।' };
    }
    if (!cleanPw) {
      return { success: false, message: 'Please enter your Password / पासवर्ड दर्ज करें।' };
    }

    // Search in directory
    const match = this.directory.find(e => e.code.toUpperCase() === cleanCode);

    if (!match) {
      return {
        success: false,
        message: `Employee code "${cleanCode}" not found in SBL Registry. Please verify with HR/EHS.`
      };
    }

    // Check password
    if (match.password !== cleanPw) {
      return {
        success: false,
        message: 'Invalid password. Please check your credentials or contact HR/EHS.'
      };
    }

    // Success: build profile
    const profile: UserProfile = {
      employeeCode: match.code,
      name: match.name,
      role: `${match.designation} (${match.department})`,
      department: match.department,
      designation: match.designation,
      facility: 'Lalru Unit-3',
      isAuthenticated: true
    };

    try {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save user session to localStorage', e);
    }

    return { success: true, user: profile };
  }

  public static getCurrentUser(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (stored) {
        const parsed: UserProfile = JSON.parse(stored);
        if (parsed && parsed.isAuthenticated && parsed.employeeCode) {
          // Normalize Budhi Parkash's employee code to official registry code E0414
          if (parsed.employeeCode === '1406' || (parsed.name && parsed.name.toLowerCase().includes('budhi'))) {
            parsed.employeeCode = 'E0414';
            parsed.department = parsed.department || 'Manufacturing';
            parsed.designation = parsed.designation || 'HOD';
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to read auth user from localStorage', e);
    }
    return null;
  }

  public static logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    } catch (e) {
      console.warn('Failed to remove auth user from localStorage', e);
    }
  }

  public static getEmployeesCount(): number {
    this.initialize();
    return this.directory.length;
  }

  private static parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += c;
      }
    }
    values.push(current.trim());
    return values.map(v => v.replace(/^"|"$/g, '').trim());
  }
}
