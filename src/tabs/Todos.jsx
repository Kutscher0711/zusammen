import { useState } from 'react'
import { supabase, personColor, personName, bothGradient } from '../supabase'
import { useTable } from '../hooks'

export default function Todos({ me, profiles }) {
  const { rows } = useTable('todos')
  const [title, setTitle] = useState('')
  const [who, setWho] = useState(me.id)
  const [due, setDue] = useState('')

  async function add() {
    const value = title.trim()
    if (!value) return
    setTitle('')
    await supabase.from('todos').insert({
      title: value,
      assigned_to: who === 'beide' ? null : who,
      due_date: due || null,
      created_by: me.id
    })
    setDue('')
  }

  async function toggle(todo) {
    await supabase.from('todos').update({ done: !todo.done }).eq('id', todo.id)
  }

  async function remove(todo) {
    await supabase.from('todos').delete().eq('id', todo.id)
  }

  async function clearDone() {
    await supabase.from('todos').delete().eq('done', true)
  }

  const open = rows.filter((r) => !r.done)
  const done = rows.filter((r) => r.done)
  const today = new Date().toISOString().slice(0, 10)

  function colorFor(t) {
    return t.assigned_to ? personColor(profiles, t.assigned_to) : bothGradient(profiles)
  }

  function dueLabel(t) {
    if (!t.due_date) return null
    const overdue = t.due_date < today
    const label = new Date(t.due_date + 'T00:00').toLocaleDateString('de-DE', {
      day: 'numeric',
      month: 'short'
    })
    return (
      <span style={overdue ? { color: '#C0394B', fontWeight: 600 } : {}}>
        {overdue ? 'überfällig · ' : 'bis '}
        {label}
      </span>
    )
  }

  return (
    <div>
      <h2 className="tab-title">To Dos</h2>
      <p className="tab-sub">Der organisatorische Kram</p>

      <div className="add-form">
        <input
          placeholder="Was muss erledigt werden?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn" onClick={add} disabled={!title.trim()}>
          Rein damit
        </button>
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
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          style={{ width: 'auto', flex: 1, minWidth: 140 }}
        />
      </div>

      {open.map((t) => (
        <div key={t.id} className="item-row" style={{ borderLeft: 'none', position: 'relative', overflow: 'hidden', paddingLeft: 18 }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: colorFor(t) }} />
          <button className="item-check" onClick={() => toggle(t)} aria-label="Abhaken" />
          <div style={{ flex: 1 }}>
            <div className="item-name">{t.title}</div>
            <div className="item-meta">
              {t.assigned_to ? personName(profiles, t.assigned_to) : 'Beide'}
              {t.due_date && <> · {dueLabel(t)}</>}
            </div>
          </div>
          <button className="item-delete" onClick={() => remove(t)} aria-label="Löschen">
            ✕
          </button>
        </div>
      ))}

      {open.length === 0 && done.length === 0 && (
        <div className="empty-state">
          Nichts zu tun. Entweder seid ihr sehr organisiert oder die Liste wartet auf ihren ersten
          Eintrag.
        </div>
      )}

      {done.length > 0 && (
        <>
          <div className="section-label">Erledigt ({done.length})</div>
          {done.map((t) => (
            <div key={t.id} className="item-row done">
              <button className="item-check checked" onClick={() => toggle(t)}>
                ✓
              </button>
              <div className="item-name">{t.title}</div>
            </div>
          ))}
          <button className="btn btn-soft btn-wide" onClick={clearDone}>
            Erledigte löschen
          </button>
        </>
      )}
    </div>
  )
}
