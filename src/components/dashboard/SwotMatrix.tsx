'use client';

import React from 'react';
import { SWOTAnalysis } from '@/types/score';
import { CheckCircle2, AlertTriangle, Lightbulb, ShieldAlert } from 'lucide-react';

interface SwotMatrixProps {
  swot: SWOTAnalysis;
}

export const SwotMatrix: React.FC<SwotMatrixProps> = ({ swot }) => {
  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 p-5 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
            Financial SWOT Analysis
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500">
            A strategic evaluation of your personal balance sheet, safety nets, and risks.
          </p>
        </div>
        <span className="text-xs font-semibold text-zinc-500 bg-zinc-100 px-2.5 py-1 rounded-full self-start sm:self-center">
          Tailored Diagnostics
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quadrant 1: Strengths */}
        <div className="p-5 rounded-2xl bg-[#eaf5ef]/60 border border-[#b7dfcb] space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <h4 className="text-sm font-bold text-[#1b4d3e]">Strengths (Foundations)</h4>
          </div>

          <ul className="space-y-2">
            {swot.strengths.map((item, idx) => (
              <li key={idx} className="text-xs text-zinc-700 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quadrant 2: Weaknesses */}
        <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
            </div>
            <h4 className="text-sm font-bold text-amber-900">Weaknesses (Friction Points)</h4>
          </div>

          <ul className="space-y-2">
            {swot.weaknesses.map((item, idx) => (
              <li key={idx} className="text-xs text-zinc-700 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quadrant 3: Opportunities */}
        <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-blue-700" />
            </div>
            <h4 className="text-sm font-bold text-blue-900">Opportunities (Catalysts)</h4>
          </div>

          <ul className="space-y-2">
            {swot.opportunities.map((item, idx) => (
              <li key={idx} className="text-xs text-zinc-700 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quadrant 4: Threats */}
        <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-rose-700" />
            </div>
            <h4 className="text-sm font-bold text-rose-900">Threats (Vulnerabilities)</h4>
          </div>

          <ul className="space-y-2">
            {swot.threats.map((item, idx) => (
              <li key={idx} className="text-xs text-zinc-700 flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
