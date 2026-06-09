'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import type { CalendarEventType } from '@/lib/database.types'

const MANAGE_ROLES = ['admin', 'regional_manager', 'staff', 'coach', 'consultant', 'developer']

async function canManageCalendar() {
  const profile = await getCurrentProfile()
  return profile && MANAGE_ROLES.includes(profile.role)
}

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
  if (!(await canManageCalendar())) {
    return { error: 'You do not have permission to create calendar events.' }
  }

  const profile = await getCurrentProfile()
  const supabase = await createClient()
  const { error } = await supabase.from('calendar_events').insert([
    { ...data, created_by: profile?.id },
  ])

  if (error) return { error: error.message }
  revalidatePath('/calendar')
  return { success: true }
}
