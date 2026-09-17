/*
 * Explainable Credit Assessment Engine
 * ======================================
 *
 * Transparent, deterministic credit assessment derived from financial metrics.
 * No LLM calls, no random numbers, no arbitrary scores.
 * Every score has an explicit mathematical reason.
 *
 * Designed for KiranaCredit AI — MSME credit assessment prototype.
 */

import {
  FinancialAnalysisResult,
} from './financialEngine';

// ============================================================
// RESULT INTERFACES
// ============================================================

/** Single factor breakdown within the health score. */
export interface FactorBreakdown {
  name: string;
  weight: number;
  rawMetrics: Record<string, number>;
  /** Factor score normalized to 0-1 range. Multiply by 100 for percentage display. */
  normalizedScore: number;
  /** Weighted contribution to overall score on 0-100 scale. */
  weightedContribution: number;
  explanation: string;
}

/** Descriptive signal (positive or risk). */
export interface ExplanationSignal {
  title: string;
  explanation: string;
  evidence: string;
  impact: 'positive' | 'risk' | 'neutral';
}

/** Credit capacity assessment. */
export interface CreditCapacity {
  maximumAffordableEMI: number;
  safeBorrowingCapacity: number;
  assumedInterestRate: number;
  assumedTenureMonths: number;
  recommendedLoanRange: {
    minimum: number;
    maximum: number;
    suggested: number;
  };
  explanation: string;
}

/** Complete credit assessment result. */
export interface CreditAssessmentResult {
  overallScore: number;
  factorBreakdown: FactorBreakdown[];
  weights: Record<string, number>;
  riskBand: string;
  riskBandDescription: string;
  positiveSignals: ExplanationSignal[];
  riskSignals: ExplanationSignal[];
  creditCapacity: CreditCapacity;
}

// ============================================================
// HELPER: SAFE DIVISION
// ============================================================

function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

// ============================================================
// HELPER: CLAMP
// ============================================================

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

// ============================================================
// FACTOR WEIGHTS (must total 100%)
// ============================================================

const WEIGHTS = {
  cashFlowStability: 0.30,
  repaymentDiscipline: 0.25,
  growthAndMargins: 0.20,
  dependencyConcentration: 0.15,
  bankingDigitalContinuity: 0.10,
};

/** Validate that weights total exactly 1.0 (100%). */
function validateWeights(): boolean {
  const total =
    WEIGHTS.cashFlowStability +
    WEIGHTS.repaymentDiscipline +
    WEIGHTS.growthAndMargins +
    WEIGHTS.dependencyConcentration +
    WEIGHTS.bankingDigitalContinuity;
  return Math.abs(total - 1.0) < 0.0001;
}

// ============================================================
// RISK BANDS
// ============================================================

interface RiskBand {
  min: number;
  max: number;
  label: string;
  description: string;
}

const RISK_BANDS: RiskBand[] = [
  { min: 0, max: 39, label: 'High Financial Pressure', description: 'Merchant shows significant financial stress. Cash flow, repayment capacity, or growth metrics indicate elevated risk.' },
  { min: 40, max: 59, label: 'Moderate Financial Pressure', description: 'Merchant has some financial stability but faces notable pressure in one or more areas.' },
  { min: 60, max: 79, label: 'Healthy Financial Profile', description: 'Merchant demonstrates solid financial fundamentals with manageable risk.' },
  { min: 80, max: 100, label: 'Strong Financial Profile', description: 'Merchant shows strong cash flow, repayment discipline, and growth indicators.' },
];

function getRiskBand(score: number): RiskBand {
  for (const band of RISK_BANDS) {
    if (score >= band.min && score <= band.max) return band;
  }
  return RISK_BANDS[0]; // fallback
}

// ============================================================
// FACTOR 1: CASH FLOW STABILITY (30%)
// ============================================================

/**
 * Cash Flow Stability Factor
 *
 * Weight: 30%
 *
 * Sub-components:
 *   1. Volatility Score (40%): Lower CV = higher score
 *      Formula: 1 - min(CV, 2) / 2
 *      Maps CV 0→score 1.0, CV 2→score 0.0
 *
 *   2. Positive Months Ratio (40%): % of months with positive net cash flow
 *      Formula: positiveMonths / totalMonths
 *
 *   3. Cash Surplus Component (20%): Sign-based bonus/penalty
 *      Formula: 0.5 + sign(surplus) * 0.5
 *      Positive surplus → 1.0, Negative surplus → 0.0
 *
 * Combined: (volatilityScore * 0.4 + positiveMonthsRatio * 0.4 + surplusComponent * 0.2) * 100
 */
function calculateCashFlowStabilityFactor(
  analysis: FinancialAnalysisResult
): FactorBreakdown {
  const cv = analysis.cashFlowVolatility.coefficientOfVariation;
  const months = analysis.monthlyMetrics;

  // Sub-component 1: Volatility Score
  const volatilityScore = 1 - clamp(cv, 0, 2) / 2;

  // Sub-component 2: Positive Months Ratio
  let positiveMonths = 0;
  for (const m of months) {
    if (m.netCashFlow > 0) positiveMonths++;
  }
  const positiveMonthsRatio = safeDivide(positiveMonths, months.length);

  // Sub-component 3: Cash Surplus Component
  const surplusComponent = analysis.cashSurplus > 0 ? 1.0 : 0.0;

  // Combined factor score (0-1)
  const combinedScore =
    volatilityScore * 0.4 +
    positiveMonthsRatio * 0.4 +
    surplusComponent * 0.2;

  const normalizedScore = Math.round(combinedScore * 100) / 100;

  return {
    name: 'Cash Flow Stability',
    weight: WEIGHTS.cashFlowStability,
    rawMetrics: {
      coefficientOfVariation: cv,
      positiveMonths,
      totalMonths: months.length,
      cashSurplus: analysis.cashSurplus,
    },
    normalizedScore,
    weightedContribution: Math.round(normalizedScore * WEIGHTS.cashFlowStability * 100),
    explanation: `Cash flow volatility (CV=${cv}) contributes ${Math.round(volatilityScore * 100)}% to this factor. ${positiveMonths} of ${months.length} months show positive net cash flow. Cash surplus is ${analysis.cashSurplus >= 0 ? 'positive' : 'negative'} at ₹${Math.abs(analysis.cashSurplus).toLocaleString()}.`,
  };
}

// ============================================================
// FACTOR 2: REPAYMENT DISCIPLINE (25%)
// ============================================================

/**
 * Repayment Discipline Factor
 *
 * Weight: 25%
 *
 * Sub-components:
 *   1. Debt Burden Score (50%): Lower debt burden = higher score
 *      Formula: max(0, 1 - debtBurdenRatio * 2)
 *      0% debt burden → score 1.0, 50%+ → score 0.0
 *
 *   2. Supplier Regularity Score (50%): Higher regularity = higher score
 *      Formula: regularityIndex (already 0-1 from financial engine)
 *
 * Combined: (debtBurdenScore * 0.5 + supplierRegularity * 0.5) * 100
 *
 * Note: This factor reflects available payment discipline signals.
 * It does NOT represent traditional bureau credit history.
 */
function calculateRepaymentDisciplineFactor(
  analysis: FinancialAnalysisResult
): FactorBreakdown {
  const debtBurden = analysis.debtBurdenRatio;
  const supplierRegularity = analysis.supplierPaymentRegularity.regularityIndex;

  // Sub-component 1: Debt Burden Score
  const debtBurdenScore = Math.max(0, 1 - debtBurden * 2);

  // Sub-component 2: Supplier Regularity Score (already 0-1)
  const supplierRegularityScore = supplierRegularity;

  // Combined factor score (0-1)
  const combinedScore =
    debtBurdenScore * 0.5 +
    supplierRegularityScore * 0.5;

  const normalizedScore = Math.round(combinedScore * 100) / 100;

  return {
    name: 'Repayment Discipline',
    weight: WEIGHTS.repaymentDiscipline,
    rawMetrics: {
      debtBurdenRatio: debtBurden,
      supplierRegularityIndex: supplierRegularity,
      supplierPaymentCount: analysis.supplierPaymentRegularity.supplierPaymentCount,
    },
    normalizedScore,
    weightedContribution: Math.round(normalizedScore * WEIGHTS.repaymentDiscipline * 100),
    explanation: `Debt burden ratio is ${(debtBurden * 100).toFixed(2)}% (score: ${Math.round(debtBurdenScore * 100)}%). Supplier payment regularity index is ${supplierRegularity.toFixed(4)} based on ${analysis.supplierPaymentRegularity.supplierPaymentCount} payments.`,
  };
}

// ============================================================
// FACTOR 3: GROWTH & MARGINS (20%)
// ============================================================

/**
 * Growth & Margins Factor
 *
 * Weight: 20%
 *
 * Sub-components:
 *   1. Growth Score (50%): Revenue growth rate normalized
 *      Formula: clamp((avgGrowth + 20) / 40, 0, 1)
 *      Maps -20% growth → 0.0, 0% → 0.5, +20% → 1.0
 *
 *   2. Margin Score (50%): Expense-to-income ratio inverse
 *      Formula: max(0, 1 - expenseToIncomeRatio)
 *      Ratio 0 → score 1.0, Ratio 1+ → score 0.0
 *
 * Combined: (growthScore * 0.5 + marginScore * 0.5) * 100
 */
function calculateGrowthAndMarginsFactor(
  analysis: FinancialAnalysisResult
): FactorBreakdown {
  const avgGrowth = analysis.revenueGrowth.averageGrowthRate;
  const expenseRatio = analysis.expenseToIncomeRatio;

  // Sub-component 1: Growth Score
  // Maps -20% to +20% growth → 0 to 1
  const growthScore = clamp((avgGrowth + 20) / 40, 0, 1);

  // Sub-component 2: Margin Score
  // Ratio 0 → 1.0, Ratio 1+ → 0.0
  const marginScore = Math.max(0, 1 - expenseRatio);

  // Combined factor score (0-1)
  const combinedScore =
    growthScore * 0.5 +
    marginScore * 0.5;

  const normalizedScore = Math.round(combinedScore * 100) / 100;

  return {
    name: 'Growth & Margins',
    weight: WEIGHTS.growthAndMargins,
    rawMetrics: {
      averageGrowthRate: avgGrowth,
      expenseToIncomeRatio: expenseRatio,
      netOperatingCashFlow: analysis.netOperatingCashFlow,
    },
    normalizedScore,
    weightedContribution: Math.round(normalizedScore * WEIGHTS.growthAndMargins * 100),
    explanation: `Average revenue growth is ${avgGrowth.toFixed(2)}% (score: ${Math.round(growthScore * 100)}%). Expense-to-income ratio is ${(expenseRatio * 100).toFixed(2)}% (score: ${Math.round(marginScore * 100)}%).`,
  };
}

// ============================================================
// FACTOR 4: DEPENDENCY / CONCENTRATION (15%)
// ============================================================

/**
 * Dependency / Concentration Factor
 *
 * Weight: 15%
 *
 * IMPORTANT: Customer-level revenue concentration is NOT available
 * from this dataset (no customer identity in transaction records).
 *
 * This factor uses Payment Method Concentration instead,
 * clearly labeled as such.
 *
 * Sub-component:
 *   1. Payment Channel Concentration (100%): Max channel ratio
 *      Formula: max(0, 1 - max(0, maxChannelRatio - 0.7) / 0.3)
 *      Max channel 70% → score 1.0, 100% → score 0.0
 *
 * If no sales data exists, returns neutral score of 0.5.
 */
function calculateDependencyConcentrationFactor(
  analysis: FinancialAnalysisResult
): FactorBreakdown {
  const pcc = analysis.revenueConcentration.paymentChannelConcentration;

  // Find the dominant payment channel ratio
  const maxChannelRatio = Math.max(
    pcc.upiRatio,
    pcc.cashRatio,
    pcc.bankTransferRatio
  );

  // Score: lower concentration = higher score
  // Maps max channel ratio 70% → 1.0, 100% → 0.0
  const concentrationScore = Math.max(0, 1 - Math.max(0, maxChannelRatio - 0.7) / 0.3);

  const normalizedScore = Math.round(concentrationScore * 100) / 100;

  return {
    name: 'Payment Method Concentration',
    weight: WEIGHTS.dependencyConcentration,
    rawMetrics: {
      upiRatio: pcc.upiRatio,
      cashRatio: pcc.cashRatio,
      bankTransferRatio: pcc.bankTransferRatio,
      maxChannelRatio,
    },
    normalizedScore,
    weightedContribution: Math.round(normalizedScore * WEIGHTS.dependencyConcentration * 100),
    explanation: `Payment channel concentration: UPI ${(pcc.upiRatio * 100).toFixed(1)}%, Cash ${(pcc.cashRatio * 100).toFixed(1)}%, Bank Transfer ${(pcc.bankTransferRatio * 100).toFixed(1)}%. Dominant channel is ${Math.round(maxChannelRatio * 100)}%. Customer-level concentration is not available from this dataset.`,
  };
}

// ============================================================
// FACTOR 5: BANKING / DIGITAL CONTINUITY (10%)
// ============================================================

/**
 * Banking / Digital Continuity Factor
 *
 * Weight: 10%
 *
 * Uses UPI transaction ratio as a proxy for digital transaction continuity.
 * Higher UPI usage indicates more digitally recorded transactions.
 *
 * Formula: upiTransactionRatio (already 0-1 from financial engine)
 *
 * Note: This does NOT represent bank account connectivity or
 * banking API access. It measures digital transaction continuity.
 */
function calculateBankingDigitalContinuityFactor(
  analysis: FinancialAnalysisResult
): FactorBreakdown {
  const upiRatio = analysis.digitalTransactionRatio.upiTransactionRatio;

  // Direct use of UPI ratio as factor score (0-1)
  const normalizedScore = Math.round(upiRatio * 100) / 100;

  return {
    name: 'Digital Transaction Continuity',
    weight: WEIGHTS.bankingDigitalContinuity,
    rawMetrics: {
      upiTransactionRatio: upiRatio,
      upiSalesCount: analysis.digitalTransactionRatio.upiSalesCount,
      totalSalesCount: analysis.digitalTransactionRatio.totalSalesCount,
    },
    normalizedScore,
    weightedContribution: Math.round(normalizedScore * WEIGHTS.bankingDigitalContinuity * 100),
    explanation: `${Math.round(upiRatio * 100)}% of sales transactions use UPI (${analysis.digitalTransactionRatio.upiSalesCount} of ${analysis.digitalTransactionRatio.totalSalesCount}). This indicates ${upiRatio > 0.5 ? 'strong' : 'limited'} digital transaction continuity.`,
  };
}

// ============================================================
// POSITIVE SIGNALS
// ============================================================

/**
 * Generates evidence-based positive signals from financial metrics.
 * Each signal is only generated when the underlying data supports it.
 */
function generatePositiveSignals(
  analysis: FinancialAnalysisResult
): ExplanationSignal[] {
  const signals: ExplanationSignal[] = [];

  // Signal: Consistent supplier payments
  if (analysis.supplierPaymentRegularity.regularityIndex >= 0.8) {
    signals.push({
      title: 'Consistent Supplier Payments',
      explanation: `Supplier payments occur at highly consistent intervals (regularity index: ${analysis.supplierPaymentRegularity.regularityIndex.toFixed(4)}).`,
      evidence: `Regularity index ${analysis.supplierPaymentRegularity.regularityIndex.toFixed(4)} across ${analysis.supplierPaymentRegularity.supplierPaymentCount} payments with average interval of ${analysis.supplierPaymentRegularity.averageIntervalDays.toFixed(1)} days.`,
      impact: 'positive',
    });
  }

  // Signal: Strong digital transaction continuity
  if (analysis.digitalTransactionRatio.upiTransactionRatio >= 0.6) {
    signals.push({
      title: 'Strong Digital Transaction Continuity',
      explanation: `${Math.round(analysis.digitalTransactionRatio.upiTransactionRatio * 100)}% of sales are digitally recorded through UPI.`,
      evidence: `${analysis.digitalTransactionRatio.upiSalesCount} of ${analysis.digitalTransactionRatio.totalSalesCount} sales transactions use UPI, totaling ₹${analysis.digitalTransactionRatio.upiSalesValue.toLocaleString()}.`,
      impact: 'positive',
    });
  }

  // Signal: Positive operating cash flow
  if (analysis.netOperatingCashFlow > 0) {
    signals.push({
      title: 'Positive Operating Cash Flow',
      explanation: 'Operating revenue exceeds operating expenses, generating positive net cash flow.',
      evidence: `Net operating cash flow is ₹${analysis.netOperatingCashFlow.toLocaleString()} (Revenue: ₹${analysis.totalRevenue.toLocaleString()}, Expenses: ₹${analysis.totalExpenses.toLocaleString()}).`,
      impact: 'positive',
    });
  }

  // Signal: Consistent positive monthly cash flow
  let positiveMonthCount = 0;
  for (const m of analysis.monthlyMetrics) {
    if (m.netCashFlow > 0) positiveMonthCount++;
  }
  const positiveMonthRatio = safeDivide(positiveMonthCount, analysis.monthlyMetrics.length);
  if (positiveMonthRatio >= 0.7) {
    signals.push({
      title: 'Consistent Monthly Cash Flow',
      explanation: `Operating cash flow remains positive across ${positiveMonthCount} of ${analysis.monthlyMetrics.length} months.`,
      evidence: `${Math.round(positiveMonthRatio * 100)}% of months show positive net cash flow.`,
      impact: 'positive',
    });
  }

  // Signal: Low debt burden
  if (analysis.debtBurdenRatio <= 0.1 && analysis.debtBurdenRatio >= 0) {
    signals.push({
      title: 'Low Debt Burden',
      explanation: 'Debt repayments consume a small share of operating revenue.',
      evidence: `Debt burden ratio is ${(analysis.debtBurdenRatio * 100).toFixed(2)}%, indicating limited debt obligation relative to revenue.`,
      impact: 'positive',
    });
  }

  // Signal: Positive cash surplus
  if (analysis.cashSurplus > 0) {
    signals.push({
      title: 'Positive Cash Surplus',
      explanation: 'After all operating costs and debt obligations, the merchant retains positive cash surplus.',
      evidence: `Cash surplus is ₹${analysis.cashSurplus.toLocaleString()}.`,
      impact: 'positive',
    });
  }

  // Signal: Revenue growth
  if (analysis.revenueGrowth.averageGrowthRate > 2) {
    signals.push({
      title: 'Revenue Growth Trend',
      explanation: `Average monthly revenue growth is ${analysis.revenueGrowth.averageGrowthRate.toFixed(2)}%, indicating an upward revenue trend.`,
      evidence: `Month-over-month average growth rate: ${analysis.revenueGrowth.averageGrowthRate.toFixed(2)}%.`,
      impact: 'positive',
    });
  }

  return signals;
}

// ============================================================
// RISK SIGNALS
// ============================================================

/**
 * Generates evidence-based risk signals from financial metrics.
 * Each signal is only generated when the underlying data supports it.
 * Uses cautious wording: "observed risk signal", "financial pressure".
 */
function generateRiskSignals(
  analysis: FinancialAnalysisResult
): ExplanationSignal[] {
  const signals: ExplanationSignal[] = [];

  // Signal: High cash-flow volatility
  if (analysis.cashFlowVolatility.coefficientOfVariation > 1.0) {
    signals.push({
      title: 'Elevated Cash-Flow Volatility',
      explanation: 'Month-to-month cash flow varies materially, indicating unstable cash positions.',
      evidence: `Cash flow coefficient of variation is ${analysis.cashFlowVolatility.coefficientOfVariation.toFixed(4)} (standard deviation: ₹${analysis.cashFlowVolatility.absoluteVolatility.toLocaleString()}).`,
      impact: 'risk',
    });
  }

  // Signal: Negative cash surplus
  if (analysis.cashSurplus < 0) {
    signals.push({
      title: 'Negative Cash Surplus',
      explanation: 'Operating expenses and debt obligations exceed operating revenue, resulting in a cash deficit.',
      evidence: `Cash surplus is ₹${analysis.cashSurplus.toLocaleString()} (Revenue: ₹${analysis.totalRevenue.toLocaleString()}, Expenses: ₹${analysis.totalExpenses.toLocaleString()}).`,
      impact: 'risk',
    });
  }

  // Signal: High expense-to-income ratio
  if (analysis.expenseToIncomeRatio > 1.0) {
    signals.push({
      title: 'Expenses Exceed Revenue',
      explanation: 'Total operating expenses exceed total operating revenue, indicating unsustainable cost structure.',
      evidence: `Expense-to-income ratio is ${(analysis.expenseToIncomeRatio * 100).toFixed(2)}%.`,
      impact: 'risk',
    });
  }

  // Signal: Significant debt burden
  if (analysis.debtBurdenRatio > 0.15) {
    signals.push({
      title: 'Significant Debt Burden',
      explanation: 'Debt repayments consume a notable share of operating revenue.',
      evidence: `Debt burden ratio is ${(analysis.debtBurdenRatio * 100).toFixed(2)}%, meaning this portion of revenue goes to debt repayment.`,
      impact: 'risk',
    });
  }

  // Signal: Irregular supplier payments
  if (analysis.supplierPaymentRegularity.regularityIndex < 0.5 &&
      analysis.supplierPaymentRegularity.supplierPaymentCount >= 2) {
    signals.push({
      title: 'Irregular Supplier Payment Intervals',
      explanation: 'Supplier payment timing shows significant irregularity, suggesting inconsistent cash flow management.',
      evidence: `Supplier regularity index is ${analysis.supplierPaymentRegularity.regularityIndex.toFixed(4)} with standard deviation of ${analysis.supplierPaymentRegularity.intervalStandardDeviation.toFixed(1)} days.`,
      impact: 'risk',
    });
  }

  // Signal: Limited digital transaction continuity
  if (analysis.digitalTransactionRatio.upiTransactionRatio < 0.3) {
    signals.push({
      title: 'Limited Digital Transaction Continuity',
      explanation: 'Most sales are cash-based, reducing digital traceability of revenue.',
      evidence: `Only ${Math.round(analysis.digitalTransactionRatio.upiTransactionRatio * 100)}% of sales use UPI (${analysis.digitalTransactionRatio.upiSalesCount} of ${analysis.digitalTransactionRatio.totalSalesCount}).`,
      impact: 'risk',
    });
  }

  // Signal: Negative revenue growth
  if (analysis.revenueGrowth.averageGrowthRate < -5) {
    signals.push({
      title: 'Revenue Decline Trend',
      explanation: `Average monthly revenue growth is ${analysis.revenueGrowth.averageGrowthRate.toFixed(2)}%, indicating a declining revenue trend.`,
      evidence: `Month-over-month average growth rate: ${analysis.revenueGrowth.averageGrowthRate.toFixed(2)}%.`,
      impact: 'risk',
    });
  }

  // Signal: Low positive month ratio
  let positiveMonthCount = 0;
  for (const m of analysis.monthlyMetrics) {
    if (m.netCashFlow > 0) positiveMonthCount++;
  }
  const positiveMonthRatio = safeDivide(positiveMonthCount, analysis.monthlyMetrics.length);
  if (positiveMonthRatio < 0.5 && analysis.monthlyMetrics.length > 0) {
    signals.push({
      title: 'Infrequent Positive Monthly Cash Flow',
      explanation: `Only ${positiveMonthCount} of ${analysis.monthlyMetrics.length} months show positive net cash flow.`,
      evidence: `${Math.round(positiveMonthRatio * 100)}% of months are cash-flow positive.`,
      impact: 'risk',
    });
  }

  return signals;
}

// ============================================================
// CREDIT CAPACITY
// ============================================================

/**
 * Calculates deterministic credit capacity from financial metrics.
 *
 * Formulas:
 *   1. Maximum Affordable EMI = max(0, cashSurplus × 0.30)
 *      Uses 30% surplus cash-flow buffer.
 *      If cash surplus is negative, EMI is 0.
 *
 *   2. Safe Borrowing Capacity uses standard amortization:
 *      P = EMI × ((1+r)^n - 1) / (r × (1+r)^n)
 *      where r = monthly interest rate, n = tenure in months
 *
 *      Assumed: 18% annual interest (1.5% monthly), 24 months tenure
 *
 *   3. Recommended Loan Range:
 *      Minimum: 50% of safe borrowing capacity
 *      Maximum: 100% of safe borrowing capacity
 *      Suggested: 75% of safe borrowing capacity
 */
function calculateCreditCapacity(
  analysis: FinancialAnalysisResult
): CreditCapacity {
  const ANNUAL_INTEREST_RATE = 0.18; // 18% per annum
  const MONTHLY_RATE = ANNUAL_INTEREST_RATE / 12; // 1.5% per month
  const TENURE_MONTHS = 24;

  // Maximum Affordable EMI
  const maxAffordableEMI = Math.max(0, analysis.cashSurplus * 0.30);

  // Safe Borrowing Capacity using amortization formula
  // P = EMI × ((1+r)^n - 1) / (r × (1+r)^n)
  let safeBorrowingCapacity = 0;
  if (maxAffordableEMI > 0 && MONTHLY_RATE > 0) {
    const factor = Math.pow(1 + MONTHLY_RATE, TENURE_MONTHS);
    safeBorrowingCapacity = maxAffordableEMI * ((factor - 1) / (MONTHLY_RATE * factor));
  }

  // Recommended loan range
  const minRecommended = Math.round(safeBorrowingCapacity * 0.5 / 1000) * 1000;
  const maxRecommended = Math.round(safeBorrowingCapacity / 1000) * 1000;
  const suggested = Math.round(safeBorrowingCapacity * 0.75 / 1000) * 1000;

  return {
    maximumAffordableEMI: Math.round(maxAffordableEMI),
    safeBorrowingCapacity: Math.round(safeBorrowingCapacity),
    assumedInterestRate: ANNUAL_INTEREST_RATE,
    assumedTenureMonths: TENURE_MONTHS,
    recommendedLoanRange: {
      minimum: minRecommended,
      maximum: maxRecommended,
      suggested,
    },
    explanation: `Based on cash surplus of ₹${analysis.cashSurplus.toLocaleString()}, the maximum affordable EMI is ₹${Math.round(maxAffordableEMI).toLocaleString()} (30% buffer). At ${ANNUAL_INTEREST_RATE * 100}% annual interest over ${TENURE_MONTHS} months, the indicative borrowing capacity is ₹${Math.round(safeBorrowingCapacity).toLocaleString()}.`,
  };
}

// ============================================================
// MAIN ASSESSMENT FUNCTION
// ============================================================

/**
 * Runs complete transparent credit assessment on a financial analysis result.
 *
 * Given identical FinancialAnalysisResult, this function always returns
 * identical results (deterministic).
 *
 * @param analysis - FinancialAnalysisResult from the financial engine
 * @returns CreditAssessmentResult with scores, signals, and capacity
 */
export function assessCredit(analysis: FinancialAnalysisResult): CreditAssessmentResult {
  // Validate weights
  if (!validateWeights()) {
    throw new Error('Factor weights do not total 100%. Check WEIGHTS constant.');
  }

  // Calculate all five factors
  const factor1 = calculateCashFlowStabilityFactor(analysis);
  const factor2 = calculateRepaymentDisciplineFactor(analysis);
  const factor3 = calculateGrowthAndMarginsFactor(analysis);
  const factor4 = calculateDependencyConcentrationFactor(analysis);
  const factor5 = calculateBankingDigitalContinuityFactor(analysis);

  const factorBreakdown = [factor1, factor2, factor3, factor4, factor5];

  // Calculate overall score on 0-100 scale
  const overallScore = Math.round(
    (factor1.normalizedScore * WEIGHTS.cashFlowStability +
     factor2.normalizedScore * WEIGHTS.repaymentDiscipline +
     factor3.normalizedScore * WEIGHTS.growthAndMargins +
     factor4.normalizedScore * WEIGHTS.dependencyConcentration +
     factor5.normalizedScore * WEIGHTS.bankingDigitalContinuity) * 100
  );

  // Determine risk band
  const band = getRiskBand(overallScore);

  // Generate signals
  const positiveSignals = generatePositiveSignals(analysis);
  const riskSignals = generateRiskSignals(analysis);

  // Calculate credit capacity
  const creditCapacity = calculateCreditCapacity(analysis);

  return {
    overallScore,
    factorBreakdown,
    weights: { ...WEIGHTS },
    riskBand: band.label,
    riskBandDescription: band.description,
    positiveSignals,
    riskSignals,
    creditCapacity,
  };
}
