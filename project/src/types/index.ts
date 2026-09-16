export type TrafficStatus = 'LOW' | 'MEDIUM' | 'HIGH';
export type Severity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface Node {
  id: number;
  nodeCode: string;
  locationName: string;
  latitude: number;
  longitude: number;
  status: string;
  lastHeartbeat: string | null;
  createdAt: string;
  isOnline: boolean;
}

export interface TrafficReading {
  id: number;
  nodeId: number;
  vehicleCount: number;
  averageSpeed: number;
  density: string;
  trafficStatus: TrafficStatus;
  recordedAt: string;
}

export interface LatestReading extends Node {
  latestReading: TrafficReading | null;
}

export interface Alert {
  id: number;
  nodeId: number;
  locationName: string;
  alertType: string;
  severity: Severity;
  message: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt: string | null;
}

export interface DashboardData {
  serverStatus: string;
  databaseStatus: string;
  nodesOnline: number;
  totalNodes: number;
  totalVehicles: number;
  highTrafficZones: number;
  activeAlerts: number;
  dataPacketsReceived: number;
  lastPacketAt: string | null;
  heartbeatTimeoutMs: number;
  nodes: LatestReading[];
}

export interface HealthData {
  server: string;
  database: string;
  nodesOnline: number;
  totalNodes: number;
  totalReadings: number;
  unresolvedAlerts: number;
  lastPacketAt: string | null;
  thresholds: { LOW: number; HIGH: number };
  heartbeatTimeoutMs: number;
}

export interface HistoryEntry {
  id: number;
  nodeId: number;
  location: string;
  nodeCode: string;
  vehicleCount: number;
  averageSpeed: number;
  density: string;
  trafficStatus: TrafficStatus;
  recordedAt: string;
}

export interface AnalyticsData {
  byLocation: Record<string, TrafficReading[]>;
  statusDistribution: { trafficStatus: string; _count: number }[];
  nodeActivity: { nodeCode: string; locationName: string; readingCount: number; isOnline: boolean }[];
  trafficByLocation: {
    location: string;
    nodeCode: string;
    vehicleCount: number;
    averageSpeed: number;
    trafficStatus: string;
  }[];
  thresholds: { LOW: number; HIGH: number };
  heartbeatTimeoutMs: number;
}

export interface AppSettings {
  lowThreshold: number;
  highThreshold: number;
  heartbeatTimeoutSec: number;
  refreshIntervalSec: number;
  demoMode: boolean;
}
