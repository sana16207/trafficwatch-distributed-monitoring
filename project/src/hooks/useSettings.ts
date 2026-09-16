import { useState, useEffect } from 'react';
import type { AppSettings } from '@/types';

const STORAGE_KEY = 'trafficwatch-settings';

const DEFAULT_SETTINGS: AppSettings = {
  lowThreshold: 30,
  highThreshold: 70,
  heartbeatTimeoutSec: 15,
  refreshIntervalSec: 5,
  demoMode: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {}
    return DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  return { settings, update };
}
