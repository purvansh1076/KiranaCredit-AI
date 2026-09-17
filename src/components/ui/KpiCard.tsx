import React from 'react';
import { Card } from './Card';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: 'default' | 'positive' | 'warning' | 'danger';
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  icon,
  variant = 'default',
  className = '',
}) => {
  return (
    <Card className={`kpi-card kpi-card-${variant} ${className}`.trim()}>
      <div className="kpi-card-header">
        <span className="kpi-card-title">{title}</span>
        {icon && <div className="kpi-card-icon">{icon}</div>}
      </div>

      <div className="kpi-card-value-row">
        <span className="kpi-card-value">{value}</span>
        {badge}
      </div>

      {subtitle && <p className="kpi-card-subtitle">{subtitle}</p>}
    </Card>
  );
};
