import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

export function useTable(table, order = { column: 'created_at', ascending: true }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(order.column, { ascending: order.ascending })
    if (!error) setRows(data || [])
    setLoading(false)
  }, [table, order.column, order.ascending])

  useEffect(() => {
    load()
    const channel = supabase
      .channel(`rt-${table}`)
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => load())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [table, load])

  return { rows, loading, reload: load }
}
