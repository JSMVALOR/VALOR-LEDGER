import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  CheckCircle2, 
  ArrowUpRight, 
  Building2, 
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../../../lib/store';

export function OverviewTab() {
  const { leads, activities, currentUser } = useStore();

  const totalLeads = leads.length;
  const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
  const formattedValue = `₹${(totalValue / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}k`;
  
  const meetingsScheduled = leads.filter(l => l.stage === 'Meeting Scheduled').length;
  const wonDeals = leads.filter(l => l.stage === 'Won').length;
  const wonValue = leads.filter(l => l.stage === 'Won').reduce((sum, l) => sum + (l.value || 0), 0);
  const formattedWonValue = `₹${(wonValue / 1000).toLocaleString('en-IN', { maximumFractionDigits: 1 })}k`;

  // Velocity calculations for current month
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

  const userDisplayName = currentUser ? (currentUser.name || currentUser.username) : 'Sales Team';

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent border border-blue-500/20 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 font-semibold text-xs tracking-wider uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" /> Live Revenue Intelligence
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-foreground">
            Welcome back, {userDisplayName} 👋
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your pipeline has <span className="font-semibold text-foreground">{totalLeads} active businesses</span> lined up across India.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Cloud Sync
          </span>
        </div>
      </div>

      {/* Primary KPI Cards - 2 cols on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* KPI 1 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-surface/80 border border-border p-4 md:p-5 rounded-2xl flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +14%
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs text-muted-foreground font-medium">Pipeline Value</p>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mt-0.5">{formattedValue}</h3>
            <p className="text-[11px] text-muted-foreground mt-1">₹10k standard deal size</p>
          </div>
        </motion.div>

        {/* KPI 2 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-surface/80 border border-border p-4 md:p-5 rounded-2xl flex flex-col justify-between hover:border-indigo-500/40 transition-all shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              Reach Ready
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs text-muted-foreground font-medium">Reachable Leads</p>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mt-0.5">{totalLeads}</h3>
            <p className="text-[11px] text-muted-foreground mt-1">Filtered with verified phones</p>
          </div>
        </motion.div>

        {/* KPI 3 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-surface/80 border border-border p-4 md:p-5 rounded-2xl flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <Calendar className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Hot
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs text-muted-foreground font-medium">Meetings Booked</p>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mt-0.5">{meetingsScheduled}</h3>
            <p className="text-[11px] text-muted-foreground mt-1">Ready for demos</p>
          </div>
        </motion.div>

        {/* KPI 4 */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-surface/80 border border-border p-4 md:p-5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              {wonDeals} deals
            </span>
          </div>
          <div className="mt-3">
            <p className="text-xs text-muted-foreground font-medium">Closed Won</p>
            <h3 className="text-xl md:text-2xl font-bold text-foreground mt-0.5">{formattedWonValue}</h3>
            <p className="text-[11px] text-muted-foreground mt-1">Collected revenue</p>
          </div>
        </motion.div>
      </div>

      {/* Chart & Live Activity Ticker Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Trajectory Chart */}
        <div className="lg:col-span-2 bg-surface/70 border border-border rounded-2xl p-5 md:p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-foreground">Pipeline Generation Velocity</h3>
              <p className="text-xs text-muted-foreground">Rolling 6-month prospective contract volume (INR)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-background border border-border text-foreground">
              Last 6 Months
            </span>
          </div>

          <div className="h-[230px] md:h-[260px] w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="velocityGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  formatter={(val: any) => [`₹${(Number(val) || 0).toLocaleString('en-IN')}`, 'Pipeline']}
                />
                <Area type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} fillOpacity={1} fill="url(#velocityGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Deal Pulse Ticker */}
        <div className="bg-surface/70 border border-border rounded-2xl p-5 md:p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-blue-600" /> Live Team Pulse
            </h3>
            <span className="text-[11px] font-medium text-muted-foreground">Recent Events</span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[260px] pr-1">
            {activities.slice(0, 6).map((act) => (
              <div key={act.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-background/80 border border-border/80 text-xs hover:border-blue-300 transition-colors">
                <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-700 text-[11px] shrink-0">
                  {act.user ? act.user.charAt(0) : 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-foreground font-medium truncate">
                    <span className="font-semibold text-blue-600">{act.user}</span> {act.action}
                  </p>
                  <p className="text-muted-foreground font-semibold truncate mt-0.5">
                    {act.target}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{act.time}</span>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No recent activity logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
