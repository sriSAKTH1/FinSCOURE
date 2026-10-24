'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Delete, 
  RotateCcw, 
  Copy, 
  Check, 
  History, 
  Trash2, 
  Calculator, 
  ArrowRightCircle, 
  Sparkles,
  Percent,
  Plus,
  ClipboardPaste
} from 'lucide-react';
import { formatIndianUnits } from './CalculatorsPage';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

export const StandardCalculator: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
  const [expression, setExpression] = useState<string>('');
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [pasted, setPasted] = useState<boolean>(false);
  const [pasteInput, setPasteInput] = useState<string>('');
  const [pasteStatus, setPasteStatus] = useState<string | null>(null);

  const applyPastedText = useCallback((rawText: string) => {
    if (!rawText) return;
    // Clean currency symbols (₹, $, €, £), commas, spaces
    const clean = rawText.replace(/[₹$€£,\s]/g, '').trim();
    const val = parseFloat(clean);
    if (!isNaN(val) && Number.isFinite(val)) {
      setDisplay(clean.includes('.') ? val.toString() : Math.round(val).toString());
      setWaitingForOperand(false);
      setPasted(true);
      setPasteStatus('Pasted!');
      setTimeout(() => {
        setPasted(false);
        setPasteStatus(null);
      }, 1500);
    } else {
      setPasteStatus('Invalid');
      setTimeout(() => setPasteStatus(null), 1500);
    }
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          applyPastedText(text);
          return;
        }
      }
      const promptVal = window.prompt('Paste or enter any numeric amount or number:');
      if (promptVal) applyPastedText(promptVal);
    } catch {
      const promptVal = window.prompt('Paste or enter any numeric amount or number:');
      if (promptVal) applyPastedText(promptVal);
    }
  }, [applyPastedText]);

  const formatNumberWithCommas = (numStr: string): string => {
    if (numStr === 'Error' || numStr === 'Infinity' || numStr === '-Infinity') return numStr;
    const parts = numStr.split('.');
    let integerPart = parts[0];
    const isNegative = integerPart.startsWith('-');
    if (isNegative) integerPart = integerPart.substring(1);

    // Format integer part using Indian comma system
    let lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    if (otherNumbers !== '') {
      lastThree = ',' + lastThree;
    }
    const formattedInteger = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;

    return (isNegative ? '-' : '') + (formattedInteger || '0') + (parts.length > 1 ? '.' + parts[1] : '');
  };

  const handleDigit = useCallback((digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      if (display === '0' && digit !== '.') {
        setDisplay(digit);
      } else {
        if (display.length < 16) {
          setDisplay(prev => prev + digit);
        }
      }
    }
  }, [display, waitingForOperand]);

  const handleDecimal = useCallback(() => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  }, [display, waitingForOperand]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(false);
    setExpression('');
  }, []);

  const handleBackspace = useCallback(() => {
    if (waitingForOperand) return;
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(prev => prev.slice(0, -1));
    }
  }, [display, waitingForOperand]);

  const handleToggleSign = useCallback(() => {
    const val = parseFloat(display);
    if (!isNaN(val) && val !== 0) {
      setDisplay((-val).toString());
    }
  }, [display]);

  const handlePercent = useCallback(() => {
    const current = parseFloat(display);
    if (isNaN(current)) return;

    if (prevValue !== null && operation) {
      if (operation === '+' || operation === '−' || operation === '-') {
        // e.g. 200 + 10% = 200 + 20
        const percentVal = (prevValue * current) / 100;
        setDisplay(percentVal.toString());
        setExpression(`${prevValue} ${operation} ${current}%`);
      } else if (operation === '×' || operation === '*') {
        // e.g. 200 × 10% = 20
        const result = (prevValue * current) / 100;
        const cleanResult = Math.round(result * 100000000) / 100000000;
        setDisplay(cleanResult.toString());
        setExpression(`${prevValue} × ${current}% =`);
        setPrevValue(null);
        setOperation(null);
        setWaitingForOperand(true);
      } else if (operation === '÷' || operation === '/') {
        // e.g. 200 ÷ 10% = 2000
        const result = current !== 0 ? prevValue / (current / 100) : 0;
        const cleanResult = Math.round(result * 100000000) / 100000000;
        setDisplay(cleanResult.toString());
        setExpression(`${prevValue} ÷ ${current}% =`);
        setPrevValue(null);
        setOperation(null);
        setWaitingForOperand(true);
      }
    } else {
      const result = current / 100;
      setDisplay(result.toString());
      setExpression(`${current}% =`);
    }
  }, [display, prevValue, operation]);

  const executeOperation = (prev: number, curr: number, op: string): number => {
    switch (op) {
      case '+': return prev + curr;
      case '−':
      case '-': return prev - curr;
      case '×':
      case '*': return prev * curr;
      case '÷':
      case '/': return curr !== 0 ? prev / curr : 0;
      default: return curr;
    }
  };

  const handleOperator = useCallback((nextOp: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
      setExpression(`${inputValue} ${nextOp}`);
    } else if (operation) {
      if (!waitingForOperand) {
        const result = executeOperation(prevValue, inputValue, operation);
        setPrevValue(result);
        setDisplay(result.toString());
        setExpression(`${result} ${nextOp}`);
      } else {
        setExpression(`${prevValue} ${nextOp}`);
      }
    }

    setWaitingForOperand(true);
    setOperation(nextOp);
  }, [display, prevValue, operation, waitingForOperand]);

  const handleEquals = useCallback(() => {
    if (prevValue === null || operation === null) return;

    const currentVal = parseFloat(display);
    const result = executeOperation(prevValue, currentVal, operation);
    
    // Round to avoid floating point precision artifacts
    const cleanResult = Math.round(result * 100000000) / 100000000;
    const finalExpression = `${prevValue} ${operation} ${currentVal} =`;

    setDisplay(cleanResult.toString());
    setExpression(finalExpression);

    // Save to calculation history tape
    const newHistoryItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      expression: finalExpression,
      result: cleanResult.toString(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setHistory(prev => [newHistoryItem, ...prev].slice(0, 20));

    setPrevValue(null);
    setOperation(null);
    setWaitingForOperand(true);
  }, [prevValue, operation, display]);

  // Memory functions
  const handleMemoryClear = () => setMemory(0);
  const handleMemoryRecall = () => {
    setDisplay(memory.toString());
    setWaitingForOperand(false);
  };
  const handleMemoryAdd = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) setMemory(prev => prev + val);
  };
  const handleMemorySubtract = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) setMemory(prev => prev - val);
  };

  // Quick GST Tax Helpers
  const handleApplyGst = (rate: number, isReverse: boolean = false) => {
    const current = parseFloat(display);
    if (isNaN(current) || current === 0) return;

    if (!isReverse) {
      const gstAmount = (current * rate) / 100;
      const total = current + gstAmount;
      const cleanTotal = Math.round(total * 100) / 100;
      setExpression(`${formatNumberWithCommas(current.toString())} + ${rate}% GST =`);
      setDisplay(cleanTotal.toString());
      setWaitingForOperand(true);
      setHistory(prev => [{
        id: Math.random().toString(36).substring(2, 9),
        expression: `${formatNumberWithCommas(current.toString())} + ${rate}% GST`,
        result: cleanTotal.toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }, ...prev].slice(0, 20));
    } else {
      // Reverse GST calculation: original = total / (1 + rate/100)
      const base = current / (1 + rate / 100);
      const cleanBase = Math.round(base * 100) / 100;
      setExpression(`${formatNumberWithCommas(current.toString())} - ${rate}% GST Reverse =`);
      setDisplay(cleanBase.toString());
      setWaitingForOperand(true);
      setHistory(prev => [{
        id: Math.random().toString(36).substring(2, 9),
        expression: `${formatNumberWithCommas(current.toString())} (Excl. ${rate}% GST)`,
        result: cleanBase.toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }, ...prev].slice(0, 20));
    }
  };

  // Quick Indian Denomination Adder
  const handleAddDenomination = (amt: number) => {
    const current = parseFloat(display) || 0;
    const newVal = current + amt;
    setDisplay(newVal.toString());
    setWaitingForOperand(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Full physical keyboard & clipboard paste support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an active text input or textarea elsewhere
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      // Handle Ctrl+V / Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        handlePaste();
        return;
      }

      // Handle Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        copyToClipboard();
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === '+' || e.key === '-') {
        e.preventDefault();
        handleOperator(e.key === '-' ? '−' : '+');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      } else if (e.key === '%') {
        e.preventDefault();
        handlePercent();
      }
    };

    const handleWindowPaste = (e: ClipboardEvent) => {
      // If typing in an input field, let native paste handle it
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      const text = e.clipboardData?.getData('text');
      if (text) {
        e.preventDefault();
        applyPastedText(text);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handleWindowPaste);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handleWindowPaste);
    };
  }, [handleDigit, handleDecimal, handleOperator, handleEquals, handleBackspace, handleClear, handlePercent, handlePaste, applyPastedText]);

  const numVal = parseFloat(display);
  const indianWords = !isNaN(numVal) && numVal !== 0 ? formatIndianUnits(Math.abs(numVal)) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      
      {/* ========================================================
          LEFT: STANDARD CALCULATOR KEYPAD & DISPLAY (COL 7)
         ======================================================== */}
      <div className="lg:col-span-7 bg-white rounded-3xl border border-zinc-200 shadow-md p-6 sm:p-7 space-y-5">
        
        {/* Header & Badges */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#1b4d3e] flex items-center justify-center shadow-2xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">
                Normal Standard Calculator
              </h3>
              <p className="text-[11px] text-zinc-500">Everyday math, paste amount, memory registers & GST tax calculator</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {memory !== 0 && (
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                M = {formatNumberWithCommas(memory.toString())}
              </span>
            )}
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Interactive
            </span>
          </div>
        </div>

        {/* Crisp Digital Display Screen */}
        <div className="relative rounded-2xl bg-gradient-to-b from-zinc-950 to-zinc-900 p-5 text-white shadow-inner border border-zinc-800 space-y-1">
          {/* Expression line with Paste & Copy controls */}
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400 min-h-[1.25rem]">
            <span>{expression || 'Ready'}</span>
            
            <div className="flex items-center gap-2">
              {/* Paste Button */}
              <button
                type="button"
                onClick={handlePaste}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 rounded-md hover:bg-zinc-800"
                title="Paste amount from clipboard (Ctrl+V)"
              >
                {pasted ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Pasted!</span>
                  </>
                ) : (
                  <>
                    <ClipboardPaste className="w-3.5 h-3.5" />
                    <span>Paste</span>
                  </>
                )}
              </button>

              {/* Copy Button */}
              <button
                type="button"
                onClick={copyToClipboard}
                className="text-[11px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors px-2 py-0.5 rounded-md hover:bg-zinc-800"
                title="Copy result (Ctrl+C)"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Primary Result Line */}
          <div className="text-right">
            <span className="font-mono text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white select-all break-all">
              {formatNumberWithCommas(display)}
            </span>
          </div>

          {/* Indian Number Formatter Subtitle */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[11px] text-zinc-400 font-medium">
            <span>Indian denomination:</span>
            <span className="text-emerald-400 font-bold font-mono">
              {indianWords ? `₹ ${indianWords}` : '₹ 0.00'}
            </span>
          </div>
        </div>

        {/* Quick Paste / Direct Amount Bar */}
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-zinc-50 border border-zinc-200/90 shadow-2xs">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">₹</span>
            <input
              type="text"
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && pasteInput.trim()) {
                  applyPastedText(pasteInput);
                  setPasteInput('');
                }
              }}
              placeholder="Paste or type any amount (e.g. ₹ 2,50,000 or 15000)"
              className="w-full pl-7 pr-3 py-1.5 text-xs font-bold text-zinc-900 bg-white border border-zinc-300 rounded-xl focus:outline-none focus:border-emerald-600 shadow-2xs"
            />
          </div>
          <button
            type="button"
            onClick={() => {
              if (pasteInput.trim()) {
                applyPastedText(pasteInput);
                setPasteInput('');
              } else {
                handlePaste();
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-98 transition-all shrink-0"
            title="Paste from clipboard or set input amount to calculator"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>{pasteStatus || 'Paste Amount'}</span>
          </button>
        </div>

        {/* Memory Keys Row */}
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={handleMemoryClear}
            className="py-1.5 text-xs font-black rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
            title="Memory Clear"
          >
            MC
          </button>
          <button
            type="button"
            onClick={handleMemoryRecall}
            className="py-1.5 text-xs font-black rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
            title="Memory Recall"
          >
            MR
          </button>
          <button
            type="button"
            onClick={handleMemoryAdd}
            className="py-1.5 text-xs font-black rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
            title="Memory Add"
          >
            M+
          </button>
          <button
            type="button"
            onClick={handleMemorySubtract}
            className="py-1.5 text-xs font-black rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
            title="Memory Subtract"
          >
            M−
          </button>
        </div>

        {/* Main 4x5 Keypad */}
        <div className="grid grid-cols-4 gap-2.5">
          {/* Row 1 */}
          <button
            type="button"
            onClick={handleClear}
            className="py-3.5 text-sm font-black rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            AC
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="py-3.5 flex items-center justify-center text-sm font-black rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-all cursor-pointer active:scale-95"
            title="Backspace"
          >
            <Delete className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToggleSign}
            className="py-3.5 text-sm font-black rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-all cursor-pointer active:scale-95"
          >
            ±
          </button>
          <button
            type="button"
            onClick={() => handleOperator('÷')}
            className={`py-3.5 text-base font-black rounded-2xl transition-all cursor-pointer active:scale-95 ${
              operation === '÷' && waitingForOperand 
                ? 'bg-amber-500 text-white shadow-md' 
                : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-200'
            }`}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button
            type="button"
            onClick={() => handleDigit('7')}
            className="py-3.5 text-lg font-bold rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => handleDigit('8')}
            className="py-3.5 text-lg font-bold rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => handleDigit('9')}
            className="py-3.5 text-lg font-bold rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => handleOperator('×')}
            className={`py-3.5 text-base font-black rounded-2xl transition-all cursor-pointer active:scale-95 ${
              operation === '×' && waitingForOperand 
                ? 'bg-amber-500 text-white shadow-md' 
                : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-200'
            }`}
          >
            ×
          </button>

          {/* Row 3 */}
          <button
            type="button"
            onClick={() => handleDigit('4')}
            className="py-3.5 text-lg font-bold rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => handleDigit('5')}
            className="py-3.5 text-lg font-bold rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => handleDigit('6')}
            className="py-3.5 text-lg font-bold rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => handleOperator('−')}
            className={`py-3.5 text-base font-black rounded-2xl transition-all cursor-pointer active:scale-95 ${
              operation === '−' && waitingForOperand 
                ? 'bg-amber-500 text-white shadow-md' 
                : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-200'
            }`}
          >
            −
          </button>

          {/* Row 4 */}
          <button
            type="button"
            onClick={() => handleDigit('1')}
            className="py-3.5 text-lg font-bold rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => handleDigit('2')}
            className="py-3.5 text-lg font-bold rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => handleDigit('3')}
            className="py-3.5 text-lg font-bold rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => handleOperator('+')}
            className={`py-3.5 text-base font-black rounded-2xl transition-all cursor-pointer active:scale-95 ${
              operation === '+' && waitingForOperand 
                ? 'bg-amber-500 text-white shadow-md' 
                : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-200'
            }`}
          >
            +
          </button>

          {/* Row 5 */}
          <button
            type="button"
            onClick={handlePercent}
            className="py-3.5 text-sm font-black rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-all cursor-pointer active:scale-95"
          >
            %
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3.5 text-lg font-bold rounded-2xl bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200/80 transition-all cursor-pointer active:scale-95 shadow-2xs"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDecimal}
            className="py-3.5 text-lg font-black rounded-2xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-all cursor-pointer active:scale-95"
          >
            .
          </button>
          <button
            type="button"
            onClick={handleEquals}
            className="py-3.5 text-lg font-black rounded-2xl bg-[#1b4d3e] hover:bg-[#143d31] text-white transition-all cursor-pointer active:scale-95 shadow-md shadow-emerald-900/20"
          >
            =
          </button>
        </div>

        {/* Quick Indian Currency Denominations */}
        <div className="pt-2 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
              One-Click Quick Add
            </span>
            <span className="text-[10px] text-zinc-400">Append directly to amount</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '+₹1,000', val: 1000 },
              { label: '+₹5,000', val: 5000 },
              { label: '+₹10,000', val: 10000 },
              { label: '+₹50,000', val: 50000 },
              { label: '+₹1 Lakh', val: 100000 },
              { label: '+₹10 Lakh', val: 1000000 },
              { label: '+₹1 Crore', val: 10000000 },
            ].map(item => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleAddDenomination(item.val)}
                className="text-xs font-bold px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-zinc-200 text-zinc-700 transition-all cursor-pointer active:scale-95"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* ========================================================
          RIGHT: GST TAX PRESETS & CALCULATION HISTORY TAPE (COL 5)
         ======================================================== */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* GST Tax Calculator Helpers */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                Quick GST Tax Presets
              </h4>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              India Slabs
            </span>
          </div>

          <p className="text-xs text-zinc-500">
            Click to add standard GST tax directly onto the displayed number, or reverse calculate base price:
          </p>

          <div className="space-y-3">
            <div>
              <span className="text-[11px] font-bold text-zinc-600 block mb-1.5">
                Add GST Slab:
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[5, 12, 18, 28].map(slab => (
                  <button
                    key={slab}
                    type="button"
                    onClick={() => handleApplyGst(slab, false)}
                    className="py-2 px-1 text-center rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-2xs"
                  >
                    +{slab}% GST
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-zinc-600 block mb-1.5">
                Remove / Reverse GST:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleApplyGst(18, true)}
                  className="py-2 px-2 text-center rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  Reverse 18% GST
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyGst(5, true)}
                  className="py-2 px-2 text-center rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer active:scale-95"
                >
                  Reverse 5% GST
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Calculation History Tape Card */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-md p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-[#1b4d3e]" />
              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-900">
                Audit Tape & History
              </h4>
            </div>
            {history.length > 0 && (
              <button
                type="button"
                onClick={() => setHistory([])}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-400 space-y-1">
              <p className="font-semibold">No recent calculations yet.</p>
              <p className="text-[11px]">Calculations done using = or Enter key will be logged here for quick reuse.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setDisplay(item.result);
                    setWaitingForOperand(true);
                  }}
                  className="p-3 rounded-2xl bg-zinc-50 hover:bg-emerald-50/60 border border-zinc-200/80 hover:border-emerald-300 text-xs transition-all cursor-pointer group space-y-1"
                  title="Click to load into calculator"
                >
                  <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span className="truncate pr-2">{item.expression}</span>
                    <span className="text-[10px] text-zinc-400 shrink-0">{item.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-black text-zinc-900 group-hover:text-[#1b4d3e]">
                      = {formatNumberWithCommas(item.result)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <span>Load</span>
                      <ArrowRightCircle className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
