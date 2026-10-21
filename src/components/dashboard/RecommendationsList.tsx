'use client';

import React from 'react';
import { Recommendation } from '@/types/score';
import { 
  ShieldCheck, 
  TrendingUp, 
  CreditCard, 
  PiggyBank, 
  Target, 
  ArrowUpRight 
} from 'lucide-react';

interface RecommendationsListProps {
  recommendations: Recommendation[];
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({ recommendations }) => {
  const getIcon = (type: Recommendation['iconType']) => {
    switch (type) {
      case 'shield':
        return <ShieldCheck className="w-5 h-5 text-teal-700" />;
      case 'credit-card':
        return <CreditCard className="w-5 h-5 text-rose-700" />;
      case 'piggy-bank':
        return <PiggyBank className="w-5 h-5 text-emerald-700" />;
      case 'trending-up':
      case 'target':
      default:
        return <TrendingUp className="w-5 h-5 text-blue-700" />;
    }
  };

  const getPriorityBadge = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200">
            Priority 1 · Immediate
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
            Priority 2 · Strategic
          </span>
        );
      case 'low':
      default:
        return (
          <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 border border-zinc-200">
            Priority 3 · Long-term
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 p-5 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 tracking-tight">
            Actionable Recommendations
          </h3>
          <p className="text-xs sm:text-sm text-zinc-500">
            High-leverage steps to strengthen your financial defenses and increase your FinScore.
          </p>
        </div>
        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 self-start sm:self-center">
          {recommendations.length} Tailored Actions
        </span>
      </div>

      <div className="space-y-3.5">
        {recommendations.map((rec, idx) => (
          <div
            key={rec.id || idx}
            className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
          >
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center shrink-0 mt-0.5">
                {getIcon(rec.iconType)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {getPriorityBadge(rec.priority)}
                  <h4 className="text-sm font-bold text-zinc-900">{rec.title}</h4>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed max-w-2xl">
                  {rec.action}
                </p>
              </div>
            </div>

            {rec.estimatedScoreGain && (
              <div className="self-end sm:self-center shrink-0">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1b4d3e] bg-[#eaf5ef] px-3 py-1.5 rounded-xl border border-[#b7dfcb]">
                  <span>+{rec.estimatedScoreGain} FinScore pts</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
