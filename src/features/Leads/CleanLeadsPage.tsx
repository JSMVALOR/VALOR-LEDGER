import { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Download, 
  Phone, 
  MessageCircle, 
  Globe, 
  Flame, 
  RefreshCw, 
  X, 
  Check, 
  List, 
  LayoutGrid, 
  Columns3,
  ExternalLink,
  Save, 
  Trash2, 
  ArrowRight,
  MapPin,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { 
  useStore, 
  getWhatsAppUrl, 
  type Lead, 
  type LeadStage, 
  type Priority 
} from '../../lib/store';

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

const STAGE_STYLES: Record<string, string> = {
  'New': 'bg-blue-50 text-blue-700 border-blue-200/80',
  'Contacted': 'bg-slate-100 text-slate-700 border-slate-200',
  'Qualified': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Meeting Scheduled': 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
  'Proposal Sent': 'bg-amber-50 text-amber-800 border-amber-200',
  'Negotiation': 'bg-pink-50 text-pink-700 border-pink-200',
  'Won': 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold',
  'Lost': 'bg-rose-50 text-rose-700 border-rose-200'
};

export function CleanLeadsPage() {
  const { 
    allLeads, 
    leads: storeLeads, 
    addLead, 
    updateLeadStage, 
    updateLeadNotes, 
    deleteLead, 
    refreshData, 
    isLoadingCloud 
  } = useStore();

  // Pure leads pool: all leads without rep segregation
  const leads = allLeads && allLeads.length > 0 ? allLeads : storeLeads;

  // View Mode: Table | Cards | Kanban Board
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'board'>('table');

  // Filter States
  const [segmentTab, setSegmentTab] = useState<'all' | 'needs-web' | 'has-web' | 'new' | 'meetings' | 'won'>('all');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);

  // Active Lead for Slide-Over Drawer
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [activeNotes, setActiveNotes] = useState('');
  const [activeFollowUp, setActiveFollowUp] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Add Lead Modal State
  const [isAddOpen, setIsAddOpen] = useState(false);
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
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Extract unique cities & industries
  const cities = useMemo(() => {
    const set = new Set(leads.map(l => l.city).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [leads]);

  const industries = useMemo(() => {
    const set = new Set(leads.map(l => l.industry).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [leads]);

  // Segment Tab Counts
  const countNeedsWeb = useMemo(() => leads.filter(l => !l.website || l.website.trim() === '').length, [leads]);
  const countHasWeb = useMemo(() => leads.filter(l => Boolean(l.website && l.website.trim().length > 3)).length, [leads]);
  const countNew = useMemo(() => leads.filter(l => l.stage === 'New').length, [leads]);
  const countMeetings = useMemo(() => leads.filter(l => l.stage === 'Meeting Scheduled' || l.stage === 'Proposal Sent' || l.stage === 'Negotiation').length, [leads]);
  const countWon = useMemo(() => leads.filter(l => l.stage === 'Won').length, [leads]);
  const totalValue = useMemo(() => leads.reduce((sum, l) => sum + (l.value || 10000), 0), [leads]);

  // Primary Segment Filter
  const segmentFiltered = useMemo(() => {
    if (segmentTab === 'needs-web') return leads.filter(l => !l.website || l.website.trim() === '');
    if (segmentTab === 'has-web') return leads.filter(l => Boolean(l.website && l.website.trim().length > 3));
    if (segmentTab === 'new') return leads.filter(l => l.stage === 'New');
    if (segmentTab === 'meetings') return leads.filter(l => l.stage === 'Meeting Scheduled' || l.stage === 'Proposal Sent' || l.stage === 'Negotiation');
    if (segmentTab === 'won') return leads.filter(l => l.stage === 'Won');
    return leads;
  }, [leads, segmentTab]);

  // Search & Dropdown Filters
  const displayedLeads = useMemo(() => {
    return segmentFiltered.filter(l => {
      const q = search.toLowerCase().trim();
      const matchesSearch = !q || 
        (l.company || '').toLowerCase().includes(q) || 
        (l.contactPerson || '').toLowerCase().includes(q) ||
        (l.phone || '').includes(q) ||
        (l.city || '').toLowerCase().includes(q);
      const matchesCity = cityFilter === 'All' || (l.city || '') === cityFilter;
      const matchesIndustry = industryFilter === 'All' || (l.industry || '') === industryFilter;
      return matchesSearch && matchesCity && matchesIndustry;
    });
  }, [segmentFiltered, search, cityFilter, industryFilter]);

  const paginatedLeads = useMemo(() => {
    return displayedLeads.slice(0, visibleCount);
  }, [displayedLeads, visibleCount]);

  const handleOpenLead = (lead: Lead) => {
    setActiveLead(lead);
    setActiveNotes(lead.notes || '');
    setActiveFollowUp(lead.nextFollowUp || '');
    setNoteSaved(false);
  };

  const handleSaveNotes = () => {
    if (!activeLead) return;
    updateLeadNotes(activeLead.id, activeNotes, activeFollowUp);
    setActiveLead({ ...activeLead, notes: activeNotes, nextFollowUp: activeFollowUp });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleDeleteLead = () => {
    if (!activeLead) return;
    if (window.confirm(`Are you sure you want to delete "${activeLead.company}"?`)) {
      deleteLead(activeLead.id);
      setActiveLead(null);
    }
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
    });

    setIsAddOpen(false);
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
    });
  };

  const handleExportCSV = () => {
    if (displayedLeads.length === 0) return;
    const headers = ['Company', 'Contact Person', 'Phone', 'City', 'Industry', 'Website', 'Stage', 'Value', 'Notes'];
    const rows = displayedLeads.map(l => [
      `"${l.company}"`, `"${l.contactPerson}"`, `"${l.phone}"`, `"${l.city}"`, `"${l.industry}"`,
      `"${l.website || ''}"`, `"${l.stage}"`, l.value, `"${l.notes || ''}"`
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Grouping for Kanban Board View
  const boardColumns = useMemo(() => [
    { title: 'New Leads', stage: 'New' as LeadStage, color: 'border-blue-500' },
    { title: 'Contacted', stage: 'Contacted' as LeadStage, color: 'border-slate-400' },
    { title: 'Qualified / Demo', stage: 'Meeting Scheduled' as LeadStage, color: 'border-purple-500' },
    { title: 'In Proposal', stage: 'Proposal Sent' as LeadStage, color: 'border-amber-500' },
    { title: 'Closed Won', stage: 'Won' as LeadStage, color: 'border-emerald-500' },
  ], []);

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-16 font-sans">
      {/* Clean Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Leads
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-numeric">
              {displayedLeads.length} prospects · ₹{(totalValue / 100000).toFixed(1)}L Pipeline
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoadingCloud}
              title="Sync latest from database"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isLoadingCloud ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified small business prospects, local offices, and professional practices. 1-tap call & WhatsApp pitch.
          </p>
        </div>

        {/* View Switcher & Core Actions */}
        <div className="flex items-center gap-2">
          {/* 3 View Switcher Pills */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-0.5 rounded-xl">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table view"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Table</span>
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Card view"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'board' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Kanban Board view"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Lead</span>
          </button>
        </div>
      </div>

      {/* Unified Single-Row Filter & Search Bar */}
      <div className="space-y-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Segment Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            <button
              onClick={() => { setSegmentTab('all'); setVisibleCount(40); }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors whitespace-nowrap ${
                segmentTab === 'all'
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              All ({leads.length})
            </button>

            <button
              onClick={() => { setSegmentTab('needs-web'); setVisibleCount(40); }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                segmentTab === 'needs-web'
                  ? 'bg-amber-600 text-white font-bold shadow-2xs'
                  : 'text-amber-700 hover:bg-amber-50 font-medium'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Needs Web ({countNeedsWeb})</span>
            </button>

            <button
              onClick={() => { setSegmentTab('has-web'); setVisibleCount(40); }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors whitespace-nowrap ${
                segmentTab === 'has-web'
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              Has Web ({countHasWeb})
            </button>

            <button
              onClick={() => { setSegmentTab('new'); setVisibleCount(40); }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors whitespace-nowrap ${
                segmentTab === 'new'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              New ({countNew})
            </button>

            <button
              onClick={() => { setSegmentTab('meetings'); setVisibleCount(40); }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors whitespace-nowrap ${
                segmentTab === 'meetings'
                  ? 'bg-purple-700 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              Demos ({countMeetings})
            </button>

            <button
              onClick={() => { setSegmentTab('won'); setVisibleCount(40); }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors whitespace-nowrap ${
                segmentTab === 'won'
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              Won ({countWon})
            </button>
          </div>

          {/* Search & Filter Dropdown Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search business, doctor, advocate, phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setVisibleCount(40); }}
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 transition-colors shadow-2xs"
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
              className={`px-3 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs ${
                showFilters || cityFilter !== 'All' || industryFilter !== 'All'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Expandable City & Industry Dropdowns */}
        {showFilters && (
          <div className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center gap-3 text-xs shadow-2xs animate-fade-in">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Refine:</span>

            <select
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setVisibleCount(40); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Cities</option>
              {cities.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={industryFilter}
              onChange={(e) => { setIndustryFilter(e.target.value); setVisibleCount(40); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none max-w-[240px] truncate cursor-pointer"
            >
              <option value="All">All Sectors</option>
              {industries.filter(i => i !== 'All').map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>

            {(cityFilter !== 'All' || industryFilter !== 'All') && (
              <button
                onClick={() => { setCityFilter('All'); setIndustryFilter('All'); }}
                className="text-xs text-blue-600 hover:underline font-semibold ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* VIEW 1: HIGH-CLARITY TABLE VIEW (DEFAULT) */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4 font-bold">Business / Practice</th>
                  <th className="py-3 px-3 font-bold">Decision Maker</th>
                  <th className="py-3 px-3 font-bold">Phone Number</th>
                  <th className="py-3 px-3 font-bold">City</th>
                  <th className="py-3 px-3 font-bold">Website Status</th>
                  <th className="py-3 px-3 font-bold">Stage</th>
                  <th className="py-3 px-3 font-bold">Value</th>
                  <th className="py-3 px-4 text-right font-bold">Quick Outreach</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLeads.map((lead) => {
                  const hasWeb = Boolean(lead.website && lead.website.trim().length > 3);
                  const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

                  return (
                    <tr 
                      key={lead.id} 
                      onClick={() => handleOpenLead(lead)}
                      className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                    >
                      {/* Business Name & Sector */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block truncate max-w-[240px]">
                          {lead.company}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[240px]">
                          {lead.industry}
                        </span>
                      </td>

                      {/* Decision Maker */}
                      <td className="py-3 px-3 text-slate-700 font-medium">
                        <span className="truncate block max-w-[170px]">
                          {lead.contactPerson || 'Decision Maker'}
                        </span>
                      </td>

                      {/* Phone Number */}
                      <td className="py-3 px-3 font-medium whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <a 
                          href={`tel:${cleanPhone}`} 
                          className="hover:text-emerald-700 flex items-center gap-1.5 text-slate-700 font-bold"
                          title="Click to dial"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{lead.phone}</span>
                        </a>
                      </td>

                      {/* City */}
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {lead.city}
                      </td>

                      {/* Web Status */}
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
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Flame className="w-2.5 h-2.5 text-amber-500" /> Needs Web
                          </span>
                        )}
                      </td>

                      {/* Stage Dropdown */}
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={lead.stage}
                          onChange={(e) => updateLeadStage(lead.id, e.target.value as LeadStage)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium border focus:outline-none cursor-pointer ${
                            STAGE_STYLES[lead.stage] || 'bg-slate-50 text-slate-700'
                          }`}
                        >
                          {STAGES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>

                      {/* Deal Value */}
                      <td className="py-3 px-3 font-semibold text-slate-900 font-numeric whitespace-nowrap">
                        ₹{(lead.value || 10000).toLocaleString('en-IN')}
                      </td>

                      {/* 1-Tap Call & WhatsApp */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          <a
                            href={`tel:${cleanPhone}`}
                            title="Direct Phone Call"
                            onClick={() => updateLeadStage(lead.id, 'Contacted')}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-2xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={getWhatsAppUrl(lead)}
                            target="_blank"
                            rel="noreferrer"
                            title="Send Personalized WhatsApp Pitch"
                            onClick={() => updateLeadStage(lead.id, 'Contacted')}
                            className="p-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-lg transition-colors shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {displayedLeads.length > visibleCount && (
            <div className="text-center p-3 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={() => setVisibleCount(prev => prev + 40)}
                className="px-5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                Load next 40 (Showing {visibleCount} of {displayedLeads.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: CLEAN CARDS GRID */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {paginatedLeads.map((lead) => {
              const hasWeb = Boolean(lead.website && lead.website.trim().length > 3);
              const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

              return (
                <div
                  key={lead.id}
                  onClick={() => handleOpenLead(lead)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-slate-900 text-sm leading-snug truncate group-hover:text-blue-600 transition-colors">
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
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                          Needs Web
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-700 font-medium truncate max-w-[180px]">
                        {lead.contactPerson || 'Decision Maker'}
                      </span>
                      <span className="font-bold text-slate-900 font-numeric shrink-0">
                        ₹{(lead.value || 10000).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 pl-2 border-l-2 border-blue-500 italic py-0.5 line-clamp-2">
                      "{lead.nextFollowUp || 'Pitch High-Converting Appointment & Web Presence'}"
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={lead.stage}
                      onChange={(e) => updateLeadStage(lead.id, e.target.value as LeadStage)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium border focus:outline-none flex-1 max-w-[130px] ${
                        STAGE_STYLES[lead.stage] || 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${cleanPhone}`}
                        title="Direct Phone Call"
                        onClick={() => updateLeadStage(lead.id, 'Contacted')}
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center shadow-2xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={getWhatsAppUrl(lead)}
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp Pitch"
                        onClick={() => updateLeadStage(lead.id, 'Contacted')}
                        className="p-1.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-semibold rounded-lg text-xs flex items-center justify-center shadow-2xs transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {displayedLeads.length > visibleCount && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCount(prev => prev + 40)}
                className="px-5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                Load next 40 (Showing {visibleCount} of {displayedLeads.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: PIPELINE KANBAN BOARD */}
      {viewMode === 'board' && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-start overflow-x-auto pb-4">
          {boardColumns.map((col) => {
            const colLeads = displayedLeads.filter(l => {
              if (col.stage === 'Meeting Scheduled') {
                return l.stage === 'Meeting Scheduled' || l.stage === 'Qualified';
              }
              if (col.stage === 'Proposal Sent') {
                return l.stage === 'Proposal Sent' || l.stage === 'Negotiation';
              }
              return l.stage === col.stage;
            });

            return (
              <div key={col.title} className="bg-slate-100/75 border border-slate-200 rounded-2xl p-3 space-y-3">
                <div className={`flex items-center justify-between border-b-2 ${col.color} pb-2`}>
                  <h3 className="text-xs font-bold text-slate-900">{col.title}</h3>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                    {colLeads.length}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[70vh] overflow-y-auto no-scrollbar pr-0.5">
                  {colLeads.slice(0, 30).map((lead) => {
                    const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');
                    return (
                      <div
                        key={lead.id}
                        onClick={() => handleOpenLead(lead)}
                        className="bg-white rounded-xl border border-slate-200/90 p-3 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer space-y-2"
                      >
                        <div>
                          <p className="font-bold text-slate-900 text-xs truncate">{lead.company}</p>
                          <p className="text-[11px] text-slate-400 truncate">{lead.city} · {lead.contactPerson || 'Decision Maker'}</p>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                          <span className="font-bold text-slate-900 font-numeric text-[11px]">
                            ₹{(lead.value || 10000).toLocaleString('en-IN')}
                          </span>
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <a
                              href={`tel:${cleanPhone}`}
                              className="p-1 bg-emerald-600 text-white rounded-md"
                              title="Call"
                            >
                              <Phone className="w-3 h-3" />
                            </a>
                            <a
                              href={getWhatsAppUrl(lead)}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 bg-[#25D366] text-white rounded-md"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {colLeads.length === 0 && (
                    <div className="p-4 text-center text-slate-400 text-xs italic">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CLEAN SLIDE-OVER DRAWER (Lead Inspector & Call Notes) */}
      {activeLead && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs z-50 transition-opacity"
            onClick={() => setActiveLead(null)}
          />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-slide-left font-sans">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{activeLead.company}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">{activeLead.city} · {activeLead.industry}</p>
                </div>
                <button 
                  onClick={() => setActiveLead(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and Opportunity Pill */}
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${STAGE_STYLES[activeLead.stage]}`}>
                  {activeLead.stage}
                </span>
                {!activeLead.website ? (
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" /> Target for ₹10k Website
                  </span>
                ) : (
                  <a
                    href={activeLead.website.startsWith('http') ? activeLead.website : `https://${activeLead.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1"
                  >
                    <Globe className="w-3.5 h-3.5 text-slate-500" /> Visit Existing Site <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                )}
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Decision Maker</span>
                  <p className="font-bold text-slate-900">{activeLead.contactPerson || 'Decision Maker'}</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">Retainer Value</span>
                  <p className="font-bold text-slate-900 font-numeric">₹{(activeLead.value || 10000).toLocaleString('en-IN')}</p>
                </div>
              </div>

              {/* 1-Tap Outbound Actions */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <a
                  href={`tel:${(activeLead.phone || '').replace(/[^0-9+]/g, '')}`}
                  onClick={() => updateLeadStage(activeLead.id, 'Contacted')}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call Phone
                </a>
                <a
                  href={getWhatsAppUrl(activeLead)}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => updateLeadStage(activeLead.id, 'Contacted')}
                  className="py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Pitch
                </a>
              </div>

              {/* Call Notes & Outcome Logging */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Call Notes & Log</span>
                  {noteSaved && <span className="text-emerald-600 font-bold text-xs flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Saved</span>}
                </div>
                <textarea
                  rows={3}
                  value={activeNotes}
                  onChange={(e) => setActiveNotes(e.target.value)}
                  placeholder="Record discussion notes, requirements, demo scheduled time..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-blue-500 font-medium"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={activeFollowUp}
                    onChange={(e) => setActiveFollowUp(e.target.value)}
                    placeholder="Next follow-up action"
                    className="flex-1 p-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800"
                  />
                  <button
                    onClick={handleSaveNotes}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center gap-1 transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Note
                  </button>
                </div>
              </div>

              {/* Pipeline Stage Transition */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Pipeline Stage:</span>
                  <select
                    value={activeLead.stage}
                    onChange={(e) => {
                      const newStage = e.target.value as LeadStage;
                      updateLeadStage(activeLead.id, newStage);
                      setActiveLead({ ...activeLead, stage: newStage });
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 cursor-pointer"
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Delete Lead Button */}
            <div className="pt-4 border-t border-slate-100 mt-6">
              <button
                onClick={handleDeleteLead}
                className="w-full py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Lead
              </button>
            </div>
          </div>
        </>
      )}

      {/* NEW LEAD MODAL */}
      {isAddOpen && (
        <>
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50"
            onClick={() => setIsAddOpen(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl p-6 w-[92vw] max-w-lg shadow-2xl z-50 border border-slate-200 animate-scale-in font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" /> New SMB Prospect
              </h2>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Practice Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Law Chambers"
                  value={newLeadForm.company}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Decision Maker</label>
                  <input
                    type="text"
                    placeholder="e.g. Adv. Rajesh Kumar"
                    value={newLeadForm.contactPerson}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactPerson: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98450 12345"
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newLeadForm.city}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                  <select
                    value={newLeadForm.industry}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, industry: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="Legal & Law Chambers">Legal & Law Chambers</option>
                    <option value="Dental & Medical Clinics">Dental & Medical Clinics</option>
                    <option value="Architecture & Interior Design">Architecture & Interior Design</option>
                    <option value="Chartered Accountants & Tax">Chartered Accountants & Tax</option>
                    <option value="Real Estate Agencies">Real Estate Agencies</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL (Leave blank if Needs Web)</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={newLeadForm.website}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, website: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Create Lead
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default CleanLeadsPage;
