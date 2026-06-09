'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import { hasFinanceAccess } from '@/lib/finance-access.server'
import { canAccessFinance } from '@/lib/permissions'
import type { RevenueSource } from '@/lib/database.types'

async function requireFinanceAccess() {
  const profile = await getCurrentProfile()
  if (!profile || !canAccessFinance(profile.role)) {
    return { error: 'Revenue data is only available to authorized users.' as const, profile: null }
  }
  if (!(await hasFinanceAccess())) {
    return { error: 'Enter the Finance access code to continue.' as const, profile: null }
  }
  return { error: null, profile }
}

export async function createRevenueEntry(data: {
  description: string
  amount: number
  source: RevenueSource
  school_id?: string
  revenue_date: string
  notes?: string
}) {
  const { error: permError, profile } = await requireFinanceAccess()
  if (permError || !profile) return { error: permError ?? 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase.from('revenue_entries').insert([
    { ...data, created_by: profile.id },
  ])

  if (error) return { error: error.message }
  revalidatePath('/revenue')
  return { success: true }
}

export async function deleteRevenueEntry(id: string) {
  const { error: permError } = await requireFinanceAccess()
  if (permError) return { error: permError }

  const supabase = await createClient()
  const { error } = await supabase.from('revenue_entries').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/revenue')
  return { success: true }
}
