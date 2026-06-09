'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createSchool(formData: {
  name: string
  district: string
  enrollment: number
}) {
  const supabase = await createClient()
  const { error } = await supabase.from('schools').insert([formData])

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}

export async function updateSchool(
  id: string,
  formData: { name: string; district: string; enrollment: number }
) {
  const supabase = await createClient()
  const { error } = await supabase.from('schools').update(formData).eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  revalidatePath(`/schools/${id}`)
  return { success: true }
}

export async function deleteSchool(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('schools').delete().eq('id', id)

  if (error) return { error: error.message }

  revalidatePath('/')
  return { success: true }
}
