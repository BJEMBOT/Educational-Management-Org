import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profile'
import { getCoachingCycles, getProfilesByRole } from '@/lib/queries/coaching'
import { getSchools } from '@/lib/queries/schools'
import { CoachingCycleForm } from '@/components/coaching/coaching-cycle-form'
import { PageHeader } from '@/components/ui/page-header'
import { DataTableWrapper } from '@/components/ui/data-table-wrapper'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function CoachingPage() {
  const profile = await getCurrentProfile()
  const isCoach = profile?.role === 'coach' || profile?.role === 'consultant' || profile?.role === 'admin'
  const isTeacher = profile?.role === 'teacher'

  const [cycles, schools, teachers] = await Promise.all([
    getCoachingCycles(
      isCoach && profile ? { coachId: profile.id } : isTeacher && profile ? { teacherId: profile.id } : undefined
    ),
    getSchools(),
    getProfilesByRole('teacher'),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Instructional Coaching"
        subtitle="Manage coaching cycles, observations, and teacher feedback"
        actions={
          isCoach && profile ? (
            <CoachingCycleForm
              schools={schools}
              teachers={teachers}
              coachId={profile.id}
              trigger={
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  New Cycle
                </>
              }
            />
          ) : undefined
        }
      />

      <DataTableWrapper>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher</TableHead>
              <TableHead>Coach</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Focus</TableHead>
              <TableHead className="text-right">Observations</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cycles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No coaching cycles yet.
                </TableCell>
              </TableRow>
            ) : (
              cycles.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Link href={`/coaching/${c.id}`} className="font-medium hover:underline">
                      {c.teacher_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.coach_name}</TableCell>
                  <TableCell className="text-muted-foreground">{c.school_name}</TableCell>
                  <TableCell>{c.focus_area}</TableCell>
                  <TableCell className="text-right">{c.observation_count}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{c.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DataTableWrapper>
    </div>
  )
}
