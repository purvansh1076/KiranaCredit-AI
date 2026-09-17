import React from 'react';

interface BadgeProps {
  variant?: 'emerald' | 'neutral' | 'warning' | 'danger';
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'emerald',
  icon,
  children,
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`.trim()}>
      {icon && <span className="badge-icon">{icon}</span>}
      {children}
    </span>
  );
};
