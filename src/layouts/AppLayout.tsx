import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Clock, 
  Compass, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut,
  ChevronDown,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

import ValorLogo from '../components/shared/ValorLogo';
import { useStore } from '../lib/store';

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { currentUser, switchUser, logout, leads, isSuperadmin, isCloudSynced, isLoadingCloud, users } = useStore();
  const location = useLocation();

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
            <span className="text-blue-600 font-black text-xl">V</span>
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
        <nav className="flex-1 flex flex-col gap-1 overflow-y-auto no-scrollbar pr-0.5">
          <NavItem to="/" icon={Users} label="Leads" badge={leads.length} />
          <NavItem to="/today" icon={Clock} label="Today's Queue" />
          <NavItem to="/radar" icon={Compass} label="SMB Radar" />
        </nav>

        {/* Sidebar Footer */}
        <div className="pt-3 border-t border-slate-100 mt-auto">
          <NavItem to="/settings" icon={Settings} label={isSuperadmin ? "Admin & Team" : "My Account"} />
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
            
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800"
            >
              <span>{currentUser?.name?.split(' ')[0] || 'User'}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>
        </header>

        {/* Desktop Topbar */}
        <header className="h-14 border-b border-slate-200/80 bg-white/90 backdrop-blur-md flex items-center justify-between px-6 z-10 hidden md:flex">
          <div className="text-xs text-slate-400 flex items-center gap-2 font-medium">
            <span className="font-bold text-slate-800">VALOR</span>
            <span className="text-slate-300">/</span>
            <span className="capitalize text-slate-700 font-semibold">
              {location.pathname === '/' ? 'Leads' : location.pathname === '/today' ? "Today's Queue" : location.pathname === '/radar' ? 'SMB Radar' : location.pathname.substring(1).replace('-', ' ')}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Supabase Cloud Live Status */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className={`w-2 h-2 rounded-full ${isCloudSynced ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
              <span>{isCloudSynced ? 'Supabase Live' : isLoadingCloud ? 'Syncing...' : 'Cached'}</span>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Interactive 1-Click Role & Account Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-all text-left shadow-2xs group"
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isSuperadmin ? 'bg-blue-600 text-white' : 'bg-slate-800 text-white'
                }`}>
                  {isSuperadmin ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                    {currentUser?.name || currentUser?.username}
                    <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-600 transition-transform" />
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    {isSuperadmin ? 'Superadmin (All Leads)' : 'Sales Rep (Assigned Only)'}
                  </span>
                </div>
              </button>

              {/* Persona Switcher Dropdown */}
              {showUserDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowUserDropdown(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-64 bg-white rounded-2xl border border-slate-200 shadow-xl z-40 py-2 animate-scale-in text-xs">
                    <div className="px-3 py-1.5 border-b border-slate-100">
                      <p className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Switch Active Role & Scope:</p>
                    </div>

                    <div className="py-1">
                      {users.map(u => {
                        const isSelected = currentUser?.id === u.id;
                        return (
                          <button
                            key={u.id}
                            onClick={() => {
                              switchUser(u.username);
                              setShowUserDropdown(false);
                            }}
                            className={`w-full text-left px-3.5 py-2 flex items-center justify-between hover:bg-slate-50 transition-colors ${
                              isSelected ? 'bg-blue-50/70 font-bold text-blue-700' : 'text-slate-700'
                            }`}
                          >
                            <div>
                              <p className="font-bold">{u.name}</p>
                              <p className="text-[10px] text-slate-400">
                                {u.role === 'superadmin' ? 'Superadmin • Full 827 leads' : `Rep • Assigned book`}
                              </p>
                            </div>
                            {isSelected && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-600 text-white">Active</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-100 pt-1 px-1">
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 md:pb-6">
          <Outlet />
        </div>
      </main>

      {/* Sleek Mobile Bottom Navigation Bar (< 768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200/80 flex justify-around items-center px-4 py-2 z-40 pb-safe shadow-lg shadow-slate-200">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            location.pathname === '/' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">Leads</span>
        </Link>

        <Link 
          to="/today" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            location.pathname === '/today' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span className="text-[10px]">Today</span>
        </Link>

        <Link 
          to="/radar" 
          className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-colors ${
            location.pathname === '/radar' ? 'text-blue-600 font-bold' : 'text-slate-400'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">Radar</span>
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
