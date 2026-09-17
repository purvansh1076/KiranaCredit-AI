import React from 'react';
import { Store, ArrowRight, Home } from 'lucide-react';
import { NavProps } from '../../types/navigation';
import { Button } from '../ui/Button';

export const Navbar: React.FC<NavProps> = ({ currentView, onNavigate }) => {
  return (
    <header className="header-nav">
      <div className="container header-container">
        <button
          type="button"
          onClick={() => onNavigate('landing')}
          className="brand-group"
          style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left' }}
        >
          <div className="brand-logo-icon">
            <Store size={20} strokeWidth={2.2} />
          </div>
          <div className="brand-name">
            KiranaCredit <span className="badge-ai">AI</span>
          </div>
        </button>

        <div className="nav-actions">
          {currentView === 'landing' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('demo')}
              icon={<ArrowRight size={16} />}
            >
              Launch Demo
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onNavigate('landing')}
              icon={<Home size={16} />}
            >
              Back to Overview
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
