import type { LucideIcon } from 'lucide-react';

export function KpiCard({
  label,
  value,
  sublabel,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  accent: 'blue' | 'green' | 'amber' | 'red';
}) {
  const accents = {
    blue: { bg: 'bg-brand-blue/10', text: 'text-brand-blue', icon: 'text-brand-blue', ring: 'ring-brand-blue/20', glow: 'group-hover:shadow-glow-blue', bar: 'from-brand-blue/40', gradient: 'from-brand-blue/20 to-transparent' },
    green: { bg: 'bg-green-500/10', text: 'text-green-400', icon: 'text-green-400', ring: 'ring-green-500/20', glow: 'group-hover:shadow-glow-green', bar: 'from-green-500/40', gradient: 'from-green-500/20 to-transparent' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', icon: 'text-amber-400', ring: 'ring-amber-500/20', glow: 'group-hover:shadow-glow-amber', bar: 'from-amber-500/40', gradient: 'from-amber-500/20 to-transparent' },
    red: { bg: 'bg-red-500/10', text: 'text-red-400', icon: 'text-red-400', ring: 'ring-red-500/20', glow: 'group-hover:shadow-glow-red', bar: 'from-red-500/40', gradient: 'from-red-500/20 to-transparent' },
  };
  const a = accents[accent];
  return (
    <div className={`group relative overflow-hidden rounded-xl bg-asphalt-900 border border-asphalt-800 p-5 shadow-lg transition-all duration-300 hover:border-asphalt-700 ${a.glow} hover:-translate-y-0.5`}>
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${a.bar} to-transparent`} />
      {/* Corner gradient glow */}
      <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-radial ${a.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-asphalt-400">{label}</p>
          <p className={`text-3xl font-bold mt-1 ${a.text} number-glow`}>{value}</p>
          {sublabel && <p className="text-xs text-asphalt-500 mt-1">{sublabel}</p>}
        </div>
        <div className={`h-12 w-12 rounded-xl ${a.bg} flex items-center justify-center ring-1 ${a.ring} transition-transform duration-300 group-hover:scale-110`}>
          <Icon size={24} className={a.icon} />
        </div>
      </div>
    </div>
  );
}
