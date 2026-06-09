'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import type { ItTicketPriority } from '@/lib/database.types'

export async function submitItTicket(formData: {
  subject: string
  description: string
  priority: ItTicketPriority
}) {
  const profile = await getCurrentProfile()
  if (!profile) {
    return { error: 'You must be signed in to submit an IT ticket.' }
  }

  const subject = formData.subject.trim()
  const description = formData.description.trim()

  if (subject.length < 3) {
    return { error: 'Subject must be at least 3 characters.' }
  }

  if (description.length < 10) {
    return { error: 'Description must be at least 10 characters.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.from('it_tickets').insert([
    {
      user_id: profile.id,
      subject,
      description,
      priority: formData.priority,
    },
  ])

  if (error) return { error: error.message }

  return { success: true }
}
