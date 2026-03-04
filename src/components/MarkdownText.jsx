// Simple inline markdown renderer (no dependency needed)
// Supports: **bold**, bullet points, numbered lists, headers, line breaks

export default function MarkdownText({ text = '', className = '' }) {
  if (!text) return null

  const lines = text.split('\n')

  const renderLine = (line, i) => {
    // Blank line
    if (!line.trim()) return <div key={i} className="h-2" />

    // Headers (## or ###)
    if (/^###\s/.test(line)) {
      return <p key={i} className="font-bold text-sm mt-3 mb-1 text-gray-800 dark:text-gray-200">{inline(line.replace(/^###\s/, ''))}</p>
    }
    if (/^##\s/.test(line)) {
      return <p key={i} className="font-bold text-base mt-4 mb-1 text-gray-900 dark:text-gray-100">{inline(line.replace(/^##\s/, ''))}</p>
    }
    if (/^#\s/.test(line)) {
      return <p key={i} className="font-extrabold text-lg mt-4 mb-2">{inline(line.replace(/^#\s/, ''))}</p>
    }

    // Bullet with emoji (starts with emoji then space)
    if (/^[🟢🟡🔴💡🎯⚠️📊🏆💬✅❌➡️•·–—]\s/.test(line) || /^[-*]\s/.test(line)) {
      const content = line.replace(/^[-*]\s/, '')
      return (
        <div key={i} className="flex gap-2 my-1">
          <span className="shrink-0 mt-0.5">
            {/^[-*]\s/.test(line) ? '•' : line.charAt(0)}
          </span>
          <span>{inline(/^[-*]\s/.test(line) ? content : line.slice(2))}</span>
        </div>
      )
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      const [num, ...rest] = line.split(/\.\s/)
      return (
        <div key={i} className="flex gap-2 my-1">
          <span className="shrink-0 font-semibold text-primary-500">{num}.</span>
          <span>{inline(rest.join('. '))}</span>
        </div>
      )
    }

    return <p key={i} className="my-0.5">{inline(line)}</p>
  }

  return (
    <div className={`text-sm leading-relaxed text-gray-700 dark:text-gray-300 ${className}`}>
      {lines.map((line, i) => renderLine(line, i))}
    </div>
  )
}

// Inline: **bold** and *italic*
function inline(text) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/)
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**'))
      return <strong key={i} className="font-semibold text-gray-900 dark:text-gray-100">{p.slice(2, -2)}</strong>
    if (p.startsWith('*') && p.endsWith('*'))
      return <em key={i}>{p.slice(1, -1)}</em>
    return p
  })
}
