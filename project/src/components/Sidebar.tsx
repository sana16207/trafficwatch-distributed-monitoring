import { Logo } from './StatusBadge';

const NAV_SECTIONS = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
      { id: 'map', label: 'Traffic Map', icon: 'Map' },
    ],
  },
  {
    label: 'Monitoring',
    items: [
      { id: 'nodes', label: 'Monitoring Nodes', icon: 'Radio' },
      { id: 'simulator', label: 'Node Simulator', icon: 'Cpu' },
      { id: 'analytics', label: 'Analytics', icon: 'BarChart3' },
      { id: 'history', label: 'Traffic History', icon: 'History' },
    ],
  },
  {
    label: 'System',
    items: [
      { id: 'alerts', label: 'Alerts', icon: 'Bell' },
      { id: 'architecture', label: 'System Architecture', icon: 'Network' },
      { id: 'settings', label: 'Settings', icon: 'Settings' },
    ],
  },
] as const;

export type PageId = typeof NAV_SECTIONS[number]['items'][number]['id'];

import {
  LayoutDashboard, Map, Radio, Cpu, BarChart3, History, Bell, Network, Settings,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard, Map, Radio, Cpu, BarChart3, History, Bell, Network, Settings,
};

export function Sidebar({ active, onNavigate }: { active: PageId; onNavigate: (id: PageId) => void }) {
  return (
    <aside className="w-64 shrink-0 bg-asphalt-975 text-asphalt-100 flex flex-col h-screen sticky top-0 border-r border-asphalt-800/60">
      {/* Logo + Title + System Online indicator */}
      <div className="px-5 py-5 border-b border-asphalt-800/60">
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight text-white">TRAFFIC<span className="gradient-text">WATCH</span></h1>
            <p className="text-[10px] text-asphalt-400 uppercase tracking-wider">Distributed Monitoring</p>
          </div>
        </div>
        {/* System Online indicator */}
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-1.5 ring-1 ring-green-500/20">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-semibold text-green-400 tracking-wide">SYSTEM ONLINE</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {NAV_SECTIONS.map((section, si) => (
          <div key={si} className="space-y-1">
            {section.label && (
              <p className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-asphalt-500">{section.label}</p>
            )}
            {section.items.map((item) => {
              const Icon = ICONS[item.icon];
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-asphalt-800 text-white shadow-sm'
                      : 'text-asphalt-400 hover:bg-asphalt-800/60 hover:text-asphalt-100'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-gradient-to-b from-amber-400 to-amber-600" />
                  )}
                  <Icon size={18} className={`transition-colors ${isActive ? 'text-amber-400' : 'group-hover:text-asphalt-200'}`} />
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-asphalt-800/60">
        <div className="road-divider mb-3" />
        <p className="text-[10px] text-asphalt-500 font-semibold uppercase tracking-wider">Distributed Monitoring</p>
        <p className="text-xs text-asphalt-400">Group 19</p>
      </div>
    </aside>
  );
}
