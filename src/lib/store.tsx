import React, { createContext, useContext, useState } from 'react';
import { initialLeads, initialCompanies, initialTasks, initialEvents, initialActivities } from './data';
export type LeadStage = 'New' | 'Contacted' | 'Qualified' | 'Meeting Scheduled' | 'Proposal Sent' | 'Negotiation' | 'Won' | 'Lost';
export type Priority = 'High' | 'Medium' | 'Low';

export type Lead = { id: string; company: string; contactPerson: string; phone: string; city: string; industry: string; stage: LeadStage; priority: Priority; value: number; nextFollowUp: string; createdAt: number; email?: string; website?: string; };
export type Company = { id: string; name: string; industry: string; employees: string; website: string; city: string; phone: string; email: string; lastContact: string; };
export type Task = { id: string; title: string; due: string; priority: Priority; completed: boolean; };
export type Event = { id: string; title: string; time: string; type: string; };
export type Activity = { id: string; time: string; action: string; target: string; user: string; };

export type SelectedItem = { type: 'lead' | 'company' | 'task', id: string } | null;

type StoreContextType = {
  leads: Lead[]; 
  incompleteLeads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void; 
  updateLeadStage: (id: string, stage: LeadStage) => void;
  companies: Company[]; addCompany: (company: Omit<Company, 'id'>) => void;
  tasks: Task[]; addTask: (task: Omit<Task, 'id' | 'completed'>) => void; toggleTask: (id: string) => void;
  events: Event[]; addEvent: (event: Omit<Event, 'id'>) => void;
  activities: Activity[];
  selectedItem: SelectedItem; setSelectedItem: (item: SelectedItem) => void;
  currentUser: string | null; login: (u: string, p: string, remember?: boolean) => boolean; logout: () => void;
};

const StoreContext = createContext<StoreContextType | null>(null);

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
};

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
  
  // Initialize from localStorage or sessionStorage
  const [currentUser, setCurrentUser] = useState<string | null>(localStorage.getItem('valor_user') || sessionStorage.getItem('valor_user'));

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

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...leadData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: Date.now(),
    };
    setLeads(prev => [newLead, ...prev]);
    setActivities(prev => [{ id: Math.random().toString(36).substr(2, 9), time: 'Just now', action: 'Lead created:', target: newLead.company, user: currentUser || 'System' }, ...prev]);
  };

  const updateLeadStage = (id: string, stage: LeadStage) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage } : l));
  };

  const addCompany = (companyData: Omit<Company, 'id'>) => {
    setCompanies(prev => [{ ...companyData, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
    setActivities(prev => [{ id: Math.random().toString(36).substr(2, 9), time: 'Just now', action: 'Company added:', target: companyData.name, user: currentUser || 'System' }, ...prev]);
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

  const validLeads = leads.filter(l => l.phone && l.phone !== 'N/A' && l.website && l.website !== '');
  const incompleteLeads = leads.filter(l => !l.phone || l.phone === 'N/A' || !l.website || l.website === '');

  return (
    <StoreContext.Provider value={{ 
      leads: validLeads, incompleteLeads, addLead, updateLeadStage, 
      companies, addCompany,
      tasks, addTask, toggleTask,
      events, addEvent,
      activities,
      selectedItem, setSelectedItem,
      currentUser, login, logout
    }}>
      {children}
    </StoreContext.Provider>
  );
};
