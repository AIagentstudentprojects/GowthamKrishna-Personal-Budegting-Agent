import React, { useState } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Award,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  X,
  PlusCircle,
} from 'lucide-react';
import { SavingsGoal, CurrencyCode, CURRENCIES } from '../types';

interface SavingsGoalsProps {
  goals: SavingsGoal[];
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
  onUpdateGoalAmount: (id: string, newAmount: number) => void;
  onDeleteGoal: (id: string) => void;
  currency: CurrencyCode;
  onAskAI: (prompt: string) => void;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({
  goals,
  onAddGoal,
  onUpdateGoalAmount,
  onDeleteGoal,
  currency,
  onAskAI,
}) => {
  const currencyConfig = CURRENCIES[currency];

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  // Deposit modal state
  const [depositGoalId, setDepositGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Date calculation helper
  const calculateGoalMetrics = (goal: SavingsGoal) => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
    const percent = goal.targetAmount > 0 ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100) : 0;
    const isCompleted = goal.currentAmount >= goal.targetAmount;

    // Calculate months remaining
    const today = new Date();
    const target = new Date(goal.targetDate);

    let monthsRemaining = 0;
    let isPastDate = false;

    if (isNaN(target.getTime())) {
      monthsRemaining = 1;
    } else {
      const diffTime = target.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) {
        isPastDate = true;
        monthsRemaining = 0;
      } else {
        // Approximate months
        monthsRemaining = Math.max(1, Math.round(diffDays / 30.4));
      }
    }

    const estimatedMonthly = isCompleted
      ? 0
      : isPastDate
      ? remaining
      : monthsRemaining > 0
      ? Math.ceil(remaining / monthsRemaining)
      : remaining;

    return {
      remaining,
      percent,
      isCompleted,
      monthsRemaining,
      isPastDate,
      estimatedMonthly,
    };
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount) || 0;

    if (!name.trim() || isNaN(target) || target <= 0) {
      alert('Please specify a valid goal name and target amount greater than zero.');
      return;
    }

    if (!targetDate) {
      alert('Please select a target date.');
      return;
    }

    onAddGoal({
      name: name.trim(),
      targetAmount: target,
      currentAmount: Math.max(0, current),
      targetDate,
    });

    // Reset form
    setName('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    setIsFormOpen(false);
  };

  const handleDeposit = (goal: SavingsGoal, addAmount: number) => {
    const newAmt = goal.currentAmount + addAmount;
    onUpdateGoalAmount(goal.id, newAmt);
  };

  const handleCustomDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositGoalId) return;
    const addAmt = parseFloat(depositAmount);
    if (isNaN(addAmt) || addAmt <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    const goal = goals.find((g) => g.id === depositGoalId);
    if (goal) {
      handleDeposit(goal, addAmt);
    }
    setDepositGoalId(null);
    setDepositAmount('');
  };

  const handleConsultAI = (goal: SavingsGoal) => {
    const metrics = calculateGoalMetrics(goal);
    const prompt = `Help me build a realistic savings plan for my goal:
- Goal Name: "${goal.name}"
- Target Amount: ${currencyConfig.format(goal.targetAmount)}
- Currently Saved: ${currencyConfig.format(goal.currentAmount)} (${metrics.percent.toFixed(1)}% reached)
- Remaining to Save: ${currencyConfig.format(metrics.remaining)}
- Target Date: ${goal.targetDate} (~${metrics.monthsRemaining} months remaining)
- Estimated Monthly Contribution: ${currencyConfig.format(metrics.estimatedMonthly)}/month
Can you give me actionable advice on how to free up cash, adjust my habits, and reach this milestone on time?`;

    onAskAI(prompt);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-blue-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Personal Savings Goals
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track milestones, calculate required monthly savings, and build financial cushions with confidence.
          </p>
        </div>

        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Savings Goal
          </button>
        )}
      </div>

      {/* Add Goal Form Modal / Card */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-blue-200 p-5 sm:p-6 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-600" />
              Define a New Financial Target
            </h3>
            <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateGoal} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Goal Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ₹20,000 Laptop Fund"
                className="w-full px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Target Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="1"
                  required
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="20000"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Current Saved Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="0"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  placeholder="0"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Target Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
              >
                Save Goal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Custom Deposit Modal */}
      {depositGoalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl border border-blue-100">
            <h4 className="text-base font-bold text-slate-900 mb-1">Add Savings Deposit</h4>
            <p className="text-xs text-slate-500 mb-4">
              Add funds toward "{goals.find((g) => g.id === depositGoalId)?.name}"
            </p>
            <form onSubmit={handleCustomDepositSubmit} className="space-y-4">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  min="1"
                  required
                  autoFocus
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDepositGoalId(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm"
                >
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goal Cards Grid */}
      {goals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No savings goals set yet</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 mb-4">
            Setting clear targets—like an emergency fund or ₹20,000 tech fund—dramatically improves your financial discipline.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {goals.map((goal) => {
            const metrics = calculateGoalMetrics(goal);

            return (
              <div
                key={goal.id}
                className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
                  metrics.isCompleted
                    ? 'border-emerald-300 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <div>
                  {/* Goal Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-base">{goal.name}</h3>
                        {metrics.isCompleted && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            <Award className="w-3 h-3 text-emerald-600" />
                            Completed!
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        Target: {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        {metrics.isPastDate && !metrics.isCompleted && (
                          <span className="text-rose-500 font-semibold ml-1">(Target Passed)</span>
                        )}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete goal "${goal.name}"?`)) {
                          onDeleteGoal(goal.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Delete goal"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Numbers Progress */}
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <span className="text-xs text-slate-400 font-medium">Saved</span>
                      <p className="text-xl font-extrabold text-blue-900">
                        {currencyConfig.format(goal.currentAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-medium">Target</span>
                      <p className="text-sm font-bold text-slate-700">
                        {currencyConfig.format(goal.targetAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                    <div
                      style={{ width: `${metrics.percent}%` }}
                      className={`h-full transition-all duration-500 ${
                        metrics.isCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-sky-500'
                      }`}
                    />
                  </div>

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-xl text-xs mb-4">
                    <div>
                      <span className="text-slate-400 text-[11px] block">Remaining</span>
                      <span className="font-bold text-slate-800">
                        {currencyConfig.format(metrics.remaining)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px] block">Est. Monthly Need</span>
                      <span className="font-bold text-blue-700">
                        {metrics.isCompleted ? 'Goal Hit! 🎉' : `${currencyConfig.format(metrics.estimatedMonthly)}/mo`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Add Funds Buttons & AI Trigger */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  {!metrics.isCompleted && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-semibold text-slate-400">Quick Deposit:</span>
                      <button
                        onClick={() => handleDeposit(goal, 500)}
                        className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        +{currencyConfig.symbol}500
                      </button>
                      <button
                        onClick={() => handleDeposit(goal, 1000)}
                        className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100"
                      >
                        +{currencyConfig.symbol}1,000
                      </button>
                      <button
                        onClick={() => setDepositGoalId(goal.id)}
                        className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                      >
                        Custom...
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() => handleConsultAI(goal)}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-blue-700 font-semibold text-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Get AI Plan Advice for this Goal</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
