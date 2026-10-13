import React, { useState } from 'react';
import {
  Calculator,
  ArrowRight,
  Sparkles,
  RotateCcw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  PieChart,
  Home,
  Utensils,
  Car,
  GraduationCap,
  Zap,
  Film,
  ShoppingBag,
  CreditCard,
  MoreHorizontal,
} from 'lucide-react';
import {
  BudgetCalculatorData,
  CurrencyCode,
  CURRENCIES,
  CATEGORIES,
  ExpenseCategory,
} from '../types';

interface BudgetCalculatorProps {
  data: BudgetCalculatorData;
  onChange: (data: BudgetCalculatorData) => void;
  currency: CurrencyCode;
  onAskAI: (prompt: string) => void;
}

const CATEGORY_ICONS: Record<ExpenseCategory, React.ElementType> = {
  Housing: Home,
  'Food & Groceries': Utensils,
  Transportation: Car,
  Education: GraduationCap,
  'Utilities & Bills': Zap,
  Entertainment: Film,
  'Shopping & Personal': ShoppingBag,
  'Debt & EMIs': CreditCard,
  Other: MoreHorizontal,
};

export const BudgetCalculator: React.FC<BudgetCalculatorProps> = ({
  data,
  onChange,
  currency,
  onAskAI,
}) => {
  const currencyConfig = CURRENCIES[currency];

  const [customSavingsTarget, setCustomSavingsTarget] = useState<number>(5000);

  // Total Income
  const totalIncome = Math.max(0, (data.primaryIncome || 0) + (data.secondaryIncome || 0));

  // Total Expenses
  const totalExpenses = Object.values(data.expenses).reduce((acc, curr) => acc + Math.max(0, curr || 0), 0);

  // Remaining Money
  const remainingMoney = totalIncome - totalExpenses;

  // Actual planned savings (cannot exceed remaining if remaining is positive)
  const savingsAmount = Math.max(0, Math.min(customSavingsTarget, remainingMoney));

  // Percentage Calculations
  const percentSpent = totalIncome > 0 ? Math.min(100, (totalExpenses / totalIncome) * 100) : 0;
  const percentSaved = totalIncome > 0 ? Math.max(0, (remainingMoney / totalIncome) * 100) : 0;

  const handleIncomeChange = (field: 'primaryIncome' | 'secondaryIncome', value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    onChange({
      ...data,
      [field]: num,
    });
  };

  const handleExpenseChange = (category: ExpenseCategory, value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    onChange({
      ...data,
      expenses: {
        ...data.expenses,
        [category]: num,
      },
    });
  };

  // Presets
  const applyPreset = (presetType: 'student' | 'example30k' | 'freshGrad' | 'reset') => {
    if (presetType === 'example30k') {
      // Direct prompt example: income ₹30,000 and expenses ₹20,000 -> ₹10,000 remaining
      onChange({
        primaryIncome: 30000,
        secondaryIncome: 0,
        expenses: {
          Housing: 8000,
          'Food & Groceries': 5000,
          Transportation: 2500,
          Education: 500,
          'Utilities & Bills': 1500,
          Entertainment: 1000,
          'Shopping & Personal': 1000,
          'Debt & EMIs': 0,
          Other: 500,
        },
      });
      setCustomSavingsTarget(5000);
    } else if (presetType === 'student') {
      onChange({
        primaryIncome: 15000,
        secondaryIncome: 3000,
        expenses: {
          Housing: 6000,
          'Food & Groceries': 4000,
          Transportation: 1200,
          Education: 1500,
          'Utilities & Bills': 800,
          Entertainment: 1000,
          'Shopping & Personal': 500,
          'Debt & EMIs': 0,
          Other: 500,
        },
      });
      setCustomSavingsTarget(2500);
    } else if (presetType === 'freshGrad') {
      onChange({
        primaryIncome: 45000,
        secondaryIncome: 5000,
        expenses: {
          Housing: 14000,
          'Food & Groceries': 8000,
          Transportation: 3500,
          Education: 1000,
          'Utilities & Bills': 2500,
          Entertainment: 2500,
          'Shopping & Personal': 2500,
          'Debt & EMIs': 3000,
          Other: 1000,
        },
      });
      setCustomSavingsTarget(12000);
    } else if (presetType === 'reset') {
      onChange({
        primaryIncome: 0,
        secondaryIncome: 0,
        expenses: {
          Housing: 0,
          'Food & Groceries': 0,
          Transportation: 0,
          Education: 0,
          'Utilities & Bills': 0,
          Entertainment: 0,
          'Shopping & Personal': 0,
          'Debt & EMIs': 0,
          Other: 0,
        },
      });
      setCustomSavingsTarget(0);
    }
  };

  const handleConsultAI = () => {
    const expenseList = Object.entries(data.expenses)
      .filter(([_, val]) => val > 0)
      .map(([cat, val]) => `${cat}: ${currencyConfig.format(val)}`)
      .join(', ');

    const prompt = `Analyze my monthly budget:
- Total Income: ${currencyConfig.format(totalIncome)} (Primary: ${currencyConfig.format(data.primaryIncome)}, Secondary: ${currencyConfig.format(data.secondaryIncome)})
- Total Expenses: ${currencyConfig.format(totalExpenses)} (${percentSpent.toFixed(1)}% of income)
- Remaining Cash Flow: ${currencyConfig.format(remainingMoney)} (${percentSaved.toFixed(1)}% savings rate)
- Breakdown: ${expenseList || 'No breakdown entered yet'}
Please give me personalized suggestions, identify if any category is higher than usual, and suggest an optimal savings allocation.`;

    onAskAI(prompt);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Calculator className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Monthly Budget Calculator
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Calculate your cash flow, total expenditures, remaining surplus, and savings percentage.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Presets:</span>
          <button
            onClick={() => applyPreset('example30k')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            Example (30k/20k)
          </button>
          <button
            onClick={() => applyPreset('student')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Student Budget
          </button>
          <button
            onClick={() => applyPreset('freshGrad')}
            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Young Pro (50k)
          </button>
          <button
            onClick={() => applyPreset('reset')}
            className="text-xs font-semibold p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors"
            title="Reset to 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Results Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Income */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Income
          </span>
          <span className="text-lg sm:text-2xl font-extrabold text-blue-900 mt-1 block">
            {currencyConfig.format(totalIncome)}
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5 block">100% Monthly Inflow</span>
        </div>

        {/* Total Expenses */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Expenses
          </span>
          <span className="text-lg sm:text-2xl font-extrabold text-rose-600 mt-1 block">
            {currencyConfig.format(totalExpenses)}
          </span>
          <span className="text-[11px] font-medium text-rose-500 mt-0.5 block">
            {percentSpent.toFixed(1)}% of Income Spent
          </span>
        </div>

        {/* Remaining Money */}
        <div
          className={`p-4 rounded-2xl border shadow-xs ${
            remainingMoney >= 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50 border-rose-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
            Remaining Money
          </span>
          <span
            className={`text-lg sm:text-2xl font-extrabold mt-1 block ${
              remainingMoney >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {currencyConfig.format(remainingMoney)}
          </span>
          <span className="text-[11px] font-medium text-slate-600 mt-0.5 block">
            {remainingMoney >= 0 ? 'Surplus Available' : 'Deficit Warning!'}
          </span>
        </div>

        {/* Savings Amount */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Planned Savings
          </span>
          <span className="text-lg sm:text-2xl font-extrabold text-blue-700 mt-1 block">
            {currencyConfig.format(savingsAmount)}
          </span>
          <span className="text-[11px] font-medium text-blue-600 mt-0.5 block">
            {totalIncome > 0 ? ((savingsAmount / totalIncome) * 100).toFixed(1) : 0}% Target
          </span>
        </div>

        {/* Savings Rate */}
        <div className="col-span-2 lg:col-span-1 p-4 rounded-2xl bg-gradient-to-br from-blue-900 to-indigo-900 text-white shadow-xs">
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
            Savings Rate
          </span>
          <span className="text-lg sm:text-2xl font-extrabold mt-1 block">
            {percentSaved.toFixed(1)}%
          </span>
          <span className="text-[11px] text-sky-200 mt-0.5 block">
            {percentSaved >= 20 ? '🌟 Excellent (>20%)' : percentSaved >= 10 ? '👍 Healthy' : '⚠️ Low Cushion'}
          </span>
        </div>
      </div>

      {/* Visual Cash Flow Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-700">Cash Flow Allocation Breakdown</span>
          <span className="text-slate-500">
            Spent: {percentSpent.toFixed(0)}% | Remaining: {Math.max(0, percentSaved).toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${Math.min(100, percentSpent)}%` }}
            className={`h-full transition-all duration-500 ${
              percentSpent > 90 ? 'bg-rose-500' : percentSpent > 75 ? 'bg-amber-500' : 'bg-blue-600'
            }`}
            title={`Expenses: ${percentSpent.toFixed(1)}%`}
          />
          <div
            style={{ width: `${Math.max(0, Math.min(100 - percentSpent, percentSaved))}%` }}
            className="h-full bg-emerald-500 transition-all duration-500"
            title={`Remaining: ${percentSaved.toFixed(1)}%`}
          />
        </div>
      </div>

      {/* Input Sections: Incomes & Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Monthly Income */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                {currencyConfig.symbol}
              </div>
              <h3 className="font-bold text-slate-800 text-base">Monthly Income</h3>
            </div>

            {/* Primary Income */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Primary Income / Salary
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={data.primaryIncome || ''}
                  onChange={(e) => handleIncomeChange('primaryIncome', e.target.value)}
                  placeholder="30000"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Secondary Income */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600">
                Secondary / Freelance / Other Income
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={data.secondaryIncome || ''}
                  onChange={(e) => handleIncomeChange('secondaryIncome', e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Target Monthly Savings Setting */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <label className="text-xs font-semibold text-slate-600">
                Planned Monthly Savings Target
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={customSavingsTarget || ''}
                  onChange={(e) => setCustomSavingsTarget(Math.max(0, parseFloat(e.target.value) || 0))}
                  placeholder="5000"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-hidden"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Your desired monthly deposit into emergency funds or savings goals.
              </p>
            </div>
          </div>

          {/* Prompt Example Card */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 space-y-2">
            <span className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              Standard Benchmark Example:
            </span>
            <p className="text-slate-600 leading-relaxed">
              With an income of <strong>{currencyConfig.symbol}30,000</strong> and expenses of <strong>{currencyConfig.symbol}20,000</strong>, you retain <strong>{currencyConfig.symbol}10,000</strong> (33.3% savings potential) to fund your future goals.
            </p>
          </div>

          {/* AI Consultation Trigger */}
          <button
            onClick={handleConsultAI}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 text-white font-bold text-sm shadow-md shadow-blue-700/20 hover:from-blue-800 hover:to-indigo-800 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-sky-300" />
            <span>Ask BudgetBuddy to Review This Budget</span>
          </button>
        </div>

        {/* Right Column: Expense Categories */}
        <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-blue-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <PieChart className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">Monthly Expenses by Category</h3>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              Total: <strong className="text-slate-900">{currencyConfig.format(totalExpenses)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];
              const value = data.expenses[cat.id] || 0;
              const catPercent = totalIncome > 0 ? ((value / totalIncome) * 100).toFixed(1) : '0';

              return (
                <div
                  key={cat.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-blue-300 hover:shadow-xs transition-all space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400">
                      {catPercent}%
                    </span>
                  </div>

                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold text-xs">
                      {currencyConfig.symbol}
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={value === 0 ? '' : value}
                      onChange={(e) => handleExpenseChange(cat.id, e.target.value)}
                      placeholder="0"
                      className="w-full pl-7 pr-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
