export default async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY ist nicht gesetzt' })
  }

  const today = new Date().toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
        messages: [
          {
            role: 'user',
            content: `Heute ist ${today}. Suche im Web nach aktuellen Veranstaltungen, Konzerten, Maerkten, Festen und Ausflugstipps in Stuttgart und Umgebung fuer die kommenden sieben Tage. Waehle die sechs interessantesten fuer ein Paar Anfang dreissig aus. Antworte ausschliesslich mit einem JSON Objekt ohne Markdown, ohne Backticks und ohne weiteren Text, im Format {"tips": [{"title": "...", "when": "...", "place": "...", "description": "...", "url": "..."}]}. Die Beschreibung soll ein bis zwei kurze deutsche Saetze umfassen.`
          }
        ]
      })
    })

    const data = await response.json()

    if (!response.ok) {
      return res.status(502).json({ error: data.error?.message || 'Anthropic API Fehler' })
    }

    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n')

    const cleaned = text.replace(/```json|```/g, '').trim()
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    const parsed = JSON.parse(cleaned.slice(start, end + 1))

    res.setHeader('Cache-Control', 's-maxage=21600')
    return res.status(200).json(parsed)
  } catch (e) {
    return res.status(500).json({ error: 'Antwort konnte nicht verarbeitet werden' })
  }
}
