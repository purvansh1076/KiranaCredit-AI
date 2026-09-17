/**
 * Loan Simulation Input
 *
 * Parameters for a loan simulation request.
 * All values are expected to be deterministic, non-negative numbers.
 */
export interface LoanSimulationInput {
  /** Principal loan amount in rupees. */
  loanAmount: number;
  /** Annual interest rate in percent (e.g. 18 for 18%). */
  annualInterestRate: number;
  /** Loan tenure in months. */
  tenureMonths: number;
}

/**
 * Recommended loan range from existing credit assessment.
 *
 * Source of truth for the simulator's recommended loan range.
 * Values are derived from the credit-scoring output.
 */
export interface RecommendedLoanRange {
  /** Minimum recommended loan amount (₹). */
  minimum: number;
  /** Maximum recommended loan amount (₹). */
  maximum: number;
  /** Suggested loan amount (₹). */
  suggested: number;
}

/**
 * Loan Simulation Result
 *
 * Deterministic output from the loan simulator.
 * All monetary values are rounded to the nearest rupee for display.
 * The result is side-effect free and can be serialized/deserialized.
 */
export interface LoanSimulationResult {
  /** requested loan amount (₹). */
  loanAmount: number;
  /** annual interest rate used (%). */
  annualInterestRate: number;
  /** loan tenure in months. */
  tenureMonths: number;
  /** calculated monthly EMI (₹). */
  monthlyEmi: number;
  /** total amount paid over the full tenure (₹). */
  totalRepayment: number;
  /** total interest paid over the full tenure (₹). */
  totalInterest: number;
  /** maximum affordable EMI from credit assessment (₹). */
  maximumAffordableEMI: number;
  /** safe borrowing capacity from credit assessment (₹). */
  safeBorrowingCapacity: number;
  /** recommended loan range from credit assessment. */
  recommendedLoanRange: RecommendedLoanRange;
  /** affordability status. */
  affordability: 'AFFORDABLE' | 'NOT_AFFORDABLE';
  /** explanation of the result for UI display. */
  explanation: string;
}