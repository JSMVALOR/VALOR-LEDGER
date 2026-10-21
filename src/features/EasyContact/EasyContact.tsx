import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Search, 
  CheckCircle2, 
  Flame, 
  Globe, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  List,
  Check,
  Calendar,
  Clock,
  X
} from 'lucide-react';
import { useStore, TEAM_MEMBERS, type LeadStage } from '../../lib/store';

export function EasyContact() {
  const { leads, updateLeadStage } = useStore();

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

  const handleOutcome = (stage: LeadStage) => {
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Speed Dial
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              {filteredQueue.length} leads in queue
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Fast outbound dialer. Tap to call, log the outcome, and automatically advance to the next account.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-0.5 self-start sm:self-auto shrink-0">
          <button
            onClick={() => setDialMode('deck')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              dialMode === 'deck' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> Rapid Focus
          </button>
          <button
            onClick={() => setDialMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
              dialMode === 'list' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Queue List
          </button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2.5 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs text-xs">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dial queue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
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

        <select
          value={websiteFilter}
          onChange={(e) => setWebsiteFilter(e.target.value as any)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
        >
          <option value="all">All Web Statuses</option>
          <option value="no-website">Needs Website ({countNoWebsite})</option>
          <option value="has-website">Has Website</option>
        </select>

        <select
          value={selectedRep}
          onChange={(e) => setSelectedRep(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium capitalize focus:outline-none"
        >
          <option value="All">All Sales Reps</option>
          {TEAM_MEMBERS.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 font-medium focus:outline-none"
        >
          {cities.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'All Locations' : c}</option>
          ))}
        </select>
      </div>

      {/* RAPID DECK MODE */}
      {dialMode === 'deck' && (
        <div className="flex flex-col items-center justify-center py-4">
          {currentLead ? (
            <div className="w-full max-w-lg space-y-3">
              {/* Counter Line */}
              <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                <span>Account {currentIndex + 1} of {filteredQueue.length}</span>
                <span className="capitalize">Rep: <b className="text-slate-800">{currentLead.assignedTo || 'swaroop'}</b></span>
              </div>

              {/* Focus Dial Card */}
              <motion.div
                key={currentLead.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5"
              >
                {/* Business Info Header */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {currentLead.stage}
                    </span>
                    {!currentLead.website ? (
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
                    {currentLead.company}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {currentLead.contactPerson || 'Decision Maker'} · {currentLead.city} · {currentLead.industry}
                  </p>
                </div>

                {/* Pitch Strategy Hook */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Pitch Angle</span>
                  <p className="font-medium italic">
                    "{currentLead.nextFollowUp || 'Pitch High-Converting Booking Portal & Local SEO'}"
                  </p>
                </div>

                {/* Primary Direct Call Button */}
                <div>
                  <a
                    href={`tel:${(currentLead.phone || '').replace(/[^0-9+]/g, '')}`}
                    onClick={() => updateLeadStage(currentLead.id, 'Contacted')}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call {currentLead.phone}</span>
                  </a>
                </div>

                {/* Quick Outcome Actions */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Log Outcome & Advance
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleOutcome('Contacted')}
                      className="py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> No Answer
                    </button>
                    <button
                      onClick={() => handleOutcome('Meeting Scheduled')}
                      className="py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5 text-purple-600" /> Meeting
                    </button>
                    <button
                      onClick={() => handleOutcome('Won')}
                      className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Won Deal
                    </button>
                  </div>
                </div>

                {/* Previous / Next Arrows */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex >= filteredQueue.length - 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    Skip / Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="py-20 text-center space-y-2 bg-white border border-dashed border-slate-200 rounded-3xl p-8 max-w-md w-full">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">Queue Complete</h3>
              <p className="text-xs text-slate-500">
                All prioritized leads in this filter segment have been contacted.
              </p>
            </div>
          )}
        </div>
      )}

      {/* FULL LIST MODE */}
      {dialMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredQueue.map((lead) => {
            const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');
            const hasWebsite = Boolean(lead.website && lead.website.trim().length > 3);

            return (
              <div
                key={lead.id}
                className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col justify-between space-y-3 shadow-2xs hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-slate-900 text-sm truncate flex-1">
                      {lead.company}
                    </h3>
                    {!hasWebsite ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        Needs Web
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 shrink-0">
                        Has Web
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {lead.contactPerson || 'Decision Maker'} · {lead.city}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <a
                    href={`tel:${cleanPhone}`}
                    onClick={() => updateLeadStage(lead.id, 'Contacted')}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call {lead.phone}
                  </a>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => updateLeadStage(lead.id, 'Meeting Scheduled')}
                      className="py-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-semibold transition-colors"
                    >
                      Book Demo
                    </button>
                    <button
                      onClick={() => updateLeadStage(lead.id, 'Won')}
                      className="py-1 px-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold transition-colors"
                    >
                      Won Deal
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
