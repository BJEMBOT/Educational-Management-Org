'use server'

import { resolveInterventionOwner } from '@/lib/intervention-assignment'

export async function getInterventionAssignee(schoolId: string) {
  if (!schoolId) return { assignee: null }
  const assignee = await resolveInterventionOwner(schoolId)
  return { assignee }
}
