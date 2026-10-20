import { useState, useMemo } from 'react';
import { 
  AlertCircle, 
  Search, 
  Phone, 
  Globe, 
  Plus, 
  CheckCircle2, 
  ShieldAlert, 
  X
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore, type Lead, TEAM_MEMBERS } from '../../lib/store';

export function IncompleteLeadsPage() {
  const { incompleteLeads, updateLead } = useStore();
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');

  // Quick Enrichment Modal
  const [enrichingLead, setEnrichingLead] = useState<Lead | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [contactInput, setContactInput] = useState('');
  const [websiteInput, setWebsiteInput] = useState('');
  const [assignedRep, setAssignedRep] = useState('swaroop');

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
    setAssignedRep(lead.assignedTo || 'swaroop');
  };

  const handleSaveEnrichment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrichingLead) return;

    updateLead(enrichingLead.id, {
      contactPerson: contactInput || 'Decision Maker',
      phone: phoneInput || '+91 9800000000',
      website: websiteInput.trim(),
      assignedTo: assignedRep,
      stage: 'New',
    });

    setEnrichingLead(null);
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Unverified Contacts
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {filteredIncomplete.length} Missing Contact Info
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Accounts quarantined from the calling queue due to missing phone numbers. Enrich and activate them here.
          </p>
        </div>
      </div>

      {/* Info Callout */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-amber-900">Calling Queue Quality Assurance</h4>
          <p className="text-amber-800 leading-relaxed font-medium">
            Leads without a phone number are safely kept here so your sales reps never waste time dialing dead records. Add a verified phone number to promote an account straight into the active <b>Speed Dial Queue</b>.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search unverified businesses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium placeholder:text-slate-400"
          />
        </div>

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

      {/* MOBILE VIEW: Quick Touch Cards */}
      <div className="block md:hidden space-y-3">
        {filteredIncomplete.map((lead) => (
          <div key={lead.id} className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-3 shadow-sm">
            <div className="flex justify-between items-start gap-2">
              <div>
                <h3 className="text-base font-bold text-slate-900 leading-snug">{lead.company}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{lead.city} • {lead.industry}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                Needs Phone
              </span>
            </div>

            <button
              onClick={() => openEnrichModal(lead)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Phone & Activate
            </button>
          </div>
        ))}

        {filteredIncomplete.length === 0 && (
          <div className="py-16 text-center text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
            No unverified contacts found. All leads have active phone numbers!
          </div>
        )}
      </div>

      {/* DESKTOP VIEW: Clean Table */}
      <div className="hidden md:block bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
              <th className="py-3.5 pl-4">Company Name</th>
              <th className="py-3.5">Industry & City</th>
              <th className="py-3.5">Status</th>
              <th className="py-3.5">Assigned Rep</th>
              <th className="py-3.5 text-right pr-4">Enrichment Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredIncomplete.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3.5 pl-4 font-bold text-slate-900 text-sm">
                  {lead.company}
                </td>
                <td className="py-3.5">
                  <p className="font-semibold text-slate-800">{lead.industry}</p>
                  <p className="text-[11px] text-slate-400">{lead.city}</p>
                </td>
                <td className="py-3.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <AlertCircle className="w-3 h-3 text-amber-500" /> Missing Phone
                  </span>
                </td>
                <td className="py-3.5 font-semibold text-slate-700 capitalize">
                  {lead.assignedTo || 'swaroop'}
                </td>
                <td className="py-3.5 text-right pr-4">
                  <button
                    onClick={() => openEnrichModal(lead)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1 shadow-sm transition-all active:scale-[0.98]"
                  >
                    <Plus className="w-3 h-3" /> Add Phone & Activate
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredIncomplete.length === 0 && (
          <div className="py-16 text-center text-xs text-slate-400">
            No unverified contacts found. All leads have active phone numbers!
          </div>
        )}
      </div>

      {/* Enrich Modal Dialog */}
      {enrichingLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">
                Activate {enrichingLead.company}
              </h3>
              <button onClick={() => setEnrichingLead(null)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Provide a valid direct phone number to promote this prospect straight into your active Sales Pipeline & Speed Dial Queue:
            </p>

            <form onSubmit={handleSaveEnrichment} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="+91 98..."
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-slate-900 text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Decision Maker Contact</label>
                <input
                  type="text"
                  placeholder="e.g. Managing Director / Owner"
                  value={contactInput}
                  onChange={(e) => setContactInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={websiteInput}
                  onChange={(e) => setWebsiteInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Sales Rep</label>
                <select
                  value={assignedRep}
                  onChange={(e) => setAssignedRep(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none capitalize font-semibold text-slate-800"
                >
                  {TEAM_MEMBERS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEnrichingLead(null)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20 active:scale-[0.98]"
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
