import React from 'react';
import { DemoDataBadge } from './DemoDataBadge';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  showMerchantContext?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  badge,
  actions,
  showMerchantContext = true,
}) => {
  return (
    <div className="page-header-container">
      <div className="page-header-main">
        <div className="page-title-row">
          <h1 className="page-title">{title}</h1>
          {badge}
        </div>
        <p className="page-subtitle">{subtitle}</p>
        {showMerchantContext && (
          <div className="page-header-meta">
            <DemoDataBadge />
          </div>
        )}
      </div>

      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  );
};
