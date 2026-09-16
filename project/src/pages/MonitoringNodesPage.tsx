import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { LatestReading } from '@/types';
import { OnlineBadge, StatusBadge } from '@/components/StatusBadge';
import { Radio, Gauge, Car, Clock, Heart, Signal } from 'lucide-react';

export function MonitoringNodesPage({ refreshIntervalSec }: { refreshIntervalSec: number }) {
  const [nodes, setNodes] = useState<Record<string, LatestReading>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const data = await api.getLatest();
        if (mounted) { setNodes(data); setError(null); setLoading(false); }
      } catch (e: any) {
        if (mounted) { setError(e.message); setLoading(false); }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, Math.max(2, refreshIntervalSec) * 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, [refreshIntervalSec]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 rounded-full border-2 border-asphalt-700 border-t-brand-blue animate-spin" />
    </div>
  );

  if (error && Object.keys(nodes).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
          <Signal size={28} className="text-red-400" />
        </div>
        <p className="text-red-400 font-medium">Unable to connect to monitoring server.</p>
      </div>
    );
  }

  const nodeList = Object.values(nodes);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="h-5 w-1 rounded-full bg-amber-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Monitoring Nodes</h2>
          <p className="text-sm text-asphalt-400">All distributed traffic monitoring nodes</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm text-amber-400">
          Connection issue: {error}. Showing last known data.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {nodeList.map((node) => {
          const r = node.latestReading;
          const heartbeatSeconds = node.lastHeartbeat
            ? Math.floor((Date.now() - new Date(node.lastHeartbeat).getTime()) / 1000)
            : null;
          const readingSeconds = r ? Math.floor((Date.now() - new Date(r.recordedAt).getTime()) / 1000) : null;

          return (
            <div key={node.id} className={`rounded-xl bg-asphalt-900 border p-5 shadow-lg transition-all duration-300 hover:shadow-xl card-glow ${
              node.isOnline ? 'border-asphalt-800' : 'border-red-500/30'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ring-1 ${
                    node.isOnline
                      ? 'bg-green-500/10 ring-green-500/20'
                      : 'bg-red-500/10 ring-red-500/20'
                  }`}>
                    <Radio size={20} className={node.isOnline ? 'text-green-400' : 'text-red-400'} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white font-mono">{node.nodeCode}</h3>
                    <p className="text-sm text-asphalt-400">{node.locationName}</p>
                  </div>
                </div>
                <OnlineBadge isOnline={node.isOnline} />
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-asphalt-800/50 rounded-lg px-3 py-2 ring-1 ring-asphalt-800/50">
                  <div className="flex items-center gap-1.5 text-asphalt-500 text-xs mb-0.5">
                    <Car size={12} /> Vehicles
                  </div>
                  <p className="font-semibold text-white">{r?.vehicleCount ?? '—'}</p>
                </div>
                <div className="bg-asphalt-800/50 rounded-lg px-3 py-2 ring-1 ring-asphalt-800/50">
                  <div className="flex items-center gap-1.5 text-asphalt-500 text-xs mb-0.5">
                    <Gauge size={12} /> Avg Speed
                  </div>
                  <p className="font-semibold text-white">{r ? `${r.averageSpeed.toFixed(1)} km/h` : '—'}</p>
                </div>
                <div className="bg-asphalt-800/50 rounded-lg px-3 py-2 ring-1 ring-asphalt-800/50">
                  <div className="text-asphalt-500 text-xs mb-0.5">Traffic Status</div>
                  {r ? <StatusBadge status={r.trafficStatus} /> : <span className="text-asphalt-500">—</span>}
                </div>
                <div className="bg-asphalt-800/50 rounded-lg px-3 py-2 ring-1 ring-asphalt-800/50">
                  <div className="flex items-center gap-1.5 text-asphalt-500 text-xs mb-0.5">
                    <Heart size={12} /> Heartbeat
                  </div>
                  <p className="font-semibold text-white">
                    {heartbeatSeconds !== null ? `${heartbeatSeconds}s ago` : 'Never'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-asphalt-500 mt-3 pt-3 border-t border-asphalt-800">
                <Clock size={12} />
                <span>Last data: {readingSeconds !== null ? `${readingSeconds}s ago` : 'No readings'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
