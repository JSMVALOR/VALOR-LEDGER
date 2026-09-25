import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Users, Calendar, TrendingUp, CheckCircle, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { useStore } from '../../lib/store';

const COLORS = ['#D4AF37', '#8E8E93', '#F3F4F6', '#2C2C2E']; 

const StatCard = ({ title, value, subValue, icon: Icon, trend }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
    className="bg-surface/50 border border-border p-5 rounded-2xl flex flex-col hover:border-primary/30 smooth-transition"
  >
    <div className="flex justify-between items-start mb-4">
      <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-inner">
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
    <div className="flex items-baseline gap-2 mt-1">
      <span className="text-2xl font-bold text-foreground">{value}</span>
      {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
    </div>
  </motion.div>
);

export function DashboardCharts() {
  const { leads, events, tasks, activities } = useStore();
  
  // Real data calculations
  const totalLeads = leads.length;
  
  const totalValue = leads.reduce((acc, lead) => acc + (lead.value || 0), 0);
  const formattedValue = `₹${(totalValue / 1000).toFixed(1)}k`;
  const wonProjects = leads.filter(l => l.stage === 'Won').length;

  const pipelineData = [
    { name: 'New', value: leads.filter(l => l.stage === 'New').length },
    { name: 'Contacted', value: leads.filter(l => l.stage === 'Contacted').length },
    { name: 'Qualified', value: leads.filter(l => l.stage === 'Qualified').length },
    { name: 'Negotiation', value: leads.filter(l => l.stage === 'Negotiation').length },
  ];

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueByMonth = new Map();
  const currentMonth = new Date().getMonth();
  for (let i = 5; i >= 0; i--) {
    let m = currentMonth - i;
    if (m < 0) m += 12;
    revenueByMonth.set(months[m], 0);
  }

  leads.forEach(lead => {
    const leadMonth = months[new Date(lead.createdAt).getMonth()];
    if (revenueByMonth.has(leadMonth)) {
      revenueByMonth.set(leadMonth, revenueByMonth.get(leadMonth) + (lead.value || 0));
    }
  });

  const revenueData = Array.from(revenueByMonth.entries()).map(([name, value]) => ({ name, value }));

  const pendingTasks = tasks.filter(t => !t.completed).length;

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto w-full pb-20 md:pb-0">
      {/* Top Greeting */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-primary" /> You have {pendingTasks} follow-ups pending.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Leads" value={totalLeads} subValue={`₹{activeLeads} Active`} icon={Users} />
        <StatCard title="Revenue Potential" value={formattedValue} subValue="USD" icon={TrendingUp} />
        <StatCard title="Meetings Today" value={leads.filter(l => l.stage === 'Meeting Scheduled').length} subValue="Scheduled" icon={Calendar} />
        <StatCard title="Won Projects" value={wonProjects} subValue="YTD" icon={CheckCircle} />
      </div>

      {/* Main Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        
        {/* Left Column (Main Chart) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 bg-surface/30 border border-border rounded-2xl p-6 flex flex-col shadow-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-foreground">Pipeline Generation</h3>
            <div className="bg-background border border-border text-xs rounded-lg px-3 py-1.5 text-muted-foreground">
              Last 6 Months
            </div>
          </div>
          <div className="flex-1 w-full min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" vertical={false} />
                <XAxis dataKey="name" stroke="#8E8E93" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#8E8E93" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: '12px', color: '#F3F4F6' }}
                  itemStyle={{ color: '#D4AF37', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="value" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right Column (Pipeline & Agenda) */}
        <div className="flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-surface/30 border border-border rounded-2xl p-6 flex flex-col flex-1 shadow-sm"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Pipeline Snapshot</h3>
            <div className="flex-1 w-full min-h-[150px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C2C2E" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" stroke="#8E8E93" fontSize={11} tickLine={false} axisLine={false} width={80} />
                  <Tooltip cursor={{fill: '#1C1C1E'}} contentStyle={{ backgroundColor: '#1C1C1E', border: '1px solid #2C2C2E', borderRadius: '8px' }} />
                  <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
                    {pipelineData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-surface/30 border border-border rounded-2xl p-5 shadow-sm"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-semibold text-foreground">Today's Agenda</h3>
              <button className="text-xs text-primary hover:underline">View All</button>
            </div>
            <div className="space-y-3">
              {events.slice(0, 3).map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border hover:border-primary/50 smooth-transition cursor-pointer group">
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-surface text-primary font-medium text-xs">
                    <span>{item.time.split(' ')[0]}</span>
                    <span className="text-[10px] text-muted-foreground">{item.time.split(' ')[1]}</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground group-hover:text-primary smooth-transition">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">{item.type}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Bottom Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
         {/* Overdue Follow-ups */}
         <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-surface/30 border border-border rounded-2xl p-6 shadow-sm flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-400" />
                <h3 className="text-lg font-semibold text-foreground">Overdue Follow-ups</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-red-500/10 text-red-500">
                {tasks.filter(t => !t.completed).length} Pending
              </span>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {tasks.filter(t => !t.completed).map((item, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-background border border-border border-l-4 border-l-red-500/50 hover:border-l-red-500 smooth-transition cursor-pointer shadow-sm">
                  <div className="flex-1 overflow-hidden pr-4">
                    <h4 className="text-sm font-semibold text-foreground truncate">{item.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.priority} Priority</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded bg-red-500/10 text-red-500 whitespace-nowrap">{item.due}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activities */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-surface/30 border border-border rounded-2xl p-6 shadow-sm"
          >
             <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activities</h3>
             <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {activities.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shadow-[0_0_8px_rgba(212,175,55,0.6)]"></div>
                  <div>
                    <p className="text-sm text-foreground">
                      <span className="text-muted-foreground">{log.user}</span> {log.action} <span className="font-semibold">{log.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{log.time}</p>
                  </div>
                </div>
              ))}
             </div>
          </motion.div>
      </div>
    </div>
  );
}
