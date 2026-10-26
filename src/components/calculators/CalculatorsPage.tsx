'use client';

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Coins, 
  Percent, 
  BarChart3, 
  Sparkles, 
  CreditCard, 
  Repeat, 
  Landmark, 
  ArrowLeft, 
  ChevronRight, 
  Info, 
  CheckCircle2, 
  Calendar, 
  PieChart, 
  Activity, 
  ShieldCheck, 
  ArrowRight,
  Sliders,
  DollarSign,
  Plus,
  Trash2,
  RefreshCw,
  Table,
  TrendingDown,
  Flame,
  Calculator
} from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { StandardCalculator } from './StandardCalculator';
import { FireCalculator } from './FireCalculator';

export type CalculatorId = 
  | 'normal'
  | 'fire'
  | 'sip' 
  | 'inflation'
  | 'stepup' 
  | 'lumpsum' 
  | 'xirr' 
  | 'cagr' 
  | 'compound' 
  | 'emi' 
  | 'swp' 
  | 'nps' 
  | 'mis';

interface CalculatorsPageProps {
  initialCalculator?: CalculatorId;
  onBackToHome: () => void;
  onStartAssessment: () => void;
}

// Convert large numbers to Indian Lakh / Crore string
export function formatIndianUnits(num: number): string {
  if (num >= 10000000) {
    return `${(num / 10000000).toFixed(2)} Crore`;
  }
  if (num >= 100000) {
    return `${(num / 100000).toFixed(2)} Lakh`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)} Thousand`;
  }
  return String(Math.round(num));
}

// Convert numbers to clean currency format for Y-axis (₹ Cr / ₹ L / ₹ K / ₹ 0)
export function formatYAxisAmount(num: number): string {
  if (num <= 0) return '₹0';
  if (num >= 10000000) {
    const cr = num / 10000000;
    return `₹${cr >= 10 ? cr.toFixed(1) : cr.toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    const lk = num / 100000;
    return `₹${lk >= 10 ? lk.toFixed(1) : lk.toFixed(2)} L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(0)} K`;
  }
  return `₹${Math.round(num)}`;
}

// Financial-grade XIRR solver (matching Microsoft Excel / Google Sheets XIRR standard)
function calculateXIRR(cashFlows: { amount: number; date: Date }[], guess = 0.12): number {
  if (cashFlows.length < 2) return 0;

  // Filter non-zero entries
  const validFlows = cashFlows.filter(cf => cf.amount !== 0 && !isNaN(cf.amount));
  if (validFlows.length < 2) return 0;

  const hasNegative = validFlows.some(cf => cf.amount < 0);
  const hasPositive = validFlows.some(cf => cf.amount > 0);
  if (!hasNegative || !hasPositive) return 0;

  // 1. Sort in strict ascending chronological order
  const sorted = [...validFlows].sort((a, b) => a.date.getTime() - b.date.getTime());
  const d0 = sorted[0].date.getTime();
  const msPerDay = 24 * 3600 * 1000;

  // Daycount standard: Excel uses 365.0 days/year
  const times = sorted.map(cf => (cf.date.getTime() - d0) / (365.0 * msPerDay));
  const amounts = sorted.map(cf => cf.amount);

  // NPV function: sum(C_i / (1 + r)^t_i)
  const npv = (r: number): number => {
    let sum = 0;
    for (let i = 0; i < amounts.length; i++) {
      const den = Math.pow(1 + r, times[i]);
      if (den === 0 || isNaN(den) || !isFinite(den)) return Infinity;
      sum += amounts[i] / den;
    }
    return sum;
  };

  // Derivative dNPV/dr: sum(-t_i * C_i / ((1 + r)^(t_i + 1)))
  const dnpv = (r: number): number => {
    let sum = 0;
    for (let i = 0; i < amounts.length; i++) {
      const t = times[i];
      const den = Math.pow(1 + r, t) * (1 + r);
      if (den === 0 || isNaN(den) || !isFinite(den)) return 0;
      sum -= (t * amounts[i]) / den;
    }
    return sum;
  };

  // 2. Multi-guess Newton-Raphson with bounded stepping
  const guessList = [guess, 0.1, 0.2, 0.05, -0.05, 0.5, -0.2, -0.5, 1.0, 0.0];
  const maxIterations = 100;
  const tol = 1e-7;

  for (const g of guessList) {
    let rate = g;
    let converged = false;

    for (let i = 0; i < maxIterations; i++) {
      if (rate <= -0.999) {
        rate = -0.999;
      }

      const fValue = npv(rate);
      const fDerivative = dnpv(rate);

      if (!Number.isFinite(fValue) || !Number.isFinite(fDerivative) || Math.abs(fDerivative) < 1e-12) {
        break;
      }

      const step = fValue / fDerivative;
      let newRate = rate - step;

      // Damp step if it shoots below -0.999
      if (newRate <= -0.999) {
        newRate = (rate - 0.999) / 2;
      }

      if (Math.abs(newRate - rate) < tol) {
        rate = newRate;
        converged = true;
        break;
      }
      rate = newRate;
    }

    if (converged && Number.isFinite(rate) && rate > -0.999) {
      // Return 2 decimal places precision (e.g. 17.86% instead of 17.9%)
      return Math.round(rate * 10000) / 100;
    }
  }

  // 3. Robust Bisection fallback for difficult cash flow curves
  let low = -0.99;
  let high = 10.0;
  let fLow = npv(low);
  let fHigh = npv(high);

  if (fLow * fHigh <= 0) {
    for (let i = 0; i < 100; i++) {
      const mid = (low + high) / 2;
      const fMid = npv(mid);
      if (Math.abs(fMid) < 1e-6 || (high - low) < tol) {
        return Math.round(mid * 10000) / 100;
      }
      if (fLow * fMid < 0) {
        high = mid;
        fHigh = fMid;
      } else {
        low = mid;
        fLow = fMid;
      }
    }
  }

  return 0;
}

interface XirrTransaction {
  id: string;
  amount: number;
  dateStr: string;
  type: 'invest' | 'withdraw'; // 'invest' = cash out (SIP / deposit -), 'withdraw' = cash in (redemption +)
}

const DEFAULT_XIRR_TRANSACTIONS: XirrTransaction[] = [
  { id: '1', amount: 10000, dateStr: '2023-01-01', type: 'invest' },
  { id: '2', amount: 10000, dateStr: '2023-07-01', type: 'invest' },
  { id: '3', amount: 10000, dateStr: '2024-01-01', type: 'invest' },
  { id: '4', amount: 38500, dateStr: '2025-01-01', type: 'withdraw' },
];

export const CalculatorsPage: React.FC<CalculatorsPageProps> = ({
  initialCalculator = 'normal',
  onBackToHome,
  onStartAssessment,
}) => {
  const [activeTab, setActiveTab] = useState<CalculatorId>(initialCalculator);
  const [chartMode, setChartMode] = useState<'growth' | 'ratio'>('growth');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // 1. SIP CALCULATOR STATE
  const [sipMonthly, setSipMonthly] = useState<number>(10000);
  const [sipYears, setSipYears] = useState<number>(10);
  const [sipReturn, setSipReturn] = useState<number>(12);

  const sipData = useMemo(() => {
    const safeMonthly = Math.max(0, sipMonthly);
    const safeYears = Math.max(1, sipYears);
    const safeReturn = Math.max(0, sipReturn);
    const i = safeReturn / 12 / 100;
    const n = safeYears * 12;
    const totalInvested = safeMonthly * n;
    const futureValue = i > 0 
      ? Math.round(safeMonthly * (((Math.pow(1 + i, n) - 1) / i) * (1 + i)))
      : totalInvested;
    const totalReturns = Math.max(0, futureValue - totalInvested);

    const yearlyPoints: { year: number; invested: number; value: number }[] = [];
    yearlyPoints.push({ year: 0, invested: 0, value: 0 });
    for (let yr = 1; yr <= safeYears; yr++) {
      const m = yr * 12;
      const inv = safeMonthly * m;
      const val = i > 0 
        ? Math.round(safeMonthly * (((Math.pow(1 + i, m) - 1) / i) * (1 + i)))
        : inv;
      yearlyPoints.push({ year: yr, invested: inv, value: val });
    }

    return { totalInvested, totalReturns, futureValue, yearlyPoints };
  }, [sipMonthly, sipYears, sipReturn]);

  // INFLATION CALCULATOR STATE
  const [infAmount, setInfAmount] = useState<number>(100000);
  const [infRate, setInfRate] = useState<number>(6.0); // 6% is standard retail inflation benchmark
  const [infYears, setInfYears] = useState<number>(15);

  const infData = useMemo(() => {
    const safeAmount = Math.max(0, infAmount);
    const safeYears = Math.max(1, infYears);
    const safeRate = Math.max(0, infRate);
    const r = safeRate / 100;
    const futureCost = Math.round(safeAmount * Math.pow(1 + r, safeYears));
    const costIncrease = Math.max(0, futureCost - safeAmount);
    const purchasingPowerFactor = Math.pow(1 / (1 + r), safeYears);
    const purchasingPowerToday = Math.round(safeAmount * purchasingPowerFactor);
    const percentIncrease = safeAmount > 0 ? Math.round(((futureCost - safeAmount) / safeAmount) * 100) : 0;

    const yearlyPoints: { year: number; invested: number; value: number }[] = [];
    yearlyPoints.push({ year: 0, invested: safeAmount, value: safeAmount });
    for (let yr = 1; yr <= safeYears; yr++) {
      const cost = Math.round(safeAmount * Math.pow(1 + r, yr));
      yearlyPoints.push({
        year: yr,
        invested: safeAmount,
        value: cost,
      });
    }

    return {
      currentAmount: safeAmount,
      futureCost,
      costIncrease,
      purchasingPowerToday,
      percentIncrease,
      yearlyPoints,
    };
  }, [infAmount, infRate, infYears]);

  // 2. STEP-UP SIP CALCULATOR STATE
  const [stepUpMonthly, setStepUpMonthly] = useState<number>(10000);
  const [stepUpYears, setStepUpYears] = useState<number>(10);
  const [stepUpReturn, setStepUpReturn] = useState<number>(12);
  const [stepUpPct, setStepUpPct] = useState<number>(10);

  const stepUpData = useMemo(() => {
    const safeMonthly = Math.max(0, stepUpMonthly);
    const safeYears = Math.max(1, stepUpYears);
    const safeReturn = Math.max(0, stepUpReturn);
    const safePct = Math.max(0, stepUpPct);
    const monthlyRate = safeReturn / 12 / 100;
    let totalInvested = 0;
    let currentSip = safeMonthly;
    const yearlyPoints: { year: number; monthlySip: number; invested: number; value: number }[] = [];
    yearlyPoints.push({ year: 0, monthlySip: safeMonthly, invested: 0, value: 0 });

    let accumulatedValue = 0;
    for (let yr = 1; yr <= safeYears; yr++) {
      for (let m = 0; m < 12; m++) {
        totalInvested += currentSip;
        accumulatedValue = (accumulatedValue + currentSip) * (1 + monthlyRate);
      }
      yearlyPoints.push({
        year: yr,
        monthlySip: Math.round(currentSip),
        invested: Math.round(totalInvested),
        value: Math.round(accumulatedValue),
      });
      currentSip = currentSip * (1 + safePct / 100);
    }

    const futureValue = Math.round(accumulatedValue);
    const totalReturns = Math.max(0, futureValue - totalInvested);

    const regN = safeYears * 12;
    const regInvested = safeMonthly * regN;
    const regFV = monthlyRate > 0 
      ? Math.round(safeMonthly * (((Math.pow(1 + monthlyRate, regN) - 1) / monthlyRate) * (1 + monthlyRate)))
      : regInvested;

    return {
      totalInvested: Math.round(totalInvested),
      totalReturns,
      futureValue,
      yearlyPoints,
      regFV,
      gainOverRegular: Math.max(0, futureValue - regFV),
    };
  }, [stepUpMonthly, stepUpYears, stepUpReturn, stepUpPct]);

  // 3. LUMPSUM STATE
  const [lumpAmount, setLumpAmount] = useState<number>(100000);
  const [lumpYears, setLumpYears] = useState<number>(10);
  const [lumpReturn, setLumpReturn] = useState<number>(8);
  const [lumpFreq, setLumpFreq] = useState<number>(1);

  const lumpData = useMemo(() => {
    const safeAmount = Math.max(0, lumpAmount);
    const safeYears = Math.max(1, lumpYears);
    const safeReturn = Math.max(0, lumpReturn);
    const r = safeReturn / 100;
    const futureValue = Math.round(safeAmount * Math.pow(1 + r / lumpFreq, lumpFreq * safeYears));
    const profit = Math.max(0, futureValue - safeAmount);

    const yearlyPoints: { year: number; invested: number; value: number }[] = [];
    yearlyPoints.push({ year: 0, invested: safeAmount, value: safeAmount });
    for (let yr = 1; yr <= safeYears; yr++) {
      const val = Math.round(safeAmount * Math.pow(1 + r / lumpFreq, lumpFreq * yr));
      yearlyPoints.push({ year: yr, invested: safeAmount, value: val });
    }
    return { totalInvested: safeAmount, profit, futureValue, yearlyPoints };
  }, [lumpAmount, lumpYears, lumpReturn, lumpFreq]);

  // 4. XIRR STATE (DYNAMIC ADD CASH IN & OUT)
  const [xirrTransactions, setXirrTransactions] = useState<XirrTransaction[]>(DEFAULT_XIRR_TRANSACTIONS);
  const [xirrPresetAmount, setXirrPresetAmount] = useState<number>(10000);
  const [xirrIntervalMonths, setXirrIntervalMonths] = useState<number>(1);
  const [xirrRepeatCount, setXirrRepeatCount] = useState<number>(2);

  const handleAddScheduledXirr = (type: 'invest' | 'withdraw') => {
    // Check if current list only has the 0-amount reset placeholders
    const hasOnlyZeroResetEntries = xirrTransactions.length === 2 && xirrTransactions.every(t => t.amount === 0);

    let baseDate = new Date();
    if (!hasOnlyZeroResetEntries && xirrTransactions.length > 0) {
      const lastTx = xirrTransactions[xirrTransactions.length - 1];
      if (lastTx && lastTx.dateStr) {
        baseDate = new Date(lastTx.dateStr);
      }
    }

    const interval = Math.max(0.5, xirrIntervalMonths || 1);
    const count = Math.max(1, xirrRepeatCount || 1);
    const newTxs: XirrTransaction[] = [];

    for (let i = 1; i <= count; i++) {
      const txDate = new Date(baseDate);
      if (interval === 0.5) {
        // Half month (~15 days)
        txDate.setDate(txDate.getDate() + (15 * i));
      } else {
        const wholeMonths = Math.floor(interval * i);
        const rem = (interval * i) - wholeMonths;
        txDate.setMonth(txDate.getMonth() + wholeMonths);
        if (rem > 0) {
          txDate.setDate(txDate.getDate() + Math.round(rem * 30));
        }
      }

      newTxs.push({
        id: String(Date.now() + Math.random() + i),
        amount: xirrPresetAmount > 0 ? xirrPresetAmount : (type === 'invest' ? 10000 : 25000),
        dateStr: txDate.toISOString().slice(0, 10),
        type,
      });
    }

    if (hasOnlyZeroResetEntries) {
      if (type === 'invest') {
        const lastDate = new Date(newTxs[newTxs.length - 1].dateStr);
        lastDate.setMonth(lastDate.getMonth() + Math.max(1, Math.round(interval)));
        setXirrTransactions([
          ...newTxs,
          { id: 'reset-inflow-auto', amount: 0, dateStr: lastDate.toISOString().slice(0, 10), type: 'withdraw' }
        ]);
      } else {
        setXirrTransactions([
          { id: 'reset-outflow-auto', amount: 0, dateStr: baseDate.toISOString().slice(0, 10), type: 'invest' },
          ...newTxs
        ]);
      }
    } else {
      setXirrTransactions(prev => [...prev, ...newTxs]);
    }
  };

  const handleAddXirrTransaction = (type: 'invest' | 'withdraw') => {
    const lastTx = xirrTransactions[xirrTransactions.length - 1];
    let nextDateStr = new Date().toISOString().slice(0, 10);
    if (lastTx && lastTx.dateStr) {
      const d = new Date(lastTx.dateStr);
      d.setMonth(d.getMonth() + 6);
      nextDateStr = d.toISOString().slice(0, 10);
    }
    const newTx: XirrTransaction = {
      id: String(Date.now() + Math.random()),
      amount: xirrPresetAmount > 0 ? xirrPresetAmount : (type === 'invest' ? 10000 : 25000),
      dateStr: nextDateStr,
      type,
    };
    setXirrTransactions(prev => [...prev, newTx]);
  };

  const handleUpdateXirrTx = (id: string, field: keyof XirrTransaction, value: any) => {
    setXirrTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, [field]: value } : tx));
  };

  const handleDeleteXirrTx = (id: string) => {
    if (xirrTransactions.length <= 2) {
      alert('XIRR requires at least 2 entries (one cash outflow and one cash inflow).');
      return;
    }
    setXirrTransactions(prev => prev.filter(tx => tx.id !== id));
  };

  // Reset to clear older data: only 1 cash out and 1 cash in with an amount of 0
  const handleResetXirr = () => {
    const today = new Date().toISOString().slice(0, 10);
    const nextDate = new Date();
    nextDate.setFullYear(nextDate.getFullYear() + 1);
    const nextYearStr = nextDate.toISOString().slice(0, 10);

    setXirrTransactions([
      { id: 'reset-out-1', amount: 0, dateStr: today, type: 'invest' },
      { id: 'reset-in-2', amount: 0, dateStr: nextYearStr, type: 'withdraw' }
    ]);
  };

  const xirrData = useMemo(() => {
    const validFlows = xirrTransactions.filter(t => t.amount > 0);
    const cashFlows = validFlows.map(t => ({
      amount: t.type === 'invest' ? -Math.abs(t.amount) : Math.abs(t.amount),
      date: new Date(t.dateStr),
    }));

    const totalInvested = xirrTransactions
      .filter(t => t.type === 'invest')
      .reduce((acc, t) => acc + t.amount, 0);

    const finalVal = xirrTransactions
      .filter(t => t.type === 'withdraw')
      .reduce((acc, t) => acc + t.amount, 0);

    const netProfit = finalVal - totalInvested;
    const xirrRate = totalInvested > 0 && finalVal > 0 && cashFlows.length >= 2
      ? calculateXIRR(cashFlows, 0.12)
      : 0;

    return { totalInvested, finalVal, netProfit, xirrRate };
  }, [xirrTransactions]);

  // 5. CAGR STATE
  const [cagrInitial, setCagrInitial] = useState<number>(100000);
  const [cagrFinal, setCagrFinal] = useState<number>(200000);
  const [cagrYears, setCagrYears] = useState<number>(5);

  const cagrData = useMemo(() => {
    if (cagrInitial <= 0 || cagrYears <= 0 || cagrFinal <= 0) {
      return { cagr: 0, profit: 0, totalPct: 0, yearlyPoints: [] };
    }
    const rate = Math.pow(cagrFinal / cagrInitial, 1 / cagrYears) - 1;
    const cagr = Math.round(rate * 10000) / 100;
    const profit = cagrFinal - cagrInitial;
    const totalPct = Math.round(((cagrFinal - cagrInitial) / cagrInitial) * 100);

    const yearlyPoints: { year: number; invested: number; value: number }[] = [];
    for (let yr = 0; yr <= cagrYears; yr++) {
      const val = Math.round(cagrInitial * Math.pow(1 + rate, yr));
      yearlyPoints.push({ year: yr, invested: cagrInitial, value: val });
    }

    return { cagr, profit, totalPct, yearlyPoints };
  }, [cagrInitial, cagrFinal, cagrYears]);

  // 6. COMPOUND INTEREST STATE
  const [ciPrincipal, setCiPrincipal] = useState<number>(50000);
  const [ciRate, setCiRate] = useState<number>(8);
  const [ciYears, setCiYears] = useState<number>(10);
  const [ciFreq, setCiFreq] = useState<number>(1);

  const ciData = useMemo(() => {
    const safePrincipal = Math.max(0, ciPrincipal);
    const safeYears = Math.max(1, ciYears);
    const safeRate = Math.max(0, ciRate);
    const r = safeRate / 100;
    const n = Math.max(1, ciFreq);
    const finalBalance = Math.round(safePrincipal * Math.pow(1 + r / n, n * safeYears));
    const interestEarned = Math.max(0, finalBalance - safePrincipal);
    const simpleInterest = Math.round(safePrincipal * r * safeYears);
    const compoundingGain = Math.max(0, interestEarned - simpleInterest);

    const yearlyPoints: { year: number; invested: number; value: number; simple: number }[] = [];
    yearlyPoints.push({ year: 0, invested: safePrincipal, value: safePrincipal, simple: safePrincipal });
    for (let yr = 1; yr <= safeYears; yr++) {
      const compVal = Math.round(safePrincipal * Math.pow(1 + r / n, n * yr));
      const simpVal = Math.round(safePrincipal + safePrincipal * r * yr);
      yearlyPoints.push({ year: yr, invested: safePrincipal, value: compVal, simple: simpVal });
    }

    return { finalBalance, interestEarned, simpleInterest, compoundingGain, yearlyPoints };
  }, [ciPrincipal, ciRate, ciYears, ciFreq]);

  // 7. EMI CALCULATOR STATE
  const [emiPrincipal, setEmiPrincipal] = useState<number>(1000000);
  const [emiRate, setEmiRate] = useState<number>(9);
  const [emiTenureYears, setEmiTenureYears] = useState<number>(5);

  const emiData = useMemo(() => {
    const safePrincipal = Math.max(0, emiPrincipal);
    const safeYears = Math.max(1, emiTenureYears);
    const safeRate = Math.max(0, emiRate);
    const i = safeRate / 12 / 100;
    const m = safeYears * 12;
    if (i === 0) {
      const emiVal = Math.round(safePrincipal / m);
      return { emi: emiVal, totalPayment: safePrincipal, totalInterest: 0, yearlySchedule: [] };
    }
    const emiVal = Math.round((safePrincipal * i * Math.pow(1 + i, m)) / (Math.pow(1 + i, m) - 1));
    const totalPayment = emiVal * m;
    const totalInterest = Math.max(0, totalPayment - safePrincipal);

    let remainingPrincipal = safePrincipal;
    const yearlySchedule: { year: number; principalPaid: number; interestPaid: number; balance: number }[] = [];
    yearlySchedule.push({ year: 0, principalPaid: 0, interestPaid: 0, balance: safePrincipal });

    for (let yr = 1; yr <= safeYears; yr++) {
      let yrPrincipal = 0;
      let yrInterest = 0;
      for (let month = 0; month < 12; month++) {
        const interest = remainingPrincipal * i;
        const principal = emiVal - interest;
        yrInterest += interest;
        yrPrincipal += principal;
        remainingPrincipal = Math.max(0, remainingPrincipal - principal);
      }
      yearlySchedule.push({
        year: yr,
        principalPaid: Math.round(yrPrincipal),
        interestPaid: Math.round(yrInterest),
        balance: Math.round(remainingPrincipal),
      });
    }

    return { emi: emiVal, totalPayment, totalInterest, yearlySchedule };
  }, [emiPrincipal, emiRate, emiTenureYears]);

  // 8. SWP CALCULATOR STATE
  const [swpCorpus, setSwpCorpus] = useState<number>(2000000);
  const [swpMonthly, setSwpMonthly] = useState<number>(10000);
  const [swpReturn, setSwpReturn] = useState<number>(8);
  const [swpYears, setSwpYears] = useState<number>(15);

  const swpData = useMemo(() => {
    const safeCorpus = Math.max(0, swpCorpus);
    const safeMonthly = Math.max(0, swpMonthly);
    const safeYears = Math.max(1, swpYears);
    const safeReturn = Math.max(0, swpReturn);
    const r = safeReturn / 12 / 100;
    const totalMonths = safeYears * 12;
    let balance = safeCorpus;
    let totalWithdrawn = 0;
    let isExhausted = false;
    let exhaustionMonth = 0;
    const yearlyPoints: { year: number; balance: number; withdrawn: number }[] = [];
    yearlyPoints.push({ year: 0, balance: safeCorpus, withdrawn: 0 });

    for (let m = 1; m <= totalMonths; m++) {
      balance = balance * (1 + r);
      if (balance >= safeMonthly) {
        balance -= safeMonthly;
        totalWithdrawn += safeMonthly;
      } else {
        totalWithdrawn += balance;
        balance = 0;
        if (!isExhausted) {
          isExhausted = true;
          exhaustionMonth = m;
        }
      }
      if (m % 12 === 0) {
        yearlyPoints.push({
          year: m / 12,
          balance: Math.round(balance),
          withdrawn: Math.round(totalWithdrawn),
        });
      }
    }

    return {
      totalWithdrawn: Math.round(totalWithdrawn),
      remainingBalance: Math.round(balance),
      isExhausted,
      exhaustionYears: Math.round((exhaustionMonth / 12) * 10) / 10,
      yearlyPoints,
    };
  }, [swpCorpus, swpMonthly, swpReturn, swpYears]);

  // 9. NPS CALCULATOR STATE
  const [npsAge, setNpsAge] = useState<number>(30);
  const [npsRetireAge, setNpsRetireAge] = useState<number>(60);
  const [npsMonthly, setNpsMonthly] = useState<number>(5000);
  const [npsReturn, setNpsReturn] = useState<number>(10);
  const [npsAnnuityPct, setNpsAnnuityPct] = useState<number>(40);
  const [npsAnnuityRate, setNpsAnnuityRate] = useState<number>(6);

  const npsData = useMemo(() => {
    const totalYears = Math.max(1, npsRetireAge - npsAge);
    const safeMonthly = Math.max(0, npsMonthly);
    const safeReturn = Math.max(0, npsReturn);
    const m = totalYears * 12;
    const i = safeReturn / 12 / 100;
    const totalContributions = safeMonthly * m;
    const corpus = Math.round(safeMonthly * (((Math.pow(1 + i, m) - 1) / i) * (1 + i)));
    const annuityAmount = Math.round((corpus * npsAnnuityPct) / 100);
    const lumpSumAmount = Math.max(0, corpus - annuityAmount);
    const monthlyPension = Math.round((annuityAmount * (npsAnnuityRate / 100)) / 12);

    const yearlyPoints: { year: number; invested: number; value: number }[] = [];
    yearlyPoints.push({ year: npsAge, invested: 0, value: 0 });
    for (let yr = 1; yr <= totalYears; yr++) {
      const months = yr * 12;
      const inv = safeMonthly * months;
      const val = Math.round(safeMonthly * (((Math.pow(1 + i, months) - 1) / i) * (1 + i)));
      yearlyPoints.push({ year: npsAge + yr, invested: inv, value: val });
    }

    return { totalContributions, corpus, annuityAmount, lumpSumAmount, monthlyPension, yearlyPoints, totalYears };
  }, [npsAge, npsRetireAge, npsMonthly, npsReturn, npsAnnuityPct, npsAnnuityRate]);

  // 10. POST OFFICE MIS STATE
  const [misDeposit, setMisDeposit] = useState<number>(100000);
  const [misRate, setMisRate] = useState<number>(7.4);

  const misData = useMemo(() => {
    const safeDeposit = Math.max(0, misDeposit);
    const monthlyIncome = Math.round((safeDeposit * (misRate / 100)) / 12);
    const totalInterest5Yrs = monthlyIncome * 60;
    const totalAtMaturity = safeDeposit + totalInterest5Yrs;
    return { monthlyIncome, totalInterest5Yrs, totalAtMaturity };
  }, [misDeposit, misRate]);

  // Tab Definitions matching user screenshot style
  const calculatorTabs: { id: CalculatorId; label: string; badge?: string; icon: React.ReactNode }[] = [
    { id: 'normal', label: 'Normal Calculator', badge: 'Standard', icon: <Calculator className="w-4 h-4 text-emerald-700" /> },
    { id: 'fire', label: 'FIRE Calculator', badge: '🔥 Retire Early', icon: <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> },
    { id: 'sip', label: 'SIP Calculator', icon: <TrendingUp className="w-4 h-4 text-emerald-600" /> },
    { id: 'inflation', label: 'Inflation', badge: '🔥 Cost of Living', icon: <Flame className="w-4 h-4 text-rose-600" /> },
    { id: 'stepup', label: 'Step-Up SIP', badge: '📈 2x', icon: <ArrowUpRight className="w-4 h-4 text-teal-600" /> },
    { id: 'lumpsum', label: 'Lumpsum', icon: <Coins className="w-4 h-4 text-blue-600" /> },
    { id: 'xirr', label: 'XIRR', badge: '⚡', icon: <Percent className="w-4 h-4 text-indigo-600" /> },
    { id: 'cagr', label: 'CAGR', icon: <BarChart3 className="w-4 h-4 text-purple-600" /> },
    { id: 'compound', label: 'Compound Interest', icon: <Sparkles className="w-4 h-4 text-amber-600" /> },
    { id: 'emi', label: 'EMI Calculator', icon: <CreditCard className="w-4 h-4 text-rose-600" /> },
    { id: 'swp', label: 'SWP (Withdrawal)', icon: <Repeat className="w-4 h-4 text-sky-600" /> },
    { id: 'nps', label: 'NPS (Pension)', icon: <Landmark className="w-4 h-4 text-orange-600" /> },
    { id: 'mis', label: 'Post Office MIS', icon: <ShieldCheck className="w-4 h-4 text-emerald-700" /> },
  ];

  // Dynamic Unified Chart Data (for X Axis Years and Y Axis Right Amounts)
  const chartData = useMemo(() => {
    let points: { label: string; yearNum: number; invested: number; value: number }[] = [];

    if (activeTab === 'sip') {
      points = sipData.yearlyPoints.map(p => ({ label: `Yr ${p.year}`, yearNum: p.year, invested: p.invested, value: p.value }));
    } else if (activeTab === 'inflation') {
      points = infData.yearlyPoints.map(p => ({ label: `Yr ${p.year}`, yearNum: p.year, invested: p.invested, value: p.value }));
    } else if (activeTab === 'stepup') {
      points = stepUpData.yearlyPoints.map(p => ({ label: `Yr ${p.year}`, yearNum: p.year, invested: p.invested, value: p.value }));
    } else if (activeTab === 'lumpsum') {
      points = lumpData.yearlyPoints.map(p => ({ label: `Yr ${p.year}`, yearNum: p.year, invested: p.invested, value: p.value }));
    } else if (activeTab === 'cagr') {
      points = cagrData.yearlyPoints.map(p => ({ label: `Yr ${p.year}`, yearNum: p.year, invested: p.invested, value: p.value }));
    } else if (activeTab === 'compound') {
      points = ciData.yearlyPoints.map(p => ({ label: `Yr ${p.year}`, yearNum: p.year, invested: p.invested, value: p.value }));
    } else if (activeTab === 'emi') {
      points = emiData.yearlySchedule.map(s => ({ label: `Yr ${s.year}`, yearNum: s.year, invested: emiPrincipal - s.balance, value: s.balance }));
    } else if (activeTab === 'swp') {
      points = swpData.yearlyPoints.map(p => ({ label: `Yr ${p.year}`, yearNum: p.year, invested: p.withdrawn, value: p.balance }));
    } else if (activeTab === 'nps') {
      points = npsData.yearlyPoints.map(p => ({ label: `Age ${p.year}`, yearNum: p.year, invested: p.invested, value: p.value }));
    } else if (activeTab === 'mis') {
      points = [0, 1, 2, 3, 4, 5].map(yr => ({
        label: yr === 0 ? 'Start' : `Yr ${yr}`,
        yearNum: yr,
        invested: misDeposit,
        value: misDeposit + misData.monthlyIncome * 12 * yr,
      }));
    } else if (activeTab === 'xirr') {
      let cumInvested = 0;
      points = xirrTransactions.map((tx, idx) => {
        if (tx.type === 'invest') cumInvested += tx.amount;
        return {
          label: tx.dateStr.slice(2, 7),
          yearNum: idx + 1,
          invested: cumInvested,
          value: tx.type === 'withdraw' ? tx.amount : cumInvested,
        };
      });
    }

    if (points.length === 0) {
      points = [
        { label: 'Yr 0', yearNum: 0, invested: 10000, value: 10000 },
        { label: 'Yr 1', yearNum: 1, invested: 10000, value: 12000 }
      ];
    }

    const maxVal = Math.max(1, ...points.map(p => Math.max(p.value || 0, p.invested || 0)));
    return { points, maxVal };
  }, [
    activeTab, 
    sipData, 
    infData, 
    stepUpData, 
    lumpData, 
    cagrData, 
    ciData, 
    emiData, 
    swpData, 
    npsData, 
    misData, 
    xirrTransactions, 
    misDeposit, 
    emiPrincipal
  ]);

  // Coordinate mapping for SVG (Width: 540, Height: 220)
  // X: 24 -> 445 (width 421), Y: 22 -> 176 (height 154)
  // Right Y-axis text at x=452..535
  // Bottom X-axis text at y=198..212
  const svgMetrics = useMemo(() => {
    const { points, maxVal } = chartData;
    const xStart = 24;
    const xEnd = 445;
    const yTop = 22;
    const yBottom = 176;
    const chartW = xEnd - xStart;
    const chartH = yBottom - yTop;

    const mapped = points.map((p, idx) => {
      const denom = Math.max(1, points.length - 1);
      const x = xStart + (idx / denom) * chartW;
      const safeMax = Math.max(1, maxVal);
      const safeVal = Math.max(0, p.value || 0);
      const safeInv = Math.max(0, p.invested || 0);
      const yVal = yBottom - (Math.min(safeVal, safeMax) / safeMax) * chartH;
      const yInv = yBottom - (Math.min(safeInv, safeMax) / safeMax) * chartH;
      return { ...p, x, yVal, yInv };
    });

    // Build SVG path strings
    const valPath = mapped.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.yVal.toFixed(1)}`, '');
    const valArea = mapped.length > 0 ? `${valPath} L ${xEnd} ${yBottom} L ${xStart} ${yBottom} Z` : '';

    const invPath = mapped.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.yInv.toFixed(1)}`, '');
    const invArea = mapped.length > 0 ? `${invPath} L ${xEnd} ${yBottom} L ${xStart} ${yBottom} Z` : '';

    // Dynamic X-axis ticks: cleanly spaced including Year 0 and exact final year N
    const totalPoints = mapped.length;
    let tickIndices: number[] = [];
    if (totalPoints <= 6) {
      tickIndices = mapped.map((_, i) => i);
    } else {
      const step = (totalPoints - 1) / 4;
      const set = new Set<number>();
      set.add(0);
      set.add(Math.round(step * 1));
      set.add(Math.round(step * 2));
      set.add(Math.round(step * 3));
      set.add(totalPoints - 1);
      tickIndices = Array.from(set).sort((a, b) => a - b);
    }

    const xTicks = tickIndices.map(idx => mapped[idx]);

    // 5 Horizontal Y Levels (100%, 75%, 50%, 25%, 0%)
    const yLevels = [
      { y: yTop, val: maxVal, color: '#047857', bold: true },
      { y: yTop + chartH * 0.25, val: maxVal * 0.75, color: '#64748b', bold: false },
      { y: yTop + chartH * 0.50, val: maxVal * 0.50, color: '#64748b', bold: false },
      { y: yTop + chartH * 0.75, val: maxVal * 0.25, color: '#64748b', bold: false },
      { y: yBottom, val: 0, color: '#94a3b8', bold: false },
    ];

    return {
      xStart,
      xEnd,
      yTop,
      yBottom,
      maxVal,
      mapped,
      valPath,
      valArea,
      invPath,
      invArea,
      xTicks,
      yLevels,
    };
  }, [chartData]);

  // Live Summary Pills for the graph header reflecting exact calculation numbers and tenure
  const chartSummary = useMemo(() => {
    if (activeTab === 'sip') {
      return {
        horizon: `${sipYears} Years`,
        invested: sipData.totalInvested,
        value: sipData.futureValue,
        growth: sipData.totalInvested > 0 ? `${(sipData.futureValue / sipData.totalInvested).toFixed(1)}x Wealth` : '1.0x',
      };
    }
    if (activeTab === 'inflation') {
      return {
        horizon: `${infYears} Years`,
        invested: infAmount,
        value: infData.futureCost,
        growth: `+${infData.percentIncrease}% Inflation`,
      };
    }
    if (activeTab === 'stepup') {
      return {
        horizon: `${stepUpYears} Years`,
        invested: stepUpData.totalInvested,
        value: stepUpData.futureValue,
        growth: stepUpData.totalInvested > 0 ? `${(stepUpData.futureValue / stepUpData.totalInvested).toFixed(1)}x Wealth` : '1.0x',
      };
    }
    if (activeTab === 'lumpsum') {
      return {
        horizon: `${lumpYears} Years`,
        invested: lumpData.totalInvested,
        value: lumpData.futureValue,
        growth: lumpData.totalInvested > 0 ? `${(lumpData.futureValue / lumpData.totalInvested).toFixed(1)}x Wealth` : '1.0x',
      };
    }
    if (activeTab === 'cagr') {
      return {
        horizon: `${cagrYears} Years`,
        invested: cagrInitial,
        value: cagrFinal,
        growth: `${cagrData.cagr}% p.a.`,
      };
    }
    if (activeTab === 'compound') {
      return {
        horizon: `${ciYears} Years`,
        invested: ciPrincipal,
        value: ciData.finalBalance,
        growth: ciPrincipal > 0 ? `${(ciData.finalBalance / ciPrincipal).toFixed(1)}x Wealth` : '1.0x',
      };
    }
    if (activeTab === 'emi') {
      return {
        horizon: `${emiTenureYears} Years`,
        invested: emiPrincipal,
        value: emiData.totalPayment,
        growth: `EMI: ${formatCurrency(emiData.emi)}/mo`,
      };
    }
    if (activeTab === 'swp') {
      return {
        horizon: `${swpYears} Years`,
        invested: swpCorpus,
        value: swpData.remainingBalance,
        growth: `Withdrawn: ${formatIndianUnits(swpData.totalWithdrawn)}`,
      };
    }
    if (activeTab === 'nps') {
      return {
        horizon: `${npsRetireAge - npsAge} Yrs (Age ${npsAge}→${npsRetireAge})`,
        invested: npsData.totalContributions,
        value: npsData.corpus,
        growth: `Pension: ${formatCurrency(npsData.monthlyPension)}/mo`,
      };
    }
    if (activeTab === 'mis') {
      return {
        horizon: '5 Years',
        invested: misDeposit,
        value: misData.totalAtMaturity,
        growth: `Income: ${formatCurrency(misData.monthlyIncome)}/mo`,
      };
    }
    return {
      horizon: `${xirrTransactions.length} Transactions`,
      invested: xirrData.totalInvested,
      value: xirrData.finalVal,
      growth: `${xirrData.xirrRate}% p.a.`,
    };
  }, [
    activeTab, sipYears, sipData, infYears, infAmount, infData,
    stepUpYears, stepUpData, lumpYears, lumpData, cagrYears, cagrInitial, cagrFinal, cagrData,
    ciYears, ciPrincipal, ciData, emiTenureYears, emiPrincipal, emiData,
    swpYears, swpCorpus, swpData, npsAge, npsRetireAge, npsData,
    misDeposit, misData, xirrTransactions, xirrData
  ]);

  return (
    <div className="w-full space-y-6 pb-16 animate-in fade-in duration-300">
      {/* TOP NAVIGATION & CONTROLS */}
      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <button
          type="button"
          onClick={onBackToHome}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-zinc-700 hover:text-black bg-white hover:bg-zinc-50 border border-zinc-200 shadow-2xs transition-all cursor-pointer w-fit z-10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to FinScore Home</span>
        </button>

        {/* Center: Fixed Logo */}
        <div
          onClick={onBackToHome}
          className="sm:absolute sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 flex items-center justify-center cursor-pointer select-none py-1"
          title="FinScore — Fix your finances with me!"
        >
          <img
            src="/logo.png"
            alt="FinScore — Fix Your Finance With Me!"
            className="h-10 sm:h-12 md:h-13 w-auto object-contain hover:opacity-90 transition-opacity drop-shadow-xs"
          />
        </div>

        <div className="flex items-center gap-3 z-10">
          <span className="text-xs text-zinc-500 hidden lg:inline">
            Official Indian standard compounding rules (₹ INR)
          </span>
          <button
            type="button"
            onClick={onStartAssessment}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-black bg-[#1b4d3e] hover:bg-[#143d31] text-white shadow-sm transition-all cursor-pointer"
          >
            <span>Start Full Assessment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* TOP PILL TAB BAR (EXACT MATCH WITH USER SCREENSHOT) */}
      <div className="w-full overflow-x-auto pb-2 scrollbar-none">
        <div className="flex items-center gap-2 min-w-max p-1 bg-zinc-100/90 rounded-2xl border border-zinc-200/80 shadow-inner">
          <span className="px-3 py-1 text-xs font-black text-amber-900 bg-amber-100 rounded-xl flex items-center gap-1 select-none">
            ✨ Studio
          </span>
          
          {calculatorTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer select-none ${
                  isActive
                    ? 'bg-white text-zinc-950 shadow-md border border-zinc-200/80 scale-[1.02]'
                    : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/50'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isActive ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-zinc-200/80 text-zinc-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN WORKSPACE: NORMAL CALCULATOR, FIRE CALCULATOR OR 2-COLUMN FINANCIAL CALCULATOR */}
      {activeTab === 'normal' ? (
        <StandardCalculator />
      ) : activeTab === 'fire' ? (
        <FireCalculator />
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================
            LEFT COLUMN: PARAMETERS + YEAR-BY-YEAR SCHEDULE (COL 6)
           ======================================================== */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* CARD 1: PARAMETERS & INPUTS */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-700">
                  {activeTab === 'sip' && '↗ SIP PARAMETERS'}
                  {activeTab === 'inflation' && '🔥 INFLATION PARAMETERS'}
                  {activeTab === 'stepup' && '↗ STEP-UP SIP PARAMETERS'}
                  {activeTab === 'lumpsum' && '🔗 LUMPSUM PARAMETERS'}
                  {activeTab === 'xirr' && '⚡ XIRR CASH IN & OUT MANAGER'}
                  {activeTab === 'cagr' && '📈 CAGR PARAMETERS'}
                  {activeTab === 'compound' && '✨ COMPOUNDING PARAMETERS'}
                  {activeTab === 'emi' && '🏛 LOAN EMI PARAMETERS'}
                  {activeTab === 'swp' && '↘ SWP RETIREMENT PARAMETERS'}
                  {activeTab === 'nps' && '🏛 NPS PENSION PARAMETERS'}
                  {activeTab === 'mis' && '📮 POST OFFICE MIS PARAMETERS'}
                </h3>
              </div>
              <span className="text-[11px] font-bold text-zinc-400">
                {activeTab === 'sip' && 'Monthly SIP'}
                {activeTab === 'inflation' && 'Cost of Living & Purchasing Power'}
                {activeTab === 'stepup' && 'Annual Step-Up'}
                {activeTab === 'lumpsum' && 'One-Time Deposit'}
                {activeTab === 'xirr' && 'Dynamic Flows'}
                {activeTab === 'cagr' && 'Point-to-Point'}
                {activeTab === 'compound' && 'Exponential'}
                {activeTab === 'emi' && 'Monthly EMI'}
                {activeTab === 'swp' && 'Monthly Drawdown'}
                {activeTab === 'nps' && 'National Pension'}
                {activeTab === 'mis' && 'Govt 5-Yr MIS'}
              </span>
            </div>

            {/* 1. SIP INPUTS */}
            {activeTab === 'sip' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                    Monthly Investment (₹)
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="500"
                    max="500000"
                    value={sipMonthly === 0 ? '' : sipMonthly}
                    onChange={(e) => setSipMonthly(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                    className="w-full text-xl sm:text-2xl font-black text-zinc-900 px-4 py-3 rounded-2xl border border-zinc-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                  <div className="flex items-center justify-between mt-1 text-xs text-zinc-500">
                    <span className="font-bold text-emerald-700">{formatCurrency(sipMonthly)}</span>
                    <span>{formatIndianUnits(sipMonthly)}</span>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {[2500, 5000, 10000, 25000, 50000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setSipMonthly(amt)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          sipMonthly === amt ? 'bg-emerald-600 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        {formatIndianUnits(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-zinc-800 mb-1.5">
                    <span>Investment Period (Years)</span>
                    <span className="text-blue-600 font-extrabold">{sipYears} Years ({sipYears * 12} Months)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="35"
                    value={sipYears}
                    onChange={(e) => setSipYears(Number(e.target.value))}
                    className="w-full accent-blue-600 h-2 bg-zinc-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-zinc-800 mb-1.5">
                    <span>Expected Annual Return (p.a.)</span>
                    <span className="text-emerald-600 font-extrabold">{sipReturn}%</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="25"
                    step="0.5"
                    value={sipReturn}
                    onChange={(e) => setSipReturn(Number(e.target.value))}
                    className="w-full accent-emerald-600 h-2 bg-zinc-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* INFLATION INPUTS */}
            {activeTab === 'inflation' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                    Current Amount / Expense Cost (₹)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="1000"
                    value={infAmount === 0 ? '' : infAmount}
                    onChange={(e) => setInfAmount(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                    className="w-full text-xl sm:text-2xl font-black text-zinc-900 px-4 py-3 rounded-2xl border border-zinc-200 focus:border-rose-600 outline-none"
                  />
                  <div className="flex items-center justify-between mt-1 text-xs text-zinc-500">
                    <span className="font-bold text-rose-700">{formatCurrency(infAmount)}</span>
                    <span>{formatIndianUnits(infAmount)} today</span>
                  </div>
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {[25000, 50000, 100000, 500000, 1000000].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setInfAmount(amt)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          infAmount === amt ? 'bg-rose-600 text-white' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        {formatIndianUnits(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-zinc-800 mb-1.5">
                    <span>Expected Inflation Rate (p.a.)</span>
                    <span className="text-rose-600 font-extrabold">{infRate}%</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="15"
                    step="0.5"
                    value={infRate}
                    onChange={(e) => setInfRate(Number(e.target.value))}
                    className="w-full accent-rose-600 h-2 bg-zinc-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                    <span>Moderate (4%–5%)</span>
                    <span>India Avg (6%–7%)</span>
                    <span>High (8%+)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-zinc-800 mb-1.5">
                    <span>Time Horizon</span>
                    <span className="text-zinc-900 font-extrabold">{infYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="35"
                    value={infYears}
                    onChange={(e) => setInfYears(Number(e.target.value))}
                    className="w-full accent-rose-600 h-2 bg-zinc-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-600" />
                    <span>Purchasing Power Erosion:</span>
                  </p>
                  <p className="text-[11px] text-rose-800 leading-normal">
                    At {infRate}% annual inflation, today’s <strong>{formatCurrency(infAmount)}</strong> will buy what only <strong>{formatCurrency(infData.purchasingPowerToday)}</strong> buys today — you will need <strong>{formatCurrency(infData.futureCost)}</strong> in {infYears} years to match the same standard of living.
                  </p>
                </div>
              </div>
            )}

            {/* 2. STEP-UP SIP INPUTS */}
            {activeTab === 'stepup' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                    Initial Monthly Investment (₹)
                  </label>
                  <input
                    type="number"
                    step="500"
                    min="500"
                    value={stepUpMonthly === 0 ? '' : stepUpMonthly}
                    onChange={(e) => setStepUpMonthly(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                    className="w-full text-xl sm:text-2xl font-black text-zinc-900 px-4 py-3 rounded-2xl border border-zinc-200 focus:border-teal-600 outline-none"
                  />
                  <div className="flex items-center justify-between mt-1 text-xs text-zinc-500">
                    <span className="font-bold text-teal-700">{formatCurrency(stepUpMonthly)}</span>
                    <span>{formatIndianUnits(stepUpMonthly)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1">
                      Annual Step-up Increment
                    </label>
                    <select
                      value={stepUpPct}
                      onChange={(e) => setStepUpPct(Number(e.target.value))}
                      className="w-full text-sm font-bold p-2.5 rounded-xl border border-zinc-200 bg-white"
                    >
                      <option value={5}>+5% each year</option>
                      <option value={10}>+10% each year (Standard)</option>
                      <option value={15}>+15% each year</option>
                      <option value={20}>+20% each year (Aggressive)</option>
                    </select>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-800 mb-1">
                      <span>Tenure</span>
                      <span className="text-teal-700">{stepUpYears} Yrs</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="30"
                      value={stepUpYears}
                      onChange={(e) => setStepUpYears(Number(e.target.value))}
                      className="w-full accent-teal-600 h-2 bg-zinc-200 rounded-lg cursor-pointer mt-2"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-zinc-800 mb-1.5">
                    <span>Expected Return (p.a.)</span>
                    <span className="text-teal-700 font-extrabold">{stepUpReturn}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="22"
                    step="0.5"
                    value={stepUpReturn}
                    onChange={(e) => setStepUpReturn(Number(e.target.value))}
                    className="w-full accent-teal-600 h-2 bg-zinc-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 3. LUMPSUM INPUTS */}
            {activeTab === 'lumpsum' && (
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1.5">
                    One-Time Deposit Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="10000"
                    min="5000"
                    value={lumpAmount === 0 ? '' : lumpAmount}
                    onChange={(e) => setLumpAmount(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                    className="w-full text-xl sm:text-2xl font-black text-zinc-900 px-4 py-3 rounded-2xl border border-zinc-200 focus:border-blue-600 outline-none"
                  />
                  <div className="flex items-center justify-between mt-1 text-xs text-zinc-500">
                    <span className="font-bold text-blue-700">{formatCurrency(lumpAmount)}</span>
                    <span>{formatIndianUnits(lumpAmount)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-800 mb-1">
                      <span>Period</span>
                      <span className="text-blue-700">{lumpYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={lumpYears}
                      onChange={(e) => setLumpYears(Number(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-zinc-200 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-800 mb-1">
                      <span>Return (p.a.)</span>
                      <span className="text-blue-700">{lumpReturn}%</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="22"
                      step="0.5"
                      value={lumpReturn}
                      onChange={(e) => setLumpReturn(Number(e.target.value))}
                      className="w-full accent-blue-600 h-2 bg-zinc-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 4. XIRR INPUTS (DYNAMIC ADD CASH IN AND CASH OUT) */}
            {activeTab === 'xirr' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black text-zinc-900 block">
                      Manage Cash In & Cash Out Flows
                    </label>
                    <p className="text-[11px] text-zinc-500">Add regular investments (outflow) & maturity redemptions (inflow)</p>
                  </div>
                  {/* Reset Button: Clears all older data and sets only 1 cash out and 1 cash in with amount 0 */}
                  <button
                    type="button"
                    onClick={handleResetXirr}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-rose-50 text-zinc-700 hover:text-rose-700 border border-zinc-200 hover:border-rose-200 flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs"
                    title="Clear older data and start with 1 cash out and 1 cash in with amount 0"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset (Clear to 0)</span>
                  </button>
                </div>

                {/* RECURRING CASH FLOW PRESETS PANEL */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200/90 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200/70">
                    <div>
                      <h4 className="text-xs font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>RECURRING CASH FLOW PRESETS</span>
                      </h4>
                      <p className="text-[11px] text-zinc-500">Configure recurring amount, interval, and installments for outgoing/incoming</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      Auto-Scheduler
                    </span>
                  </div>

                  {/* 1. GIVE THE AMOUNT */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-zinc-800">
                        1. Amount (Outgoing / Incoming) (₹)
                      </label>
                      <span className="text-[11px] font-black text-indigo-700">
                        {formatCurrency(xirrPresetAmount)}
                      </span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-zinc-400">₹</span>
                      <input
                        type="number"
                        step="1000"
                        min="500"
                        value={xirrPresetAmount === 0 ? '' : xirrPresetAmount}
                        onChange={(e) => setXirrPresetAmount(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                        className="w-full pl-8 pr-4 py-2 text-sm font-black text-zinc-900 rounded-xl border border-zinc-300 bg-white focus:border-indigo-600 focus:outline-none shadow-2xs"
                        placeholder="Enter recurring amount"
                      />
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {[5000, 10000, 25000, 50000, 100000].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setXirrPresetAmount(amt)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                            xirrPresetAmount === amt ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          {formatCurrency(amt)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. CHOOSE INTERVAL & 3. CHOOSE INSTALLMENTS */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* 2. Choose the year or month (half month, 1 month, quarter, 12 months) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-zinc-700">
                          2. Interval (Month / Year)
                        </label>
                        <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {xirrIntervalMonths === 0.5 ? 'Half Month (15d)' : xirrIntervalMonths === 1 ? '1 Month' : xirrIntervalMonths === 3 ? 'Quarter (3m)' : xirrIntervalMonths === 6 ? 'Half-Year (6m)' : xirrIntervalMonths === 12 ? '1 Year (12m)' : `Every ${xirrIntervalMonths}m`}
                        </span>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          min="0.5"
                          max="60"
                          value={xirrIntervalMonths === 0 ? '' : xirrIntervalMonths}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Math.max(0.5, parseFloat(e.target.value) || 0.5);
                            setXirrIntervalMonths(val);
                          }}
                          className="w-full text-xs font-black text-zinc-900 px-3 py-2 rounded-xl border border-zinc-300 bg-white focus:border-indigo-600 focus:outline-none shadow-2xs"
                          placeholder="e.g. 0.5 (half month), 1, 3, 12"
                        />
                      </div>

                      {/* Quick chips for half-month, 1 month, quarter, 6m, 12m */}
                      <div className="flex gap-1 flex-wrap">
                        {[
                          { label: 'Half Month', m: 0.5 },
                          { label: '1 Month', m: 1 },
                          { label: 'Quarter', m: 3 },
                          { label: 'Half Year', m: 6 },
                          { label: '12 Months (Year)', m: 12 },
                        ].map(item => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setXirrIntervalMonths(item.m)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                              xirrIntervalMonths === item.m
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Choose how many installments (quarterly, every year, 6 times, 12 times, etc.) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-zinc-700">
                          3. Installments Count
                        </label>
                        <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                          {xirrRepeatCount} {xirrRepeatCount === 1 ? 'Installment' : 'Installments'}
                        </span>
                      </div>

                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={xirrRepeatCount === 0 ? '' : xirrRepeatCount}
                          onChange={(e) => {
                            const val = e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 1);
                            setXirrRepeatCount(val);
                          }}
                          className="w-full text-xs font-black text-zinc-900 px-3 py-2 rounded-xl border border-zinc-300 bg-white focus:border-indigo-600 focus:outline-none shadow-2xs"
                          placeholder="e.g. 6, 12, 24 installments"
                        />
                      </div>

                      {/* Quick chips for installments */}
                      <div className="flex gap-1 flex-wrap">
                        {[
                          { label: 'Twice (2x)', c: 2 },
                          { label: 'Thrice (3x)', c: 3 },
                          { label: 'Quarterly (4x)', c: 4 },
                          { label: '6 Times', c: 6 },
                          { label: '12 Installments', c: 12 },
                          { label: '24 Times', c: 24 },
                        ].map(item => (
                          <button
                            key={item.label}
                            type="button"
                            onClick={() => setXirrRepeatCount(item.c)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                              xirrRepeatCount === item.c
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Summary Preview */}
                  <div className="p-2.5 rounded-xl bg-white border border-zinc-200 text-[11px] text-zinc-600 flex items-center justify-between">
                    <span>Batch Plan:</span>
                    <span className="font-black text-indigo-950">
                      {xirrRepeatCount} Installments × {formatCurrency(xirrPresetAmount)} ({xirrIntervalMonths === 0.5 ? 'Every Half Month' : `Every ${xirrIntervalMonths} Month(s)`}) = {formatCurrency(xirrPresetAmount * xirrRepeatCount)} Total
                    </span>
                  </div>

                  {/* ACTION BUTTONS: Outgoing & Incoming with same options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Outgoing Button */}
                    <button
                      type="button"
                      onClick={() => handleAddScheduledXirr('invest')}
                      className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-98"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add {xirrRepeatCount}x Outgoing (Cash Out / Invest -)</span>
                    </button>

                    {/* Incoming Button */}
                    <button
                      type="button"
                      onClick={() => handleAddScheduledXirr('withdraw')}
                      className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black transition-all cursor-pointer shadow-2xs active:scale-98"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add {xirrRepeatCount}x Incoming (Cash In / Return +)</span>
                    </button>
                  </div>

                  {/* Option for single 1x quick add */}
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-200/60">
                    <span>Quick single entries:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddXirrTransaction('invest')}
                        className="text-rose-700 hover:underline font-bold cursor-pointer"
                      >
                        + 1x Single Invest (-)
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => handleAddXirrTransaction('withdraw')}
                        className="text-emerald-700 hover:underline font-bold cursor-pointer"
                      >
                        + 1x Single Inflow (+)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Interactive Cash Flow Table */}
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {xirrTransactions.map((tx, idx) => (
                    <div 
                      key={tx.id} 
                      className={`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                        tx.type === 'invest' ? 'bg-rose-50/50 border-rose-200' : 'bg-emerald-50/50 border-emerald-200'
                      }`}
                    >
                      {/* Flow Type Toggle */}
                      <button
                        type="button"
                        onClick={() => handleUpdateXirrTx(tx.id, 'type', tx.type === 'invest' ? 'withdraw' : 'invest')}
                        className={`text-[10px] font-extrabold px-2 py-1 rounded-md shrink-0 cursor-pointer ${
                          tx.type === 'invest' ? 'bg-rose-100 text-rose-800 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        }`}
                      >
                        {tx.type === 'invest' ? 'Cash Out (-)' : 'Cash In (+)'}
                      </button>

                      {/* Date Picker */}
                      <input
                        type="date"
                        value={tx.dateStr}
                        onChange={(e) => handleUpdateXirrTx(tx.id, 'dateStr', e.target.value)}
                        className="text-xs font-mono p-1 rounded border border-zinc-300 bg-white"
                      />

                      {/* Amount Input */}
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-zinc-500">₹</span>
                        <input
                          type="number"
                          step="1000"
                          min="100"
                          value={tx.amount}
                          onChange={(e) => handleUpdateXirrTx(tx.id, 'amount', Number(e.target.value))}
                          className="w-24 text-xs font-bold p-1 rounded border border-zinc-300 bg-white"
                        />
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteXirrTx(tx.id)}
                        className="text-zinc-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. CAGR INPUTS */}
            {activeTab === 'cagr' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1">Initial Value (₹)</label>
                    <input
                      type="number"
                      value={cagrInitial === 0 ? '' : cagrInitial}
                      onChange={(e) => setCagrInitial(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                      className="w-full text-base font-bold p-2.5 rounded-xl border border-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1">Final Value (₹)</label>
                    <input
                      type="number"
                      value={cagrFinal === 0 ? '' : cagrFinal}
                      onChange={(e) => setCagrFinal(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                      className="w-full text-base font-bold p-2.5 rounded-xl border border-zinc-200"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-zinc-800 mb-1">
                    <span>Horizon</span>
                    <span className="text-purple-700">{cagrYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={cagrYears}
                    onChange={(e) => setCagrYears(Number(e.target.value))}
                    className="w-full accent-purple-600 h-2 bg-zinc-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 6. COMPOUND INTEREST INPUTS */}
            {activeTab === 'compound' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">Principal Deposit (₹)</label>
                  <input
                    type="number"
                    value={ciPrincipal === 0 ? '' : ciPrincipal}
                    onChange={(e) => setCiPrincipal(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                    className="w-full text-lg font-bold p-2.5 rounded-xl border border-zinc-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1">Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={ciRate}
                      onChange={(e) => setCiRate(Number(e.target.value))}
                      className="w-full text-sm font-bold p-2 rounded-xl border border-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1">Years ({ciYears})</label>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={ciYears}
                      onChange={(e) => setCiYears(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 7. EMI INPUTS */}
            {activeTab === 'emi' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">Loan Amount (₹)</label>
                  <input
                    type="number"
                    step="50000"
                    value={emiPrincipal === 0 ? '' : emiPrincipal}
                    onChange={(e) => setEmiPrincipal(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                    className="w-full text-xl font-black p-2.5 rounded-xl border border-zinc-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-700 mb-1">
                      <span>Rate</span>
                      <span className="text-rose-600">{emiRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="20"
                      step="0.25"
                      value={emiRate}
                      onChange={(e) => setEmiRate(Number(e.target.value))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold text-zinc-700 mb-1">
                      <span>Tenure</span>
                      <span className="text-zinc-900">{emiTenureYears} Yrs</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="30"
                      value={emiTenureYears}
                      onChange={(e) => setEmiTenureYears(Number(e.target.value))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 8. SWP INPUTS */}
            {activeTab === 'swp' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">Initial Corpus (₹)</label>
                  <input
                    type="number"
                    step="50000"
                    value={swpCorpus === 0 ? '' : swpCorpus}
                    onChange={(e) => setSwpCorpus(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                    className="w-full text-xl font-black p-2.5 rounded-xl border border-zinc-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1">Monthly Withdrawal</label>
                    <input
                      type="number"
                      step="1000"
                      value={swpMonthly === 0 ? '' : swpMonthly}
                      onChange={(e) => setSwpMonthly(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                      className="w-full text-sm font-bold p-2 rounded-xl border border-zinc-200"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1">Tenure ({swpYears} Yrs)</label>
                    <input
                      type="range"
                      min="2"
                      max="30"
                      value={swpYears}
                      onChange={(e) => setSwpYears(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer mt-2"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 9. NPS INPUTS */}
            {activeTab === 'nps' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">Monthly Contribution (₹)</label>
                  <input
                    type="number"
                    step="500"
                    value={npsMonthly === 0 ? '' : npsMonthly}
                    onChange={(e) => setNpsMonthly(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                    className="w-full text-lg font-bold p-2.5 rounded-xl border border-zinc-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1">Age ({npsAge} to {npsRetireAge})</label>
                    <input
                      type="range"
                      min="18"
                      max="55"
                      value={npsAge}
                      onChange={(e) => setNpsAge(Number(e.target.value))}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-zinc-800 block mb-1">Return ({npsReturn}%)</label>
                    <input
                      type="range"
                      min="6"
                      max="14"
                      step="0.5"
                      value={npsReturn}
                      onChange={(e) => setNpsReturn(Number(e.target.value))}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 10. POST OFFICE MIS INPUTS */}
            {activeTab === 'mis' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-800 block mb-1">Deposit Amount (₹)</label>
                  <input
                    type="number"
                    step="10000"
                    max="900000"
                    value={misDeposit === 0 ? '' : misDeposit}
                    onChange={(e) => setMisDeposit(e.target.value === '' ? 0 : Math.max(0, Number(e.target.value)))}
                    className="w-full text-xl font-black p-2.5 rounded-xl border border-zinc-200"
                  />
                </div>
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-semibold flex items-center justify-between">
                  <span>Official Sovereign Rate:</span>
                  <span className="text-sm font-black text-amber-950">{misRate}% p.a.</span>
                </div>
              </div>
            )}
          </div>

          {/* CARD 2: YEAR-BY-YEAR SCHEDULE & BREAKDOWN (NOW ON THE LEFT AS REQUESTED) */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-7 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-[#1b4d3e]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  Year-by-Year Schedule & Breakdown
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Annual Projections
              </span>
            </div>

            <p className="text-xs text-zinc-500">
              Detailed progression timeline, cumulative invested capital, and compounding interest growth.
            </p>

            {/* Scrollable Schedule Table */}
            <div className="overflow-x-auto rounded-2xl border border-zinc-200 max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-zinc-100 z-10 border-b border-zinc-200">
                  <tr className="text-[10px] font-bold uppercase text-zinc-500">
                    <th className="py-2.5 px-3">Timeline</th>
                    <th className="py-2.5 px-3">
                      {activeTab === 'emi' ? 'Principal Paid' : activeTab === 'swp' ? 'Withdrawn' : 'Total Invested'}
                    </th>
                    <th className="py-2.5 px-3">
                      {activeTab === 'emi' ? 'Interest Paid' : activeTab === 'swp' ? 'Interest Earned' : 'Growth / Gain'}
                    </th>
                    <th className="py-2.5 px-3 font-black text-emerald-800">
                      {activeTab === 'emi' ? 'Loan Balance' : activeTab === 'swp' ? 'Remaining Corpus' : 'Ending Value'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 bg-white">
                  {chartData.points.filter(pt => (activeTab === 'cagr' ? true : pt.yearNum > 0)).map((pt, idx) => {
                    const gain = Math.max(0, pt.value - pt.invested);
                    return (
                      <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-zinc-900 whitespace-nowrap">
                          {pt.label}
                        </td>
                        <td className="py-2.5 px-3 text-zinc-700 whitespace-nowrap">
                          {formatCurrency(pt.invested)}
                        </td>
                        <td className="py-2.5 px-3 text-emerald-700 font-semibold whitespace-nowrap">
                          {activeTab === 'emi' 
                            ? formatCurrency(emiData.yearlySchedule[pt.yearNum]?.interestPaid || 0)
                            : `+${formatCurrency(gain)}`}
                        </td>
                        <td className="py-2.5 px-3 font-black text-[#1b4d3e] whitespace-nowrap">
                          {formatCurrency(pt.value)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* ========================================================
            RIGHT COLUMN: TOTAL MATURITY VALUE & GRAPH (COL 6)
            (SHOWING X YEARS AND Y RIGHT AMOUNTS)
           ======================================================== */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Results Card */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-7 space-y-5">
            
            {/* Top Metric Header */}
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-zinc-500">
                {activeTab === 'inflation' ? 'FUTURE REQUIRED COST' : activeTab === 'emi' ? 'MONTHLY EMI TO PAY' : activeTab === 'swp' ? 'REMAINING RETIREMENT CORPUS' : activeTab === 'mis' ? 'GUARANTEED MONTHLY INTEREST' : activeTab === 'xirr' ? 'ANNUALIZED RATE OF RETURN' : activeTab === 'cagr' ? 'COMPOUND ANNUAL GROWTH RATE' : 'TOTAL MATURITY VALUE'}
              </div>
              
              <div className="text-4xl sm:text-5xl font-black text-[#00a859] tracking-tight mt-1">
                {activeTab === 'sip' && formatCurrency(sipData.futureValue)}
                {activeTab === 'inflation' && formatCurrency(infData.futureCost)}
                {activeTab === 'stepup' && formatCurrency(stepUpData.futureValue)}
                {activeTab === 'lumpsum' && formatCurrency(lumpData.futureValue)}
                {activeTab === 'xirr' && `${xirrData.xirrRate}% p.a.`}
                {activeTab === 'cagr' && `${cagrData.cagr}% p.a.`}
                {activeTab === 'compound' && formatCurrency(ciData.finalBalance)}
                {activeTab === 'emi' && `${formatCurrency(emiData.emi)}/mo`}
                {activeTab === 'swp' && formatCurrency(swpData.remainingBalance)}
                {activeTab === 'nps' && formatCurrency(npsData.corpus)}
                {activeTab === 'mis' && `${formatCurrency(misData.monthlyIncome)}/mo`}
              </div>

              <div className="text-sm font-bold text-zinc-500 mt-1">
                {activeTab === 'sip' && formatIndianUnits(sipData.futureValue)}
                {activeTab === 'inflation' && `${formatIndianUnits(infData.futureCost)} needed (+${infData.percentIncrease}% inflation rise)`}
                {activeTab === 'stepup' && formatIndianUnits(stepUpData.futureValue)}
                {activeTab === 'lumpsum' && formatIndianUnits(lumpData.futureValue)}
                {activeTab === 'compound' && formatIndianUnits(ciData.finalBalance)}
                {activeTab === 'swp' && (swpData.isExhausted ? `Exhausts in ~${swpData.exhaustionYears} Yrs` : formatIndianUnits(swpData.remainingBalance))}
                {activeTab === 'nps' && `${formatIndianUnits(npsData.corpus)} Corpus`}
                {activeTab === 'mis' && `₹${misData.monthlyIncome * 12}/year`}
                {activeTab === 'emi' && `Total Loan Cost: ${formatIndianUnits(emiData.totalPayment)}`}
                {activeTab === 'cagr' && (cagrData.profit >= 0 ? `Total Profit: +${formatIndianUnits(cagrData.profit)}` : `Total Loss: -${formatIndianUnits(Math.abs(cagrData.profit))}`)}
                {activeTab === 'xirr' && (xirrData.netProfit >= 0 ? `Net Gain: +${formatIndianUnits(xirrData.netProfit)}` : `Net Loss: -${formatIndianUnits(Math.abs(xirrData.netProfit))}`)}
              </div>
            </div>

            {/* TWO COMPARISON PILL CARDS (EXACT SCREENSHOT STYLE) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Card 1: Total Investment / Principal / Current Cost */}
              <div className="p-4 rounded-2xl bg-zinc-100/80 border border-zinc-200/80 space-y-1">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">
                  {activeTab === 'inflation' ? 'Current Cost Today' : activeTab === 'emi' ? 'Loan Principal' : activeTab === 'cagr' ? 'Starting Value' : activeTab === 'swp' ? 'Initial Corpus' : 'Total Investment'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-zinc-900">
                  {activeTab === 'sip' && formatCurrency(sipData.totalInvested)}
                  {activeTab === 'inflation' && formatCurrency(infAmount)}
                  {activeTab === 'stepup' && formatCurrency(stepUpData.totalInvested)}
                  {activeTab === 'lumpsum' && formatCurrency(lumpData.totalInvested)}
                  {activeTab === 'xirr' && formatCurrency(xirrData.totalInvested)}
                  {activeTab === 'cagr' && formatCurrency(cagrInitial)}
                  {activeTab === 'compound' && formatCurrency(ciPrincipal)}
                  {activeTab === 'emi' && formatCurrency(emiPrincipal)}
                  {activeTab === 'swp' && formatCurrency(swpCorpus)}
                  {activeTab === 'nps' && formatCurrency(npsData.totalContributions)}
                  {activeTab === 'mis' && formatCurrency(misDeposit)}
                </div>
              </div>

              {/* Card 2: Estimated Returns / Interest / Extra Needed */}
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 space-y-1">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  {activeTab === 'inflation' ? 'Extra Money Needed' : activeTab === 'emi' ? 'Total Interest' : activeTab === 'cagr' ? (cagrData.profit >= 0 ? 'Net Profit' : 'Net Loss') : activeTab === 'swp' ? 'Total Withdrawn' : activeTab === 'nps' ? 'Monthly Pension' : activeTab === 'mis' ? '5-Yr Total Interest' : (activeTab === 'xirr' && xirrData.netProfit < 0 ? 'Net Loss' : 'Estimated Returns')}
                </span>
                <div className={`text-xl sm:text-2xl font-black ${
                  (activeTab === 'cagr' && cagrData.profit < 0) || (activeTab === 'xirr' && xirrData.netProfit < 0) 
                    ? 'text-rose-600' 
                    : 'text-emerald-700'
                }`}>
                  {activeTab === 'sip' && `+${formatCurrency(sipData.totalReturns)}`}
                  {activeTab === 'inflation' && `+${formatCurrency(infData.costIncrease)}`}
                  {activeTab === 'stepup' && `+${formatCurrency(stepUpData.totalReturns)}`}
                  {activeTab === 'lumpsum' && `+${formatCurrency(lumpData.profit)}`}
                  {activeTab === 'xirr' && (xirrData.netProfit >= 0 ? `+${formatCurrency(xirrData.netProfit)}` : `-${formatCurrency(Math.abs(xirrData.netProfit))}`)}
                  {activeTab === 'cagr' && (cagrData.profit >= 0 ? `+${formatCurrency(cagrData.profit)}` : `-${formatCurrency(Math.abs(cagrData.profit))}`)}
                  {activeTab === 'compound' && `+${formatCurrency(ciData.interestEarned)}`}
                  {activeTab === 'emi' && formatCurrency(emiData.totalInterest)}
                  {activeTab === 'swp' && formatCurrency(swpData.totalWithdrawn)}
                  {activeTab === 'nps' && `${formatCurrency(npsData.monthlyPension)}/mo`}
                  {activeTab === 'mis' && `+${formatCurrency(misData.totalInterest5Yrs)}`}
                </div>
              </div>
            </div>

          </div>

          {/* VISUAL GRAPH SECTION (WITH X YEARS AND Y RIGHT AMOUNTS) */}
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#1b4d3e]" />
                <span className="text-xs font-black uppercase tracking-wider text-zinc-900">
                  Trajectory Simulation Graph
                </span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setChartMode('growth')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    chartMode === 'growth' ? 'bg-white text-zinc-950 shadow-xs font-black' : 'text-zinc-500'
                  }`}
                >
                  Growth Curve
                </button>
                <button
                  type="button"
                  onClick={() => setChartMode('ratio')}
                  className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    chartMode === 'ratio' ? 'bg-white text-zinc-950 shadow-xs font-black' : 'text-zinc-500'
                  }`}
                >
                  Asset Ratio
                </button>
              </div>
            </div>

            {/* 1. INTERACTIVE SVG AREA GRAPH WITH X (YEARS) & Y (RIGHT AMOUNTS) */}
            {chartMode === 'growth' && (
              <div className="w-full bg-slate-50/80 p-4 rounded-2xl border border-zinc-200 space-y-3">
                {/* DYNAMIC TOP SUMMARY PILLS REFLECTING EXACT NUMBERS & YEARS */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center p-2.5 rounded-xl bg-white border border-zinc-200/90 shadow-2xs">
                  <div className="border-r border-zinc-100 last:border-none">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Horizon (X)</span>
                    <span className="text-xs font-black text-zinc-900">{chartSummary.horizon}</span>
                  </div>
                  <div className="border-r border-zinc-100 last:border-none">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Invested / Base</span>
                    <span className="text-xs font-black text-slate-600">{formatCurrency(chartSummary.invested)}</span>
                  </div>
                  <div className="border-r border-zinc-100 last:border-none">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Peak Projected (Y)</span>
                    <span className="text-xs font-black text-[#00a859]">{formatCurrency(chartSummary.value)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Trajectory</span>
                    <span className="text-xs font-black text-emerald-800">{chartSummary.growth}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                      <span className="font-bold text-zinc-800">
                        {activeTab === 'inflation' ? 'Future Inflated Cost' : activeTab === 'emi' ? 'Loan Balance' : 'Total Portfolio Value'}
                      </span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-slate-400" />
                      <span className="font-bold text-zinc-600">
                        {activeTab === 'inflation' ? 'Current Cost Today' : activeTab === 'emi' ? 'Principal Repaid' : 'Invested Capital'}
                      </span>
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-500">Y-Axis: Right (₹)</span>
                </div>

                {/* SVG Chart Rendering with Mouse Tracker */}
                <div className="w-full relative">
                  <svg 
                    className="w-full h-56 overflow-visible select-none cursor-crosshair" 
                    viewBox="0 0 540 220"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const mouseX = e.clientX - rect.left;
                      const svgX = (mouseX / rect.width) * 540;
                      let closestIdx = 0;
                      let minDist = Infinity;
                      svgMetrics.mapped.forEach((pt, i) => {
                        const dist = Math.abs(pt.x - svgX);
                        if (dist < minDist) {
                          minDist = dist;
                          closestIdx = i;
                        }
                      });
                      setHoverIndex(closestIdx);
                    }}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    <defs>
                      <linearGradient id="growthWealthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.03" />
                      </linearGradient>
                      <linearGradient id="growthInvestGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>

                    {/* HORIZONTAL GRID LINES & Y-AXIS AMOUNTS ON THE RIGHT */}
                    {svgMetrics.yLevels.map((lvl, idx) => (
                      <g key={`y-lvl-${idx}`}>
                        <line
                          x1={svgMetrics.xStart}
                          y1={lvl.y}
                          x2={svgMetrics.xEnd}
                          y2={lvl.y}
                          stroke={idx === 4 ? '#94a3b8' : idx === 0 ? '#cbd5e1' : '#e2e8f0'}
                          strokeWidth={idx === 4 ? 1.5 : 1}
                          strokeDasharray={idx === 4 ? undefined : '3 3'}
                        />
                        <text
                          x={svgMetrics.xEnd + 8}
                          y={lvl.y + 3.5}
                          fill={lvl.color}
                          fontSize={lvl.bold ? '10' : '9'}
                          fontWeight={lvl.bold ? 'bold' : '600'}
                          fontFamily="sans-serif"
                        >
                          {formatYAxisAmount(lvl.val)}
                        </text>
                      </g>
                    ))}

                    {/* Right Vertical Y-Axis Border Line */}
                    <line x1={svgMetrics.xEnd} y1={svgMetrics.yTop} x2={svgMetrics.xEnd} y2={svgMetrics.yBottom} stroke="#cbd5e1" strokeWidth="1" />

                    {/* AREA SHADING */}
                    {svgMetrics.valArea && <path d={svgMetrics.valArea} fill="url(#growthWealthGradient)" />}
                    {svgMetrics.invArea && <path d={svgMetrics.invArea} fill="url(#growthInvestGradient)" />}

                    {/* LINES */}
                    {svgMetrics.invPath && (
                      <path
                        d={svgMetrics.invPath}
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2.5"
                        strokeDasharray="4 4"
                      />
                    )}
                    {svgMetrics.valPath && (
                      <path
                        d={svgMetrics.valPath}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />
                    )}

                    {/* DATA POINTS */}
                    {svgMetrics.mapped.map((pt, i) => (
                      <circle
                        key={i}
                        cx={pt.x}
                        cy={pt.yVal}
                        r={i === svgMetrics.mapped.length - 1 ? 5 : 2.5}
                        fill="#10b981"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* DYNAMIC X-AXIS TICKS & YEARS ALONG BOTTOM */}
                    {svgMetrics.xTicks.map((pt, idx) => (
                      <g key={`x-tick-${idx}`}>
                        <line x1={pt.x} y1={svgMetrics.yBottom} x2={pt.x} y2={svgMetrics.yBottom + 5} stroke="#64748b" strokeWidth="1.5" />
                        <text
                          x={pt.x}
                          y={svgMetrics.yBottom + 18}
                          textAnchor="middle"
                          fill="#334155"
                          fontSize="9.5"
                          fontWeight="bold"
                        >
                          {pt.label}
                        </text>
                      </g>
                    ))}

                    {/* X-Axis Label */}
                    <text
                      x={(svgMetrics.xStart + svgMetrics.xEnd) / 2}
                      y={svgMetrics.yBottom + 34}
                      textAnchor="middle"
                      fill="#64748b"
                      fontSize="9"
                      fontWeight="bold"
                      letterSpacing="0.05em"
                    >
                      TENURE / TIMELINE (X-AXIS) →
                    </text>

                    {/* HIGHLIGHT AT END OF CURVE (WHEN NOT HOVERING) */}
                    {hoverIndex === null && svgMetrics.mapped.length > 0 && (() => {
                      const lastPt = svgMetrics.mapped[svgMetrics.mapped.length - 1];
                      const badgeX = Math.min(Math.max(lastPt.x - 30, 60), svgMetrics.xEnd - 50);
                      const badgeY = Math.max(svgMetrics.yTop + 14, lastPt.yVal - 14);
                      return (
                        <g transform={`translate(${badgeX}, ${badgeY})`}>
                          <rect
                            x="-40"
                            y="-11"
                            width="80"
                            height="20"
                            rx="5"
                            fill="#047857"
                            stroke="#ffffff"
                            strokeWidth="1.5"
                          />
                          <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="8.5" fontWeight="black">
                            {lastPt.label}: {formatIndianUnits(lastPt.value)}
                          </text>
                        </g>
                      );
                    })()}

                    {/* ACTIVE HOVER GUIDELINE & FLOATING TOOLTIP */}
                    {hoverIndex !== null && svgMetrics.mapped[hoverIndex] && (() => {
                      const activePt = svgMetrics.mapped[hoverIndex];
                      const tooltipX = Math.min(Math.max(activePt.x, 85), svgMetrics.xEnd - 85);
                      const tooltipY = Math.max(svgMetrics.yTop + 24, Math.min(activePt.yVal - 28, svgMetrics.yBottom - 45));
                      const gain = Math.max(0, activePt.value - activePt.invested);
                      return (
                        <g>
                          {/* Vertical Guideline */}
                          <line
                            x1={activePt.x}
                            y1={svgMetrics.yTop}
                            x2={activePt.x}
                            y2={svgMetrics.yBottom}
                            stroke="#059669"
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                          />

                          {/* Glowing Dots */}
                          <circle cx={activePt.x} cy={activePt.yInv} r="5" fill="#64748b" stroke="#ffffff" strokeWidth="2" />
                          <circle cx={activePt.x} cy={activePt.yVal} r="6.5" fill="#10b981" stroke="#ffffff" strokeWidth="2.5" />

                          {/* Floating Tooltip Card */}
                          <g transform={`translate(${tooltipX}, ${tooltipY})`}>
                            <rect
                              x="-75"
                              y="-22"
                              width="150"
                              height="44"
                              rx="8"
                              fill="#0f172a"
                              opacity="0.95"
                              stroke="#334155"
                              strokeWidth="1"
                            />
                            <text x="0" y="-8" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">
                              {activePt.label} • {activeTab === 'inflation' ? 'Cost' : 'Value'}: {formatIndianUnits(activePt.value)}
                            </text>
                            <text x="0" y="5" textAnchor="middle" fill="#34d399" fontSize="9.5" fontWeight="black">
                              {formatCurrency(activePt.value)}
                            </text>
                            <text x="0" y="16" textAnchor="middle" fill="#cbd5e1" fontSize="7.5">
                              Invested: {formatCurrency(activePt.invested)} ({activeTab === 'inflation' ? 'Today' : `+${formatIndianUnits(gain)}`})
                            </text>
                          </g>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            )}

            {/* 2. RATIO DISTRIBUTION BAR */}
            {chartMode === 'ratio' && (
              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                <div className="flex justify-between text-xs font-bold text-zinc-700">
                  <span>Capital Ratio Distribution</span>
                  <span>100% Breakdown</span>
                </div>
                
                <div className="h-6 w-full rounded-xl bg-zinc-200 overflow-hidden flex shadow-inner">
                  <div
                    style={{ width: '45%' }}
                    className="bg-zinc-600 h-full flex items-center justify-center text-[10px] font-black text-white"
                  >
                    Invested Principal (45%)
                  </div>
                  <div
                    style={{ width: '55%' }}
                    className="bg-[#10b981] h-full flex items-center justify-center text-[10px] font-black text-white"
                  >
                    Compound Wealth (55%)
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-zinc-600" />
                    <span className="text-zinc-600 font-medium">Invested Principal: <strong>45%</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                    <span className="text-emerald-800 font-bold">Wealth Gain: <strong>+55%</strong></span>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
      )}
    </div>
  );
};
