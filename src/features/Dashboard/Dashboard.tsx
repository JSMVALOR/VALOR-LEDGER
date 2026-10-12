import { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  Filter, 
  PhoneCall, 
  Database, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { OverviewTab } from './tabs/OverviewTab';
import { TeamTab } from './tabs/TeamTab';
import { FunnelTab } from './tabs/FunnelTab';
import { QueueTab } from './tabs/QueueTab';

type DashboardSubPage = 'overview' | 'team' | 'funnel' | 'queue';

export function DashboardCharts() {
  const [activeTab, setActiveTab] = useState<DashboardSubPage>('overview');
  const { isCloudSynced, leads } = useStore();

  const tabs: { id: DashboardSubPage; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Executive Overview', icon: BarChart3 },
    { id: 'team', label: 'Team & Attribution', icon: Users },
    { id: 'funnel', label: 'Funnel Diagnostics', icon: Filter },
    { id: 'queue', label: 'Daily Call Queue', icon: PhoneCall, count: leads.length },
  ];

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto w-full pb-24 md:pb-8">
      {/* Top Header & Cloud Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            Command Center
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              v2.0
            </span>
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Multi-user sales velocity, team tracking, and live conversion analytics.
          </p>
        </div>

        {/* Cloud Readiness Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface border border-border text-xs font-semibold text-foreground shadow-sm">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Supabase Ready</span>
            <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'}`} />
          </div>
        </div>
      </div>

      {/* Segmented Control / Tab Bar (Mobile-friendly horizontal scroll) */}
      <div className="border-b border-border pb-px overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-2 min-w-max pb-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'bg-surface/70 text-muted-foreground hover:text-foreground hover:bg-surface border border-border'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-muted-foreground'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-background border border-border text-foreground'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Sub-Page Content */}
      <div className="mt-2">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'team' && <TeamTab />}
        {activeTab === 'funnel' && <FunnelTab />}
        {activeTab === 'queue' && <QueueTab />}
      </div>
    </div>
  );
}
export default DashboardCharts;
