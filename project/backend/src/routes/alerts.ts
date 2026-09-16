import { Router, type Request, type Response } from "express";
import { prisma } from "../db.js";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { resolved } = req.query;
  const where: any = {};
  if (resolved === "true") where.resolved = true;
  if (resolved === "false") where.resolved = false;
  const alerts = await prisma.alert.findMany({
    where,
    include: { node: true },
    orderBy: { createdAt: "desc" },
  });
  res.json(alerts);
});

router.patch("/:id/resolve", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "Invalid alert id" });
    return;
  }
  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert) {
    res.status(404).json({ error: "Alert not found" });
    return;
  }
  const updated = await prisma.alert.update({
    where: { id },
    data: { resolved: true, resolvedAt: new Date() },
  });
  res.json(updated);
});

export default router;
