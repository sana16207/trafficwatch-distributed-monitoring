import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '@/services/api';
import type { Node } from '@/types';
import { OnlineBadge, StatusBadge } from '@/components/StatusBadge';
import { Play, Square, Send, Cpu, RefreshCw, Radio } from 'lucide-react';

interface SimNodeState {
  vehicleCount: number;
  averageSpeed: number;
  autoRunning: boolean;
  sending: boolean;
  lastResponse: string | null;
}

export function NodeSimulatorPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simStates, setSimStates] = useState<Record<number, SimNodeState>>({});
  const intervalRefs = useRef<Record<number, ReturnType<typeof setInterval>>>({});

  const fetchNodes = useCallback(async () => {
    try {
      const data = await api.getNodes();
      setNodes(data);
      setError(null);
      setLoading(false);
      setSimStates((prev) => {
        const next: Record<number, SimNodeState> = {};
        for (const n of data) {
          next[n.id] = prev[n.id] || {
            vehicleCount: Math.floor(Math.random() * 50) + 20,
            averageSpeed: 30,
            autoRunning: false,
            sending: false,
            lastResponse: null,
          };
        }
        return next;
      });
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNodes();
    return () => {
      Object.values(intervalRefs.current).forEach(clearInterval);
    };
  }, [fetchNodes]);

  const updateSim = (id: number, partial: Partial<SimNodeState>) => {
    setSimStates((prev) => ({ ...prev, [id]: { ...prev[id], ...partial } }));
  };

  const sendData = async (nodeId: number) => {
    const sim = simStates[nodeId];
    if (!sim) return;
    updateSim(nodeId, { sending: true, lastResponse: null });
    try {
      const reading = await api.sendReading({
        nodeId,
        vehicleCount: sim.vehicleCount,
        averageSpeed: sim.averageSpeed,
      });
      updateSim(nodeId, { sending: false, lastResponse: `Sent: ${reading.trafficStatus} (${reading.vehicleCount} vehicles)` });
    } catch (e: any) {
      updateSim(nodeId, { sending: false, lastResponse: `Error: ${e.message}` });
    }
  };

  const startAuto = (nodeId: number) => {
    updateSim(nodeId, { autoRunning: true });
    api.heartbeat(nodeId).catch(() => {});
    if (intervalRefs.current[nodeId]) clearInterval(intervalRefs.current[nodeId]);
    intervalRefs.current[nodeId] = setInterval(async () => {
      setSimStates((prev) => {
        const sim = prev[nodeId];
        if (!sim || !sim.autoRunning) return prev;
        const delta = Math.floor(Math.random() * 20) - 10;
        const newVc = Math.max(5, Math.min(120, sim.vehicleCount + delta));
        const newSpeed = Math.max(8, Math.min(60, 60 - newVc * 0.4 + Math.random() * 10));
        api.sendReading({ nodeId, vehicleCount: newVc, averageSpeed: Math.round(newSpeed * 10) / 10 })
          .then((r) => updateSim(nodeId, { lastResponse: `Auto: ${r.trafficStatus} (${r.vehicleCount})` }))
          .catch((e) => updateSim(nodeId, { lastResponse: `Error: ${e.message}` }));
        return { ...prev, [nodeId]: { ...sim, vehicleCount: newVc, averageSpeed: Math.round(newSpeed * 10) / 10 } };
      });
    }, 5000);
  };

  const stopAuto = (nodeId: number) => {
    updateSim(nodeId, { autoRunning: false });
    if (intervalRefs.current[nodeId]) {
      clearInterval(intervalRefs.current[nodeId]);
      delete intervalRefs.current[nodeId];
    }
  };

  const startAll = () => { nodes.forEach((n) => startAuto(n.id)); };
  const stopAll = () => { nodes.forEach((n) => stopAuto(n.id)); };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 rounded-full border-2 border-asphalt-700 border-t-brand-blue animate-spin" />
    </div>
  );
  if (error && nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20">
          <Radio size={28} className="text-red-400" />
        </div>
        <p className="text-red-400 font-medium">Unable to connect to monitoring server.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="h-5 w-1 rounded-full bg-amber-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Distributed Node Simulator</h2>
            <p className="text-sm text-asphalt-400">Send real traffic readings to the central server via REST API</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={startAll} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors shadow-lg shadow-green-500/20">
            <Play size={16} /> Start All
          </button>
          <button onClick={stopAll} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20">
            <Square size={16} /> Stop All
          </button>
          <button onClick={fetchNodes} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-asphalt-800 text-asphalt-200 text-sm font-semibold hover:bg-asphalt-700 transition-colors ring-1 ring-asphalt-700">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {nodes.map((node) => {
          const sim = simStates[node.id];
          if (!sim) return null;
          const status = sim.vehicleCount < 30 ? 'LOW' : sim.vehicleCount <= 70 ? 'MEDIUM' : 'HIGH';
          return (
            <div key={node.id} className={`rounded-xl bg-asphalt-900 border p-5 shadow-lg transition-all duration-300 hover:shadow-xl card-glow ${
              sim.autoRunning ? 'border-green-500/30 ring-1 ring-green-500/10' : 'border-asphalt-800'
            }`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ring-1 ${
                    sim.autoRunning ? 'bg-green-500/10 ring-green-500/20' : 'bg-asphalt-800 ring-asphalt-700'
                  }`}>
                    <Cpu size={20} className={sim.autoRunning ? 'text-green-400' : 'text-asphalt-400'} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white font-mono">{node.nodeCode}</h3>
                    <p className="text-sm text-asphalt-400">{node.locationName}</p>
                  </div>
                </div>
                <OnlineBadge isOnline={node.isOnline} />
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-asphalt-400 font-medium mb-1 block">Vehicle Count</label>
                  <input
                    type="number"
                    value={sim.vehicleCount}
                    onChange={(e) => updateSim(node.id, { vehicleCount: parseInt(e.target.value) || 0 })}
                    className="w-full rounded-lg bg-asphalt-800 border border-asphalt-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="text-xs text-asphalt-400 font-medium mb-1 block">Average Speed (km/h)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sim.averageSpeed}
                    onChange={(e) => updateSim(node.id, { averageSpeed: parseFloat(e.target.value) || 0 })}
                    className="w-full rounded-lg bg-asphalt-800 border border-asphalt-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs text-asphalt-400 font-medium">Computed Status: </span>
                  <StatusBadge status={status} />
                </div>
                <span className={`text-xs font-medium ${sim.autoRunning ? 'text-green-400' : 'text-asphalt-500'}`}>
                  {sim.autoRunning ? 'Auto-monitoring active' : 'Manual mode'}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => sendData(node.id)}
                  disabled={sim.sending}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-brand-blueDark disabled:opacity-50 transition-colors"
                >
                  <Send size={14} /> {sim.sending ? 'Sending...' : 'Send Data'}
                </button>
                <button
                  onClick={() => sim.autoRunning ? stopAuto(node.id) : startAuto(node.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    sim.autoRunning
                      ? 'bg-red-500/15 text-red-400 hover:bg-red-500/25 ring-1 ring-red-500/20'
                      : 'bg-green-500/15 text-green-400 hover:bg-green-500/25 ring-1 ring-green-500/20'
                  }`}
                >
                  {sim.autoRunning ? <><Square size={14} /> Stop</> : <><Play size={14} /> Start Auto</>}
                </button>
              </div>

              {sim.lastResponse && (
                <div className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                  sim.lastResponse.startsWith('Error')
                    ? 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20'
                    : 'bg-green-500/10 text-green-400 ring-1 ring-green-500/20'
                }`}>
                  {sim.lastResponse}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
