import { useState } from 'react';
import { 
  Users, 
  PhoneForwarded, 
  Trophy, 
  CheckCircle, 
  UserCheck, 
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { useStore, TEAM_MEMBERS } from '../../../lib/store';

export function TeamTab() {
  const { leads, assignLead, updateLeadStage } = useStore();
  const [selectedRep, setSelectedRep] = useState<string>('all');
  const [reassignModalLead, setReassignModalLead] = useState<any | null>(null);

  // Compute live stats per rep
  const repStats = TEAM_MEMBERS.map(member => {
    const repLeads = leads.filter(l => l.assignedTo === member.id);
    const contacted = repLeads.filter(l => l.stage !== 'New').length;
    const meetings = repLeads.filter(l => l.stage === 'Meeting Scheduled').length;
    const won = repLeads.filter(l => l.stage === 'Won').length;
    const revenue = repLeads.filter(l => l.stage === 'Won').reduce((acc, l) => acc + (l.value || 0), 0);
    const conversionRate = repLeads.length > 0 ? ((won / repLeads.length) * 100).toFixed(1) : '0';

    return {
      ...member,
      totalLeads: repLeads.length,
      contacted,
      meetings,
      won,
      revenue,
      conversionRate,
    };
  });

  const filteredLeads = selectedRep === 'all' 
    ? leads.slice(0, 20) 
    : leads.filter(l => l.assignedTo === selectedRep).slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Top Banner & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/70 border border-border p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" /> Sales Rep Leaderboard & Tracking
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time attribution, closed revenue tracking, and lead workload distribution.
          </p>
        </div>

        {/* Rep Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-background border border-border rounded-xl self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedRep('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              selectedRep === 'all' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Reps
          </button>
          {TEAM_MEMBERS.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedRep(m.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                selectedRep === m.id 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold flex items-center justify-center">
                {m.avatar}
              </span>
              {m.name}
            </button>
          ))}
        </div>
      </div>

      {/* Rep Leaderboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {repStats.map((rep, idx) => (
          <div 
            key={rep.id}
            className={`bg-surface/80 border rounded-2xl p-5 flex flex-col justify-between transition-all ${
              selectedRep === rep.id ? 'border-blue-500 shadow-sm' : 'border-border hover:border-blue-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center shadow-sm text-sm">
                    {rep.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      {rep.name}
                      {idx === 0 && (
                        <span title="Top Closer" className="text-amber-500">
                          <Trophy className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium">{rep.role}</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" /> Active
                </span>
              </div>

              {/* Rep Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mt-4 p-3 bg-background/80 border border-border/80 rounded-xl text-xs">
                <div>
                  <p className="text-[11px] text-muted-foreground">Assigned Leads</p>
                  <p className="font-bold text-foreground text-sm mt-0.5">{rep.totalLeads}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted-foreground">Outreach Rate</p>
                  <p className="font-bold text-blue-600 text-sm mt-0.5">
                    {rep.totalLeads > 0 ? Math.round((rep.contacted / rep.totalLeads) * 100) : 0}%
                  </p>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-[11px] text-muted-foreground">Meetings Fixed</p>
                  <p className="font-bold text-amber-600 text-sm mt-0.5">{rep.meetings}</p>
                </div>
                <div className="pt-2 border-t border-border/50">
                  <p className="text-[11px] text-muted-foreground">Revenue Closed</p>
                  <p className="font-bold text-emerald-600 text-sm mt-0.5">₹{(rep.revenue / 1000).toFixed(0)}k</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedRep(rep.id)}
              className="mt-4 w-full py-2 bg-background hover:bg-blue-50 border border-border hover:border-blue-300 text-xs font-semibold rounded-xl text-foreground flex items-center justify-center gap-1.5 transition-colors"
            >
              Filter Assigned Queue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Rep Live Pipeline Table */}
      <div className="bg-surface/70 border border-border rounded-2xl p-5 md:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-border">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {selectedRep === 'all' ? 'All Assigned Prospects' : `Prospects Assigned to ${TEAM_MEMBERS.find(m => m.id === selectedRep)?.name}`}
            </h3>
            <p className="text-xs text-muted-foreground">Direct rep handoff and status actions</p>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            Showing top {filteredLeads.length} leads
          </span>
        </div>

        {/* Mobile View: Cards */}
        <div className="block md:hidden space-y-3">
          {filteredLeads.map(l => (
            <div key={l.id} className="p-4 bg-background border border-border rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-bold text-foreground">{l.company}</h4>
                  <p className="text-xs text-muted-foreground">{l.city} • {l.industry}</p>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                  {l.stage}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                <span className="text-muted-foreground">Rep: <b className="text-foreground capitalize">{l.assignedTo}</b></span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReassignModalLead(l)}
                    className="text-blue-600 font-semibold hover:underline"
                  >
                    Reassign
                  </button>
                  <button
                    onClick={() => updateLeadStage(l.id, 'Meeting Scheduled')}
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    Mark Meeting
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-muted-foreground font-semibold">
                <th className="pb-3 pl-2">Business</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Assigned Rep</th>
                <th className="pb-3">Stage</th>
                <th className="pb-3">Deal Value</th>
                <th className="pb-3 text-right pr-2">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredLeads.map(l => (
                <tr key={l.id} className="hover:bg-background/80 transition-colors">
                  <td className="py-3 pl-2 font-medium text-foreground">
                    <p className="font-bold">{l.company}</p>
                    <p className="text-[11px] text-muted-foreground">{l.contactPerson || 'Decision Maker'}</p>
                  </td>
                  <td className="py-3 text-muted-foreground">{l.city}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-background border border-border font-semibold text-foreground capitalize">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      {l.assignedTo || 'Unassigned'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {l.stage}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-foreground">₹{(l.value || 10000).toLocaleString('en-IN')}</td>
                  <td className="py-3 text-right pr-2 space-x-2">
                    <button
                      onClick={() => setReassignModalLead(l)}
                      className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-background hover:bg-surface border border-border text-foreground transition-colors"
                    >
                      Reassign
                    </button>
                    {l.stage !== 'Won' && (
                      <button
                        onClick={() => updateLeadStage(l.id, 'Meeting Scheduled')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 transition-colors"
                      >
                        Book Meeting
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Reassign Modal Sheet */}
      {reassignModalLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-background border border-border p-6 rounded-2xl max-w-sm w-full shadow-xl space-y-4">
            <h3 className="text-base font-bold text-foreground">
              Reassign {reassignModalLead.company}
            </h3>
            <p className="text-xs text-muted-foreground">
              Transfer this account to another team member to balance outbound workload:
            </p>
            <div className="space-y-2">
              {TEAM_MEMBERS.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    assignLead(reassignModalLead.id, m.id);
                    setReassignModalLead(null);
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between text-xs font-semibold transition-all ${
                    reassignModalLead.assignedTo === m.id 
                      ? 'border-blue-500 bg-blue-50/50 text-blue-700' 
                      : 'border-border hover:border-blue-300 bg-surface'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                      {m.avatar}
                    </span>
                    <span>{m.name} ({m.role})</span>
                  </div>
                  {reassignModalLead.assignedTo === m.id && <span>Current</span>}
                </button>
              ))}
            </div>
            <button
              onClick={() => setReassignModalLead(null)}
              className="w-full py-2.5 border border-border rounded-xl text-xs font-semibold text-muted-foreground hover:bg-surface"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
