import type {
  Node,
  TrafficReading,
  Alert,
  DashboardData,
  HealthData,
  HistoryEntry,
  AnalyticsData,
  LatestReading,
} from '@/types';
import { supabaseApi } from './supabaseApi';

const BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Detect whether the Express backend is available (local dev with proxy).
// In Bolt preview, the proxy target doesn't exist, so we fall back to Supabase.
let useRestBackend: boolean | null = null;

async function detectBackend(): Promise<boolean> {
  if (useRestBackend !== null) return useRestBackend;
  try {
    const res = await fetch(`${BASE}/health`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000),
    });
    const ct = res.headers.get('content-type') || '';
    useRestBackend = res.ok && ct.includes('application/json');
  } catch {
    useRestBackend = false;
  }
  return useRestBackend;
}

export const api = {
  health: async (): Promise<HealthData> => {
    if (await detectBackend()) return fetchJson<HealthData>(`${BASE}/health`);
    return supabaseApi.health();
  },

  getNodes: async (): Promise<Node[]> => {
    if (await detectBackend()) return fetchJson<Node[]>(`${BASE}/nodes`);
    return supabaseApi.getNodes();
  },

  getNode: async (id: number): Promise<Node> => {
    if (await detectBackend()) return fetchJson<Node>(`${BASE}/nodes/${id}`);
    return supabaseApi.getNode(id);
  },

  createNode: async (data: { nodeCode: string; locationName: string; latitude?: number; longitude?: number }): Promise<Node> => {
    if (await detectBackend()) return fetchJson<Node>(`${BASE}/nodes`, { method: 'POST', body: JSON.stringify(data) });
    return supabaseApi.createNode(data);
  },

  heartbeat: async (id: number): Promise<Node> => {
    if (await detectBackend()) return fetchJson<Node>(`${BASE}/nodes/${id}/heartbeat`, { method: 'POST' });
    return supabaseApi.heartbeat(id);
  },

  sendReading: async (data: { nodeId: number; vehicleCount: number; averageSpeed: number }): Promise<TrafficReading> => {
    if (await detectBackend()) return fetchJson<TrafficReading>(`${BASE}/traffic/readings`, { method: 'POST', body: JSON.stringify(data) });
    return supabaseApi.sendReading(data);
  },

  getLatest: async (): Promise<Record<string, LatestReading>> => {
    if (await detectBackend()) return fetchJson<Record<string, LatestReading>>(`${BASE}/traffic/latest`);
    return supabaseApi.getLatest();
  },

  getHistory: async (params?: { location?: string; status?: string; limit?: number }): Promise<HistoryEntry[]> => {
    if (await detectBackend()) {
      const qs = new URLSearchParams();
      if (params?.location) qs.set('location', params.location);
      if (params?.status) qs.set('status', params.status);
      if (params?.limit) qs.set('limit', String(params.limit));
      return fetchJson<HistoryEntry[]>(`${BASE}/traffic/history?${qs}`);
    }
    return supabaseApi.getHistory(params);
  },

  getSummary: async (): Promise<any> => {
    if (await detectBackend()) return fetchJson<any>(`${BASE}/traffic/summary`);
    return supabaseApi.getSummary();
  },

  getAlerts: async (resolved?: boolean): Promise<Alert[]> => {
    if (await detectBackend()) {
      const qs = resolved !== undefined ? `?resolved=${resolved}` : '';
      return fetchJson<Alert[]>(`${BASE}/alerts${qs}`);
    }
    return supabaseApi.getAlerts(resolved);
  },

  resolveAlert: async (id: number): Promise<Alert> => {
    if (await detectBackend()) return fetchJson<Alert>(`${BASE}/alerts/${id}/resolve`, { method: 'PATCH' });
    return supabaseApi.resolveAlert(id);
  },

  getDashboard: async (): Promise<DashboardData> => {
    if (await detectBackend()) return fetchJson<DashboardData>(`${BASE}/dashboard`);
    return supabaseApi.getDashboard();
  },

  getAnalytics: async (): Promise<AnalyticsData> => {
    if (await detectBackend()) return fetchJson<AnalyticsData>(`${BASE}/analytics`);
    return supabaseApi.getAnalytics();
  },
};
