// src/utils/gemini.js
// Uses Google Gemini 1.5 Flash (free tier)
// Get your key at: https://aistudio.google.com/app/apikey

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`

async function ask(prompt) {
  if (!API_KEY || API_KEY === 'PASTE_YOUR_GEMINI_KEY_HERE') {
    throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to your .env file.')
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message ?? 'Gemini API error')
  }
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// ── Helper to build a transaction summary ──────────────────────────────────────
function buildTxSummary(transactions, currency = 'BDT') {
  const sym = currency === 'BDT' ? '৳' : currency
  const income  = transactions.filter(t => t.type === 'income') .reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const byCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => { acc[t.category] = (acc[t.category] ?? 0) + t.amount; return acc }, {})

  const catLines = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([c, v]) => `  - ${c}: ${sym}${v.toLocaleString()}`)
    .join('\n')

  return `
Total Income: ${sym}${income.toLocaleString()}
Total Expenses: ${sym}${expense.toLocaleString()}
Net Savings: ${sym}${(income - expense).toLocaleString()}
Expense breakdown by category:
${catLines || '  (no expenses)'}
`.trim()
}

// ── 1. Spending Insights ───────────────────────────────────────────────────────
export async function getSpendingInsights(transactions, currency = 'BDT') {
  const summary = buildTxSummary(transactions, currency)
  const prompt = `
You are a friendly personal finance advisor for a Bangladeshi user.
Analyze this month's financial data and give exactly 4 concise, actionable bullet-point insights.
Use simple language. Reference amounts in ${currency}. Mention specific categories where relevant.
Each bullet should be 1-2 sentences max. Start each bullet with a relevant emoji.

Financial Data:
${summary}

Respond with ONLY the 4 bullet points, nothing else.
`.trim()
  return ask(prompt)
}

// ── 2. Monthly Comparison Insight ─────────────────────────────────────────────
export async function getMonthlyComparison(thisMonth, lastMonth, currency = 'BDT') {
  const sym = currency === 'BDT' ? '৳' : currency
  const prompt = `
You are a friendly personal finance advisor for a Bangladeshi user.
Compare this month's spending vs last month and give a short 3-sentence summary.
Highlight what increased, what decreased, and one actionable tip. Use emojis.

This month:
${buildTxSummary(thisMonth, currency)}

Last month:
${buildTxSummary(lastMonth, currency)}

Respond with ONLY the 3-sentence comparison, no headers or bullet points.
`.trim()
  return ask(prompt)
}

// ── 3. Budget Risk Analysis ────────────────────────────────────────────────────
export async function getBudgetRisk(budgets, transactions, currency = 'BDT') {
  const sym = currency === 'BDT' ? '৳' : currency
  const lines = budgets.map(b =>
    `  - ${b.category}: limit ${sym}${b.limit.toLocaleString()}, spent ${sym}${b.spent.toLocaleString()} (${b.limit > 0 ? ((b.spent/b.limit)*100).toFixed(0) : 0}%)`
  ).join('\n')

  const prompt = `
You are a budget advisor for a Bangladeshi user.
Analyze these budget statuses and give a risk assessment in exactly 3 bullet points.
Each bullet: which category, the risk level (safe/warning/danger), and a one-line tip.
Start each bullet with 🟢 (safe), 🟡 (warning), or 🔴 (danger).

Budget Status:
${lines || '  (no budgets set)'}

Respond with ONLY the 3 bullet points.
`.trim()
  return ask(prompt)
}

// ── 4. Savings Tips ───────────────────────────────────────────────────────────
export async function getSavingsTips(transactions, currency = 'BDT') {
  const summary = buildTxSummary(transactions, currency)
  const prompt = `
You are a personal finance coach specializing in Bangladeshi household budgeting.
Based on this spending data, give 3 practical, specific money-saving tips tailored for Bangladesh.
Reference local context (local markets, rickshaw vs ride-share, etc.) where relevant.
Each tip should be 1-2 sentences. Start each with 💡.

Financial Data:
${summary}

Respond with ONLY the 3 tips, nothing else.
`.trim()
  return ask(prompt)
}

// ── 5. Smart Category Suggestion ──────────────────────────────────────────────
export async function suggestCategory(title, type = 'expense') {
  const categories = type === 'expense'
    ? ['Food', 'Rent', 'Transport', 'Health', 'Entertainment', 'Shopping', 'Education', 'Utilities', 'Travel', 'Savings', 'Other']
    : ['Salary', 'Freelance', 'Gifts', 'Investment', 'Other Income']

  const prompt = `
Given the transaction title "${title}", which single category fits best from this list?
Categories: ${categories.join(', ')}
Respond with ONLY the category name, nothing else.
`.trim()
  const result = await ask(prompt)
  const match = categories.find(c => result.trim().toLowerCase().includes(c.toLowerCase()))
  return match ?? null
}

// ── 6. Full AI Financial Report ───────────────────────────────────────────────
export async function getFullReport(transactions, budgets, currency = 'BDT') {
  const summary = buildTxSummary(transactions, currency)
  const sym = currency === 'BDT' ? '৳' : currency
  const budgetLines = budgets.length
    ? budgets.map(b => `  - ${b.category}: limit ${sym}${b.limit?.toLocaleString()}, spent ${sym}${b.spent?.toLocaleString()}`).join('\n')
    : '  No budgets set'

  const prompt = `
You are a personal finance advisor writing a monthly report for a Bangladeshi user.
Write a friendly, motivating financial health report with these sections:
1. 📊 Overall Summary (2 sentences)
2. 🏆 Good Habits (2 bullets of what they did well)
3. ⚠️ Areas to Improve (2 bullets)
4. 🎯 Goals for Next Month (2 actionable bullets)
5. 💬 Motivational Closing (1 sentence)

Financial Data:
${summary}

Budget Status:
${budgetLines}

Keep the entire report under 250 words. Use markdown formatting with the section headers shown.
`.trim()
  return ask(prompt)
}
