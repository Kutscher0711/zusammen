import { useState } from 'react'
import { supabase, personColor, personName } from '../supabase'
import { useTable } from '../hooks'

const CATEGORIES = ['Obst und Gemüse', 'Kühlregal', 'Vorrat', 'Getränke', 'Drogerie', 'Sonstiges']

export default function Einkauf({ me, profiles }) {
  const { rows } = useTable('shopping_items')
  const [name, setName] = useState('')
  const [category, setCategory] = useState(CATEGORIES[0])

  async function add() {
    const value = name.trim()
    if (!value) return
    setName('')
    await supabase.from('shopping_items').insert({ name: value, category, created_by: me.id })
  }

  async function toggle(item) {
    await supabase.from('shopping_items').update({ done: !item.done }).eq('id', item.id)
  }

  async function remove(item) {
    await supabase.from('shopping_items').delete().eq('id', item.id)
  }

  async function clearDone() {
    await supabase.from('shopping_items').delete().eq('done', true)
  }

  const open = rows.filter((r) => !r.done)
  const done = rows.filter((r) => r.done)
  const grouped = CATEGORIES.map((c) => ({
    category: c,
    items: open.filter((r) => r.category === c)
  })).filter((g) => g.items.length > 0)

  return (
    <div>
      <h2 className="tab-title">Einkaufsliste</h2>
      <p className="tab-sub">
        {open.length === 0 ? 'Alles erledigt' : `Noch ${open.length} ${open.length === 1 ? 'Artikel' : 'Artikel'} offen`}
      </p>

      <div className="add-form">
        <input
          placeholder="Was brauchen wir?"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && add()}
        />
        <button className="btn" onClick={add} disabled={!name.trim()}>
          Hinzufügen
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

      {grouped.map((g) => (
        <div key={g.category}>
          <div className="section-label">{g.category}</div>
          {g.items.map((item) => (
            <div
              key={item.id}
              className="item-row"
              style={{ borderLeftColor: personColor(profiles, item.created_by) }}
            >
              <button className="item-check" onClick={() => toggle(item)} aria-label="Abhaken" />
              <div style={{ flex: 1 }}>
                <div className="item-name">{item.name}</div>
                <div className="item-meta">von {personName(profiles, item.created_by)}</div>
              </div>
              <button className="item-delete" onClick={() => remove(item)} aria-label="Löschen">
                ✕
              </button>
            </div>
          ))}
        </div>
      ))}

      {open.length === 0 && done.length === 0 && (
        <div className="empty-state">
          Die Liste ist leer. Schreib oben rein, was ihr braucht, und es taucht sofort auch beim
          anderen auf.
        </div>
      )}

      {done.length > 0 && (
        <>
          <div className="section-label">Im Wagen ({done.length})</div>
          {done.map((item) => (
            <div key={item.id} className="item-row done">
              <button className="item-check checked" onClick={() => toggle(item)}>
                ✓
              </button>
              <div className="item-name">{item.name}</div>
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
