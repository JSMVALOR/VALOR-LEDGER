import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Download, ArrowUpDown, MoreHorizontal, LayoutGrid, List, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore } from '../../lib/store';
import type { Lead, LeadStage, Priority } from '../../lib/store';

export function IncompleteLeadsPage() {
  const { leads, addLead, updateLeadStage, selectedItem, setSelectedItem } = useStore();
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Lead; direction: 'asc' | 'desc' } | null>(null);
  
  // Dialog State
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ company: '', contactPerson: '', phone: '', city: '', industry: '', stage: 'New' as LeadStage, priority: 'Medium' as Priority, value: '', nextFollowUp: '' });

  const cities = useMemo(() => {
    const set = new Set(leads.map(l => l.city));
    return ['All', ...Array.from(set).sort()];
  }, [leads]);

  const handleAddLead = (e: React.FormEvent) => {
    e.preventDefault();
    addLead({
      ...formData,
      value: Number(formData.value) || 0
    });
    setOpen(false);
    setFormData({ company: '', contactPerson: '', phone: '', city: '', industry: '', stage: 'New', priority: 'Medium', value: '', nextFollowUp: '' });
  };

  const requestSort = (key: keyof Lead) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(l => {
      const matchesSearch = 
        l.company.toLowerCase().includes(search.toLowerCase()) || 
        l.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
        l.phone.includes(search);
      const matchesCity = cityFilter === 'All' || l.city === cityFilter;
      return matchesSearch && matchesCity;
    });
  }, [leads, search, cityFilter]);

  const sortedLeads = useMemo(() => {
    let sortableLeads = [...filteredLeads];
    if (sortConfig !== null) {
      sortableLeads.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableLeads;
  }, [filteredLeads, sortConfig]);

  const handleExport = () => {
    if (sortedLeads.length === 0) return;
    const headers = ['Company', 'Contact Person', 'Phone', 'City', 'Industry', 'Stage', 'Priority', 'Value', 'Owner', 'Email', 'Website'];
    const rows = sortedLeads.map(l => [
      `"${l.company}"`, `"${l.contactPerson}"`, `"${l.phone}"`, `"${l.city}"`, `"${l.industry}"`,
      `"${l.stage}"`, `"${l.priority}"`, l.value, `"${l.email || ''}"`, `"${l.website || ''}"`
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_${new Date().getTime()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stages: LeadStage[] = ['New', 'Contacted', 'Qualified', 'Meeting Scheduled', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

  const StageBadge = ({ stage }: { stage: LeadStage }) => {
    const isWon = stage === 'Won';
    const isLost = stage === 'Lost';
    const isAction = ['Meeting Scheduled', 'Proposal Sent', 'Negotiation'].includes(stage);
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
        ${isWon ? 'bg-[#00D200]/20 text-[#00D200] border-[#00D200]/30' : 
          isLost ? 'bg-[#E10600]/20 text-[#E10600] border-[#E10600]/30' :
          isAction ? 'bg-primary/20 text-primary border-primary/30' : 
          'bg-surface text-foreground border-border'
        }`}>
        {stage}
      </span>
    );
  };

  return (
    <div className="flex flex-col space-y-6 pb-20 md:pb-0 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Leads Pipeline</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage and track your active opportunities.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-surface p-1 rounded-lg border border-border">
            <button 
              onClick={() => setView('table')}
              className={`p-1.5 rounded-md smooth-transition ${view === 'table' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={`p-1.5 rounded-md smooth-transition ${view === 'kanban' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
          
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-sm font-semibold hover:bg-primary/90 smooth-transition shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4" />
                Create Lead
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-background/90 z-50 backdrop-blur-sm" />
              <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-surface p-6 shadow-2xl rounded-2xl">
                <div className="flex flex-col space-y-2 mb-2">
                  <Dialog.Title className="text-xl font-bold tracking-tight text-foreground">New Opportunity</Dialog.Title>
                  <Dialog.Description className="text-sm text-muted-foreground">
                    Enter the details of the new lead below.
                  </Dialog.Description>
                </div>
                <form onSubmit={handleAddLead} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Company</label>
                      <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Acme Corp" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Contact Person</label>
                      <input required value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="John Doe" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Value (USD)</label>
                      <input type="number" required value={formData.value} onChange={e => setFormData({...formData, value: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="50000" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Phone</label>
                      <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="+1 234 567 890" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Industry</label>
                      <input required value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Technology" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">City</label>
                      <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="New York" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Owner</label>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Priority</label>
                      <select required value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as Priority})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors">
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Stage</label>
                      <select required value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value as LeadStage})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors">
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Meeting Scheduled">Meeting Scheduled</option>
                        <option value="Proposal Sent">Proposal Sent</option>
                        <option value="Negotiation">Negotiation</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Next Follow-Up</label>
                      <input required value={formData.nextFollowUp} onChange={e => setFormData({...formData, nextFollowUp: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="e.g. Tomorrow, 10:00 AM" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                    <Dialog.Close asChild>
                      <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-background border border-border smooth-transition">Cancel</button>
                    </Dialog.Close>
                    <button type="submit" className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-semibold hover:bg-primary/90 smooth-transition">Save Lead</button>
                  </div>
                </form>
                <Dialog.Close asChild>
                  <button className="absolute right-4 top-4 opacity-50 hover:opacity-100 transition-opacity">
                    <X className="h-5 w-5" />
                  </button>
                </Dialog.Close>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 glass-panel p-2 rounded-xl">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search leads..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary smooth-transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="pl-9 pr-4 py-2 bg-background border border-border rounded-lg text-sm font-medium focus:outline-none focus:border-primary appearance-none hover:bg-surface smooth-transition cursor-pointer"
            >
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-surface smooth-transition">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {view === 'table' ? (
          <div className="h-full border border-border rounded-xl bg-surface/30 overflow-hidden flex flex-col shadow-sm">
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm text-left whitespace-nowrap">
                <thead className="bg-surface/80 sticky top-0 z-10 border-b border-border shadow-sm backdrop-blur-md">
                  <tr>
                    {['company', 'contactPerson', 'stage', 'priority', 'value', 'nextFollowUp'].map((key) => (
                      <th 
                        key={key}
                        onClick={() => requestSort(key as keyof Lead)}
                        className="px-6 py-4 font-medium text-muted-foreground cursor-pointer hover:text-foreground transition-colors group"
                      >
                        <div className="flex items-center gap-2 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                          <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </th>
                    ))}
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <AnimatePresence>
                    {sortedLeads.map((lead) => (
                      <motion.tr 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        key={lead.id} 
                        onClick={() => setSelectedItem({ type: 'lead', id: lead.id })}
                        className={`transition-colors group cursor-pointer ${selectedItem?.id === lead.id ? 'bg-primary/10 hover:bg-primary/20' : 'hover:bg-surface/50'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-foreground">{lead.company}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{lead.industry} • {lead.city}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-foreground">{lead.contactPerson}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">{lead.phone}</div>
                        </td>
                        <td className="px-6 py-4"><StageBadge stage={lead.stage} /></td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${lead.priority === 'High' ? 'text-red-400 bg-red-400/10' : lead.priority === 'Medium' ? 'text-yellow-400 bg-yellow-400/10' : 'text-blue-400 bg-blue-400/10'}`}>
                            {lead.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-foreground">${lead.value.toLocaleString()}</td>
                        <td className="px-6 py-4">
                           <div className="text-sm font-medium text-foreground">{lead.nextFollowUp}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-background opacity-0 group-hover:opacity-100 smooth-transition">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="h-full flex gap-4 overflow-x-auto pb-4">
            {stages.map(stage => (
              <div key={stage} className="flex-shrink-0 w-80 flex flex-col bg-surface/20 border border-border rounded-xl p-3">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-semibold text-sm text-foreground">{stage}</h3>
                  <span className="text-xs font-medium text-muted-foreground bg-background px-2 py-0.5 rounded-full border border-border">
                    {leads.filter(l => l.stage === stage).length}
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {leads.filter(l => l.stage === stage).map(lead => (
                    <div 
                      key={lead.id} 
                      onClick={() => setSelectedItem({ type: 'lead', id: lead.id })}
                      className={`bg-card border rounded-lg p-4 shadow-sm smooth-transition cursor-pointer group relative ${selectedItem?.id === lead.id ? 'border-primary shadow-primary/10 bg-primary/5' : 'border-border hover:border-primary/50'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-foreground text-sm truncate">{lead.company}</div>
                        <span className="text-xs font-medium text-primary">${(lead.value / 1000).toFixed(1)}k</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-3">{lead.contactPerson}</div>
                      <div className="flex items-center justify-between text-xs mt-auto pt-3 border-t border-border">
                        <div className="flex items-center gap-1.5">
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${lead.priority === 'High' ? 'text-red-400 bg-red-400/10' : lead.priority === 'Medium' ? 'text-yellow-400 bg-yellow-400/10' : 'text-blue-400 bg-blue-400/10'}`}>
                          {lead.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
