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
  // Otherwise Assessment and Score Dashboard don't show logo on top
  if (activePage === 'assessment' || activePage === 'dashboard') {
    return null;
  }

  const isCenter = activePage === 'calculators';

  return (
    <div className="sticky top-0 z-50 pointer-events-none w-full print:hidden">
      <div
        className={`w-full pt-4 sm:pt-6 pb-2 flex items-center ${
          isCenter
            ? 'justify-center px-4'
            : 'justify-start pl-6 sm:pl-8 md:pl-10 pr-4'
        }`}
      >
        <div
          onClick={() => onNavigate('home')}
          className="pointer-events-auto flex items-center cursor-pointer group select-none shrink-0"
          title="FinScore — Fix your finances with me!"
        >
          <img
            src="/logo.png"
            alt="FinScore — Fix Your Finance With Me!"
            className="h-12 sm:h-14 md:h-16 w-auto object-contain hover:opacity-90 transition-opacity drop-shadow-xs"
          />
        </div>
      </div>
    </div>
  );
};
