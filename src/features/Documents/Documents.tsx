import { FileText } from 'lucide-react';
import { motion } from "framer-motion";

export function Documents() {
  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="flex flex-col items-center text-center max-w-md p-10 bg-card border border-border shadow-2xl"
      >
        <div className="flex h-16 w-16 items-center justify-center border border-border bg-surface mb-6">
          <FileText className="h-8 w-8 text-muted-foreground" strokeWidth={1} />
        </div>
        <h2 className="text-xl font-mono font-bold tracking-widest uppercase text-foreground mb-3">
          No Documents
        </h2>
        <p className="text-muted-foreground font-mono text-xs leading-relaxed mb-8">
          Upload and manage files, contracts, and proposals.
        </p>
        <button
          className="inline-flex h-10 items-center justify-center bg-primary px-8 text-xs font-mono font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors"
        >
          Upload File
        </button>
      </motion.div>
    </div>
  );
}
