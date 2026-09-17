/*
 * Credit Builder Types
 * =====================
 *
 * Strongly-typed data structures for the KiranaCredit AI Credit Builder module.
 * Represents actionable financial improvements, evidence-based recommendations,
 * deterministic progress metrics, and credit readiness stages.
 */

export type ImprovementCategory =
  | 'CASH_FLOW'
  | 'EXPENSE_MANAGEMENT'
  | 'DEBT_BURDEN'
  | 'SUPPLIER_REGULARITY'
  | 'DIGITAL_CONTINUITY'
  | 'REVENUE_GROWTH'
  | 'PAYMENT_DIVERSIFICATION';

export type ActionPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type ActionStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';

export type CreditReadinessStage =
  | 'NEEDS_IMPROVEMENT'
  | 'BUILDING'
  | 'STRENGTHENING'
  | 'CREDIT_READY';

/** Single actionable recommendation item generated from financial analysis. */
export interface CreditActionItem {
  id: string;
  title: string;
  category: ImprovementCategory;
  priority: ActionPriority;
  status: ActionStatus;
  description: string;
  evidence: string;
  rationale: string;
  currentValue: number;
  targetValue: number;
  benchmarkValue?: number;
  unit: string;
  displayCurrent: string;
  displayTarget: string;
  displayBenchmark?: string;
  potentialImpact: string;
}

/** Deterministic progress tracking model for the merchant roadmap. */
export interface CreditBuilderProgress {
  overallProgressPercentage: number;
  totalActions: number;
  completedActions: number;
  activeActions: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
}

/** Descriptive readiness summary without competing numerical credit scores. */
export interface ReadinessSummary {
  stage: CreditReadinessStage;
  label: string;
  description: string;
  keyLimitingFactor: string;
}

/** Complete Credit Builder roadmap output. */
export interface CreditBuilderPlan {
  readinessSummary: ReadinessSummary;
  progress: CreditBuilderProgress;
  nextBestActions: CreditActionItem[];
  allActions: CreditActionItem[];
  benchmarkContext: {
    available: boolean;
    description: string;
  };
}
