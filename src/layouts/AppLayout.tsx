import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Briefcase, 
  Calendar, 
  CheckSquare, 
  Settings, 
  Plus, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  X,
  LogOut,
  Flame,
  ShieldCheck
} from 'lucide-react';

import ValorLogo from '../components/shared/ValorLogo';
import { useStore, TEAM_MEMBERS, type SelectedItem } from '../lib/store';

function InspectorDrawerContent({ item, onClose }: { item: SelectedItem; onClose?: () => void }) {
  const { leads, incompleteLeads, updateLeadStage, assignLead } = useStore();

  if (!item) return null;

  if (item.type === 'lead') {
    const lead = leads.find(l => l.id === item.id) || incompleteLeads.find(l => l.id === item.id);
    if (!lead) return <div className="text-xs text-slate-400 text-center mt-10">Account not found</div>;

    const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');
    const hasWebsite = Boolean(lead.website && lead.website.trim().length > 3);

    const stageColors: Record<string, string> = {
      'New': 'bg-blue-50 text-blue-700 border-blue-200',
      'Contacted': 'bg-slate-100 text-slate-700 border-slate-200',
      'Qualified': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Meeting Scheduled': 'bg-amber-50 text-amber-800 border-amber-200',
      'Proposal Sent': 'bg-purple-50 text-purple-700 border-purple-200',
      'Negotiation': 'bg-pink-50 text-pink-700 border-pink-200',
      'Won': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Lost': 'bg-rose-50 text-rose-700 border-rose-200',
    };

    return (
      <div className="flex flex-col space-y-5">
        {/* Top Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-lg font-bold text-slate-900 leading-snug truncate">{lead.company}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{lead.contactPerson || 'Decision Maker'} • {lead.city}</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 border border-slate-200">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Website Opportunity Alert */}
        <div>
          {!hasWebsite ? (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-amber-800">
              <Flame className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Needs Website — Prime Sales Target!</span>
            </div>
          ) : (
            <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-xs text-blue-800">
              <span className="font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" /> Existing Website
              </span>
              <a 
                href={lead.website!.startsWith('http') ? lead.website : `https://${lead.website}`}
                target="_blank"
                rel="noreferrer"
                className="font-bold underline text-blue-600"
              >
                Visit Link
              </a>
            </div>
          )}
        </div>

        {/* Stage & Rep Controls */}
        <div className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Deal Pipeline Stage
            </label>
            <select 
              value={lead.stage}
              onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
              className={`w-full text-xs font-bold px-3 py-2.5 rounded-xl border focus:outline-none cursor-pointer ${stageColors[lead.stage] || 'bg-white text-slate-800'}`}
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

          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Assigned Sales Rep
            </label>
            <select 
              value={lead.assignedTo || 'swaroop'}
              onChange={(e) => assignLead(lead.id, e.target.value)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none capitalize"
            >
              {TEAM_MEMBERS.map(m => (
                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
              ))}
            </select>
          </div>
        </div>

        {/* Contact Quick Triggers */}
        <div className="space-y-2 pt-3 border-t border-slate-100">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Direct Outreach
          </label>

          {lead.phone && lead.phone !== 'N/A' ? (
            <a 
              href={`tel:${cleanPhone}`}
              onClick={() => updateLeadStage(lead.id, 'Contacted')}
              className="flex items-center justify-center gap-2 p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <Phone className="w-4 h-4 shrink-0" />
              <span>Call {lead.phone}</span>
            </a>
          ) : (
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-400 text-center text-xs font-medium">
              No Phone Available
            </div>
          )}

          {lead.email && (
            <a 
              href={`mailto:${lead.email}`}
              className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium hover:border-blue-300 transition-colors"
            >
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">{lead.email}</span>
            </a>
          )}
        </div>

        {/* Target Deal Value */}
        <div className="pt-3 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
            Target Retainer Value
          </span>
          <p className="text-xl font-extrabold text-slate-900">
            ₹{(lead.value || 10000).toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { selectedItem, setSelectedItem, currentUser, logout, leads, incompleteLeads, tasks } = useStore();
  const location = useLocation();

  const isSuperadmin = currentUser?.role === 'superadmin';

  const NavItem = ({ to, icon: Icon, label, badge, badgeColor }: { to: string; icon: any; label: string; badge?: number | string; badgeColor?: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
          isActive 
            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
        }`}
        title={isSidebarCollapsed ? label : undefined}
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
          {!isSidebarCollapsed && <span>{label}</span>}
        </div>
        {!isSidebarCollapsed && badge !== undefined && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
            isActive 
              ? 'bg-white/20 text-white' 
              : badgeColor || 'bg-slate-100 border border-slate-200 text-slate-600'
          }`}>
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans relative">
      {/* Left Sidebar (Desktop) */}
      <aside className={`hidden md:flex flex-col transition-all duration-300 border-r border-slate-200/80 bg-white p-4 relative z-20 ${isSidebarCollapsed ? 'w-[76px]' : 'w-64'}`}>
        <div className={`mb-6 flex items-center h-10 ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
          {!isSidebarCollapsed ? (
            <ValorLogo className="scale-90 origin-left transition-all" />
          ) : (
            <span className="text-blue-600 font-extrabold text-xl">V</span>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all ${isSidebarCollapsed ? 'hidden' : 'flex'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        
        {isSidebarCollapsed && (
          <button 
            onClick={() => setIsSidebarCollapsed(false)}
            className="w-full flex items-center justify-center mb-6 text-slate-400 hover:text-slate-700 transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        
        {/* Navigation Categories */}
        <nav className="flex-1 flex flex-col gap-4 overflow-y-auto no-scrollbar pr-0.5">
          {/* Main Pipeline Section */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Sales Engine
              </p>
            )}
            <NavItem to="/" icon={Home} label="Dashboard" />
            <NavItem to="/leads" icon={Users} label="Pipeline & Deals" badge={leads.length} />
            <NavItem to="/easy-contact" icon={Phone} label="Speed Dial" badge="Dialer" badgeColor="bg-amber-100 text-amber-800" />
          </div>

          {/* Account Intelligence Section */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Accounts & Roster
              </p>
            )}
            <NavItem to="/companies" icon={Briefcase} label="Target Companies" />
            <NavItem to="/incomplete-leads" icon={AlertCircle} label="Unverified Contacts" badge={incompleteLeads.length} badgeColor="bg-amber-50 text-amber-700" />
          </div>

          {/* Execution Section */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Execution
              </p>
            )}
            <NavItem to="/tasks" icon={CheckSquare} label="Action Items" badge={tasks.filter(t => !t.completed).length} />
            <NavItem to="/calendar" icon={Calendar} label="Meetings Schedule" />
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-slate-100 mt-auto">
          <NavItem to="/settings" icon={Settings} label="System Settings" />
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative">
        {/* Desktop Topbar */}
        <header className="h-14 border-b border-slate-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between px-6 z-10 hidden md:flex">
          <div className="text-xs text-slate-400 flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-900">VALOR CRM</span>
            <span>/</span>
            <span className="capitalize text-slate-600">
              {location.pathname === '/' ? 'Command Center' : location.pathname.substring(1).replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/leads"
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-[0.98] transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Prospect
            </Link>

            <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 leading-none">
                  {currentUser?.name || currentUser?.username || 'Team User'}
                </span>
                <span className="text-[10px] font-bold text-blue-600 uppercase mt-0.5">
                  {currentUser?.role || 'user'}
                </span>
              </div>

              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                {((currentUser?.name || currentUser?.username || 'V').substring(0, 2)).toUpperCase()}
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>
      
      {/* Right Drawer (Desktop >= 1024px) */}
      <aside className="hidden lg:block w-80 border-l border-slate-200/80 bg-white p-5 overflow-y-auto">
        {selectedItem ? (
          <InspectorDrawerContent item={selectedItem} onClose={() => setSelectedItem(null)} />
        ) : (
          <div className="text-xs text-slate-400 text-center mt-16 space-y-1.5">
            <p className="font-bold text-slate-800 text-sm">Prospect Inspector</p>
            <p className="max-w-[200px] mx-auto text-slate-400">
              Tap any business in the pipeline or speed dial queue to view direct dials & rep notes.
            </p>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Sheet Drawer (< 1024px) */}
      {selectedItem && (
        <div 
          onClick={() => setSelectedItem(null)}
          className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-900/50 backdrop-blur-sm animate-fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white border-t border-slate-200 rounded-t-3xl p-6 max-h-[85vh] overflow-y-auto shadow-2xl space-y-4"
          >
            <InspectorDrawerContent item={selectedItem} onClose={() => setSelectedItem(null)} />
          </div>
        </div>
      )}

      {/* Sleek Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex justify-around items-center px-2 py-2 z-40 pb-safe shadow-lg shadow-slate-200">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            location.pathname === '/' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>

        <Link 
          to="/leads" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            location.pathname === '/leads' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Pipeline</span>
        </Link>
        
        {/* Floating Speed Dial Hero Button */}
        <Link 
          to="/easy-contact" 
          className="relative -top-3 bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center transform active:scale-95 transition-all"
        >
          <Phone className="w-5 h-5" />
        </Link>

        <Link 
          to="/tasks" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            location.pathname === '/tasks' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px]">Tasks</span>
        </Link>

        <Link 
          to="/settings" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            location.pathname === '/settings' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
