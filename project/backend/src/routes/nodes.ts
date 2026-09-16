import { Router, type Request, type Response } from "express";
import { prisma } from "../db.js";
import { isNodeOnline, HEARTBEAT_TIMEOUT_MS } from "../config.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const nodes = await prisma.node.findMany({ orderBy: { id: "asc" } });
  res.json(nodes.map((n) => ({ ...n, isOnline: isNodeOnline(n.lastHeartbeat) })));
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid node id" });
    return;
  }
  const node = await prisma.node.findUnique({ where: { id } });
  if (!node) {
    res.status(404).json({ error: "Node not found" });
    return;
  }
  res.json({ ...node, isOnline: isNodeOnline(node.lastHeartbeat) });
});

router.post("/", async (req: Request, res: Response) => {
  const { nodeCode, locationName, latitude, longitude } = req.body;
  if (!nodeCode || !locationName) {
    res.status(400).json({ error: "nodeCode and locationName are required" });
    return;
  }
  const existing = await prisma.node.findUnique({ where: { nodeCode } });
  if (existing) {
    res.status(409).json({ error: "Node with this code already exists" });
    return;
  }
  const node = await prisma.node.create({
    data: {
      nodeCode,
      locationName,
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
    },
  });
  res.status(201).json(node);
});

router.post("/:id/heartbeat", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid node id" });
    return;
  }
  const node = await prisma.node.findUnique({ where: { id } });
  if (!node) {
    res.status(404).json({ error: "Node not found" });
    return;
  }
  const updated = await prisma.node.update({
    where: { id },
    data: { lastHeartbeat: new Date(), status: "ONLINE" },
  });
  res.json({ ...updated, isOnline: true });
});

export default router;
