import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import type { AnalyticsData } from '@/types';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = { LOW: '#22c55e', MEDIUM: '#f59e0b', HIGH: '#ef4444' };
const LOCATION_COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444'];

const CHART_BG = '#1e2838';
const GRID_COLOR = '#2c3a4e';
const AXIS_COLOR = '#7890a8';
const TOOLTIP_STYLE = {
  backgroundColor: '#121822',
  border: '1px solid #2c3a4e',
  borderRadius: '8px',
  color: '#e8edf2',
};

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const analytics = await api.getAnalytics();
        if (mounted) { setData(analytics); setError(null); setLoading(false); }
      } catch (e: any) {
        if (mounted) { setError(e.message); setLoading(false); }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 rounded-full border-2 border-asphalt-700 border-t-brand-blue animate-spin" />
    </div>
  );
  if (error && !data) return <div className="text-red-400 font-medium">Unable to connect to monitoring server.</div>;
  if (!data) return null;

  const allTimestamps = new Set<string>();
  Object.values(data.byLocation).forEach((readings) => {
    readings.forEach((r) => allTimestamps.add(new Date(r.recordedAt).toLocaleTimeString()));
  });
  const sortedTimestamps = Array.from(allTimestamps).sort();

  const vehicleCountSeries = sortedTimestamps.map((ts) => {
    const point: any = { time: ts };
    Object.entries(data.byLocation).forEach(([loc, readings]) => {
      const r = readings.find((rd) => new Date(rd.recordedAt).toLocaleTimeString() === ts);
      point[loc] = r ? r.vehicleCount : null;
    });
    return point;
  });

  const speedSeries = sortedTimestamps.map((ts) => {
    const point: any = { time: ts };
    Object.entries(data.byLocation).forEach(([loc, readings]) => {
      const r = readings.find((rd) => new Date(rd.recordedAt).toLocaleTimeString() === ts);
      point[loc] = r ? r.averageSpeed : null;
    });
    return point;
  });

  const locations = Object.keys(data.byLocation);
  const statusData = data.statusDistribution.map((s) => ({
    name: s.trafficStatus, value: s._count,
    color: COLORS[s.trafficStatus as keyof typeof COLORS] || '#7890a8',
  }));
  const nodeActivityData = data.nodeActivity.map((n) => ({ name: n.nodeCode, readings: n.readingCount }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="h-5 w-1 rounded-full bg-amber-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-sm text-asphalt-400">Traffic data analysis from distributed monitoring nodes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl bg-asphalt-900 border border-asphalt-800 p-5 shadow-lg">
          <h3 className="font-bold text-white mb-4">Vehicle Count Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={vehicleCountSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: AXIS_COLOR }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: AXIS_COLOR }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#a8b8c8' }} />
              {locations.map((loc, i) => (
                <Line key={loc} type="monotone" dataKey={loc} stroke={LOCATION_COLORS[i % 4]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-asphalt-900 border border-asphalt-800 p-5 shadow-lg">
          <h3 className="font-bold text-white mb-4">Average Speed Over Time</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={speedSeries}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: AXIS_COLOR }} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 11, fill: AXIS_COLOR }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#a8b8c8' }} />
              {locations.map((loc, i) => (
                <Line key={loc} type="monotone" dataKey={loc} stroke={LOCATION_COLORS[i % 4]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-asphalt-900 border border-asphalt-800 p-5 shadow-lg">
          <h3 className="font-bold text-white mb-4">Traffic by Location</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.trafficByLocation}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
              <XAxis dataKey="location" tick={{ fontSize: 10, fill: AXIS_COLOR }} />
              <YAxis tick={{ fontSize: 11, fill: AXIS_COLOR }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#a8b8c8' }} />
              <Bar dataKey="vehicleCount" name="Vehicle Count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="averageSpeed" name="Avg Speed" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl bg-asphalt-900 border border-asphalt-800 p-5 shadow-lg">
          <h3 className="font-bold text-white mb-4">Traffic Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={{ fill: '#e8edf2', fontSize: 11 }}>
                {statusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#a8b8c8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl bg-asphalt-900 border border-asphalt-800 p-5 shadow-lg">
        <h3 className="font-bold text-white mb-4">Node Activity (Total Readings per Node)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={nodeActivityData}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID_COLOR} />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: AXIS_COLOR }} />
            <YAxis tick={{ fontSize: 11, fill: AXIS_COLOR }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="readings" name="Readings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
