'use client';

import React from 'react';
import { AssessmentData } from '@/types/assessment';
import { FinScoreResult } from '@/types/score';
import { formatCurrency, parseNum } from '@/utils/calculations';
import { 
  ArrowDown, 
  ArrowRight, 
  CheckCircle2, 
  Scale, 
  Wallet, 
  Receipt, 
  Building2, 
  CreditCard, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';

interface PersonalBalanceSheetProps {
  assessment: AssessmentData;
  scoreResult: FinScoreResult;
}

export const PersonalBalanceSheet: React.FC<PersonalBalanceSheetProps> = ({
  assessment,
  scoreResult,
}) => {
  const { metrics, pillarScores } = scoreResult;
  const currency = assessment.personal.currency || 'INR';

  // 1. Income Data
  const monthlySalary = parseNum(assessment.personal.monthlyTakeHome);
  const add = assessment.additionalIncome;
  const freelance = parseNum(add?.freelance);
  const business = parseNum(add?.business);
  const rental = parseNum(add?.rental);
  const dividends = parseNum(add?.interestDividends);
  const otherIncome = parseNum(add?.other);
  const totalIncome = monthlySalary + freelance + business + rental + dividends + otherIncome;

  // 2. Expense Data
  const livingCosts = pillarScores.savingsHealth.monthlyExpenses || 0;
  const emiOutflow = pillarScores.debtHealth.totalMonthlyEmi || 0;
  const totalOutflow = livingCosts + emiOutflow;
  const netMonthlySurplus = totalIncome - totalOutflow;

  // 3. Asset Data
  const liquidEmergency = parseNum(assessment.emergencyFund.liquidSavings);
  const investmentsTotal = assessment.assets.reduce((sum, a) => sum + parseNum(a.currentValue), 0);
  const totalAssets = liquidEmergency + investmentsTotal;

  // 4. Liabilities Data
  const totalLiabilities = pillarScores.debtHealth.totalDebtPrincipal || 0;

  // 5. Net Equity (Accounting Equation: Assets = Liabilities + Net Equity  =>  Net Equity = Assets - Liabilities)
  const netEquity = totalAssets - totalLiabilities;
  const isSolvent = netEquity >= 0;
  const debtToAssetPct = totalAssets > 0 ? Math.round((totalLiabilities / totalAssets) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 lg:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-8">
      
      {/* Title & Accounting Equation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                Personal Balance Sheet & Cash Flow Diagram
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-bold text-[#1e40af] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Accounting Equation: Assets = Liabilities + Net Equity
                </span>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2 max-w-2xl leading-relaxed">
            Visualizing the relationship between your monthly income statement and personal balance sheet. Surplus cash flow builds productive assets, while debt repayments retire liabilities.
          </p>
        </div>

        {/* Live Equation Pill Badge */}
        <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 shrink-0 self-start md:self-center">
          <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Personal Net Equity (Net Worth)
          </div>
          <div className={`text-xl font-black mt-0.5 ${isSolvent ? 'text-[#1b4d3e]' : 'text-rose-600'}`}>
            {formatCurrency(netEquity, currency)}
          </div>
          <div className="text-[11px] text-zinc-500">
            {debtToAssetPct}% Debt / Assets Ratio
          </div>
        </div>
      </div>

      {/* DIAGRAM CONTAINER (MATCHING USER UPLOADED DIAGRAM STRUCTURE) */}
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* SECTION 1: INCOME STATEMENT */}
        <div className="space-y-4">
          {/* Section Pill Badge Header */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-8 py-2 rounded-xl bg-[#dbeafe] text-[#1e3a8a] border-2 border-[#93c5fd] font-black text-sm tracking-wide uppercase shadow-xs">
              <span>INCOME STATEMENT</span>
            </div>
          </div>

          {/* Stacked Income & Expenses Cards */}
          <div className="space-y-3">
            
            {/* 1. Income Card (Light Green Background, Solid Black Border) */}
            <div className="rounded-2xl bg-[#dcfce7] border-2 border-zinc-900 p-5 sm:p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.9)] transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-900" />
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                    Income
                  </h3>
                </div>
                <div className="text-xl sm:text-2xl font-black text-emerald-950">
                  {formatCurrency(totalIncome, currency)}<span className="text-xs font-semibold text-emerald-800">/mo</span>
                </div>
              </div>

              {/* Sub-item pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-emerald-300 font-semibold text-zinc-900 shadow-2xs">
                  Take-home salary: <span className="font-bold">{formatCurrency(monthlySalary, currency)}</span>
                </div>
                {freelance > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-emerald-300 font-semibold text-zinc-900 shadow-2xs">
                    Freelance / Consulting: <span className="font-bold">{formatCurrency(freelance, currency)}</span>
                  </div>
                )}
                {business > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-emerald-300 font-semibold text-zinc-900 shadow-2xs">
                    Business profits: <span className="font-bold">{formatCurrency(business, currency)}</span>
                  </div>
                )}
                {rental > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-emerald-300 font-semibold text-zinc-900 shadow-2xs">
                    Rental income: <span className="font-bold">{formatCurrency(rental, currency)}</span>
                  </div>
                )}
                {dividends > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-emerald-300 font-semibold text-zinc-900 shadow-2xs">
                    Dividends & interest: <span className="font-bold">{formatCurrency(dividends, currency)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Expenses Card (Soft Pink Background, Solid Black Border) */}
            <div className="rounded-2xl bg-[#fee2e2] border-2 border-zinc-900 p-5 sm:p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.9)] transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-rose-900" />
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                    Expenses
                  </h3>
                </div>
                <div className="text-xl sm:text-2xl font-black text-rose-950">
                  {formatCurrency(totalOutflow, currency)}<span className="text-xs font-semibold text-rose-800">/mo</span>
                </div>
              </div>

              {/* Sub-item pills */}
              <div className="flex flex-wrap gap-2 text-xs">
                <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-rose-300 font-semibold text-zinc-900 shadow-2xs">
                  Living & household costs: <span className="font-bold">{formatCurrency(livingCosts, currency)}</span>
                </div>
                {emiOutflow > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-rose-300 font-semibold text-zinc-900 shadow-2xs">
                    Debt EMIs & interest: <span className="font-bold text-rose-700">{formatCurrency(emiOutflow, currency)}</span>
                  </div>
                )}
                {assessment.customExpenses && assessment.customExpenses.length > 0 && (
                  <div className="px-3 py-1.5 rounded-xl bg-white/80 border border-rose-300 font-semibold text-zinc-900 shadow-2xs">
                    {assessment.customExpenses.length} custom outlays included
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Cashflow Flow Indicator (Surplus into Assets) */}
          <div className="flex flex-col items-center justify-center gap-1 py-1 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-bold shadow-sm">
              <span>Monthly Net Surplus: {formatCurrency(netMonthlySurplus, currency)}</span>
              <ArrowDown className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">
              Surplus flows directly into building your Asset base below
            </span>
          </div>
        </div>

        {/* SECTION 2: BALANCE SHEET */}
        <div className="space-y-4">
          {/* Section Pill Badge Header */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-8 py-2 rounded-xl bg-[#dbeafe] text-[#1e3a8a] border-2 border-[#93c5fd] font-black text-sm tracking-wide uppercase shadow-xs">
              <span>BALANCE SHEET</span>
            </div>
          </div>

          {/* Side-by-Side Asymmetric Layout matching user sketch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            
            {/* Left Card: Assets (Soft Cream/Yellow Background, Solid Black Border) */}
            <div className="rounded-2xl bg-[#fef3c7] border-2 border-zinc-900 p-5 sm:p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.9)] space-y-4 min-h-[220px]">
              <div className="flex items-center justify-between gap-3 border-b border-amber-300/80 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-950" />
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                    Assets
                  </h3>
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-950">
                  {formatCurrency(totalAssets, currency)}
                </div>
              </div>

              {/* Asset breakdown list */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white/90 border border-amber-300 flex items-center justify-between font-medium">
                  <span className="text-zinc-700">Liquid Emergency Buffer:</span>
                  <span className="font-bold text-zinc-900">{formatCurrency(liquidEmergency, currency)}</span>
                </div>

                {assessment.assets.length > 0 ? (
                  assessment.assets.map((asset) => (
                    <div
                      key={asset.id}
                      className="p-2.5 rounded-xl bg-white/90 border border-amber-300 flex items-center justify-between font-medium"
                    >
                      <span className="text-zinc-700 truncate pr-2">{asset.name || asset.category}:</span>
                      <span className="font-bold text-zinc-900">{formatCurrency(parseNum(asset.currentValue), currency)}</span>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 rounded-xl bg-white/60 text-zinc-500 italic text-center">
                    No extra investment assets recorded
                  </div>
                )}
              </div>
            </div>

            {/* Right Card: Liabilities (Soft Lavender/Purple Background, Solid Black Border) */}
            <div className="rounded-2xl bg-[#ede9fe] border-2 border-zinc-900 p-5 sm:p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.9)] space-y-4 min-h-[220px]">
              <div className="flex items-center justify-between gap-3 border-b border-purple-300/80 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-950" />
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
                    Liabilities
                  </h3>
                </div>
                <div className="text-xl sm:text-2xl font-black text-purple-950">
                  {formatCurrency(totalLiabilities, currency)}
                </div>
              </div>

              {/* Liabilities breakdown list */}
              <div className="space-y-2 text-xs">
                {assessment.hasLoans && assessment.loans.length > 0 ? (
                  assessment.loans.map((loan) => (
                    <div
                      key={loan.id}
                      className="p-2.5 rounded-xl bg-white/90 border border-purple-300 flex items-center justify-between font-medium"
                    >
                      <span className="text-zinc-700 truncate pr-2">
                        {loan.customName || loan.type.replace('_', ' ')}:
                      </span>
                      <div className="text-right">
                        <span className="font-bold text-zinc-900 block">{formatCurrency(parseNum(loan.principal), currency)}</span>
                        <span className="text-[10px] text-zinc-500">{formatCurrency(parseNum(loan.monthlyEmi), currency)}/mo</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 rounded-xl bg-white/70 border border-purple-200 text-center space-y-1">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <div className="font-bold text-zinc-900">Zero Outstanding Debt!</div>
                    <div className="text-[11px] text-zinc-500">
                      Your balance sheet is completely free from debt encumbrances.
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* ACCOUNTING EQUATION SUMMARY & PROOF CARD */}
        <div className="p-6 rounded-2xl bg-zinc-900 text-white space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                Accounting Equation Proof
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Perfect Balance Verified</span>
            </div>
          </div>

          {/* Equation Formula Display */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center text-center">
            
            {/* Assets */}
            <div className="p-3.5 rounded-xl bg-zinc-800/90 border border-zinc-700 space-y-0.5">
              <span className="text-[11px] font-semibold text-amber-300 uppercase">Assets</span>
              <div className="text-lg font-black text-white">{formatCurrency(totalAssets, currency)}</div>
              <span className="text-[10px] text-zinc-400">Total Holdings</span>
            </div>

            <div className="text-xl font-black text-zinc-500 hidden md:block">=</div>

            {/* Liabilities */}
            <div className="p-3.5 rounded-xl bg-zinc-800/90 border border-zinc-700 space-y-0.5">
              <span className="text-[11px] font-semibold text-purple-300 uppercase">Liabilities</span>
              <div className="text-lg font-black text-white">{formatCurrency(totalLiabilities, currency)}</div>
              <span className="text-[10px] text-zinc-400">Total Borrowings</span>
            </div>

            <div className="text-xl font-black text-zinc-500 hidden md:block">+</div>

            {/* Net Equity */}
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-600/50 space-y-0.5">
              <span className="text-[11px] font-semibold text-emerald-300 uppercase">Net Equity</span>
              <div className="text-lg font-black text-emerald-400">{formatCurrency(netEquity, currency)}</div>
              <span className="text-[10px] text-emerald-200/70">True Wealth</span>
            </div>

          </div>

          <p className="text-xs text-zinc-400 text-center pt-1 leading-relaxed">
            Every Rupee of monthly surplus you retain increases your Net Equity by either purchasing productive investments (Assets) or accelerating debt payoff (Liabilities reduction).
          </p>
        </div>

      </div>

    </div>
  );
};
