'use client';

import React from 'react';
import { FinancialGrade } from '@/types/score';

interface ScoreGaugeProps {
  score: number;
  grade: FinancialGrade;
  gradeTitle: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, grade, gradeTitle }) => {
  // SVG circular gauge calculation
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Use 260 degrees arc for speedometer style
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const getGradeTheme = (g: FinancialGrade) => {
    switch (g) {
      case 'A':
        return {
          textColor: 'text-emerald-700',
          badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          strokeColor: '#059669', // emerald-600
        };
      case 'B':
        return {
          textColor: 'text-teal-700',
          badgeBg: 'bg-teal-50 text-teal-800 border-teal-200',
          strokeColor: '#0d9488', // teal-600
        };
      case 'C':
        return {
          textColor: 'text-amber-700',
          badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
          strokeColor: '#d97706', // amber-600
        };
      case 'D':
      default:
        return {
          textColor: 'text-rose-700',
          badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
          strokeColor: '#e11d48', // rose-600
        };
    }
  };

  const theme = getGradeTheme(grade);

  return (
    <div className="flex flex-col items-center justify-center text-center p-2">
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl sm:text-5xl font-black text-zinc-900 tracking-tight">
            {score}
          </span>
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            out of 100
          </span>
        </div>
      </div>

      {/* Grade Badge */}
      <div className="mt-3 flex items-center gap-2">
        <span className={`text-sm font-extrabold px-3 py-1 rounded-full border shadow-2xs ${theme.badgeBg}`}>
          Grade {grade} · {gradeTitle}
        </span>
      </div>
    </div>
  );
};
