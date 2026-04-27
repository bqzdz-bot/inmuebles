import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

// ── Hook that syncs with Supabase ──────────────────────────────────────────

export function useStore(table) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  // Load data from Supabase on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data: rows, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: true })
      if (!cancelled && !error) {
        setData(rows || [])
      }
      if (error) console.error(`Error loading ${table}:`, error)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [table])

  const add = useCallback(async (item) => {
    // Remove id if present (Supabase generates it)
    const { id, ...rest } = item
    const { data: rows, error } = await supabase
      .from(table)
      .insert([rest])
      .select()
    if (error) { console.error(`Error adding to ${table}:`, error); return null }
    const newItem = rows[0]
    setData(prev => [...prev, newItem])
    return newItem
  }, [table])

  const update = useCallback(async (id, changes) => {
    const { error } = await supabase
      .from(table)
      .update(changes)
      .eq('id', id)
    if (error) { console.error(`Error updating ${table}:`, error); return }
    setData(prev => prev.map(item => item.id === id ? { ...item, ...changes } : item))
  }, [table])

  const remove = useCallback(async (id) => {
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id)
    if (error) { console.error(`Error deleting from ${table}:`, error); return }
    setData(prev => prev.filter(item => item.id !== id))
  }, [table])

  const reset = useCallback(() => {
    // For Supabase version, reset just reloads from DB
    async function reload() {
      const { data: rows } = await supabase.from(table).select('*').order('created_at', { ascending: true })
      setData(rows || [])
    }
    reload()
  }, [table])

  return { data, loading, add, update, remove, reset, setData }
}

// ── Utilities (unchanged) ──────────────────────────────────────────────────

export function fmt(n) { return '$' + Math.round(Number(n) || 0).toLocaleString('es-MX') }
export function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d + 'T12:00:00')
  return dt.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}
export const INCOME_CHART = [
  { mes: 'Sep', ingresos: 148400 }, { mes: 'Oct', ingresos: 155200 },
  { mes: 'Nov', ingresos: 161800 }, { mes: 'Dic', ingresos: 158100 },
  { mes: 'Ene', ingresos: 172400 }, { mes: 'Feb', ingresos: 186600 },
]
