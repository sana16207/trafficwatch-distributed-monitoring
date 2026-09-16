import { useSettings } from '@/hooks/useSettings';
import { Save, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export function SettingsPage() {
  const { settings, update } = useSettings();
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    update({ lowThreshold: 30, highThreshold: 70, heartbeatTimeoutSec: 15, refreshIntervalSec: 5, demoMode: false });
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center gap-2">
        <div className="h-5 w-1 rounded-full bg-amber-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Settings</h2>
          <p className="text-sm text-asphalt-400">Configure traffic monitoring parameters</p>
        </div>
      </div>

      <div className="rounded-xl bg-asphalt-900 border border-asphalt-800 p-6 shadow-lg space-y-5">
        <h3 className="font-bold text-white">Traffic Thresholds</h3>
        <p className="text-xs text-asphalt-400 -mt-2">Backend uses: LOW (&lt; {settings.lowThreshold}), MEDIUM ({settings.lowThreshold}–{settings.highThreshold}), HIGH (&gt; {settings.highThreshold})</p>

        <div>
          <label className="text-sm font-medium text-asphalt-300 mb-1 block">Low Threshold (vehicles)</label>
          <input
            type="number"
            value={settings.lowThreshold}
            onChange={(e) => update({ lowThreshold: parseInt(e.target.value) || 0 })}
            className="w-full rounded-lg bg-asphalt-800 border border-asphalt-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-asphalt-300 mb-1 block">High Threshold (vehicles)</label>
          <input
            type="number"
            value={settings.highThreshold}
            onChange={(e) => update({ highThreshold: parseInt(e.target.value) || 0 })}
            className="w-full rounded-lg bg-asphalt-800 border border-asphalt-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>
      </div>

      <div className="rounded-xl bg-asphalt-900 border border-asphalt-800 p-6 shadow-lg space-y-5">
        <h3 className="font-bold text-white">System Parameters</h3>

        <div>
          <label className="text-sm font-medium text-asphalt-300 mb-1 block">Heartbeat Timeout (seconds)</label>
          <input
            type="number"
            value={settings.heartbeatTimeoutSec}
            onChange={(e) => update({ heartbeatTimeoutSec: parseInt(e.target.value) || 15 })}
            className="w-full rounded-lg bg-asphalt-800 border border-asphalt-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
          <p className="text-xs text-asphalt-400 mt-1">Nodes that don't send a heartbeat within this time are marked OFFLINE.</p>
        </div>
        <div>
          <label className="text-sm font-medium text-asphalt-300 mb-1 block">Auto-Refresh Interval (seconds)</label>
          <input
            type="number"
            value={settings.refreshIntervalSec}
            onChange={(e) => update({ refreshIntervalSec: parseInt(e.target.value) || 5 })}
            className="w-full rounded-lg bg-asphalt-800 border border-asphalt-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
          <p className="text-xs text-asphalt-400 mt-1">How often the dashboard polls the server for updates.</p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blueDark transition-colors shadow-lg shadow-brand-blue/20"
        >
          <Save size={16} /> {saved ? 'Saved!' : 'Save Settings'}
        </button>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-asphalt-800 text-asphalt-200 text-sm font-semibold hover:bg-asphalt-700 transition-colors ring-1 ring-asphalt-700"
        >
          <RotateCcw size={16} /> Reset to Defaults
        </button>
      </div>

      <p className="text-xs text-asphalt-400">
        Settings are saved in your browser's local storage and persist across sessions. Note: threshold changes are for display reference — the backend uses its own configured thresholds for traffic classification.
      </p>
    </div>
  );
}
