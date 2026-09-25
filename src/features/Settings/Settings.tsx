import { User, Bell, Shield, Key, Save } from 'lucide-react';
import { useStore } from '../../lib/store';

export function Settings() {
  const { currentUser } = useStore();
  
  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <div className="flex-none p-6 border-b border-border bg-surface/50 backdrop-blur-sm relative z-10 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your account preferences and CRM configurations.</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 relative z-0">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="bg-surface/50 border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 text-primary rounded-lg"><User className="w-5 h-5" /></div>
              <h2 className="text-lg font-semibold text-foreground">Profile Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Display Name</label>
                <input type="text" defaultValue={currentUser || ''} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:border-primary transition-colors text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Email Address</label>
                <input type="email" defaultValue={`${currentUser || 'admin'}@valorledger.com`} className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:border-primary transition-colors text-sm" />
              </div>
            </div>
          </div>

          <div className="bg-surface/50 border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 text-primary rounded-lg"><Bell className="w-5 h-5" /></div>
              <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
            </div>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-foreground">Email Alerts for New Leads</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary" />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-foreground">Daily Task Reminders</span>
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary" />
              </label>
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm font-medium text-foreground">Weekly Performance Report</span>
                <input type="checkbox" className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary" />
              </label>
            </div>
          </div>

          <div className="bg-surface/50 border border-border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 text-primary rounded-lg"><Shield className="w-5 h-5" /></div>
              <h2 className="text-lg font-semibold text-foreground">Security</h2>
            </div>
            
            <div className="space-y-4">
              <button className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors border border-border rounded-lg px-4 py-2 bg-background hover:bg-surface">
                <Key className="w-4 h-4" /> Change Password
              </button>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black rounded-lg text-sm font-bold hover:bg-primary/90 smooth-transition shadow-lg shadow-primary/20">
              <Save className="w-4 h-4" /> Save Preferences
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
