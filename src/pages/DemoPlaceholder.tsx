import React from 'react';
import { Layers, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

interface DemoPlaceholderProps {
  onBack: () => void;
}

export const DemoPlaceholder: React.FC<DemoPlaceholderProps> = ({ onBack }) => {
  const roadmapSteps = [
    { step: '01', title: 'Landing & Problem Context', status: 'ready', phase: 'Phase 1' },
    { step: '02', title: 'Merchant Profile (Ramesh Kirana)', status: 'queued', phase: 'Phase 2' },
    { step: '03', title: 'Cash Flow & Transaction Data', status: 'queued', phase: 'Phase 2' },
    { step: '04', title: 'Financial Calculation Engine', status: 'queued', phase: 'Phase 3' },
    { step: '05', title: 'Financial Health Scorecard', status: 'queued', phase: 'Phase 4' },
    { step: '06', title: 'Explainable Factor Attribution', status: 'queued', phase: 'Phase 4' },
    { step: '07', title: 'Alternative Credit Limit Sizing', status: 'queued', phase: 'Phase 4' },
    { step: '08', title: 'Dynamic What-If Loan Simulator', status: 'queued', phase: 'Phase 5' },
    { step: '09', title: 'Actionable Credit Builder Roadmap', status: 'queued', phase: 'Phase 6' },
  ];

  return (
    <div className="container" style={{ padding: '3.5rem 1.5rem', maxWidth: '900px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Button variant="ghost" size="sm" onClick={onBack} icon={<ArrowLeft size={16} />}>
          Back to Overview
        </Button>
      </div>

      <Card style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="brand-logo-icon" style={{ width: '40px', height: '40px' }}>
              <Layers size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Demo Workspace Foundation</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Application container initialized and verified.
              </p>
            </div>
          </div>
          <Badge variant="emerald">Phase 1 Complete</Badge>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          border: '1px solid var(--border-subtle)',
          marginBottom: '1.75rem'
        }}>
          <h3 style={{ fontSize: '0.9375rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
            Architecture Integrity Status
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
            The frontend shell, responsive layout, typography, and styling tokens are established.
            Per architectural guidelines, no dummy metrics or fake calculation logic have been introduced.
            The workspace is prepared for Phase 2: Synthetic Data Engine and MSME profile models.
          </p>
        </div>

        <h3 style={{ fontSize: '1.125rem', marginBottom: '1rem' }}>Implementation Roadmap Alignment</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {roadmapSteps.map((item) => (
            <div
              key={item.step}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                backgroundColor: item.status === 'ready' ? 'var(--bg-tertiary)' : 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  color: item.status === 'ready' ? 'var(--emerald-primary)' : 'var(--text-tertiary)',
                  fontWeight: 600
                }}>
                  {item.step}
                </span>
                <span style={{ fontWeight: item.status === 'ready' ? 600 : 400 }}>
                  {item.title}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                  {item.phase}
                </span>
                {item.status === 'ready' ? (
                  <Badge variant="emerald" icon={<CheckCircle2 size={12} />}>
                    Active
                  </Badge>
                ) : (
                  <Badge variant="neutral" icon={<Clock size={12} />}>
                    Scheduled
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
