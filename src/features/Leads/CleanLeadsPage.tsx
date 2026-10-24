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
  User,
  SlidersHorizontal,
  Clock,
  PhoneCall,
  PhoneOff,
  PhoneMissed,
  PhoneForwarded,
  Sparkles,
  Building2,
  Calendar,
  AlertCircle
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
    currentUser,
    addLead, 
    updateLeadStage, 
    updateLeadNotes, 
    assignLead,
    recordCallOutcome,
    deleteLead, 
    refreshData, 
    isLoadingCloud 
  } = useStore();

  // Pure open leads pool: anyone can call any lead
  const leads = allLeads && allLeads.length > 0 ? allLeads : storeLeads;

  // View Mode: Table | Cards | Board
  const [viewMode, setViewMode] = useState<'cards' | 'table' | 'board'>('cards');

  // Filter States
  const [segmentTab, setSegmentTab] = useState<'all' | 'needs-web' | 'has-web' | 'new' | 'meetings' | 'won'>('all');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [visibleCount, setVisibleCount] = useState(36);

  // Active Lead for Slide-Over Drawer
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [activeNotes, setActiveNotes] = useState('');
  const [activeFollowUp, setActiveFollowUp] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Call Logging Outcome Modal State
  const [callingLead, setCallingLead] = useState<Lead | null>(null);
  const [callNote, setCallNote] = useState('');
  const [selectedOutcome, setSelectedOutcome] = useState<string>('');
  const [outcomeSaved, setOutcomeSaved] = useState(false);

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

  // THE AUTO-CLAIM CALL ACTION:
  // 1. Dials phone (tel:)
  // 2. Automatically assigns lead to currentUser
  // 3. Opens the instant quick outcome logger!
  const handleInitiateCall = (lead: Lead) => {
    const caller = currentUser ? currentUser.username : 'swaroop';
    
    // Auto-claim and assign to caller
    assignLead(lead.id, caller);
    updateLeadStage(lead.id, 'Contacted');

    // Launch call in background
    const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');
    window.location.href = `tel:${cleanPhone}`;

    // Present the Call Outcome Logger modal immediately
    setCallingLead({ ...lead, assignedTo: caller, stage: 'Contacted' });
    setCallNote('');
    setSelectedOutcome('');
    setOutcomeSaved(false);
  };

  const handleInitiateWhatsApp = (lead: Lead) => {
    const caller = currentUser ? currentUser.username : 'swaroop';
    assignLead(lead.id, caller);
    updateLeadStage(lead.id, 'Contacted');
    window.open(getWhatsAppUrl(lead), '_blank', 'noreferrer');
  };

  const handleLogOutcome = (outcomeKey: string) => {
    if (!callingLead) return;
    setSelectedOutcome(outcomeKey);

    recordCallOutcome(callingLead.id, outcomeKey, callNote);
    setOutcomeSaved(true);

    setTimeout(() => {
      setCallingLead(null);
      setOutcomeSaved(false);
    }, 700);
  };

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
    const headers = ['Company', 'Contact Person', 'Phone', 'City', 'Industry', 'Website', 'Stage', 'Value', 'Assigned To', 'Notes'];
    const rows = displayedLeads.map(l => [
      `"${l.company}"`, `"${l.contactPerson}"`, `"${l.phone}"`, `"${l.city}"`, `"${l.industry}"`,
      `"${l.website || ''}"`, `"${l.stage}"`, l.value, `"${l.assignedTo || 'Unassigned'}"`, `"${l.notes || ''}"`
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
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 font-sans">
      {/* 1. PCL ERP STYLE MASTER HEADER BANNER */}
      <div className="bg-white/90 backdrop-blur-2xl border border-slate-200/90 shadow-sm rounded-3xl p-5 sm:p-7 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        {/* Subtle Ambient Back-Glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10 flex items-center gap-4 sm:gap-5 min-w-0 flex-1">
          {/* Big PCL-Style Stylized Icon Badge */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-center justify-center text-blue-600 text-2xl sm:text-3xl shrink-0 shadow-sm">
            <Building2 className="w-7 h-7 sm:w-8 sm:h-8" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 overflow-x-auto whitespace-nowrap no-scrollbar">
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-400">
                PROSPECT REGISTRY
              </span>
              <span className="text-[10px] text-slate-300">/</span>
              <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-blue-600">
                ACTIVE OUTREACH
              </span>
              <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                {displayedLeads.length} Accounts
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight truncate">
              Commercial Leads
            </h1>
            <p className="text-xs sm:text-sm font-medium text-slate-500 truncate mt-0.5">
              Tap Call to dial and automatically claim the lead into your personal queue.
            </p>
          </div>
        </div>

        {/* Right Header Action Cluster */}
        <div className="relative z-10 flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
          {/* 3 View Switcher Pills */}
          <div className="flex items-center bg-slate-100 border border-slate-200 p-1 rounded-2xl">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'cards' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'table' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'board' 
                  ? 'bg-white text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Board View"
            >
              <Columns3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="p-2.5 sm:px-3 sm:py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-2xl flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Export CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="px-4 py-2.5 sm:px-5 sm:py-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-black uppercase tracking-wider rounded-2xl flex items-center gap-1.5 shadow-md shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Lead</span>
          </button>
        </div>
      </div>

      {/* 2. PCL ERP CONTROLS BAR: TABS, SEARCH & FILTER */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Segment Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            <button
              onClick={() => { setSegmentTab('all'); setVisibleCount(36); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                segmentTab === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All
              <span className="px-1.5 py-0.2 bg-white/20 text-white rounded text-[10px] font-bold">
                {leads.length}
              </span>
            </button>

            <button
              onClick={() => { setSegmentTab('needs-web'); setVisibleCount(36); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                segmentTab === 'needs-web'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Needs Web
              <span className="px-1.5 py-0.2 bg-amber-500/20 rounded text-[10px] font-bold">
                {countNeedsWeb}
              </span>
            </button>

            <button
              onClick={() => { setSegmentTab('has-web'); setVisibleCount(36); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                segmentTab === 'has-web'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Has Web
              <span className="px-1.5 py-0.2 bg-slate-200 text-slate-800 rounded text-[10px] font-bold">
                {countHasWeb}
              </span>
            </button>

            <button
              onClick={() => { setSegmentTab('new'); setVisibleCount(36); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                segmentTab === 'new'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              New ({countNew})
            </button>

            <button
              onClick={() => { setSegmentTab('meetings'); setVisibleCount(36); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                segmentTab === 'meetings'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Demos ({countMeetings})
            </button>

            <button
              onClick={() => { setSegmentTab('won'); setVisibleCount(36); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
                segmentTab === 'won'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Won ({countWon})
            </button>
          </div>

          {/* Search Box & Refine Toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-64 group">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search practice, doctor, phone..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setVisibleCount(36); }}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 transition-all shadow-2xs"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 border rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs ${
                showFilters || cityFilter !== 'All' || industryFilter !== 'All'
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Refine Dropdown Filters */}
        {showFilters && (
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center gap-3 text-xs shadow-2xs animate-fade-in">
            <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Refine:</span>

            <select
              value={cityFilter}
              onChange={(e) => { setCityFilter(e.target.value); setVisibleCount(36); }}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="All">All Cities</option>
              {cities.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <select
              value={industryFilter}
              onChange={(e) => { setIndustryFilter(e.target.value); setVisibleCount(36); }}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-700 font-bold focus:outline-none max-w-[240px] truncate cursor-pointer"
            >
              <option value="All">All Sectors</option>
              {industries.filter(i => i !== 'All').map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>

            {(cityFilter !== 'All' || industryFilter !== 'All') && (
              <button
                onClick={() => { setCityFilter('All'); setIndustryFilter('All'); }}
                className="text-xs text-blue-600 hover:underline font-bold ml-auto"
              >
                Reset filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* 3. PCL ERP STYLE CARDS VIEW (Clean, tactile, mobile-optimized) */}
      {viewMode === 'cards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
            {paginatedLeads.map((lead) => {
              const hasWeb = Boolean(lead.website && lead.website.trim().length > 3);
              const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');
              const isClaimedByMe = currentUser && lead.assignedTo?.toLowerCase() === currentUser.username.toLowerCase();

              return (
                <div
                  key={lead.id}
                  onClick={() => handleOpenLead(lead)}
                  className="group relative bg-white hover:bg-slate-50/60 border border-slate-200/90 hover:border-blue-400/60 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer space-y-4"
                >
                  {/* Top Header Row with Status Badges */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          STAGE_STYLES[lead.stage] || 'bg-slate-100 text-slate-700'
                        }`}>
                          {lead.stage}
                        </span>

                        {lead.assignedTo && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            isClaimedByMe 
                              ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {isClaimedByMe ? 'Claimed by You' : `@${lead.assignedTo}`}
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-slate-900 text-lg leading-tight tracking-tight group-hover:text-blue-600 transition-colors truncate">
                        {lead.company}
                      </h3>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5 truncate">
                        {lead.city} · {lead.industry}
                      </p>
                    </div>

                    {/* Web Status Pill */}
                    {hasWeb ? (
                      <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                        Has Web
                      </span>
                    ) : (
                      <span className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1 shadow-2xs">
                        <Flame className="w-3 h-3 text-amber-500" /> Needs Web
                      </span>
                    )}
                  </div>

                  {/* PCL-Style Middle Info Tiles */}
                  <div className="space-y-2.5">
                    {/* Decision Maker Row */}
                    <div className="flex items-center gap-3 text-xs font-semibold text-slate-700">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                        <User className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 truncate leading-snug">
                          {lead.contactPerson || 'Decision Maker'}
                        </p>
                        <p className="text-[11px] text-slate-400 font-numeric">
                          {lead.phone}
                        </p>
                      </div>
                    </div>

                    {/* Pitch & Retainer Card */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Pitch Angle</span>
                        <p className="text-[11px] font-medium text-slate-700 italic truncate mt-0.5">
                          "{lead.nextFollowUp || 'Pitch High-Converting Appointment & Web Presence'}"
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Retainer</span>
                        <span className="font-black text-slate-900 font-numeric text-xs">
                          ₹{(lead.value || 10000).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Action Bar: 1-Tap Direct Call & 1-Tap WhatsApp */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                    {/* Big Call Button - triggers call, auto-claims lead & pops outcome logger */}
                    <button
                      type="button"
                      onClick={() => handleInitiateCall(lead)}
                      className="flex-1 py-3 px-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call Now</span>
                    </button>

                    {/* WhatsApp Button */}
                    <button
                      type="button"
                      onClick={() => handleInitiateWhatsApp(lead)}
                      className="py-3 px-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1EBE5D] active:scale-[0.98] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      title="Send WhatsApp Pitch"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </button>

                    {/* Stage Dropdown */}
                    <select
                      value={lead.stage}
                      onChange={(e) => updateLeadStage(lead.id, e.target.value as LeadStage)}
                      className={`px-2.5 py-2.5 rounded-2xl text-[11px] font-bold border focus:outline-none cursor-pointer max-w-[110px] ${
                        STAGE_STYLES[lead.stage] || 'bg-slate-50 text-slate-700'
                      }`}
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>

          {displayedLeads.length > visibleCount && (
            <div className="text-center pt-2">
              <button
                onClick={() => setVisibleCount(prev => prev + 36)}
                className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 shadow-2xs transition-colors"
              >
                Load more (Showing {visibleCount} of {displayedLeads.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: HIGH-CLARITY TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 font-black uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Business / Practice</th>
                  <th className="py-3.5 px-3">Decision Maker</th>
                  <th className="py-3.5 px-3">Phone</th>
                  <th className="py-3.5 px-3">City</th>
                  <th className="py-3.5 px-3">Web Status</th>
                  <th className="py-3.5 px-3">Stage</th>
                  <th className="py-3.5 px-3">Value</th>
                  <th className="py-3.5 px-4 text-right">Instant Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLeads.map((lead) => {
                  const hasWeb = Boolean(lead.website && lead.website.trim().length > 3);

                  return (
                    <tr 
                      key={lead.id} 
                      onClick={() => handleOpenLead(lead)}
                      className="hover:bg-slate-50/90 transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block truncate max-w-[240px]">
                          {lead.company}
                        </span>
                        <span className="text-[11px] text-slate-400 block truncate max-w-[240px]">
                          {lead.industry}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-700 font-medium">
                        <span className="truncate block max-w-[170px]">
                          {lead.contactPerson || 'Decision Maker'}
                        </span>
                      </td>

                      <td className="py-3 px-3 font-semibold text-slate-800 whitespace-nowrap">
                        {lead.phone}
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
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <Flame className="w-2.5 h-2.5 text-amber-500" /> Needs Web
                          </span>
                        )}
                      </td>

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

                      <td className="py-3 px-3 font-semibold text-slate-900 font-numeric whitespace-nowrap">
                        ₹{(lead.value || 10000).toLocaleString('en-IN')}
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleInitiateCall(lead)}
                            title="Call & Auto-Claim Lead"
                            className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-colors shadow-2xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInitiateWhatsApp(lead)}
                            title="Send WhatsApp Pitch"
                            className="p-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white rounded-xl transition-colors shadow-2xs"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </button>
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
                onClick={() => setVisibleCount(prev => prev + 36)}
                className="px-5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                Load next 36 (Showing {visibleCount} of {displayedLeads.length})
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
                            <button
                              type="button"
                              onClick={() => handleInitiateCall(lead)}
                              className="p-1 bg-emerald-600 text-white rounded-md"
                              title="Call & Claim"
                            >
                              <Phone className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInitiateWhatsApp(lead)}
                              className="p-1 bg-[#25D366] text-white rounded-md"
                              title="WhatsApp"
                            >
                              <MessageCircle className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. FAST CALL OUTCOME LOGGER MODAL / BOTTOM SHEET */}
      {callingLead && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl border border-slate-200 shadow-2xl p-5 sm:p-7 space-y-5 animate-slide-up sm:animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base leading-snug">
                    Log Call Outcome
                  </h3>
                  <p className="text-xs text-slate-500">
                    <span className="font-bold text-slate-800">{callingLead.company}</span> · Claimed by <b className="text-blue-700">{currentUser?.name || 'You'}</b>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCallingLead(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Tap Outcome Grid */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Tap outcome to log instantly:
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Lifted: Interested */}
                <button
                  type="button"
                  onClick={() => handleLogOutcome('interested')}
                  className="p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold text-xs text-left transition-all active:scale-98 flex items-center gap-2.5 shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-black text-xs leading-tight">Interested!</p>
                    <p className="text-[10px] text-emerald-700 font-medium">Book Demo / Meeting</p>
                  </div>
                </button>

                {/* 2. Lifted: Callback Later */}
                <button
                  type="button"
                  onClick={() => handleLogOutcome('callback')}
                  className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-bold text-xs text-left transition-all active:scale-98 flex items-center gap-2.5 shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-black text-xs leading-tight">Call Back Later</p>
                    <p className="text-[10px] text-amber-700 font-medium">Busy / In meeting</p>
                  </div>
                </button>

                {/* 3. Did Not Lift: Ringing / No Answer */}
                <button
                  type="button"
                  onClick={() => handleLogOutcome('no-answer')}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs text-left transition-all active:scale-98 flex items-center gap-2.5 shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-500 text-white flex items-center justify-center shrink-0">
                    <PhoneMissed className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-black text-xs leading-tight">No Answer</p>
                    <p className="text-[10px] text-slate-500 font-medium">Ringing continuously</p>
                  </div>
                </button>

                {/* 4. Lifted: Rejected / Not Interested */}
                <button
                  type="button"
                  onClick={() => handleLogOutcome('rejected')}
                  className="p-3 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 font-bold text-xs text-left transition-all active:scale-98 flex items-center gap-2.5 shadow-2xs"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <PhoneOff className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-black text-xs leading-tight">Rejected / Not Int.</p>
                    <p className="text-[10px] text-rose-700 font-medium">Mark as Lost</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Optional Note Field */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                Quick Discussion Note (Optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Spoke to Dr. Anita, wants WhatsApp brochure sent, follow up Friday"
                value={callNote}
                onChange={(e) => setCallNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCallingLead(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
              >
                Skip / Dismiss
              </button>

              {outcomeSaved ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Outcome Logged & Saved!
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => handleLogOutcome(selectedOutcome || 'contacted')}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-colors"
                >
                  Save Note & Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 5. CLEAN SLIDE-OVER DRAWER (Detailed Prospect View) */}
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

              {/* 1-Tap Outbound Dual Actions */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleInitiateCall(activeLead)}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <Phone className="w-4 h-4" /> Call Now
                </button>
                <button
                  type="button"
                  onClick={() => handleInitiateWhatsApp(activeLead)}
                  className="py-2.5 px-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Pitch
                </button>
              </div>

              {/* Call Notes & Outcome Logging */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Call Notes & Log</span>
                  {noteSaved && <span className="text-emerald-600 font-bold text-xs flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Saved</span>}
                </div>
                <textarea
                  rows={4}
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

      {/* 6. NEW LEAD MODAL */}
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
