import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {activePage === 'Dashboard' ? (
        <Dashboard />
      ) : (
        <Devices />
      )}
    </Layout>
  );
}

export default App;