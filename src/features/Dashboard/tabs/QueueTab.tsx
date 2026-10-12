import { useState } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  Phone, 
  Calendar, 
  ExternalLink, 
  AlertCircle,
  Filter,
  ArrowRight,
  Flame
} from 'lucide-react';
import { useStore } from '../../../lib/store';

export function QueueTab() {
  const { leads, updateLeadStage, tasks, toggleTask } = useStore();
  const [filterType, setFilterType] = useState<'all' | 'hot' | 'followups'>('all');

  // Find leads that need urgent action today:
  // 1. High priority leads
  // 2. Leads in 'Meeting Scheduled' or 'Negotiation'
  // 3. New leads waiting for first contact
  const hotLeads = leads.filter(l => 
    l.priority === 'High' || 
    l.stage === 'Meeting Scheduled' || 
    l.stage === 'Negotiation'
  );

  const pendingFollowups = leads.filter(l => l.stage === 'Contacted' || l.stage === 'Qualified');

  const displayQueue = filterType === 'hot' 
    ? hotLeads 
    : filterType === 'followups' 
      ? pendingFollowups 
      : leads.slice(0, 25);

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface/70 border border-border p-5 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500" /> Daily Action Queue & Follow-Ups
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your single-focus outbound call list. Execute calls without navigating complex menus.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-background border border-border rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'all' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            All Queue ({leads.length})
          </button>
          <button
            onClick={() => setFilterType('hot')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
              filterType === 'hot' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame className="w-3.5 h-3.5" /> High Priority ({hotLeads.length})
          </button>
          <button
            onClick={() => setFilterType('followups')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterType === 'followups' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Follow-Ups ({pendingFollowups.length})
          </button>
        </div>
      </div>

      {/* Main Queue Stream */}
      <div className="space-y-3">
        {displayQueue.map((lead) => {
          const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

          return (
            <div 
              key={lead.id}
              className="bg-surface/80 border border-border p-4 md:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-blue-400 transition-all shadow-sm"
            >
              {/* Lead Info */}
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-foreground truncate">{lead.company}</h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    {lead.stage}
                  </span>
                  {lead.priority === 'High' && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5" /> Urgent
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground flex items-center gap-3 flex-wrap">
                  <span>Contact: <b className="text-foreground">{lead.contactPerson || 'Decision Maker'}</b></span>
                  <span>•</span>
                  <span>City: <b className="text-foreground">{lead.city}</b></span>
                  <span>•</span>
                  <span>Rep: <b className="text-foreground capitalize">{lead.assignedTo || 'Unassigned'}</b></span>
                </p>
              </div>

              {/* Direct Touch Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
                {lead.phone && lead.phone !== 'N/A' ? (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Now
                  </a>
                ) : (
                  <span className="px-3 py-1.5 text-xs text-muted-foreground bg-background rounded-lg border border-border">
                    No Phone
                  </span>
                )}

                <button
                  onClick={() => updateLeadStage(lead.id, 'Meeting Scheduled')}
                  className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" /> Book Demo
                </button>

                <button
                  onClick={() => updateLeadStage(lead.id, 'Qualified')}
                  className="px-3 py-2 rounded-xl bg-background hover:bg-surface text-foreground border border-border font-semibold text-xs transition-colors"
                >
                  Mark Qualified
                </button>
              </div>
            </div>
          );
        })}

        {displayQueue.length === 0 && (
          <div className="py-16 text-center text-muted-foreground border border-dashed border-border rounded-2xl">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="font-bold text-foreground">Action Queue Clear!</p>
            <p className="text-xs mt-1">All prioritized prospects have been contacted or updated.</p>
          </div>
        )}
      </div>

      {/* Internal Task Checklist */}
      <div className="bg-surface/70 border border-border p-5 rounded-2xl">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" /> Operational Action Items
        </h3>
        <div className="space-y-2">
          {tasks.map(t => (
            <div 
              key={t.id}
              onClick={() => toggleTask(t.id)}
              className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border cursor-pointer hover:border-blue-300 transition-colors"
            >
              <input
                type="checkbox"
                checked={t.completed}
                onChange={() => {}}
                className="w-4 h-4 rounded text-blue-600 cursor-pointer"
              />
              <span className={`text-xs font-medium flex-1 ${t.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {t.title}
              </span>
              <span className="text-[11px] text-muted-foreground">{t.due}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
