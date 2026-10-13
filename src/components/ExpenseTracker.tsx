import React, { useState } from 'react';
import {
  ReceiptText,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Download,
  Upload,
  Sparkles,
  AlertCircle,
  Calendar,
  CreditCard,
  Check,
  X,
  ShieldCheck,
  ArrowUpDown,
} from 'lucide-react';
import {
  ExpenseItem,
  ExpenseCategory,
  CurrencyCode,
  CURRENCIES,
  CATEGORIES,
} from '../types';

interface ExpenseTrackerProps {
  expenses: ExpenseItem[];
  onAddExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  onEditExpense: (id: string, expense: Partial<ExpenseItem>) => void;
  onDeleteExpense: (id: string) => void;
  onImportExpenses: (expenses: ExpenseItem[]) => void;
  currency: CurrencyCode;
  monthlyLimit: number;
  onUpdateMonthlyLimit: (limit: number) => void;
  onAskAI: (prompt: string) => void;
}

export const ExpenseTracker: React.FC<ExpenseTrackerProps> = ({
  expenses,
  onAddExpense,
  onEditExpense,
  onDeleteExpense,
  onImportExpenses,
  currency,
  monthlyLimit,
  onUpdateMonthlyLimit,
  onAskAI,
}) => {
  const currencyConfig = CURRENCIES[currency];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Form State for Add / Edit
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Groceries');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Budget limit modal / state
  const [isEditingLimit, setIsEditingLimit] = useState(false);
  const [limitInput, setLimitInput] = useState(String(monthlyLimit));

  // Calculations
  const totalSpending = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBudget = monthlyLimit - totalSpending;
  const percentUsed = monthlyLimit > 0 ? (totalSpending / monthlyLimit) * 100 : 0;

  // Filtered & Sorted list
  const filteredExpenses = expenses
    .filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.paymentMethod && item.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOrder === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOrder === 'highest') return b.amount - a.amount;
      return a.amount - b.amount;
    });

  // Category totals
  const categoryTotals = expenses.reduce<Record<string, number>>((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('Please provide a valid expense title and an amount greater than zero.');
      return;
    }

    if (editingId) {
      onEditExpense(editingId, {
        title: title.trim(),
        amount: numAmount,
        category,
        date,
        paymentMethod,
      });
      setEditingId(null);
    } else {
      onAddExpense({
        title: title.trim(),
        amount: numAmount,
        category,
        date,
        paymentMethod,
      });
    }

    // Reset Form
    setTitle('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setIsFormOpen(false);
  };

  const handleStartEdit = (exp: ExpenseItem) => {
    setEditingId(exp.id);
    setTitle(exp.title);
    setAmount(String(exp.amount));
    setCategory(exp.category);
    setDate(exp.date);
    setPaymentMethod(exp.paymentMethod || 'UPI');
    setIsFormOpen(true);
  };

  const handleExportCSV = () => {
    if (expenses.length === 0) {
      alert('No expenses to export.');
      return;
    }
    const headers = ['Date', 'Title', 'Category', 'Amount', 'Payment Method'];
    const rows = expenses.map((e) => [
      e.date,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.category}"`,
      e.amount,
      `"${e.paymentMethod || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BudgetBuddy_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(expenses, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `BudgetBuddy_Backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportExpenses(parsed);
          alert(`Successfully imported ${parsed.length} expenses.`);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleAskAIToAnalyze = () => {
    const topCats = Object.entries(categoryTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat, total]) => `${cat} (${currencyConfig.format(total)})`)
      .join(', ');

    const prompt = `Here is my current expense summary:
- Total Logged Spending: ${currencyConfig.format(totalSpending)} across ${expenses.length} transactions.
- Monthly Budget Limit: ${currencyConfig.format(monthlyLimit)}.
- Remaining Budget: ${currencyConfig.format(remainingBudget)} (${(100 - percentUsed).toFixed(1)}% remaining).
- Top Expense Categories: ${topCats || 'None'}.
Please analyze my spending habits, point out any spending leaks, and give me 3 practical tips to save more this month.`;

    onAskAI(prompt);
  };

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      {/* Privacy Notice Banner */}
      <div className="bg-blue-50 border border-blue-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-blue-900 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Local Storage Privacy:</strong> All expenses are securely saved locally on your device. No bank login required. Please note that data may be cleared if you wipe browser cache.
          </span>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 font-semibold hover:bg-blue-100 transition-colors"
            title="Download CSV report"
          >
            <Download className="w-3 h-3" />
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 font-semibold hover:bg-blue-100 transition-colors"
            title="Backup JSON"
          >
            <Download className="w-3 h-3" />
            JSON
          </button>
          <label className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-blue-200 text-blue-700 font-semibold hover:bg-blue-100 transition-colors cursor-pointer">
            <Upload className="w-3 h-3" />
            Import
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spending */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Spending
          </span>
          <span className="text-2xl font-extrabold text-blue-900 mt-1 block">
            {currencyConfig.format(totalSpending)}
          </span>
          <span className="text-xs text-slate-400 mt-0.5 block">{expenses.length} total entries</span>
        </div>

        {/* Monthly Budget Limit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Budget Target
            </span>
            <button
              onClick={() => {
                setLimitInput(String(monthlyLimit));
                setIsEditingLimit(!isEditingLimit);
              }}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {isEditingLimit ? 'Cancel' : 'Edit'}
            </button>
          </div>
          {isEditingLimit ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="number"
                value={limitInput}
                onChange={(e) => setLimitInput(e.target.value)}
                className="w-28 text-sm font-bold border border-blue-300 rounded-lg px-2 py-1"
              />
              <button
                onClick={() => {
                  const val = parseFloat(limitInput) || 25000;
                  onUpdateMonthlyLimit(val);
                  setIsEditingLimit(false);
                }}
                className="p-1 rounded-lg bg-blue-600 text-white"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-2xl font-extrabold text-slate-800 mt-1 block">
              {currencyConfig.format(monthlyLimit)}
            </span>
          )}
          <span className="text-xs text-slate-400 mt-0.5 block">Monthly spend cap</span>
        </div>

        {/* Remaining Budget */}
        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            remainingBudget >= 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50 border-rose-300'
          }`}
        >
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">
            Remaining Budget
          </span>
          <span
            className={`text-2xl font-extrabold mt-1 block ${
              remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {currencyConfig.format(remainingBudget)}
          </span>
          <span className="text-xs font-semibold mt-0.5 block">
            {remainingBudget >= 0 ? `${(100 - percentUsed).toFixed(1)}% remaining` : 'Over budget!'}
          </span>
        </div>

        {/* Action Card */}
        <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white p-5 rounded-2xl shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
              Smart Actions
            </span>
            <span className="text-sm font-bold mt-1 block text-sky-100">
              Need budget guidance?
            </span>
          </div>
          <button
            onClick={handleAskAIToAnalyze}
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 px-3 rounded-xl bg-white text-blue-800 font-bold text-xs hover:bg-blue-50 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Analyze Spending with AI
          </button>
        </div>
      </div>

      {/* Add / Edit Expense Modal / Form */}
      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-blue-200 p-5 shadow-md">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-blue-600" />
              {editingId ? 'Edit Expense Entry' : 'Log New Expense'}
            </h3>
            <button
              onClick={() => {
                setIsFormOpen(false);
                setEditingId(null);
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Expense Name</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. D-Mart Groceries"
                className="w-full px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-bold text-sm">
                  {currencyConfig.symbol}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="500"
                  className="w-full pl-8 pr-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm font-medium rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
              >
                {editingId ? 'Update' : 'Save Expense'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingId(null);
                }}
                className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expense History Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {/* Controls Bar: Search, Category Filter, Add Button */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search expense name or payment..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 bg-white focus:border-blue-500 focus:outline-hidden"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest">Highest Amount</option>
                <option value="lowest">Lowest Amount</option>
              </select>
            </div>
          </div>

          {!isFormOpen && (
            <button
              onClick={() => {
                setEditingId(null);
                setTitle('');
                setAmount('');
                setDate(new Date().toISOString().split('T')[0]);
                setIsFormOpen(true);
              }}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          )}
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 px-4">
              <ReceiptText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No expenses found</p>
              <p className="text-xs text-slate-400 mt-1">
                {searchQuery || selectedCategory !== 'All'
                  ? 'Try adjusting your search or category filters.'
                  : 'Start by clicking "Add Expense" to track your first purchase.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 sm:px-6">Expense Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((item) => {
                  const catMeta = CATEGORIES.find((c) => c.id === item.category);
                  return (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="py-3 px-4 sm:px-6 font-semibold text-slate-800">
                        {item.title}
                        {item.paymentMethod && (
                          <span className="block text-[11px] text-slate-400 font-normal">
                            via {item.paymentMethod}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: catMeta ? `${catMeta.color}15` : '#f1f5f9',
                            color: catMeta ? catMeta.color : '#475569',
                          }}
                        >
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {new Date(item.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3 px-4 font-bold text-blue-900 whitespace-nowrap">
                        {currencyConfig.format(item.amount)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(item)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete expense "${item.title}"?`)) {
                                onDeleteExpense(item.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
