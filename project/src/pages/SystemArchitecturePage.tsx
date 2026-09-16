import { Cpu, Server, Database, LayoutDashboard, Wifi, ArrowDown } from 'lucide-react';

export function SystemArchitecturePage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="h-5 w-1 rounded-full bg-amber-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">System Architecture</h2>
          <p className="text-sm text-asphalt-400">Distributed traffic monitoring system architecture</p>
        </div>
      </div>

      <div className="rounded-xl bg-asphalt-950 p-8 shadow-lg ring-1 ring-asphalt-800/60 border border-asphalt-800">
        <div className="flex flex-col items-center gap-4 max-w-3xl mx-auto">
          <div className="w-full">
            <p className="text-center text-xs text-asphalt-400 uppercase tracking-wider mb-3">Distributed Monitoring Nodes</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-asphalt-800 rounded-lg p-4 text-center border border-asphalt-700 ring-1 ring-asphalt-700/50">
                  <Cpu size={24} className="text-amber-400 mx-auto mb-2" />
                  <p className="text-white text-sm font-bold">NODE-0{i}</p>
                  <p className="text-asphalt-400 text-xs">{['Gandhipuram', 'Ukkadam', 'Peelamedu', 'Singanallur'][i - 1]}</p>
                </div>
              ))}
            </div>
          </div>

          <ArrowDown size={24} className="text-asphalt-600" />

          <div className="w-full bg-asphalt-800 rounded-lg p-4 text-center border border-asphalt-700 ring-1 ring-asphalt-700/50">
            <div className="flex items-center justify-center gap-2">
              <Wifi size={20} className="text-brand-blue" />
              <p className="text-white font-bold">REST API Communication Layer</p>
            </div>
            <p className="text-asphalt-400 text-xs mt-1 font-mono">POST /api/traffic/readings • POST /api/nodes/:id/heartbeat • GET /api/dashboard</p>
          </div>

          <ArrowDown size={24} className="text-asphalt-600" />

          <div className="w-full bg-asphalt-800 rounded-lg p-4 text-center border border-asphalt-700 ring-1 ring-asphalt-700/50">
            <Server size={24} className="text-green-400 mx-auto mb-2" />
            <p className="text-white font-bold">Central Monitoring Server</p>
            <p className="text-asphalt-400 text-xs">Node.js + Express + TypeScript</p>
          </div>

          <ArrowDown size={24} className="text-asphalt-600" />

          <div className="w-full bg-asphalt-800 rounded-lg p-4 text-center border border-asphalt-700 ring-1 ring-asphalt-700/50">
            <Database size={24} className="text-brand-blue mx-auto mb-2" />
            <p className="text-white font-bold">SQLite Database</p>
            <p className="text-asphalt-400 text-xs font-mono">nodes • traffic_readings • alerts</p>
          </div>

          <ArrowDown size={24} className="text-asphalt-600" />

          <div className="w-full bg-asphalt-800 rounded-lg p-4 text-center border border-asphalt-700 ring-1 ring-asphalt-700/50">
            <LayoutDashboard size={24} className="text-amber-400 mx-auto mb-2" />
            <p className="text-white font-bold">Live Monitoring Dashboard</p>
            <p className="text-asphalt-400 text-xs">React + Vite + Tailwind CSS + Recharts</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-asphalt-900 border border-asphalt-800 p-6 shadow-lg">
        <h3 className="font-bold text-white mb-3">How Distributed Monitoring Works</h3>
        <div className="space-y-3 text-sm text-asphalt-300 leading-relaxed">
          <p>
            <strong className="text-white">Distributed Monitoring</strong> is a computing concept where multiple independent
            monitoring sources (nodes) collect data from different locations and report to a central server for aggregation and analysis.
          </p>
          <p>
            In this system, four traffic monitoring nodes are deployed at different city locations (Gandhipuram, Ukkadam, Peelamedu, Singanallur).
            Each node independently collects traffic data — vehicle counts, average speed, and density — and sends it to the central server
            through REST API calls.
          </p>
          <p>
            The central server receives, validates, and processes each reading, classifies the traffic status (LOW / MEDIUM / HIGH),
            stores it in a SQLite database, and generates alerts when traffic becomes critical. Each node also sends periodic heartbeats
            so the server can detect if a node goes offline.
          </p>
          <p>
            The live dashboard polls the server every few seconds and presents the aggregated data as a real-time traffic control center,
            demonstrating the full distributed monitoring pipeline: <strong className="text-white">Nodes → REST API → Server → Database → Dashboard</strong>.
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-asphalt-900 border border-asphalt-800 p-6 shadow-lg">
        <h3 className="font-bold text-white mb-3">Real-World Use Case</h3>
        <div className="space-y-3 text-sm text-asphalt-300 leading-relaxed">
          <p>
            Real smart-city traffic systems use multiple sensors, cameras, and intersection monitors independently collecting traffic
            information across a city. These monitoring sources send data to centralized traffic-management systems that aggregate
            conditions from multiple locations to identify congestion and monitor road conditions.
          </p>
          <p>
            This student project simulates that architecture using software-based monitoring nodes rather than physical traffic cameras.
            Each simulated node behaves like a real traffic sensor — collecting data, sending it to a central server, and maintaining
            a heartbeat — making the distributed monitoring concept clearly demonstrable in a classroom setting.
          </p>
        </div>
      </div>
    </div>
  );
}
