import React, { useState } from 'react';
import {
  PieChart,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import {
  ExpenseItem,
  BudgetCalculatorData,
  CurrencyCode,
  CURRENCIES,
  CATEGORIES,
  ExpenseCategory,
} from '../types';

interface SpendingAnalysisProps {
  expenses: ExpenseItem[];
  calculatorData: BudgetCalculatorData;
  currency: CurrencyCode;
  onAskAI: (prompt: string) => void;
}

export const SpendingAnalysis: React.FC<SpendingAnalysisProps> = ({
  expenses,
  calculatorData,
  currency,
  onAskAI,
}) => {
  const currencyConfig = CURRENCIES[currency];
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Combine logged expenses with calculator data if available
  const loggedCategoryTotals = expenses.reduce<Record<string, number>>((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  // Determine active totals (prioritize logged expenses if present, otherwise calculator breakdown)
  const hasLoggedExpenses = expenses.length > 0;
  const categoryTotals: Record<string, number> = {};

  CATEGORIES.forEach((cat) => {
    if (hasLoggedExpenses) {
      categoryTotals[cat.id] = loggedCategoryTotals[cat.id] || 0;
    } else {
      categoryTotals[cat.id] = calculatorData.expenses[cat.id] || 0;
    }
  });

  const totalSpend = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const totalIncome = calculatorData.primaryIncome + calculatorData.secondaryIncome;

  // Sorted categories by highest expenditure
  const sortedCategories = Object.entries(categoryTotals)
    .filter(([_, val]) => val > 0)
    .sort((a, b) => b[1] - a[1]);

  const topCategory = sortedCategories[0];

  // Needs vs Wants calculation
  let needsTotal = 0;
  let wantsTotal = 0;

  CATEGORIES.forEach((cat) => {
    const val = categoryTotals[cat.id] || 0;
    if (cat.isEssential) {
      needsTotal += val;
    } else {
      wantsTotal += val;
    }
  });

  const estimatedSavings = Math.max(0, totalIncome - totalSpend);

  const needsPercent = totalIncome > 0 ? (needsTotal / totalIncome) * 100 : totalSpend > 0 ? (needsTotal / totalSpend) * 100 : 0;
  const wantsPercent = totalIncome > 0 ? (wantsTotal / totalIncome) * 100 : totalSpend > 0 ? (wantsTotal / totalSpend) * 100 : 0;
  const savingsPercent = totalIncome > 0 ? (estimatedSavings / totalIncome) * 100 : 0;

  // Render SVG Donut Chart
  const renderDonutChart = () => {
    if (totalSpend === 0) {
      return (
        <div className="w-56 h-56 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400 text-center p-4">
          No spending logged yet. Add expenses to generate charts.
        </div>
      );
    }

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    let accumulatedAngle = 0;

    const slices = sortedCategories.map(([catId, val]) => {
      const catMeta = CATEGORIES.find((c) => c.id === catId);
      const ratio = val / totalSpend;
      const strokeDasharray = `${ratio * circumference} ${circumference}`;
      const strokeDashoffset = -accumulatedAngle * circumference;
      accumulatedAngle += ratio;

      return {
        catId,
        catMeta,
        val,
        ratio,
        strokeDasharray,
        strokeDashoffset,
      };
    });

    return (
      <div className="relative flex items-center justify-center">
        <svg className="w-56 h-56 -rotate-90 transform" viewBox="0 0 200 200">
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth="28"
          />
          {slices.map((slice) => (
            <circle
              key={slice.catId}
              cx="100"
              cy="100"
              r={radius}
              fill="transparent"
              stroke={slice.catMeta?.color || '#3b82f6'}
              strokeWidth="28"
              strokeDasharray={slice.strokeDasharray}
              strokeDashoffset={slice.strokeDashoffset}
              className="transition-all duration-300 hover:opacity-85 cursor-pointer"
              onMouseEnter={() => setHoveredCategory(slice.catId)}
              onMouseLeave={() => setHoveredCategory(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute text-center pointer-events-none">
          <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">
            Total Spent
          </span>
          <span className="text-lg font-extrabold text-blue-950 block">
            {currencyConfig.format(totalSpend)}
          </span>
          {hoveredCategory && (
            <span className="text-[11px] font-bold text-blue-600 block mt-0.5 truncate max-w-[120px]">
              {hoveredCategory}
            </span>
          )}
        </div>
      </div>
    );
  };

  const handleDeepAIAnalysis = () => {
    const breakdown = sortedCategories
      .map(([cat, amt]) => `${cat}: ${currencyConfig.format(amt)} (${((amt / totalSpend) * 100).toFixed(1)}%)`)
      .join(', ');

    const prompt = `Conduct a comprehensive spending analysis for my personal finances:
- Total Monthly Inflow: ${currencyConfig.format(totalIncome)}
- Total Spend: ${currencyConfig.format(totalSpend)}
- Needs: ${currencyConfig.format(needsTotal)} (${needsPercent.toFixed(1)}%)
- Wants / Discretionary: ${currencyConfig.format(wantsTotal)} (${wantsPercent.toFixed(1)}%)
- Potential Savings Surplus: ${currencyConfig.format(estimatedSavings)} (${savingsPercent.toFixed(1)}%)
- Category Breakdown: ${breakdown}
Please identify any spending leaks, compare my allocation against practical benchmarks without being rigid, and suggest 3 high-impact expense reduction strategies.`;

    onAskAI(prompt);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <PieChart className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Spending Breakdown & Insights
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visual breakdown of expenditures based strictly on your entered transaction records.
          </p>
        </div>

        <button
          onClick={handleDeepAIAnalysis}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
        >
          <Sparkles className="w-4 h-4 text-sky-200" />
          <span>Ask BudgetBuddy for Deep Analysis</span>
        </button>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Chart Card */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-slate-800 mb-6 self-start">
            Category Allocation Wheel
          </h3>

          {renderDonutChart()}

          {/* Quick Legend */}
          <div className="w-full mt-6 pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-center">
            {sortedCategories.slice(0, 5).map(([catId, val]) => {
              const meta = CATEGORIES.find((c) => c.id === catId);
              return (
                <div
                  key={catId}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-xs font-semibold text-slate-700"
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta?.color }} />
                  <span>{catId}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Categories Bar Distribution */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Largest Expense Categories</h3>
            <span className="text-xs text-slate-400 font-medium">
              Data source: {hasLoggedExpenses ? `${expenses.length} Logged Entries` : 'Budget Calculator Inputs'}
            </span>
          </div>

          {sortedCategories.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No expenses entered yet. Please log expenses or fill the budget calculator.
            </div>
          ) : (
            <div className="space-y-3.5">
              {sortedCategories.map(([catId, val], index) => {
                const meta = CATEGORIES.find((c) => c.id === catId);
                const percent = totalSpend > 0 ? (val / totalSpend) * 100 : 0;

                return (
                  <div key={catId} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="text-slate-400 font-normal">#{index + 1}</span>
                        {meta?.name || catId}
                        {meta?.isEssential ? (
                          <span className="text-[10px] px-1.5 py-0.2 bg-blue-50 text-blue-700 rounded-md font-semibold">
                            Need
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 bg-purple-50 text-purple-700 rounded-md font-semibold">
                            Want
                          </span>
                        )}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-blue-900">
                          {currencyConfig.format(val)}
                        </span>
                        <span className="font-semibold text-slate-400 text-[11px] w-12 text-right">
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%`, backgroundColor: meta?.color || '#2563eb' }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 50/30/20 Benchmark Comparison Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Optional Benchmark: Needs vs Wants vs Savings</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                50/30/20 Guideline
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Provided as an optional starting point—never a mandatory rule. Tailor to your actual circumstances.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Needs */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Needs (Essentials)
              </span>
              <span className="text-xs font-extrabold text-blue-700">Target: ~50%</span>
            </div>
            <p className="text-xl font-extrabold text-blue-950">
              {currencyConfig.format(needsTotal)}
            </p>
            <p className="text-xs text-slate-600 font-medium">
              Current: <strong>{needsPercent.toFixed(1)}%</strong> of income
            </p>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-blue-200/60">
              Rent, food staples, commute, health, utility bills, debt EMIs.
            </p>
          </div>

          {/* Wants */}
          <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                Wants (Lifestyle)
              </span>
              <span className="text-xs font-extrabold text-purple-700">Target: ~30%</span>
            </div>
            <p className="text-xl font-extrabold text-purple-950">
              {currencyConfig.format(wantsTotal)}
            </p>
            <p className="text-xs text-slate-600 font-medium">
              Current: <strong>{wantsPercent.toFixed(1)}%</strong> of income
            </p>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-purple-200/60">
              Dining out, entertainment, shopping, subscriptions, recreation.
            </p>
          </div>

          {/* Savings */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Savings & Emergency
              </span>
              <span className="text-xs font-extrabold text-emerald-700">Target: ~20%</span>
            </div>
            <p className="text-xl font-extrabold text-emerald-950">
              {currencyConfig.format(estimatedSavings)}
            </p>
            <p className="text-xs text-slate-600 font-medium">
              Current: <strong>{savingsPercent.toFixed(1)}%</strong> of income
            </p>
            <p className="text-[11px] text-slate-500 pt-1 border-t border-emerald-200/60">
              Emergency buffer, future targets, long-term security funds.
            </p>
          </div>
        </div>

        {/* Top Expense Highlight Callout */}
        {topCategory && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-700">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">
                Primary Spending Driver:{' '}
              </span>
              Your largest expense category is <strong>{topCategory[0]}</strong>, absorbing{' '}
              <strong>{currencyConfig.format(topCategory[1])}</strong> ({((topCategory[1] / totalSpend) * 100).toFixed(1)}% of your total spend).
              Auditing this specific bucket often unlocks the quickest savings without compromising your quality of life.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
