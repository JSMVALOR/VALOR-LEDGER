import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Search, 
  Filter, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  PhoneCall, 
  Calendar, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Clock, 
  Check, 
  X,
  Building2,
  Globe,
  Mail,
  SlidersHorizontal,
  ThumbsUp,
  ThumbsDown,
  UserCheck
} from 'lucide-react';
import { useStore, TEAM_MEMBERS, type Lead, type LeadStage } from '../../lib/store';

export function EasyContact() {
  const { leads, updateLeadStage, assignLead, setSelectedItem } = useStore();

  // Mode: 'card-deck' (tinder/swipe style for mobile) vs 'grid' (high density for desktop)
  const [dialMode, setDialMode] = useState<'deck' | 'list'>('deck');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedRep, setSelectedRep] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [filterStage, setFilterStage] = useState<'All' | 'New' | 'Contacted'>('All');

  // Filter only prospects that have actionable phone numbers
  const actionableLeads = useMemo(() => {
    return leads.filter(l => {
      const hasPhone = Boolean(l.phone && l.phone !== 'N/A' && l.phone.length > 5);
      const isUnclosed = l.stage !== 'Won' && l.stage !== 'Lost';
      const matchesStage = filterStage === 'All' || l.stage === filterStage;
      return hasPhone && isUnclosed && matchesStage;
    });
  }, [leads, filterStage]);

  const cities = useMemo(() => {
    const set = new Set(actionableLeads.map(l => l.city).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [actionableLeads]);

  const industries = useMemo(() => {
    const set = new Set(actionableLeads.map(l => l.industry).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [actionableLeads]);

  const filteredQueue = useMemo(() => {
    return actionableLeads.filter(l => {
      const matchesSearch = 
        (l.company || '').toLowerCase().includes(search.toLowerCase()) || 
        (l.contactPerson || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.phone || '').includes(search);
      const matchesRep = selectedRep === 'All' || (l.assignedTo || 'swaroop') === selectedRep;
      const matchesCity = cityFilter === 'All' || (l.city || '') === cityFilter;
      const matchesIndustry = industryFilter === 'All' || (l.industry || '') === industryFilter;
      return matchesSearch && matchesRep && matchesCity && matchesIndustry;
    });
  }, [actionableLeads, search, selectedRep, cityFilter, industryFilter]);

  // Safe active prospect for deck mode
  const currentLead = filteredQueue[currentIndex] || filteredQueue[0];

  const handleNext = () => {
    if (currentIndex < filteredQueue.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleQuickAction = (stage: LeadStage) => {
    if (!currentLead) return;
    updateLeadStage(currentLead.id, stage);
    handleNext();
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Top Header & Fast Queue Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Speed Dial Outbound
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {filteredQueue.length} Ready to Call
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Rapid single-focus dialer. Tap call, note outcome, and advance in seconds.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 bg-surface border border-border rounded-xl">
            <button
              onClick={() => setDialMode('deck')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                dialMode === 'deck' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Rapid Deck (Focus)
            </button>
            <button
              onClick={() => setDialMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                dialMode === 'list' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" /> Full Queue
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar (Responsive Grid) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="col-span-2 md:col-span-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search queue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <select
          value={selectedRep}
          onChange={(e) => setSelectedRep(e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-xl text-xs font-medium capitalize focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Sales Reps</option>
          {TEAM_MEMBERS.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
          ))}
        </select>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
        >
          {cities.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'All Regions' : c}</option>
          ))}
        </select>

        <select
          value={filterStage}
          onChange={(e) => setFilterStage(e.target.value as any)}
          className="px-3 py-2 bg-surface border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Uncontacted</option>
          <option value="New">Never Called (Raw)</option>
          <option value="Contacted">Called Once</option>
        </select>
      </div>

      {/* RAPID DECK MODE (Mobile Tinder / Focus Dial Card) */}
      {dialMode === 'deck' && (
        <div className="flex flex-col items-center justify-center py-2 md:py-6">
          {currentLead ? (
            <div className="w-full max-w-lg space-y-4">
              {/* Progress counter pill */}
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-1">
                <span>Account {currentIndex + 1} of {filteredQueue.length}</span>
                <span className="capitalize">Assigned: <b className="text-foreground">{currentLead.assignedTo || 'swaroop'}</b></span>
              </div>

              {/* The Hero Call Card */}
              <motion.div
                key={currentLead.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-surface border-2 border-border hover:border-blue-500/50 rounded-3xl p-6 md:p-8 shadow-xl space-y-6 relative overflow-hidden transition-all"
              >
                {/* Stage Tag */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
                      {currentLead.stage} Lead
                    </span>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-foreground leading-tight tracking-tight">
                      {currentLead.company}
                    </h2>
                    <p className="text-sm font-medium text-muted-foreground mt-1">
                      {currentLead.contactPerson || 'Decision Maker / Owner'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>

                {/* Account Context Chips */}
                <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-background border border-border rounded-2xl text-xs">
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium">Industry Category</span>
                    <p className="font-bold text-foreground mt-0.5">{currentLead.industry}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground font-medium">City / Location</span>
                    <p className="font-bold text-foreground mt-0.5">{currentLead.city}</p>
                  </div>
                  <div className="pt-2 border-t border-border/60">
                    <span className="text-[11px] text-muted-foreground font-medium">Standard Retainer</span>
                    <p className="font-bold text-emerald-600 mt-0.5">₹{(currentLead.value || 10000).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="pt-2 border-t border-border/60">
                    <span className="text-[11px] text-muted-foreground font-medium">Priority</span>
                    <p className="font-bold text-foreground mt-0.5">{currentLead.priority || 'Medium'}</p>
                  </div>
                </div>

                {/* Big Native Call Button */}
                <div>
                  <a
                    href={`tel:${(currentLead.phone || '').split('/')[0].replace(/[^0-9+]/g, '')}`}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base md:text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
                  >
                    <Phone className="w-5 h-5 fill-current animate-pulse" />
                    Call {currentLead.phone}
                  </a>
                  <p className="text-[11px] text-center text-muted-foreground mt-2">
                    Tapping initiates immediate phone call on mobile or PC dialer.
                  </p>
                </div>

                {/* Outcome Triggers (1-Tap Result) */}
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground text-center">
                    Log Call Result & Next Step
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleQuickAction('Meeting Scheduled')}
                      className="py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs flex flex-col items-center gap-1 transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Booked Demo</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('Qualified')}
                      className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex flex-col items-center gap-1 transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Interested</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('Contacted')}
                      className="py-2.5 px-2 rounded-xl bg-background hover:bg-surface border border-border text-foreground font-bold text-xs flex flex-col items-center gap-1 transition-all"
                    >
                      <Clock className="w-4 h-4" />
                      <span>No Answer</span>
                    </button>
                  </div>
                </div>

                {/* Navigation controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedItem({ type: 'lead', id: currentLead.id })}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    View Account Details
                  </button>
                  <button
                    onClick={handleNext}
                    className="p-2 rounded-xl border border-border text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-foreground">Queue Completed!</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                All prioritized leads in this filter segment have been contacted. Switch filters or head to the pipeline.
              </p>
            </div>
          )}
        </div>
      )}

      {/* FULL LIST MODE (Detailed desktop / mobile grid) */}
      {dialMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredQueue.map((lead) => {
            const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

            return (
              <div
                key={lead.id}
                onClick={() => setSelectedItem({ type: 'lead', id: lead.id })}
                className="bg-surface/80 border border-border hover:border-blue-400 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-sm transition-all cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-foreground text-base truncate flex-1">
                      {lead.company}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                      {lead.stage}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {lead.contactPerson || 'Decision Maker'} • {lead.city}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1">
                    Rep: <span className="text-foreground capitalize">{lead.assignedTo || 'swaroop'}</span>
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  <a
                    href={`tel:${cleanPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call {lead.phone}
                  </a>

                  <div className="grid grid-cols-2 gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => updateLeadStage(lead.id, 'Meeting Scheduled')}
                      className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold"
                    >
                      Book Demo
                    </button>
                    <button
                      onClick={() => updateLeadStage(lead.id, 'Qualified')}
                      className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold"
                    >
                      Qualified
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredQueue.length === 0 && (
            <div className="col-span-full py-16 text-center text-xs text-muted-foreground">
              No contacts matching filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default EasyContact;
