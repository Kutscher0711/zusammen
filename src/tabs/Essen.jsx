import { useState } from 'react'
import { supabase } from '../supabase'
import { useTable } from '../hooks'

function mondayOf(offsetWeeks) {
  const now = new Date()
  const day = (now.getDay() + 6) % 7
  now.setDate(now.getDate() - day + offsetWeeks * 7)
  now.setHours(0, 0, 0, 0)
  return now
}

function iso(d) {
  const x = new Date(d)
  x.setMinutes(x.getMinutes() - x.getTimezoneOffset())
  return x.toISOString().slice(0, 10)
}

const DAY_NAMES = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export default function Essen({ me }) {
  const { rows } = useTable('meals', { column: 'date', ascending: true })
  const [week, setWeek] = useState(0)
  const [editDay, setEditDay] = useState(null)
  const [title, setTitle] = useState('')
  const [ingredients, setIngredients] = useState('')

  const monday = mondayOf(week)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return d
  })

  function mealFor(date) {
    return rows.find((r) => r.date === iso(date))
  }

  function startEdit(date) {
    const existing = mealFor(date)
    setEditDay(iso(date))
    setTitle(existing ? existing.title : '')
    setIngredients(existing && existing.ingredients ? existing.ingredients : '')
  }

  async function save() {
    const existing = rows.find((r) => r.date === editDay)
    if (existing) {
      await supabase
        .from('meals')
        .update({ title: title.trim(), ingredients: ingredients.trim() || null })
        .eq('id', existing.id)
    } else {
      await supabase.from('meals').insert({
        date: editDay,
        title: title.trim(),
        ingredients: ingredients.trim() || null,
        created_by: me.id
      })
    }
    setEditDay(null)
  }

  async function remove(meal) {
    await supabase.from('meals').delete().eq('id', meal.id)
    setEditDay(null)
  }

  async function toShoppingList(meal) {
    if (!meal.ingredients) return
    const items = meal.ingredients
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((name) => ({ name, category: 'Vorrat', created_by: me.id }))
    if (items.length) {
      await supabase.from('shopping_items').insert(items)
      window.alert(`${items.length} Zutaten stehen jetzt auf der Einkaufsliste`)
    }
  }

  const weekLabel = `${monday.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} bis ${days[6].toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}`

  return (
    <div>
      <h2 className="tab-title">Essensplan</h2>
      <p className="tab-sub">Was kommt diese Woche auf den Tisch?</p>

      <div className="week-nav">
        <button className="btn btn-soft" onClick={() => setWeek(week - 1)}>
          Zurück
        </button>
        <span>{week === 0 ? 'Diese Woche' : weekLabel}</span>
        <button className="btn btn-soft" onClick={() => setWeek(week + 1)}>
          Weiter
        </button>
      </div>

      {days.map((d, i) => {
        const meal = mealFor(d)
        const isEditing = editDay === iso(d)
        return (
          <div key={i} className="meal-day">
            <div className="meal-date">
              <strong>{DAY_NAMES[i]}</strong>
              {d.toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
            </div>
            <div style={{ flex: 1 }}>
              {isEditing ? (
                <>
                  <input
                    placeholder="Gericht"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ marginBottom: 6 }}
                  />
                  <input
                    placeholder="Zutaten, mit Komma getrennt"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    style={{ marginBottom: 6 }}
                  />
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn" onClick={save} disabled={!title.trim()}>
                      Speichern
                    </button>
                    {meal && (
                      <button className="btn btn-soft" onClick={() => remove(meal)}>
                        Entfernen
                      </button>
                    )}
                    <button className="btn btn-soft" onClick={() => setEditDay(null)}>
                      Abbrechen
                    </button>
                  </div>
                </>
              ) : meal ? (
                <>
                  <div className="item-name" onClick={() => startEdit(d)}>
                    {meal.title}
                  </div>
                  {meal.ingredients && (
                    <>
                      <div className="item-meta">{meal.ingredients}</div>
                      <button
                        className="btn btn-soft"
                        style={{ marginTop: 8, fontSize: 13, padding: '6px 10px' }}
                        onClick={() => toShoppingList(meal)}
                      >
                        Zutaten auf die Liste
                      </button>
                    </>
                  )}
                </>
              ) : (
                <button
                  className="item-meta"
                  style={{ padding: '6px 0' }}
                  onClick={() => startEdit(d)}
                >
                  + Gericht eintragen
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
