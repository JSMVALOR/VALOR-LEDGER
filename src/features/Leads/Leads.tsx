import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  LayoutGrid, 
  List, 
  Phone, 
  Calendar, 
  CheckCircle2, 
  X, 
  ArrowUpDown, 
  UserCheck, 
  Sparkles,
  MapPin,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore, TEAM_MEMBERS, type Lead, type LeadStage, type Priority } from '../../lib/store';

export function LeadsPage() {
  const { leads, addLead, updateLeadStage, assignLead, setSelectedItem } = useStore();

  // Sub-views / Stage categories
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'scheduled' | 'won'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  
  // Filters & Search
  const [search, setSearch] = useState('');
  const [selectedRep, setSelectedRep] = useState('All');
  const [cityFilter, setCityFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: 'asc' | 'desc' } | null>(null);

  // Add Lead Modal State
  const [openModal, setOpenModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    company: '',
    contactPerson: '',
    phone: '',
    city: '',
    industry: 'Legal',
    stage: 'New' as LeadStage,
    priority: 'Medium' as Priority,
    value: '10000',
    assignedTo: 'swaroop',
  });

  const cities = useMemo(() => {
    const set = new Set(leads.map(l => l.city).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [leads]);

  const industries = useMemo(() => {
    const set = new Set(leads.map(l => l.industry).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [leads]);

  // Tab categorization
  const tabFilteredLeads = useMemo(() => {
    if (activeTab === 'active') {
      return leads.filter(l => ['New', 'Contacted', 'Qualified'].includes(l.stage));
    }
    if (activeTab === 'scheduled') {
      return leads.filter(l => ['Meeting Scheduled', 'Proposal Sent', 'Negotiation'].includes(l.stage));
    }
    if (activeTab === 'won') {
      return leads.filter(l => l.stage === 'Won');
    }
    return leads;
  }, [leads, activeTab]);

  // Combined Search and Filters
  const filteredLeads = useMemo(() => {
    return tabFilteredLeads.filter(l => {
      const matchesSearch = 
        (l.company || '').toLowerCase().includes(search.toLowerCase()) || 
        (l.contactPerson || '').toLowerCase().includes(search.toLowerCase()) ||
        (l.phone || '').includes(search);
      const matchesRep = selectedRep === 'All' || (l.assignedTo || 'swaroop') === selectedRep;
      const matchesCity = cityFilter === 'All' || (l.city || '') === cityFilter;
      const matchesIndustry = industryFilter === 'All' || (l.industry || '') === industryFilter;
      return matchesSearch && matchesRep && matchesCity && matchesIndustry;
    });
  }, [tabFilteredLeads, search, selectedRep, cityFilter, industryFilter]);

  // Sorting
  const sortedLeads = useMemo(() => {
    let list = [...filteredLeads];
    if (sortConfig) {
      list.sort((a, b) => {
        const valA = a[sortConfig.key] ?? '';
        const valB = b[sortConfig.key] ?? '';
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [filteredLeads, sortConfig]);

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.company) return;

    addLead({
      company: newLeadForm.company,
      contactPerson: newLeadForm.contactPerson || 'Decision Maker',
      phone: newLeadForm.phone || '+91 9800000000',
      city: newLeadForm.city || 'Bangalore',
      industry: newLeadForm.industry,
      stage: newLeadForm.stage,
      priority: newLeadForm.priority,
      value: Number(newLeadForm.value) || 10000,
      nextFollowUp: 'Tomorrow',
      assignedTo: newLeadForm.assignedTo,
    });

    setOpenModal(false);
    setNewLeadForm({
      company: '',
      contactPerson: '',
      phone: '',
      city: '',
      industry: 'Legal',
      stage: 'New',
      priority: 'Medium',
      value: '10000',
      assignedTo: 'swaroop',
    });
  };

  const handleExportCSV = () => {
    if (sortedLeads.length === 0) return;
    const headers = ['Company', 'Contact Person', 'Phone', 'City', 'Industry', 'Stage', 'Priority', 'Value', 'Assigned Rep'];
    const rows = sortedLeads.map(l => [
      `"${l.company}"`, `"${l.contactPerson}"`, `"${l.phone}"`, `"${l.city}"`, `"${l.industry}"`,
      `"${l.stage}"`, `"${l.priority}"`, l.value, `"${l.assignedTo || 'Unassigned'}"`
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline_export_${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stageColorMap: Record<string, string> = {
    'New': 'bg-blue-50 text-blue-700 border-blue-200',
    'Contacted': 'bg-indigo-50 text-indigo-700 border-indigo-200',
    'Qualified': 'bg-purple-50 text-purple-700 border-purple-200',
    'Meeting Scheduled': 'bg-amber-50 text-amber-700 border-amber-200',
    'Proposal Sent': 'bg-orange-50 text-orange-700 border-orange-200',
    'Negotiation': 'bg-pink-50 text-pink-700 border-pink-200',
    'Won': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Lost': 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Top Header & Fast Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Deals & Pipeline
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {filteredLeads.length}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Single-click lead calling, team attribution, and Kanban stage velocity.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-surface hover:bg-background border border-border text-foreground text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          
          <button
            onClick={() => setOpenModal(true)}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Sub-Category Stage Tabs (Mobile-Friendly Pill Bar) */}
      <div className="flex items-center justify-between gap-2 border-b border-border pb-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-surface/70 border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            All Accounts ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'active' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'bg-surface/70 border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Active Pipeline ({leads.filter(l => ['New', 'Contacted', 'Qualified'].includes(l.stage)).length})
          </button>
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'scheduled' 
                ? 'bg-amber-600 text-white shadow-sm' 
                : 'bg-surface/70 border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Demos & Proposals ({leads.filter(l => ['Meeting Scheduled', 'Proposal Sent', 'Negotiation'].includes(l.stage)).length})
          </button>
          <button
            onClick={() => setActiveTab('won')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'won' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-surface/70 border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            Closed Won ({leads.filter(l => l.stage === 'Won').length})
          </button>
        </div>

        {/* View Toggle (Desktop) */}
        <div className="hidden md:flex items-center gap-1 p-1 bg-surface border border-border rounded-xl">
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
            title="List Table"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('kanban')}
            className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'kanban' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'
            }`}
            title="Kanban Board"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search business, phone, contact..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-xl text-xs focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Assigned Rep Filter */}
        <select
          value={selectedRep}
          onChange={(e) => setSelectedRep(e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500 capitalize"
        >
          <option value="All">All Assigned Reps</option>
          {TEAM_MEMBERS.map(m => (
            <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
          ))}
        </select>

        {/* City Filter */}
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
        >
          {cities.map(c => (
            <option key={c} value={c}>{c === 'All' ? 'All Regions' : c}</option>
          ))}
        </select>

        {/* Industry Filter */}
        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
        >
          {industries.map(i => (
            <option key={i} value={i}>{i === 'All' ? 'All Categories' : i}</option>
          ))}
        </select>
      </div>

      {/* MOBILE VIEW: Ultra-Clean Touch Cards */}
      <div className="block md:hidden space-y-3">
        {sortedLeads.map((lead) => {
          const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

          return (
            <div
              key={lead.id}
              onClick={() => setSelectedItem({ type: 'lead', id: lead.id })}
              className="p-4 bg-surface/80 border border-border rounded-2xl space-y-3 active:scale-[0.99] transition-all shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="text-base font-bold text-foreground leading-snug truncate">
                    {lead.company}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {lead.contactPerson || 'Decision Maker'} • {lead.city}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${stageColorMap[lead.stage] || 'bg-surface'}`}>
                  {lead.stage}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
                <span className="text-muted-foreground">
                  Rep: <b className="text-foreground capitalize">{lead.assignedTo || 'swaroop'}</b>
                </span>
                <span className="font-bold text-foreground">
                  ₹{(lead.value || 10000).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Direct Fast Dial Action */}
              <div className="flex items-center gap-2 pt-1">
                {lead.phone && lead.phone !== 'N/A' ? (
                  <a
                    href={`tel:${cleanPhone}`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call ({lead.phone})
                  </a>
                ) : (
                  <div className="flex-1 py-2 rounded-xl bg-background border border-border text-center text-xs text-muted-foreground">
                    No Phone
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedItem({ type: 'lead', id: lead.id });
                  }}
                  className="px-3 py-2 rounded-xl bg-background border border-border text-xs font-semibold text-foreground"
                >
                  Edit
                </button>
              </div>
            </div>
          );
        })}

        {sortedLeads.length === 0 && (
          <div className="py-16 text-center text-xs text-muted-foreground">
            No leads found matching your search or filters.
          </div>
        )}
      </div>

      {/* DESKTOP VIEW: High-Information Data Table */}
      <div className="hidden md:block">
        {viewMode === 'table' ? (
          <div className="bg-surface/70 border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-surface border-b border-border text-muted-foreground font-semibold">
                    <th className="py-3.5 pl-4">Company / Decision Maker</th>
                    <th className="py-3.5">Category & Region</th>
                    <th className="py-3.5">Assigned Rep</th>
                    <th className="py-3.5">Deal Stage</th>
                    <th className="py-3.5">Direct Phone</th>
                    <th className="py-3.5">Target Value</th>
                    <th className="py-3.5 text-right pr-4">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedLeads.map((lead) => {
                    const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

                    return (
                      <tr 
                        key={lead.id}
                        onClick={() => setSelectedItem({ type: 'lead', id: lead.id })}
                        className="hover:bg-background/80 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 pl-4">
                          <p className="font-bold text-foreground text-sm group-hover:text-blue-600 transition-colors">{lead.company}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{lead.contactPerson || 'Decision Maker'}</p>
                        </td>

                        <td className="py-3">
                          <p className="font-semibold text-foreground">{lead.industry}</p>
                          <p className="text-[11px] text-muted-foreground">{lead.city}</p>
                        </td>

                        <td className="py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.assignedTo || 'swaroop'}
                            onChange={(e) => assignLead(lead.id, e.target.value)}
                            className="px-2 py-1 bg-background border border-border rounded-lg text-xs font-semibold capitalize focus:outline-none"
                          >
                            <option value="swaroop">Swaroop</option>
                            <option value="vijay">Vijay</option>
                            <option value="nithish">Nithish</option>
                          </select>
                        </td>

                        <td className="py-3" onClick={(e) => e.stopPropagation()}>
                          <select
                            value={lead.stage}
                            onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border focus:outline-none appearance-none cursor-pointer ${stageColorMap[lead.stage] || 'bg-surface'}`}
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
                        </td>

                        <td className="py-3" onClick={(e) => e.stopPropagation()}>
                          {lead.phone && lead.phone !== 'N/A' ? (
                            <a 
                              href={`tel:${cleanPhone}`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                            >
                              <Phone className="w-3 h-3" />
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </td>

                        <td className="py-3 font-bold text-foreground">
                          ₹{(lead.value || 10000).toLocaleString('en-IN')}
                        </td>

                        <td className="py-3 text-right pr-4" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => updateLeadStage(lead.id, 'Meeting Scheduled')}
                            className="px-3 py-1 rounded-lg bg-background hover:bg-emerald-50 border border-border hover:border-emerald-200 text-xs font-semibold text-foreground hover:text-emerald-700 transition-colors"
                          >
                            Book Demo
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Kanban Board View */
          <div className="grid grid-cols-4 gap-4 overflow-x-auto pb-4">
            {(['New', 'Contacted', 'Meeting Scheduled', 'Won'] as LeadStage[]).map((stage) => {
              const stageLeads = sortedLeads.filter(l => l.stage === stage);

              return (
                <div key={stage} className="bg-surface/50 border border-border rounded-2xl p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-border mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">{stage}</h3>
                    <span className="px-2 py-0.5 rounded-full bg-background border border-border text-[11px] font-bold">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[600px] pr-1">
                    {stageLeads.map((l) => (
                      <div
                        key={l.id}
                        onClick={() => setSelectedItem({ type: 'lead', id: l.id })}
                        className="p-3 bg-background border border-border rounded-xl hover:border-blue-400 cursor-pointer transition-all space-y-1.5 shadow-sm"
                      >
                        <h4 className="text-xs font-bold text-foreground">{l.company}</h4>
                        <p className="text-[11px] text-muted-foreground">{l.city} • {l.contactPerson}</p>
                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-border/50 text-muted-foreground font-semibold">
                          <span>{l.assignedTo || 'swaroop'}</span>
                          <span className="text-foreground">₹{(l.value || 10000).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Lead Radix Modal Dialog */}
      <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border p-6 rounded-2xl max-w-md w-[92vw] z-50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-bold text-foreground">
                Add New Business Account
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 rounded-lg hover:bg-surface text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Company / Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Legal Associates"
                  value={newLeadForm.company}
                  onChange={(e) => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Decision Maker</label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={newLeadForm.contactPerson}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, contactPerson: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98..."
                    value={newLeadForm.phone}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="Bangalore, Mumbai..."
                    value={newLeadForm.city}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, city: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Assigned Sales Rep</label>
                  <select
                    value={newLeadForm.assignedTo}
                    onChange={(e) => setNewLeadForm({ ...newLeadForm, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none capitalize font-semibold"
                  >
                    <option value="swaroop">Swaroop</option>
                    <option value="vijay">Vijay</option>
                    <option value="nithish">Nithish</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 rounded-xl border border-border font-semibold hover:bg-surface text-muted-foreground">
                    Cancel
                  </button>
                </Dialog.Close>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm">
                  Save Account
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
