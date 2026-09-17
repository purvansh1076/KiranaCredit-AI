import React from 'react';
import {
  Activity,
  Wallet,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Store,
  Zap,
  Receipt,
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { DashboardTab } from '../../types/navigation';
import { KpiCard } from '../../components/ui/KpiCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DemoDataBadge } from '../../components/ui/DemoDataBadge';
import { formatIndianCurrency } from '../../utils/formatters';

interface OverviewPageProps {
  onNavigateTab: (tab: DashboardTab) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ onNavigateTab }) => {
  const {
    merchantProfile,
    financialAnalysis,
    creditAssessment,
    creditRoadmap,
  } = useMerchant();

  const firstName = merchantProfile.name.split(' ')[0] || 'Merchant';
  const score = creditAssessment.overallScore;
  const cashSurplus = financialAnalysis.cashSurplus;
  const avgMonthlyRevenue = Math.round(financialAnalysis.totalRevenue / 12);
  const borrowingCapacity = creditAssessment.creditCapacity.safeBorrowingCapacity;

  return (
    <div className="dashboard-page overview-page">
      {/* Top Welcome & Context Banner */}
      <section className="overview-welcome-banner">
        <div className="welcome-text-group">
          <div className="greeting-row">
            <h1 className="welcome-greeting">Good morning, {firstName}</h1>
            <StatusBadge status={creditAssessment.riskBand} />
          </div>
          <p className="welcome-subheading">Here&apos;s what your business activity tells us.</p>
          <div className="welcome-meta-row">
            <span className="store-tag">
              <Store size={14} />
              {merchantProfile.name}
            </span>
            <span className="bullet">•</span>
            <span>{merchantProfile.location}</span>
            <span className="bullet">•</span>
            <DemoDataBadge location={merchantProfile.location} />
          </div>
        </div>

        <div className="welcome-quick-action">
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigateTab('credit-builder')}
            icon={<Zap size={15} />}
          >
            Credit Builder Plan
          </Button>
        </div>
      </section>

      {/* Top KPI Cards (5 core financial metrics) */}
      <section className="kpi-grid" aria-label="Core Financial Indicators">
        <KpiCard
          title="Financial Health Score"
          value={`${score}/100`}
          subtitle="Alternative rating from 5 weighted factors"
          badge={<StatusBadge status={creditAssessment.riskBand} />}
          icon={<Activity size={18} color="var(--emerald-primary)" />}
          variant={score >= 60 ? 'positive' : 'warning'}
        />

        <KpiCard
          title="Operating Cash Surplus"
          value={formatIndianCurrency(cashSurplus)}
          subtitle="Recorded revenue less operating outlays"
          badge={
            <StatusBadge
              status={cashSurplus >= 0 ? 'Surplus' : 'Under Pressure'}
              variant={cashSurplus >= 0 ? 'success' : 'danger'}
            />
          }
          icon={<Wallet size={18} color={cashSurplus >= 0 ? 'var(--status-success)' : 'var(--status-danger)'} />}
          variant={cashSurplus >= 0 ? 'positive' : 'danger'}
        />

        <KpiCard
          title="Recorded Revenue"
          value={formatIndianCurrency(financialAnalysis.totalRevenue)}
          subtitle={`~${formatIndianCurrency(avgMonthlyRevenue)}/mo turnover`}
          badge={
            <StatusBadge
              status={`${financialAnalysis.revenueGrowth.averageGrowthRate >= 0 ? '+' : ''}${financialAnalysis.revenueGrowth.averageGrowthRate.toFixed(1)}% MoM`}
              variant="info"
            />
          }
          icon={<TrendingUp size={18} color="var(--status-info)" />}
          variant="default"
        />

        <KpiCard
          title="Recorded Expenses"
          value={formatIndianCurrency(financialAnalysis.totalExpenses)}
          subtitle={`${(financialAnalysis.expenseToIncomeRatio * 100).toFixed(0)}% expense-to-income ratio`}
          badge={
            <StatusBadge
              status={financialAnalysis.expenseToIncomeRatio <= 0.85 ? 'Prudent' : 'Elevated'}
              variant={financialAnalysis.expenseToIncomeRatio <= 0.85 ? 'success' : 'danger'}
            />
          }
          icon={<Receipt size={18} color={financialAnalysis.expenseToIncomeRatio <= 0.85 ? 'var(--status-success)' : 'var(--status-danger)'} />}
          variant={financialAnalysis.expenseToIncomeRatio <= 0.85 ? 'default' : 'danger'}
        />

        <KpiCard
          title="Modeled Borrowing Capacity"
          value={`₹${borrowingCapacity.toLocaleString('en-IN')}`}
          subtitle={
            borrowingCapacity > 0
              ? 'Derived from 30% surplus buffer'
              : 'Current cash flow does not support debt'
          }
          badge={
            <StatusBadge
              status={borrowingCapacity > 0 ? 'Buffer Available' : 'Zero Buffer'}
              variant={borrowingCapacity > 0 ? 'success' : 'neutral'}
            />
          }
          icon={<ShieldAlert size={18} color={borrowingCapacity > 0 ? 'var(--emerald-primary)' : 'var(--text-tertiary)'} />}
          variant={borrowingCapacity > 0 ? 'positive' : 'default'}
        />
      </section>

      {/* Guided Journey Navigation Cards */}
      <section className="journey-section">
        <div className="section-title-row" style={{ marginBottom: '1rem' }}>
          <h2 className="section-block-title">Your Financial Journey</h2>
          <span className="section-step-indicator">3 Steps to Loan Readiness</span>
        </div>

        <div className="journey-cards-grid">
          {/* Journey Card 1 */}
          <Card className="journey-card">
            <div className="journey-step-badge">01</div>
            <div className="journey-icon-box">
              <Activity size={22} />
            </div>
            <h3 className="journey-card-title">Understand your financial health</h3>
            <p className="journey-card-body">
              Explore the 5 cash-flow factors, explainable positive signals, and identified risk factors
              driving your {score}/100 rating.
            </p>
            <div className="journey-card-footer">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('financial-health')}
                icon={<ArrowRight size={15} />}
              >
                Inspect Health Breakdown
              </Button>
            </div>
          </Card>

          {/* Journey Card 2 */}
          <Card className="journey-card">
            <div className="journey-step-badge">02</div>
            <div className="journey-icon-box">
              <Wallet size={22} />
            </div>
            <h3 className="journey-card-title">Explore borrowing affordability</h3>
            <p className="journey-card-body">
              Simulate loan tickets, tenure, and interest rates to test how monthly installments impact
              operating cash surplus.
            </p>
            <div className="journey-card-footer">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigateTab('loan-simulator')}
                icon={<ArrowRight size={15} />}
              >
                Launch Simulator
              </Button>
            </div>
          </Card>

          {/* Journey Card 3 */}
          <Card className="journey-card highlighted">
            <div className="journey-step-badge active">03</div>
            <div className="journey-icon-box active">
              <Zap size={22} />
            </div>
            <h3 className="journey-card-title">Build credit readiness</h3>
            <p className="journey-card-body">
              Target specific cash-flow friction with {creditRoadmap.nextBestActions.length} prioritized Next Best Actions
              to build verifiable borrowing readiness.
            </p>
            <div className="journey-card-footer">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigateTab('credit-builder')}
                icon={<ArrowRight size={15} />}
              >
                View Roadmap
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* Operational Highlights Snapshot */}
      <section className="snapshot-section">
        <Card className="snapshot-card">
          <div className="snapshot-header">
            <div>
              <h3 className="snapshot-title">Underwriting Highlights Snapshot</h3>
              <p className="snapshot-desc">Key operational signals synthesized from transaction records</p>
            </div>
            <span className="snapshot-counter">365 Days Analyzed</span>
          </div>

          <div className="snapshot-grid">
            <div className="snapshot-stat-item">
              <span className="stat-label">Digital Collection Share</span>
              <span className="stat-value font-mono">
                {(financialAnalysis.digitalTransactionRatio.upiTransactionRatio * 100).toFixed(1)}%
              </span>
              <span className="stat-subtext">
                {financialAnalysis.digitalTransactionRatio.upiSalesCount} UPI sales vs {financialAnalysis.digitalTransactionRatio.cashSalesCount} cash sales
              </span>
            </div>

            <div className="snapshot-stat-item">
              <span className="stat-label">Supplier Payment Regularity</span>
              <span className="stat-value font-mono">
                {financialAnalysis.supplierPaymentRegularity.regularityIndex.toFixed(2)} / 1.00
              </span>
              <span className="stat-subtext">
                {financialAnalysis.supplierPaymentRegularity.supplierPaymentCount} payments (avg {financialAnalysis.supplierPaymentRegularity.averageIntervalDays.toFixed(0)} days apart)
              </span>
            </div>

            <div className="snapshot-stat-item">
              <span className="stat-label">Expense-to-Income Ratio</span>
              <span className="stat-value font-mono">
                {(financialAnalysis.expenseToIncomeRatio * 100).toFixed(1)}%
              </span>
              <span className="stat-subtext">
                {financialAnalysis.expenseToIncomeRatio > 1.0 ? 'Operating outlays exceed revenue' : 'Sustainable operating margin'}
              </span>
            </div>

            <div className="snapshot-stat-item">
              <span className="stat-label">Operating History</span>
              <span className="stat-value font-mono">
                {merchantProfile.operatingHistoryYears} Years
              </span>
              <span className="stat-subtext">Established retail footprint in {merchantProfile.location}</span>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};
