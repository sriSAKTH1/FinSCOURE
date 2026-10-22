import { CurrencyCode } from '@/types/assessment';

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertUnderThousand(n: number): string {
  let s = '';
  if (n >= 100) {
    s += ONES[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    s += TENS[Math.floor(n / 10)] + ' ';
    n %= 10;
  }
  if (n > 0) {
    s += ONES[n] + ' ';
  }
  return s.trim();
}

/**
 * Converts a number to Indian numbering words (Crore, Lakh, Thousand)
 */
export function toIndianWords(num: number): string {
  if (num === 0) return 'Zero';
  let n = Math.floor(num);
  let words = '';

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const remainder = n;

  if (crore > 0) {
    words += convertUnderThousand(crore) + ' Crore ';
  }
  if (lakh > 0) {
    words += convertUnderThousand(lakh) + ' Lakh ';
  }
  if (thousand > 0) {
    words += convertUnderThousand(thousand) + ' Thousand ';
  }
  if (remainder > 0) {
    words += convertUnderThousand(remainder);
  }

  return words.trim();
}

/**
 * Converts a number to International numbering words (Billion, Million, Thousand)
 */
function toInternationalWords(num: number): string {
  if (num === 0) return 'Zero';
  let n = Math.floor(num);
  let words = '';

  const billion = Math.floor(n / 1000000000);
  n %= 1000000000;
  const million = Math.floor(n / 1000000);
  n %= 1000000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;
  const remainder = n;

  if (billion > 0) {
    words += convertUnderThousand(billion) + ' Billion ';
  }
  if (million > 0) {
    words += convertUnderThousand(million) + ' Million ';
  }
  if (thousand > 0) {
    words += convertUnderThousand(thousand) + ' Thousand ';
  }
  if (remainder > 0) {
    words += convertUnderThousand(remainder);
  }

  return words.trim();
}

/**
 * Parses shorthand financial notations:
 * e.g.:
 *  "1k" -> 1000
 *  "25k" -> 25000
 *  "2l" / "2lac" / "2lakh" -> 200000
 *  "1.5l" -> 150000
 *  "1cr" / "1.5cr" -> 10000000 / 15000000
 *  "2m" -> 2000000
 */
export function parseShorthandAmount(val: string | number | undefined | null): number | '' {
  if (val === '' || val === undefined || val === null) return '';
  if (typeof val === 'number') return isNaN(val) ? '' : val;

  const raw = String(val).trim().toLowerCase();
  if (raw === '') return '';

  // Check for 'cr' / 'crore' / 'crores'
  const crMatch = raw.match(/^([0-9.]+)\s*(cr|crore|crores)$/);
  if (crMatch) {
    const n = parseFloat(crMatch[1]);
    return isNaN(n) ? '' : Math.round(n * 10000000);
  }

  // Check for 'l' / 'lac' / 'lakh' / 'lakhs'
  const lakhMatch = raw.match(/^([0-9.]+)\s*(l|lac|lakh|lakhs)$/);
  if (lakhMatch) {
    const n = parseFloat(lakhMatch[1]);
    return isNaN(n) ? '' : Math.round(n * 100000);
  }

  // Check for 'k' / 'thousand'
  const kMatch = raw.match(/^([0-9.]+)\s*(k|thousand)$/);
  if (kMatch) {
    const n = parseFloat(kMatch[1]);
    return isNaN(n) ? '' : Math.round(n * 1000);
  }

  // Check for 'm' / 'million'
  const mMatch = raw.match(/^([0-9.]+)\s*(m|million)$/);
  if (mMatch) {
    const n = parseFloat(mMatch[1]);
    return isNaN(n) ? '' : Math.round(n * 1000000);
  }

  // Plain numbers with optional commas or currency symbols
  const clean = raw.replace(/[^0-9.]/g, '');
  const num = parseFloat(clean);
  return isNaN(num) ? '' : num;
}

/**
 * Returns compact notation like "1k", "2L", "1.5Cr"
 */
export function getCompactNotation(num: number, currency: CurrencyCode = 'INR'): string {
  if (num === 0) return '0';

  if (currency === 'INR') {
    if (num >= 10000000) {
      const cr = num / 10000000;
      const formatted = cr % 1 === 0 ? cr : Number(cr.toFixed(2));
      return `${formatted}Cr`;
    }
    if (num >= 100000) {
      const l = num / 100000;
      const formatted = l % 1 === 0 ? l : Number(l.toFixed(2));
      return `${formatted}L`;
    }
    if (num >= 1000) {
      const k = num / 1000;
      const formatted = k % 1 === 0 ? k : Number(k.toFixed(1));
      return `${formatted}k`;
    }
    return String(num);
  }

  // International format
  if (num >= 1000000000) {
    const b = num / 1000000000;
    const formatted = b % 1 === 0 ? b : Number(b.toFixed(2));
    return `${formatted}B`;
  }
  if (num >= 1000000) {
    const m = num / 1000000;
    const formatted = m % 1 === 0 ? m : Number(m.toFixed(2));
    return `${formatted}M`;
  }
  if (num >= 1000) {
    const k = num / 1000;
    const formatted = k % 1 === 0 ? k : Number(k.toFixed(1));
    return `${formatted}k`;
  }
  return String(num);
}

export interface PriceHighlight {
  compact: string; // e.g. "100", "1k", "1L", "1Cr", "2.5L", "1.5Cr"
  formatted: string; // e.g. "₹1,00,000"
  words: string; // e.g. "One Lakh Rupees"
  rawAmount: number;
}

export function getPriceHighlight(
  amount: number | string | '' | undefined | null,
  currency: CurrencyCode = 'INR'
): PriceHighlight | null {
  if (amount === '' || amount === undefined || amount === null) return null;
  const num = typeof amount === 'number' ? amount : parseShorthandAmount(amount);
  if (num === '' || isNaN(Number(num))) return null;
  const n = Number(num);
  if (n <= 0) return null;

  const compact = getCompactNotation(n, 'INR');
  const formatted = `₹${Math.round(n).toLocaleString('en-IN')}`;
  const words = `${toIndianWords(n)} Rupees`;

  return {
    compact,
    formatted,
    words,
    rawAmount: n,
  };
}

export function formatPriceWithWords(amount: number | string | '' | undefined | null, currency: CurrencyCode = 'INR'): string {
  if (amount === '' || amount === undefined || amount === null) {
    return '';
  }

  const num = typeof amount === 'number' ? amount : parseShorthandAmount(amount);
  if (num === '' || isNaN(Number(num))) {
    return '';
  }

  const n = Number(num);
  if (n <= 0) {
    return '';
  }

  const compact = getCompactNotation(n, 'INR');
  const formattedNum = `₹${Math.round(n).toLocaleString('en-IN')}`;
  const words = toIndianWords(n);

  return `${formattedNum} (${compact}) • ${words} Rupees`;
}
