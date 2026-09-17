/*
 * Merchant Context & Financial State Provider
 * ============================================
 *
 * Connects pure financial calculation services to the React application shell.
 * Manages active merchant selection (Ramesh, Ravi, Sita) and provides
 * memoized, deterministic financial analysis, credit scores, baseline loan
 * simulation, and credit builder roadmaps.
 *
 * Rules:
 * - Does NOT calculate financial values in UI components.
 * - Always clearly labels synthetic demo data.
 * - Supports seamless merchant switching.
 */

import React, { createContext, useContext, useState, useMemo } from 'react';
import { Transaction, MerchantProfile } from '../types/finance';
import { rameshTransactions, rameshMerchant } from '../data/rameshKirana';
import {
  healthyTransactions,
  healthyMerchant,
  stressedTransactions,
  stressedMerchant,
} from '../data/benchmarks';
import { analyzeFinancials, FinancialAnalysisResult } from '../services/financialEngine';
import { assessCredit, CreditAssessmentResult } from '../services/creditScoring';
import { simulateLoan } from '../services/loanSimulator';
import { LoanSimulationResult } from '../types/loan';
import { buildCreditRoadmap } from '../services/creditBuilder';
import { CreditBuilderPlan } from '../types/creditBuilder';

export type MerchantId = 'ramesh' | 'ravi' | 'sita';

export interface MerchantOption {
  id: MerchantId;
  name: string;
  badge: string;
  tagline: string;
  location: string;
  businessType: string;
  operatingHistoryYears: number;
}

export const AVAILABLE_MERCHANTS: MerchantOption[] = [
  {
    id: 'ramesh',
    name: 'Ramesh Kirana Store',
    badge: 'Primary Demo Profile',
    tagline: 'High trade regularity, cash-flow pressure, limited formal bureau history',
    location: 'Nagpur, Maharashtra',
    businessType: 'Neighborhood Kirana / FMCG Retail',
    operatingHistoryYears: 8,
  },
  {
    id: 'ravi',
    name: 'Ravi General Store',
    badge: 'Healthy Benchmark',
    tagline: 'High digital adoption (88% UPI), steady margins, strong payment discipline',
    location: 'Nagpur, Maharashtra',
    businessType: 'Neighborhood Kirana / FMCG Retail',
    operatingHistoryYears: 10,
  },
  {
    id: 'sita',
    name: 'Sita Kirana Store',
    badge: 'Stressed Benchmark',
    tagline: 'Cash-dependent (43% UPI), irregular distributor payments, seasonal strain',
    location: 'Nagpur, Maharashtra',
    businessType: 'Neighborhood Kirana / FMCG Retail',
    operatingHistoryYears: 5,
  },
];

interface MerchantContextValue {
  merchantId: MerchantId;
  setMerchantId: (id: MerchantId) => void;
  merchantProfile: MerchantProfile;
  activeOption: MerchantOption;
  availableMerchants: MerchantOption[];
  transactions: readonly Transaction[];
  financialAnalysis: FinancialAnalysisResult;
  creditAssessment: CreditAssessmentResult;
  baselineLoanSimulation: LoanSimulationResult;
  creditRoadmap: CreditBuilderPlan;
  isSyntheticDemo: boolean;
}

const MerchantContext = createContext<MerchantContextValue | undefined>(undefined);

export const MerchantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [merchantId, setMerchantId] = useState<MerchantId>('ramesh');

  // Select transaction dataset and profile based on active merchant
  const { rawTransactions, profile, activeOption } = useMemo(() => {
    switch (merchantId) {
      case 'ravi':
        return {
          rawTransactions: healthyTransactions as unknown as Transaction[],
          profile: healthyMerchant,
          activeOption: AVAILABLE_MERCHANTS[1],
        };
      case 'sita':
        return {
          rawTransactions: stressedTransactions as unknown as Transaction[],
          profile: stressedMerchant,
          activeOption: AVAILABLE_MERCHANTS[2],
        };
      case 'ramesh':
      default:
        return {
          rawTransactions: rameshTransactions as unknown as Transaction[],
          profile: rameshMerchant,
          activeOption: AVAILABLE_MERCHANTS[0],
        };
    }
  }, [merchantId]);

  // Execute deterministic financial engine
  const financialAnalysis = useMemo(() => {
    return analyzeFinancials(rawTransactions);
  }, [rawTransactions]);

  // Execute deterministic credit scoring
  const creditAssessment = useMemo(() => {
    return assessCredit(financialAnalysis);
  }, [financialAnalysis]);

  // Execute baseline loan simulation (indicative ₹50,000 working capital loan, 18% p.a., 12 months)
  const baselineLoanSimulation = useMemo(() => {
    return simulateLoan(
      {
        loanAmount: 50000,
        annualInterestRate: 18,
        tenureMonths: 12,
      },
      creditAssessment.creditCapacity
    );
  }, [creditAssessment]);

  // Execute deterministic credit builder roadmap
  const creditRoadmap = useMemo(() => {
    return buildCreditRoadmap(financialAnalysis, creditAssessment);
  }, [financialAnalysis, creditAssessment]);

  const value = useMemo<MerchantContextValue>(() => ({
    merchantId,
    setMerchantId,
    merchantProfile: profile,
    activeOption,
    availableMerchants: AVAILABLE_MERCHANTS,
    transactions: rawTransactions,
    financialAnalysis,
    creditAssessment,
    baselineLoanSimulation,
    creditRoadmap,
    isSyntheticDemo: true,
  }), [
    merchantId,
    profile,
    activeOption,
    rawTransactions,
    financialAnalysis,
    creditAssessment,
    baselineLoanSimulation,
    creditRoadmap,
  ]);

  return (
    <MerchantContext.Provider value={value}>
      {children}
    </MerchantContext.Provider>
  );
};

export function useMerchant(): MerchantContextValue {
  const context = useContext(MerchantContext);
  if (!context) {
    throw new Error('useMerchant must be used within a MerchantProvider');
  }
  return context;
}
