import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Briefcase, 
  Calendar, 
  CheckSquare, 
  Settings, 
  Phone, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  Compass
} from 'lucide-react';

import ValorLogo from '../components/shared/ValorLogo';
import { useStore } from '../lib/store';

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { currentUser, logout, leads, tasks, isCloudSynced, isLoadingCloud } = useStore();
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
        <nav className="flex-1 flex flex-col gap-5 overflow-y-auto no-scrollbar pr-0.5">
          {/* Main Pipeline Section */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Pipeline & Sourcing
              </p>
            )}
            <NavItem to="/" icon={Home} label="Dashboard" />
            <NavItem to="/leads" icon={Users} label="Pipeline & Deals" badge={leads.length} />
            <NavItem to="/easy-contact" icon={Phone} label="Speed Dial" />
            <NavItem to="/scraper" icon={Compass} label="Lead Scraper" />
          </div>

          {/* Management & Execution Section */}
          <div className="space-y-1">
            {!isSidebarCollapsed && (
              <p className="px-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                Workspace
              </p>
            )}
            <NavItem to="/companies" icon={Briefcase} label="Target Companies" />
            <NavItem 
              to="/tasks" 
              icon={CheckSquare} 
              label="Action Items" 
              badge={tasks.filter(t => !t.completed).length > 0 ? tasks.filter(t => !t.completed).length : undefined} 
            />
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
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className={`w-1.5 h-1.5 rounded-full ${isCloudSynced ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
              <span>{isCloudSynced ? 'Live' : 'Syncing'}</span>
            </div>
            <Link to="/settings" className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
              {((currentUser?.name || currentUser?.username || 'V').substring(0, 1)).toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Desktop Topbar */}
        <header className="h-14 border-b border-slate-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between px-6 z-10 hidden md:flex">
          <div className="text-xs text-slate-400 flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-800">VALOR</span>
            <span className="text-slate-300">/</span>
            <span className="capitalize text-slate-600 font-semibold">
              {location.pathname === '/' ? 'Command Center' : location.pathname.substring(1).replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Supabase Cloud Live Status */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
              <span>{isCloudSynced ? 'Supabase Live' : isLoadingCloud ? 'Syncing...' : 'Cached'}</span>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            <div className="flex items-center gap-2.5">
              <div className="flex flex-col items-end">
                <span className="text-xs font-bold text-slate-900 leading-none">
                  {currentUser?.name || currentUser?.username || 'Team User'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                  {currentUser?.role || 'user'}
                </span>
              </div>

              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                {((currentUser?.name || currentUser?.username || 'V').substring(0, 2)).toUpperCase()}
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-0.5"
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
