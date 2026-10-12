import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Search, 
  Plus, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  Users, 
  ExternalLink, 
  Download,
  Filter,
  X,
  Briefcase
} from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { useStore, type Company } from '../../lib/store';

export function CompaniesPage() {
  const { companies, addCompany, leads } = useStore();

  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [industryFilter, setIndustryFilter] = useState('All');

  // Modal State
  const [openModal, setOpenModal] = useState(false);
  const [newCompany, setNewCompany] = useState({
    name: '',
    industry: 'Legal Services',
    employees: '10-50',
    website: '',
    city: 'Bangalore',
    phone: '',
    email: '',
    lastContact: 'Today',
  });

  const cities = useMemo(() => {
    const set = new Set(companies.map(c => c.city).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [companies]);

  const industries = useMemo(() => {
    const set = new Set(companies.map(c => c.industry).filter(Boolean));
    return ['All', ...Array.from(set).sort()];
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const matchesSearch = 
        (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.industry || '').toLowerCase().includes(search.toLowerCase()) ||
        (c.city || '').toLowerCase().includes(search.toLowerCase());
      const matchesCity = cityFilter === 'All' || c.city === cityFilter;
      const matchesIndustry = industryFilter === 'All' || c.industry === industryFilter;
      return matchesSearch && matchesCity && matchesIndustry;
    });
  }, [companies, search, cityFilter, industryFilter]);

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name) return;

    addCompany(newCompany);
    setOpenModal(false);
    setNewCompany({
      name: '',
      industry: 'Legal Services',
      employees: '10-50',
      website: '',
      city: 'Bangalore',
      phone: '',
      email: '',
      lastContact: 'Today',
    });
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto w-full pb-20 md:pb-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            Target Companies
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {filteredCompanies.length}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Key enterprise accounts, legal firms, clinics, and target organizations.
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-sm shadow-blue-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search organizations..."
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
            <option key={c} value={c}>{c === 'All' ? 'All Locations' : c}</option>
          ))}
        </select>

        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-3 py-2 bg-surface border border-border rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
        >
          {industries.map(i => (
            <option key={i} value={i}>{i === 'All' ? 'All Industries' : i}</option>
          ))}
        </select>
      </div>

      {/* MOBILE VIEW: Ultra-Clean Account Cards */}
      <div className="block md:hidden space-y-3">
        {filteredCompanies.map(c => {
          const associatedLeads = leads.filter(l => l.company.toLowerCase().includes(c.name.toLowerCase()));

          return (
            <div key={c.id} className="p-4 bg-surface/80 border border-border rounded-2xl space-y-3 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1 pr-2">
                  <h3 className="text-base font-bold text-foreground leading-snug truncate">
                    {c.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {c.industry} • {c.city}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  {c.employees || '10-50'} staff
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-xs pt-1 border-t border-border/60">
                {c.phone && (
                  <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-blue-600 font-semibold">
                    <Phone className="w-3 h-3" /> {c.phone}
                  </a>
                )}
                {c.website && (
                  <a href={c.website.startsWith('http') ? c.website : `https://${c.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
                    <Globe className="w-3 h-3" /> Website
                  </a>
                )}
              </div>

              <div className="text-[11px] text-muted-foreground pt-1 flex justify-between">
                <span>Associated Deals: <b className="text-foreground">{associatedLeads.length}</b></span>
                <span>Active</span>
              </div>
            </div>
          );
        })}

        {filteredCompanies.length === 0 && (
          <div className="py-16 text-center text-xs text-muted-foreground">
            No target companies found matching your query.
          </div>
        )}
      </div>

      {/* DESKTOP VIEW: High-Information Grid / Table */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map(c => {
            const cleanPhone = (c.phone || '').split('/')[0].replace(/[^0-9+]/g, '');
            const associatedLeads = leads.filter(l => l.company.toLowerCase().includes(c.name.toLowerCase()));

            return (
              <div 
                key={c.id}
                className="bg-surface/70 border border-border hover:border-blue-400 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center font-bold text-sm">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground text-base leading-snug">{c.name}</h3>
                        <p className="text-xs text-muted-foreground">{c.industry}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-background border border-border text-muted-foreground">
                      {c.employees || '10-50'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs">
                    {c.city && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span>{c.city}</span>
                      </div>
                    )}
                    {c.website && (
                      <a 
                        href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 text-blue-600 hover:underline truncate"
                      >
                        <Globe className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{c.website}</span>
                      </a>
                    )}
                    {c.email && (
                      <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-muted-foreground hover:text-foreground truncate">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  {c.phone ? (
                    <a
                      href={`tel:${cleanPhone}`}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  ) : (
                    <span className="text-muted-foreground">No Phone</span>
                  )}

                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {associatedLeads.length} Linked Pipeline Deals
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Company Radix Modal Dialog */}
      <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border p-6 rounded-2xl max-w-md w-[92vw] z-50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-bold text-foreground">
                Add Target Organization
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 rounded-lg hover:bg-surface text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Healthcare Partners"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Industry</label>
                  <input
                    type="text"
                    placeholder="Healthcare, Legal..."
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Employee Count</label>
                  <input
                    type="text"
                    placeholder="10-50"
                    value={newCompany.employees}
                    onChange={(e) => setNewCompany({ ...newCompany, employees: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Headquarters City</label>
                  <input
                    type="text"
                    placeholder="Mumbai, Bangalore..."
                    value={newCompany.city}
                    onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Direct Phone</label>
                  <input
                    type="text"
                    placeholder="+91..."
                    value={newCompany.phone}
                    onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Website URL</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                  className="w-full px-3 py-2 bg-surface border border-border rounded-xl focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 rounded-xl border border-border font-semibold hover:bg-surface text-muted-foreground">
                    Cancel
                  </button>
                </Dialog.Close>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm">
                  Save Organization
                </button>
              </div>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
export default CompaniesPage;
