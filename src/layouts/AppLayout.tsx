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
  CheckCircle2, 
  Mail, 
  Globe, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  X,
  Layers,
  Sparkles
} from 'lucide-react';

import ValorLogo from '../components/shared/ValorLogo';
import { useStore, type SelectedItem } from '../lib/store';

function RightSidebarDetails({ item, onClose }: { item: SelectedItem; onClose?: () => void }) {
  const { leads, incompleteLeads, updateLeadStage, assignLead } = useStore();

  if (!item) return null;

  if (item.type === 'lead') {
    const lead = leads.find(l => l.id === item.id) || incompleteLeads.find(l => l.id === item.id);
    if (!lead) return <div className="text-sm text-muted-foreground text-center mt-10">Lead not found</div>;

    const stageColors: Record<string, string> = {
      'New': 'bg-blue-50 text-blue-700 border-blue-200',
      'Contacted': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Qualified': 'bg-purple-50 text-purple-700 border-purple-200',
      'Meeting Scheduled': 'bg-amber-50 text-amber-700 border-amber-200',
      'Proposal Sent': 'bg-orange-50 text-orange-700 border-orange-200',
      'Negotiation': 'bg-pink-50 text-pink-700 border-pink-200',
      'Won': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Lost': 'bg-rose-50 text-rose-700 border-rose-200',
    };

    const cleanPhone = (lead.phone || '').split('/')[0].replace(/[^0-9+]/g, '');

    return (
      <div className="flex flex-col space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground leading-snug">{lead.company}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{lead.contactPerson || 'Decision Maker'}</p>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-surface border border-border">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Deal Stage</span>
            <select 
              value={lead.stage}
              onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
              className={`text-xs font-bold px-3 py-2 rounded-xl border focus:outline-none appearance-none cursor-pointer ${stageColors[lead.stage] || 'bg-surface text-foreground'}`}
            >
              {Object.keys(stageColors).map(stage => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold">Assigned Rep</span>
            <select 
              value={lead.assignedTo || 'swaroop'}
              onChange={(e) => assignLead(lead.id, e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-border bg-background text-foreground"
            >
              <option value="swaroop">Swaroop (Sales Lead)</option>
              <option value="vijay">Vijay (Outreach Exec)</option>
              <option value="nithish">Nithish (Deal Closer)</option>
            </select>
          </div>

          <div className="grid gap-2.5 pt-4 border-t border-border">
            {lead.phone && lead.phone !== 'N/A' && (
              <a 
                href={`tel:${cleanPhone}`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
              >
                <Phone className="w-4 h-4 shrink-0" />
                <span className="truncate">{lead.phone}</span>
              </a>
            )}

            {lead.email && (
              <a 
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface border border-border text-foreground text-xs hover:border-blue-300 transition-colors"
              >
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{lead.email}</span>
              </a>
            )}

            {lead.website && (
              <a 
                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface border border-border text-foreground text-xs hover:border-blue-300 transition-colors"
              >
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{lead.website}</span>
              </a>
            )}

            {lead.city && (
              <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-surface border border-border text-xs text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>{lead.city}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-border">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-bold block mb-1">Contract Target</span>
            <p className="text-lg font-bold text-foreground">₹{(lead.value || 10000).toLocaleString('en-IN')}</p>
          </div>
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

  const NavItem = ({ to, icon: Icon, label, badge }: { to: string; icon: any; label: string; badge?: number | string }) => {
    const isActive = location.pathname === to;
    return (
      <Link
        to={to}
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
          isActive 
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20' 
            : 'text-muted-foreground hover:text-foreground hover:bg-surface'
        }`}
        title={isSidebarCollapsed ? label : undefined}
      >
        <div className="flex items-center gap-3">
          <Icon className="w-4 h-4 shrink-0" />
          {!isSidebarCollapsed && <span>{label}</span>}
        </div>
        {!isSidebarCollapsed && badge !== undefined && (
          <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
            isActive ? 'bg-white/20 text-white' : 'bg-background border border-border text-muted-foreground'
          }`}>
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans relative">
      {/* Background Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] z-0">
        <ValorLogo className="scale-[5]" />
      </div>

      {/* Left Sidebar (Desktop) */}
      <aside className={`hidden md:flex flex-col transition-all duration-300 border-r border-border bg-background/95 backdrop-blur-md p-4 relative z-20 ${isSidebarCollapsed ? 'w-[72px]' : 'w-64'}`}>
        <div className={`mb-6 flex items-center h-10 ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-1'}`}>
          {!isSidebarCollapsed ? (
            <ValorLogo className="scale-90 origin-left transition-all" />
          ) : (
            <span className="text-blue-600 font-bold text-lg">VL</span>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-all ${isSidebarCollapsed ? 'hidden' : 'flex'}`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
        
        {isSidebarCollapsed && (
          <button 
            onClick={() => setIsSidebarCollapsed(false)}
            className="w-full flex items-center justify-center mb-6 text-muted-foreground hover:text-foreground transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        
        {/* Navigation Categories */}
        <nav className="flex-1 flex flex-col gap-5 overflow-y-auto no-scrollbar pr-0.5">
          {/* Main Pipeline Section */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">
                Core Sales Engine
              </p>
            )}
            <NavItem to="/" icon={Home} label="Dashboard" />
            <NavItem to="/leads" icon={Users} label="Pipeline & Deals" badge={leads.length} />
            <NavItem to="/easy-contact" icon={Phone} label="Speed Dial Queue" />
          </div>

          {/* Account Intelligence Section */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">
                Accounts & Roster
              </p>
            )}
            <NavItem to="/companies" icon={Briefcase} label="Target Companies" />
            <NavItem to="/incomplete-leads" icon={AlertCircle} label="Pending Contacts" badge={incompleteLeads.length} />
          </div>

          {/* Execution Section */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">
                Execution
              </p>
            )}
            <NavItem to="/tasks" icon={CheckSquare} label="Action Items" badge={tasks.filter(t => !t.completed).length} />
            <NavItem to="/calendar" icon={Calendar} label="Meetings Schedule" />
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-border mt-auto">
          <NavItem to="/settings" icon={Settings} label="System Settings" />
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background relative">
        {/* Desktop Topbar */}
        <header className="h-14 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-md z-10 hidden md:flex">
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span className="font-semibold text-foreground">VALOR CRM</span>
            <span>/</span>
            <span className="capitalize">{location.pathname === '/' ? 'Command Center' : location.pathname.substring(1).replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/leads" className="bg-blue-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-700 shadow-sm transition-all">
              <Plus className="w-3.5 h-3.5" /> Add Lead
            </Link>
            <div className="flex items-center gap-2.5 pl-3 border-l border-border">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold capitalize text-foreground">{currentUser || 'Team User'}</span>
                <button onClick={logout} className="text-[10px] text-muted-foreground hover:text-rose-600 font-semibold uppercase tracking-wider">
                  Logout
                </button>
              </div>
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
                {(currentUser || 'V').substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>
      
      {/* Right Drawer (Desktop) */}
      <aside className="hidden lg:block w-80 border-l border-border bg-surface/40 p-5 overflow-auto">
        {selectedItem ? (
          <RightSidebarDetails item={selectedItem} onClose={() => setSelectedItem(null)} />
        ) : (
          <div className="text-xs text-muted-foreground text-center mt-12 space-y-1">
            <p className="font-semibold text-foreground">Quick Inspector</p>
            <p>Select any business in your pipeline to view direct dials & rep notes.</p>
          </div>
        )}
      </aside>

      {/* Mobile Drawer (Bottom Sheet when item selected) */}
      {selectedItem && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-background border-t border-border rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto shadow-2xl space-y-4">
            <RightSidebarDetails item={selectedItem} onClose={() => setSelectedItem(null)} />
          </div>
        </div>
      )}

      {/* Native Mobile Bottom Nav Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border flex justify-around items-center px-2 py-2 z-40 pb-safe">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            location.pathname === '/' ? 'text-blue-600 font-bold' : 'text-muted-foreground'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </Link>
        <Link 
          to="/leads" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            location.pathname === '/leads' ? 'text-blue-600 font-bold' : 'text-muted-foreground'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Pipeline</span>
        </Link>
        
        {/* Floating Speed Dial Action */}
        <Link 
          to="/easy-contact" 
          className="relative -top-3 bg-blue-600 text-white p-3 rounded-2xl shadow-lg shadow-blue-500/30 flex items-center justify-center transform active:scale-95 transition-all"
        >
          <Phone className="w-5 h-5" />
        </Link>

        <Link 
          to="/tasks" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            location.pathname === '/tasks' ? 'text-blue-600 font-bold' : 'text-muted-foreground'
          }`}
        >
          <CheckSquare className="w-5 h-5" />
          <span className="text-[10px]">Tasks</span>
        </Link>
        <Link 
          to="/settings" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            location.pathname === '/settings' ? 'text-blue-600 font-bold' : 'text-muted-foreground'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px]">Settings</span>
        </Link>
      </nav>
    </div>
  );
}
