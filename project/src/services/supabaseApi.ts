import { supabase } from './supabaseClient';
import type {
  Node,
  TrafficReading,
  Alert,
  DashboardData,
  HealthData,
  HistoryEntry,
  AnalyticsData,
  LatestReading,
  TrafficStatus,
} from '@/types';

const TRAFFIC_THRESHOLDS = { LOW: 30, HIGH: 70 };
const HEARTBEAT_TIMEOUT_MS = 15_000;

function classifyTraffic(vehicleCount: number): { status: string; density: string } {
  if (vehicleCount < TRAFFIC_THRESHOLDS.LOW) return { status: 'LOW', density: 'Light' };
  if (vehicleCount <= TRAFFIC_THRESHOLDS.HIGH) return { status: 'MEDIUM', density: 'Moderate' };
  return { status: 'HIGH', density: 'Heavy' };
}

function isNodeOnline(lastHeartbeat: string | null): boolean {
  if (!lastHeartbeat) return false;
  return Date.now() - new Date(lastHeartbeat).getTime() < HEARTBEAT_TIMEOUT_MS;
}

function mapNode(row: any): Node {
  return {
    id: row.id,
    nodeCode: row.node_code,
    locationName: row.location_name,
    latitude: row.latitude,
    longitude: row.longitude,
    status: row.status,
    lastHeartbeat: row.last_heartbeat,
    createdAt: row.created_at,
    isOnline: isNodeOnline(row.last_heartbeat),
  };
}

function mapReading(row: any): TrafficReading {
  return {
    id: row.id,
    nodeId: row.node_id,
    vehicleCount: row.vehicle_count,
    averageSpeed: row.average_speed,
    density: row.density,
    trafficStatus: row.traffic_status as TrafficStatus,
    recordedAt: row.recorded_at,
  };
}

export const supabaseApi = {
  async health(): Promise<HealthData> {
    const { count: totalReadings } = await supabase
      .from('traffic_readings')
      .select('*', { count: 'exact', head: true });
    const { count: unresolvedAlerts } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false);
    const { data: nodes } = await supabase.from('nodes').select('*');
    const onlineCount = (nodes || []).filter((n: any) => isNodeOnline(n.last_heartbeat)).length;
    const { data: latestReading } = await supabase
      .from('traffic_readings')
      .select('recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    return {
      server: 'ONLINE',
      database: 'CONNECTED',
      nodesOnline: onlineCount,
      totalNodes: nodes?.length || 0,
      totalReadings: totalReadings || 0,
      unresolvedAlerts: unresolvedAlerts || 0,
      lastPacketAt: latestReading?.recorded_at || null,
      thresholds: TRAFFIC_THRESHOLDS,
      heartbeatTimeoutMs: HEARTBEAT_TIMEOUT_MS,
    };
  },

  async getNodes(): Promise<Node[]> {
    const { data, error } = await supabase.from('nodes').select('*').order('id', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map(mapNode);
  },

  async getNode(id: number): Promise<Node> {
    const { data, error } = await supabase.from('nodes').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) throw new Error('Node not found');
    return mapNode(data);
  },

  async createNode(data: { nodeCode: string; locationName: string; latitude?: number; longitude?: number }): Promise<Node> {
    const { data: row, error } = await supabase
      .from('nodes')
      .insert({
        node_code: data.nodeCode,
        location_name: data.locationName,
        latitude: data.latitude || 0,
        longitude: data.longitude || 0,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapNode(row);
  },

  async heartbeat(id: number): Promise<Node> {
    const { data, error } = await supabase
      .from('nodes')
      .update({ last_heartbeat: new Date().toISOString(), status: 'ONLINE' })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return mapNode(data);
  },

  async sendReading(data: { nodeId: number; vehicleCount: number; averageSpeed: number }): Promise<TrafficReading> {
    const { status, density } = classifyTraffic(data.vehicleCount);
    const { data: reading, error } = await supabase
      .from('traffic_readings')
      .insert({
        node_id: data.nodeId,
        vehicle_count: data.vehicleCount,
        average_speed: data.averageSpeed,
        density,
        traffic_status: status,
      })
      .select('*')
      .single();
    if (error) throw new Error(error.message);

    await supabase
      .from('nodes')
      .update({ last_heartbeat: new Date().toISOString(), status: 'ONLINE' })
      .eq('id', data.nodeId);

    if (status === 'HIGH') {
      const { data: existing } = await supabase
        .from('alerts')
        .select('id')
        .eq('node_id', data.nodeId)
        .eq('resolved', false)
        .eq('alert_type', 'HIGH_TRAFFIC')
        .maybeSingle();
      if (!existing) {
        const { data: node } = await supabase.from('nodes').select('location_name').eq('id', data.nodeId).maybeSingle();
        if (node) {
          await supabase.from('alerts').insert({
            node_id: data.nodeId,
            location_name: node.location_name,
            alert_type: 'HIGH_TRAFFIC',
            severity: 'CRITICAL',
            message: `High traffic detected at ${node.location_name}`,
          });
        }
      }
    }

    return mapReading(reading);
  },

  async getLatest(): Promise<Record<string, LatestReading>> {
    const { data: nodes, error } = await supabase.from('nodes').select('*').order('id', { ascending: true });
    if (error) throw new Error(error.message);
    const result: Record<string, LatestReading> = {};
    for (const row of nodes || []) {
      const node = mapNode(row);
      const { data: reading } = await supabase
        .from('traffic_readings')
        .select('*')
        .eq('node_id', node.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      result[node.id] = { ...node, latestReading: reading ? mapReading(reading) : null };
    }
    return result;
  },

  async getHistory(params?: { location?: string; status?: string; limit?: number }): Promise<HistoryEntry[]> {
    const limit = params?.limit || 100;
    let query = supabase
      .from('traffic_readings')
      .select('*, nodes!inner(node_code, location_name)')
      .order('recorded_at', { ascending: false })
      .limit(limit);
    if (params?.status && params.status !== 'ALL') {
      query = query.eq('traffic_status', params.status);
    }
    if (params?.location && params.location !== 'ALL') {
      query = query.eq('nodes.location_name', params.location);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map((r: any) => ({
      id: r.id,
      nodeId: r.node_id,
      location: r.nodes?.location_name || 'Unknown',
      nodeCode: r.nodes?.node_code || 'Unknown',
      vehicleCount: r.vehicle_count,
      averageSpeed: r.average_speed,
      density: r.density,
      trafficStatus: r.traffic_status as TrafficStatus,
      recordedAt: r.recorded_at,
    }));
  },

  async getSummary(): Promise<any> {
    const { count: totalReadings } = await supabase
      .from('traffic_readings')
      .select('*', { count: 'exact', head: true });
    const { data: allReadings } = await supabase.from('traffic_readings').select('vehicle_count, average_speed, traffic_status');
    const readings = allReadings || [];
    const totalVehicles = readings.reduce((sum: number, r: any) => sum + r.vehicle_count, 0);
    const avgSpeed = readings.length > 0 ? readings.reduce((sum: number, r: any) => sum + r.average_speed, 0) / readings.length : 0;
    const statusMap: Record<string, number> = {};
    readings.forEach((r: any) => {
      statusMap[r.traffic_status] = (statusMap[r.traffic_status] || 0) + 1;
    });
    const statusCounts = Object.entries(statusMap).map(([trafficStatus, _count]) => ({ trafficStatus, _count }));
    return { totalReadings, totalVehicles, avgSpeed, statusCounts, thresholds: TRAFFIC_THRESHOLDS };
  },

  async getAlerts(resolved?: boolean): Promise<Alert[]> {
    let query = supabase.from('alerts').select('*').order('created_at', { ascending: false });
    if (resolved !== undefined) {
      query = query.eq('resolved', resolved);
    }
    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return (data || []).map((a: any) => ({
      id: a.id,
      nodeId: a.node_id,
      locationName: a.location_name,
      alertType: a.alert_type,
      severity: a.severity,
      message: a.message,
      resolved: a.resolved,
      createdAt: a.created_at,
      resolvedAt: a.resolved_at,
    }));
  },

  async resolveAlert(id: number): Promise<Alert> {
    const { data, error } = await supabase
      .from('alerts')
      .update({ resolved: true, resolved_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw new Error(error.message);
    return {
      id: data.id,
      nodeId: data.node_id,
      locationName: data.location_name,
      alertType: data.alert_type,
      severity: data.severity,
      message: data.message,
      resolved: data.resolved,
      createdAt: data.created_at,
      resolvedAt: data.resolved_at,
    };
  },

  async getDashboard(): Promise<DashboardData> {
    const { data: nodes, error } = await supabase.from('nodes').select('*').order('id', { ascending: true });
    if (error) throw new Error(error.message);
    const { count: totalPackets } = await supabase
      .from('traffic_readings')
      .select('*', { count: 'exact', head: true });
    const { data: latestReadingRow } = await supabase
      .from('traffic_readings')
      .select('recorded_at')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    const { count: unresolvedAlerts } = await supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('resolved', false);

    const nodeSummaries: LatestReading[] = [];
    let totalVehicles = 0;
    let highTrafficZones = 0;

    for (const row of nodes || []) {
      const node = mapNode(row);
      const { data: reading } = await supabase
        .from('traffic_readings')
        .select('*')
        .eq('node_id', node.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      const latestReading = reading ? mapReading(reading) : null;
      nodeSummaries.push({ ...node, latestReading });
      if (node.isOnline && latestReading) {
        totalVehicles += latestReading.vehicleCount;
        if (latestReading.trafficStatus === 'HIGH' &&
            Date.now() - new Date(latestReading.recordedAt).getTime() < 60_000) {
          highTrafficZones++;
        }
      }
    }

    const onlineCount = nodeSummaries.filter((n) => n.isOnline).length;

    return {
      serverStatus: 'ONLINE',
      databaseStatus: 'CONNECTED',
      nodesOnline: onlineCount,
      totalNodes: nodeSummaries.length,
      totalVehicles,
      highTrafficZones,
      activeAlerts: unresolvedAlerts || 0,
      dataPacketsReceived: totalPackets || 0,
      lastPacketAt: latestReadingRow?.recorded_at || null,
      heartbeatTimeoutMs: HEARTBEAT_TIMEOUT_MS,
      nodes: nodeSummaries,
    };
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const { data: nodes } = await supabase.from('nodes').select('*').order('id', { ascending: true });
    const { data: readings } = await supabase
      .from('traffic_readings')
      .select('*, nodes!inner(node_code, location_name)')
      .order('recorded_at', { ascending: false })
      .limit(200);

    const byLocation: Record<string, TrafficReading[]> = {};
    const statusMap: Record<string, number> = {};
    const nodeActivityMap: Record<number, number> = {};
    const trafficByLocation: any[] = [];

    for (const r of readings || []) {
      const loc = (r as any).nodes?.location_name || 'Unknown';
      if (!byLocation[loc]) byLocation[loc] = [];
      if (byLocation[loc].length < 50) byLocation[loc].push(mapReading(r));
      statusMap[r.traffic_status] = (statusMap[r.traffic_status] || 0) + 1;
      nodeActivityMap[r.node_id] = (nodeActivityMap[r.node_id] || 0) + 1;
    }

    for (const n of nodes || []) {
      const { data: latest } = await supabase
        .from('traffic_readings')
        .select('*')
        .eq('node_id', n.id)
        .order('recorded_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      trafficByLocation.push({
        location: n.location_name,
        nodeCode: n.node_code,
        vehicleCount: latest?.vehicle_count || 0,
        averageSpeed: latest?.average_speed || 0,
        trafficStatus: latest?.traffic_status || 'UNKNOWN',
      });
    }

    const statusDistribution = Object.entries(statusMap).map(([trafficStatus, _count]) => ({ trafficStatus, _count }));
    const nodeActivity = (nodes || []).map((n: any) => ({
      nodeCode: n.node_code,
      locationName: n.location_name,
      readingCount: nodeActivityMap[n.id] || 0,
      isOnline: isNodeOnline(n.last_heartbeat),
    }));

    return {
      byLocation,
      statusDistribution,
      nodeActivity,
      trafficByLocation,
      thresholds: TRAFFIC_THRESHOLDS,
      heartbeatTimeoutMs: HEARTBEAT_TIMEOUT_MS,
    };
  },
};
