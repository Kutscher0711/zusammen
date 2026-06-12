import { useState } from 'react'
import { supabase, personColor, personName, bothGradient } from '../supabase'
import { useTable } from '../hooks'

function fmtDate(d) {
  return new Date(d + 'T00:00').toLocaleDateString('de-DE', {
    weekday: 'short',
    day: 'numeric',
    month: 'long'
  })
}

export default function Termine({ me, profiles }) {
  const { rows } = useTable('events', { column: 'date', ascending: true })
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [who, setWho] = useState('beide')
  const [showForm, setShowForm] = useState(false)

  async function add() {
    if (!title.trim() || !date) return
    await supabase.from('events').insert({
      title: title.trim(),
      date,
      time: time || null,
      assigned_to: who === 'beide' ? null : who,
      created_by: me.id
    })
    setTitle('')
    setDate('')
    setTime('')
    setShowForm(false)
  }

  async function remove(ev) {
    if (window.confirm('Termin löschen?')) {
      await supabase.from('events').delete().eq('id', ev.id)
    }
  }

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = rows.filter((r) => r.date >= today)
  const dates = [...new Set(upcoming.map((r) => r.date))]

  function colorFor(ev) {
    return ev.assigned_to ? personColor(profiles, ev.assigned_to) : bothGradient(profiles)
  }

  return (
    <div>
      <h2 className="tab-title">Termine</h2>
      <p className="tab-sub">Was bei uns ansteht</p>

      {!showForm && (
        <button className="btn btn-wide" onClick={() => setShowForm(true)}>
          Neuer Termin
        </button>
      )}

      {showForm && (
        <div className="card">
          <input
            placeholder="Was steht an?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ marginBottom: 8 }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <div className="chip-row">
            {profiles.map((p) => (
              <button
                key={p.id}
                className={`chip ${who === p.id ? 'active' : ''}`}
                style={who === p.id ? { background: p.color } : {}}
                onClick={() => setWho(p.id)}
              >
                {p.name}
              </button>
            ))}
            <button
              className={`chip ${who === 'beide' ? 'active' : ''}`}
              style={who === 'beide' ? { background: bothGradient(profiles) } : {}}
              onClick={() => setWho('beide')}
            >
              Beide
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" style={{ flex: 1 }} onClick={add} disabled={!title.trim() || !date}>
              Speichern
            </button>
            <button className="btn btn-soft" onClick={() => setShowForm(false)}>
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {dates.map((d) => (
        <div key={d}>
          <div className="section-label">{fmtDate(d)}</div>
          {upcoming
            .filter((r) => r.date === d)
            .map((ev) => (
              <div key={ev.id} className="item-row" style={{ borderLeft: 'none', position: 'relative', overflow: 'hidden', paddingLeft: 18 }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: colorFor(ev) }} />
                <div style={{ flex: 1 }}>
                  <div className="item-name">{ev.title}</div>
                  <div className="item-meta">
                    {ev.time ? `${ev.time.slice(0, 5)} Uhr · ` : ''}
                    {ev.assigned_to ? personName(profiles, ev.assigned_to) : 'Beide'}
                  </div>
                </div>
                <button className="item-delete" onClick={() => remove(ev)} aria-label="Löschen">
                  ✕
                </button>
              </div>
            ))}
        </div>
      ))}

      {upcoming.length === 0 && (
        <div className="empty-state">
          Noch keine Termine. Legt euren ersten gemeinsamen Termin an, vom Zahnarzt bis zum
          Kurzurlaub.
        </div>
      )}
    </div>
  )
}
