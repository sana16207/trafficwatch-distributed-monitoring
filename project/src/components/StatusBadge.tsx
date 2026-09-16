import { TrafficCone } from 'lucide-react';
import type { TrafficStatus } from '@/types';

export function StatusBadge({ status }: { status: TrafficStatus | string }) {
  const config: Record<string, { bg: string; text: string; dot: string; label: string; ring: string; glow: string }> = {
    LOW: { bg: 'bg-green-500/15', text: 'text-green-400', dot: 'bg-green-500', label: 'LOW', ring: 'ring-green-500/30', glow: 'shadow-sm shadow-green-500/20' },
    MEDIUM: { bg: 'bg-amber-500/15', text: 'text-amber-400', dot: 'bg-amber-500', label: 'MEDIUM', ring: 'ring-amber-500/30', glow: 'shadow-sm shadow-amber-500/20' },
    HIGH: { bg: 'bg-red-500/15', text: 'text-red-400', dot: 'bg-red-500', label: 'HIGH', ring: 'ring-red-500/30', glow: 'shadow-sm shadow-red-500/20' },
    UNKNOWN: { bg: 'bg-asphalt-700/50', text: 'text-asphalt-400', dot: 'bg-asphalt-500', label: 'UNKNOWN', ring: 'ring-asphalt-600/30', glow: '' },
  };
  const c = config[status] || config.UNKNOWN;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${c.bg} ${c.text} ring-1 ${c.ring} ${c.glow}`}>
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export function OnlineBadge({ isOnline }: { isOnline: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${
      isOnline
        ? 'bg-green-500/15 text-green-400 ring-green-500/30 shadow-sm shadow-green-500/20'
        : 'bg-red-500/15 text-red-400 ring-red-500/30 shadow-sm shadow-red-500/20'
    }`}>
      <span className={`h-2 w-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse glow-green' : 'bg-red-500'}`} />
      {isOnline ? 'ONLINE' : 'OFFLINE'}
    </span>
  );
}

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' };
  const iconSizes = { sm: 18, md: 22, lg: 30 };
  return (
    <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-asphalt-700 to-asphalt-975 flex items-center justify-center shadow-lg ring-1 ring-amber-500/20`}>
      <TrafficCone size={iconSizes[size]} className="text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.4)]" />
    </div>
  );
}
