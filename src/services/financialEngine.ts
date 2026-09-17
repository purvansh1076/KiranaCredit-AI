/*
 * Deterministic Financial Analysis Engine
 * ========================================
 *
 * Accepts transaction data and calculates deterministic financial metrics.
 * No Math.random(), Date.now(), external API calls, or LLM calls.
 * Every metric is derived from the transaction dataset.
 *
 * Designed for KiranaCredit AI — MSME financial analysis prototype.
 */

import { Transaction } from '../types/finance';

// ============================================================
// RESULT INTERFACES
// ============================================================

/** Monthly financial aggregation for a single calendar month. */
export interface MonthlyMetric {
  month: number;
  year: number;
  revenue: number;
  expenses: number;
  netCashFlow: number;
  salesTransactionCount: number;
  supplierPaymentTotal: number;
  inventoryPurchaseTotal: number;
  debtRepaymentTotal: number;
  utilityTotal: number;
  rentTotal: number;
}

/** Revenue growth analysis using month-over-month percentage change. */
export interface RevenueGrowth {
  monthlyGrowthRates: Array<{
    month: number;
    growthRate: number | null;
  }>;
  averageGrowthRate: number;
}

/** Cash flow volatility measured via standard deviation and coefficient of variation. */
export interface CashFlowVolatility {
  absoluteVolatility: number;
  coefficientOfVariation: number;
}

/** Supplier payment timing regularity analysis. */
export interface SupplierPaymentRegularity {
  supplierPaymentCount: number;
  averageIntervalDays: number;
  intervalStandardDeviation: number;
  regularityIndex: number;
}

/** Revenue concentration analysis.
 *  Customer-level concentration is NOT available from this dataset.
 *  Payment-channel concentration IS available and reported separately. */
export interface RevenueConcentration {
  customerConcentrationAvailable: boolean;
  note: string;
  paymentChannelConcentration: {
    upiRatio: number;
    cashRatio: number;
    bankTransferRatio: number;
  };
}

/** Transaction-level anomaly detection using statistical threshold. */
export interface AnomalyAnalysis {
  anomalyCount: number;
  anomalyTransactions: Array<{
    id: string;
    date: Date;
    type: string;
    amount: number;
    expectedRange: { lower: number; upper: number };
  }>;
}

/** Digital (UPI) vs cash transaction breakdown. */
export interface DigitalTransactionRatio {
  upiSalesCount: number;
  cashSalesCount: number;
  totalSalesCount: number;
  upiTransactionRatio: number;
  upiSalesValue: number;
  cashSalesValue: number;
}

/** Complete financial analysis result. */
export interface FinancialAnalysisResult {
  totalRevenue: number;
  totalExpenses: number;
  netOperatingCashFlow: number;
  monthlyMetrics: MonthlyMetric[];
  revenueGrowth: RevenueGrowth;
  cashFlowVolatility: CashFlowVolatility;
  expenseToIncomeRatio: number;
  debtBurdenRatio: number;
  supplierPaymentRegularity: SupplierPaymentRegularity;
  revenueConcentration: RevenueConcentration;
  anomalyAnalysis: AnomalyAnalysis;
  cashSurplus: number;
  digitalTransactionRatio: DigitalTransactionRatio;
}

// ============================================================
// HELPER: SAFE DIVISION
// ============================================================

/** Divide two numbers safely. Returns 0 if divisor is zero. */
function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0) return 0;
  return numerator / denominator;
}

// ============================================================
// HELPER: MONTH KEY
// ============================================================

/** Returns a numeric month key (YYYYMM) for grouping. */
function monthKey(date: Date): number {
  return date.getFullYear() * 100 + (date.getMonth() + 1);
}

/** Returns year from a month key. */
function yearFromKey(key: number): number {
  return Math.floor(key / 100);
}

/** Returns month (0-11) from a month key. */
function monthFromKey(key: number): number {
  return (key % 100) - 1;
}

// ============================================================
// 1. TOTAL REVENUE
// ============================================================

/**
 * Calculates total operating revenue.
 *
 * Formula: Sum of all SALE transaction amounts (INFLOW only).
 *
 * Treatment:
 * - CASH_DEPOSIT is NOT counted as revenue (it is a non-operating inflow)
 * - DEBT_REPAYMENT is not an inflow at all
 * - Only SALE transactions represent operating revenue from customer sales
 */
export function calculateRevenue(transactions: readonly Transaction[]): number {
  let total = 0;
  for (const tx of transactions) {
    if (tx.type === 'SALE' && tx.direction === 'INFLOW') {
      total += tx.amount;
    }
  }
  return total;
}

// ============================================================
// 2. TOTAL EXPENSES
// ============================================================

/**
 * Calculates total operating expenses.
 *
 * Formula: Sum of OUTFLOW amounts for:
 *   SUPPLIER_PAYMENT + INVENTORY_PURCHASE + RENT + UTILITY + OPERATING_EXPENSE
 *
 * Treatment:
 * - DEBT_REPAYMENT is excluded (reported separately via debt burden ratio)
 * - CASH_DEPOSIT is not an outflow
 * - Each economic event counted exactly once
 */
export function calculateExpenses(transactions: readonly Transaction[]): number {
  const operatingOutflowTypes = new Set([
    'SUPPLIER_PAYMENT',
    'INVENTORY_PURCHASE',
    'RENT',
    'UTILITY',
    'OPERATING_EXPENSE',
  ]);

  let total = 0;
  for (const tx of transactions) {
    if (operatingOutflowTypes.has(tx.type) && tx.direction === 'OUTFLOW') {
      total += tx.amount;
    }
  }
  return total;
}

// ============================================================
// 3. NET OPERATING CASH FASH
// ============================================================

/**
 * Calculates net operating cash flow.
 *
 * Formula: Operating Inflows - Operating Outflows
 *
 * Operating Inflows: SALE transactions (INFLOW)
 * Operating Outflows: SUPPLIER_PAYMENT, INVENTORY_PURCHASE, RENT, UTILITY,
 *                     OPERATING_EXPENSE (OUTFLOW)
 *
 * Note: CASH_DEPOSIT (non-operating inflow) and DEBT_REPAYMENT (financing)
 *       are excluded from this calculation.
 */
export function calculateNetOperatingCashFlow(transactions: readonly Transaction[]): number {
  const revenue = calculateRevenue(transactions);
  const expenses = calculateExpenses(transactions);
  return revenue - expenses;
}

// ============================================================
// 4-6. MONTHLY METRICS
// ============================================================

/**
 * Calculates monthly financial metrics for every month present in the data.
 *
 * Returns an array of MonthlyMetric objects sorted chronologically.
 * Uses actual transaction dates — does not hardcode months.
 * Works for any merchant dataset.
 */
export function calculateMonthlyMetrics(transactions: readonly Transaction[]): MonthlyMetric[] {
  // Group transactions by month
  const monthMap = new Map<number, Transaction[]>();

  for (const tx of transactions) {
    const key = monthKey(tx.date);
    if (!monthMap.has(key)) {
      monthMap.set(key, []);
    }
    monthMap.get(key)!.push(tx);
  }

  const metrics: MonthlyMetric[] = [];
  const sortedKeys = Array.from(monthMap.keys()).sort((a, b) => a - b);

  const operatingOutflowTypes = new Set([
    'SUPPLIER_PAYMENT',
    'INVENTORY_PURCHASE',
    'RENT',
    'UTILITY',
    'OPERATING_EXPENSE',
  ]);

  for (const key of sortedKeys) {
    const monthTransactions = monthMap.get(key)!;
    let revenue = 0;
    let expenses = 0;
    let salesCount = 0;
    let supplierTotal = 0;
    let inventoryTotal = 0;
    let debtTotal = 0;
    let utilityTotal = 0;
    let rentTotal = 0;

    for (const tx of monthTransactions) {
      // Revenue: only SALE inflows
      if (tx.type === 'SALE' && tx.direction === 'INFLOW') {
        revenue += tx.amount;
        salesCount++;
      }

      // Operating expenses
      if (operatingOutflowTypes.has(tx.type) && tx.direction === 'OUTFLOW') {
        expenses += tx.amount;
      }

      // Category-specific totals
      if (tx.type === 'SUPPLIER_PAYMENT') supplierTotal += tx.amount;
      if (tx.type === 'INVENTORY_PURCHASE') inventoryTotal += tx.amount;
      if (tx.type === 'DEBT_REPAYMENT') debtTotal += tx.amount;
      if (tx.type === 'UTILITY') utilityTotal += tx.amount;
      if (tx.type === 'RENT') rentTotal += tx.amount;
    }

    metrics.push({
      month: monthFromKey(key),
      year: yearFromKey(key),
      revenue,
      expenses,
      netCashFlow: revenue - expenses,
      salesTransactionCount: salesCount,
      supplierPaymentTotal: supplierTotal,
      inventoryPurchaseTotal: inventoryTotal,
      debtRepaymentTotal: debtTotal,
      utilityTotal,
      rentTotal,
    });
  }

  return metrics;
}

// ============================================================
// 7. REVENUE GROWTH RATE
// ============================================================

/**
 * Calculates month-over-month revenue growth rate.
 *
 * Formula:
 *   Growth % = ((Current Month Revenue - Previous Month Revenue)
 *               / Previous Month Revenue) × 100
 *
 * First month has no growth rate (null).
 * Zero previous-month revenue produces 0% growth (safe handling).
 * Returns both individual monthly rates and the average.
 */
export function calculateRevenueGrowth(monthlyMetrics: readonly MonthlyMetric[]): RevenueGrowth {
  const monthlyGrowthRates: Array<{ month: number; growthRate: number | null }> = [];
  let totalGrowth = 0;
  let validMonthCount = 0;

  for (let i = 0; i < monthlyMetrics.length; i++) {
    const current = monthlyMetrics[i];

    if (i === 0) {
      // First month has no previous month to compare
      monthlyGrowthRates.push({
        month: current.month,
        growthRate: null,
      });
      continue;
    }

    const previous = monthlyMetrics[i - 1];

    if (previous.revenue === 0) {
      // Avoid division by zero — if previous was zero, growth is 0%
      monthlyGrowthRates.push({
        month: current.month,
        growthRate: 0,
      });
    } else {
      const growth = ((current.revenue - previous.revenue) / previous.revenue) * 100;
      // Round to 2 decimal places for readability
      const rounded = Math.round(growth * 100) / 100;
      monthlyGrowthRates.push({
        month: current.month,
        growthRate: rounded,
      });
      totalGrowth += rounded;
      validMonthCount++;
    }
  }

  const averageGrowthRate = validMonthCount > 0
    ? Math.round((totalGrowth / validMonthCount) * 100) / 100
    : 0;

  return { monthlyGrowthRates, averageGrowthRate };
}

// ============================================================
// 8. CASH-FLOW VOLATILITY
// ============================================================

/**
 * Calculates cash flow volatility from monthly net operating cash flow.
 *
 * Uses Coefficient of Variation (CV):
 *   CV = Standard Deviation / |Mean|
 *
 * Returns:
 *   absoluteVolatility: population standard deviation of monthly net cash flow
 *   coefficientOfVariation: CV (0 = no volatility, higher = more volatile)
 *
 * If mean is zero, CV is set to 0 (safe handling).
 * Uses population standard deviation (divides by N, not N-1).
 */
export function calculateCashFlowVolatility(monthlyMetrics: readonly MonthlyMetric[]): CashFlowVolatility {
  if (monthlyMetrics.length === 0) {
    return { absoluteVolatility: 0, coefficientOfVariation: 0 };
  }

  const values = monthlyMetrics.map(m => m.netCashFlow);
  const n = values.length;

  // Calculate mean
  let sum = 0;
  for (const v of values) sum += v;
  const mean = sum / n;

  // Calculate population standard deviation
  let sumSquaredDiff = 0;
  for (const v of values) {
    const diff = v - mean;
    sumSquaredDiff += diff * diff;
  }
  const variance = sumSquaredDiff / n;
  const absoluteVolatility = Math.sqrt(variance);

  // Calculate coefficient of variation
  const absMean = Math.abs(mean);
  const coefficientOfVariation = absMean === 0
    ? 0
    : absoluteVolatility / absMean;

  return {
    absoluteVolatility: Math.round(absoluteVolatility * 100) / 100,
    coefficientOfVariation: Math.round(coefficientOfVariation * 10000) / 10000,
  };
}

// ============================================================
// 9. EXPENSE-TO-INCOME RATIO
// ============================================================

/**
 * Calculates expense-to-income ratio.
 *
 * Formula:
 *   Expense-to-Income Ratio = Total Operating Expenses / Total Operating Revenue
 *
 * Returns both decimal ratio and percentage.
 * Zero revenue produces ratio of 0 (safe handling).
 */
export function calculateExpenseToIncomeRatio(transactions: readonly Transaction[]): {
  ratio: number;
  percentage: number;
} {
  const revenue = calculateRevenue(transactions);
  const expenses = calculateExpenses(transactions);
  const ratio = safeDivide(expenses, revenue);
  return {
    ratio: Math.round(ratio * 10000) / 10000,
    percentage: Math.round(ratio * 10000) / 100,
  };
}

// ============================================================
// 10. DEBT BURDEN RATIO
// ============================================================

/**
 * Calculates debt burden ratio.
 *
 * Formula:
 *   Debt Burden Ratio = Total Debt Repayments / Total Operating Revenue
 *
 * Only uses DEBT_REPAYMENT transaction type.
 * Does NOT treat supplier payments as debt.
 * Zero revenue produces ratio of 0 (safe handling).
 */
export function calculateDebtBurdenRatio(transactions: readonly Transaction[]): {
  ratio: number;
  percentage: number;
  totalDebtRepayments: number;
} {
  let totalDebtRepayments = 0;
  for (const tx of transactions) {
    if (tx.type === 'DEBT_REPAYMENT') {
      totalDebtRepayments += tx.amount;
    }
  }

  const revenue = calculateRevenue(transactions);
  const ratio = safeDivide(totalDebtRepayments, revenue);

  return {
    ratio: Math.round(ratio * 10000) / 10000,
    percentage: Math.round(ratio * 10000) / 100,
    totalDebtRepayments,
  };
}

// ============================================================
// 11. SUPPLIER PAYMENT REGULARITY
// ============================================================

/**
 * Calculates supplier payment regularity.
 *
 * Method:
 *   1. Extract all SUPPLIER_PAYMENT transactions
 *   2. Sort chronologically
 *   3. Calculate intervals between consecutive payments (in days)
 *   4. Calculate mean interval
 *   5. Calculate standard deviation of intervals
 *   6. Regularity index = 1 - (stddev / mean), clamped to [0, 1]
 *      - 1.0 = perfectly regular (all intervals identical)
 *      - 0.0 = maximally irregular
 *
 * Returns raw data for future explainability.
 */
export function calculateSupplierRegularity(transactions: readonly Transaction[]): SupplierPaymentRegularity {
  // Extract supplier payments and sort by date
  const supplierPayments = transactions
    .filter(tx => tx.type === 'SUPPLIER_PAYMENT')
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const supplierPaymentCount = supplierPayments.length;

  if (supplierPaymentCount < 2) {
    return {
      supplierPaymentCount,
      averageIntervalDays: 0,
      intervalStandardDeviation: 0,
      regularityIndex: supplierPaymentCount === 1 ? 0 : 0,
    };
  }

  // Calculate intervals between consecutive payments in days
  const intervals: number[] = [];
  for (let i = 1; i < supplierPayments.length; i++) {
    const prev = supplierPayments[i - 1].date;
    const curr = supplierPayments[i].date;
    const diffMs = curr.getTime() - prev.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    intervals.push(diffDays);
  }

  // Calculate mean interval
  let intervalSum = 0;
  for (const interval of intervals) intervalSum += interval;
  const averageIntervalDays = intervalSum / intervals.length;

  // Calculate standard deviation of intervals
  let sumSquaredDiff = 0;
  for (const interval of intervals) {
    const diff = interval - averageIntervalDays;
    sumSquaredDiff += diff * diff;
  }
  const variance = sumSquaredDiff / intervals.length;
  const intervalStandardDeviation = Math.sqrt(variance);

  // Regularity index: 1 - (stddev / mean), clamped to [0, 1]
  let regularityIndex = 0;
  if (averageIntervalDays > 0) {
    regularityIndex = 1 - (intervalStandardDeviation / averageIntervalDays);
    regularityIndex = Math.max(0, Math.min(1, regularityIndex));
  }

  return {
    supplierPaymentCount,
    averageIntervalDays: Math.round(averageIntervalDays * 100) / 100,
    intervalStandardDeviation: Math.round(intervalStandardDeviation * 100) / 100,
    regularityIndex: Math.round(regularityIndex * 10000) / 10000,
  };
}

// ============================================================
// 12. REVENUE CONCENTRATION
// ============================================================

/**
 * Calculates revenue concentration.
 *
 * Customer-level concentration is NOT available from this dataset
 * because transaction records do not contain explicit customer identity.
 *
 * Payment-channel concentration IS calculated:
 *   - UPI ratio (by value)
 *   - Cash ratio (by value)
 *   - Bank transfer ratio (by value)
 *
 * Note: This is payment-method concentration, NOT customer concentration.
 * It is clearly labeled as such.
 */
export function calculateRevenueConcentration(transactions: readonly Transaction[]): RevenueConcentration {
  let upiSalesValue = 0;
  let cashSalesValue = 0;
  let bankTransferSalesValue = 0;

  for (const tx of transactions) {
    if (tx.type === 'SALE' && tx.direction === 'INFLOW') {
      if (tx.paymentMethod === 'UPI') {
        upiSalesValue += tx.amount;
      } else if (tx.paymentMethod === 'CASH') {
        cashSalesValue += tx.amount;
      } else if (tx.paymentMethod === 'BANK_TRANSFER') {
        bankTransferSalesValue += tx.amount;
      }
    }
  }

  const totalSalesValue = upiSalesValue + cashSalesValue + bankTransferSalesValue;

  return {
    customerConcentrationAvailable: false,
    note: 'Customer-level concentration cannot be calculated: transaction records do not contain explicit customer identity. Payment-channel concentration is reported instead.',
    paymentChannelConcentration: {
      upiRatio: Math.round(safeDivide(upiSalesValue, totalSalesValue) * 10000) / 10000,
      cashRatio: Math.round(safeDivide(cashSalesValue, totalSalesValue) * 10000) / 10000,
      bankTransferRatio: Math.round(safeDivide(bankTransferSalesValue, totalSalesValue) * 10000) / 10000,
    },
  };
}

// ============================================================
// 13. ANOMALY COUNT
// ============================================================

/**
 * Detects anomalous transactions using a transparent statistical threshold.
 *
 * Method:
 *   1. Calculate mean and standard deviation of all SALE transaction amounts
 *   2. Flag any SALE transaction where amount > mean + 2 × stddev
 *
 * This is a simple, explainable anomaly detector.
 * An anomaly means "unusual relative to this merchant's dataset."
 * This does NOT prove fraud.
 *
 * Only analyzes SALE transactions (customer sales).
 */
export function calculateAnomalies(transactions: readonly Transaction[]): AnomalyAnalysis {
  // Extract all SALE transaction amounts
  const saleAmounts: number[] = [];
  for (const tx of transactions) {
    if (tx.type === 'SALE') {
      saleAmounts.push(tx.amount);
    }
  }

  if (saleAmounts.length === 0) {
    return { anomalyCount: 0, anomalyTransactions: [] };
  }

  // Calculate mean
  let sum = 0;
  for (const amount of saleAmounts) sum += amount;
  const mean = sum / saleAmounts.length;

  // Calculate standard deviation
  let sumSquaredDiff = 0;
  for (const amount of saleAmounts) {
    const diff = amount - mean;
    sumSquaredDiff += diff * diff;
  }
  const variance = sumSquaredDiff / saleAmounts.length;
  const stddev = Math.sqrt(variance);

  // Threshold: mean + 2 × standard deviation
  const threshold = mean + 2 * stddev;

  // Find anomalous transactions
  const anomalyTransactions: AnomalyAnalysis['anomalyTransactions'] = [];

  for (const tx of transactions) {
    if (tx.type === 'SALE' && tx.amount > threshold) {
      anomalyTransactions.push({
        id: tx.id,
        date: tx.date,
        type: tx.type,
        amount: tx.amount,
        expectedRange: {
          lower: 0,
          upper: Math.round(threshold * 100) / 100,
        },
      });
    }
  }

  return {
    anomalyCount: anomalyTransactions.length,
    anomalyTransactions,
  };
}

// ============================================================
// 14. CASH SURPLUS
// ============================================================

/**
 * Calculates cash surplus.
 *
 * Formula:
 *   Cash Surplus = Operating Revenue - Operating Expenses - Debt Repayments
 *
 * This represents the net cash remaining after all operating costs
 * and debt obligations are met. This metric will later be used by
 * the credit recommendation and loan simulator phases.
 */
export function calculateCashSurplus(transactions: readonly Transaction[]): number {
  const revenue = calculateRevenue(transactions);
  const expenses = calculateExpenses(transactions);

  let totalDebtRepayments = 0;
  for (const tx of transactions) {
    if (tx.type === 'DEBT_REPAYMENT') {
      totalDebtRepayments += tx.amount;
    }
  }

  return revenue - expenses - totalDebtRepayments;
}

// ============================================================
// 15. DIGITAL TRANSACTION RATIO
// ============================================================

/**
 * Calculates digital (UPI) vs cash transaction breakdown.
 *
 * Only considers SALE transactions (not CASH_DEPOSIT or other types).
 * CASH_DEPOSIT is NOT treated as a customer cash sale.
 *
 * Returns:
 *   - UPI and cash sales counts
 *   - Total sales count
 *   - UPI transaction ratio (count-based)
 *   - UPI and cash sales values (amount-based)
 */
export function calculateDigitalTransactionRatio(transactions: readonly Transaction[]): DigitalTransactionRatio {
  let upiSalesCount = 0;
  let cashSalesCount = 0;
  let upiSalesValue = 0;
  let cashSalesValue = 0;

  for (const tx of transactions) {
    if (tx.type === 'SALE' && tx.direction === 'INFLOW') {
      if (tx.paymentMethod === 'UPI') {
        upiSalesCount++;
        upiSalesValue += tx.amount;
      } else if (tx.paymentMethod === 'CASH') {
        cashSalesCount++;
        cashSalesValue += tx.amount;
      }
    }
  }

  const totalSalesCount = upiSalesCount + cashSalesCount;

  return {
    upiSalesCount,
    cashSalesCount,
    totalSalesCount,
    upiTransactionRatio: Math.round(safeDivide(upiSalesCount, totalSalesCount) * 10000) / 10000,
    upiSalesValue,
    cashSalesValue,
  };
}

// ============================================================
// MAIN ANALYSIS FUNCTION
// ============================================================

/**
 * Runs complete financial analysis on a transaction dataset.
 *
 * This is the primary entry point. Given identical transactions,
 * this function always returns identical results (deterministic).
 *
 * @param transactions - Array of Transaction objects to analyze
 * @returns FinancialAnalysisResult with all computed metrics
 */
export function analyzeFinancials(transactions: readonly Transaction[]): FinancialAnalysisResult {
  const totalRevenue = calculateRevenue(transactions);
  const totalExpenses = calculateExpenses(transactions);
  const netOperatingCashFlow = totalRevenue - totalExpenses;
  const monthlyMetrics = calculateMonthlyMetrics(transactions);
  const revenueGrowth = calculateRevenueGrowth(monthlyMetrics);
  const cashFlowVolatility = calculateCashFlowVolatility(monthlyMetrics);
  const expenseToIncomeRatio = calculateExpenseToIncomeRatio(transactions);
  const debtBurdenRatio = calculateDebtBurdenRatio(transactions);
  const supplierPaymentRegularity = calculateSupplierRegularity(transactions);
  const revenueConcentration = calculateRevenueConcentration(transactions);
  const anomalyAnalysis = calculateAnomalies(transactions);
  const cashSurplus = calculateCashSurplus(transactions);
  const digitalTransactionRatio = calculateDigitalTransactionRatio(transactions);

  return {
    totalRevenue,
    totalExpenses,
    netOperatingCashFlow,
    monthlyMetrics,
    revenueGrowth,
    cashFlowVolatility,
    expenseToIncomeRatio: expenseToIncomeRatio.ratio,
    debtBurdenRatio: debtBurdenRatio.ratio,
    supplierPaymentRegularity,
    revenueConcentration,
    anomalyAnalysis,
    cashSurplus,
    digitalTransactionRatio,
  };
}
