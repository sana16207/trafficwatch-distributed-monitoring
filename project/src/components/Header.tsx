import { Wifi, Database, Clock, Activity } from 'lucide-react';

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <p className="text-sm text-asphalt-400">{subtitle}</p>
      </div>
    </div>
  );
}

export function SystemStatusBar({
  nodesOnline,
  totalNodes,
  lastPacketAt,
}: {
  nodesOnline: number;
  totalNodes: number;
  lastPacketAt: string | null;
}) {
  const secondsAgo = lastPacketAt ? Math.floor((Date.now() - new Date(lastPacketAt).getTime()) / 1000) : null;
  return (
    <div className="relative overflow-hidden flex flex-wrap items-center gap-4 rounded-xl bg-asphalt-950 px-5 py-3.5 text-white shadow-lg ring-1 ring-asphalt-800/60 border border-asphalt-800">
      {/* Animated data flow line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 data-flow" />

      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
        </span>
        <Wifi size={16} className="text-green-400" />
        <span className="text-sm font-semibold">System Online</span>
      </div>
      <div className="h-4 w-px bg-asphalt-700" />
      <div className="flex items-center gap-2">
        <Activity size={16} className="text-amber-400" />
        <span className="text-sm">{nodesOnline}/{totalNodes} Nodes Active</span>
      </div>
      <div className="h-4 w-px bg-asphalt-700" />
      <div className="flex items-center gap-2">
        <Database size={16} className="text-brand-blue" />
        <span className="text-sm">DB Connected</span>
      </div>
      <div className="h-4 w-px bg-asphalt-700" />
      <div className="flex items-center gap-2">
        <Clock size={16} className="text-asphalt-400" />
        <span className="text-sm">
          {secondsAgo !== null ? `Last update: ${secondsAgo}s ago` : 'No data yet'}
        </span>
      </div>
    </div>
  );
}
