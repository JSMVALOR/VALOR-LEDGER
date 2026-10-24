import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider, useStore } from './lib/store';

// Layouts
import AppLayout from './layouts/AppLayout';

// Core Clean Leads Page (No reps, pure high-clarity leads workspace)
import { CleanLeadsPage } from './features/Leads/CleanLeadsPage';
import { Login } from './features/Auth/Login';

// Secondary Features (code-split)
const TodayDashboard = lazy(() => import('./features/Dashboard/Dashboard'));
const LeadScraper = lazy(() => import('./features/Scraper/LeadScraper').then(m => ({ default: m.LeadScraper })));
const Settings = lazy(() => import('./features/Settings/Settings').then(m => ({ default: m.Settings })));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-20 text-slate-400 text-xs font-semibold animate-pulse">
      Loading view...
    </div>
  );
}

function MainRouter() {
  const { currentUser } = useStore();

  if (!currentUser) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          {/* LEADS FIRST: Primary root index is the Clean Leads Page */}
          <Route index element={<CleanLeadsPage />} />
          <Route path="leads" element={<Navigate to="/" replace />} />
          
          <Route 
            path="today" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <TodayDashboard />
              </Suspense>
            } 
          />
          <Route 
            path="radar" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <LeadScraper />
              </Suspense>
            } 
          />
          <Route path="scraper" element={<Navigate to="/radar" replace />} />
          <Route 
            path="settings" 
            element={
              <Suspense fallback={<RouteFallback />}>
                <Settings />
              </Suspense>
            } 
          />

          {/* Clean Redirects */}
          <Route path="easy-contact" element={<Navigate to="/" replace />} />
          <Route path="companies" element={<Navigate to="/" replace />} />
          <Route path="tasks" element={<Navigate to="/today" replace />} />
          <Route path="calendar" element={<Navigate to="/today" replace />} />
          <Route path="incomplete-leads" element={<Navigate to="/" replace />} />
          <Route path="processed-leads" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainRouter />
    </StoreProvider>
  );
}
