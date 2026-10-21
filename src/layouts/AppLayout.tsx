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
  ChevronLeft, 
  ChevronRight, 
  AlertCircle,
  LogOut,
  Compass
} from 'lucide-react';

import ValorLogo from '../components/shared/ValorLogo';
import { useStore, TEAM_MEMBERS } from '../lib/store';

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { currentUser, logout, leads, incompleteLeads, tasks, isCloudSynced, isLoadingCloud } = useStore();
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
            <NavItem to="/scraper" icon={Compass} label="Lead Scraper" badge="AI Scan" badgeColor="bg-indigo-100 text-indigo-800" />
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
        {/* Mobile Topbar (< 768px) */}
        <header className="h-12 border-b border-slate-200/80 bg-white/95 backdrop-blur-md flex items-center justify-between px-4 z-10 md:hidden">
          <div className="flex items-center gap-2">
            <ValorLogo className="scale-75 origin-left" />
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              isCloudSynced 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isCloudSynced ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
              {isCloudSynced ? 'Supabase Live' : isLoadingCloud ? 'Syncing...' : 'Cached'}
            </div>
            <Link 
              to="/scraper" 
              className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center justify-center font-bold text-xs"
              title="Lead Scraper"
            >
              <Compass className="w-4 h-4" />
            </Link>
            <Link to="/settings" className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              {((currentUser?.name || currentUser?.username || 'V').substring(0, 1)).toUpperCase()}
            </Link>
          </div>
        </header>

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
            {/* Supabase Cloud Live Status Pill */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
              isCloudSynced 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
              {isCloudSynced ? 'Supabase Live Cloud' : isLoadingCloud ? 'Syncing Cloud...' : 'Cached Mode'}
            </div>

            <Link
              to="/scraper"
              className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-[0.98] transition-all"
            >
              <Compass className="w-3.5 h-3.5 text-indigo-600" /> Run Scraper
            </Link>

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
