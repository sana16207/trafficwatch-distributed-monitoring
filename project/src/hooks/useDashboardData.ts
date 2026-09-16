import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/services/api';
import type { DashboardData } from '@/types';

export function useDashboardData(refreshIntervalSec: number) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const dashboard = await api.getDashboard();
      if (mountedRef.current) {
        setData(dashboard);
        setError(null);
        setLoading(false);
      }
    } catch (e: any) {
      if (mountedRef.current) {
        setError(e.message || 'Unable to connect to monitoring server.');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();
    const interval = setInterval(fetchData, Math.max(2, refreshIntervalSec) * 1000);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchData, refreshIntervalSec]);

  return { data, loading, error, refetch: fetchData };
}
