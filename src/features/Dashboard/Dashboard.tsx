import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Phone, 
  ChevronRight,
  Flame,
  Globe,
  Plus,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useStore, TEAM_MEMBERS } from '../../lib/store';

export function DashboardCharts() {
  const { leads, activities, currentUser } = useStore();

  // Metrics
  const totalLeads = leads.length;
  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const formattedPipeline = `₹${(totalValue / 100000).toFixed(1)}L`;

  const reachableLeads = leads.filter(l => l.phone && l.phone !== 'N/A');
  const meetingsScheduled = leads.filter(l => l.stage === 'Meeting Scheduled' || l.stage === 'Proposal Sent');
  const wonLeads = leads.filter(l => l.stage === 'Won');
  const wonValue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);

  // Hot leads needing websites
  const leadsNeedingWebsite = useMemo(() => {
    return leads.filter(l => !l.website || l.website.trim() === '');
  }, [leads]);

  // Priority immediate call queue (top 4 uncontacted hot leads)
  const priorityQueue = useMemo(() => {
    return leadsNeedingWebsite
      .filter(l => l.stage === 'New' || l.stage === 'Contacted')
      .slice(0, 5);
  }, [leadsNeedingWebsite]);

  // Stage distribution funnel
  const stageCounts = useMemo(() => {
    const map: Record<string, number> = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      'Meeting Scheduled': 0,
      Won: 0,
    };
    leads.forEach(l => {
      if (map[l.stage] !== undefined) map[l.stage]++;
    });
    return map;
  }, [leads]);

  const userDisplayName = currentUser?.name || currentUser?.username || 'Team Member';

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Executive Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Welcome back, {userDisplayName}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            You have <span className="font-semibold text-amber-700">{leadsNeedingWebsite.length} businesses</span> without a website primed for outreach today.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/easy-contact"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" /> Start Speed Dial
          </Link>
          <Link
            to="/leads"
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            View Pipeline <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Core KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pipeline Value</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{formattedPipeline}</p>
          <p className="text-[11px] text-slate-400">{totalLeads} total accounts</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Needs Website</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600">{leadsNeedingWebsite.length}</p>
          <p className="text-[11px] text-slate-400">Prime web development targets</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Direct Phone Numbers</span>
            <Phone className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{reachableLeads.length}</p>
          <p className="text-[11px] text-slate-400">100% verified Indian contacts</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Meetings & Demos</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{meetingsScheduled.length}</p>
          <p className="text-[11px] text-slate-400">In negotiation</p>
        </div>
      </div>

      {/* Main Split: Immediate Call Queue (Left) & Pipeline Funnel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Priority Outbound Queue (2 Cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" /> Immediate Call Focus
              </h2>
              <p className="text-xs text-slate-400">High-priority accounts without a verified website</p>
            </div>
            <Link to="/easy-contact" className="text-xs font-semibold text-blue-600 hover:underline">
              Open Speed Dial →
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {priorityQueue.map(lead => {
              const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

              return (
                <div key={lead.id} className="py-3 flex items-center justify-between gap-3 group">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 text-xs truncate">
                      {lead.company}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {lead.contactPerson || 'Decision Maker'} · {lead.city} · {lead.industry}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
                      ₹{(lead.value || 10000).toLocaleString('en-IN')}
                    </span>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pipeline Stage Distribution Funnel (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Pipeline Funnel</h2>
              <p className="text-xs text-slate-400">Deal distribution across stages</p>
            </div>

            <div className="space-y-3 mt-4">
              {Object.entries(stageCounts).map(([stage, count]) => {
                const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700">{stage}</span>
                      <span className="text-slate-500 font-semibold">{count} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${stage === 'Won' ? 'bg-emerald-500' : stage === 'Meeting Scheduled' ? 'bg-purple-500' : 'bg-blue-600'}`}
                        style={{ width: `${Math.max(pct, 2)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <Link to="/leads" className="text-xs font-semibold text-blue-600 hover:underline">
              Inspect Full Pipeline Matrix →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Team Roster & Real-time Action Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Team Roster */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">Team Roster</h2>
            </div>
            <span className="text-xs text-slate-400">{TEAM_MEMBERS.length} active reps</span>
          </div>

          <div className="space-y-2">
            {TEAM_MEMBERS.map(member => {
              const repLeads = leads.filter(l => l.assignedTo === member.id);
              const contacted = repLeads.filter(l => l.stage !== 'New').length;
              const contactRate = repLeads.length > 0 ? Math.round((contacted / repLeads.length) * 100) : 0;

              return (
                <div key={member.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {member.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{member.name}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{member.role}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-semibold text-slate-800">{repLeads.length} leads</span>
                    <span className="text-[11px] text-slate-400 block">{contactRate}% contacted</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Stream / Audit Ticker */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
              </div>
              <span className="text-xs text-slate-400">Live events</span>
            </div>

            <div className="space-y-2 mt-3 max-h-[220px] overflow-y-auto no-scrollbar">
              {activities.slice(0, 5).map(act => (
                <div key={act.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-medium text-slate-800 truncate">
                      <span className="font-semibold text-slate-900">{act.user}</span> {act.action}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{act.target}</p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-right">
            <Link to="/settings" className="text-xs font-semibold text-blue-600 hover:underline">
              View Audit Logs in Settings →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DashboardCharts;
