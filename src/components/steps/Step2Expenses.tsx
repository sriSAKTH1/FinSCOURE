'use client';

import React, { useState } from 'react';
import { AssessmentData, ExpenseFrequency, MonthlyExpenses, CustomExpenseItem } from '@/types/assessment';
import { StepCard } from '../ui/StepCard';
import { CurrencyInput } from '../ui/CurrencyInput';
import { calculateTotalMonthlyExpenses, calculateTotalMonthlyIncome, formatCurrency } from '@/utils/calculations';
import { ChevronDown, ChevronUp, PlusCircle, Sparkles, Plus, Trash2, PiggyBank, TrendingUp, Wallet } from 'lucide-react';

interface Step2Props {
  data: AssessmentData;
  onChange: (data: AssessmentData) => void;
  showErrors?: boolean;
}

export const Step2Expenses: React.FC<Step2Props> = ({ data, onChange, showErrors = false }) => {
  const { expenses, additionalIncome, personal } = data;
  const customExpenses = data.customExpenses || [];
  const currency = personal.currency;
  const [showAdditionalIncome, setShowAdditionalIncome] = useState(false);

  const updateExpense = (
    field: keyof MonthlyExpenses,
    amount?: number | '',
    frequency?: ExpenseFrequency
  ) => {
    const current = expenses[field] || { amount: '', frequency: 'M' };
    const updated = {
      amount: amount !== undefined ? amount : current.amount,
      frequency: frequency !== undefined ? frequency : current.frequency,
    };

    onChange({
      ...data,
      expenses: {
        ...expenses,
        [field]: updated,
      },
    });
  };

  const handleAddCustomExpense = () => {
    const newItem: CustomExpenseItem = {
      id: `custom-expense-${Date.now()}`,
      name: '',
      amount: '',
      frequency: 'M',
      category: 'essential',
    };
    onChange({
      ...data,
      customExpenses: [...customExpenses, newItem],
    });
  };

  const handleUpdateCustomExpense = (
    id: string,
    updates: Partial<CustomExpenseItem>
  ) => {
    const updatedList = customExpenses.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    onChange({
      ...data,
      customExpenses: updatedList,
    });
  };

  const handleRemoveCustomExpense = (id: string) => {
    const updatedList = customExpenses.filter((item) => item.id !== id);
    onChange({
      ...data,
      customExpenses: updatedList,
    });
  };

  const updateAdditionalIncome = (field: keyof typeof additionalIncome, val: number | '') => {
    onChange({
      ...data,
      additionalIncome: {
        ...additionalIncome,
        [field]: val,
      },
    });
  };

  const totals = calculateTotalMonthlyExpenses(expenses, customExpenses);
  const totalIncome = calculateTotalMonthlyIncome(data);
  const totalExpenses = totals.total;
  const savingsAmount = totalIncome - totalExpenses;
  const expensePct = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;
  const savingsPct = totalIncome > 0 ? Math.round((savingsAmount / totalIncome) * 100) : 0;

  // Count how many expenses are filled with positive values
  const filledExpensesCount = Object.values(expenses).filter(
    (item) => typeof item?.amount === 'number' && item.amount > 0 && item.frequency !== 'N'
  ).length + (customExpenses || []).filter(
    (item) => typeof item?.amount === 'number' && item.amount > 0 && item.frequency !== 'N'
  ).length;

  const hasMinimumExpenses = filledExpensesCount >= 2;

  return (
    <StepCard
      stepNumber={2}
      title="Monthly expenses"
      subtitle="Capture your regular spending. Leave out loan payments and insurance for now."
      headerAction={
        <div className="text-right hidden sm:block">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Outflow</div>
          <div className="text-base font-extrabold text-[#1b4d3e]">
            {formatCurrency(totals.total, currency)}/mo
          </div>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Mandatory 2-Expense Requirement Banner */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-3 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
          hasMinimumExpenses
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            : showErrors
              ? 'bg-rose-50 border-rose-300 text-rose-900'
              : 'bg-amber-50/80 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-rose-500 font-black text-base leading-none">*</span>
            <span>
              <strong>Mandatory requirement:</strong> Fill at least <strong>any 2 expenses *</strong> to proceed with your assessment.
            </span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center">
            {hasMinimumExpenses ? (
              <span className="text-emerald-700 bg-emerald-100/90 font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1">
                ✓ {filledExpensesCount} filled (Requirement met)
              </span>
            ) : (
              <span className={`font-bold px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                showErrors ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-900'
              }`}>
                <span className="text-rose-500 font-bold">*</span> {filledExpensesCount} of 2 filled
              </span>
            )}
          </div>
        </div>

        {/* Two Column Layout matching Screenshot 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Column 1: Everyday essentials */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-1">
                Everyday essentials <span className="text-rose-500 text-xs font-bold">*</span>
              </h3>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                {formatCurrency(totals.essential, currency)}/mo
              </span>
            </div>

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Rent <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.rent?.amount ?? ''}
              onChange={(val) => updateExpense('rent', val)}
              frequency={expenses.rent?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('rent', undefined, freq)}
              currency={currency}
            />

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Food <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.food?.amount ?? ''}
              onChange={(val) => updateExpense('food', val)}
              frequency={expenses.food?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('food', undefined, freq)}
              currency={currency}
            />

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Bills · utilities <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.utilities?.amount ?? ''}
              onChange={(val) => updateExpense('utilities', val)}
              frequency={expenses.utilities?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('utilities', undefined, freq)}
              currency={currency}
            />

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Transportation & fuel <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.transport?.amount ?? ''}
              onChange={(val) => updateExpense('transport', val)}
              frequency={expenses.transport?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('transport', undefined, freq)}
              currency={currency}
            />

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Healthcare & medicines <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.healthcare?.amount ?? ''}
              onChange={(val) => updateExpense('healthcare', val)}
              frequency={expenses.healthcare?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('healthcare', undefined, freq)}
              currency={currency}
            />

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Education & childcare <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.education?.amount ?? ''}
              onChange={(val) => updateExpense('education', val)}
              frequency={expenses.education?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('education', undefined, freq)}
              currency={currency}
            />

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Family & dependent support <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.familySupport?.amount ?? ''}
              onChange={(val) => updateExpense('familySupport', val)}
              frequency={expenses.familySupport?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('familySupport', undefined, freq)}
              currency={currency}
            />
          </div>

          {/* Column 2: Subscriptions & lifestyle */}
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-sm font-bold text-zinc-900 tracking-tight flex items-center gap-1">
                Subscriptions & lifestyle <span className="text-rose-500 text-xs font-bold">*</span>
              </h3>
              <span className="text-xs font-semibold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-md">
                {formatCurrency(totals.discretionary, currency)}/mo
              </span>
            </div>

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Bills / recharges · phone & internet <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.phoneInternet?.amount ?? ''}
              onChange={(val) => updateExpense('phoneInternet', val)}
              frequency={expenses.phoneInternet?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('phoneInternet', undefined, freq)}
              currency={currency}
            />

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  OTT subscriptions <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.ott?.amount ?? ''}
              onChange={(val) => updateExpense('ott', val)}
              frequency={expenses.ott?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('ott', undefined, freq)}
              currency={currency}
            />

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Entertainment <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.entertainment?.amount ?? ''}
              onChange={(val) => updateExpense('entertainment', val)}
              frequency={expenses.entertainment?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('entertainment', undefined, freq)}
              currency={currency}
            />

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Shopping & personal care <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.shopping?.amount ?? ''}
              onChange={(val) => updateExpense('shopping', val)}
              frequency={expenses.shopping?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('shopping', undefined, freq)}
              currency={currency}
            />

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Travel & holidays <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.travel?.amount ?? ''}
              onChange={(val) => updateExpense('travel', val)}
              frequency={expenses.travel?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('travel', undefined, freq)}
              currency={currency}
            />

            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Pets, miscellaneous & other <span className="text-rose-500 font-bold text-xs">*</span>
                </span>
              }
              value={expenses.other?.amount ?? ''}
              onChange={(val) => updateExpense('other', val)}
              frequency={expenses.other?.frequency ?? 'M'}
              onFrequencyChange={(freq) => updateExpense('other', undefined, freq)}
              currency={currency}
            />
          </div>
        </div>

        {/* Additional Custom Expenses Section with Add Button */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 tracking-tight">
                Additional & Custom Expenses
              </h3>
              <p className="text-xs text-zinc-500">
                Add any other regular spending (gym, domestic help, education classes, maintenance, hobbies).
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddCustomExpense}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1b4d3e] border border-emerald-200 transition-all cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Expense</span>
            </button>
          </div>

          {customExpenses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
              {customExpenses.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-zinc-50/90 border border-zinc-200 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleUpdateCustomExpense(item.id, { name: e.target.value })}
                      placeholder={`Expense Name (e.g. Gym, Maid #${idx + 1})`}
                      className="text-xs sm:text-sm font-bold text-zinc-900 bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 focus:border-[#1b4d3e] focus:outline-none flex-1 shadow-2xs"
                    />
                    <select
                      value={item.category}
                      onChange={(e) => handleUpdateCustomExpense(item.id, { category: e.target.value as 'essential' | 'discretionary' })}
                      className="text-[11px] font-semibold bg-white border border-zinc-200 rounded-lg px-2.5 py-1.5 text-zinc-700 cursor-pointer focus:outline-none shadow-2xs"
                    >
                      <option value="essential">Essential</option>
                      <option value="discretionary">Discretionary</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomExpense(item.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <CurrencyInput
                    label=""
                    value={item.amount}
                    onChange={(val) => handleUpdateCustomExpense(item.id, { amount: val })}
                    frequency={item.frequency}
                    onFrequencyChange={(freq) => handleUpdateCustomExpense(item.id, { frequency: freq })}
                    currency={currency}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Additional Income Sources Section (Optional Drawer) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdditionalIncome(!showAdditionalIncome)}
            className="flex items-center gap-2 text-xs font-semibold text-[#1b4d3e] hover:text-emerald-900 py-2 cursor-pointer transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Have freelance, business, rental or dividend income?</span>
            {showAdditionalIncome ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showAdditionalIncome && (
            <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-zinc-50 border border-zinc-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-150">
              <CurrencyInput
                label="Freelance / Consulting"
                value={additionalIncome.freelance}
                onChange={(val) => updateAdditionalIncome('freelance', val)}
                currency={currency}
              />
              <CurrencyInput
                label="Business profits"
                value={additionalIncome.business}
                onChange={(val) => updateAdditionalIncome('business', val)}
                currency={currency}
              />
              <CurrencyInput
                label="Rental income"
                value={additionalIncome.rental}
                onChange={(val) => updateAdditionalIncome('rental', val)}
                currency={currency}
              />
              <CurrencyInput
                label="Dividends & interest"
                value={additionalIncome.interestDividends}
                onChange={(val) => updateAdditionalIncome('interestDividends', val)}
                currency={currency}
              />
            </div>
          )}
        </div>

        {/* Bottom Cash Flow Summary: Income Amount, Total Expenses Amount & %, Savings Amount & % */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white to-emerald-50/40 border border-[#b7dfcb] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#eaf5ef] text-[#1b4d3e] flex items-center justify-center font-bold">
                <PiggyBank className="w-4 h-4 text-emerald-800" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                  Monthly Cash Flow Summary
                </h4>
                <p className="text-[11px] text-zinc-500">
                  Income vs Expenses vs Net Savings Capacity
                </p>
              </div>
            </div>

            {totalIncome > 0 && (
              <span className={`text-xs font-black px-3 py-1 rounded-full border self-start sm:self-center ${
                savingsAmount >= 0 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border-rose-200'
              }`}>
                {savingsAmount >= 0 ? `${savingsPct}% Savings Rate` : `Deficit: ${Math.abs(savingsPct)}%`}
              </span>
            )}
          </div>

          {/* 3 Metric Cards: Income Amount, Total Expenses Amount & %, Savings Amount & % */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* 1. Income Amount */}
            <div className="p-4 rounded-xl bg-white border border-zinc-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Income Amount</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600">
                  100% Inflow
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-zinc-900">
                {formatCurrency(totalIncome, currency)}
              </div>
              <div className="text-[11px] text-zinc-500">
                {totalIncome > 0 ? 'Total monthly take-home + side income' : 'Enter take-home in Step 1'}
              </div>
            </div>

            {/* 2. Total Expenses Amount and Percentage */}
            <div className="p-4 rounded-xl bg-white border border-zinc-200/90 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Total Expenses</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  expensePct > 70 ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-800'
                }`}>
                  {expensePct}% of Income
                </span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-700">
                {formatCurrency(totals.total, currency)}
              </div>
              <div className="text-[11px] text-zinc-500">
                Essential: {formatCurrency(totals.essential, currency)} · Discretionary: {formatCurrency(totals.discretionary, currency)}
              </div>
            </div>

            {/* 3. Savings Amount and Percentage */}
            <div className={`p-4 rounded-xl border shadow-2xs space-y-1 ${
              savingsAmount >= 0 ? 'bg-[#f0fdf4] border-[#bbf7d0]' : 'bg-rose-50 border-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  savingsAmount >= 0 ? 'text-emerald-800' : 'text-rose-800'
                }`}>
                  Savings Amount
                </span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  savingsAmount >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-200 text-rose-800'
                }`}>
                  {savingsAmount >= 0 ? `${savingsPct}% of Income` : 'Over Budget'}
                </span>
              </div>
              <div className={`text-xl sm:text-2xl font-black ${
                savingsAmount >= 0 ? 'text-[#1b4d3e]' : 'text-rose-700'
              }`}>
                {formatCurrency(savingsAmount, currency)}
              </div>
              <div className={`text-[11px] ${
                savingsAmount >= 0 ? 'text-emerald-700 font-medium' : 'text-rose-600 font-medium'
              }`}>
                {savingsAmount >= 0 
                  ? `${savingsPct}% available for debt EMIs, SIPs & goals` 
                  : `Monthly deficit of ${formatCurrency(Math.abs(savingsAmount), currency)}`}
              </div>
            </div>
          </div>

          {/* Visual Percentage Allocation Bar */}
          {totalIncome > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-zinc-600">
                <span>Inflow Distribution</span>
                <span>Expenses: {expensePct}% · Savings: {Math.max(0, savingsPct)}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-zinc-100 overflow-hidden flex shadow-inner">
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, expensePct)}%` }}
                  title={`Expenses: ${expensePct}%`}
                />
                {savingsAmount > 0 && (
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300"
                    style={{ width: `${Math.max(0, Math.min(100 - expensePct, savingsPct))}%` }}
                    title={`Savings: ${savingsPct}%`}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </StepCard>
  );
};
