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
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Clock, 
  Building2, 
  Globe, 
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useStore, TEAM_MEMBERS, type Lead, type LeadStage } from '../../lib/store';

export function EasyContact() {
  const { leads, updateLeadStage, assignLead } = useStore();

  const [dialMode, setDialMode] = useState<'deck' | 'list'>('deck');
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedRep, setSelectedRep] = useState('All');
  const [websiteFilter, setWebsiteFilter] = useState<'all' | 'no-website' | 'has-website'>('all');
  const [cityFilter, setCityFilter] = useState('All');

  // Leads with valid phones that aren't closed yet
  const actionableLeads = useMemo(() => {
    return leads.filter(l => {
      const hasPhone = Boolean(l.phone && l.phone !== 'N/A' && l.phone.length > 5);
      const isUnclosed = l.stage !== 'Won' && l.stage !== 'Lost';
      const matchesWebsite = 
        websiteFilter === 'all' 
          ? true 
          : websiteFilter === 'no-website' 
            ? (!l.website || l.website.trim() === '')
            : Boolean(l.website && l.website.trim().length > 3);

      return hasPhone && isUnclosed && matchesWebsite;
    });
  }, [leads, websiteFilter]);

  const cities = useMemo(() => {
    const set = new Set(actionableLeads.map(l => l.city).filter(Boolean));
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
      return matchesSearch && matchesRep && matchesCity;
    });
  }, [actionableLeads, search, selectedRep, cityFilter]);

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

  const countNoWebsite = useMemo(() => actionableLeads.filter(l => !l.website || l.website.trim() === '').length, [actionableLeads]);

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Speed Dial Outbound
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {filteredQueue.length} Ready to Dial
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Rapid single-focus dialer. Tap call, note outcome, and advance immediately.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-xl">
            <button
              onClick={() => setDialMode('deck')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                dialMode === 'deck' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> Rapid Deck (Focus)
            </button>
            <button
              onClick={() => setDialMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                dialMode === 'list' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PhoneCall className="w-3.5 h-3.5" /> Full Queue List
            </button>
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="col-span-2 md:col-span-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search dial queue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium placeholder:text-slate-400"
          />
        </div>

        <select
          value={websiteFilter}
          onChange={(e) => setWebsiteFilter(e.target.value as any)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
        >
          <option value="all">All Website Statuses</option>
          <option value="no-website">Needs Website ({countNoWebsite})</option>
          <option value="has-website">Has Existing Website</option>
        </select>

        <select
          value={selectedRep}
          onChange={(e) => setSelectedRep(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 capitalize focus:outline-none focus:border-blue-500"
        >
          <option value="All">All Sales Reps</option>
          {TEAM_MEMBERS.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
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
      </div>

      {/* RAPID DECK MODE (Focus Dial Card for Phone & Desktop) */}
      {dialMode === 'deck' && (
        <div className="flex flex-col items-center justify-center py-2 md:py-4">
          {currentLead ? (
            <div className="w-full max-w-lg space-y-4">
              {/* Progress counter */}
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
                <span>Account {currentIndex + 1} of {filteredQueue.length}</span>
                <span className="capitalize">Assigned Rep: <b className="text-slate-900">{currentLead.assignedTo || 'swaroop'}</b></span>
              </div>

              {/* The Hero Call Card */}
              <motion.div
                key={currentLead.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="bg-white border-2 border-slate-200/90 hover:border-blue-500/50 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 space-y-5 relative overflow-hidden transition-all"
              >
                {/* Header of Card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {currentLead.stage} Lead
                      </span>
                      {!currentLead.website ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-500" /> Pitch: Needs Website
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-500" /> Has Website
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
                      {currentLead.company}
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mt-1">
                      {currentLead.contactPerson || 'Decision Maker / Managing Partner'}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6" />
                  </div>
                </div>

                {/* Account Details Box */}
                <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Industry Category</span>
                    <p className="font-bold text-slate-800 mt-0.5">{currentLead.industry}</p>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Location</span>
                    <p className="font-bold text-slate-800 mt-0.5">{currentLead.city}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-400 font-medium">Standard Retainer</span>
                    <p className="font-bold text-emerald-600 mt-0.5">₹{(currentLead.value || 10000).toLocaleString('en-IN')}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-400 font-medium">Website Link</span>
                    <p className="font-bold text-slate-800 mt-0.5 truncate">
                      {currentLead.website ? (
                        <a href={currentLead.website.startsWith('http') ? currentLead.website : `https://${currentLead.website}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                          {currentLead.website.replace(/^https?:\/\//, '')}
                        </a>
                      ) : (
                        <span className="text-amber-700">None on record</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Big Native Call Button */}
                <div>
                  <a
                    href={`tel:${(currentLead.phone || '').split('/')[0].replace(/[^0-9+]/g, '')}`}
                    onClick={() => updateLeadStage(currentLead.id, 'Contacted')}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all"
                  >
                    <Phone className="w-5 h-5 fill-current animate-pulse" />
                    Call {currentLead.phone}
                  </a>
                  <p className="text-[11px] text-center text-slate-400 mt-2 font-medium">
                    Tap to dial immediately on phone or computer.
                  </p>
                </div>

                {/* Outcome Triggers */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
                    Log Outcome & Advance
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleQuickAction('Meeting Scheduled')}
                      className="py-2.5 px-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-[0.98]"
                    >
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>Booked Demo</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('Qualified')}
                      className="py-2.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-[0.98]"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Interested</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction('Contacted')}
                      className="py-2.5 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex flex-col items-center gap-1 transition-all active:scale-[0.98]"
                    >
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>No Answer</span>
                    </button>
                  </div>
                </div>

                {/* Nav arrows & position count */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                    title="Previous lead"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-semibold text-slate-500">
                    Lead {currentIndex + 1} of {filteredQueue.length}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex >= filteredQueue.length - 1}
                    className="p-2 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-800 disabled:opacity-30 disabled:pointer-events-none"
                    title="Next lead"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-3 bg-white border border-dashed border-slate-200 rounded-3xl p-8 max-w-md w-full">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-xl font-bold text-slate-900">Queue Completed!</h3>
              <p className="text-xs text-slate-500">
                All prioritized leads in this filter segment have been contacted.
              </p>
            </div>
          )}
        </div>
      )}

      {/* FULL LIST MODE */}
      {dialMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredQueue.map((lead) => {
            const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');
            const hasWebsite = Boolean(lead.website && lead.website.trim().length > 3);

            return (
              <div
                key={lead.id}
                className="bg-white border border-slate-200/80 hover:border-slate-300 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-sm transition-all"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-bold text-slate-900 text-base truncate flex-1">
                      {lead.company}
                    </h3>
                    {!hasWebsite ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        No Web
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        Has Web
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {lead.contactPerson || 'Decision Maker'} • {lead.city} • {lead.industry}
                  </p>
                  <p className="text-[11px] text-slate-400 font-medium mt-1">
                    Rep: <span className="text-slate-800 capitalize font-semibold">{lead.assignedTo || 'swaroop'}</span>
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <a
                    href={`tel:${cleanPhone}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateLeadStage(lead.id, 'Contacted');
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    Call {lead.phone}
                  </a>

                  <div className="grid grid-cols-2 gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => updateLeadStage(lead.id, 'Meeting Scheduled')}
                      className="py-1.5 px-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      Book Demo
                    </button>
                    <button
                      onClick={() => updateLeadStage(lead.id, 'Qualified')}
                      className="py-1.5 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition-colors"
                    >
                      Qualified
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredQueue.length === 0 && (
            <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
              No contacts matching filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export default EasyContact;
