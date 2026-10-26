'use client';

import React, { useState, useMemo } from 'react';
import { AssessmentData, CurrencyCode } from '@/types/assessment';
import { FinScoreResult } from '@/types/score';
import { formatCurrency, parseNum, calculateTotalMonthlyIncome, calculateTotalMonthlyExpenses } from '@/utils/calculations';
import { formatIndianUnits } from '@/components/calculators/CalculatorsPage';
import { 
  Flame, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Coins, 
  Layers, 
  Calendar, 
  CheckCircle2, 
  Landmark, 
  Wallet, 
  AlertTriangle 
} from 'lucide-react';

interface RetirementFireAdvisorProps {
  assessment: AssessmentData;
  scoreResult: FinScoreResult;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
  onOpenFireCalculator?: () => void;
}

export const RetirementFireAdvisor: React.FC<RetirementFireAdvisorProps> = ({
  assessment,
  scoreResult,
  isOpen: controlledIsOpen,
  onToggleOpen,
  onOpenFireCalculator,
}) => {
  const [localIsOpen, setLocalIsOpen] = useState<boolean>(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : localIsOpen;

  const setOpen = (open: boolean) => {
    if (onToggleOpen) {
      onToggleOpen(open);
    } else {
      setLocalIsOpen(open);
    }
  };

  const currency: CurrencyCode = assessment?.personal?.currency || 'INR';

  // Current User Metrics
  const currentAge = typeof assessment.personal.age === 'number' && assessment.personal.age > 0 
    ? assessment.personal.age 
    : 30;
  
  // Default Retirement Age benchmark (e.g. 50 for early FIRE, 58 for standard India)
  const [targetRetireAge, setTargetRetireAge] = useState<number>(() => Math.max(currentAge + 5, 50));
  const [inflationRate, setInflationRate] = useState<number>(6.0);
  const [selectedMultiplier, setSelectedMultiplier] = useState<25 | 30 | 33>(25);

  const yearsToRetire = Math.max(1, targetRetireAge - currentAge);

  // Financial Outflows
  const expenseTotals = useMemo(() => {
    return calculateTotalMonthlyExpenses(assessment.expenses, assessment.customExpenses, assessment.loans);
  }, [assessment.expenses, assessment.customExpenses, assessment.loans]);

  const monthlyBurn = expenseTotals.total > 0 ? expenseTotals.total : 40000;
  const currentAnnualExpenses = monthlyBurn * 12;

  // Future Expenses & Corpus
  const futureAnnualExpenses = Math.round(currentAnnualExpenses * Math.pow(1 + inflationRate / 100, yearsToRetire));
  const futureMonthlyExpenses = Math.round(futureAnnualExpenses / 12);

  const targetCorpus = Math.round(futureAnnualExpenses * selectedMultiplier);
  const swrPercent = Number((100 / selectedMultiplier).toFixed(2));

  // Current Assets vs Target
  const totalAssets = scoreResult.metrics?.totalAssets || 0;
  const projectedAssets = Math.round(totalAssets * Math.pow(1.12, yearsToRetire)); // Compounded at 12% equity CAGR
  const fundingGap = Math.max(0, targetCorpus - projectedAssets);
  const progressPct = targetCorpus > 0 ? Math.min(100, Math.round((projectedAssets / targetCorpus) * 100)) : 100;

  // Monthly SIP needed to bridge the gap
  const monthlyRate = 0.12 / 12;
  const totalMonths = yearsToRetire * 12;
  const requiredSip = monthlyRate > 0 && fundingGap > 0 && totalMonths > 0
    ? Math.round((fundingGap * monthlyRate) / ((Math.pow(1 + monthlyRate, totalMonths) - 1) * (1 + monthlyRate)))
    : 0;

  // 3-Bucket Post-FIRE Split
  const bucket1Cash = Math.round(futureAnnualExpenses * 2.5); // 2.5 years cash/liquid
  const bucket2Fixed = Math.round(futureAnnualExpenses * 6.5); // 6.5 years fixed income / G-Secs
  const bucket3Growth = Math.max(0, targetCorpus - bucket1Cash - bucket2Fixed); // 10+ yrs equities

  return (
    <div className="w-full bg-white rounded-3xl border border-zinc-200/90 shadow-sm overflow-hidden transition-all duration-300">
      {/* 1. TOP BANNER HEADER (ALWAYS VISIBLE) */}
      <div className="bg-gradient-to-r from-zinc-950 via-[#0d2a21] to-[#143d31] p-5 sm:p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center shrink-0 shadow-inner">
            <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-300/30 tracking-wider">
                FIRE Strategy Advisor
              </span>
              <span className="text-[10px] font-bold text-emerald-300/90 hidden sm:inline">
                Target: {formatIndianUnits(targetCorpus)} ({selectedMultiplier}×)
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
              Retirement Planning & FIRE Number Strategy
            </h3>
            <p className="text-xs text-emerald-100/80 leading-normal max-w-2xl font-medium">
              Calculate your inflation-adjusted Financial Independence target, evaluate the 3-bucket post-retirement portfolio, and plan safe withdrawal rates.
            </p>
          </div>
        </div>

        {/* Action Buttons: 1. Launch Calculator, 2. Toggle Section */}
        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0 flex-wrap">
          {onOpenFireCalculator && (
            <button
              type="button"
              onClick={onOpenFireCalculator}
              className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-zinc-950" />
              <span>Open FIRE Calculator</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}

          <button
            type="button"
            onClick={() => setOpen(!isOpen)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-white/10 hover:bg-white/15 text-white border border-white/20 transition-all cursor-pointer"
          >
            <span>{isOpen ? 'Close Advisor' : 'View Strategy'}</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 2. EXPANDABLE BODY CONTENT */}
      {isOpen && (
        <div className="p-5 sm:p-7 space-y-7 animate-in fade-in slide-in-from-top-4 duration-300 bg-zinc-50/50">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Current Monthly Burn
              </span>
              <div className="text-base font-black text-zinc-900">
                {formatCurrency(monthlyBurn, currency)}/mo
              </div>
              <span className="text-[10.5px] text-zinc-500">
                Annual: {formatIndianUnits(currentAnnualExpenses)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                Retirement Year 1 Need
              </span>
              <div className="text-base font-black text-amber-800">
                {formatCurrency(futureMonthlyExpenses, currency)}/mo
              </div>
              <span className="text-[10.5px] text-zinc-500">
                @ {inflationRate}% inflation ({yearsToRetire} yrs)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Target FIRE Corpus
              </span>
              <div className="text-base font-black text-[#1b4d3e]">
                {formatCurrency(targetCorpus, currency)}
              </div>
              <span className="text-[10.5px] text-emerald-700 font-bold">
                ≈ {formatIndianUnits(targetCorpus)} ({selectedMultiplier}×)
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-0.5">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                Safe Withdrawal Rate
              </span>
              <div className="text-base font-black text-zinc-900">
                {swrPercent}% SWR
              </div>
              <span className="text-[10.5px] text-zinc-500">
                Initial annual drawdown
              </span>
            </div>
          </div>

          {/* Interactive Multiplier Selection & Progress */}
          <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                  <Coins className="w-4 h-4 text-emerald-700" />
                  <span>Choose Your Target FIRE Multiplier</span>
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Higher multipliers create a larger capital reserve and a safer initial withdrawal rate.
                </p>
              </div>

              {/* Multiplier Chips */}
              <div className="flex items-center gap-2">
                {([25, 30, 33] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMultiplier(m)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      selectedMultiplier === m
                        ? 'bg-[#1b4d3e] text-white shadow-xs scale-105'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    {m}× ({(100 / m).toFixed(1)}%)
                  </button>
                ))}
              </div>
            </div>

            {/* Target Funding Gap Progress Bar */}
            <div className="space-y-1.5 pt-2 border-t border-zinc-100">
              <div className="flex justify-between text-xs font-bold text-zinc-700">
                <span>Wealth Progress: {progressPct}% Funded</span>
                <span>Projected: {formatIndianUnits(projectedAssets)} / Target: {formatIndianUnits(targetCorpus)}</span>
              </div>
              <div className="w-full bg-zinc-100 h-2.5 rounded-full overflow-hidden shadow-inner flex">
                <div
                  className="bg-emerald-600 h-full transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-zinc-500 pt-1">
                <span>Current Assets: {formatCurrency(totalAssets, currency)}</span>
                {fundingGap > 0 ? (
                  <span className="text-emerald-800 font-bold">
                    SIP of {formatCurrency(requiredSip, currency)}/mo needed to bridge {formatIndianUnits(fundingGap)} gap
                  </span>
                ) : (
                  <span className="text-emerald-700 font-bold">Target fully covered by existing assets!</span>
                )}
              </div>
            </div>
          </div>

          {/* 3-Bucket Strategy Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-700" />
                <span>Post-FIRE 3-Bucket Income Distribution Plan</span>
              </h4>
              <span className="text-[11px] font-bold text-zinc-500">
                Protects Against Market Crashes
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Bucket 1 */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-950">Bucket 1: Cash & Liquid</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">1–3 Yrs</span>
                </div>
                <div className="text-base font-black text-emerald-900">
                  {formatCurrency(bucket1Cash, currency)}
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  2.5 years of immediate living expenses in Post Office Time Deposits, high-yield Bank FDs, and Liquid Mutual Funds.
                </p>
              </div>

              {/* Bucket 2 */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-blue-950">Bucket 2: Fixed Income</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-200 text-blue-900">4–10 Yrs</span>
                </div>
                <div className="text-base font-black text-blue-900">
                  {formatCurrency(bucket2Fixed, currency)}
                </div>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Predictable cash flow in Government Securities (G-Secs), POMIS, SCSS (age 60+), and RBI Floating Rate Bonds.
                </p>
              </div>

              {/* Bucket 3 */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-purple-950">Bucket 3: Growth Equity</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-200 text-purple-900">10+ Yrs</span>
                </div>
                <div className="text-base font-black text-purple-900">
                  {formatCurrency(bucket3Growth, currency)}
                </div>
                <p className="text-[11px] text-purple-800 leading-relaxed">
                  Broad-market Nifty 50 Index and Flexicap equity funds to compound above inflation and defeat longevity risk.
                </p>
              </div>
            </div>
          </div>

          {/* Direct Link Banner to Full Calculator */}
          {onOpenFireCalculator && (
            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#eaf5ef] to-[#d8efe2] border border-[#b7dfcb] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-800" />
                  <h4 className="text-xs sm:text-sm font-black text-zinc-900">
                    Want exact calendar dates, inflation sensitivity & verified product comparisons?
                  </h4>
                </div>
                <p className="text-xs text-zinc-600">
                  Access the dedicated FIRE Calculator with official verified rates for G-Secs, POMIS, SCSS, RBI Bonds, and bank fixed deposits.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenFireCalculator}
                className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black bg-[#1b4d3e] hover:bg-[#143d31] text-white shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0 self-start sm:self-auto"
              >
                <span>Launch Full FIRE Suite</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
