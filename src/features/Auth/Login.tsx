import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  KeyRound, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  AlertCircle,
  Eye,
  EyeOff,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { useStore, type UserAccount } from '../../lib/store';
import ValorLogo from '../../components/shared/ValorLogo';

export function Login() {
  const { verifyFirstFactor, verifySecondFactorPin } = useStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const matched = verifyFirstFactor(username, password);
    if (matched) {
      setPendingUser(matched);
      setStep(2);
    } else {
      setError('Invalid username or password. Please verify your credentials.');
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!pendingUser) {
      setStep(1);
      return;
    }

    const pinVerified = verifySecondFactorPin(pendingUser, pin, rememberMe);
    if (!pinVerified) {
      setError('Invalid 4-digit Security PIN. Contact Superadmin if forgotten.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden px-4 py-8">
      {/* Background Soft Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50 p-7 sm:p-9 relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center justify-center mb-7">
          <ValorLogo className="scale-110 mb-3" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" /> 2-Factor Protected Sales Workspace
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            /* STEP 1: USERNAME & PASSWORD */
            <motion.form
              key="step1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleStep1Submit}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  User ID / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
                    placeholder="e.g. admin, swaroop, vijay, nithish"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:text-slate-400"
                    placeholder="Enter your password"
                    required
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

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Stay logged in</span>
                </label>
                <span className="text-slate-400 font-medium">Step 1 of 2</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.99] mt-2"
              >
                <span>Continue to PIN</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Credentials Pill */}
              <div className="pt-3 border-t border-slate-100">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Available Accounts:
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div 
                    onClick={() => { setUsername('admin'); setPassword('admin'); }}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-blue-300 cursor-pointer transition-all"
                  >
                    <p className="font-bold text-slate-800">Superadmin</p>
                    <p className="text-[11px] text-slate-500">ID: admin • Pass: admin</p>
                  </div>
                  <div 
                    onClick={() => { setUsername('swaroop'); setPassword('valor'); }}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 hover:border-blue-300 cursor-pointer transition-all"
                  >
                    <p className="font-bold text-slate-800">Sales Rep</p>
                    <p className="text-[11px] text-slate-500">ID: swaroop • Pass: valor</p>
                  </div>
                </div>
              </div>
            </motion.form>
          ) : (
            /* STEP 2: SECURITY PIN VERIFICATION */
            <motion.form
              key="step2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              onSubmit={handleStep2Submit}
              className="space-y-5"
            >
              {/* Authenticated User Badge */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                    {pendingUser?.avatar || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 leading-snug">{pendingUser?.name}</p>
                    <span className="text-[10px] font-bold text-blue-700 uppercase bg-blue-100/70 px-2 py-0.5 rounded-md">
                      {pendingUser?.role}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setPin('');
                    setError('');
                  }}
                  className="text-xs text-slate-500 hover:text-blue-600 font-semibold flex items-center gap-1 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              <div className="text-center py-1">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Enter 4-Digit Security PIN
                </label>
                <div className="relative max-w-[200px] mx-auto">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full pl-9 pr-3 py-3 rounded-2xl border-2 border-blue-500 bg-white text-center font-bold text-xl tracking-widest text-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                    placeholder="••••"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2 font-medium">
                  Default PIN for all accounts: <b className="text-slate-700">1234</b>
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Enter Workspace</span>
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
export default Login;
