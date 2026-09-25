import { Settings as SettingsIcon } from 'lucide-react';
import { motion } from "framer-motion";
import ThemeSwitcher from '../../components/shared/ThemeSwitcher';

export function Settings() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-md p-10 bg-card border border-border shadow-2xl rounded-2xl relative"
      >
        <div className="absolute top-4 right-4">
          <ThemeSwitcher />
        </div>
        <div className="flex h-16 w-16 items-center justify-center border border-border bg-surface mb-6 rounded-xl text-primary shadow-inner">
          <SettingsIcon className="h-8 w-8" strokeWidth={1} />
        </div>
        <h2 className="text-xl font-mono font-bold tracking-widest uppercase text-foreground mb-3">
          Settings
        </h2>
        <p className="text-muted-foreground font-mono text-xs leading-relaxed mb-4">
          This workspace is configured to use frontend-only storage as the source of truth.
        </p>
        <div className="bg-surface/50 border border-border p-4 rounded-lg w-full text-left">
          <p className="text-xs text-muted-foreground mb-2"><strong>How to update data:</strong></p>
          <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
            <li>Open <code className="bg-background px-1 py-0.5 rounded text-primary">src/lib/data.ts</code></li>
            <li>Modify the static arrays</li>
            <li>Commit and push your changes</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}
