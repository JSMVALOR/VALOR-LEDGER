import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  Search, 
  Phone, 
  Globe, 
  Mail, 
  Plus, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Building2,
  X
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore, type Lead, TEAM_MEMBERS } from '../../lib/store';

export function IncompleteLeadsPage() {
  const { incompleteLeads, addLead, setSelectedItem } = useStore();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');

  // Quick Enrichment Modal
  const [enrichingLead, setEnrichingLead] = useState<Lead | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [contactInput, setContactInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');

  const cities = useMemo(() => {
    const set = new Set(incompleteLeads.map(l => l.city).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [incompleteLeads]);

  const filteredIncomplete = useMemo(() => {
    return incompleteLeads.filter(l => {
      const matchesSearch = 
        (l.company || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.city || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.industry || '').toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === 'All' || l.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [incompleteLeads, search, cityFilter]);

  const openEnrichModal = (lead: Lead) => {
    setEnrichingLead(lead);
    setPhoneInput(lead.phone && lead.phone !== 'N/A' ? lead.phone : '');
    setContactInput(lead.contactPerson || '');
    setWebsiteInput(lead.website || '');
  };

  const handleSaveEnrichment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrichingLead) return;

    // Moving lead from incomplete to verified by re-adding with verified phone/website
    addLead({
      company: enrichingLead.company,
      contactPerson: contactInput || 'Decision Maker',
      phone: phoneInput || '+91 9800000000',
      city: enrichingLead.city,
      industry: enrichingLead.industry,
      stage: 'New',
      priority: enrichingLead.priority,
      value: enrichingLead.value || 10000,
      nextFollowUp: 'Tomorrow',
      email: enrichingLead.email,
      website: websiteInput,
      assignedTo: enrichingLead.assignedTo || 'swaroop',
    });

    setEnrichingLead(null);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Pending Contacts
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {filteredIncomplete.length} Require Phone / Verification
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Accounts quarantined from main calling queue due to missing direct phone numbers or websites.
          </p>
        </div>
      </div>

      {/* Info Callout */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-amber-900">Enrichment Quarantine Protection</h4>
          <p className="text-amber-800 leading-relaxed">
            Your sales reps never waste time dialing broken lines. Enrich a verified phone or website for any account below, and it will automatically promote directly into your active <b>Speed Dial Queue</b>.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search unverified businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:border-blue-500 font-medium"
          />
        </div>

        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
        >
          {cities.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'All Regions' : c}</option>
          ))}
        </select>
      </div>

      {/* MOBILE VIEW: Quick Touch Cards */}
      <div className="block md:hidden space-y-3">
        {filteredIncomplete.map((lead) => (
          <div key={lead.id} className="p-4 bg-surface/80 border border-border rounded-2xl space-y-3 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-base font-bold text-foreground leading-snug">{lead.company}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{lead.city} • {lead.industry}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                Needs Phone
              </span>
            </div>

            <button
              onClick={() => openEnrichModal(lead)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" /> Enrich Phone & Move to Queue
            </button>
          </div>
        ))}

        {filteredIncomplete.length === 0 && (
          <div className="py-16 text-center text-xs text-muted-foreground">
            No unverified leads found. All accounts have valid contact channels!
          </div>
        )}
      </div>

      {/* DESKTOP VIEW: Clean Table */}
      <div className="hidden md:block bg-surface/70 border border-border rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-surface border-b border-border text-muted-foreground font-semibold">
              <th className="py-3.5 pl-4">Company Name</th>
              <th className="py-3.5">Industry & Region</th>
              <th className="py-3.5">Missing Info</th>
              <th className="py-3.5">Assigned Rep</th>
              <th className="py-3.5 text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredIncomplete.map((lead) => (
              <tr key={lead.id} className="hover:bg-background/80 transition-colors">
                <td className="py-3 pl-4 font-bold text-foreground text-sm">
                  {lead.company}
                </td>
                <td className="py-3">
                  <p className="font-semibold text-foreground">{lead.industry}</p>
                  <p className="text-[11px] text-muted-foreground">{lead.city}</p>
                </td>
                <td className="py-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertCircle className="w-3 h-3" /> No Phone Number
                  </span>
                </td>
                <td className="py-3 font-semibold text-foreground capitalize">
                  {lead.assignedTo || 'swaroop'}
                </td>
                <td className="py-3 text-right pr-4">
                  <button
                    onClick={() => openEnrichModal(lead)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-all"
                  >
                    <Plus className="w-3 h-3" /> Add Phone & Activate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredIncomplete.length === 0 && (
          <div className="py-16 text-center text-xs text-muted-foreground">
            No unverified leads found. All accounts have valid contact channels!
          </div>
        )}
      </div>

      {/* Enrich Modal Dialog */}
      {enrichingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-background border border-border p-6 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-foreground">
                Activate {enrichingLead.company}
              </h3>
              <button onClick={() => setEnrichingLead(null)} className="p-1 rounded-lg hover:bg-surface text-muted-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Provide a valid contact number to promote this prospect into the live sales queue:
            </p>

            <form onSubmit={handleSaveEnrichment} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Direct Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98..."
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Decision Maker Contact</label>
                <input
                  type="text"
                  placeholder="e.g. Managing Partner"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Website URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={websiteInput}
                  onChange={(e) => setWebsiteInput(e.target.value)}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEnrichingLead(null)}
                  className="px-4 py-2 border border-border rounded-xl font-semibold text-muted-foreground hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Promote to Active Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
export default IncompleteLeadsPage;
