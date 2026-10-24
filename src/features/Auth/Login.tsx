import { useState } from 'react';
import { 
  Lock, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck
} from 'lucide-react';
import { useStore } from '../../lib/store';
import ValorLogo from '../../components/shared/ValorLogo';

export function Login() {
  const { login, users } = useStore();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const success = login(username, password);
    if (!success) {
      setError('Invalid username or password. Please verify credentials.');
    }
  };

  const handleFastLogin = (uname: string) => {
    login(uname);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4 py-8 font-sans">
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/40 p-7 sm:p-9 relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center justify-center mb-6">
          <ValorLogo className="scale-110 mb-2.5" />
          <p className="text-xs text-slate-500 font-medium">Commercial Sales Engine & Pipeline</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Fast Profile Entry */}
        <div className="mb-5 space-y-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Sign-In As:
          </p>
          <div className="grid grid-cols-1 gap-2 text-xs">
            {users.slice(0, 3).map((u) => {
              const isSuper = u.role === 'superadmin';
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleFastLogin(u.username)}
                  className="w-full p-2.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200/80 hover:border-blue-300 transition-all flex items-center justify-between group text-left"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSuper ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-800 text-white'
                    }`}>
                      {isSuper ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{u.name}</p>
                      <p className="text-[10px] text-slate-400">
                        {isSuper ? 'Superadmin • Full Access (827 leads)' : 'Sales Rep • Assigned Book'}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-slate-100 w-full" />
          <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider absolute">
            or manual login
          </span>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
                placeholder="swaroop, vijay, nithish, admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <span>Enter Workspace</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
