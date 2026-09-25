import { useState, useEffect } from 'react';
import { useStore } from '../../lib/store';
import ValorLogo from '../../components/shared/ValorLogo';

export function Login() {
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(username, password, rememberMe)) {
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] z-0">
        <ValorLogo className="scale-[10]" />
      </div>

      <div className="w-full max-w-md p-8 bg-surface/80 backdrop-blur-md rounded-2xl border border-border shadow-xl relative z-10 mx-4">
        <div className="flex flex-col items-center justify-center mb-8">
          <ValorLogo className="scale-125 mb-4" />
          <p className="text-muted-foreground text-sm text-center mt-2">
            Sign in to access your CRM workspace.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:border-primary transition-colors text-sm"
              placeholder="e.g. swaroop, vijay, nithish"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:outline-none focus:border-primary transition-colors text-sm"
              placeholder="Enter password (valor123)"
              required
            />
          </div>

          <div className="flex items-center justify-between pb-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 accent-primary" 
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Remember me</span>
            </label>
          </div>

          {error && (
            <div className="text-red-500 text-sm font-medium bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-primary text-black font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
