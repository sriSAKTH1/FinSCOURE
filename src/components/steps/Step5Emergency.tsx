'use client';

import React from 'react';
import { AssessmentData, EmergencyFund } from '@/types/assessment';
import { StepCard } from '../ui/StepCard';
import { CurrencyInput } from '../ui/CurrencyInput';
import { calculateEmergencyFundScore, calculateTotalMonthlyExpenses, formatCurrency, parseNum } from '@/utils/calculations';
import { PiggyBank, Clock, Target, CheckCircle2, AlertTriangle } from 'lucide-react';

interface Step5Props {
  data: AssessmentData;
  onChange: (data: AssessmentData) => void;
}

export const Step5Emergency: React.FC<Step5Props> = ({ data, onChange }) => {
  const { emergencyFund, expenses, personal } = data;
  const currency = personal.currency;
  const expenseTotals = calculateTotalMonthlyExpenses(expenses, data.customExpenses, data.loans);

  const updateEmergency = (field: keyof EmergencyFund, val: any) => {
    onChange({
      ...data,
      emergencyFund: {
        ...emergencyFund,
        [field]: val,
      },
    });
  };

  const emergencyScore = calculateEmergencyFundScore(data, expenseTotals.essential);

  return (
    <StepCard
      stepNumber={5}
      title="Emergency fund"
      subtitle="Your financial shock absorber for medical urgencies, job transitions, or unexpected repairs."
      headerAction={
        <div className="text-right hidden sm:block">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Current Runway</div>
          <div className="text-base font-extrabold text-[#1b4d3e]">
            {emergencyScore.coverageMonths} Months
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Row 1: Liquid Savings & Target Months Selector */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CurrencyInput
            label="Liquid emergency savings available right now"
            value={emergencyFund.liquidSavings}
            onChange={(val) => updateEmergency('liquidSavings', val)}
            currency={currency}
            placeholder="e.g. 5000"
            helperText="Cash, savings bank accounts, or instant liquid mutual funds."
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-semibold text-zinc-800">
              Target Coverage Goal
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 9, 12].map((m) => {
                const active = emergencyFund.targetMonths === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateEmergency('targetMonths', m)}
                    className={`py-2.5 text-xs sm:text-sm font-bold rounded-xl border transition-all cursor-pointer text-center ${
                      active
                        ? 'bg-[#eaf5ef] text-[#1b4d3e] border-[#b7dfcb] shadow-2xs'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                    }`}
                  >
                    {m} Months
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] text-zinc-400">
              6 months is the standard benchmark for balanced financial safety.
            </span>
          </div>
        </div>

        {/* Accessibility & Established Toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-zinc-900">Immediate Accessibility</div>
              <div className="text-[11px] text-zinc-500">Can this cash be withdrawn within 24–48 hours without lock-in penalties?</div>
            </div>
            <input
              type="checkbox"
              checked={emergencyFund.isAccessible}
              onChange={(e) => updateEmergency('isAccessible', e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-zinc-900">Dedicated Emergency Account</div>
              <div className="text-[11px] text-zinc-500">Separated from regular everyday spending accounts?</div>
            </div>
            <input
              type="checkbox"
              checked={emergencyFund.hasEmergencyFund}
              onChange={(e) => updateEmergency('hasEmergencyFund', e.target.checked)}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Real-time Runway & Progress Calculator Card */}
        <div className="p-6 rounded-2xl bg-[#eaf5ef]/70 border border-[#b7dfcb] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-800" />
              <span className="font-bold text-sm text-[#1b4d3e]">Emergency Runway Diagnostic</span>
            </div>
            <span className="text-xs font-extrabold text-[#1b4d3e] bg-white px-2.5 py-1 rounded-full border border-[#b7dfcb]">
              {emergencyScore.coverageMonths} of {emergencyScore.targetMonths} months funded
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-zinc-700">
              <span>Goal Progress ({emergencyScore.progressPercentage}%)</span>
              <span>
                {formatCurrency(parseNum(emergencyFund.liquidSavings), currency)} / {formatCurrency(emergencyScore.targetAmount, currency)}
              </span>
            </div>
            <div className="w-full bg-white/80 h-3 rounded-full overflow-hidden border border-[#b7dfcb]">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, emergencyScore.progressPercentage)}%` }}
              />
            </div>
          </div>

          {/* Metric Triplet */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <div className="text-[11px] text-zinc-500 font-medium">Essential Monthly Burn (N + E)</div>
              <div className="text-sm font-bold text-zinc-900">
                {formatCurrency(emergencyScore.essentialMonthlyExpenses, currency)}/mo
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <div className="text-[11px] text-zinc-500 font-medium">Shortfall to Target</div>
              <div className={`text-sm font-bold ${emergencyScore.shortfall === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {emergencyScore.shortfall === 0 ? 'Fully Funded ✓' : formatCurrency(emergencyScore.shortfall, currency)}
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-emerald-100">
              <div className="text-[11px] text-zinc-500 font-medium">Suggested 12-Mo Monthly Plan</div>
              <div className="text-sm font-bold text-emerald-800">
                {formatCurrency(emergencyScore.recommendedMonthlySavings, currency)}/mo
              </div>
            </div>
          </div>
        </div>
      </div>
    </StepCard>
  );
};
