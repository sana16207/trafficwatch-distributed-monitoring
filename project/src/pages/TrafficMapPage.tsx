import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { LatestReading } from '@/types';
import { StatusBadge, OnlineBadge } from '@/components/StatusBadge';
import { MapPin, X, Car, Gauge } from 'lucide-react';

const LOCATIONS = [
  { id: 1, nodeCode: 'NODE-01', name: 'Gandhipuram', x: 130, y: 90 },
  { id: 2, nodeCode: 'NODE-02', name: 'Ukkadam', x: 130, y: 330 },
  { id: 3, nodeCode: 'NODE-03', name: 'Peelamedu', x: 670, y: 90 },
  { id: 4, nodeCode: 'NODE-04', name: 'Singanallur', x: 670, y: 330 },
];

const STATUS_COLORS: Record<string, string> = {
  LOW: '#22c55e',
  MEDIUM: '#f59e0b',
  HIGH: '#ef4444',
};

export function TrafficMapPage({ refreshIntervalSec }: { refreshIntervalSec: number }) {
  const [nodes, setNodes] = useState<Record<string, LatestReading>>({});
  const [selected, setSelected] = useState<LatestReading | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const data = await api.getLatest();
        if (mounted) setNodes(data);
      } catch {}
    };
    fetchData();
    const interval = setInterval(fetchData, Math.max(2, refreshIntervalSec) * 1000);
    return () => { mounted = false; clearInterval(interval); };
  }, [refreshIntervalSec]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="h-5 w-1 rounded-full bg-amber-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Traffic Map</h2>
          <p className="text-sm text-asphalt-400">Smart-city traffic control visualization</p>
        </div>
      </div>

      <div className="rounded-xl bg-asphalt-950 p-6 shadow-lg ring-1 ring-asphalt-800/60 border border-asphalt-800 overflow-x-auto">
        <svg viewBox="0 0 800 420" className="w-full min-w-[600px]" style={{ maxHeight: '500px' }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2c3a4e" strokeWidth="0.5" />
            </pattern>
            <filter id="nodeGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width="800" height="420" fill="#121822" rx="12" />
          <rect width="800" height="420" fill="url(#grid)" />

          {/* Roads - wider, more realistic */}
          {[80, 220, 340].map((y) => (
            <line key={`road-h${y}`} x1="0" y1={y} x2="800" y2={y} stroke="#2c3a4e" strokeWidth="32" strokeLinecap="round" />
          ))}
          {[150, 400, 530, 650].map((x) => (
            <line key={`road-v${x}`} x1={x} y1="0" x2={x} y2="420" stroke="#2c3a4e" strokeWidth="32" strokeLinecap="round" />
          ))}

          {/* Lane markings (dashed amber) */}
          {[80, 220, 340].map((y) => (
            <line key={`lane-h${y}`} x1="0" y1={y} x2="800" y2={y} stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="14 10" opacity="0.35" />
          ))}
          {[150, 400, 530, 650].map((x) => (
            <line key={`lane-v${x}`} x1={x} y1="0" x2={x} y2="420" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="14 10" opacity="0.35" />
          ))}

          {/* Intersection highlights */}
          {[80, 220, 340].flatMap((y) =>
            [150, 400, 530, 650].map((x) => (
              <circle key={`junction-${x}-${y}`} cx={x} cy={y} r="6" fill="#364860" opacity="0.5" />
            ))
          )}

          {/* Animated vehicles */}
          {LOCATIONS.map((loc) => {
            const nodeData = nodes[loc.id];
            const status = nodeData?.latestReading?.trafficStatus || 'LOW';
            const count = nodeData?.latestReading?.vehicleCount || 0;
            const numVehicles = Math.min(Math.floor(count / 15), 5);
            return (
              <g key={`veh-${loc.id}`}>
                {Array.from({ length: numVehicles }).map((_, i) => (
                  <circle
                    key={i}
                    cx={loc.x + (i * 12) - 24}
                    cy={loc.y + (i % 2 === 0 ? -6 : 6)}
                    r="3"
                    fill={STATUS_COLORS[status]}
                    opacity="0.85"
                  >
                    <animate
                      attributeName="cx"
                      from={loc.x + (i * 12) - 24}
                      to={loc.x + (i * 12) + 60}
                      dur={`${4 + i}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                ))}
              </g>
            );
          })}

          {/* Nodes */}
          {LOCATIONS.map((loc) => {
            const nodeData = nodes[loc.id];
            const status = nodeData?.latestReading?.trafficStatus || 'UNKNOWN';
            const isOnline = nodeData?.isOnline ?? false;
            const color = STATUS_COLORS[status] || '#7890a8';
            return (
              <g
                key={loc.id}
                onClick={() => nodeData && setSelected(nodeData)}
                style={{ cursor: 'pointer' }}
              >
                {/* Pulse ring */}
                {isOnline && (
                  <circle cx={loc.x} cy={loc.y} r="22" fill="none" stroke={color} strokeWidth="2" opacity="0.4">
                    <animate attributeName="r" from="18" to="34" dur="2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                  </circle>
                )}
                {/* Node circle with glow */}
                <circle cx={loc.x} cy={loc.y} r="16" fill={isOnline ? color : '#425878'} stroke="#fff" strokeWidth="2.5" filter="url(#nodeGlow)" />
                <text x={loc.x} y={loc.y + 4} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
                  {loc.id}
                </text>
                {/* Label */}
                <text x={loc.x} y={loc.y - 28} textAnchor="middle" fill="#e8edf2" fontSize="12" fontWeight="600">
                  {loc.name}
                </text>
                {/* Traffic light indicator */}
                <g transform={`translate(${loc.x + 18}, ${loc.y - 18})`}>
                  <rect width="10" height="24" rx="2" fill="#121822" stroke="#364860" strokeWidth="1" />
                  <circle cx="5" cy="6" r="2.5" fill={status === 'HIGH' ? '#ef4444' : '#2c3a4e'} />
                  <circle cx="5" cy="12" r="2.5" fill={status === 'MEDIUM' ? '#f59e0b' : '#2c3a4e'} />
                  <circle cx="5" cy="18" r="2.5" fill={status === 'LOW' ? '#22c55e' : '#2c3a4e'} />
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-sm text-asphalt-400 flex items-center gap-1.5">
        <MapPin size={14} className="text-amber-400" />
        Click any node on the map to view its real-time traffic information.
      </p>

      {/* Selected node detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-asphalt-900 rounded-xl shadow-2xl max-w-md w-full p-6 animate-slide-up ring-1 ring-asphalt-700/50 border border-asphalt-800" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-asphalt-800 flex items-center justify-center ring-1 ring-asphalt-700">
                  <MapPin size={20} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">{selected.locationName}</h3>
                  <p className="text-xs text-asphalt-400 font-mono">{selected.nodeCode}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-asphalt-500 hover:text-asphalt-300 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-asphalt-800">
                <span className="text-sm text-asphalt-400">Status</span>
                <OnlineBadge isOnline={selected.isOnline} />
              </div>
              {selected.latestReading && (
                <>
                  <div className="flex items-center justify-between py-2 border-b border-asphalt-800">
                    <span className="text-sm text-asphalt-400 flex items-center gap-1.5"><Car size={14} /> Vehicles</span>
                    <span className="font-semibold text-white">{selected.latestReading.vehicleCount}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-asphalt-800">
                    <span className="text-sm text-asphalt-400 flex items-center gap-1.5"><Gauge size={14} /> Avg Speed</span>
                    <span className="font-semibold text-white">{selected.latestReading.averageSpeed.toFixed(1)} km/h</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-asphalt-800">
                    <span className="text-sm text-asphalt-400">Density</span>
                    <span className="font-semibold text-white">{selected.latestReading.density}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-asphalt-400">Traffic Status</span>
                    <StatusBadge status={selected.latestReading.trafficStatus} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
