import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

export const configured = Boolean(url && key)

export const supabase = configured ? createClient(url, key) : null

export function personColor(profiles, userId) {
  const p = profiles.find((x) => x.id === userId)
  return p ? p.color : '#A8A6B3'
}

export function personName(profiles, userId) {
  const p = profiles.find((x) => x.id === userId)
  return p ? p.name : 'Unbekannt'
}

export function bothGradient(profiles) {
  if (profiles.length >= 2) {
    return `linear-gradient(120deg, ${profiles[0].color}, ${profiles[1].color})`
  }
  if (profiles.length === 1) return profiles[0].color
  return '#A8A6B3'
}
