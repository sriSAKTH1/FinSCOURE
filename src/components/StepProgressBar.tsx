'use client';

import React from 'react';
import { 
  User, 
  Receipt, 
  CreditCard, 
  ShieldCheck, 
  PiggyBank, 
  TrendingUp, 
  Target, 
  CheckCircle2, 
  ClipboardCheck 
} from 'lucide-react';

interface StepProgressBarProps {
  currentStep: number;
  onStepClick: (step: number) => void;
  completedSteps?: number[];
}

const STEPS = [
  { step: 1, label: 'About you', icon: User },
  { step: 2, label: 'Expenses', icon: Receipt },
  { step: 3, label: 'Loans & Debt', icon: CreditCard },
  { step: 4, label: 'Insurance', icon: ShieldCheck },
  { step: 5, label: 'Emergency Fund', icon: PiggyBank },
  { step: 6, label: 'Investments', icon: TrendingUp },
  { step: 7, label: 'Goals', icon: Target },
  { step: 8, label: 'Review', icon: ClipboardCheck },
];

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  onStepClick,
}) => {
  const progressPct = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="w-full bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl shadow-2xs px-4 sm:px-6 py-3.5 sm:py-4 transition-all">
      <div className="w-full">
        {/* Top title and percentage */}
        <div className="flex items-center justify-between text-xs text-zinc-500 mb-2.5">
          <span className="font-semibold text-zinc-700">
            Step {currentStep} of {STEPS.length} · {STEPS[currentStep - 1]?.label}
          </span>
          <span className="font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80">
            {progressPct}% Complete
          </span>
        </div>

        {/* Linear progress bar */}
        <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden mb-3.5">
          <div
            className="bg-gradient-to-r from-emerald-600 to-teal-500 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Step chips / icons for desktop & tablet */}
        <div className="hidden sm:grid grid-cols-8 gap-1.5 sm:gap-2">
          {STEPS.map((s) => {
            const isCurrent = s.step === currentStep;
            const isCompleted = s.step < currentStep;
            const Icon = s.icon;

            return (
              <button
                key={s.step}
                type="button"
                onClick={() => onStepClick(s.step)}
                className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all text-center group cursor-pointer ${
                  isCurrent
                    ? 'bg-[#eaf5ef] border border-[#b7dfcb] shadow-xs'
                    : isCompleted
                    ? 'hover:bg-zinc-50 text-zinc-600'
                    : 'opacity-50 hover:opacity-80 text-zinc-400'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-transform ${
                    isCurrent
                      ? 'bg-[#1b4d3e] text-white shadow-xs scale-105'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-zinc-100 text-zinc-500 group-hover:bg-zinc-200'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : s.step}
                </div>
                <span
                  className={`text-[11px] leading-tight font-medium line-clamp-1 ${
                    isCurrent ? 'text-[#1b4d3e] font-bold' : isCompleted ? 'text-zinc-700' : 'text-zinc-400'
                  }`}
                >
                  {s.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
