/*
 * Loan Simulator Service
 * ======================================
 *
 * Deterministic, pure financial loan simulation that consumes existing
 * credit-scoring and financial-engine outputs.
 *
 * No Math.random(), Date.now(), external API calls, or LLM calls.
 * Every calculation is derived from the provided inputs and the standard
 * reducing-balance EMI formula.
 *
 * Designed for KiranaCredit AI — MSME loan prototype.
 */

import { RecommendedLoanRange, LoanSimulationResult, LoanSimulationInput } from '../types/loan';
import type { CreditCapacity } from './creditScoring';

/** Monthly interest rate derived from annual percentage. */
function monthlyRate(annualInterestRate: number): number {
  return annualInterestRate / 12 / 100;
}

/** Reducing-balance EMI formula: P * r * (1+r)^n / ((1+r)^n - 1) */
function calculateEmi(principal: number, monthlyRate: number, tenureMonths: number): number {
  if (tenureMonths <= 0 || principal <= 0) return 0;
  if (monthlyRate === 0) return principal / tenureMonths;

  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  return principal * monthlyRate * factor / (factor - 1);
}

/** Safe rounding to nearest rupee for display values. */
function roundToRupee(value: number): number {
  return Math.round(value);
}

/** Safe borrowing capacity from credit capacity output. */
function safeCapacity(capacity: number): number {
  return capacity > 0 ? capacity : 0;
}

/** Maximum affordable EMI from credit capacity output. */
function maxAffordableEmi(emi: number): number {
  return emi > 0 ? emi : 0;
}

/**
 * Runs a deterministic loan simulation.
 *
 * Given a loan simulation input and the borrower's credit capacity derived
 * from the existing credit-scoring engine, this function calculates the
 * monthly EMI, total repayment, total interest, and affordability status.
 *
 * The simulator does NOT invent financial values. It reuses the existing
 * credit-scoring outputs (maxAffordableEMI, safeBorrowingCapacity,
 * recommendedLoanRange) for affordability assessment.
 *
 * @param input loan parameters
 * @param creditCapacity the borrower's credit capacity from assessCredit()
 * @returns deterministic loan simulation result
 */
export function simulateLoan(
  input: LoanSimulationInput,
  creditCapacity: CreditCapacity
): LoanSimulationResult {
  const { loanAmount, annualInterestRate, tenureMonths } = input;
  const r = monthlyRate(annualInterestRate);

  // Calculate EMI using reducing-balance formula
  const monthlyEmi = calculateEmi(loanAmount, r, tenureMonths);

  // Calculate total repayment and total interest (full precision internally)
  const totalRepayment = monthlyEmi * tenureMonths;
  const totalInterest = totalRepayment - loanAmount;

  // Round display-facing values only
  const displayEmi = roundToRupee(monthlyEmi);
  const displayTotalRepayment = roundToRupee(totalRepayment);
  const displayTotalInterest = roundToRupee(totalInterest);

  // Use existing credit capacity values for affordability
  const maxAffordable = maxAffordableEmi(creditCapacity.maximumAffordableEMI);
  const displaySafeCapacity = roundToRupee(safeCapacity(creditCapacity.safeBorrowingCapacity));

  // Determine affordability:
  // If the calculated EMI is within the modeled maximum affordable EMI → AFFORDABLE
  // Otherwise → NOT_AFFORDABLE
  // Special case: if maxAffordableEMI is 0, any positive loan is NOT_AFFORDABLE
  let affordability: 'AFFORDABLE' | 'NOT_AFFORDABLE';
  if (maxAffordable === 0) {
    // No surplus cash flow → cannot support additional borrowing
    affordability = loanAmount <= 0 ? 'AFFORDABLE' : 'NOT_AFFORDABLE';
  } else if (displayEmi <= maxAffordable) {
    affordability = 'AFFORDABLE';
  } else {
    affordability = 'NOT_AFFORDABLE';
  }

  // Build explanation
  let explanation: string;
  if (loanAmount <= 0) {
    explanation = 'Loan amount is zero; no EMI or interest is calculated.';
  } else if (maxAffordable === 0) {
    explanation = 'Current modeled cash flow does not support additional borrowing.';
  } else if (affordability === 'AFFORDABLE') {
    explanation = `Estimated EMI (₹${displayEmi}) is within the modeled maximum affordable EMI (₹${maxAffordable}).`;
  } else {
    explanation = `Estimated EMI (₹${displayEmi}) exceeds the modeled maximum affordable EMI (₹${maxAffordable}) based on current cash-flow data.`;
  }

  // Get recommended loan range from credit capacity
  const range: RecommendedLoanRange = {
    minimum: creditCapacity.recommendedLoanRange.minimum,
    maximum: creditCapacity.recommendedLoanRange.maximum,
    suggested: creditCapacity.recommendedLoanRange.suggested,
  };

  return {
    loanAmount,
    annualInterestRate,
    tenureMonths,
    monthlyEmi: displayEmi,
    totalRepayment: displayTotalRepayment,
    totalInterest: displayTotalInterest,
    maximumAffordableEMI: maxAffordable,
    safeBorrowingCapacity: displaySafeCapacity,
    recommendedLoanRange: range,
    affordability,
    explanation,
  };
}

