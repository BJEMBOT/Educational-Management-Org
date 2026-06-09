'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { requireSystemManager } from '@/lib/action-auth'
import type { CalendarEventType } from '@/lib/database.types'

export async function createCalendarEvent(data: {
  title: string
  description?: string
  event_type: CalendarEventType
  start_at: string
  end_at?: string
  all_day?: boolean
  location?: string
  school_id?: string
}) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('calendar_events').insert([
    { ...data, created_by: auth.profile.id },
  ])

  if (error) return { error: error.message }
  revalidatePath('/calendar')
  return { success: true }
}
