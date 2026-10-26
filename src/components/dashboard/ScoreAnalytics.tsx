'use client';

import React, { useState, useMemo } from 'react';
import { AssessmentData } from '@/types/assessment';
import { FinScoreResult } from '@/types/score';
import { formatCurrency, parseNum } from '@/utils/calculations';
import { 
  Radar, 
  TrendingUp, 
  PieChart, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowUpRight, 
  Layers, 
  Activity,
  Zap,
  ShieldCheck,
  Target
} from 'lucide-react';

interface ScoreAnalyticsProps {
  assessment: AssessmentData;
  scoreResult: FinScoreResult;
  hiddenGoalIds?: Set<string>;
}

type AnalyticsTab = 'radar' | 'trajectory' | 'cashflow' | 'stresstest';

export const ScoreAnalytics: React.FC<ScoreAnalyticsProps> = ({
  assessment,
  scoreResult,
  hiddenGoalIds,
}) => {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('radar');
  const { totalScore, pillarScores, metrics, currency } = scoreResult;

  // 1. RADAR SPOKES (0 - 100 scale)
  const radarData = useMemo(() => {
    const efScore = Math.min(100, Math.max(0, Math.round((pillarScores.emergencyFund.score / 25) * 100)));
    const hasActiveDebt = assessment.hasLoans && assessment.loans.length > 0 && pillarScores.debtHealth.totalDebtPrincipal > 0;
    const debtScore = !hasActiveDebt
      ? 100
      : Math.min(29, Math.max(0, Math.round((pillarScores.debtHealth.score / 25) * 100)));
    const savingsScore = Math.min(100, Math.max(0, Math.round((pillarScores.savingsHealth.score / 25) * 100)));
    const insuranceScore = Math.min(100, Math.max(0, Math.round((pillarScores.insuranceProtection.score / 25) * 100)));
    
    // Future Goals spoke: Strict comparison of all active goal target amounts against current savings and contributions gave for those goals
    let goalsScore = 0;
    if (metrics.goalsAnalysis && metrics.goalsAnalysis.length > 0) {
      const activeGoals = metrics.goalsAnalysis.filter(
        (g) => !g.hidden && !hiddenGoalIds?.has(g.goalId)
      );
      if (activeGoals.length > 0) {
        // Compare total current savings directly against total goal targets (10k of 1L = 10 marks, full = 100)
        const totalGoalAmount = activeGoals.reduce((sum, g) => sum + (g.targetAmount || 0), 0);
        const totalSavedAmount = activeGoals.reduce((sum, g) => sum + (g.savedAmount || 0), 0);

        if (totalGoalAmount > 0) {
          goalsScore = Math.min(100, Math.max(0, Math.round((totalSavedAmount / totalGoalAmount) * 100)));
        } else {
          goalsScore = 0;
        }
      } else {
        goalsScore = 0;
      }
    } else {
      goalsScore = 0;
    }

    const spokes = [
      { key: 'emergency', label: 'Emergency Fund', value: efScore, max: 100 },
      { key: 'debt', label: 'Debt Health', value: debtScore, max: 100 },
      { key: 'savings', label: 'Savings Rate', value: savingsScore, max: 100 },
      { key: 'insurance', label: 'Insurance Shield', value: insuranceScore, max: 100 },
      { key: 'goals', label: 'Future Goals', value: goalsScore, max: 100 },
    ];

    // Calculate Symmetry (Financial Balance Index)
    const values = spokes.map(s => s.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const symmetry = Math.max(50, Math.min(98, Math.round(100 - stdDev * 0.85)));

    // Strongest & Weakest
    const sorted = [...spokes].sort((a, b) => b.value - a.value);
    const strongest = sorted[0];
    const weakest = sorted[sorted.length - 1];

    return { spokes, symmetry, strongest, weakest };
  }, [pillarScores, metrics, assessment, hiddenGoalIds]);

  // SVG Radar Geometry (Center at 160, 160; Radius 110)
  const cx = 160;
  const cy = 160;
  const r = 105;
  const totalSpokes = 5;

  const getCoordinates = (index: number, valPercent: number) => {
    // Top spoke at angle -PI/2
    const angle = (Math.PI * 2 / totalSpokes) * index - Math.PI / 2;
    const distance = (valPercent / 100) * r;
    const x = cx + distance * Math.cos(angle);
    const y = cy + distance * Math.sin(angle);
    return { x, y, angle };
  };

  // Build Polygon points for Current User
  const userPolygonPoints = radarData.spokes
    .map((s, idx) => {
      const { x, y } = getCoordinates(idx, s.value);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // Build Polygon points for 85+ Benchmark
  const benchmarkPolygonPoints = radarData.spokes
    .map((_, idx) => {
      const { x, y } = getCoordinates(idx, 85);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  // 2. CASH FLOW ALLOCATION
  const cashFlowData = useMemo(() => {
    const monthlyIncome = Math.max(1, parseNum(assessment.personal.monthlyTakeHome));
    const essential = pillarScores.savingsHealth.monthlyExpenses ? Math.min(monthlyIncome, pillarScores.savingsHealth.monthlyExpenses * 0.65) : monthlyIncome * 0.45;
    const emi = pillarScores.debtHealth.totalMonthlyEmi || 0;
    const discretionary = Math.max(0, (pillarScores.savingsHealth.monthlyExpenses || 0) - essential);
    const sips = assessment.assets.reduce((sum, a) => sum + parseNum(a.monthlyContribution), 0);
    const surplus = Math.max(0, monthlyIncome - essential - discretionary - emi - sips);

    const essentialPct = Math.round((essential / monthlyIncome) * 100);
    const emiPct = Math.round((emi / monthlyIncome) * 100);
    const sipsPct = Math.round((sips / monthlyIncome) * 100);
    const discretionaryPct = Math.round((discretionary / monthlyIncome) * 100);
    const surplusPct = Math.max(0, 100 - essentialPct - emiPct - sipsPct - discretionaryPct);

    return {
      monthlyIncome,
      essential,
      essentialPct,
      emi,
      emiPct,
      sips,
      sipsPct,
      discretionary,
      discretionaryPct,
      surplus,
      surplusPct,
    };
  }, [assessment, pillarScores]);

  // 3. STRESS TEST SIMULATION
  const stressTests = useMemo(() => {
    const liquid = parseNum(assessment.emergencyFund.liquidSavings);
    const monthlyCost = Math.max(1000, pillarScores.savingsHealth.monthlyExpenses || 30000);
    const runwayMonths = liquid / monthlyCost;
    const healthCover = parseNum(assessment.healthInsurance.sumInsured);
    const emi = pillarScores.debtHealth.totalMonthlyEmi || 0;
    const income = Math.max(1000, parseNum(assessment.personal.monthlyTakeHome));

    const tests = [
      {
        id: 'job_loss',
        title: 'Sudden Income Halt (Job Loss)',
        scenario: 'Income drops to 0 for 6 months',
        pass: runwayMonths >= 6,
        score: runwayMonths >= 6 ? 100 : Math.round((runwayMonths / 6) * 100),
        status: runwayMonths >= 6 ? 'Immune' : runwayMonths >= 3 ? 'Moderate Risk' : 'Critical Exposure',
        detail: `Liquid savings cover ${runwayMonths.toFixed(1)} months of living costs. Standard benchmark is 6 months.`,
      },
      {
        id: 'medical_shock',
        title: 'Major Medical Hospitalization',
        scenario: 'Unplanned medical bill of ₹7,50,000 / $10,000',
        pass: assessment.healthInsurance.hasCover && healthCover >= 500000,
        score: assessment.healthInsurance.hasCover && healthCover >= 1000000 ? 100 : assessment.healthInsurance.hasCover ? 75 : 15,
        status: assessment.healthInsurance.hasCover && healthCover >= 500000 ? 'Fully Shielded' : assessment.healthInsurance.hasCover ? 'Partial Gap' : 'Uninsured Exposure',
        detail: assessment.healthInsurance.hasCover 
          ? `Covered with ${formatCurrency(healthCover, currency)} sum insured. Out-of-pocket shock is cushioned.`
          : 'Zero medical cover! Any sudden surgery or hospitalization directly depletes savings or forces debt.',
      },
      {
        id: 'rate_hike',
        title: 'Interest Rate Spike (+2.0%)',
        scenario: 'Floating loan rates rise +200 bps',
        pass: emi === 0 || (emi / income) <= 0.25,
        score: emi === 0 ? 100 : (emi / income) <= 0.20 ? 90 : (emi / income) <= 0.35 ? 65 : 30,
        status: emi === 0 ? 'Zero Debt Risk' : (emi / income) <= 0.25 ? 'Resilient' : 'High Budget Strain',
        detail: emi === 0 
          ? 'No active loan exposure. Your cash flow is completely insulated from central bank rate cycles.'
          : `Current EMI is ${((emi / income) * 100).toFixed(0)}% of income. A 2% rate spike increases EMI by ~10-15%.`,
      },
      {
        id: 'market_drop',
        title: 'Market Correction (-20%)',
        scenario: 'Equity markets drop -20% in bear cycle',
        pass: runwayMonths >= 3 && assessment.assets.length > 0,
        score: runwayMonths >= 6 ? 95 : runwayMonths >= 3 ? 80 : 50,
        status: runwayMonths >= 3 ? 'Protected' : 'Panic Sale Risk',
        detail: runwayMonths >= 3
          ? 'Adequate emergency cushion ensures you never have to panic-sell investments at rock bottom.'
          : 'Without emergency cushion, unexpected expenses during a downturn may force selling shares at a loss.',
      },
    ];

    const passCount = tests.filter(t => t.pass).length;
    return { tests, passCount };
  }, [assessment, pillarScores, currency]);

  return (
    <div className="bg-white rounded-3xl border border-zinc-200/90 p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              Score Analytics & Financial Diagnostics
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            <strong className="text-zinc-800 font-semibold">4 Unique Visualizations</strong> — Explore multi-pillar symmetry, month-over-month trajectory, cash flow allocation, and simulated shock resistance.
          </p>
        </div>

        {/* 4 Tabs */}
        <div className="flex items-center gap-1 bg-zinc-100/90 p-1 rounded-2xl border border-zinc-200/80 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-white text-zinc-900 shadow-xs scale-100'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Radar className="w-3.5 h-3.5 text-emerald-700" />
            <span>Radar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('trajectory')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'trajectory'
                ? 'bg-white text-zinc-900 shadow-xs scale-100'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-blue-700" />
            <span>Trajectory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('cashflow')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'cashflow'
                ? 'bg-white text-zinc-900 shadow-xs scale-100'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-teal-700" />
            <span>Cash Flow</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stresstest')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'stresstest'
                ? 'bg-white text-zinc-900 shadow-xs scale-100'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-700" />
            <span>Stress Test</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RADAR (MULTI-PILLAR SYMMETRY) */}
      {activeTab === 'radar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center animate-in fade-in duration-200">
          
          {/* Radar Chart (SVG) */}
          <div className="lg:col-span-7 flex flex-col items-center">
            {/* Chart Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-emerald-500/20 border-2 border-emerald-500 border-dashed" />
                <span className="font-semibold text-zinc-700">Benchmark Target (85+)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-sm bg-[#1b4d3e] border border-[#143d31]" />
                <span className="font-bold text-[#1b4d3e]">Your Current FinScore</span>
              </div>
            </div>

            {/* SVG Visual */}
            <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center">
              <svg viewBox="0 0 320 320" className="w-full h-full overflow-visible">
                {/* Concentric Grid Rings: 25, 50, 75, 100 */}
                {[25, 50, 75, 100].map((ringLevel) => {
                  const ringRadius = (ringLevel / 100) * r;
                  return (
                    <g key={ringLevel}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={ringRadius}
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="1"
                        strokeDasharray={ringLevel === 100 ? 'none' : '3 3'}
                      />
                      {/* Scale number label */}
                      <text
                        x={cx + 4}
                        y={cy - ringRadius + 9}
                        fontSize="9"
                        fill="#94a3b8"
                        fontWeight="600"
                      >
                        {ringLevel}
                      </text>
                    </g>
                  );
                })}

                {/* 0 label at center */}
                <text x={cx + 4} y={cy - 3} fontSize="9" fill="#94a3b8" fontWeight="600">
                  0
                </text>

                {/* 5 Spoke Axis Lines & Spoke Labels */}
                {radarData.spokes.map((s, idx) => {
                  const { x: endX, y: endY, angle } = getCoordinates(idx, 100);
                  // Label offset
                  const labelDistance = r + 24;
                  const labelX = cx + labelDistance * Math.cos(angle);
                  const labelY = cy + labelDistance * Math.sin(angle);

                  return (
                    <g key={s.key}>
                      {/* Spoke Line */}
                      <line
                        x1={cx}
                        y1={cy}
                        x2={endX}
                        y2={endY}
                        stroke="#e2e8f0"
                        strokeWidth="1.25"
                      />
                      {/* Spoke Label */}
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="11"
                        fontWeight="700"
                        fill="#1e293b"
                        className="select-none"
                      >
                        {s.label}
                      </text>
                      {/* Value badge below label */}
                      <text
                        x={labelX}
                        y={labelY + 12}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="9.5"
                        fontWeight="800"
                        fill="#059669"
                        className="select-none"
                      >
                        {s.value}/100
                      </text>
                    </g>
                  );
                })}

                {/* Benchmark Target Polygon (85+) */}
                <polygon
                  points={benchmarkPolygonPoints}
                  fill="#10b981"
                  fillOpacity="0.08"
                  stroke="#10b981"
                  strokeWidth="1.75"
                  strokeDasharray="4 4"
                />

                {/* User FinScore Polygon */}
                <polygon
                  points={userPolygonPoints}
                  fill="#1b4d3e"
                  fillOpacity="0.25"
                  stroke="#1b4d3e"
                  strokeWidth="2.75"
                  className="transition-all duration-700 ease-out"
                />

                {/* Node dots for user polygon */}
                {radarData.spokes.map((s, idx) => {
                  const { x, y } = getCoordinates(idx, s.value);
                  return (
                    <circle
                      key={s.key}
                      cx={x}
                      cy={y}
                      r="4.5"
                      fill="#1b4d3e"
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="shadow-sm transition-all duration-700 ease-out"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Radar Insights & Diagnostics Side Card */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Financial Balance Index Card */}
            <div className="p-5 rounded-2xl bg-[#eaf5ef]/70 border border-[#b7dfcb] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#1b4d3e] uppercase tracking-wider">
                  Financial Balance Index
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[#1b4d3e] text-white">
                  {radarData.symmetry}% Symmetric
                </span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed">
                Radar shape shows where your financial fortress is strong and where it is vulnerable. High symmetry prevents single-point failure during economic crises.
              </p>
            </div>

            {/* Strongest Pillar */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Strongest Pillar</span>
              </div>
              <div className="text-base font-extrabold text-zinc-900">
                {radarData.strongest.label} ({radarData.strongest.value}/100)
              </div>
              <p className="text-xs text-zinc-500">
                {radarData.strongest.key === 'goals'
                  ? `Outstanding milestone funding at ${radarData.strongest.value}% across your target goals. Your savings and contributions are well-aligned.`
                  : radarData.strongest.key === 'debt' && radarData.strongest.value === 100
                  ? 'Zero active debt: 100/100 score! Outstanding financial fortress with no EMI obligations.'
                  : 'Excellent foundation. Keep maintaining this benchmark without relaxing capital discipline.'}
              </p>
            </div>

            {/* Key Growth Area */}
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Key Growth Area</span>
              </div>
              <div className="text-base font-extrabold text-zinc-900">
                {radarData.weakest.label} ({radarData.weakest.value}/100)
              </div>
              <p className="text-xs text-zinc-500">
                {radarData.weakest.key === 'goals'
                  ? radarData.weakest.value === 0
                    ? 'Your milestone goals currently have zero savings and zero allocated contributions (0/100 marks). Allocate monthly surplus or start an investment plan to start scoring.'
                    : `Your milestone goals are currently funded at ${radarData.weakest.value}% of total goal targets based on current savings and contributions.`
                  : radarData.weakest.key === 'debt'
                  ? `Active debt health score is ${radarData.weakest.value}/100 (< 30 due to ongoing liabilities). Keep monthly EMIs below 30% of income and accelerate payoff.`
                  : 'Addressing this spoke offers the fastest score gain and greatest long-term stability.'}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: TRAJECTORY (12-MONTH FORECAST) */}
      {activeTab === 'trajectory' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-semibold text-zinc-500">Current FinScore</span>
              <div className="text-2xl font-black text-zinc-900 mt-1">{totalScore} / 100</div>
              <span className="text-[11px] text-zinc-400">Baseline today</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#eaf5ef] border border-[#b7dfcb]">
              <span className="text-xs font-semibold text-[#1b4d3e]">Projected 6-Month Score</span>
              <div className="text-2xl font-black text-[#1b4d3e] mt-1">
                {Math.min(96, totalScore + 14)} / 100
              </div>
              <span className="text-[11px] text-emerald-700 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> +14 pts with recommendations
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
              <span className="text-xs font-semibold text-zinc-500">Projected 12-Month Target</span>
              <div className="text-2xl font-black text-emerald-800 mt-1">
                {Math.min(100, totalScore + 22)} / 100
              </div>
              <span className="text-[11px] text-emerald-700">Attain Grade A Elite</span>
            </div>
          </div>

          {/* SVG Continuous Trajectory Curve Graph */}
          <div className="p-6 rounded-2xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500 pb-2 border-b border-zinc-100">
              <div>
                <span className="font-bold text-zinc-900 text-sm">12-Month Projected Health Progression Graph</span>
                <p className="text-[11px] text-zinc-500">Continuous scoring curve based on implementing tailored recommendations</p>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium text-zinc-700">
                  <span className="w-3 h-1 bg-[#1b4d3e] rounded-full" />
                  <span>Optimized Plan (+22 pts)</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-zinc-500">
                  <span className="w-3 h-0.5 bg-zinc-400 border-t border-dashed border-zinc-500" />
                  <span>Status Quo Path</span>
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <span className="w-3 h-0.5 border-t border-dashed border-emerald-500" />
                  <span>Target 80 (Grade A)</span>
                </span>
              </div>
            </div>

            {/* Continuous SVG Line & Area Chart */}
            <div className="w-full overflow-x-auto">
              <svg viewBox="0 0 600 230" className="w-full min-w-[540px] h-60 overflow-visible select-none">
                <defs>
                  {/* Area fill gradient under optimized curve */}
                  <linearGradient id="trajectoryAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1b4d3e" stopOpacity="0.28" />
                    <stop offset="60%" stopColor="#059669" stopOpacity="0.10" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y-Axis Gridlines & Labels: 0, 25, 50, 75, 80, 100 */}
                {[
                  { val: 100, y: 25 },
                  { val: 80, y: 57, isTarget: true },
                  { val: 75, y: 65 },
                  { val: 50, y: 105 },
                  { val: 25, y: 145 },
                  { val: 0, y: 185 },
                ].map((g) => (
                  <g key={g.val}>
                    <line
                      x1="45"
                      y1={g.y}
                      x2="585"
                      y2={g.y}
                      stroke={g.isTarget ? '#10b981' : '#f1f5f9'}
                      strokeWidth={g.isTarget ? '1.5' : '1'}
                      strokeDasharray={g.isTarget ? '4 3' : 'none'}
                    />
                    <text
                      x="38"
                      y={g.y + 3}
                      textAnchor="end"
                      fontSize="10"
                      fontWeight={g.isTarget ? '800' : '600'}
                      fill={g.isTarget ? '#059669' : '#94a3b8'}
                    >
                      {g.val}
                    </text>
                  </g>
                ))}

                {/* Target 80 Grade A Text Label */}
                <text
                  x="585"
                  y="53"
                  textAnchor="end"
                  fontSize="9.5"
                  fontWeight="700"
                  fill="#059669"
                >
                  Grade A Target (80 pts)
                </text>

                {/* Status Quo Baseline Line (Flat / Minor decay) */}
                <path
                  d={`M 55,${185 - (totalScore / 100) * 160} Q 320,${185 - (totalScore / 100) * 160 + 2} 575,${185 - (totalScore / 100) * 160 + 4}`}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="5 4"
                />

                {/* Optimized Plan Area Fill */}
                {(() => {
                  const s0 = totalScore;
                  const s1 = Math.min(100, totalScore + 6);
                  const s2 = Math.min(100, totalScore + 11);
                  const s3 = Math.min(100, totalScore + 15);
                  const s4 = Math.min(100, totalScore + 18);
                  const s5 = Math.min(100, totalScore + 21);
                  const s6 = Math.min(100, totalScore + 23);

                  const y0 = 185 - (s0 / 100) * 160;
                  const y1 = 185 - (s1 / 100) * 160;
                  const y2 = 185 - (s2 / 100) * 160;
                  const y3 = 185 - (s3 / 100) * 160;
                  const y4 = 185 - (s4 / 100) * 160;
                  const y5 = 185 - (s5 / 100) * 160;
                  const y6 = 185 - (s6 / 100) * 160;

                  const curvePath = `M 55,${y0} C 100,${y0} 100,${y1} 142,${y1} C 185,${y1} 185,${y2} 228,${y2} C 271,${y2} 271,${y3} 315,${y3} C 358,${y3} 358,${y4} 401,${y4} C 445,${y4} 445,${y5} 488,${y5} C 532,${y5} 532,${y6} 575,${y6}`;
                  const areaPath = `${curvePath} L 575,185 L 55,185 Z`;

                  return (
                    <g>
                      {/* Area Fill */}
                      <path d={areaPath} fill="url(#trajectoryAreaGrad)" />

                      {/* Main Smooth Line */}
                      <path
                        d={curvePath}
                        fill="none"
                        stroke="#1b4d3e"
                        strokeWidth="3.25"
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />

                      {/* Data Point Circles and Score Pills */}
                      {[
                        { x: 55, y: y0, label: 'Today', score: s0 },
                        { x: 142, y: y1, label: 'M+2', score: s1 },
                        { x: 228, y: y2, label: 'M+4', score: s2 },
                        { x: 315, y: y3, label: 'M+6', score: s3, highlight: true },
                        { x: 401, y: y4, label: 'M+8', score: s4 },
                        { x: 488, y: y5, label: 'M+10', score: s5 },
                        { x: 575, y: y6, label: 'M+12', score: s6, highlight: true },
                      ].map((pt) => (
                        <g key={pt.label}>
                          {/* Outer halo for key points */}
                          {pt.highlight && (
                            <circle cx={pt.x} cy={pt.y} r="8" fill="#1b4d3e" fillOpacity="0.15" />
                          )}
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r={pt.highlight ? '5' : '4'}
                            fill="#1b4d3e"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />
                          {/* Score badge above node */}
                          <rect
                            x={pt.x - 14}
                            y={pt.y - 21}
                            width="28"
                            height="15"
                            rx="4"
                            fill={pt.highlight ? '#1b4d3e' : '#ffffff'}
                            stroke={pt.highlight ? '#1b4d3e' : '#cbd5e1'}
                            strokeWidth="1"
                          />
                          <text
                            x={pt.x}
                            y={pt.y - 10}
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="800"
                            fill={pt.highlight ? '#ffffff' : '#1e293b'}
                          >
                            {pt.score}
                          </text>

                          {/* X-axis Month Label */}
                          <text
                            x={pt.x}
                            y="205"
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="700"
                            fill="#475569"
                          >
                            {pt.label}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()}
              </svg>
            </div>

            {/* Trajectory Milestones Roadmap */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Phase 1 · Months 1 - 3
                </span>
                <div className="text-xs font-bold text-zinc-900">High-Interest Debt Payoff</div>
                <p className="text-[11px] text-zinc-600 leading-normal">
                  Eliminate credit card/BNPL balances to free up immediate monthly cash flow (+6 pts).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Phase 2 · Months 4 - 6
                </span>
                <div className="text-xs font-bold text-zinc-900">6-Month Buffer Completion</div>
                <p className="text-[11px] text-zinc-600 leading-normal">
                  Channel surplus into liquid high-yield deposits to build full shock immunity (+9 pts).
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Phase 3 · Months 7 - 12
                </span>
                <div className="text-xs font-bold text-zinc-900">Automated Wealth Compounding</div>
                <p className="text-[11px] text-zinc-600 leading-normal">
                  Lock in pure term protection and automate diversified mutual fund SIPs (+8 pts).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CASH FLOW ALLOCATION */}
      {activeTab === 'cashflow' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 mb-2">
              <span>Monthly Inflow Allocation</span>
              <span>Total: {formatCurrency(cashFlowData.monthlyIncome, currency)}/mo</span>
            </div>

            {/* Stacked Progress Bar */}
            <div className="w-full h-7 rounded-xl bg-zinc-100 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${cashFlowData.essentialPct}%` }}
                className="bg-emerald-700 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-white"
                title={`Essential Costs: ${cashFlowData.essentialPct}%`}
              >
                {cashFlowData.essentialPct > 10 ? `${cashFlowData.essentialPct}%` : ''}
              </div>

              {cashFlowData.emiPct > 0 && (
                <div
                  style={{ width: `${cashFlowData.emiPct}%` }}
                  className="bg-rose-600 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-white"
                  title={`Debt EMIs: ${cashFlowData.emiPct}%`}
                >
                  {cashFlowData.emiPct > 8 ? `${cashFlowData.emiPct}%` : ''}
                </div>
              )}

              {cashFlowData.sipsPct > 0 && (
                <div
                  style={{ width: `${cashFlowData.sipsPct}%` }}
                  className="bg-blue-600 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-white"
                  title={`Investments & SIPs: ${cashFlowData.sipsPct}%`}
                >
                  {cashFlowData.sipsPct > 8 ? `${cashFlowData.sipsPct}%` : ''}
                </div>
              )}

              <div
                style={{ width: `${cashFlowData.discretionaryPct}%` }}
                className="bg-amber-500 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-white"
                title={`Discretionary & Lifestyle: ${cashFlowData.discretionaryPct}%`}
              >
                {cashFlowData.discretionaryPct > 8 ? `${cashFlowData.discretionaryPct}%` : ''}
              </div>

              {cashFlowData.surplusPct > 0 && (
                <div
                  style={{ width: `${cashFlowData.surplusPct}%` }}
                  className="bg-teal-400 hover:opacity-90 transition-all flex items-center justify-center text-[10px] font-bold text-teal-950"
                  title={`Liquid Surplus: ${cashFlowData.surplusPct}%`}
                >
                  {cashFlowData.surplusPct > 8 ? `${cashFlowData.surplusPct}%` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Allocation Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-700" />
                <span>Essential Living</span>
              </div>
              <div className="text-base font-extrabold text-zinc-900 mt-1">
                {formatCurrency(cashFlowData.essential, currency)}
              </div>
              <div className="text-[10px] text-zinc-400">{cashFlowData.essentialPct}% of income</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span>Debt EMIs</span>
              </div>
              <div className="text-base font-extrabold text-zinc-900 mt-1">
                {formatCurrency(cashFlowData.emi, currency)}
              </div>
              <div className="text-[10px] text-zinc-400">{cashFlowData.emiPct}% (Safe &le; 20%)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span>Investments & SIPs</span>
              </div>
              <div className="text-base font-extrabold text-zinc-900 mt-1">
                {formatCurrency(cashFlowData.sips, currency)}
              </div>
              <div className="text-[10px] text-zinc-400">{cashFlowData.sipsPct}% allocation</div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <span>Unallocated Cushion</span>
              </div>
              <div className="text-base font-extrabold text-teal-800 mt-1">
                {formatCurrency(cashFlowData.surplus, currency)}
              </div>
              <div className="text-[10px] text-zinc-400">{cashFlowData.surplusPct}% surplus</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STRESS TEST (SHOCK RESISTANCE) */}
      {activeTab === 'stresstest' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div>
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Overall Shock Resistance
              </span>
              <div className="text-xl font-black text-zinc-900 mt-0.5">
                Passes {stressTests.passCount} of 4 Simulated Crises
              </div>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[#eaf5ef] text-[#1b4d3e] font-black text-sm border border-[#b7dfcb]">
              Resilience Score: {Math.round((stressTests.passCount / 4) * 100)}%
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stressTests.tests.map((test) => (
              <div
                key={test.id}
                className="p-5 rounded-2xl bg-white border border-zinc-200 hover:border-zinc-300 transition-all space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-zinc-900">{test.title}</h4>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${
                      test.pass
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {test.status}
                  </span>
                </div>
                <div className="text-[11px] font-semibold text-zinc-400">
                  Scenario: {test.scenario}
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed pt-1">
                  {test.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
