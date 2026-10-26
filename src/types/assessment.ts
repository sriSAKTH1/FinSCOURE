export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export type EmploymentType = 'salaried' | 'self-employed' | 'freelancer' | 'business' | 'other';

export type LoanType = 'home' | 'personal' | 'auto' | 'education' | 'credit_card' | 'consumer_durable' | 'other';

export type AssetCategory =
  | 'stocks'
  | 'mf'
  | 'gold'
  | 'stocks_mf'
  | 'gold_other'
  | 'fixed_deposits'
  | 'epf_ppf_nps'
  | 'real_estate'
  | 'cash_bank'
  | 'crypto_alt'
  | 'other';

export type GoalCategory = 'home' | 'education' | 'retirement' | 'vehicle' | 'wealth' | 'wedding' | 'other';

export type ExpenseFrequency = 'N' | 'E' | 'W' | 'M'; // N = Need, E = Expense, W = Want (M supported for backwards compatibility)

export interface PersonalDetails {
  firstName: string;
  age: number | '';
  dependents: number;
  employmentType: EmploymentType;
  occupation: string;
  monthlyTakeHome: number | '';
  currency: CurrencyCode;
  householdDetails?: string;
}

export interface ExpenseItem {
  amount: number | '';
  frequency: ExpenseFrequency;
}

export interface CustomExpenseItem {
  id: string;
  name: string;
  amount: number | '';
  frequency: ExpenseFrequency;
  category: 'essential' | 'discretionary';
}

export interface MonthlyExpenses {
  rent: ExpenseItem;
  food: ExpenseItem;
  utilities: ExpenseItem;
  phoneInternet: ExpenseItem;
  ott: ExpenseItem;
  entertainment: ExpenseItem;
  transport: ExpenseItem;
  healthcare: ExpenseItem;
  shopping: ExpenseItem;
  education: ExpenseItem;
  travel: ExpenseItem;
  familySupport: ExpenseItem;
  loans?: ExpenseItem;
  other: ExpenseItem;
}

export interface AdditionalIncome {
  business: number | '';
  freelance: number | '';
  rental: number | '';
  interestDividends: number | '';
  other: number | '';
}

export interface LoanItem {
  id: string;
  type: LoanType;
  customName?: string;
  principal: number | '';
  monthlyEmi: number | '';
  interestRate: number | '';
  remainingMonths: number | '';
  endDate?: string;
  overdueAmount: number | '';
  isOverdue: boolean;
}

export interface HealthInsurance {
  hasCover: boolean;
  sumInsured: number | '';
  policyType: 'individual' | 'family_floater';
  source: 'retail' | 'employer' | 'both';
  annualPremium: number | '';
  coveredMembers: number;
}

export interface LifeInsurance {
  hasCover: boolean;
  sumAssured: number | '';
  policyType: 'term' | 'endowment' | 'ulip' | 'other';
  annualPremium: number | '';
  dependentsSupported: number;
}

export interface EmergencyFund {
  liquidSavings: number | '';
  hasEmergencyFund: boolean;
  targetMonths: 3 | 6 | 9 | 12;
  isAccessible: boolean; // Accessible within 24-48 hours
}

export interface AssetItem {
  id: string;
  category: AssetCategory;
  name: string;
  currentValue: number | '';
  monthlyContribution: number | '';
  expectedReturn?: number | '';
}

export interface GoalItem {
  id: string;
  category: GoalCategory;
  name: string;
  targetAmount: number | '';
  targetYear: number | '';
  savedAmount: number | '';
  monthlyContribution: number | '';
  expectedReturn?: number | '';
  tenureYears?: number;
  targetDate?: string;
  hidden?: boolean;
}

export interface AssessmentData {
  step: number;
  personal: PersonalDetails;
  additionalIncome: AdditionalIncome;
  expenses: MonthlyExpenses;
  customExpenses?: CustomExpenseItem[];
  hasLoans: boolean;
  loans: LoanItem[];
  healthInsurance: HealthInsurance;
  lifeInsurance: LifeInsurance;
  emergencyFund: EmergencyFund;
  assets: AssetItem[];
  goals: GoalItem[];
  lastSavedAt?: string;
}
