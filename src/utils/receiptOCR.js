// src/utils/receiptOCR.js
// Extracts transaction details from receipt images using AI vision

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GROQ_KEY   = import.meta.env.VITE_GROQ_API_KEY

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const PROMPT = `Analyze this receipt/bill image and extract the following information in JSON format:
{
  "title": "short description of the purchase (e.g. Grocery Shopping, Dinner, Coffee)",
  "amount": 123.45,
  "category": "one of: Food, Transport, Shopping, Entertainment, Health, Education, Bills, Rent, Other",
  "date": "YYYY-MM-DD or null if not visible",
  "notes": "any additional details like store name"
}
Return ONLY the JSON object, no markdown, no explanation.`

async function extractWithGemini(base64, mimeType) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: PROMPT },
          { inlineData: { mimeType, data: base64 } }
        ]
      }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
    }),
  })
  if (!res.ok) throw new Error('Gemini Vision API error')
  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

async function extractWithGroq(base64, mimeType) {
  const url = 'https://api.groq.com/openai/v1/chat/completions'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.2-11b-vision-preview',
      max_tokens: 512,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: PROMPT },
            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
          ]
        }
      ],
    }),
  })
  if (!res.ok) throw new Error('Groq Vision API error')
  const data = await res.json()
  return data.choices?.[0]?.message?.content?.trim() ?? ''
}

export async function extractReceiptData(file) {
  const base64 = await fileToBase64(file)
  const mimeType = file.type || 'image/jpeg'

  let raw = ''
  if (GEMINI_KEY && GEMINI_KEY !== 'PASTE_YOUR_GEMINI_KEY_HERE') {
    raw = await extractWithGemini(base64, mimeType)
  } else if (GROQ_KEY && GROQ_KEY !== 'PASTE_YOUR_GROQ_KEY_HERE') {
    raw = await extractWithGroq(base64, mimeType)
  } else {
    throw new Error('No AI API key configured for receipt scanning')
  }

  // Parse JSON from response (may be wrapped in ```json ... ```)
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('Could not parse receipt data')

  const parsed = JSON.parse(jsonMatch[0])
  return {
    title:    typeof parsed.title === 'string' ? parsed.title : '',
    amount:   typeof parsed.amount === 'number' ? parsed.amount : parseFloat(parsed.amount) || 0,
    category: typeof parsed.category === 'string' ? parsed.category : 'Other',
    date:     typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date) ? parsed.date : null,
    notes:    typeof parsed.notes === 'string' ? parsed.notes : '',
  }
}
