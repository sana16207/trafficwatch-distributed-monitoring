import { useEffect, useState } from 'react';
import { Car, Radio, AlertTriangle, Flame, Activity, Database, Wifi, Signal, TrendingUp } from 'lucide-react';
import { useDashboardData } from '@/hooks/useDashboardData';
import { KpiCard } from '@/components/KpiCard';
import { LocationCard } from '@/components/LocationCard';
import { SystemStatusBar } from '@/components/Header';

export function DashboardPage({ refreshIntervalSec }: { refreshIntervalSec: number }) {
  const { data, loading, error } = useDashboardData(refreshIntervalSec);
  const [, setTick] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-asphalt-700 border-t-brand-blue animate-spin" />
          <p className="text-asphalt-400 text-sm">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
          <AlertTriangle size={28} className="text-red-400" />
        </div>
        <p className="text-red-400 font-medium">Unable to connect to monitoring server.</p>
        <p className="text-sm text-asphalt-500">Make sure the backend is running on port 4000.</p>
      </div>
    );
  }

  if (!data) return null;

  const lastPacketSeconds = data.lastPacketAt
    ? Math.floor((Date.now() - new Date(data.lastPacketAt).getTime()) / 1000)
    : null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl bg-asphalt-950 border border-asphalt-800 p-6 shadow-lg">
        <div className="absolute -top-20 -right-20 h-48 w-48 rounded-full bg-amber-500/5 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-brand-blue/5 blur-3xl" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-white">TRAFFIC<span className="gradient-text">WATCH</span></h2>
              <span className="relative flex h-2.5 w-2.5 ml-1">
                <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
              </span>
              <span className="text-xs font-semibold text-green-400 tracking-wide">SYSTEM ONLINE</span>
            </div>
            <p className="text-sm text-asphalt-400">Distributed Traffic Monitoring — Real-time control center</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-white number-glow">{data.nodesOnline}<span className="text-asphalt-500 text-xl">/{data.totalNodes}</span></p>
              <p className="text-xs text-asphalt-400 uppercase tracking-wider mt-0.5">Nodes Active</p>
            </div>
            <div className="h-12 w-px bg-asphalt-700" />
            <div className="text-center">
              <p className="text-3xl font-bold text-amber-400 number-glow">{data.dataPacketsReceived}</p>
              <p className="text-xs text-asphalt-400 uppercase tracking-wider mt-0.5">Data Packets</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      <SystemStatusBar
        nodesOnline={data.nodesOnline}
        totalNodes={data.totalNodes}
        lastPacketAt={data.lastPacketAt}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Vehicles" value={data.totalVehicles} icon={Car} accent="blue" />
        <KpiCard label="Active Nodes" value={`${data.nodesOnline} / ${data.totalNodes}`} icon={Radio} accent="green" />
        <KpiCard label="High Traffic Zones" value={data.highTrafficZones} icon={Flame} accent="red" />
        <KpiCard label="Active Alerts" value={data.activeAlerts} icon={AlertTriangle} accent="amber" />
      </div>

      {/* Distributed Monitoring Status Panel */}
      <div className="relative overflow-hidden rounded-xl bg-asphalt-950 text-white p-6 shadow-lg ring-1 ring-asphalt-800/60 border border-asphalt-800">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400/40 via-brand-blue/40 to-transparent" />
        <div className="flex items-center gap-2 mb-4">
          <Activity size={20} className="text-amber-400" />
          <h3 className="text-lg font-bold tracking-wide">DISTRIBUTED MONITORING STATUS</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatusItem label="Nodes Reporting" value={`${data.nodesOnline}/${data.totalNodes}`} icon={<Signal size={14} className="text-green-400" />} />
          <StatusItem label="Data Packets Received" value={data.dataPacketsReceived} icon={<TrendingUp size={14} className="text-brand-blue" />} />
          <StatusItem label="Last Packet" value={lastPacketSeconds !== null ? `${lastPacketSeconds}s ago` : 'N/A'} />
          <StatusItem label="Server" value="ONLINE" icon={<Wifi size={14} className="text-green-400" />} />
          <StatusItem label="Database" value="CONNECTED" icon={<Database size={14} className="text-brand-blue" />} />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm text-amber-400">
          Connection issue: {error}. Showing last known data.
        </div>
      )}

      {/* Live Traffic Locations */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="h-5 w-1 rounded-full bg-gradient-to-b from-amber-400 to-amber-600" />
          <h3 className="text-lg font-bold text-white">Live Traffic Locations</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {data.nodes.map((node) => (
            <LocationCard key={node.id} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="bg-asphalt-900/80 rounded-lg px-4 py-3 ring-1 ring-asphalt-800/50 transition-all hover:ring-asphalt-700/50 hover:bg-asphalt-900">
      <p className="text-xs text-asphalt-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-lg font-bold flex items-center gap-1.5 text-white">
        {icon}
        {value}
      </p>
    </div>
  );
}
