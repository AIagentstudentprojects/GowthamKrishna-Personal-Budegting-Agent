export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  format: (amount: number) => string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  INR: {
    code: 'INR',
    symbol: '₹',
    name: 'Indian Rupee (₹)',
    format: (amt: number) => `₹${amt.toLocaleString('en-IN')}`,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar ($)',
    format: (amt: number) => `$${amt.toLocaleString('en-US')}`,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Euro (€)',
    format: (amt: number) => `€${amt.toLocaleString('de-DE')}`,
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    name: 'British Pound (£)',
    format: (amt: number) => `£${amt.toLocaleString('en-GB')}`,
  },
  CAD: {
    code: 'CAD',
    symbol: 'CA$',
    name: 'Canadian Dollar (CA$)',
    format: (amt: number) => `CA$${amt.toLocaleString('en-CA')}`,
  },
  AUD: {
    code: 'AUD',
    symbol: 'A$',
    name: 'Australian Dollar (A$)',
    format: (amt: number) => `A$${amt.toLocaleString('en-AU')}`,
  },
};

export type ExpenseCategory =
  | 'Housing'
  | 'Food & Groceries'
  | 'Transportation'
  | 'Education'
  | 'Utilities & Bills'
  | 'Entertainment'
  | 'Shopping & Personal'
  | 'Debt & EMIs'
  | 'Other';

export interface CategoryMeta {
  id: ExpenseCategory;
  name: string;
  iconName: string;
  color: string;
  bgLight: string;
  isEssential: boolean; // Needs vs Wants
}

export const CATEGORIES: CategoryMeta[] = [
  { id: 'Housing', name: 'Housing & Rent', iconName: 'Home', color: '#1d4ed8', bgLight: '#eff6ff', isEssential: true },
  { id: 'Food & Groceries', name: 'Food & Groceries', iconName: 'Utensils', color: '#0284c7', bgLight: '#f0f9ff', isEssential: true },
  { id: 'Transportation', name: 'Transportation', iconName: 'Car', color: '#0369a1', bgLight: '#e0f2fe', isEssential: true },
  { id: 'Education', name: 'Education & Study', iconName: 'GraduationCap', color: '#4338ca', bgLight: '#eef2ff', isEssential: true },
  { id: 'Utilities & Bills', name: 'Utilities & Bills', iconName: 'Zap', color: '#2563eb', bgLight: '#dbeafe', isEssential: true },
  { id: 'Entertainment', name: 'Entertainment & Subs', iconName: 'Film', color: '#7c3aed', bgLight: '#f5f3ff', isEssential: false },
  { id: 'Shopping & Personal', name: 'Shopping & Lifestyle', iconName: 'ShoppingBag', color: '#0891b2', bgLight: '#ecfeff', isEssential: false },
  { id: 'Debt & EMIs', name: 'Debt & Loan EMIs', iconName: 'CreditCard', color: '#b91c1c', bgLight: '#fef2f2', isEssential: true },
  { id: 'Other', name: 'Other Miscellaneous', iconName: 'MoreHorizontal', color: '#475569', bgLight: '#f1f5f9', isEssential: false },
];

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  paymentMethod?: string;
  notes?: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
}

export interface BudgetCalculatorData {
  primaryIncome: number;
  secondaryIncome: number;
  expenses: Record<ExpenseCategory, number>;
}


export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isOffTopic?: boolean;
}
