'use client';

import React from 'react';
import { ExpenseFrequency } from '@/types/assessment';

interface FrequencyToggleProps {
  value: ExpenseFrequency;
  onChange: (val: ExpenseFrequency) => void;
}

export const FrequencyToggle: React.FC<FrequencyToggleProps> = ({ value, onChange }) => {
  const options: { id: ExpenseFrequency; label: string; tooltip: string }[] = [
    { id: 'N', label: 'N', tooltip: 'None / Zero' },
    { id: 'M', label: 'M', tooltip: 'Monthly amount' },
    { id: 'W', label: 'W', tooltip: 'Weekly amount' },
  ];

  return (
    <div className="inline-flex items-center rounded-lg border border-zinc-200 bg-zinc-50/70 p-0.5 select-none shrink-0 shadow-2xs">
      {options.map((opt) => {
        const isActive = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            title={opt.tooltip}
            onClick={() => onChange(opt.id)}
            className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center text-xs transition-all rounded-md cursor-pointer ${
              isActive
                ? 'bg-[#eaf5ef] text-[#1b4d3e] font-bold border border-[#b7dfcb] shadow-xs'
                : 'text-zinc-500 font-medium hover:text-zinc-800 hover:bg-white/60'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
};
