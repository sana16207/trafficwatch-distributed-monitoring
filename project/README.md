# TRAFFICWATCH — Distributed Traffic Monitoring System

**Group 19 — Distributed Computing Project**

A real-time distributed traffic monitoring system where four independent monitoring nodes collect traffic data and report to a central server via REST APIs. The server stores data in SQLite and a React dashboard visualizes everything live.

---

## 1. Project Overview

TRAFFICWATCH simulates a smart-city traffic monitoring network. Four traffic monitoring nodes are deployed across a city. Each node independently collects traffic data (vehicle count, average speed, density) and sends it to a central Express server via REST API. The server classifies traffic, stores readings in SQLite, generates alerts for high traffic, and tracks node heartbeats for online/offline detection. A React dashboard polls the server and displays everything in real time.

## 2. Distributed Computing Concept

This project demonstrates distributed monitoring: multiple independent data sources (nodes) communicating with a central server over a network (HTTP/REST). Each node operates independently — it can be started, stopped, and restarted without affecting the others. The central server aggregates data from all nodes and provides a unified view.

Key distributed concepts shown:
- **Independent nodes** — each node runs its own monitoring loop
- **Network communication** — nodes communicate with the server via REST/JSON
- **Heartbeat mechanism** — the server detects when a node stops responding
- **Central aggregation** — the server collects and processes data from all nodes
- **Fault tolerance** — if one node goes offline, others continue operating

## 3. Problem Statement

Traditional traffic monitoring relies on a single point of data collection. In a real smart city, traffic sensors are distributed across many intersections. A centralized monitoring system must aggregate data from all these independent sources, detect when sensors go offline, and alert operators when traffic conditions become critical.

This project simulates that architecture using software-based monitoring nodes instead of physical sensors.

## 4. System Architecture

```
NODE-01 (Gandhipuram) ─┐
NODE-02 (Ukkadam)     ─┤
NODE-03 (Peelamedu)   ─┼──→ REST API (HTTP/JSON) ──→ EXPRESS SERVER (Node.js)
NODE-04 (Singanallur) ─┘                                    ↓
                                                      SQLite Database
                                                            ↓
                                                      REST API / JSON
                                                            ↓
                                                     React Dashboard (Vite)
```

## 5. Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite (via Prisma ORM) |
| Communication | REST APIs / JSON |

## 6. Folder Structure

```
trafficwatch/
├── package.json              # Root scripts (dev, build, setup)
├── vite.config.ts            # Vite config + API proxy to :4000
├── tailwind.config.js
├── src/                      # Frontend (React)
│   ├── App.tsx
│   ├── components/           # Sidebar, KpiCard, LocationCard, etc.
│   ├── pages/                # Dashboard, TrafficMap, NodeSimulator, etc.
│   ├── hooks/                # useDashboardData, useAlerts, useSettings
│   ├── services/             # api.ts (REST + Supabase fallback)
│   └── types/
├── backend/                  # Backend (Express + Prisma + SQLite)
│   ├── package.json
│   ├── .env                  # DATABASE_URL, PORT
│   ├── prisma/
│   │   ├── schema.prisma      # Node, TrafficReading, Alert models
│   │   └── dev.db             # SQLite database (auto-created)
│   └── src/
│       ├── index.ts          # Express app + auto-seed
│       ├── config.ts         # Thresholds, heartbeat timeout, classifier
│       ├── db.ts             # Prisma client
│       ├── seed.ts           # Seed script (sample readings + alert)
│       └── routes/           # health, nodes, traffic, alerts, dashboard, analytics
└── README.md
```

## 7. Installation

```bash
# 1. Clone or download and extract the ZIP
cd trafficwatch

# 2. Install all dependencies (frontend + backend)
npm run install:all

# 3. Initialize the SQLite database and seed sample data
npm run setup
```

This will:
- Install frontend dependencies (`npm install`)
- Install backend dependencies (`cd backend && npm install`)
- Generate Prisma client (`npx prisma generate`)
- Create SQLite database + tables (`npx prisma db push`)
- Seed 4 nodes, sample readings, and 1 alert (`npm run seed`)

## 8. Running the Application

```bash
# Start both frontend and backend together
npm run dev
```

- **Frontend** runs on `http://localhost:5173`
- **Backend** runs on `http://localhost:4000`
- Vite proxies `/api/*` requests to the Express backend automatically

Or run them separately:
```bash
# Terminal 1 — Backend
npm run dev:backend

# Terminal 2 — Frontend
npm run dev:frontend
```

## 9. SQLite Setup

SQLite is embedded — no database server required. The database file is created automatically at `backend/prisma/dev.db` when you run `npm run setup`.

On first backend startup, if no nodes exist in the database, the server automatically creates the 4 monitoring nodes (OFFLINE status).

To reset the database:
```bash
cd backend
rm prisma/dev.db
npx prisma db push
npm run seed
```

## 10. REST API List

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health, node count, thresholds |
| GET | `/api/nodes` | List all monitoring nodes |
| POST | `/api/nodes` | Create a new node |
| GET | `/api/nodes/:id` | Get a single node |
| POST | `/api/nodes/:id/heartbeat` | Send heartbeat (marks node ONLINE) |
| POST | `/api/traffic/readings` | Submit a traffic reading |
| GET | `/api/traffic/latest` | Latest reading per node |
| GET | `/api/traffic/history` | Historical readings (filterable) |
| GET | `/api/traffic/summary` | Aggregate statistics |
| GET | `/api/alerts` | List alerts (filter by resolved) |
| PATCH | `/api/alerts/:id/resolve` | Mark alert as resolved |
| GET | `/api/dashboard` | Aggregated dashboard data |
| GET | `/api/analytics` | Analytics data (charts) |

## 11. Node Simulator

The **Node Simulator** page lets you control 4 independent traffic monitoring nodes. Each node can:

- **Start Auto** — begins sending traffic readings + heartbeats every 5 seconds
- **Stop** — stops the monitoring loop (heartbeat stops, node goes OFFLINE after timeout)
- **Send Data** — manually send a single reading with custom vehicle count and speed
- **Start All / Stop All** — control all 4 nodes at once

When a node is running, it:
1. Generates a random traffic reading (vehicle count varies, speed inversely correlated)
2. Sends it to `POST /api/traffic/readings`
3. The server classifies traffic, stores the reading, and updates the heartbeat

## 12. Heartbeat Mechanism

- When a node sends a reading or heartbeat, the server updates `lastHeartbeat`
- The server considers a node **ONLINE** if its last heartbeat was within `HEARTBEAT_TIMEOUT_MS` (15 seconds default)
- If a node is stopped and no heartbeat arrives within the timeout, the dashboard shows it as **OFFLINE**
- Restarting a node resumes heartbeat and traffic reporting

## 13. Traffic Classification

| Vehicle Count | Status | Density |
|--------------|--------|---------|
| < 30 | LOW | Light |
| 30–70 | MEDIUM | Moderate |
| > 70 | HIGH | Heavy |

## 14. Alert Mechanism

When a traffic reading is classified as **HIGH** (> 70 vehicles), the server:
1. Checks if there's already an unresolved HIGH_TRAFFIC alert for that node
2. If not, creates a new alert with severity CRITICAL
3. The alert appears on the Alerts page and the Dashboard KPI counter
4. Alerts can be resolved manually from the Alerts page

## 15. Demo Procedure

**Step 1:** Start the backend and frontend
```bash
npm run dev
```

**Step 2:** Open `http://localhost:5173` — Dashboard loads

**Step 3:** Go to **Node Simulator** page

**Step 4:** Click **Start All** — all 4 nodes begin sending readings

**Step 5:** Go to **Dashboard** — verify 4/4 nodes ONLINE

**Step 6:** Go back to **Node Simulator**, set NODE-02 (Ukkadam) vehicle count to 100, click **Send Data**

**Expected:**
- Ukkadam shows HIGH traffic
- A HIGH traffic alert is generated
- The reading appears in Traffic History
- Dashboard updates to show the HIGH traffic zone

**Step 7:** Click **Stop** on NODE-03 (Peelamedu), wait ~15 seconds

**Expected:**
- Peelamedu shows OFFLINE
- Dashboard shows 3/4 nodes ONLINE

**Step 8:** Click **Start Auto** on NODE-03

**Expected:**
- Peelamedu comes back ONLINE
- Dashboard shows 4/4 nodes ONLINE

## 16. Expected Output

- **Dashboard:** KPI cards showing total vehicles, active nodes, high traffic zones, active alerts. Live location cards with traffic status. System status bar with animated indicators.
- **Traffic Map:** 4 nodes spread across a road network (upper-left, lower-left, upper-right, lower-right) with animated vehicles and traffic light indicators.
- **Monitoring Nodes:** Detailed cards per node with heartbeat timing and latest readings.
- **Node Simulator:** Interactive controls for each node with real-time response feedback.
- **Analytics:** Line charts (vehicle count & speed over time), bar charts (traffic by location, node activity), pie chart (status distribution).
- **Traffic History:** Sortable, filterable table of all readings.
- **Alerts:** Active and resolved alerts with resolve functionality.
- **System Architecture:** Visual diagram of the distributed system.

## 17. Production Build

```bash
# Frontend only
npm run build

# Frontend + Backend
npm run build:full
```

## 18. Notes

- The Supabase adapter code (`src/services/supabaseApi.ts`) exists only as a fallback for Bolt Preview where the Express backend is unreachable. It is not required for local execution.
- Settings page changes (thresholds, timeout) are saved in browser localStorage for display reference. The backend uses its own configured thresholds for classification.
- The SQLite database file (`backend/prisma/dev.db`) is auto-created and should not be committed to git.
