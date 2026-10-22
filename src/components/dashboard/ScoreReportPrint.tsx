'use client';

import React from 'react';
import { AssessmentData } from '@/types/assessment';
import { FinScoreResult } from '@/types/score';
import { formatCurrency, parseNum } from '@/utils/calculations';
import { 
  ShieldCheck, 
  Target, 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Sparkles,
  Award
} from 'lucide-react';

interface ScoreReportPrintProps {
  assessment: AssessmentData;
  scoreResult: FinScoreResult;
  hiddenGoalIds?: Set<string>;
}

export const ScoreReportPrint: React.FC<ScoreReportPrintProps> = ({
  assessment,
  scoreResult,
  hiddenGoalIds = new Set(),
}) => {
  const { totalScore, grade, gradeTitle, gradeDescription, pillarScores, swot, recommendations, metrics, currency } = scoreResult;
  const p = pillarScores;
  const curr = currency;

  // Personal Balance Sheet calculations
  const totalIncome = p.savingsHealth.monthlyIncome || 0;
  const livingCosts = p.savingsHealth.monthlyExpenses || 0;
  const emiOutflow = p.debtHealth.totalMonthlyEmi || 0;
  const totalOutflow = livingCosts + emiOutflow;
  const netMonthlySurplus = totalIncome - totalOutflow;

  const liquidEmergency = parseNum(assessment.emergencyFund.liquidSavings);
  const investmentsTotal = assessment.assets.reduce((sum, a) => sum + parseNum(a.currentValue), 0);
  const totalAssets = liquidEmergency + investmentsTotal;
  const totalLiabilities = p.debtHealth.totalDebtPrincipal || 0;
  const netEquity = totalAssets - totalLiabilities;
  const isZeroDebt = totalLiabilities === 0;

  // Active Milestone goals
  const activeGoals = (metrics.goalsAnalysis || []).filter((g) => !hiddenGoalIds.has(g.goalId));
  const totalActiveRequiredMonthly = activeGoals.reduce((sum, g) => sum + g.monthlyRequired, 0);
  const totalActiveTargetAmount = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);

  // Formatted date
  const reportDate = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const clientName = assessment.personal.firstName?.trim() || 'Client';

  return (
    <div className="hidden print:block w-full bg-white text-zinc-900 font-sans text-xs">
      
      {/* ========================================================================= */}
      {/* PAGE 1: EXECUTIVE SCORE & 4 PILLARS BREAKDOWN                             */}
      {/* ========================================================================= */}
      <div className="pdf-page flex flex-col justify-between min-h-[268mm] max-h-[275mm] p-2 space-y-4">
        <div className="space-y-4">
          
          {/* TOP HEADER: LOGO WITH NAME IN ALL PAGES */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#1b4d3e]">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="FinScore Logo"
                className="h-9 w-auto object-contain"
              />
              <div>
                <div className="text-sm font-black text-zinc-950 tracking-tight flex items-center gap-1.5">
                  <span>FinScore</span>
                  <span className="text-[10px] font-semibold text-zinc-400">|</span>
                  <span className="text-[11px] font-bold text-[#1b4d3e]">Fix Your Finances With Me !</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium">
                  FINANCIAL HEALTH ASSESSMENT · Generated {reportDate} · Educational Diagnostic
                </p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="px-2.5 py-0.5 rounded-md bg-[#eaf5ef] border border-[#b7dfcb] text-[#1b4d3e] font-black text-[10px] tracking-wide uppercase">
                Part I: Executive Diagnostic
              </span>
              <span className="text-[10px] text-zinc-500 font-bold mt-0.5">Page 1 of 3</span>
            </div>
          </div>

          {/* MAIN SCORE & VERDICT CARD (EXACT WEBSITE GREEN PALETTE) */}
          <div className="rounded-2xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
            <div className="grid grid-cols-12 items-stretch">
              {/* Score Left Column (Dark Slate Website Background) */}
              <div className="col-span-3 bg-linear-to-br from-zinc-900 via-zinc-900 to-[#1b4d3e] text-white p-4 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  FinScore
                </span>
                <div className="text-4xl font-black text-white tracking-tighter my-0.5">
                  {totalScore}
                </div>
                <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  OUT OF 100
                </span>
              </div>

              {/* Verdict Right Column */}
              <div className="col-span-9 p-4 bg-zinc-50/60 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#eaf5ef] text-[#1b4d3e] border border-[#b7dfcb] font-extrabold text-[10px] uppercase tracking-wide">
                    Grade {grade} · {gradeTitle}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-semibold">
                    Client: <strong className="text-zinc-800">{clientName}</strong>
                  </span>
                </div>
                <p className="text-[11px] text-zinc-700 font-medium leading-relaxed">
                  {gradeDescription}
                </p>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Evaluates Emergency Runway, Insurance Safety Net, Savings Momentum, and Debt-to-Income Exposure.
                </p>
              </div>
            </div>
          </div>

          {/* 4 CORE VITAL SIGNS (WEBSITE COLOR TINTS) */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-[#eaf5ef] border border-[#b7dfcb] space-y-0.5">
              <span className="text-[10px] font-bold text-[#1b4d3e] uppercase tracking-wider">
                Emergency Runway
              </span>
              <div className="text-lg font-black text-[#1b4d3e]">
                {p.emergencyFund.coverageMonths} mo
              </div>
              <div className="text-[9px] text-emerald-800 font-semibold">
                Target: {p.emergencyFund.targetMonths} months
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#eaf5ef] border border-[#b7dfcb] space-y-0.5">
              <span className="text-[10px] font-bold text-[#1b4d3e] uppercase tracking-wider">
                Savings Rate
              </span>
              <div className="text-lg font-black text-[#1b4d3e]">
                {p.savingsHealth.savingsRate}%
              </div>
              <div className="text-[9px] text-emerald-800 font-semibold">
                Benchmark: 20%+
              </div>
            </div>

            <div className={`p-3 rounded-xl border space-y-0.5 ${p.debtHealth.emiToIncomeRatio <= 20 ? 'bg-[#eaf5ef] border-[#b7dfcb] text-[#1b4d3e]' : p.debtHealth.emiToIncomeRatio <= 40 ? 'bg-amber-50 border-amber-200 text-amber-900' : 'bg-rose-50 border-rose-200 text-rose-900'}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider">
                EMI-to-Income
              </span>
              <div className="text-lg font-black">
                {p.debtHealth.emiToIncomeRatio}%
              </div>
              <div className="text-[9px] font-semibold opacity-80">
                Safe Guide: &le; 20%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-100/90 border border-zinc-200 space-y-0.5">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                Estimated Net Worth
              </span>
              <div className="text-lg font-black text-zinc-950">
                {formatCurrency(metrics.totalNetWorth, curr)}
              </div>
              <div className="text-[9px] text-zinc-500 font-semibold">
                {assessment.assets.length} Assets · {isZeroDebt ? 'Zero Debt' : formatCurrency(totalLiabilities, curr)}
              </div>
            </div>
          </div>

          {/* 100-POINT PILLAR BREAKDOWN TABLE */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-[#1b4d3e]" />
                Pillar Breakdown · 100 Points Total (25 Pts Per Pillar)
              </h3>
              <span className="text-[10px] text-zinc-400 font-semibold">Diagnostic Sub-Scores</span>
            </div>

            <div className="rounded-xl border border-zinc-200 overflow-hidden">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-[#1b4d3e] text-white font-bold text-[10px] uppercase">
                    <th className="py-2 px-3 w-1/4">Pillar</th>
                    <th className="py-2 px-2.5 w-16 text-center">Score</th>
                    <th className="py-2 px-3 w-5/12">Key Diagnostic Metrics</th>
                    <th className="py-2 px-3 w-1/3">Strategic Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {/* Row 1: Emergency Fund */}
                  <tr className="hover:bg-zinc-50">
                    <td className="py-2.5 px-3 font-bold text-zinc-900 align-top">
                      1. Emergency Fund
                    </td>
                    <td className="py-2.5 px-2.5 text-center align-top">
                      <span className="font-extrabold px-1.5 py-0.5 rounded-md bg-[#eaf5ef] text-[#1b4d3e] border border-[#b7dfcb]">
                        {p.emergencyFund.score} / 25
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700 leading-tight align-top">
                      <div>Coverage: <strong>{p.emergencyFund.coverageMonths} months</strong></div>
                      <div>Target Fund: {formatCurrency(p.emergencyFund.targetAmount, curr)}</div>
                      <div>Shortfall: {p.emergencyFund.shortfall === 0 ? 'Zero (Fully funded)' : formatCurrency(p.emergencyFund.shortfall, curr)}</div>
                      <div>Accessibility: {p.emergencyFund.accessibilityScore}/5 pts</div>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 text-[10px] leading-relaxed align-top">
                      {p.emergencyFund.shortfall > 0
                        ? `Save ${formatCurrency(p.emergencyFund.recommendedMonthlySavings, curr)}/month in liquid deposits to reach a 6-month buffer.`
                        : 'Emergency fund is fully funded! Maintain in high-liquidity accounts.'}
                    </td>
                  </tr>

                  {/* Row 2: Insurance Protection */}
                  <tr className="bg-zinc-50/50 hover:bg-zinc-50">
                    <td className="py-2.5 px-3 font-bold text-zinc-900 align-top">
                      2. Insurance Protection
                    </td>
                    <td className="py-2.5 px-2.5 text-center align-top">
                      <span className="font-extrabold px-1.5 py-0.5 rounded-md bg-[#eaf5ef] text-[#1b4d3e] border border-[#b7dfcb]">
                        {p.insuranceProtection.score} / 25
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700 leading-tight align-top">
                      <div>Health Adequacy: {p.insuranceProtection.healthScore}/15 pts</div>
                      <div>Life Adequacy: {p.insuranceProtection.lifeScore}/10 pts</div>
                      <div>Health Sum Insured: {formatCurrency(p.insuranceProtection.healthSumInsured, curr)}</div>
                      <div>Life Cover Sum: {formatCurrency(p.insuranceProtection.lifeSumAssured, curr)}</div>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 text-[10px] leading-relaxed align-top">
                      {p.insuranceProtection.protectionGaps.length > 0
                        ? p.insuranceProtection.protectionGaps[0]
                        : 'Full insurance pillar score achieved based on entered policies.'}
                    </td>
                  </tr>

                  {/* Row 3: Savings Health */}
                  <tr className="hover:bg-zinc-50">
                    <td className="py-2.5 px-3 font-bold text-zinc-900 align-top">
                      3. Savings Health
                    </td>
                    <td className="py-2.5 px-2.5 text-center align-top">
                      <span className="font-extrabold px-1.5 py-0.5 rounded-md bg-[#eaf5ef] text-[#1b4d3e] border border-[#b7dfcb]">
                        {p.savingsHealth.score} / 25
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700 leading-tight align-top">
                      <div>Monthly Income: {formatCurrency(p.savingsHealth.monthlyIncome, curr)}</div>
                      <div>Monthly Outflows: {formatCurrency(p.savingsHealth.monthlyExpenses, curr)}</div>
                      <div>Monthly Surplus: {formatCurrency(p.savingsHealth.monthlySurplus, curr)}</div>
                      <div>Savings Rate: <strong>{p.savingsHealth.savingsRate}%</strong></div>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 text-[10px] leading-relaxed align-top">
                      20% savings target: {formatCurrency(p.savingsHealth.targetMonthlySavings, curr)}/mo. Channel surplus systematically into diversified investments.
                    </td>
                  </tr>

                  {/* Row 4: Debt Health */}
                  <tr className="bg-zinc-50/50 hover:bg-zinc-50">
                    <td className="py-2.5 px-3 font-bold text-zinc-900 align-top">
                      4. Debt Health
                    </td>
                    <td className="py-2.5 px-2.5 text-center align-top">
                      <span className="font-extrabold px-1.5 py-0.5 rounded-md bg-[#eaf5ef] text-[#1b4d3e] border border-[#b7dfcb]">
                        {p.debtHealth.score} / 25
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-700 leading-tight align-top">
                      <div>EMI-to-Income: {p.debtHealth.emiToIncomeRatio}% (Score: {p.debtHealth.emiScore}/10)</div>
                      <div>High-Interest Balance: {formatCurrency(p.debtHealth.highInterestDebt, curr)}</div>
                      <div>Total Debt: {formatCurrency(p.debtHealth.totalDebtPrincipal, curr)}</div>
                      <div>Monthly EMIs: {formatCurrency(p.debtHealth.totalMonthlyEmi, curr)}/mo</div>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-600 text-[10px] leading-relaxed align-top">
                      {isZeroDebt
                        ? 'Status: Debt-Free based on entered data. Keep credit-card balances cleared monthly.'
                        : 'Maintain on-time EMI repayments and clear high-interest loans first.'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-[9px] text-zinc-400 italic">
              Scores and recommendations are educational estimates based on entered information, not an official credit bureau rating.
            </p>
          </div>
        </div>

        {/* PAGE 1 FOOTER */}
        <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500">
          <div>
            <strong className="text-zinc-800">FINSCORE</strong> | Financial Health Assessment
          </div>
          <div className="font-bold text-zinc-700">
            Page 1 of 3
          </div>
        </div>
      </div>

      {/* HARD PAGE BREAK AFTER PAGE 1 */}
      <div className="pdf-page-break" />

      {/* ========================================================================= */}
      {/* PAGE 2: FINANCIAL POSITION & BALANCE SHEET DIAGNOSTICS                    */}
      {/* ========================================================================= */}
      <div className="pdf-page flex flex-col justify-between min-h-[268mm] max-h-[275mm] p-2 space-y-4">
        <div className="space-y-4">
          
          {/* TOP HEADER: LOGO WITH NAME IN ALL PAGES */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#1b4d3e]">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="FinScore Logo"
                className="h-9 w-auto object-contain"
              />
              <div>
                <div className="text-sm font-black text-zinc-950 tracking-tight flex items-center gap-1.5">
                  <span>FinScore</span>
                  <span className="text-[10px] font-semibold text-zinc-400">|</span>
                  <span className="text-[11px] font-bold text-[#1b4d3e]">Fix Your Finances With Me !</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium">
                  FINANCIAL POSITION & PROGRESS · Cash Flow, Balance Sheet & Milestone Goals
                </p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="px-2.5 py-0.5 rounded-md bg-[#eaf5ef] border border-[#b7dfcb] text-[#1b4d3e] font-black text-[10px] tracking-wide uppercase">
                Part II: Balance Sheet & Analytics
              </span>
              <span className="text-[10px] text-zinc-500 font-bold mt-0.5">Page 2 of 3</span>
            </div>
          </div>

          {/* 4 CASH FLOW VITAL CARDS (EXACT WEBSITE GREEN / RED / MINT THEME) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              Personal Balance Sheet & Cash Flow Overview
            </span>
            <div className="grid grid-cols-4 gap-3">
              {/* Income */}
              <div className="p-3 rounded-xl bg-[#dcfce7] border border-emerald-300 space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-900 uppercase tracking-wide">
                  Monthly Income
                </span>
                <div className="text-base font-black text-emerald-950">
                  {formatCurrency(totalIncome, curr)}
                </div>
                <span className="text-[9px] text-emerald-800 font-semibold">100% Inflow</span>
              </div>

              {/* Expenses */}
              <div className="p-3 rounded-xl bg-[#fee2e2] border border-rose-300 space-y-0.5">
                <span className="text-[10px] font-bold text-rose-900 uppercase tracking-wide">
                  Monthly Expenses
                </span>
                <div className="text-base font-black text-rose-950">
                  {formatCurrency(totalOutflow, curr)}
                </div>
                <span className="text-[9px] text-rose-800 font-semibold">
                  {totalIncome > 0 ? Math.round((totalOutflow / totalIncome) * 100) : 0}% Outflow
                </span>
              </div>

              {/* Surplus */}
              <div className="p-3 rounded-xl bg-[#eaf5ef] border border-[#b7dfcb] space-y-0.5">
                <span className="text-[10px] font-bold text-[#1b4d3e] uppercase tracking-wide">
                  Monthly Surplus
                </span>
                <div className="text-base font-black text-[#1b4d3e]">
                  {formatCurrency(netMonthlySurplus, curr)}
                </div>
                <span className="text-[9px] text-emerald-800 font-semibold">Surplus Builds Assets</span>
              </div>

              {/* Net Equity */}
              <div className="p-3 rounded-xl bg-zinc-100 border border-zinc-200 space-y-0.5">
                <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wide">
                  Personal Net Equity
                </span>
                <div className="text-base font-black text-zinc-950">
                  {formatCurrency(netEquity, curr)}
                </div>
                <span className="text-[9px] text-zinc-600 font-semibold">Assets − Liabilities</span>
              </div>
            </div>
          </div>

          {/* BALANCE SHEET COMPARISON & PROPORTIONAL BARS */}
          <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-zinc-900 uppercase tracking-wider text-[10px]">
                Balance Sheet Holdings Comparison
              </span>
              <span className="text-[10px] font-semibold text-[#1b4d3e] bg-[#eaf5ef] px-2 py-0.5 rounded border border-[#b7dfcb]">
                Accounting Equation: Assets = Liabilities + Net Equity
              </span>
            </div>

            {/* Assets Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-blue-900">Total Assets</span>
                <span className="text-blue-900">{formatCurrency(totalAssets, curr)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-blue-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Liabilities Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-purple-900">Total Liabilities</span>
                <span className="text-purple-900">
                  {isZeroDebt ? '₹0 (Zero Debt)' : formatCurrency(totalLiabilities, curr)}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-purple-100 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: totalAssets > 0 ? `${Math.min(100, Math.round((totalLiabilities / totalAssets) * 100))}%` : '0%' }}
                />
              </div>
            </div>

            {/* Net Worth Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] font-bold">
                <span className="text-emerald-900">Net Worth</span>
                <span className="text-emerald-900">{formatCurrency(netEquity, curr)}</span>
              </div>
              <div className="w-full h-3 rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full bg-[#1b4d3e] rounded-full"
                  style={{ width: totalAssets > 0 ? `${Math.min(100, Math.max(5, Math.round((netEquity / totalAssets) * 100)))}%` : '100%' }}
                />
              </div>
            </div>
          </div>

          {/* BALANCE SHEET BREAKDOWN TABLE */}
          <div className="rounded-xl border border-zinc-200 overflow-hidden">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="bg-[#1b4d3e] text-white font-bold text-[10px] uppercase">
                  <th className="py-1.5 px-3 w-1/4">Balance Sheet</th>
                  <th className="py-1.5 px-3 w-1/4">Amount</th>
                  <th className="py-1.5 px-3 w-1/2">Interpretation & Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                <tr className="hover:bg-zinc-50">
                  <td className="py-1.5 px-3 font-bold text-zinc-900">Assets</td>
                  <td className="py-1.5 px-3 font-bold text-blue-900">{formatCurrency(totalAssets, curr)}</td>
                  <td className="py-1.5 px-3 text-zinc-600">Total productive holdings entered in assessment</td>
                </tr>
                <tr className="bg-zinc-50/50 hover:bg-zinc-50">
                  <td className="py-1.5 px-3 font-bold text-zinc-900">Liabilities</td>
                  <td className="py-1.5 px-3 font-bold text-purple-900">{formatCurrency(totalLiabilities, curr)}</td>
                  <td className="py-1.5 px-3 text-zinc-600">{isZeroDebt ? 'Zero loans, credit card dues, or EMIs reported' : 'Active borrowings being serviced'}</td>
                </tr>
                <tr className="hover:bg-zinc-50">
                  <td className="py-1.5 px-3 font-bold text-zinc-900">Net Equity</td>
                  <td className="py-1.5 px-3 font-bold text-[#1b4d3e]">{formatCurrency(netEquity, curr)}</td>
                  <td className="py-1.5 px-3 text-zinc-600">Assets − liabilities; accounting equation balances</td>
                </tr>
                <tr className="bg-zinc-50/50 hover:bg-zinc-50">
                  <td className="py-1.5 px-3 font-bold text-zinc-900">Liabilities Exposure</td>
                  <td className="py-1.5 px-3 font-bold text-zinc-900">
                    {totalAssets > 0 ? Math.round((totalLiabilities / totalAssets) * 100) : 0}%
                  </td>
                  <td className="py-1.5 px-3 text-zinc-600">Liabilities as a share of total asset base</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SCORE ANALYTICS & MILESTONE GOALS */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between pb-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-[#1b4d3e]" />
                Milestone Goals Trajectory ({activeGoals.length} Active Goals)
              </h3>
              <span className="text-[10px] font-bold text-[#1b4d3e]">
                Required Total: {formatCurrency(totalActiveRequiredMonthly, curr)}/mo
              </span>
            </div>

            {activeGoals.length > 0 ? (
              <div className="rounded-xl border border-zinc-200 overflow-hidden">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-[#1b4d3e] text-white font-bold text-[10px] uppercase">
                      <th className="py-1.5 px-3">Goal</th>
                      <th className="py-1.5 px-2.5">Target</th>
                      <th className="py-1.5 px-2.5">Year</th>
                      <th className="py-1.5 px-2.5">Required /mo</th>
                      <th className="py-1.5 px-2.5">Current /mo</th>
                      <th className="py-1.5 px-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {activeGoals.map((g) => (
                      <tr key={g.goalId} className="hover:bg-zinc-50">
                        <td className="py-1.5 px-3 font-bold text-zinc-900">{g.name}</td>
                        <td className="py-1.5 px-2.5 font-semibold text-zinc-800">{formatCurrency(g.targetAmount, curr)}</td>
                        <td className="py-1.5 px-2.5 text-zinc-600">{g.targetYear} ({g.yearsRemaining}y)</td>
                        <td className="py-1.5 px-2.5 font-bold text-[#1b4d3e]">{formatCurrency(g.monthlyRequired, curr)}/mo</td>
                        <td className="py-1.5 px-2.5 text-zinc-700">{formatCurrency(g.currentMonthlyContribution, curr)}/mo</td>
                        <td className="py-1.5 px-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${g.onTrack ? 'bg-[#eaf5ef] text-[#1b4d3e] border border-[#b7dfcb]' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                            {g.onTrack ? 'On track' : 'Underfunded'}
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-zinc-100 font-extrabold text-zinc-900 border-t-2 border-zinc-300 text-[10px]">
                      <td className="py-1.5 px-3">Total Active Goals</td>
                      <td className="py-1.5 px-2.5">{formatCurrency(totalActiveTargetAmount, curr)}</td>
                      <td className="py-1.5 px-2.5">—</td>
                      <td className="py-1.5 px-2.5 text-[#1b4d3e]">{formatCurrency(totalActiveRequiredMonthly, curr)}/mo</td>
                      <td className="py-1.5 px-2.5">—</td>
                      <td className="py-1.5 px-2.5 text-center">
                        {activeGoals.filter(g => g.onTrack).length}/{activeGoals.length} On track
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 rounded-xl border border-dashed border-zinc-300 text-center text-zinc-500 text-[10px]">
                No active milestone goals recorded. Add goals in Step 7 to project monthly savings requirements.
              </div>
            )}
          </div>
        </div>

        {/* PAGE 2 FOOTER */}
        <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500">
          <div>
            <strong className="text-zinc-800">FINSCORE</strong> | Financial Health Assessment
          </div>
          <div className="font-bold text-zinc-700">
            Page 2 of 3
          </div>
        </div>
      </div>

      {/* HARD PAGE BREAK AFTER PAGE 2 */}
      <div className="pdf-page-break" />

      {/* ========================================================================= */}
      {/* PAGE 3: STRATEGIC SWOT MATRIX & ACTION PLAN                               */}
      {/* ========================================================================= */}
      <div className="pdf-page flex flex-col justify-between min-h-[268mm] max-h-[275mm] p-2 space-y-4">
        <div className="space-y-4">
          
          {/* TOP HEADER: LOGO WITH NAME IN ALL PAGES */}
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#1b4d3e]">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="FinScore Logo"
                className="h-9 w-auto object-contain"
              />
              <div>
                <div className="text-sm font-black text-zinc-950 tracking-tight flex items-center gap-1.5">
                  <span>FinScore</span>
                  <span className="text-[10px] font-semibold text-zinc-400">|</span>
                  <span className="text-[11px] font-bold text-[#1b4d3e]">Fix Your Finances With Me !</span>
                </div>
                <p className="text-[10px] text-zinc-500 font-medium">
                  STRATEGIC SWOT & ACTION PLAN · Strengths, Weaknesses, Opportunities & Priorities
                </p>
              </div>
            </div>

            <div className="text-right flex flex-col items-end">
              <span className="px-2.5 py-0.5 rounded-md bg-[#eaf5ef] border border-[#b7dfcb] text-[#1b4d3e] font-black text-[10px] tracking-wide uppercase">
                Part III: Strategic Action Plan
              </span>
              <span className="text-[10px] text-zinc-500 font-bold mt-0.5">Page 3 of 3</span>
            </div>
          </div>

          {/* FINANCIAL SWOT ANALYSIS GRID (WEBSITE RICH COLOR THEME) */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#1b4d3e]" />
              Financial SWOT Analysis
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {/* Strengths (Mint Green) */}
              <div className="p-3 rounded-xl bg-[#ecfdf5] border border-emerald-300 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#059669] font-black text-[11px] uppercase tracking-wide">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Strengths</span>
                </div>
                <ul className="space-y-1 text-[10px] text-emerald-950">
                  {swot.strengths.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1 leading-tight">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses (Warm Amber) */}
              <div className="p-3 rounded-xl bg-[#fffbeb] border border-amber-300 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#d97706] font-black text-[11px] uppercase tracking-wide">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Weaknesses</span>
                </div>
                <ul className="space-y-1 text-[10px] text-amber-950">
                  {swot.weaknesses.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1 leading-tight">
                      <span className="text-amber-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunities (Sky Blue) */}
              <div className="p-3 rounded-xl bg-[#f0f9ff] border border-sky-300 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#0284c7] font-black text-[11px] uppercase tracking-wide">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Opportunities</span>
                </div>
                <ul className="space-y-1 text-[10px] text-sky-950">
                  {swot.opportunities.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1 leading-tight">
                      <span className="text-sky-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Threats (Soft Rose) */}
              <div className="p-3 rounded-xl bg-[#fff1f2] border border-rose-300 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#e11d48] font-black text-[11px] uppercase tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Threats</span>
                </div>
                <ul className="space-y-1 text-[10px] text-rose-950">
                  {swot.threats.slice(0, 3).map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1 leading-tight">
                      <span className="text-rose-600 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ACTIONABLE PRIORITIZED RECOMMENDATIONS */}
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-[#1b4d3e]" />
              Actionable Recommendations (Prioritized Implementation)
            </h3>

            <div className="space-y-2">
              {recommendations.slice(0, 3).map((rec, idx) => (
                <div
                  key={rec.id || idx}
                  className="p-3 rounded-xl border border-zinc-200 bg-white shadow-2xs flex items-center justify-between gap-3"
                >
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wide ${
                        rec.priority === 'high'
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : rec.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        Priority {idx + 1} · {rec.priority}
                      </span>
                      <h4 className="text-xs font-bold text-zinc-900">{rec.title}</h4>
                    </div>
                    <p className="text-[10px] text-zinc-600 leading-tight">
                      {rec.action}
                    </p>
                  </div>

                  {rec.estimatedScoreGain && rec.estimatedScoreGain > 0 && (
                    <div className="px-2.5 py-1 rounded-lg bg-[#eaf5ef] border border-[#b7dfcb] text-[#1b4d3e] text-[10px] font-black shrink-0 text-center">
                      +{rec.estimatedScoreGain} pts
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* REGULATORY DISCLAIMER & IMPORTANT NOTE */}
          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[9px] text-zinc-500 space-y-1">
            <span className="font-bold text-zinc-700 uppercase tracking-wider text-[8px] block">
              Important Regulatory Notice & Disclaimer
            </span>
            <p className="leading-relaxed">
              FinScore is an educational diagnostic assessment based entirely on user-provided financial figures. It is not an official credit bureau rating (CIBIL/Experian), SEBI-registered investment advisory, or guarantee of financial return. Users should verify numbers and product terms before making binding financial commitments.
            </p>
          </div>
        </div>

        {/* PAGE 3 FOOTER WITH SIGN-OFF */}
        <div className="pt-2 border-t border-zinc-200 flex items-center justify-between text-[10px] text-zinc-500">
          <div>
            <strong className="text-zinc-800">FINSCORE</strong> | Diagnostic Financial Health Audit
          </div>
          <div className="font-semibold text-zinc-600">
            Confidential Report · Crafted by <strong className="text-zinc-900">niceTRY</strong>
          </div>
          <div className="font-bold text-zinc-700">
            Page 3 of 3
          </div>
        </div>
      </div>

    </div>
  );
};
