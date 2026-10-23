'use client';

import React from 'react';
import { CurrencyCode } from '@/types/assessment';

export type ActivePage = 'home' | 'assessment' | 'dashboard' | 'calculators';

interface HeaderProps {
  activePage?: ActivePage;
  onNavigate: (page: ActivePage) => void;
  currency?: CurrencyCode;
  onCurrencyChange?: (curr: CurrencyCode) => void;
  onLoadSample?: (key: string) => void;
  onReset?: () => void;
  lastSavedAt?: string;
  hasCalculatedScore?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ activePage = 'home', onNavigate }) => {
  // Only show top logo on home page; calculation has it in its header, Assessment/Dashboard don't show on top
  if (activePage !== 'home') {
    return null;
  }

  return (
    <div className="fixed top-3 left-4 sm:top-4 sm:left-6 md:left-8 z-50 print:hidden pointer-events-auto">
      <div
        onClick={() => {
          onNavigate('home');
          if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
        className="flex items-center cursor-pointer group select-none shrink-0 bg-transparent border-none shadow-none p-0 transition-transform duration-300 hover:scale-105 active:scale-95"
        title="FinScore — Fix your finances with me!"
      >
        <img
          src="/logo.png"
          alt="FinScore — Fix Your Finance With Me!"
          className="h-8 sm:h-10 md:h-11 w-auto object-contain transition-opacity group-hover:opacity-90 drop-shadow-xs"
        />
      </div>
    </div>
  );
};
