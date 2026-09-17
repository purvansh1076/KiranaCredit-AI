import React from 'react';
import { DashboardTab, AppView } from '../../types/navigation';
import { TopNavigation } from './TopNavigation';
import { Footer } from './Footer';

interface AppShellProps {
  currentTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onNavigate: (view: AppView) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onTabChange,
  onNavigate,
  children,
}) => {
  return (
    <div className="app-shell-root">
      {/* Top prototype disclaimer notice */}
      <aside aria-label="Prototype Notice" className="disclaimer-banner">
        <span className="disclaimer-tag">Hackathon Prototype</span>
        <span>FT-03: Alternative Credit Assessment • Powered entirely by synthetic MSME datasets.</span>
      </aside>

      {/* Main responsive top navigation */}
      <TopNavigation
        currentTab={currentTab}
        onTabChange={onTabChange}
        onNavigate={onNavigate}
      />

      {/* Dashboard Main Workspace */}
      <main className="dashboard-content-area container" id="dashboard-main-content">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
