import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Users, Briefcase, Calendar, CheckSquare, FileText, BarChart2, Settings, Plus, Phone, Search, CheckCircle2, Mail, Globe, MapPin, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

import ValorLogo from '../components/shared/ValorLogo';
import ThemeSwitcher from '../components/shared/ThemeSwitcher';
import { useStore, type SelectedItem } from '../lib/store';

function RightSidebarDetails({ item }: { item: SelectedItem }) {
  const { leads, incompleteLeads, companies, tasks, updateLeadStage } = useStore();

  if (!item) return null;

  if (item.type === 'lead') {
    const lead = leads.find(l => l.id === item.id) || incompleteLeads.find(l => l.id === item.id);
    if (!lead) return <div className="text-sm text-muted-foreground text-center mt-10">Lead not found</div>;

    const stageColors: Record<string, string> = {
      'New': 'bg-primary/10 text-primary border-primary/20',
      'Contacted': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      'Qualified': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      'Meeting Scheduled': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
      'Proposal Sent': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      'Negotiation': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      'Won': 'bg-green-500/10 text-green-400 border-green-500/20',
      'Lost': 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    return (
      <div className="flex flex-col space-y-6">
        <div>
          <h2 className="text-xl font-bold text-foreground">{lead.company}</h2>
          <p className="text-sm text-muted-foreground mt-1">{lead.contactPerson}</p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Status</span>
            <select 
              value={lead.stage}
              onChange={(e) => updateLeadStage(lead.id, e.target.value as any)}
              className={`text-sm font-semibold px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer ${stageColors[lead.stage] || 'bg-surface text-foreground'}`}
            >
              {Object.keys(stageColors).map(stage => (
                <option key={stage} value={stage} className="bg-surface text-foreground">{stage}</option>
              ))}
            </select>
          </div>

          <div className="grid gap-3 pt-4 border-t border-border">
            {lead.phone && lead.phone !== 'N/A' && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-primary" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <a href={`tel:${lead.phone.split('/')[0].replace(/[^0-9+]/g, '')}`} className="text-sm font-medium hover:text-primary transition-colors block truncate">{lead.phone}</a>
                </div>
              </div>
            )}

            {lead.email && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-primary" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <a href={`mailto:${lead.email}`} className="text-sm font-medium hover:text-primary transition-colors block truncate">{lead.email}</a>
                </div>
              </div>
            )}

            {lead.website && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-primary" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-muted-foreground">Website</p>
                  <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noreferrer" className="text-sm font-medium hover:text-primary transition-colors block truncate">{lead.website.replace(/^https?:\/\//, '')}</a>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs text-muted-foreground">City</p>
                <p className="text-sm font-medium truncate">{lead.city}</p>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Industry</p>
              <div className="inline-block px-2 py-1 bg-surface border border-border rounded text-xs font-medium">
                {lead.industry}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Priority</p>
              <div className="inline-block px-2 py-1 bg-surface border border-border rounded text-xs font-medium">
                {lead.priority}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <div className="text-sm text-muted-foreground text-center mt-10">Details not available</div>;
}

export default function AppLayout() {
  const location = useLocation();
  const { selectedItem, currentUser, logout } = useStore();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const NavItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
    const isActive = location.pathname === to;
    return (
      <Link 
        to={to} 
        title={isSidebarCollapsed ? label : undefined}
        className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-4'} py-2.5 rounded-lg transition-all text-sm font-medium relative group
          ${isActive 
            ? 'bg-primary/10 text-primary' 
            : 'text-muted-foreground hover:bg-surface hover:text-foreground'
          }`}
      >
        <Icon className="w-[18px] h-[18px] shrink-0" />
        {!isSidebarCollapsed && <span className="truncate">{label}</span>}
      </Link>
    );
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans relative">
      {/* Background Watermark */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0">
        <ValorLogo className="scale-[5]" />
      </div>

      {/* Left Sidebar */}
      <aside className={`hidden md:flex flex-col transition-all duration-300 border-r border-border bg-background/80 backdrop-blur-md p-4 relative z-20 ${isSidebarCollapsed ? 'w-[72px]' : 'w-64'}`}>
        <div className={`mb-8 flex items-center h-10 ${isSidebarCollapsed ? 'justify-center' : 'justify-between px-2'}`}>
          {!isSidebarCollapsed ? (
            <ValorLogo className="scale-90 origin-left transition-all" />
          ) : (
            <span className="text-primary font-serif italic tracking-tight font-bold text-xl">JSM</span>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className={`w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface rounded-lg transition-all ${isSidebarCollapsed ? 'hidden' : 'flex'}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        
        {isSidebarCollapsed && (
          <button 
            onClick={() => setIsSidebarCollapsed(false)}
            className="w-full flex items-center justify-center mb-6 text-muted-foreground hover:text-foreground transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
        
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden no-scrollbar">
          <NavItem to="/" icon={Home} label="Dashboard" />
          <NavItem to="/leads" icon={Users} label="Leads" />
          <NavItem to="/incomplete-leads" icon={AlertCircle} label="Incomplete" />
          <NavItem to="/companies" icon={Briefcase} label="Companies" />
          <NavItem to="/easy-contact" icon={Phone} label="Easy Contact" />
          <NavItem to="/processed-leads" icon={CheckCircle2} label="Processed" />
          <NavItem to="/calendar" icon={Calendar} label="Calendar" />
          <NavItem to="/tasks" icon={CheckSquare} label="Tasks" />
          <NavItem to="/documents" icon={FileText} label="Documents" />
          <NavItem to="/analytics" icon={BarChart2} label="Analytics" />
        </nav>

        <div className="pt-4 border-t border-border mt-auto">
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background relative">
        {/* Topbar for mobile, or breadcrumbs/search for desktop */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 bg-background/80 backdrop-blur-md z-10 hidden md:flex">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <span className="font-semibold text-foreground">Workspace</span>
            <span>/</span>
            <span>{location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1).replace('-', ' ')}</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <Link to="/leads" className="bg-primary text-black px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-primary/90 smooth-transition">
              <Plus className="w-4 h-4" /> New Lead
            </Link>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="flex flex-col items-end">
                <span className="text-sm font-bold capitalize">{currentUser}</span>
                <button onClick={logout} className="text-[10px] text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest font-semibold">
                  Logout
                </button>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/20 text-primary border border-primary/30 flex items-center justify-center">
                <span className="text-sm font-bold">{currentUser?.substring(0,2).toUpperCase()}</span>
              </div>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
      
      {/* Right Context Panel */}
      <aside className="hidden lg:block w-80 border-l border-border bg-surface/30 p-6 overflow-auto">
         {selectedItem ? (
           <RightSidebarDetails item={selectedItem} />
         ) : (
           <div className="text-sm text-muted-foreground text-center mt-10">Select an item to view details</div>
         )}
      </aside>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-surface/90 backdrop-blur-md border-t border-border flex justify-around p-3 z-50 pb-safe">
        <Link to="/" className={`flex flex-col items-center gap-1 ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Home className="w-6 h-6" />
        </Link>
        <Link to="/leads" className={`flex flex-col items-center gap-1 ${location.pathname === '/leads' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Users className="w-6 h-6" />
        </Link>
        
        {/* Floating Action Button (Center) */}
        <Link to="/leads" className="relative -top-5 bg-primary text-black p-3 rounded-full shadow-lg shadow-primary/20 flex items-center justify-center transform transition-transform hover:scale-105 active:scale-95">
          <Plus className="w-6 h-6" />
        </Link>

        <Link to="/tasks" className={`flex flex-col items-center gap-1 ${location.pathname === '/tasks' ? 'text-primary' : 'text-muted-foreground'}`}>
          <CheckSquare className="w-6 h-6" />
        </Link>
        <Link to="/settings" className={`flex flex-col items-center gap-1 ${location.pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'}`}>
           <div className="w-6 h-6 rounded-full bg-border"></div>
        </Link>
      </nav>
    </div>
  );
}
