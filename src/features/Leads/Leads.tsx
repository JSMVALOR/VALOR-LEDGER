import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  LayoutGrid, 
  List, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  X, 
  Globe,
  Sparkles,
  MapPin,
  Building2,
  ExternalLink,
  ChevronRight,
  Flame,
  AlertTriangle
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore, TEAM_MEMBERS, type Lead, type LeadStage, type Priority } from '../../lib/store';

export function LeadsPage() {
  const { leads, addLead, updateLeadStage, assignLead, setSelectedItem } = useStore();

  // Top Category Filter
  const [filterMode, setFilterMode] = useState<'all' | 'no-website' | 'has-website' | 'meetings' | 'won'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Search & Secondary Filters
  const [search, setSearch] = useState('');
  const [selectedRep, setSelectedRep] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');

  // Add Lead Modal State
  const [openModal, setOpenModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    company: '',
    contactPerson: '',
    phone: '',
    city: 'Bangalore',
    industry: 'Legal',
    stage: 'New' as LeadStage,
    priority: 'Medium' as Priority,
    value: '10000',
    website: '',
    assignedTo: 'swaroop',
  });

  const cities = useMemo(() => {
    const set = new Set(leads.map(l => l.city).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [leads]);

  const industries = useMemo(() => {
    const set = new Set(leads.map(l => l.industry).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [leads]);

  // Primary Category Filter
  const categoryFilteredLeads = useMemo(() => {
    if (filterMode === 'no-website') {
      return leads.filter(l => !l.website || l.website.trim() === '');
    }
    if (filterMode === 'has-website') {
      return leads.filter(l => Boolean(l.website && l.website.trim().length > 3));
    }
    if (filterMode === 'meetings') {
      return leads.filter(l => l.stage === 'Meeting Scheduled' || l.stage === 'Proposal Sent' || l.stage === 'Negotiation');
    }
    if (filterMode === 'won') {
      return leads.filter(l => l.stage === 'Won');
    }
    return leads;
  }, [leads, filterMode]);

  // Search & Secondary Filter
  const displayedLeads = useMemo(() => {
    return categoryFilteredLeads.filter(l => {
      const matchesSearch = 
        (l.company || '').toLowerCase().includes(search.toLowerCase()) || 
        (l.contactPerson || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.phone || '').includes(search);
      const matchesRep = selectedRep === 'All' || (l.assignedTo || 'swaroop') === selectedRep;
      const matchesCity = cityFilter === 'All' || (l.city || '') === cityFilter;
      const matchesIndustry = industryFilter === 'All' || (l.industry || '') === industryFilter;
      return matchesSearch && matchesRep && matchesCity && matchesIndustry;
    });
  }, [categoryFilteredLeads, search, selectedRep, cityFilter, industryFilter]);

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.company) return;

    addLead({
      company: newLeadForm.company,
      contactPerson: newLeadForm.contactPerson || 'Decision Maker',
      phone: newLeadForm.phone || '+91 9800000000',
      city: newLeadForm.city || 'Bangalore',
      industry: newLeadForm.industry,
      stage: newLeadForm.stage,
      priority: newLeadForm.priority,
      value: Number(newLeadForm.value) || 10000,
      nextFollowUp: 'Initial Outreach',
      website: newLeadForm.website.trim(),
      assignedTo: newLeadForm.assignedTo,
    });

    setOpenModal(false);
    setNewLeadForm({
      company: '',
      contactPerson: '',
      phone: '',
      city: 'Bangalore',
      industry: 'Legal',
      stage: 'New',
      priority: 'Medium',
      value: '10000',
      website: '',
      assignedTo: 'swaroop',
    });
  };

  const handleExportCSV = () => {
    if (displayedLeads.length === 0) return;
    const headers = ['Company', 'Contact Person', 'Phone', 'City', 'Industry', 'Website', 'Stage', 'Priority', 'Value', 'Assigned Rep'];
    const rows = displayedLeads.map(l => [
      `"${l.company}"`, `"${l.contactPerson}"`, `"${l.phone}"`, `"${l.city}"`, `"${l.industry}"`,
      `"${l.website || ''}"`, `"${l.stage}"`, `"${l.priority}"`, l.value, `"${l.assignedTo || 'swaroop'}"`
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stageColorMap: Record<string, string> = {
    'New': 'bg-blue-50 text-blue-700 border-blue-200',
    'Contacted': 'bg-slate-100 text-slate-700 border-slate-200',
    'Qualified': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Meeting Scheduled': 'bg-amber-50 text-amber-800 border-amber-200',
    'Proposal Sent': 'bg-purple-50 text-purple-700 border-purple-200',
    'Negotiation': 'bg-pink-50 text-pink-700 border-pink-200',
    'Won': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Lost': 'bg-rose-50 text-rose-700 border-rose-200',
  };

  const countNoWebsite = useMemo(() => leads.filter(l => !l.website || l.website.trim() === '').length, [leads]);
  const countHasWebsite = useMemo(() => leads.filter(l => Boolean(l.website && l.website.trim().length > 3)).length, [leads]);
  const countMeetings = useMemo(() => leads.filter(l => l.stage === 'Meeting Scheduled').length, [leads]);
  const countWon = useMemo(() => leads.filter(l => l.stage === 'Won').length, [leads]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Pipeline & Deals
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {displayedLeads.length} Accounts
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Identify businesses needing websites, assign reps, and track sales progress.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          
          <button
            onClick={() => setOpenModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-blue-500/20 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> Add Prospect
          </button>
        </div>
      </div>

      {/* Primary Category Pill Tabs (Mobile-Friendly Horizontal Bar) */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'all' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Prospects ({leads.length})
          </button>
          <button
            onClick={() => setFilterMode('no-website')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              filterMode === 'no-website' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Needs Website ({countNoWebsite})
          </button>
          <button
            onClick={() => setFilterMode('has-website')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'has-website' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Has Website ({countHasWebsite})
          </button>
          <button
            onClick={() => setFilterMode('meetings')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'meetings' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Demos & Meetings ({countMeetings})
          </button>
          <button
            onClick={() => setFilterMode('won')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'won' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Closed Won ({countWon})
          </button>
        </div>

        {/* Desktop View Switcher */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
            title="Table View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
            title="Kanban Board"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company, phone, owner..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 transition-colors font-medium placeholder:text-slate-400"
          />
        </div>

        <select
          value={selectedRep}
          onChange={(e) => setSelectedRep(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 capitalize"
        >
          <option value="All">All Sales Reps</option>
          {TEAM_MEMBERS.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
          ))}
        </select>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
        >
          {cities.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'All Locations' : c}</option>
          ))}
        </select>

        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
        >
          {industries.map(i => (
            <option key={i} value={i}>{i === 'All' ? 'All Categories' : i}</option>
          ))}
        </select>
      </div>

      {/* MOBILE VIEW: Ultra-Clean Touch Cards (< 768px) */}
      <div className="block md:hidden space-y-3">
        {displayedLeads.map((lead) => {
          const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');
          const hasWebsite = Boolean(lead.website && lead.website.trim().length > 3);

          return (
            <div
              key={lead.id}
              onClick={() => setSelectedItem({ type: 'lead', id: lead.id })}
              className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-sm hover:border-blue-300 transition-all active:scale-[0.99]"
            >
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-slate-900 leading-snug truncate">
                    {lead.company}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {lead.contactPerson || 'Decision Maker'} • {lead.city} • {lead.industry}
                  </p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 border ${stageColorMap[lead.stage] || 'bg-slate-100'}`}>
                  {lead.stage}
                </span>
              </div>

              {/* Website Tag Indicator */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <div>
                  {hasWebsite ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                      <Globe className="w-3 h-3" /> Has Website
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                      <Flame className="w-3 h-3 text-amber-500" /> Needs Website
                    </span>
                  )}
                </div>

                <span className="text-[11px] text-slate-400">
                  Rep: <b className="text-slate-800 capitalize">{lead.assignedTo || 'swaroop'}</b>
                </span>
              </div>

              {/* Direct Actions */}
              <div className="flex items-center gap-2 pt-1">
                {lead.phone && lead.phone !== 'N/A' ? (
                  <a
                    href={`tel:${cleanPhone}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLeadStage(lead.id, 'Contacted');
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call ({lead.phone})
                  </a>
                ) : (
                  <div className="flex-1 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-center text-xs text-slate-400 font-medium">
                    No Phone Available
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'lead', id: lead.id });
                  }}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 text-xs font-semibold hover:bg-slate-100"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}

        {displayedLeads.length === 0 && (
          <div className="py-16 text-center text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
            No accounts found matching your selected filters.
          </div>
        )}
      </div>

      {/* DESKTOP VIEW: High-Information Data Table (>= 768px) */}
      <div className="hidden md:block">
        {viewMode === 'table' ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                    <th className="py-3.5 pl-4">Company & Decision Maker</th>
                    <th className="py-3.5">Category & City</th>
                    <th className="py-3.5">Website Status</th>
                    <th className="py-3.5">Assigned Rep</th>
                    <th className="py-3.5">Deal Stage</th>
                    <th className="py-3.5">Direct Phone</th>
                    <th className="py-3.5 text-right pr-4">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedLeads.map((lead) => {
                    const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');
                    const hasWebsite = Boolean(lead.website && lead.website.trim().length > 3);

                    return (
                      <tr 
                        key={lead.id}
                        onClick={() => setSelectedItem({ type: 'lead', id: lead.id })}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 pl-4">
                          <p className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{lead.company}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{lead.contactPerson || 'Decision Maker'}</p>
                        </td>

                        <td className="py-3">
                          <p className="font-semibold text-slate-800">{lead.industry}</p>
                          <p className="text-[11px] text-slate-400">{lead.city}</p>
                        </td>

                        <td className="py-3" onClick={(e) => e.stopPropagation()}>
                          {hasWebsite ? (
                            <a
                              href={lead.website!.startsWith('http') ? lead.website : `https://${lead.website}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:underline"
                            >
                              <Globe className="w-3 h-3" />
                              <span className="max-w-[130px] truncate">{lead.website!.replace(/^https?:\/\//, '')}</span>
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Flame className="w-2.5 h-2.5 text-amber-500" /> Needs Website
                            </span>
                          )}
                        </td>

                        <td className="py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.assignedTo || 'swaroop'}
                            onChange={(e) => assignLead(lead.id, e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-semibold capitalize focus:outline-none focus:border-blue-500"
                          >
                            {TEAM_MEMBERS.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.stage}
                            onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border focus:outline-none appearance-none cursor-pointer ${stageColorMap[lead.stage] || 'bg-slate-50'}`}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Meeting Scheduled">Meeting Scheduled</option>
                            <option value="Proposal Sent">Proposal Sent</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Won">Won</option>
                            <option value="Lost">Lost</option>
                          </select>
                        </td>

                        <td className="py-3" onClick={(e) => e.stopPropagation()}>
                          {lead.phone && lead.phone !== 'N/A' ? (
                            <a 
                              href={`tel:${cleanPhone}`}
                              onClick={() => updateLeadStage(lead.id, 'Contacted')}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                            >
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </td>

                        <td className="py-3 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                          {lead.stage !== 'Won' ? (
                            <button
                              onClick={() => updateLeadStage(lead.id, 'Meeting Scheduled')}
                              className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors"
                            >
                              Book Demo
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-emerald-600">Deal Closed</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Kanban Board View */
          <div className="grid grid-cols-4 gap-4 overflow-x-auto pb-4">
            {(['New', 'Contacted', 'Meeting Scheduled', 'Won'] as LeadStage[]).map((stage) => {
              const stageLeads = displayedLeads.filter(l => l.stage === stage);

              return (
                <div key={stage} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">{stage}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[11px] font-bold text-slate-700">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {stageLeads.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => setSelectedItem({ type: 'lead', id: l.id })}
                        className="p-3.5 bg-white border border-slate-200/80 rounded-xl hover:border-blue-400 cursor-pointer transition-all space-y-2 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{l.company}</h4>
                          {!l.website && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded shrink-0">No Web</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400">{l.city} • {l.contactPerson}</p>
                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-100 font-semibold">
                          <span className="text-slate-500 capitalize">{l.assignedTo || 'swaroop'}</span>
                          <span className="text-emerald-600 font-bold">₹10k</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Lead Radix Modal Dialog */}
      <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 p-6 rounded-3xl max-w-md w-[92vw] z-50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-bold text-slate-900">
                Add New Business Prospect
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Law Chambers"
                  value={newLeadForm.company}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Adv. Sharma"
                    value={newLeadForm.contactPerson}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98..."
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Location</label>
                  <input
                    type="text"
                    placeholder="Bangalore, Mumbai..."
                    value={newLeadForm.city}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    placeholder="Legal, Clinic..."
                    value={newLeadForm.industry}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Existing Website (Leave empty if none)</label>
                <input
                  type="text"
                  placeholder="https://example.com (or leave empty)"
                  value={newLeadForm.website}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, website: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Sales Rep</label>
                <select
                  value={newLeadForm.assignedTo}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none capitalize font-semibold text-slate-800"
                >
                  {TEAM_MEMBERS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 text-slate-600">
                    Cancel
                  </button>
                </Dialog.Close>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20">
                  Save Account
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
export default LeadsPage;
