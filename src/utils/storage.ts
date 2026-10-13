import { CurrencyCode, ExpenseItem, SavingsGoal, BudgetCalculatorData } from '../types';

const STORAGE_KEYS = {
  CURRENCY: 'bb_currency',
  EXPENSES: 'bb_expenses',
  GOALS: 'bb_goals',
  CALCULATOR: 'bb_calculator',
  CHAT_HISTORY: 'bb_chat_history',
  MONTHLY_BUDGET_LIMIT: 'bb_monthly_limit',
};

export const DEFAULT_CALCULATOR: BudgetCalculatorData = {
  primaryIncome: 30000,
  secondaryIncome: 0,
  expenses: {
    Housing: 8000,
    'Food & Groceries': 5000,
    Transportation: 2500,
    Education: 1000,
    'Utilities & Bills': 1500,
    Entertainment: 1000,
    'Shopping & Personal': 1000,
    'Debt & EMIs': 0,
    Other: 1000,
  },
};

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    title: 'Monthly Room Rent',
    amount: 8000,
    category: 'Housing',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'UPI',
  },
  {
    id: 'exp-2',
    title: 'Weekly Grocery Stock',
    amount: 2400,
    category: 'Food & Groceries',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'Debit Card',
  },
  {
    id: 'exp-3',
    title: 'Metro Smart Card Recharge',
    amount: 1000,
    category: 'Transportation',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'UPI',
  },
  {
    id: 'exp-4',
    title: 'WiFi & Electricity Bill',
    amount: 1450,
    category: 'Utilities & Bills',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    paymentMethod: 'Net Banking',
  },
  {
    id: 'exp-5',
    title: 'Course Materials & Books',
    amount: 950,
    category: 'Education',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'UPI',
  },
];

export const INITIAL_GOALS: SavingsGoal[] = [
  {
    id: 'goal-1',
    name: 'Emergency Fund',
    targetAmount: 50000,
    currentAmount: 22000,
    targetDate: new Date(Date.now() + 180 * 86400000).toISOString().split('T')[0],
  },
  {
    id: 'goal-2',
    name: 'New Work Laptop',
    targetAmount: 20000,
    currentAmount: 8500,
    targetDate: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  },
];

export function getStoredCurrency(): CurrencyCode {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.CURRENCY);
    if (val && ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(val)) {
      return val as CurrencyCode;
    }
  } catch (e) {
    console.error(e);
  }
  return 'INR';
}

export function setStoredCurrency(code: CurrencyCode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CURRENCY, code);
  } catch (e) {
    console.error(e);
  }
}

export function getStoredExpenses(): ExpenseItem[] {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (val) return JSON.parse(val);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_EXPENSES;
}

export function setStoredExpenses(expenses: ExpenseItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredGoals(): SavingsGoal[] {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.GOALS);
    if (val) return JSON.parse(val);
  } catch (e) {
    console.error(e);
  }
  return INITIAL_GOALS;
}

export function setStoredGoals(goals: SavingsGoal[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredCalculator(): BudgetCalculatorData {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.CALCULATOR);
    if (val) return JSON.parse(val);
  } catch (e) {
    console.error(e);
  }
  return DEFAULT_CALCULATOR;
}

export function setStoredCalculator(data: BudgetCalculatorData): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CALCULATOR, JSON.stringify(data));
  } catch (e) {
    console.error(e);
  }
}

export function getStoredMonthlyLimit(): number {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.MONTHLY_BUDGET_LIMIT);
    if (val) return Number(val) || 25000;
  } catch (e) {
    console.error(e);
  }
  return 25000;
}

export function setStoredMonthlyLimit(limit: number): void {
  try {
    localStorage.setItem(STORAGE_KEYS.MONTHLY_BUDGET_LIMIT, String(limit));
  } catch (e) {
    console.error(e);
  }
}


