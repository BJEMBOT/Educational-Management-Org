import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getSchoolsWithGoalStats } from '@/lib/queries/schools'
import { SchoolsTable } from '@/components/schools/schools-table'
import { PageHeader } from '@/components/ui/page-header'
import { Button } from '@/components/ui/button'
import { healthLabels } from '@/lib/school-health'
import type { SchoolHealth } from '@/lib/database.types'

const healthSubtitles: Record<SchoolHealth, string> = {
  healthy: '≥80% goals on track',
  at_risk: '60–79% goals on track',
  off_track: '<60% goals on track',
}

export async function SchoolHealthList({ health }: { health: SchoolHealth }) {
  const schools = await getSchoolsWithGoalStats()
  const filtered = schools.filter((s) => s.healthStatus === health)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${healthLabels[health]} Schools`}
        subtitle={`${filtered.length} school${filtered.length === 1 ? '' : 's'} · ${healthSubtitles[health]}`}
        actions={
          <Link href="/schools">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Full portfolio
            </Button>
          </Link>
        }
      />

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No schools in this category.</p>
        </div>
      ) : (
        <SchoolsTable schools={filtered} />
      )}
    </div>
  )
}
