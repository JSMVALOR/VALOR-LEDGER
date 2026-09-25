import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Phone, Search, Filter, Mail, Globe, Download } from 'lucide-react';
import { useStore } from '../../lib/store';

export function EasyContact() {
  const { leads, updateLeadStage, setSelectedItem, selectedItem } = useStore();
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');

  // We show 'New' and 'Contacted' leads here.
  const newLeads = useMemo(() => leads.filter(l => l.stage === 'New' || l.stage === 'Contacted'), [leads]);

  // Extract unique industries for the filter dropdown from new leads only
  const industries = useMemo(() => {
    const set = new Set(newLeads.map(l => l.industry));
    return ['All', ...Array.from(set).sort()];
  }, [newLeads]);

  const cities = useMemo(() => {
    const set = new Set(newLeads.map(l => l.city));
    return ['All', ...Array.from(set).sort()];
  }, [newLeads]);

  // Filter leads
  const filteredLeads = useMemo(() => {
    return newLeads.filter(lead => {
      const matchesSearch = 
        lead.company.toLowerCase().includes(search.toLowerCase()) || 
        lead.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        lead.phone.includes(search);
      const matchesIndustry = industryFilter === 'All' || lead.industry === industryFilter;
      const matchesCity = cityFilter === 'All' || lead.city === cityFilter;
      return matchesSearch && matchesIndustry && matchesCity;
    });
  }, [newLeads, search, industryFilter, cityFilter]);

  const handleExport = () => {
    if (filteredLeads.length === 0) return;
    const headers = ['Company', 'Contact Person', 'Phone', 'City', 'Industry', 'Stage', 'Priority', 'Value', 'Owner', 'Email', 'Website'];
    const rows = filteredLeads.map(l => [
      `"${l.company}"`, `"${l.contactPerson}"`, `"${l.phone}"`, `"${l.city}"`, `"${l.industry}"`,
      `"${l.stage}"`, `"${l.priority}"`, l.value, `"${l.email || ''}"`, `"${l.website || ''}"`
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `easy_contact_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col space-y-6 max-w-7xl mx-auto w-full pb-20 md:pb-0 h-full">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Easy Contact</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Quick call list for new leads. Marking a status moves them to the Processed page.
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search names or numbers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative w-full md:w-48">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              value={industryFilter}
              onChange={(e) => setIndustryFilter(e.target.value)}
              className="w-full bg-surface/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="All">All Industries</option>
              {industries.filter(i => i !== 'All').map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          </div>
          <div className="relative w-full md:w-48">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-surface/50 border border-border rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors appearance-none"
            >
              <option value="All">All Regions</option>
              {cities.filter(c => c !== 'All').map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <button onClick={handleExport} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-border rounded-lg text-sm font-medium hover:bg-surface smooth-transition shrink-0">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-6">
        {filteredLeads.map((lead, idx) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.min(idx * 0.05, 0.5) }}
            key={lead.id}
            onClick={() => setSelectedItem({ type: 'lead', id: lead.id })}
            className={`bg-surface/30 border rounded-2xl p-5 flex flex-col justify-between cursor-pointer smooth-transition shadow-sm ${selectedItem?.id === lead.id ? 'border-primary shadow-primary/10 bg-primary/5' : 'border-border hover:border-primary/50'}`}
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground truncate" title={lead.company}>
                {lead.company}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 truncate" title={lead.contactPerson}>
                {lead.contactPerson}
              </p>
              <div className="inline-block mt-2 px-2 py-1 bg-surface border border-border rounded text-xs text-muted-foreground">
                {lead.industry}
              </div>
              
              {/* Extra Contact Info */}
              <div className="mt-3 space-y-1.5">
                {lead.email && (
                  <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors truncate">
                    <Mail className="w-3.5 h-3.5" />
                    {lead.email}
                  </a>
                )}
                {lead.website && (
                  <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors truncate">
                    <Globe className="w-3.5 h-3.5" />
                    {lead.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-border flex flex-col gap-3">
              {lead.phone && lead.phone !== 'N/A' ? (
                <a 
                  href={`tel:${lead.phone.split('/')[0].replace(/[^0-9+]/g, '')}`}
                  className="flex items-center justify-center gap-2 w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border border-primary/20 hover:border-primary shadow-sm rounded-xl py-2.5 px-2 font-bold text-sm smooth-transition break-words text-center flex-wrap"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  {lead.phone}
                </a>
              ) : (
                <div className="flex items-center justify-center gap-2 w-full bg-surface text-muted-foreground border border-border rounded-xl py-2 font-medium cursor-not-allowed">
                  No Phone Number
                </div>
              )}
              
              {/* Quick Status Update */}
              <div className="flex items-center justify-between gap-2">
                <select 
                  value={lead.stage}
                  onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
                  className="flex-1 bg-background border border-border rounded px-2 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary transition-colors appearance-none text-center cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Meeting Scheduled">Meeting Scheduled</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Won">Won</option>
                  <option value="Lost">Lost</option>
                </select>
              </div>
            </div>
          </motion.div>
        ))}
        {filteredLeads.length === 0 && (
          <div className="col-span-full py-20 text-center text-muted-foreground">
            No new contacts found matching your filters. Great job!
          </div>
        )}
      </div>
    </div>
  );
}
