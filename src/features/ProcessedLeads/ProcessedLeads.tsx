import { useState, useMemo } from 'react';
import { 
  Search, 
  CheckCircle2, 
  Download, 
  Phone, 
  Globe, 
  Building2,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { useStore } from '../../lib/store';

export function ProcessedLeads() {
  const { leads, updateLeadStage } = useStore();
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');

  // Leads that have had outreach done
  const processedLeads = useMemo(() => {
    return leads.filter(l => l.stage !== 'New');
  }, [leads]);

  const filteredLeads = useMemo(() => {
    return processedLeads.filter(l => {
      const matchesSearch = 
        (l.company || '').toLowerCase().includes(search.toLowerCase()) || 
        (l.contactPerson || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.phone || '').includes(search);
      const matchesStage = stageFilter === 'All' || l.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [processedLeads, search, stageFilter]);

  const handleExport = () => {
    if (filteredLeads.length === 0) return;
    const headers = ['Company', 'Contact Person', 'Phone', 'City', 'Industry', 'Stage', 'Value', 'Assigned Rep'];
    const rows = filteredLeads.map(l => [
      `"${l.company}"`, `"${l.contactPerson}"`, `"${l.phone}"`, `"${l.city}"`, `"${l.industry}"`,
      `"${l.stage}"`, l.value, `"${l.assignedTo || 'swaroop'}"`
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `processed_leads_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stageColors: Record<string, string> = {
    'Contacted': 'bg-slate-100 text-slate-700 border-slate-200',
    'Qualified': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Meeting Scheduled': 'bg-amber-50 text-amber-800 border-amber-200',
    'Proposal Sent': 'bg-purple-50 text-purple-700 border-purple-200',
    'Negotiation': 'bg-pink-50 text-pink-700 border-pink-200',
    'Won': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Lost': 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Processed Pipeline History
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {filteredLeads.length} Logged
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical log of all leads contacted, qualified, and closed.
          </p>
        </div>

        <button
          onClick={handleExport}
          className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Export Log
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search processed accounts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium placeholder:text-slate-400"
          />
        </div>

        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
        >
          <option value="All">All Processed Stages</option>
          <option value="Contacted">Contacted</option>
          <option value="Qualified">Qualified</option>
          <option value="Meeting Scheduled">Meeting Scheduled</option>
          <option value="Proposal Sent">Proposal Sent</option>
          <option value="Negotiation">Negotiation</option>
          <option value="Won">Won</option>
          <option value="Lost">Lost</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredLeads.map(lead => {
          const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

          return (
            <div
              key={lead.id}
              className="bg-white border border-slate-200/80 hover:border-slate-300 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-sm transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-base leading-snug truncate flex-1">
                    {lead.company}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${stageColors[lead.stage] || 'bg-slate-50'}`}>
                    {lead.stage}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">
                  {lead.contactPerson || 'Decision Maker'} • {lead.city} • {lead.industry}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Rep: <span className="text-slate-800 capitalize font-semibold">{lead.assignedTo || 'swaroop'}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                {lead.phone && lead.phone !== 'N/A' ? (
                  <a
                    href={`tel:${cleanPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                  >
                    <Phone className="w-3 h-3" /> {lead.phone}
                  </a>
                ) : (
                  <span className="text-slate-400">No Phone</span>
                )}

                <span className="font-bold text-slate-900">
                  ₹{(lead.value || 10000).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          );
        })}

        {filteredLeads.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
            No processed contacts matching this filter.
          </div>
        )}
      </div>
    </div>
  );
}
export default ProcessedLeads;
