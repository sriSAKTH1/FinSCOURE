'use client';

import React from 'react';
import { Plus, Check, Palette } from 'lucide-react';

export type AppTheme = 'normal' | 'light-green' | 'light-blue';

interface ThemeSwitcherProps {
  currentTheme: AppTheme;
  onCycleTheme: () => void;
  onSelectTheme: (theme: AppTheme) => void;
}

const THEME_CONFIG: {
  id: AppTheme;
  name: string;
  dotColor: string;
  badgeBg: string;
  badgeBorder: string;
  description: string;
}[] = [
  {
    id: 'normal',
    name: 'Normal',
    dotColor: 'bg-zinc-800 border-zinc-400',
    badgeBg: 'bg-zinc-100 text-zinc-900',
    badgeBorder: 'border-zinc-300',
    description: 'Clean Neutral Slate & Deep Forest Accent',
  },
  {
    id: 'light-green',
    name: 'Light Green',
    dotColor: 'bg-emerald-500 border-emerald-300',
    badgeBg: 'bg-emerald-100 text-emerald-950',
    badgeBorder: 'border-emerald-300',
    description: 'Fresh Mint Canvas with Vibrant Emerald Accents',
  },
  {
    id: 'light-blue',
    name: 'Light Blue',
    dotColor: 'bg-sky-500 border-sky-300',
    badgeBg: 'bg-sky-100 text-sky-950',
    badgeBorder: 'border-sky-300',
    description: 'Calm Ice Blue Canvas with Royal Sky Accents',
  },
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  currentTheme,
  onCycleTheme,
  onSelectTheme,
}) => {
  const currentConfig = THEME_CONFIG.find(t => t.id === currentTheme) || THEME_CONFIG[0];

  return (
    <div className="fixed top-3 right-3 sm:right-6 z-50 flex items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md rounded-2xl border border-zinc-200/90 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all">
      {/* Clickable "+" Button to Cycle Theme */}
      <button
        type="button"
        onClick={onCycleTheme}
        title="Click '+' to cycle theme (Normal → Light Green → Light Blue)"
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-zinc-100/90 text-xs font-black transition-all cursor-pointer group select-none"
      >
        <span className="w-5 h-5 rounded-full bg-zinc-950 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-110 active:scale-90 transition-transform">
          +
        </span>
        <span className="hidden sm:inline text-zinc-600 font-bold">Theme:</span>
        <span className={`px-2 py-0.5 rounded-lg border text-[11px] font-black ${currentConfig.badgeBg} ${currentConfig.badgeBorder}`}>
          {currentConfig.name}
        </span>
      </button>

      {/* 3 Quick Color Swatch Dots */}
      <div className="flex items-center gap-1 pl-1 border-l border-zinc-200/80">
        {THEME_CONFIG.map((theme) => {
          const isActive = currentTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              onClick={() => onSelectTheme(theme.id)}
              title={`Switch to ${theme.name} theme`}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${theme.dotColor} ${
                isActive ? 'scale-110 ring-2 ring-zinc-950/20 shadow-xs' : 'opacity-70 hover:opacity-100 hover:scale-105'
              }`}
            >
              {isActive && (
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
