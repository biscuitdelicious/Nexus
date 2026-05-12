import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import glassTheme from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Observability from './pages/Observability';
import Tickets from "./pages/Tickets.jsx";
import NocWall from './pages/NocWall.jsx';
import Chatbot from './pages/Chatbot.jsx';
import Discussions from './pages/Discussions.jsx';
import Login from './pages/Login.jsx';
import ChatPopup from './components/ChatPopup';
import { getChatApiBaseUrl } from './services/chatApi';
import { useUrlState } from './hooks/useUrlState';

const VALID_PAGES = new Set([
  'Dashboard', 'Devices', 'Observability', 'Tickets', 'NOC Wall', 'Chatbot', 'Discussions', 'Login'
]);

const PAGE_SCOPED_PARAMS = ['incident', 'chart_range'];

function App() {
  const [params, patchParams] = useUrlState();
  const activePage = VALID_PAGES.has(params.page) ? params.page : 'Dashboard';

  const setActivePage = (page) => {
    const reset = Object.fromEntries(PAGE_SCOPED_PARAMS.map((k) => [k, undefined]));
    patchParams({ page, ...reset });
  };

  const page = (() => {
    switch (activePage) {
      case 'Dashboard':
        return <Dashboard />;
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
      <Layout activePage={activePage} setActivePage={setActivePage}>
        {page}
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
