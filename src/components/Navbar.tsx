import React from 'react';
import {
  Wallet,
  Sparkles,
  Calculator,
  ReceiptText,
  Target,
  PieChart,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { CurrencyCode, CURRENCIES } from '../types';

interface NavbarProps {
  activeTab: 'chat' | 'calculator' | 'expenses' | 'goals' | 'analytics';
  setActiveTab: (tab: 'chat' | 'calculator' | 'expenses' | 'goals' | 'analytics') => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  onDownloadZip: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onDownloadZip,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Tagline */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('chat')}
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-900 via-blue-700 to-sky-600 bg-clip-text text-transparent tracking-tight">
                  BudgetBuddy
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                  💙 AI
                </span>
              </div>
              <p className="hidden md:block text-xs font-medium text-slate-500 tracking-wide">
                Plan Smarter. Spend Better. Save with Confidence.
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'calculator'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white/60'
              }`}
            >
              <Calculator className="w-4 h-4" />
              Budget Calculator
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'expenses'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white/60'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              Expense Tracker
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'goals'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white/60'
              }`}
            >
              <Target className="w-4 h-4" />
              Savings Goals
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-600 hover:text-blue-700 hover:bg-white/60'
              }`}
            >
              <PieChart className="w-4 h-4" />
              Spending Analysis
            </button>
          </nav>

          {/* Right Actions: Currency Selector, Download ZIP & Privacy Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Download Project ZIP Button */}
            <button
              onClick={onDownloadZip}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold transition-all"
              title="Download full project folder as a ZIP file"
            >
              <Download className="w-3.5 h-3.5 text-blue-600" />
              <span>Project ZIP</span>
            </button>

            {/* Currency Selector */}
            <div className="relative">
              <label htmlFor="currency-select" className="sr-only">
                Select Currency
              </label>
              <select
                id="currency-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="bg-blue-50 border border-blue-200 text-blue-900 text-xs sm:text-sm font-bold rounded-xl px-2.5 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer hover:bg-blue-100/80 transition-colors"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code} className="font-semibold text-slate-800">
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Private & Local</span>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2 border-t border-slate-100 gap-1 no-scrollbar">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              activeTab === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Chat
          </button>
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              activeTab === 'calculator' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            Calculator
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              activeTab === 'expenses' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ReceiptText className="w-3.5 h-3.5" />
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              activeTab === 'goals' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Goals
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all ${
              activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            Analytics
          </button>
        </div>
      </div>
    </header>
  );
};
