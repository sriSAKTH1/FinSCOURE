'use client';

import React, { useState } from 'react';
import { AssessmentData } from '@/types/assessment';
import { FinScoreResult } from '@/types/score';
import { formatCurrency, parseNum } from '@/utils/calculations';
import {
  ArrowDown,
  CheckCircle2,
  Scale,
  Wallet,
  Receipt,
  Building2,
  CreditCard,
  Sparkles,
  Eye,
  EyeOff
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

  // Eye toggle state: default is closed (false)
  const [showDetails, setShowDetails] = useState<boolean>(false);

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
  const isZeroDebt = totalLiabilities === 0;

  // 5. Net Equity (Accounting Equation: Net Equity = Assets - Liabilities)
  const netEquity = totalAssets - totalLiabilities;
  const isSolvent = netEquity >= 0;
  const debtToAssetPct = totalAssets > 0 ? Math.round((totalLiabilities / totalAssets) * 100) : 0;

  // 6. Proportional Size / Height Calculations
  // Income vs Expenses
  const maxIncExp = Math.max(totalIncome, totalOutflow, 1);
  const incomeRatio = totalIncome / maxIncExp;
  const expenseRatio = totalOutflow / maxIncExp;
  // Dynamic min-heights: larger amount has longer card (up to 320px)
  const incomeMinHeight = Math.round(190 + incomeRatio * 110);
  const expenseMinHeight = Math.round(190 + expenseRatio * 110);

  // Assets vs Liabilities
  const maxAssetLiab = Math.max(totalAssets, totalLiabilities, 1);
  const assetRatio = totalAssets / maxAssetLiab;
  const liabRatio = totalLiabilities / maxAssetLiab;
  // If zero debt: liability is compact lite (140px), assets is proudly large (280px)
  const assetMinHeight = isZeroDebt ? 280 : Math.round(190 + assetRatio * 130);
  const liabMinHeight = isZeroDebt ? 140 : Math.round(190 + liabRatio * 130);

  const categoryLabels: Record<string, string> = {
    stocks: 'Stocks (Direct Equity)',
    mf: 'Mutual Funds (SIP)',
    stocks_mf: 'Stocks & Mutual Funds',
    gold: 'Gold / Other',
    gold_other: 'Gold / Other',
    fixed_deposits: 'Fixed Deposits',
    epf_ppf_nps: 'EPF / PPF / NPS',
    real_estate: 'Real Estate',
    cash_bank: 'Cash & Bank Balances',
    crypto_alt: 'Crypto & Alternatives',
    other: 'Other Assets',
  };

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

        {/* Global Eye Toggle Button & Net Equity Badge */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
          {/* Eye Toggle Button (Default Closed) */}
          <button
            type="button"
            onClick={() => setShowDetails((prev) => !prev)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all shadow-2xs cursor-pointer select-none ${showDetails
                ? 'bg-[#eaf5ef] text-[#1b4d3e] border-[#b7dfcb] hover:bg-[#d8efe2]'
                : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
              }`}
            title={showDetails ? 'Hide item breakdown' : 'Show item breakdown'}
          >
            {showDetails ? (
              <>
                <Eye className="w-4 h-4 text-[#1b4d3e]" />
                <span>Hide Details</span>
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 text-zinc-500" />
                <span>Show Details</span>
              </>
            )}
          </button>

          {/* Live Equation Net Equity Badge */}
          <div className="p-3.5 px-4 rounded-2xl bg-zinc-50 border border-zinc-200 shrink-0">
            <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Personal Net Equity
            </div>
            <div className={`text-lg sm:text-xl font-black mt-0.5 ${isSolvent ? 'text-[#1b4d3e]' : 'text-rose-600'}`}>
              {formatCurrency(netEquity, currency)}
            </div>
          </div>
        </div>
      </div>

      {/* DIAGRAM CONTAINER */}
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ========================================================= */}
        {/* SECTION 1: INCOME STATEMENT (SIDE-BY-SIDE WITH PROPORTIONS) */}
        {/* ========================================================= */}
        <div className="space-y-4">
          {/* Section Pill Badge Header with Eye Toggle */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-6 py-1.5 rounded-xl bg-[#dbeafe] text-[#1e3a8a] border-2 border-[#93c5fd] font-black text-xs sm:text-sm tracking-wide uppercase shadow-xs">
              <span>INCOME STATEMENT</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-800 flex items-center gap-1.5 cursor-pointer"
            >
              {showDetails ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showDetails ? 'Hide breakdown' : 'Show breakdown'}</span>
            </button>
          </div>

          {/* Side-by-Side: Income (Left) vs Expenses (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

            {/* 1. Income Card (Light Green Background, Proportional Height) */}
            <div
              style={{ minHeight: `${incomeMinHeight}px` }}
              className="rounded-2xl bg-[#dcfce7] border-2 border-zinc-900 p-5 sm:p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-emerald-300/80">
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

                {/* Sub-items: When Closed: Hide name & amount. When Open: Show just in list, not a box */}
                {!showDetails ? (
                  <div className="py-4 text-[11px] font-semibold text-emerald-900/60 flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Breakdown hidden (click Eye to view)</span>
                  </div>
                ) : (
                  <div className="divide-y divide-emerald-800/15 pt-2 text-xs">
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-zinc-800 font-medium">Take-home salary</span>
                      <span className="font-extrabold text-zinc-950">{formatCurrency(monthlySalary, currency)}</span>
                    </div>
                    {freelance > 0 && (
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-zinc-800 font-medium">Freelance / Consulting</span>
                        <span className="font-extrabold text-zinc-950">{formatCurrency(freelance, currency)}</span>
                      </div>
                    )}
                    {business > 0 && (
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-zinc-800 font-medium">Business profits</span>
                        <span className="font-extrabold text-zinc-950">{formatCurrency(business, currency)}</span>
                      </div>
                    )}
                    {rental > 0 && (
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-zinc-800 font-medium">Rental income</span>
                        <span className="font-extrabold text-zinc-950">{formatCurrency(rental, currency)}</span>
                      </div>
                    )}
                    {dividends > 0 && (
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-zinc-800 font-medium">Dividends & interest</span>
                        <span className="font-extrabold text-zinc-950">{formatCurrency(dividends, currency)}</span>
                      </div>
                    )}
                    {otherIncome > 0 && (
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-zinc-800 font-medium">Other monthly income</span>
                        <span className="font-extrabold text-zinc-950">{formatCurrency(otherIncome, currency)}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Proportional visual badge */}
              <div className="pt-3 border-t border-emerald-300/60 text-[11px] font-bold text-emerald-900/80 flex items-center justify-between">
                <span>Inflow Capacity</span>
                <span>{Math.round(incomeRatio * 100)}% Relative Volume</span>
              </div>
            </div>

            {/* 2. Expenses Card (Soft Pink Background, Proportional Height) */}
            <div
              style={{ minHeight: `${expenseMinHeight}px` }}
              className="rounded-2xl bg-[#fee2e2] border-2 border-zinc-900 p-5 sm:p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex flex-col justify-between transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-3 pb-3 border-b border-rose-300/80">
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

                {/* Sub-items: When Closed: Hide name & amount. When Open: Show just in list, not a box */}
                {!showDetails ? (
                  <div className="py-4 text-[11px] font-semibold text-rose-900/60 flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Breakdown hidden (click Eye to view)</span>
                  </div>
                ) : (
                  <div className="divide-y divide-rose-800/15 pt-2 text-xs">
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-zinc-800 font-medium">Living & household costs</span>
                      <span className="font-extrabold text-zinc-950">{formatCurrency(livingCosts, currency)}</span>
                    </div>
                    {emiOutflow > 0 && (
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-zinc-800 font-medium">Debt EMIs & interest</span>
                        <span className="font-extrabold text-rose-700">{formatCurrency(emiOutflow, currency)}</span>
                      </div>
                    )}
                    {assessment.customExpenses && assessment.customExpenses.length > 0 && (
                      <div className="py-2 flex items-center justify-between">
                        <span className="text-zinc-800 font-medium">Custom tracked expenses</span>
                        <span className="font-bold text-zinc-700">{assessment.customExpenses.length} items</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Proportional visual badge */}
              <div className="pt-3 border-t border-rose-300/60 text-[11px] font-bold text-rose-900/80 flex items-center justify-between">
                <span>Outflow Drain</span>
                <span>{Math.round(expenseRatio * 100)}% Relative Volume</span>
              </div>
            </div>

          </div>

          {/* Cashflow Flow Indicator (Surplus into Assets) */}
          <div className="flex flex-col items-center justify-center gap-1 py-1 text-center">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-zinc-950 text-white text-xs sm:text-sm font-black shadow-md border border-zinc-800">
              <span>Monthly Net Surplus: {formatCurrency(netMonthlySurplus, currency)}</span>
              <ArrowDown className="w-4 h-4 text-emerald-400 animate-bounce" />
            </div>
            <span className="text-[11px] text-zinc-500 font-medium">
              {netMonthlySurplus >= 0
                ? 'Surplus flows directly into building your Asset base below'
                : 'Deficit drains liquid reserves and accumulates liabilities below'}
            </span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: BALANCE SHEET (SIDE-BY-SIDE WITH PROPORTIONS)  */}
        {/* ========================================================= */}
        <div className="space-y-4">
          {/* Section Pill Badge Header with Eye Toggle */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 px-6 py-1.5 rounded-xl bg-[#dbeafe] text-[#1e3a8a] border-2 border-[#93c5fd] font-black text-xs sm:text-sm tracking-wide uppercase shadow-xs">
              <span>BALANCE SHEET</span>
            </div>
            <button
              type="button"
              onClick={() => setShowDetails((prev) => !prev)}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-800 flex items-center gap-1.5 cursor-pointer"
            >
              {showDetails ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showDetails ? 'Hide breakdown' : 'Show breakdown'}</span>
            </button>
          </div>

          {/* Side-by-Side: Assets (Left) vs Liabilities (Right) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">

            {/* 1. Left Card: Assets (Soft Cream/Yellow Background, Proportional Height) */}
            <div
              style={{ minHeight: `${assetMinHeight}px` }}
              className="rounded-2xl bg-[#fef3c7] border-2 border-zinc-900 p-5 sm:p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex flex-col justify-between transition-all"
            >
              <div>
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

                {/* Sub-items: When Closed: Hide name & amount. When Open: Show just in list, not a box */}
                {!showDetails ? (
                  <div className="py-4 text-[11px] font-semibold text-amber-900/60 flex items-center gap-1.5">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Breakdown hidden (click Eye to view)</span>
                  </div>
                ) : (
                  <div className="divide-y divide-amber-800/15 pt-2 text-xs">
                    <div className="py-2 flex items-center justify-between">
                      <span className="text-zinc-800 font-medium">Liquid Emergency Buffer</span>
                      <span className="font-extrabold text-zinc-950">{formatCurrency(liquidEmergency, currency)}</span>
                    </div>

                    {assessment.assets.length > 0 ? (
                      assessment.assets.map((asset) => {
                        const label = asset.name || categoryLabels[asset.category] || asset.category;
                        return (
                          <div key={asset.id} className="py-2 flex items-center justify-between">
                            <span className="text-zinc-800 font-medium truncate pr-2">{label}</span>
                            <span className="font-extrabold text-zinc-950 shrink-0">
                              {formatCurrency(parseNum(asset.currentValue), currency)}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-2 text-zinc-500 italic text-center">
                        No extra investment assets recorded
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Proportional visual badge */}
              <div className="pt-3 border-t border-amber-300/60 text-[11px] font-bold text-amber-900/80 flex items-center justify-between">
                <span>Wealth Foundation</span>
                <span>{totalAssets > totalLiabilities ? 'Dominant Holding' : `${Math.round(assetRatio * 100)}% Relative`}</span>
              </div>
            </div>

            {/* 2. Right Card: Liabilities (Lite style & ZERO DEBT when 0, or Purple Card when > 0) */}
            {isZeroDebt ? (
              /* LITE ZERO DEBT CARD */
              <div
                style={{ minHeight: `${liabMinHeight}px` }}
                className="rounded-2xl bg-[#f0fdf4] border-2 border-dashed border-emerald-400 p-5 sm:p-6 shadow-none flex flex-col justify-between transition-all"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 border-b border-emerald-200 pb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-emerald-800" />
                      <h3 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
                        Liabilities
                      </h3>
                    </div>
                    <div className="text-xl sm:text-2xl font-black text-emerald-950">
                      {formatCurrency(0, currency)}
                    </div>
                  </div>

                  {/* PROMINENT ZERO DEBT HIGHLIGHT */}
                  <div className="flex flex-col items-center justify-center py-4 text-center space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs sm:text-sm tracking-wider shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                      <span>ZERO DEBT</span>
                    </div>
                    <p className="text-xs font-bold text-emerald-900">
                      100% Debt-Free Balance Sheet
                    </p>
                    <span className="text-[11px] text-emerald-700/80">
                      Zero loans, zero credit card dues, zero EMIs.
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200 text-[11px] font-bold text-emerald-800 flex items-center justify-between">
                  <span>Liabilities Exposure</span>
                  <span className="text-emerald-700">0% of Assets</span>
                </div>
              </div>
            ) : (
              /* ACTIVE LIABILITIES CARD (PROPORTIONAL HEIGHT) */
              <div
                style={{ minHeight: `${liabMinHeight}px` }}
                className="rounded-2xl bg-[#ede9fe] border-2 border-zinc-900 p-5 sm:p-6 shadow-[3px_3px_0px_rgba(0,0,0,0.9)] flex flex-col justify-between transition-all"
              >
                <div>
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

                  {/* Sub-items: When Closed: Hide name & amount. When Open: Show just in list, not a box */}
                  {!showDetails ? (
                    <div className="py-4 text-[11px] font-semibold text-purple-900/60 flex items-center gap-1.5">
                      <EyeOff className="w-3.5 h-3.5" />
                      <span>Breakdown hidden (click Eye to view)</span>
                    </div>
                  ) : (
                    <div className="divide-y divide-purple-800/15 pt-2 text-xs">
                      {assessment.loans.map((loan) => (
                        <div key={loan.id} className="py-2 flex items-center justify-between">
                          <span className="text-zinc-800 font-medium truncate pr-2">
                            {loan.customName || loan.type.replace('_', ' ')}
                          </span>
                          <div className="text-right shrink-0">
                            <span className="font-extrabold text-zinc-950 block">
                              {formatCurrency(parseNum(loan.principal), currency)}
                            </span>
                            <span className="text-[10px] text-purple-800">
                              {formatCurrency(parseNum(loan.monthlyEmi), currency)}/mo
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Proportional visual badge */}
                <div className="pt-3 border-t border-purple-300/60 text-[11px] font-bold text-purple-900/80 flex items-center justify-between">
                  <span>Debt-to-Assets</span>
                  <span>{debtToAssetPct}% Encumbered</span>
                </div>
              </div>
            )}

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
              <span className="text-[10px] text-zinc-400">{isZeroDebt ? 'Zero Borrowings' : 'Total Borrowings'}</span>
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
