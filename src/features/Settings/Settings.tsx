import { useState } from 'react';
import { 
  User, 
  ShieldCheck, 
  Key, 
  Save, 
  UserPlus, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  Activity, 
  History,
  ShieldAlert,
  X
} from 'lucide-react';
import { useStore, type UserRole } from '../../lib/store';

export function Settings() {
  const { 
    currentUser, 
    users, 
    createUser, 
    updateCredentials, 
    activities 
  } = useStore();

  const isSuperadmin = currentUser?.role === 'superadmin';

  // Section Switcher
  const [activeTab, setActiveTab] = useState<'security' | 'users' | 'audit'>('security');

  // Change Credentials State
  const [newPassword, setNewPassword] = useState('');
  const [newPin, setNewPin] = useState('');
  const [credSuccess, setCredSuccess] = useState('');
  const [credError, setCredError] = useState('');

  // Superadmin Create User State
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserPin, setNewUserPin] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [createSuccess, setCreateSuccess] = useState('');

  const handleUpdateMyCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setCredSuccess('');
    setCredError('');

    if (!currentUser) return;
    if (newPassword.length < 4) {
      setCredError('Password must be at least 4 characters');
      return;
    }
    if (newPin.length !== 4) {
      setCredError('Security PIN must be exactly 4 digits');
      return;
    }

    updateCredentials(currentUser.id, newPassword, newPin);
    setCredSuccess('Your Password & Security PIN have been successfully updated and logged!');
    setNewPassword('');
    setNewPin('');
  };

  const handleSuperadminCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateSuccess('');

    if (!newUserUsername || !newUserPassword || !newUserPin) return;

    createUser({
      username: newUserUsername.trim().toLowerCase(),
      name: newUserName.trim() || newUserUsername,
      password: newUserPassword,
      pin: newUserPin,
      role: newUserRole,
      mustChangeCredentials: true,
    });

    setCreateSuccess(`Account for "${newUserUsername}" successfully created with role: ${newUserRole}!`);
    setNewUserUsername('');
    setNewUserName('');
    setNewUserPassword('');
    setNewUserPin('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-20 md:pb-8">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
            System & Security Hub
            {isSuperadmin && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                Superadmin Mode
              </span>
            )}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Role-Based Access Control (RBAC), two-factor PIN configuration, and immutable activity auditing.
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-surface border border-border rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'security' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            My Security & PIN
          </button>
          {isSuperadmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'users' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> User Management
            </button>
          )}
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'audit' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <History className="w-3.5 h-3.5" /> Action Audit Log
          </button>
        </div>
      </div>

      {/* Mandatory Change Notice */}
      {currentUser?.mustChangeCredentials && (
        <div className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-amber-900">Mandatory Security Update Required</h4>
            <p className="text-amber-800 leading-relaxed">
              Your account was created with a temporary default password and PIN. Please update your personal Password and Security PIN below to secure your access.
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: MY CREDENTIALS & PIN */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Dossier Card */}
          <div className="bg-surface/80 border border-border p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-md">
                {currentUser?.avatar || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-foreground text-base leading-snug">{currentUser?.name}</h3>
                <span className="text-[11px] font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {currentUser?.role}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs pt-2 border-t border-border">
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">User ID:</span>
                <span className="font-bold text-foreground font-mono">{currentUser?.username}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">Account Status:</span>
                <span className="font-bold text-emerald-600 capitalize">{currentUser?.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-muted-foreground">2-Factor Status:</span>
                <span className="font-bold text-blue-600">PIN Active</span>
              </div>
            </div>
          </div>

          {/* Change Password & PIN Form */}
          <div className="md:col-span-2 bg-surface/80 border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-foreground text-sm">Update Password & Security PIN</h3>
            </div>

            {credSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{credSuccess}</span>
              </div>
            )}

            {credError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{credError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateMyCredentials} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-blue-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1.5">
                    New Security PIN (4 digits) *
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="e.g. 5821"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-blue-500 font-bold text-center tracking-widest"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all"
              >
                <Save className="w-4 h-4" /> Save New Credentials
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: SUPERADMIN USER CREATION & RBAC */}
      {activeTab === 'users' && isSuperadmin && (
        <div className="space-y-6">
          {/* Create User Box */}
          <div className="bg-surface/80 border border-border p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-foreground text-sm">Provision New Team User</h3>
            </div>

            {createSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSuperadminCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">User ID / Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rohit"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rohit Verma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Initial pass"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Initial PIN (4-digits) *</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="1234"
                  value={newUserPin}
                  onChange={(e) => setNewUserPin(e.target.value)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl font-mono text-center tracking-widest focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase mb-1">Assigned Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-background border border-border rounded-xl font-bold focus:outline-none capitalize"
                >
                  <option value="user">User (Rep)</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div className="col-span-full pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <UserPlus className="w-4 h-4" /> Provision Account
                </button>
              </div>
            </form>
          </div>

          {/* User Roster Table */}
          <div className="bg-surface/80 border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-border">
              <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Active System Users ({users.length})
              </h3>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface border-b border-border text-muted-foreground font-semibold">
                  <th className="py-3 pl-4">User</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Current Password</th>
                  <th className="py-3">Security PIN</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-background/80 transition-colors">
                    <td className="py-3 pl-4">
                      <p className="font-bold text-foreground">{u.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">@{u.username}</p>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.role === 'superadmin' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-background border-border text-foreground'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-muted-foreground">••••••••</td>
                    <td className="py-3 font-mono font-bold text-blue-600">{u.pin}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: IMMUTABLE AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="bg-surface/80 border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-foreground text-sm">System Action Audit Trail</h3>
            </div>
            <span className="text-xs text-muted-foreground font-medium">
              Every stage shift, dial, user creation, and reassignment is logged
            </span>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-background border border-border flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                    {act.user ? act.user.charAt(0) : 'S'}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      <span className="font-bold text-blue-600">{act.user}</span> {act.action}
                    </p>
                    <p className="text-[11px] text-muted-foreground font-semibold mt-0.5">{act.target}</p>
                  </div>
                </div>

                <span className="text-[10px] text-muted-foreground shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
export default Settings;
