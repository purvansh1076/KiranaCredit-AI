import React from 'react';
import { FactorBreakdown } from '../../services/creditScoring';

interface FactorBarProps {
  factor: FactorBreakdown;
  isHighest?: boolean;
  isLowest?: boolean;
  className?: string;
}

export const FactorBar: React.FC<FactorBarProps> = ({
  factor,
  isHighest = false,
  isLowest = false,
  className = '',
}) => {
  const percentageScore = Math.round(factor.normalizedScore * 100);
  const weightPercent = Math.round(factor.weight * 100);

  const getBarColor = () => {
    if (percentageScore >= 70) return 'var(--status-success)';
    if (percentageScore >= 45) return 'var(--status-warning)';
    return 'var(--status-danger)';
  };

  return (
    <div className={`factor-bar-item ${className}`.trim()}>
      <div className="factor-bar-header">
        <div className="factor-title-group">
          <span className="factor-name">{factor.name}</span>
          <span className="factor-weight-tag">{weightPercent}% weight</span>
          {isHighest && <span className="factor-tag-highest">Top Contributor</span>}
          {isLowest && <span className="factor-tag-lowest">Limiting Factor</span>}
        </div>

        <div className="factor-score-display">
          <span className="factor-score-val font-mono">{percentageScore} / 100</span>
          <span className="factor-points-tag font-mono">+{factor.weightedContribution} pts</span>
        </div>
      </div>

      {/* Accessible Progress Bar */}
      <div
        className="factor-track"
        role="progressbar"
        aria-valuenow={percentageScore}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${factor.name} Score: ${percentageScore} out of 100`}
      >
        <div
          className="factor-fill"
          style={{
            width: `${percentageScore}%`,
            backgroundColor: getBarColor(),
          }}
        />
      </div>

      <p className="factor-explanation-text">{factor.explanation}</p>
    </div>
  );
};
