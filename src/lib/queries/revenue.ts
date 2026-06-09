import { createClient } from '@/lib/supabase/server'
import type { RevenueEntryWithSchool, RevenueSource } from '@/lib/database.types'

export async function getRevenueEntries(): Promise<RevenueEntryWithSchool[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('revenue_entries')
    .select('*, schools(name)')
    .order('revenue_date', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row) => {
    const r = row as RevenueEntryWithSchool & {
      schools: { name: string } | { name: string }[] | null
    }
    const school = Array.isArray(r.schools) ? r.schools[0] : r.schools
    const { schools, ...entry } = r
    return { ...entry, school_name: school?.name ?? null }
  })
}

export async function getRevenueSummary() {
  const entries = await getRevenueEntries()
  const now = new Date()
  const ytdStart = new Date(now.getFullYear(), 0, 1)

  const total = entries.reduce((sum, e) => sum + Number(e.amount), 0)
  const ytd = entries
    .filter((e) => new Date(e.revenue_date) >= ytdStart)
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const bySource = entries.reduce<Record<RevenueSource, number>>(
    (acc, e) => {
      acc[e.source] = (acc[e.source] ?? 0) + Number(e.amount)
      return acc
    },
    { contract: 0, pd: 0, consulting: 0, grant: 0, other: 0 }
  )

  const bySchool = entries.reduce<Record<string, number>>((acc, e) => {
    if (!e.school_name) return acc
    acc[e.school_name] = (acc[e.school_name] ?? 0) + Number(e.amount)
    return acc
  }, {})

  return { total, ytd, entryCount: entries.length, bySource, bySchool }
}
