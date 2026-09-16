import { MapPin, Gauge, Car, Clock } from 'lucide-react';
import type { LatestReading } from '@/types';
import { StatusBadge, OnlineBadge } from './StatusBadge';

export function LocationCard({ node }: { node: LatestReading }) {
  const r = node.latestReading;
  const secondsAgo = r ? Math.floor((Date.now() - new Date(r.recordedAt).getTime()) / 1000) : null;

  const statusColor = r?.trafficStatus === 'HIGH' ? 'border-l-red-500' : r?.trafficStatus === 'MEDIUM' ? 'border-l-amber-500' : 'border-l-green-500';
  const barColor = r?.trafficStatus === 'HIGH' ? 'bg-red-500' : r?.trafficStatus === 'MEDIUM' ? 'bg-amber-500' : 'bg-green-500';
  const barWidth = r ? Math.min(100, (r.vehicleCount / 120) * 100) : 0;

  return (
    <div className={`group relative overflow-hidden rounded-xl bg-asphalt-900 border border-asphalt-800 border-l-4 ${statusColor} p-5 shadow-lg transition-all duration-300 hover:border-asphalt-700 hover:shadow-xl card-glow hover:-translate-y-0.5`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-asphalt-400 mb-1">
            <MapPin size={14} className="text-amber-400/70" />
            <span className="text-xs font-medium font-mono">{node.nodeCode}</span>
          </div>
          <h3 className="text-lg font-bold text-white">{node.locationName}</h3>
        </div>
        <OnlineBadge isOnline={node.isOnline} />
      </div>

      {r ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-asphalt-300">
              <Car size={16} className="text-asphalt-500" />
              <span className="text-sm">{r.vehicleCount} Vehicles</span>
            </div>
            <div className="flex items-center gap-2 text-asphalt-300">
              <Gauge size={16} className="text-asphalt-500" />
              <span className="text-sm">{r.averageSpeed.toFixed(1)} km/h</span>
            </div>
          </div>

          {/* Traffic density bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-asphalt-500 uppercase tracking-wider">
              <span>Traffic Load</span>
              <span>{r.density}</span>
            </div>
            <div className="h-1.5 rounded-full bg-asphalt-800 overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <StatusBadge status={r.trafficStatus} />
            <div className="flex items-center gap-1.5 text-xs text-asphalt-500">
              <Clock size={12} />
              <span>{secondsAgo !== null ? `${secondsAgo}s ago` : 'No data'}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-asphalt-500 py-4 text-center">No readings yet</div>
      )}
    </div>
  );
}
