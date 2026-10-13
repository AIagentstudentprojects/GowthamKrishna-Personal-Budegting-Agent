import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  ArrowRight,
  Calculator,
  ReceiptText,
  Target,
  PieChart,
  GraduationCap,
  CalendarDays,
  ShieldAlert,
  HelpCircle,
} from 'lucide-react';
import { ChatMessage, CurrencyCode, CURRENCIES, BudgetCalculatorData, ExpenseItem, SavingsGoal } from '../types';

interface ChatAssistantProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  currency: CurrencyCode;
  onNavigateTab: (tab: 'calculator' | 'expenses' | 'goals' | 'analytics') => void;
  calculatorData: BudgetCalculatorData;
  expenses: ExpenseItem[];
  goals: SavingsGoal[];
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({
  messages,
  setMessages,
  currency,
  onNavigateTab,
  calculatorData,
  expenses,
  goals,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currencyConfig = CURRENCIES[currency];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Adjust textarea height automatically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      setMessages([]);
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Calculate current user finances to pass as context
      const totalExpenses = Object.values(calculatorData.expenses).reduce((a, b) => a + b, 0);
      const loggedExpensesTotal = expenses.reduce((a, b) => a + b.amount, 0);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
          contextData: {
            currency: currencyConfig.symbol,
            currencyCode: currency,
            income: calculatorData.primaryIncome + calculatorData.secondaryIncome,
            totalExpenses: totalExpenses || loggedExpensesTotal,
            goals: goals.map((g) => ({ name: g.name, target: g.targetAmount, current: g.currentAmount })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Server returned an error');
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        role: 'assistant',
        content: data.reply || "I'm here to help with your budget. Please ask me a question about your personal finances.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOffTopic: data.isOffTopic,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content:
          "I'm temporarily having trouble connecting to the network. Don't worry, your local budget data is safe. Please check your connection and ask again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // 6 Quick Action Cards specified in the prompt
  const quickActions = [
    {
      title: 'Create a Budget',
      description: 'Build a personalized monthly spending & savings plan',
      icon: Calculator,
      color: 'from-blue-600 to-indigo-600',
      action: () => sendMessage('Create a monthly budget.'),
    },
    {
      title: 'Track Expenses',
      description: 'Log daily purchases and monitor category limits',
      icon: ReceiptText,
      color: 'from-sky-600 to-blue-600',
      action: () => onNavigateTab('expenses'),
    },
    {
      title: 'Build a Savings Plan',
      description: `Set a target like ${currencyConfig.symbol}20,000 and calculate monthly milestones`,
      icon: Target,
      color: 'from-blue-700 to-cyan-600',
      action: () => sendMessage(`Help me save ${currencyConfig.symbol}20,000.`),
    },
    {
      title: 'Analyze Spending',
      description: 'Examine your habits and identify leakages',
      icon: PieChart,
      color: 'from-indigo-600 to-blue-700',
      action: () => sendMessage('Analyze my expenses.'),
    },
    {
      title: 'Student Budget',
      description: 'Tailor a budget for college, pocket money & shared rent',
      icon: GraduationCap,
      color: 'from-blue-600 to-sky-700',
      action: () => sendMessage('Make a student budget.'),
    },
    {
      title: 'Monthly Budget',
      description: 'Calculate essential bills, discretionary funds & emergency pool',
      icon: CalendarDays,
      color: 'from-cyan-600 to-blue-800',
      action: () => sendMessage(`Help me build a monthly budget with my income of ${currencyConfig.symbol}${calculatorData.primaryIncome}.`),
    },
  ];

  // Verified prompt testing suggestions
  const budgetPromptChips = [
    'Create a monthly budget.',
    `Help me save ${currencyConfig.symbol}20,000.`,
    'Analyze my expenses.',
    'Make a student budget.',
    'How much should I spend on food?',
    'What is the 50/30/20 budget rule?',
  ];

  const offTopicTestChips = [
    'Write Python code.',
    'Tell me a joke.',
    'Explain operating systems.',
    'Who won the cricket match?',
    'What is the weather today?',
  ];

  // Helper to format assistant markdown response
  const formatResponse = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base sm:text-lg font-bold text-blue-950 mt-3 mb-1.5 flex items-center gap-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={idx} className="text-lg sm:text-xl font-bold text-blue-900 mt-4 mb-2">
            {line.replace('## ', '')}
          </h2>
        );
      }
      // Bullet items
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-700 my-1 leading-relaxed">
            {renderInlineMarkdown(content)}
          </li>
        );
      }
      // Numbered lists e.g. "1. "
      if (/^\d+\.\s/.test(line)) {
        return (
          <div key={idx} className="ml-2 font-medium text-slate-800 my-1.5 leading-relaxed">
            {renderInlineMarkdown(line)}
          </div>
        );
      }
      // Empty line
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }
      // Standard line
      return (
        <p key={idx} className="text-slate-700 leading-relaxed my-1">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (content: string) => {
    // Process bold text **text**
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-blue-950">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-5xl mx-auto px-3 sm:px-6 py-4">
      {/* Header Branding Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white rounded-2xl p-4 sm:p-6 shadow-md shadow-blue-950/10 mb-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">BudgetBuddy</h1>
              <span className="bg-sky-400/20 text-sky-200 border border-sky-400/30 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                AI Budgeting Assistant
              </span>
            </div>
            <p className="text-sm font-semibold text-blue-200 mt-1">
              "Your Smart Companion for Better Budgeting."
            </p>
            <p className="text-xs text-sky-100/90 mt-0.5">
              Plan smarter. Spend better. Save with confidence.
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors"
                title="Clear conversation"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Chat
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Conversation or Empty State Container */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-white border border-blue-100 shadow-xs p-4 sm:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="py-4">
            {/* Empty State Heading */}
            <div className="text-center max-w-xl mx-auto mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 mb-3 border border-blue-100">
                <Sparkles className="w-7 h-7" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                What would you like to budget today?
              </h2>
              <p className="text-sm text-slate-500 mt-1.5">
                Select a quick budgeting workflow below or ask any question about your income, expenses, and savings goals.
              </p>
            </div>

            {/* 6 Quick Action Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-8">
              {quickActions.map((qa, index) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={index}
                    onClick={qa.action}
                    className="group flex flex-col text-left p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-md hover:bg-blue-50/40 transition-all bg-slate-50/50"
                  >
                    <div className="flex items-center justify-between w-full mb-2.5">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${qa.color} text-white flex items-center justify-center shadow-xs`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                    <span className="text-sm font-bold text-slate-800 group-hover:text-blue-700">
                      {qa.title}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {qa.description}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Suggestions & Strict Scope Testing Section */}
            <div className="border-t border-slate-100 pt-6 space-y-4">
              <div>
                <p className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Popular Budgeting Inquiries:
                </p>
                <div className="flex flex-wrap gap-2">
                  {budgetPromptChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(chip)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100 hover:border-blue-300 transition-all"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* Strict Scope Test Panel */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl">
                <div className="flex items-center gap-2 mb-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-bold text-amber-900">
                    Strict Budgeting-Only Scope Verification:
                  </span>
                </div>
                <p className="text-xs text-amber-800/90 mb-2.5">
                  BudgetBuddy rejects all non-budgeting topics (coding, trivia, weather, sports, jokes) with an exact friendly refusal:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {offTopicTestChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => sendMessage(chip)}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white text-slate-700 border border-amber-300 hover:bg-amber-100 hover:text-amber-900 transition-colors"
                      title="Test off-topic guardrail"
                    >
                      Test: "{chip}"
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div
                      className={`relative rounded-2xl px-4 py-3 text-sm shadow-xs ${
                        isUser
                          ? 'bg-blue-600 text-white rounded-tr-xs'
                          : msg.isOffTopic
                          ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-xs'
                          : 'bg-slate-50 border border-blue-100 text-slate-800 rounded-tl-xs'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : (
                        <div>
                          {formatResponse(msg.content)}
                          <div className="mt-3 pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-400">
                            <span className="font-medium text-slate-500">BudgetBuddy 💙</span>
                            <button
                              onClick={() => handleCopy(msg.id, msg.content)}
                              className="flex items-center gap-1 hover:text-blue-600 transition-colors px-1.5 py-0.5 rounded-md hover:bg-white"
                              title="Copy response"
                            >
                              {copiedId === msg.id ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-600 font-semibold">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 shadow-xs mt-1">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-blue-50/70 border border-blue-100 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-xs text-blue-700 font-semibold ml-2">
                    BudgetBuddy is analyzing your finances...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggested Follow-ups (when messages exist) */}
      {messages.length > 0 && !isLoading && (
        <div className="py-2 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <span className="text-xs font-semibold text-slate-400 shrink-0">Follow-up:</span>
          {budgetPromptChips.slice(0, 4).map((chip, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(chip)}
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 shrink-0 transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Chat Input Container */}
      <div className="mt-2 bg-white rounded-2xl border border-blue-200 shadow-md p-2 sm:p-2.5 shrink-0 focus-within:ring-2 focus-within:ring-blue-500/30 transition-all">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask BudgetBuddy about your budget..."
            disabled={isLoading}
            className="flex-1 max-h-32 resize-none bg-transparent px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden leading-relaxed"
          />

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            className={`p-2.5 rounded-xl font-bold transition-all shrink-0 ${
              input.trim() && !isLoading
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 hover:bg-blue-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between px-2 pt-1.5 text-[11px] text-slate-400 border-t border-slate-100 mt-1">
          <div className="flex items-center gap-1 text-slate-500">
            <HelpCircle className="w-3 h-3 text-blue-500" />
            <span>Strict scope: Answers budgeting, expenses, savings & financial planning exclusively.</span>
          </div>
          <span className="hidden sm:inline">Enter to send • Shift+Enter for newline</span>
        </div>
      </div>
    </div>
  );
};
