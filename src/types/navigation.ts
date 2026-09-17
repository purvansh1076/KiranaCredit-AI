export type AppView = 'landing' | 'demo';

export type DashboardTab =
  | 'overview'
  | 'financial-health'
  | 'loan-simulator'
  | 'credit-builder';

export interface NavProps {
  currentView: AppView;
  currentTab?: DashboardTab;
  onNavigate: (view: AppView) => void;
  onTabChange?: (tab: DashboardTab) => void;
}
