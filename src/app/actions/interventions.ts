'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from '@/lib/queries/profile'
import { requireSystemManager } from '@/lib/action-auth'
import { resolveInterventionOwner } from '@/lib/intervention-assignment'
import type { InterventionStatus } from '@/lib/database.types'

const EVIDENCE_BUCKET = 'intervention-evidence'
const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024

export async function createIntervention(formData: {
  school_id: string
  date: string
  issue: string
  action_taken: string
  owner?: string
  owner_id?: string
  status: InterventionStatus
}) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()

  let ownerId = formData.owner_id
  let ownerName = formData.owner

  if (!ownerId) {
    const assignee = await resolveInterventionOwner(formData.school_id)
    if (assignee) {
      ownerId = assignee.id
      ownerName = assignee.name
    }
  }

  if (!ownerName) {
    return { error: 'No administrator available to assign this intervention.' }
  }

  const { error } = await supabase.from('interventions').insert([
    {
      school_id: formData.school_id,
      date: formData.date,
      issue: formData.issue,
      action_taken: formData.action_taken,
      owner: ownerName,
      owner_id: ownerId ?? null,
      status: formData.status,
    },
  ])

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/interventions')
  revalidatePath(`/schools/${formData.school_id}`)
  return { success: true, owner: ownerName }
}

export async function updateIntervention(
  id: string,
  schoolId: string,
  formData: Partial<{
    date: string
    issue: string
    action_taken: string
    owner: string
    owner_id: string
    status: InterventionStatus
  }>
) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  if (formData.status === 'resolved') {
    return {
      error: 'Use the resolve flow to provide evidence before marking as resolved.',
    }
  }

  const supabase = await createClient()
  const updatePayload =
    formData.status === 'open'
      ? {
          ...formData,
          resolution_notes: null,
          resolution_evidence_url: null,
          resolved_at: null,
          resolved_by: null,
        }
      : formData

  const { error } = await supabase
    .from('interventions')
    .update(updatePayload)
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/interventions')
  revalidatePath(`/schools/${schoolId}`)
  return { success: true }
}

export async function resolveIntervention(
  id: string,
  schoolId: string,
  formData: FormData
) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const notes = (formData.get('resolution_notes') as string | null)?.trim() ?? ''
  const file = formData.get('evidence_file') as File | null
  const hasFile = file && file.size > 0

  if (!notes && !hasFile) {
    return { error: 'Provide written notes or upload a picture as evidence.' }
  }

  const profile = await getCurrentProfile()
  const supabase = await createClient()
  let evidenceUrl: string | null = null

  if (hasFile && file) {
    if (file.size > MAX_EVIDENCE_BYTES) {
      return { error: 'Picture must be 5 MB or smaller.' }
    }

    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const path = `${id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from(EVIDENCE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false })

    if (uploadError) return { error: uploadError.message }

    const { data: urlData } = supabase.storage
      .from(EVIDENCE_BUCKET)
      .getPublicUrl(path)
    evidenceUrl = urlData.publicUrl
  }

  const { error } = await supabase
    .from('interventions')
    .update({
      status: 'resolved',
      resolution_notes: notes || null,
      resolution_evidence_url: evidenceUrl,
      resolved_at: new Date().toISOString(),
      resolved_by: profile?.id ?? null,
    })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/interventions')
  revalidatePath(`/schools/${schoolId}`)
  return { success: true }
}

export async function deleteIntervention(id: string, schoolId: string) {
  const auth = await requireSystemManager()
  if (!auth.ok) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('interventions').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath('/interventions')
  revalidatePath(`/schools/${schoolId}`)
  return { success: true }
}
