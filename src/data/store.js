import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'

function cleanData(obj) {
  const cleaned = {}
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'id' || key === 'created_at' || key === 'updated_at') continue
    if (value === '') { cleaned[key] = null }
    else { cleaned[key] = value }
  }
  return cleaned
}

export function useStore(table) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const { data: rows, error } = await supabase
        .from(table)
        .select('*')
        .order('created_at', { ascending: true })
      if (!cancelled && !error) setData(rows || [])
      if (error) console.error(`Error loading ${table}:`, error)
      setLoading(false)
    }
    load()
    return () => { cancelled = true }
  }, [table])

  const add = useCallback(async (item) => {
    const clean = cleanData(item)
    const { data: rows, error } = await supabase
      .from(table)
      .insert([clean])
      .select()
    if (error) { console.error(`Error adding to ${table}:`, error); return null }
    const newItem = rows[0]
    setData(prev => [...prev, newItem])
    return newItem
  }, [table])

  const update = useCallback(async (id, changes) => {
    const clean = cleanData(changes)
    const { error } = await supabase
      .from(table)
      .update(clean)
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
    async function reload() {
      const { data: rows } = await supabase.from(table).select('*').order('created_at', { ascending: true })
      setData(rows || [])
    }
    reload()
  }, [table])

  return { data, loading, add, update, remove, reset, setData }
}

export function fmt(n) { return '$' + Math.round(Number(n) || 0).toLocaleString('es-MX') }
export function fmtDate(d) {
  if (!d) return '—'
  const dt = new Date(d + 'T12:00:00')
  return dt.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
}
