import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { ExplanationSignal } from '../../services/creditScoring';

interface SignalCardProps {
  signal: ExplanationSignal;
  className?: string;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, className = '' }) => {
  const isPositive = signal.impact === 'positive';

  return (
    <div
      className={`signal-card ${isPositive ? 'signal-card-positive' : 'signal-card-risk'} ${className}`.trim()}
    >
      <div className="signal-card-header">
        <div className="signal-title-group">
          <div className="signal-icon-box">
            {isPositive ? (
              <CheckCircle2 size={16} color="var(--status-success)" />
            ) : (
              <AlertTriangle size={16} color="var(--status-danger)" />
            )}
          </div>
          <h4 className="signal-title-text">{signal.title}</h4>
        </div>

        <span className={`signal-type-pill ${isPositive ? 'positive' : 'risk'}`}>
          {isPositive ? 'Positive Signal' : 'Risk Factor'}
          {isPositive && <ArrowUpRight size={12} />}
        </span>
      </div>

      <p className="signal-body-text">{signal.explanation}</p>

      <div className="signal-evidence-box">
        <span className="evidence-tag">Evidence</span>
        <span className="evidence-content">{signal.evidence}</span>
      </div>
    </div>
  );
};
