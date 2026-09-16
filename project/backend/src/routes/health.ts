import { Router, type Request, type Response } from "express";
import { prisma } from "../db.js";
import { isNodeOnline, TRAFFIC_THRESHOLDS, HEARTBEAT_TIMEOUT_MS } from "../config.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const nodes = await prisma.node.findMany({ orderBy: { id: "asc" } });
  const totalReadings = await prisma.trafficReading.count();
  const latestReading = await prisma.trafficReading.findFirst({
    orderBy: { recordedAt: "desc" },
  });
  const unresolvedAlerts = await prisma.alert.count({ where: { resolved: false } });
  const onlineCount = nodes.filter((n) => isNodeOnline(n.lastHeartbeat)).length;
  res.json({
    server: "ONLINE",
    database: "CONNECTED",
    nodesOnline: onlineCount,
    totalNodes: nodes.length,
    totalReadings,
    unresolvedAlerts,
    lastPacketAt: latestReading?.recordedAt ?? null,
    thresholds: TRAFFIC_THRESHOLDS,
    heartbeatTimeoutMs: HEARTBEAT_TIMEOUT_MS,
  });
});

export default router;
