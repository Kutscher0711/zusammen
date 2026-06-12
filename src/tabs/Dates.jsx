import { useState } from 'react'
import { supabase, personName, bothGradient } from '../supabase'
import { useTable } from '../hooks'

const CATEGORIES = ['Essen gehen', 'Ausflug', 'Film und Serie', 'Zuhause', 'Sonstiges']

export default function Dates({ me, profiles }) {
  const { rows } = useTable('date_ideas')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])
  const [drawn, setDrawn] = useState(null)

  const open = rows.filter((r) => !r.done)
  const done = rows.filter((r) => r.done)

  async function add() {
    const value = title.trim()
    if (!value) return
    setTitle('')
    await supabase.from('date_ideas').insert({ title: value, category, created_by: me.id })
  }

  function draw() {
    if (open.length === 0) return
    const pick = open[Math.floor(Math.random() * open.length)]
    setDrawn(pick)
  }

  async function markDone(idea) {
    await supabase.from('date_ideas').update({ done: true }).eq('id', idea.id)
    setDrawn(null)
  }

  async function remove(idea) {
    await supabase.from('date_ideas').delete().eq('id', idea.id)
    if (drawn && drawn.id === idea.id) setDrawn(null)
  }

  return (
    <div>
      <h2 className="tab-title">Date Ideen</h2>
      <p className="tab-sub">Euer Vorrat gegen Unentschlossenheit</p>

      {drawn && (
        <div className="draw-card" style={{ background: bothGradient(profiles) }}>
          <div className="draw-label">Heute macht ihr</div>
          <h3>{drawn.title}</h3>
          <p>
            {drawn.category} · Idee von {personName(profiles, drawn.created_by)}
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button
              className="btn"
              style={{ background: 'rgba(255,255,255,0.25)' }}
              onClick={() => markDone(drawn)}
            >
              Gemacht
            </button>
            <button
              className="btn"
              style={{ background: 'rgba(255,255,255,0.25)' }}
              onClick={draw}
            >
              Nochmal ziehen
            </button>
          </div>
        </div>
      )}

      <button className="btn btn-wide" onClick={draw} disabled={open.length === 0}>
        Überrasch uns
      </button>

      <div className="add-form" style={{ marginTop: 16 }}>
        <input
          placeholder="Neue Idee"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn" onClick={add} disabled={!title.trim()}>
          Merken
        </button>
      </div>
      <div className="chip-row">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`chip ${category === c ? 'active' : ''}`}
            style={category === c ? { background: me.color } : {}}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {CATEGORIES.map((c) => {
        const items = open.filter((r) => r.category === c)
        if (items.length === 0) return null
        return (
          <div key={c}>
            <div className="section-label">{c}</div>
            {items.map((idea) => (
              <div key={idea.id} className="item-row">
                <div style={{ flex: 1 }}>
                  <div className="item-name">{idea.title}</div>
                  <div className="item-meta">von {personName(profiles, idea.created_by)}</div>
                </div>
                <button className="item-delete" onClick={() => remove(idea)} aria-label="Löschen">
                  ✕
                </button>
              </div>
            ))}
          </div>
        )
      })}

      {open.length === 0 && (
        <div className="empty-state">
          Noch keine Ideen gesammelt. Schreibt alles auf, was ihr irgendwann mal machen wollt, und
          lasst euch dann überraschen.
        </div>
      )}

      {done.length > 0 && (
        <>
          <div className="section-label">Schon gemacht ({done.length})</div>
          {done.map((idea) => (
            <div key={idea.id} className="item-row done">
              <div className="item-name">{idea.title}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
