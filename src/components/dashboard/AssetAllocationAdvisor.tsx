'use client';

import React, { useState, useMemo } from 'react';
import { AssessmentData, CurrencyCode } from '@/types/assessment';
import { FinScoreResult } from '@/types/score';
import { 
  formatCurrency, 
  parseNum, 
  calculateTotalMonthlyIncome, 
  calculateTotalMonthlyExpenses 
} from '@/utils/calculations';
import { 
  PieChart, 
  ChevronDown, 
  ChevronUp, 
  UserCheck, 
  Compass, 
  Sliders, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  Coins, 
  Landmark, 
  Sparkles, 
  ArrowRight,
  Info,
  Calendar,
  Wallet,
  ShieldCheck,
  Calculator,
  Lock
} from 'lucide-react';

interface AssetAllocationAdvisorProps {
  assessment: AssessmentData;
  scoreResult: FinScoreResult;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
}

interface AgeAllocationRule {
  ageGroupLabel: string;
  directEquity: number;
  mutualFunds: number;
  goldOther: number;
  bondsGovt: number;
  strategyLabel: string;
  rationale: string;
  equityStyle: string;
  retirementGuidance: string;
}

// Age-wise asset allocation rules
function getAgeAllocationRule(age: number): AgeAllocationRule {
  if (age <= 24) {
    return {
      ageGroupLabel: '18–24 Years',
      directEquity: 50,
      mutualFunds: 30,
      goldOther: 20,
      bondsGovt: 0,
      strategyLabel: 'Early High-Alpha Growth',
      rationale: 'In early career, maximize long-term equity compounding. 50% in direct stocks and 30% in automated mutual funds harness decades of compounding runway, while 20% in gold acts as a hedge with zero fixed-debt drag.',
      equityStyle: 'High-conviction direct stocks + Broad-market index mutual funds',
      retirementGuidance: 'Establish a disciplined monthly investing habit. Target 0.5x to 1x annual income saved by age 25.',
    };
  } else if (age <= 34) {
    return {
      ageGroupLabel: '25–34 Years',
      directEquity: 40,
      mutualFunds: 40,
      goldOther: 20,
      bondsGovt: 0,
      strategyLabel: 'Prime Accumulation Core',
      rationale: 'During your prime earning acceleration phase with a 25–30+ year horizon, an 80% total equity engine (40% direct stocks + 40% mutual funds) compounds rapidly through market cycles with zero low-yield debt dragging returns. 20% gold reserves act as a macroeconomic buffer.',
      equityStyle: 'Quality direct growth compounders + Flexicap & Mid-cap SIPs',
      retirementGuidance: 'Eliminate all unsecured high-interest debt. Aim to reach 1x your annual gross salary saved in compounding assets by age 30, and 2x by age 35.',
    };
  } else if (age <= 44) {
    return {
      ageGroupLabel: '35–44 Years',
      directEquity: 10,
      mutualFunds: 60,
      goldOther: 10,
      bondsGovt: 20,
      strategyLabel: 'Balanced Family Wealth Accumulation',
      rationale: 'Peak family expenditure years (mortgage, children education). De-risk by allocating 20% to safe bonds/EPF/PPF for milestone stability, while keeping 70% in equities (60% professionally managed mutual funds and 10% direct equities) and 10% gold.',
      equityStyle: 'Flexicap & Large-and-Midcap Mutual Funds + High Dividend Equities',
      retirementGuidance: 'Lock in 20-year term insurance and family floater. Aim to accumulate 3x to 4x annual income by age 40, ring-fencing children college funds.',
    };
  } else if (age <= 54) {
    return {
      ageGroupLabel: '45–54 Years',
      directEquity: 0,
      mutualFunds: 80,
      goldOther: 0,
      bondsGovt: 20,
      strategyLabel: 'Pre-Retirement Growth Glide',
      rationale: 'Focus shifts toward eliminating single-stock volatility while compounding the final retirement corpus. 80% professionally managed mutual funds and 20% safe government bonds ensure steady growth without single-company risks.',
      equityStyle: 'Large-cap oriented equity mutual funds & conservative hybrid funds',
      retirementGuidance: 'Finalize debt-free retirement home. Aim for 6x to 8x annual income by age 50, transitioning toward guaranteed monthly pensions.',
    };
  } else {
    return {
      ageGroupLabel: '55+ Years',
      directEquity: 0,
      mutualFunds: 0,
      goldOther: 0,
      bondsGovt: 100,
      strategyLabel: '100% Bonds & Post-Office Pension Priority',
      rationale: 'For ages 55+, the proposed strategy prioritizes bonds and government schemes, including eligible post-office schemes (Senior Citizen Savings Scheme - SCSS, Post Office Monthly Income Scheme - POMIS, and RBI Floating Rate Bonds). Zero volatility risk with reliable monthly/quarterly payouts.',
      equityStyle: 'Zero active equity exposure. 100% Sovereign & Triple-A Fixed Income',
      retirementGuidance: 'Consolidate EPF/PPF into Senior Citizen Savings Scheme (SCSS), PMVVY, and monthly annuity plans. Target 10x-15x annual expenses as corpus.',
    };
  }
}

export const AssetAllocationAdvisor: React.FC<AssetAllocationAdvisorProps> = ({
  assessment,
  scoreResult,
  isOpen: controlledIsOpen,
  onToggleOpen,
}) => {
  // Starts CLOSED (collapsed) by default as requested: "give the closed componet click and show"
  const [localIsOpen, setLocalIsOpen] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : localIsOpen;

  const setOpen = (open: boolean) => {
    if (onToggleOpen) {
      onToggleOpen(open);
    } else {
      setLocalIsOpen(open);
    }
  };

  // Currency is strictly INR (₹) as requested: "and the amound in inr only"
  const currency: CurrencyCode = 'INR';

  // Calculated surplus from assessment data
  const income = calculateTotalMonthlyIncome(assessment);
  const totalExp = calculateTotalMonthlyExpenses(assessment.expenses, assessment.customExpenses).total;
  const totalEmi = assessment.loans.reduce((acc, l) => acc + parseNum(l.monthlyEmi), 0);
  const calculatedMonthlySurplus = Math.max(0, income - totalExp - totalEmi);

  // 1. MANDATORY INPUTS STATE
  // Initial age from assessment or 28
  const initialAge = Number(assessment.personal.age) || 28;
  const [ageInput, setAgeInput] = useState<number | ''>(initialAge);

  // Capital Allocation Basis: 'savings' (default) or 'total_assets'
  const [allocationBasis, setAllocationBasis] = useState<'savings' | 'total_assets'>('savings');

  // Initial monthly savings amount (default to calculated surplus or 5000 example)
  const initialSavings = calculatedMonthlySurplus > 0 ? calculatedMonthlySurplus : 5000;
  const [savingsInput, setSavingsInput] = useState<number | ''>(initialSavings);

  // Total Assets input (starts at 0 as requested: "if change total asset have but amount comes 0 user can fill that")
  const [totalAssetsInput, setTotalAssetsInput] = useState<number | ''>(0);

  // Cash allocation percentage: Strictly 5% to 20% limit as requested
  const [cashPct, setCashPct] = useState<number>(5);

  // "only show the investment allowcation first fill ise all this all manitry the give the show"
  const [hasCalculated, setHasCalculated] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const isSavings = allocationBasis === 'savings';
  const activeCapitalAmount = isSavings ? (Number(savingsInput) || 0) : (Number(totalAssetsInput) || 0);

  // Handle cash percentage change strictly clamped between 5% and 20%
  const handleCashPctChange = (val: number) => {
    const clamped = Math.min(20, Math.max(5, val));
    setCashPct(clamped);
  };

  const handleCalculate = () => {
    const ageNum = Number(ageInput);
    const activeAmount = isSavings ? Number(savingsInput) : Number(totalAssetsInput);

    if (!ageNum || ageNum < 18 || ageNum > 100) {
      setErrorMessage('Please enter a valid age between 18 and 100.');
      return;
    }
    if (!activeAmount || activeAmount <= 0) {
      setErrorMessage(
        isSavings
          ? 'Please enter a valid monthly savings amount in INR greater than 0.'
          : 'Please enter a valid total assets amount in INR greater than 0.'
      );
      return;
    }
    if (cashPct < 5 || cashPct > 20) {
      setErrorMessage('Cash allocation percentage must be between 5% and 20%.');
      return;
    }

    setErrorMessage('');
    setHasCalculated(true);
  };

  const activeAge = Number(ageInput) || 28;

  // CASH DEDUCTION CALCULATION (Like example: 5000 saving with 5% cash = 250 cash, remaining 4750 for asset allocation)
  const cashAmount = Math.round((activeCapitalAmount * cashPct) / 100);
  const netInvestableAmount = Math.max(0, activeCapitalAmount - cashAmount);

  // Active age rule
  const rule = useMemo(() => getAgeAllocationRule(activeAge), [activeAge]);

  // Asset allocation amounts calculated strictly from netInvestableAmount (e.g. 4750)
  const monthlyDirectEquity = Math.round((netInvestableAmount * rule.directEquity) / 100);
  const monthlyMutualFunds = Math.round((netInvestableAmount * rule.mutualFunds) / 100);
  const monthlyGoldOther = Math.round((netInvestableAmount * rule.goldOther) / 100);
  const monthlyBondsGovt = Math.round((netInvestableAmount * rule.bondsGovt) / 100);

  // Existing Portfolio Analysis (from Step 6 Assets)
  const portfolioBreakdown = useMemo(() => {
    let directEquityVal = 0;
    let mutualFundsVal = 0;
    let goldOtherVal = 0;
    let bondsGovtVal = 0;

    assessment.assets.forEach((a) => {
      const val = parseNum(a.currentValue);
      if (a.category === 'stocks') {
        directEquityVal += val;
      } else if (a.category === 'mf') {
        mutualFundsVal += val;
      } else if (a.category === 'stocks_mf') {
        const nameLower = (a.name || '').toLowerCase();
        if (nameLower.includes('stock') || nameLower.includes('equity') || nameLower.includes('share')) {
          directEquityVal += val;
        } else {
          mutualFundsVal += val;
        }
      } else if (a.category === 'gold' || a.category === 'gold_other' || a.category === 'crypto_alt' || a.category === 'other') {
        goldOtherVal += val;
      } else if (a.category === 'epf_ppf_nps' || a.category === 'fixed_deposits' || a.category === 'cash_bank' || a.category === 'real_estate') {
        bondsGovtVal += val;
      }
    });

    const totalPortfolio = directEquityVal + mutualFundsVal + goldOtherVal + bondsGovtVal;

    const actualDirectEquityPct = totalPortfolio > 0 ? Math.round((directEquityVal / totalPortfolio) * 100) : 0;
    const actualMutualFundsPct = totalPortfolio > 0 ? Math.round((mutualFundsVal / totalPortfolio) * 100) : 0;
    const actualGoldOtherPct = totalPortfolio > 0 ? Math.round((goldOtherVal / totalPortfolio) * 100) : 0;
    const actualBondsGovtPct = totalPortfolio > 0 ? Math.round((bondsGovtVal / totalPortfolio) * 100) : 0;

    return {
      totalPortfolio,
      directEquityVal,
      mutualFundsVal,
      goldOtherVal,
      bondsGovtVal,
      actualDirectEquityPct,
      actualMutualFundsPct,
      actualGoldOtherPct,
      actualBondsGovtPct,
    };
  }, [assessment.assets]);

  // Safety checks status
  const emergencyMonthsCovered = totalExp > 0 ? (parseNum(assessment.emergencyFund.liquidSavings) / totalExp) : 0;
  const hasAdequateEmergency = emergencyMonthsCovered >= 5.5;
  const hasHealthCover = assessment.healthInsurance.hasCover && parseNum(assessment.healthInsurance.sumInsured) >= 500000;
  const hasLifeCoverIfDependents = assessment.personal.dependents === 0 || (assessment.lifeInsurance.hasCover && parseNum(assessment.lifeInsurance.sumAssured) >= income * 12 * 8);

  return (
    <div className="w-full bg-white rounded-3xl border border-zinc-200/90 shadow-[0_4px_24px_rgba(0,0,0,0.03)] overflow-hidden transition-all">
      {/* 1. COLLAPSIBLE TRIGGER BAR (CLOSED BY DEFAULT) */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!isOpen) {
            setShowDisclaimerModal(true);
          } else {
            setOpen(false);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            if (!isOpen) {
              setShowDisclaimerModal(true);
            } else {
              setOpen(false);
            }
          }
        }}
        className="p-5 sm:p-6 cursor-pointer select-none bg-gradient-to-r from-zinc-900 via-zinc-800 to-teal-950 text-white hover:opacity-95 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
            <PieChart className="w-6 h-6 text-teal-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-teal-400/20 text-teal-300 border border-teal-400/30">
                Personalized Advisor Plan
              </span>
              <span className="text-xs text-zinc-300 font-medium">
                Target Age: {activeAge} Yrs ({rule.ageGroupLabel})
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5">
              Your Age-Based Allocation Strategy
            </h3>
            <p className="text-xs text-zinc-300">
              Personal Finance & Asset Allocation Advisor · Cash Buffer (5%–20%) + Investment Deployment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-teal-300 font-semibold uppercase">Net Investable Deployment</div>
            <div className="text-sm font-extrabold text-white">
              {formatCurrency(netInvestableAmount, currency)}/mo
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDisclaimerModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/30 transition-all cursor-pointer"
            title="View SEBI Regulatory Warnings and Disclaimers"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Advisory Warning</span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (!isOpen) {
                setShowDisclaimerModal(true);
              } else {
                setOpen(false);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-teal-500 hover:bg-teal-400 text-zinc-950 shadow-md transition-all cursor-pointer"
          >
            <span>{isOpen ? 'Close Asset Allocation' : 'Asset Allocation'}</span>
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SEBI REGULATORY ADVISORY WARNING MODAL (POPS UP ON CLICK) */}
      {showDisclaimerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-zinc-200 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  Regulatory Advisory & Disclaimer
                </span>
                <h4 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight mt-0.5">
                  SEBI Regulatory Warnings & Disclaimers
                </h4>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-xs sm:text-sm text-amber-950 leading-relaxed space-y-2.5">
              <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                <span>⚠️</span>
                <span>This is NOT a formal SEBI-registered financial advisory.</span>
              </div>
              <ul className="text-xs text-amber-900/95 space-y-1.5 list-disc list-inside">
                <li>
                  <strong>We are NOT SEBI-registered investment advisors</strong>, wealth managers, or portfolio management service (PMS) providers.
                </li>
                <li>
                  <strong>Please contact a certified SEBI-registered advisor</strong> before allocating personal capital into specific stocks, mutual funds, or debt assets.
                </li>
                <li>
                  <strong>Strictly for educational & illustrative purposes only.</strong> Percentages represent generic age-based mathematical frameworks (e.g., 100 minus age formula).
                </li>
                <li>
                  <strong>This website is an experimental calculation tool and is not completely finalized.</strong> FinScore and its authors are <strong>not responsible or legally liable</strong> for any capital loss, market fluctuations, or decisions made using this software.
                </li>
              </ul>
            </div>

            <p className="text-xs text-zinc-500 leading-normal">
              Market investments are subject to risk. Past theoretical performance does not guarantee future results.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => {
                  setShowDisclaimerModal(false);
                  setOpen(false); // Cancel closes the section as requested: "else cancel close the that both"
                }}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-colors cursor-pointer"
              >
                Cancel & Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDisclaimerModal(false);
                  setOpen(true);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#1b4d3e] hover:bg-[#143d31] text-xs font-black text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                OK, Understand
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EXPANDABLE BODY CONTENT */}
      {isOpen && (
        <div className="p-5 sm:p-8 space-y-10 animate-in fade-in slide-in-from-top-4 duration-300 bg-slate-50/40">
          
          {/* MANDATORY INPUT COLLECTOR BOX (COLLECT AGE, SAVING AMOUNT, CASH PERCENTAGE 5-20%) */}
          <div className="p-5 sm:p-6 rounded-2xl bg-white border-2 border-teal-600/30 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center font-bold">
                  <Calculator className="w-4 h-4 text-teal-800" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                    Asset Allocation Parameters (Mandatory Inputs)
                  </h4>
                  <p className="text-[11px] text-zinc-500">
                    Set your Age, Monthly Savings, and Cash Reserve Buffer (5% to 20% limit) to reveal your strategy
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-extrabold text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-full self-start sm:self-center">
                All 3 Fields Required
              </span>
            </div>

            {/* 3 Input Controls in a Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Field 1: Age */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                  <span>Your Current Age</span>
                  <span className="text-rose-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="18"
                    max="100"
                    value={ageInput}
                    onChange={(e) => setAgeInput(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-sm font-bold text-zinc-900 outline-none transition-all"
                    placeholder="e.g. 28"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-semibold">Years</span>
                </div>
                <p className="text-[10px] text-zinc-500">Determines your age-based asset allocation model</p>
              </div>

              {/* Field 2: Allocation Capital Basis Toggle & Input (Savings default vs Total Assets) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-teal-700" />
                    <span>{isSavings ? 'Total Monthly Savings' : 'Total Portfolio Assets'}</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                    INR (₹) Only
                  </span>
                </div>

                {/* Capital Basis Selector: Monthly Savings (Default) vs Total Assets */}
                <div className="grid grid-cols-2 p-1 bg-zinc-100 rounded-xl border border-zinc-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setAllocationBasis('savings')}
                    className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                      isSavings
                        ? 'bg-white text-teal-900 shadow-xs border border-zinc-200/80 font-black'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Monthly Savings (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAllocationBasis('total_assets')}
                    className={`py-1.5 px-2 rounded-lg transition-all text-center cursor-pointer ${
                      !isSavings
                        ? 'bg-white text-teal-900 shadow-xs border border-zinc-200/80 font-black'
                        : 'text-zinc-500 hover:text-zinc-800'
                    }`}
                  >
                    Total Assets
                  </button>
                </div>

                {/* Amount Input */}
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-sm font-bold text-zinc-500">₹</span>
                  <input
                    type="number"
                    min="0"
                    step={isSavings ? '500' : '10000'}
                    value={isSavings ? savingsInput : totalAssetsInput}
                    onChange={(e) => {
                      const val = e.target.value === '' ? '' : Number(e.target.value);
                      if (isSavings) {
                        setSavingsInput(val);
                      } else {
                        setTotalAssetsInput(val);
                      }
                    }}
                    className="w-full pl-8 pr-12 py-2.5 rounded-xl border border-zinc-300 focus:border-teal-600 focus:ring-2 focus:ring-teal-500/20 text-sm font-bold text-zinc-900 outline-none transition-all"
                    placeholder={isSavings ? 'e.g. 5000' : '0'}
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-zinc-400 font-semibold">
                    {isSavings ? '/mo' : 'Total ₹'}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 flex-wrap">
                  <span className="font-medium">Presets (INR):</span>
                  {isSavings ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setSavingsInput(5000)}
                        className="underline text-teal-700 font-semibold hover:text-teal-900 cursor-pointer"
                      >
                        5K
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setSavingsInput(12000)}
                        className="underline text-teal-700 font-semibold hover:text-teal-900 cursor-pointer"
                      >
                        12K
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setSavingsInput(25000)}
                        className="underline text-teal-700 font-semibold hover:text-teal-900 cursor-pointer"
                      >
                        25K
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setSavingsInput(50000)}
                        className="underline text-teal-700 font-semibold hover:text-teal-900 cursor-pointer"
                      >
                        50K
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setTotalAssetsInput(100000)}
                        className="underline text-teal-700 font-semibold hover:text-teal-900 cursor-pointer"
                      >
                        1 Lakh
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setTotalAssetsInput(500000)}
                        className="underline text-teal-700 font-semibold hover:text-teal-900 cursor-pointer"
                      >
                        5 Lakhs
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setTotalAssetsInput(1000000)}
                        className="underline text-teal-700 font-semibold hover:text-teal-900 cursor-pointer"
                      >
                        10 Lakhs
                      </button>
                      <span>·</span>
                      <button
                        type="button"
                        onClick={() => setTotalAssetsInput(2500000)}
                        className="underline text-teal-700 font-semibold hover:text-teal-900 cursor-pointer"
                      >
                        25 Lakhs
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Field 3: Cash Percentage (5% to 20% limit) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
                    <span>Cash Reserve Buffer</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </label>
                  <span className="text-xs font-extrabold text-[#1b4d3e] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    {cashPct}% (Limit: 5%–20%)
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="range"
                    min="5"
                    max="20"
                    step="1"
                    value={cashPct}
                    onChange={(e) => handleCashPctChange(Number(e.target.value))}
                    className="w-full accent-teal-700 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="5"
                    max="20"
                    value={cashPct}
                    onChange={(e) => handleCashPctChange(Number(e.target.value))}
                    className="w-16 px-2 py-1 text-center font-bold text-xs rounded-lg border border-zinc-300 focus:border-teal-600 outline-none"
                  />
                  <span className="text-xs text-zinc-500 font-bold">%</span>
                </div>
                <p className="text-[10px] text-zinc-500">
                  Reserved in liquid emergency cash before investing the remainder
                </p>
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-semibold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Deduction Calculation Proof Banner */}
            <div className="p-4 rounded-xl bg-[#eaf5ef]/70 border border-[#b7dfcb] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-zinc-700 space-y-0.5">
                <span className="font-bold text-emerald-950 uppercase tracking-wider text-[11px]">
                  Cash Deduction Formula Applied:
                </span>
                <div className="font-semibold text-zinc-900">
                  {isSavings ? 'Total Savings: ' : 'Total Assets: '}<span className="text-zinc-950 font-black">{formatCurrency(activeCapitalAmount, currency)}</span>
                  {' '}— Cash Buffer ({cashPct}%): <span className="text-amber-800 font-bold">{formatCurrency(cashAmount, currency)}</span>
                  {' '}={' '}
                  <span className="text-[#1b4d3e] font-black underline">
                    Net Investable Allocation: {formatCurrency(netInvestableAmount, currency)}{isSavings ? '/mo' : ''}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500">
                  The asset allocation percentages below are strictly calculated from this net {formatCurrency(netInvestableAmount, currency)} amount.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCalculate}
                className="px-5 py-2.5 rounded-xl bg-[#1b4d3e] hover:bg-[#143d31] text-white text-xs font-black shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
              >
                Show Investment Allocation
              </button>
            </div>
          </div>

          {/* IF NOT CALCULATED OR INPUTS INCOMPLETE, SHOW PROMPT */}
          {!hasCalculated ? (
            <div className="p-8 rounded-2xl bg-white border border-zinc-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-800 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-teal-700" />
              </div>
              <h4 className="text-base font-bold text-zinc-900">
                Complete the Mandatory Fields Above to View Allocation
              </h4>
              <p className="text-xs text-zinc-500 max-w-md mx-auto">
                Confirm your age, monthly savings amount, and cash buffer percentage (5% to 20%), then click &ldquo;Show Investment Allocation&rdquo;.
              </p>
            </div>
          ) : (
            <>
              {/* SECTION 1: FINANCIAL PROFILE */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-900 text-xs font-black flex items-center justify-center">
                    1
                  </span>
                  <h4 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                    Financial Profile & Cash Flow Breakdown
                  </h4>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
                    <div className="text-[11px] font-semibold text-zinc-400 uppercase">Input Age</div>
                    <div className="text-lg sm:text-xl font-black text-zinc-900 mt-0.5 flex items-center gap-1.5">
                      <span>{activeAge} Yrs</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200">
                        {rule.ageGroupLabel}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1">Horizon: ~{Math.max(0, 60 - activeAge)} yrs to retirement</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-zinc-200 shadow-2xs">
                    <div className="text-[11px] font-semibold text-zinc-400 uppercase">
                      {isSavings ? 'Total Monthly Savings' : 'Total Asset Capital'}
                    </div>
                    <div className="text-lg sm:text-xl font-black text-zinc-900 mt-0.5">
                      {formatCurrency(activeCapitalAmount, currency)}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-1">
                      {isSavings ? 'Total surplus capacity' : 'Total portfolio capital to distribute'}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
                    <div className="text-[11px] font-semibold text-amber-800 uppercase">Cash Reserve ({cashPct}%)</div>
                    <div className="text-lg sm:text-xl font-black text-amber-950 mt-0.5">
                      {formatCurrency(cashAmount, currency)}
                    </div>
                    <div className="text-[11px] text-amber-700 mt-1">Held in high-yield liquid cash</div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-[#bbf7d0] shadow-2xs">
                    <div className="text-[11px] font-semibold text-emerald-800 uppercase">Net Investable Deployment</div>
                    <div className="text-lg sm:text-xl font-black text-[#1b4d3e] mt-0.5">
                      {formatCurrency(netInvestableAmount, currency)}{isSavings ? '/mo' : ''}
                    </div>
                    <div className="text-[11px] text-emerald-700 font-medium mt-1">
                      100% deployed into asset classes
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: RECOMMENDED STRATEGY & ADVISOR DIAGNOSIS */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-900 text-xs font-black flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                    Recommended Strategy & Advisor Diagnosis
                  </h4>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-white to-teal-50/40 border border-teal-200/80 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-teal-100">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-teal-700" />
                      <span className="text-sm sm:text-base font-extrabold text-zinc-900">
                        {rule.strategyLabel}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-teal-800 bg-teal-100/80 px-2.5 py-1 rounded-full self-start sm:self-center">
                      Tailored for Age {activeAge} ({rule.ageGroupLabel})
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-medium">
                    {rule.rationale}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-bold text-zinc-900">Recommended Deployment Style:</span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-teal-200 text-teal-900 font-semibold shadow-2xs">
                      {rule.equityStyle}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: YOUR AGE-BASED ALLOCATION STRATEGY */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-900 text-xs font-black flex items-center justify-center">
                      3
                    </span>
                    <h4 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                      Your Age-Based Allocation Strategy
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Target Age {activeAge} · 100% Investable Breakdown
                  </span>
                </div>

                {/* Visual Allocation Bar */}
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-800">
                      Investable Asset Distribution ({rule.ageGroupLabel})
                    </span>
                    <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Total: 100% of {formatCurrency(netInvestableAmount, currency)}
                    </span>
                  </div>

                  {/* Stacked Proportional Bar */}
                  <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-inner bg-zinc-100">
                    {rule.directEquity > 0 && (
                      <div
                        style={{ width: `${rule.directEquity}%` }}
                        className="bg-[#2563eb] text-white text-[10px] font-black flex items-center justify-center transition-all duration-300"
                        title={`Direct Stocks: ${rule.directEquity}%`}
                      >
                        {rule.directEquity >= 10 ? `${rule.directEquity}%` : ''}
                      </div>
                    )}
                    {rule.mutualFunds > 0 && (
                      <div
                        style={{ width: `${rule.mutualFunds}%` }}
                        className="bg-[#059669] text-white text-[10px] font-black flex items-center justify-center transition-all duration-300"
                        title={`Mutual Funds: ${rule.mutualFunds}%`}
                      >
                        {rule.mutualFunds >= 10 ? `${rule.mutualFunds}%` : ''}
                      </div>
                    )}
                    {rule.goldOther > 0 && (
                      <div
                        style={{ width: `${rule.goldOther}%` }}
                        className="bg-[#d97706] text-white text-[10px] font-black flex items-center justify-center transition-all duration-300"
                        title={`Gold / Other: ${rule.goldOther}%`}
                      >
                        {rule.goldOther >= 10 ? `${rule.goldOther}%` : ''}
                      </div>
                    )}
                    {rule.bondsGovt > 0 && (
                      <div
                        style={{ width: `${rule.bondsGovt}%` }}
                        className="bg-[#7c3aed] text-white text-[10px] font-black flex items-center justify-center transition-all duration-300"
                        title={`Bonds / Govt Schemes: ${rule.bondsGovt}%`}
                      >
                        {rule.bondsGovt >= 10 ? `${rule.bondsGovt}%` : ''}
                      </div>
                    )}
                  </div>

                  {/* 4 Legend Cards with Exact Rupee Amounts calculated after cash deduction */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1 text-xs">
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/70 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-blue-900 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#2563eb]" />
                        <span>Direct Stocks</span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg font-black text-blue-950">
                          {rule.directEquity}%
                        </div>
                        <div className="text-xs font-bold text-blue-800">
                          {formatCurrency(monthlyDirectEquity, currency)}{isSavings ? '/mo' : ''}
                        </div>
                      </div>
                      <div className="text-[10px] text-blue-700 mt-1">High-conviction equities</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/70 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#059669]" />
                        <span>Mutual Funds (MF)</span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg font-black text-emerald-950">
                          {rule.mutualFunds}%
                        </div>
                        <div className="text-xs font-bold text-emerald-800">
                          {formatCurrency(monthlyMutualFunds, currency)}{isSavings ? '/mo' : ''}
                        </div>
                      </div>
                      <div className="text-[10px] text-emerald-700 mt-1">Index & Flexicap SIPs</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/70 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#d97706]" />
                        <span>Gold / Other</span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg font-black text-amber-950">
                          {rule.goldOther}%
                        </div>
                        <div className="text-xs font-bold text-amber-800">
                          {formatCurrency(monthlyGoldOther, currency)}{isSavings ? '/mo' : ''}
                        </div>
                      </div>
                      <div className="text-[10px] text-amber-700 mt-1">SGBs & Macro hedge</div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/70 flex flex-col justify-between">
                      <div className="flex items-center gap-1.5 text-purple-900 font-bold">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#7c3aed]" />
                        <span>Bonds / Govt</span>
                      </div>
                      <div className="mt-1">
                        <div className="text-lg font-black text-purple-950">
                          {rule.bondsGovt}%
                        </div>
                        <div className="text-xs font-bold text-purple-800">
                          {formatCurrency(monthlyBondsGovt, currency)}{isSavings ? '/mo' : ''}
                        </div>
                      </div>
                      <div className="text-[10px] text-purple-700 mt-1">PPF, EPF & Post Office</div>
                    </div>
                  </div>
                </div>

                {activeAge >= 55 && (
                  <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <p>
                      <strong>Senior Priority Strategy (55+):</strong> The strategy prioritizes safe bonds and government schemes, including eligible post-office schemes (Senior Citizen Savings Scheme - SCSS, Post Office Monthly Income Scheme - POMIS, and RBI Floating Rate Bonds) to deliver guaranteed income with zero capital volatility.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 4: MONTHLY DEPLOYMENT BLUEPRINT */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-900 text-xs font-black flex items-center justify-center">
                      4
                    </span>
                    <h4 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                      {isSavings ? 'Monthly Deployment Blueprint' : 'Asset Portfolio Deployment Blueprint'} (Net Investable Values Only)
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                    Net Investable Deployment: {formatCurrency(netInvestableAmount, currency)}{isSavings ? '/mo' : ''}
                  </span>
                </div>

                {/* Separate Preceding Cash Reserve Buffer Callout */}
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                    <div>
                      <span className="font-extrabold text-amber-950">Pre-Investment Cash Buffer:</span>
                      <span className="ml-1 text-amber-900 font-semibold">
                        {formatCurrency(cashAmount, currency)} ({cashPct}% of total {formatCurrency(activeCapitalAmount, currency)})
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-md self-start sm:self-center">
                    Deducted into Liquid / Emergency Reserves
                  </span>
                </div>

                {/* Investment Asset Allocation Table (Net Investable Deployment Values Only) */}
                <div className="overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-2xs">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                        <th className="py-3 px-4">Investment Asset Category</th>
                        <th className="py-3 px-4">Allocation %</th>
                        <th className="py-3 px-4 font-black">{isSavings ? 'Monthly Amount' : 'Allocated Amount'}</th>
                        <th className="py-3 px-4">Deployment Channel & Instruments</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {/* Row 1: Direct Stocks */}
                      <tr className="hover:bg-zinc-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                            <span className="font-extrabold text-zinc-900">Direct Stocks</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-blue-700">{rule.directEquity}%</td>
                        <td className="py-3 px-4 font-extrabold text-sm text-blue-900">
                          {formatCurrency(monthlyDirectEquity, currency)}{isSavings ? '/mo' : ''}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          Nifty 50 large-cap bluechips & high return-on-equity compounders
                        </td>
                      </tr>

                      {/* Row 2: Mutual Funds */}
                      <tr className="hover:bg-zinc-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                            <span className="font-extrabold text-zinc-900">Mutual Funds (MF)</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700">{rule.mutualFunds}%</td>
                        <td className="py-3 px-4 font-extrabold text-sm text-emerald-900">
                          {formatCurrency(monthlyMutualFunds, currency)}{isSavings ? '/mo' : ''}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          Broad-market Index funds (Nifty 50 / Next 50) + Flexi-cap SIP
                        </td>
                      </tr>

                      {/* Row 3: Gold / Other */}
                      <tr className="hover:bg-zinc-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                            <span className="font-extrabold text-zinc-900">Gold / Other Assets</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-amber-700">{rule.goldOther}%</td>
                        <td className="py-3 px-4 font-extrabold text-sm text-amber-900">
                          {formatCurrency(monthlyGoldOther, currency)}{isSavings ? '/mo' : ''}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          Sovereign Gold Bonds (SGB), Digital Gold, Gold ETFs (macro hedge)
                        </td>
                      </tr>

                      {/* Row 4: Bonds / Govt Schemes */}
                      <tr className="hover:bg-zinc-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                            <span className="font-extrabold text-zinc-900">Bonds / Govt Schemes</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-bold text-purple-700">{rule.bondsGovt}%</td>
                        <td className="py-3 px-4 font-extrabold text-sm text-purple-900">
                          {formatCurrency(monthlyBondsGovt, currency)}{isSavings ? '/mo' : ''}
                        </td>
                        <td className="py-3 px-4 text-zinc-600">
                          PPF, EPF voluntary top-up, RBI Floating Rate Bonds, Post-office schemes
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-emerald-50/80 font-black border-t-2 border-emerald-200 text-zinc-900 text-xs">
                        <td className="py-3 px-4 text-[#1b4d3e] font-extrabold">
                          Total Net Investable Deployment
                        </td>
                        <td className="py-3 px-4 text-emerald-800">100%</td>
                        <td className="py-3 px-4 font-black text-base text-[#1b4d3e]">
                          {formatCurrency(netInvestableAmount, currency)}{isSavings ? '/mo' : ''}
                        </td>
                        <td className="py-3 px-4 text-zinc-600 font-medium">
                          100% deployed into age-weighted market assets
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Bottom Reconciliation Bar */}
                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-zinc-800">
                      Full {isSavings ? 'Monthly Savings' : 'Asset Capital'} Reconciliation:{' '}
                    </span>
                    <span>
                      {formatCurrency(activeCapitalAmount, currency)} {isSavings ? 'Total Savings' : 'Total Assets'} = {formatCurrency(cashAmount, currency)} Cash ({cashPct}%) + {formatCurrency(netInvestableAmount, currency)} Net Investable ({(100 - cashPct)}%)
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700">100% Accounted For ✓</span>
                </div>
              </div>

              {/* SECTION 5: CURRENT PORTFOLIO VS ADVISOR BENCHMARK */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-900 text-xs font-black flex items-center justify-center">
                    5
                  </span>
                  <h4 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                    Current Portfolio vs Advisor Benchmark
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Portfolio Comparison Table */}
                  <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                      <span className="text-xs font-bold text-zinc-800">
                        Current Holdings: {formatCurrency(portfolioBreakdown.totalPortfolio, currency)}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-zinc-500">
                        Actual vs Target
                      </span>
                    </div>

                    <div className="space-y-3 text-xs">
                      {/* Direct Stocks */}
                      <div>
                        <div className="flex items-center justify-between text-zinc-700">
                          <span className="font-semibold">Direct Stocks</span>
                          <span>Actual: {portfolioBreakdown.actualDirectEquityPct}% vs Target: {rule.directEquity}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2 rounded-full mt-1 overflow-hidden flex">
                          <div className="bg-blue-600 h-full rounded-full" style={{ width: `${portfolioBreakdown.actualDirectEquityPct}%` }} />
                        </div>
                      </div>

                      {/* Mutual Funds */}
                      <div>
                        <div className="flex items-center justify-between text-zinc-700">
                          <span className="font-semibold">Mutual Funds</span>
                          <span>Actual: {portfolioBreakdown.actualMutualFundsPct}% vs Target: {rule.mutualFunds}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2 rounded-full mt-1 overflow-hidden flex">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${portfolioBreakdown.actualMutualFundsPct}%` }} />
                        </div>
                      </div>

                      {/* Gold / Other */}
                      <div>
                        <div className="flex items-center justify-between text-zinc-700">
                          <span className="font-semibold">Gold / Other</span>
                          <span>Actual: {portfolioBreakdown.actualGoldOtherPct}% vs Target: {rule.goldOther}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2 rounded-full mt-1 overflow-hidden flex">
                          <div className="bg-amber-600 h-full rounded-full" style={{ width: `${portfolioBreakdown.actualGoldOtherPct}%` }} />
                        </div>
                      </div>

                      {/* Bonds / Govt */}
                      <div>
                        <div className="flex items-center justify-between text-zinc-700">
                          <span className="font-semibold">Bonds / Govt Schemes</span>
                          <span>Actual: {portfolioBreakdown.actualBondsGovtPct}% vs Target: {rule.bondsGovt}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 h-2 rounded-full mt-1 overflow-hidden flex">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: `${portfolioBreakdown.actualBondsGovtPct}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advisor Rebalancing Advice */}
                  <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex flex-col justify-between space-y-3">
                    <div>
                      <h5 className="text-xs font-bold text-zinc-900 uppercase tracking-wider pb-2 border-b border-zinc-100">
                        Rebalancing Prescription
                      </h5>
                      <div className="mt-3 space-y-2 text-xs text-zinc-600">
                        {portfolioBreakdown.actualMutualFundsPct < rule.mutualFunds ? (
                          <p className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold mt-0.5">•</span>
                            <span>
                              <strong>Mutual Funds Underweight:</strong> You have {portfolioBreakdown.actualMutualFundsPct}% vs recommended {rule.mutualFunds}%. Increase your monthly SIP deployment to close this gap.
                            </span>
                          </p>
                        ) : (
                          <p className="flex items-start gap-1.5 text-emerald-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Mutual Fund core is well capitalized in accordance with your age target.</span>
                          </p>
                        )}

                        {rule.bondsGovt === 0 && portfolioBreakdown.actualBondsGovtPct > 25 ? (
                          <p className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold mt-0.5">•</span>
                            <span>
                              <strong>Excess Debt / Idle Cash Drag:</strong> At age {activeAge}, holding {portfolioBreakdown.actualBondsGovtPct}% in low-yield debt instruments is slowing down portfolio growth. Redirect new monthly inflows to equities.
                            </span>
                          </p>
                        ) : null}

                        {portfolioBreakdown.actualGoldOtherPct < rule.goldOther ? (
                          <p className="flex items-start gap-1.5">
                            <span className="text-blue-600 font-bold mt-0.5">•</span>
                            <span>
                              <strong>Hedge Shortfall:</strong> Consider allocating {formatCurrency(monthlyGoldOther, currency)}/mo into Sovereign Gold Bonds (SGB) or Gold ETFs to reach your {rule.goldOther}% buffer.
                            </span>
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-500">
                      💡 <em>Annual Review Rule: Rebalance once every 12 months or when any single asset class drifts by &gt;5% from its target percentage.</em>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: FINANCIAL SAFETY CHECKS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-900 text-xs font-black flex items-center justify-center">
                    6
                  </span>
                  <h4 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                    Financial Safety Checks
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  {/* Check 1: Emergency Fund */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    hasAdequateEmergency ? 'bg-emerald-50/50 border-emerald-200' : 'bg-amber-50/50 border-amber-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">Emergency Shield</span>
                      {hasAdequateEmergency ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Passed ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Action Needed ⚠
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-zinc-600">
                      {emergencyMonthsCovered.toFixed(1)} months of expenses saved in liquid funds. (Target: 6 months).
                    </div>
                  </div>

                  {/* Check 2: Health Insurance */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    hasHealthCover ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">Health Protection</span>
                      {hasHealthCover ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Passed ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          Underinsured ✕
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-zinc-600">
                      {assessment.healthInsurance.hasCover
                        ? `Covered for ${formatCurrency(parseNum(assessment.healthInsurance.sumInsured), currency)}.`
                        : 'No health insurance cover reported. Crucial before aggressive equity.'}
                    </div>
                  </div>

                  {/* Check 3: Life Insurance */}
                  <div className={`p-4 rounded-2xl border transition-all ${
                    hasLifeCoverIfDependents ? 'bg-emerald-50/50 border-emerald-200' : 'bg-rose-50/50 border-rose-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-zinc-900">Life / Term Cover</span>
                      {hasLifeCoverIfDependents ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          Passed ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                          Needs Cover ✕
                        </span>
                      )}
                    </div>
                    <div className="mt-2 text-xs text-zinc-600">
                      {assessment.personal.dependents === 0
                        ? '0 dependents reported (Term cover optional).'
                        : `Supporting ${assessment.personal.dependents} dependent(s). Target 10x annual income.`}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 7: RETIREMENT ROADMAP & SUITABILITY WARNINGS */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-900 text-xs font-black flex items-center justify-center">
                    7
                  </span>
                  <h4 className="text-sm font-extrabold text-zinc-900 uppercase tracking-wider">
                    Retirement Roadmap & Suitability Warnings
                  </h4>
                </div>

                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-zinc-900 font-bold text-xs">
                    <Calendar className="w-4 h-4 text-teal-700" />
                    <span>Age-Based Financial Milestones</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <div className="font-extrabold text-zinc-900">Age 30 Milestone</div>
                      <div className="text-teal-700 font-bold mt-1">1x Annual Income</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">Emergency buffer + early index equity</div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <div className="font-extrabold text-zinc-900">Age 40 Milestone</div>
                      <div className="text-teal-700 font-bold mt-1">3x Annual Income</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">Compounding acceleration phase</div>
                    </div>

                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                      <div className="font-extrabold text-zinc-900">Age 50 Milestone</div>
                      <div className="text-teal-700 font-bold mt-1">6x Annual Income</div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">De-risking into high-grade debt & EPF</div>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                      <div className="font-extrabold text-emerald-950">Age 60 Freedom</div>
                      <div className="text-emerald-800 font-black mt-1">10x-15x Annual Expenses</div>
                      <div className="text-[11px] text-emerald-700 mt-0.5">Guaranteed annuity & post-office income</div>
                    </div>
                  </div>

                  {/* Guidance text for user's age */}
                  <div className="pt-2 border-t border-zinc-100 text-xs text-zinc-700">
                    <strong>Strategic Guidance for You:</strong> {rule.retirementGuidance}
                  </div>

                  {/* Risk & Investment Suitability Warnings */}
                  <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-amber-950">
                      <ShieldAlert className="w-4 h-4 text-amber-700" />
                      <span>Risk & Investment Suitability Warnings</span>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-[11px] text-amber-800 pl-1">
                      <li><strong>Cash Deduction Principle:</strong> The {cashPct}% cash buffer is strictly set aside in liquid assets (savings/liquid funds) before deploying {formatCurrency(netInvestableAmount, currency)} into market assets.</li>
                      <li><strong>Market Risk:</strong> Direct equity and equity mutual funds are subject to market volatility. Never invest funds required within the next 3–5 years into pure equities.</li>
                      <li><strong>Safety First:</strong> Ensure you have established a 6-month emergency fund and adequate health cover before allocating heavily to equities.</li>
                      <li><strong>Educational Advisory:</strong> This asset allocation blueprint is a mathematical rule-based advisory tool based on standard financial planning frameworks. Consult a SEBI-registered investment advisor for bespoke personal portfolio management.</li>
                    </ul>
                  </div>

                  {/* Bottom Advisory & SEBI Warning Bar */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Compliance Notice: This is an educational mathematical allocation plan and not SEBI-registered advisory.</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDisclaimerModal(true)}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs shrink-0 cursor-pointer"
                    >
                      View Full Warnings List
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}

        </div>
      )}
    </div>
  );
};
