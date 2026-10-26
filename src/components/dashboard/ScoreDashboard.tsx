'use client';

import React, { useEffect, useState } from 'react';
import { AssessmentData } from '@/types/assessment';
import { FinScoreResult } from '@/types/score';
import { ScoreGauge } from './ScoreGauge';
import { PillarCard } from './PillarCard';
import { ScoreAnalytics } from './ScoreAnalytics';
import { SwotMatrix } from './SwotMatrix';
import { RecommendationsList } from './RecommendationsList';
import { PersonalBalanceSheet } from './PersonalBalanceSheet';
import { AssetAllocationAdvisor } from './AssetAllocationAdvisor';
import { DebtRepaymentAdvisor } from './DebtRepaymentAdvisor';
import { RetirementFireAdvisor } from './RetirementFireAdvisor';
import { ScoreReportPrint } from './ScoreReportPrint';
import { formatCurrency } from '@/utils/calculations';
import { CalculatorId } from '@/components/calculators/CalculatorsPage';
import confetti from 'canvas-confetti';
import {
  Printer,
  RotateCcw,
  Edit3,
  Sparkles,
  ShieldCheck,
  Target,
  PieChart,
  TrendingUp,
  Coins,
  Home,
  Eye,
  EyeOff
} from 'lucide-react';

interface ScoreDashboardProps {
  assessment: AssessmentData;
  scoreResult: FinScoreResult;
  onRetake: () => void;
  onReset: () => void;
  onHome?: () => void;
  onUpdateAssessment?: (data: AssessmentData) => void;
  onNavigateToCalculator?: (calcId: CalculatorId) => void;
}

export const ScoreDashboard: React.FC<ScoreDashboardProps> = ({
  assessment,
  scoreResult,
  onRetake,
  onReset,
  onHome,
  onUpdateAssessment,
  onNavigateToCalculator,
}) => {
  const { totalScore, grade, gradeTitle, gradeDescription, pillarScores, swot, recommendations, metrics, currency } = scoreResult;

  // Vibrant full-color celebration confetti pop when opening Score Dashboard
  useEffect(() => {
    // Only pop colorful celebration when there is actual calculated score/activity
    const colors = [
      '#10b981', // emerald
      '#3b82f6', // royal blue
      '#f59e0b', // vibrant amber
      '#ec4899', // bright pink
      '#8b5cf6', // purple
      '#ef4444', // ruby red
      '#06b6d4', // cyan
      '#eab308', // gold
      '#14b8a6', // teal
    ];

    try {
      // Cannon 1 & 2: Left & Right dual burst
      confetti({
        particleCount: 75,
        angle: 60,
        spread: 65,
        origin: { x: 0.05, y: 0.75 },
        colors,
      });

      confetti({
        particleCount: 75,
        angle: 120,
        spread: 65,
        origin: { x: 0.95, y: 0.75 },
        colors,
      });

      // Cannon 3: Center starburst pop
      const timer1 = setTimeout(() => {
        confetti({
          particleCount: 110,
          spread: 100,
          origin: { x: 0.5, y: 0.35 },
          colors,
          startVelocity: 42,
          scalar: 1.15,
        });
      }, 250);

      // Cannon 4: Multi-color cascade rain
      const timer2 = setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 90,
          spread: 130,
          origin: { x: 0.5, y: 0.6 },
          colors,
          startVelocity: 35,
        });
      }, 600);

      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    } catch {
      // Confetti fallback
    }
  }, []);

  // Only one advisor (Asset Allocation, Debt Repayment, or Retirement FIRE) can be open at a time
  const [openAdvisor, setOpenAdvisor] = useState<'none' | 'asset' | 'debt' | 'retirement'>('none');

  // Track hidden goals (both locally and synced with assessment)
  const [hiddenGoalIds, setHiddenGoalIds] = useState<Set<string>>(() => {
    const set = new Set<string>();
    assessment.goals.forEach((g) => {
      if (g.hidden) set.add(g.id);
    });
    return set;
  });

  // Keep in sync if assessment.goals changes
  useEffect(() => {
    const set = new Set<string>();
    assessment.goals.forEach((g) => {
      if (g.hidden) set.add(g.id);
    });
    setHiddenGoalIds(set);
  }, [assessment.goals]);

  const toggleGoalHide = (goalId: string) => {
    const newHidden = new Set(hiddenGoalIds);
    const isNowHidden = !newHidden.has(goalId);
    if (isNowHidden) {
      newHidden.add(goalId);
    } else {
      newHidden.delete(goalId);
    }
    setHiddenGoalIds(newHidden);

    if (onUpdateAssessment) {
      const updatedGoals = assessment.goals.map((g) =>
        g.id === goalId ? { ...g, hidden: isNowHidden } : g
      );
      onUpdateAssessment({
        ...assessment,
        goals: updatedGoals,
      });
    }
  };

  const unhideAllGoals = () => {
    setHiddenGoalIds(new Set());
    if (onUpdateAssessment) {
      const updatedGoals = assessment.goals.map((g) => ({ ...g, hidden: false }));
      onUpdateAssessment({
        ...assessment,
        goals: updatedGoals,
      });
    }
  };

  // Trigger celebration confetti on Grade A or B
  useEffect(() => {
    if (totalScore >= 65) {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#059669', '#10b981', '#34d399', '#6ee7b7'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [totalScore]);

  const handlePrint = () => {
    window.print();
  };

  const curr = assessment.personal.currency;
  const p = pillarScores;

  return (
    <>
      {/* EXECUTIVE 3-PAGE PRINT TEMPLATE: RENDERED ONLY IN PDF/PRINT */}
      <ScoreReportPrint
        assessment={assessment}
        scoreResult={scoreResult}
        hiddenGoalIds={hiddenGoalIds}
      />

      {/* INTERACTIVE ON-SCREEN DASHBOARD: HIDDEN IN PDF/PRINT */}
      <div className="space-y-8 animate-in fade-in duration-300 pb-16 print:hidden">
        {/* Top Banner / Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200/90 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <img
            src="/logo.png"
            alt="FinScore Logo"
            className="h-10 sm:h-12 w-auto object-contain shrink-0"
          />
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-zinc-900 tracking-tight">
              {assessment.personal.firstName ? `${assessment.personal.firstName}'s FinScore Assessment` : 'Your FinScore Assessment'}
            </h1>
            <p className="text-xs text-zinc-500">
              Generated on {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} · Educational indicator
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center print:hidden">
          {onHome && (
            <button
              type="button"
              onClick={onHome}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer shadow-2xs"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
          )}
          <button
            type="button"
            onClick={onRetake}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Answers</span>
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 transition-colors cursor-pointer shadow-2xs"
            title="Clear and start new assessment"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Start New</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#1b4d3e] hover:bg-[#143d31] text-white transition-all cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Hero Score Showcase Card */}
      <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.03)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Animated Score Gauge */}
        <div className="lg:col-span-5 flex justify-center">
          <ScoreGauge score={totalScore} grade={grade} gradeTitle={gradeTitle} />
        </div>

        {/* Right: Grade Description & High-level Vital Signs */}
        <div className="lg:col-span-7 space-y-5">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
              <span>Overall Financial Health Verdict</span>
            </div>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tight">
              Grade {grade}: {gradeTitle}
            </h2>
            <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
              {gradeDescription} Your score evaluates 4 key pillars: Emergency Runway, Insurance Safety Net, Savings Momentum, and Debt Exposure.
            </p>
          </div>

          {/* Quick Vital Numbers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase">Emergency Runway</div>
              <div className="text-base font-extrabold text-[#1b4d3e] mt-0.5">
                {p.emergencyFund.coverageMonths} mo
              </div>
              <div className="text-[10px] text-zinc-400">Target: {p.emergencyFund.targetMonths} mo</div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase">Savings Rate</div>
              <div className="text-base font-extrabold text-[#1b4d3e] mt-0.5">
                {p.savingsHealth.savingsRate}%
              </div>
              <div className="text-[10px] text-zinc-400">Benchmark: 20%+</div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase">EMI-to-Income</div>
              <div className={`text-base font-extrabold mt-0.5 ${p.debtHealth.emiToIncomeRatio <= 20 ? 'text-[#1b4d3e]' : p.debtHealth.emiToIncomeRatio <= 40 ? 'text-amber-700' : 'text-rose-600'}`}>
                {p.debtHealth.emiToIncomeRatio}%
              </div>
              <div className="text-[10px] text-zinc-400">Safe: &le; 20%</div>
            </div>

            <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              <div className="text-[10px] font-semibold text-zinc-500 uppercase">Estimated Net Worth</div>
              <div className="text-base font-extrabold text-zinc-900 mt-0.5">
                {formatCurrency(metrics.totalNetWorth, curr)}
              </div>
              <div className="text-[10px] text-zinc-400">{assessment.assets.length} Assets</div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Pillars Detailed Grid (25 pts each = 100 max) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
            Pillar Breakdown (100 Points Total)
          </h2>
          <span className="text-xs text-zinc-500">25 points per pillar</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pillar 1: Emergency Fund */}
          <PillarCard
            pillarId="emergencyFund"
            title="Emergency Fund"
            subtitle="Essential expense coverage & accessibility"
            score={p.emergencyFund.score}
            maxScore={25}
            breakdown={[
              { label: 'Runway coverage against target', score: p.emergencyFund.coverageScore, maxScore: 20 },
              { label: 'Instant fund accessibility', score: p.emergencyFund.accessibilityScore, maxScore: 5 },
            ]}
            metrics={[
              { label: 'Current Coverage', value: `${p.emergencyFund.coverageMonths} months`, status: p.emergencyFund.coverageMonths >= 6 ? 'good' : p.emergencyFund.coverageMonths >= 3 ? 'neutral' : 'warn' },
              { label: 'Target Fund', value: formatCurrency(p.emergencyFund.targetAmount, curr) },
              { label: 'Savings Shortfall', value: p.emergencyFund.shortfall === 0 ? 'Zero shortfall' : formatCurrency(p.emergencyFund.shortfall, curr), status: p.emergencyFund.shortfall === 0 ? 'good' : 'warn' },
              { label: 'Recommended /mo', value: `${formatCurrency(p.emergencyFund.recommendedMonthlySavings, curr)}/mo` },
            ]}
            tips={
              p.emergencyFund.shortfall > 0
                ? [`Save ${formatCurrency(p.emergencyFund.recommendedMonthlySavings, curr)}/mo in liquid deposits to reach your 6-month buffer.`]
                : ['Emergency fund is fully funded! Ensure it stays in high-liquidity accounts.']
            }
          />

          {/* Pillar 2: Insurance Protection */}
          <PillarCard
            pillarId="insuranceProtection"
            title="Insurance Protection"
            subtitle="Health cover & dependent income replacement"
            score={p.insuranceProtection.score}
            maxScore={25}
            breakdown={[
              { label: 'Health insurance adequacy', score: p.insuranceProtection.healthScore, maxScore: 15 },
              { label: 'Life insurance adequacy', score: p.insuranceProtection.lifeScore, maxScore: 10 },
            ]}
            metrics={[
              { label: 'Health Sum Insured', value: formatCurrency(p.insuranceProtection.healthSumInsured, curr), status: p.insuranceProtection.healthScore >= 12 ? 'good' : 'warn' },
              { label: 'Health Target', value: formatCurrency(p.insuranceProtection.targetHealthCover, curr) },
              { label: 'Life Cover Sum', value: formatCurrency(p.insuranceProtection.lifeSumAssured, curr), status: !p.insuranceProtection.isLifeNeeded || p.insuranceProtection.lifeScore >= 7 ? 'good' : 'warn' },
              { label: 'Total Annual Premiums', value: `${formatCurrency(p.insuranceProtection.totalAnnualPremiums, curr)}/yr` },
            ]}
            tips={p.insuranceProtection.protectionGaps}
          />

          {/* Pillar 3: Savings Health */}
          <PillarCard
            pillarId="savingsHealth"
            title="Savings Health"
            subtitle="Cashflow surplus & savings discipline"
            score={p.savingsHealth.score}
            maxScore={25}
            breakdown={[
              { label: 'Savings rate score (≥20% gives 25 marks, <20% gives % as marks)', score: p.savingsHealth.score, maxScore: 25 },
            ]}
            metrics={[
              { label: 'Monthly Income', value: formatCurrency(p.savingsHealth.monthlyIncome, curr) },
              { label: 'Monthly Outflows', value: formatCurrency(p.savingsHealth.monthlyExpenses, curr) },
              { label: 'Monthly Surplus', value: formatCurrency(p.savingsHealth.monthlySurplus, curr), status: p.savingsHealth.monthlySurplus > 0 ? 'good' : 'warn' },
              { label: 'Savings Rate', value: `${p.savingsHealth.savingsRate}%`, status: p.savingsHealth.savingsRate >= 20 ? 'good' : p.savingsHealth.savingsRate >= 10 ? 'neutral' : 'warn' },
            ]}
            tips={[
              `20% savings target: ${formatCurrency(p.savingsHealth.targetMonthlySavings, curr)}/mo.`,
              p.savingsHealth.monthlySurplus > 0 ? 'Channel excess surplus systematically into index funds/SIPs.' : 'Review discretionary lifestyle expenses to achieve positive cashflow.'
            ]}
          />

          {/* Pillar 4: Debt Health */}
          <PillarCard
            pillarId="debtHealth"
            title="Debt Health"
            subtitle="EMI burden, interest costs & repayment"
            score={p.debtHealth.score}
            maxScore={25}
            breakdown={[
              { label: 'EMI-to-income ratio', score: p.debtHealth.emiScore, maxScore: 10 },
              { label: 'High-interest debt exposure', score: p.debtHealth.highInterestScore, maxScore: 10 },
              { label: 'Repayment status & timeliness', score: p.debtHealth.repaymentScore, maxScore: 5 },
            ]}
            metrics={[
              { label: 'Total Outstanding Debt', value: formatCurrency(p.debtHealth.totalDebtPrincipal, curr) },
              { label: 'Total Monthly EMIs', value: `${formatCurrency(p.debtHealth.totalMonthlyEmi, curr)}/mo` },
              { label: 'EMI-to-Income Ratio', value: `${p.debtHealth.emiToIncomeRatio}%`, status: p.debtHealth.emiToIncomeRatio <= 20 ? 'good' : p.debtHealth.emiToIncomeRatio <= 40 ? 'neutral' : 'warn' },
              { label: 'High-Interest Balance', value: formatCurrency(p.debtHealth.highInterestDebt, curr), status: p.debtHealth.highInterestDebt === 0 ? 'good' : 'warn' },
            ]}
            tips={
              p.debtHealth.totalMonthlyEmi === 0
                ? ['Excellent! You are completely debt-free. Keep credit card balances cleared monthly.']
                : p.debtHealth.highInterestDebt > 0
                  ? [`Focus on clearing ${formatCurrency(p.debtHealth.highInterestDebt, curr)} in high-interest debt using debt avalanche.`]
                  : ['Maintain regular EMI payments on time to strengthen your credit profile.']
            }
          />
        </div>
      </div>

      {/* Score Analytics & Financial Diagnostics (Radar, Trajectory, Cash Flow, Stress Test) */}
      <ScoreAnalytics
        assessment={assessment}
        scoreResult={scoreResult}
        hiddenGoalIds={hiddenGoalIds}
      />

      {/* SWOT Matrix Analysis */}
      <SwotMatrix swot={swot} />

      {/* Tailored Recommendations */}
      <RecommendationsList recommendations={recommendations} />

      {/* Personal Balance Sheet & Accounting Equation Diagram */}
      <PersonalBalanceSheet assessment={assessment} scoreResult={scoreResult} />

      {/* Future Goals Tracking Card if any goals exist */}
      {metrics.goalsAnalysis.length > 0 && (() => {
        const activeGoals = metrics.goalsAnalysis.filter((g) => !hiddenGoalIds.has(g.goalId));
        const hiddenCount = metrics.goalsAnalysis.length - activeGoals.length;
        const totalActiveRequiredMonthly = activeGoals.reduce((sum, g) => sum + g.monthlyRequired, 0);
        const totalActiveCurrentMonthly = activeGoals.reduce((sum, g) => sum + g.currentMonthlyContribution, 0);
        const totalActiveTargetAmount = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
        const totalActiveSavedAmount = activeGoals.reduce((sum, g) => sum + (g.savedAmount || 0), 0);

        return (
          <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
                  <Target className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-zinc-900">Milestone Goals Progress</h3>
                  <p className="text-xs text-zinc-500">Checking your savings trajectory against your milestones</p>
                </div>
              </div>

              {/* Total Required /mo and Active badge */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#eaf5ef] border border-[#b7dfcb] text-[#1b4d3e]">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Required /mo Total:</span>
                  <span className="text-sm sm:text-base font-black text-[#1b4d3e]">
                    {formatCurrency(totalActiveRequiredMonthly, curr)}/mo
                  </span>
                </div>
                {hiddenCount > 0 ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-600 border border-zinc-200">
                      {hiddenCount} Hidden (Excluded)
                    </span>
                    <button
                      type="button"
                      onClick={unhideAllGoals}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                    >
                      Unhide All
                    </button>
                  </div>
                ) : (
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {activeGoals.length} Active
                  </span>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-100 text-zinc-400 font-semibold uppercase">
                    <th className="py-2.5">Goal</th>
                    <th className="py-2.5">Target</th>
                    <th className="py-2.5 text-emerald-800 font-bold">Current Saved</th>
                    <th className="py-2.5">Target Year</th>
                    <th className="py-2.5">Required /mo</th>
                    <th className="py-2.5">Current /mo</th>
                    <th className="py-2.5">Goal Score</th>
                    <th className="py-2.5">Status</th>
                    <th className="py-2.5 text-center">Hide / Unhide</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {metrics.goalsAnalysis.map((g) => {
                    const isHidden = hiddenGoalIds.has(g.goalId);
                    return (
                      <tr
                        key={g.goalId}
                        className={`transition-colors ${isHidden ? 'bg-zinc-50/70 opacity-60' : 'hover:bg-zinc-50/40'}`}
                      >
                        <td className="py-3 font-bold text-zinc-900">
                          <div className="flex items-center gap-2">
                            <span className={isHidden ? 'line-through text-zinc-400' : 'text-zinc-900'}>
                              {g.name}
                            </span>
                            {isHidden && (
                              <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-600 font-extrabold tracking-wider">
                                Hidden
                              </span>
                            )}
                          </div>
                        </td>
                        <td className={`py-3 font-semibold ${isHidden ? 'line-through text-zinc-400' : 'text-zinc-800'}`}>
                          {formatCurrency(g.targetAmount, curr)}
                        </td>
                        <td className={`py-3 font-bold ${isHidden ? 'line-through text-zinc-400' : 'text-emerald-700'}`}>
                          {formatCurrency(g.savedAmount || 0, curr)}
                        </td>
                        <td className={`py-3 ${isHidden ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          {g.targetYear} ({g.yearsRemaining} yrs left)
                        </td>
                        <td className={`py-3 font-bold ${isHidden ? 'line-through text-zinc-400' : 'text-[#1b4d3e]'}`}>
                          {formatCurrency(g.monthlyRequired, curr)}/mo
                        </td>
                        <td className={`py-3 ${isHidden ? 'line-through text-zinc-400' : 'text-zinc-700'}`}>
                          {formatCurrency(g.currentMonthlyContribution, curr)}/mo
                        </td>
                        <td className="py-3">
                          {isHidden ? (
                            <span className="text-zinc-400 font-bold text-xs">—</span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-md font-black text-xs ${
                              g.score === 0 
                                ? 'bg-rose-50 text-rose-800 border border-rose-200' 
                                : g.score >= 80 
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                                  : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {g.score}/100 {g.score === 0 ? '(0 Marks)' : ''}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          {isHidden ? (
                            <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-zinc-100 text-zinc-400 border border-zinc-200">
                              Excluded
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${g.onTrack ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                              {g.onTrack ? 'On Track ✓' : 'Underfunded'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            type="button"
                            onClick={() => toggleGoalHide(g.goalId)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border shadow-2xs ${isHidden
                                ? 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-300'
                                : 'bg-white hover:bg-zinc-50 text-zinc-700 border-zinc-200 hover:border-zinc-300'
                              }`}
                            title={isHidden ? 'Click to unhide goal and calculate in total' : 'Click to hide goal and exclude from calculation'}
                          >
                            {isHidden ? (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Unhide</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                                <span>Hide</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-zinc-200 bg-zinc-50/80 font-bold text-zinc-800">
                    <td className="py-3 text-zinc-900 font-extrabold">
                      Total ({activeGoals.length} of {metrics.goalsAnalysis.length} Active)
                    </td>
                    <td className="py-3 font-extrabold text-zinc-900">
                      {formatCurrency(totalActiveTargetAmount, curr)}
                    </td>
                    <td className="py-3 font-black text-emerald-800">
                      {formatCurrency(totalActiveSavedAmount, curr)}
                    </td>
                    <td className="py-3 text-zinc-400 font-normal">—</td>
                    <td className="py-3 font-black text-sm text-[#1b4d3e]">
                      {formatCurrency(totalActiveRequiredMonthly, curr)}/mo
                    </td>
                    <td className="py-3 font-bold text-zinc-800">
                      {formatCurrency(totalActiveCurrentMonthly, curr)}/mo
                    </td>
                    <td className="py-3">
                      <span className="text-[10px] font-bold text-zinc-600">
                        {activeGoals.filter((g) => g.onTrack).length}/{activeGoals.length} On Track
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {hiddenCount > 0 ? (
                        <button
                          type="button"
                          onClick={unhideAllGoals}
                          className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                        >
                          Unhide All
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-400 font-normal">All Calculated</span>
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        );
      })()}

      {/* Asset Allocation Component Plan: Your Age-Based Allocation Strategy (Only one open at a time) */}
      <AssetAllocationAdvisor
        assessment={assessment}
        scoreResult={scoreResult}
        isOpen={openAdvisor === 'asset'}
        onToggleOpen={(open) => setOpenAdvisor(open ? 'asset' : 'none')}
      />

      {/* Debt Management & Loan Repayment Strategies: 10 Strategies, 5 Calculators, Interactive Planner (Only one open at a time) */}
      <DebtRepaymentAdvisor
        assessment={assessment}
        scoreResult={scoreResult}
        onUpdateAssessment={onUpdateAssessment}
        isOpen={openAdvisor === 'debt'}
        onToggleOpen={(open) => setOpenAdvisor(open ? 'debt' : 'none')}
      />

      {/* Retirement Planning & FIRE Strategy Advisor (Only one open at a time) */}
      <RetirementFireAdvisor
        assessment={assessment}
        scoreResult={scoreResult}
        isOpen={openAdvisor === 'retirement'}
        onToggleOpen={(open) => setOpenAdvisor(open ? 'retirement' : 'none')}
        onOpenFireCalculator={() => onNavigateToCalculator?.('fire')}
      />

      {/* Bottom Sticky Retake Banner: Hidden in PDF print */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-100 border border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-zinc-900">Want to simulate changes or update numbers?</h4>
          <p className="text-xs text-zinc-500">You can return to any step of the assessment to test scenarios (e.g. paying off a loan or increasing monthly savings).</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRetake}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-white hover:bg-zinc-50 text-zinc-800 border border-zinc-200 transition-colors cursor-pointer shadow-2xs"
          >
            Review Assessment
          </button>
          <button
            type="button"
            onClick={onReset}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-zinc-800 hover:bg-zinc-900 text-white transition-colors cursor-pointer shadow-2xs"
          >
            Start New Profile
          </button>
        </div>
      </div>
    </div>
  </>
);
};
