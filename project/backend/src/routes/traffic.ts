import { Router, type Request, type Response } from "express";
import { prisma } from "../db.js";
import { classifyTraffic, TRAFFIC_THRESHOLDS } from "../config.js";

const router = Router();

router.post("/readings", async (req: Request, res: Response) => {
  const { nodeId, vehicleCount, averageSpeed } = req.body;
  if (nodeId === undefined || vehicleCount === undefined || averageSpeed === undefined) {
    res.status(400).json({ error: "nodeId, vehicleCount, and averageSpeed are required" });
    return;
  }
  const id = parseInt(nodeId);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid nodeId" });
    return;
  }
  const vc = parseInt(vehicleCount);
  const as = parseFloat(averageSpeed);
  if (isNaN(vc) || isNaN(as) || vc < 0 || as < 0) {
    res.status(400).json({ error: "Invalid vehicleCount or averageSpeed" });
    return;
  }
  const node = await prisma.node.findUnique({ where: { id } });
  if (!node) {
    res.status(404).json({ error: "Node not found" });
    return;
  }
  const { status, density } = classifyTraffic(vc);
  const reading = await prisma.trafficReading.create({
    data: { nodeId: id, vehicleCount: vc, averageSpeed: as, density, trafficStatus: status },
  });
  await prisma.node.update({
    where: { id },
    data: { lastHeartbeat: new Date(), status: "ONLINE" },
  });

  if (status === "HIGH") {
    const existingUnresolved = await prisma.alert.findFirst({
      where: { nodeId: id, resolved: false, alertType: "HIGH_TRAFFIC" },
    });
    if (!existingUnresolved) {
      await prisma.alert.create({
        data: {
          nodeId: id,
          locationName: node.locationName,
          alertType: "HIGH_TRAFFIC",
          severity: "CRITICAL",
          message: `High traffic detected at ${node.locationName}`,
        },
      });
    }
  }

  res.status(201).json(reading);
});

router.get("/latest", async (_req: Request, res: Response) => {
  const nodes = await prisma.node.findMany({ orderBy: { id: "asc" } });
  const latest: Record<number, typeof nodes[0] & { latestReading: any }> = {};
  for (const node of nodes) {
    const reading = await prisma.trafficReading.findFirst({
      where: { nodeId: node.id },
      orderBy: { recordedAt: "desc" },
    });
    latest[node.id] = { ...node, latestReading: reading } as any;
  }
  res.json(latest);
});

router.get("/history", async (req: Request, res: Response) => {
  const { location, status, limit } = req.query;
  const take = limit ? Math.min(parseInt(limit as string) || 100, 500) : 100;
  const where: any = {};
  if (location && location !== "ALL") {
    where.node = { locationName: location as string };
  }
  if (status && status !== "ALL") {
    where.trafficStatus = status as string;
  }
  const readings = await prisma.trafficReading.findMany({
    where,
    include: { node: true },
    orderBy: { recordedAt: "desc" },
    take,
  });
  res.json(
    readings.map((r) => ({
      id: r.id,
      nodeId: r.nodeId,
      location: r.node.locationName,
      nodeCode: r.node.nodeCode,
      vehicleCount: r.vehicleCount,
      averageSpeed: r.averageSpeed,
      density: r.density,
      trafficStatus: r.trafficStatus,
      recordedAt: r.recordedAt,
    }))
  );
});

router.get("/summary", async (_req: Request, res: Response) => {
  const totalReadings = await prisma.trafficReading.count();
  const totalVehicles = await prisma.trafficReading.aggregate({ _sum: { vehicleCount: true } });
  const avgSpeed = await prisma.trafficReading.aggregate({ _avg: { averageSpeed: true } });
  const statusCounts = await prisma.trafficReading.groupBy({
    by: ["trafficStatus"],
    _count: true,
  });
  res.json({
    totalReadings,
    totalVehicles: totalVehicles._sum.vehicleCount || 0,
    avgSpeed: avgSpeed._avg.averageSpeed || 0,
    statusCounts,
    thresholds: TRAFFIC_THRESHOLDS,
  });
});

export default router;
