import React, { useState } from 'react';
import {
  Zap,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle2,
  HelpCircle,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { DashboardTab } from '../../types/navigation';
import { ActionPriority } from '../../types/creditBuilder';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { DemoDataBadge } from '../../components/ui/DemoDataBadge';
import { Button } from '../../components/ui/Button';

interface CreditBuilderPageProps {
  onNavigateTab?: (tab: DashboardTab) => void;
}

export const CreditBuilderPage: React.FC<CreditBuilderPageProps> = ({ onNavigateTab }) => {
  const { creditRoadmap, activeOption } = useMerchant();
  const { readinessSummary, progress, nextBestActions, allActions, benchmarkContext } =
    creditRoadmap;

  // Track expanded state for action cards
  const [expandedActionIds, setExpandedActionIds] = useState<Record<string, boolean>>({
    [nextBestActions[0]?.id || '']: true, // Expand first action by default for instant affordance
  });

  const toggleActionExpand = (id: string) => {
    setExpandedActionIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getPriorityBadgeVariant = (priority: ActionPriority): 'danger' | 'warning' | 'neutral' => {
    switch (priority) {
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
      default:
        return 'neutral';
    }
  };

  const getPriorityIcon = (priority: ActionPriority) => {
    switch (priority) {
      case 'HIGH':
        return <AlertCircle size={14} color="var(--status-danger)" />;
      case 'MEDIUM':
        return <TrendingUp size={14} color="var(--status-warning)" />;
      case 'LOW':
      default:
        return <CheckCircle2 size={14} color="var(--status-success)" />;
    }
  };

  return (
    <div className="dashboard-page credit-builder-page">
      {/* Page Header */}
      <PageHeader
        title="Credit Builder"
        subtitle="Improve the financial signals that matter for future credit access."
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <DemoDataBadge />
            <StatusBadge
              status={readinessSummary.label}
              variant={readinessSummary.stage === 'CREDIT_READY' ? 'success' : 'warning'}
            />
          </div>
        }
      />

      {/* 1. Readiness & Progress Hero Section */}
      <section className="builder-hero-grid">
        {/* Readiness Diagnostic Card */}
        <Card className="readiness-diagnostic-card">
          <div className="diagnostic-header-row">
            <div>
              <span className="builder-meta-label">Credit Readiness Diagnostic</span>
              <h2 className="diagnostic-stage-title">{readinessSummary.label}</h2>
            </div>
            <span className="stage-code-badge font-mono">{readinessSummary.stage}</span>
          </div>

          <div className="limiting-factor-callout">
            <span className="limiting-label">Primary Limiting Factor:</span>
            <span className="limiting-value font-mono">{readinessSummary.keyLimitingFactor}</span>
          </div>

          <p className="diagnostic-description">{readinessSummary.description}</p>

          <div className="merchant-context-hint">
            <InfoIcon />
            <span>
              Diagnostic customized for <strong>{activeOption.name}</strong> based on recorded cash-flow and trade continuity activity.
            </span>
          </div>
        </Card>

        {/* Progress Tracker Card */}
        <Card className="builder-progress-card">
          <div className="progress-header-row">
            <div>
              <span className="builder-meta-label">Readiness Progress</span>
              <h3 className="progress-card-title">Overall Roadmap Status</h3>
            </div>
            <div className="progress-percentage-display font-mono">
              {progress.overallProgressPercentage}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar-container">
            <div
              className="progress-bar-track"
              role="progressbar"
              aria-label="Overall credit readiness progress"
              aria-valuenow={progress.overallProgressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-bar-fill"
                style={{ width: `${Math.max(4, progress.overallProgressPercentage)}%` }}
              />
            </div>
            <div className="progress-subtext-row">
              <span className="completed-actions-count">
                <strong>{progress.completedActions}</strong> of <strong>{progress.totalActions}</strong> actions completed
              </span>
              <span className="baseline-badge">Baseline Evaluation</span>
            </div>
          </div>

          {/* Action Priority Counter Badges */}
          <div className="priority-counts-grid">
            <div className="priority-count-item high">
              <span className="p-count-num font-mono">{progress.highPriorityCount}</span>
              <span className="p-count-label">High Priority</span>
            </div>
            <div className="priority-count-item medium">
              <span className="p-count-num font-mono">{progress.mediumPriorityCount}</span>
              <span className="p-count-label">Medium Priority</span>
            </div>
            <div className="priority-count-item low">
              <span className="p-count-num font-mono">{progress.lowPriorityCount}</span>
              <span className="p-count-label">Maintained / Healthy</span>
            </div>
          </div>
        </Card>
      </section>

      {/* 2. Top 3 Next Best Actions (Hero Feature) */}
      <section className="next-best-actions-section">
        <SectionHeader
          title="Next Best Actions"
          description="Focus on the actions most likely to strengthen your financial profile and unlock modeled credit capacity."
          badge={
            <span className="nba-badge">
              <Zap size={13} /> Top 3 Ranked Priorities
            </span>
          }
        />

        <div className="nba-cards-grid">
          {nextBestActions.map((action, idx) => {
            const isExpanded = !!expandedActionIds[action.id];
            return (
              <Card
                key={action.id}
                className={`nba-action-card priority-${action.priority.toLowerCase()} ${
                  isExpanded ? 'expanded' : ''
                }`}
              >
                {/* Card Top Header */}
                <div className="nba-card-top">
                  <div className="nba-rank-badge font-mono">
                    #{idx + 1} Recommendation
                  </div>
                  <div className="nba-priority-wrap">
                    {getPriorityIcon(action.priority)}
                    <StatusBadge
                      status={action.priority}
                      variant={getPriorityBadgeVariant(action.priority)}
                    />
                  </div>
                </div>

                {/* Category & Title */}
                <div className="nba-category-tag">
                  {action.category.replace(/_/g, ' ')}
                </div>
                <h3 className="nba-action-title">{action.title}</h3>
                <p className="nba-action-desc">{action.description}</p>

                {/* Current → Target → Benchmark Visualization */}
                <div className="nba-metric-pipeline">
                  <div className="pipeline-step current">
                    <span className="pipeline-label">Current</span>
                    <span className="pipeline-val font-mono">{action.displayCurrent}</span>
                  </div>
                  <div className="pipeline-arrow">
                    <ArrowRight size={14} />
                  </div>
                  <div className="pipeline-step target">
                    <span className="pipeline-label">Target Standard</span>
                    <span className="pipeline-val font-mono">{action.displayTarget}</span>
                  </div>
                  {action.displayBenchmark && (
                    <>
                      <div className="pipeline-arrow">
                        <ArrowRight size={14} />
                      </div>
                      <div className="pipeline-step benchmark">
                        <span className="pipeline-label">Reference Peer</span>
                        <span className="pipeline-val font-mono">{action.displayBenchmark}</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Potential Impact Callout */}
                <div className="nba-impact-banner">
                  <Sparkles size={14} color="var(--emerald-primary)" />
                  <span className="impact-text">{action.potentialImpact}</span>
                </div>

                {/* Expand / Collapse Toggle Button */}
                <button
                  type="button"
                  className="nba-expand-btn"
                  onClick={() => toggleActionExpand(action.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`action-details-${action.id}`}
                >
                  <span>{isExpanded ? 'Hide Evidence & Rationale' : 'View Evidence & Rationale'}</span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {/* Expanded Details Body */}
                {isExpanded && (
                  <div id={`action-details-${action.id}`} className="nba-expanded-body">
                    <div className="detail-block">
                      <span className="detail-heading">Underwriting Rationale</span>
                      <p className="detail-text">{action.rationale}</p>
                    </div>

                    <div className="detail-block evidence">
                      <span className="detail-heading">Empirical Evidence from Records</span>
                      <p className="detail-text font-mono">{action.evidence}</p>
                    </div>

                    <div className="action-status-row">
                      <span className="status-label">Implementation Status:</span>
                      <span className="status-val font-mono">
                        <Clock size={13} /> {action.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 3. Comprehensive Improvement Roadmap (All 7 Dimensions) */}
      <section className="all-actions-section">
        <SectionHeader
          title="Your Improvement Roadmap"
          description="Systematic diagnostic tracking across all 7 underwriting and operational dimensions."
          badge={
            <span className="nba-badge">
              <Layers size={13} /> 7 Financial Dimensions
            </span>
          }
        />

        <div className="roadmap-cards-stack">
          {allActions.map((item, index) => {
            const isExpanded = !!expandedActionIds[item.id];
            return (
              <Card
                key={item.id}
                className={`roadmap-row-card priority-${item.priority.toLowerCase()}`}
              >
                <div className="roadmap-row-main">
                  {/* Left: Index & Category */}
                  <div className="roadmap-index-col">
                    <span className="row-num font-mono">{index + 1}</span>
                  </div>

                  <div className="roadmap-content-col">
                    <div className="roadmap-top-meta">
                      <span className="roadmap-category-badge">
                        {item.category.replace(/_/g, ' ')}
                      </span>
                      <div className="roadmap-priority-badge-wrap">
                        {getPriorityIcon(item.priority)}
                        <StatusBadge
                          status={item.priority}
                          variant={getPriorityBadgeVariant(item.priority)}
                        />
                      </div>
                      <span className="roadmap-status-pill font-mono">
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <h4 className="roadmap-item-title">{item.title}</h4>
                    <p className="roadmap-item-desc">{item.description}</p>
                  </div>

                  {/* Middle: Metrics Pipeline */}
                  <div className="roadmap-metrics-col">
                    <div className="metric-chip">
                      <span className="m-chip-lbl">Current</span>
                      <span className="m-chip-val font-mono">{item.displayCurrent}</span>
                    </div>
                    <div className="metric-chip target">
                      <span className="m-chip-lbl">Target</span>
                      <span className="m-chip-val font-mono">{item.displayTarget}</span>
                    </div>
                    <div className="metric-chip benchmark">
                      <span className="m-chip-lbl">Benchmark</span>
                      <span className="m-chip-val font-mono">{item.displayBenchmark || '—'}</span>
                    </div>
                  </div>

                  {/* Right: Expand Button */}
                  <div className="roadmap-action-col">
                    <button
                      type="button"
                      className="roadmap-details-toggle"
                      onClick={() => toggleActionExpand(item.id)}
                      aria-expanded={isExpanded}
                      aria-label={`Toggle details for ${item.title}`}
                    >
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="roadmap-expanded-details">
                    <div className="roadmap-detail-grid">
                      <div className="detail-item">
                        <span className="detail-item-title">Diagnostic Evidence:</span>
                        <p className="detail-item-text font-mono">{item.evidence}</p>
                      </div>
                      <div className="detail-item">
                        <span className="detail-item-title">Underwriting Impact:</span>
                        <p className="detail-item-text">{item.rationale}</p>
                      </div>
                    </div>
                    <div className="roadmap-impact-footnote">
                      <Sparkles size={13} color="var(--emerald-primary)" />
                      <span>{item.potentialImpact}</span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* 4. Why Build Credit Readiness? (Educational Context) */}
      <section className="builder-educational-section">
        <Card className="builder-educational-card">
          <div className="educational-header">
            <div className="edu-icon-wrap">
              <HelpCircle size={22} color="var(--emerald-primary)" />
            </div>
            <div>
              <h3 className="edu-title">Why Build Credit Readiness?</h3>
              <p className="edu-subtitle">
                Understanding how everyday business actions translate into formal financial access
              </p>
            </div>
          </div>

          <div className="educational-grid">
            <div className="edu-point-card">
              <h4 className="point-title">Data-Driven Underwriting</h4>
              <p className="point-text">
                Traditional lenders require collateral or formal bureau history. KiranaCredit AI
                enables alternative underwriters to evaluate cash-flow velocity and consistency directly
                from trade entries and digital UPI transaction footprints.
              </p>
            </div>

            <div className="edu-point-card">
              <h4 className="point-title">Debt Service Protection</h4>
              <p className="point-text">
                Keeping monthly expenses aligned with revenue and reserving a 30% cash buffer prevents
                debt distress. A ₹0 modeled limit protects small retailers from taking loans they
                cannot service during seasonal slowdowns.
              </p>
            </div>

            <div className="edu-point-card">
              <h4 className="point-title">Long-Term Growth Pathway</h4>
              <p className="point-text">
                Achieving reference benchmarks signals disciplined operations. As operating cash
                surpluses stabilize, institutional underwriters can safely unlock customized working
                capital facilities with lower risk premiums.
              </p>
            </div>
          </div>

          <p className="educational-disclaimer">
            <strong>Regulatory Notice:</strong> {benchmarkContext.description} KiranaCredit AI does not guarantee loan sanctions, specific interest rates, or institutional approvals.
          </p>
        </Card>
      </section>

      {/* 5. Connect to Loan Simulator CTA Bridge */}
      <section className="builder-simulator-bridge-section">
        <Card className="builder-bridge-card">
          <div className="bridge-layout">
            <div className="bridge-text-col">
              <span className="bridge-tag font-mono">
                <ArrowUpRight size={13} /> Financial Scenario Testing
              </span>
              <h3 className="bridge-title">See what your current profile can support</h3>
              <p className="bridge-description">
                Once you understand your key limiting factors, test how different ticket sizes, interest
                rates, and repayment tenures fit within your current modeled monthly cash surplus.
              </p>
            </div>
            <div className="bridge-btn-col">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRight size={16} />}
                onClick={() => onNavigateTab?.('loan-simulator')}
                className="bridge-action-btn"
              >
                Try Loan Simulator
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};

function InfoIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ flexShrink: 0, marginTop: '2px', color: 'var(--emerald-primary)' }}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}
