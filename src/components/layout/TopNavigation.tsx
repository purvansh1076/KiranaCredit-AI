import React, { useState } from 'react';
import {
  Store,
  LayoutDashboard,
  Activity,
  Calculator,
  TrendingUp,
  ArrowLeft,
  Menu,
  X,
} from 'lucide-react';
import { DashboardTab, AppView } from '../../types/navigation';
import { MerchantSelector } from '../ui/MerchantSelector';

interface TopNavigationProps {
  currentTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onNavigate: (view: AppView) => void;
}

interface NavItem {
  id: DashboardTab;
  label: string;
  icon: React.ReactNode;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onTabChange,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={17} /> },
    { id: 'financial-health', label: 'Financial Health', icon: <Activity size={17} /> },
    { id: 'loan-simulator', label: 'Loan Simulator', icon: <Calculator size={17} /> },
    { id: 'credit-builder', label: 'Credit Builder', icon: <TrendingUp size={17} /> },
  ];

  const handleTabClick = (tab: DashboardTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="dashboard-header">
      {/* Top utility row */}
      <div className="dashboard-nav-bar container">
        {/* Left: Brand */}
        <div className="nav-brand-section">
          <button
            type="button"
            onClick={() => onNavigate('landing')}
            className="brand-group"
            title="Return to Landing Overview"
          >
            <div className="brand-logo-icon">
              <Store size={18} strokeWidth={2.2} />
            </div>
            <div className="brand-name">
              KiranaCredit <span className="badge-ai">AI</span>
            </div>
          </button>
        </div>

        {/* Center: Desktop Navigation Tabs */}
        <nav className="desktop-tab-nav" aria-label="Main Dashboard Navigation">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`dashboard-tab-link ${isActive ? 'active' : ''}`}
                onClick={() => handleTabClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="tab-icon">{item.icon}</span>
                <span className="tab-label">{item.label}</span>
                {isActive && <span className="tab-active-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* Right: Merchant Context Selector & Exit CTA */}
        <div className="nav-right-section">
          <MerchantSelector />

          <button
            type="button"
            className="exit-demo-btn"
            onClick={() => onNavigate('landing')}
            title="Exit demo and return to landing page"
          >
            <ArrowLeft size={14} />
            <span className="exit-label">Exit Demo</span>
          </button>

          {/* Mobile hamburger toggle */}
          <button
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer container" role="navigation" aria-label="Mobile Navigation">
          <div className="mobile-nav-list">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => handleTabClick(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="tab-icon">{item.icon}</span>
                  <span className="tab-label">{item.label}</span>
                  {isActive && <span className="mobile-active-dot" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
