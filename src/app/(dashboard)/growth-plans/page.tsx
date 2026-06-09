import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getCurrentProfile } from '@/lib/queries/profile'
import { getGrowthPlans } from '@/lib/queries/growth-plans'
import { getSchools } from '@/lib/queries/schools'
import { GrowthPlanFormDialog } from '@/components/growth-plans/growth-plan-form-dialog'
import { PageHeader } from '@/components/ui/page-header'
import { DataTableWrapper } from '@/components/ui/data-table-wrapper'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default async function GrowthPlansPage() {
  const profile = await getCurrentProfile()
  const isTeacher = profile?.role === 'teacher'
  const [plans, schools] = await Promise.all([
    getGrowthPlans(isTeacher ? profile?.id : undefined),
    getSchools(),
  ])

  return (
    <div className="space-y-6">
      <PageHeader
        title="Growth Plans"
        subtitle="Set professional goals, track action steps, and collect evidence of growth"
        actions={
          profile ? (
            <GrowthPlanFormDialog
              schools={schools}
              userId={profile.id}
              trigger={
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  New Plan
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
              <TableHead>Educator</TableHead>
              <TableHead>School</TableHead>
              <TableHead>Year</TableHead>
              <TableHead className="text-right">Goals</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No growth plans yet.
                </TableCell>
              </TableRow>
            ) : (
              plans.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <Link href={`/growth-plans/${p.id}`} className="font-medium hover:underline">
                      {p.user_name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.school_name}</TableCell>
                  <TableCell>{p.school_year}</TableCell>
                  <TableCell className="text-right">{p.goal_count}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{p.status}</Badge>
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
