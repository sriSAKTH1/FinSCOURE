'use client';

import React from 'react';
import { 
  ShieldCheck, 
  PiggyBank, 
  TrendingUp, 
  CreditCard, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface MetricItem {
  label: string;
  value: string;
  status?: 'good' | 'neutral' | 'warn';
}

interface PillarCardProps {
  pillarId: 'emergencyFund' | 'insuranceProtection' | 'savingsHealth' | 'debtHealth';
  title: string;
  subtitle: string;
  score: number;
  maxScore?: number;
  breakdown: { label: string; score: number; maxScore: number }[];
  metrics: MetricItem[];
  tips?: string[];
}

export const PillarCard: React.FC<PillarCardProps> = ({
  pillarId,
  title,
  subtitle,
  score,
  maxScore = 25,
  breakdown,
  metrics,
  tips = [],
}) => {
  const percentage = Math.round((score / maxScore) * 100);

  const getPillarIcon = () => {
    switch (pillarId) {
      case 'emergencyFund':
        return <PiggyBank className="w-5 h-5 text-emerald-800" />;
      case 'insuranceProtection':
        return <ShieldCheck className="w-5 h-5 text-teal-800" />;
      case 'savingsHealth':
        return <TrendingUp className="w-5 h-5 text-blue-800" />;
      case 'debtHealth':
        return <CreditCard className="w-5 h-5 text-indigo-800" />;
    }
  };

  const getScoreColor = () => {
    if (score >= 20) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 14) return 'text-teal-700 bg-teal-50 border-teal-200';
    if (score >= 8) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center shrink-0">
              {getPillarIcon()}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 tracking-tight">{title}</h3>
              <p className="text-xs text-zinc-500 leading-tight">{subtitle}</p>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-xl border text-xs font-black shrink-0 ${getScoreColor()}`}>
            {score} / {maxScore} pts
          </div>
        </div>

        {/* Progress Bar */}
        <div className="my-4">
          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                score >= 20
                  ? 'bg-emerald-600'
                  : score >= 14
                  ? 'bg-teal-600'
                  : score >= 8
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Point Breakdown bars */}
        <div className="space-y-1.5 py-2">
          {breakdown.map((b, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span className="text-zinc-600">{b.label}</span>
              <span className="font-semibold text-zinc-900">
                {b.score} / {b.maxScore} pts
              </span>
            </div>
          ))}
        </div>

        {/* Key Diagnostic Metrics Grid */}
        <div className="grid grid-cols-2 gap-2 pt-3 my-2 border-t border-zinc-100">
          {metrics.map((m, i) => (
            <div key={i} className="p-2.5 rounded-xl bg-zinc-50/80 border border-zinc-100">
              <div className="text-[10px] text-zinc-500 font-medium truncate">{m.label}</div>
              <div
                className={`text-xs font-bold truncate mt-0.5 ${
                  m.status === 'warn'
                    ? 'text-amber-700'
                    : m.status === 'good'
                    ? 'text-emerald-700'
                    : 'text-zinc-900'
                }`}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Recommendations / Gaps */}
      {tips.length > 0 && (
        <div className="mt-4 pt-3 border-t border-zinc-100 space-y-1">
          {tips.slice(0, 2).map((tip, i) => (
            <div key={i} className="text-[11px] text-zinc-600 flex items-start gap-1.5 leading-snug">
              <span className="text-emerald-600 font-bold shrink-0">→</span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
