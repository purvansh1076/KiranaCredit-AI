import React, { useState } from 'react';
import { AppView, DashboardTab } from './types/navigation';
import { MerchantProvider } from './context/MerchantContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { AppShell } from './components/layout/AppShell';
import { OverviewPage } from './pages/dashboard/OverviewPage';
import { FinancialHealthPage } from './pages/dashboard/FinancialHealthPage';
import { LoanSimulatorPage } from './pages/dashboard/LoanSimulatorPage';
import { CreditBuilderPage } from './pages/dashboard/CreditBuilderPage';

export const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [currentTab, setCurrentTab] = useState<DashboardTab>('overview');

  const handleLaunchDemo = () => {
    setCurrentView('demo');
    setCurrentTab('overview');
  };

  if (currentView === 'landing') {
    return (
      <div className="app-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar currentView={currentView} onNavigate={setCurrentView} />
        <main style={{ flex: 1 }}>
          <LandingPage onLaunchDemo={handleLaunchDemo} />
        </main>
        <Footer />
      </div>
    );
  }

  // Demo Product Experience Shell
  return (
    <AppShell
      currentTab={currentTab}
      onTabChange={setCurrentTab}
      onNavigate={setCurrentView}
    >
      {currentTab === 'overview' && <OverviewPage onNavigateTab={setCurrentTab} />}
      {currentTab === 'financial-health' && <FinancialHealthPage />}
      {currentTab === 'loan-simulator' && <LoanSimulatorPage onNavigateTab={setCurrentTab} />}
      {currentTab === 'credit-builder' && <CreditBuilderPage onNavigateTab={setCurrentTab} />}
    </AppShell>
  );
};

export const App: React.FC = () => {
  return (
    <MerchantProvider>
      <AppContent />
    </MerchantProvider>
  );
};

export default App;
