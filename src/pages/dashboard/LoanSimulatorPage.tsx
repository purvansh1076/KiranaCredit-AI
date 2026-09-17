import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Percent,
  Banknote,
  Info,
  ArrowRight,
  TrendingUp,
  Sparkles,
  HelpCircle,
  Calendar,
} from 'lucide-react';
import { useMerchant } from '../../context/MerchantContext';
import { simulateLoan } from '../../services/loanSimulator';
import { DashboardTab } from '../../types/navigation';
import { PageHeader } from '../../components/ui/PageHeader';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { DemoDataBadge } from '../../components/ui/DemoDataBadge';
import { Button } from '../../components/ui/Button';

interface LoanSimulatorPageProps {
  onNavigateTab?: (tab: DashboardTab) => void;
}

const QUICK_SCENARIOS = [
  { label: '₹50K', amount: 50000, description: 'Micro inventory cycle' },
  { label: '₹1L', amount: 100000, description: 'Festive stock buffer' },
  { label: '₹2L', amount: 200000, description: 'Store expansion / cooling' },
];

const TENURE_OPTIONS = [6, 12, 18, 24, 36, 48, 60];

export const LoanSimulatorPage: React.FC<LoanSimulatorPageProps> = ({ onNavigateTab }) => {
  const { creditAssessment } = useMerchant();

  // Baseline loan scenario inputs
  const [loanAmount, setLoanAmount] = useState<number>(50000);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(18);
  const [tenureMonths, setTenureMonths] = useState<number>(24);

  // Pure service simulation invocation (strictly no duplicated financial formulas in UI)
  const simulationResult = useMemo(() => {
    return simulateLoan(
      {
        loanAmount,
        annualInterestRate,
        tenureMonths,
      },
      creditAssessment.creditCapacity
    );
  }, [loanAmount, annualInterestRate, tenureMonths, creditAssessment.creditCapacity]);

  // Tenure comparative analysis (evaluated strictly through pure simulateLoan calls)
  const tenureComparisons = useMemo(() => {
    return [12, 24, 36].map((months) => {
      const res = simulateLoan(
        {
          loanAmount,
          annualInterestRate,
          tenureMonths: months,
        },
        creditAssessment.creditCapacity
      );
      return {
        months,
        emi: res.monthlyEmi,
        totalInterest: res.totalInterest,
        totalRepayment: res.totalRepayment,
        affordability: res.affordability,
      };
    });
  }, [loanAmount, annualInterestRate, creditAssessment.creditCapacity]);

  const isAffordable = simulationResult.affordability === 'AFFORDABLE';
  const maxAffordableEMI = simulationResult.maximumAffordableEMI;
  const emiDifference = simulationResult.monthlyEmi - maxAffordableEMI;

  // Composition calculation for visual EMI breakdown
  const principalPercent =
    simulationResult.totalRepayment > 0
      ? Math.round((simulationResult.loanAmount / simulationResult.totalRepayment) * 100)
      : 100;
  const interestPercent = 100 - principalPercent;

  const handleAmountChange = (val: number) => {
    if (isNaN(val)) {
      setLoanAmount(0);
    } else {
      setLoanAmount(Math.max(0, Math.min(500000, Math.round(val))));
    }
  };

  const handleInterestChange = (val: number) => {
    if (isNaN(val)) {
      setAnnualInterestRate(0);
    } else {
      const clamped = Math.max(0, Math.min(30, val));
      setAnnualInterestRate(Math.round(clamped * 10) / 10);
    }
  };

  return (
    <div className="dashboard-page loan-simulator-page">
      {/* Page Header */}
      <PageHeader
        title="Loan Simulator"
        subtitle="Explore how different borrowing scenarios could affect your monthly cash flow."
        badge={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <DemoDataBadge />
            <StatusBadge
              status={isAffordable ? 'AFFORDABLE' : 'ABOVE MODELED AFFORDABILITY'}
              variant={isAffordable ? 'success' : 'danger'}
            />
          </div>
        }
      />

      {/* Main Simulator Layout Grid: Left (Scenario Inputs) & Right (Your Estimate) */}
      <div className="simulator-layout-grid">
        {/* Left Column: Loan Scenario Inputs */}
        <Card className="simulator-input-card">
          <div className="card-header-with-badge">
            <div>
              <h3 className="card-title">Loan Scenario</h3>
              <p className="card-subtitle">
                Configure requested principal, annual interest rate, and tenure duration.
              </p>
            </div>
          </div>

          {/* Quick Scenarios ("Try a scenario") */}
          <div className="quick-scenarios-section">
            <div className="quick-scenarios-header">
              <span className="quick-scenarios-label">Try a scenario:</span>
              <span className="quick-scenarios-note">Sample amounts for simulation testing</span>
            </div>
            <div className="quick-scenarios-pills">
              {QUICK_SCENARIOS.map((sc) => (
                <button
                  key={sc.label}
                  type="button"
                  className={`quick-scenario-btn ${loanAmount === sc.amount ? 'active' : ''}`}
                  onClick={() => setLoanAmount(sc.amount)}
                  title={sc.description}
                >
                  <span className="pill-amount">{sc.label}</span>
                  <span className="pill-desc">{sc.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="simulator-form">
            {/* Input 1: Loan Amount */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="sim-loan-amount-input" className="form-label">
                  <Banknote size={15} />
                  <span>Requested Loan Amount</span>
                </label>
                <div className="numeric-input-wrapper">
                  <span className="input-currency-prefix">₹</span>
                  <input
                    id="sim-loan-amount-input"
                    type="number"
                    min="0"
                    max="500000"
                    step="5000"
                    value={loanAmount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    className="simulator-number-input font-mono"
                    aria-label="Requested loan amount in rupees"
                  />
                </div>
              </div>

              <input
                id="sim-loan-amount-slider"
                type="range"
                min="0"
                max="500000"
                step="5000"
                value={loanAmount}
                onChange={(e) => handleAmountChange(Number(e.target.value))}
                className="range-slider"
                aria-label="Loan amount slider"
                aria-valuemin={0}
                aria-valuemax={500000}
                aria-valuenow={loanAmount}
              />
              <div className="range-bounds">
                <span>₹0</span>
                <span>₹1.25L</span>
                <span>₹2.50L</span>
                <span>₹5.00L</span>
              </div>
              <p className="field-hint">
                Simulation range: ₹0 to ₹5,00,000. Does not imply an approved formal credit limit.
              </p>
            </div>

            {/* Input 2: Annual Interest Rate */}
            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="sim-interest-input" className="form-label">
                  <Percent size={15} />
                  <span>Annual Interest Rate</span>
                </label>
                <div className="numeric-input-wrapper">
                  <input
                    id="sim-interest-input"
                    type="number"
                    min="0"
                    max="30"
                    step="0.5"
                    value={annualInterestRate}
                    onChange={(e) => handleInterestChange(Number(e.target.value))}
                    className="simulator-number-input font-mono"
                    aria-label="Annual interest rate percentage"
                  />
                  <span className="input-unit-suffix">% p.a.</span>
                </div>
              </div>

              <input
                id="sim-interest-slider"
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={annualInterestRate}
                onChange={(e) => handleInterestChange(Number(e.target.value))}
                className="range-slider"
                aria-label="Annual interest rate slider"
                aria-valuemin={0}
                aria-valuemax={30}
                aria-valuenow={annualInterestRate}
              />
              <div className="range-bounds">
                <span>0% (Interest-free)</span>
                <span>12%</span>
                <span>18% (Default)</span>
                <span>30%</span>
              </div>
              <p className="field-hint">
                Indicative rate for demonstration. Working capital rates typically span 14%–24% p.a.
              </p>
            </div>

            {/* Input 3: Tenure */}
            <div className="form-group">
              <div className="form-label-row">
                <label className="form-label">
                  <Clock size={15} />
                  <span>Loan Tenure</span>
                </label>
                <span className="form-val-display font-mono">
                  {tenureMonths} Months ({tenureMonths / 12 >= 1 ? `${(tenureMonths / 12).toFixed(1).replace('.0', '')} yrs` : `${tenureMonths} mos`})
                </span>
              </div>

              <div className="tenure-button-group" role="radiogroup" aria-label="Select loan tenure">
                {TENURE_OPTIONS.map((m) => {
                  const years = (m / 12).toFixed(1).replace('.0', '');
                  return (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={tenureMonths === m}
                      className={`tenure-pill ${tenureMonths === m ? 'active' : ''}`}
                      onClick={() => setTenureMonths(m)}
                    >
                      <span className="tenure-months">{m}m</span>
                      <span className="tenure-years">{m >= 12 ? `${years}y` : `${m}m`}</span>
                    </button>
                  );
                })}
              </div>
              <p className="field-hint">
                Select repayment window in months. Longer tenures lower monthly EMI.
              </p>
            </div>
          </div>

          <div className="simulator-underwriting-note">
            <Info size={14} />
            <span>
              Calculations adhere to pure reducing-balance compounding with standard monthly amortization.
            </span>
          </div>
        </Card>

        {/* Right Column: Your Estimate */}
        <div className="simulator-results-col">
          <Card className="repayment-summary-card">
            <div className="card-header-with-badge">
              <div>
                <h3 className="result-card-heading">Your Estimate</h3>
                <p className="card-subtitle">Projected monthly outflow and interest exposure</p>
              </div>
              <StatusBadge
                status={isAffordable ? 'AFFORDABLE' : 'ABOVE MODELED AFFORDABILITY'}
                variant={isAffordable ? 'success' : 'danger'}
              />
            </div>

            {/* Prominent EMI Highlight Box */}
            <div className={`emi-highlight-box ${isAffordable ? 'affordable' : 'unaffordable'}`}>
              <span className="emi-label">Estimated Monthly EMI</span>
              <div className="emi-number-row">
                <span className="emi-currency">₹</span>
                <span className="emi-amount font-mono">
                  {simulationResult.monthlyEmi.toLocaleString('en-IN')}
                </span>
                <span className="emi-period">/ month</span>
              </div>
              <span className="emi-duration-subtext">
                Payable monthly for {tenureMonths} months @ {annualInterestRate}% p.a.
              </span>
            </div>

            {/* Repayment Breakdown Table */}
            <div className="repayment-breakdown-list">
              <div className="breakdown-item">
                <div className="b-label-col">
                  <span className="b-label">Principal Amount</span>
                  <span className="b-desc">Borrowed working capital</span>
                </div>
                <span className="b-val font-mono">
                  ₹{simulationResult.loanAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="breakdown-item">
                <div className="b-label-col">
                  <span className="b-label">Total Interest Outflow</span>
                  <span className="b-desc">Cost of borrowing over tenure</span>
                </div>
                <span className="b-val font-mono">
                  ₹{simulationResult.totalInterest.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="breakdown-item total">
                <div className="b-label-col">
                  <span className="b-label">Total Repayment Amount</span>
                  <span className="b-desc">Principal + total interest</span>
                </div>
                <span className="b-val font-mono text-highlight">
                  ₹{simulationResult.totalRepayment.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Visual EMI Breakdown Composition Bar */}
            <div className="emi-composition-section">
              <div className="composition-header">
                <span className="composition-title">Repayment Composition</span>
                <div className="composition-legend">
                  <span className="legend-item">
                    <span className="legend-dot principal" />
                    <span>Principal ({principalPercent}%)</span>
                  </span>
                  <span className="legend-item">
                    <span className="legend-dot interest" />
                    <span>Interest ({interestPercent}%)</span>
                  </span>
                </div>
              </div>

              <div
                className="composition-bar"
                role="progressbar"
                aria-label="Repayment composition breakdown"
                aria-valuenow={principalPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="bar-segment principal"
                  style={{ width: `${principalPercent}%` }}
                  title={`Principal: ${principalPercent}%`}
                />
                <div
                  className="bar-segment interest"
                  style={{ width: `${interestPercent}%` }}
                  title={`Interest: ${interestPercent}%`}
                />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Section 3: Affordability Explanation ("Why this result?") */}
      <Card className="affordability-explanation-card">
        <div className="explanation-header-row">
          <div className="header-left">
            <div className="section-icon-badge">
              {isAffordable ? (
                <ShieldCheck size={20} color="var(--status-success)" />
              ) : (
                <AlertTriangle size={20} color="var(--status-danger)" />
              )}
            </div>
            <div>
              <h3 className="section-title">Why this result?</h3>
              <p className="section-desc">
                Transparent comparison between requested installment and modeled repayment capacity
              </p>
            </div>
          </div>
          <StatusBadge
            status={isAffordable ? 'Within Cash Flow Buffer' : 'Exceeds Modeled Capacity'}
            variant={isAffordable ? 'success' : 'danger'}
          />
        </div>

        {/* 3-Column Comparative Metrics Grid */}
        <div className="affordability-comparison-grid">
          <div className="comparison-metric-box">
            <span className="comp-label">Requested Monthly EMI</span>
            <span className="comp-value font-mono">
              ₹{simulationResult.monthlyEmi.toLocaleString('en-IN')}
              <span className="comp-unit">/ mo</span>
            </span>
            <span className="comp-hint">Calculated from your simulation inputs</span>
          </div>

          <div className="comparison-metric-box">
            <span className="comp-label">Maximum Modeled Affordable EMI</span>
            <span className="comp-value font-mono">
              ₹{maxAffordableEMI.toLocaleString('en-IN')}
              <span className="comp-unit">/ mo</span>
            </span>
            <span className="comp-hint">Derived from verified operating surplus</span>
          </div>

          <div className="comparison-metric-box highlight">
            <span className="comp-label">Affordability Buffer / Gap</span>
            <span
              className={`comp-value font-mono ${isAffordable ? 'text-success' : 'text-danger'}`}
            >
              {isAffordable ? (
                <>+₹{Math.abs(emiDifference).toLocaleString('en-IN')}</>
              ) : (
                <>-₹{Math.abs(emiDifference).toLocaleString('en-IN')}</>
              )}
              <span className="comp-unit">/ mo</span>
            </span>
            <span className="comp-hint">
              {isAffordable ? 'Comfortable surplus cushion' : 'Above modeled cash flow ceiling'}
            </span>
          </div>
        </div>

        {/* Dynamic Explanation Callout */}
        <div className={`explanation-callout ${isAffordable ? 'callout-success' : 'callout-danger'}`}>
          <p className="callout-primary-text">{simulationResult.explanation}</p>
          <p className="callout-detail-text">
            KiranaCredit AI underwrites loans against recorded operational cash surplus after
            reserving a standard 30% monthly volatility cushion. When operational expenses exceed
            inflows (or historical margins are compressed), the engine sets safe capacity to ₹0 to
            safeguard your business against insolvency.
          </p>
        </div>
      </Card>

      {/* Section 4: Current Modeled Borrowing Capacity Card */}
      <Card className="modeled-capacity-card">
        <div className="card-header-with-badge">
          <div>
            <h3 className="section-title">Current Modeled Borrowing Capacity</h3>
            <p className="section-desc">
              Deterministic underwriting ceilings computed from cash-flow stability and trade continuity
            </p>
          </div>
          <span className="underwriting-tag">Bureau-Independent Model</span>
        </div>

        <div className="capacity-kpi-grid">
          <div className="capacity-kpi-item">
            <span className="cap-label">Safe Borrowing Capacity</span>
            <span className="cap-val font-mono">
              ₹{creditAssessment.creditCapacity.safeBorrowingCapacity.toLocaleString('en-IN')}
            </span>
            <span className="cap-desc">Maximum sustainable principal ceiling</span>
          </div>

          <div className="capacity-kpi-item">
            <span className="cap-label">Maximum Affordable EMI</span>
            <span className="cap-val font-mono">
              ₹{creditAssessment.creditCapacity.maximumAffordableEMI.toLocaleString('en-IN')}
              <span className="cap-unit"> / mo</span>
            </span>
            <span className="cap-desc">Upper bound on monthly debt service</span>
          </div>

          <div className="capacity-kpi-item">
            <span className="cap-label">Recommended Loan Range</span>
            <span className="cap-val font-mono">
              ₹{creditAssessment.creditCapacity.recommendedLoanRange.minimum.toLocaleString('en-IN')} – ₹{creditAssessment.creditCapacity.recommendedLoanRange.maximum.toLocaleString('en-IN')}
            </span>
            <span className="cap-desc">Sized for prudent working capital</span>
          </div>

          <div className="capacity-kpi-item">
            <span className="cap-label">Suggested Ticket Size</span>
            <span className="cap-val font-mono">
              ₹{creditAssessment.creditCapacity.recommendedLoanRange.suggested.toLocaleString('en-IN')}
            </span>
            <span className="cap-desc">Optimal single-disbursement size</span>
          </div>
        </div>

        <div className="capacity-terminology-note">
          <HelpCircle size={15} />
          <span>
            <strong>Terminology Notice:</strong> This metric represents modeled borrowing capacity
            based on empirical MSME cash flows. It serves as an underwriting risk guide and does not
            constitute a binding formal sanction or rejection.
          </span>
        </div>
      </Card>

      {/* Section 5: Tenure Comparison Educational Panel */}
      <Card className="tenure-comparison-card">
        <div className="tenure-header">
          <div className="header-left">
            <Calendar size={18} color="var(--brand-accent)" />
            <div>
              <h4 className="tenure-title">Tenure Impact Analysis (₹{loanAmount.toLocaleString('en-IN')} @ {annualInterestRate}%)</h4>
              <p className="tenure-subtitle">
                Longer tenure reduces monthly EMI obligation but increases total interest outflow over the loan lifespan.
              </p>
            </div>
          </div>
        </div>

        <div className="tenure-scenarios-grid">
          {tenureComparisons.map((item) => (
            <div
              key={item.months}
              className={`tenure-scenario-box ${item.months === tenureMonths ? 'active-tenure' : ''}`}
            >
              <div className="scenario-top">
                <span className="scenario-months">{item.months} Months</span>
                <StatusBadge
                  status={item.affordability === 'AFFORDABLE' ? 'Affordable' : 'Above Buffer'}
                  variant={item.affordability === 'AFFORDABLE' ? 'success' : 'neutral'}
                />
              </div>
              <div className="scenario-metrics">
                <div className="sc-metric">
                  <span className="sc-label">Monthly EMI</span>
                  <span className="sc-val font-mono">₹{item.emi.toLocaleString('en-IN')}</span>
                </div>
                <div className="sc-metric">
                  <span className="sc-label">Total Interest</span>
                  <span className="sc-val font-mono">₹{item.totalInterest.toLocaleString('en-IN')}</span>
                </div>
                <div className="sc-metric">
                  <span className="sc-label">Total Repayment</span>
                  <span className="sc-val font-mono">₹{item.totalRepayment.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Section 6: Credit Builder Bridge (Call to Action) */}
      <Card className="credit-builder-bridge-card">
        <div className="bridge-content">
          <div className="bridge-icon-wrapper">
            <Sparkles size={26} color="var(--brand-accent)" />
          </div>
          <div className="bridge-text-block">
            <div className="bridge-tag">
              <TrendingUp size={13} />
              <span>Credit Readiness Pathway</span>
            </div>
            <h3 className="bridge-title">Want to improve your borrowing capacity?</h3>
            <p className="bridge-description">
              Strengthening cash flow, maintaining consistent supplier payment cadences, and
              curbing discretionary trade costs can directly elevate your credit score and unlock
              formal institutional underwriting lines.
            </p>
          </div>
          <div className="bridge-action">
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={16} />}
              onClick={() => onNavigateTab?.('credit-builder')}
              className="bridge-cta-btn"
            >
              Open Credit Builder
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
