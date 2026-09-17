import React from 'react';

interface BenchmarkMetricProps {
  label: string;
  currentDisplay: string;
  referenceDisplay: string;
  statusText: string;
  statusVariant?: 'success' | 'warning' | 'neutral';
  description?: string;
  className?: string;
}

export const BenchmarkMetric: React.FC<BenchmarkMetricProps> = ({
  label,
  currentDisplay,
  referenceDisplay,
  statusText,
  statusVariant = 'neutral',
  description,
  className = '',
}) => {
  return (
    <div className={`benchmark-metric-box ${className}`.trim()}>
      <div className="benchmark-header-row">
        <span className="benchmark-label">{label}</span>
        <span className={`benchmark-status-badge ${statusVariant}`}>{statusText}</span>
      </div>

      <div className="benchmark-values-row">
        <div className="val-block current">
          <span className="val-tag">Current Profile</span>
          <span className="val-number font-mono">{currentDisplay}</span>
        </div>

        <div className="benchmark-vs-divider">vs</div>

        <div className="val-block reference">
          <span className="val-tag">Reference Profile</span>
          <span className="val-number font-mono">{referenceDisplay}</span>
        </div>
      </div>

      {description && <p className="benchmark-desc-text">{description}</p>}
    </div>
  );
};
