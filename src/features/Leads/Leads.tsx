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
  ChevronRight, 
  ChevronLeft,
  Flame, 
  RefreshCw,
  LayoutGrid,
  List,
  User,
  SlidersHorizontal,
  Trash2,
  Save,
  Zap,
  Check,
  Clock,
  MessageCircle
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore, TEAM_MEMBERS, getWhatsAppUrl, type Lead, type LeadStage, type Priority } from '../../lib/store';

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
  const { 
    leads, 
    allLeads, 
    isSuperadmin, 
    currentUser, 
    addLead, 
    updateLeadStage, 
    updateLead, 
    updateLeadNotes,
    deleteLead, 
    assignLead, 
    refreshData, 
    isLoadingCloud 
  } = useStore();

  // Mode switcher: table, grid, or rapid focus dialer
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'dial'>('table');
  const [dialIndex, setDialIndex] = useState(0);

  // Segment filter
  const [filterMode, setFilterMode] = useState<'all' | 'no-website' | 'has-website' | 'meetings' | 'won'>('all');

  // Search & Secondary Filters
  const [search, setSearch] = useState('');
  const [selectedRep, setSelectedRep] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Pagination for table/grid
  const [visibleCount, setVisibleCount] = useState(30);

  // Modals
  const [openAddModal, setOpenAddModal] = useState(false);
  const [detailLead, setDetailLead] = useState<Lead | null>(null);
  const [modalNotes, setModalNotes] = useState('');
  const [modalFollowUp, setModalFollowUp] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

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
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Base list of leads to filter:
  // If Superadmin picks a specific rep from filter dropdown, filter from allLeads.
  // Otherwise use store's scoped leads.
  const baseLeads = useMemo(() => {
    if (isSuperadmin && selectedRep !== 'All') {
      return allLeads.filter(l => (l.assignedTo || 'swaroop').toLowerCase() === selectedRep.toLowerCase());
    }
    return leads;
  }, [isSuperadmin, selectedRep, allLeads, leads]);

  const cities = useMemo(() => {
    const set = new Set(baseLeads.map(l => l.city).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [baseLeads]);

  const industries = useMemo(() => {
    const set = new Set(baseLeads.map(l => l.industry).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [baseLeads]);

  // Counts for tabs
  const countNoWebsite = useMemo(() => baseLeads.filter(l => !l.website || l.website.trim() === '').length, [baseLeads]);
  const countHasWebsite = useMemo(() => baseLeads.filter(l => Boolean(l.website && l.website.trim().length > 3)).length, [baseLeads]);
  const countMeetings = useMemo(() => baseLeads.filter(l => l.stage === 'Meeting Scheduled' || l.stage === 'Proposal Sent' || l.stage === 'Negotiation').length, [baseLeads]);
  const countWon = useMemo(() => baseLeads.filter(l => l.stage === 'Won').length, [baseLeads]);
  const totalPipelineValue = useMemo(() => baseLeads.reduce((acc, l) => acc + (l.value || 10000), 0), [baseLeads]);

  // Primary Segment Filter
  const segmentFiltered = useMemo(() => {
    if (filterMode === 'no-website') return baseLeads.filter(l => !l.website || l.website.trim() === '');
    if (filterMode === 'has-website') return baseLeads.filter(l => Boolean(l.website && l.website.trim().length > 3));
    if (filterMode === 'meetings') return baseLeads.filter(l => l.stage === 'Meeting Scheduled' || l.stage === 'Proposal Sent' || l.stage === 'Negotiation');
    if (filterMode === 'won') return baseLeads.filter(l => l.stage === 'Won');
    return baseLeads;
  }, [baseLeads, filterMode]);

  // Search & Secondary Filter
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

  const currentDialLead = displayedLeads[dialIndex] || displayedLeads[0];

  const handleDialNext = () => {
    if (dialIndex < displayedLeads.length - 1) {
      setDialIndex(prev => prev + 1);
    } else {
      setDialIndex(0);
    }
  };

  const handleDialPrev = () => {
    if (dialIndex > 0) {
      setDialIndex(prev => prev - 1);
    }
  };

  const handleDialOutcome = (stage: LeadStage) => {
    if (!currentDialLead) return;
    updateLeadStage(currentDialLead.id, stage);
    handleDialNext();
  };

  const openInspector = (lead: Lead) => {
    setDetailLead(lead);
    setModalNotes(lead.notes || '');
    setModalFollowUp(lead.nextFollowUp || '');
    setNoteSaved(false);
  };

  const handleSaveNotes = () => {
    if (!detailLead) return;
    updateLeadNotes(detailLead.id, modalNotes, modalFollowUp);
    setDetailLead({ ...detailLead, notes: modalNotes, nextFollowUp: modalFollowUp });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleDeleteCurrentLead = () => {
    if (!detailLead || !isSuperadmin) return;
    if (window.confirm(`Are you sure you want to permanently delete "${detailLead.company}"?`)) {
      deleteLead(detailLead.id);
      setDetailLead(null);
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

    setOpenAddModal(false);
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
      {/* Top Header & Fast Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isSuperadmin ? 'Organization Pipeline' : 'My Pipeline'}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-numeric">
              {displayedLeads.length} accounts · ₹{(totalPipelineValue / 100000).toFixed(1)}L
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
              ? 'Complete sales matrix across all team reps. Direct dial, WhatsApp outreach, and real-time stage tracking.'
              : `Assigned sales accounts for ${currentUser?.name || currentUser?.username}. Call or WhatsApp to book demos.`}
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
            onClick={() => setOpenAddModal(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" /> Add Prospect
          </button>
        </div>
      </div>

      {/* Unified Single Toolbar */}
      <div className="space-y-2">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Segment Pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
            <button
              onClick={() => { setFilterMode('all'); setVisibleCount(30); setDialIndex(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                filterMode === 'all'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All ({baseLeads.length})
            </button>
            <button
              onClick={() => { setFilterMode('no-website'); setVisibleCount(30); setDialIndex(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                filterMode === 'no-website'
                  ? 'bg-amber-600 text-white font-semibold'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-500" /> Needs Web ({countNoWebsite})
            </button>
            <button
              onClick={() => { setFilterMode('has-website'); setVisibleCount(30); setDialIndex(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                filterMode === 'has-website'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Has Web ({countHasWebsite})
            </button>
            <button
              onClick={() => { setFilterMode('meetings'); setVisibleCount(30); setDialIndex(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                filterMode === 'meetings'
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Demos ({countMeetings})
            </button>
            <button
              onClick={() => { setFilterMode('won'); setVisibleCount(30); setDialIndex(0); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap ${
                filterMode === 'won'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Won ({countWon})
            </button>
          </div>

          {/* Search, Filter Toggle & Integrated View Switcher */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 lg:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search business, doctor, city..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setVisibleCount(30); setDialIndex(0); }}
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
                showFilters || cityFilter !== 'All' || industryFilter !== 'All'
                  ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
            </button>

            {/* 3 View Modes: Table, Cards, Speed Dial Runner */}
            <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 shrink-0">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  viewMode === 'table' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Table view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  viewMode === 'grid' ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Cards grid view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('dial')}
                className={`px-2 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                  viewMode === 'dial' ? 'bg-blue-600 text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Speed Dial Focus Deck"
              >
                <Zap className="w-3 h-3" />
                <span className="hidden md:inline text-[11px]">Dialer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Refine Popover */}
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

            {/* Superadmin Rep Scope Selector */}
            {isSuperadmin && (
              <select
                value={selectedRep}
                onChange={(e) => { setSelectedRep(e.target.value); setVisibleCount(30); }}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-blue-700 font-bold focus:outline-none capitalize"
              >
                <option value="All">All Reps (Organization)</option>
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            )}

            {(cityFilter !== 'All' || industryFilter !== 'All' || (isSuperadmin && selectedRep !== 'All')) && (
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

      {/* VIEW MODE 1: INTEGRATED SPEED DIAL FOCUS DECK */}
      {viewMode === 'dial' && (
        <div className="flex flex-col items-center justify-center py-4">
          {currentDialLead ? (
            <div className="w-full max-w-lg space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                <span>Account {dialIndex + 1} of {displayedLeads.length}</span>
                <span className="capitalize">Rep: <b className="text-slate-800">{currentDialLead.assignedTo || 'swaroop'}</b></span>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {currentDialLead.stage}
                    </span>
                    {!currentDialLead.website ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-amber-500" /> Needs Website
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-400" /> Has Website
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 pt-1 leading-snug">
                    {currentDialLead.company}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {currentDialLead.contactPerson || 'Decision Maker'} · {currentDialLead.city} · {currentDialLead.industry}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Pitch Angle</span>
                  <p className="font-medium italic">
                    "{currentDialLead.nextFollowUp || 'Pitch High-Converting Appointment & Web Presence'}"
                  </p>
                </div>

                {/* 1-Tap Dual Outreach: Direct Phone + Native WhatsApp */}
                <div className="grid grid-cols-2 gap-2.5">
                  <a
                    href={`tel:${(currentDialLead.phone || '').replace(/[^0-9+]/g, '')}`}
                    onClick={() => updateLeadStage(currentDialLead.id, 'Contacted')}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Phone</span>
                  </a>

                  <a
                    href={getWhatsAppUrl(currentDialLead)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => updateLeadStage(currentDialLead.id, 'Contacted')}
                    className="py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Pitch</span>
                  </a>
                </div>

                {/* Quick Outcome Actions */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Log Outcome & Advance
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleDialOutcome('Contacted')}
                      className="py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> No Answer
                    </button>
                    <button
                      onClick={() => handleDialOutcome('Meeting Scheduled')}
                      className="py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5 text-purple-600" /> Meeting
                    </button>
                    <button
                      onClick={() => handleDialOutcome('Won')}
                      className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Won Deal
                    </button>
                  </div>
                </div>

                {/* Prev / Next controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handleDialPrev}
                    disabled={dialIndex === 0}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={handleDialNext}
                    disabled={dialIndex >= displayedLeads.length - 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    Skip / Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-2 bg-white border border-dashed border-slate-200 rounded-3xl p-8 max-w-md w-full">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Queue Complete</h3>
              <p className="text-xs text-slate-500">All prioritized leads in this filter segment have been contacted.</p>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: HIGH-CLARITY TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-4 font-semibold">Account / Practice</th>
                    <th className="py-2.5 px-3 font-semibold">Decision Maker</th>
                    <th className="py-2.5 px-3 font-semibold">Phone</th>
                    <th className="py-2.5 px-3 font-semibold">Location</th>
                    <th className="py-2.5 px-3 font-semibold">Web Presence</th>
                    <th className="py-2.5 px-3 font-semibold">Stage</th>
                    {isSuperadmin && <th className="py-2.5 px-3 font-semibold">Rep</th>}
                    <th className="py-2.5 px-4 text-right font-semibold">Direct Action</th>
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
                        onClick={() => openInspector(lead)}
                      >
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors block truncate max-w-[220px]">
                            {lead.company}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-[220px]">
                            {lead.industry}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-slate-700 font-medium">
                          <span className="truncate block max-w-[150px]">{lead.contactPerson || 'Decision Maker'}</span>
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

                        {isSuperadmin && (
                          <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={lead.assignedTo || 'swaroop'}
                              onChange={(e) => assignLead(lead.id, e.target.value)}
                              className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none capitalize"
                            >
                              {TEAM_MEMBERS.map(m => (
                                <option key={m.id} value={m.id}>{m.name}</option>
                              ))}
                            </select>
                          </td>
                        )}

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="inline-flex items-center gap-1">
                            <a
                              href={`tel:${cleanPhone}`}
                              title="Direct Phone Call"
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-2xs"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={getWhatsAppUrl(lead)}
                              target="_blank"
                              rel="noreferrer"
                              title="Send WhatsApp Pitch"
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

      {/* VIEW MODE 3: CLEAN CARDS GRID */}
      {viewMode === 'grid' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {paginatedLeads.map((lead) => {
              const hasWeb = Boolean(lead.website && lead.website.trim().length > 3);
              const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

              return (
                <div
                  key={lead.id}
                  onClick={() => openInspector(lead)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3 cursor-pointer group"
                >
                  <div className="space-y-2">
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

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 text-slate-700 truncate">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{lead.contactPerson || 'Decision Maker'}</span>
                      </div>
                      <span className="font-bold text-slate-900 shrink-0 font-numeric">
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
                      className={`px-2 py-1 rounded-lg text-[11px] font-medium border focus:outline-none flex-1 max-w-[125px] ${stageColorMap[lead.stage] || 'bg-slate-50 text-slate-700'}`}
                    >
                      {STAGES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5">
                      <a
                        href={`tel:${cleanPhone}`}
                        title="Direct Phone Call"
                        className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs flex items-center justify-center shadow-2xs transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={getWhatsAppUrl(lead)}
                        target="_blank"
                        rel="noreferrer"
                        title="WhatsApp Pitch"
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
                onClick={() => setVisibleCount(prev => prev + 30)}
                className="px-5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors"
              >
                Load next 30 (Showing {visibleCount} of {displayedLeads.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* QUICK PROSPECT INSPECTOR & NOTES MODAL */}
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
                    <span className="font-semibold text-slate-900 text-sm font-numeric">₹{(detailLead.value || 10000).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Inline Call Notes & Follow-up */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Call Notes & Log</span>
                    {noteSaved && <span className="text-emerald-600 font-bold text-[11px] flex items-center gap-1"><Check className="w-3 h-3" /> Saved</span>}
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Log prospect discussion, requirements, callback time..."
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Follow-up hook (e.g. Call Friday at 4 PM for Demo)"
                      value={modalFollowUp}
                      onChange={(e) => setModalFollowUp(e.target.value)}
                      className="flex-1 p-2 rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-800"
                    />
                    <button
                      onClick={handleSaveNotes}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold text-xs flex items-center gap-1 transition-colors"
                    >
                      <Save className="w-3 h-3" /> Save Note
                    </button>
                  </div>
                </div>

                {/* Account Details & Settings */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Phone:</span>
                    <span className="font-bold text-slate-900 text-xs">{detailLead.phone}</span>
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

                  {isSuperadmin && (
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
                  )}
                </div>

                {/* Outreach Action Triggers */}
                <div className="pt-3 border-t border-slate-100 flex gap-2">
                  <a
                    href={`tel:${detailLead.phone}`}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-4 h-4" /> Call Now
                  </a>
                  <a
                    href={getWhatsAppUrl(detailLead)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold rounded-xl text-center flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </a>
                  {isSuperadmin && (
                    <button
                      onClick={handleDeleteCurrentLead}
                      title="Permanently Delete Lead (Superadmin)"
                      className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* NEW PROSPECT MODAL */}
      <Dialog.Root open={openAddModal} onOpenChange={setOpenAddModal}>
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

              {isSuperadmin && (
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
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setOpenAddModal(false)}
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
