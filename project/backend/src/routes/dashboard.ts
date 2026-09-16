import { Router, type Request, type Response } from "express";
import { prisma } from "../db.js";
import { isNodeOnline, HEARTBEAT_TIMEOUT_MS } from "../config.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const nodes = await prisma.node.findMany({ orderBy: { id: "asc" } });
  const totalPackets = await prisma.trafficReading.count();
  const latestReading = await prisma.trafficReading.findFirst({
    orderBy: { recordedAt: "desc" },
  });
  const unresolvedAlerts = await prisma.alert.count({ where: { resolved: false } });
  const highTrafficZones = await prisma.trafficReading.findMany({
    where: { trafficStatus: "HIGH" },
    include: { node: true },
    orderBy: { recordedAt: "desc" },
  });
  const recentHighLocationIds = new Set<number>();
  for (const r of highTrafficZones) {
    if (r.node && isNodeOnline(r.node.lastHeartbeat)) {
      const isRecent = Date.now() - r.recordedAt.getTime() < 60_000;
      if (isRecent) recentHighLocationIds.add(r.nodeId);
    }
  }

  const nodeSummaries = await Promise.all(
    nodes.map(async (n) => {
      const latest = await prisma.trafficReading.findFirst({
        where: { nodeId: n.id },
        orderBy: { recordedAt: "desc" },
      });
      const online = isNodeOnline(n.lastHeartbeat);
      return {
        ...n,
        isOnline: online,
        latestReading: latest,
      };
    })
  );

  const onlineCount = nodeSummaries.filter((n) => n.isOnline).length;
  const totalVehicles = nodeSummaries.reduce((sum, n) => {
    if (n.isOnline && n.latestReading) return sum + n.latestReading.vehicleCount;
    return sum;
  }, 0);

  res.json({
    serverStatus: "ONLINE",
    databaseStatus: "CONNECTED",
    nodesOnline: onlineCount,
    totalNodes: nodes.length,
    totalVehicles,
    highTrafficZones: recentHighLocationIds.size,
    activeAlerts: unresolvedAlerts,
    dataPacketsReceived: totalPackets,
    lastPacketAt: latestReading?.recordedAt ?? null,
    heartbeatTimeoutMs: HEARTBEAT_TIMEOUT_MS,
    nodes: nodeSummaries,
  });
});

export default router;
