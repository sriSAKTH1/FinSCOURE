import {
  AssessmentData,
  ExpenseItem,
  CustomExpenseItem,
  MonthlyExpenses,
  LoanItem,
  AssetItem,
  GoalItem,
  CurrencyCode
} from '@/types/assessment';
import {
  FinScoreResult,
  FinancialGrade,
  EmergencyPillarScore,
  InsurancePillarScore,
  SavingsPillarScore,
  DebtPillarScore,
  SWOTAnalysis,
  Recommendation
} from '@/types/score';

export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function formatCurrency(amount: number, currency: CurrencyCode = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] || '₹';
  const rounded = Math.round(amount);

  if (currency === 'INR') {
    return `${symbol}${rounded.toLocaleString('en-IN')}`;
  }
  return `${symbol}${rounded.toLocaleString('en-US')}`;
}

export function parseNum(val: number | string | '' | undefined | null): number {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const parsed = parseFloat(String(val).replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
}

export function getMonthlyExpense(item: ExpenseItem | undefined): number {
  if (!item) return 0;
  const amt = parseNum(item.amount);
  if (item.frequency === 'N') return 0;
  if (item.frequency === 'W') return amt * 4.333;
  return amt; // 'M'
}

export function calculateTotalMonthlyExpenses(
  expenses: MonthlyExpenses,
  customExpenses?: CustomExpenseItem[]
): {
  total: number;
  essential: number;
  discretionary: number;
} {
  const rent = getMonthlyExpense(expenses.rent);
  const food = getMonthlyExpense(expenses.food);
  const transport = getMonthlyExpense(expenses.transport);
  const utilities = getMonthlyExpense(expenses.utilities);
  const phoneInternet = getMonthlyExpense(expenses.phoneInternet);
  const healthcare = getMonthlyExpense(expenses.healthcare);
  const familySupport = getMonthlyExpense(expenses.familySupport);
  const education = getMonthlyExpense(expenses.education);

  const ott = getMonthlyExpense(expenses.ott);
  const entertainment = getMonthlyExpense(expenses.entertainment);
  const shopping = getMonthlyExpense(expenses.shopping);
  const travel = getMonthlyExpense(expenses.travel);
  const other = getMonthlyExpense(expenses.other);

  let essential = rent + food + transport + utilities + phoneInternet + healthcare + familySupport + education;
  let discretionary = ott + entertainment + shopping + travel + other;

  if (customExpenses && customExpenses.length > 0) {
    for (const item of customExpenses) {
      const amt = getMonthlyExpense(item);
      if (item.category === 'essential') {
        essential += amt;
      } else {
        discretionary += amt;
      }
    }
  }

  const total = essential + discretionary;

  return { total, essential, discretionary };
}

export function calculateTotalMonthlyIncome(data: AssessmentData): number {
  const salary = parseNum(data.personal.monthlyTakeHome);
  const add = data.additionalIncome;
  const additional =
    parseNum(add?.business) +
    parseNum(add?.freelance) +
    parseNum(add?.rental) +
    parseNum(add?.interestDividends) +
    parseNum(add?.other);
  return salary + additional;
}

export function calculateEmergencyFundScore(
  data: AssessmentData,
  essentialExpenses: number
): EmergencyPillarScore {
  const liquidSavings = parseNum(data.emergencyFund.liquidSavings);
  const targetMonths = data.emergencyFund.targetMonths || 6;
  const isAccessible = data.emergencyFund.isAccessible;

  // If essential expenses are zero, use an inferred baseline (e.g., 50% of monthly income)
  const monthlyIncome = calculateTotalMonthlyIncome(data);
  const baselineExpenses = essentialExpenses > 0 ? essentialExpenses : Math.max(1, monthlyIncome * 0.5);

  const coverageMonths = baselineExpenses > 0 ? liquidSavings / baselineExpenses : 0;
  const targetAmount = baselineExpenses * targetMonths;
  const shortfall = Math.max(0, targetAmount - liquidSavings);
  const progressPercentage = targetAmount > 0 ? Math.min(100, Math.round((liquidSavings / targetAmount) * 100)) : 100;
  const recommendedMonthlySavings = shortfall > 0 ? Math.round(shortfall / 12) : 0;

  // Suggested coverage scoring against a six-month target:
  // 0m: 0/20, 1m: 3/20, 2m: 7/20, 3m: 10/20, 4m: 13/20, 5m: 17/20, 6+m: 20/20
  let coverageScore = 0;
  if (coverageMonths <= 0) {
    coverageScore = 0;
  } else if (coverageMonths >= 6) {
    coverageScore = 20;
  } else if (coverageMonths < 1) {
    coverageScore = coverageMonths * 3;
  } else if (coverageMonths < 2) {
    coverageScore = 3 + (coverageMonths - 1) * 4;
  } else if (coverageMonths < 3) {
    coverageScore = 7 + (coverageMonths - 2) * 3;
  } else if (coverageMonths < 4) {
    coverageScore = 10 + (coverageMonths - 3) * 3;
  } else if (coverageMonths < 5) {
    coverageScore = 13 + (coverageMonths - 4) * 4;
  } else {
    coverageScore = 17 + (coverageMonths - 5) * 3;
  }

  // Accessibility points: up to 5 points
  let accessibilityScore = 0;
  if (liquidSavings > 0) {
    accessibilityScore = isAccessible ? 5 : 2;
  }

  const score = Math.min(25, Math.round(coverageScore + accessibilityScore));

  return {
    score,
    coverageScore: Math.round(coverageScore * 10) / 10,
    accessibilityScore,
    coverageMonths: Math.round(coverageMonths * 10) / 10,
    essentialMonthlyExpenses: Math.round(baselineExpenses),
    targetMonths,
    targetAmount: Math.round(targetAmount),
    shortfall: Math.round(shortfall),
    progressPercentage,
    recommendedMonthlySavings
  };
}

export function calculateInsuranceScore(
  data: AssessmentData,
  monthlyIncome: number
): InsurancePillarScore {
  const health = data.healthInsurance;
  const life = data.lifeInsurance;
  const dependents = parseNum(data.personal.dependents);
  const currency = data.personal.currency;

  // Health baseline: standard recommendation is 5x to 10x monthly income, or minimum threshold based on currency
  const minHealthBase = currency === 'INR' ? 500000 : 50000;
  const targetHealthCover = Math.max(minHealthBase, monthlyIncome * 6 * (dependents > 0 ? 1.5 : 1));
  const healthSumInsured = health.hasCover ? parseNum(health.sumInsured) : 0;

  let healthScore = 0;
  if (health.hasCover) {
    if (health.source === 'employer') {
      // Corporate insurance only: awarded 5 marks
      healthScore = 5;
    } else if (health.source === 'retail' || health.source === 'both') {
      // Personal insurance or Both: awarded full mark (15/15)
      healthScore = 15;
    } else {
      healthScore = 5;
    }
  } else {
    healthScore = 0;
  }

  // Life insurance scoring depends on dependents:
  // "If the user has no dependents, the assessment should explain why life cover may be less relevant rather than unfairly penalizing them."
  const isLifeNeeded = dependents > 0;
  const targetLifeCover = isLifeNeeded ? monthlyIncome * 12 * 10 : 0;
  const lifeSumAssured = life.hasCover ? parseNum(life.sumAssured) : 0;

  let lifeScore = 0;
  if (!isLifeNeeded) {
    // If no dependents, life insurance is not strictly required - award full 10 points
    lifeScore = 10;
  } else {
    if (life.hasCover && lifeSumAssured > 0) {
      const ratio = lifeSumAssured / targetLifeCover;
      if (ratio >= 1.0) lifeScore = 10;
      else if (ratio >= 0.6) lifeScore = 7;
      else if (ratio >= 0.3) lifeScore = 4;
      else lifeScore = 2;
    } else {
      lifeScore = 0;
    }
  }

  const score = Math.min(25, healthScore + lifeScore);
  const totalAnnualPremiums = parseNum(health.annualPremium) + parseNum(life.annualPremium);

  const protectionGaps: string[] = [];
  if (!health.hasCover || healthSumInsured === 0) {
    protectionGaps.push('No active health insurance policy recorded.');
  } else if (health.source === 'employer') {
    protectionGaps.push('Only corporate health insurance active (5/15 marks). Corporate coverage lapses upon job change; securing personal health insurance is strongly recommended.');
  } else if (healthSumInsured < targetHealthCover) {
    protectionGaps.push(`Health cover is below recommended target of ${formatCurrency(targetHealthCover, currency)}.`);
  }

  if (isLifeNeeded && (!life.hasCover || lifeSumAssured === 0)) {
    protectionGaps.push(`No term life insurance cover despite having ${dependents} dependent(s).`);
  } else if (isLifeNeeded && lifeSumAssured < targetLifeCover) {
    protectionGaps.push(`Life cover is below 10x annual income target (${formatCurrency(targetLifeCover, currency)}).`);
  }

  return {
    score,
    healthScore,
    lifeScore,
    healthSumInsured,
    targetHealthCover: Math.round(targetHealthCover),
    lifeSumAssured,
    targetLifeCover: Math.round(targetLifeCover),
    dependentsCount: dependents,
    isLifeNeeded,
    totalAnnualPremiums,
    protectionGaps
  };
}

export function calculateSavingsScore(
  data: AssessmentData,
  monthlyIncome: number,
  monthlyExpenses: number,
  totalMonthlyEmi: number
): SavingsPillarScore {
  const totalOutflow = monthlyExpenses + totalMonthlyEmi;
  const monthlySurplus = monthlyIncome - totalOutflow;
  const savingsRate = monthlyIncome > 0 ? (monthlySurplus / monthlyIncome) * 100 : 0;

  // Savings rate score out of 15:
  // Below 0%: 0
  // 0 - 4.9%: 3
  // 5 - 9.9%: 6
  // 10 - 14.9%: 9
  // 15 - 19.9%: 12
  // 20% or more: 15
  let savingsRateScore = 0;
  if (savingsRate < 0) savingsRateScore = 0;
  else if (savingsRate < 5) savingsRateScore = 3;
  else if (savingsRate < 10) savingsRateScore = 6;
  else if (savingsRate < 15) savingsRateScore = 9;
  else if (savingsRate < 20) savingsRateScore = 12;
  else savingsRateScore = 15;

  // Positive cash flow: 5 points
  const cashFlowScore = monthlySurplus > 0 ? 5 : 0;

  // Consistency and affordability of savings: 5 points
  // Check if user invests monthly or builds emergency fund comfortably
  const totalInvestmentsMonthly = data.assets.reduce(
    (acc, item) => acc + parseNum(item.monthlyContribution),
    0
  );
  let consistencyScore = 0;
  if (monthlySurplus > 0 && totalInvestmentsMonthly > 0) {
    consistencyScore = 5;
  } else if (monthlySurplus > 0) {
    consistencyScore = 3;
  } else {
    consistencyScore = 0;
  }

  const score = Math.min(25, savingsRateScore + cashFlowScore + consistencyScore);
  const targetMonthlySavings = Math.round(monthlyIncome * 0.2); // 20% benchmark

  return {
    score,
    savingsRateScore,
    cashFlowScore,
    consistencyScore,
    monthlyIncome: Math.round(monthlyIncome),
    monthlyExpenses: Math.round(monthlyExpenses),
    monthlySurplus: Math.round(monthlySurplus),
    savingsRate: Math.round(savingsRate * 10) / 10,
    targetMonthlySavings
  };
}

export function calculateDebtScore(
  data: AssessmentData,
  monthlyIncome: number
): DebtPillarScore {
  if (!data.hasLoans || data.loans.length === 0) {
    return {
      score: 25,
      emiScore: 10,
      highInterestScore: 10,
      repaymentScore: 5,
      totalDebtPrincipal: 0,
      totalMonthlyEmi: 0,
      emiToIncomeRatio: 0,
      highInterestDebt: 0,
      hasOverdueDebt: false,
      overdueAmount: 0
    };
  }

  let totalDebtPrincipal = 0;
  let totalMonthlyEmi = 0;
  let highInterestDebt = 0;
  let overdueAmount = 0;
  let hasOverdueDebt = false;

  for (const loan of data.loans) {
    const principal = parseNum(loan.principal);
    const emi = parseNum(loan.monthlyEmi);
    const rate = parseNum(loan.interestRate);
    const overdue = parseNum(loan.overdueAmount);

    totalDebtPrincipal += principal;
    totalMonthlyEmi += emi;

    if (loan.type === 'credit_card' || loan.type === 'consumer_durable' || rate >= 14) {
      highInterestDebt += principal;
    }

    if (loan.isOverdue || overdue > 0) {
      hasOverdueDebt = true;
      overdueAmount += overdue;
    }
  }

  const emiToIncomeRatio = monthlyIncome > 0 ? (totalMonthlyEmi / monthlyIncome) * 100 : 0;

  // EMI ratio points out of 10:
  // <= 20%: 10
  // Above 20% to 30%: 8
  // Above 30% to 40%: 5
  // Above 40% to 50%: 2
  // Above 50%: 0
  let emiScore = 0;
  if (emiToIncomeRatio <= 20) emiScore = 10;
  else if (emiToIncomeRatio <= 30) emiScore = 8;
  else if (emiToIncomeRatio <= 40) emiScore = 5;
  else if (emiToIncomeRatio <= 50) emiScore = 2;
  else emiScore = 0;

  // High-interest debt exposure out of 10:
  let highInterestScore = 10;
  if (highInterestDebt > 0) {
    const ratioToIncome = monthlyIncome > 0 ? highInterestDebt / (monthlyIncome * 12) : 1;
    if (ratioToIncome > 0.5) highInterestScore = 0;
    else if (ratioToIncome > 0.2) highInterestScore = 3;
    else if (ratioToIncome > 0.05) highInterestScore = 6;
    else highInterestScore = 8;
  }

  // Repayment status: 5 points if clean, 0 if overdue
  const repaymentScore = hasOverdueDebt ? 0 : 5;

  const score = Math.min(25, emiScore + highInterestScore + repaymentScore);

  return {
    score,
    emiScore,
    highInterestScore,
    repaymentScore,
    totalDebtPrincipal: Math.round(totalDebtPrincipal),
    totalMonthlyEmi: Math.round(totalMonthlyEmi),
    emiToIncomeRatio: Math.round(emiToIncomeRatio * 10) / 10,
    highInterestDebt: Math.round(highInterestDebt),
    hasOverdueDebt,
    overdueAmount: Math.round(overdueAmount)
  };
}

export function generateSwotAnalysis(
  emergency: EmergencyPillarScore,
  insurance: InsurancePillarScore,
  savings: SavingsPillarScore,
  debt: DebtPillarScore,
  assets: AssetItem[],
  currency: CurrencyCode
): SWOTAnalysis {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const opportunities: string[] = [];
  const threats: string[] = [];

  // Strengths
  if (emergency.coverageMonths >= 6) {
    strengths.push(`Robust emergency buffer covering ${emergency.coverageMonths} months of essential expenses.`);
  }
  if (savings.savingsRate >= 20) {
    strengths.push(`Healthy savings rate of ${savings.savingsRate}% exceeds the financial benchmark of 20%.`);
  }
  if (debt.totalMonthlyEmi === 0) {
    strengths.push('Completely debt-free with zero monthly EMI commitments.');
  } else if (debt.emiToIncomeRatio <= 20) {
    strengths.push(`Comfortable EMI burden of only ${debt.emiToIncomeRatio}% of monthly income.`);
  }
  if (insurance.healthScore >= 12) {
    strengths.push(`Adequate health insurance coverage (${formatCurrency(insurance.healthSumInsured, currency)}).`);
  }
  if (assets.length >= 3) {
    strengths.push('Diversified asset holdings across multiple investment categories.');
  }

  // Weaknesses
  if (emergency.coverageMonths < 3) {
    weaknesses.push(`Low emergency runway (${emergency.coverageMonths} months), leaving vulnerable to unexpected shocks.`);
  }
  if (savings.savingsRate < 10) {
    weaknesses.push(`Current savings rate (${savings.savingsRate}%) leaves limited margin for future wealth building.`);
  }
  if (debt.highInterestDebt > 0) {
    weaknesses.push(`Exposure to high-interest debt (${formatCurrency(debt.highInterestDebt, currency)}) eroding monthly cash flow.`);
  }
  if (debt.emiToIncomeRatio > 40) {
    weaknesses.push(`High EMI-to-income ratio (${debt.emiToIncomeRatio}%), exceeding safe borrowing limits.`);
  }
  if (insurance.protectionGaps.length > 0) {
    insurance.protectionGaps.forEach(gap => weaknesses.push(gap));
  }

  // Opportunities
  if (savings.monthlySurplus > 0) {
    opportunities.push(`Deploy monthly surplus of ${formatCurrency(savings.monthlySurplus, currency)} into automated systematic investments.`);
  }
  if (debt.highInterestDebt > 0) {
    opportunities.push('Execute an aggressive debt avalanche strategy to eliminate high interest costs.');
  }
  if (emergency.shortfall > 0) {
    opportunities.push(`Automate ${formatCurrency(emergency.recommendedMonthlySavings, currency)}/mo to close emergency fund shortfall in 12 months.`);
  }
  opportunities.push('Explore tax-advantaged investment avenues (e.g., EPF, PPF, NPS, or retirement accounts) to maximize compounding.');

  // Threats
  if (debt.hasOverdueDebt) {
    threats.push('Active overdue loan payments can severely damage credit standing and lead to compounding penalties.');
  }
  if (emergency.coverageMonths < 1 && debt.emiToIncomeRatio > 30) {
    threats.push('Simultaneous lack of liquidity and high debt obligations creates high risk during income interruption.');
  }
  if (insurance.dependentsCount > 0 && insurance.lifeSumAssured === 0) {
    threats.push('Zero life protection leaves dependents financially exposed in an unexpected event.');
  }
  if (savings.monthlySurplus < 0) {
    threats.push('Negative monthly cash flow is actively depleting existing savings or increasing debt.');
  }

  // Fallbacks if lists are empty
  if (strengths.length === 0) strengths.push('Proactive financial awareness by taking this comprehensive assessment.');
  if (weaknesses.length === 0) weaknesses.push('Maintain discipline to avoid lifestyle inflation as income rises.');
  if (threats.length === 0) threats.push('Monitor inflation impact on long-term purchasing power.');

  return { strengths, weaknesses, opportunities, threats };
}

export function generateRecommendations(
  emergency: EmergencyPillarScore,
  insurance: InsurancePillarScore,
  savings: SavingsPillarScore,
  debt: DebtPillarScore,
  currency: CurrencyCode
): Recommendation[] {
  const recs: Recommendation[] = [];

  // High priority: Overdue or High interest debt
  if (debt.hasOverdueDebt) {
    recs.push({
      id: 'debt-overdue',
      pillar: 'debt',
      priority: 'high',
      title: 'Clear Overdue Debt Immediately',
      action: `Pay off the ${formatCurrency(debt.overdueAmount, currency)} overdue balance to halt late fees and protect your credit score.`,
      estimatedScoreGain: 5,
      iconType: 'credit-card'
    });
  }

  if (debt.highInterestDebt > 0) {
    recs.push({
      id: 'debt-high-interest',
      pillar: 'debt',
      priority: 'high',
      title: 'Eliminate High-Interest Debt (Credit Card / Personal)',
      action: `Direct extra surplus toward clearing ${formatCurrency(debt.highInterestDebt, currency)} in high-interest balances before aggressive investing.`,
      estimatedScoreGain: 7,
      iconType: 'credit-card'
    });
  }

  // Emergency Fund
  if (emergency.coverageMonths < 3) {
    recs.push({
      id: 'emergency-fund-boost',
      pillar: 'emergency',
      priority: 'high',
      title: 'Build 3–6 Month Emergency Buffer',
      action: `Save ${formatCurrency(emergency.recommendedMonthlySavings, currency)} each month in an accessible liquid account until reaching ${formatCurrency(emergency.targetAmount, currency)}.`,
      estimatedScoreGain: 10,
      iconType: 'shield'
    });
  } else if (emergency.coverageMonths < 6) {
    recs.push({
      id: 'emergency-fund-extend',
      pillar: 'emergency',
      priority: 'medium',
      title: 'Expand Emergency Runway to 6 Months',
      action: `Gradually build your safety cushion from ${emergency.coverageMonths} to 6 months (${formatCurrency(emergency.targetAmount, currency)}).`,
      estimatedScoreGain: 3,
      iconType: 'shield'
    });
  }

  // Insurance
  if (insurance.healthScore < 10) {
    recs.push({
      id: 'insurance-health',
      pillar: 'insurance',
      priority: 'high',
      title: 'Secure Comprehensive Health Cover',
      action: `Obtain personal health insurance of at least ${formatCurrency(insurance.targetHealthCover, currency)} to protect against medical emergencies.`,
      estimatedScoreGain: 8,
      iconType: 'shield'
    });
  }

  if (insurance.isLifeNeeded && insurance.lifeScore < 7) {
    recs.push({
      id: 'insurance-life',
      pillar: 'insurance',
      priority: 'high',
      title: 'Procure Pure Term Life Insurance',
      action: `Since you support ${insurance.dependentsCount} dependent(s), acquire a term life policy with sum assured of ~${formatCurrency(insurance.targetLifeCover, currency)}.`,
      estimatedScoreGain: 6,
      iconType: 'shield'
    });
  }

  // Savings
  if (savings.savingsRate < 20) {
    recs.push({
      id: 'savings-boost',
      pillar: 'savings',
      priority: 'medium',
      title: 'Target a 20% Monthly Savings Benchmark',
      action: `Trim non-essential discretionary expenses to boost monthly surplus toward ${formatCurrency(savings.targetMonthlySavings, currency)}.`,
      estimatedScoreGain: 6,
      iconType: 'piggy-bank'
    });
  }

  if (savings.monthlySurplus > 0) {
    recs.push({
      id: 'investing-sip',
      pillar: 'investing',
      priority: 'low',
      title: 'Automate Wealth Building Investments',
      action: `Set up monthly automated investments into diversified index funds and balanced assets to build long-term compounding.`,
      estimatedScoreGain: 4,
      iconType: 'trending-up'
    });
  }

  return recs;
}

export function calculateFinScore(data: AssessmentData): FinScoreResult {
  const monthlyIncome = calculateTotalMonthlyIncome(data);
  const expenseBreakdown = calculateTotalMonthlyExpenses(data.expenses, data.customExpenses);
  const currency = data.personal?.currency || 'INR';

  const isCompletelyEmpty =
    monthlyIncome === 0 &&
    expenseBreakdown.total === 0 &&
    (!data.personal?.firstName || data.personal.firstName.trim() === '') &&
    (!data.assets || data.assets.length === 0) &&
    (!data.loans || data.loans.length === 0) &&
    parseNum(data.emergencyFund?.liquidSavings) === 0;

  if (isCompletelyEmpty) {
    return {
      totalScore: 0,
      grade: 'D',
      gradeTitle: 'No Assessment Data Recorded',
      gradeDescription: 'Fill out your assessment to evaluate your financial health score across all 4 diagnostic pillars.',
      pillarScores: {
        emergencyFund: {
          score: 0,
          coverageScore: 0,
          accessibilityScore: 0,
          coverageMonths: 0,
          essentialMonthlyExpenses: 0,
          targetMonths: 6,
          targetAmount: 0,
          shortfall: 0,
          progressPercentage: 0,
          recommendedMonthlySavings: 0,
        },
        insuranceProtection: {
          score: 0,
          healthScore: 0,
          lifeScore: 0,
          healthSumInsured: 0,
          targetHealthCover: 0,
          lifeSumAssured: 0,
          targetLifeCover: 0,
          dependentsCount: 0,
          isLifeNeeded: false,
          totalAnnualPremiums: 0,
          protectionGaps: ['No health or life policies recorded.'],
        },
        savingsHealth: {
          score: 0,
          savingsRateScore: 0,
          cashFlowScore: 0,
          consistencyScore: 0,
          monthlyIncome: 0,
          monthlyExpenses: 0,
          monthlySurplus: 0,
          savingsRate: 0,
          targetMonthlySavings: 0,
        },
        debtHealth: {
          score: 0,
          emiScore: 0,
          highInterestScore: 0,
          repaymentScore: 0,
          totalDebtPrincipal: 0,
          totalMonthlyEmi: 0,
          emiToIncomeRatio: 0,
          highInterestDebt: 0,
          hasOverdueDebt: false,
          overdueAmount: 0,
        },
      },
      metrics: {
        totalNetWorth: 0,
        totalAssets: 0,
        totalLiquidAssets: 0,
        totalMonthlyInvestments: 0,
        debtToAssetRatio: 0,
        goalsAnalysis: [],
      },
      swot: {
        strengths: ['Assessment ready to begin.'],
        weaknesses: ['No financial metrics provided yet.'],
        opportunities: ['Complete all 8 assessment steps to unlock custom scoring and debt/asset optimization.'],
        threats: ['Unassessed financial blindspots may increase vulnerability.'],
      },
      recommendations: [
        {
          id: 'start-assessment',
          pillar: 'savings',
          priority: 'high',
          title: 'Complete Your Assessment',
          action: 'Enter your monthly salary, living expenses, and current assets to generate a full diagnostic evaluation.',
          estimatedScoreGain: 100,
          iconType: 'trending-up',
        },
      ],
      currency,
    };
  }

  // Calculate debts first to feed into savings and emergency
  const debtHealth = calculateDebtScore(data, monthlyIncome);

  // Calculate Emergency fund
  const emergencyFund = calculateEmergencyFundScore(data, expenseBreakdown.essential);

  // Calculate Insurance
  const insuranceProtection = calculateInsuranceScore(data, monthlyIncome);

  // Calculate Savings health
  const savingsHealth = calculateSavingsScore(
    data,
    monthlyIncome,
    expenseBreakdown.total,
    debtHealth.totalMonthlyEmi
  );

  // Total FinScore (0 - 100)
  const totalScore = Math.min(100, Math.max(0,
    emergencyFund.score +
    insuranceProtection.score +
    savingsHealth.score +
    debtHealth.score
  ));

  // Determine Grade
  let grade: FinancialGrade = 'D';
  let gradeTitle = 'Needs immediate attention';
  let gradeDescription = 'Important gaps may increase vulnerability to financial shocks.';

  if (totalScore >= 80) {
    grade = 'A';
    gradeTitle = 'Excellent financial foundations';
    gradeDescription = 'Strong performance across most pillars, with remaining gaps clearly identified.';
  } else if (totalScore >= 65) {
    grade = 'B';
    gradeTitle = 'Good progress';
    gradeDescription = 'Reasonable foundations, with some areas requiring attention.';
  } else if (totalScore >= 50) {
    grade = 'C';
    gradeTitle = 'Needs improvement';
    gradeDescription = 'Several financial health indicators need improvement.';
  }

  // Asset Metrics
  let totalAssets = 0;
  let totalLiquidAssets = parseNum(data.emergencyFund.liquidSavings);
  let totalMonthlyInvestments = 0;

  for (const asset of data.assets) {
    const val = parseNum(asset.currentValue);
    const cont = parseNum(asset.monthlyContribution);
    totalAssets += val;
    totalMonthlyInvestments += cont;

    if (asset.category === 'cash_bank' || asset.category === 'fixed_deposits') {
      totalLiquidAssets += val;
    }
  }

  const totalNetWorth = totalAssets + parseNum(data.emergencyFund.liquidSavings) - debtHealth.totalDebtPrincipal;
  const debtToAssetRatio = totalAssets > 0 ? Math.round((debtHealth.totalDebtPrincipal / totalAssets) * 100) : 0;

  // Goals Analysis
  const currentYear = new Date().getFullYear();
  const goalsAnalysis = data.goals.map(g => {
    const targetAmt = parseNum(g.targetAmount);
    const targetYr = parseNum(g.targetYear) || currentYear + 5;
    const saved = parseNum(g.savedAmount);
    const cont = parseNum(g.monthlyContribution);
    const yearsRemaining = Math.max(1, targetYr - currentYear);
    const monthsRemaining = yearsRemaining * 12;
    const remainingToSave = Math.max(0, targetAmt - saved);
    const monthlyRequired = monthsRemaining > 0 ? Math.round(remainingToSave / monthsRemaining) : 0;

    // Strict 100-mark calculation for Future Goal
    // If goal is big and not saving anything (saved = 0 and monthly contribution = 0): exactly 0 marks!
    let score = 0;
    let onTrack = false;
    let progressPct = 0;

    if (targetAmt > 0) {
      progressPct = Math.min(100, Math.round((saved / targetAmt) * 100));

      if (saved >= targetAmt) {
        score = 100;
        onTrack = true;
      } else if (saved === 0 && cont === 0) {
        // Not saving now (zero saved & zero contribution) -> exactly 0 marks!
        score = 0;
        onTrack = false;
      } else {
        const fundingRatio = monthlyRequired > 0 ? Math.min(1, cont / monthlyRequired) : 0;
        const progressRatio = Math.min(1, saved / targetAmt);

        if (cont >= monthlyRequired && cont > 0) {
          onTrack = true;
          score = Math.min(100, Math.round(80 + progressRatio * 20));
        } else {
          onTrack = false;
          // Partial credit only based on actual contribution rate and saved corpus
          score = Math.min(79, Math.round((fundingRatio * 65) + (progressRatio * 20)));
        }
      }
    } else {
      score = 0;
      onTrack = false;
    }

    return {
      goalId: g.id,
      name: g.name || 'Financial Goal',
      targetAmount: targetAmt,
      targetYear: targetYr,
      yearsRemaining,
      monthlyRequired,
      currentMonthlyContribution: cont,
      savedAmount: saved,
      onTrack,
      score,
      progressPct,
      hidden: !!g.hidden
    };
  });

  const swot = generateSwotAnalysis(
    emergencyFund,
    insuranceProtection,
    savingsHealth,
    debtHealth,
    data.assets,
    currency
  );

  const recommendations = generateRecommendations(
    emergencyFund,
    insuranceProtection,
    savingsHealth,
    debtHealth,
    currency
  );

  return {
    totalScore,
    grade,
    gradeTitle,
    gradeDescription,
    currency,
    pillarScores: {
      emergencyFund,
      insuranceProtection,
      savingsHealth,
      debtHealth
    },
    swot,
    recommendations,
    metrics: {
      totalNetWorth,
      totalAssets,
      totalLiquidAssets,
      totalMonthlyInvestments,
      debtToAssetRatio,
      goalsAnalysis
    }
  };
}
