'use client';

import React, { useState } from 'react';

/**
 * 4-Point Star Sparkle SVG Component
 */
const SparkleStar: React.FC<{
  className?: string;
  color: string;
  size?: number;
  style?: React.CSSProperties;
}> = ({ className = '', color, size = 28, style }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    className={`select-none pointer-events-none transition-transform ${className}`}
    style={style}
    aria-hidden="true"
  >
    <path
      d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
      fill={color}
    />
  </svg>
);

/**
 * Left & Right Financial 3D Icons
 */
const Shield3DIcon: React.FC = () => (
  <div className="group relative flex flex-col items-center cursor-pointer">
    <div className="w-12 h-12 sm:w-15 sm:h-15 lg:w-17 lg:h-17 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/90 p-2.5 border border-emerald-200/90 shadow-md shadow-emerald-600/10 transition-all duration-300 group-hover:scale-115 group-hover:-rotate-6 group-hover:shadow-lg">
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="50%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>
        <path
          d="M 24 4 L 40 10 C 40 26 24 42 24 42 C 24 42 8 26 8 10 Z"
          fill="url(#shieldGrad)"
        />
        <path
          d="M 24 8 L 36 13 C 36 24 24 37 24 37 C 24 37 12 24 12 13 Z"
          fill="none"
          stroke="#A7F3D0"
          strokeWidth="1.5"
          opacity="0.8"
        />
        <path
          d="M 18 22 L 22 26 L 30 18"
          stroke="#FFFFFF"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <span className="mt-1 text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/95 text-emerald-800 border border-emerald-200 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      Protection
    </span>
  </div>
);

const CoinStack3DIcon: React.FC = () => (
  <div className="group relative flex flex-col items-center cursor-pointer">
    <div className="w-12 h-12 sm:w-15 sm:h-15 lg:w-17 lg:h-17 rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-100/90 p-2.5 border border-amber-200/90 shadow-md shadow-amber-600/15 transition-all duration-300 group-hover:scale-115 group-hover:rotate-6 group-hover:shadow-lg">
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <defs>
          <linearGradient id="goldCoinSide" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#B45309" />
          </linearGradient>
          <linearGradient id="goldCoinTop" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        {/* Coin 1 Bottom */}
        <ellipse cx="24" cy="38" rx="15" ry="5.5" fill="url(#goldCoinSide)" />
        <ellipse cx="24" cy="35" rx="15" ry="5.5" fill="url(#goldCoinTop)" />
        {/* Coin 2 Middle */}
        <ellipse cx="24" cy="28" rx="15" ry="5.5" fill="url(#goldCoinSide)" />
        <ellipse cx="24" cy="25" rx="15" ry="5.5" fill="url(#goldCoinTop)" />
        {/* Coin 3 Top */}
        <ellipse cx="24" cy="18" rx="15" ry="5.5" fill="url(#goldCoinSide)" />
        <ellipse cx="24" cy="15" rx="15" ry="5.5" fill="url(#goldCoinTop)" />
        <text x="24" y="19" textAnchor="middle" fill="#78350F" fontSize="12" fontWeight="900">₹</text>
      </svg>
    </div>
    <span className="mt-1 text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/95 text-amber-900 border border-amber-200 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      Savings
    </span>
  </div>
);

const CreditCard3DIcon: React.FC = () => (
  <div className="group relative flex flex-col items-center cursor-pointer">
    <div className="w-12 h-12 sm:w-15 sm:h-15 lg:w-17 lg:h-17 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-100/90 p-2.5 border border-indigo-200/90 shadow-md shadow-indigo-600/10 transition-all duration-300 group-hover:scale-115 group-hover:-rotate-3 group-hover:shadow-lg">
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="4" y="11" width="40" height="26" rx="5" fill="#4338CA" />
        <rect x="4" y="17" width="40" height="5" fill="#1E1B4B" />
        {/* Gold Chip */}
        <rect x="8" y="26" width="7" height="5" rx="1" fill="#FBBF24" stroke="#D97706" strokeWidth="0.8" />
        <circle cx="36" cy="29" r="3" fill="#EF4444" opacity="0.85" />
        <circle cx="32.5" cy="29" r="3" fill="#F59E0B" opacity="0.85" />
      </svg>
    </div>
    <span className="mt-1 text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/95 text-indigo-900 border border-indigo-200 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      Debt-Free
    </span>
  </div>
);

const PlantSprout3DIcon: React.FC = () => (
  <div className="group relative flex flex-col items-center cursor-pointer">
    <div className="w-12 h-12 sm:w-15 sm:h-15 lg:w-17 lg:h-17 rounded-2xl bg-gradient-to-br from-lime-50 to-emerald-100/90 p-2.5 border border-lime-200/90 shadow-md shadow-emerald-600/10 transition-all duration-300 group-hover:scale-115 group-hover:rotate-6 group-hover:shadow-lg">
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        {/* Base Coin */}
        <ellipse cx="24" cy="38" rx="13" ry="4.5" fill="#D97706" />
        <ellipse cx="24" cy="36" rx="13" ry="4.5" fill="#F59E0B" />
        <text x="24" y="38" textAnchor="middle" fill="#78350F" fontSize="6.5" fontWeight="900">₹</text>
        {/* Stem */}
        <path d="M 24 36 Q 24 22 25 14" stroke="#15803D" strokeWidth="2.5" strokeLinecap="round" />
        {/* Left Leaf */}
        <path d="M 24 24 C 15 22 14 14 24 16 C 24 20 24 22 24 24 Z" fill="#22C55E" />
        {/* Right Leaf */}
        <path d="M 25 18 C 34 16 35 8 25 10 C 25 14 25 16 25 18 Z" fill="#16A34A" />
      </svg>
    </div>
    <span className="mt-1 text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/95 text-emerald-900 border border-emerald-200 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      SIP Growth
    </span>
  </div>
);

const Vault3DIcon: React.FC = () => (
  <div className="group relative flex flex-col items-center cursor-pointer">
    <div className="w-12 h-12 sm:w-15 sm:h-15 lg:w-17 lg:h-17 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100/90 p-2.5 border border-sky-200/90 shadow-md shadow-sky-600/10 transition-all duration-300 group-hover:scale-115 group-hover:-rotate-6 group-hover:shadow-lg">
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="6" y="9" width="36" height="30" rx="5" fill="#0284C7" />
        <rect x="8" y="11" width="32" height="26" rx="4" fill="#38BDF8" />
        <circle cx="24" cy="24" r="7.5" fill="#0369A1" />
        <circle cx="24" cy="24" r="5.5" fill="#F59E0B" />
        <circle cx="24" cy="24" r="2" fill="#78350F" />
        <line x1="24" y1="18.5" x2="24" y2="20.5" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="24" y1="27.5" x2="24" y2="29.5" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="18.5" y1="24" x2="20.5" y2="24" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
        <line x1="27.5" y1="24" x2="29.5" y2="24" stroke="#78350F" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    </div>
    <span className="mt-1 text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/95 text-sky-900 border border-sky-200 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      Emergency Fund
    </span>
  </div>
);

const Trophy3DIcon: React.FC = () => (
  <div className="group relative flex flex-col items-center cursor-pointer">
    <div className="w-12 h-12 sm:w-15 sm:h-15 lg:w-17 lg:h-17 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100/90 p-2.5 border border-amber-200/90 shadow-md shadow-amber-600/15 transition-all duration-300 group-hover:scale-115 group-hover:rotate-6 group-hover:shadow-lg">
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <rect x="16" y="37" width="16" height="5" rx="1.5" fill="#78350F" />
        <rect x="20" y="31" width="8" height="6" fill="#D97706" />
        <path d="M 12 11 L 36 11 C 36 24 28 29 24 31 C 20 29 12 24 12 11 Z" fill="#FBBF24" />
        <ellipse cx="24" cy="11" rx="12" ry="2.5" fill="#FDE68A" />
        <path d="M 12 14 C 6 14 6 22 12 24" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M 36 14 C 42 14 42 22 36 24" stroke="#D97706" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M 24 16 L 25.5 19.5 L 29 20 L 26.5 22.5 L 27 26 L 24 24 L 21 26 L 21.5 22.5 L 19 20 L 22.5 19.5 Z" fill="#FFFFFF" />
      </svg>
    </div>
    <span className="mt-1 text-[9px] sm:text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/95 text-amber-900 border border-amber-200 shadow-2xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      100/100 Score
    </span>
  </div>
);

export const HeroInteractiveBanner: React.FC = () => {
  const [isWalletHovered, setIsWalletHovered] = useState(false);
  const [isTargetHovered, setIsTargetHovered] = useState(false);
  const [isMeHovered, setIsMeHovered] = useState(false);

  return (
    <div className="relative w-full max-w-[1440px] mx-auto px-2 sm:px-4 lg:px-6 pt-1 pb-4 sm:pt-2 sm:pb-6 select-none overflow-visible">
      {/* ========================================================
          LEFT FLANK FLOATING FINANCE ICONS (SPREAD WIDER)
          ======================================================== */}
      {/* 1. Shield (Insurance Protection) */}
      <div className="hidden lg:flex absolute top-4 left-2 xl:left-8 2xl:left-12 z-10 animate-hero-float">
        <Shield3DIcon />
      </div>

      {/* 2. Gold Coin Stack (Savings) */}
      <div
        className="hidden lg:flex absolute top-[44%] left-1 xl:left-6 2xl:left-10 z-10 animate-hero-float-reverse"
        style={{ animationDelay: '1s' }}
      >
        <CoinStack3DIcon />
      </div>

      {/* 3. Credit Card (Debt Freedom) */}
      <div
        className="hidden lg:flex absolute bottom-4 left-3 xl:left-10 2xl:left-14 z-10 animate-hero-float"
        style={{ animationDelay: '2s' }}
      >
        <CreditCard3DIcon />
      </div>

      {/* ========================================================
          RIGHT FLANK FLOATING FINANCE ICONS (SPREAD WIDER)
          ======================================================== */}
      {/* 4. SIP Growth Plant */}
      <div
        className="hidden lg:flex absolute top-4 right-2 xl:right-8 2xl:right-12 z-10 animate-hero-float-reverse"
        style={{ animationDelay: '0.6s' }}
      >
        <PlantSprout3DIcon />
      </div>

      {/* 5. Safe / Vault (Emergency Fund) */}
      <div
        className="hidden lg:flex absolute top-[44%] right-1 xl:right-6 2xl:right-10 z-10 animate-hero-float"
        style={{ animationDelay: '1.6s' }}
      >
        <Vault3DIcon />
      </div>

      {/* 6. Trophy (100/100 Financial Health) */}
      <div
        className="hidden lg:flex absolute bottom-4 right-3 xl:right-10 2xl:right-14 z-10 animate-hero-float-reverse"
        style={{ animationDelay: '2.4s' }}
      >
        <Trophy3DIcon />
      </div>

      {/* ========================================================
          BACKGROUND FLOATING SPARKLE STARS
          ======================================================== */}
      {/* Top Center: Blue Sparkle */}
      <div className="absolute top-0 left-[48%] -translate-x-1/2 z-0 animate-hero-sparkle">
        <SparkleStar color="#2563EB" size={32} />
      </div>

      {/* Middle-Left: Green Sparkle */}
      <div
        className="absolute top-[38%] left-12 sm:left-20 z-0 animate-hero-sparkle"
        style={{ animationDelay: '1.2s' }}
      >
        <SparkleStar color="#10B981" size={26} />
      </div>

      {/* Bottom-Left: Green Sparkle */}
      <div
        className="absolute bottom-6 left-16 sm:left-32 z-0 animate-hero-sparkle"
        style={{ animationDelay: '2.1s' }}
      >
        <SparkleStar color="#10B981" size={34} />
      </div>

      {/* Right-Middle: Golden Sparkle */}
      <div
        className="absolute top-[48%] right-12 sm:right-24 z-0 animate-hero-sparkle"
        style={{ animationDelay: '0.8s' }}
      >
        <SparkleStar color="#F59E0B" size={32} />
      </div>

      {/* Bottom-Right: Blue Sparkle */}
      <div
        className="absolute bottom-2 right-16 sm:right-36 z-0 animate-hero-sparkle"
        style={{ animationDelay: '1.8s' }}
      >
        <SparkleStar color="#3B82F6" size={24} />
      </div>

      {/* ========================================================
          HERO CONTENT CONTAINER (SCALES PROPORTIONALLY ON ALL SCREENS)
          ======================================================== */}
      <div className="relative z-10 flex flex-col items-center w-full px-1 sm:px-2">
        {/* ====================================================
            ROW 1: "Fix your" + 3D Wallet & Coin + 3-Icon Badge
            ==================================================== */}
        <div className="flex flex-nowrap items-center justify-center gap-2 xs:gap-3 sm:gap-6 lg:gap-10 w-full max-w-6xl">
          {/* "Fix your" with Green Accent Rays */}
          <div className="relative inline-flex items-center shrink-0">
            {/* Playful Green Burst Rays (Top-Left of "Fix") */}
            <svg
              className="absolute -top-3.5 -left-3.5 xs:-top-5 xs:-left-5 sm:-top-7 sm:-left-7 lg:-top-9 lg:-left-9 w-6 h-6 xs:w-8 xs:h-8 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-[#00A859] animate-hero-float pointer-events-none"
              viewBox="0 0 60 60"
              fill="none"
              aria-hidden="true"
            >
              {/* Ray 1 */}
              <line
                x1="22"
                y1="34"
                x2="10"
                y2="28"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Ray 2 */}
              <line
                x1="26"
                y1="28"
                x2="16"
                y2="14"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Ray 3 */}
              <line
                x1="34"
                y1="24"
                x2="32"
                y2="8"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
              {/* Ray 4 */}
              <line
                x1="40"
                y1="26"
                x2="52"
                y2="18"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
              />
            </svg>

            <span className="font-hero text-[clamp(18px,5.2vw,96px)] font-[900] tracking-tight text-[#0F172A] leading-none whitespace-nowrap">
              Fix your
            </span>
          </div>

          {/* 3D Blue Wallet with Cash & ₹ Rupee Coin in Soft Capsule */}
          <div
            className="relative cursor-pointer transition-transform duration-300 hover:scale-105 shrink-0"
            onMouseEnter={() => setIsWalletHovered(true)}
            onMouseLeave={() => setIsWalletHovered(false)}
          >
            {/* Speed Rays above wallet */}
            <div className="absolute -top-2.5 right-4 sm:-top-5 sm:right-10 flex gap-0.5 sm:gap-1 z-20">
              <span className="w-1 h-2.5 sm:w-1.5 sm:h-4 lg:h-5 bg-[#00A859] rounded-full -rotate-30 block animate-hero-pulse-glow" />
              <span className="w-1 h-3 sm:w-1.5 sm:h-5 lg:h-6 bg-[#00A859] rounded-full -rotate-15 block animate-hero-pulse-glow" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 h-2.5 sm:w-1.5 sm:h-4 lg:h-5 bg-[#00A859] rounded-full rotate-10 block animate-hero-pulse-glow" style={{ animationDelay: '0.4s' }} />
            </div>

            {/* Glowing Pill Backdrop (Wider & More Expansive) */}
            <div className="relative rounded-[18px] xs:rounded-[24px] sm:rounded-[34px] lg:rounded-[42px] bg-gradient-to-br from-[#cbf3ff] via-[#d7efff] to-[#bcdfff] p-1.5 xs:p-2 sm:p-3 lg:p-3.5 shadow-md lg:shadow-lg shadow-sky-500/15 border border-white/80 animate-hero-float">
              {/* 3D Wallet SVG Illustration */}
              <svg
                className={`w-[clamp(72px,22vw,224px)] h-auto transition-transform duration-500 ease-out ${
                  isWalletHovered ? 'scale-105 -rotate-2' : ''
                }`}
                viewBox="0 0 200 120"
                fill="none"
              >
                <defs>
                  {/* Banknote Green Gradients */}
                  <linearGradient id="cashGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="cashGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6EE7B7" />
                    <stop offset="100%" stopColor="#10B981" />
                  </linearGradient>

                  {/* Wallet Blue Gradients */}
                  <linearGradient id="walletGradBack" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1D4ED8" />
                  </linearGradient>
                  <linearGradient id="walletGradFront" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="50%" stopColor="#2563EB" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>

                  {/* Gold Coin 3D Gradients */}
                  <linearGradient id="goldCoinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="40%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                  <linearGradient id="goldRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FEF3C7" />
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#B45309" />
                  </linearGradient>

                  {/* Coin Drop Shadow */}
                  <filter id="coinShadow" x="-20%" y="-20%" width="150%" height="150%">
                    <feDropShadow dx="2" dy="5" stdDeviation="4" floodColor="#78350F" floodOpacity="0.35" />
                  </filter>
                  <filter id="walletShadow" x="-10%" y="-10%" width="130%" height="130%">
                    <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#1E3A8A" floodOpacity="0.25" />
                  </filter>
                </defs>

                {/* 1. Cash Notes Peeking Out */}
                <g className="transition-transform duration-300" style={{ transform: isWalletHovered ? 'translateY(-4px)' : 'translateY(0)' }}>
                  {/* Back Note */}
                  <rect
                    x="38"
                    y="10"
                    width="54"
                    height="32"
                    rx="5"
                    transform="rotate(-16 38 10)"
                    fill="url(#cashGrad1)"
                    stroke="#047857"
                    strokeWidth="1.5"
                  />
                  {/* Front Note */}
                  <rect
                    x="56"
                    y="6"
                    width="58"
                    height="34"
                    rx="6"
                    transform="rotate(6 56 6)"
                    fill="url(#cashGrad2)"
                    stroke="#065F46"
                    strokeWidth="1.5"
                  />
                  {/* Front Note Inner Detail */}
                  <ellipse cx="88" cy="24" rx="9" ry="6" fill="#A7F3D0" opacity="0.75" transform="rotate(6 56 6)" />
                </g>

                {/* 2. Wallet Back Panel */}
                <rect
                  x="20"
                  y="30"
                  width="112"
                  height="66"
                  rx="16"
                  fill="url(#walletGradBack)"
                  filter="url(#walletShadow)"
                />

                {/* 3. Wallet Front Body with 3D Depth */}
                <rect
                  x="20"
                  y="36"
                  width="112"
                  height="62"
                  rx="15"
                  fill="url(#walletGradFront)"
                />
                {/* Subtle Leather Stitching */}
                <rect
                  x="24"
                  y="40"
                  width="104"
                  height="54"
                  rx="12"
                  fill="none"
                  stroke="#93C5FD"
                  strokeWidth="1.2"
                  strokeDasharray="3 3"
                  opacity="0.6"
                />

                {/* 4. Wallet Clasp Flap */}
                <path
                  d="M 90 54 L 118 54 C 124 54 128 58 128 64 C 128 70 124 74 118 74 L 90 74 Z"
                  fill="#7C3AED"
                />
                <circle cx="118" cy="64" r="5" fill="#FFFFFF" />
                <circle cx="119" cy="63" r="2" fill="#E0E7FF" />

                {/* 5. 3D Embossed Gold Rupee Coin */}
                <g filter="url(#coinShadow)" className="transition-transform duration-300" style={{ transform: isWalletHovered ? 'scale(1.06) translateY(-2px)' : 'scale(1)' }}>
                  {/* Outer Rim */}
                  <circle cx="140" cy="72" r="34" fill="url(#goldRimGrad)" />
                  {/* Inner Coin Surface */}
                  <circle cx="140" cy="72" r="28" fill="url(#goldCoinGrad)" />
                  <circle cx="140" cy="72" r="26" fill="none" stroke="#FDE68A" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.8" />

                  {/* Embossed ₹ Symbol */}
                  <text
                    x="140"
                    y="82"
                    textAnchor="middle"
                    fill="#78350F"
                    fontSize="30"
                    fontWeight="900"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    style={{ filter: 'drop-shadow(1px 2px 1px #FDE68A)' }}
                  >
                    ₹
                  </text>

                  {/* Specular Glint */}
                  <ellipse cx="128" cy="56" rx="6" ry="3" fill="#FFFFFF" opacity="0.65" transform="rotate(-30 128 56)" />
                </g>
              </svg>
            </div>
          </div>

          {/* Dotted Curved Trajectory line to Top-Right Arrow */}
          <div className="hidden lg:block relative -ml-3 self-start mt-2">
            <svg width="60" height="50" viewBox="0 0 70 60" fill="none" className="overflow-visible">
              <path
                d="M 10 45 C 15 20, 45 10, 60 16"
                stroke="#0F172A"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-hero-dash"
              />
              {/* 3D Purple Arrow */}
              <polygon
                points="60,10 68,18 56,22"
                fill="#7C3AED"
                className="animate-hero-float"
              />
            </svg>
          </div>

          {/* Top-Right Pill: 3 Micro 3D Icons (Piggy Bank, Bar Chart, Checklist) - Wider & Roomier */}
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-3 lg:gap-4 px-2.5 py-1.5 xs:px-3.5 xs:py-2 sm:px-5 sm:py-2.5 lg:px-7 lg:py-3.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md lg:shadow-xl shadow-slate-200/50 animate-hero-float-reverse hover:shadow-2xl transition-all shrink-0">
            {/* 1. Pink Piggy Bank with Coin */}
            <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 lg:w-13 lg:h-13 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center relative hover:scale-110 transition-transform">
              <svg className="w-4 h-4 xs:w-5.5 xs:h-5.5 sm:w-7 sm:h-7 lg:w-9 lg:h-9" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="8" r="4.5" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
                <text x="20" y="10.5" textAnchor="middle" fill="#78350F" fontSize="5.5" fontWeight="900">₹</text>
                <ellipse cx="20" cy="24" rx="13" ry="10" fill="#F472B6" />
                <ellipse cx="20" cy="23" rx="12" ry="9" fill="#F9A8D4" />
                <ellipse cx="9" cy="24" rx="3.5" ry="4.5" fill="#EC4899" />
                <circle cx="8" cy="23" r="0.9" fill="#831843" />
                <circle cx="8" cy="25.5" r="0.9" fill="#831843" />
                <circle cx="15" cy="19" r="1.5" fill="#1E293B" />
                <circle cx="14.5" cy="18.5" r="0.5" fill="#FFFFFF" />
                <polygon points="17,14 22,12 20,18" fill="#EC4899" />
                <rect x="13" y="32" width="3.5" height="3" rx="1.5" fill="#DB2777" />
                <rect x="23" y="32" width="3.5" height="3" rx="1.5" fill="#DB2777" />
                <rect x="17" y="14" width="6" height="1.5" rx="0.75" fill="#BE185D" />
              </svg>
            </div>

            {/* 2. 3D Bar Chart */}
            <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 lg:w-13 lg:h-13 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center hover:scale-110 transition-transform">
              <svg className="w-3.5 h-3.5 xs:w-5 xs:h-5 sm:w-6.5 sm:h-6.5 lg:w-8 lg:h-8" viewBox="0 0 32 32" fill="none">
                <rect x="5" y="18" width="5" height="10" rx="2.5" fill="#60A5FA" />
                <rect x="13" y="12" width="5" height="16" rx="2.5" fill="#3B82F6" />
                <rect x="21" y="6" width="5" height="22" rx="2.5" fill="#1D4ED8" />
                <path d="M 6 15 L 15 9 L 26 4" stroke="#00C9A7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                <polygon points="26,1 28,6 23,6" fill="#00C9A7" />
              </svg>
            </div>

            {/* 3. 3D Checklist Document */}
            <div className="w-6 h-6 xs:w-8 xs:h-8 sm:w-10 sm:h-10 lg:w-13 lg:h-13 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center hover:scale-110 transition-transform">
              <svg className="w-3.5 h-3.5 xs:w-5 xs:h-5 sm:w-6.5 sm:h-6.5 lg:w-8 lg:h-8" viewBox="0 0 32 32" fill="none">
                <rect x="6" y="4" width="20" height="24" rx="4" fill="#A855F7" />
                <rect x="7" y="5" width="18" height="22" rx="3" fill="#C084FC" />
                <circle cx="11" cy="10" r="1.5" fill="#FFFFFF" />
                <line x1="15" y1="10" x2="21" y2="10" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="11" cy="16" r="1.5" fill="#FFFFFF" />
                <line x1="15" y1="16" x2="22" y2="16" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 9.5 21.5 L 11 23 L 13 20" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="15" y1="21.5" x2="20" y2="21.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>
        </div>

        {/* ====================================================
            ROW 2: Dotted Flow + "finances" + Growth Badge (Wider)
            ==================================================== */}
        <div className="relative flex items-center justify-center w-full mt-1 xs:mt-1.5 sm:mt-3 lg:mt-4">
          {/* Left Yellow Growth Badge & Curved Flow Trail */}
          <div className="absolute left-0 xs:left-2 sm:left-6 lg:left-14 top-0 flex flex-col items-center">
            {/* Golden Growth Badge */}
            <div className="w-8 h-8 xs:w-10 xs:h-10 sm:w-15 sm:h-15 lg:w-22 lg:h-22 rounded-full bg-[#FEF3C7] border-2 sm:border-3 lg:border-4 border-[#FDE047] shadow-md flex items-center justify-center animate-hero-float hover:scale-110 transition-transform">
              <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-9 sm:h-9 lg:w-13 lg:h-13 rounded-lg sm:rounded-xl bg-white shadow-2xs flex items-center justify-center">
                <svg className="w-3 h-3 xs:w-4 xs:h-4 sm:w-6 sm:h-6 lg:w-8 lg:h-8" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="14" width="4" height="7" rx="1" fill="#10B981" />
                  <rect x="10" y="9" width="4" height="12" rx="1" fill="#059669" />
                  <rect x="17" y="4" width="4" height="17" rx="1" fill="#047857" />
                  <path d="M 4 12 L 12 7 L 19 3" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
                  <polygon points="19,1 21,5 16,5" fill="#047857" />
                </svg>
              </div>
            </div>

            {/* Dotted Flow Line sweeping down and right toward Target */}
            <div className="relative w-9 h-9 xs:w-12 xs:h-12 sm:w-18 sm:h-18 lg:w-26 lg:h-26 overflow-visible -mt-1 sm:-mt-2">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 80" fill="none">
                <path
                  d="M 40 5 C 30 50, 60 70, 95 72"
                  stroke="#0F172A"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="animate-hero-dash"
                />
                <polygon
                  points="90,65 102,72 90,79"
                  fill="#2563EB"
                  className="animate-hero-float"
                />
              </svg>
            </div>
          </div>

          {/* "finances" in huge, vibrant emerald green typography with matching rounded font */}
          <span className="font-hero text-[clamp(26px,8.5vw,132px)] font-[900] tracking-tight text-[#00A859] leading-none transition-transform duration-300 hover:scale-[1.02] drop-shadow-sm whitespace-nowrap">
            finances
          </span>
        </div>

        {/* ====================================================
            ROW 3: Bullseye Target + "with" + "me!" with Underline (Wider)
            ==================================================== */}
        <div className="flex flex-nowrap items-center justify-center gap-2 xs:gap-3 sm:gap-6 lg:gap-10 mt-1 xs:mt-1.5 sm:mt-3 lg:mt-4 w-full max-w-6xl">
          {/* 3D Bullseye Target with Arrow in Purple Pill */}
          <div
            className="cursor-pointer transition-transform duration-300 hover:scale-105 shrink-0"
            onMouseEnter={() => setIsTargetHovered(true)}
            onMouseLeave={() => setIsTargetHovered(false)}
          >
            <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3.5 px-2.5 py-1.5 xs:px-3.5 xs:py-2 sm:px-5 sm:py-2.5 lg:px-7 lg:py-3.5 rounded-full bg-gradient-to-r from-[#f3e8ff] to-[#e0e7ff] border border-purple-200 shadow-md animate-hero-float">
              {/* 3D Dartboard Bullseye SVG */}
              <svg
                className={`w-7 h-7 xs:w-9 xs:h-9 sm:w-12 sm:h-12 lg:w-17 lg:h-17 transition-transform duration-300 ${
                  isTargetHovered ? 'rotate-12 scale-110' : ''
                }`}
                viewBox="0 0 60 60"
                fill="none"
              >
                <defs>
                  <filter id="targetGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="1" dy="3" stdDeviation="3" floodColor="#6B21A8" floodOpacity="0.25" />
                  </filter>
                </defs>
                <g filter="url(#targetGlow)">
                  <circle cx="30" cy="30" r="26" fill="#8B5CF6" />
                  <circle cx="30" cy="30" r="20" fill="#FFFFFF" />
                  <circle cx="30" cy="30" r="14" fill="#7C3AED" />
                  <circle cx="30" cy="30" r="8" fill="#FFFFFF" />
                  <circle cx="30" cy="30" r="4" fill="#4C1D95" />
                </g>

                {/* Cyan Dart Hitting Bullseye */}
                <g transform="rotate(-35 30 30)">
                  <line x1="30" y1="30" x2="52" y2="30" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
                  <polygon points="30,28 26,30 30,32" fill="#E2E8F0" />
                  <polygon points="46,30 52,22 43,26" fill="#06B6D4" />
                  <polygon points="46,30 52,38 43,34" fill="#06B6D4" />
                  <polygon points="44,30 54,27 48,30" fill="#38BDF8" />
                </g>
              </svg>
            </div>
          </div>

          {/* "with" text */}
          <span className="font-hero text-[clamp(18px,5.2vw,96px)] font-[900] tracking-tight text-[#0F172A] leading-none whitespace-nowrap shrink-0">
            with
          </span>

          {/* "me!" in Vibrant Gradient Pill with Green Smile Underline (Wider) */}
          <div
            className="relative inline-flex flex-col items-center cursor-pointer shrink-0"
            onMouseEnter={() => setIsMeHovered(true)}
            onMouseLeave={() => setIsMeHovered(false)}
          >
            {/* Gradient Capsule */}
            <div
              className={`px-4 py-1.5 xs:px-6 xs:py-2 sm:px-10 sm:py-2.5 lg:px-16 lg:py-4 rounded-full bg-gradient-to-r from-[#7C3AED] via-[#5B21B6] to-[#0284C7] shadow-md lg:shadow-xl shadow-purple-600/30 transition-all duration-300 ${
                isMeHovered ? 'scale-110 shadow-2xl shadow-purple-600/40 rotate-1' : 'hover:scale-105'
              }`}
            >
              <span className="font-hero text-[clamp(18px,5.2vw,88px)] font-[900] tracking-tight text-white leading-none block whitespace-nowrap">
                me!
              </span>
            </div>

            {/* Playful Green Smile Underline / Brush Stroke */}
            <div className="w-full mt-0.5 sm:mt-1.5 px-1 sm:px-2">
              <svg
                className="w-full h-2 xs:h-2.5 sm:h-4 lg:h-6 text-[#00A859] overflow-visible"
                viewBox="0 0 160 20"
                fill="none"
              >
                <path
                  d="M 6 8 C 45 18, 115 18, 154 6"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
