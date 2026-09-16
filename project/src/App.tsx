import { useState, Component, type ReactNode } from 'react';
import { Sidebar, type PageId } from '@/components/Sidebar';
import { DemoModeButton } from '@/components/DemoModeButton';
import { useSettings } from '@/hooks/useSettings';
import { DashboardPage } from '@/pages/DashboardPage';
import { TrafficMapPage } from '@/pages/TrafficMapPage';
import { MonitoringNodesPage } from '@/pages/MonitoringNodesPage';
import { NodeSimulatorPage } from '@/pages/NodeSimulatorPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { TrafficHistoryPage } from '@/pages/TrafficHistoryPage';
import { AlertsPage } from '@/pages/AlertsPage';
import { SystemArchitecturePage } from '@/pages/SystemArchitecturePage';
import { SettingsPage } from '@/pages/SettingsPage';

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; message: string }> {
  state = { hasError: false, message: '' };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen bg-asphalt-950 items-center justify-center">
          <div className="text-center max-w-md p-8">
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-asphalt-400">{this.state.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppInner() {
  const [page, setPage] = useState<PageId>('dashboard');
  const { settings } = useSettings();

  return (
    <div className="flex min-h-screen bg-asphalt-950">
      <Sidebar active={page} onNavigate={setPage} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-end mb-4">
            <DemoModeButton />
          </div>

          {page === 'dashboard' && <DashboardPage refreshIntervalSec={settings.refreshIntervalSec} />}
          {page === 'map' && <TrafficMapPage refreshIntervalSec={settings.refreshIntervalSec} />}
          {page === 'nodes' && <MonitoringNodesPage refreshIntervalSec={settings.refreshIntervalSec} />}
          {page === 'simulator' && <NodeSimulatorPage />}
          {page === 'analytics' && <AnalyticsPage />}
          {page === 'history' && <TrafficHistoryPage />}
          {page === 'alerts' && <AlertsPage refreshIntervalSec={settings.refreshIntervalSec} />}
          {page === 'architecture' && <SystemArchitecturePage />}
          {page === 'settings' && <SettingsPage />}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AppInner />
    </ErrorBoundary>
  );
}

export default App;
