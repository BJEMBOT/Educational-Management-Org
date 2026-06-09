import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Plus } from 'lucide-react'
import { getSchoolDetail } from '@/lib/queries/schools'
import { getSchools } from '@/lib/queries/schools'
import { SchoolStatusBadge } from '@/components/schools/school-status-badge'
import { SchoolDetailActions } from '@/components/schools/school-detail-actions'
import { GoalsTable } from '@/components/goals/goals-table'
import { GoalFormDialog } from '@/components/goals/goal-form-dialog'
import { InterventionsTable } from '@/components/interventions/interventions-table'
import { InterventionFormDialog } from '@/components/interventions/intervention-form-dialog'
import { GoalsCategoryChart } from '@/components/charts/goals-category-chart'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { GoalWithSchool } from '@/lib/database.types'

export default async function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [detail, schools] = await Promise.all([
    getSchoolDetail(id),
    getSchools(),
  ])

  if (!detail) notFound()

  const { school, goals, interventions, healthStatus, onTrackPercent, openInterventions } =
    detail

  const goalsWithSchool: GoalWithSchool[] = goals.map((g) => ({
    ...g,
    school_name: school.name,
  }))

  const onTrack = goals.filter((g) => g.status === 'on_track').length
  const atRisk = goals.filter((g) => g.status === 'at_risk').length
  const offTrack = goals.filter((g) => g.status === 'off_track').length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/schools"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to School Portfolio
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{school.name}</h1>
            <SchoolStatusBadge status={healthStatus} />
          </div>
          <p className="text-muted-foreground">
            {school.district} · {school.enrollment.toLocaleString()} students
          </p>
        </div>
        <SchoolDetailActions school={school} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Goals On Track
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{onTrackPercent}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700">On Track</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-700">{onTrack}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">At Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-700">{atRisk}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Off Track</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-700">{offTrack}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Open Interventions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{openInterventions}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Goals by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <GoalsCategoryChart goals={goals} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Goals</h2>
          <GoalFormDialog
            schools={schools}
            defaultSchoolId={school.id}
            triggerSize="sm"
            trigger={
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Goal
              </>
            }
          />
        </div>
        <GoalsTable
          goals={goalsWithSchool}
          schools={schools}
          showSchoolColumn={false}
          showExport={false}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Interventions</h2>
          <InterventionFormDialog
            schools={schools}
            defaultSchoolId={school.id}
            triggerSize="sm"
            trigger={
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Intervention
              </>
            }
          />
        </div>
        <InterventionsTable
          interventions={interventions.map((i) => ({
            ...i,
            school_name: school.name,
          }))}
          schools={schools}
          showSchoolColumn={false}
        />
      </div>
    </div>
  )
}
