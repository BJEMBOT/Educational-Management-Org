'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import { sendItTicketEmail } from '@/lib/it-ticket-email'
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
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: ticket, error } = await supabase
    .from('it_tickets')
    .insert([
      {
        user_id: profile.id,
        subject,
        description,
        priority: formData.priority,
      },
    ])
    .select('id')
    .single()

  if (error) return { error: error.message }

  const emailResult = await sendItTicketEmail({
    ticketId: ticket.id,
    subject,
    description,
    priority: formData.priority,
    submitterName: profile.name ?? 'Unknown user',
    submitterEmail: user?.email ?? null,
    submitterRole: profile.role,
  })

  if (!emailResult.ok) {
    return {
      success: true,
      warning:
        'Your ticket was saved, but the email notification could not be sent. Please contact info@theinsightsapp.com if you need immediate help.',
    }
  }

  return { success: true }
}
