import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialLeads, initialCompanies, initialTasks, initialEvents, initialActivities } from './data';
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

export const TEAM_MEMBERS = INITIAL_USERS.map(u => ({
  id: u.username,
  name: u.name,
  role: u.role === 'superadmin' ? 'Superadmin / Sales Director' : 'Sales Representative',
  avatar: u.avatar,
  status: u.status as 'active' | 'away' | 'offline',
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
  verifyFirstFactor: (username: string, pass: string) => UserAccount | null;
  verifySecondFactorPin: (user: UserAccount, pin: string, remember?: boolean) => boolean;
  updateCredentials: (userId: string, newPassword: string, newPin: string) => void;
  createUser: (userData: Omit<UserAccount, 'id' | 'createdAt' | 'status' | 'avatar'>) => void;
  logout: () => void;
  
  // Pipeline & Core Store
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
  isCloudSynced: boolean;
};

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};

const seedAssignedLeads = (rawLeads: Lead[]): Lead[] => {
  const reps = ['swaroop', 'vijay', 'nithish'];
  return rawLeads.map((l, idx) => ({
    ...l,
    assignedTo: l.assignedTo || reps[idx % reps.length],
    createdAt: l.createdAt || (Date.now() - (idx * 86400000)),
  }));
};

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  // Users state
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('valor_users_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return INITIAL_USERS;
  });

  // Current session user
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('valor_active_session') || sessionStorage.getItem('valor_active_session');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return null;
  });

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
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('valor_activity_audit');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* fallback */ }
    }
    return initialActivities.map(a => ({ ...a, timestamp: Date.now() }));
  });
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  const [isCloudSynced, setIsCloudSynced] = useState(isSupabaseConfigured);

  // Sync users
  useEffect(() => {
    localStorage.setItem('valor_users_v2', JSON.stringify(users));
  }, [users]);

  // Sync activities
  useEffect(() => {
    localStorage.setItem('valor_activity_audit', JSON.stringify(activities));
  }, [activities]);

  // Sync leads cache
  useEffect(() => {
    localStorage.setItem('valor_leads_cache', JSON.stringify(leads));
  }, [leads]);

  // Optional Supabase initial fetch
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    
    const fetchCloud = async () => {
      try {
        const client = supabase;
        if (!client) return;
        const { data, error } = await client.from('leads').select('*');
        if (!error && data && data.length > 0) {
          setLeads(data);
          setIsCloudSynced(true);
        }
      } catch (err) {
        console.warn('Supabase offline fallback:', err);
      }
    };
    fetchCloud();
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

  const assignLead = (id: string, rep: string) => {
    setLeads(prev => prev.map(l => {
      if (l.id === id) {
        logActivity(`Reassigned prospect to ${rep}:`, l.company);
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
    logActivity('Added organization:', companyData.name);
  };

  const addTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    setTasks(prev => [{ ...taskData, id: Math.random().toString(36).substr(2, 9), completed: false }, ...prev]);
    logActivity('Added action item:', taskData.title);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        logActivity(nextState ? 'Completed task:' : 'Reopened task:', t.title);
        return { ...t, completed: nextState };
      }
      return t;
    }));
  };

  const addEvent = (eventData: Omit<Event, 'id'>) => {
    setEvents(prev => [{ ...eventData, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
    logActivity('Scheduled event:', eventData.title);
  };

  const hasContactInfo = (l: Lead) => Boolean((l.phone && l.phone !== 'N/A') || (l.website && l.website !== '') || (l.email && l.email !== ''));
  const validLeads = leads.filter(hasContactInfo);
  const incompleteLeads = leads.filter(l => !hasContactInfo(l));

  return (
    <StoreContext.Provider value={{
      users,
      currentUser,
      verifyFirstFactor,
      verifySecondFactorPin,
      updateCredentials,
      createUser,
      logout,
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
      isCloudSynced,
    }}>
      {children}
    </StoreContext.Provider>
  );
};
