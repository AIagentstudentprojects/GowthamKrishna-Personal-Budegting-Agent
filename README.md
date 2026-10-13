# BudgetBuddy 💙 — AI Personal Budgeting Assistant

> **"Plan Smarter. Spend Better. Save with Confidence."**

BudgetBuddy is a full-stack personal budgeting web application built with **React**, **TypeScript**, **Tailwind CSS**, and **Google AI Studio (Gemini 3.8 Flash)**. It is purpose-built to help users plan monthly budgets, track daily expenditures, set achievable savings goals, and gain clear visibility into cash flow.

---

## 🌟 Key Features

1. **AI Chat Assistant (Strict Scope Enforced)**
   - Exclusively answers budgeting, expense tracking, savings plans, student/household budgets, and money management questions.
   - Built-in guardrails strictly reject non-budgeting topics (coding, trivia, sports, weather, entertainment) with a polite, consistent refusal message.
   - 6 Quick-Action workflows: *Create a Budget*, *Track Expenses*, *Build a Savings Plan*, *Analyze Spending*, *Student Budget*, *Monthly Budget*.
   - Copy responses, auto-scroll, timestamps, and typing indicators.

2. **Monthly Budget Calculator**
   - Income & expense inputs across 9 standard categories (*Housing, Food, Commute, Education, Bills, Entertainment, Shopping, Debt, Other*).
   - Real-time calculations: Total Expenses, Remaining Surplus/Deficit, Planned Savings, Percentage Spent, and Percentage Saved.
   - Validation against invalid negative values.
   - Currency switcher supporting **₹ INR (Indian Rupee)**, **$ USD**, **€ EUR**, **£ GBP**, **CA$**, and **A$**.
   - Example 30k/20k preset and student budget presets.

3. **Expense Tracker**
   - Add, edit, and delete transactions with category tags, payment methods, and dates.
   - Search by keyword, filter by category, and sort by date or amount.
   - Set monthly spending limit and monitor remaining budget in real time.
   - Export to CSV or JSON backup, and restore from JSON.
   - Private client-side `localStorage` persistence.

4. **Savings Goals**
   - Define targets, current savings, and target deadlines.
   - Calculates remaining balance and estimated monthly contribution needed to reach each milestone.
   - Quick deposit buttons (`+₹500`, `+₹1,000`, custom) and completed goal celebration badges.

5. **Spending Analysis & Visual Breakdown**
   - Clean SVG Donut Chart displaying category distribution.
   - Ranked expense list highlighting top spending drivers.
   - Optional **50/30/20 guideline comparison** (*Needs vs Wants vs Savings*) with clear assumptions.

6. **Instant Full Project ZIP Download**
   - Download the clean, full project source code as a ZIP archive directly from the navigation bar (`Project ZIP` button) or `/api/download-zip`.

6. **Financial Privacy & Safety**
   - General educational budgeting guidance, not certified financial advice.
   - Zero sensitive credentials: never asks for bank passwords or card numbers.

---

## 🛠️ Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion
- **Backend / AI Integration:** Express 4, Node.js (`tsx`), `@google/genai` (Gemini 3.8 Flash)
- **Tooling:** Vite 8

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ installed
- A Google Gemini API key from Google AI Studio

### Local Setup

1. **Clone or navigate to the repository:**
   ```bash
   cd budgetbuddy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   GEMINI_API_KEY="your-gemini-api-key-here"
   PORT=3000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔒 Security & Deployment Architecture

### Private API Key Handling
- Static hosting providers (like GitHub Pages) **cannot** safely protect private API keys, as client-side code bundles expose variables to any user inspecting network traffic.
- BudgetBuddy enforces **server-side AI proxying** through `server.ts` (`/api/chat`). The `GEMINI_API_KEY` is loaded exclusively in the Node.js backend environment and never leaked to the browser bundle.

### Production Build & Hosting
To build and run in production (e.g. Cloud Run, Render, Railway, AWS ECS):
```bash
npm run build
npm start
```

---

## 🧪 Testing Checklist

### 1. Budgeting Questions (Expected: Helpful, structured responses)
- "Create a monthly budget."
- "Help me save ₹20,000."
- "Analyze my expenses."
- "Make a student budget."
- "How much should I spend on food?"

### 2. Disallowed Questions (Expected: Strict refusal response)
- "Write Python code."
- "Tell me a joke."
- "Explain operating systems."
- "Who won the cricket match?"
- "What is the weather today?"

*Fixed Refusal Output:*
> *"I'm BudgetBuddy 💙, your personal budgeting assistant. I can help with budgets, expenses, savings plans, spending analysis, and money-management topics. Please ask me something related to budgeting."*
