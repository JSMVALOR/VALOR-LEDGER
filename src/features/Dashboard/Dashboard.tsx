import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight, 
  PhoneCall, 
  Sparkles, 
  Building2, 
  Clock, 
  Phone, 
  ShieldCheck, 
  ChevronRight,
  Flame,
  Globe,
  Plus
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore, TEAM_MEMBERS } from '../../lib/store';

export function DashboardCharts() {
  const { leads, activities, currentUser, tasks, toggleTask, updateLeadStage } = useStore();

  // Metrics
  const totalLeads = leads.length;
  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const formattedPipeline = `₹${(totalValue / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}k`;

  const reachableLeads = leads.filter(l => l.phone && l.phone !== 'N/A');
  const meetingsScheduled = leads.filter(l => l.stage === 'Meeting Scheduled');
  const wonLeads = leads.filter(l => l.stage === 'Won');
  const wonValue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
  const formattedWonValue = `₹${(wonValue / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}k`;

  // Leads without website (highest priority for website sales)
  const leadsNeedingWebsite = useMemo(() => {
    return leads.filter(l => !l.website || l.website.trim() === '');
  }, [leads]);

  // Priority Outbound Queue (top 4 leads to call right now)
  const priorityCallQueue = useMemo(() => {
    return leads
      .filter(l => l.stage === 'New' || l.stage === 'Contacted')
      .slice(0, 4);
  }, [leads]);

  // Monthly revenue forecast
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonthIdx = new Date().getMonth();
  const monthlyDataMap = new Map<string, number>();

  for (let i = 5; i >= 0; i--) {
    let m = currentMonthIdx - i;
    if (m < 0) m += 12;
    monthlyDataMap.set(months[m], 0);
  }

  leads.forEach(l => {
    const d = new Date(l.createdAt);
    const mName = months[d.getMonth()];
    if (monthlyDataMap.has(mName)) {
      monthlyDataMap.set(mName, (monthlyDataMap.get(mName) || 0) + (l.value || 0));
    }
  });

  const chartData = Array.from(monthlyDataMap.entries()).map(([month, val]) => ({
    month,
    value: val,
  }));

  const userDisplayName = currentUser?.name || currentUser?.username || 'Sales Rep';

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 sm:p-7 text-white shadow-lg shadow-blue-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-100 font-semibold text-xs tracking-wider uppercase mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-300" /> Sales Intelligence Center
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {userDisplayName}! 👋
          </h1>
          <p className="text-sm text-blue-100 mt-1 max-w-xl">
            You have <b className="text-white font-bold">{leadsNeedingWebsite.length} prospects</b> without a verified website waiting for immediate pitch outreach.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link
            to="/easy-contact"
            className="px-4 py-2.5 rounded-2xl bg-white text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
          >
            <Phone className="w-3.5 h-3.5" /> Start Speed Dial
          </Link>
          <Link
            to="/leads"
            className="px-4 py-2.5 rounded-2xl bg-blue-700/60 hover:bg-blue-700 text-white font-bold text-xs border border-white/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" /> New Deal
          </Link>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> Active
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">Total Pipeline Value</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">{formattedPipeline}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{totalLeads} prospects in pipeline</p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
              Dial Ready
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">Reachable Leads</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">{reachableLeads.length}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Verified phone numbers</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <Flame className="w-3 h-3" /> Demos
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">Meetings Booked</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">{meetingsScheduled.length}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Scheduled client presentations</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {wonLeads.length} Won
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500">Closed Revenue</p>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5">{formattedWonValue}</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Collected contract revenue</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Priority Call Queue & Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Priority Outbound Calling Queue */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Quick Call Queue</h3>
                  <p className="text-[11px] text-slate-400">Top prospects ready to dial</p>
                </div>
              </div>
              <Link to="/easy-contact" className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-0.5">
                Full Queue <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-2.5">
              {priorityCallQueue.map(lead => {
                const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');
                const hasWebsite = Boolean(lead.website && lead.website.trim().length > 3);

                return (
                  <div key={lead.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2 hover:border-blue-300 transition-all">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 text-sm truncate">{lead.company}</h4>
                        <p className="text-xs text-slate-500 truncate">{lead.contactPerson || 'Decision Maker'} • {lead.city}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                        hasWebsite ? 'bg-slate-200 text-slate-700' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {hasWebsite ? 'Has Web' : 'Needs Website'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[11px] text-slate-400">
                        Rep: <b className="text-slate-700 capitalize">{lead.assignedTo || 'swaroop'}</b>
                      </span>

                      {lead.phone && lead.phone !== 'N/A' ? (
                        <a
                          href={`tel:${cleanPhone}`}
                          onClick={() => updateLeadStage(lead.id, 'Contacted')}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      ) : (
                        <span className="text-slate-400 text-xs">No Phone</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {priorityCallQueue.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-400">
                  All priority leads have been contacted!
                </div>
              )}
            </div>
          </div>

          <Link
            to="/easy-contact"
            className="w-full mt-4 py-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs text-center transition-all flex items-center justify-center gap-1.5"
          >
            <span>Open Speed Dial Mode</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Right Column: Pipeline Generation Velocity Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pipeline Growth Velocity</h3>
              <p className="text-xs text-slate-400">Prospective new contract pipeline (INR)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              Last 6 Months
            </span>
          </div>

          <div className="h-[220px] sm:h-[260px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashVel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                  formatter={(val: any) => [`₹${(Number(val) || 0).toLocaleString('en-IN')}`, 'Pipeline']}
                />
                <Area type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#dashVel)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <p className="text-slate-400 font-medium">Standard Deal</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">₹10,000</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Outreach Pace</p>
              <p className="font-bold text-blue-600 text-sm mt-0.5">High Velocity</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Website Need Rate</p>
              <p className="font-bold text-emerald-600 text-sm mt-0.5">
                {totalLeads > 0 ? Math.round((leadsNeedingWebsite.length / totalLeads) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Team Leaderboard & Live Action Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Leaderboard */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Team Roster & Performance</h3>
            </div>
            <Link to="/leads" className="text-xs font-bold text-blue-600 hover:underline">
              View All Pipeline
            </Link>
          </div>

          <div className="space-y-3">
            {TEAM_MEMBERS.map(member => {
              const repLeads = leads.filter(l => l.assignedTo === member.id);
              const contacted = repLeads.filter(l => l.stage !== 'New').length;
              const won = repLeads.filter(l => l.stage === 'Won').length;
              const contactRate = repLeads.length > 0 ? Math.round((contacted / repLeads.length) * 100) : 0;

              return (
                <div key={member.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow-sm shrink-0">
                      {member.avatar}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm truncate">{member.name}</h4>
                      <p className="text-xs text-slate-500 font-medium truncate">{member.role}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <p className="text-xs font-bold text-slate-900">{repLeads.length} Leads</p>
                      <p className="text-[11px] text-blue-600 font-semibold">{contactRate}% Contacted</p>
                    </div>
                    <div className="hidden sm:block">
                      <p className="text-xs font-bold text-emerald-600">₹{(won * 10).toFixed(0)}k Won</p>
                      <span className="text-[10px] text-slate-400 font-medium">Closed deals</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live System Activity Ticker */}
        <div className="bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">Live System Action Stream</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Real-Time Events</span>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {activities.slice(0, 6).map(act => (
                <div key={act.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                      {act.user ? act.user.charAt(0) : 'S'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-800 truncate">
                        <span className="font-bold text-blue-600">{act.user}</span> {act.action}
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold truncate">{act.target}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0 font-medium">{act.time}</span>
                </div>
              ))}
            </div>
          </div>

          <Link
            to="/settings"
            className="w-full mt-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs text-center transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Full Audit Log in Settings</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
export default DashboardCharts;
