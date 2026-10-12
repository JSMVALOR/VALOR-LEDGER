import { 
  Filter, 
  ArrowDown, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  PhoneCall, 
  FileCheck,
  Percent
} from 'lucide-react';
import { useStore } from '../../../lib/store';

export function FunnelTab() {
  const { leads } = useStore();

  const total = leads.length || 1;
  const newLeads = leads.filter(l => l.stage === 'New').length;
  const contacted = leads.filter(l => l.stage !== 'New').length;
  const qualified = leads.filter(l => ['Qualified', 'Meeting Scheduled', 'Proposal Sent', 'Negotiation', 'Won'].includes(l.stage)).length;
  const meetings = leads.filter(l => ['Meeting Scheduled', 'Proposal Sent', 'Negotiation', 'Won'].includes(l.stage)).length;
  const proposals = leads.filter(l => ['Proposal Sent', 'Negotiation', 'Won'].includes(l.stage)).length;
  const won = leads.filter(l => l.stage === 'Won').length;

  const funnelSteps = [
    {
      label: '1. Scraped / Raw Prospects',
      count: total,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      icon: Filter,
      description: 'Total verified businesses entered in system',
    },
    {
      label: '2. Outreach Initiated',
      count: contacted,
      color: 'bg-indigo-500',
      textColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      icon: PhoneCall,
      description: 'Cold calls or WhatsApp outbound executed',
    },
    {
      label: '3. Qualified Interest',
      count: qualified,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      icon: TrendingUp,
      description: 'Owner confirmed need for website/redesign',
    },
    {
      label: '4. Demo / Meeting Booked',
      count: meetings,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      icon: FileCheck,
      description: 'Scheduled video or in-person review',
    },
    {
      label: '5. Deals Closed Won',
      count: won,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      icon: CheckCircle2,
      description: 'Retainer / contract payment secured',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Funnel Header */}
      <div className="bg-surface/70 border border-border p-5 md:p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Filter className="w-5 h-5 text-indigo-600" /> End-to-End Conversion Diagnostics
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify exact leakage points in your cold outreach and optimize sales velocity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 bg-background border border-border rounded-xl text-xs font-semibold text-foreground">
            Overall Conversion: <span className="text-emerald-600 font-bold">{((won / total) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Stepped Visual Funnel */}
      <div className="space-y-3">
        {funnelSteps.map((step, idx) => {
          const pctOfTotal = ((step.count / total) * 100).toFixed(1);
          const prevCount = idx > 0 ? funnelSteps[idx - 1].count : total;
          const stepConversion = prevCount > 0 ? ((step.count / prevCount) * 100).toFixed(1) : '100';
          const StepIcon = step.icon;

          return (
            <div key={step.label} className="bg-surface/80 border border-border p-4 md:p-5 rounded-2xl space-y-3 shadow-sm hover:border-indigo-300 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${step.bgColor} ${step.textColor} flex items-center justify-center font-bold`}>
                    <StepIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">{step.label}</h3>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto">
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">{step.count}</p>
                    <p className="text-[11px] text-muted-foreground">{pctOfTotal}% of total base</p>
                  </div>
                  {idx > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-background border border-border text-[11px] font-semibold text-foreground">
                      {stepConversion}% passed
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Bar Container */}
              <div className="w-full bg-background rounded-full h-2.5 overflow-hidden border border-border/50">
                <div 
                  className={`h-full ${step.color} rounded-full transition-all duration-500`}
                  style={{ width: `${Math.max(Number(pctOfTotal), 3)}%` }}
                />
              </div>

              {idx < funnelSteps.length - 1 && (
                <div className="flex items-center justify-center pt-1 text-muted-foreground/60">
                  <ArrowDown className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Strategic Insight Callout */}
      <div className="p-4 md:p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h4 className="font-bold text-amber-900">Pipeline Leakage Diagnosis</h4>
          <p className="text-amber-800 leading-relaxed">
            {newLeads} leads are sitting in the raw "New" stage without a single logged phone call. 
            Assigning these across your active reps (Swaroop, Vijay, Nithish) will immediately multiply demo bookings this week.
          </p>
        </div>
      </div>
    </div>
  );
}
