import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Phone, 
  ChevronRight, 
  Flame, 
  CheckCircle2, 
  Clock, 
  MessageCircle, 
  Zap,
  ArrowRight
} from 'lucide-react';
import { useStore, TEAM_MEMBERS, getWhatsAppUrl } from '../../lib/store';

export function DashboardCharts() {
  const { leads, allLeads, activities, currentUser, isSuperadmin } = useStore();

  // Scope: Superadmin sees allLeads metrics; Rep sees their personal assigned metrics
  const activePool = isSuperadmin ? allLeads : leads;

  const totalLeads = activePool.length;
  const totalValue = activePool.reduce((sum, l) => sum + (l.value || 0), 0);
  const formattedPipeline = `₹${(totalValue / 100000).toFixed(1)}L`;

  const reachableLeads = activePool.filter(l => l.phone && l.phone !== 'N/A');
  const meetingsScheduled = activePool.filter(l => l.stage === 'Meeting Scheduled' || l.stage === 'Proposal Sent');
  const wonLeads = activePool.filter(l => l.stage === 'Won');
  const wonValue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);

  // Hot leads needing websites
  const leadsNeedingWebsite = useMemo(() => {
    return activePool.filter(l => !l.website || l.website.trim() === '');
  }, [activePool]);

  // Priority immediate call queue (top 5 uncontacted hot leads for today)
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
    activePool.forEach(l => {
      if (map[l.stage] !== undefined) map[l.stage]++;
    });
    return map;
  }, [activePool]);

  const userDisplayName = currentUser?.name || currentUser?.username || 'Team Member';

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Executive Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {isSuperadmin ? 'Sales Command · Today' : `Welcome back, ${userDisplayName}`}
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
              {currentUser?.role || 'user'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isSuperadmin 
              ? `Organization overview across ${allLeads.length} commercial accounts and ${TEAM_MEMBERS.length} active reps.`
              : `You have ${leadsNeedingWebsite.length} assigned businesses without websites waiting for contact.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" /> Start Outbound Dialer
          </Link>
          <Link
            to="/"
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
            <span>{isSuperadmin ? 'Org Pipeline Value' : 'My Pipeline Value'}</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-numeric">{formattedPipeline}</p>
          <p className="text-[11px] text-slate-400 font-numeric">{totalLeads} total accounts</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Needs Website</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-600 font-numeric">{leadsNeedingWebsite.length}</p>
          <p className="text-[11px] text-slate-400">Prime web development targets</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Direct Phone Numbers</span>
            <Phone className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-numeric">{reachableLeads.length}</p>
          <p className="text-[11px] text-slate-400">100% verified Indian contacts</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Demos & Meetings</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 font-numeric">{meetingsScheduled.length}</p>
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
                <Flame className="w-4 h-4 text-amber-500" /> Priority Outbound Queue (Today)
              </h2>
              <p className="text-xs text-slate-400">Accounts without a verified website ready for 1-tap pitch</p>
            </div>
            <Link to="/leads" className="text-xs font-semibold text-blue-600 hover:underline">
              Launch Dialer →
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

                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-semibold text-slate-400 font-numeric hidden sm:inline mr-1">
                      ₹{(lead.value || 10000).toLocaleString('en-IN')}
                    </span>
                    <a
                      href={`tel:${cleanPhone}`}
                      title="Direct Phone Call"
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <a
                      href={getWhatsAppUrl(lead)}
                      target="_blank"
                      rel="noreferrer"
                      title="Send WhatsApp Pitch"
                      className="p-1.5 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold text-xs flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              );
            })}

            {priorityQueue.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400">
                All priority accounts in this queue have been contacted!
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Stage Distribution Funnel (1 Col) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900">Pipeline Funnel</h2>
              <p className="text-xs text-slate-400">Stage distribution across {totalLeads} accounts</p>
            </div>

            <div className="space-y-3 mt-4">
              {Object.entries(stageCounts).map(([stage, count]) => {
                const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
                return (
                  <div key={stage} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700">{stage}</span>
                      <span className="text-slate-500 font-semibold font-numeric">{count} ({pct}%)</span>
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
            <Link to="/" className="text-xs font-semibold text-blue-600 hover:underline">
              Inspect Full Pipeline Matrix →
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Team Roster (Admin) / Target Pacing & Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Team Leaderboard for Admin, or Personal Pacing for Rep */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="text-sm font-bold text-slate-900">
                {isSuperadmin ? 'Team Distribution' : 'My Pacing & Quota'}
              </h2>
            </div>
            <span className="text-xs text-slate-400">{TEAM_MEMBERS.length} active reps</span>
          </div>

          <div className="space-y-2">
            {TEAM_MEMBERS.map(member => {
              const repLeads = allLeads.filter(l => (l.assignedTo || 'swaroop').toLowerCase() === member.id.toLowerCase());
              const contacted = repLeads.filter(l => l.stage !== 'New').length;
              const contactRate = repLeads.length > 0 ? Math.round((contacted / repLeads.length) * 100) : 0;
              const isMe = member.id.toLowerCase() === (currentUser?.username || '').toLowerCase();

              return (
                <div 
                  key={member.id} 
                  className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                    isMe ? 'bg-blue-50/70 border-blue-200' : 'bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {member.avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">
                        {member.name} {isMe && <span className="text-[10px] text-blue-700 font-bold">(You)</span>}
                      </p>
                      <p className="text-[11px] text-slate-400 capitalize">{member.role}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-semibold text-slate-800 font-numeric">{repLeads.length} leads</span>
                    <span className="text-[11px] text-slate-400 font-numeric block">{contactRate}% contacted</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Real-time Action Stream (Superadmin only sees full stream) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h2 className="text-sm font-bold text-slate-900">Recent Sales Activity</h2>
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
            {isSuperadmin ? (
              <Link to="/settings" className="text-xs font-semibold text-blue-600 hover:underline">
                View Full Audit Logs in Settings →
              </Link>
            ) : (
              <Link to="/" className="text-xs font-semibold text-blue-600 hover:underline">
                Go to My Assigned Pipeline →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default DashboardCharts;
