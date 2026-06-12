import { useEffect, useState } from 'react'

const CACHE_KEY = 'stuttgart-tipps'

export default function Stuttgart() {
  const [tips, setTips] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || 'null')
      if (cached && cached.day === new Date().toISOString().slice(0, 10)) {
        setTips(cached.tips)
      }
    } catch {
      /* Cache ignorieren */
    }
  }, [])

  async function fetchTips() {
    setBusy(true)
    setErr('')
    try {
      const res = await fetch('/api/stuttgart')
      if (!res.ok) throw new Error(`Status ${res.status}`)
      const data = await res.json()
      setTips(data.tips)
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ day: new Date().toISOString().slice(0, 10), tips: data.tips })
      )
    } catch (e) {
      setErr(
        'Die Tipps konnten nicht geladen werden. Lokal im Dev Modus funktioniert das erst über vercel dev oder nach dem Deployment, und auf Vercel muss der ANTHROPIC_API_KEY hinterlegt sein.'
      )
    }
    setBusy(false)
  }

  return (
    <div>
      <h2 className="tab-title">Stuttgart</h2>
      <p className="tab-sub">Was diese Woche in der Stadt los ist</p>

      <button className="btn btn-wide" onClick={fetchTips} disabled={busy}>
        {busy ? 'Tipps werden gesucht …' : tips ? 'Neu laden' : 'Tipps fürs Wochenende holen'}
      </button>

      {err && <div className="error-text" style={{ marginTop: 12 }}>{err}</div>}

      {tips && (
        <div style={{ marginTop: 18 }}>
          {tips.map((t, i) => (
            <div key={i} className="card tip-card">
              <h3>{t.title}</h3>
              <div className="tip-when">
                {t.when}
                {t.place ? ` · ${t.place}` : ''}
              </div>
              <p>{t.description}</p>
              {t.url && (
                <a href={t.url} target="_blank" rel="noreferrer">
                  Mehr erfahren
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {!tips && !busy && !err && (
        <div className="empty-state">
          Ein Klick und die App sucht aktuelle Veranstaltungen, Märkte, Konzerte und Ausflugstipps
          für Stuttgart und Umgebung heraus.
        </div>
      )}
    </div>
  )
}
