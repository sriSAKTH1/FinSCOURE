'use client';

import React, { useState, useEffect } from 'react';
import { CurrencyCode, ExpenseFrequency } from '@/types/assessment';
import { formatPriceWithWords, parseShorthandAmount, getPriceHighlight } from '@/utils/numberToWords';
import { FrequencyToggle } from './FrequencyToggle';

interface CurrencyInputProps {
  label?: React.ReactNode;
  value: number | string | '';
  onChange: (val: number | '') => void;
  currency?: CurrencyCode;
  placeholder?: string;
  frequency?: ExpenseFrequency;
  onFrequencyChange?: (freq: ExpenseFrequency) => void;
  helperText?: string;
  trailingText?: string;
  className?: string;
  disabled?: boolean;
  showPriceInWords?: boolean;
  showQuickChips?: boolean;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  label,
  value,
  onChange,
  currency = 'INR',
  placeholder = 'eg. 1k',
  frequency,
  onFrequencyChange,
  helperText,
  trailingText,
  className = '',
  disabled = false,
  showPriceInWords = true,
  showQuickChips = false,
}) => {
  const symbol = '₹';
  const isMuted = frequency === 'N';

  // Local text input state to allow typing shorthand like "1k", "2l", "1cr"
  const [inputText, setInputText] = useState<string>(
    value === '' || value === undefined || value === null ? '' : String(value)
  );

  // Sync when external value changes
  useEffect(() => {
    if (value === '' || value === undefined || value === null) {
      setInputText('');
    } else {
      const parsedCurrent = parseShorthandAmount(inputText);
      if (parsedCurrent !== value) {
        setInputText(String(value));
      }
    }
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputText(raw);

    if (raw.trim() === '') {
      onChange('');
      return;
    }

    const parsed = parseShorthandAmount(raw);
    if (parsed !== '') {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    if (inputText.trim() === '') {
      onChange('');
      return;
    }
    const parsed = parseShorthandAmount(inputText);
    if (parsed !== '') {
      onChange(parsed);
      setInputText(String(parsed));
    }
  };

  const numericValue = typeof value === 'number' ? value : parseShorthandAmount(value);
  const highlight = isMuted ? null : getPriceHighlight(numericValue, 'INR');

  const quickChips = [
    { label: '1k', val: 1000 },
    { label: '10k', val: 10000 },
    { label: '50k', val: 50000 },
    { label: '1L', val: 100000 },
    { label: '5L', val: 500000 },
    { label: '10L', val: 1000000 },
    { label: '1Cr', val: 10000000 },
  ];

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs sm:text-sm font-semibold text-zinc-800">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        <div
          className={`relative flex-1 flex items-center rounded-xl border bg-white shadow-2xs transition-all ${
            isMuted
              ? 'border-zinc-200/60 bg-zinc-50/50 opacity-60'
              : 'border-zinc-200 hover:border-zinc-300 focus-within:border-[#1b4d3e] focus-within:ring-3 focus-within:ring-[#1b4d3e]/10'
          }`}
        >
          {/* INR Currency Symbol Prefix */}
          <span className="pl-4 text-emerald-800 select-none text-sm sm:text-base font-bold">
            ₹
          </span>

          {/* Number & Shorthand Input (Supports 100, 1k, 1L, 1Cr, 50000, etc.) */}
          <input
            type="text"
            disabled={disabled || isMuted}
            value={isMuted ? '0' : inputText}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder={placeholder}
            className="w-full bg-transparent px-3 py-3 text-sm sm:text-base font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none disabled:cursor-not-allowed"
          />

          {trailingText && (
            <span className="pr-4 text-xs sm:text-sm text-zinc-400 select-none font-medium">
              {trailingText}
            </span>
          )}
        </div>

        {/* Optional frequency pill toggle [N | M | W] */}
        {frequency && onFrequencyChange && (
          <FrequencyToggle value={frequency} onChange={onFrequencyChange} />
        )}
      </div>

      {/* Real-time Highlighted Amount Preview: Shows compact tag (100, 1k, 1L, 1Cr) + formatted amount + words only when a value is entered */}
      {showPriceInWords && !isMuted && highlight && (
        <div className="flex flex-wrap items-center gap-2 pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-[#eaf5ef] text-[#1b4d3e] rounded-xl border border-[#b7dfcb] shadow-xs">
            {/* Shorthand Tag Badge (100, 1k, 1L, 1Cr) */}
            <span className="px-2 py-0.5 rounded-md bg-[#1b4d3e] text-white font-black text-xs tracking-wide shadow-2xs">
              {highlight.compact}
            </span>
            {/* Formatted Number */}
            <span className="font-extrabold text-zinc-900 text-xs sm:text-sm">
              {highlight.formatted}
            </span>
            <span className="text-emerald-400 font-bold">•</span>
            {/* Indian Numbering Words */}
            <span className="font-semibold text-[#1b4d3e] text-[11px] sm:text-xs">
              {highlight.words}
            </span>
          </div>

          {/* Quick Shorthand Clickable Chips if enabled */}
          {showQuickChips && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-zinc-400 font-medium mr-0.5">Quick:</span>
              {quickChips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => {
                    onChange(chip.val);
                    setInputText(chip.label);
                  }}
                  className="px-2 py-0.5 text-[11px] font-bold text-zinc-700 hover:text-[#1b4d3e] bg-zinc-100 hover:bg-[#eaf5ef] rounded-md border border-zinc-200 transition-colors cursor-pointer"
                >
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {helperText && (
        <span className="text-[11px] text-zinc-400">{helperText}</span>
      )}
    </div>
  );
};
