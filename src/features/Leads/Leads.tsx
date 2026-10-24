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
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Save, 
  SlidersHorizontal,
  ExternalLink,
  Zap
} from 'lucide-react';
import { 
  useStore, 
  TEAM_MEMBERS, 
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

export function LeadsPage() {
  const { 
    leads, 
    allLeads, 
    isSuperadmin, 
    currentUser, 
    addLead, 
    updateLeadStage, 
    updateLeadNotes, 
    deleteLead, 
    assignLead, 
    refreshData, 
    isLoadingCloud 
  } = useStore();

  // Filters & Search
  const [filterMode, setFilterMode] = useState<'all' | 'needs-web' | 'has-web' | 'meetings' | 'won'>('all');
  const [search, setSearch] = useState('');
  const [selectedRep, setSelectedRep] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination / Display limit
  const [visibleCount, setVisibleCount] = useState(40);

  // Selected Lead for Slide-over Panel
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [activeNotes, setActiveNotes] = useState('');
  const [activeFollowUp, setActiveFollowUp] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Speed Dial Mode
  const [isDialMode, setIsDialMode] = useState(false);
  const [dialIndex, setDialIndex] = useState(0);

  // Add Lead Modal
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
    assignedTo: currentUser?.username || 'swaroop',
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  // Base list of leads:
  // If Superadmin has selected a specific rep in filter, filter from allLeads.
  // Otherwise use store's scoped leads (which is allLeads for Superadmin, and assigned leads for Rep).
  const baseLeads = useMemo(() => {
    if (isSuperadmin && selectedRep !== 'All') {
      return allLeads.filter(l => (l.assignedTo || 'swaroop').toLowerCase() === selectedRep.toLowerCase());
    }
    return leads;
  }, [isSuperadmin, selectedRep, allLeads, leads]);

  // Derived filter options
  const cities = useMemo(() => {
    const set = new Set(baseLeads.map(l => l.city).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [baseLeads]);

  const industries = useMemo(() => {
    const set = new Set(baseLeads.map(l => l.industry).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [baseLeads]);

  // Quick segment counts
  const countNeedsWeb = useMemo(() => baseLeads.filter(l => !l.website || l.website.trim() === '').length, [baseLeads]);
  const countHasWeb = useMemo(() => baseLeads.filter(l => Boolean(l.website && l.website.trim().length > 3)).length, [baseLeads]);
  const countMeetings = useMemo(() => baseLeads.filter(l => l.stage === 'Meeting Scheduled' || l.stage === 'Proposal Sent' || l.stage === 'Negotiation').length, [baseLeads]);
  const countWon = useMemo(() => baseLeads.filter(l => l.stage === 'Won').length, [baseLeads]);
  const totalValue = useMemo(() => baseLeads.reduce((acc, l) => acc + (l.value || 10000), 0), [baseLeads]);

  // Apply segment tab filter
  const segmentFiltered = useMemo(() => {
    if (filterMode === 'needs-web') return baseLeads.filter(l => !l.website || l.website.trim() === '');
    if (filterMode === 'has-web') return baseLeads.filter(l => Boolean(l.website && l.website.trim().length > 3));
    if (filterMode === 'meetings') return baseLeads.filter(l => l.stage === 'Meeting Scheduled' || l.stage === 'Proposal Sent' || l.stage === 'Negotiation');
    if (filterMode === 'won') return baseLeads.filter(l => l.stage === 'Won');
    return baseLeads;
  }, [baseLeads, filterMode]);

  // Apply search and dropdown filters
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
    if (!activeLead || !isSuperadmin) return;
    if (window.confirm(`Permanently delete "${activeLead.company}"?`)) {
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
      assignedTo: newLeadForm.assignedTo,
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
      assignedTo: currentUser?.username || 'swaroop',
    });
  };

  const handleExportCSV = () => {
    if (displayedLeads.length === 0) return;
    const headers = ['Company', 'Contact Person', 'Phone', 'City', 'Industry', 'Website', 'Stage', 'Value', 'Assigned Rep', 'Notes'];
    const rows = displayedLeads.map(l => [
      `"${l.company}"`, `"${l.contactPerson}"`, `"${l.phone}"`, `"${l.city}"`, `"${l.industry}"`,
      `"${l.website || ''}"`, `"${l.stage}"`, l.value, `"${l.assignedTo || 'swaroop'}"`, `"${l.notes || ''}"`
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const currentDialLead = displayedLeads[dialIndex] || displayedLeads[0];

  return (
    <div className="space-y-4 max-w-7xl mx-auto w-full pb-16 font-sans">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {isSuperadmin ? 'Organization Pipeline' : 'My Assigned Pipeline'}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-numeric">
              {displayedLeads.length} accounts · ₹{(totalValue / 100000).toFixed(1)}L
            </span>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoadingCloud}
              title="Sync latest from Supabase"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isLoadingCloud ? 'animate-spin text-blue-600' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isSuperadmin 
              ? `Master commercial matrix across ${allLeads.length} SMB accounts. Real-time stage tracking and direct rep reassignments.`
              : `Assigned SMB book for ${currentUser?.name || currentUser?.username}. Tap phone to dial or WhatsApp to pitch.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDialMode(!isDialMode)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all ${
              isDialMode 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Focus Dialer</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export</span>
          </button>

          {isSuperadmin && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Prospect</span>
            </button>
          )}
        </div>
      </div>

      {/* FOCUS DIAL RUNNER OVERLAY (Optional Mode) */}
      {isDialMode && currentDialLead && (
        <div className="bg-gradient-to-r from-blue-50/80 via-white to-blue-50/80 border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-xs animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                  Account {dialIndex + 1} of {displayedLeads.length}
                </span>
                {!currentDialLead.website ? (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-500" /> Needs Website
                  </span>
                ) : (
                  <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    Has Website
                  </span>
                )}
                <span className="text-xs text-slate-400">· Rep: <b className="text-slate-700 capitalize">{currentDialLead.assignedTo || 'swaroop'}</b></span>
              </div>

              <h2 className="text-lg font-bold text-slate-900 leading-snug">
                {currentDialLead.company}
              </h2>
              <p className="text-xs text-slate-600">
                {currentDialLead.contactPerson || 'Decision Maker'} · {currentDialLead.city} · {currentDialLead.industry}
              </p>
              <p className="text-xs text-slate-500 italic pt-0.5">
                "{currentDialLead.nextFollowUp || 'Pitch High-Converting Appointment & Web Presence'}"
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href={`tel:${(currentDialLead.phone || '').replace(/[^0-9+]/g, '')}`}
                onClick={() => updateLeadStage(currentDialLead.id, 'Contacted')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Call Phone
              </a>

              <a
                href={getWhatsAppUrl(currentDialLead)}
                target="_blank"
                rel="noreferrer"
                onClick={() => updateLeadStage(currentDialLead.id, 'Contacted')}
                className="px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp Pitch
              </a>

              <button
                onClick={() => {
                  updateLeadStage(currentDialLead.id, 'Meeting Scheduled');
                  if (dialIndex < displayedLeads.length - 1) setDialIndex(d => d + 1);
                }}
                className="px-3 py-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-xs rounded-xl transition-colors"
              >
                Booked Demo
              </button>

              <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                <button
                  onClick={() => setDialIndex(d => Math.max(0, d - 1))}
                  disabled={dialIndex === 0}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDialIndex(d => Math.min(displayedLeads.length - 1, d + 1))}
                  disabled={dialIndex >= displayedLeads.length - 1}
                  className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-slate-600 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified Single-Row Toolbar */}
      <div className="space-y-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Segment Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            <button
              onClick={() => { setFilterMode('all'); setVisibleCount(40); }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors whitespace-nowrap ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              All ({baseLeads.length})
            </button>

            <button
              onClick={() => { setFilterMode('needs-web'); setVisibleCount(40); }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                filterMode === 'needs-web'
                  ? 'bg-amber-600 text-white font-bold shadow-2xs'
                  : 'text-amber-700 hover:bg-amber-50 font-medium'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Needs Web ({countNeedsWeb})</span>
            </button>

            <button
              onClick={() => { setFilterMode('has-web'); setVisibleCount(40); }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors whitespace-nowrap ${
                filterMode === 'has-web'
                  ? 'bg-slate-900 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              Has Web ({countHasWeb})
            </button>

            <button
              onClick={() => { setFilterMode('meetings'); setVisibleCount(40); }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors whitespace-nowrap ${
                filterMode === 'meetings'
                  ? 'bg-purple-700 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              Demos ({countMeetings})
            </button>

            <button
              onClick={() => { setFilterMode('won'); setVisibleCount(40); }}
              className={`px-3 py-1.5 rounded-xl text-xs transition-colors whitespace-nowrap ${
                filterMode === 'won'
                  ? 'bg-emerald-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
              }`}
            >
              Won ({countWon})
            </button>
          </div>

          {/* Search & Secondary Filter Dropdowns */}
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
                showFilters || cityFilter !== 'All' || industryFilter !== 'All' || selectedRep !== 'All'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Expandable Refine Dropdowns Bar */}
        {showFilters && (
          <div className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-wrap items-center gap-3 text-xs shadow-2xs animate-fade-in">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Refine:</span>

            <select
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setVisibleCount(40); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none"
            >
              <option value="All">All Cities</option>
              {cities.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={industryFilter}
              onChange={(e) => { setIndustryFilter(e.target.value); setVisibleCount(40); }}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-semibold focus:outline-none max-w-[220px] truncate"
            >
              <option value="All">All Sectors</option>
              {industries.filter(i => i !== 'All').map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>

            {/* Superadmin Rep Scope Selector */}
            {isSuperadmin && (
              <select
                value={selectedRep}
                onChange={(e) => { setSelectedRep(e.target.value); setVisibleCount(40); }}
                className="px-2.5 py-1.5 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-blue-700 font-bold focus:outline-none capitalize"
              >
                <option value="All">All Reps (Full Matrix)</option>
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            )}

            {(cityFilter !== 'All' || industryFilter !== 'All' || selectedRep !== 'All') && (
              <button
                onClick={() => { setCityFilter('All'); setIndustryFilter('All'); setSelectedRep('All'); }}
                className="text-xs text-blue-600 hover:underline font-semibold ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* High-Clarity Linear-Style Leads Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4 font-bold">Business / Practice</th>
                <th className="py-3 px-3 font-bold">Decision Maker</th>
                <th className="py-3 px-3 font-bold">Direct Phone</th>
                <th className="py-3 px-3 font-bold">City</th>
                <th className="py-3 px-3 font-bold">Web Presence</th>
                <th className="py-3 px-3 font-bold">Pipeline Stage</th>
                <th className="py-3 px-3 font-bold">Assigned Rep</th>
                <th className="py-3 px-4 text-right font-bold">Outreach Action</th>
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
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block truncate max-w-[230px]">
                        {lead.company}
                      </span>
                      <span className="text-[11px] text-slate-400 block truncate max-w-[230px]">
                        {lead.industry}
                      </span>
                    </td>

                    {/* Decision Maker */}
                    <td className="py-3 px-3 text-slate-700 font-medium">
                      <span className="truncate block max-w-[160px]">
                        {lead.contactPerson || 'Decision Maker'}
                      </span>
                    </td>

                    {/* Direct Phone Dial */}
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

                    {/* Assigned Rep */}
                    <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                      {isSuperadmin ? (
                        <select
                          value={lead.assignedTo || 'swaroop'}
                          onChange={(e) => assignLead(lead.id, e.target.value)}
                          className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 focus:outline-none capitalize cursor-pointer"
                        >
                          {TEAM_MEMBERS.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 capitalize">
                          {lead.assignedTo || 'Me'}
                        </span>
                      )}
                    </td>

                    {/* 1-Tap Outbound Buttons */}
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
      </div>

      {/* Pagination Load More */}
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

      {/* Clean Slide-Over Drawer for Lead Inspector & Notes */}
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

              {/* 1-Tap Outbound Dual Action */}
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
                  placeholder="Record prospect conversation notes, pain points, demo callback..."
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

              {/* Assignment & Stage */}
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
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800"
                  >
                    {STAGES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {isSuperadmin && (
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Assigned Rep:</span>
                    <select
                      value={activeLead.assignedTo || 'swaroop'}
                      onChange={(e) => {
                        const newRep = e.target.value;
                        assignLead(activeLead.id, newRep);
                        setActiveLead({ ...activeLead, assignedTo: newRep });
                      }}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-800 capitalize"
                    >
                      {TEAM_MEMBERS.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Superadmin Delete */}
            {isSuperadmin && (
              <div className="pt-4 border-t border-slate-100 mt-6">
                <button
                  onClick={handleDeleteLead}
                  className="w-full py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Prospect Permanently
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Lead Modal */}
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
                  placeholder="e.g. Skyline Law Chambers"
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL (Leave blank if Needs Website)</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={newLeadForm.website}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, website: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              {isSuperadmin && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Assign To Rep</label>
                  <select
                    value={newLeadForm.assignedTo}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, assignedTo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-blue-500 capitalize"
                  >
                    {TEAM_MEMBERS.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}

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

export default LeadsPage;
