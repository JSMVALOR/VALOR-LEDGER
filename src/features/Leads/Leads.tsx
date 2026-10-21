import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
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
  AlertTriangle,
  Compass,
  RefreshCw,
  TrendingUp,
  User,
  ArrowUpDown,
  Check
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore, TEAM_MEMBERS, type Lead, type LeadStage, type Priority } from '../../lib/store';

const STAGES: LeadStage[] = [
  'New', 
  'Contacted', 
  'Qualified', 
  'Meeting Scheduled', 
  'Proposal Sent', 
  'Negotiation', 
  'Won', 
  'Lost'
];

export function LeadsPage() {
  const { leads, addLead, updateLeadStage, assignLead, setSelectedItem, refreshData, isLoadingCloud } = useStore();

  // Top Category Filter
  const [filterMode, setFilterMode] = useState<'all' | 'no-website' | 'has-website' | 'meetings' | 'won'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // Search & Secondary Filters
  const [search, setSearch] = useState('');
  const [selectedRep, setSelectedRep] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination / Load more
  const [visibleCount, setVisibleCount] = useState(30);

  // Add Lead Modal State
  const [openModal, setOpenModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    company: '',
    contactPerson: '',
    phone: '',
    city: 'Bangalore',
    industry: 'Legal & Law Chambers',
    stage: 'New' as LeadStage,
    priority: 'Medium' as Priority,
    value: '10000',
    website: '',
    assignedTo: 'swaroop',
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

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
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || 
        (l.company || '').toLowerCase().includes(q) || 
        (l.contactPerson || '').toLowerCase().includes(q) ||
        (l.phone || '').includes(q) ||
        (l.city || '').toLowerCase().includes(q);
      const matchesRep = selectedRep === 'All' || (l.assignedTo || 'swaroop') === selectedRep;
      const matchesCity = cityFilter === 'All' || (l.city || '') === cityFilter;
      const matchesIndustry = industryFilter === 'All' || (l.industry || '') === industryFilter;
      return matchesSearch && matchesRep && matchesCity && matchesIndustry;
    });
  }, [categoryFilteredLeads, search, selectedRep, cityFilter, industryFilter]);

  // Paginated slice for smooth mobile DOM performance
  const paginatedLeads = useMemo(() => {
    return displayedLeads.slice(0, visibleCount);
  }, [displayedLeads, visibleCount]);

  const hasActiveFilters = search !== '' || selectedRep !== 'All' || cityFilter !== 'All' || industryFilter !== 'All' || filterMode !== 'all';

  const resetAllFilters = () => {
    setSearch('');
    setSelectedRep('All');
    setCityFilter('All');
    setIndustryFilter('All');
    setFilterMode('all');
    setVisibleCount(30);
  };

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.company) return;

    addLead({
      company: newLeadForm.company.trim(),
      contactPerson: newLeadForm.contactPerson || 'Decision Maker',
      phone: newLeadForm.phone || '+91 9800000000',
      city: newLeadForm.city || 'Bangalore',
      industry: newLeadForm.industry,
      stage: newLeadForm.stage,
      priority: newLeadForm.priority,
      value: Number(newLeadForm.value) || 10000,
      nextFollowUp: 'Initial Outreach Call',
      website: newLeadForm.website.trim(),
      assignedTo: newLeadForm.assignedTo,
    });

    setOpenModal(false);
    setNewLeadForm({
      company: '',
      contactPerson: '',
      phone: '',
      city: 'Bangalore',
      industry: 'Legal & Law Chambers',
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
    a.download = `pipeline_export_${Date.now()}.csv`;
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

  // Metrics
  const countNoWebsite = useMemo(() => leads.filter(l => !l.website || l.website.trim() === '').length, [leads]);
  const countHasWebsite = useMemo(() => leads.filter(l => Boolean(l.website && l.website.trim().length > 3)).length, [leads]);
  const countMeetings = useMemo(() => leads.filter(l => l.stage === 'Meeting Scheduled' || l.stage === 'Proposal Sent' || l.stage === 'Negotiation').length, [leads]);
  const countWon = useMemo(() => leads.filter(l => l.stage === 'Won').length, [leads]);
  const totalPipelineValue = useMemo(() => leads.reduce((acc, l) => acc + (l.value || 10000), 0), [leads]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Pipeline & Commercial Deals
            </h1>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoadingCloud}
              title="Re-fetch from Supabase Cloud"
              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing || isLoadingCloud ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Target verified Indian SMB offices. Instantly call, qualify, and update deal stages with real-time Supabase cloud sync.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <Link
            to="/scraper"
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-[0.98]"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-600" /> Run Scraper
          </Link>

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

      {/* High-Impact KPI Snapshot Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => { setFilterMode('no-website'); setVisibleCount(30); }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterMode === 'no-website'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Needs Website</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{countNoWebsite}</p>
          <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">Hot Outbound Prospects</span>
        </button>

        <button
          onClick={() => { setFilterMode('has-website'); setVisibleCount(30); }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterMode === 'has-website'
              ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-400/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Has Website</span>
            <Globe className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{countHasWebsite}</p>
          <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">2026 Redesign Targets</span>
        </button>

        <button
          onClick={() => { setFilterMode('meetings'); setVisibleCount(30); }}
          className={`p-3.5 rounded-2xl border text-left transition-all ${
            filterMode === 'meetings'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400/20'
              : 'bg-white border-slate-200 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between text-purple-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Demos & Meetings</span>
            <Calendar className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">{countMeetings}</p>
          <span className="text-[11px] text-purple-600 font-semibold mt-0.5 block">In Active Negotiation</span>
        </button>

        <div className="p-3.5 rounded-2xl border bg-white border-slate-200 text-left">
          <div className="flex items-center justify-between text-blue-700">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Pipeline</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            ₹{(totalPipelineValue / 100000).toFixed(1)} Lakh
          </p>
          <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">
            {leads.length} Accounts @ ₹10k Standard
          </span>
        </div>
      </div>

      {/* Primary Category Pill Tabs */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => { setFilterMode('all'); setVisibleCount(30); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'all' 
                ? 'bg-slate-900 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Accounts ({leads.length})
          </button>
          
          <button
            onClick={() => { setFilterMode('no-website'); setVisibleCount(30); }}
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
            onClick={() => { setFilterMode('has-website'); setVisibleCount(30); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'has-website' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Has Website ({countHasWebsite})
          </button>

          <button
            onClick={() => { setFilterMode('meetings'); setVisibleCount(30); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'meetings' 
                ? 'bg-purple-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Demos & Meetings ({countMeetings})
          </button>

          <button
            onClick={() => { setFilterMode('won'); setVisibleCount(30); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'won' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900'
            }`}
          >
            Closed Won ({countWon})
          </button>
        </div>

        {/* View Switcher */}
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
            title="Kanban Board View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Secondary Search & Dropdown Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by company, doctor, advocate, phone number, or city..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisibleCount(30); }}
            className="w-full pl-10 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Secondary Filter Dropdowns */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <select
            value={cityFilter}
            onChange={(e) => { setCityFilter(e.target.value); setVisibleCount(30); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Cities</option>
            {cities.filter(c => c !== 'All').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={industryFilter}
            onChange={(e) => { setIndustryFilter(e.target.value); setVisibleCount(30); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none max-w-[160px] truncate"
          >
            <option value="All">All Industries</option>
            {industries.filter(i => i !== 'All').map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>

          <select
            value={selectedRep}
            onChange={(e) => { setSelectedRep(e.target.value); setVisibleCount(30); }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Reps</option>
            {TEAM_MEMBERS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetAllFilters}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Content: Table or Kanban */}
      {viewMode === 'table' ? (
        <div className="space-y-4">
          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                    <th className="py-3 px-4">Business & Account</th>
                    <th className="py-3 px-3">Decision Maker</th>
                    <th className="py-3 px-3">Phone</th>
                    <th className="py-3 px-3">City & Sector</th>
                    <th className="py-3 px-3">Web Status</th>
                    <th className="py-3 px-3">Stage</th>
                    <th className="py-3 px-3">Assigned Rep</th>
                    <th className="py-3 px-4 text-right">Quick Outreach</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedLeads.map((lead) => {
                    const hasWeb = Boolean(lead.website && lead.website.trim().length > 3);
                    const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

                    return (
                      <tr 
                        key={lead.id} 
                        className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                        onClick={() => setSelectedItem({ type: 'lead', id: lead.id })}
                      >
                        <td className="py-3 px-4 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          <div className="truncate max-w-[220px]" title={lead.company}>{lead.company}</div>
                          <div className="text-[10px] text-slate-400 font-normal">Deal: ₹{(lead.value || 10000).toLocaleString('en-IN')}</div>
                        </td>

                        <td className="py-3 px-3 text-slate-700 font-medium truncate max-w-[180px]">
                          {lead.contactPerson || 'Decision Maker'}
                        </td>

                        <td className="py-3 px-3 font-semibold text-slate-900">
                          <a 
                            href={`tel:${cleanPhone}`} 
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-emerald-700 flex items-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            {lead.phone}
                          </a>
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800">{lead.city}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">{lead.industry}</span>
                        </td>

                        <td className="py-3 px-3">
                          {hasWeb ? (
                            <a 
                              href={lead.website} 
                              target="_blank" 
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                            >
                              <Globe className="w-2.5 h-2.5" /> Has Website
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                              <Flame className="w-2.5 h-2.5 text-amber-500" /> Needs Website
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.stage}
                            onChange={(e) => updateLeadStage(lead.id, e.target.value as LeadStage)}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border focus:outline-none cursor-pointer ${stageColorMap[lead.stage] || 'bg-slate-50 text-slate-700'}`}
                          >
                            {STAGES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.assignedTo || 'swaroop'}
                            onChange={(e) => assignLead(lead.id, e.target.value)}
                            className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
                          >
                            {TEAM_MEMBERS.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm shadow-emerald-600/20 active:scale-95 transition-all"
                          >
                            <Phone className="w-3 h-3" /> Call
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card List (< 768px) */}
          <div className="md:hidden space-y-3">
            {paginatedLeads.map((lead) => {
              const hasWeb = Boolean(lead.website && lead.website.trim().length > 3);
              const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

              return (
                <div
                  key={lead.id}
                  onClick={() => setSelectedItem({ type: 'lead', id: lead.id })}
                  className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm active:bg-slate-50 transition-colors space-y-3"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-slate-900 text-sm leading-snug truncate">
                        {lead.company}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{lead.city}</span>
                        <span>•</span>
                        <span className="truncate">{lead.industry}</span>
                      </div>
                    </div>

                    {hasWeb ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                        Has Web
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        <Flame className="w-2.5 h-2.5 text-amber-500" /> Needs Web
                      </span>
                    )}
                  </div>

                  {/* Decision Maker & Deal Value */}
                  <div className="bg-slate-50 rounded-xl p-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate pr-2">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-700 truncate">{lead.contactPerson || 'Decision Maker'}</span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">₹{(lead.value || 10000).toLocaleString('en-IN')}</span>
                  </div>

                  {/* Bottom Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.stage}
                      onChange={(e) => updateLeadStage(lead.id, e.target.value as LeadStage)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border focus:outline-none flex-1 max-w-[160px] ${stageColorMap[lead.stage] || 'bg-slate-50 text-slate-700'}`}
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <a
                      href={`tel:${cleanPhone}`}
                      className="px-4 py-2 bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                    >
                      <Phone className="w-3.5 h-3.5" /> Call Now
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination Controls */}
          {displayedLeads.length > visibleCount && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCount(prev => prev + 30)}
                className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all"
              >
                Load Next 30 Prospects (Showing {visibleCount} of {displayedLeads.length})
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Kanban Board View */
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-[1200px]">
            {STAGES.map((stage) => {
              const stageDeals = displayedLeads.filter(l => l.stage === stage);
              const stageVal = stageDeals.reduce((sum, l) => sum + (l.value || 10000), 0);

              return (
                <div key={stage} className="flex-1 bg-slate-100/70 border border-slate-200/80 rounded-2xl p-3 flex flex-col max-h-[75vh]">
                  {/* Column Header */}
                  <div className="pb-3 border-b border-slate-200/80 flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xs font-extrabold text-slate-800">{stage}</h3>
                      <span className="text-[10px] text-slate-500 font-bold">
                        ₹{(stageVal / 1000).toLocaleString('en-IN')}k
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-slate-700 border border-slate-200">
                      {stageDeals.length}
                    </span>
                  </div>

                  {/* Deals Scrollable Stack */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
                    {stageDeals.slice(0, 20).map((deal) => {
                      const hasWeb = Boolean(deal.website && deal.website.trim().length > 3);
                      return (
                        <div
                          key={deal.id}
                          onClick={() => setSelectedItem({ type: 'lead', id: deal.id })}
                          className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm hover:border-blue-300 transition-all cursor-pointer space-y-2"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="font-bold text-slate-900 text-xs leading-snug truncate" title={deal.company}>
                              {deal.company}
                            </h4>
                            {hasWeb ? (
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1" title="Has Website" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1" title="Needs Website" />
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 truncate">
                            {deal.contactPerson} • {deal.city}
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 font-semibold text-slate-700">
                            <span>₹{(deal.value || 10000).toLocaleString('en-IN')}</span>
                            <a
                              href={`tel:${deal.phone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-bold text-[10px]"
                            >
                              <Phone className="w-3 h-3" /> Dial
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 w-[92vw] max-w-lg shadow-2xl z-50 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <Dialog.Title className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" /> Add Commercial Prospect
              </Dialog.Title>
              <Dialog.Close className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Practice Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bangalore Juris Advocates & Partners"
                  value={newLeadForm.company}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Decision Maker</label>
                  <input
                    type="text"
                    placeholder="e.g. Adv. Rajesh Iyer"
                    value={newLeadForm.contactPerson}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
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
                  <select
                    value={newLeadForm.industry}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                  >
                    <option value="Legal & Law Chambers">Legal & Law Chambers</option>
                    <option value="Dental & Medical Clinics">Dental & Medical Clinics</option>
                    <option value="Architecture & Interior Design">Architecture & Interior Design</option>
                    <option value="Chartered Accountants & Tax">Chartered Accountants & Tax</option>
                    <option value="Real Estate Agencies">Real Estate Agencies</option>
                    <option value="Fitness & Wellness Studios">Fitness & Wellness Studios</option>
                    <option value="Cafes & Specialty Dining">Cafes & Specialty Dining</option>
                    <option value="Creative & Tech Studios">Creative & Tech Studios</option>
                  </select>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign to Sales Rep</label>
                <select
                  value={newLeadForm.assignedTo}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-800"
                >
                  {TEAM_MEMBERS.map(m => (
                    <option key={m.id} value={m.id}>{m.name} ({m.id})</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpenModal(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all"
                >
                  Create Prospect
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
