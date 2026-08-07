import React from 'react';
import { AppStateProvider, useAppState } from './context/AppStateContext';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import './App.css';

const AppContent: React.FC = () => {
  const { currentRole } = useAppState();

  return (
    <div className="w-full min-h-screen">
      {currentRole === null ? <LandingPage /> : <DashboardPage />}
    </div>
  );
};

function App() {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
}

export default App;
