import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './lib/store';
import Preloader from './components/Preloader/Preloader';

// Layouts
import AppLayout from './layouts/AppLayout';

// Features
import { Login } from './features/Auth/Login';
import { DashboardCharts as Dashboard } from './features/Dashboard/Dashboard';
import { LeadsPage as Leads } from './features/Leads/Leads';
import { IncompleteLeadsPage as IncompleteLeads } from './features/Leads/IncompleteLeads';
import { CompaniesPage as Companies } from './features/Companies/Companies';
import { Calendar } from './features/Calendar/Calendar';
import { Tasks } from './features/Tasks/Tasks';
import { Documents } from './features/Documents/Documents';
import { Analytics } from './features/Analytics/Analytics';
import { Settings } from './features/Settings/Settings';
import { EasyContact } from './features/EasyContact/EasyContact';
import { ProcessedLeads } from './features/ProcessedLeads/ProcessedLeads';

function MainRouter() {
  const { currentUser } = useStore();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<Leads />} />
          <Route path="incomplete-leads" element={<IncompleteLeads />} />
          <Route path="companies" element={<Companies />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="documents" element={<Documents />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="easy-contact" element={<EasyContact />} />
          <Route path="processed-leads" element={<ProcessedLeads />} />
          {/* Catch-all redirect to dashboard */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  return (
    <StoreProvider>
      {loading && <Preloader onComplete={() => setLoading(false)} />}
      <div style={{ opacity: loading ? 0 : 1, transition: 'opacity 0.5s ease', height: '100vh', overflow: 'hidden' }}>
        <MainRouter />
      </div>
    </StoreProvider>
  );
}

export default App;
