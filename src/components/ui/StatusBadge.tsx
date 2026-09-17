import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  showIcon = true,
  className = '',
}) => {
  // Infer variant from common status text if not explicitly provided
  let computedVariant = variant;
  if (!computedVariant) {
    const s = status.toLowerCase();
    if (s.includes('healthy') || s.includes('strong') || s.includes('affordable') || s.includes('ready')) {
      computedVariant = 'success';
    } else if (s.includes('moderate') || s.includes('building') || s.includes('strengthening')) {
      computedVariant = 'warning';
    } else if (s.includes('pressure') || s.includes('not affordable') || s.includes('risk') || s.includes('needs improvement')) {
      computedVariant = 'danger';
    } else {
      computedVariant = 'neutral';
    }
  }

  const renderIcon = () => {
    switch (computedVariant) {
      case 'success':
        return <CheckCircle2 size={12} />;
      case 'warning':
        return <AlertTriangle size={12} />;
      case 'danger':
        return <AlertCircle size={12} />;
      case 'info':
      case 'neutral':
      default:
        return <Info size={12} />;
    }
  };

  return (
    <span className={`badge badge-${computedVariant} ${className}`.trim()}>
      {showIcon && renderIcon()}
      <span>{status}</span>
    </span>
  );
};
