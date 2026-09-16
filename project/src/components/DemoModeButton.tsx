import { useState, useRef, useCallback } from 'react';
import { api } from '@/services/api';
import type { Node } from '@/types';
import { Play, Square, Zap } from 'lucide-react';

export function DemoModeButton({ onStatusChange }: { onStatusChange?: (running: boolean) => void }) {
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nodeIndexRef = useRef(0);
  const nodesRef = useRef<Node[]>([]);

  const startDemo = useCallback(async () => {
    try {
      const nodes = await api.getNodes();
      nodesRef.current = nodes;
      nodeIndexRef.current = 0;
      setRunning(true);
      onStatusChange?.(true);

      for (const n of nodes) {
        await api.heartbeat(n.id).catch(() => {});
      }

      intervalRef.current = setInterval(async () => {
        const nodes = nodesRef.current;
        if (nodes.length === 0) return;

        const idx = nodeIndexRef.current % nodes.length;
        const node = nodes[idx];
        const vc = Math.floor(Math.random() * 90) + 15;
        const speed = Math.max(8, Math.min(60, 60 - vc * 0.4 + Math.random() * 10));

        await api.sendReading({
          nodeId: node.id,
          vehicleCount: vc,
          averageSpeed: Math.round(speed * 10) / 10,
        }).catch(() => {});

        for (const n of nodes) {
          await api.heartbeat(n.id).catch(() => {});
        }

        nodeIndexRef.current++;
      }, 3000);
    } catch (e) {
      setRunning(false);
      onStatusChange?.(false);
    }
  }, [onStatusChange]);

  const stopDemo = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setRunning(false);
    onStatusChange?.(false);
  }, [onStatusChange]);

  return (
    <button
      onClick={running ? stopDemo : startDemo}
      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ring-1 ${
        running
          ? 'bg-red-600 text-white hover:bg-red-700 ring-red-500/30 shadow-lg shadow-red-500/20'
          : 'bg-amber-500 text-white hover:bg-amber-600 ring-amber-500/30 shadow-lg shadow-amber-500/20'
      }`}
    >
      {running ? <><Square size={16} /> Stop Demo</> : <><Play size={16} /> Start Demo</>}
      <Zap size={14} className={running ? 'animate-pulse' : ''} />
    </button>
  );
}
