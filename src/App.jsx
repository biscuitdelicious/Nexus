import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { Box, CircularProgress, CssBaseline } from '@mui/material';
import glassTheme from './theme';
import Layout from './components/Layout';
import Login from './pages/Login.jsx';
import ChatPopup from './components/ChatPopup';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { getChatApiBaseUrl } from './services/chatApi';
import { setToken, clearAuth, setStoredUser, getCurrentUser } from './services/auth';
import { useUrlState } from './hooks/useUrlState';

// Lazy-load pages so the heavy chart bundle (recharts) isn't in the initial
// payload — each route's code is fetched on first visit.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Devices = lazy(() => import('./pages/Devices'));
const Observability = lazy(() => import('./pages/Observability'));
const Tickets = lazy(() => import('./pages/Tickets.jsx'));
const NocWall = lazy(() => import('./pages/NocWall.jsx'));
const Chatbot = lazy(() => import('./pages/Chatbot.jsx'));
const Discussions = lazy(() => import('./pages/Discussions.jsx'));

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
    <CircularProgress sx={{ color: '#D4FF00' }} />
  </Box>
);

const VALID_PAGES = new Set([
  'Dashboard', 'Devices', 'Observability', 'Tickets', 'NOC Wall', 'Chatbot', 'Discussions', 'Login'
]);

const PAGE_SCOPED_PARAMS = ['incident', 'chart_range'];

function App() {
  const [params, patchParams] = useUrlState();
  const [user, setUser] = useState(() => getCurrentUser());
  const isAuthed = !!user;
  const activePage = VALID_PAGES.has(params.page) ? params.page : 'Dashboard';
 
  const setActivePage = (page) => {
    const reset = Object.fromEntries(PAGE_SCOPED_PARAMS.map((k) => [k, undefined]));
    patchParams({ page, ...reset });
  };

  const handleLogin = (userData) => {
    setStoredUser(userData);
    if (userData?.token) setToken(userData.token);
    setUser(userData);
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
  };

  // Any API call that returns 401 dispatches this; bounce back to login.
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener('nexus:unauthorized', onUnauthorized);
    return () => window.removeEventListener('nexus:unauthorized', onUnauthorized);
  }, []);

  if (!isAuthed) {
    return (
      <ThemeProvider theme={glassTheme}>
        <CssBaseline />
        <Login onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  const page = (() => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'Devices':
        return <Devices />;
      case 'Observability':
        return <Observability />;
      case 'Tickets':
        return <Tickets />;
      case 'NOC Wall':
        return <NocWall setActivePage={setActivePage} />;
      case 'Chatbot':
        return <Chatbot />;
      case 'Discussions':
        return <Discussions />;
      case 'Login':
        return <Login />;
      default:
        return <Dashboard />;
    }
  })();

  return (
    <ThemeProvider theme={glassTheme}>
      <CssBaseline />
      <Layout activePage={activePage} setActivePage={setActivePage} onLogout={handleLogout} user={user}>
        <ErrorBoundary scope={activePage} key={activePage}>
          <Suspense fallback={<PageLoader />}>
            {page}
          </Suspense>
        </ErrorBoundary>
      </Layout>
      {activePage !== 'Chatbot' && (
        <ChatPopup
          apiBaseUrl={getChatApiBaseUrl()}
          onExpand={() => setActivePage('Chatbot')}
        />
      )}
    </ThemeProvider>
  );
}

export default App;
