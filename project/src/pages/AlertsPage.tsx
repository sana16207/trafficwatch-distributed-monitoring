import { useAlerts } from '@/hooks/useAlerts';
import { StatusBadge } from '@/components/StatusBadge';
import { Bell, CheckCircle, AlertOctagon, AlertTriangle, Info } from 'lucide-react';

const SEVERITY_CONFIG = {
  CRITICAL: { icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', ring: 'ring-red-500/20' },
  WARNING: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', ring: 'ring-amber-500/20' },
  INFO: { icon: Info, color: 'text-brand-blue', bg: 'bg-brand-blue/10', border: 'border-brand-blue/20', ring: 'ring-brand-blue/20' },
};

export function AlertsPage({ refreshIntervalSec }: { refreshIntervalSec: number }) {
  const { alerts, loading, error, resolveAlert } = useAlerts(refreshIntervalSec);

  const unresolved = alerts.filter((a) => !a.resolved);
  const resolved = alerts.filter((a) => a.resolved);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 rounded-full border-2 border-asphalt-700 border-t-brand-blue animate-spin" />
    </div>
  );
  if (error && alerts.length === 0) return <div className="text-red-400 font-medium">Unable to connect to monitoring server.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="h-5 w-1 rounded-full bg-amber-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Alerts</h2>
          <p className="text-sm text-asphalt-400">Automatically generated traffic alerts from the monitoring system</p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-2 text-sm text-amber-400">
          Connection issue: {error}. Showing last known data.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-asphalt-900 border border-asphalt-800 p-4 shadow-lg">
          <div className="flex items-center gap-2 text-asphalt-400 text-sm mb-1"><Bell size={16} /> Total Alerts</div>
          <p className="text-2xl font-bold text-white">{alerts.length}</p>
        </div>
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 shadow-lg">
          <div className="flex items-center gap-2 text-red-400 text-sm mb-1"><AlertOctagon size={16} /> Unresolved</div>
          <p className="text-2xl font-bold text-red-400">{unresolved.length}</p>
        </div>
        <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-4 shadow-lg">
          <div className="flex items-center gap-2 text-green-400 text-sm mb-1"><CheckCircle size={16} /> Resolved</div>
          <p className="text-2xl font-bold text-green-400">{resolved.length}</p>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-white mb-3">Active Alerts ({unresolved.length})</h3>
        <div className="space-y-3">
          {unresolved.length === 0 ? (
            <div className="rounded-xl bg-green-500/10 border border-green-500/20 p-6 text-center text-green-400">
              <CheckCircle size={24} className="mx-auto mb-2" />
              No active alerts. All clear.
            </div>
          ) : (
            unresolved.map((alert) => {
              const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.INFO;
              const Icon = cfg.icon;
              return (
                <div key={alert.id} className={`rounded-xl ${cfg.bg} border ${cfg.border} p-4 flex items-start justify-between ring-1 ${cfg.ring} animate-slide-up`}>
                  <div className="flex items-start gap-3">
                    <Icon size={20} className={`${cfg.color} mt-0.5`} />
                    <div>
                      <p className="font-semibold text-white">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-asphalt-400">
                        <span>{alert.locationName}</span>
                        <span>•</span>
                        <span>{new Date(alert.createdAt).toLocaleString()}</span>
                        <span>•</span>
                        <span className={`font-semibold ${cfg.color}`}>{alert.severity}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => resolveAlert(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-asphalt-800 text-asphalt-200 text-sm font-semibold border border-asphalt-700 hover:bg-asphalt-700 transition-colors"
                  >
                    <CheckCircle size={14} /> Resolve
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {resolved.length > 0 && (
        <div>
          <h3 className="font-bold text-white mb-3">Resolved Alerts ({resolved.length})</h3>
          <div className="space-y-3">
            {resolved.map((alert) => {
              const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.INFO;
              return (
                <div key={alert.id} className="rounded-xl bg-asphalt-900 border border-asphalt-800 p-4 flex items-start justify-between opacity-60">
                  <div className="flex items-start gap-3">
                    <CheckCircle size={20} className="text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-asphalt-300">{alert.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-asphalt-500">
                        <span>{alert.locationName}</span>
                        <span>•</span>
                        <span>Created: {new Date(alert.createdAt).toLocaleString()}</span>
                        <span>•</span>
                        <span>Resolved: {alert.resolvedAt ? new Date(alert.resolvedAt).toLocaleString() : '—'}</span>
                        <span>•</span>
                        <span className={`font-semibold ${cfg.color}`}>{alert.severity}</span>
                      </div>
                    </div>
                  </div>
                  <StatusBadge status="LOW" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
