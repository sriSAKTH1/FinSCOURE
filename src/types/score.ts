import { CurrencyCode } from './assessment';

export type FinancialGrade = 'A' | 'B' | 'C' | 'D';

export interface EmergencyPillarScore {
  score: number; // Max 25
  coverageScore: number; // Max 20
  accessibilityScore: number; // Max 5
  coverageMonths: number;
  essentialMonthlyExpenses: number;
  targetMonths: number;
  targetAmount: number;
  shortfall: number;
  progressPercentage: number;
  recommendedMonthlySavings: number;
}

export interface InsurancePillarScore {
  score: number; // Max 25
  healthScore: number; // Max 15
  lifeScore: number; // Max 10
  healthSumInsured: number;
  targetHealthCover: number;
  lifeSumAssured: number;
  targetLifeCover: number;
  dependentsCount: number;
  isLifeNeeded: boolean;
  totalAnnualPremiums: number;
  protectionGaps: string[];
}

export interface SavingsPillarScore {
  score: number; // Max 25
  savingsRateScore: number; // Max 15
  cashFlowScore: number; // Max 5
  consistencyScore: number; // Max 5
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySurplus: number;
  savingsRate: number; // percentage
  targetMonthlySavings: number;
}

export interface DebtPillarScore {
  score: number; // Max 25
  emiScore: number; // Max 10
  highInterestScore: number; // Max 10
  repaymentScore: number; // Max 5
  totalDebtPrincipal: number;
  totalMonthlyEmi: number;
  emiToIncomeRatio: number; // percentage
  highInterestDebt: number; // Credit card / personal >14%
  hasOverdueDebt: boolean;
  overdueAmount: number;
}

export interface SWOTAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface Recommendation {
  id: string;
  pillar: 'emergency' | 'insurance' | 'savings' | 'debt' | 'investing' | 'goals';
  priority: 'high' | 'medium' | 'low';
  title: string;
  action: string;
  estimatedScoreGain?: number;
  iconType: 'shield' | 'trending-up' | 'credit-card' | 'piggy-bank' | 'target';
}

export interface FinScoreResult {
  totalScore: number; // 0 - 100
  grade: FinancialGrade;
  gradeTitle: string;
  gradeDescription: string;
  currency: CurrencyCode;
  pillarScores: {
    emergencyFund: EmergencyPillarScore;
    insuranceProtection: InsurancePillarScore;
    savingsHealth: SavingsPillarScore;
    debtHealth: DebtPillarScore;
  };
  swot: SWOTAnalysis;
  recommendations: Recommendation[];
  metrics: {
    totalNetWorth: number;
    totalAssets: number;
    totalLiquidAssets: number;
    totalMonthlyInvestments: number;
    debtToAssetRatio: number;
    goalsAnalysis: {
      goalId: string;
      name: string;
      targetAmount: number;
      targetYear: number;
      yearsRemaining: number;
      monthlyRequired: number;
      currentMonthlyContribution: number;
      onTrack: boolean;
      hidden?: boolean;
    }[];
  };
}
