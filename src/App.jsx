import React, { useState } from 'react';
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
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {page}
    </Layout>
  );
}

export default App;