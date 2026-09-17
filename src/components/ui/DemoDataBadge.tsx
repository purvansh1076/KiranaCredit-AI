import React from 'react';
import { Database } from 'lucide-react';

interface DemoDataBadgeProps {
  location?: string;
  className?: string;
}

export const DemoDataBadge: React.FC<DemoDataBadgeProps> = ({
  location = 'Nagpur, MH',
  className = '',
}) => {
  return (
    <div
      className={`demo-data-badge ${className}`.trim()}
      title="This profile uses synthetic transaction data generated for hackathon alternative credit assessment."
    >
      <Database size={12} strokeWidth={2.2} />
      <span>Synthetic MSME Dataset</span>
      <span className="divider">•</span>
      <span className="location">{location}</span>
    </div>
  );
};
