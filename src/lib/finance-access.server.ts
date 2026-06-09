import 'server-only'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { FINANCE_ACCESS_COOKIE } from '@/lib/finance-access'

export async function hasFinanceAccess(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(FINANCE_ACCESS_COOKIE)?.value === 'unlocked'
}

export async function validateFinancePin(pin: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('validate_finance_pin', {
    input_pin: pin,
  })
  if (error) throw error
  return data === true
}
