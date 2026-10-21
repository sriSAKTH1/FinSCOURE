'use client';

import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  CheckCircle2, 
  Coins, 
  Target, 
  Receipt, 
  Layers 
} from 'lucide-react';
import { CalculatorsHub } from './CalculatorsHub';
import { CalculatorId } from '@/components/calculators/CalculatorsPage';

interface HomePageProps {
  onStartAssessment: () => void;
  onViewSample: (sampleKey: string) => void;
  onSelectCalculator?: (id: CalculatorId) => void;
  hasDraft?: boolean;
  onResumeDraft?: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onStartAssessment,
  onViewSample,
  onSelectCalculator,
  hasDraft,
  onResumeDraft,
}) => {
  return (
    <div className="space-y-16 sm:space-y-24 animate-in fade-in duration-300 pb-16">
      {/* HERO SECTION MATCHING SCREENSHOT */}
      <section className="relative pt-6 sm:pt-12 pb-12 sm:pb-20 px-2 flex flex-col items-center justify-center text-center overflow-hidden">
        {/* Background decorative sparkles */}
        <div className="absolute top-8 left-12 text-emerald-500 animate-pulse pointer-events-none select-none text-2xl">✦</div>
        <div className="absolute top-16 right-20 text-blue-500 animate-pulse pointer-events-none select-none text-3xl">✦</div>
        <div className="absolute bottom-20 left-20 text-amber-400 pointer-events-none select-none text-2xl">✦</div>
        <div className="absolute bottom-28 right-16 text-amber-500 pointer-events-none select-none text-3xl">✦</div>
        <div className="absolute top-1/2 left-4 text-emerald-400 pointer-events-none select-none text-xl">✦</div>
        <div className="absolute top-1/3 right-8 text-blue-400 pointer-events-none select-none text-2xl">✦</div>

        {/* Floating Left Chart Badge with Dotted Path (as in screenshot) */}
        <div className="hidden lg:flex items-center absolute left-2 top-28 select-none pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-200 to-amber-400 p-2 shadow-lg flex items-center justify-center border-2 border-white">
            <div className="w-12 h-12 bg-white rounded-xl shadow-inner flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-600 stroke-[2.5]" />
            </div>
          </div>
          {/* Curved dashed guide path */}
          <svg width="90" height="60" viewBox="0 0 90 60" fill="none" className="ml-1 opacity-60">
            <path
              d="M 5 30 Q 40 55 70 30"
              stroke="#1e293b"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              fill="none"
            />
            <polygon points="70,25 80,30 70,35" fill="#3b82f6" />
          </svg>
        </div>

        {/* HERO TYPOGRAPHY COMPOSITION */}
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-1 sm:gap-3">
          
          {/* ROW 1: "Fix your" + 3D Wallet Badge + Pill Widget */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span className="text-5xl sm:text-7xl lg:text-8xl font-black text-zinc-950 tracking-tight">
              Fix your
            </span>

            {/* 3D Wallet & Rupee Coin Card (Rendered as Rich Visual) */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 via-sky-50 to-blue-200 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-[0_8px_20px_rgba(59,130,246,0.15)] border-2 border-white">
              {/* Wallet Visual */}
              <div className="relative flex items-center">
                <div className="w-12 h-9 sm:w-16 sm:h-11 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-md border-t border-blue-300 flex items-center justify-end pr-1 sm:pr-1.5 relative overflow-hidden">
                  <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-purple-600 border-2 border-white shadow-xs" />
                  {/* Green cash sticking out */}
                  <div className="absolute -top-2 left-2 w-6 sm:w-8 h-4 bg-emerald-400 rounded-xs rotate-[-12deg] border border-emerald-600/30" />
                  <div className="absolute -top-3 left-3 w-6 sm:w-8 h-4 bg-emerald-500 rounded-xs rotate-[-4deg] border border-emerald-600/30" />
                </div>

                {/* Gold 3D Coin with Rupee */}
                <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-2 border-white shadow-md flex items-center justify-center text-white font-black text-sm sm:text-base -ml-3 sm:-ml-4 z-10">
                  ₹
                </div>
              </div>

              {/* Trio pill mini card (Piggy bank, Bar chart, Checklist) */}
              <div className="hidden sm:flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-2xl shadow-xs border border-white">
                <div className="w-7 h-7 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <PiggyBank className="w-4 h-4" />
                </div>
                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: "finances" in giant green */}
          <div className="relative">
            <span className="text-6xl sm:text-8xl lg:text-9xl font-black text-[#00a859] tracking-tight block">
              finances
            </span>
          </div>

          {/* ROW 3: Target Pill + "with" + "me!" Pill with swoosh */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-1">
            {/* Target & Arrow Pill */}
            <div className="inline-flex items-center justify-center bg-gradient-to-r from-purple-100 via-pink-50 to-blue-100 p-2 sm:p-2.5 rounded-2xl sm:rounded-3xl shadow-md border-2 border-white">
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shadow-inner relative">
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-3 border-white flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                </div>
                {/* Arrow */}
                <div className="absolute -top-1 -right-1 text-sky-300 font-extrabold text-sm sm:text-base rotate-45">
                  ➔
                </div>
              </div>
            </div>

            {/* "with" */}
            <span className="text-5xl sm:text-7xl lg:text-8xl font-black text-zinc-950 tracking-tight">
              with
            </span>

            {/* "me!" in Gradient Bubble + Swoosh */}
            <div className="relative inline-block">
              <div className="bg-gradient-to-r from-[#7c3aed] via-[#6366f1] to-[#3b82f6] text-white text-5xl sm:text-7xl lg:text-8xl font-black px-6 sm:px-9 py-1 sm:py-2 rounded-3xl sm:rounded-4xl shadow-xl shadow-indigo-500/25 border-2 border-white transform hover:scale-105 transition-transform select-none">
                me!
              </div>
              {/* Playful curved green underline swoosh */}
              <svg className="w-full h-3 sm:h-4 mt-1 text-[#00a859]" viewBox="0 0 160 12" fill="none">
                <path
                  d="M 5 6 Q 80 14 155 4"
                  stroke="#00a859"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Subtitle */}
        <p className="mt-6 sm:mt-8 text-base sm:text-lg text-zinc-600 max-w-xl font-medium leading-relaxed">
          Track, plan, and grow your money — for a better tomorrow.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center gap-4">
          <button
            type="button"
            onClick={onStartAssessment}
            className="px-8 sm:px-10 py-4 rounded-full bg-[#18181b] hover:bg-black text-white font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer group"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {hasDraft && onResumeDraft && (
            <button
              type="button"
              onClick={onResumeDraft}
              className="px-6 py-4 rounded-full bg-[#eaf5ef] hover:bg-[#d5ece0] text-[#1b4d3e] font-bold text-sm border border-[#b7dfcb] shadow-xs hover:scale-105 transition-all cursor-pointer"
            >
              Resume Saved Assessment →
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            const el = document.getElementById('how-it-works');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="mt-4 text-xs sm:text-sm font-semibold text-zinc-600 hover:text-zinc-950 underline underline-offset-4 cursor-pointer transition-colors"
        >
          See how it works
        </button>
      </section>

      {/* HOW FINCORE WORKS (3 SIMPLE STEPS) */}
      <section id="how-it-works" className="w-full space-y-8 pt-4">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Simple 3-Stage Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
            How FinScore Grades Your Financial Health
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
            From basic lifestyle figures to a comprehensive 100-point diagnostic in less than 3 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-2xs space-y-3 hover:border-zinc-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ef] text-[#1b4d3e] font-black text-sm flex items-center justify-center border border-[#c1e1d2]">
              1
            </div>
            <h3 className="text-base font-bold text-zinc-900">Guided Assessment</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Step through 8 bite-sized forms covering your take-home pay, living costs, loan EMIs, health & life policies, emergency buffer, and asset portfolio.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-2xs space-y-3 hover:border-zinc-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ef] text-[#1b4d3e] font-black text-sm flex items-center justify-center border border-[#c1e1d2]">
              2
            </div>
            <h3 className="text-base font-bold text-zinc-900">100-Point Scoring Engine</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Our 4 pillars evaluate 25 points each: Emergency Runway, Insurance Safety Net, Savings Momentum, and Debt-to-Income Exposure with Grade A–D.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-3xl bg-white border border-zinc-200/90 shadow-2xs space-y-3 hover:border-zinc-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#eaf5ef] text-[#1b4d3e] font-black text-sm flex items-center justify-center border border-[#c1e1d2]">
              3
            </div>
            <h3 className="text-base font-bold text-zinc-900">SWOT & Action Plan</h3>
            <p className="text-xs text-zinc-600 leading-relaxed">
              Review a custom 4-quadrant balance sheet SWOT and prioritized steps (+pts gain) to optimize surplus and secure milestone goals.
            </p>
          </div>
        </div>
      </section>

      {/* THE 4 PILLARS (25 PTS EACH = 100 PTS) */}
      <section className="w-full space-y-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-zinc-200/90 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                The 4 Pillars of FinScore (100 Points Total)
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
                Each pillar is measured out of 25 points to ensure balanced foundations without hiding weaknesses.
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#eaf5ef] text-[#1b4d3e] font-extrabold text-xs sm:text-sm border border-[#b7dfcb] shrink-0">
              Maximum 100 / 100
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <PiggyBank className="w-6 h-6 text-emerald-700" />
                <span className="text-xs font-black text-[#1b4d3e] bg-white px-2 py-0.5 rounded border border-[#b7dfcb]">25 pts</span>
              </div>
              <h4 className="text-sm font-bold text-zinc-900">Emergency Fund</h4>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Runway coverage against a 6-month essential benchmark + immediate fund accessibility.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <ShieldCheck className="w-6 h-6 text-teal-700" />
                <span className="text-xs font-black text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">25 pts</span>
              </div>
              <h4 className="text-sm font-bold text-zinc-900">Insurance Protection</h4>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Hospitalization health adequacy + dependent-calibrated pure term life protection.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <TrendingUp className="w-6 h-6 text-blue-700" />
                <span className="text-xs font-black text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">25 pts</span>
              </div>
              <h4 className="text-sm font-bold text-zinc-900">Savings Health</h4>
              <p className="text-[11px] text-zinc-500 leading-normal">
                Net monthly cashflow surplus + savings rate (20%+ benchmark) + systematic SIP discipline.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <CreditCard className="w-6 h-6 text-indigo-700" />
                <span className="text-xs font-black text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">25 pts</span>
              </div>
              <h4 className="text-sm font-bold text-zinc-900">Debt Health</h4>
              <p className="text-[11px] text-zinc-500 leading-normal">
                EMI-to-income ratio (&le;20% safe) + high-interest credit card elimination + repayment timeliness.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3x3 FINANCIAL CALCULATOR SUITE */}
      <CalculatorsHub onSelectCalculator={onSelectCalculator} />

      {/* FINAL BOTTOM CALL TO ACTION */}
      <section className="w-full">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-zinc-950 to-zinc-900 text-white text-center space-y-5 shadow-2xl relative overflow-hidden">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to Discover Your 100-Point FinScore?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto">
              No sign-up or credit card required. Free, private, and calculated directly in your browser.
            </p>
          </div>

          <button
            type="button"
            onClick={onStartAssessment}
            className="px-8 py-3.5 rounded-full bg-white hover:bg-zinc-100 text-zinc-950 font-extrabold text-sm sm:text-base inline-flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <span>Start Free Assessment</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
