import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase, isSupabaseConfigured } from './supabase';

export type UserRole = 'superadmin' | 'user';

export type UserAccount = {
  id: string;
  username: string;
  name: string;
  password: string; // password
  pin: string;      // 4 to 6 digit security PIN
  role: UserRole;
  avatar: string;
  status: 'active' | 'suspended';
  mustChangeCredentials?: boolean;
  createdAt: number;
};

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'admin',
    username: 'admin',
    name: 'Swaroop (Superadmin)',
    password: 'admin',
    pin: '1234',
    role: 'superadmin',
    avatar: 'A',
    status: 'active',
    mustChangeCredentials: false,
    createdAt: Date.now() - 30 * 86400000,
  },
  {
    id: 'swaroop',
    username: 'swaroop',
    name: 'Swaroop',
    password: 'valor',
    pin: '1234',
    role: 'superadmin',
    avatar: 'S',
    status: 'active',
    mustChangeCredentials: false,
    createdAt: Date.now() - 20 * 86400000,
  },
  {
    id: 'vijay',
    username: 'vijay',
    name: 'Vijay',
    password: 'valor',
    pin: '1234',
    role: 'user',
    avatar: 'V',
    status: 'active',
    mustChangeCredentials: true,
    createdAt: Date.now() - 10 * 86400000,
  },
  {
    id: 'nithish',
    username: 'nithish',
    name: 'Nithish',
    password: 'valor',
    pin: '1234',
    role: 'user',
    avatar: 'N',
    status: 'active',
    mustChangeCredentials: true,
    createdAt: Date.now() - 5 * 86400000,
  },
];

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  status: 'active' | 'away' | 'offline';
};

// Dynamic exported TEAM_MEMBERS for backward-compatibility with direct imports
export let TEAM_MEMBERS: TeamMember[] = INITIAL_USERS.map(u => ({
  id: u.username,
  name: u.name,
  role: u.role === 'superadmin' ? 'Superadmin / Sales Director' : 'Sales Representative',
  avatar: u.avatar,
  status: (u.status === 'active' ? 'active' : 'offline') as 'active' | 'away' | 'offline',
}));

export type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
export type Priority = 'High' | 'Medium' | 'Low';

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
  assignedTo?: string;
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
  // Authentication & RBAC
  users: UserAccount[];
  currentUser: UserAccount | null;
  login: (username: string, password?: string) => boolean;
  switchUser: (username: string) => void;
  verifyFirstFactor: (username: string, pass: string) => UserAccount | null;
  verifySecondFactorPin: (user: UserAccount, pin: string, remember?: boolean) => boolean;
  updateCredentials: (userId: string, newPassword: string, newPin: string) => void;
  createUser: (userData: Omit<UserAccount, 'id' | 'createdAt' | 'status' | 'avatar'>) => void;
  logout: () => void;
  teamMembers: TeamMember[];
  
  // Pipeline & Core Store
  isSuperadmin: boolean;
  leads: Lead[];
  allLeads: Lead[];
  incompleteLeads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  addLeadsBatch: (leads: Omit<Lead, 'id' | 'createdAt'>[]) => Promise<Lead[]>;
  updateLeadStage: (id: string, stage: LeadStage) => void;
  assignLead: (id: string, rep: string) => void;
  recordCallOutcome: (leadId: string, outcome: string, notes?: string, newStage?: LeadStage, followUp?: string) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  updateLeadNotes: (id: string, notes: string, nextFollowUp?: string) => void;
  deleteLead: (id: string) => void;
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
  isCloudSynced: boolean;
  isLoadingCloud: boolean;
  refreshData: () => Promise<void>;
};

export function getWhatsAppUrl(lead: Lead): string {
  const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
  const phoneWithCountry = cleanPhone.startsWith('91') && cleanPhone.length > 10 
    ? cleanPhone 
    : cleanPhone.length === 10 
      ? `91${cleanPhone}` 
      : cleanPhone;
  
  const hasWeb = Boolean(lead.website && lead.website.trim().length > 3);
  const contactName = lead.contactPerson && lead.contactPerson !== 'Decision Maker' 
    ? lead.contactPerson 
    : 'Sir/Madam';

  const pitch = !hasWeb
    ? `Hello ${contactName}, I noticed ${lead.company} in ${lead.city} doesn't have an official online appointment booking & showcase website yet. We build high-trust digital portals for ${lead.industry.toLowerCase()} starting at ₹10,000. Would you be open to a quick 5-min demo this week?`
    : `Hello ${contactName}, I came across ${lead.company} in ${lead.city}. We specialize in high-speed mobile overhauls, Google Maps SEO, and automated WhatsApp booking for ${lead.industry.toLowerCase()}. Would you be open to a 5-min website audit review this week?`;

  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(pitch)}`;
}

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoadingCloud, setIsLoadingCloud] = useState(true);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Users state
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('valor_users_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_USERS;
  });

  // Current session user (default to Swaroop / Superadmin for instant access)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('valor_active_session') || sessionStorage.getItem('valor_active_session');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (parsed && parsed.username) return parsed;
      } catch (e) { /* fallback */ }
    }
    return INITIAL_USERS[1]; // Default: Swaroop (Superadmin)
  });

  // Pipeline Collections (initialized from local storage cache if available)
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('valor_leads_cache');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  const [companies, setCompanies] = useState<Company[]>(() => {
    const saved = localStorage.getItem('valor_companies_cache');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('valor_tasks_cache');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  const [events, setEvents] = useState<Event[]>(() => {
    const saved = localStorage.getItem('valor_events_cache');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('valor_activity_audit');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return [];
  });

  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);

  // Dynamically update exported TEAM_MEMBERS whenever users change
  useEffect(() => {
    TEAM_MEMBERS = users.map(u => ({
      id: u.username,
      name: u.name,
      role: u.role === 'superadmin' ? 'Superadmin / Sales Director' : 'Sales Representative',
      avatar: u.avatar,
      status: (u.status === 'active' ? 'active' : 'offline') as 'active' | 'away' | 'offline',
    }));
  }, [users]);

  // Sync to local caches for instant offline fallback
  useEffect(() => {
    try { localStorage.setItem('valor_users_v2', JSON.stringify(users)); } catch (e) {}
  }, [users]);

  useEffect(() => {
    try { localStorage.setItem('valor_leads_cache', JSON.stringify(leads)); } catch (e) {}
  }, [leads]);

  useEffect(() => {
    try { localStorage.setItem('valor_companies_cache', JSON.stringify(companies)); } catch (e) {}
  }, [companies]);

  useEffect(() => {
    try { localStorage.setItem('valor_tasks_cache', JSON.stringify(tasks)); } catch (e) {}
  }, [tasks]);

  useEffect(() => {
    try { localStorage.setItem('valor_events_cache', JSON.stringify(events)); } catch (e) {}
  }, [events]);

  useEffect(() => {
    try { localStorage.setItem('valor_activity_audit', JSON.stringify(activities)); } catch (e) {}
  }, [activities]);

  // Initial Data Fetch from Supabase Cloud
  const fetchAllData = async () => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoadingCloud(false);
      return;
    }
    setIsLoadingCloud(true);
    try {
      const client = supabase;
      if (!client) return;

      // Fetch all in parallel with expanded limit
      const [
        usersRes,
        leadsRes,
        companiesRes,
        tasksRes,
        eventsRes,
        activitiesRes,
      ] = await Promise.all([
        client.from('users').select('*'),
        client.from('leads').select('*').order('createdAt', { ascending: false }).limit(3000),
        client.from('companies').select('*'),
        client.from('tasks').select('*'),
        client.from('events').select('*'),
        client.from('activities').select('*').order('timestamp', { ascending: false }).limit(60),
      ]);

      if (usersRes.data && usersRes.data.length > 0) {
        setUsers(usersRes.data as UserAccount[]);
      }

      if (leadsRes.data) {
        setLeads(leadsRes.data as Lead[]);
      }

      if (companiesRes.data) {
        setCompanies(companiesRes.data as Company[]);
      }

      if (tasksRes.data) {
        setTasks(tasksRes.data as Task[]);
      }

      if (eventsRes.data) {
        setEvents(eventsRes.data as Event[]);
      }

      if (activitiesRes.data && activitiesRes.data.length > 0) {
        setActivities(activitiesRes.data as Activity[]);
      }

      setIsCloudSynced(true);
    } catch (err) {
      console.warn('Supabase fetch error, using cache:', err);
    } finally {
      setIsLoadingCloud(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoadingCloud(false);
      return;
    }

    fetchAllData();

    // Setup Supabase Realtime multi-client live sync
    const realtimeChannel = supabase
      .channel('valor-realtime-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, payload => {
        if (payload.eventType === 'INSERT') {
          const inserted = payload.new as Lead;
          setLeads(prev => prev.some(l => l.id === inserted.id) ? prev : [inserted, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Lead;
          setLeads(prev => prev.map(l => l.id === updated.id ? { ...l, ...updated } : l));
        } else if (payload.eventType === 'DELETE') {
          const oldId = (payload.old as any)?.id;
          if (oldId) setLeads(prev => prev.filter(l => l.id !== oldId));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
        if (payload.eventType === 'INSERT') {
          const inserted = payload.new as Task;
          setTasks(prev => prev.some(t => t.id === inserted.id) ? prev : [inserted, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Task;
          setTasks(prev => prev.map(t => t.id === updated.id ? { ...t, ...updated } : t));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'activities' }, payload => {
        if (payload.eventType === 'INSERT') {
          const inserted = payload.new as Activity;
          setActivities(prev => prev.some(a => a.id === inserted.id) ? prev : [inserted, ...prev]);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, payload => {
        if (payload.eventType === 'INSERT') {
          const inserted = payload.new as Company;
          setCompanies(prev => prev.some(c => c.id === inserted.id) ? prev : [inserted, ...prev]);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, payload => {
        if (payload.eventType === 'INSERT') {
          const inserted = payload.new as UserAccount;
          setUsers(prev => prev.some(u => u.id === inserted.id) ? prev : [...prev, inserted]);
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as UserAccount;
          setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));
        }
      })
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);

  const logActivity = (action: string, target: string) => {
    const actorName = currentUser ? currentUser.name : 'System';
    const newAct: Activity = {
      id: Math.random().toString(36).substr(2, 9),
      time: 'Just now',
      action,
      target,
      user: actorName,
      timestamp: Date.now(),
    };
    setActivities(prev => [newAct, ...prev]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('activities').insert([newAct]).then();
    }
  };

  // Clean 1-Step Login & Persona Switcher
  const login = (username: string, password?: string): boolean => {
    const found = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (found && found.status === 'active') {
      if (password && found.password !== password) {
        return false;
      }
      setCurrentUser(found);
      localStorage.setItem('valor_active_session', JSON.stringify(found));
      logActivity('User signed in:', `${found.name} (${found.role})`);
      return true;
    }
    return false;
  };

  const switchUser = (username: string) => {
    const found = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('valor_active_session', JSON.stringify(found));
      logActivity('Switched active profile:', `${found.name} (${found.role})`);
    }
  };

  // Step 1: Username & Password Verification
  const verifyFirstFactor = (username: string, pass: string): UserAccount | null => {
    const found = users.find(
      u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === pass
    );
    if (found && found.status === 'active') {
      return found;
    }
    return null;
  };

  // Step 2: Security PIN Verification
  const verifySecondFactorPin = (user: UserAccount, pin: string, remember: boolean = true): boolean => {
    if (user.pin === pin.trim()) {
      setCurrentUser(user);
      const serialized = JSON.stringify(user);
      if (remember) {
        localStorage.setItem('valor_active_session', serialized);
      } else {
        sessionStorage.setItem('valor_active_session', serialized);
      }
      logActivity('User authenticated:', `${user.name} (${user.role}) logged in`);
      return true;
    }
    return false;
  };

  // Mandatory / Settings Credential Update
  const updateCredentials = (userId: string, newPassword: string, newPin: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = {
          ...u,
          password: newPassword,
          pin: newPin,
          mustChangeCredentials: false,
        };
        if (currentUser && currentUser.id === userId) {
          setCurrentUser(updated);
          localStorage.setItem('valor_active_session', JSON.stringify(updated));
        }
        return updated;
      }
      return u;
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('users').update({
        password: newPassword,
        pin: newPin,
        mustChangeCredentials: false
      }).eq('id', userId).then();
    }

    logActivity('Security credential updated:', `Password & PIN updated for user ID ${userId}`);
  };

  // Superadmin creates user with assigned role & PIN
  const createUser = (userData: Omit<UserAccount, 'id' | 'createdAt' | 'status' | 'avatar'>) => {
    const newUser: UserAccount = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      avatar: (userData.name || 'U').charAt(0).toUpperCase(),
      status: 'active',
      mustChangeCredentials: true,
      createdAt: Date.now(),
    };
    setUsers(prev => [...prev, newUser]);

    if (isSupabaseConfigured && supabase) {
      supabase.from('users').insert([newUser]).then();
    }

    logActivity('User account created:', `Created user ${newUser.username} as ${newUser.role}`);
  };

  const logout = () => {
    if (currentUser) {
      logActivity('User logout:', `${currentUser.name} signed out`);
    }
    setCurrentUser(null);
    localStorage.removeItem('valor_active_session');
    sessionStorage.removeItem('valor_active_session');
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
      assignedTo: leadData.assignedTo || (currentUser ? currentUser.username : 'swaroop'),
    };
    setLeads(prev => [newLead, ...prev]);
    logActivity('Created prospect:', newLead.company);

    if (isSupabaseConfigured && supabase) {
      supabase.from('leads').insert([newLead]).then();
    }
  };

  const addLeadsBatch = async (newLeadsData: Omit<Lead, 'id' | 'createdAt'>[]): Promise<Lead[]> => {
    const defaultRep = currentUser ? currentUser.username : 'swaroop';
    const newLeads: Lead[] = newLeadsData.map((l, idx) => ({
      ...l,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now() - (idx * 500),
      assignedTo: l.assignedTo || defaultRep,
    }));

    setLeads(prev => [...newLeads, ...prev]);
    logActivity('Batch Lead Scrape:', `Discovered & integrated ${newLeads.length} new prospects into pipeline`);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('leads').insert(newLeads);
      } catch (err) {
        console.error('Supabase batch insert error:', err);
      }
    }
    return newLeads;
  };

  const updateLeadStage = (id: string, stage: LeadStage) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        logActivity(`Moved deal to ${stage}:`, l.company);
        return { ...l, stage, lastContactedAt: Date.now() };
      }
      return l;
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('leads').update({ stage, lastContactedAt: Date.now() }).eq('id', id).then();
    }
  };

  const isSuperadmin = currentUser?.role === 'superadmin';

  const assignLead = (id: string, rep: string) => {
    // Superadmin can reassign to anyone, and any user can self-claim/assign to themselves when calling!
    if (!isSuperadmin && currentUser && currentUser.username.toLowerCase() !== rep.toLowerCase()) return;
    
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        logActivity(`Assigned prospect to ${rep}:`, l.company);
        return { ...l, assignedTo: rep };
      }
      return l;
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('leads').update({ assignedTo: rep }).eq('id', id).then();
    }
  };

  const recordCallOutcome = (
    leadId: string, 
    outcome: string, 
    notes?: string, 
    newStage?: LeadStage, 
    followUp?: string
  ) => {
    const caller = currentUser ? currentUser.username : 'swaroop';
    const callerName = currentUser ? currentUser.name : 'Sales Rep';
    const now = Date.now();

    const stageMap: Record<string, LeadStage> = {
      'interested': 'Meeting Scheduled',
      'demo': 'Meeting Scheduled',
      'callback': 'Contacted',
      'no-answer': 'Contacted',
      'rejected': 'Lost',
      'wrong-number': 'Lost',
    };

    const finalStage = newStage || stageMap[outcome] || 'Contacted';

    setLeads(prev => prev.map(l => {
      if (l.id === leadId) {
        const outcomeHeader = `[${new Date(now).toLocaleDateString()} ${callerName}] ${outcome.toUpperCase()}`;
        const newNoteEntry = notes ? `${outcomeHeader}: ${notes}` : outcomeHeader;
        const combinedNotes = l.notes ? `${newNoteEntry}\n${l.notes}` : newNoteEntry;

        const updated = {
          ...l,
          assignedTo: caller, // automatically claimed and assigned to caller!
          stage: finalStage,
          lastContactedAt: now,
          notes: combinedNotes,
          ...(followUp ? { nextFollowUp: followUp } : {})
        };
        logActivity(`Call Outcome (${outcome}):`, `${l.company} claimed & updated by ${callerName}`);
        return updated;
      }
      return l;
    }));

    if (isSupabaseConfigured && supabase) {
      const target = leads.find(l => l.id === leadId);
      const outcomeHeader = `[${new Date(now).toLocaleDateString()} ${callerName}] ${outcome.toUpperCase()}`;
      const newNoteEntry = notes ? `${outcomeHeader}: ${notes}` : outcomeHeader;
      const combinedNotes = target?.notes ? `${newNoteEntry}\n${target.notes}` : newNoteEntry;

      supabase.from('leads').update({
        assignedTo: caller,
        stage: finalStage,
        lastContactedAt: now,
        notes: combinedNotes,
        ...(followUp ? { nextFollowUp: followUp } : {})
      }).eq('id', leadId).then();
    }
  };

  const deleteLead = (id: string) => {
    if (!isSuperadmin) return; // Only superadmin can permanently delete leads
    const target = leads.find(l => l.id === id);
    setLeads(prev => prev.filter(l => l.id !== id));
    logActivity('Deleted prospect:', target ? target.company : id);

    if (isSupabaseConfigured && supabase) {
      supabase.from('leads').delete().eq('id', id).then();
    }
  };

  const updateLeadNotes = (id: string, notes: string, nextFollowUp?: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        const updated = { 
          ...l, 
          notes, 
          ...(nextFollowUp ? { nextFollowUp } : {}),
          lastContactedAt: Date.now() 
        };
        logActivity('Updated call note:', l.company);
        return updated;
      }
      return l;
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('leads').update({
        notes,
        ...(nextFollowUp ? { nextFollowUp } : {}),
        lastContactedAt: Date.now()
      }).eq('id', id).then();
    }
  };

  const updateLead = (id: string, updates: Partial<Lead>) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        const updated = { ...l, ...updates };
        logActivity('Updated prospect details:', updated.company);
        return updated;
      }
      return l;
    }));

    if (isSupabaseConfigured && supabase) {
      supabase.from('leads').update(updates).eq('id', id).then();
    }
  };

  const addCompany = (companyData: Omit<Company, 'id'>) => {
    const newCompany: Company = { ...companyData, id: Math.random().toString(36).substr(2, 9) };
    setCompanies(prev => [newCompany, ...prev]);
    logActivity('Added organization:', companyData.name);

    if (isSupabaseConfigured && supabase) {
      supabase.from('companies').insert([newCompany]).then();
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = { ...taskData, id: Math.random().toString(36).substr(2, 9), completed: false };
    setTasks(prev => [newTask, ...prev]);
    logActivity('Added action item:', taskData.title);

    if (isSupabaseConfigured && supabase) {
      supabase.from('tasks').insert([newTask]).then();
    }
  };

  const toggleTask = (id: string) => {
    let nextCompleted = false;
    let taskTitle = '';
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        nextCompleted = !t.completed;
        taskTitle = t.title;
        return { ...t, completed: nextCompleted };
      }
      return t;
    }));

    if (taskTitle) {
      logActivity(nextCompleted ? 'Completed task:' : 'Reopened task:', taskTitle);
    }

    if (isSupabaseConfigured && supabase) {
      supabase.from('tasks').update({ completed: nextCompleted }).eq('id', id).then();
    }
  };

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    const newEvent: Event = { ...eventData, id: Math.random().toString(36).substr(2, 9) };
    setEvents(prev => [newEvent, ...prev]);
    logActivity('Scheduled event:', eventData.title);

    if (isSupabaseConfigured && supabase) {
      supabase.from('events').insert([newEvent]).then();
    }
  };

  const hasContactInfo = (l: Lead) => Boolean((l.phone && l.phone !== 'N/A') || (l.website && l.website !== '') || (l.email && l.email !== ''));
  const validLeads = leads.filter(hasContactInfo);
  const incompleteLeads = leads.filter(l => !hasContactInfo(l));

  // Role-Scoped Leads:
  // Superadmin sees all 800+ leads across the company.
  // Regular Sales Reps strictly see leads assigned to them.
  const scopedLeads = useMemo(() => {
    if (!currentUser) return [];
    if (isSuperadmin) return validLeads;
    return validLeads.filter(l => (l.assignedTo || 'swaroop').toLowerCase() === currentUser.username.toLowerCase());
  }, [validLeads, currentUser, isSuperadmin]);

  const teamMembers = users.map(u => ({
    id: u.username,
    name: u.name,
    role: u.role === 'superadmin' ? 'Superadmin / Sales Director' : 'Sales Representative',
    avatar: u.avatar,
    status: (u.status === 'active' ? 'active' : 'offline') as 'active' | 'away' | 'offline',
  }));

  return (
    <StoreContext.Provider value={{
      users,
      currentUser,
      isSuperadmin,
      login,
      switchUser,
      verifyFirstFactor,
      verifySecondFactorPin,
      updateCredentials,
      createUser,
      logout,
      teamMembers,
      leads: scopedLeads,
      allLeads: validLeads,
      incompleteLeads,
      addLead,
      addLeadsBatch,
      updateLeadStage,
      assignLead,
      recordCallOutcome,
      updateLead,
      updateLeadNotes,
      deleteLead,
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
      isCloudSynced,
      isLoadingCloud,
      refreshData: fetchAllData,
    }}>
      {children}
    </StoreContext.Provider>
  );
};
