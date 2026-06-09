import { redirect } from 'next/navigation'
import { getCurrentProfile } from '@/lib/queries/profile'
import { TeacherWorkspace } from '@/components/dashboard/teacher-workspace'
import { CoachWorkspace } from '@/components/dashboard/coach-workspace'
import { ParentWorkspace } from '@/components/dashboard/parent-workspace'

export default async function WorkspacePage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  switch (profile.role) {
    case 'coach':
    case 'consultant':
      return <CoachWorkspace profile={profile} />
    case 'parent':
      return <ParentWorkspace profile={profile} />
    case 'teacher':
      return <TeacherWorkspace profile={profile} />
    case 'partner':
      redirect('/partners')
    default:
      redirect('/')
  }
}
