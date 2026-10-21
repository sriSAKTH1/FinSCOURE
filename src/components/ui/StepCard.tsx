'use client';

import React from 'react';

interface StepCardProps {
  stepNumber: number | string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  className?: string;
}

export const StepCard: React.FC<StepCardProps> = ({
  stepNumber,
  title,
  subtitle,
  children,
  headerAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-white rounded-2xl sm:rounded-3xl border border-zinc-200/90 p-6 sm:p-8 lg:p-10 shadow-[0_4px_24px_rgba(0,0,0,0.03)] transition-all ${className}`}
    >
      {/* Step Header */}
      <div className="flex items-start justify-between gap-4 mb-6 sm:mb-8 pb-6 border-b border-zinc-100">
        <div className="flex items-start gap-4">
          {/* Badge */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#eaf5ef] text-[#1b4d3e] font-extrabold text-sm sm:text-base flex items-center justify-center shrink-0 border border-[#c1e1d2] shadow-2xs">
            {stepNumber}
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-bold text-zinc-900 tracking-tight">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 leading-relaxed">
              {subtitle}
            </p>
          </div>
        </div>

        {headerAction && <div>{headerAction}</div>}
      </div>

      {/* Body content */}
      <div>{children}</div>
    </div>
  );
};
