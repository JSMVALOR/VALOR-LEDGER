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
import { Settings } from './features/Settings/Settings';

import { LeadScraper } from './features/Scraper/LeadScraper';

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
          <Route path="radar" element={<LeadScraper />} />
          <Route path="scraper" element={<Navigate to="/radar" replace />} />
          <Route path="settings" element={<Settings />} />
          <Route path="easy-contact" element={<Navigate to="/leads" replace />} />
          <Route path="companies" element={<Navigate to="/leads" replace />} />
          <Route path="tasks" element={<Navigate to="/" replace />} />
          <Route path="calendar" element={<Navigate to="/" replace />} />
          <Route path="incomplete-leads" element={<Navigate to="/leads" replace />} />
          <Route path="processed-leads" element={<Navigate to="/leads" replace />} />
          {/* Catch-all redirect to today */}
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
