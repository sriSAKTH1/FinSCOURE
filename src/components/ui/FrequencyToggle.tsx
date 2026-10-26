'use client';

import React from 'react';
import { ExpenseFrequency } from '@/types/assessment';

interface FrequencyToggleProps {
  value: ExpenseFrequency;
  onChange: (val: ExpenseFrequency) => void;
}

export const FrequencyToggle: React.FC<FrequencyToggleProps> = ({ value, onChange }) => {
  const options: { id: ExpenseFrequency; label: string; tooltip: string; activeStyle: string }[] = [
    {
      id: 'N',
      label: 'N',
      tooltip: 'Need: Essential survival need (included in Emergency Fund)',
      activeStyle: 'bg-emerald-600 text-white font-extrabold shadow-xs',
    },
    {
      id: 'E',
      label: 'E',
      tooltip: 'Expense: Regular recurring expense (included in Emergency Fund)',
      activeStyle: 'bg-blue-600 text-white font-extrabold shadow-xs',
    },
    {
      id: 'W',
      label: 'W',
      tooltip: 'Want: Discretionary / lifestyle spend (excluded from Emergency Fund)',
      activeStyle: 'bg-amber-500 text-white font-extrabold shadow-xs',
    },
  ];

  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-50/80 p-0.5 select-none shrink-0 shadow-2xs">
      {options.map((opt) => {
        const isActive = value === opt.id || (opt.id === 'E' && value === 'M');
        return (
          <button
            key={opt.id}
            type="button"
            title={opt.tooltip}
            onClick={() => onChange(opt.id)}
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs transition-all rounded-md cursor-pointer ${
              isActive
                ? opt.activeStyle
                : 'text-zinc-500 font-semibold hover:text-zinc-900 hover:bg-white/80'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
