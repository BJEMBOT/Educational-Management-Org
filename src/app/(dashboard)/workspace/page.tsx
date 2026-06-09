import { redirect } from 'next/navigation'
import { getProfileViewContext } from '@/lib/queries/profile'
import { TeacherWorkspace } from '@/components/dashboard/teacher-workspace'

export default async function WorkspacePage() {
  const { profile, effectiveView } = await getProfileViewContext()
  if (!profile) redirect('/login')

  if (effectiveView === 'teacher') {
    return <TeacherWorkspace profile={profile} />
  }

  redirect('/')
}
