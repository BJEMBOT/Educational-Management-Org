'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import { FINANCE_ACCESS_COOKIE, isValidFinancePinFormat } from '@/lib/finance-access'
import { validateFinancePin } from '@/lib/finance-access.server'

export async function unlockFinanceAccess(pin: string) {
  if (!isValidFinancePinFormat(pin)) {
    return { error: 'Enter a valid 5-digit access code.' as const }
  }

  const valid = await validateFinancePin(pin)
  if (!valid) {
    return { error: 'Incorrect access code.' as const }
  }

  const cookieStore = await cookies()
  cookieStore.set(FINANCE_ACCESS_COOKIE, 'unlocked', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  return { success: true as const }
}

export async function lockFinanceAccess() {
  const cookieStore = await cookies()
  cookieStore.delete(FINANCE_ACCESS_COOKIE)
  return { success: true as const }
}

export async function resetFinancePin(currentPin: string, newPin: string) {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'developer') {
    return { error: 'Only developers can reset the access code.' as const }
  }

  if (!isValidFinancePinFormat(currentPin) || !isValidFinancePinFormat(newPin)) {
    return { error: 'Access codes must be exactly 5 digits.' as const }
  }

  if (currentPin === newPin) {
    return { error: 'New code must be different from the current code.' as const }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('reset_finance_pin', {
    current_pin: currentPin,
    new_pin: newPin,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data) {
    return { error: 'Current access code is incorrect.' as const }
  }

  await lockFinanceAccess()
  return { success: true as const, relock: true as const }
}
