'use client';

import React, { useState } from 'react';
import { AssessmentData, GoalCategory, GoalItem } from '@/types/assessment';
import { StepCard } from '../ui/StepCard';
import { CurrencyInput } from '../ui/CurrencyInput';
import { 
  calculateTotalMonthlyIncome, 
  calculateTotalMonthlyExpenses, 
  formatCurrency, 
  parseNum 
} from '@/utils/calculations';
import { 
  Plus, 
  Trash2, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Home, 
  GraduationCap, 
  Compass, 
  Car, 
  Sparkles, 
  Clock, 
  Layers, 
  HeartHandshake,
  Coins,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';

interface Step7Props {
  data: AssessmentData;
  onChange: (data: AssessmentData) => void;
}

const CATEGORY_OPTIONS: { id: GoalCategory; label: string; badge: string; icon: any }[] = [
  { id: 'wealth', label: 'Mutual Funds & Equity', badge: 'MUTUAL FUNDS & EQUITY', icon: TrendingUp },
  { id: 'retirement', label: 'Retirement & Fixed Income', badge: 'RETIREMENT & FIXED INCOME', icon: Compass },
  { id: 'other', label: 'Equities & Gold Reserve', badge: 'EQUITIES & GOLD', icon: Coins },
  { id: 'vehicle', label: 'Buy a Car / Vehicle', badge: 'BUY A CAR / VEHICLE', icon: Car },
  { id: 'home', label: 'Home Downpayment / Purchase', badge: 'HOME DOWNPAYMENT', icon: Home },
  { id: 'education', label: "Children's Education / College", badge: 'CHILDREN EDUCATION', icon: GraduationCap },
  { id: 'wedding', label: 'Wedding / Family Milestone', badge: 'FAMILY MILESTONE', icon: HeartHandshake },
];

const TENURE_PRESETS = [1, 2, 3, 4, 5, 7, 10, 15, 20];

export const Step7Goals: React.FC<Step7Props> = ({ data, onChange }) => {
  const { goals, personal, expenses, loans } = data;
  const currency = personal.currency;
  const currentYear = new Date().getFullYear();

  const income = calculateTotalMonthlyIncome(data);
  const totalExp = calculateTotalMonthlyExpenses(expenses).total;
  const totalEmi = loans.reduce((acc, l) => acc + parseNum(l.monthlyEmi), 0);
  const monthlySurplus = income - totalExp - totalEmi;

  // Calculate Target Date string from years
  const computeTargetDate = (years: number) => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + years);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    const readable = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return { formattedDate, readable, year };
  };

  // State for the "Add Goal" form
  const [formName, setFormName] = useState('Buy Car');
  const [formCategory, setFormCategory] = useState<GoalCategory>('vehicle');
  const [formTargetAmount, setFormTargetAmount] = useState<number | ''>(800000);
  const [formSavedAmount, setFormSavedAmount] = useState<number | ''>(150000);
  const [formTenureYears, setFormTenureYears] = useState<number>(4);

  // Derived values for the current form
  const formMonths = Math.max(1, formTenureYears * 12);
  const formRemaining = Math.max(0, parseNum(formTargetAmount) - parseNum(formSavedAmount));
  const formMonthlyRequired = Math.round(formRemaining / formMonths);
  const formDateInfo = computeTargetDate(formTenureYears);

  // Schedule Aggregates: Total required additions across all active saved goals
  const activeGoals = goals.filter((g) => !g.hidden);
  const totalMonthlyRequired = activeGoals.reduce((acc, g) => {
    const targetAmt = parseNum(g.targetAmount);
    const saved = parseNum(g.savedAmount);
    const tenure = Number(g.tenureYears) || Math.max(1, (Number(g.targetYear) || (currentYear + 4)) - currentYear);
    const months = Math.max(1, tenure * 12);
    const remaining = Math.max(0, targetAmt - saved);
    return acc + Math.round(remaining / months);
  }, 0);

  const isSurplusSufficient = monthlySurplus >= totalMonthlyRequired;

  // Save the currently filled goal and reset form to ADD NEXT
  const handleAddGoal = () => {
    const newGoal: GoalItem = {
      id: `goal-${Date.now()}`,
      category: formCategory,
      name: formName.trim() || 'Milestone Goal',
      targetAmount: parseNum(formTargetAmount) || 500000,
      targetYear: formDateInfo.year,
      tenureYears: formTenureYears,
      targetDate: formDateInfo.formattedDate,
      savedAmount: parseNum(formSavedAmount) || 0,
      monthlyContribution: formMonthlyRequired,
      expectedReturn: 10,
    };

    onChange({
      ...data,
      goals: [...goals, newGoal],
    });

    // Reset form for next goal
    setFormName('');
    setFormCategory('wealth');
    setFormTargetAmount('');
    setFormSavedAmount('');
    setFormTenureYears(5);
  };

  const removeGoal = (id: string) => {
    onChange({
      ...data,
      goals: goals.filter((g) => g.id !== id),
    });
  };

  const toggleGoalHide = (id: string) => {
    onChange({
      ...data,
      goals: goals.map((g) => (g.id === id ? { ...g, hidden: !g.hidden } : g)),
    });
  };

  // Quick preset loader
  const handleSelectPreset = (catId: GoalCategory, label: string) => {
    setFormCategory(catId);
    setFormName(label);
    if (catId === 'vehicle') {
      setFormTargetAmount(800000);
      setFormSavedAmount(150000);
      setFormTenureYears(4);
    } else if (catId === 'home') {
      setFormTargetAmount(2500000);
      setFormSavedAmount(500000);
      setFormTenureYears(5);
    } else if (catId === 'retirement') {
      setFormTargetAmount(1500000);
      setFormSavedAmount(370000);
      setFormTenureYears(6);
    } else if (catId === 'wealth') {
      setFormTargetAmount(800000);
      setFormSavedAmount(480000);
      setFormTenureYears(4);
    } else if (catId === 'education') {
      setFormTargetAmount(1200000);
      setFormSavedAmount(200000);
      setFormTenureYears(7);
    }
  };

  return (
    <StepCard
      stepNumber={7}
      title="Future financial goals"
      subtitle="Define milestone timelines and plan your required monthly investment pace."
    >
      <div className="space-y-8">
        
        {/* Top Banner: All Goals Required Monthly Addition Schedule */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#1b4d3e] to-teal-900 text-white shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-700/50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                <Layers className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-base font-extrabold tracking-tight">
                  All Goals Required Monthly Addition Schedule
                </h3>
                <p className="text-xs text-emerald-100">
                  Total monthly investment required across all {activeGoals.length} active target milestone(s) {goals.length > activeGoals.length ? `(${goals.length - activeGoals.length} hidden)` : ''}
                </p>
              </div>
            </div>

            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/15 border border-white/20 self-start sm:self-center">
              {activeGoals.length} of {goals.length} Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/10 border border-white/10">
              <div className="text-[11px] text-emerald-200 uppercase font-semibold">Total Monthly Required</div>
              <div className="text-lg font-black mt-0.5 text-white">
                {formatCurrency(totalMonthlyRequired, currency)}/mo
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 border border-white/10">
              <div className="text-[11px] text-emerald-200 uppercase font-semibold">Available Monthly Surplus</div>
              <div className={`text-lg font-black mt-0.5 ${monthlySurplus >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {formatCurrency(monthlySurplus, currency)}/mo
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/10 border border-white/10">
              <div className="text-[11px] text-emerald-200 uppercase font-semibold">Schedule Feasibility</div>
              <div className="text-sm font-bold mt-1 flex items-center gap-1.5">
                {isSurplusSufficient ? (
                  <span className="text-emerald-300 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Surplus Covered ✓
                  </span>
                ) : (
                  <span className="text-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> Shortfall of {formatCurrency(Math.max(0, totalMonthlyRequired - monthlySurplus), currency)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1 (TOP): INDIVIDUAL MILESTONE GOAL CARDS (MATCHING USER SCREENSHOT) */}
        {goals.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-zinc-100">
              <h3 className="text-xs sm:text-sm font-bold text-slate-700 tracking-wider uppercase">
                INDIVIDUAL MILESTONE GOAL CARDS
              </h3>
              <span className="text-xs text-zinc-400">
                Each card displays its required monthly addition
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {goals.map((goal) => {
                const tenure = Number(goal.tenureYears) || 4;
                const months = tenure * 12;
                const targetAmt = parseNum(goal.targetAmount);
                const saved = parseNum(goal.savedAmount);
                const remaining = Math.max(0, targetAmt - saved);
                const monthlyReq = Math.round(remaining / months);
                const targetYear = goal.targetYear || (currentYear + tenure);
                const pctOfTotal = totalMonthlyRequired > 0 
                  ? Math.round((monthlyReq / totalMonthlyRequired) * 100) 
                  : 100;
                const progressPct = targetAmt > 0 ? Math.min(100, Math.round((saved / targetAmt) * 100)) : 0;
                
                // Find matching category badge
                const catMeta = CATEGORY_OPTIONS.find(c => c.id === goal.category);
                const badgeLabel = catMeta?.badge || goal.category.toUpperCase().replace('_', ' ');

                return (
                  <div
                    key={goal.id}
                    className={`rounded-2xl border p-5 shadow-xs flex flex-col justify-between space-y-4 transition-all group ${
                      goal.hidden 
                        ? 'bg-zinc-50/70 border-zinc-200 opacity-60' 
                        : 'bg-white border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    {/* Top Row: Category Pill & Action Icons (Hide/Unhide + Trash) */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-[#eff6ff] text-[#2563eb] border border-[#bfdbfe] text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-0.5 rounded-full line-clamp-1">
                            {badgeLabel}
                          </span>
                          {goal.hidden && (
                            <span className="bg-zinc-200 text-zinc-700 border border-zinc-300 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full">
                              Hidden
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => toggleGoalHide(goal.id)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              goal.hidden
                                ? 'text-zinc-700 bg-zinc-200 hover:bg-zinc-300'
                                : 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
                            }`}
                            title={goal.hidden ? 'Goal hidden (excluded from calculations). Click to unhide' : 'Click to hide and exclude from calculation'}
                          >
                            {goal.hidden ? <Eye className="w-4 h-4 text-emerald-700" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeGoal(goal.id)}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete goal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Goal Title */}
                      <h4 className="text-sm sm:text-base font-extrabold text-zinc-900 leading-snug min-h-[2.5rem] line-clamp-2">
                        {goal.name || 'Milestone Goal'}
                      </h4>

                      {/* Target & Saved Lines */}
                      <div className="space-y-1.5 text-xs pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500 font-medium">Target Amount:</span>
                          <span className="font-extrabold text-zinc-900">
                            {formatCurrency(targetAmt, currency)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500 font-medium">Saved so far:</span>
                          <span className="font-extrabold text-zinc-900">
                            {formatCurrency(saved, currency)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-blue-600 font-bold pt-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>Tenure & Target: {tenure} Years · Target {targetYear}</span>
                        </div>
                      </div>

                      {/* Blue Progress Bar */}
                      <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mt-2">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Bottom Box (Matching exact screenshot styling) */}
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          REQUIRED MONTHLY ADD:
                        </span>
                        <span className="text-base font-black text-[#059669]">
                          {formatCurrency(monthlyReq, currency)}/mo
                        </span>
                      </div>

                      <div className="border border-emerald-300 bg-white/90 px-2 py-1 rounded-md text-[11px] font-bold text-emerald-800 shadow-2xs shrink-0">
                        {pctOfTotal}% of total SIP
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2 (BELOW): ADD A NEW FUTURE GOAL FORM (THEN ADD NEXT) */}
        <div className="p-6 sm:p-7 rounded-3xl border border-zinc-200/90 bg-white shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#eaf5ef] text-[#1b4d3e] flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <h4 className="text-base font-extrabold text-zinc-900 tracking-tight">
                  Add a New Future Goal
                </h4>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Fill details below and click <strong>Add to Goals</strong> to append as an individual milestone card above.
              </p>
            </div>

            {/* Quick Category Chips */}
            <div className="flex flex-wrap gap-1.5">
              {CATEGORY_OPTIONS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectPreset(c.id, c.label)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                    formCategory === c.id
                      ? 'bg-[#1b4d3e] text-white border-[#1b4d3e]'
                      : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Goal Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-800">
                Goal Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Buy Car, Wedding, Downpayment"
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 focus:border-[#1b4d3e] focus:outline-none shadow-2xs"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-800">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value as GoalCategory)}
                className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 focus:border-[#1b4d3e] focus:outline-none shadow-2xs cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Amount & Current Savings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <CurrencyInput
              label="Target Amount"
              value={formTargetAmount}
              onChange={(val) => setFormTargetAmount(val)}
              currency={currency}
              placeholder="e.g. 800000"
            />

            <CurrencyInput
              label="Current Savings (Already saved for this goal)"
              value={formSavedAmount}
              onChange={(val) => setFormSavedAmount(val)}
              currency={currency}
              placeholder="e.g. 150000"
            />
          </div>

          {/* Configurable Milestone Tenure */}
          <div className="space-y-3 pt-2 border-t border-zinc-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-800">
                Milestone Tenure: <strong className="text-[#1b4d3e] font-extrabold">{formTenureYears} Years ({formTenureYears * 12} Months)</strong> · Target Year: <strong>{formDateInfo.year}</strong>
              </span>
              <span className="text-xs text-zinc-500 hidden sm:inline">
                Synced Completion: {formDateInfo.readable}
              </span>
            </div>

            {/* Quick Tenure Presets */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-xs font-semibold text-zinc-400 mr-1">Quick Presets:</span>
              {TENURE_PRESETS.map((yr) => (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setFormTenureYears(yr)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                    formTenureYears === yr
                      ? 'bg-[#1b4d3e] text-white border-[#1b4d3e] shadow-2xs'
                      : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  {yr}Y
                </button>
              ))}

              {/* Custom Years Input */}
              <div className="flex items-center gap-1 ml-auto">
                <span className="text-xs text-zinc-500">Custom Years:</span>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={formTenureYears}
                  onChange={(e) => setFormTenureYears(Math.max(1, Math.min(40, Number(e.target.value) || 1)))}
                  className="w-16 rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-bold text-zinc-900 focus:border-[#1b4d3e] focus:outline-none text-center"
                />
              </div>
            </div>
          </div>

          {/* Action Row: Live Required Monthly Addition & Add to Goals Button */}
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                Calculated Monthly SIP Pace for This Goal:
              </span>
              <div className="text-xl font-black text-[#1b4d3e]">
                {formatCurrency(formMonthlyRequired, currency)}<span className="text-xs font-semibold text-zinc-500">/mo for {formTenureYears} years</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddGoal}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1b4d3e] hover:bg-[#143d31] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add to Goals & Add Next</span>
            </button>
          </div>

        </div>

      </div>
    </StepCard>
  );
};
