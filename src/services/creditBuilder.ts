/*
 * Credit Builder Service
 * =======================
 *
 * Pure, deterministic credit improvement service for KiranaCredit AI.
 * Translates financial metrics and credit assessment scores into actionable,
 * prioritized improvement areas for Indian MSMEs and Kirana merchants.
 *
 * Principles:
 * - Deterministic: same input always produces identical recommendations.
 * - Evidence-based: every recommendation cites concrete metrics.
 * - No customer concentration: strictly uses payment methods; never fabricates customer identity.
 * - No unsupported promises: cautious phrasing ("may improve", "could strengthen").
 * - Pure service: no side effects, no React, no external APIs.
 */

import { FinancialAnalysisResult } from './financialEngine';
import { CreditAssessmentResult, FactorBreakdown } from './creditScoring';
import {
  CreditActionItem,
  CreditBuilderPlan,
  CreditBuilderProgress,
  ReadinessSummary,
  CreditReadinessStage,
  ActionPriority,
} from '../types/creditBuilder';

// ============================================================
// BENCHMARK STANDARDS (Derived from Ravi General Store baseline)
// ============================================================

const BENCHMARK_STANDARDS = {
  digitalTransactionRatio: 0.88, // Ravi: 88.2% UPI
  supplierRegularityIndex: 1.0,  // Ravi: 1.0 (bi-weekly schedule)
  cashFlowVolatilityCV: 0.27,    // Ravi: 0.2688 CV
  debtBurdenRatio: 0.0,          // Ravi: 0% debt burden
  expenseToIncomeRatio: 0.85,    // Standard prudent operating ratio
  monthlyGrowthRate: 2.35,       // Ravi: 2.35% average MoM growth
  dominantChannelRatio: 0.70,    // Balanced distribution
};

// ============================================================
// HELPER: SAFE FORMATTERS
// ============================================================

function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  const rounded = Math.round(amount);
  return `₹${rounded.toLocaleString('en-IN')}`;
}

function formatPercent(decimalValue: number): string {
  if (!Number.isFinite(decimalValue)) return '0.0%';
  return `${(decimalValue * 100).toFixed(1)}%`;
}

// ============================================================
// 1. RECOMMENDATION EVALUATORS
// ============================================================

/** Evaluates Expense Management action item. */
function evaluateExpenseManagement(analysis: FinancialAnalysisResult): CreditActionItem {
  const ratio = analysis.expenseToIncomeRatio;
  const expenses = analysis.totalExpenses;
  const revenue = analysis.totalRevenue;

  let priority: ActionPriority = 'LOW';
  let description: string;

  if (ratio > 1.2) {
    priority = 'HIGH';
    description =
      'Operating and procurement outlays significantly exceed customer revenue. Rebalance purchase orders and negotiate supplier payment credit terms to stem operational deficit.';
  } else if (ratio > 0.85) {
    priority = 'MEDIUM';
    description =
      'Operating expenses consume a substantial share of sales income. Audit recurring overheads to expand monthly operating margins.';
  } else {
    priority = 'LOW';
    description =
      'Operating expense ratio is within a manageable range. Maintain disciplined procurement controls as transaction volume scales.';
  }

  return {
    id: 'expense-management',
    title: 'Rationalize Operating & Procurement Expenses',
    category: 'EXPENSE_MANAGEMENT',
    priority,
    status: 'NOT_STARTED',
    description,
    evidence: `Operating expenses represent ${(ratio * 100).toFixed(1)}% of recorded operating revenue (${formatCurrency(expenses)} expenses vs ${formatCurrency(revenue)} revenue).`,
    rationale:
      'High expense-to-income ratios compress cash margins and directly limit the free cash surplus required to comfortably service loan repayments.',
    currentValue: Math.round(ratio * 10000) / 10000,
    targetValue: BENCHMARK_STANDARDS.expenseToIncomeRatio,
    benchmarkValue: BENCHMARK_STANDARDS.expenseToIncomeRatio,
    unit: 'ratio',
    displayCurrent: formatPercent(ratio),
    displayTarget: `≤ ${formatPercent(BENCHMARK_STANDARDS.expenseToIncomeRatio)}`,
    displayBenchmark: formatPercent(BENCHMARK_STANDARDS.expenseToIncomeRatio),
    potentialImpact:
      'May improve the Growth & Margins factor and restore positive cash surplus for loan qualification.',
  };
}

/** Evaluates Cash Flow Stability action item. */
function evaluateCashFlowStability(analysis: FinancialAnalysisResult): CreditActionItem {
  const cv = analysis.cashFlowVolatility.coefficientOfVariation;
  const surplus = analysis.cashSurplus;

  let priority: ActionPriority = 'LOW';
  let description: string;

  if (surplus < 0 || cv > 1.0) {
    priority = 'HIGH';
    description =
      'Significant cash-flow variability and negative net operating surplus observed. Establish a 30-day operating buffer and align inventory reorders with peak sales periods.';
  } else if (cv > 0.4) {
    priority = 'MEDIUM';
    description =
      'Moderate month-to-month cash flow fluctuations detected. Smooth out larger bulk purchases across consecutive cycles.';
  } else {
    priority = 'LOW';
    description =
      'Cash flow volatility is well managed. Continue monitoring seasonal dips and maintain existing cash buffer reserves.';
  }

  return {
    id: 'cash-flow-stability',
    title: 'Stabilize Monthly Cash Flow & Build Reserves',
    category: 'CASH_FLOW',
    priority,
    status: 'NOT_STARTED',
    description,
    evidence: `Cash flow coefficient of variation is ${cv.toFixed(2)}, with recorded cash surplus at ${formatCurrency(surplus)}.`,
    rationale:
      'Lenders prioritize stable, predictable month-over-month surplus cash flows to ensure dependable debt service coverage.',
    currentValue: cv,
    targetValue: 0.4,
    benchmarkValue: BENCHMARK_STANDARDS.cashFlowVolatilityCV,
    unit: 'CV',
    displayCurrent: cv.toFixed(2),
    displayTarget: '≤ 0.40',
    displayBenchmark: BENCHMARK_STANDARDS.cashFlowVolatilityCV.toFixed(2),
    potentialImpact:
      'Could strengthen the Cash Flow Stability factor (30% weight) and enhance overall borrowing capacity.',
  };
}

/** Evaluates Debt Burden Management action item. */
function evaluateDebtBurden(analysis: FinancialAnalysisResult): CreditActionItem {
  const debtRatio = analysis.debtBurdenRatio;
  const totalDebtRepayments = Math.round(debtRatio * analysis.totalRevenue);

  let priority: ActionPriority = 'LOW';
  let description: string;

  if (debtRatio > 0.15) {
    priority = 'HIGH';
    description =
      'Existing debt repayments consume an elevated share of business revenue. Avoid taking on additional short-term obligations until existing dues amortize.';
  } else if (debtRatio > 0.05) {
    priority = 'MEDIUM';
    description =
      'Moderate debt commitments exist. Consolidate fragmented credit facilities to lower monthly debt service outflow.';
  } else {
    priority = 'LOW';
    description =
      'Current debt servicing obligations are low or non-existent, leaving headroom for future structured credit.';
  }

  return {
    id: 'debt-burden-management',
    title: 'Manage & Consolidate Existing Debt Obligations',
    category: 'DEBT_BURDEN',
    priority,
    status: 'NOT_STARTED',
    description,
    evidence: `Existing debt repayments account for ${(debtRatio * 100).toFixed(1)}% of operating revenue (${formatCurrency(totalDebtRepayments)} total debt servicing).`,
    rationale:
      'High debt-to-income commitments reduce the debt service coverage ratio (DSCR), lowering the borrower’s maximum affordable loan ticket.',
    currentValue: Math.round(debtRatio * 10000) / 10000,
    targetValue: 0.1,
    benchmarkValue: BENCHMARK_STANDARDS.debtBurdenRatio,
    unit: 'ratio',
    displayCurrent: formatPercent(debtRatio),
    displayTarget: '≤ 10.0%',
    displayBenchmark: formatPercent(BENCHMARK_STANDARDS.debtBurdenRatio),
    potentialImpact:
      'May improve the Repayment Discipline factor and increase maximum affordable monthly EMI.',
  };
}

/** Evaluates Supplier Payment Regularity action item. */
function evaluateSupplierRegularity(analysis: FinancialAnalysisResult): CreditActionItem {
  const regularity = analysis.supplierPaymentRegularity.regularityIndex;
  const count = analysis.supplierPaymentRegularity.supplierPaymentCount;
  const avgDays = analysis.supplierPaymentRegularity.averageIntervalDays;
  const stddevDays = analysis.supplierPaymentRegularity.intervalStandardDeviation;

  let priority: ActionPriority = 'LOW';
  let description: string;

  if (count >= 2 && regularity < 0.6) {
    priority = 'HIGH';
    description =
      'Supplier settlements occur at erratic intervals, signaling payment friction. Establish fixed weekly or bi-weekly distributor settlement schedules.';
  } else if (count >= 2 && regularity < 0.85) {
    priority = 'MEDIUM';
    description =
      'Minor timing variance observed in supplier settlements. Formalize fixed clearing days to demonstrate rigorous trade discipline.';
  } else if (count >= 2) {
    priority = 'LOW';
    description =
      'Supplier payments follow a remarkably consistent schedule. Maintain this schedule to preserve high trade credit credibility.';
  } else {
    priority = 'MEDIUM';
    description =
      'Insufficient supplier payment frequency recorded. Record supplier transactions through bank transfer to establish trade regularity.';
  }

  return {
    id: 'supplier-payment-regularity',
    title: 'Maintain Predictable Supplier Payment Cycles',
    category: 'SUPPLIER_REGULARITY',
    priority,
    status: 'NOT_STARTED',
    description,
    evidence: `Supplier payment regularity index is ${regularity.toFixed(2)} with an average interval of ${avgDays.toFixed(1)} days (std dev: ${stddevDays.toFixed(1)} days across ${count} payments).`,
    rationale:
      'Regular distributor payouts serve as a prime alternative credit proxy for commercial trade reliability and operational solvency.',
    currentValue: regularity,
    targetValue: 0.9,
    benchmarkValue: BENCHMARK_STANDARDS.supplierRegularityIndex,
    unit: 'index',
    displayCurrent: regularity.toFixed(2),
    displayTarget: '≥ 0.90',
    displayBenchmark: BENCHMARK_STANDARDS.supplierRegularityIndex.toFixed(2),
    potentialImpact:
      'Could strengthen the Repayment Discipline factor (which weights supplier regularity at 50%).',
  };
}

/** Evaluates Digital Transaction Continuity action item. */
function evaluateDigitalContinuity(analysis: FinancialAnalysisResult): CreditActionItem {
  const upiRatio = analysis.digitalTransactionRatio.upiTransactionRatio;
  const upiCount = analysis.digitalTransactionRatio.upiSalesCount;
  const totalSales = analysis.digitalTransactionRatio.totalSalesCount;
  const upiValue = analysis.digitalTransactionRatio.upiSalesValue;

  let priority: ActionPriority = 'LOW';
  let description: string;

  if (upiRatio < 0.5) {
    priority = 'HIGH';
    description =
      'Over half of customer sales remain unrecorded cash transactions. Incentivize customers to use QR/UPI codes to build a verified, digital turnover history.';
  } else if (upiRatio < 0.75) {
    priority = 'MEDIUM';
    description =
      'A notable portion of transactions occurs in cash. Expanding digital collection share will enhance the verifiable proof of daily sales.';
  } else {
    priority = 'LOW';
    description =
      'Strong digital collection discipline. Most sales are digitally recorded and verifiable through digital audit trails.';
  }

  return {
    id: 'digital-transaction-continuity',
    title: 'Increase Traceable Digital (UPI) Collections',
    category: 'DIGITAL_CONTINUITY',
    priority,
    status: 'NOT_STARTED',
    description,
    evidence: `${Math.round(upiRatio * 100)}% of customer sales transactions use UPI (${upiCount} of ${totalSales} sales, totaling ${formatCurrency(upiValue)}).`,
    rationale:
      'Verifiable digital transaction trails provide transparent, tamper-resistant proof of turnover without requiring formal audited balance sheets.',
    currentValue: Math.round(upiRatio * 10000) / 10000,
    targetValue: 0.8,
    benchmarkValue: BENCHMARK_STANDARDS.digitalTransactionRatio,
    unit: 'ratio',
    displayCurrent: formatPercent(upiRatio),
    displayTarget: '≥ 80.0%',
    displayBenchmark: formatPercent(BENCHMARK_STANDARDS.digitalTransactionRatio),
    potentialImpact:
      'May improve the Digital Transaction Continuity factor and increase algorithmic assessment confidence.',
  };
}

/** Evaluates Revenue Growth & Momentum action item. */
function evaluateRevenueGrowth(analysis: FinancialAnalysisResult): CreditActionItem {
  const avgGrowth = analysis.revenueGrowth.averageGrowthRate;

  let priority: ActionPriority = 'LOW';
  let description: string;

  if (avgGrowth < 0) {
    priority = 'HIGH';
    description =
      'Top-line sales indicate a contracting trend over the period. Review local product mix, competitive pricing, and seasonal demand alignment.';
  } else if (avgGrowth < 3.0) {
    priority = 'MEDIUM';
    description =
      'Sales growth is modest. Expanding fast-moving stock categories can help build steady month-over-month sales acceleration.';
  } else {
    priority = 'LOW';
    description =
      'Positive revenue expansion observed. Continue aligning inventory procurement with cyclical festival and seasonal demand surges.';
  }

  return {
    id: 'revenue-growth-momentum',
    title: 'Sustain Month-over-Month Revenue Momentum',
    category: 'REVENUE_GROWTH',
    priority,
    status: 'NOT_STARTED',
    description,
    evidence: `Average month-over-month revenue growth rate is currently ${avgGrowth.toFixed(2)}%.`,
    rationale:
      'Sustained revenue momentum proves healthy consumer demand and assures lenders of expanding cash absorption capability.',
    currentValue: avgGrowth,
    targetValue: 5.0,
    benchmarkValue: BENCHMARK_STANDARDS.monthlyGrowthRate,
    unit: '%',
    displayCurrent: `${avgGrowth.toFixed(2)}%`,
    displayTarget: '≥ 5.0%',
    displayBenchmark: `${BENCHMARK_STANDARDS.monthlyGrowthRate.toFixed(2)}%`,
    potentialImpact:
      'Could strengthen the Growth & Margins factor score.',
  };
}

/** Evaluates Payment Channel Diversification action item. */
function evaluatePaymentDiversification(analysis: FinancialAnalysisResult): CreditActionItem {
  const pcc = analysis.revenueConcentration.paymentChannelConcentration;
  const maxRatio = Math.max(pcc.upiRatio, pcc.cashRatio, pcc.bankTransferRatio);

  let dominantChannelName = 'UPI';
  if (pcc.cashRatio === maxRatio) dominantChannelName = 'Cash';
  else if (pcc.bankTransferRatio === maxRatio) dominantChannelName = 'Bank Transfer';

  let priority: ActionPriority = 'LOW';
  let description: string;

  if (maxRatio > 0.85) {
    priority = 'MEDIUM';
    description =
      `Business collections rely heavily on ${dominantChannelName} (${(maxRatio * 100).toFixed(1)}%). Support secondary payment modes to prevent liquidity disruption during network downtimes.`;
  } else {
    priority = 'LOW';
    description =
      'Healthy distribution across payment methods. Balanced payment reception reduces dependency on a single gateway or clearing channel.';
  }

  return {
    id: 'payment-channel-diversification',
    title: 'Diversify Inflow Channels & Balance Methods',
    category: 'PAYMENT_DIVERSIFICATION',
    priority,
    status: 'NOT_STARTED',
    description,
    evidence: `Dominant payment channel (${dominantChannelName}) represents ${(maxRatio * 100).toFixed(1)}% of sales turnover. UPI is ${(pcc.upiRatio * 100).toFixed(1)}%, Cash is ${(pcc.cashRatio * 100).toFixed(1)}%. Note: customer identity concentration is not recorded.`,
    rationale:
      'Balanced payment rails mitigate systemic payment gateway failure risks and demonstrate customer flexibility.',
    currentValue: Math.round(maxRatio * 10000) / 10000,
    targetValue: 0.75,
    benchmarkValue: BENCHMARK_STANDARDS.dominantChannelRatio,
    unit: 'ratio',
    displayCurrent: formatPercent(maxRatio),
    displayTarget: '≤ 75.0%',
    displayBenchmark: formatPercent(BENCHMARK_STANDARDS.dominantChannelRatio),
    potentialImpact:
      'May improve the Payment Method Concentration factor.',
  };
}

// ============================================================
// 2. DETERMINISTIC NEXT BEST ACTIONS SELECTION
// ============================================================

/**
 * Deterministically ranks and selects the top 3 Next Best Actions.
 *
 * Ranking criteria:
 * 1. Priority tier: HIGH (0) > MEDIUM (1) > LOW (2)
 * 2. Strategic category weight: Core solvency (Cash Flow, Expenses, Debt) > Operational (Supplier, Digital) > Market (Growth, Diversification)
 * 3. Relative gap to target: larger relative deficit ranked higher.
 */
function rankActionItems(actions: CreditActionItem[]): CreditActionItem[] {
  const priorityRank: Record<ActionPriority, number> = {
    HIGH: 0,
    MEDIUM: 1,
    LOW: 2,
  };

  const categoryWeight: Record<string, number> = {
    CASH_FLOW: 0,
    EXPENSE_MANAGEMENT: 1,
    DEBT_BURDEN: 2,
    SUPPLIER_REGULARITY: 3,
    DIGITAL_CONTINUITY: 4,
    REVENUE_GROWTH: 5,
    PAYMENT_DIVERSIFICATION: 6,
  };

  return [...actions].sort((a, b) => {
    // 1. Priority tier comparison
    const pDiff = priorityRank[a.priority] - priorityRank[b.priority];
    if (pDiff !== 0) return pDiff;

    // 2. Category importance comparison
    const cDiff = (categoryWeight[a.category] ?? 99) - (categoryWeight[b.category] ?? 99);
    if (cDiff !== 0) return cDiff;

    // 3. Alphabetical deterministic fallback
    return a.id.localeCompare(b.id);
  });
}

// ============================================================
// 3. READINESS SUMMARY EVALUATOR
// ============================================================

/**
 * Derives descriptive readiness summary from assessment results
 * without generating a competing score or numerical ranking.
 */
function deriveReadinessSummary(assessment: CreditAssessmentResult): ReadinessSummary {
  const score = assessment.overallScore;

  // Find the lowest contributing factor
  let lowestFactor: FactorBreakdown = assessment.factorBreakdown[0];
  for (const factor of assessment.factorBreakdown) {
    if (factor.normalizedScore < lowestFactor.normalizedScore) {
      lowestFactor = factor;
    }
  }

  let stage: CreditReadinessStage;
  let label: string;
  let description: string;

  if (score < 40) {
    stage = 'NEEDS_IMPROVEMENT';
    label = 'Needs Improvement';
    description =
      'Elevated operating pressures and negative cash balances currently restrict credit readiness. Focus on operational expense containment and working capital stabilization before applying for commercial borrowing.';
  } else if (score < 60) {
    stage = 'BUILDING';
    label = 'Building Credit Readiness';
    description =
      'Demonstrates active trade activity with notable cash flow or debt service pressures. Targeted operational adjustments could meaningfully strengthen loan affordability.';
  } else if (score < 80) {
    stage = 'STRENGTHENING';
    label = 'Strengthening Profile';
    description =
      'Solid operational fundamentals and consistent trade patterns. Continued digital collection discipline and cash buffer preservation will reinforce credit standing.';
  } else {
    stage = 'CREDIT_READY';
    label = 'Credit Ready';
    description =
      'Strong financial discipline across cash flow, repayment reliability, and digital continuity. Well-positioned for sustainable micro-working capital facilities.';
  }

  return {
    stage,
    label,
    description,
    keyLimitingFactor: `${lowestFactor.name} (${Math.round(lowestFactor.normalizedScore * 100)}% rating)`,
  };
}

// ============================================================
// 4. PROGRESS MODEL
// ============================================================

/**
 * Computes deterministic progress metrics.
 * Per specification: reports 0% completed for baseline assessment
 * without fabricating historical progress.
 */
function computeProgress(actions: CreditActionItem[]): CreditBuilderProgress {
  let highCount = 0;
  let mediumCount = 0;
  let lowCount = 0;

  for (const a of actions) {
    if (a.priority === 'HIGH') highCount++;
    else if (a.priority === 'MEDIUM') mediumCount++;
    else if (a.priority === 'LOW') lowCount++;
  }

  return {
    overallProgressPercentage: 0, // Baseline: no historical execution fabricated
    totalActions: actions.length,
    completedActions: 0,
    activeActions: actions.length,
    highPriorityCount: highCount,
    mediumPriorityCount: mediumCount,
    lowPriorityCount: lowCount,
  };
}

// ============================================================
// MAIN EXPORTED SERVICE
// ============================================================

/**
 * Builds a deterministic Credit Builder improvement plan.
 *
 * Takes existing financial analysis and credit assessment outputs,
 * evaluates data-backed weaknesses across 7 operational categories,
 * ranks the top 3 Next Best Actions, and generates a structured roadmap.
 *
 * @param analysis Computed financial metrics from analyzeFinancials()
 * @param assessment Credit assessment results from assessCredit()
 * @returns CreditBuilderPlan with prioritized actions, progress metrics, and readiness stage
 */
export function buildCreditRoadmap(
  analysis: FinancialAnalysisResult,
  assessment: CreditAssessmentResult
): CreditBuilderPlan {
  // 1. Evaluate all 7 candidate improvement areas
  const allActions: CreditActionItem[] = [
    evaluateExpenseManagement(analysis),
    evaluateCashFlowStability(analysis),
    evaluateDebtBurden(analysis),
    evaluateSupplierRegularity(analysis),
    evaluateDigitalContinuity(analysis),
    evaluateRevenueGrowth(analysis),
    evaluatePaymentDiversification(analysis),
  ];

  // 2. Deterministically rank all actions
  const rankedActions = rankActionItems(allActions);

  // 3. Extract top 3 Next Best Actions
  const nextBestActions = rankedActions.slice(0, 3);

  // 4. Compute progress and readiness summary
  const progress = computeProgress(rankedActions);
  const readinessSummary = deriveReadinessSummary(assessment);

  return {
    readinessSummary,
    progress,
    nextBestActions,
    allActions: rankedActions,
    benchmarkContext: {
      available: true,
      description:
        'Target benchmarks are derived from the healthy synthetic MSME profile (Ravi General Store), representing sustainable operating standards for peer neighborhood retailers.',
    },
  };
}
