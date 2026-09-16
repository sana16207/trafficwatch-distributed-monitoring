import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/services/api';
import type { Alert } from '@/types';

export function useAlerts(refreshIntervalSec: number) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchAlerts = useCallback(async () => {
    try {
      const data = await api.getAlerts();
      if (mountedRef.current) {
        setAlerts(data);
        setError(null);
        setLoading(false);
      }
    } catch (e: any) {
      if (mountedRef.current) {
        setError(e.message || 'Failed to load alerts');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchAlerts();
    const interval = setInterval(fetchAlerts, Math.max(2, refreshIntervalSec) * 1000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchAlerts, refreshIntervalSec]);

  const resolveAlert = useCallback(async (id: number) => {
    try {
      await api.resolveAlert(id);
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, resolved: true, resolvedAt: new Date().toISOString() } : a)));
    } catch (e: any) {
      setError(e.message);
    }
  }, []);

  return { alerts, loading, error, refetch: fetchAlerts, resolveAlert };
}
