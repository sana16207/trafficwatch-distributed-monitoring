import { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import type { HistoryEntry } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, ArrowUpDown } from 'lucide-react';

type SortField = 'recordedAt' | 'location' | 'vehicleCount' | 'averageSpeed' | 'trafficStatus';
type SortDir = 'asc' | 'desc';

const LOCATIONS = ['ALL', 'Gandhipuram', 'Ukkadam', 'Peelamedu', 'Singanallur'];
const STATUSES = ['ALL', 'LOW', 'MEDIUM', 'HIGH'];

export function TrafficHistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortField, setSortField] = useState<SortField>('recordedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const data = await api.getHistory({ limit: 200 });
        if (mounted) { setEntries(data); setError(null); setLoading(false); }
      } catch (e: any) {
        if (mounted) { setError(e.message); setLoading(false); }
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const filtered = useMemo(() => {
    let result = [...entries];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((e) =>
        e.location.toLowerCase().includes(s) ||
        e.nodeCode.toLowerCase().includes(s) ||
        e.trafficStatus.toLowerCase().includes(s)
      );
    }
    if (locationFilter !== 'ALL') result = result.filter((e) => e.location === locationFilter);
    if (statusFilter !== 'ALL') result = result.filter((e) => e.trafficStatus === statusFilter);
    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'recordedAt': cmp = new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(); break;
        case 'location': cmp = a.location.localeCompare(b.location); break;
        case 'vehicleCount': cmp = a.vehicleCount - b.vehicleCount; break;
        case 'averageSpeed': cmp = a.averageSpeed - b.averageSpeed; break;
        case 'trafficStatus': cmp = a.trafficStatus.localeCompare(b.trafficStatus); break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return result;
  }, [entries, search, locationFilter, statusFilter, sortField, sortDir]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) { setSortDir((d) => (d === 'asc' ? 'desc' : 'asc')); }
    else { setSortField(field); setSortDir('desc'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 rounded-full border-2 border-asphalt-700 border-t-brand-blue animate-spin" />
    </div>
  );
  if (error && entries.length === 0) return <div className="text-red-400 font-medium">Unable to connect to monitoring server.</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="h-5 w-1 rounded-full bg-amber-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">Traffic History</h2>
          <p className="text-sm text-asphalt-400">Historical traffic readings from the database</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-asphalt-500" />
          <input
            type="text"
            placeholder="Search by location, node, or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3 py-2 rounded-lg bg-asphalt-900 border border-asphalt-700 text-sm text-white placeholder-asphalt-500 focus:ring-2 focus:ring-brand-blue focus:border-transparent"
          />
        </div>
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          className="rounded-lg bg-asphalt-900 border border-asphalt-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-blue"
        >
          {LOCATIONS.map((l) => <option key={l} value={l}>{l === 'ALL' ? 'All Locations' : l}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg bg-asphalt-900 border border-asphalt-700 px-3 py-2 text-sm text-white focus:ring-2 focus:ring-brand-blue"
        >
          {STATUSES.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All Statuses' : s}</option>)}
        </select>
      </div>

      <p className="text-sm text-asphalt-400">{filtered.length} records</p>

      <div className="overflow-x-auto rounded-xl bg-asphalt-900 border border-asphalt-800 shadow-lg">
        <table className="w-full text-sm">
          <thead className="bg-asphalt-800/50 text-asphalt-300">
            <tr>
              <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-white" onClick={() => toggleSort('recordedAt')}>
                <span className="flex items-center gap-1">Timestamp <ArrowUpDown size={12} /></span>
              </th>
              <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-white" onClick={() => toggleSort('location')}>
                <span className="flex items-center gap-1">Location <ArrowUpDown size={12} /></span>
              </th>
              <th className="px-4 py-3 text-left font-semibold">Node</th>
              <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-white" onClick={() => toggleSort('vehicleCount')}>
                <span className="flex items-center gap-1">Vehicles <ArrowUpDown size={12} /></span>
              </th>
              <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-white" onClick={() => toggleSort('averageSpeed')}>
                <span className="flex items-center gap-1">Avg Speed <ArrowUpDown size={12} /></span>
              </th>
              <th className="px-4 py-3 text-left font-semibold">Density</th>
              <th className="px-4 py-3 text-left font-semibold cursor-pointer hover:text-white" onClick={() => toggleSort('trafficStatus')}>
                <span className="flex items-center gap-1">Status <ArrowUpDown size={12} /></span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-asphalt-800">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-asphalt-500">No records found</td></tr>
            ) : (
              filtered.slice(0, 100).map((e) => (
                <tr key={e.id} className="hover:bg-asphalt-800/40 transition-colors">
                  <td className="px-4 py-3 text-asphalt-400">{new Date(e.recordedAt).toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-white">{e.location}</td>
                  <td className="px-4 py-3 text-asphalt-400 font-mono">{e.nodeCode}</td>
                  <td className="px-4 py-3 text-asphalt-300">{e.vehicleCount}</td>
                  <td className="px-4 py-3 text-asphalt-300">{e.averageSpeed.toFixed(1)} km/h</td>
                  <td className="px-4 py-3 text-asphalt-400">{e.density}</td>
                  <td className="px-4 py-3"><StatusBadge status={e.trafficStatus} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
