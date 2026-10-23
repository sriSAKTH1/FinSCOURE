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
import { HeroInteractiveBanner } from './HeroInteractiveBanner';
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
      {/* HERO SECTION WITH INTERACTIVE 3D VECTOR ART & ANIMATIONS */}
      <section className="relative -mx-3 flex flex-col items-center justify-center overflow-hidden bg-white pb-12 pt-10 text-center sm:-mx-6 sm:pb-16 sm:pt-14 lg:-mx-8">
        <h1 className="sr-only">Fix your finances with me</h1>
        <div className="w-full max-w-7xl overflow-visible px-2 sm:px-4">
          <HeroInteractiveBanner />
        </div>

        <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-zinc-600 sm:mt-7 sm:text-lg">
          Track, plan, and grow your money — for a better tomorrow.
        </p>

        <div className="mt-6 flex flex-col items-center gap-4 sm:mt-8 sm:flex-row">
          <button
            type="button"
            onClick={onStartAssessment}
            className="group flex cursor-pointer items-center gap-2.5 rounded-full bg-[#18181b] px-8 py-4 text-sm font-extrabold text-white shadow-xl transition-all hover:scale-105 hover:bg-black hover:shadow-2xl active:scale-95 sm:px-10 sm:text-base"
          >
            <span>Get Started Free</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>

          {hasDraft && onResumeDraft && (
            <button
              type="button"
              onClick={onResumeDraft}
              className="cursor-pointer rounded-full border border-[#b7dfcb] bg-[#eaf5ef] px-6 py-4 text-sm font-bold text-[#1b4d3e] shadow-xs transition-all hover:scale-105 hover:bg-[#d5ece0]"
            >
              Resume Saved Assessment →
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="mt-4 cursor-pointer text-xs font-semibold text-zinc-600 underline underline-offset-4 transition-colors hover:text-zinc-950 sm:text-sm"
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
