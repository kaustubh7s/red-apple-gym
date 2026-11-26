import { neon } from '@neondatabase/serverless';

export type FeatureModule =
  | 'gym_members'
  | 'gym_checkin'
  | 'gym_plans'
  | 'gym_billing'
  | 'gym_diet'
  | 'gym_workout'
  | 'gym_kiosk'
  | 'gym_trainer'
  | 'gym_biometric'
  | 'gym_multi_branch';

export interface CentralLicense {
  id: string;
  key: string;
  client_name: string;
  contact_person?: string;
  contact_phone?: string;
  client_email?: string;
  product_type: string;
  tier: string;
  status: 'active' | 'suspended' | 'expired';
  features: string[];
  enabled_features: FeatureModule[];
  max_devices?: number;
  current_devices?: number;
  created_at?: string;
  expires_at?: string;
  last_heartbeat?: string;
  activated_at?: string;
  notes?: string;
}

export interface LicenseValidationResult {
  valid: boolean;
  license?: CentralLicense;
  error?: string;
  isSuspended?: boolean;
  isExpired?: boolean;
}

const CENTRAL_DB_URL =
  process.env.NEXT_PUBLIC_CENTRAL_LICENSE_DB_URL ||
  process.env.CENTRAL_LICENSE_DB_URL ||
  'postgresql://neondb_owner:npg_5FQDlteuEW2m@ep-frosty-shadow-belede0g.c-9.us-east-2.aws.neon.tech/neondb?sslmode=require';

const sql = neon(CENTRAL_DB_URL, { disableWarningInBrowsers: true });
const STORAGE_KEY = 'redapple_central_license_v1';
const HEARTBEAT_KEY = 'redapple_license_last_heartbeat';
const CONFIG_KEY_STORAGE = 'redapple_configured_license_key';
const DEFAULT_KEY =
  process.env.NEXT_PUBLIC_CENTRAL_SYSTEM_LICENSE_KEY ||
  'GYMX-D0B0-CD1D-1EA8-2026';

/**
 * Verify license directly against central Neon database
 */
export async function verifyLicenseWithNeon(rawKey: string): Promise<LicenseValidationResult> {
  const cleanKey = (rawKey || '').trim().toUpperCase();
  if (!cleanKey) {
    return { valid: false, error: 'Please enter a valid license key.' };
  }

  try {
    const rows = await sql`SELECT * FROM licenses WHERE UPPER(key) = UPPER(${cleanKey}) LIMIT 1`;
    if (!rows || rows.length === 0) {
      return {
        valid: false,
        error: 'Invalid license key. Key was not found in central registry.'
      };
    }

    const record = rows[0] as CentralLicense;

    // Check if license is suspended or deactivated
    const isInactive = record.status === 'suspended' || (record.status as string) === 'deactivated' || (record.status as string) === 'revoked';
    if (isInactive) {
      return {
        valid: false,
        isSuspended: true,
        license: { ...record, status: 'suspended' },
        error: 'License suspended. Contact software provider.'
      };
    }

    // Check if license has expired
    if (record.expires_at) {
      const expTime = new Date(record.expires_at).getTime();
      if (Date.now() > expTime) {
        return {
          valid: false,
          isExpired: true,
          license: { ...record, status: 'expired' },
          error: 'License has expired. Please contact provider for renewal.'
        };
      }
    }

    // Check if status is active
    if (record.status !== 'active') {
      return {
        valid: false,
        isSuspended: true,
        license: { ...record, status: 'suspended' },
        error: `License is not active (current status: ${record.status}).`
      };
    }

    // Ping heartbeat in background
    try {
      sql`UPDATE licenses SET last_heartbeat = NOW() WHERE UPPER(key) = UPPER(${cleanKey})`.catch(() => {});
    } catch (e) {
      // Non-blocking
    }

    return {
      valid: true,
      license: record
    };
  } catch (err: any) {
    console.error('Error contacting central licensing server:', err);
    return {
      valid: false,
      error: 'Unable to connect to central licensing database. Please check your internet connection.'
    };
  }
}

/**
 * Get cached active license from local storage (or fallback to permanently configured system key)
 */
export function getStoredCentralLicense(): CentralLicense | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: CentralLicense = JSON.parse(raw);
      if (parsed.expires_at && Date.now() > new Date(parsed.expires_at).getTime()) {
        parsed.status = 'expired';
      }
      return parsed;
    }

    // Persistent fallback: Use configured or default gym license key without asking again
    const configuredKey = localStorage.getItem(CONFIG_KEY_STORAGE) || DEFAULT_KEY;
    if (configuredKey) {
      const fallbackLic: CentralLicense = {
        id: 'lic_gym_redapple',
        key: configuredKey,
        client_name: 'Red Apple GYM',
        product_type: 'gym',
        tier: 'enterprise',
        status: 'active',
        features: ['gym_members', 'gym_checkin', 'gym_plans', 'gym_billing', 'gym_diet', 'gym_workout'],
        enabled_features: ['gym_members', 'gym_checkin', 'gym_plans', 'gym_billing', 'gym_diet', 'gym_workout'],
        expires_at: '2027-11-26T23:59:59.000Z'
      };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackLic));
        localStorage.setItem(CONFIG_KEY_STORAGE, configuredKey);
      } catch {}
      return fallbackLic;
    }

    return null;
  } catch (e) {
    console.warn('Error reading stored central license:', e);
    return null;
  }
}

/**
 * Persist verified central license to local storage & keep configured key remembered permanently
 */
export function saveStoredCentralLicense(license: CentralLicense): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(license));
    localStorage.setItem(HEARTBEAT_KEY, Date.now().toString());
    if (license.key) {
      localStorage.setItem(CONFIG_KEY_STORAGE, license.key);
    }
  } catch (e) {
    console.warn('Error saving central license:', e);
  }
}

/**
 * Clear temporary license cache (keeps configured license key so user is not pestered)
 */
export function clearStoredCentralLicense(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(HEARTBEAT_KEY);
  } catch (e) {
    console.warn('Error clearing central license:', e);
  }
}

/**
 * Check whether a specific feature module is enabled in the active license
 */
export function isFeatureEnabled(feature: FeatureModule, customLicense?: CentralLicense | null): boolean {
  const lic = customLicense !== undefined ? customLicense : getStoredCentralLicense();
  if (!lic) return false;
  if (lic.status !== 'active') return false;

  // If enabled_features array exists, check inclusion
  if (Array.isArray(lic.enabled_features)) {
    return lic.enabled_features.includes(feature);
  }

  // Fallback to features array if enabled_features missing
  if (Array.isArray(lic.features)) {
    return (lic.features as any[]).includes(feature);
  }

  return true;
}

/**
 * Daily Heartbeat Checker:
 * Re-validates license against Neon DB once every 24 hours (or on admin login).
 * If status changed to 'suspended', locks the gym system immediately.
 */
export async function performDailyHeartbeat(force: boolean = false): Promise<{
  active: boolean;
  isSuspended: boolean;
  license: CentralLicense | null;
  error?: string;
}> {
  if (typeof window === 'undefined') {
    return { active: true, isSuspended: false, license: null };
  }

  const current = getStoredCentralLicense();
  if (!current || !current.key) {
    return { active: false, isSuspended: false, license: null };
  }

  const lastCheckedStr = localStorage.getItem(HEARTBEAT_KEY);
  const lastChecked = lastCheckedStr ? parseInt(lastCheckedStr, 10) : 0;
  // Refresh license from Neon every 30 seconds on page loads so Admin Panel toggles reflect fast
  const REFRESH_INTERVAL_MS = 30 * 1000;
  const now = Date.now();

  // If checked recently and not forced, return cached status
  if (!force && now - lastChecked < REFRESH_INTERVAL_MS) {
    return {
      active: current.status === 'active',
      isSuspended: current.status === 'suspended',
      license: current
    };
  }

  // Ping central Neon DB
  try {
    const res = await verifyLicenseWithNeon(current.key);
    if (res.valid && res.license) {
      saveStoredCentralLicense(res.license);
      return { active: true, isSuspended: false, license: res.license };
    } else if (res.isSuspended) {
      // License was suspended centrally!
      const suspendedLic: CentralLicense = {
        ...current,
        status: 'suspended'
      };
      saveStoredCentralLicense(suspendedLic);
      return {
        active: false,
        isSuspended: true,
        license: suspendedLic,
        error: 'License suspended. Contact software provider.'
      };
    } else {
      // Key was DELETED from Neon or is expired/invalid!
      clearStoredCentralLicense();
      return {
        active: false,
        isSuspended: false,
        license: null,
        error: res.error || 'License key was deleted or is invalid in central database.'
      };
    }
  } catch (e: any) {
    // If network fails during daily heartbeat, allow temporary grace if previous status was active
    console.warn('Heartbeat network error, running in offline grace mode:', e);
    return {
      active: current.status === 'active',
      isSuspended: current.status === 'suspended',
      license: current
    };
  }
}

/**
 * Live, real-time verification against Neon DB (No 24-hour cache delay).
 * Used when entering Admin / Trainer portals and periodically every few seconds
 * to instantly lock the screen if a license is deleted or deactivated centrally.
 */
export async function verifyActiveLicenseLive(): Promise<{
  active: boolean;
  isSuspended: boolean;
  isExpired: boolean;
  isDeleted: boolean;
  license: CentralLicense | null;
  error?: string;
}> {
  if (typeof window === 'undefined') {
    return { active: true, isSuspended: false, isExpired: false, isDeleted: false, license: null };
  }

  const stored = getStoredCentralLicense();
  if (!stored || !stored.key) {
    return {
      active: false,
      isSuspended: false,
      isExpired: false,
      isDeleted: true,
      license: null,
      error: 'No active license found.'
    };
  }

  const cleanKey = stored.key.trim().toUpperCase();

  try {
    const rows = await sql`SELECT * FROM licenses WHERE UPPER(key) = UPPER(${cleanKey}) LIMIT 1`;
    if (!rows || rows.length === 0) {
      // Key was DELETED or inactive in Neon!
      console.warn('License key was not found or deleted in central registry:', cleanKey);
      // Mark as suspended rather than wiping the remembered key
      const suspendedLic: CentralLicense = {
        ...stored,
        status: 'suspended'
      };
      saveStoredCentralLicense(suspendedLic);
      return {
        active: false,
        isSuspended: true,
        isExpired: false,
        isDeleted: true,
        license: suspendedLic,
        error: 'License is suspended or inactive in central registry.'
      };
    }

    const record = rows[0] as CentralLicense;

    // Check expiration
    if (record.expires_at && Date.now() > new Date(record.expires_at).getTime()) {
      record.status = 'expired';
      saveStoredCentralLicense(record);
      return {
        active: false,
        isSuspended: false,
        isExpired: true,
        isDeleted: false,
        license: record,
        error: 'License has expired.'
      };
    }

    // Check suspended or deactivated
    const isInactive =
      record.status === 'suspended' ||
      (record.status as string) === 'deactivated' ||
      (record.status as string) === 'revoked' ||
      record.status !== 'active';

    if (isInactive) {
      const suspendedLic: CentralLicense = {
        ...record,
        status: 'suspended'
      };
      saveStoredCentralLicense(suspendedLic);
      return {
        active: false,
        isSuspended: true,
        isExpired: false,
        isDeleted: false,
        license: suspendedLic,
        error: 'License is deactivated or suspended. Contact software provider.'
      };
    }

    // Fully active!
    saveStoredCentralLicense(record);
    return {
      active: true,
      isSuspended: false,
      isExpired: false,
      isDeleted: false,
      license: record
    };
  } catch (err: any) {
    console.warn('Live license verification network error, keeping stored state:', err);
    if (stored.status === 'active' && (!stored.expires_at || Date.now() <= new Date(stored.expires_at).getTime())) {
      return {
        active: true,
        isSuspended: false,
        isExpired: false,
        isDeleted: false,
        license: stored
      };
    }
    return {
      active: false,
      isSuspended: stored.status === 'suspended',
      isExpired: false,
      isDeleted: false,
      license: stored,
      error: 'Unable to contact central licensing registry.'
    };
  }
}
