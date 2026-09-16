export const TRAFFIC_THRESHOLDS = {
  LOW: 30,
  HIGH: 70,
};

export const HEARTBEAT_TIMEOUT_MS = 15_000;
export const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

export function classifyTraffic(vehicleCount: number): {
  status: string;
  density: string;
} {
  if (vehicleCount < TRAFFIC_THRESHOLDS.LOW) {
    return { status: "LOW", density: "Light" };
  }
  if (vehicleCount <= TRAFFIC_THRESHOLDS.HIGH) {
    return { status: "MEDIUM", density: "Moderate" };
  }
  return { status: "HIGH", density: "Heavy" };
}

export function isNodeOnline(lastHeartbeat: Date | null): boolean {
  if (!lastHeartbeat) return false;
  return Date.now() - lastHeartbeat.getTime() < HEARTBEAT_TIMEOUT_MS;
}
