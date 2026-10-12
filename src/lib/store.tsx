import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialLeads, initialCompanies, initialTasks, initialEvents, initialActivities } from './data';
import { supabase, isSupabaseConfigured } from './supabase';

export type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
export type Priority = 'High' | 'Medium' | 'Low';

export type TeamUser = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'active' | 'away' | 'offline';
};

export const TEAM_MEMBERS: TeamUser[] = [
  { id: 'swaroop', name: 'Swaroop', role: 'Sales Lead', avatar: 'S', status: 'active' },
  { id: 'vijay', name: 'Vijay', role: 'Outreach Exec', avatar: 'V', status: 'active' },
  { id: 'nithish', name: 'Nithish', role: 'Deal Closer', avatar: 'N', status: 'active' },
];

export type Lead = {
  id: string;
  company: string;
  contactPerson: string;
  phone: string;
  city: string;
  industry: string;
  stage: LeadStage;
  priority: Priority;
  value: number;
  nextFollowUp: string;
  createdAt: number;
  email?: string;
  website?: string;
  assignedTo?: string; // swaroop | vijay | nithish
  notes?: string;
  lastContactedAt?: number;
};

export type Company = {
  id: string;
  name: string;
  industry: string;
  employees: string;
  website: string;
  city: string;
  phone: string;
  email: string;
  lastContact: string;
};

export type Task = {
  id: string;
  title: string;
  due: string;
  priority: Priority;
  completed: boolean;
  assignedTo?: string;
};

export type Event = {
  id: string;
  title: string;
  time: string;
  type: string;
  assignedTo?: string;
};

export type Activity = {
  id: string;
  time: string;
  action: string;
  target: string;
  user: string;
  timestamp?: number;
};

export type SelectedItem = { type: 'lead' | 'company' | 'task'; id: string } | null;

type StoreContextType = {
  leads: Lead[];
  allLeads: Lead[];
  incompleteLeads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLeadStage: (id: string, stage: LeadStage) => void;
  assignLead: (id: string, rep: string) => void;
  companies: Company[];
  addCompany: (company: Omit<Company, 'id'>) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  toggleTask: (id: string) => void;
  events: Event[];
  addEvent: (event: Omit<Event, 'id'>) => void;
  activities: Activity[];
  logActivity: (action: string, target: string) => void;
  selectedItem: SelectedItem;
  setSelectedItem: (item: SelectedItem) => void;
  currentUser: string | null;
  login: (u: string, p: string, remember?: boolean) => boolean;
  logout: () => void;
  isCloudSynced: boolean;
};

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};

// Evenly distribute initial assignments if missing
const seedAssignedLeads = (rawLeads: Lead[]): Lead[] => {
  const reps = ['swaroop', 'vijay', 'nithish'];
  return rawLeads.map((l, idx) => ({
    ...l,
    assignedTo: l.assignedTo || reps[idx % reps.length],
    createdAt: l.createdAt || (Date.now() - (idx * 86400000)),
  }));
};

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('valor_leads_cache');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return seedAssignedLeads(initialLeads);
  });

  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [isCloudSynced, setIsCloudSynced] = useState(isSupabaseConfigured);

  const [currentUser, setCurrentUser] = useState<string | null>(
    localStorage.getItem('valor_user') || sessionStorage.getItem('valor_user')
  );

  // Sync to local cache
  useEffect(() => {
    localStorage.setItem('valor_leads_cache', JSON.stringify(leads));
  }, [leads]);

  // Optional Supabase Realtime Sync hook if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    
    const fetchCloudData = async () => {
      try {
        const { data, error } = await supabase.from('leads').select('*');
        if (!error && data && data.length > 0) {
          setLeads(data);
          setIsCloudSynced(true);
        }
      } catch (err) {
        console.warn('Supabase fetch fallback to local store:', err);
      }
    };

    fetchCloudData();
  }, []);

  const login = (u: string, p: string, remember: boolean = true) => {
    const validUsers = ['swaroop', 'vijay', 'nithish'];
    if (validUsers.includes(u.toLowerCase()) && p === 'valor123') {
      setCurrentUser(u.toLowerCase());
      if (remember) {
        localStorage.setItem('valor_user', u.toLowerCase());
      } else {
        sessionStorage.setItem('valor_user', u.toLowerCase());
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('valor_user');
    sessionStorage.removeItem('valor_user');
  };

  const logActivity = (action: string, target: string) => {
    const newAct: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      time: 'Just now',
      action,
      target,
      user: currentUser ? currentUser.charAt(0).toUpperCase() + currentUser.slice(1) : 'System',
      timestamp: Date.now(),
    };
    setActivities(prev => [newAct, ...prev]);
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      assignedTo: leadData.assignedTo || currentUser || 'swaroop',
    };
    setLeads(prev => [newLead, ...prev]);
    logActivity('Created lead:', newLead.company);

    if (isSupabaseConfigured && supabase) {
      supabase.from('leads').insert([newLead]).then();
    }
  };

  const updateLeadStage = (id: string, stage: LeadStage) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        logActivity(`Moved to ${stage}:`, l.company);
        return { ...l, stage, lastContactedAt: Date.now() };
      }
      return l;
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('leads').update({ stage, lastContactedAt: Date.now() }).eq('id', id).then();
    }
  };

  const assignLead = (id: string, rep: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        logActivity(`Reassigned to ${rep}:`, l.company);
        return { ...l, assignedTo: rep };
      }
      return l;
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('leads').update({ assignedTo: rep }).eq('id', id).then();
    }
  };

  const addCompany = (companyData: Omit<Company, 'id'>) => {
    setCompanies(prev => [{ ...companyData, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
    logActivity('Added company:', companyData.name);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    setTasks(prev => [{ ...taskData, id: Math.random().toString(36).substr(2, 9), completed: false }, ...prev]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    setEvents(prev => [{ ...eventData, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
  };

  const hasContactInfo = (l: Lead) => Boolean((l.phone && l.phone !== 'N/A') || (l.website && l.website !== '') || (l.email && l.email !== ''));
  const validLeads = leads.filter(hasContactInfo);
  const incompleteLeads = leads.filter(l => !hasContactInfo(l));

  return (
    <StoreContext.Provider value={{
      leads: validLeads,
      allLeads: leads,
      incompleteLeads,
      addLead,
      updateLeadStage,
      assignLead,
      companies,
      addCompany,
      tasks,
      addTask,
      toggleTask,
      events,
      addEvent,
      activities,
      logActivity,
      selectedItem,
      setSelectedItem,
      currentUser,
      login,
      logout,
      isCloudSynced,
    }}>
      {children}
    </StoreContext.Provider>
  );
};
