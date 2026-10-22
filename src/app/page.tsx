'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AssessmentData, CurrencyCode } from '@/types/assessment';
import { DEFAULT_ASSESSMENT, SAMPLE_PROFILES } from '@/utils/sampleData';
import { calculateFinScore } from '@/utils/calculations';
import { HomePage } from '@/components/home/HomePage';
import { StepProgressBar } from '@/components/StepProgressBar';
import { Step1Personal } from '@/components/steps/Step1Personal';
import { Step2Expenses } from '@/components/steps/Step2Expenses';
import { Step3Debt } from '@/components/steps/Step3Debt';
import { Step4Insurance } from '@/components/steps/Step4Insurance';
import { Step5Emergency } from '@/components/steps/Step5Emergency';
import { Step6Assets } from '@/components/steps/Step6Assets';
import { Step7Goals } from '@/components/steps/Step7Goals';
import { Step8Review } from '@/components/steps/Step8Review';
import { ScoreDashboard } from '@/components/dashboard/ScoreDashboard';
import { CalculatorsPage, CalculatorId } from '@/components/calculators/CalculatorsPage';
import { Header } from '@/components/Header';
import { ArrowLeft, ArrowRight, RotateCcw, Home, AlertCircle } from 'lucide-react';

export type ActivePage = 'home' | 'assessment' | 'dashboard' | 'calculators';
export type AppTheme = 'normal' | 'light-green' | 'light-blue';

export const PAGE_ROUTES: Record<ActivePage, string> = {
  home: '/home',
  calculators: '/calculator',
  assessment: '/Assessment',
  dashboard: '/scoreDashboard',
};

export const ROUTE_PAGES: Record<string, ActivePage> = {
  '/': 'home',
  '/home': 'home',
  '/calculator': 'calculators',
  '/calculators': 'calculators',
  '/Assessment': 'assessment',
  '/assessment': 'assessment',
  '/scoreDashboard': 'dashboard',
  '/dashboard': 'dashboard',
};

const STORAGE_KEY = 'finscore_assessment_draft_v2';
const THEME_STORAGE_KEY = 'finscore_active_theme';

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [activeCalculatorId, setActiveCalculatorId] = useState<CalculatorId>('sip');
  const [theme, setTheme] = useState<AppTheme>('normal');
  const [assessment, setAssessment] = useState<AssessmentData>(DEFAULT_ASSESSMENT);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [lastSavedAt, setLastSavedAt] = useState<string>('');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [hasDraft, setHasDraft] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Synchronize React page state with browser URL path
  const navigateTo = useCallback((page: ActivePage, options?: { calcId?: CalculatorId }) => {
    if (options?.calcId) {
      setActiveCalculatorId(options.calcId);
    }
    setActivePage(page);
    const targetPath = PAGE_ROUTES[page] || '/home';
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ page }, '', targetPath);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Sync initial page with URL on first load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
      const matchedPage = ROUTE_PAGES[currentPath] || ROUTE_PAGES[currentPath.toLowerCase()];
      if (matchedPage) {
        setActivePage(matchedPage);
        const canonical = PAGE_ROUTES[matchedPage];
        if (window.location.pathname !== canonical) {
          window.history.replaceState({ page: matchedPage }, '', canonical);
        }
      } else {
        // Fallback to /home
        window.history.replaceState({ page: 'home' }, '', '/home');
      }
      document.title = 'FInSCOURE -Fix Your Finances With Me !';
    }
  }, []);

  // Listen to browser Back and Forward button events
  useEffect(() => {
    const handlePopState = () => {
      const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
      const matchedPage = ROUTE_PAGES[currentPath] || ROUTE_PAGES[currentPath.toLowerCase()];
      if (matchedPage) {
        setActivePage(matchedPage);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Restore draft and theme from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme;
      if (savedTheme && ['normal', 'light-green', 'light-blue'].includes(savedTheme)) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.body.setAttribute('data-theme', savedTheme);
      }

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const hasActualData = Boolean(
          parsed.personal?.firstName?.trim() ||
          (typeof parsed.personal?.monthlyTakeHome === 'number' && parsed.personal.monthlyTakeHome > 0) ||
          (parsed.loans && parsed.loans.length > 0) ||
          (parsed.assets && parsed.assets.length > 0)
        );

        if (hasActualData) {
          setAssessment(parsed);
          if (parsed.step && parsed.step >= 1 && parsed.step <= 8) {
            setCurrentStep(parsed.step);
          }
          setLastSavedAt('just now');
          setHasDraft(true);
        } else {
          setAssessment(DEFAULT_ASSESSMENT);
          setCurrentStep(1);
          setHasDraft(false);
        }
      } else {
        setAssessment(DEFAULT_ASSESSMENT);
        setCurrentStep(1);
        setHasDraft(false);
      }
    } catch (e) {
      console.warn('Could not read saved draft or theme', e);
      setAssessment(DEFAULT_ASSESSMENT);
    }
    setIsInitialized(true);
  }, []);

  const handleCycleTheme = useCallback(() => {
    setTheme((prevTheme) => {
      const nextTheme: AppTheme =
        prevTheme === 'normal'
          ? 'light-green'
          : prevTheme === 'light-green'
            ? 'light-blue'
            : 'normal';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        document.documentElement.setAttribute('data-theme', nextTheme);
        document.body.setAttribute('data-theme', nextTheme);
      } catch (err) {
        console.warn('Could not save theme', err);
      }
      return nextTheme;
    });
  }, []);

  // Keyboard shortcut listener: '+' key cycles theme silently across website
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();
      // Don't trigger if user is typing in form inputs or textareas
      if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
        return;
      }

      if (e.key === '+' || e.code === 'NumpadAdd' || (e.key === '=' && e.shiftKey)) {
        e.preventDefault();
        handleCycleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleCycleTheme]);

  // Auto-save changes to localStorage
  useEffect(() => {
    if (!isInitialized) return;

    try {
      const payload = {
        ...assessment,
        step: currentStep,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedAt(timeStr);
      setHasDraft(true);
    } catch (e) {
      console.warn('Could not save draft to localStorage', e);
    }
  }, [assessment, currentStep, isInitialized]);

  // Handle Currency change across assessment
  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setAssessment((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        currency: newCurrency,
      },
    }));
  };

  // Load Preset Profile
  const handleLoadSample = (profileKey: string) => {
    const sample = SAMPLE_PROFILES[profileKey];
    if (sample) {
      setAssessment(sample.data);
      setCurrentStep(8);
      navigateTo('dashboard');
    }
  };

  // Reset to empty
  const handleReset = () => {
    if (confirm('Are you sure you want to start a new assessment? Current inputs will be cleared.')) {
      localStorage.removeItem(STORAGE_KEY);
      setAssessment(DEFAULT_ASSESSMENT);
      setCurrentStep(1);
      navigateTo('home');
      setLastSavedAt('');
      setHasDraft(false);
      setValidationError(null);
    }
  };

  // Step Validation logic
  const validateStep = (stepNumber: number): boolean => {
    if (stepNumber === 1) {
      const isAgeValid = typeof assessment.personal.age === 'number' && assessment.personal.age >= 18 && assessment.personal.age <= 100;
      const isDependentsValid = assessment.personal.dependents !== undefined && assessment.personal.dependents !== null;
      const isSalaryValid = typeof assessment.personal.monthlyTakeHome === 'number' && assessment.personal.monthlyTakeHome > 0;

      if (!isAgeValid || !isDependentsValid || !isSalaryValid) {
        const missing: string[] = [];
        if (!isAgeValid) missing.push('Age (18-100)');
        if (!isDependentsValid) missing.push('Dependents');
        if (!isSalaryValid) missing.push('Salary');
        setValidationError(`Please fill all mandatory fields marked with *: ${missing.join(', ')}.`);
        return false;
      }
    }

    if (stepNumber === 2) {
      const filledExpensesCount = Object.values(assessment.expenses || {}).filter(
        (item) => typeof item?.amount === 'number' && item.amount > 0 && item.frequency !== 'N'
      ).length + (assessment.customExpenses || []).filter(
        (item) => typeof item?.amount === 'number' && item.amount > 0 && item.frequency !== 'N'
      ).length;

      if (filledExpensesCount < 2) {
        setValidationError(`Please fill at least any 2 expenses marked with * to proceed (currently ${filledExpensesCount} of 2 filled).`);
        return false;
      }
    }

    setValidationError(null);
    return true;
  };

  // Next & Back
  const handleNext = () => {
    if (!validateStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setValidationError(null);
    if (currentStep < 8) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Step 8 -> Calculate & Show Dashboard
      navigateTo('dashboard');
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepJump = (step: number) => {
    // If trying to jump ahead past current step, ensure current step is valid
    if (step > currentStep && !validateStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setValidationError(null);
    setCurrentStep(step);
    navigateTo('assessment');
  };

  // Score computation (memoized)
  const scoreResult = useMemo(() => {
    return calculateFinScore(assessment);
  }, [assessment]);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] w-full transition-colors duration-300" data-theme={theme}>
      {/* FIXED TOP HEADER WITH LOGO ON TOP-LEFT (STAYS VISIBLE ON SCROLL) */}
      <Header
        activePage={activePage}
        onNavigate={(page) => navigateTo(page)}
        currency={assessment.personal.currency}
        onCurrencyChange={(curr) => {
          setAssessment((prev) => ({
            ...prev,
            personal: { ...prev.personal, currency: curr },
          }));
        }}
        onLoadSample={(sampleKey) => handleLoadSample(sampleKey)}
        onReset={handleReset}
        lastSavedAt={lastSavedAt}
        hasCalculatedScore={hasDraft}
      />

      {/* MAIN CANVAS */}
      <main className="flex-1 w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-5">

        {/* PAGE 1: HOME PAGE */}
        {activePage === 'home' && (
          <div className="w-full">
            <HomePage
              onStartAssessment={() => {
                setAssessment(DEFAULT_ASSESSMENT);
                setCurrentStep(1);
                setValidationError(null);
                navigateTo('assessment');
              }}
              onViewSample={(sampleKey) => handleLoadSample(sampleKey)}
              onSelectCalculator={(calcId) => navigateTo('calculators', { calcId })}
              hasDraft={hasDraft}
              onResumeDraft={() => navigateTo('assessment')}
            />
          </div>
        )}

        {/* PAGE 2: ASSESSMENT FORMS */}
        {activePage === 'assessment' && (
          <div className="w-full space-y-6">
            {/* Step Progress Bar (Full Width, No Header Above) */}
            <StepProgressBar
              currentStep={currentStep}
              onStepClick={handleStepJump}
            />

            {/* Validation Error Banner */}
            {validationError && (
              <div className="flex items-center justify-between gap-3 p-3.5 bg-rose-50 border border-rose-300 rounded-xl text-rose-900 text-xs sm:text-sm font-semibold shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>{validationError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setValidationError(null)}
                  className="text-rose-600 hover:text-rose-900 font-bold px-2.5 py-1 text-xs rounded-lg hover:bg-rose-100 transition-colors shrink-0 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Current Step Form View */}
            <div className="pt-2 w-full">
              {currentStep === 1 && (
                <Step1Personal
                  data={assessment}
                  onChange={(val) => {
                    setAssessment(val);
                    if (validationError) setValidationError(null);
                  }}
                  showErrors={Boolean(validationError)}
                />
              )}
              {currentStep === 2 && (
                <Step2Expenses
                  data={assessment}
                  onChange={(val) => {
                    setAssessment(val);
                    if (validationError) setValidationError(null);
                  }}
                  showErrors={Boolean(validationError)}
                />
              )}
              {currentStep === 3 && (
                <Step3Debt data={assessment} onChange={setAssessment} />
              )}
              {currentStep === 4 && (
                <Step4Insurance data={assessment} onChange={setAssessment} />
              )}
              {currentStep === 5 && (
                <Step5Emergency data={assessment} onChange={setAssessment} />
              )}
              {currentStep === 6 && (
                <Step6Assets data={assessment} onChange={setAssessment} />
              )}
              {currentStep === 7 && (
                <Step7Goals data={assessment} onChange={setAssessment} />
              )}
              {currentStep === 8 && (
                <Step8Review
                  data={assessment}
                  onNavigateToStep={handleStepJump}
                  onConfirmAndCalculate={() => {
                    navigateTo('dashboard');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              )}
            </div>

            {/* Bottom Navigation: Back and Continue Buttons Only */}
            <div className="flex items-center justify-between pt-6 border-t border-zinc-200/80">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold border transition-all cursor-pointer ${currentStep === 1
                    ? 'opacity-40 border-zinc-200 text-zinc-400 cursor-not-allowed'
                    : 'border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 hover:border-zinc-300 shadow-2xs'
                  }`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-bold bg-[#1b4d3e] hover:bg-[#143d31] text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <span>{currentStep === 8 ? 'Calculate FinScore' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* PAGE 3: SCORE DASHBOARD (No top header bar) */}
        {activePage === 'dashboard' && (
          <div className="w-full space-y-4">
            <ScoreDashboard
              assessment={assessment}
              scoreResult={scoreResult}
              onRetake={() => {
                navigateTo('assessment');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onReset={handleReset}
              onHome={() => {
                navigateTo('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onUpdateAssessment={(updated) => {
                setAssessment(updated);
              }}
            />
          </div>
        )}

        {/* PAGE 4: INTERACTIVE CALCULATORS SUITE */}
        {activePage === 'calculators' && (
          <div className="w-full">
            <CalculatorsPage
              initialCalculator={activeCalculatorId}
              onBackToHome={() => {
                navigateTo('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onStartAssessment={() => {
                navigateTo('assessment');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 mt-12 text-center text-xs text-zinc-500 w-full print:hidden">
        <div className="w-full px-4 sm:px-8 lg:px-14 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Footer Left: Official Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="FinScore — Fix Your Finance With Me!"
              className="h-8 sm:h-9 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => { navigateTo('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              title="Back to Top"
            />
            <p className="text-zinc-600 text-xs text-left hidden sm:block">
              © {new Date().getFullYear()} FinScore — Fix your finances with me!
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600 font-medium">
            <span>Crafted with care by</span>
            <span className="font-extrabold text-zinc-950 bg-zinc-100 px-2.5 py-0.5 rounded-lg border border-zinc-200 tracking-tight shadow-2xs">
              niceTRY
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-600">
            <button type="button" onClick={() => { navigateTo('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-black cursor-pointer">Home</button>
            <button type="button" onClick={() => { navigateTo('calculators', { calcId: 'sip' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-black cursor-pointer">Calculators</button>
            <button type="button" onClick={() => { navigateTo('assessment'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-black cursor-pointer">Assessment</button>
            <button type="button" onClick={() => { navigateTo('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="hover:text-black cursor-pointer">Score Dashboard</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
