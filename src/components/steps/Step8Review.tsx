'use client';

import React from 'react';
import { AssessmentData } from '@/types/assessment';
import { StepCard } from '../ui/StepCard';
import { 
  calculateTotalMonthlyIncome, 
  calculateTotalMonthlyExpenses, 
  formatCurrency, 
  parseNum 
} from '@/utils/calculations';
import { 
  CheckCircle2, 
  Edit3, 
  ArrowRight, 
  ShieldCheck, 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  Target, 
  User, 
  Receipt 
} from 'lucide-react';

interface Step8Props {
  data: AssessmentData;
  onNavigateToStep: (step: number) => void;
  onConfirmAndCalculate: () => void;
}

export const Step8Review: React.FC<Step8Props> = ({
  data,
  onNavigateToStep,
  onConfirmAndCalculate,
}) => {
  const { personal, expenses, hasLoans, loans, healthInsurance, lifeInsurance, emergencyFund, assets, goals } = data;
  const currency = personal.currency;

  const income = calculateTotalMonthlyIncome(data);
  const expenseBreakdown = calculateTotalMonthlyExpenses(expenses, data.customExpenses, loans);
  const totalEmi = loans.reduce((acc, l) => acc + parseNum(l.monthlyEmi), 0);
  const totalDebt = loans.reduce((acc, l) => acc + parseNum(l.principal), 0);
  const totalAssets = assets.reduce((acc, a) => acc + parseNum(a.currentValue), 0);
  const livingExpenses = Math.max(0, expenseBreakdown.total - (totalEmi > 0 ? totalEmi : parseNum(expenses.loans?.amount)));
  const surplus = income - expenseBreakdown.total;

  return (
    <StepCard
      stepNumber={8}
      title="Review and confirm"
      subtitle="Verify your numbers across all 7 pillars. Click 'Edit' beside any section if you need to adjust anything."
    >
      <div className="space-y-6">
        {/* Quick Snapshot Metrics Header */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#eaf5ef]/60 border border-[#b7dfcb]">
          <div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase">Monthly Income</div>
            <div className="text-base font-extrabold text-[#1b4d3e]">
              {formatCurrency(income, currency)}/mo
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase">Monthly Expenses</div>
            <div className="text-base font-extrabold text-zinc-900">
              {formatCurrency(livingExpenses, currency)}/mo
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase">Monthly EMIs</div>
            <div className="text-base font-extrabold text-zinc-900">
              {formatCurrency(totalEmi, currency)}/mo
            </div>
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-500 uppercase">Net Monthly Surplus</div>
            <div className={`text-base font-extrabold ${surplus >= 0 ? 'text-[#1b4d3e]' : 'text-rose-600'}`}>
              {formatCurrency(surplus, currency)}/mo
            </div>
          </div>
        </div>

        {/* Section Breakdown Cards */}
        <div className="space-y-4">
          {/* 1. About You */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400">Step 1 · Personal Details</div>
                <div className="text-sm font-bold text-zinc-900">
                  {personal.firstName || 'Not provided'}, {personal.age ? `${personal.age} yrs` : ''} · {personal.occupation || 'Employed'} ({personal.employmentType})
                </div>
                <div className="text-xs text-zinc-500">
                  Dependents: {personal.dependents} · Take-home: {formatCurrency(parseNum(personal.monthlyTakeHome), currency)}/mo
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToStep(1)}
              className="text-xs font-bold text-[#1b4d3e] hover:text-emerald-900 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          {/* 2. Expenses */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400">Step 2 · Living Expenses</div>
                <div className="text-sm font-bold text-zinc-900">
                  Total Outflow: {formatCurrency(expenseBreakdown.total, currency)}/mo
                </div>
                <div className="text-xs text-zinc-500">
                  Essential: {formatCurrency(expenseBreakdown.essential, currency)} · Discretionary: {formatCurrency(expenseBreakdown.discretionary, currency)}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToStep(2)}
              className="text-xs font-bold text-[#1b4d3e] hover:text-emerald-900 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          {/* 3. Debt */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-800 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400">Step 3 · Loans & Debt</div>
                <div className="text-sm font-bold text-zinc-900">
                  {!hasLoans || loans.length === 0
                    ? 'Completely Debt-Free ✓'
                    : `${loans.length} active loan(s) · Principal: ${formatCurrency(totalDebt, currency)}`}
                </div>
                {hasLoans && loans.length > 0 && (
                  <div className="text-xs text-zinc-500">
                    Monthly EMI commitment: {formatCurrency(totalEmi, currency)}/mo
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToStep(3)}
              className="text-xs font-bold text-[#1b4d3e] hover:text-emerald-900 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          {/* 4. Insurance */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400">Step 4 · Insurance Protection</div>
                <div className="text-sm font-bold text-zinc-900">
                  Health: {healthInsurance.hasCover ? formatCurrency(parseNum(healthInsurance.sumInsured), currency) : 'No cover'} · Life: {lifeInsurance.hasCover ? formatCurrency(parseNum(lifeInsurance.sumAssured), currency) : personal.dependents === 0 ? 'Not needed (0 dependents)' : 'No cover'}
                </div>
                <div className="text-xs text-zinc-500">
                  Total Annual Premiums: {formatCurrency(parseNum(healthInsurance.annualPremium) + parseNum(lifeInsurance.annualPremium), currency)}/yr
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToStep(4)}
              className="text-xs font-bold text-[#1b4d3e] hover:text-emerald-900 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          {/* 5. Emergency Fund */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
                <PiggyBank className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400">Step 5 · Emergency Cushion</div>
                <div className="text-sm font-bold text-zinc-900">
                  Liquid Reserve: {formatCurrency(parseNum(emergencyFund.liquidSavings), currency)}
                </div>
                <div className="text-xs text-zinc-500">
                  Target: {emergencyFund.targetMonths} Months · Accessible: {emergencyFund.isAccessible ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToStep(5)}
              className="text-xs font-bold text-[#1b4d3e] hover:text-emerald-900 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          {/* 6. Assets */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400">Step 6 · Investments & Assets</div>
                <div className="text-sm font-bold text-zinc-900">
                  Total Asset Holdings: {formatCurrency(totalAssets, currency)} ({assets.length} items)
                </div>
                <div className="text-xs text-zinc-500">
                  Monthly SIPs / additions: +{formatCurrency(assets.reduce((acc, a) => acc + parseNum(a.monthlyContribution), 0), currency)}/mo
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToStep(6)}
              className="text-xs font-bold text-[#1b4d3e] hover:text-emerald-900 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>

          {/* 7. Goals */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-zinc-400">Step 7 · Future Goals</div>
                <div className="text-sm font-bold text-zinc-900">
                  {goals.length === 0 ? 'No specific goals set' : `${goals.length} target goal(s) registered`}
                </div>
                {goals.length > 0 && (
                  <div className="text-xs text-zinc-500">
                    Total Goal Targets: {formatCurrency(goals.reduce((acc, g) => acc + parseNum(g.targetAmount), 0), currency)}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToStep(7)}
              className="text-xs font-bold text-[#1b4d3e] hover:text-emerald-900 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit
            </button>
          </div>
        </div>

        {/* Big Calculate FinScore CTA Box */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#1b4d3e] to-teal-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <h3 className="text-lg font-bold">Ready to calculate your FinScore?</h3>
            </div>
            <p className="text-xs text-emerald-100 max-w-md">
              Our 100-point engine will evaluate your emergency runway, insurance adequacy, savings rate, and debt health to generate your grade, SWOT, and tailored recommendations.
            </p>
          </div>

          <button
            type="button"
            onClick={onConfirmAndCalculate}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-emerald-50 text-[#1b4d3e] font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer shrink-0"
          >
            <span>View Score Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </StepCard>
  );
};
