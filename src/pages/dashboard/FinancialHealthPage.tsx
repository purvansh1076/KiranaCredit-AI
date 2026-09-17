import React, { useState } from 'react';
import {
  Activity,
  Wallet,
  Receipt,
  TrendingDown,
  TrendingUp,
  Percent,
  CreditCard,
  Truck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Card } from '../../components/ui/Card';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { KpiCard } from '../../components/ui/KpiCard';
import { ScoreRing } from '../../components/ui/ScoreRing';
import { FactorBar } from '../../components/ui/FactorBar';
import { SignalCard } from '../../components/ui/SignalCard';
import { BenchmarkMetric } from '../../components/ui/BenchmarkMetric';
import { DemoDataBadge } from '../../components/ui/DemoDataBadge';
import { formatIndianCurrency, formatPercentage } from '../../utils/formatters';

export const FinancialHealthPage: React.FC = () => {
  const { financialAnalysis, creditAssessment, activeOption } = useMerchant();
  const [showMathDetails, setShowMathDetails] = useState(false);

  const score = creditAssessment.overallScore;
  const factors = creditAssessment.factorBreakdown;
  const positiveSignals = creditAssessment.positiveSignals;
  const riskSignals = creditAssessment.riskSignals;
  const surplus = financialAnalysis.cashSurplus;
  const isSurplusNegative = surplus < 0;

  // Identify highest contributing factor and lowest limiting factor
  let highestFactor = factors[0];
  let lowestFactor = factors[0];
  for (const f of factors) {
    if (f.weightedContribution > highestFactor.weightedContribution) {
      highestFactor = f;
    }
    if (f.normalizedScore < lowestFactor.normalizedScore) {
      lowestFactor = f;
    }
  }

  return (
    <div className="dashboard-page financial-health-page">
      <PageHeader
        title="Financial Health"
        subtitle="Understand the financial signals behind your credit profile."
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <DemoDataBadge />
            <StatusBadge status={`${score}/100 — ${creditAssessment.riskBand}`} />
          </div>
        }
      />

      {/* ============================================================
          SECTION 1 & 2: HERO SCORE & SCORE DRIVERS
          ============================================================ */}
      <section className="score-hero-grid">
        {/* Left Card: Circular Score Visualization */}
        <Card className="score-ring-card">
          <div className="score-ring-header">
            <span className="section-eyebrow">Alternative Credit Rating</span>
            <h2 className="score-card-title">Financial Health Score</h2>
          </div>

          <div className="score-ring-wrapper">
            <ScoreRing score={score} riskBand={creditAssessment.riskBand} size={170} />
          </div>

          <div className="score-band-center">
            <StatusBadge status={creditAssessment.riskBand} />
            <p className="score-band-sub">{creditAssessment.riskBandDescription}</p>
          </div>

          <div className="score-scale-hint">
            <span>0 (Critical Stress)</span>
            <div className="score-scale-bar" />
            <span>100 (Prime Health)</span>
          </div>
        </Card>

        {/* Right Card: What's Driving Your Score */}
        <Card className="score-drivers-card">
          <div className="drivers-header">
            <div>
              <span className="section-eyebrow">Attribution Model</span>
              <h2 className="score-card-title">What&apos;s driving your score?</h2>
            </div>
            <span className="drivers-total-badge font-mono">
              Total: <strong>{score}</strong> / 100
            </span>
          </div>

          <p className="drivers-intro">
            Your alternative rating is determined by 5 weighted operational dimensions synthesized
            from 365 daily transaction records.
          </p>

          <div className="drivers-breakdown-list">
            {factors.map((factor) => {
              const weightPct = Math.round(factor.weight * 100);
              const scorePct = Math.round(factor.normalizedScore * 100);
              const isHighest = factor.name === highestFactor.name;
              const isLowest = factor.name === lowestFactor.name;

              return (
                <div key={factor.name} className="driver-row">
                  <div className="driver-info">
                    <span className="driver-name">{factor.name}</span>
                    <span className="driver-weight">{weightPct}% weight</span>
                    {isHighest && <span className="driver-tag top">Top Anchor</span>}
                    {isLowest && <span className="driver-tag bottom">Limiting Factor</span>}
                  </div>

                  <div className="driver-values font-mono">
                    <span className="driver-score">{scorePct}/100</span>
                    <span className="driver-points">+{factor.weightedContribution} pts</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="drivers-key-takeaway">
            <Sparkles size={15} color="var(--emerald-primary)" />
            <span>
              <strong>Primary Anchor:</strong> {highestFactor.name} (+{highestFactor.weightedContribution} pts).{' '}
              <strong>Primary Limiting Area:</strong> {lowestFactor.name} (Score: {Math.round(lowestFactor.normalizedScore * 100)}/100).
            </span>
          </div>
        </Card>
      </section>

      {/* ============================================================
          SECTION 2B: DETAILED FACTOR BREAKDOWN BARS
          ============================================================ */}
      <section className="factor-breakdown-section">
        <SectionHeader
          title="Weighted Factor Scorecard"
          description="Detailed score, weight, and operational explanation for each evaluated underwriting factor."
        />

        <div className="factor-bars-stack">
          {factors.map((factor) => (
            <FactorBar
              key={factor.name}
              factor={factor}
              isHighest={factor.name === highestFactor.name}
              isLowest={factor.name === lowestFactor.name}
            />
          ))}
        </div>
      </section>

      {/* ============================================================
          SECTION 3: KEY FINANCIAL METRICS (KPI GRID)
          ============================================================ */}
      <section className="kpi-metrics-section">
        <SectionHeader
          title="Key Financial Indicators"
          description="Deterministic calculations derived directly from the transaction dataset."
        />

        <div className="kpi-grid">
          {/* Revenue */}
          <KpiCard
            title="Operating Revenue"
            value={formatIndianCurrency(financialAnalysis.totalRevenue)}
            subtitle="Total customer sales (INFLOW)"
            badge={<StatusBadge status={`${financialAnalysis.digitalTransactionRatio.totalSalesCount} Sales`} variant="neutral" />}
            icon={<TrendingUp size={18} color="var(--emerald-primary)" />}
          />

          {/* Operating Expenses */}
          <KpiCard
            title="Operating Expenses"
            value={formatIndianCurrency(financialAnalysis.totalExpenses)}
            subtitle="Suppliers, rent, utilities, inventory"
            badge={<StatusBadge status={financialAnalysis.expenseToIncomeRatio > 1.0 ? 'Exceeds Revenue' : 'Normal'} variant={financialAnalysis.expenseToIncomeRatio > 1.0 ? 'danger' : 'neutral'} />}
            icon={<Receipt size={18} color="var(--status-warning)" />}
            variant={financialAnalysis.expenseToIncomeRatio > 1.0 ? 'warning' : 'default'}
          />

          {/* Net Operating Cash Flow */}
          <KpiCard
            title="Net Operating Cash Flow"
            value={formatIndianCurrency(financialAnalysis.netOperatingCashFlow)}
            subtitle="Operating Inflows less Operating Outflows"
            badge={<StatusBadge status={financialAnalysis.netOperatingCashFlow >= 0 ? 'Positive' : 'Deficit'} variant={financialAnalysis.netOperatingCashFlow >= 0 ? 'success' : 'danger'} />}
            icon={<Activity size={18} color={financialAnalysis.netOperatingCashFlow >= 0 ? 'var(--status-success)' : 'var(--status-danger)'} />}
            variant={financialAnalysis.netOperatingCashFlow >= 0 ? 'positive' : 'danger'}
          />

          {/* Cash Surplus (Explicit Negative Indicator) */}
          <KpiCard
            title="Annual Cash Surplus"
            value={formatIndianCurrency(surplus)}
            subtitle="Revenue less operating expenses & debt payments"
            badge={<StatusBadge status={isSurplusNegative ? 'Under Pressure' : 'Surplus'} variant={isSurplusNegative ? 'danger' : 'success'} />}
            icon={<Wallet size={18} color={isSurplusNegative ? 'var(--status-danger)' : 'var(--status-success)'} />}
            variant={isSurplusNegative ? 'danger' : 'positive'}
          />

          {/* Expense to Income Ratio */}
          <KpiCard
            title="Expense-to-Income Ratio"
            value={formatPercentage(financialAnalysis.expenseToIncomeRatio)}
            subtitle={financialAnalysis.expenseToIncomeRatio > 1.0 ? 'Expenses exceed revenue by >100%' : 'Operational cost margin'}
            badge={<StatusBadge status={financialAnalysis.expenseToIncomeRatio > 1.0 ? 'High Burn' : 'Sustainable'} variant={financialAnalysis.expenseToIncomeRatio > 1.0 ? 'danger' : 'success'} />}
            icon={<Percent size={18} color="var(--status-warning)" />}
            variant={financialAnalysis.expenseToIncomeRatio > 1.0 ? 'warning' : 'default'}
          />

          {/* Debt Burden Ratio */}
          <KpiCard
            title="Debt Burden Ratio"
            value={formatPercentage(financialAnalysis.debtBurdenRatio)}
            subtitle={`₹${Math.round(financialAnalysis.debtBurdenRatio * financialAnalysis.totalRevenue).toLocaleString('en-IN')} total debt repayments`}
            badge={<StatusBadge status={financialAnalysis.debtBurdenRatio > 0.15 ? 'High Burden' : 'Low Debt'} variant={financialAnalysis.debtBurdenRatio > 0.15 ? 'warning' : 'success'} />}
            icon={<TrendingDown size={18} color="var(--status-info)" />}
          />

          {/* Digital Transaction Share */}
          <KpiCard
            title="Digital Collection Share"
            value={formatPercentage(financialAnalysis.digitalTransactionRatio.upiTransactionRatio)}
            subtitle={`${financialAnalysis.digitalTransactionRatio.upiSalesCount} UPI of ${financialAnalysis.digitalTransactionRatio.totalSalesCount} total sales`}
            badge={<StatusBadge status={financialAnalysis.digitalTransactionRatio.upiTransactionRatio >= 0.6 ? 'High Digital' : 'Cash Heavy'} variant={financialAnalysis.digitalTransactionRatio.upiTransactionRatio >= 0.6 ? 'success' : 'warning'} />}
            icon={<CreditCard size={18} color="var(--emerald-primary)" />}
          />

          {/* Supplier Payment Regularity */}
          <KpiCard
            title="Supplier Regularity"
            value={`${financialAnalysis.supplierPaymentRegularity.regularityIndex.toFixed(2)}`}
            subtitle={`Avg interval: ${financialAnalysis.supplierPaymentRegularity.averageIntervalDays.toFixed(0)} days across ${financialAnalysis.supplierPaymentRegularity.supplierPaymentCount} payments`}
            badge={<StatusBadge status={financialAnalysis.supplierPaymentRegularity.regularityIndex >= 0.8 ? 'Consistent' : 'Irregular'} variant={financialAnalysis.supplierPaymentRegularity.regularityIndex >= 0.8 ? 'success' : 'danger'} />}
            icon={<Truck size={18} color="var(--emerald-primary)" />}
            variant={financialAnalysis.supplierPaymentRegularity.regularityIndex >= 0.8 ? 'positive' : 'warning'}
          />
        </div>
      </section>

      {/* ============================================================
          SECTION 4: CASH FLOW INSIGHT CARD
          ============================================================ */}
      <section className="cash-flow-insight-section">
        <Card className={`insight-card ${isSurplusNegative ? 'insight-pressure' : 'insight-healthy'}`}>
          <div className="insight-header">
            <div className="insight-icon-box">
              {isSurplusNegative ? (
                <AlertTriangle size={20} color="var(--status-danger)" />
              ) : (
                <ShieldCheck size={20} color="var(--status-success)" />
              )}
            </div>
            <div>
              <span className="insight-eyebrow">Operating Cash Flow Assessment</span>
              <h3 className="insight-title">
                {isSurplusNegative
                  ? 'Operating Cash Flow is Under Pressure'
                  : 'Operating Cash Flow Demonstrates Positive Health'}
              </h3>
            </div>
          </div>

          <p className="insight-body">
            {isSurplusNegative ? (
              <>
                Recorded operating expenses of{' '}
                <strong>{formatIndianCurrency(financialAnalysis.totalExpenses)}</strong> exceed
                customer sales revenue of{' '}
                <strong>{formatIndianCurrency(financialAnalysis.totalRevenue)}</strong>, creating an
                annual cash deficit of{' '}
                <strong className="text-danger">{formatIndianCurrency(surplus)}</strong>. Because
                debt underwriting formulas require a positive monthly buffer, current modeled cash flow
                leaves zero headroom for additional unsecured debt without restructuring outlays.
              </>
            ) : (
              <>
                Business cash collections reliably outpace operating outlays, generating an annual
                operating surplus of{' '}
                <strong className="text-success">{formatIndianCurrency(surplus)}</strong>. This
                provides a stable monthly cash buffer capable of absorbing loan EMI obligations.
              </>
            )}
          </p>

          <div className="insight-footer-meta">
            <span>
              <strong>Dataset:</strong> {activeOption.name} ({activeOption.location})
            </span>
            <span className="bullet">•</span>
            <span>
              <strong>Volatility:</strong> CV {financialAnalysis.cashFlowVolatility.coefficientOfVariation.toFixed(2)}
            </span>
            <span className="bullet">•</span>
            <span>
              <strong>MoM Trend:</strong> {financialAnalysis.revenueGrowth.averageGrowthRate >= 0 ? '+' : ''}
              {financialAnalysis.revenueGrowth.averageGrowthRate.toFixed(1)}%
            </span>
          </div>
        </Card>
      </section>

      {/* ============================================================
          SECTION 5 & 6: RISK SIGNALS & POSITIVE SIGNALS
          ============================================================ */}
      <section className="signals-section">
        <SectionHeader
          title="Underwriting Signals Attribution"
          description="Concrete positive strengths and observed risk factors extracted deterministically from your data."
        />

        <div className="signals-dual-grid">
          {/* Positive Signals Column */}
          <div className="signals-column">
            <div className="signals-col-heading positive">
              <ShieldCheck size={18} color="var(--status-success)" />
              <h3>Positive Signals ({positiveSignals.length})</h3>
            </div>

            {positiveSignals.length === 0 ? (
              <Card className="empty-signals-card">
                <p>No qualifying positive signals detected in the current transaction stream.</p>
              </Card>
            ) : (
              <div className="signals-stack">
                {positiveSignals.map((sig, idx) => (
                  <SignalCard key={`pos-${idx}`} signal={sig} />
                ))}
              </div>
            )}
          </div>

          {/* Risk Signals Column */}
          <div className="signals-column">
            <div className="signals-col-heading risk">
              <AlertTriangle size={18} color="var(--status-danger)" />
              <h3>Identified Risk Signals ({riskSignals.length})</h3>
            </div>

            {riskSignals.length === 0 ? (
              <Card className="empty-signals-card">
                <p>No material risk signals detected for this profile.</p>
              </Card>
            ) : (
              <div className="signals-stack">
                {riskSignals.map((sig, idx) => (
                  <SignalCard key={`risk-${idx}`} signal={sig} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECTION 7: PEER BENCHMARK CONTEXT
          ============================================================ */}
      <section className="benchmark-section">
        <SectionHeader
          title="Reference Peer Benchmark Context"
          description="Contextual comparison against healthy MSME operating standards (Ravi General Store baseline). Provided for diagnostic guidance without competitive ranking."
        />

        <div className="benchmark-grid">
          <BenchmarkMetric
            label="Digital Collections Share"
            currentDisplay={formatPercentage(financialAnalysis.digitalTransactionRatio.upiTransactionRatio)}
            referenceDisplay="88.0%"
            statusText={
              financialAnalysis.digitalTransactionRatio.upiTransactionRatio >= 0.75
                ? 'Aligned with Peer'
                : 'Optimization Opportunity'
            }
            statusVariant={
              financialAnalysis.digitalTransactionRatio.upiTransactionRatio >= 0.75
                ? 'success'
                : 'warning'
            }
            description="Higher digital collections provide transparent, audit-ready proof of turnover for credit underwriters."
          />

          <BenchmarkMetric
            label="Supplier Settlement Regularity"
            currentDisplay={`${financialAnalysis.supplierPaymentRegularity.regularityIndex.toFixed(2)}`}
            referenceDisplay="1.00"
            statusText={
              financialAnalysis.supplierPaymentRegularity.regularityIndex >= 0.8
                ? 'Consistent Trade Timing'
                : 'Friction Detected'
            }
            statusVariant={
              financialAnalysis.supplierPaymentRegularity.regularityIndex >= 0.8
                ? 'success'
                : 'warning'
            }
            description="Fixed payment intervals with distributors serve as prime alternative proof of commercial solvency."
          />

          <BenchmarkMetric
            label="Cash Flow Volatility (CV)"
            currentDisplay={`${financialAnalysis.cashFlowVolatility.coefficientOfVariation.toFixed(2)} CV`}
            referenceDisplay="0.27 CV"
            statusText={
              financialAnalysis.cashFlowVolatility.coefficientOfVariation <= 0.4
                ? 'Stable Cash Position'
                : 'Elevated Variability'
            }
            statusVariant={
              financialAnalysis.cashFlowVolatility.coefficientOfVariation <= 0.4
                ? 'success'
                : 'warning'
            }
            description="Lower coefficient of variation demonstrates steady month-over-month operating surplus."
          />

          <BenchmarkMetric
            label="Debt Burden Ratio"
            currentDisplay={formatPercentage(financialAnalysis.debtBurdenRatio)}
            referenceDisplay="0.0%"
            statusText={
              financialAnalysis.debtBurdenRatio <= 0.1
                ? 'Low Debt Obligation'
                : 'Elevated Leverage'
            }
            statusVariant={
              financialAnalysis.debtBurdenRatio <= 0.1
                ? 'success'
                : 'warning'
            }
            description="Lenders prioritize businesses with unencumbered cash flows to ensure clean debt servicing."
          />
        </div>
      </section>

      {/* ============================================================
          SECTION 8: WHY THIS SCORE? (EXPLAINABILITY)
          ============================================================ */}
      <section className="why-score-section">
        <Card className="why-score-card">
          <div className="why-score-header">
            <HelpCircle size={20} color="var(--emerald-primary)" />
            <div>
              <h3 className="why-score-title">Why this score?</h3>
              <p className="why-score-subtitle">
                Plain-English explanation of the underlying assessment rationale.
              </p>
            </div>
          </div>

          <div className="why-score-narrative">
            <p>
              Your Financial Health Score of <strong>{score} / 100</strong> places your store in the{' '}
              <strong className="text-warning">{creditAssessment.riskBand}</strong> band.
            </p>

            <ul className="why-score-list">
              <li>
                <strong>Cash Flow Stability (30% weight):</strong> Contributes{' '}
                <strong>+{factors.find((f) => f.name === 'Cash Flow Stability')?.weightedContribution ?? 0} pts</strong>.
                Annual cash surplus is currently {isSurplusNegative ? 'negative' : 'positive'} at{' '}
                <span className="font-mono">{formatIndianCurrency(surplus)}</span>, which restrains
                this factor&apos;s score to{' '}
                <span className="font-mono">
                  {Math.round((factors.find((f) => f.name === 'Cash Flow Stability')?.normalizedScore ?? 0) * 100)}/100
                </span>.
              </li>
              <li>
                <strong>Repayment Discipline (25% weight):</strong> Contributes{' '}
                <strong>+{factors.find((f) => f.name === 'Repayment Discipline')?.weightedContribution ?? 0} pts</strong>.
                {financialAnalysis.supplierPaymentRegularity.regularityIndex >= 0.8
                  ? ' Your distributor payments follow a remarkably consistent schedule, serving as a powerful positive signal.'
                  : ' Irregular supplier settlement timing reduces this factor.'}
              </li>
              <li>
                <strong>Growth &amp; Margins (20% weight):</strong> Contributes{' '}
                <strong>+{factors.find((f) => f.name === 'Growth & Margins')?.weightedContribution ?? 0} pts</strong>.
                Operating expense ratio is{' '}
                <span className="font-mono">{formatPercentage(financialAnalysis.expenseToIncomeRatio)}</span>.
              </li>
              <li>
                <strong>Payment Method Concentration (15% weight):</strong> Contributes{' '}
                <strong>+{factors.find((f) => f.name === 'Payment Method Concentration')?.weightedContribution ?? 0} pts</strong>.
                Balanced payment reception across UPI and cash provides solid operational flexibility.
              </li>
              <li>
                <strong>Digital Continuity (10% weight):</strong> Contributes{' '}
                <strong>+{factors.find((f) => f.name === 'Digital Transaction Continuity')?.weightedContribution ?? 0} pts</strong>.
                With <span className="font-mono">{formatPercentage(financialAnalysis.digitalTransactionRatio.upiTransactionRatio)}</span> of
                sales recorded via UPI, your digital footprint is visible to algorithmic models.
              </li>
            </ul>
          </div>

          {/* Expandable Mathematical Transparency */}
          <div className="score-math-toggle-area">
            <button
              type="button"
              className="score-math-toggle-btn"
              onClick={() => setShowMathDetails(!showMathDetails)}
              aria-expanded={showMathDetails}
            >
              <span>How the score is calculated (Formula &amp; Weights)</span>
              {showMathDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {showMathDetails && (
              <div className="score-math-content">
                <p>
                  The Financial Health Score is a purely deterministic linear combination of five
                  normalized factors:
                </p>
                <div className="formula-box font-mono">
                  Score = (S₁ × 0.30) + (S₂ × 0.25) + (S₃ × 0.20) + (S₄ × 0.15) + (S₅ × 0.10)
                </div>
                <p className="formula-desc">
                  Where each factor score (S₁ to S₅) is calculated deterministically from transaction data
                  on a 0–100 scale. No machine-learning black boxes, no arbitrary score adjustments, and no
                  random numbers are used.
                </p>
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  );
};
