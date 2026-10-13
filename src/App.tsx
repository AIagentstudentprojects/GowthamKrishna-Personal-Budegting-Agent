import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { ChatAssistant } from './components/ChatAssistant';
import { BudgetCalculator } from './components/BudgetCalculator';
import { ExpenseTracker } from './components/ExpenseTracker';
import { SavingsGoals } from './components/SavingsGoals';
import { SpendingAnalysis } from './components/SpendingAnalysis';
import {
  CurrencyCode,
  ChatMessage,
  ExpenseItem,
  SavingsGoal,
  BudgetCalculatorData,
} from './types';
import {
  getStoredCurrency,
  setStoredCurrency,
  getStoredExpenses,
  setStoredExpenses,
  getStoredGoals,
  setStoredGoals,
  getStoredCalculator,
  setStoredCalculator,
  getStoredMonthlyLimit,
  setStoredMonthlyLimit,
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'calculator' | 'expenses' | 'goals' | 'analytics'>('chat');
  const [currency, setCurrency] = useState<CurrencyCode>(getStoredCurrency);
  const [downloadToast, setDownloadToast] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>(getStoredExpenses);
  const [goals, setGoals] = useState<SavingsGoal[]>(getStoredGoals);
  const [calculatorData, setCalculatorData] = useState<BudgetCalculatorData>(getStoredCalculator);
  const [monthlyLimit, setMonthlyLimit] = useState<number>(getStoredMonthlyLimit);

  // Sync state changes with localStorage
  useEffect(() => {
    setStoredCurrency(currency);
  }, [currency]);

  useEffect(() => {
    setStoredExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    setStoredGoals(goals);
  }, [goals]);

  useEffect(() => {
    setStoredCalculator(calculatorData);
  }, [calculatorData]);

  useEffect(() => {
    setStoredMonthlyLimit(monthlyLimit);
  }, [monthlyLimit]);

  // Download project ZIP file
  const handleDownloadZip = () => {
    setDownloadToast(true);
    setTimeout(() => setDownloadToast(false), 4000);

    const link = document.createElement('a');
    link.href = '/api/download-zip';
    link.download = 'budgetbuddy-project.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handlers for Expenses
  const handleAddExpense = (expense: Omit<ExpenseItem, 'id'>) => {
    const newItem: ExpenseItem = {
      ...expense,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setExpenses((prev) => [newItem, ...prev]);
  };

  const handleEditExpense = (id: string, updated: Partial<ExpenseItem>) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
    );
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const handleImportExpenses = (imported: ExpenseItem[]) => {
    setExpenses(imported);
  };

  // Handlers for Goals
  const handleAddGoal = (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `goal-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setGoals((prev) => [...prev, newGoal]);
  };

  const handleUpdateGoalAmount = (id: string, newAmount: number) => {
    setGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, currentAmount: newAmount } : g))
    );
  };

  const handleDeleteGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
  };

  // Cross-component AI trigger
  const handleAskAIWithPrompt = async (prompt: string) => {
    setActiveTab('chat');
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
          contextData: {
            currency,
            income: calculatorData.primaryIncome + calculatorData.secondaryIncome,
            totalExpenses: Object.values(calculatorData.expenses).reduce((a, b) => a + b, 0),
          },
        }),
      });

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: data.reply || "I'm ready to help you optimize this budget.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOffTopic: data.isOffTopic,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-blue-500 selection:text-white">
      {/* Download Notification Toast */}
      {downloadToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-blue-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-blue-700 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-xs">
            ZIP
          </div>
          <div>
            <p className="text-xs font-bold">Downloading Project Folder</p>
            <p className="text-[11px] text-blue-200">budgetbuddy-project.zip is being downloaded.</p>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        onDownloadZip={handleDownloadZip}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {activeTab === 'chat' && (
          <ChatAssistant
            messages={messages}
            setMessages={setMessages}
            currency={currency}
            onNavigateTab={setActiveTab}
            calculatorData={calculatorData}
            expenses={expenses}
            goals={goals}
          />
        )}

        {activeTab === 'calculator' && (
          <BudgetCalculator
            data={calculatorData}
            onChange={setCalculatorData}
            currency={currency}
            onAskAI={handleAskAIWithPrompt}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpenseTracker
            expenses={expenses}
            onAddExpense={handleAddExpense}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onImportExpenses={handleImportExpenses}
            currency={currency}
            monthlyLimit={monthlyLimit}
            onUpdateMonthlyLimit={setMonthlyLimit}
            onAskAI={handleAskAIWithPrompt}
          />
        )}

        {activeTab === 'goals' && (
          <SavingsGoals
            goals={goals}
            onAddGoal={handleAddGoal}
            onUpdateGoalAmount={handleUpdateGoalAmount}
            onDeleteGoal={handleDeleteGoal}
            currency={currency}
            onAskAI={handleAskAIWithPrompt}
          />
        )}

        {activeTab === 'analytics' && (
          <SpendingAnalysis
            expenses={expenses}
            calculatorData={calculatorData}
            currency={currency}
            onAskAI={handleAskAIWithPrompt}
          />
        )}
      </main>

      {/* Educational & Financial Safety Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 px-4 text-center text-xs text-slate-400 mt-auto">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className="flex items-center justify-center gap-3">
            <span className="font-semibold text-slate-600">
              BudgetBuddy — Plan Smarter. Spend Better. Save with Confidence.
            </span>
            <button
              onClick={handleDownloadZip}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Download Full Source ZIP
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400 max-w-2xl mx-auto">
            Educational budgeting tool. BudgetBuddy does not ask for bank passwords, account credentials, or credit card numbers. No login required—all expense and goal entries remain private in your browser's local storage. Not certified financial advice.
          </p>
          <p className="text-[10px] text-slate-300">
            100% Private Client-Side Storage • Strict AI Scope Enforced • Powered by Google AI Studio
          </p>
        </div>
      </footer>
    </div>
  );
}
