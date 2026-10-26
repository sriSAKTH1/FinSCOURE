'use client';

import React, { useState, useMemo } from 'react';
import { 
  Flame, 
  Calendar, 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight, 
  Coins, 
  Percent, 
  Clock, 
  BarChart3, 
  Landmark, 
  Wallet, 
  Building2, 
  Sliders, 
  Info, 
  Sparkles, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink 
} from 'lucide-react';
import { formatCurrency } from '@/utils/calculations';
import { formatIndianUnits } from './CalculatorsPage';

// Standard FIRE Multiplier Presets
export type FireMultiplierPreset = 25 | 30 | 33 | 'custom';

// Product Comparison Row Interface
export interface InvestmentProduct {
  id: string;
  name: string;
  provider: string;
  verifiedRate: string;
  rateEffective: string;
  minMax: string;
  eligibility: string;
  tenure: string;
  payoutFrequency: string;
  taxTreatment: string;
  liquidity: string;
  riskCategory: 'Sovereign' | 'Very Low' | 'Low' | 'Moderate' | 'Market Linked';
  officialSource: string;
  sourceUrl?: string;
}

export const FireCalculator: React.FC = () => {
  // 1. INPUT STATE
  // Personal Details
  const [currentAge, setCurrentAge] = useState<number>(28);
  const [retirementAge, setRetirementAge] = useState<number>(48);

  // Helper to compute default date (20 years from today: 2026-10-26 -> 2046-10-26)
  const calculateDefaultDate = (targetAge: number, currAge: number): string => {
    const today = new Date();
    const yearsDiff = Math.max(1, targetAge - currAge);
    const futureDate = new Date(today.getFullYear() + yearsDiff, today.getMonth(), today.getDate());
    const yyyy = futureDate.getFullYear();
    const mm = String(futureDate.getMonth() + 1).padStart(2, '0');
    const dd = String(futureDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [retirementDate, setRetirementDate] = useState<string>(() => calculateDefaultDate(48, 28));

  // Expenses & Inflation
  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(40000); // ₹40,000/mo matching user example
  const [inflationRate, setInflationRate] = useState<number>(6.0); // 6% planning benchmark

  // FIRE Multiplier
  const [multiplierPreset, setMultiplierPreset] = useState<FireMultiplierPreset>(25);
  const [customMultiplier, setCustomMultiplier] = useState<number>(28);

  // Current Wealth & Pre-FIRE Accumulation
  const [currentAssets, setCurrentAssets] = useState<number>(1500000); // ₹15 Lakhs current corpus
  const [preFireReturn, setPreFireReturn] = useState<number>(12.0); // 12% equity CAGR expectation
  const [currentMonthlySip, setCurrentMonthlySip] = useState<number>(20000);

  // Interactive UI state
  const [activeTab, setActiveTab] = useState<'dashboard' | 'income' | 'suggestions' | 'compare' | 'scenarios'>('dashboard');
  const [essentialExpensePct, setEssentialExpensePct] = useState<number>(70); // 70% essential vs 30% discretionary

  // Handle Target Retirement Age change -> sync Date
  const handleRetirementAgeChange = (newAge: number) => {
    const validAge = Math.max(currentAge + 1, newAge);
    setRetirementAge(validAge);
    setRetirementDate(calculateDefaultDate(validAge, currentAge));
  };

  // Handle Current Age change -> sync Date
  const handleCurrentAgeChange = (newAge: number) => {
    const validAge = Math.min(retirementAge - 1, Math.max(18, newAge));
    setCurrentAge(validAge);
    setRetirementDate(calculateDefaultDate(retirementAge, validAge));
  };

  // Handle Date change -> sync Retirement Age
  const handleRetirementDateChange = (dateStr: string) => {
    setRetirementDate(dateStr);
    if (!dateStr) return;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const selected = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const today = new Date();
      const diffMs = selected.getTime() - today.getTime();
      const diffYears = Math.max(1, Math.round(diffMs / (365.25 * 24 * 60 * 60 * 1000)));
      setRetirementAge(currentAge + diffYears);
    }
  };

  // 2. CORE FIRE CALCULATIONS
  const fireCalculations = useMemo(() => {
    // Step 1: Calculate Years until Retirement (N)
    const today = new Date();
    let yearsToRetire = 20;
    if (retirementDate) {
      const parts = retirementDate.split('-');
      if (parts.length === 3) {
        const target = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        const diffMs = target.getTime() - today.getTime();
        yearsToRetire = Math.max(0.5, diffMs / (365.25 * 24 * 60 * 60 * 1000));
      }
    } else {
      yearsToRetire = Math.max(1, retirementAge - currentAge);
    }

    const roundedYears = Math.floor(yearsToRetire);
    const remainingMonths = Math.round((yearsToRetire - roundedYears) * 12);

    // Step 2: Future Annual Expenses with Inflation (E_R)
    // E_R = E_M * 12 * (1 + i)^N
    const currentAnnualExpenses = monthlyExpenses * 12;
    const inflationFactor = Math.pow(1 + inflationRate / 100, yearsToRetire);
    const futureAnnualExpenses = Math.round(currentAnnualExpenses * inflationFactor);
    const futureMonthlyExpenses = Math.round(futureAnnualExpenses / 12);

    // Step 3: Selected Multiplier & FIRE Number
    const activeMultiplier = multiplierPreset === 'custom' ? customMultiplier : multiplierPreset;
    const targetCorpus = Math.round(futureAnnualExpenses * activeMultiplier);
    const initialWithdrawalRate = Number((100 / activeMultiplier).toFixed(2));

    // Multiplier Scenario Table (25x, 30x, 33x)
    const scenarios = [
      {
        multiplier: 25,
        target: Math.round(futureAnnualExpenses * 25),
        swr: 4.0,
        label: 'Standard Starting Scenario',
        description: 'Traditional 4% Safe Withdrawal Rate (SWR). Suitable for ~30-year retirement horizon.',
      },
      {
        multiplier: 30,
        target: Math.round(futureAnnualExpenses * 30),
        swr: 3.33,
        label: 'More Conservative Target',
        description: 'Lower 3.33% withdrawal rate provides safety cushion against sequence-of-returns risk.',
      },
      {
        multiplier: 33,
        target: Math.round(futureAnnualExpenses * 33),
        swr: 3.03,
        label: 'Larger Retirement Reserve',
        description: 'Ultra-conservative 3.03% withdrawal rate designed for early retirees (35+ years in FIRE).',
      },
    ];

    // Current vs Target Wealth Projection
    // Compound existing assets: FV = P * (1 + r)^N
    const rAnnual = preFireReturn / 100;
    const projectedAssetsOnly = Math.round(currentAssets * Math.pow(1 + rAnnual, yearsToRetire));

    // Future Value of current monthly SIP: FV_sip = P * [((1+i)^n - 1)/i] * (1+i)
    const monthlyRate = rAnnual / 12;
    const totalMonths = Math.round(yearsToRetire * 12);
    let projectedSipWealth = 0;
    if (monthlyRate > 0 && currentMonthlySip > 0 && totalMonths > 0) {
      projectedSipWealth = Math.round(
        currentMonthlySip *
          (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate))
      );
    }
    const totalProjectedWealth = projectedAssetsOnly + projectedSipWealth;

    // Funding Gap
    const fundingGap = Math.max(0, targetCorpus - totalProjectedWealth);
    const targetFundedPct = targetCorpus > 0 ? Math.min(100, Math.round((totalProjectedWealth / targetCorpus) * 100)) : 100;

    // Required Monthly SIP to bridge the gap from scratch if totalProjectedWealth < targetCorpus
    // Gap_to_bridge = Target - projectedAssetsOnly
    const assetGapToBridge = Math.max(0, targetCorpus - projectedAssetsOnly);
    let requiredMonthlySip = 0;
    if (monthlyRate > 0 && assetGapToBridge > 0 && totalMonths > 0) {
      requiredMonthlySip = Math.round(
        (assetGapToBridge * monthlyRate) /
          ((Math.pow(1 + monthlyRate, totalMonths) - 1) * (1 + monthlyRate))
      );
    }

    // Retirement Income Split
    const essentialAnnual = Math.round((futureAnnualExpenses * essentialExpensePct) / 100);
    const discretionaryAnnual = Math.max(0, futureAnnualExpenses - essentialAnnual);

    // 3-Bucket Post-FIRE Strategy:
    // Bucket 1 (Cash & Liquid 1-3 years living): E_R * 2.5
    // Bucket 2 (Fixed Income 4-10 years): E_R * 6.5
    // Bucket 3 (Growth Equity 10+ years): Remainder of Corpus
    const bucket1Cash = Math.round(futureAnnualExpenses * 2.5);
    const bucket2Fixed = Math.round(futureAnnualExpenses * 6.5);
    const bucket3Growth = Math.max(0, targetCorpus - bucket1Cash - bucket2Fixed);

    // Growth Projection Milestone points (Year 0 to N)
    const milestonePoints: { year: number; age: number; projected: number; targetRef: number }[] = [];
    const stepCount = Math.min(10, Math.max(4, Math.round(yearsToRetire)));
    const stepYears = yearsToRetire / stepCount;

    for (let i = 0; i <= stepCount; i++) {
      const yr = i * stepYears;
      const ageAtYr = Math.round(currentAge + yr);
      const monthsAtYr = Math.round(yr * 12);

      // Asset compounding at yr
      const compAsset = currentAssets * Math.pow(1 + rAnnual, yr);
      let compSip = 0;
      if (monthlyRate > 0 && currentMonthlySip > 0 && monthsAtYr > 0) {
        compSip =
          currentMonthlySip *
          (((Math.pow(1 + monthlyRate, monthsAtYr) - 1) / monthlyRate) * (1 + monthlyRate));
      }
      const totalAtYr = Math.round(compAsset + compSip);

      milestonePoints.push({
        year: Math.round(yr * 10) / 10,
        age: ageAtYr,
        projected: totalAtYr,
        targetRef: targetCorpus,
      });
    }

    return {
      yearsToRetire: Math.round(yearsToRetire * 10) / 10,
      roundedYears,
      remainingMonths,
      currentAnnualExpenses,
      futureAnnualExpenses,
      futureMonthlyExpenses,
      inflationFactor: Math.round(inflationFactor * 100) / 100,
      activeMultiplier,
      targetCorpus,
      initialWithdrawalRate,
      scenarios,
      projectedAssetsOnly,
      projectedSipWealth,
      totalProjectedWealth,
      fundingGap,
      targetFundedPct,
      requiredMonthlySip,
      essentialAnnual,
      discretionaryAnnual,
      bucket1Cash,
      bucket2Fixed,
      bucket3Growth,
      milestonePoints,
    };
  }, [
    retirementDate,
    retirementAge,
    currentAge,
    monthlyExpenses,
    inflationRate,
    multiplierPreset,
    customMultiplier,
    currentAssets,
    preFireReturn,
    currentMonthlySip,
    essentialExpensePct,
  ]);

  // Verified Indian Investment Products (Official RBI / Govt of India rates Q3-Q4 2024–2026)
  const investmentProducts: InvestmentProduct[] = [
    {
      id: 'gsec',
      name: 'Government Securities (G-Secs & T-Bills)',
      provider: 'Reserve Bank of India (RBI Retail Direct)',
      verifiedRate: '7.10% – 7.25% p.a.',
      rateEffective: 'Active Sovereign Auction Yield',
      minMax: 'Min ₹10,000 / No upper limit',
      eligibility: 'All Indian Resident Individuals',
      tenure: '91 days to 40 years',
      payoutFrequency: 'Half-yearly coupon (G-Secs) or Discount (T-Bills)',
      taxTreatment: 'Taxable at slab rates; no TDS for retail direct',
      liquidity: 'Tradable on NDS-OM secondary market',
      riskCategory: 'Sovereign',
      officialSource: 'rbiretaildirect.org.in',
    },
    {
      id: 'pomis',
      name: 'Post Office Monthly Income Scheme (MIS)',
      provider: 'Department of Posts, Govt of India',
      verifiedRate: '7.40% p.a.',
      rateEffective: 'Q3-Q4 FY 2024–25 (Active)',
      minMax: 'Min ₹1,000 / Max ₹9 Lakh (Single), ₹15 Lakh (Joint)',
      eligibility: 'Resident Individuals (Adults & Minors >10 yrs)',
      tenure: '5 Years fixed',
      payoutFrequency: 'Monthly credit to Post Office Savings Bank',
      taxTreatment: 'Taxable at slab rates; no 80C rebate, no TDS',
      liquidity: 'Premature closure allowed after 1 year with 1–2% deduction',
      riskCategory: 'Sovereign',
      officialSource: 'indiapost.gov.in',
    },
    {
      id: 'scss',
      name: 'Senior Citizens\' Savings Scheme (SCSS)',
      provider: 'India Post & Designated Banks',
      verifiedRate: '8.20% p.a.',
      rateEffective: 'Q3-Q4 FY 2024–25 (Active)',
      minMax: 'Min ₹1,000 / Max ₹30 Lakh',
      eligibility: 'Ages 60+ (or 55–60 for VRS/Retirees, 50+ for Defence)',
      tenure: '5 Years (extendable by 3 years)',
      payoutFrequency: 'Quarterly (31st Mar, 30th Jun, 30th Sep, 31st Dec)',
      taxTreatment: 'Section 80C eligible (up to ₹1.5L); interest taxable with TDS >₹50k',
      liquidity: 'Premature closure after 1 year with 1–1.5% penalty',
      riskCategory: 'Sovereign',
      officialSource: 'dea.gov.in / indiapost.gov.in',
    },
    {
      id: 'rbi_bonds',
      name: 'RBI Floating Rate Savings Bonds (FRSB 2020)',
      provider: 'Reserve Bank of India via Commercial Banks',
      verifiedRate: '8.05% p.a.',
      rateEffective: 'Floating: NSC rate (7.70%) + 0.35% spread',
      minMax: 'Min ₹1,000 / No maximum limit',
      eligibility: 'Resident Indians & HUFs',
      tenure: '7 Years fixed',
      payoutFrequency: 'Semi-annually (1st January and 1st July)',
      taxTreatment: 'Taxable at slab rate; TDS applies',
      liquidity: 'Non-transferable; early exit only for age 60+ (minimum 4-6 yrs)',
      riskCategory: 'Sovereign',
      officialSource: 'rbi.org.in',
    },
    {
      id: 'nsc',
      name: 'National Savings Certificate (NSC VIII Issue)',
      provider: 'India Post, Govt of India',
      verifiedRate: '7.70% p.a. compounded',
      rateEffective: 'Q3-Q4 FY 2024–25 (Active)',
      minMax: 'Min ₹1,000 / No upper limit',
      eligibility: 'Resident Individuals',
      tenure: '5 Years',
      payoutFrequency: 'Accumulated and paid at maturity',
      taxTreatment: 'Section 80C eligible; deemed reinvested interest deductible',
      liquidity: 'No premature exit except on death or court order',
      riskCategory: 'Sovereign',
      officialSource: 'indiapost.gov.in',
    },
    {
      id: 'bank_fd',
      name: 'Scheduled Commercial Bank Fixed Deposits',
      provider: 'SBI, HDFC, ICICI & Top Commercial Banks',
      verifiedRate: '7.00% – 7.50% p.a. (up to 8.0% for Senior Citizens)',
      rateEffective: 'Current Active Bank Card Rates',
      minMax: 'Min ₹1,000 / No maximum ceiling',
      eligibility: 'All Individuals, Joint Accounts, HUFs',
      tenure: '7 days to 10 years',
      payoutFrequency: 'Monthly, Quarterly, Cumulative or at Maturity',
      taxTreatment: 'Taxable at slab rates; TDS above ₹40,000 (₹50,000 for seniors)',
      liquidity: 'Loan facility against FD or premature withdrawal (usually 0.5-1% penalty)',
      riskCategory: 'Very Low',
      officialSource: 'DICGC Insured up to ₹5 Lakh per depositor',
    },
    {
      id: 'coop_fd',
      name: 'Eligible Co-operative Bank Deposits',
      provider: 'Insured Urban Co-operative Banks',
      verifiedRate: '7.50% – 8.25% p.a.',
      rateEffective: 'Published State / District Co-op Schedules',
      minMax: 'Min ₹1,000 / Subject to bank limits',
      eligibility: 'Resident Individuals & Members',
      tenure: '1 to 5 years',
      payoutFrequency: 'Monthly or Quarterly',
      taxTreatment: 'Taxable under general income; Form 15G/15H eligible',
      liquidity: 'Subject to bank bylaws & liquidity norms',
      riskCategory: 'Moderate',
      officialSource: 'dicgc.org.in (Verify bank list)',
    },
    {
      id: 'post_td',
      name: 'Post Office Time Deposit (POTD)',
      provider: 'Department of Posts, Govt of India',
      verifiedRate: '6.90% – 7.50% p.a. (5-Year: 7.50%)',
      rateEffective: 'Q3-Q4 FY 2024–25 (Active)',
      minMax: 'Min ₹1,000 / No upper limit',
      eligibility: 'Resident Individuals & Minors',
      tenure: '1, 2, 3, or 5 Years',
      payoutFrequency: 'Annual interest payout (compounded quarterly)',
      taxTreatment: '5-year deposit qualifies for Section 80C rebate',
      liquidity: 'No premature closure before 6 months; PO savings interest applies 6-12m',
      riskCategory: 'Sovereign',
      officialSource: 'indiapost.gov.in',
    },
    {
      id: 'equity_funds',
      name: 'Diversified Broad-Market Equity Funds (Pre & Post FIRE)',
      provider: 'SEBI Registered Mutual Funds (Nifty 50 / Flexi Cap)',
      verifiedRate: '11.0% – 13.0% CAGR (Long-Term Historical)',
      rateEffective: 'Rolling 10-15 Year Indian Index Trajectory',
      minMax: 'Min ₹500/mo SIP / No ceiling',
      eligibility: 'All KYC-compliant Investors',
      tenure: 'Flexible (Recommended 7+ years)',
      payoutFrequency: 'Systematic Withdrawal Plan (SWP) or Capital Growth',
      taxTreatment: 'Long-term Capital Gains (LTCG) 12.5% beyond ₹1.25 Lakh/year',
      liquidity: 'High: Redeemable in T+2 business days',
      riskCategory: 'Market Linked',
      officialSource: 'amfiindia.com',
    },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c2e24] via-[#144234] to-[#1b4d3e] p-6 sm:p-9 text-white shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="absolute right-10 bottom-0 opacity-10 pointer-events-none">
          <Flame className="w-64 h-64 text-emerald-300" />
        </div>

        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 text-xs font-black tracking-wide">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>INDIAN RETIREMENT & FINANCIAL INDEPENDENCE PLANNER</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
            FIRE Number Calculator
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-medium">
            Calculate your Financial Independence, Retire Early (FIRE) target corpus calibrated for Indian inflation. Choose your retirement date, adjust living expenses, select a safety multiplier (25×, 30×, 33×), and explore tailored pre-FIRE and post-FIRE income options.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-emerald-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Full Inflation Compounding</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Exact Date to Years Delta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Official Indian Product Comparison</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN 2-COLUMN WORKSPACE: INPUTS (LEFT 5) vs LIVE RESULTS (RIGHT 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* =========================================================
            LEFT COLUMN (5 COLS): INTERACTIVE PARAMETERS & INPUTS
           ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-7 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                  1. Financial Independence Inputs
                </h3>
              </div>
              <span className="text-[11px] font-bold text-zinc-400">
                Indian Rupee (₹)
              </span>
            </div>

            {/* A. PERSONAL DETAILS */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                <Clock className="w-4 h-4 text-emerald-700" />
                <span>Personal Timeline</span>
              </div>

              {/* Current Age & Target Retirement Age Grid */}
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    Current Age
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="75"
                    value={currentAge}
                    onChange={(e) => handleCurrentAgeChange(Number(e.target.value))}
                    className="w-full text-base sm:text-lg font-black text-zinc-900 px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                  <span className="text-[10px] text-zinc-400 font-medium mt-0.5 block">Years old</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    Retirement Age
                  </label>
                  <input
                    type="number"
                    min={currentAge + 1}
                    max="80"
                    value={retirementAge}
                    onChange={(e) => handleRetirementAgeChange(Number(e.target.value))}
                    className="w-full text-base sm:text-lg font-black text-zinc-900 px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                  <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
                    {retirementAge - currentAge} years away
                  </span>
                </div>
              </div>

              {/* Exact Calendar Date Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-zinc-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Exact Retirement Date</span>
                  </label>
                  <span className="text-[10px] font-bold text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md">
                    {fireCalculations.yearsToRetire} yrs ({fireCalculations.roundedYears}y {fireCalculations.remainingMonths}m)
                  </span>
                </div>
                <input
                  type="date"
                  value={retirementDate}
                  onChange={(e) => handleRetirementDateChange(e.target.value)}
                  className="w-full text-sm font-bold text-zinc-900 px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all bg-white shadow-2xs cursor-pointer"
                />
                <p className="text-[10.5px] text-zinc-500 mt-1">
                  Default corresponds to age {retirementAge}; choose any exact date.
                </p>
              </div>
            </div>

            {/* B. EXPENSES & INFLATION */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                <Coins className="w-4 h-4 text-emerald-700" />
                <span>Expenses & Inflation Assumption</span>
              </div>

              {/* Current Monthly Expenses */}
              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Current Monthly Expenses (₹)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="5000"
                  max="1000000"
                  value={monthlyExpenses === 0 ? '' : monthlyExpenses}
                  onChange={(e) => setMonthlyExpenses(Math.max(0, Number(e.target.value)))}
                  className="w-full text-lg sm:text-xl font-black text-zinc-900 px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-500">
                  <span className="font-bold text-emerald-800">{formatCurrency(monthlyExpenses)}/mo</span>
                  <span>Annual: {formatIndianUnits(monthlyExpenses * 12)}/yr</span>
                </div>

                {/* Quick Presets */}
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {[25000, 40000, 60000, 80000, 100000, 150000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setMonthlyExpenses(amt)}
                      className={`px-2 py-0.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                        monthlyExpenses === amt
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {formatIndianUnits(amt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual Inflation Rate with User's Specified 4%, 6%, 8% Presets */}
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700 mb-1">
                  <span>Annual Inflation Rate</span>
                  <span className="text-rose-600 font-extrabold">{inflationRate}% / year</span>
                </div>
                <input
                  type="range"
                  min="3.0"
                  max="10.0"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Number(e.target.value))}
                  className="w-full accent-rose-600 cursor-pointer"
                />

                {/* Specific Presets: 4% (lower), 6% (example), 8% (higher) */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setInflationRate(4.0)}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      inflationRate === 4.0
                        ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-2xs'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="text-xs font-black">4%</div>
                    <div className="text-[10px] text-zinc-500 leading-tight">Lower inflation</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInflationRate(6.0)}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      inflationRate === 6.0
                        ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-2xs'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="text-xs font-black">6%</div>
                    <div className="text-[10px] text-zinc-500 leading-tight">Standard India</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setInflationRate(8.0)}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      inflationRate === 8.0
                        ? 'bg-rose-50 border-rose-300 text-rose-950 shadow-2xs'
                        : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <div className="text-xs font-black">8%</div>
                    <div className="text-[10px] text-zinc-500 leading-tight">Higher inflation</div>
                  </button>
                </div>
              </div>
            </div>

            {/* C. FIRE MULTIPLIER (25x, 30x, 33x, Custom) */}
            <div className="space-y-3 pt-4 border-t border-zinc-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span>FIRE Multiplier</span>
                </span>
                <span className="text-xs font-extrabold text-[#1b4d3e] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {multiplierPreset === 'custom' ? `${customMultiplier}×` : `${multiplierPreset}×`} ({fireCalculations.initialWithdrawalRate}% SWR)
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMultiplierPreset(25)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    multiplierPreset === 25
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-zinc-900">25×</span>
                    <span className="text-[10px] font-bold text-emerald-700">4.0%</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Standard Starting</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMultiplierPreset(30)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    multiplierPreset === 30
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-zinc-900">30×</span>
                    <span className="text-[10px] font-bold text-teal-700">3.33%</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Conservative</div>
                </button>

                <button
                  type="button"
                  onClick={() => setMultiplierPreset(33)}
                  className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                    multiplierPreset === 33
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-950 shadow-xs ring-1 ring-emerald-500'
                      : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-zinc-900">33×</span>
                    <span className="text-[10px] font-bold text-blue-700">3.03%</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">Larger Reserve</div>
                </button>
              </div>

              {/* Custom Multiplier Slider */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setMultiplierPreset('custom')}
                  className={`text-[11px] font-bold underline cursor-pointer mb-2 block ${
                    multiplierPreset === 'custom' ? 'text-[#1b4d3e]' : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {multiplierPreset === 'custom' ? '✓ Custom multiplier active' : '+ Want a custom multiplier (e.g. 28×, 35×)?'}
                </button>

                {multiplierPreset === 'custom' && (
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-zinc-700">Custom Multiplier</span>
                      <span className="text-emerald-700 font-black">{customMultiplier}×</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="45"
                      step="1"
                      value={customMultiplier}
                      onChange={(e) => setCustomMultiplier(Number(e.target.value))}
                      className="w-full accent-[#1b4d3e] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400 font-semibold">
                      <span>20× (Aggressive 5.0%)</span>
                      <span>45× (Ultra-Safe 2.22%)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* D. CURRENT WEALTH & PRE-RETIREMENT GROWTH (FOR GAP ANALYSIS) */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900">
                <TrendingUp className="w-4 h-4 text-emerald-700" />
                <span>Current Assets & Pre-FIRE Savings</span>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                  Current Investment Portfolio (₹)
                </label>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={currentAssets === 0 ? '' : currentAssets}
                  onChange={(e) => setCurrentAssets(Math.max(0, Number(e.target.value)))}
                  className="w-full text-base sm:text-lg font-black text-zinc-900 px-3.5 py-2.5 rounded-xl border border-zinc-200 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                />
                <span className="text-[11px] text-zinc-500 mt-0.5 block font-medium">
                  {formatIndianUnits(currentAssets)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    Pre-FIRE Return (%)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="4"
                    max="18"
                    value={preFireReturn}
                    onChange={(e) => setPreFireReturn(Number(e.target.value))}
                    className="w-full text-sm font-bold text-zinc-900 px-3 py-2 rounded-xl border border-zinc-200 outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-zinc-400">Equity/Hybrid CAGR</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-600 block mb-1">
                    Current Monthly SIP (₹)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={currentMonthlySip === 0 ? '' : currentMonthlySip}
                    onChange={(e) => setCurrentMonthlySip(Math.max(0, Number(e.target.value)))}
                    className="w-full text-sm font-bold text-zinc-900 px-3 py-2 rounded-xl border border-zinc-200 outline-none focus:border-emerald-600"
                  />
                  <span className="text-[10px] text-zinc-400">{formatIndianUnits(currentMonthlySip)}/mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            RIGHT COLUMN (7 COLS): FULL FEATURE DASHBOARD & SECTIONS
           ========================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* TAB BUTTONS (Dashboard, Income Planner, Suggestions, Comparison, Scenarios) */}
          <div className="flex items-center gap-1 bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200/90 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-white text-zinc-950 shadow-xs scale-[1.02]'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-600" />
              <span>FIRE Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('income')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'income'
                  ? 'bg-white text-zinc-950 shadow-xs scale-[1.02]'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Income Planner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('suggestions')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'suggestions'
                  ? 'bg-white text-zinc-950 shadow-xs scale-[1.02]'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Investment Engine</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('compare')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'compare'
                  ? 'bg-white text-zinc-950 shadow-xs scale-[1.02]'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Product Comparison</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('scenarios')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'scenarios'
                  ? 'bg-white text-zinc-950 shadow-xs scale-[1.02]'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Scenarios</span>
            </button>
          </div>

          {/* VIEW 1: COMPLETE RESULTS DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* PRIMARY FIRE TARGET BANNER */}
              <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 text-white border border-zinc-800 shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                      Your Target FIRE Number
                    </span>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mt-1">
                      {formatCurrency(fireCalculations.targetCorpus)}
                    </h2>
                    <span className="text-xs sm:text-sm font-extrabold text-emerald-300">
                      ≈ {formatIndianUnits(fireCalculations.targetCorpus)} ({fireCalculations.activeMultiplier}× Multiplier)
                    </span>
                  </div>

                  <div className="text-right self-start sm:self-auto">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                      {fireCalculations.initialWithdrawalRate}% SWR
                    </span>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      {fireCalculations.yearsToRetire} years to retire
                    </div>
                  </div>
                </div>

                {/* 3 Key Diagnostic Sub-metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-0.5">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Current Annual Expenses
                    </span>
                    <div className="text-base font-black text-white">
                      {formatCurrency(fireCalculations.currentAnnualExpenses)}
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {formatIndianUnits(fireCalculations.currentAnnualExpenses)}/year
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-0.5">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                      Year 1 Retirement Expense
                    </span>
                    <div className="text-base font-black text-amber-400">
                      {formatCurrency(fireCalculations.futureAnnualExpenses)}
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {formatIndianUnits(fireCalculations.futureAnnualExpenses)}/year (adjusted)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-800/60 border border-zinc-700/60 space-y-0.5">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                      Monthly Need in FIRE
                    </span>
                    <div className="text-base font-black text-emerald-400">
                      {formatCurrency(fireCalculations.futureMonthlyExpenses)}
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      {formatCurrency(monthlyExpenses)} today inflated
                    </span>
                  </div>
                </div>
              </div>

              {/* CURRENT VS TARGET WEALTH CARD */}
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                      Current vs Target Wealth Gap
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                    {fireCalculations.targetFundedPct}% Funded
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="w-full bg-zinc-100 h-3 rounded-full overflow-hidden shadow-inner flex">
                    <div
                      className="bg-emerald-600 h-full transition-all duration-700"
                      style={{ width: `${fireCalculations.targetFundedPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-zinc-600">
                    <span>Projected Corpus: {formatIndianUnits(fireCalculations.totalProjectedWealth)}</span>
                    <span>Target: {formatIndianUnits(fireCalculations.targetCorpus)}</span>
                  </div>
                </div>

                {/* 4 Comparative Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Current Assets</span>
                    <div className="text-sm font-extrabold text-zinc-900 mt-0.5">
                      {formatCurrency(currentAssets)}
                    </div>
                    <span className="text-[10px] text-zinc-500">{formatIndianUnits(currentAssets)}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Projected on FIRE Date</span>
                    <div className="text-sm font-extrabold text-[#1b4d3e] mt-0.5">
                      {formatCurrency(fireCalculations.totalProjectedWealth)}
                    </div>
                    <span className="text-[10px] text-zinc-500">With {preFireReturn}% return</span>
                  </div>

                  <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase">Remaining Gap</span>
                    <div className={`text-sm font-extrabold mt-0.5 ${fireCalculations.fundingGap > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {fireCalculations.fundingGap > 0 ? formatCurrency(fireCalculations.fundingGap) : 'Fully Covered!'}
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {fireCalculations.fundingGap > 0 ? formatIndianUnits(fireCalculations.fundingGap) : 'Target Reached'}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase">Monthly SIP Needed</span>
                    <div className="text-sm font-black text-emerald-950 mt-0.5">
                      {formatCurrency(fireCalculations.requiredMonthlySip)}/mo
                    </div>
                    <span className="text-[10px] text-emerald-700 font-medium">To close the gap</span>
                  </div>
                </div>
              </div>

              {/* RETIREMENT TIMELINE & SENSITIVITY */}
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                      Retirement Timeline Milestones
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-zinc-600">
                    Target Date: {retirementDate}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                    <span className="text-zinc-500 font-medium">Years Remaining</span>
                    <div className="text-lg font-black text-zinc-900">
                      {fireCalculations.yearsToRetire} Years
                    </div>
                    <span className="text-[11px] text-zinc-500 font-semibold">
                      Exact: {fireCalculations.roundedYears} yrs {fireCalculations.remainingMonths} mos
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                    <span className="text-zinc-500 font-medium">Retire 3 Years Earlier (Age {retirementAge - 3})</span>
                    <div className="text-lg font-black text-amber-700">
                      {formatCurrency(Math.round(fireCalculations.currentAnnualExpenses * Math.pow(1 + inflationRate / 100, Math.max(1, fireCalculations.yearsToRetire - 3)) * fireCalculations.activeMultiplier))}
                    </div>
                    <span className="text-[11px] text-zinc-500">Requires ~{formatCurrency(Math.round(fireCalculations.requiredMonthlySip * 1.35))}/mo SIP</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
                    <span className="text-zinc-500 font-medium">Retire 3 Years Later (Age {retirementAge + 3})</span>
                    <div className="text-lg font-black text-emerald-800">
                      {formatCurrency(Math.round(fireCalculations.currentAnnualExpenses * Math.pow(1 + inflationRate / 100, fireCalculations.yearsToRetire + 3) * fireCalculations.activeMultiplier))}
                    </div>
                    <span className="text-[11px] text-zinc-500">More time to compound wealth</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: RETIREMENT INCOME PLANNER & 3-BUCKET STRATEGY */}
          {activeTab === 'income' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                      Retirement Cash Flow & Withdrawal Strategy
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-zinc-500">
                    Annual Withdrawal: {formatCurrency(fireCalculations.futureAnnualExpenses)}
                  </span>
                </div>

                {/* Expense Split: Essential vs Discretionary */}
                <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-800">
                    <span>Expense Breakdown in First Year of FIRE</span>
                    <span className="text-emerald-800">{essentialExpensePct}% Essential / {100 - essentialExpensePct}% Lifestyle</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white border border-zinc-200">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Essential Needs (Food, Health, Rent/Bills)</span>
                      <div className="text-base font-black text-zinc-900 mt-0.5">
                        {formatCurrency(fireCalculations.essentialAnnual)}/yr
                      </div>
                      <span className="text-[11px] text-zinc-500">{formatCurrency(Math.round(fireCalculations.essentialAnnual / 12))}/mo</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white border border-zinc-200">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase">Lifestyle & Wants (Travel, Hobbies, Gifts)</span>
                      <div className="text-base font-black text-amber-700 mt-0.5">
                        {formatCurrency(fireCalculations.discretionaryAnnual)}/yr
                      </div>
                      <span className="text-[11px] text-zinc-500">{formatCurrency(Math.round(fireCalculations.discretionaryAnnual / 12))}/mo</span>
                    </div>
                  </div>
                </div>

                {/* 3-Bucket Retirement Allocation Plan */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-indigo-700" />
                      <span>Recommended 3-Bucket Portfolio Strategy</span>
                    </h4>
                    <span className="text-[11px] font-bold text-zinc-500">
                      Total: {formatIndianUnits(fireCalculations.targetCorpus)}
                    </span>
                  </div>

                  {/* Bucket 1 */}
                  <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-900">Bucket 1: Immediate Cash & Liquidity</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">1 to 3 Years</span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Keeps living cash immune from stock market downturns. Invested in Post Office Time Deposits, Liquid Mutual Funds, High-yield Bank FDs.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-emerald-950">
                        {formatCurrency(fireCalculations.bucket1Cash)}
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold">{formatIndianUnits(fireCalculations.bucket1Cash)} (~2.5 yrs)</span>
                    </div>
                  </div>

                  {/* Bucket 2 */}
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-blue-900">Bucket 2: Guaranteed & Fixed Income</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900">4 to 10 Years</span>
                      </div>
                      <p className="text-[11px] text-blue-800">
                        Provides regular predictable interest cash flow. Allocated to Government Securities (G-Secs), POMIS, SCSS (at age 60+), and RBI Floating Rate Bonds.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-blue-950">
                        {formatCurrency(fireCalculations.bucket2Fixed)}
                      </div>
                      <span className="text-[10px] text-blue-700 font-bold">{formatIndianUnits(fireCalculations.bucket2Fixed)} (~6.5 yrs)</span>
                    </div>
                  </div>

                  {/* Bucket 3 */}
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-purple-900">Bucket 3: Long-Term Inflation Growth</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-200 text-purple-900">10+ Years</span>
                      </div>
                      <p className="text-[11px] text-purple-800">
                        Compounds above inflation to prevent premature corpus depletion. Broad-market Nifty 50 Index funds, Flexi-cap equity, and gold/sovereign buffers.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-purple-950">
                        {formatCurrency(fireCalculations.bucket3Growth)}
                      </div>
                      <span className="text-[10px] text-purple-700 font-bold">{formatIndianUnits(fireCalculations.bucket3Growth)} (Remainder)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 3: RECOMMENDATION ENGINE & TWO-PHASE STRATEGY */}
          {activeTab === 'suggestions' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                      Personalized Recommendation Engine
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800">
                    Phase: {fireCalculations.yearsToRetire > 5 ? 'Building Wealth (Pre-FIRE)' : 'Near or at FIRE Transition'}
                  </span>
                </div>

                {/* Intelligent Guidance Rules */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Key Prerequisite & Sequence-of-Returns Rules:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-amber-800">
                    <li><strong>Emergency Fund First:</strong> Keep 12–24 months of essential expenses in liquid savings before locking money into illiquid lock-in products.</li>
                    <li><strong>Avoid 100% Fixed Deposits:</strong> Relying entirely on FDs in India causes purchasing power erosion due to inflation (6%) and high tax drag (up to 30%+ slab rate).</li>
                    <li><strong>Pre-FIRE Focus:</strong> Prioritize SIPs in diversified growth equity + PPF/NPS rather than locking capital prematurely into monthly interest schemes.</li>
                    <li><strong>Post-FIRE Focus:</strong> Sequence-of-returns protection. Fill Bucket 1 & 2 first, and harvest Bucket 3 during market bull runs.</li>
                  </ul>
                </div>

                {/* 2-Phase Strategy Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Phase 1: Before FIRE */}
                  <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-black text-zinc-900">
                      <TrendingUp className="w-4 h-4 text-emerald-700" />
                      <span>Phase 1: Pre-FIRE Corpus Building</span>
                    </div>
                    <p className="text-xs text-zinc-600">
                      Focus on aggressive wealth accumulation, maximizing savings rate, and compounding equity returns over {fireCalculations.yearsToRetire} years.
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200">
                        <span className="font-bold text-zinc-900">1. Systematic SIPs in Index / Flexi-Cap Funds</span>
                        <p className="text-[11px] text-zinc-500">70% of monthly savings targeting 12% long-term CAGR.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200">
                        <span className="font-bold text-zinc-900">2. Voluntary EPF / PPF (E-E-E Tax Benefit)</span>
                        <p className="text-[11px] text-zinc-500">20% safe sovereign compounding immune to market crashes.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200">
                        <span className="font-bold text-zinc-900">3. Sovereign Gold Bonds (SGB) or Gold ETFs</span>
                        <p className="text-[11px] text-zinc-500">10% currency depreciation and geopolitical hedge.</p>
                      </div>
                    </div>
                  </div>

                  {/* Phase 2: After FIRE */}
                  <div className="p-5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-black text-zinc-900">
                      <Landmark className="w-4 h-4 text-blue-700" />
                      <span>Phase 2: Post-FIRE Sustainable Income</span>
                    </div>
                    <p className="text-xs text-zinc-600">
                      Transition from wealth creation to structured, tax-efficient cash flow across sovereign and guaranteed schemes.
                    </p>
                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200">
                        <span className="font-bold text-zinc-900">1. G-Secs & Treasury Bills (RBI Retail Direct)</span>
                        <p className="text-[11px] text-zinc-500">Lock sovereign coupon yields for 10–30 years without default risk.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200">
                        <span className="font-bold text-zinc-900">2. POMIS & SCSS (Govt Small Savings)</span>
                        <p className="text-[11px] text-zinc-500">Max ₹15L in POMIS (7.4%) + ₹30L in SCSS (8.2% if age &ge;60) for guaranteed periodic payouts.</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-white border border-zinc-200">
                        <span className="font-bold text-zinc-900">3. Mutual Fund SWP with Equity Retention</span>
                        <p className="text-[11px] text-zinc-500">Systematic Withdrawal Plan from equity funds for 12.5% LTCG tax efficiency.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: OFFICIAL INDIAN INVESTMENT COMPARISON TABLE */}
          {activeTab === 'compare' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-700" />
                      <span>Official Indian Investment Schemes Comparison</span>
                    </h3>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Verified government, postal, and bank rates with eligibility, limits, and DICGC insurance parameters.
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-auto">
                    Verified Rates (Q3–Q4 2024–25)
                  </span>
                </div>

                {/* Responsive Comparison Table */}
                <div className="w-full overflow-x-auto border border-zinc-200 rounded-2xl shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
                        <th className="py-3 px-3.5">Investment Instrument</th>
                        <th className="py-3 px-3.5">Current Rate</th>
                        <th className="py-3 px-3.5">Payout Frequency</th>
                        <th className="py-3 px-3.5">Limits (Min / Max)</th>
                        <th className="py-3 px-3.5">Eligibility & Tenure</th>
                        <th className="py-3 px-3.5">Taxation & Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {investmentProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-zinc-50/70 transition-colors">
                          <td className="py-3 px-3.5">
                            <div className="font-extrabold text-zinc-900">{p.name}</div>
                            <div className="text-[10.5px] text-zinc-500">{p.provider}</div>
                          </td>
                          <td className="py-3 px-3.5 whitespace-nowrap">
                            <span className="font-black text-[#1b4d3e] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {p.verifiedRate}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-zinc-700 font-medium">
                            {p.payoutFrequency}
                          </td>
                          <td className="py-3 px-3.5 text-zinc-600 text-[11px]">
                            {p.minMax}
                          </td>
                          <td className="py-3 px-3.5">
                            <div className="text-zinc-900 font-bold">{p.tenure}</div>
                            <div className="text-[10.5px] text-zinc-500">{p.eligibility}</div>
                          </td>
                          <td className="py-3 px-3.5">
                            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              p.riskCategory === 'Sovereign' ? 'bg-emerald-100 text-emerald-800' :
                              p.riskCategory === 'Very Low' ? 'bg-teal-100 text-teal-800' :
                              p.riskCategory === 'Low' ? 'bg-blue-100 text-blue-800' :
                              p.riskCategory === 'Moderate' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                            }`}>
                              {p.riskCategory}
                            </span>
                            <div className="text-[10.5px] text-zinc-500 mt-0.5">{p.taxTreatment}</div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                  <span>
                    <strong>DICGC Deposit Insurance Notice:</strong> Bank fixed deposits in scheduled commercial and co-operative banks are protected up to ₹5,00,000 per depositor per bank (principal + interest). Post Office schemes and G-Secs carry direct Sovereign Guarantee from the Government of India.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 5: SCENARIOS & SENSITIVITY ANALYSIS */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-purple-700" />
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                      Multiplier & Inflation Scenario Comparison
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-zinc-500">
                    Monthly Burn: {formatCurrency(monthlyExpenses)}
                  </span>
                </div>

                {/* Multiplier Comparison Cards */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-zinc-900">
                    A. Target Corpus by FIRE Multiplier (at {inflationRate}% inflation)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {fireCalculations.scenarios.map((sc) => {
                      const isCurrent = fireCalculations.activeMultiplier === sc.multiplier;
                      return (
                        <div
                          key={sc.multiplier}
                          className={`p-4 rounded-2xl border transition-all ${
                            isCurrent
                              ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-500/30'
                              : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-base font-black text-zinc-900">{sc.multiplier}× Multiplier</span>
                            <span className="text-xs font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200">
                              {sc.swr}% SWR
                            </span>
                          </div>
                          <div className="text-xl font-black text-[#1b4d3e] mt-2">
                            {formatCurrency(sc.target)}
                          </div>
                          <div className="text-xs font-bold text-zinc-600 mt-0.5">
                            ≈ {formatIndianUnits(sc.target)}
                          </div>
                          <p className="text-[11px] text-zinc-500 mt-2 leading-relaxed">
                            {sc.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Inflation Sensitivity Table */}
                <div className="space-y-3 pt-3 border-t border-zinc-100">
                  <h4 className="text-xs font-bold text-zinc-900">
                    B. Inflation Sensitivity Table ({fireCalculations.activeMultiplier}× Multiplier)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[4.0, 6.0, 8.0].map((rate) => {
                      const futureAnn = Math.round(fireCalculations.currentAnnualExpenses * Math.pow(1 + rate / 100, fireCalculations.yearsToRetire));
                      const corpus = Math.round(futureAnn * fireCalculations.activeMultiplier);
                      return (
                        <div key={rate} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-zinc-700">{rate}% Inflation</span>
                            {rate === inflationRate && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">Active</span>
                            )}
                          </div>
                          <div className="text-base font-black text-zinc-900">
                            {formatCurrency(corpus)}
                          </div>
                          <span className="text-[11px] text-zinc-500">
                            ≈ {formatIndianUnits(corpus)} ({formatCurrency(Math.round(futureAnn / 12))}/mo)
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 3. ASSUMPTIONS, FORMULAS & REGULATORY DISCLOSURES (ALWAYS VISIBLE AT BOTTOM) */}
          <div className="p-5 rounded-3xl bg-zinc-50 border border-zinc-200 space-y-3 text-xs text-zinc-600">
            <div className="flex items-center gap-2 font-black text-zinc-900">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Formulas, Assumptions & Regulatory Disclosures</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] leading-relaxed">
              <div className="space-y-1">
                <p><strong>1. Retirement Timeline:</strong> N = Retirement Date − Today&apos;s Date in fractional years.</p>
                <p><strong>2. Inflation Compounding:</strong> E<sub>R</sub> = E<sub>M</sub> × 12 × (1 + i)<sup>N</sup> applies only to post-retirement living costs.</p>
                <p><strong>3. Target Corpus:</strong> FIRE Number = E<sub>R</sub> × M where M represents the multiplier (25×, 30×, 33×).</p>
              </div>
              <div className="space-y-1">
                <p><strong>4. Taxation Notice:</strong> Rates shown reflect official Q3-Q4 FY 2024-25 notifications. Mutual fund equity LTCG is taxed at 12.5% beyond ₹1.25L. Interest on FDs/Bonds is taxed at slab rates.</p>
                <p><strong>5. Risk Disclosure:</strong> Mutual fund investments are subject to market risks. Historical returns (12%) are not guaranteed.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
