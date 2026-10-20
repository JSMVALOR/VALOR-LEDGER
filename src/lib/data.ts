import type { Lead, Company, Task, Event, Activity } from './store';

// All live data has been migrated to Supabase Cloud PostgreSQL.
// Default empty collections serve as fallbacks during initial hydration.
export const initialLeads: Lead[] = [];
export const initialCompanies: Company[] = [];
export const initialTasks: Task[] = [];
export const initialEvents: Event[] = [];
export const initialActivities: Activity[] = [];
