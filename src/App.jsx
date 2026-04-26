import React, { useState } from 'react';
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
import ChatPopup from './components/ChatPopup';
import { getChatApiBaseUrl } from './services/chatApi';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');

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