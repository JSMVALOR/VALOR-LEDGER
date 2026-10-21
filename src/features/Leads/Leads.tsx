import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  X, 
  Globe, 
  Sparkles, 
  MapPin, 
  ExternalLink, 
  ChevronRight, 
  Flame, 
  RefreshCw,
  LayoutGrid,
  List,
  User,
  SlidersHorizontal,
  ArrowUpRight
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
  const { leads, addLead, updateLeadStage, updateLead, assignLead, refreshData, isLoadingCloud } = useStore();

  // Unified segment filter
  const [filterMode, setFilterMode] = useState<'all' | 'no-website' | 'has-website' | 'meetings' | 'won'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Search & Filters
  const [search, setSearch] = useState('');
  const [selectedRep, setSelectedRep] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(30);

  // Modals
  const [openModal, setOpenModal] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);

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

  // Counts for tabs
  const countNoWebsite = useMemo(() => leads.filter(l => !l.website || l.website.trim() === '').length, [leads]);
  const countHasWebsite = useMemo(() => leads.filter(l => Boolean(l.website && l.website.trim().length > 3)).length, [leads]);
  const countMeetings = useMemo(() => leads.filter(l => l.stage === 'Meeting Scheduled' || l.stage === 'Proposal Sent' || l.stage === 'Negotiation').length, [leads]);
  const countWon = useMemo(() => leads.filter(l => l.stage === 'Won').length, [leads]);
  const totalPipelineValue = useMemo(() => leads.reduce((acc, l) => acc + (l.value || 10000), 0), [leads]);

  // Primary Segment Filter
  const segmentFiltered = useMemo(() => {
    if (filterMode === 'no-website') return leads.filter(l => !l.website || l.website.trim() === '');
    if (filterMode === 'has-website') return leads.filter(l => Boolean(l.website && l.website.trim().length > 3));
    if (filterMode === 'meetings') return leads.filter(l => l.stage === 'Meeting Scheduled' || l.stage === 'Proposal Sent' || l.stage === 'Negotiation');
    if (filterMode === 'won') return leads.filter(l => l.stage === 'Won');
    return leads;
  }, [leads, filterMode]);

  // Search & Secondary Filters
  const displayedLeads = useMemo(() => {
    return segmentFiltered.filter(l => {
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
  }, [segmentFiltered, search, selectedRep, cityFilter, industryFilter]);

  const paginatedLeads = useMemo(() => {
    return displayedLeads.slice(0, visibleCount);
  }, [displayedLeads, visibleCount]);

  const hasSecondaryFilters = selectedRep !== 'All' || cityFilter !== 'All' || industryFilter !== 'All';

  const resetSecondaryFilters = () => {
    setSelectedRep('All');
    setCityFilter('All');
    setIndustryFilter('All');
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
    'Won': 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
    'Lost': 'bg-rose-50 text-rose-700 border-rose-200'
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Sleek Top Bar: Title, Pipeline Value & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Pipeline
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {leads.length} accounts · ₹{(totalPipelineValue / 100000).toFixed(1)}L value
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoadingCloud}
              title="Refresh from cloud"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isLoadingCloud ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified Indian SMB accounts and target business profiles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" /> Export
          </button>
          
          <button
            onClick={() => setOpenModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" /> Add Prospect
          </button>
        </div>
      </div>

      {/* Unified Toolbar: Segment Filters + Search + Secondary Filters + View Toggle */}
      <div className="space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Segment Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            <button
              onClick={() => { setFilterMode('all'); setVisibleCount(30); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All ({leads.length})
            </button>
            <button
              onClick={() => { setFilterMode('no-website'); setVisibleCount(30); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                filterMode === 'no-website'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500" /> Needs Web ({countNoWebsite})
            </button>
            <button
              onClick={() => { setFilterMode('has-website'); setVisibleCount(30); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                filterMode === 'has-website'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Has Web ({countHasWebsite})
            </button>
            <button
              onClick={() => { setFilterMode('meetings'); setVisibleCount(30); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                filterMode === 'meetings'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Demos ({countMeetings})
            </button>
            <button
              onClick={() => { setFilterMode('won'); setVisibleCount(30); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                filterMode === 'won'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Won ({countWon})
            </button>
          </div>

          {/* Search, Filter Toggle & View Switcher */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search accounts, names, cities..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setVisibleCount(30); }}
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-2.5 py-1.5 border rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                hasSecondaryFilters || showFilters
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              {hasSecondaryFilters && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'table' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Cards grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Filter Drawer */}
        {showFilters && (
          <div className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center gap-2.5 text-xs animate-fade-in shadow-2xs">
            <span className="font-semibold text-slate-500 uppercase text-[10px] tracking-wider">Refine:</span>
            
            <select
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setVisibleCount(30); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Cities</option>
              {cities.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={industryFilter}
              onChange={(e) => { setIndustryFilter(e.target.value); setVisibleCount(30); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none max-w-[200px] truncate"
            >
              <option value="All">All Industries</option>
              {industries.filter(i => i !== 'All').map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>

            <select
              value={selectedRep}
              onChange={(e) => { setSelectedRep(e.target.value); setVisibleCount(30); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
            >
              <option value="All">All Sales Reps</option>
              {TEAM_MEMBERS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>

            {hasSecondaryFilters && (
              <button
                onClick={resetSecondaryFilters}
                className="text-xs text-blue-600 hover:underline font-semibold ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main View: High-Clarity Table or Clean Cards */}
      {viewMode === 'table' ? (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4 font-semibold">Account / Practice</th>
                    <th className="py-2.5 px-3 font-semibold">Contact Person</th>
                    <th className="py-2.5 px-3 font-semibold">Direct Phone</th>
                    <th className="py-2.5 px-3 font-semibold">Location</th>
                    <th className="py-2.5 px-3 font-semibold">Web Presence</th>
                    <th className="py-2.5 px-3 font-semibold">Stage</th>
                    <th className="py-2.5 px-4 text-right font-semibold">Action</th>
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
                        onClick={() => setDetailLead(lead)}
                      >
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block truncate max-w-[240px]">
                            {lead.company}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[240px]">
                            {lead.industry}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-700 font-medium">
                          <span className="truncate block max-w-[160px]">{lead.contactPerson || 'Decision Maker'}</span>
                        </td>

                        <td className="py-3 px-3 font-medium text-slate-800 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <a 
                            href={`tel:${cleanPhone}`} 
                            className="hover:text-emerald-700 flex items-center gap-1.5 text-slate-700 font-semibold"
                          >
                            <Phone className="w-3 h-3 text-emerald-600" />
                            {lead.phone}
                          </a>
                        </td>

                        <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                          {lead.city}
                        </td>

                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          {hasWeb ? (
                            <a 
                              href={lead.website!.startsWith('http') ? lead.website : `https://${lead.website}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              <Globe className="w-2.5 h-2.5 text-slate-500" /> Web
                            </a>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                              <Flame className="w-2.5 h-2.5 text-amber-500" /> Needs Web
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.stage}
                            onChange={(e) => updateLeadStage(lead.id, e.target.value as LeadStage)}
                            className={`px-2 py-1 rounded-lg text-[11px] font-medium border focus:outline-none cursor-pointer ${stageColorMap[lead.stage] || 'bg-slate-50 text-slate-700'}`}
                          >
                            {STAGES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`tel:${cleanPhone}`}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-2.5 py-1 rounded-lg text-xs shadow-2xs active:scale-95 transition-all"
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

          {displayedLeads.length > visibleCount && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCount(prev => prev + 30)}
                className="px-5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                Load next 30 (Showing {visibleCount} of {displayedLeads.length})
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Clean Cards Grid View (No Nested Cards) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {paginatedLeads.map((lead) => {
              const hasWeb = Boolean(lead.website && lead.website.trim().length > 3);
              const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

              return (
                <div
                  key={lead.id}
                  onClick={() => setDetailLead(lead)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div className="space-y-2">
                    {/* Top Row: Business Name & Web Pill */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate group-hover:text-blue-600 transition-colors">
                          {lead.company}
                        </h3>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {lead.city} · {lead.industry}
                        </p>
                      </div>

                      {hasWeb ? (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 shrink-0">
                          Has Web
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                          Needs Web
                        </span>
                      )}
                    </div>

                    {/* Contact Person */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-700 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{lead.contactPerson || 'Decision Maker'}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0">
                        ₹{(lead.value || 10000).toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* Pitch Strategy Hook */}
                    <div className="text-xs text-slate-600 pl-2 border-l-2 border-blue-500 italic py-0.5 line-clamp-2">
                      "{lead.nextFollowUp || 'Pitch High-Converting Appointment & Web Presence'}"
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.stage}
                      onChange={(e) => updateLeadStage(lead.id, e.target.value as LeadStage)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium border focus:outline-none flex-1 max-w-[130px] ${stageColorMap[lead.stage] || 'bg-slate-50 text-slate-700'}`}
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <a
                      href={`tel:${cleanPhone}`}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs active:scale-95 transition-all"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {displayedLeads.length > visibleCount && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCount(prev => prev + 30)}
                className="px-5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                Load next 30 (Showing {visibleCount} of {displayedLeads.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Quick Prospect Details Modal */}
      <Dialog.Root open={Boolean(detailLead)} onOpenChange={(open) => !open && setDetailLead(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 w-[92vw] max-w-lg shadow-2xl z-50 border border-slate-200 animate-scale-in">
            {detailLead && (
              <div className="space-y-4 text-xs">
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">{detailLead.company}</h2>
                    <p className="text-slate-500 mt-0.5">{detailLead.city} · {detailLead.industry}</p>
                  </div>
                  <Dialog.Close className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                    <X className="w-5 h-5" />
                  </Dialog.Close>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Decision Maker</span>
                    <span className="font-semibold text-slate-900 text-sm">{detailLead.contactPerson || 'Decision Maker'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Retainer</span>
                    <span className="font-semibold text-slate-900 text-sm">₹{(detailLead.value || 10000).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Outreach Hook</span>
                  <div className="p-3 rounded-xl bg-blue-50 text-blue-900 font-medium">
                    {detailLead.nextFollowUp || 'Pitch High-Converting Appointment & Web Presence'}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Phone:</span>
                    <a 
                      href={`tel:${detailLead.phone}`}
                      className="font-bold text-emerald-600 hover:underline flex items-center gap-1 text-sm"
                    >
                      <Phone className="w-3.5 h-3.5" /> {detailLead.phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Website:</span>
                    {detailLead.website ? (
                      <a 
                        href={detailLead.website.startsWith('http') ? detailLead.website : `https://${detailLead.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-1 font-medium truncate max-w-[200px]"
                      >
                        <Globe className="w-3 h-3" /> {detailLead.website}
                      </a>
                    ) : (
                      <span className="text-amber-700 font-medium">None (Hot Lead)</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Stage:</span>
                    <select
                      value={detailLead.stage}
                      onChange={(e) => {
                        const newStage = e.target.value as LeadStage;
                        updateLeadStage(detailLead.id, newStage);
                        setDetailLead({ ...detailLead, stage: newStage });
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Assigned Rep:</span>
                    <select
                      value={detailLead.assignedTo || 'swaroop'}
                      onChange={(e) => {
                        const newRep = e.target.value;
                        assignLead(detailLead.id, newRep);
                        setDetailLead({ ...detailLead, assignedTo: newRep });
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 capitalize"
                    >
                      {TEAM_MEMBERS.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <a
                    href={`tel:${detailLead.phone}`}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Call Now
                  </a>
                  <button
                    onClick={() => setDetailLead(null)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Add Lead Modal */}
      <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 w-[92vw] max-w-lg shadow-2xl z-50 border border-slate-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <Dialog.Title className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> New Prospect
              </Dialog.Title>
              <Dialog.Close className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
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
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs transition-colors"
                >
                  Save Prospect
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
