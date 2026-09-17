import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="app-footer">
      <div className="container footer-content">
        <div>
          <strong>KiranaCredit AI</strong> — Alternative Credit Assessment Architecture for Indian MSMEs
        </div>
        <div className="footer-note">
          Hackathon Problem Statement FT-03: Micro-lending platform with alternative credit assessment mechanisms.
        </div>
        <div className="footer-note" style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
          Disclaimer: This is a hackathon prototype demonstrating algorithmic cash-flow underwriting using synthetic data.
          It does not connect to live banking networks or credit bureaus.
        </div>
      </div>
    </footer>
  );
};
