'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getStoredCentralLicense,
  clearStoredCentralLicense,
  saveStoredCentralLicense,
  verifyLicenseWithNeon,
  CentralLicense
} from '@/lib/centralLicenseService';
import { CentralLicenseLockScreen } from './CentralLicenseLockScreen';

interface GlobalLicenseGuardProps {
  children: React.ReactNode;
}

export const GlobalLicenseGuard: React.FC<GlobalLicenseGuardProps> = ({ children }) => {
  const [license, setLicense] = useState<CentralLicense | null>(null);
  const [isChecked, setIsChecked] = useState(false);
  const [isSuspended, setIsSuspended] = useState(false);
  const [revokedMessage, setRevokedMessage] = useState<string | null>(null);

  // Live verify against central Neon database
  const verifyLiveStatus = useCallback(async () => {
    const cached = getStoredCentralLicense();

    // 1. If no license stored at all, lock immediately
    if (!cached || !cached.key) {
      setLicense(null);
      setIsChecked(true);
      return;
    }

    // 2. Query Neon DB live to ensure the key still exists and is still active
    try {
      const res = await verifyLicenseWithNeon(cached.key);

      if (res.valid && res.license) {
        // Key exists and is active!
        setLicense(res.license);
        setIsSuspended(false);
        setRevokedMessage(null);
        saveStoredCentralLicense(res.license);
      } else if (res.isSuspended) {
        // Key was suspended centrally
        setIsSuspended(true);
        setLicense(res.license || cached);
      } else {
        // Key was DELETED from Neon or is invalid!
        console.warn('License key deleted or invalid in central DB:', res.error);
        clearStoredCentralLicense();
        setLicense(null);
        setIsSuspended(false);
        setRevokedMessage(
          res.error || 'Your license key was deleted or revoked from the central database. Please enter a valid license key.'
        );
      }
    } catch (err) {
      console.warn('Licensing server connection failed, falling back to local state:', err);
      // If offline, check local cache status
      if (cached.status === 'suspended') {
        setIsSuspended(true);
      }
      setLicense(cached);
    } finally {
      setIsChecked(true);
    }
  }, []);

  // Run on mount
  useEffect(() => {
    verifyLiveStatus();

    // Re-verify when window regains focus (e.g. after owner updates/deletes key in Neon dashboard)
    const handleFocus = () => {
      verifyLiveStatus();
    };
    window.addEventListener('focus', handleFocus);

    // Periodic heartbeat check every 30 seconds
    const interval = setInterval(() => {
      verifyLiveStatus();
    }, 30000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [verifyLiveStatus]);

  // While checking initial state (brief fraction of second)
  if (!isChecked) {
    return (
      <div className="fixed inset-0 z-999 bg-neutral-950 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#C41E3A] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-neutral-400">Verifying central license guard...</span>
        </div>
      </div>
    );
  }

  // If not activated, suspended, or key was deleted in Neon
  if (!license || license.status !== 'active' || isSuspended) {
    return (
      <CentralLicenseLockScreen
        isSuspendedMode={isSuspended || license?.status === 'suspended'}
        suspendedLicense={license}
        initialErrorMessage={revokedMessage}
        onActivated={(newLic) => {
          setLicense(newLic);
          setIsSuspended(false);
          setRevokedMessage(null);
          saveStoredCentralLicense(newLic);
        }}
        onRetryHeartbeat={verifyLiveStatus}
      />
    );
  }

  // Active & verified license: render application
  return <>{children}</>;
};
