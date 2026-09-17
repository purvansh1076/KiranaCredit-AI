import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  riskBand?: string;
  className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 160,
  strokeWidth = 10,
  riskBand,
  className = '',
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // SVG calculations
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  // Semantic color based on score threshold
  const getColor = () => {
    if (clampedScore >= 75) return 'var(--status-success)';
    if (clampedScore >= 60) return '#34d399'; // Emerald-light
    if (clampedScore >= 40) return 'var(--status-warning)'; // Amber
    return 'var(--status-danger)'; // Rose/Red
  };

  const ringColor = getColor();

  return (
    <div
      className={`score-ring-container ${className}`.trim()}
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Financial Health Score: ${clampedScore} out of 100${riskBand ? `, ${riskBand}` : ''}`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="score-ring-svg"
      >
        {/* Background Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
        />

        {/* Progress Arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          className="score-ring-progress"
          style={{
            transition: 'stroke-dashoffset 600ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>

      {/* Center Score Label */}
      <div className="score-ring-content">
        <span className="score-ring-number font-mono">{clampedScore}</span>
        <span className="score-ring-denom">/ 100</span>
      </div>
    </div>
  );
};
