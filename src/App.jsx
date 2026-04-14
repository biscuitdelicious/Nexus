import React, { useState } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import glassTheme from './theme';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import Observability from './pages/Observability';

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
      default:
        return <Dashboard />;
    }
  })();

  return (
    <ThemeProvider theme={glassTheme}>
      <Layout activePage={activePage} setActivePage={setActivePage}>
        {page}
      </Layout>
    </ThemeProvider>
  );
}

export default App;