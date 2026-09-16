import { Router, type Request, type Response } from "express";
import { prisma } from "../db.js";
import { isNodeOnline, HEARTBEAT_TIMEOUT_MS, TRAFFIC_THRESHOLDS } from "../config.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const nodes = await prisma.node.findMany({ orderBy: { id: "asc" } });
  const readings = await prisma.trafficReading.findMany({
    orderBy: { recordedAt: "desc" },
    take: 200,
    include: { node: true },
  });

  const byLocation: Record<string, any[]> = {};
  for (const r of readings) {
    const loc = r.node.locationName;
    if (!byLocation[loc]) byLocation[loc] = [];
    if (byLocation[loc].length < 50) byLocation[loc].push(r);
  }

  const statusDistribution = await prisma.trafficReading.groupBy({
    by: ["trafficStatus"],
    _count: true,
  });

  const nodeActivity = await Promise.all(
    nodes.map(async (n) => {
      const count = await prisma.trafficReading.count({ where: { nodeId: n.id } });
      return { nodeCode: n.nodeCode, locationName: n.locationName, readingCount: count, isOnline: isNodeOnline(n.lastHeartbeat) };
    })
  );

  const trafficByLocation = await Promise.all(
    nodes.map(async (n) => {
      const latest = await prisma.trafficReading.findFirst({
        where: { nodeId: n.id },
        orderBy: { recordedAt: "desc" },
      });
      return {
        location: n.locationName,
        nodeCode: n.nodeCode,
        vehicleCount: latest?.vehicleCount ?? 0,
        averageSpeed: latest?.averageSpeed ?? 0,
        trafficStatus: latest?.trafficStatus ?? "UNKNOWN",
      };
    })
  );

  res.json({
    byLocation,
    statusDistribution,
    nodeActivity,
    trafficByLocation,
    thresholds: TRAFFIC_THRESHOLDS,
    heartbeatTimeoutMs: HEARTBEAT_TIMEOUT_MS,
  });
});

export default router;
