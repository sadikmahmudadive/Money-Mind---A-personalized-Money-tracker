// src/utils/ai.js
// Uses Groq (free) — llama-3.3-70b-versatile
// Get your free key at: https://console.groq.com/keys

const API_KEY = import.meta.env.VITE_GROQ_API_KEY
const API_URL = 'https://api.groq.com/openai/v1/chat/completions'

async function ask(prompt) {
  if (!API_KEY || API_KEY === 'PASTE_YOUR_GROQ_KEY_HERE') {
    throw new Error('Groq API key not configured. Add VITE_GROQ_API_KEY to your .env file.')
  }
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  800,
      temperature: 0.7,
      messages: [
        {
          role:    'system',
          content: 'You are a helpful personal finance advisor for Bangladeshi users. Be concise, friendly, and practical.',
        },
        { role: 'user', content: prompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message ?? 'OpenAI API error')
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() ?? ''
}

// ── Helper: build transaction summary ─────────────────────────────────────────
function buildTxSummary(transactions, currency = 'BDT') {
  const sym     = currency === 'BDT' ? '৳' : currency
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
Total Income:   ${sym}${income.toLocaleString()}
Total Expenses: ${sym}${expense.toLocaleString()}
Net Savings:    ${sym}${(income - expense).toLocaleString()}
Expense breakdown by category:
${catLines || '  (no expenses yet)'}
`.trim()
}

// ── 1. Spending Insights ───────────────────────────────────────────────────────
export async function getSpendingInsights(transactions, currency = 'BDT') {
  const summary = buildTxSummary(transactions, currency)
  return ask(`Analyze this month's financial data for a Bangladeshi user and give exactly 4 concise, actionable bullet-point insights. Use simple language, reference amounts in ${currency}, mention specific categories. Each bullet should be 1-2 sentences max. Start each with a relevant emoji.

Financial Data:
${summary}

Respond with ONLY the 4 bullet points, nothing else.`)
}

// ── 2. Monthly Comparison ─────────────────────────────────────────────────────
export async function getMonthlyComparison(thisMonth, lastMonth, currency = 'BDT') {
  return ask(`Compare this month vs last month for a Bangladeshi user. Write a short 3-sentence summary highlighting what increased, what decreased, and one actionable tip. Use emojis.

This month:
${buildTxSummary(thisMonth, currency)}

Last month:
${buildTxSummary(lastMonth, currency)}

Respond with ONLY the 3-sentence comparison, no headers or bullet points.`)
}

// ── 3. Budget Risk Analysis ────────────────────────────────────────────────────
export async function getBudgetRisk(budgets, transactions, currency = 'BDT') {
  const sym   = currency === 'BDT' ? '৳' : currency
  const lines = budgets.map(b =>
    `  - ${b.category}: limit ${sym}${b.limit?.toLocaleString()}, spent ${sym}${b.spent?.toLocaleString()} (${b.limit > 0 ? ((b.spent / b.limit) * 100).toFixed(0) : 0}%)`
  ).join('\n')

  return ask(`Analyze these budget statuses for a Bangladeshi user and give a risk assessment in exactly 3 bullet points. For each bullet: category name, risk level, and a one-line tip. Start each with 🟢 (safe, <65% used), 🟡 (warning, 65-85%), or 🔴 (danger, >85%).

Budget Status:
${lines || '  (no budgets set)'}

Respond with ONLY the bullet points.`)
}

// ── 4. Savings Tips ───────────────────────────────────────────────────────────
export async function getSavingsTips(transactions, currency = 'BDT') {
  const summary = buildTxSummary(transactions, currency)
  return ask(`Give 3 practical, specific money-saving tips for a Bangladeshi household based on this spending data. Reference local context (local markets, rickshaw vs ride-share, bazar shopping, etc.) where relevant. Each tip 1-2 sentences. Start each with 💡.

Financial Data:
${summary}

Respond with ONLY the 3 tips.`)
}

// ── 5. Smart Category Suggestion ──────────────────────────────────────────────
export async function suggestCategory(title, type = 'expense') {
  const categories = type === 'expense'
    ? ['Food', 'Rent', 'Transport', 'Health', 'Entertainment', 'Shopping', 'Education', 'Utilities', 'Travel', 'Savings', 'Other']
    : ['Salary', 'Freelance', 'Gifts', 'Investment', 'Other Income']

  const result = await ask(`Given the transaction title "${title}", which single category from this list fits best? Categories: ${categories.join(', ')}. Respond with ONLY the category name, nothing else.`)
  return categories.find(c => result.trim().toLowerCase().includes(c.toLowerCase())) ?? null
}

// ── 6. Full AI Financial Report ───────────────────────────────────────────────
export async function getFullReport(transactions, budgets, currency = 'BDT') {
  const sym         = currency === 'BDT' ? '৳' : currency
  const summary     = buildTxSummary(transactions, currency)
  const budgetLines = budgets.length
    ? budgets.map(b => `  - ${b.category}: limit ${sym}${b.limit?.toLocaleString()}, spent ${sym}${b.spent?.toLocaleString()}`).join('\n')
    : '  No budgets set'

  return ask(`Write a friendly monthly financial health report for a Bangladeshi user with these sections:
1. 📊 Overall Summary (2 sentences)
2. 🏆 Good Habits (2 bullets)
3. ⚠️ Areas to Improve (2 bullets)
4. 🎯 Goals for Next Month (2 actionable bullets)
5. 💬 Motivational Closing (1 sentence)

Financial Data:
${summary}

Budget Status:
${budgetLines}

Keep the entire report under 250 words. Use the section headers shown above.`)
}
