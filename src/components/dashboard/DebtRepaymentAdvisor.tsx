'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { AssessmentData, CurrencyCode, LoanItem, LoanType } from '@/types/assessment';
import { FinScoreResult } from '@/types/score';
import { formatCurrency, parseNum } from '@/utils/calculations';
import { 
  ShieldAlert, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  ArrowRight, 
  Calculator, 
  Layers, 
  Flame, 
  Snowflake, 
  Zap, 
  RefreshCw, 
  TrendingDown, 
  Coins, 
  Landmark, 
  Calendar, 
  Percent, 
  CreditCard, 
  DollarSign, 
  Check, 
  AlertTriangle, 
  Info,
  Clock,
  Sparkles,
  ArrowUpRight,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  ShieldCheck,
  PartyPopper
} from 'lucide-react';

interface DebtRepaymentAdvisorProps {
  assessment: AssessmentData;
  scoreResult: FinScoreResult;
  onUpdateAssessment?: (data: AssessmentData) => void;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
}

export type RepaymentToolId = 'planner' | 'extra_emi' | 'snowball_avalanche' | 'partial_prepay' | 'foreclosure' | 'refinance' | 'strategies';

export interface PlannerDebt {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // annual %
  minEmi: number;
  type?: LoanType;
  isFromAssessment?: boolean;
}

const DEFAULT_SAMPLE_DEBTS: PlannerDebt[] = [
  { id: 'sample_card', name: 'Credit card', balance: 30000, interestRate: 36, minEmi: 1500, type: 'credit_card' },
  { id: 'sample_personal', name: 'Personal loan', balance: 100000, interestRate: 14, minEmi: 3500, type: 'personal' },
  { id: 'sample_bike', name: 'Bike loan', balance: 80000, interestRate: 10, minEmi: 2800, type: 'auto' },
];

function getLoanTypeLabel(type: LoanType): string {
  switch (type) {
    case 'home': return 'Home Loan / Mortgage';
    case 'auto': return 'Auto / Vehicle Loan';
    case 'personal': return 'Personal Loan';
    case 'education': return 'Education Loan';
    case 'credit_card': return 'Credit Card Debt';
    case 'consumer_durable': return 'BNPL / Consumer Loan';
    default: return 'Loan / Liability';
  }
}

export const DebtRepaymentAdvisor: React.FC<DebtRepaymentAdvisorProps> = ({
  assessment,
  scoreResult,
  onUpdateAssessment,
  isOpen: controlledIsOpen,
  onToggleOpen,
}) => {
  // Collapsed by default (same as Asset Allocation Advisor)
  const [localIsOpen, setLocalIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<RepaymentToolId>('planner');
  const [showSaveSuccess, setShowSaveSuccess] = useState<boolean>(false);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : localIsOpen;

  const setOpen = (open: boolean) => {
    if (onToggleOpen) {
      onToggleOpen(open);
    } else {
      setLocalIsOpen(open);
    }
  };

  // Mandatory SEBI Disclaimer Warning Modal State
  const [showDisclaimerModal, setShowDisclaimerModal] = useState<boolean>(false);
  const [okInput, setOkInput] = useState<string>('');

  const currency: CurrencyCode = assessment?.personal?.currency || 'INR';

  // -------------------------------------------------------------
  // CHECK IF USER HAS ZERO LOANS IN ASSESSMENT (DEBT FREE)
  // -------------------------------------------------------------
  const isAssessmentDebtFree = useMemo(() => {
    return (
      !assessment.hasLoans ||
      !assessment.loans ||
      assessment.loans.length === 0 ||
      assessment.loans.every((l) => parseNum(l.principal) === 0)
    );
  }, [assessment.hasLoans, assessment.loans]);

  // Initial debts list derived from assessment
  const assessmentDebts = useMemo<PlannerDebt[]>(() => {
    if (assessment.hasLoans && assessment.loans && assessment.loans.length > 0) {
      const active = assessment.loans.filter((loan) => parseNum(loan.principal) > 0);
      if (active.length > 0) {
        return active.map((loan, idx) => ({
          id: loan.id || `loan_${idx}`,
          name: loan.customName || getLoanTypeLabel(loan.type),
          balance: parseNum(loan.principal),
          interestRate: parseNum(loan.interestRate) || (loan.type === 'credit_card' ? 36 : loan.type === 'personal' ? 14 : 10),
          minEmi: parseNum(loan.monthlyEmi) || Math.round(parseNum(loan.principal) * 0.025),
          type: loan.type,
          isFromAssessment: true,
        }));
      }
    }
    // If debt-free in assessment, initialize empty list so "DEBT FREE" is honored!
    return [];
  }, [assessment.hasLoans, assessment.loans]);

  // Dynamic debts list that user can add to, edit, and delete
  const [debts, setDebts] = useState<PlannerDebt[]>(assessmentDebts);

  // Sync if assessment changes externally
  useEffect(() => {
    if (assessment.hasLoans && assessment.loans && assessment.loans.length > 0) {
      const active = assessment.loans.filter((loan) => parseNum(loan.principal) > 0);
      if (active.length > 0) {
        setDebts(
          active.map((loan, idx) => ({
            id: loan.id || `loan_${idx}`,
            name: loan.customName || getLoanTypeLabel(loan.type),
            balance: parseNum(loan.principal),
            interestRate: parseNum(loan.interestRate) || (loan.type === 'credit_card' ? 36 : loan.type === 'personal' ? 14 : 10),
            minEmi: parseNum(loan.monthlyEmi) || Math.round(parseNum(loan.principal) * 0.025),
            type: loan.type,
            isFromAssessment: true,
          }))
        );
      } else {
        setDebts([]);
      }
    } else {
      setDebts([]);
    }
  }, [assessment.loans, assessment.hasLoans]);

  // Overall statistics from current debts
  const totalUserDebt = useMemo(() => {
    return debts.reduce((acc, d) => acc + d.balance, 0);
  }, [debts]);

  const totalUserMonthlyEmi = useMemo(() => {
    return debts.reduce((acc, d) => acc + d.minEmi, 0);
  }, [debts]);

  // -------------------------------------------------------------
  // OPEN/CLOSE HANDLER WITH SEBI WARNING MODAL & "OK" CONFIRMATION
  // -------------------------------------------------------------
  const handleToggleClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isOpen) {
      // Close without popup
      setOpen(false);
    } else {
      // Every time user tries to open, show warning modal and require typing "OK"
      setOkInput('');
      setShowDisclaimerModal(true);
    }
  };

  const handleConfirmOpen = () => {
    if (okInput.trim().toUpperCase() === 'OK') {
      setShowDisclaimerModal(false);
      setOpen(true);
    }
  };

  // -------------------------------------------------------------
  // TOOL 0: INTERACTIVE DEBT REPAYMENT PLANNER
  // -------------------------------------------------------------
  const userSalary = parseNum(assessment?.personal?.monthlyTakeHome) || 65000;
  const [plannerIncome, setPlannerIncome] = useState<number>(userSalary);
  const [extraRepaymentBudget, setExtraRepaymentBudget] = useState<number>(5000);
  const [strategyMode, setStrategyMode] = useState<'avalanche' | 'snowball'>('avalanche');

  // Form state to add new debt
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newBalance, setNewBalance] = useState<number | ''>('');
  const [newRate, setNewRate] = useState<number | ''>('');
  const [newEmi, setNewEmi] = useState<number | ''>('');
  const [newType, setNewType] = useState<LoanType>('personal');

  const handleAddDebt = () => {
    if (!newName.trim() || !newBalance) return;
    const balanceNum = Math.max(0, Number(newBalance) || 0);
    const rateNum = Math.max(0, Number(newRate) || (newType === 'credit_card' ? 36 : 12));
    const emiNum = Math.max(0, Number(newEmi) || Math.round(balanceNum * 0.03));

    const newDebtItem: PlannerDebt = {
      id: `debt_${Date.now()}`,
      name: newName.trim(),
      balance: balanceNum,
      interestRate: rateNum,
      minEmi: emiNum,
      type: newType,
      isFromAssessment: false,
    };

    setDebts((prev) => [...prev, newDebtItem]);
    setNewName('');
    setNewBalance('');
    setNewRate('');
    setNewEmi('');
    setShowAddForm(false);
  };

  const handleUpdateDebt = (id: string, updates: Partial<PlannerDebt>) => {
    setDebts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  };

  const handleDeleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
  };

  const handleResetToAssessment = () => {
    if (assessment.hasLoans && assessment.loans && assessment.loans.length > 0) {
      setDebts(assessmentDebts);
    } else {
      setDebts([]);
    }
  };

  const handleLoadSampleDebts = () => {
    setDebts(DEFAULT_SAMPLE_DEBTS);
  };

  const handleSaveToAssessment = () => {
    if (!onUpdateAssessment) return;
    const mappedLoans: LoanItem[] = debts.map((d) => ({
      id: d.id,
      type: d.type || 'other',
      customName: d.name,
      principal: d.balance,
      monthlyEmi: d.minEmi,
      interestRate: d.interestRate,
      remainingMonths: d.minEmi > 0 ? Math.ceil(d.balance / d.minEmi) : 36,
      overdueAmount: '',
      isOverdue: false,
    }));

    onUpdateAssessment({
      ...assessment,
      hasLoans: mappedLoans.length > 0,
      loans: mappedLoans,
    });

    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3500);
  };

  // Sorted list for priority display
  const sortedDebts = useMemo<PlannerDebt[]>(() => {
    const list = [...debts];
    if (strategyMode === 'avalanche') {
      return list.sort((a, b) => b.interestRate - a.interestRate);
    } else {
      return list.sort((a, b) => a.balance - b.balance);
    }
  }, [debts, strategyMode]);

  // -------------------------------------------------------------
  // CALCULATOR 1: EXTRA EMI CALCULATOR STATE
  // -------------------------------------------------------------
  const [extraEmiPrincipal, setExtraEmiPrincipal] = useState<number>(500000);
  const [extraEmiRate, setExtraEmiRate] = useState<number>(10.5);
  const [extraEmiTenureMonths, setExtraEmiTenureMonths] = useState<number>(60);
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(2500);

  const extraEmiResults = useMemo(() => {
    const P = Math.max(1000, extraEmiPrincipal);
    const r = Math.max(0.01, extraEmiRate) / 12 / 100;
    const n = Math.max(1, extraEmiTenureMonths);
    const extra = Math.max(0, extraMonthlyPayment);

    const standardEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const originalTotalPayment = standardEmi * n;
    const originalInterest = originalTotalPayment - P;

    let balance = P;
    let months = 0;
    let totalPaid = 0;
    const effectiveMonthly = standardEmi + extra;

    while (balance > 0 && months < n * 2) {
      months++;
      const interestForMonth = balance * r;
      const principalForMonth = effectiveMonthly - interestForMonth;
      if (principalForMonth >= balance) {
        totalPaid += balance + interestForMonth;
        balance = 0;
        break;
      } else {
        balance -= principalForMonth;
        totalPaid += effectiveMonthly;
      }
    }

    const revisedInterest = totalPaid - P;
    const interestSaved = Math.max(0, originalInterest - revisedInterest);
    const monthsSaved = Math.max(0, n - months);

    return {
      standardEmi: Math.round(standardEmi),
      revisedMonths: months,
      monthsSaved,
      originalInterest: Math.round(originalInterest),
      revisedInterest: Math.round(revisedInterest),
      interestSaved: Math.round(interestSaved),
    };
  }, [extraEmiPrincipal, extraEmiRate, extraEmiTenureMonths, extraMonthlyPayment]);

  const handleSelectDebtForExtraEmi = (debtId: string) => {
    const d = debts.find((x) => x.id === debtId);
    if (!d) return;
    setExtraEmiPrincipal(d.balance);
    setExtraEmiRate(d.interestRate);
    if (d.minEmi > 0) {
      const estimatedMonths = Math.ceil(d.balance / d.minEmi);
      setExtraEmiTenureMonths(Math.max(12, estimatedMonths));
    }
  };

  // -------------------------------------------------------------
  // CALCULATOR 2: SNOWBALL VS AVALANCHE STATE
  // -------------------------------------------------------------
  const [cmpExtraMonthly, setCmpExtraMonthly] = useState<number>(extraRepaymentBudget);

  const comparisonResult = useMemo(() => {
    const sourceList = debts.length > 0 ? debts : DEFAULT_SAMPLE_DEBTS;
    const simulateList = sourceList.map((d) => ({
      ...d,
      bal: d.balance,
      rate: d.interestRate,
      min: Math.max(500, d.minEmi || d.balance * 0.03),
    }));

    const simulateMethod = (mode: 'snowball' | 'avalanche') => {
      const items = simulateList.map((d) => ({ ...d }));
      let totalInterest = 0;
      let month = 0;

      while (items.some((d) => d.bal > 0) && month < 180) {
        month++;
        for (const d of items) {
          if (d.bal > 0) {
            const interest = d.bal * (d.rate / 100 / 12);
            totalInterest += interest;
            d.bal += interest;
          }
        }

        let extraPool = cmpExtraMonthly;
        for (const d of items) {
          if (d.bal > 0) {
            const pay = Math.min(d.bal, d.min);
            d.bal -= pay;
            if (d.bal <= 0) {
              extraPool += d.min;
            }
          }
        }

        const active = items.filter((d) => d.bal > 0);
        if (active.length > 0) {
          if (mode === 'snowball') {
            active.sort((a, b) => a.bal - b.bal);
          } else {
            active.sort((a, b) => b.rate - a.rate);
          }
          active[0].bal -= Math.min(active[0].bal, extraPool);
        }
      }

      return { totalInterest: Math.round(totalInterest), months: month };
    };

    const avalanche = simulateMethod('avalanche');
    const snowball = simulateMethod('snowball');
    const interestDiff = Math.max(0, snowball.totalInterest - avalanche.totalInterest);

    return {
      avalanche,
      snowball,
      interestDiff,
      usedSample: debts.length === 0,
    };
  }, [debts, cmpExtraMonthly]);

  // -------------------------------------------------------------
  // CALCULATOR 3: PARTIAL PREPAYMENT STATE
  // -------------------------------------------------------------
  const [prepayPrincipal, setPrepayPrincipal] = useState<number>(2000000);
  const [prepayRate, setPrepayRate] = useState<number>(9.0);
  const [prepayRemainingMonths, setPrepayRemainingMonths] = useState<number>(180);
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(200000);
  const [prepayChoice, setPrepayChoice] = useState<'reduce_tenure' | 'reduce_emi'>('reduce_tenure');

  const partialPrepayResult = useMemo(() => {
    const P = Math.max(10000, prepayPrincipal);
    const r = Math.max(0.01, prepayRate) / 12 / 100;
    const n = Math.max(1, prepayRemainingMonths);
    const lump = Math.min(P - 1000, Math.max(0, lumpSumAmount));

    const currentEmi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const originalTotalInterest = currentEmi * n - P;

    const newPrincipal = P - lump;

    if (prepayChoice === 'reduce_emi') {
      const newEmi = (newPrincipal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      const newTotalInterest = newEmi * n - newPrincipal;
      const monthlySavings = currentEmi - newEmi;
      const totalInterestSaved = originalTotalInterest - newTotalInterest;

      return {
        currentEmi: Math.round(currentEmi),
        newEmi: Math.round(newEmi),
        monthlySavings: Math.round(monthlySavings),
        newTenureMonths: n,
        monthsSaved: 0,
        totalInterestSaved: Math.round(totalInterestSaved),
        newPrincipal: Math.round(newPrincipal),
      };
    } else {
      let newMonths = 0;
      let balance = newPrincipal;
      let interestAccumulated = 0;
      while (balance > 0 && newMonths < n) {
        newMonths++;
        const interest = balance * r;
        interestAccumulated += interest;
        const principalPaid = currentEmi - interest;
        if (principalPaid >= balance) {
          balance = 0;
          break;
        } else {
          balance -= principalPaid;
        }
      }

      const totalInterestSaved = originalTotalInterest - interestAccumulated;
      const monthsSaved = Math.max(0, n - newMonths);

      return {
        currentEmi: Math.round(currentEmi),
        newEmi: Math.round(currentEmi),
        monthlySavings: 0,
        newTenureMonths: newMonths,
        monthsSaved,
        totalInterestSaved: Math.round(Math.max(0, totalInterestSaved)),
        newPrincipal: Math.round(newPrincipal),
      };
    }
  }, [prepayPrincipal, prepayRate, prepayRemainingMonths, lumpSumAmount, prepayChoice]);

  // -------------------------------------------------------------
  // CALCULATOR 4: FORECLOSURE SAVINGS CALCULATOR STATE
  // -------------------------------------------------------------
  const [foreclosePrincipal, setForeclosePrincipal] = useState<number>(205000);
  const [remainingScheduledTotal, setRemainingScheduledTotal] = useState<number>(230000);
  const [forecloseCharges, setForecloseCharges] = useState<number>(2000);

  const foreclosureResult = useMemo(() => {
    const grossDifference = Math.max(0, remainingScheduledTotal - foreclosePrincipal);
    const netFinancialBenefit = grossDifference - forecloseCharges;

    return {
      grossDifference,
      netFinancialBenefit,
    };
  }, [foreclosePrincipal, remainingScheduledTotal, forecloseCharges]);

  // -------------------------------------------------------------
  // CALCULATOR 5: BALANCE TRANSFER / REFINANCING STATE
  // -------------------------------------------------------------
  const [refinancePrincipal, setRefinancePrincipal] = useState<number>(500000);
  const [currentRate, setCurrentRate] = useState<number>(16.0);
  const [refinanceTenureMonths, setRefinanceTenureMonths] = useState<number>(48);
  const [newOfferedRate, setNewOfferedRate] = useState<number>(12.0);
  const [processingFeePercent, setProcessingFeePercent] = useState<number>(1.0);

  const refinanceResult = useMemo(() => {
    const P = Math.max(1000, refinancePrincipal);
    const rCurrent = (currentRate / 12) / 100;
    const rNew = (newOfferedRate / 12) / 100;
    const n = Math.max(1, refinanceTenureMonths);

    const oldEmi = (P * rCurrent * Math.pow(1 + rCurrent, n)) / (Math.pow(1 + rCurrent, n) - 1);
    const oldTotalInterest = oldEmi * n - P;

    const newEmi = (P * rNew * Math.pow(1 + rNew, n)) / (Math.pow(1 + rNew, n) - 1);
    const newTotalInterest = newEmi * n - P;

    const feeAmount = (P * processingFeePercent) / 100;
    const grossInterestSavings = oldTotalInterest - newTotalInterest;
    const netSavings = grossInterestSavings - feeAmount;
    const monthlyDifference = oldEmi - newEmi;
    const breakevenMonths = monthlyDifference > 0 ? Math.ceil(feeAmount / monthlyDifference) : 0;

    return {
      oldEmi: Math.round(oldEmi),
      newEmi: Math.round(newEmi),
      monthlyDifference: Math.round(monthlyDifference),
      oldTotalInterest: Math.round(oldTotalInterest),
      newTotalInterest: Math.round(newTotalInterest),
      feeAmount: Math.round(feeAmount),
      netSavings: Math.round(netSavings),
      breakevenMonths,
    };
  }, [refinancePrincipal, currentRate, refinanceTenureMonths, newOfferedRate, processingFeePercent]);

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/90 shadow-sm overflow-hidden transition-all duration-300">
      {/* HEADER BANNER / OPEN-CLOSE TOGGLE */}
      <div 
        onClick={handleToggleClick}
        className="w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-indigo-950 p-5 sm:p-6 text-white cursor-pointer select-none flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:brightness-105"
      >
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-400/20 text-indigo-300 border border-indigo-400/30">
                Debt Elimination Framework
              </span>
              <span className="text-xs text-zinc-300 font-medium">
                {isAssessmentDebtFree && debts.length === 0 ? (
                  <span className="text-emerald-300 font-bold">100% Debt Free · 0 Liabilities</span>
                ) : (
                  `${debts.length} ${debts.length === 1 ? 'Liability' : 'Liabilities'} · 10 Strategies · 5 Calculators`
                )}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              Debt Management & Loan Repayment Strategies
            </h3>
            <p className="text-xs text-zinc-300">
              {isAssessmentDebtFree
                ? 'Zero debt in your assessment! Explore acceleration strategies & simulation tools'
                : 'Loaded from your assessment · Add & edit debts live · Avalanche vs Snowball optimization'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          {/* SHOW DEBT FREE STATUS IF NO LOANS IN ASSESSMENT */}
          {isAssessmentDebtFree && debts.length === 0 ? (
            <div className="text-right hidden sm:block">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-xs font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                ZERO DEBT · DEBT FREE
              </div>
              <div className="text-[11px] text-zinc-300 mt-0.5">0 Active Liabilities</div>
            </div>
          ) : (
            <div className="text-right hidden sm:block">
              <div className="text-[11px] text-indigo-300 font-semibold uppercase">Total Debt in Planner</div>
              <div className="text-sm font-extrabold text-white">
                {formatCurrency(totalUserDebt, currency)} ({formatCurrency(totalUserMonthlyEmi, currency)}/mo)
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setOkInput('');
              setShowDisclaimerModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 transition-all cursor-pointer"
            title="View SEBI Regulatory Warnings and Disclaimers"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Advisory Warning</span>
          </button>

          <button
            type="button"
            onClick={handleToggleClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-indigo-500 hover:bg-indigo-400 text-white shadow-md transition-all cursor-pointer"
          >
            <span>{isOpen ? 'Close Debt Repayment' : 'Debt Repayment'}</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEBI REGULATORY ADVISORY WARNING MODAL (REQUIRES TYPING "OK") */}
      {/* ============================================================ */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-zinc-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Regulatory Advisory & Disclaimer
                </span>
                <h4 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight mt-0.5">
                  Important Compliance Notice
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs sm:text-sm text-amber-950 leading-relaxed space-y-2.5">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                <span>⚠️</span>
                <span>This is NOT a formal financial recommendation.</span>
              </div>
              <ul className="text-xs text-amber-900/95 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>We are NOT SEBI-registered advisors</strong>, investment counselors, or certified debt restructuring consultants.
                </li>
                <li>
                  <strong>Please contact a SEBI-registered financial advisor</strong> before executing any loan prepayment, foreclosure, balance transfer, or restructuring decisions.
                </li>
                <li>
                  <strong>This tool is strictly for educational & illustrative purposes only.</strong> Numerical models represent theoretical formulas based on standard lending math.
                </li>
                <li>
                  <strong>This website is an experimental calculation tool and is not completely finalized.</strong> FinScore and its developers are <strong>not responsible or legally liable</strong> for any monetary loss, charges, penalties, or outcomes resulting from actions taken using this site.
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-1">
              <label className="text-xs font-bold text-zinc-700 block">
                To confirm you understand and accept this disclaimer, type{' '}
                <span className="font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 font-mono">
                  OK
                </span>{' '}
                below:
              </label>
              <input
                type="text"
                placeholder="Type OK here to confirm..."
                value={okInput}
                onChange={(e) => setOkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && okInput.trim().toUpperCase() === 'OK') {
                    handleConfirmOpen();
                  }
                }}
                className="w-full px-4 py-2.5 text-sm font-black uppercase tracking-wider text-zinc-900 bg-zinc-50 border-2 border-zinc-200 rounded-xl focus:border-indigo-600 focus:bg-white focus:outline-none"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setShowDisclaimerModal(false);
                  setOkInput('');
                  setOpen(false); // Cancel closes the section as requested: "else cancel close the that both"
                }}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
              >
                Cancel & Close
              </button>
              <button
                type="button"
                disabled={okInput.trim().toUpperCase() !== 'OK'}
                onClick={handleConfirmOpen}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-black text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Confirm & Open
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPANDED CONTENT BODY */}
      {isOpen && (
        <div className="p-5 sm:p-7 space-y-7 bg-[#fafbfc]">
          {/* NAVIGATION SUB-TABS */}
          <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200/80 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('planner')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'planner'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Interactive Debt Planner {debts.length > 0 ? `(${debts.length})` : '(0)'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('extra_emi')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'extra_emi'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>Extra EMI Calculator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('snowball_avalanche')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'snowball_avalanche'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Snowball vs Avalanche</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('partial_prepay')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'partial_prepay'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Partial Prepayment</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('foreclosure')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'foreclosure'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Foreclosure Savings</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('refinance')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'refinance'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80'
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Balance Transfer</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('strategies')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'strategies'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-200/80'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>10 Strategies with Examples</span>
            </button>
          </div>

          {/* ============================================================ */}
          {/* TAB 1: INTERACTIVE DEBT REPAYMENT PLANNER */}
          {/* ============================================================ */}
          {activeTab === 'planner' && (
            <div className="space-y-6">
              {/* DEBT FREE CELEBRATION BANNER (SHOWN IF USER HAS ZERO DEBT IN ASSESSMENT) */}
              {isAssessmentDebtFree && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-900/10 via-emerald-800/10 to-teal-900/10 border-2 border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center justify-center shrink-0 font-black text-xl shadow-2xs">
                      🎉
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                          Assessment Status
                        </span>
                        <span className="text-sm font-black text-emerald-950">
                          DEBT FREE · Zero Active Liabilities
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 mt-0.5">
                        Your diagnostic assessment recorded 0 loans or credit card debt. You have 0 EMI liabilities dragging down your wealth compounding runway! You can use this planner to simulate hypothetical payoff scenarios or test the 5 calculators.
                      </p>
                    </div>
                  </div>

                  {debts.length === 0 && (
                    <button
                      type="button"
                      onClick={handleLoadSampleDebts}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-zinc-50 text-emerald-900 border border-emerald-300 shadow-2xs shrink-0 cursor-pointer"
                    >
                      Load Sample Simulation Debts
                    </button>
                  )}
                </div>
              )}

              {/* TOP CONTROLS & ADD / SYNC BUTTONS */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Live Simulation & Repayment Ordering
                    </span>
                    <h4 className="text-base sm:text-lg font-black text-zinc-900 mt-1">
                      Debt Repayment Planner
                    </h4>
                    <p className="text-xs text-zinc-500">
                      {debts.length > 0
                        ? 'Loaded from your assessment. Add, edit, or remove debts below to see the priority order change.'
                        : 'No active debts. Add a debt or load sample loans to simulate repayment strategies.'}
                    </p>
                  </div>

                  {/* Actions: Add Debt, Sync, Save */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddForm(!showAddForm)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Debt / Loan</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleResetToAssessment}
                      className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-all cursor-pointer"
                      title="Reload debts from your assessment"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset to Assessment</span>
                    </button>

                    {onUpdateAssessment && (
                      <button
                        type="button"
                        onClick={handleSaveToAssessment}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all cursor-pointer"
                        title="Update assessment loans with your planner changes"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save to Assessment</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Save Confirmation Notification */}
                {showSaveSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in duration-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Successfully synced debts with your Assessment profile! Your health score and balance sheet are updated.</span>
                  </div>
                )}

                {/* INLINE ADD DEBT FORM (Collapsible) */}
                {showAddForm && (
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                        + Add a New Debt or Loan
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="text-xs text-zinc-400 hover:text-zinc-700 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-zinc-700">Debt Name / Lender</label>
                        <input
                          type="text"
                          placeholder="e.g. HDFC Credit Card"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-zinc-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-700">Category</label>
                        <select
                          value={newType}
                          onChange={(e) => setNewType(e.target.value as LoanType)}
                          className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-zinc-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                        >
                          <option value="credit_card">Credit Card (Revolving)</option>
                          <option value="personal">Personal Loan</option>
                          <option value="auto">Auto / Bike Loan</option>
                          <option value="home">Home Loan / Mortgage</option>
                          <option value="education">Education Loan</option>
                          <option value="consumer_durable">BNPL / Consumer Loan</option>
                          <option value="other">Other Liability</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-700">Outstanding Balance ({currency})</label>
                        <input
                          type="number"
                          placeholder="e.g. 50000"
                          value={newBalance}
                          onChange={(e) => setNewBalance(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-zinc-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-700">Annual Interest Rate (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="e.g. 14.5"
                          value={newRate}
                          onChange={(e) => setNewRate(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-zinc-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-zinc-700">Monthly EMI ({currency})</label>
                        <input
                          type="number"
                          placeholder="e.g. 2500"
                          value={newEmi}
                          onChange={(e) => setNewEmi(e.target.value ? Number(e.target.value) : '')}
                          className="w-full px-3 py-1.5 text-xs font-bold bg-white border border-zinc-200 rounded-xl focus:border-indigo-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="button"
                        onClick={handleAddDebt}
                        disabled={!newName.trim() || !newBalance}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white shadow-xs cursor-pointer"
                      >
                        Confirm Add Debt
                      </button>
                    </div>
                  </div>
                )}

                {/* MONTHLY INCOME & STRATEGY PICKER */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Monthly Income */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Monthly income ({currency})</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-zinc-400 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={plannerIncome || ''}
                        onChange={(e) => setPlannerIncome(Number(e.target.value) || 0)}
                        className="w-full pl-7 pr-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Extra Repayment Budget */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-emerald-800">Extra repayment per month ({currency})</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-emerald-600 font-bold">₹</span>
                      <input
                        type="number"
                        min="0"
                        value={extraRepaymentBudget || ''}
                        onChange={(e) => {
                          const val = Number(e.target.value) || 0;
                          setExtraRepaymentBudget(val);
                          setCmpExtraMonthly(val);
                        }}
                        className="w-full pl-7 pr-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50/50 border border-emerald-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Choose Repayment Strategy */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Choose Repayment Strategy</label>
                    <div className="bg-zinc-100 p-1 rounded-xl flex items-center border border-zinc-200">
                      <button
                        type="button"
                        onClick={() => setStrategyMode('avalanche')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          strategyMode === 'avalanche'
                            ? 'bg-white text-indigo-900 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span>Avalanche (Highest Rate)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStrategyMode('snowball')}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          strategyMode === 'snowball'
                            ? 'bg-white text-indigo-900 shadow-xs'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        <Snowflake className="w-3.5 h-3.5 text-sky-500" />
                        <span>Snowball (Lowest Balance)</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* EDITABLE DEBTS TABLE / CARDS */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-black text-zinc-900 uppercase tracking-wide">
                        Your Debts & Loans List ({debts.length})
                      </span>
                    </div>
                    {debts.length > 0 && (
                      <span className="text-[11px] text-zinc-400">
                        Edit any balance, rate, or name directly in the boxes below
                      </span>
                    )}
                  </div>

                  {debts.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-emerald-50/50 border-2 border-dashed border-emerald-200 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-emerald-950">You are Completely Debt-Free!</h4>
                        <p className="text-xs text-zinc-600 max-w-md mx-auto mt-1">
                          You have 0 active debts or EMIs in your profile. You can explore the 10 strategies & 5 calculators, or load sample loans to simulate repayment ordering.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(true)}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                        >
                          + Add a Debt to Simulate
                        </button>
                        <button
                          type="button"
                          onClick={handleLoadSampleDebts}
                          className="px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 cursor-pointer"
                        >
                          Load Sample Simulation Loans (₹2.1 Lakh)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-100 text-zinc-600 font-bold border-b border-zinc-200 text-[11px]">
                          <tr>
                            <th className="py-2.5 px-3">Debt Name</th>
                            <th className="py-2.5 px-3">Outstanding Balance ({currency})</th>
                            <th className="py-2.5 px-3">Interest Rate (% APR)</th>
                            <th className="py-2.5 px-3">Monthly EMI ({currency})</th>
                            <th className="py-2.5 px-3 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-200 bg-white">
                          {debts.map((debt) => (
                            <tr key={debt.id} className="hover:bg-zinc-50/80 transition-colors">
                              <td className="py-2 px-3">
                                <input
                                  type="text"
                                  value={debt.name}
                                  onChange={(e) => handleUpdateDebt(debt.id, { name: e.target.value })}
                                  className="w-full max-w-[200px] px-2.5 py-1 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  value={debt.balance || ''}
                                  onChange={(e) => handleUpdateDebt(debt.id, { balance: Number(e.target.value) || 0 })}
                                  className="w-full max-w-[140px] px-2.5 py-1 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    value={debt.interestRate || ''}
                                    onChange={(e) => handleUpdateDebt(debt.id, { interestRate: Number(e.target.value) || 0 })}
                                    className="w-20 px-2.5 py-1 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-none"
                                  />
                                  <span className="text-[11px] text-zinc-400 font-bold">%</span>
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <input
                                  type="number"
                                  min="0"
                                  value={debt.minEmi || ''}
                                  onChange={(e) => handleUpdateDebt(debt.id, { minEmi: Number(e.target.value) || 0 })}
                                  className="w-full max-w-[120px] px-2.5 py-1 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:border-indigo-500 focus:outline-none"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDebt(debt.id)}
                                  className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Delete debt from planner"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* OUTPUT: SUGGESTED REPAYMENT PRIORITY (SHOWN IF DEBTS EXIST) */}
              {debts.length > 0 && (
                <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h5 className="text-sm font-black text-zinc-900 uppercase tracking-wider">
                      Suggested Repayment Priority ({strategyMode === 'avalanche' ? 'Avalanche Order' : 'Snowball Order'})
                    </h5>
                    <span className="text-[11px] text-zinc-400 italic">
                      Illustrative ordering only. Actual payoff dates require each loan's rules & terms.
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3">
                    {sortedDebts.map((debt, index) => {
                      const isFirst = index === 0;
                      return (
                        <div
                          key={debt.id}
                          className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                            isFirst
                              ? 'bg-indigo-50/70 border-indigo-200 shadow-xs ring-1 ring-indigo-300'
                              : 'bg-zinc-50/70 border-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div
                              className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${
                                isFirst
                                  ? 'bg-indigo-600 text-white shadow-xs'
                                  : 'bg-zinc-200 text-zinc-700'
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-extrabold text-zinc-900">{debt.name}</span>
                                {isFirst && (
                                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    First Target
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-500 font-medium">
                                {formatCurrency(debt.balance, currency)} · {debt.interestRate}% APR · {formatCurrency(debt.minEmi, currency)}/mo EMI
                              </p>
                            </div>
                          </div>

                          <div className="sm:text-right">
                            {isFirst ? (
                              <div>
                                <span className="text-xs font-bold text-indigo-700">
                                  Direct {formatCurrency(extraRepaymentBudget, currency)}/mo Extra Surplus Here
                                </span>
                                <p className="text-[11px] text-zinc-500">
                                  Pay standard EMIs on remaining loans; channel all surplus here
                                </p>
                              </div>
                            ) : (
                              <div>
                                <span className="text-xs font-medium text-zinc-500">
                                  Pay standard minimum EMI ({formatCurrency(debt.minEmi, currency)}/mo)
                                </span>
                                <p className="text-[11px] text-zinc-400">Keep account in good standing</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Summary Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-zinc-100">
                    <div className="p-4 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-600">Total listed debt</span>
                      <span className="text-base font-black text-zinc-900">
                        {formatCurrency(totalUserDebt, currency)}
                      </span>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-800">Extra repayment budget</span>
                      <span className="text-base font-black text-emerald-900">
                        {formatCurrency(extraRepaymentBudget, currency)}/month
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* CALCULATOR 1: EXTRA EMI CALCULATOR */}
          {/* ============================================================ */}
          {activeTab === 'extra_emi' && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Calculator #1
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-zinc-900 mt-1">
                    Extra EMI Calculator
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Calculates the exact effect of paying extra money every month toward loan principal.
                  </p>
                </div>

                {debts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-bold">Populate with:</span>
                    <select
                      onChange={(e) => handleSelectDebtForExtraEmi(e.target.value)}
                      defaultValue=""
                      className="px-3 py-1.5 text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800"
                    >
                      <option value="" disabled>Select from your debts...</option>
                      {debts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({formatCurrency(d.balance, currency)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Outstanding Principal ({currency})</label>
                  <input
                    type="number"
                    value={extraEmiPrincipal || ''}
                    onChange={(e) => setExtraEmiPrincipal(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={extraEmiRate || ''}
                    onChange={(e) => setExtraEmiRate(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Remaining Tenure (Months)</label>
                  <input
                    type="number"
                    value={extraEmiTenureMonths || ''}
                    onChange={(e) => setExtraEmiTenureMonths(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-800">Extra Monthly Payment ({currency})</label>
                  <input
                    type="number"
                    value={extraMonthlyPayment || ''}
                    onChange={(e) => setExtraMonthlyPayment(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <div>
                  <span className="text-[11px] font-bold text-zinc-500">Standard Monthly EMI</span>
                  <div className="text-lg font-black text-zinc-900">
                    {formatCurrency(extraEmiResults.standardEmi, currency)}
                  </div>
                  <span className="text-[10px] text-zinc-400">Scheduled payment</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-700">Revised Repayment Time</span>
                  <div className="text-lg font-black text-indigo-900">
                    {extraEmiResults.revisedMonths} Months
                  </div>
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    Saved {extraEmiResults.monthsSaved} months ({(extraEmiResults.monthsSaved / 12).toFixed(1)} yrs)
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-700">Total Interest Saved</span>
                  <div className="text-lg font-black text-emerald-800">
                    {formatCurrency(extraEmiResults.interestSaved, currency)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    Direct cash saved
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-zinc-500">Total Interest Paid</span>
                  <div className="text-lg font-black text-zinc-900">
                    {formatCurrency(extraEmiResults.revisedInterest, currency)}
                  </div>
                  <span className="text-[10px] text-zinc-400">
                    vs {formatCurrency(extraEmiResults.originalInterest, currency)} original
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CALCULATOR 2: SNOWBALL VS AVALANCHE COMPARISON */}
          {/* ============================================================ */}
          {activeTab === 'snowball_avalanche' && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Calculator #2
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-zinc-900 mt-1">
                    Snowball vs. Avalanche Comparison Calculator
                  </h4>
                  <p className="text-xs text-zinc-500">
                    {comparisonResult.usedSample 
                      ? 'Simulated using standard sample debts (Credit Card 36%, Personal Loan 14%, Auto Loan 10%).'
                      : `Simulated using all ${debts.length} debts currently in your planner.`}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-zinc-700">Extra Monthly Pool:</span>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1.5 text-xs text-zinc-400">₹</span>
                    <input
                      type="number"
                      value={cmpExtraMonthly || ''}
                      onChange={(e) => setCmpExtraMonthly(Number(e.target.value) || 0)}
                      className="w-28 pl-6 pr-2 py-1 text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Side-by-side comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-orange-50/50 border border-orange-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Flame className="w-5 h-5 text-orange-600" />
                      <h5 className="text-sm font-black text-orange-950">Debt Avalanche Method</h5>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-orange-200 text-orange-900">
                      Lowest Cost
                    </span>
                  </div>
                  <p className="text-xs text-orange-800">
                    Highest interest rate paid off first across all liabilities.
                  </p>
                  <div className="pt-2 border-t border-orange-200/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-600">Total Interest Paid:</span>
                    <span className="text-base font-black text-orange-950">
                      {formatCurrency(comparisonResult.avalanche.totalInterest, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-600">
                    <span>Payoff Time:</span>
                    <span className="font-bold text-zinc-900">{comparisonResult.avalanche.months} Months</span>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Snowflake className="w-5 h-5 text-sky-600" />
                      <h5 className="text-sm font-black text-sky-950">Debt Snowball Method</h5>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-sky-200 text-sky-900">
                      Fastest Wins
                    </span>
                  </div>
                  <p className="text-xs text-sky-800">
                    Smallest balance paid off first for psychological reinforcement.
                  </p>
                  <div className="pt-2 border-t border-sky-200/60 flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-600">Total Interest Paid:</span>
                    <span className="text-base font-black text-sky-950">
                      {formatCurrency(comparisonResult.snowball.totalInterest, currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-600">
                    <span>Payoff Time:</span>
                    <span className="font-bold text-zinc-900">{comparisonResult.snowball.months} Months</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-emerald-900">
                  Avalanche Interest Savings Delta:
                </span>
                <span className="text-sm font-black text-emerald-950">
                  Avalanche saves an extra {formatCurrency(comparisonResult.interestDiff, currency)} in interest compared to Snowball.
                </span>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CALCULATOR 3: PARTIAL PREPAYMENT CALCULATOR */}
          {/* ============================================================ */}
          {activeTab === 'partial_prepay' && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Calculator #3
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-zinc-900 mt-1">
                    Partial Loan Prepayment Calculator
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Simulate the exact financial payoff of making a lump-sum payment toward loan principal.
                  </p>
                </div>

                {debts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-bold">Populate with:</span>
                    <select
                      onChange={(e) => {
                        const d = debts.find((x) => x.id === e.target.value);
                        if (d) {
                          setPrepayPrincipal(d.balance);
                          setPrepayRate(d.interestRate);
                        }
                      }}
                      defaultValue=""
                      className="px-3 py-1.5 text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800"
                    >
                      <option value="" disabled>Select from your debts...</option>
                      {debts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({formatCurrency(d.balance, currency)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Outstanding Principal ({currency})</label>
                  <input
                    type="number"
                    value={prepayPrincipal || ''}
                    onChange={(e) => setPrepayPrincipal(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Annual Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={prepayRate || ''}
                    onChange={(e) => setPrepayRate(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Remaining Tenure (Months)</label>
                  <input
                    type="number"
                    value={prepayRemainingMonths || ''}
                    onChange={(e) => setPrepayRemainingMonths(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-800">Lump-Sum Prepayment ({currency})</label>
                  <input
                    type="number"
                    value={lumpSumAmount || ''}
                    onChange={(e) => setLumpSumAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Choice: Reduce Tenure vs Reduce EMI */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-700">Prepayment Allocation Strategy:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPrepayChoice('reduce_tenure')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      prepayChoice === 'reduce_tenure'
                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-zinc-900">Reduce Loan Tenure (Recommended)</span>
                      {prepayChoice === 'reduce_tenure' && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Keep the same monthly EMI and shorten the loan duration. Maximizes interest saved.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPrepayChoice('reduce_emi')}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                      prepayChoice === 'reduce_emi'
                        ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-zinc-900">Reduce Monthly EMI</span>
                      {prepayChoice === 'reduce_emi' && <Check className="w-4 h-4 text-indigo-600" />}
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      Keep the same remaining months but decrease your monthly payment to improve monthly cash flow.
                    </p>
                  </button>
                </div>
              </div>

              {/* Results */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div>
                  <span className="text-[11px] font-bold text-zinc-500">
                    {prepayChoice === 'reduce_emi' ? 'New Lower Monthly EMI' : 'Monthly EMI'}
                  </span>
                  <div className="text-lg font-black text-zinc-900">
                    {formatCurrency(partialPrepayResult.newEmi, currency)}
                  </div>
                  {prepayChoice === 'reduce_emi' ? (
                    <span className="text-[10px] text-emerald-600 font-bold">
                      Saves {formatCurrency(partialPrepayResult.monthlySavings, currency)}/month
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400">Maintained as standard</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-bold text-zinc-500">New Loan Duration</span>
                  <div className="text-lg font-black text-indigo-900">
                    {partialPrepayResult.newTenureMonths} Months
                  </div>
                  {prepayChoice === 'reduce_tenure' ? (
                    <span className="text-[10px] text-indigo-600 font-bold">
                      Saved {partialPrepayResult.monthsSaved} Months ({(partialPrepayResult.monthsSaved / 12).toFixed(1)} yrs)
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-400">Same duration as scheduled</span>
                  )}
                </div>

                <div>
                  <span className="text-[11px] font-bold text-emerald-700">Estimated Total Interest Saved</span>
                  <div className="text-lg font-black text-emerald-800">
                    {formatCurrency(partialPrepayResult.totalInterestSaved, currency)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    Net principal reduced to {formatCurrency(partialPrepayResult.newPrincipal, currency)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CALCULATOR 4: FORECLOSURE SAVINGS CALCULATOR */}
          {/* ============================================================ */}
          {activeTab === 'foreclosure' && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Calculator #4
                </span>
                <h4 className="text-base sm:text-lg font-black text-zinc-900 mt-1">
                  Full Foreclosure Savings Calculator
                </h4>
                <p className="text-xs text-zinc-500">
                  Compares closing the loan today in a single transaction versus continuing regular scheduled payments.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Lender's Foreclosure Quote ({currency})</label>
                  <input
                    type="number"
                    value={foreclosePrincipal || ''}
                    onChange={(e) => setForeclosePrincipal(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-zinc-400">Amount required to close today</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Remaining Scheduled Payments Total ({currency})</label>
                  <input
                    type="number"
                    value={remainingScheduledTotal || ''}
                    onChange={(e) => setRemainingScheduledTotal(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-zinc-400">Sum of all remaining future EMIs</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Foreclosure Fees / Taxes ({currency})</label>
                  <input
                    type="number"
                    value={forecloseCharges || ''}
                    onChange={(e) => setForecloseCharges(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                  <p className="text-[10px] text-zinc-400">Lender processing / penalty charges</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-zinc-500">Gross Difference</span>
                  <div className="text-xl font-black text-zinc-900">
                    {formatCurrency(foreclosureResult.grossDifference, currency)}
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Remaining Scheduled Total ({formatCurrency(remainingScheduledTotal, currency)}) - Foreclosure Amount ({formatCurrency(foreclosePrincipal, currency)})
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-emerald-700">Estimated Net Financial Benefit</span>
                  <div className="text-2xl font-black text-emerald-800">
                    {formatCurrency(foreclosureResult.netFinancialBenefit, currency)}
                  </div>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    Pure cash savings in your pocket after subtracting all fees.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CALCULATOR 5: BALANCE TRANSFER / REFINANCING */}
          {/* ============================================================ */}
          {activeTab === 'refinance' && (
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Calculator #5
                  </span>
                  <h4 className="text-base sm:text-lg font-black text-zinc-900 mt-1">
                    Loan Refinancing / Balance Transfer Calculator
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Compares your existing loan terms with a new offer to ensure the savings exceed transfer and processing charges.
                  </p>
                </div>

                {debts.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-bold">Populate with:</span>
                    <select
                      onChange={(e) => {
                        const d = debts.find((x) => x.id === e.target.value);
                        if (d) {
                          setRefinancePrincipal(d.balance);
                          setCurrentRate(d.interestRate);
                        }
                      }}
                      defaultValue=""
                      className="px-3 py-1.5 text-xs font-bold bg-zinc-50 border border-zinc-200 rounded-xl text-zinc-800"
                    >
                      <option value="" disabled>Select from your debts...</option>
                      {debts.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name} ({formatCurrency(d.balance, currency)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Outstanding Balance ({currency})</label>
                  <input
                    type="number"
                    value={refinancePrincipal || ''}
                    onChange={(e) => setRefinancePrincipal(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Current Interest Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentRate || ''}
                    onChange={(e) => setCurrentRate(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Remaining Months</label>
                  <input
                    type="number"
                    value={refinanceTenureMonths || ''}
                    onChange={(e) => setRefinanceTenureMonths(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-indigo-700">New Offered Rate (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newOfferedRate || ''}
                    onChange={(e) => setNewOfferedRate(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Transfer / Processing Fee (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={processingFeePercent || ''}
                    onChange={(e) => setProcessingFeePercent(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Refinance Results */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
                <div>
                  <span className="text-[11px] font-bold text-zinc-500">New Monthly EMI</span>
                  <div className="text-lg font-black text-indigo-900">
                    {formatCurrency(refinanceResult.newEmi, currency)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-bold">
                    Saves {formatCurrency(refinanceResult.monthlyDifference, currency)}/mo
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-zinc-500">Processing Fee Amount</span>
                  <div className="text-lg font-black text-rose-800">
                    {formatCurrency(refinanceResult.feeAmount, currency)}
                  </div>
                  <span className="text-[10px] text-zinc-400">One-time upfront fee</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-emerald-700">Net Estimated Savings</span>
                  <div className="text-lg font-black text-emerald-800">
                    {formatCurrency(refinanceResult.netSavings, currency)}
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    Net savings after all fees
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-zinc-500">Fee Breakeven Period</span>
                  <div className="text-lg font-black text-zinc-900">
                    {refinanceResult.breakevenMonths} Months
                  </div>
                  <span className="text-[10px] text-zinc-500">
                    Months to recover transfer fees
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 7: ALL 10 DEBT MANAGEMENT STRATEGIES WITH EXAMPLES */}
          {/* ============================================================ */}
          {activeTab === 'strategies' && (
            <div className="space-y-5">
              <div className="border-b border-zinc-200 pb-3">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Comprehensive Masterclass
                </span>
                <h4 className="text-base sm:text-lg font-black text-zinc-900 mt-1">
                  10 Debt Management & Loan Repayment Strategies with Examples
                </h4>
                <p className="text-xs text-zinc-500">
                  A complete playbook of actionable debt reduction strategies tailored for Indian borrowers and households.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Debt Snowball */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-800 text-xs font-black flex items-center justify-center">1</span>
                    <h5 className="text-sm font-black text-zinc-900">Debt Snowball Method</h5>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Pay the minimum amount on every loan, then put extra money toward the smallest outstanding balance first.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-1">
                    <span className="font-bold text-zinc-800">Example:</span>
                    <p className="text-zinc-600">
                      You have 3 debts: Credit card: ₹10,000, Personal loan: ₹50,000, Bike loan: ₹1,00,000. If you have ₹5,000 extra to repay, direct it to the credit card first while maintaining required payments on other debts.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                    Best for: People who need quick wins and psychological motivation.
                  </div>
                </div>

                {/* 2. Debt Avalanche */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 text-xs font-black flex items-center justify-center">2</span>
                    <h5 className="text-sm font-black text-zinc-900">Debt Avalanche Method</h5>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Pay minimums on all debts, then direct extra money toward the highest-interest debt first.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-1">
                    <span className="font-bold text-zinc-800">Example:</span>
                    <p className="text-zinc-600">
                      Credit card: ₹30,000 at 36% APR, Personal loan: ₹1,00,000 at 14%, Bike loan: ₹80,000 at 10%. Put extra repayment toward credit card first because it has the highest interest rate.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-orange-800 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                    Best for: Reducing total interest, assuming comparable fees and repayment terms.
                  </div>
                </div>

                {/* 3. Partial Prepayment */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">3</span>
                    <h5 className="text-sm font-black text-zinc-900">Partial Loan Prepayment</h5>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Pay an additional lump sum toward the principal before the loan's scheduled end date.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-1">
                    <span className="font-bold text-zinc-800">Example:</span>
                    <p className="text-zinc-600">
                      Your home loan principal is ₹20 lakh. You pay an additional ₹2 lakh toward principal. If the lender applies the full amount to principal, the balance reduces to ~₹18 lakh before adjustments.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                    Best for: Borrowers with surplus savings who want to reduce interest or the loan term.
                  </div>
                </div>

                {/* 4. Full Foreclosure */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-800 text-xs font-black flex items-center justify-center">4</span>
                    <h5 className="text-sm font-black text-zinc-900">Full Foreclosure / Early Loan Closure</h5>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Close the entire loan before its original maturity date by paying the lender's official foreclosure amount.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-1">
                    <span className="font-bold text-zinc-800">Example:</span>
                    <p className="text-zinc-600">
                      Lender quotes ₹2,05,000 to close a loan today. Remaining scheduled payments total ₹2,30,000. Potential gross difference is ₹25,000 savings before foreclosure fee adjustments.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                    Best for: Borrowers with sufficient funds after protecting their emergency savings.
                  </div>
                </div>

                {/* 5. EMI vs Tenure Reduction */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 text-xs font-black flex items-center justify-center">5</span>
                    <h5 className="text-sm font-black text-zinc-900">EMI Reduction vs. Tenure Reduction</h5>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    After partial prepayment, borrowers can choose lower EMI or shorter loan term, subject to lender rules.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-1">
                    <span className="font-bold text-zinc-800">Example:</span>
                    <p className="text-zinc-600">
                      ₹1 lakh prepayment on home loan: Reduce EMI for monthly affordability & cash flow; or Reduce tenure to keep paying similar EMI and close years earlier.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                    Best for: EMI reduction for cash flow; Tenure reduction to target lowest total interest.
                  </div>
                </div>

                {/* 6. Refinancing / Balance Transfer */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-violet-100 text-violet-800 text-xs font-black flex items-center justify-center">6</span>
                    <h5 className="text-sm font-black text-zinc-900">Refinancing / Balance Transfer</h5>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Move an existing loan to another lender if the new terms provide a worthwhile overall benefit.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-1">
                    <span className="font-bold text-zinc-800">Example:</span>
                    <p className="text-zinc-600">
                      Outstanding loan of ₹5 lakh at 16% interest. Another lender offers 12%. Compare interest savings against processing fees and transfer charges before switching.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-violet-800 bg-violet-50 px-2.5 py-1 rounded-lg border border-violet-100">
                    Best for: Borrowers who qualify for better loan terms and credit profile.
                  </div>
                </div>

                {/* 7. Debt Consolidation */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center">7</span>
                    <h5 className="text-sm font-black text-zinc-900">Debt Consolidation</h5>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Combine multiple debts into one new loan with a single repayment schedule and single EMI date.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-1">
                    <span className="font-bold text-zinc-800">Example:</span>
                    <p className="text-zinc-600">
                      You owe ₹40,000 on one loan and ₹60,000 on another. Consolidate into a single ₹1 lakh facility. Check new interest rate and tenure so total interest doesn't rise.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                    Best for: Simplifying payments when the new loan is genuinely affordable & cost-effective.
                  </div>
                </div>

                {/* 8. EMI Automation */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-green-100 text-green-800 text-xs font-black flex items-center justify-center">8</span>
                    <h5 className="text-sm font-black text-zinc-900">EMI Automation & Payment Scheduling</h5>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Schedule payments around your salary date via NACH / auto-debit and keep sufficient funds in the repayment account.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-1">
                    <span className="font-bold text-zinc-800">Example:</span>
                    <p className="text-zinc-600">
                      Salary arrives on the 1st and EMI is due on the 5th. Plan your budget and keep the EMI amount available before the due date to avoid bounce charges.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-green-800 bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
                    Best for: Avoiding missed payments, late fees, and credit score drops.
                  </div>
                </div>

                {/* 9. Credit Card Paydown */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 text-xs font-black flex items-center justify-center">9</span>
                    <h5 className="text-sm font-black text-zinc-900">Credit Card Paydown Strategy</h5>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Aim to pay the full statement balance by the due date. Prioritize reducing expensive revolving debt while keeping other required payments current.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-1">
                    <span className="font-bold text-zinc-800">Example:</span>
                    <p className="text-zinc-600">
                      Card balance is ₹25,000 at high interest. You have ₹8,000 available for extra debt repayment. After essentials, direct available funds toward reducing the card balance.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100">
                    Best for: Reducing expensive credit-card interest (36%–42% APR) and improving debt affordability.
                  </div>
                </div>

                {/* 10. Debt Restructuring */}
                <div className="bg-white p-5 rounded-2xl border border-zinc-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">10</span>
                    <h5 className="text-sm font-black text-zinc-900">Debt Restructuring or Settlement</h5>
                  </div>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Contact the lender if you cannot afford current repayments. Ask about revised terms, tenure extension, restructuring, or settlement options.
                  </p>
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs space-y-1">
                    <span className="font-bold text-zinc-800">Example:</span>
                    <p className="text-zinc-600">
                      Your monthly EMI is ₹20,000, but income has fallen. Ask the lender whether a longer tenure or revised plan is available. Get terms in writing before agreeing.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
                    Best for: Borrowers facing genuine repayment difficulties or temporary financial distress.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Advisory & SEBI Warning Bar */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Compliance Notice: This is an experimental educational calculation tool and not SEBI-registered debt advice.</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setOkInput('');
                setShowDisclaimerModal(true);
              }}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs shrink-0 cursor-pointer"
            >
              View Full Warnings List
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
