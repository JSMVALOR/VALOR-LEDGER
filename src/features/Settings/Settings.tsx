import { useState, useMemo } from 'react';
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
  History,
  ShieldAlert,
  Search,
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

  // Audit Search
  const [auditSearch, setAuditSearch] = useState('');

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
    setCredSuccess('Your Password & Security PIN have been updated successfully!');
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

  const filteredActivities = useMemo(() => {
    return activities.filter(act => 
      (act.action || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
      (act.target || '').toLowerCase().includes(auditSearch.toLowerCase()) ||
      (act.user || '').toLowerCase().includes(auditSearch.toLowerCase())
    );
  }, [activities, auditSearch]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full pb-20 md:pb-8">
      {/* Settings Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            System & Security Settings
            {isSuperadmin && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                Superadmin Mode
              </span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-Based Access Control, two-factor PIN credentials, and immutable action auditing.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 border border-slate-200 rounded-xl self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'security' 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
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
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" /> Team Users
            </button>
          )}
          {isSuperadmin && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                activeTab === 'audit' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" /> Action Log
            </button>
          )}
        </div>
      </div>

      {/* Mandatory Change Notice */}
      {currentUser?.mustChangeCredentials && (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-amber-900">Mandatory Security Update Required</h4>
            <p className="text-amber-800 leading-relaxed font-medium">
              Your account was assigned a default password and PIN. Please choose your personal Password and Security PIN below to complete setup.
            </p>
          </div>
        </div>
      )}

      {/* TAB 1: MY CREDENTIALS & PIN */}
      {activeTab === 'security' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User Dossier Card */}
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-lg shadow-sm">
                {currentUser?.avatar || 'U'}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base leading-snug">{currentUser?.name}</h3>
                <span className="text-[11px] font-bold text-blue-700 uppercase bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  {currentUser?.role}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs pt-3 border-t border-slate-100">
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">User ID:</span>
                <span className="font-bold text-slate-800 font-mono">@{currentUser?.username}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">Account Status:</span>
                <span className="font-bold text-emerald-600 capitalize">{currentUser?.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 font-medium">2FA Protection:</span>
                <span className="font-bold text-blue-600">Active (4-Digit PIN)</span>
              </div>
            </div>
          </div>

          {/* Change Password & PIN Form */}
          <div className="md:col-span-2 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <KeyRound className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Update Password & Security PIN</h3>
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Security PIN (4 digits) *
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="e.g. 5821"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold text-center tracking-widest text-slate-900 text-base"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
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
          <div className="bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <UserPlus className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-sm">Provision New Team User</h3>
            </div>

            {createSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{createSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSuperadminCreateUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">User ID / Username *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. rohit"
                  value={newUserUsername}
                  onChange={(e) => setNewUserUsername(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Rohit Verma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password *</label>
                <input
                  type="text"
                  required
                  placeholder="Temporary pass"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">4-Digit PIN *</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="1234"
                  value={newUserPin}
                  onChange={(e) => setNewUserPin(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-center tracking-widest text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none capitalize"
                >
                  <option value="user">Sales Rep</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div className="col-span-full pt-2 flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-[0.98] transition-all"
                >
                  <UserPlus className="w-4 h-4" /> Provision Account
                </button>
              </div>
            </form>
          </div>

          {/* User Roster Table */}
          <div className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" /> Active System Users ({users.length})
              </h3>
            </div>

            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold">
                  <th className="py-3.5 pl-4">User</th>
                  <th className="py-3.5">Role</th>
                  <th className="py-3.5">Security PIN</th>
                  <th className="py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 pl-4">
                      <p className="font-bold text-slate-900 text-sm">{u.name}</p>
                      <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
                    </td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        u.role === 'superadmin' 
                          ? 'bg-blue-50 text-blue-700 border-blue-200' 
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {u.role === 'superadmin' ? 'Superadmin' : 'Sales Rep'}
                      </span>
                    </td>
                    <td className="py-3 font-mono font-bold text-blue-600">{u.pin}</td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
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
      {activeTab === 'audit' && isSuperadmin && (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" /> System Action Audit Trail
              </h3>
              <p className="text-xs text-slate-400">
                Immutable chronological log of all deals moved, calls made, and accounts created
              </p>
            </div>

            <div className="relative sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search audit trail..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-medium placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredActivities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                    {act.user ? act.user.charAt(0) : 'S'}
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">
                      <span className="font-bold text-blue-600">{act.user}</span> {act.action}
                    </p>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{act.target}</p>
                  </div>
                </div>

                <span className="text-[11px] text-slate-400 shrink-0 font-medium">{act.time}</span>
              </div>
            ))}

            {filteredActivities.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-400">
                No matching events found in audit history.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
export default Settings;
