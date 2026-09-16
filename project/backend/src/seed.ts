import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const NODE_DATA = [
  { nodeCode: "NODE-01", locationName: "Gandhipuram", latitude: 11.0168, longitude: 76.9558 },
  { nodeCode: "NODE-02", locationName: "Ukkadam", latitude: 10.9945, longitude: 76.9658 },
  { nodeCode: "NODE-03", locationName: "Peelamedu", latitude: 11.0320, longitude: 77.0247 },
  { nodeCode: "NODE-04", locationName: "Singanallur", latitude: 11.0080, longitude: 77.0200 },
];

function classify(vc: number): { status: string; density: string } {
  if (vc < 30) return { status: "LOW", density: "Light" };
  if (vc <= 70) return { status: "MEDIUM", density: "Moderate" };
  return { status: "HIGH", density: "Heavy" };
}

async function main() {
  console.log("Seeding database...");

  await prisma.alert.deleteMany();
  await prisma.trafficReading.deleteMany();
  await prisma.node.deleteMany();

  for (const nd of NODE_DATA) {
    const node = await prisma.node.create({
      data: { ...nd, status: "ONLINE", lastHeartbeat: new Date() },
    });

    // Generate 24 readings over the last ~2 hours
    let vc = Math.floor(Math.random() * 60) + 20;
    for (let i = 23; i >= 0; i--) {
      const delta = Math.floor(Math.random() * 20) - 10;
      vc = Math.max(5, Math.min(120, vc + delta));
      const speed = Math.max(8, Math.min(60, 60 - vc * 0.4 + Math.random() * 10));
      const { status, density } = classify(vc);
      await prisma.trafficReading.create({
        data: {
          nodeId: node.id,
          vehicleCount: vc,
          averageSpeed: Math.round(speed * 10) / 10,
          density,
          trafficStatus: status,
          recordedAt: new Date(Date.now() - i * 5 * 60 * 1000),
        },
      });
    }
  }

  // Create a sample alert for Ukkadam
  const ukkadam = await prisma.node.findFirst({ where: { locationName: "Ukkadam" } });
  if (ukkadam) {
    await prisma.alert.create({
      data: {
        nodeId: ukkadam.id,
        locationName: "Ukkadam",
        alertType: "HIGH_TRAFFIC",
        severity: "CRITICAL",
        message: "High traffic detected at Ukkadam",
      },
    });
  }

  console.log("Seed complete. 4 nodes, 96 readings, 1 alert created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
