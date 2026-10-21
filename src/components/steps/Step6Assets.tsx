'use client';

import React from 'react';
import { AssessmentData, AssetCategory, AssetItem } from '@/types/assessment';
import { StepCard } from '../ui/StepCard';
import { CurrencyInput } from '../ui/CurrencyInput';
import { formatCurrency, parseNum } from '@/utils/calculations';
import { Plus, Trash2, PieChart, Coins } from 'lucide-react';

interface Step6Props {
  data: AssessmentData;
  onChange: (data: AssessmentData) => void;
}

const ASSET_CATEGORIES: { id: AssetCategory; label: string; badgeColor: string }[] = [
  { id: 'stocks_mf', label: 'Stocks & Mutual Funds', badgeColor: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'fixed_deposits', label: 'Fixed & Recurring Deposits', badgeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'epf_ppf_nps', label: 'EPF, PPF, NPS & Pension', badgeColor: 'bg-teal-50 text-teal-800 border-teal-200' },
  { id: 'gold', label: 'Physical & Sovereign Gold', badgeColor: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'real_estate', label: 'Real Estate / Land', badgeColor: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'cash_bank', label: 'Cash & Savings Balances', badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-200' },
  { id: 'crypto_alt', label: 'Cryptocurrency & Alternatives', badgeColor: 'bg-rose-50 text-rose-800 border-rose-200' },
];

export const Step6Assets: React.FC<Step6Props> = ({ data, onChange }) => {
  const { assets, personal } = data;
  const currency = personal.currency;

  const addAsset = (presetCategory?: AssetCategory) => {
    const newAsset: AssetItem = {
      id: `asset-${Date.now()}`,
      category: presetCategory || 'stocks_mf',
      name: '',
      currentValue: '',
      monthlyContribution: '',
      expectedReturn: 10,
    };
    onChange({
      ...data,
      assets: [...assets, newAsset],
    });
  };

  const removeAsset = (id: string) => {
    onChange({
      ...data,
      assets: assets.filter((a) => a.id !== id),
    });
  };

  const updateAsset = (id: string, field: keyof AssetItem, val: any) => {
    onChange({
      ...data,
      assets: assets.map((a) => (a.id === id ? { ...a, [field]: val } : a)),
    });
  };

  const totalAssetValue = assets.reduce((acc, a) => acc + parseNum(a.currentValue), 0);
  const totalMonthlyContribution = assets.reduce((acc, a) => acc + parseNum(a.monthlyContribution), 0);

  return (
    <StepCard
      stepNumber={6}
      title="Investments and assets"
      subtitle="Track your current net assets, ongoing monthly SIPs/contributions, and diversification."
      headerAction={
        <div className="text-right hidden sm:block">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Portfolio Value</div>
          <div className="text-base font-extrabold text-[#1b4d3e]">
            {formatCurrency(totalAssetValue, currency)}
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-bold text-zinc-900 tracking-tight">Your Portfolio Holdings & Assets</h3>
            <p className="text-xs text-zinc-500">Track mutual funds, stocks, PF/EPF, deposits, and real estate.</p>
          </div>
          <button
            type="button"
            onClick={() => addAsset('stocks_mf')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#1b4d3e] border border-emerald-200 transition-all cursor-pointer shadow-2xs shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Investment</span>
          </button>
        </div>

        {/* Quick Add Preset Buttons */}
        <div>
          <label className="text-xs font-semibold text-zinc-600 block mb-2">
            Quick Add Asset Type:
          </label>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {ASSET_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => addAsset(cat.id)}
                className="text-xs font-medium px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Plus className="w-3 h-3 text-zinc-400" />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Asset List */}
        {assets.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/50 space-y-3">
            <Coins className="w-10 h-10 text-zinc-300 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-800">No assets recorded yet</h4>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Adding mutual funds, stocks, PF/EPF, deposits, or gold helps calculate your total net worth and long-term compounding.
            </p>
            <button
              type="button"
              onClick={() => addAsset('stocks_mf')}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-[#1b4d3e] text-white hover:bg-[#143d31] transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4" /> Add First Asset
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {assets.map((asset, idx) => {
              const categoryMeta = ASSET_CATEGORIES.find((c) => c.id === asset.category) || ASSET_CATEGORIES[0];

              return (
                <div
                  key={asset.id}
                  className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-2xs space-y-4 hover:border-zinc-300 transition-all"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${categoryMeta.badgeColor}`}>
                        {categoryMeta.label}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeAsset(asset.id)}
                      className="text-zinc-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Remove asset"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Category Selector */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-800">Asset Category</label>
                      <select
                        value={asset.category}
                        onChange={(e) => updateAsset(asset.id, 'category', e.target.value as AssetCategory)}
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 focus:border-[#1b4d3e] focus:outline-none"
                      >
                        {ASSET_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Name / Description */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-zinc-800">Account / Asset Name</label>
                      <input
                        type="text"
                        value={asset.name}
                        onChange={(e) => updateAsset(asset.id, 'name', e.target.value)}
                        placeholder="e.g. S&P 500 Index / HDFC SIP"
                        className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm font-medium text-zinc-900 focus:border-[#1b4d3e] focus:outline-none"
                      />
                    </div>

                    {/* Current Value */}
                    <CurrencyInput
                      label="Current Value"
                      value={asset.currentValue}
                      onChange={(val) => updateAsset(asset.id, 'currentValue', val)}
                      currency={currency}
                      placeholder="e.g. 50000"
                    />

                    {/* Monthly Contribution */}
                    <CurrencyInput
                      label="Monthly SIP / Addition"
                      value={asset.monthlyContribution}
                      onChange={(val) => updateAsset(asset.id, 'monthlyContribution', val)}
                      currency={currency}
                      placeholder="e.g. 500"
                    />
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={() => addAsset()}
              className="w-full py-3 border-2 border-dashed border-zinc-200 hover:border-[#1b4d3e] hover:bg-[#eaf5ef]/30 rounded-2xl text-xs sm:text-sm font-bold text-zinc-700 hover:text-[#1b4d3e] flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add another investment holding</span>
            </button>
          </div>
        )}

        {/* Portfolio Summary Card */}
        {assets.length > 0 && (
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-zinc-500">Total Portfolio Holdings</div>
              <div className="text-base font-extrabold text-zinc-900">
                {formatCurrency(totalAssetValue, currency)}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-zinc-500">Monthly Investment Discipline (SIPs)</div>
              <div className="text-base font-extrabold text-emerald-800">
                +{formatCurrency(totalMonthlyContribution, currency)}/mo
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-zinc-500">Holdings Count</div>
              <div className="text-base font-extrabold text-zinc-900">
                {assets.length} Assets
              </div>
            </div>
          </div>
        )}
      </div>
    </StepCard>
  );
};
