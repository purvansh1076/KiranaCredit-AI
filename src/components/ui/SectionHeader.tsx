import React from 'react';

interface SectionHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  badge,
  action,
  className = '',
}) => {
  return (
    <div className={`section-header-block ${className}`.trim()}>
      <div className="section-header-text">
        <div className="section-title-row">
          <h2 className="section-block-title">{title}</h2>
          {badge}
        </div>
        {description && <p className="section-block-desc">{description}</p>}
      </div>
      {action && <div className="section-header-action">{action}</div>}
    </div>
  );
};
