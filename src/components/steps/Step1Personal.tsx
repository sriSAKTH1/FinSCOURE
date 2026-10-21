'use client';

import React from 'react';
import { AssessmentData, CurrencyCode, EmploymentType } from '@/types/assessment';
import { StepCard } from '../ui/StepCard';
import { CurrencyInput } from '../ui/CurrencyInput';
import { ChevronDown, Info } from 'lucide-react';

interface Step1Props {
  data: AssessmentData;
  onChange: (data: AssessmentData) => void;
  showErrors?: boolean;
}

export const Step1Personal: React.FC<Step1Props> = ({ data, onChange, showErrors = false }) => {
  const { personal } = data;

  const isAgeValid = typeof personal.age === 'number' && personal.age >= 18 && personal.age <= 100;
  const isDependentsValid = personal.dependents !== undefined && personal.dependents !== null;
  const isSalaryValid = typeof personal.monthlyTakeHome === 'number' && personal.monthlyTakeHome > 0;

  const updatePersonal = (field: keyof typeof personal, val: any) => {
    onChange({
      ...data,
      personal: {
        ...personal,
        [field]: val,
      },
    });
  };

  return (
    <StepCard
      stepNumber={1}
      title="About you"
      subtitle="A few basics to make your financial plan personal."
    >
      <div className="space-y-7">
        {/* Mandatory Fields Requirement Alert Banner */}
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-amber-200/90 bg-amber-50/70 text-xs sm:text-sm text-amber-900 font-medium">
          <div className="flex items-center gap-2">
            <span className="text-rose-600 font-black text-base leading-none">*</span>
            <span>
              <strong>Mandatory fields:</strong> Age, Dependents, and Salary are required to calculate your FinScore.
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
            <span className={isAgeValid ? 'text-emerald-700' : 'text-zinc-500'}>Age {isAgeValid ? '✓' : '*'}</span>
            <span>•</span>
            <span className={isDependentsValid ? 'text-emerald-700' : 'text-zinc-500'}>Dependents {isDependentsValid ? '✓' : '*'}</span>
            <span>•</span>
            <span className={isSalaryValid ? 'text-emerald-700' : 'text-zinc-500'}>Salary {isSalaryValid ? '✓' : '*'}</span>
          </div>
        </div>

        {/* Row 1: First name, Currency, Age, Dependents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* First Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-semibold text-zinc-800">
              First name
            </label>
            <input
              type="text"
              value={personal.firstName}
              onChange={(e) => updatePersonal('firstName', e.target.value)}
              placeholder="Your first name"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm sm:text-base font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-[#1b4d3e] focus:ring-3 focus:ring-[#1b4d3e]/10 focus:outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Currency */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-semibold text-zinc-800">
              Currency
            </label>
            <div className="relative">
              <select
                value={personal.currency || 'INR'}
                onChange={(e) => updatePersonal('currency', e.target.value as CurrencyCode)}
                className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm sm:text-base font-medium text-zinc-900 focus:border-[#1b4d3e] focus:ring-3 focus:ring-[#1b4d3e]/10 focus:outline-none transition-all shadow-2xs pr-9 cursor-pointer"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-4 pointer-events-none" />
            </div>
          </div>

          {/* Age (Mandatory) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-zinc-800">
                Age <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              {showErrors && !isAgeValid && (
                <span className="text-[11px] font-semibold text-rose-600">Required (18-100)</span>
              )}
            </div>
            <div className={`relative flex items-center rounded-xl border bg-white shadow-2xs transition-all ${
              showErrors && !isAgeValid
                ? 'border-rose-400 ring-2 ring-rose-200'
                : 'border-zinc-200 focus-within:border-[#1b4d3e] focus-within:ring-3 focus-within:ring-[#1b4d3e]/10'
            }`}>
              <input
                type="number"
                min="18"
                max="100"
                value={personal.age === '' ? '' : personal.age}
                onChange={(e) => updatePersonal('age', e.target.value === '' ? '' : parseInt(e.target.value) || '')}
                placeholder="e.g. 28"
                className="w-full bg-transparent px-4 py-3 text-sm sm:text-base font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
              />
              <span className="pr-4 text-xs sm:text-sm text-zinc-400 font-medium select-none">
                years
              </span>
            </div>
          </div>

          {/* Dependents (Mandatory) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-zinc-800">
                Dependents <span className="text-rose-500 font-bold ml-0.5">*</span>
              </label>
              {showErrors && !isDependentsValid && (
                <span className="text-[11px] font-semibold text-rose-600">Required</span>
              )}
            </div>
            <div className="relative">
              <select
                value={personal.dependents ?? 0}
                onChange={(e) => updatePersonal('dependents', parseInt(e.target.value) || 0)}
                className={`w-full appearance-none rounded-xl border bg-white px-4 py-3 text-sm sm:text-base font-medium text-zinc-900 focus:outline-none transition-all shadow-2xs pr-9 cursor-pointer ${
                  showErrors && !isDependentsValid
                    ? 'border-rose-400 ring-2 ring-rose-200'
                    : 'border-zinc-200 focus:border-[#1b4d3e] focus:ring-3 focus:ring-[#1b4d3e]/10'
                }`}
              >
                <option value={0}>0 dependents (Just me)</option>
                <option value={1}>1 dependent</option>
                <option value={2}>2 dependents</option>
                <option value={3}>3 dependents</option>
                <option value={4}>4 dependents</option>
                <option value={5}>5+ dependents</option>
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3.5 top-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Row 2: Salary · monthly take-home (Mandatory), Occupation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          <div className="flex flex-col">
            <CurrencyInput
              label={
                <span className="inline-flex items-center gap-1">
                  Salary · monthly take-home <span className="text-rose-500 font-bold">*</span>
                </span>
              }
              value={personal.monthlyTakeHome}
              onChange={(val) => updatePersonal('monthlyTakeHome', val)}
              currency={personal.currency}
              placeholder="Enter amount (e.g. 75,000)"
              helperText="Net in-hand pay deposited into your account each month."
              className={showErrors && !isSalaryValid ? 'border-rose-400 ring-2 ring-rose-200' : ''}
            />
            {showErrors && !isSalaryValid && (
              <span className="text-[11px] font-semibold text-rose-600 mt-1">
                Please enter a valid monthly salary greater than 0 *
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs sm:text-sm font-semibold text-zinc-800">
              Occupation
            </label>
            <input
              type="text"
              value={personal.occupation}
              onChange={(e) => updatePersonal('occupation', e.target.value)}
              placeholder="What do you do for work?"
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm sm:text-base font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-[#1b4d3e] focus:ring-3 focus:ring-[#1b4d3e]/10 focus:outline-none transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Employment Type Selection */}
        <div className="flex flex-col gap-2 pt-2">
          <label className="text-xs sm:text-sm font-semibold text-zinc-800">
            Employment type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'salaried', label: 'Salaried' },
              { id: 'self-employed', label: 'Self-employed' },
              { id: 'freelancer', label: 'Freelancer' },
              { id: 'business', label: 'Business Owner' },
              { id: 'other', label: 'Other' },
            ].map((emp) => {
              const active = personal.employmentType === emp.id;
              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => updatePersonal('employmentType', emp.id as EmploymentType)}
                  className={`py-2 px-3 text-xs sm:text-sm font-medium rounded-xl border transition-all text-center cursor-pointer ${
                    active
                      ? 'bg-[#eaf5ef] text-[#1b4d3e] font-bold border-[#b7dfcb] shadow-xs'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  {emp.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional Household details */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-semibold text-zinc-800">
              Household notes <span className="text-zinc-400 font-normal">(optional)</span>
            </label>
            <span className="text-[11px] text-zinc-400">Helps calibrate insurance & emergency goals</span>
          </div>
          <input
            type="text"
            value={personal.householdDetails || ''}
            onChange={(e) => updatePersonal('householdDetails', e.target.value)}
            placeholder="e.g. Single earner, supporting elderly parents, renting city flat..."
            className="w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 focus:border-[#1b4d3e] focus:ring-3 focus:ring-[#1b4d3e]/10 focus:outline-none transition-all shadow-2xs"
          />
        </div>
      </div>
    </StepCard>
  );
};
