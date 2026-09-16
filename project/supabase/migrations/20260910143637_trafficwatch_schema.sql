/*
# TRAFFICWATCH - Distributed Traffic Monitoring Schema

Creates three tables for the traffic monitoring system:
- `nodes` - traffic monitoring nodes (one per location)
- `traffic_readings` - individual traffic readings from nodes
- `alerts` - traffic alerts generated when traffic is HIGH

This is a single-tenant demo app with no auth, so all tables allow anon + authenticated CRUD.

1. New Tables
- `nodes`: id, node_code, location_name, latitude, longitude, status, last_heartbeat, created_at
- `traffic_readings`: id, node_id (FK), vehicle_count, average_speed, density, traffic_status, recorded_at
- `alerts`: id, node_id (FK), location_name, alert_type, severity, message, resolved, created_at, resolved_at

2. Security
- RLS enabled on all tables
- All tables allow anon + authenticated CRUD (single-tenant, no auth, intentionally public)
*/

CREATE TABLE IF NOT EXISTS nodes (
  id SERIAL PRIMARY KEY,
  node_code TEXT UNIQUE NOT NULL,
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION DEFAULT 0,
  longitude DOUBLE PRECISION DEFAULT 0,
  status TEXT DEFAULT 'OFFLINE',
  last_heartbeat TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_nodes" ON nodes;
CREATE POLICY "anon_select_nodes" ON nodes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_nodes" ON nodes;
CREATE POLICY "anon_insert_nodes" ON nodes FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_nodes" ON nodes;
CREATE POLICY "anon_update_nodes" ON nodes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_nodes" ON nodes;
CREATE POLICY "anon_delete_nodes" ON nodes FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS traffic_readings (
  id SERIAL PRIMARY KEY,
  node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  vehicle_count INTEGER NOT NULL,
  average_speed DOUBLE PRECISION NOT NULL,
  density TEXT NOT NULL,
  traffic_status TEXT NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE traffic_readings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_readings" ON traffic_readings;
CREATE POLICY "anon_select_readings" ON traffic_readings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_readings" ON traffic_readings;
CREATE POLICY "anon_insert_readings" ON traffic_readings FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_readings" ON traffic_readings;
CREATE POLICY "anon_update_readings" ON traffic_readings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_readings" ON traffic_readings;
CREATE POLICY "anon_delete_readings" ON traffic_readings FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_traffic_readings_node_id ON traffic_readings(node_id);
CREATE INDEX IF NOT EXISTS idx_traffic_readings_recorded_at ON traffic_readings(recorded_at);
CREATE INDEX IF NOT EXISTS idx_traffic_readings_status ON traffic_readings(traffic_status);

CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_alerts" ON alerts;
CREATE POLICY "anon_select_alerts" ON alerts FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_alerts" ON alerts;
CREATE POLICY "anon_insert_alerts" ON alerts FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_alerts" ON alerts;
CREATE POLICY "anon_update_alerts" ON alerts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_alerts" ON alerts;
CREATE POLICY "anon_delete_alerts" ON alerts FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_node_id ON alerts(node_id);
CREATE INDEX IF NOT EXISTS idx_alerts_severity ON alerts(severity);