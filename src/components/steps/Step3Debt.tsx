'use client';

import React, { useState } from 'react';
import { AssessmentData, LoanItem, LoanType } from '@/types/assessment';
import { StepCard } from '../ui/StepCard';
import { CurrencyInput } from '../ui/CurrencyInput';
import { formatCurrency, parseNum } from '@/utils/calculations';
import { 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Home, 
  Car, 
  GraduationCap, 
  AlertTriangle,
  Receipt,
  Layers,
  Sparkles
} from 'lucide-react';

interface Step3Props {
  data: AssessmentData;
  onChange: (data: AssessmentData) => void;
}

const LOAN_TYPES: { id: LoanType; label: string; badge: string; icon: any; highInterest?: boolean }[] = [
  { id: 'home', label: 'Home Loan / Mortgage', badge: 'HOME LOAN / MORTGAGE', icon: Home },
  { id: 'auto', label: 'Auto / Vehicle Loan', badge: 'AUTO / VEHICLE LOAN', icon: Car },
  { id: 'personal', label: 'Personal Loan', badge: 'PERSONAL LOAN', icon: CreditCard, highInterest: true },
  { id: 'education', label: 'Education Loan', badge: 'EDUCATION LOAN', icon: GraduationCap },
  { id: 'credit_card', label: 'Credit Card Balance', badge: 'CREDIT CARD BALANCE', icon: CreditCard, highInterest: true },
  { id: 'consumer_durable', label: 'Consumer Durable / BNPL', badge: 'CONSUMER BNPL', icon: Receipt, highInterest: true },
  { id: 'other', label: 'Other Debt', badge: 'OTHER DEBT', icon: Layers },
];

export const Step3Debt: React.FC<Step3Props> = ({ data, onChange }) => {
  const { hasLoans, loans, personal } = data;
  const currency = personal.currency;
  const income = parseNum(personal.monthlyTakeHome);

  // Helper to compute payoff date from remaining months
  const computePayoffDate = (monthsCount: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + (monthsCount || 12));
    const year = d.getFullYear();
    const readable = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    return { year, readable };
  };

  // State for the "Add Loan" form
  const [formType, setFormType] = useState<LoanType>('home');
  const [formName, setFormName] = useState('Home Loan');
  const [formPrincipal, setFormPrincipal] = useState<number | ''>(2500000);
  const [formMonthlyEmi, setFormMonthlyEmi] = useState<number | ''>(22000);
  const [formInterestRate, setFormInterestRate] = useState<number | ''>(8.5);
  const [formRemainingMonths, setFormRemainingMonths] = useState<number | ''>(180);
  const [formIsOverdue, setFormIsOverdue] = useState(false);
  const [formOverdueAmount, setFormOverdueAmount] = useState<number | ''>('');

  const toggleNoDebt = (noDebt: boolean) => {
    onChange({
      ...data,
      hasLoans: !noDebt,
      loans: noDebt ? [] : data.loans,
    });
  };

  // Save the currently filled loan and reset form to ADD NEXT
  const handleAddLoan = () => {
    const newLoan: LoanItem = {
      id: `loan-${Date.now()}`,
      type: formType,
      customName: formName.trim() || 'Active Loan',
      principal: parseNum(formPrincipal) || 0,
      monthlyEmi: parseNum(formMonthlyEmi) || 0,
      interestRate: parseNum(formInterestRate) || 0,
      remainingMonths: parseNum(formRemainingMonths) || 12,
      overdueAmount: formIsOverdue ? parseNum(formOverdueAmount) || 0 : 0,
      isOverdue: formIsOverdue,
    };

    onChange({
      ...data,
      hasLoans: true,
      loans: [...loans, newLoan],
    });

    // Reset form for next loan
    setFormType('personal');
    setFormName('');
    setFormPrincipal('');
    setFormMonthlyEmi('');
    setFormInterestRate('');
    setFormRemainingMonths('');
    setFormIsOverdue(false);
    setFormOverdueAmount('');
  };

  const removeLoan = (id: string) => {
    const updated = loans.filter((l) => l.id !== id);
    onChange({
      ...data,
      loans: updated,
      hasLoans: updated.length > 0,
    });
  };

  const handleSelectPreset = (typeId: LoanType, label: string) => {
    setFormType(typeId);
    setFormName(label);
    if (typeId === 'home') {
      setFormPrincipal(3000000);
      setFormMonthlyEmi(26000);
      setFormInterestRate(8.5);
      setFormRemainingMonths(180);
    } else if (typeId === 'auto') {
      setFormPrincipal(700000);
      setFormMonthlyEmi(14500);
      setFormInterestRate(9.0);
      setFormRemainingMonths(48);
    } else if (typeId === 'personal') {
      setFormPrincipal(250000);
      setFormMonthlyEmi(8500);
      setFormInterestRate(12.5);
      setFormRemainingMonths(36);
    } else if (typeId === 'credit_card') {
      setFormPrincipal(60000);
      setFormMonthlyEmi(5000);
      setFormInterestRate(36.0);
      setFormRemainingMonths(12);
    } else if (typeId === 'education') {
      setFormPrincipal(500000);
      setFormMonthlyEmi(9000);
      setFormInterestRate(9.5);
      setFormRemainingMonths(60);
    }
  };

  const totalPrincipal = loans.reduce((acc, l) => acc + parseNum(l.principal), 0);
  const totalEmi = loans.reduce((acc, l) => acc + parseNum(l.monthlyEmi), 0);
  const emiRatio = income > 0 ? Math.round((totalEmi / income) * 100) : 0;

  return (
    <StepCard
      stepNumber={3}
      title="Loans and debt"
      subtitle="Track loans, EMIs, interest rates, and evaluate your debt-to-income health."
      headerAction={
        hasLoans && loans.length > 0 ? (
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Total Monthly EMI</div>
            <div className="text-base font-extrabold text-[#1b4d3e]">
              {formatCurrency(totalEmi, currency)}/mo ({emiRatio}%)
            </div>
          </div>
        ) : null
      }
    >
      <div className="space-y-8">
        
        {/* Debt-free prompt toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${!hasLoans ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-500'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-900">
                Do you currently have any outstanding loans or credit card balances?
              </div>
              <div className="text-xs text-zinc-500">
                Being debt-free awards maximum points (25/25) for Pillar 4.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              type="button"
              onClick={() => toggleNoDebt(true)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${!hasLoans
                  ? 'bg-[#eaf5ef] text-[#1b4d3e] border-[#b7dfcb] shadow-2xs'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
            >
              No outstanding debt
            </button>
            <button
              type="button"
              onClick={() => toggleNoDebt(false)}
              className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${hasLoans
                  ? 'bg-[#1b4d3e] text-white border-[#1b4d3e] shadow-2xs'
                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
            >
              I have loans / debt
            </button>
          </div>
        </div>

        {/* SECTION 1 (TOP): INDIVIDUAL LOAN & DEBT CARDS (MATCHING SCREENSHOT AESTHETICS) */}
        {hasLoans && loans.length > 0 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-zinc-100">
              <h3 className="text-xs sm:text-sm font-bold text-slate-700 tracking-wider uppercase">
                INDIVIDUAL LOAN & DEBT CARDS
              </h3>
              <span className="text-xs text-zinc-400">
                Each card displays its monthly EMI and payoff timeline
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {loans.map((loan) => {
                const principal = parseNum(loan.principal);
                const emi = parseNum(loan.monthlyEmi);
                const rate = parseNum(loan.interestRate);
                const months = Number(loan.remainingMonths) || 12;
                const payoff = computePayoffDate(months);
                const emiPct = income > 0 ? Math.round((emi / income) * 100) : 0;
                const isHighRate = rate >= 14 || loan.type === 'credit_card' || loan.type === 'consumer_durable';

                const typeMeta = LOAN_TYPES.find(t => t.id === loan.type);
                const badgeLabel = typeMeta?.badge || loan.type.toUpperCase().replace('_', ' ');

                return (
                  <div
                    key={loan.id}
                    className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-all group"
                  >
                    {/* Top Row: Category Pill & Trash Icon */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-extrabold tracking-wide uppercase px-2.5 py-0.5 rounded-full line-clamp-1 border ${
                          isHighRate
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]'
                        }`}>
                          {badgeLabel}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLoan(loan.id)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete loan"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Loan Title */}
                      <h4 className="text-sm sm:text-base font-extrabold text-zinc-900 leading-snug min-h-[2.5rem] line-clamp-2">
                        {loan.customName || typeMeta?.label || 'Active Loan'}
                      </h4>

                      {/* Principal & Interest Lines */}
                      <div className="space-y-1.5 text-xs pt-1">
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500 font-medium">Principal Outstanding:</span>
                          <span className="font-extrabold text-zinc-900">
                            {formatCurrency(principal, currency)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-zinc-500 font-medium">Interest Rate:</span>
                          <span className={`font-extrabold ${isHighRate ? 'text-rose-600' : 'text-zinc-900'}`}>
                            {rate}% p.a. {isHighRate && '(High)'}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-blue-600 font-bold pt-1">
                          <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>Tenure & Payoff: {months} Mos · Target {payoff.readable}</span>
                        </div>
                      </div>

                      {/* Overdue alert if applicable */}
                      {loan.isOverdue && (
                        <div className="text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg px-2.5 py-1 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Overdue: {formatCurrency(parseNum(loan.overdueAmount), currency)}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Box (Matching exact screenshot styling) */}
                    <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl p-3 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          MONTHLY EMI:
                        </span>
                        <span className="text-base font-black text-[#059669]">
                          {formatCurrency(emi, currency)}/mo
                        </span>
                      </div>

                      <div className="border border-emerald-300 bg-white/90 px-2 py-1 rounded-md text-[11px] font-bold text-emerald-800 shadow-2xs shrink-0">
                        {emiPct}% of income
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SECTION 2 (BELOW): ADD A NEW LOAN OR DEBT FORM (THEN ADD NEXT) */}
        {hasLoans && (
          <div className="p-6 sm:p-7 rounded-3xl border border-zinc-200/90 bg-white shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#eaf5ef] text-[#1b4d3e] flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <h4 className="text-base font-extrabold text-zinc-900 tracking-tight">
                    Add a New Loan or Debt
                  </h4>
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  Fill details below and click <strong>Add to Loans</strong> to append as an individual card above.
                </p>
              </div>

              {/* Quick Type Chips */}
              <div className="flex flex-wrap gap-1.5">
                {LOAN_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectPreset(t.id, t.label)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      formType === t.id
                        ? 'bg-[#1b4d3e] text-white border-[#1b4d3e]'
                        : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loan Type & Custom Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-800">
                  Loan Category
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as LoanType)}
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 focus:border-[#1b4d3e] focus:outline-none shadow-2xs cursor-pointer"
                >
                  {LOAN_TYPES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-800">
                  Loan Name / Lender
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. HDFC Home Loan, SBI Auto Loan, ICICI Card"
                  className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 focus:border-[#1b4d3e] focus:outline-none shadow-2xs"
                />
              </div>
            </div>

            {/* Principal & Monthly EMI with CurrencyInput shorthand + words */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <CurrencyInput
                label="Outstanding Principal Amount"
                value={formPrincipal}
                onChange={(val) => setFormPrincipal(val)}
                currency={currency}
                placeholder="e.g. 2500000"
              />

              <CurrencyInput
                label="Monthly EMI Amount"
                value={formMonthlyEmi}
                onChange={(val) => setFormMonthlyEmi(val)}
                currency={currency}
                placeholder="e.g. 22000"
              />
            </div>

            {/* Interest Rate & Remaining Months */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-800">
                  Annual Interest Rate (% p.a.)
                </label>
                <div className="relative flex items-center rounded-xl border border-zinc-200 bg-white shadow-2xs focus-within:border-[#1b4d3e]">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="60"
                    value={formInterestRate}
                    onChange={(e) => setFormInterestRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    placeholder="e.g. 8.5"
                    className="w-full px-4 py-3 text-sm font-medium text-zinc-900 focus:outline-none"
                  />
                  <span className="pr-4 text-xs font-bold text-zinc-400">%</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-zinc-800">
                  Remaining Tenure (Months)
                </label>
                <div className="relative flex items-center rounded-xl border border-zinc-200 bg-white shadow-2xs focus-within:border-[#1b4d3e]">
                  <input
                    type="number"
                    min="1"
                    max="360"
                    value={formRemainingMonths}
                    onChange={(e) => setFormRemainingMonths(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                    placeholder="e.g. 180"
                    className="w-full px-4 py-3 text-sm font-medium text-zinc-900 focus:outline-none"
                  />
                  <span className="pr-4 text-xs font-bold text-zinc-400">Months</span>
                </div>
              </div>
            </div>

            {/* Overdue check */}
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-700">
                <input
                  type="checkbox"
                  checked={formIsOverdue}
                  onChange={(e) => setFormIsOverdue(e.target.checked)}
                  className="rounded border-zinc-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                />
                <span className={formIsOverdue ? 'text-rose-600 font-bold' : ''}>
                  This loan has missed payments / overdue balance
                </span>
              </label>

              {formIsOverdue && (
                <div className="w-full sm:w-60">
                  <CurrencyInput
                    label=""
                    value={formOverdueAmount}
                    onChange={(val) => setFormOverdueAmount(val)}
                    currency={currency}
                    placeholder="Overdue amount"
                  />
                </div>
              )}
            </div>

            {/* Action Row: Live Monthly EMI & Add to Loans Button */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Monthly Commitment for This Loan:
                </span>
                <div className="text-xl font-black text-[#1b4d3e]">
                  {formatCurrency(parseNum(formMonthlyEmi), currency)}<span className="text-xs font-semibold text-zinc-500">/mo ({computePayoffDate(Number(formRemainingMonths)).readable})</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddLoan}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#1b4d3e] hover:bg-[#143d31] text-white font-extrabold text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>Add to Loans & Add Next</span>
              </button>
            </div>

          </div>
        )}

        {/* Total Debt Summary Box */}
        {hasLoans && loans.length > 0 && (
          <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-medium text-zinc-500">Total Outstanding Principal</div>
              <div className="text-base font-extrabold text-zinc-900">
                {formatCurrency(totalPrincipal, currency)}
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-zinc-500">Total Monthly EMIs</div>
              <div className="text-base font-extrabold text-zinc-900">
                {formatCurrency(totalEmi, currency)}/mo
              </div>
            </div>

            <div>
              <div className="text-xs font-medium text-zinc-500">EMI-to-Income Ratio</div>
              <div className={`text-base font-extrabold ${emiRatio <= 20 ? 'text-emerald-700' : emiRatio <= 40 ? 'text-amber-700' : 'text-rose-700'}`}>
                {emiRatio}% {emiRatio <= 20 ? '(Safe)' : emiRatio <= 40 ? '(Moderate)' : '(High Exposure)'}
              </div>
            </div>
          </div>
        )}

      </div>
    </StepCard>
  );
};
