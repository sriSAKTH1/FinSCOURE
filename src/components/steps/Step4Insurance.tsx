'use client';

import React from 'react';
import { AssessmentData, HealthInsurance, LifeInsurance } from '@/types/assessment';
import { StepCard } from '../ui/StepCard';
import { CurrencyInput } from '../ui/CurrencyInput';
import { formatCurrency, parseNum } from '@/utils/calculations';
import { ShieldCheck, HeartPulse, UserCheck, AlertCircle } from 'lucide-react';

interface Step4Props {
  data: AssessmentData;
  onChange: (data: AssessmentData) => void;
}

export const Step4Insurance: React.FC<Step4Props> = ({ data, onChange }) => {
  const { healthInsurance, lifeInsurance, personal } = data;
  const currency = personal.currency;
  const hasDependents = personal.dependents > 0;

  const updateHealth = (field: keyof HealthInsurance, val: any) => {
    onChange({
      ...data,
      healthInsurance: {
        ...healthInsurance,
        [field]: val,
      },
    });
  };

  const updateLife = (field: keyof LifeInsurance, val: any) => {
    onChange({
      ...data,
      lifeInsurance: {
        ...lifeInsurance,
        [field]: val,
      },
    });
  };

  return (
    <StepCard
      stepNumber={4}
      title="Insurance protection"
      subtitle="Ensure health & life coverage adequately cushions your family from unexpected shocks."
    >
      <div className="space-y-8">
        {/* Section 1: Health Insurance (Separate Card) */}
        <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <HeartPulse className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Health Insurance</h3>
                <p className="text-xs text-zinc-500">Protection against hospitalization and critical medical expenses</p>
              </div>
            </div>

            {/* Toggle has cover */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateHealth('hasCover', true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${healthInsurance.hasCover
                    ? 'bg-[#eaf5ef] text-[#1b4d3e] border-[#b7dfcb]'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
                  }`}
              >
                Covered
              </button>
              <button
                type="button"
                onClick={() => updateHealth('hasCover', false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${!healthInsurance.hasCover
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
                  }`}
              >
                No Cover
              </button>
            </div>
          </div>

          {healthInsurance.hasCover ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <CurrencyInput
                label="Sum Insured (Coverage Amount)"
                value={healthInsurance.sumInsured}
                onChange={(val) => updateHealth('sumInsured', val)}
                currency={currency}
                placeholder="e.g. 1000000"
                helperText="Total annual hospitalization limit"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-800">
                  Policy Type
                </label>
                <select
                  value={healthInsurance.policyType}
                  onChange={(e) => updateHealth('policyType', e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 focus:border-[#1b4d3e] focus:outline-none"
                >
                  <option value="individual">Individual Plan (Single person)</option>
                  <option value="family_floater">Family Floater (Shared limit)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-800">
                  Policy Source
                </label>
                <select
                  value={healthInsurance.source}
                  onChange={(e) => updateHealth('source', e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 focus:border-[#1b4d3e] focus:outline-none"
                >
                  <option value="employer">Employer / Corporate Provided</option>
                  <option value="retail">Personal / Retail Policy</option>
                  <option value="both">Both Employer & Personal</option>
                </select>
              </div>

              <CurrencyInput
                label="Annual Premium Paid"
                value={healthInsurance.annualPremium}
                onChange={(val) => updateHealth('annualPremium', val)}
                currency={currency}
                placeholder="e.g. 15000"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-800">
                  Family Members Covered
                </label>
                <input
                  type="number"
                  min="1"
                  value={healthInsurance.coveredMembers}
                  onChange={(e) => updateHealth('coveredMembers', parseInt(e.target.value) || 1)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 focus:border-[#1b4d3e] focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                Medical emergencies are a leading cause of sudden wealth erosion. Maintaining dedicated health cover is vital for financial health.
              </span>
            </div>
          )}
        </div>

        {/* Section 2: Life Insurance (Separate Card) */}
        <div className="p-6 rounded-2xl border border-zinc-200 bg-white shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Life Insurance</h3>
                <p className="text-xs text-zinc-500">Income replacement for family dependents</p>
              </div>
            </div>

            {/* Toggle has cover */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => updateLife('hasCover', true)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${lifeInsurance.hasCover
                    ? 'bg-[#eaf5ef] text-[#1b4d3e] border-[#b7dfcb]'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
                  }`}
              >
                Covered
              </button>
              <button
                type="button"
                onClick={() => updateLife('hasCover', false)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${!lifeInsurance.hasCover
                    ? 'bg-zinc-100 text-zinc-700 border-zinc-200'
                    : 'bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50'
                  }`}
              >
                No Cover
              </button>
            </div>
          </div>

          {/* Special Dependents Context Banner */}
          {!hasDependents && (
            <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Zero Dependents:</strong> Since no one relies financially on your income, term life insurance is optional and you will not be penalized in your FinScore.
              </span>
            </div>
          )}

          {hasDependents && !lifeInsurance.hasCover && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You have {personal.dependents} dependent(s). Pure term life insurance equal to 10–15x your annual income is recommended to secure their future.
              </span>
            </div>
          )}

          {lifeInsurance.hasCover && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <CurrencyInput
                label="Sum Assured (Death Benefit)"
                value={lifeInsurance.sumAssured}
                onChange={(val) => updateLife('sumAssured', val)}
                currency={currency}
                placeholder="e.g. 5000000"
                helperText="Target is ~10x annual income"
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-800">
                  Policy Type
                </label>
                <select
                  value={lifeInsurance.policyType}
                  onChange={(e) => updateLife('policyType', e.target.value)}
                  className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 focus:border-[#1b4d3e] focus:outline-none"
                >
                  <option value="term">Pure Term Insurance (Recommended)</option>
                  <option value="endowment">Endowment / Money Back Plan</option>
                  <option value="ulip">ULIP / Unit Linked Plan</option>
                  <option value="other">Whole Life / Other</option>
                </select>
              </div>

              <CurrencyInput
                label="Annual Premium Paid"
                value={lifeInsurance.annualPremium}
                onChange={(val) => updateLife('annualPremium', val)}
                currency={currency}
                placeholder="e.g. 20000"
              />
            </div>
          )}
        </div>
      </div>
    </StepCard>
  );
};
