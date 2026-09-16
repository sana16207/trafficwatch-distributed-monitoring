import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import healthRouter from "./routes/health.js";
import nodesRouter from "./routes/nodes.js";
import trafficRouter from "./routes/traffic.js";
import alertsRouter from "./routes/alerts.js";
import dashboardRouter from "./routes/dashboard.js";
import analyticsRouter from "./routes/analytics.js";
import { PORT } from "./config.js";

const prisma = new PrismaClient();

const NODE_DATA = [
  { nodeCode: "NODE-01", locationName: "Gandhipuram", latitude: 11.0168, longitude: 76.9558 },
  { nodeCode: "NODE-02", locationName: "Ukkadam", latitude: 10.9945, longitude: 76.9658 },
  { nodeCode: "NODE-03", locationName: "Peelamedu", latitude: 11.0320, longitude: 77.0247 },
  { nodeCode: "NODE-04", locationName: "Singanallur", latitude: 11.0080, longitude: 77.0200 },
];

async function ensureSeed() {
  const count = await prisma.node.count();
  if (count > 0) return;
  console.log("No nodes found — seeding database...");
  for (const nd of NODE_DATA) {
    await prisma.node.create({
      data: { ...nd, status: "OFFLINE", lastHeartbeat: null },
    });
  }
  console.log("Seeded 4 monitoring nodes.");
}

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRouter);
app.use("/api/nodes", nodesRouter);
app.use("/api/traffic", trafficRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/analytics", analyticsRouter);

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  await ensureSeed();
  app.listen(PORT, () => {
    console.log(`TRAFFICWATCH backend running on http://localhost:${PORT}`);
  });
}

start().catch((e) => {
  console.error("Failed to start:", e);
  process.exit(1);
});
