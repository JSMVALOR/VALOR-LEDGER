import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Download, Building, MapPin, Globe, Phone, Mail, MoreHorizontal, ArrowUpDown, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore } from '../../lib/store';
import type { Company } from '../../lib/store';

export function CompaniesPage() {
  const { companies, addCompany } = useStore();
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Company; direction: 'asc' | 'desc' } | null>(null);

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', industry: '', employees: '', website: '', city: '', phone: '', email: '', lastContact: '' });

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    addCompany(formData);
    setOpen(false);
    setFormData({ name: '', industry: '', employees: '', website: '', city: '', phone: '', email: '', lastContact: '' });
  };

  const requestSort = (key: keyof Company) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      c.industry.toLowerCase().includes(search.toLowerCase())
    );
  }, [companies, search]);

  const sortedCompanies = useMemo(() => {
    let sortable = [...filteredCompanies];
    if (sortConfig !== null) {
      sortable.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredCompanies, sortConfig]);

  return (
    <div className="flex flex-col space-y-6 pb-20 md:pb-0 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Companies</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage organizations, contacts, and related opportunities.</p>
        </div>
        
        <Dialog.Root open={open} onOpenChange={setOpen}>
          <Dialog.Trigger asChild>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-black rounded-lg text-sm font-semibold hover:bg-primary/90 smooth-transition shadow-lg shadow-primary/20">
              <Plus className="w-4 h-4" />
              Add Company
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-background/90 z-50 backdrop-blur-sm" />
            <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-surface p-6 shadow-2xl rounded-2xl">
              <div className="flex flex-col space-y-2 mb-2">
                <Dialog.Title className="text-xl font-bold tracking-tight text-foreground">New Company</Dialog.Title>
                <Dialog.Description className="text-sm text-muted-foreground">
                  Enter the details of the new company.
                </Dialog.Description>
              </div>
              <form onSubmit={handleAddCompany} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Company Name</label>
                    <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Acme Corp" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Industry</label>
                    <input required value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="Technology" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Employees</label>
                    <input required value={formData.employees} onChange={e => setFormData({...formData, employees: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="50-100" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Website</label>
                    <input required value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="acme.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Phone</label>
                    <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="+1 234 567 890" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Email</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="contact@acme.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">City</label>
                    <input required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors" placeholder="New York" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Owner</label>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Dialog.Close asChild>
                    <button type="button" className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-background border border-border smooth-transition">Cancel</button>
                  </Dialog.Close>
                  <button type="submit" className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-semibold hover:bg-primary/90 smooth-transition">Save Company</button>
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

      <div className="flex items-center justify-between gap-4 glass-panel p-2 rounded-xl">
        <div className="flex-1 max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search companies by name or industry..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary smooth-transition"
          />
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-surface smooth-transition">
            <Filter className="w-4 h-4" /> Filters
          </button>
          <button className="flex items-center gap-2 px-3 py-2 bg-background border border-border rounded-lg text-sm font-medium hover:bg-surface smooth-transition">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 border border-border rounded-xl bg-surface/30 overflow-hidden flex flex-col shadow-sm">
        <div className="overflow-auto flex-1">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-surface/80 sticky top-0 z-10 border-b border-border shadow-sm backdrop-blur-md">
              <tr>
                {['name', 'industry', 'contact', 'location', 'lastContact'].map((key) => (
                  <th 
                    key={key}
                    onClick={() => key !== 'contact' && key !== 'location' ? requestSort(key as keyof Company) : null}
                    className={`px-6 py-4 font-medium text-muted-foreground ${key !== 'contact' && key !== 'location' ? 'cursor-pointer hover:text-foreground transition-colors group' : ''}`}
                  >
                    <div className="flex items-center gap-2 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                      {key !== 'contact' && key !== 'location' && <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              <AnimatePresence>
                {sortedCompanies.map((company) => (
                  <motion.tr 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    key={company.id} 
                    className="hover:bg-surface/50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center text-primary shadow-inner">
                          <Building className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground text-base">{company.name}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <a href={`https://${company.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-primary transition-colors">
                              <Globe className="w-3 h-3" /> {company.website}
                            </a>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-foreground">{company.industry}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{company.employees} employees</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 text-sm text-foreground">
                          <Phone className="w-3.5 h-3.5 text-muted-foreground" /> {company.phone}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" /> {company.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-foreground">
                        <MapPin className="w-4 h-4 text-primary" /> {company.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-2">
                      </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm font-medium text-foreground">{company.lastContact}</div>
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
    </div>
  );
}
