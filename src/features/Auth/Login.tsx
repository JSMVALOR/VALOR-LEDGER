import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  KeyRound, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  User, 
  AlertCircle,
  Eye,
  EyeOff,
  ChevronLeft
} from 'lucide-react';
import { useStore, type UserAccount } from '../../lib/store';
import ValorLogo from '../../components/shared/ValorLogo';

export function Login() {
  const { verifyFirstFactor, verifySecondFactorPin } = useStore();

  // Multi-step state: 1 = Username + Password, 2 = PIN verification
  const [step, setStep] = useState<1 | 2>(1);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pin, setPin] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  
  // Pending authenticated user awaiting PIN
  const [pendingUser, setPendingUser] = useState<UserAccount | null>(null);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const matched = verifyFirstFactor(username, password);
    if (matched) {
      setPendingUser(matched);
      setStep(2);
    } else {
      setError('Invalid username or password. Check credentials.');
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
      setError('Invalid Security PIN. Contact Superadmin if lost.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0">
        <ValorLogo className="scale-[10]" />
      </div>

      <div className="w-full max-w-md p-6 sm:p-8 bg-surface/90 backdrop-blur-xl rounded-3xl border border-border shadow-2xl relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center justify-center mb-6">
          <ValorLogo className="scale-110 mb-3" />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mt-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Two-Factor Protected CRM
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 ? (
            /* STEP 1: USERNAME & PASSWORD */
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleStep1Submit}
              className="space-y-4"
            >
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  User ID / Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-blue-500 font-semibold text-xs transition-colors"
                    placeholder="admin, swaroop, vijay, nithish"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-border bg-background focus:outline-none focus:border-blue-500 font-semibold text-xs transition-colors"
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span>Remember session</span>
                </label>
                <span className="text-[11px] text-muted-foreground">Step 1 of 2</span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all mt-2"
              >
                <span>Continue to Security PIN</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="p-3 bg-surface border border-border rounded-xl text-[11px] text-muted-foreground space-y-1">
                <p className="font-bold text-foreground">Default Access Credentials:</p>
                <p>• <b>admin</b> (pass: <code className="bg-background px-1 rounded">admin</code> | PIN: <code className="bg-background px-1 rounded">1234</code>)</p>
                <p>• <b>swaroop / vijay / nithish</b> (pass: <code className="bg-background px-1 rounded">valor</code> | PIN: <code className="bg-background px-1 rounded">1234</code>)</p>
              </div>
            </motion.form>
          ) : (
            /* STEP 2: SECURITY PIN VERIFICATION */
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleStep2Submit}
              className="space-y-5"
            >
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {pendingUser?.avatar || 'U'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{pendingUser?.name}</p>
                    <p className="text-[10px] text-blue-700 uppercase font-semibold">{pendingUser?.role}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setPin('');
                    setError('');
                  }}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Back
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2 text-center">
                  Enter Security PIN Code
                </label>
                <div className="relative max-w-[200px] mx-auto">
                  <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="password"
                    maxLength={6}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-blue-500 bg-background text-center font-extrabold text-lg tracking-widest focus:outline-none focus:ring-4 focus:ring-blue-500/20"
                    placeholder="••••"
                    required
                    autoFocus
                  />
                </div>
                <p className="text-[11px] text-center text-muted-foreground mt-2">
                  PIN provided by Superadmin (Default: <b>1234</b>)
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Verify PIN & Access Workspace</span>
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
export default Login;
