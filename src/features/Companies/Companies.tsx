import { useState, useMemo } from 'react';
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
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            Target Companies
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
              {filteredCompanies.length} Organizations
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Key corporate accounts, law firms, dental clinics, and multi-location businesses.
          </p>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
        >
          <Plus className="w-4 h-4" /> Add Company
        </button>
      </div>

      {/* Filter Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search organizations by name or city..."
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

        <select
          value={industryFilter}
          onChange={(e) => setIndustryFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
        >
          {industries.map(i => (
            <option key={i} value={i}>{i === 'All' ? 'All Industries' : i}</option>
          ))}
        </select>
      </div>

      {/* Responsive Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map(c => {
          const cleanPhone = (c.phone || '').split('/')[0].replace(/[^0-9+]/g, '');
          const associatedLeads = leads.filter(l => l.company.toLowerCase().includes(c.name.toLowerCase()));

          return (
            <div 
              key={c.id}
              className="bg-white border border-slate-200/80 hover:border-blue-400 p-5 rounded-2xl flex flex-col justify-between space-y-4 shadow-sm transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-base leading-snug">{c.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{c.industry}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 shrink-0">
                    {c.employees || '10-50'} staff
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  {c.city && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{c.city}</span>
                    </div>
                  )}
                  {c.website ? (
                    <a 
                      href={c.website.startsWith('http') ? c.website : `https://${c.website}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 text-blue-600 hover:underline truncate font-medium"
                    >
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{c.website.replace(/^https?:\/\//, '')}</span>
                    </a>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-700 font-medium">
                      <Globe className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>No website registered</span>
                    </div>
                  )}
                  {c.email && (
                    <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 truncate">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                {c.phone ? (
                  <a
                    href={`tel:${cleanPhone}`}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3 h-3" /> Call
                  </a>
                ) : (
                  <span className="text-slate-400 text-xs">No Phone</span>
                )}

                <span className="text-[11px] font-semibold text-slate-500">
                  <b className="text-slate-900">{associatedLeads.length}</b> Linked Deals
                </span>
              </div>
            </div>
          );
        })}

        {filteredCompanies.length === 0 && (
          <div className="col-span-full py-16 text-center text-xs text-slate-400 bg-white border border-dashed border-slate-200 rounded-2xl">
            No target companies found matching your search.
          </div>
        )}
      </div>

      {/* Add Company Radix Modal Dialog */}
      <Dialog.Root open={openModal} onOpenChange={setOpenModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 animate-fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-slate-200 p-6 rounded-3xl max-w-md w-[92vw] z-50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-bold text-slate-900">
                Add Target Organization
              </Dialog.Title>
              <Dialog.Close asChild>
                <button className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apollo Healthcare Partners"
                  value={newCompany.name}
                  onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Industry</label>
                  <input
                    type="text"
                    placeholder="Legal, Healthcare..."
                    value={newCompany.industry}
                    onChange={(e) => setNewCompany({ ...newCompany, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Count</label>
                  <input
                    type="text"
                    placeholder="10-50"
                    value={newCompany.employees}
                    onChange={(e) => setNewCompany({ ...newCompany, employees: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region</label>
                  <input
                    type="text"
                    placeholder="Bangalore, Mumbai..."
                    value={newCompany.city}
                    onChange={(e) => setNewCompany({ ...newCompany, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Phone</label>
                  <input
                    type="text"
                    placeholder="+91..."
                    value={newCompany.phone}
                    onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Website URL</label>
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={newCompany.website}
                  onChange={(e) => setNewCompany({ ...newCompany, website: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Dialog.Close asChild>
                  <button type="button" className="px-4 py-2 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 text-slate-600">
                    Cancel
                  </button>
                </Dialog.Close>
                <button type="submit" className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20">
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
